#!/bin/bash
# Script to redeploy to Vercel with fixes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo "========================================"
echo "🚀 Vercel Redeployment Script"
echo "========================================"
echo ""

cd "$PROJECT_ROOT"

# Step 1: Clean build
echo -e "${BLUE}Step 1: Cleaning previous build...${NC}"
npm run clear
echo -e "${GREEN}✅ Build cache cleared${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Test build locally
echo -e "${BLUE}Step 3: Testing production build...${NC}"
NODE_ENV=production npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed! Fix errors before deploying.${NC}"
    exit 1
fi
echo ""

# Step 4: Check Vercel CLI
echo -e "${BLUE}Step 4: Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi
echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo ""

# Step 5: Check environment variables
echo -e "${BLUE}Step 5: Verifying environment variables...${NC}"
echo ""
echo "Please ensure these are set in Vercel Dashboard:"
echo "  - CHATBOT_API_URL = https://physical-ai-backend.onrender.com"
echo "  - AUTH_URL = https://physical-ai-backend.onrender.com"
echo "  - NODE_ENV = production"
echo ""
echo "Go to: https://vercel.com/dashboard → physical-ai-book1 → Settings → Environment Variables"
echo ""
read -p "Are environment variables configured? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please configure environment variables first${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Environment variables confirmed${NC}"
echo ""

# Step 6: Deploy
echo -e "${BLUE}Step 6: Deploying to Vercel...${NC}"
echo ""
echo "Choose deployment method:"
echo "  1) Automatic (Git push - recommended)"
echo "  2) Manual (vercel --prod)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}Preparing Git commit...${NC}"

        # Check if there are changes
        if [[ -z $(git status -s) ]]; then
            echo -e "${YELLOW}⚠️  No changes to commit${NC}"
            echo "Configuration files already committed"
        else
            echo "Files to commit:"
            git status -s
            echo ""

            git add vercel.json docusaurus.config.ts .env.production
            git commit -m "Fix: Correct Vercel deployment configuration

- Update vercel.json with correct build paths and Docusaurus framework
- Set production URL in docusaurus.config.ts
- Add .env.production with backend API URLs
- Configure proper routing for SPA
- Add security headers and asset caching"

            echo -e "${GREEN}✅ Changes committed${NC}"
        fi

        echo ""
        echo -e "${BLUE}Pushing to trigger deployment...${NC}"
        git push origin $(git branch --show-current)

        echo ""
        echo -e "${GREEN}✅ Pushed to GitHub - Vercel will auto-deploy${NC}"
        echo ""
        echo "Monitor deployment at: https://vercel.com/dashboard"
        ;;

    2)
        echo ""
        echo -e "${BLUE}Deploying directly via Vercel CLI...${NC}"
        vercel --prod

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Deployment successful!${NC}"
        else
            echo ""
            echo -e "${RED}❌ Deployment failed${NC}"
            exit 1
        fi
        ;;

    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "🎉 Deployment Complete!"
echo "========================================"
echo ""
echo "Your site should be live at:"
echo "  https://physical-ai-book1.vercel.app"
echo ""
echo "📝 Verification Steps:"
echo "  1. Visit: https://physical-ai-book1.vercel.app"
echo "  2. Navigate to: https://physical-ai-book1.vercel.app/docs/intro"
echo "  3. Check chatbot widget (bottom-right)"
echo "  4. Test chatbot with: 'What is Physical AI?'"
echo "  5. Verify all CSS and styling loads correctly"
echo ""
echo "📊 Monitor Deployment:"
echo "  - Vercel Dashboard: https://vercel.com/dashboard"
echo "  - Build Logs: Click on deployment → View Logs"
echo ""
echo "🐛 If Issues Persist:"
echo "  See: VERCEL_FIX_GUIDE.md (Troubleshooting section)"
echo ""
