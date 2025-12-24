# CLI-Based Deployment Guide

## Quick Start

Deploy your entire application using automated scripts:

```bash
# Deploy everything (guided)
./deploy-all.sh

# Or deploy individually
./deploy-backend.sh     # Backend to Render
./deploy-auth.sh        # Auth server to Render
./deploy-frontend.sh    # Frontend to Vercel (fully automated)
```

---

## Prerequisites

### Required Tools
- ✅ **Git** - Version control
- ✅ **Node.js 20+** - For Vercel CLI and auth server
- ✅ **npm** - Package manager
- ✅ **Vercel CLI** - Frontend deployment (auto-installed by script)
- ✅ **curl** - Testing deployments

### Required Accounts (All Free Tier)
1. **Render** (https://render.com) - Backend + Auth hosting
2. **Vercel** (https://vercel.com) - Frontend hosting
3. **Qdrant Cloud** (https://cloud.qdrant.io) - Vector database
4. **Neon** (https://neon.tech) - PostgreSQL database
5. **Google AI Studio** (https://aistudio.google.com) - Gemini API

### External Services Setup

#### 1. Qdrant Cloud (Vector Database)
```bash
# 1. Sign up at https://cloud.qdrant.io
# 2. Create free cluster (1GB)
# 3. Note:
#    - Cluster URL: https://xxxxx.qdrant.io
#    - API Key: xxxxx
```

#### 2. Neon Database (PostgreSQL)
```bash
# 1. Sign up at https://neon.tech
# 2. Create Project 1: Backend Database
#    - Database name: neondb
#    - Note connection string with ?sslmode=require
# 3. Create Project 2: Auth Database
#    - Database name: authdb
#    - Note connection string with ?sslmode=require
```

#### 3. Google Gemini API
```bash
# 1. Go to https://aistudio.google.com/apikey
# 2. Create API key
# 3. Note key (starts with AIza...)
```

#### 4. OAuth Setup (Optional)

**Google OAuth:**
```bash
# 1. Go to https://console.cloud.google.com
# 2. Create project > APIs & Services > Credentials
# 3. Create OAuth 2.0 Client ID
# 4. Add authorized origins:
#    - https://your-auth-server.onrender.com
# 5. Add redirect URIs:
#    - https://your-auth-server.onrender.com/api/auth/callback/google
# 6. Note Client ID and Secret
```

**GitHub OAuth:**
```bash
# 1. Go to https://github.com/settings/developers
# 2. New OAuth App
# 3. Callback URL:
#    - https://your-auth-server.onrender.com/api/auth/callback/github
# 4. Note Client ID and Secret
```

---

## Deployment Process

### Option 1: Automated Full Deployment (Recommended)

```bash
# Run master deployment script
./deploy-all.sh
```

This will guide you through:
1. ✅ Prerequisites check
2. ✅ Backend deployment to Render
3. ✅ Auth server deployment to Render
4. ✅ Frontend deployment to Vercel (fully automated)
5. ✅ CORS configuration reminders
6. ✅ Testing instructions

**Time:** 45-60 minutes (first time)

---

### Option 2: Step-by-Step Manual Deployment

#### Step 1: Deploy Backend

```bash
./deploy-backend.sh
```

**What this does:**
- ✅ Checks prerequisites
- ✅ Generates `.env.render.backend` with all environment variables
- ✅ Provides detailed Render UI instructions
- ✅ Tests health endpoint after deployment

**Render Configuration:**
```bash
Name: physical-ai-backend
Region: Oregon
Root Directory: backend
Runtime: Python 3
Build Command: pip install --upgrade pip && pip install -r requirements.txt && python -m nltk.downloader punkt
Start Command: gunicorn src.main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120 --log-level info
```

**Environment Variables:**
- Set from generated `.env.render.backend` file
- 10 variables total (6 required, 4 optional)

**Post-Deployment:**
```bash
# Test health
curl https://your-backend.onrender.com/health

# Ingest book content (one-time)
# Option A: Render Shell
# Go to service > Shell > Run:
python src/cli/ingest.py

# Option B: Local
cd backend
python src/cli/ingest.py
```

---

#### Step 2: Deploy Auth Server

```bash
./deploy-auth.sh
```

**What this does:**
- ✅ Generates random BETTER_AUTH_SECRET
- ✅ Creates `.env.render.auth` with all environment variables
- ✅ Provides detailed Render UI instructions
- ✅ Tests health endpoint after deployment
- ✅ Reminds you to run database migrations

**Render Configuration:**
```bash
Name: physical-ai-auth-server
Region: Oregon
Root Directory: auth-server
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

**Environment Variables:**
- Set from generated `.env.render.auth` file
- 9 variables total (5 required, 4 optional OAuth)

**Post-Deployment:**
```bash
# Test health
curl https://your-auth.onrender.com/health

# Run migrations (Render Shell)
# Go to service > Shell > Run:
npm run db:migrate
```

---

#### Step 3: Deploy Frontend (Fully Automated with Vercel CLI)

```bash
./deploy-frontend.sh
```

**What this does:**
- ✅ Checks/installs Vercel CLI
- ✅ Collects backend and auth URLs
- ✅ Logs into Vercel
- ✅ **Automatically deploys** with environment variables
- ✅ Deploys to production
- ✅ Tests deployment
- ✅ Saves deployment URLs
- ✅ Provides CORS update instructions

**Fully Automated:**
- No manual steps in Vercel UI needed
- Environment variables set automatically
- Production deployment with one command

**Environment Variables (Auto-configured):**
```bash
AUTH_URL=https://your-auth.onrender.com
CHATBOT_API_URL=https://your-backend.onrender.com
```

**Post-Deployment:**
```bash
# Frontend URL will be displayed
# Visit and test:
# 1. Homepage loads
# 2. Can log in
# 3. Chatbot works
```

---

## Environment Variables Reference

### Backend (.env.render.backend)
```bash
# Required
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...
QDRANT_URL=https://xxxxx.qdrant.io
QDRANT_API_KEY=xxxxx
NEON_CONNECTION_STRING=postgresql://user:pass@host/db?sslmode=require
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000

# Optional (with defaults)
LOG_LEVEL=INFO
CHUNK_SIZE=512
CHUNK_OVERLAP=128
TOP_K_RESULTS=5
SIMILARITY_THRESHOLD=0.7
```

### Auth Server (.env.render.auth)
```bash
# Required
DATABASE_URL=postgresql://user:pass@host/authdb?sslmode=require
BETTER_AUTH_SECRET=<auto-generated-32-char-hex>
BETTER_AUTH_URL=https://your-auth.onrender.com
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
NODE_ENV=production

# OAuth (Optional)
GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx
GITHUB_CLIENT_ID=xxxxx
GITHUB_CLIENT_SECRET=xxxxx
```

### Frontend (Auto-set by script)
```bash
AUTH_URL=https://your-auth.onrender.com
CHATBOT_API_URL=https://your-backend.onrender.com
```

---

## Post-Deployment Steps

### 1. Update CORS Origins

After frontend deployment, update both backend and auth server:

**Backend:**
```bash
# Render Dashboard > Backend Service > Environment
CORS_ORIGINS=https://your-actual-app.vercel.app,http://localhost:3000
# Save and redeploy
```

**Auth Server:**
```bash
# Render Dashboard > Auth Service > Environment
CORS_ORIGINS=https://your-actual-app.vercel.app,http://localhost:3000
# Save and redeploy
```

### 2. Update OAuth Redirect URIs

Update your OAuth apps with actual deployed URLs:

**Google:**
- Authorized origins: `https://your-auth.onrender.com`
- Redirect URIs: `https://your-auth.onrender.com/api/auth/callback/google`

**GitHub:**
- Callback URL: `https://your-auth.onrender.com/api/auth/callback/github`

### 3. Test Full Flow

```bash
# 1. Visit frontend
https://your-app.vercel.app

# 2. Check console for errors (F12)
# Should have no CORS errors

# 3. Test login
# Click login > Choose provider > Should redirect properly

# 4. Navigate to any chapter

# 5. Open chatbot (bottom right)

# 6. Send message: "What is Physical AI?"
# Should respond based on book content

# 7. Refresh page
# Conversation should persist
```

---

## CLI Commands Reference

### Vercel CLI Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy to production
vercel --prod

# Deploy with environment variables
vercel --build-env AUTH_URL="https://..." --build-env CHATBOT_API_URL="https://..."

# List deployments
vercel ls

# Get deployment URL
vercel ls --meta githubCommitRef=main

# Inspect deployment
vercel inspect <deployment-url>

# View logs
vercel logs <deployment-url>

# Remove deployment
vercel rm <deployment-url>

# Link to existing project
vercel link

# Set environment variables
vercel env add AUTH_URL production
vercel env add CHATBOT_API_URL production

# Pull environment variables
vercel env pull
```

### Render (via Dashboard - No Native CLI)

Render doesn't have a full CLI, so we use dashboard + API:

```bash
# Health check (after deployment)
curl https://your-backend.onrender.com/health
curl https://your-auth.onrender.com/health

# Shell access (use Render Dashboard)
# Dashboard > Service > Shell tab

# Restart service (use Dashboard)
# Dashboard > Service > Manual Deploy > Deploy latest commit

# View logs (use Dashboard or API)
# Dashboard > Service > Logs tab
```

---

## Troubleshooting

### Backend Deployment Issues

**Issue: Health check fails (502/503)**
```bash
# Wait 30-60 seconds for cold start
sleep 60 && curl https://your-backend.onrender.com/health

# Check logs in Render Dashboard
# Verify all environment variables are set
# Ensure NEON_CONNECTION_STRING has ?sslmode=require
```

**Issue: Build fails**
```bash
# Check Python version
echo $PYTHON_VERSION  # Should be 3.11.0

# Verify requirements.txt includes gunicorn
grep gunicorn backend/requirements.txt

# Check build logs in Render Dashboard
```

### Auth Server Issues

**Issue: Database connection fails**
```bash
# Verify DATABASE_URL has ?sslmode=require
# Check Neon project is not paused
# Run migrations:
#   Render Dashboard > Service > Shell
#   npm run db:migrate
```

**Issue: OAuth redirect fails**
```bash
# Verify BETTER_AUTH_URL matches actual service URL
# Update OAuth provider redirect URIs
# Check auth server logs for specific error
```

### Frontend Issues

**Issue: Vercel login fails**
```bash
# Logout and login again
vercel logout
vercel login

# Use browser authentication
vercel login --github
vercel login --gitlab
```

**Issue: Build fails**
```bash
# Check Node version
node --version  # Should be 20+

# Clear cache and retry
rm -rf .next build node_modules
npm install
npm run build

# Check build logs
vercel logs
```

**Issue: CORS errors**
```bash
# Verify CORS_ORIGINS in backend includes Vercel URL
# Verify CORS_ORIGINS in auth includes Vercel URL
# Remove trailing slashes from URLs
# Redeploy backend and auth after updating
```

### Chatbot Not Responding

**Issue: Chatbot sends message but no response**
```bash
# 1. Check backend health
curl https://your-backend.onrender.com/health

# 2. Verify Qdrant has data
# Check Qdrant Cloud dashboard
# Should have 171 points in collection

# 3. Check backend logs
# Render Dashboard > Backend > Logs

# 4. Test API directly
curl -X POST https://your-backend.onrender.com/query \
  -H "Content-Type: application/json" \
  -d '{"query":"What is Physical AI?","session_id":"test"}'

# 5. Verify Gemini API key is valid
# Check for rate limit errors in logs
```

---

## Redeployment

### Update Backend
```bash
# 1. Make code changes
git add .
git commit -m "Update backend"
git push

# 2. Render auto-deploys on push (if enabled)
# Or manually in Render Dashboard:
#   Service > Manual Deploy > Deploy latest commit
```

### Update Auth Server
```bash
# 1. Make code changes
git add .
git commit -m "Update auth"
git push

# 2. Render auto-deploys
# Or manual deploy in dashboard
```

### Update Frontend
```bash
# 1. Make code changes
git add .
git commit -m "Update frontend"
git push

# 2. Redeploy with Vercel CLI
vercel --prod

# Or Vercel auto-deploys from git
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Qdrant cluster created
- [ ] Neon databases created (2)
- [ ] Gemini API key obtained
- [ ] OAuth apps configured
- [ ] Render account created
- [ ] Vercel account created
- [ ] Code pushed to GitHub

### Backend
- [ ] Run `./deploy-backend.sh`
- [ ] All env vars set in Render
- [ ] Service deployed successfully
- [ ] Health check passes
- [ ] Book content ingested

### Auth Server
- [ ] Run `./deploy-auth.sh`
- [ ] All env vars set in Render
- [ ] Service deployed successfully
- [ ] Migrations run
- [ ] Health check passes

### Frontend
- [ ] Run `./deploy-frontend.sh`
- [ ] Vercel CLI authenticated
- [ ] Deployment successful
- [ ] Frontend loads

### Post-Deployment
- [ ] CORS updated in backend
- [ ] CORS updated in auth
- [ ] OAuth URIs updated
- [ ] Full flow tested
- [ ] No console errors
- [ ] Chatbot working

---

## Deployment Scripts Summary

```bash
# Master script (runs all)
./deploy-all.sh

# Individual scripts
./deploy-backend.sh    # Backend to Render (guided)
./deploy-auth.sh       # Auth to Render (guided)
./deploy-frontend.sh   # Frontend to Vercel (automated)
```

**Generated Files:**
- `.env.render.backend` - Backend environment variables
- `.env.render.auth` - Auth environment variables
- `.env.production.local` - Frontend variables (local reference)
- `.deployment-urls.txt` - All deployment URLs

---

## Success Criteria

✅ All services deployed
✅ All health checks pass
✅ Frontend loads without errors
✅ Can log in with OAuth
✅ Chatbot responds with book content
✅ Conversation persists across refreshes
✅ Within free-tier limits

---

## Cost

**Total: $0/month** (all free tiers)

---

## Support

- **Full Guide:** `DEPLOYMENT.md`
- **Quick Ref:** `DEPLOYMENT_SUMMARY.md`
- **This Guide:** `DEPLOYMENT_CLI.md`

**Ready to deploy?** Run `./deploy-all.sh` 🚀
