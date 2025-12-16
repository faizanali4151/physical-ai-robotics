#!/bin/bash
# Complete Production Deployment Script
# Deploys backend to Render and frontend to Vercel

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "🚀 Physical AI Book - Production Deployment"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found"
    echo "   Install: npm install -g vercel"
    exit 1
fi
print_success "Vercel CLI installed"

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js 20+ required (found: $(node --version))"
    exit 1
fi
print_success "Node.js $(node --version)"

# Check Python version
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
if ! command -v python3 &> /dev/null; then
    print_error "Python 3.11+ required"
    exit 1
fi
print_success "Python $(python3 --version)"

# Check if backend .env exists
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    print_error "Backend .env file not found"
    echo "   Run: ./scripts/setup-env.sh"
    exit 1
fi
print_success "Backend .env configured"

# Check if ingested data exists
if [ ! -f "$PROJECT_ROOT/backend/data/ingested_chunks.json" ]; then
    print_warning "No ingested data found"
    echo "   Run: ./scripts/ingest-book.sh"
    read -p "   Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    CHUNKS_SIZE=$(stat -f%z "$PROJECT_ROOT/backend/data/ingested_chunks.json" 2>/dev/null || stat -c%s "$PROJECT_ROOT/backend/data/ingested_chunks.json" 2>/dev/null)
    print_success "Book content ingested ($(($CHUNKS_SIZE / 1024)) KB)"
fi

echo ""
echo "========================================="
echo "Phase 1: Testing Database Connections"
echo "========================================="
echo ""

cd "$PROJECT_ROOT"

# Test Qdrant connection
print_info "Testing Qdrant connection..."
python3 -c "
import sys
sys.path.insert(0, 'backend')
from src.services.qdrant_service import QdrantService
try:
    qs = QdrantService()
    qs.connect()
    print('✅ Qdrant connected successfully')
except Exception as e:
    print(f'❌ Qdrant connection failed: {e}')
    sys.exit(1)
" || exit 1

# Test Neon Postgres connection
print_info "Testing Neon Postgres connection..."
python3 -c "
import sys
sys.path.insert(0, 'backend')
from src.services.db_service import DBService
try:
    db = DBService()
    db.connect()
    print('✅ Neon Postgres connected successfully')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    sys.exit(1)
" || exit 1

echo ""
echo "========================================="
echo "Phase 2: Backend Deployment Instructions"
echo "========================================="
echo ""

print_info "Backend will be deployed to Render"
print_warning "Manual steps required (one-time setup):"
echo ""
echo "1. Go to: https://render.com/dashboard"
echo "2. Click: New + → Web Service"
echo "3. Connect your GitHub repository"
echo "4. Configure:"
echo "   - Name: physical-ai-backend"
echo "   - Branch: main (or 002-rag-chatbot)"
echo "   - Build Command: cd backend && pip install -r requirements.txt"
echo "   - Start Command: cd backend && uvicorn src.main:app --host 0.0.0.0 --port \$PORT"
echo "   - Plan: Free"
echo ""
echo "5. Add Environment Variables (copy from backend/.env):"
echo "   - LLM_PROVIDER"
echo "   - GEMINI_API_KEY"
echo "   - QDRANT_URL"
echo "   - QDRANT_API_KEY"
echo "   - NEON_CONNECTION_STRING"
echo "   - CORS_ORIGINS (add: https://physical-ai-book1.vercel.app)"
echo "   - LOG_LEVEL"
echo "   - CHUNK_SIZE"
echo "   - CHUNK_OVERLAP"
echo "   - TOP_K_RESULTS"
echo "   - SIMILARITY_THRESHOLD"
echo ""
read -p "Press Enter when backend is deployed on Render..."

echo ""
print_info "Enter your Render backend URL:"
read -p "URL (e.g., https://physical-ai-backend.onrender.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    print_error "Backend URL is required"
    exit 1
fi

