# CORS & OAuth Deployment Fix

**URGENT**: This guide fixes the CORS errors preventing Google OAuth and API access from working.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Backend Deployment](#backend-deployment)
   - [Option A: Render (Recommended)](#option-a-render-recommended)
   - [Option B: Railway](#option-b-railway)
   - [Option C: Fly.io](#option-c-flyio)
4. [Frontend Deployment](#frontend-deployment)
   - [Option A: Vercel (Recommended)](#option-a-vercel-recommended)
   - [Option B: Netlify](#option-b-netlify)
   - [Option C: GitHub Pages](#option-c-github-pages)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services (Free Tiers Available)

1. **Gemini API** (Google)
   - Sign up: https://makersuite.google.com/app/apikey
   - Free: 15 RPM, 1M tokens/month

2. **Qdrant Cloud** (Vector Database)
   - Sign up: https://cloud.qdrant.io
   - Free: 1GB storage

3. **Neon Postgres** (Database)
   - Sign up: https://neon.tech
   - Free: 512MB storage, 3GB data transfer/month

### Required Tools

```bash
# Node.js 18+ and npm
node --version  # Should be v18+
npm --version

# Python 3.11 or 3.12 (not 3.13 - compatibility issues)
python3 --version  # Should be 3.11.x or 3.12.x

# Git
git --version

# Platform CLI tools (install as needed)
npm install -g vercel       # For Vercel deployment
npm install -g netlify-cli  # For Netlify deployment
npm install -g @railway/cli # For Railway deployment
```

---

## Pre-Deployment Checklist

### 1. Test Locally First

Before deploying, ensure everything works locally:

```bash
# 1. Install dependencies
./scripts/install.sh

# 2. Configure environment
./scripts/setup-env.sh

# 3. Setup databases
./scripts/setup-qdrant.sh
./scripts/setup-neon.sh

# 4. Ingest and embed content
./scripts/ingest-book.sh --full-rebuild
./scripts/embed-book.sh --full-rebuild

# 5. Test locally
./scripts/dev.sh
```

Open http://localhost:3000 and verify:
- ✅ Chat widget appears in bottom-right
- ✅ Can ask questions and get responses
- ✅ Sources are displayed
- ✅ History persists across page refreshes

### 2. Prepare Environment Variables

Create a production `.env` file (don't commit this!):

```bash
# Copy example and fill in production values
cp backend/.env.example backend/.env.production

# Edit with production credentials
nano backend/.env.production
```

**Required variables**:
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_production_key_here
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_production_key_here
NEON_CONNECTION_STRING=postgres://user:pass@host/db
CORS_ORIGINS=https://your-frontend-domain.com,https://your-backend-domain.com
LOG_LEVEL=INFO
```

### 3. Update Frontend Configuration

Edit `docusaurus.config.js` to point to production API:

```javascript
// Before deployment, update this:
plugins: [
  ['./frontend/docusaurus-plugin-rag-chatbot', {
    apiEndpoint: process.env.REACT_APP_API_ENDPOINT || 'https://your-backend.onrender.com',
  }],
],
```

---

## Backend Deployment

### Option A: Render (Recommended)

**Pros**: Easy setup, automatic deploys, free SSL, free tier available
**Cons**: Cold starts on free tier (~30s after inactivity)

#### Method 1: Using render.yaml (Blueprint)

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create Render account**: https://dashboard.render.com/register

3. **Create New Blueprint**:
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`
   - Click "Apply"

4. **Set Environment Variables**:
   - Go to your service → "Environment"
   - Add all variables from `backend/.env.production`:
     - `LLM_PROVIDER` = `gemini`
     - `GEMINI_API_KEY` = `your_key`
     - `QDRANT_URL` = `https://...`
     - `QDRANT_API_KEY` = `your_key`
     - `NEON_CONNECTION_STRING` = `postgres://...`
     - `CORS_ORIGINS` = `https://your-frontend.vercel.app`
     - `LOG_LEVEL` = `INFO`

5. **Deploy**:
   - Render will automatically build and deploy
   - Wait for "Live" status (~5-10 minutes first time)
   - Note your backend URL: `https://rag-chatbot-backend.onrender.com`

6. **Test Backend**:
   ```bash
   curl https://rag-chatbot-backend.onrender.com/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "services": {
       "qdrant": "ok",
       "llm": "ok",
       "database": "ok"
     }
   }
   ```

#### Method 2: Using Dockerfile

1. **Create Web Service**:
   - Dashboard → "New" → "Web Service"
   - Connect repository
   - Select branch: `main`

2. **Configure Build**:
   - **Name**: `rag-chatbot-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Plan**: Free

3. **Add Environment Variables** (same as Method 1)

4. **Deploy** → Wait for "Live" status

---

### Option B: Railway

**Pros**: Excellent developer experience, fast deploys, generous free tier
**Cons**: Requires credit card even for free tier

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**:
   ```bash
   cd backend
   railway init
   ```

3. **Set Environment Variables**:
   ```bash
   railway variables set LLM_PROVIDER=gemini
   railway variables set GEMINI_API_KEY=your_key
   railway variables set QDRANT_URL=https://...
   railway variables set QDRANT_API_KEY=your_key
   railway variables set NEON_CONNECTION_STRING=postgres://...
   railway variables set CORS_ORIGINS=https://your-frontend.com
   railway variables set LOG_LEVEL=INFO
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Get URL**:
   ```bash
   railway domain
   ```

   Note your backend URL: `https://backend-production-xxxx.up.railway.app`

---

### Option C: Fly.io

**Pros**: Global edge network, fast cold starts, good for high traffic
**Cons**: More complex setup, requires credit card

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   flyctl auth login
   ```

2. **Launch App**:
   ```bash
   cd backend
   flyctl launch --no-deploy
   ```

   - Choose app name
   - Select region
   - Don't deploy yet

3. **Set Environment Variables**:
   ```bash
   flyctl secrets set LLM_PROVIDER=gemini \
     GEMINI_API_KEY=your_key \
     QDRANT_URL=https://... \
     QDRANT_API_KEY=your_key \
     NEON_CONNECTION_STRING=postgres://... \
     CORS_ORIGINS=https://your-frontend.com \
     LOG_LEVEL=INFO
   ```

4. **Deploy**:
   ```bash
   flyctl deploy
   ```

5. **Get URL**:
   ```bash
   flyctl info
   ```

   Note your backend URL: `https://your-app.fly.dev`

---

## Frontend Deployment

### Option A: Vercel (Recommended)

**Pros**: Fastest CDN, automatic preview deploys, excellent DX, free SSL
**Cons**: Limited build minutes on free tier

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Update `docusaurus.config.js`**:
   ```javascript
   plugins: [
     ['./frontend/docusaurus-plugin-rag-chatbot', {
       apiEndpoint: 'https://rag-chatbot-backend.onrender.com', // Your backend URL
     }],
   ],
   ```

3. **Deploy**:
   ```bash
   # First deployment (will ask configuration questions)
   vercel

   # Production deployment
   vercel --prod
   ```

4. **Set Environment Variable** (if using dynamic API endpoint):
   ```bash
   vercel env add REACT_APP_API_ENDPOINT production
   # Enter: https://rag-chatbot-backend.onrender.com
   ```

5. **Redeploy** to apply environment variable:
   ```bash
   vercel --prod
   ```

6. **Get URL**:
   - Vercel will output your production URL
   - Example: `https://physical-ai-book.vercel.app`

---

### Option B: Netlify

**Pros**: Great for static sites, form handling, split testing
**Cons**: Slower than Vercel, limited build minutes

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Update API Endpoint** in `docusaurus.config.js` (same as Vercel)

3. **Build Site**:
   ```bash
   npm run build
   ```

4. **Deploy**:
   ```bash
   netlify deploy --prod --dir=build
   ```

5. **Set Environment Variable**:
   ```bash
   netlify env:set REACT_APP_API_ENDPOINT https://rag-chatbot-backend.onrender.com
   ```

6. **Get URL**:
   - Netlify will output your URL
   - Example: `https://physical-ai-book.netlify.app`

---

### Option C: GitHub Pages

**Pros**: Free, integrates with GitHub, simple
**Cons**: No server-side features, slower builds

1. **Add `homepage` to `package.json`**:
   ```json
   {
     "homepage": "https://yourusername.github.io/physical-ai-book",
     ...
   }
   ```

2. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deploy script to `package.json`**:
   ```json
   {
     "scripts": {
       "deploy": "docusaurus build && gh-pages -d build"
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**:
   - Go to repository → Settings → Pages
   - Source: `gh-pages` branch
   - Save

6. **Get URL**:
   - `https://yourusername.github.io/physical-ai-book`

---

## Post-Deployment

### 1. Update CORS Origins

Add your production frontend URL to backend CORS:

**Render**:
- Dashboard → Service → Environment
- Update `CORS_ORIGINS`: `https://physical-ai-book.vercel.app,https://rag-chatbot-backend.onrender.com`
- Save (will trigger redeploy)

**Railway**:
```bash
railway variables set CORS_ORIGINS=https://physical-ai-book.vercel.app,https://backend.railway.app
```

**Fly.io**:
```bash
flyctl secrets set CORS_ORIGINS=https://physical-ai-book.vercel.app,https://your-app.fly.dev
```

### 2. Test Production

1. **Test Health Endpoint**:
   ```bash
   curl https://your-backend.com/health
   ```

2. **Test Frontend**:
   - Open `https://your-frontend.com`
   - Click chat widget
   - Ask: "What is Physical AI?"
   - Verify response appears

3. **Test History Persistence**:
   - Ask 3 questions
   - Close tab
   - Reopen → verify history restored

### 3. Set Up Monitoring

**Recommended: UptimeRobot (Free)**

1. Sign up: https://uptimerobot.com
2. Add monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://your-backend.com/health`
   - **Interval**: 5 minutes
   - **Alert contacts**: Your email

3. Add frontend monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://your-frontend.com`
   - **Interval**: 5 minutes

### 4. Set Up Analytics (Optional)

**Google Analytics**:

1. Create GA4 property: https://analytics.google.com
2. Add to `docusaurus.config.js`:
   ```javascript
   presets: [
     [
       'classic',
       {
         googleAnalytics: {
           trackingID: 'G-XXXXXXXXXX',
           anonymizeIP: true,
         },
       },
     ],
   ],
   ```
3. Redeploy frontend

### 5. Schedule Cleanup (Optional)

Run weekly cleanup of old sessions (>30 days):

**GitHub Actions** (`.github/workflows/cleanup.yml`):
```yaml
name: Cleanup Old Sessions

on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install psycopg[binary]
      - name: Run cleanup
        env:
          NEON_CONNECTION_STRING: ${{ secrets.NEON_CONNECTION_STRING }}
        run: ./scripts/cleanup-old-sessions.sh --days 30
```

---

## Troubleshooting

### Backend Issues

**Issue**: `Health check failed`

**Solution**:
1. Check backend logs:
   - **Render**: Dashboard → Logs
   - **Railway**: `railway logs`
   - **Fly.io**: `flyctl logs`

2. Verify environment variables are set correctly
3. Test database connections:
   ```bash
   # Test Qdrant
   curl -H "api-key: YOUR_KEY" https://your-cluster.qdrant.io/collections

   # Test Neon
   psql "postgres://user:pass@host/db" -c "SELECT 1"
   ```

**Issue**: `CORS error` in browser console

**Solution**:
- Add frontend URL to `CORS_ORIGINS`
- Include protocol: `https://your-frontend.com` (not `your-frontend.com`)
- Redeploy backend after updating

**Issue**: `Cold start timeout` (Render free tier)

**Solution**:
- Upgrade to paid plan ($7/month) for always-on
- Or use Railway/Fly.io (faster cold starts)
- Or implement warming cron job:
  ```yaml
  # .github/workflows/warm.yml
  on:
    schedule:
      - cron: '*/5 * * * *'  # Every 5 minutes
  jobs:
    warm:
      runs-on: ubuntu-latest
      steps:
        - run: curl https://your-backend.com/health
  ```

### Frontend Issues

**Issue**: Chat widget not appearing

**Solution**:
1. Check browser console for errors
2. Verify plugin is registered in `docusaurus.config.js`
3. Check API endpoint is correct
4. Test API manually: `curl https://your-backend.com/health`

**Issue**: `Failed to fetch` error

**Solution**:
- Backend might be sleeping (wait 30s for cold start)
- Check CORS configuration
- Verify API endpoint URL is correct (https, not http)

**Issue**: Build fails on Vercel/Netlify

**Solution**:
- Check Node.js version (should be 18+)
- Clear build cache and retry
- Check build logs for specific errors
- Verify all dependencies are in `package.json`

---

## Summary

✅ **Backend Deployed**: Render/Railway/Fly.io
✅ **Frontend Deployed**: Vercel/Netlify/GitHub Pages
✅ **Environment Variables**: Set in platform dashboards
✅ **CORS**: Frontend URL added to backend
✅ **Health Checks**: Passing
✅ **Monitoring**: UptimeRobot configured
✅ **Analytics**: Google Analytics (optional)

**Your RAG Chatbot is now live in production! 🎉**

**Production URLs**:
- Frontend: `https://physical-ai-book.vercel.app`
- Backend API: `https://rag-chatbot-backend.onrender.com`
- Health Check: `https://rag-chatbot-backend.onrender.com/health`

**Next Steps**:
1. Share the production URL with users
2. Monitor usage and performance
3. Update content: Re-run `./scripts/ingest-book.sh && ./scripts/embed-book.sh`
4. Gather user feedback
5. Iterate and improve!

---

## Support

- **Issues**: https://github.com/yourusername/physical-ai-book/issues
- **Discussions**: https://github.com/yourusername/physical-ai-book/discussions
- **Documentation**: `/specs/002-rag-chatbot/quickstart.md`
