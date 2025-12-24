# Deployment Guide - Free-Tier Architecture

This guide covers deploying the Physical AI Book platform using **free-tier services only**.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Vercel Free)                     │
│                  https://your-app.vercel.app                 │
└────────────────────┬─────────────────┬──────────────────────┘
                     │                 │
                     ▼                 ▼
┌────────────────────────┐  ┌─────────────────────────────┐
│  AUTH SERVER (Render)  │  │  BACKEND API (Render Free)  │
│  Node.js + Better Auth │  │  FastAPI + RAG Services     │
│  onrender.com          │  │  onrender.com               │
└────────────┬───────────┘  └──────────┬──────────────────┘
             │                         │
             ▼                         ▼
┌────────────────────┐    ┌──────────────────────────────┐
│  Auth DB (Neon)    │    │  External Services (Free)    │
│  PostgreSQL Free   │    │  - Qdrant Cloud (vectors)    │
└────────────────────┘    │  - Neon Postgres (history)   │
                          │  - Gemini API (LLM)          │
                          └──────────────────────────────┘
```

## Prerequisites

### Required Accounts (All Free Tier)
1. **Vercel** - Frontend hosting
2. **Render** - Backend + Auth server hosting
3. **Neon** - PostgreSQL database (2 databases needed)
4. **Qdrant Cloud** - Vector database
5. **Google AI Studio** - Gemini API key
6. **OAuth Providers** (optional):
   - Google Cloud Console (Google OAuth)
   - GitHub OAuth Apps (GitHub OAuth)

## Deployment Steps

### Phase 1: Setup External Services

#### 1.1 Qdrant Cloud (Vector Database)
1. Go to https://cloud.qdrant.io
2. Sign up for free account
3. Create a new cluster (free tier: 1GB)
4. Note down:
   - Cluster URL: `https://xxxxx.qdrant.io`
   - API Key: `xxxxx`
5. Collection will be created automatically on first backend run

#### 1.2 Neon Database Setup (2 Databases)
1. Go to https://neon.tech
2. Sign up for free account (512MB storage, 3 projects)
3. Create **Project 1: Backend DB**
   - Database name: `neondb` (or your choice)
   - Note connection string with `?sslmode=require` at the end
4. Create **Project 2: Auth DB**
   - Database name: `authdb` (or your choice)
   - Note connection string with `?sslmode=require` at the end

**Connection String Format:**
```
postgresql://username:password@hostname/database?sslmode=require
```

#### 1.3 Google Gemini API Key
1. Go to https://aistudio.google.com/apikey
2. Create new API key
3. Note the key (starts with `AIza...`)

#### 1.4 OAuth Setup (Optional but Recommended)

**Google OAuth:**
1. Go to https://console.cloud.google.com
2. Create new project
3. Navigate to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized origins:
   - `https://your-auth-server.onrender.com`
6. Add authorized redirect URIs:
   - `https://your-auth-server.onrender.com/api/auth/callback/google`
7. Note: Client ID and Client Secret

**GitHub OAuth:**
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Authorization callback URL:
   - `https://your-auth-server.onrender.com/api/auth/callback/github`
4. Note: Client ID and Client Secret

---

### Phase 2: Deploy Backend (Render)

#### 2.1 Deploy FastAPI Backend
1. Go to https://render.com/dashboard
2. Click **New +** > **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `physical-ai-backend`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:**
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt && python -m nltk.downloader punkt
     ```
   - **Start Command:**
     ```bash
     gunicorn src.main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120 --log-level info
     ```
   - **Plan:** Free

5. **Environment Variables** (Click "Advanced" > "Add Environment Variable"):
   ```
   PYTHON_VERSION=3.11.0
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=<your-gemini-key>
   QDRANT_URL=<your-qdrant-url>
   QDRANT_API_KEY=<your-qdrant-key>
   NEON_CONNECTION_STRING=<your-neon-backend-connection-string>
   CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
   LOG_LEVEL=INFO
   CHUNK_SIZE=512
   CHUNK_OVERLAP=128
   TOP_K_RESULTS=5
   SIMILARITY_THRESHOLD=0.7
   ```

6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes first time)
8. Note your backend URL: `https://physical-ai-backend.onrender.com`
9. Test: `https://physical-ai-backend.onrender.com/health`

