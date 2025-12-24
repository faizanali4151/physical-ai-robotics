#!/bin/bash
# Automated Auth Server Deployment Script for Render

set -e

echo "=========================================="
echo "🔐 Auth Server Deployment to Render"
echo "=========================================="
echo ""

# Check if render.yaml exists
if [ ! -f "auth-server/render.yaml" ]; then
    echo "❌ Error: auth-server/render.yaml not found"
    exit 1
fi

echo "📋 Prerequisites:"
echo "  1. Backend already deployed"
echo "  2. Neon database created for auth (separate from backend DB)"
echo "  3. OAuth apps configured (Google, GitHub)"
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
echo "  - DATABASE_URL=<neon-auth-connection-string>"
echo "  - BETTER_AUTH_SECRET=<32-char-random-string>"
echo "  - BETTER_AUTH_URL=https://your-auth-server.onrender.com"
echo "  - CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000"
echo "  - NODE_ENV=production"
echo ""
echo "OAuth (Optional but recommended):"
echo "  - GOOGLE_CLIENT_ID=<google-oauth-client-id>"
echo "  - GOOGLE_CLIENT_SECRET=<google-oauth-secret>"
echo "  - GITHUB_CLIENT_ID=<github-oauth-client-id>"
echo "  - GITHUB_CLIENT_SECRET=<github-oauth-secret>"
echo ""

# Generate random secret
echo "Generating BETTER_AUTH_SECRET..."
BETTER_AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || openssl rand -hex 32)
echo "Generated: $BETTER_AUTH_SECRET"
echo ""

# Create .env file for reference
echo "Creating .env.render.auth for your reference..."
cat > .env.render.auth << EOF
# Auth Server Environment Variables for Render
# Copy these values to Render Dashboard > Service > Environment

DATABASE_URL=postgresql://user:password@host/authdb?sslmode=require
BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
BETTER_AUTH_URL=https://your-auth-server.onrender.com
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
NODE_ENV=production

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
EOF

echo "✅ Created .env.render.auth"
echo ""

echo "=========================================="
echo "📦 Deployment Steps (Manual - Render UI)"
echo "=========================================="
echo ""
echo "1. Go to: https://dashboard.render.com"
echo "2. Click: New + > Web Service"
echo "3. Connect your GitHub repository"
echo "4. Configure:"
echo "   - Name: physical-ai-auth-server"
echo "   - Region: Oregon (US West)"
echo "   - Branch: main"
echo "   - Root Directory: auth-server"
echo "   - Runtime: Node"
echo "   - Build Command:"
echo "     npm install && npm run build"
echo "   - Start Command:"
echo "     npm start"
echo "   - Plan: Free"
echo ""
echo "5. Add Environment Variables from .env.render.auth"
echo "6. Click 'Create Web Service'"
echo "7. Wait for deployment (5-10 minutes)"
echo ""

read -p "Press Enter when deployment is complete..."
echo ""

echo "🔍 Testing deployment..."
echo ""
read -p "Enter your auth server URL (e.g., https://physical-ai-auth-server.onrender.com): " AUTH_URL

if [ -z "$AUTH_URL" ]; then
    echo "❌ URL is required"
    exit 1
fi

# Remove trailing slash
AUTH_URL=${AUTH_URL%/}

echo ""
echo "Testing health endpoint: $AUTH_URL/health"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$AUTH_URL/health" || echo "000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Auth server is healthy!"
    echo "Response: $RESPONSE_BODY"
else
    echo "⚠️  Health check failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    echo ""
    echo "This might be normal for cold start. Wait 30-60 seconds and try again:"
    echo "  curl $AUTH_URL/health"
fi

echo ""
echo "🗄️  Database Migration:"
echo ""
echo "Run database migrations in Render shell:"
echo "  1. Go to Render Dashboard > your auth service"
echo "  2. Click 'Shell' tab"
echo "  3. Run: npm run db:migrate"
echo ""

read -p "Press Enter after running migrations..."

echo ""
echo "📊 Next Steps:"
echo ""
echo "1. Save your auth server URL: $AUTH_URL"
echo "2. Update OAuth redirect URIs:"
echo "   Google: $AUTH_URL/api/auth/callback/google"
echo "   GitHub: $AUTH_URL/api/auth/callback/github"
echo ""
echo "3. Continue to frontend deployment: ./deploy-frontend.sh"
echo ""
echo "=========================================="
echo "✅ Auth Server Deployment Guide Complete"
echo "=========================================="
