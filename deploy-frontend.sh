#!/bin/bash
# Automated Frontend Deployment Script for Vercel CLI

set -e

echo "=========================================="
echo "🌐 Frontend Deployment to Vercel"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI found: $(vercel --version)"
echo ""

echo "📋 Prerequisites:"
echo "  1. Backend deployed and URL available"
echo "  2. Auth server deployed and URL available"
echo "  3. Vercel account created (https://vercel.com)"
echo ""

read -p "Have you completed all prerequisites? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete prerequisites first."
    exit 1
fi

echo ""
read -p "Enter your backend URL (e.g., https://physical-ai-backend.onrender.com): " BACKEND_URL
read -p "Enter your auth server URL (e.g., https://physical-ai-auth-server.onrender.com): " AUTH_URL

if [ -z "$BACKEND_URL" ] || [ -z "$AUTH_URL" ]; then
    echo "❌ Both URLs are required"
    exit 1
fi

# Remove trailing slashes
BACKEND_URL=${BACKEND_URL%/}
AUTH_URL=${AUTH_URL%/}

echo ""
echo "📝 Configuration:"
echo "  Backend URL: $BACKEND_URL"
echo "  Auth URL: $AUTH_URL"
echo ""

# Create .env.production for local reference
echo "Creating .env.production.local for reference..."
cat > .env.production.local << EOF
# Frontend Environment Variables
# These are set in Vercel automatically during deployment

AUTH_URL=$AUTH_URL
CHATBOT_API_URL=$BACKEND_URL
EOF

echo "✅ Created .env.production.local"
echo ""

echo "=========================================="
echo "🚀 Starting Vercel Deployment"
echo "=========================================="
echo ""

# Login to Vercel
echo "Logging into Vercel..."
vercel login

echo ""
echo "Deploying to Vercel..."
echo ""

# Deploy with environment variables
# First deployment will be to preview, then we'll promote to production
vercel \
  --build-env AUTH_URL="$AUTH_URL" \
  --build-env CHATBOT_API_URL="$BACKEND_URL" \
  --yes

echo ""
echo "Deploying to production..."
vercel --prod \
  --build-env AUTH_URL="$AUTH_URL" \
  --build-env CHATBOT_API_URL="$BACKEND_URL" \
  --yes

echo ""
echo "✅ Deployment complete!"
echo ""

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls --meta githubCommitRef=main 2>/dev/null | grep "physical-ai" | head -n1 | awk '{print $2}' || echo "")

if [ -z "$DEPLOYMENT_URL" ]; then
    echo "Enter your Vercel deployment URL:"
    read DEPLOYMENT_URL
fi

echo ""
echo "=========================================="
echo "🎉 Frontend Deployed Successfully!"
echo "=========================================="
echo ""
echo "📊 Deployment Information:"
echo "  Frontend URL: https://$DEPLOYMENT_URL"
echo "  Backend URL: $BACKEND_URL"
echo "  Auth URL: $AUTH_URL"
echo ""

# Save deployment info
cat > .deployment-urls.txt << EOF
# Deployment URLs - $(date)

Frontend: https://$DEPLOYMENT_URL
Backend: $BACKEND_URL
Auth: $AUTH_URL

# Next Steps:
# 1. Update CORS_ORIGINS in backend and auth with frontend URL
# 2. Update OAuth redirect URIs
# 3. Test the application
EOF

echo "✅ Saved deployment URLs to .deployment-urls.txt"
echo ""

echo "⚠️  IMPORTANT: Update CORS Configuration"
echo ""
echo "1. Update Backend CORS_ORIGINS:"
echo "   Go to Render Dashboard > Backend Service > Environment"
echo "   Update: CORS_ORIGINS=https://$DEPLOYMENT_URL,http://localhost:3000"
echo "   Save and redeploy"
echo ""
echo "2. Update Auth Server CORS_ORIGINS:"
echo "   Go to Render Dashboard > Auth Service > Environment"
echo "   Update: CORS_ORIGINS=https://$DEPLOYMENT_URL,http://localhost:3000"
echo "   Save and redeploy"
echo ""
echo "3. Update OAuth Redirect URIs:"
echo "   Google Console: Add https://$DEPLOYMENT_URL as authorized origin"
echo "   GitHub OAuth: Update callback URL if needed"
echo ""

read -p "Press Enter after updating CORS settings..."

echo ""
echo "🧪 Testing deployment..."
echo ""
echo "Opening browser to test..."
xdg-open "https://$DEPLOYMENT_URL" 2>/dev/null || open "https://$DEPLOYMENT_URL" 2>/dev/null || echo "Visit: https://$DEPLOYMENT_URL"

echo ""
echo "=========================================="
echo "✅ All Deployments Complete!"
echo "=========================================="
echo ""
echo "📋 Final Checklist:"
echo "  [ ] Frontend loads at https://$DEPLOYMENT_URL"
echo "  [ ] No CORS errors in browser console"
echo "  [ ] Can log in with OAuth"
echo "  [ ] Can navigate to chapters"
echo "  [ ] Chatbot widget appears"
echo "  [ ] Chatbot responds to queries"
echo "  [ ] Conversation history persists"
echo ""
echo "🎉 Your Physical AI Book is now live!"
echo ""