**⚠️ Important Free-Tier Limitations:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 512MB RAM limit
- 750 hours/month free

---

### Phase 3: Deploy Auth Server (Render)

#### 3.1 Deploy Node.js Auth Server
1. Go to Render dashboard
2. Click **New +** > **Web Service**
3. Connect same GitHub repository
4. Configure:
   - **Name:** `physical-ai-auth-server`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `auth-server`
   - **Runtime:** Node
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Plan:** Free

5. **Environment Variables**:
   ```
   NODE_VERSION=20.10.0
   NODE_ENV=production
   DATABASE_URL=<your-neon-auth-connection-string>
   BETTER_AUTH_SECRET=<generate-random-32-char-string>
   BETTER_AUTH_URL=https://your-auth-server.onrender.com
   GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
   GITHUB_CLIENT_ID=<your-github-oauth-client-id>
   GITHUB_CLIENT_SECRET=<your-github-oauth-secret>
   CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
   ```

6. Click **Create Web Service**
7. After deployment, run database migrations:
   - Go to service > Shell tab
   - Run: `npm run db:migrate`
8. Note auth server URL: `https://physical-ai-auth-server.onrender.com`
9. Test: `https://physical-ai-auth-server.onrender.com/health`

**Generate BETTER_AUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Phase 4: Deploy Frontend (Vercel)

