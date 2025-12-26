# 🚀 Physical AI Book - Deployment Guide

Complete step-by-step guide to deploy your project on **Railway** (Backend + Auth) and **Vercel** (Frontend).

---

## 📋 Pre-Deployment Checklist

Before deployment, make sure you have:

- ✅ Railway CLI installed (`railway --version`)
- ✅ Vercel CLI installed (`vercel --version`)
- ✅ GitHub account with repository pushed
- ✅ All API keys ready:
  - Gemini API Key
  - Qdrant URL & API Key
  - Neon Postgres Connection String

---

## 🎯 Deployment Architecture

```
┌──────────────────────────────────────┐
│      VERCEL (Frontend)               │
│  - Docusaurus Website                │
│  - URL: yourapp.vercel.app          │
└──────────────────────────────────────┘
              ↓ API calls
┌──────────────────────────────────────┐
│      RAILWAY (Backend Services)      │
│                                      │
│  Service 1: FastAPI Backend          │
│    - RAG Chatbot API                 │
│    - URL: backend-xxx.railway.app    │
│                                      │
│  Service 2: Auth Server              │
│    - BetterAuth                      │
│    - URL: auth-xxx.railway.app       │
└──────────────────────────────────────┘
              ↓ connects to
┌──────────────────────────────────────┐
│      EXTERNAL SERVICES               │
│  - Neon Postgres                     │
│  - Qdrant Cloud                      │
│  - Gemini API                        │
└──────────────────────────────────────┘
```

---

## 🚂 Part 1: Deploy Backend to Railway

### Step 1: Login to Railway

```bash
railway login
```

This will open your browser for authentication.

### Step 2: Create New Project for Backend

```bash
# Navigate to project root
cd /home/muhammad-faizan/Desktop/physical-ai-book1

# Initialize Railway project (Backend)
railway init
```

