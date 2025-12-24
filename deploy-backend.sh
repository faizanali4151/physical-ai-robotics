#!/bin/bash
# Automated Backend Deployment Script for Render
# This script will guide you through deploying the backend to Render

set -e

echo "=========================================="
echo "🚀 Backend Deployment to Render"
echo "=========================================="
echo ""

# Check if render.yaml exists
if [ ! -f "backend/render.yaml" ]; then
    echo "❌ Error: backend/render.yaml not found"
    exit 1
fi

echo "📋 Prerequisites:"
echo "  1. Render account created (https://render.com)"
echo "  2. GitHub repository pushed with latest changes"
echo "  3. External services ready (Qdrant, Neon, Gemini API)"
echo ""

read -p "Have you completed all prerequisites? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete prerequisites first."
    exit 1
fi

echo ""
echo "📝 Environment Variables Needed:"
echo ""
echo "Required:"
echo "  - LLM_PROVIDER=gemini"
echo "  - GEMINI_API_KEY=<your-gemini-key>"
echo "  - QDRANT_URL=<your-qdrant-url>"
echo "  - QDRANT_API_KEY=<your-qdrant-key>"
echo "  - NEON_CONNECTION_STRING=<your-neon-connection-string>"
echo "  - CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000"
echo ""
echo "Optional (have defaults):"
echo "  - LOG_LEVEL=INFO"
echo "  - CHUNK_SIZE=512"
echo "  - CHUNK_OVERLAP=128"
echo "  - TOP_K_RESULTS=5"
echo "  - SIMILARITY_THRESHOLD=0.7"
echo ""

# Create .env file for reference
echo "Creating .env.render.backend for your reference..."
cat > .env.render.backend << 'EOF'
# Backend Environment Variables for Render
# Copy these values to Render Dashboard > Service > Environment

LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here
NEON_CONNECTION_STRING=postgresql://user:password@host/database?sslmode=require
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
LOG_LEVEL=INFO
CHUNK_SIZE=512
CHUNK_OVERLAP=128
TOP_K_RESULTS=5
SIMILARITY_THRESHOLD=0.7
EOF

echo "✅ Created .env.render.backend"
echo ""

echo "=========================================="
echo "📦 Deployment Steps (Manual - Render UI)"
echo "=========================================="
echo ""
echo "Since Render doesn't have a full CLI deployment, follow these steps:"
echo ""
echo "1. Go to: https://dashboard.render.com"
echo "2. Click: New + > Web Service"
echo "3. Connect your GitHub repository"
echo "4. Configure:"
echo "   - Name: physical-ai-backend"
echo "   - Region: Oregon (US West)"
echo "   - Branch: main"
echo "   - Root Directory: backend"
echo "   - Runtime: Python 3"
echo "   - Build Command:"
echo "     pip install --upgrade pip && pip install -r requirements.txt && python -m nltk.downloader punkt"
echo "   - Start Command:"
echo "     gunicorn src.main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:\$PORT --timeout 120 --log-level info"
echo "   - Plan: Free"
echo ""
echo "5. Add Environment Variables from .env.render.backend"
echo "6. Click 'Create Web Service'"
echo "7. Wait for deployment (5-10 minutes)"
echo ""

read -p "Press Enter when deployment is complete..."
echo ""

echo "🔍 Testing deployment..."
echo ""
read -p "Enter your backend URL (e.g., https://physical-ai-backend.onrender.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ URL is required"
    exit 1
fi

# Remove trailing slash
BACKEND_URL=${BACKEND_URL%/}

echo ""
echo "Testing health endpoint: $BACKEND_URL/health"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health" || echo "000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Backend is healthy!"
    echo "Response: $RESPONSE_BODY"
else
    echo "⚠️  Health check failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    echo ""
    echo "This might be normal for cold start. Wait 30-60 seconds and try again:"
    echo "  curl $BACKEND_URL/health"
fi

echo ""
echo "📊 Next Steps:"
echo ""
echo "1. Ingest book content (one-time setup):"
echo "   Go to Render service > Shell tab"
echo "   Run: python src/cli/ingest.py"
echo ""
echo "   Or locally:"
echo "   cd backend"
echo "   python src/cli/ingest.py"
echo ""
echo "2. Save your backend URL: $BACKEND_URL"
echo "3. Continue to auth server deployment: ./deploy-auth.sh"
echo ""
echo "=========================================="
echo "✅ Backend Deployment Guide Complete"
echo "=========================================="