#### 4.1 Deploy Docusaurus Frontend
1. Go to https://vercel.com/dashboard
2. Click **Add New...** > **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (project root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

5. **Environment Variables**:
   ```
   AUTH_URL=https://physical-ai-auth-server.onrender.com
   CHATBOT_API_URL=https://physical-ai-backend.onrender.com
   ```

6. Click **Deploy**
7. Wait for deployment (3-5 minutes)
8. Note your frontend URL: `https://your-app.vercel.app`

#### 4.2 Update CORS Origins
Now that you have your Vercel URL, update CORS:

1. **Backend (Render):**
   - Go to backend service > Environment
   - Update `CORS_ORIGINS`:
     ```
     https://your-app.vercel.app,http://localhost:3000
     ```
   - Save and redeploy

2. **Auth Server (Render):**
   - Go to auth server service > Environment
   - Update `CORS_ORIGINS`:
     ```
     https://your-app.vercel.app,http://localhost:3000
     ```
   - Save and redeploy

3. **OAuth Providers:**
   - Update Google OAuth authorized origins and redirect URIs
   - Update GitHub OAuth callback URL

---

### Phase 5: Initialize Data

#### 5.1 Ingest Book Content (One-Time Setup)
After backend is deployed, ingest the book chapters into Qdrant:

**Option A: Local Script (Recommended)**
```bash
# From project root
cd backend
python src/cli/ingest.py
```

**Option B: Render Shell**
1. Go to backend service in Render
2. Click "Shell" tab
3. Run:
   ```bash
   python src/cli/ingest.py
   ```

This will:
- Parse all MDX chapters from `/docs`
- Chunk text (512 tokens, 128 overlap)
- Generate embeddings via Gemini
- Upload to Qdrant collection

**Expected Output:**
```
✓ Processed 14 chapters
✓ Created 171 chunks
✓ Uploaded to Qdrant collection: physical_ai_book_chunks
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All external services created (Qdrant, Neon, Gemini)
- [ ] OAuth apps configured (Google, GitHub)
- [ ] Environment variables documented
- [ ] Git repository pushed to GitHub

### Backend Deployment
- [ ] Render backend service created
- [ ] All environment variables set
- [ ] Build succeeds
- [ ] Health check passes: `/health`
- [ ] Book content ingested to Qdrant

### Auth Server Deployment
- [ ] Render auth service created
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Health check passes: `/health`
- [ ] OAuth endpoints working

### Frontend Deployment
- [ ] Vercel project created
- [ ] Environment variables set (AUTH_URL, CHATBOT_API_URL)
- [ ] Build succeeds
- [ ] Frontend loads successfully
- [ ] Can access all pages

### Integration Testing
- [ ] CORS working (no console errors)
- [ ] Can log in via Google/GitHub
- [ ] Chatbot loads and appears
- [ ] Can send messages to chatbot
- [ ] Chatbot responds with book content
- [ ] Conversation history persists
- [ ] No 500 errors in network tab

---

## Start Commands Reference

### Backend (FastAPI - Render)
```bash
gunicorn src.main:app \
  --workers 1 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:$PORT \
  --timeout 120 \
  --log-level info
```

**Why these settings:**
- `--workers 1`: Free tier has 512MB RAM, multiple workers cause OOM
- `--timeout 120`: Allow slow cold starts (Render spins down after 15min)
- `uvicorn.workers.UvicornWorker`: Required for FastAPI async support

### Auth Server (Node.js - Render)
```bash
npm start
# Which runs: node dist/index.js
```

### Local Development
```bash
# Backend (from project root)
cd backend
python src/main.py

# Auth Server
cd auth-server
npm run dev

# Frontend
npm start
```

---

## Configuration Files

### Backend: `backend/render.yaml`
```yaml
services:
  - type: web
    name: physical-ai-backend
    env: python
    buildCommand: pip install --upgrade pip && pip install -r requirements.txt && python -m nltk.downloader punkt
    startCommand: gunicorn src.main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120
```

### Auth Server: `auth-server/render.yaml`
```yaml
services:
  - type: web
    name: physical-ai-auth-server
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

### Frontend: `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "env": {
    "AUTH_URL": "@auth_url",
    "CHATBOT_API_URL": "@chatbot_api_url"
  }
}
```

---

## Common Issues & Solutions

### Issue 1: Backend Health Check Fails
**Symptoms:** 502/503 errors on `/health`

**Solutions:**
- Check Render logs for startup errors
- Verify all environment variables are set
- Ensure NEON_CONNECTION_STRING has `?sslmode=require`
- Check Qdrant and Neon services are accessible
- Wait for cold start (first request takes 30-60s)

### Issue 2: CORS Errors
**Symptoms:** Browser console shows CORS policy errors

**Solutions:**
- Verify `CORS_ORIGINS` includes your Vercel URL
- Remove trailing slashes from CORS_ORIGINS
- Ensure Vercel frontend URL is HTTPS
- Check browser Network tab for actual origin being sent
- Redeploy after updating CORS_ORIGINS

### Issue 3: OAuth Redirect Fails
**Symptoms:** OAuth login redirects to wrong URL or fails

**Solutions:**
- Verify `BETTER_AUTH_URL` matches actual auth server URL
- Update OAuth provider redirect URIs to match auth server URL
- Ensure redirect URI includes `/api/auth/callback/{provider}`
- Check auth server logs for specific OAuth errors

### Issue 4: Chatbot Not Responding
**Symptoms:** Chatbot sends message but no response

**Solutions:**
- Check backend logs in Render
- Verify Gemini API key is valid
- Check Qdrant collection exists and has data
- Run `/health` to verify all services connected
- Check Network tab for API errors (401, 500)

### Issue 5: Service Keeps Sleeping
**Symptoms:** First request after inactivity is very slow

**Solutions:**
- This is expected on free tier (15min inactivity → spin down)
- Implement frontend loading state for chatbot
- Consider upgrade to paid tier for always-on
- Use external monitoring (cron-job.org) to keep awake (may violate ToS)

### Issue 6: Build Fails on Render
**Symptoms:** Deployment fails during build

**Solutions:**
- Check Python version is 3.11+ (set PYTHON_VERSION)
- Ensure requirements.txt has no missing dependencies
- Check build logs for specific error
- Verify root directory is set correctly (`backend` or `auth-server`)

### Issue 7: Database Connection Fails
**Symptoms:** Backend crashes with Postgres errors

**Solutions:**
- Verify Neon connection string includes `?sslmode=require`
- Check Neon project is not paused (free tier auto-pauses)
- Ensure DATABASE_URL and NEON_CONNECTION_STRING are different
- Test connection string locally first

---

## Free-Tier Limitations

### Vercel (Frontend)
- ✅ **Bandwidth:** 100GB/month
- ✅ **Build Time:** 6000 minutes/month
- ✅ **Deployments:** Unlimited
- ⚠️ **Serverless Functions:** Not used in this project

### Render (Backend + Auth)
- ✅ **Services:** 1 free web service (we use 2, both free)
- ⚠️ **RAM:** 512MB per service
- ⚠️ **Spin Down:** After 15 minutes inactivity
- ⚠️ **Build Time:** 500 hours/month (shared)
- ⚠️ **Bandwidth:** 100GB/month (shared)
- ⚠️ **Cold Start:** 30-60 seconds

### Qdrant Cloud (Vector DB)
- ✅ **Storage:** 1GB
- ✅ **Operations:** Unlimited
- ⚠️ **Clusters:** 1 free cluster

### Neon (PostgreSQL)
- ✅ **Storage:** 512MB per project
- ✅ **Projects:** 3 free projects (we use 2)
- ⚠️ **Compute:** 191.9 hours/month
- ⚠️ **Auto-Pause:** After 5 minutes inactivity

### Google Gemini API
- ✅ **Free Tier:** 15 requests/minute, 1 million tokens/month
- ⚠️ **Rate Limits:** May need retry logic

---

## Optimization Tips for Free Tier

### 1. Reduce Backend Memory Usage
```python
# In backend/src/config.py
CHUNK_SIZE=256  # Reduce from 512
TOP_K_RESULTS=3  # Reduce from 5
```

### 2. Add Retry Logic for Cold Starts
Already implemented in chatbot API client with exponential backoff.

### 3. Database Connection Pooling
```python
# Already optimized in db_service.py
# Uses psycopg connection pool with max_connections=1 (free tier)
```

### 4. Caching Strategies
- Frontend: Vercel automatic edge caching
- Backend: Qdrant client has built-in caching
- Auth: Better Auth uses session caching

### 5. Monitoring
- Render: Built-in logs and metrics
- Vercel: Analytics dashboard
- Consider: Sentry free tier for error tracking

---

## Security Checklist

- [ ] All API keys stored as environment variables (not in code)
- [ ] CORS properly configured (no `*` wildcards)
- [ ] OAuth redirect URIs locked to production domains
- [ ] Database connections use SSL (`sslmode=require`)
- [ ] Better Auth secret is cryptographically random (32+ chars)
- [ ] No secrets committed to git (check `.gitignore`)
- [ ] Neon databases have separate credentials
- [ ] Free-tier services have rate limiting enabled

---

## Post-Deployment

### Test the Full Flow
1. Visit: `https://your-app.vercel.app`
2. Click login → OAuth flow works
3. Navigate to any chapter
4. Open chatbot (bottom right)
5. Send message: "What is Physical AI?"
6. Verify response is based on book content
7. Check conversation persists across page refreshes