**Select**:
- Create new project: "physical-ai-backend"
- Deploy now? **No** (we'll set env vars first)

### Step 3: Set Environment Variables for Backend

```bash
# Set all required environment variables
railway variables set LLM_PROVIDER=gemini
railway variables set GEMINI_API_KEY=AIzaSyC2EbV8wTwd20T_SgcCByEfHP3O8v11gq8
railway variables set QDRANT_URL=https://c793b077-b46d-4f37-b38b-a572f2362704.us-east-1-1.aws.cloud.qdrant.io
railway variables set QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.rX6vEg6XOSDtUuK9iXi3AKsP4JweBtgGHG_MNwgWVwU
railway variables set NEON_CONNECTION_STRING=postgresql://neondb_owner:npg_8PVlFAR3LfrZ@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
railway variables set LOG_LEVEL=INFO

# IMPORTANT: Add your Vercel URL after deploying frontend (we'll update this later)
# For now, set localhost
railway variables set CORS_ORIGINS=http://localhost:3000
```

### Step 4: Deploy Backend

```bash
# Deploy with Railway config
railway up --config railway.backend.json
```

**Wait for deployment to complete** (2-3 minutes)

### Step 5: Get Backend URL

```bash
# Generate public domain
railway domain

# Your backend URL will be something like:
# https://physical-ai-backend-production.up.railway.app
```

**⚠️ IMPORTANT: Save this URL! You'll need it for Vercel.**

---

## 🔐 Part 2: Deploy Auth Server to Railway

### Step 1: Create New Project for Auth

```bash
# Create a new Railway project for auth server
railway init
```

**Select**:
- Create new project: "physical-ai-auth"
- Deploy now? **No**

### Step 2: Set Environment Variables for Auth

First, you need OAuth credentials. If you don't have them yet, skip this for now and deploy without OAuth.

```bash
# Required variables
railway variables set DATABASE_URL=postgresql://neondb_owner:npg_8PVlFAR3LfrZ@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
railway variables set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
railway variables set NODE_ENV=production
railway variables set PORT=3001

# CORS - Will update after Vercel deployment
railway variables set ALLOWED_ORIGINS=http://localhost:3000

# Optional: OAuth providers (add if you have credentials)
# railway variables set GOOGLE_CLIENT_ID=your_google_client_id
# railway variables set GOOGLE_CLIENT_SECRET=your_google_secret
# railway variables set GITHUB_CLIENT_ID=your_github_client_id
# railway variables set GITHUB_CLIENT_SECRET=your_github_secret
```

### Step 3: Deploy Auth Server

```bash
railway up --config railway.auth.json
```

### Step 4: Get Auth Server URL

```bash
railway domain

# Your auth URL will be something like:
# https://physical-ai-auth-production.up.railway.app
```

**⚠️ IMPORTANT: Save this URL too!**

---

## ▲ Part 3: Deploy Frontend to Vercel

### Step 1: Login to Vercel

```bash
vercel login
```

### Step 2: Deploy to Vercel

```bash
# Navigate to project root
cd /home/muhammad-faizan/Desktop/physical-ai-book1

# Deploy (first time)
vercel
```

**Answer prompts**:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name: `physical-ai-book`
- Directory: `.` (current directory)
- Override settings? **No**

### Step 3: Set Environment Variables on Vercel

```bash
# Set backend API URL (use your Railway backend URL from Part 1)
vercel env add CHATBOT_API_URL production

# When prompted, enter: https://physical-ai-backend-production.up.railway.app

# Set auth server URL (use your Railway auth URL from Part 2)
vercel env add AUTH_URL production

# When prompted, enter: https://physical-ai-auth-production.up.railway.app
```

### Step 4: Deploy to Production

```bash
vercel --prod
```

### Step 5: Get Your Vercel URL

After deployment completes, you'll get a URL like:
```
https://physical-ai-book.vercel.app
```

**⚠️ IMPORTANT: Copy this URL!**

---

## 🔄 Part 4: Update CORS Settings

Now that you have all URLs, update CORS settings:

### Update Backend CORS

```bash
# Switch to backend Railway project
railway link

# Update CORS_ORIGINS with your Vercel URLs
railway variables set CORS_ORIGINS=https://physical-ai-book.vercel.app,https://physical-ai-book-*.vercel.app

# Redeploy
railway up --config railway.backend.json
```

### Update Auth Server CORS

```bash
# Switch to auth Railway project
railway link

# Update CORS
railway variables set ALLOWED_ORIGINS=https://physical-ai-book.vercel.app,https://physical-ai-book-*.vercel.app
railway variables set APP_URL=https://physical-ai-book.vercel.app

# Redeploy
railway up --config railway.auth.json
```

---

## ✅ Part 5: Verify Deployment

### Test Backend API

```bash
# Check health endpoint
curl https://physical-ai-backend-production.up.railway.app/health

# Expected response:
# {
#   "status": "healthy",
#   "qdrant": {...},
#   "llm_api": {...},
#   "database": {...}
# }
```

### Test Auth Server

```bash
curl https://physical-ai-auth-production.up.railway.app/health

# Expected response:
# {"status": "ok"}
```

### Test Frontend

1. Open your Vercel URL in browser: `https://physical-ai-book.vercel.app`
2. Navigate to any docs page
3. Look for the chat widget
4. Try asking a question
5. Check browser console for any errors

---

## 🐛 Troubleshooting

### CORS Errors

**Error**: `Access to fetch at ... has been blocked by CORS policy`

**Solution**:
```bash
# Make sure CORS_ORIGINS includes your exact Vercel domain
railway variables set CORS_ORIGINS=https://your-actual-domain.vercel.app

# Include preview deployments
railway variables set CORS_ORIGINS=https://your-domain.vercel.app,https://your-domain-*.vercel.app
```

### Backend Not Starting

**Error**: Backend service crashes immediately

**Solution**:
```bash
# Check logs
railway logs

# Common issues:
# 1. Missing environment variables - set all required vars
# 2. Qdrant connection failed - verify QDRANT_URL and API key
# 3. Neon connection failed - verify NEON_CONNECTION_STRING
```

### Frontend Build Fails

**Error**: Build fails on Vercel

**Solution**:
```bash
# Check build locally first
npm run build

# Common issues:
# 1. Missing dependencies - run npm install
# 2. TypeScript errors - run npm run typecheck
# 3. Environment variables not set in Vercel dashboard
```

### Chat Widget Not Appearing

**Error**: No chat widget visible on docs pages

**Solutions**:
1. Check browser console for errors
2. Verify `CHATBOT_API_URL` is set correctly in Vercel
3. Verify backend is accessible from browser (check CORS)
4. Check that plugin is properly configured in `docusaurus.config.ts`

---

## 💰 Cost Breakdown

### Free Tier Limits

**Railway**:
- $5 credit per month (free)
- ~500 hours runtime
- Good for 2 services (Backend + Auth)

**Vercel**:
- Unlimited bandwidth
- 100GB free bandwidth
- ~500,000 page views/month

**Total Cost**: $0/month (until you exceed Railway's $5 credit)

---

## 🔒 Security Checklist

Before going live:

- [ ] Change all default secrets
- [ ] Use strong `BETTER_AUTH_SECRET`
- [ ] Enable HTTPS only (already default on Railway/Vercel)
- [ ] Verify CORS settings are restrictive (only your domain)
- [ ] Don't commit `.env` files to git
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting (already implemented in backend)

---

## 📱 Post-Deployment Updates

### Updating Backend Code

```bash
# Make code changes
# Commit to git
git add .
git commit -m "Update backend"
git push

# Railway auto-deploys from GitHub
# Or manually:
railway up --config railway.backend.json
```

### Updating Frontend Code

```bash
# Make code changes
# Commit to git
git add .
git commit -m "Update frontend"
git push

# Vercel auto-deploys from GitHub
# Or manually:
vercel --prod
```

---

## 🎉 Success!

Your Physical AI Book is now live with:

✅ **Frontend**: https://your-app.vercel.app
✅ **Backend API**: https://backend-xxx.railway.app
✅ **Auth Server**: https://auth-xxx.railway.app

Share your live site with students and start getting feedback! 🚀

---

## 📞 Support

If you encounter issues:

1. Check Railway logs: `railway logs`
2. Check Vercel logs: `vercel logs`
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

**Need help?** Open an issue on GitHub or check the troubleshooting section above.
