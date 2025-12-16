#!/bin/bash
# Deployment script for RAG Chatbot
# Supports multiple platforms: Render, Railway, Fly.io (backend), Vercel, Netlify, GitHub Pages (frontend)

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "RAG Chatbot Deployment Script"
echo "========================================="
echo ""

# Parse arguments
BACKEND_PLATFORM=""
FRONTEND_PLATFORM=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend)
            BACKEND_PLATFORM="$2"
            shift 2
            ;;
        --frontend)
            FRONTEND_PLATFORM="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 --backend <render|railway|flyio> --frontend <vercel|netlify|github-pages>"
            exit 1
            ;;
    esac
done

if [ -z "$BACKEND_PLATFORM" ] && [ -z "$FRONTEND_PLATFORM" ]; then
    echo "❌ Error: Please specify --backend and/or --frontend platform"
    echo ""
    echo "Usage: $0 --backend <render|railway|flyio> --frontend <vercel|netlify|github-pages>"
    echo ""
    echo "Supported platforms:"
    echo "  Backend:  render, railway, flyio"
    echo "  Frontend: vercel, netlify, github-pages"
    echo ""
    exit 1
fi

# Deploy backend
if [ -n "$BACKEND_PLATFORM" ]; then
    echo "========================================="
    echo "Deploying Backend to $BACKEND_PLATFORM"
    echo "========================================="
    echo ""

    case "$BACKEND_PLATFORM" in
        render)
            echo "Deploying to Render..."
            if ! command -v render &> /dev/null; then
                echo "❌ Error: Render CLI not found"
                echo "   Install: npm install -g render-cli"
                exit 1
            fi
            echo "⚠️  Manual deployment required:"
            echo "   1. Go to https://dashboard.render.com"
            echo "   2. Create new Web Service"
            echo "   3. Connect your GitHub repo"
            echo "   4. Set build command: pip install -r backend/requirements.txt"
            echo "   5. Set start command: uvicorn backend.src.main:app --host 0.0.0.0 --port \$PORT"
            echo "   6. Add environment variables from backend/.env"
            ;;

        railway)
            echo "Deploying to Railway..."
            if ! command -v railway &> /dev/null; then
                echo "❌ Error: Railway CLI not found"
                echo "   Install: npm install -g @railway/cli"
                exit 1
            fi
            cd "$PROJECT_ROOT/backend"
            railway up
            echo "✅ Backend deployed to Railway"
            ;;

        flyio)
            echo "Deploying to Fly.io..."
            if ! command -v flyctl &> /dev/null; then
                echo "❌ Error: Fly.io CLI not found"
                echo "   Install: curl -L https://fly.io/install.sh | sh"
                exit 1
            fi
            cd "$PROJECT_ROOT/backend"
            if [ ! -f "fly.toml" ]; then
                echo "Creating fly.toml..."
                flyctl launch --no-deploy
            fi
            flyctl deploy
            echo "✅ Backend deployed to Fly.io"
            ;;

        *)
            echo "❌ Error: Unsupported backend platform: $BACKEND_PLATFORM"
            exit 1
            ;;
    esac

    echo ""
fi

# Deploy frontend
if [ -n "$FRONTEND_PLATFORM" ]; then
    echo "========================================="
    echo "Deploying Frontend to $FRONTEND_PLATFORM"
    echo "========================================="
    echo ""

    case "$FRONTEND_PLATFORM" in
        vercel)
            echo "Deploying to Vercel..."
            if ! command -v vercel &> /dev/null; then
                echo "❌ Error: Vercel CLI not found"
                echo "   Install: npm install -g vercel"
                exit 1
            fi
            cd "$PROJECT_ROOT"
            vercel --prod
            echo "✅ Frontend deployed to Vercel"
            ;;

        netlify)
            echo "Deploying to Netlify..."
            if ! command -v netlify &> /dev/null; then
                echo "❌ Error: Netlify CLI not found"
                echo "   Install: npm install -g netlify-cli"
                exit 1
            fi
            cd "$PROJECT_ROOT"
            npm run build
            netlify deploy --prod --dir=build
            echo "✅ Frontend deployed to Netlify"
            ;;

        github-pages)
            echo "Deploying to GitHub Pages..."
            cd "$PROJECT_ROOT"

            # Check if gh-pages is configured
            if ! npm run | grep -q "deploy"; then
                echo "⚠️  Adding gh-pages deployment script to package.json..."
                echo "   Please ensure you have: npm install --save-dev gh-pages"
                echo "   And add to package.json scripts:"
                echo '     "deploy": "docusaurus build && gh-pages -d build"'
                exit 1
            fi

            npm run deploy
            echo "✅ Frontend deployed to GitHub Pages"
            ;;

        *)
            echo "❌ Error: Unsupported frontend platform: $FRONTEND_PLATFORM"
            exit 1
            ;;
    esac

    echo ""
fi

echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Update frontend API endpoint in production environment"
echo "  2. Test the deployed application"
echo "  3. Monitor logs for any issues"
echo ""
