#!/bin/bash
# Master Deployment Script - Deploys all services
# Guides you through deploying backend, auth server, and frontend

set -e

echo "=========================================="
echo "🚀 Physical AI Book - Full Deployment"
echo "=========================================="
echo ""
echo "This script will guide you through deploying:"
echo "  1. Backend (FastAPI) to Render"
echo "  2. Auth Server (Node.js) to Render"
echo "  3. Frontend (Docusaurus) to Vercel"
echo ""
echo "Estimated time: 45-60 minutes (first deployment)"
echo ""

read -p "Ready to start? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "=========================================="
echo "📋 Pre-Deployment Checklist"
echo "=========================================="
echo ""
echo "Before we begin, ensure you have:"
echo ""
echo "External Services:"
echo "  [ ] Qdrant Cloud account + cluster created (https://cloud.qdrant.io)"
echo "  [ ] Neon account + 2 databases created (https://neon.tech)"
echo "  [ ] Google Gemini API key (https://aistudio.google.com/apikey)"
echo "  [ ] OAuth apps configured (Google, GitHub) - optional"
echo ""
echo "Accounts:"
echo "  [ ] Render account (https://render.com)"
echo "  [ ] Vercel account (https://vercel.com)"
echo "  [ ] GitHub repository with latest code pushed"
echo ""

read -p "All prerequisites completed? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please complete prerequisites first."
    echo "See DEPLOYMENT.md for detailed setup instructions."
    exit 1
fi

echo ""
echo "=========================================="
echo "Step 1/3: Backend Deployment"
echo "=========================================="
echo ""
read -p "Deploy backend now? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./deploy-backend.sh
else
    echo "Skipping backend deployment."
    echo "You can run it later with: ./deploy-backend.sh"
fi

echo ""
echo "=========================================="
echo "Step 2/3: Auth Server Deployment"
echo "=========================================="
echo ""
read -p "Deploy auth server now? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./deploy-auth.sh
else
    echo "Skipping auth server deployment."
    echo "You can run it later with: ./deploy-auth.sh"
fi

echo ""
echo "=========================================="
echo "Step 3/3: Frontend Deployment"
echo "=========================================="
echo ""
read -p "Deploy frontend now? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./deploy-frontend.sh
else
    echo "Skipping frontend deployment."
    echo "You can run it later with: ./deploy-frontend.sh"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Process Complete!"
echo "=========================================="
echo ""

# Check if deployment URLs file exists
if [ -f ".deployment-urls.txt" ]; then
    echo "📊 Your Deployment URLs:"
    cat .deployment-urls.txt
    echo ""
fi

echo "=========================================="
echo "🧪 Post-Deployment Testing"
echo "=========================================="
echo ""
echo "Test your deployment:"
echo ""
echo "1. Backend Health Check:"
echo "   Check: [BACKEND_URL]/health"
echo "   Expected: {\"status\": \"healthy\", \"services\": {...}}"
echo ""
echo "2. Auth Server Health Check:"
echo "   Check: [AUTH_URL]/health"
echo "   Expected: {\"status\": \"healthy\", ...}"
echo ""
echo "3. Frontend:"
echo "   Visit: [FRONTEND_URL]"
echo "   Test:"
echo "     - Homepage loads"
echo "     - Can navigate to chapters"
echo "     - Can log in with OAuth"
echo "     - Chatbot widget appears"
echo "     - Chatbot responds to queries"
echo "     - Conversation persists on refresh"
echo ""

echo "=========================================="
echo "📚 Additional Resources"
echo "=========================================="
echo ""
echo "Deployment Guide: DEPLOYMENT.md"
echo "Quick Reference: DEPLOYMENT_SUMMARY.md"
echo "Troubleshooting: See DEPLOYMENT.md 'Common Issues' section"
echo ""

echo "=========================================="
echo "🎉 Your Physical AI Book is Live!"
echo "=========================================="
echo ""
echo "Need help?"
echo "  - Check logs in Render/Vercel dashboards"
echo "  - Review DEPLOYMENT.md for troubleshooting"
echo "  - Verify all environment variables are set"
echo ""
echo "Congratulations on your deployment! 🚀"
echo ""