# Test backend health
print_info "Testing backend health..."
if curl -f -s "$BACKEND_URL/health" > /dev/null; then
    print_success "Backend is healthy"
else
    print_error "Backend health check failed"
    print_warning "Backend might still be deploying (Render takes 5-10 minutes)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "========================================="
echo "Phase 3: Frontend Build"
echo "========================================="
echo ""

cd "$PROJECT_ROOT"

# Install dependencies
print_info "Installing dependencies..."
npm install

# Build frontend
print_info "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

echo ""
echo "========================================="
echo "Phase 4: Vercel Deployment"
echo "========================================="
echo ""

# Login to Vercel
print_info "Checking Vercel authentication..."
vercel whoami &> /dev/null || {
    print_warning "Please login to Vercel:"
    vercel login
}

# Deploy to Vercel
print_info "Deploying to Vercel..."
echo ""

# Set environment variables for Vercel
print_info "Setting environment variables..."
vercel env add CHATBOT_API_URL production <<EOF
$BACKEND_URL
EOF

vercel env add AUTH_URL production <<EOF
${BACKEND_URL}
EOF

# Deploy
print_info "Deploying to production..."
VERCEL_OUTPUT=$(vercel --prod --yes 2>&1)

if [ $? -eq 0 ]; then
    print_success "Frontend deployed to Vercel"

    # Extract production URL
    FRONTEND_URL=$(echo "$VERCEL_OUTPUT" | grep -oP 'https://[^/]+\.vercel\.app' | head -1)

    if [ -n "$FRONTEND_URL" ]; then
        print_success "Production URL: $FRONTEND_URL"
    fi
else
    print_error "Vercel deployment failed"
    echo "$VERCEL_OUTPUT"
    exit 1
fi

echo ""
echo "========================================="
echo "Phase 5: Post-Deployment Configuration"
echo "========================================="
echo ""

print_warning "Update Backend CORS on Render:"
echo "1. Go to Render Dashboard → physical-ai-backend → Environment"
echo "2. Update CORS_ORIGINS to include:"
echo "   $FRONTEND_URL,$BACKEND_URL"
echo ""

print_warning "Update OAuth Redirect URIs:"
echo ""
echo "Google Cloud Console (https://console.cloud.google.com/apis/credentials):"
echo "   Add: $FRONTEND_URL/auth/callback/google"
echo ""
echo "GitHub Developer Settings (https://github.com/settings/developers):"
echo "   Add: $FRONTEND_URL/auth/callback/github"
echo ""

read -p "Press Enter when configuration is complete..."

echo ""
echo "========================================="
echo "Phase 6: Verification"
echo "========================================="
echo ""

# Test frontend
print_info "Testing frontend..."
if curl -f -s "$FRONTEND_URL" > /dev/null; then
    print_success "Frontend is accessible"
else
    print_warning "Frontend might still be deploying"
fi

# Test backend API
print_info "Testing backend API..."
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    print_success "Backend API is healthy"
else
    print_warning "Backend API health check returned: $HEALTH_RESPONSE"
fi

echo ""
echo "========================================="
echo "🎉 Deployment Complete!"
echo "========================================="
echo ""
echo "Your application is now live:"
echo ""
echo "  Frontend:  $FRONTEND_URL"
echo "  Backend:   $BACKEND_URL"
echo ""
echo "📝 Next Steps:"
echo "  1. Visit $FRONTEND_URL"
echo "  2. Test chatbot widget"
echo "  3. Test OAuth login (Google/GitHub)"
echo "  4. Verify selected-text query feature"
echo "  5. Check conversation history persistence"
echo ""
echo "📊 Monitoring:"
echo "  - Vercel Dashboard: https://vercel.com/dashboard"
echo "  - Render Dashboard: https://render.com/dashboard"
echo "  - View logs: vercel logs --follow"
echo ""
echo "📚 Documentation:"
echo "  See DEPLOYMENT_GUIDE.md for detailed information"
echo ""
print_success "All done! 🚀"
echo ""