### Monitor Resources
- **Render Dashboard:** Check build times, RAM usage
- **Vercel Analytics:** Monitor bandwidth and requests
- **Neon Console:** Check database size and connections
- **Qdrant Console:** Verify collection size

### Optional: Custom Domain
1. In Vercel: Settings > Domains > Add Domain
2. Update CORS_ORIGINS in backend and auth
3. Update OAuth redirect URIs

---

## Rollback Procedure

If deployment fails:

1. **Frontend:** Vercel auto-keeps previous deployment
   - Dashboard > Deployments > Promote previous

2. **Backend/Auth:** Render keeps previous deployments
   - Service > Events > Rollback to previous

3. **Database:** Neon has point-in-time restore (paid feature)
   - Free tier: Keep manual SQL backups

---

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Qdrant Docs:** https://qdrant.tech/documentation/
- **Better Auth Docs:** https://www.better-auth.com/docs

---

## Cost Estimate

**Monthly Cost: $0** (all free tiers)

**If you need to upgrade:**
- Render Starter: $7/month (always-on, 512MB RAM)
- Vercel Pro: $20/month (more bandwidth)
- Neon Scale: $19/month (always-on, more storage)
- Qdrant: $25/month (5GB storage)

**Total paid setup: ~$71/month** (if you hit free tier limits)

---

## Next Steps

After successful deployment:
1. Monitor usage to ensure staying within free tiers
2. Set up error tracking (Sentry free tier)
3. Configure custom domain (optional)
4. Add monitoring/uptime checks
5. Document your specific environment variables
6. Create backup strategy for databases
7. Test OAuth from different devices/browsers

**🎉 Your Physical AI Book platform is now live!**
