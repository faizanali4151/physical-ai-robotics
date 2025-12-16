# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment Status

**System Ready:**
- ✅ Qdrant: 333 embedded chunks (768-dimensional)
- ✅ Neon Postgres: Connected and configured
- ✅ Book content: 668 KB ingested
- ✅ Environment variables: Configured
- ✅ OAuth credentials: Google + GitHub ready

---

## 📋 3-Step Deployment Process

### **Step 1: Deploy Backend to Render** (10 minutes)

1. **Go to**: https://render.com/dashboard
2. **Click**: "New +" → "Web Service"
3. **Connect**: Your GitHub repository `physical-ai-book1`
4. **Configure**:
   ```
   Name: physical-ai-backend
   Branch: main (or 002-rag-chatbot)
   Root Directory: (leave blank)
   Runtime: Python 3
   Build Command: cd backend && pip install -r requirements.txt
   Start Command: cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

5. **Add Environment Variables** (copy from `backend/.env`):
   ```bash
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSyAqYo7GfxDcWa09MO2LdsNKO2hldztFX30
   QDRANT_URL=https://c793b077-b46d-4f37-b38b-a572f2362704.us-east-1-1.aws.cloud.qdrant.io
   QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.rX6vEg6XOSDtUuK9iXi3AKsP4JweBtgGHG_MNwgWVwU
   NEON_CONNECTION_STRING=postgresql://neondb_owner:npg_8PVlFAR3LfrZ@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   CORS_ORIGINS=https://physical-ai-book1.vercel.app,http://localhost:3000
   LOG_LEVEL=INFO
   CHUNK_SIZE=512
   CHUNK_OVERLAP=128
   TOP_K_RESULTS=5
   SIMILARITY_THRESHOLD=0.7
   ```

6. **Click**: "Create Web Service"
7. **Wait**: 5-10 minutes for deployment
8. **Copy**: Your backend URL (e.g., `https://physical-ai-backend.onrender.com`)
9. **Test**: Visit `https://physical-ai-backend.onrender.com/health`

---

### **Step 2: Deploy Frontend to Vercel** (5 minutes)

**Automated Script**:
```bash
cd /home/muhammad-faizan/Desktop/physical-ai-book1
./scripts/deploy-production.sh
```

**Or Manual**:
```bash
# Build frontend
npm install
npm run build

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add CHATBOT_API_URL production
# Enter your Render backend URL: https://physical-ai-backend.onrender.com

vercel env add AUTH_URL production
# Enter your Render backend URL: https://physical-ai-backend.onrender.com
```

---

### **Step 3: Post-Deployment Configuration** (5 minutes)

#### 3.1 Update Backend CORS
1. Go to Render Dashboard → `physical-ai-backend` → Environment
2. Update `CORS_ORIGINS` to:
   ```
   https://physical-ai-book1.vercel.app,https://physical-ai-backend.onrender.com
   ```
3. Save and redeploy

#### 3.2 Update OAuth Redirect URIs

**Google Cloud Console**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit OAuth 2.0 Client ID: `1004242255254-jlespd5c6ajshrtredear4rjlvt80qgn.apps.googleusercontent.com`
3. Add Authorized Redirect URI:
   ```
   https://physical-ai-book1.vercel.app/auth/callback/google
   ```

**GitHub Developer Settings**:
1. Go to: https://github.com/settings/developers
2. Edit OAuth App: `Ov23liJaZbEmsgqAQeUj`
3. Update Authorization callback URL:
   ```
   https://physical-ai-book1.vercel.app/auth/callback/github
   ```

---

## 🧪 Verification Tests

### Test 1: Frontend Accessibility
```bash
curl -I https://physical-ai-book1.vercel.app
# Expected: HTTP/2 200
```

### Test 2: Backend Health
```bash
curl https://physical-ai-backend.onrender.com/health
# Expected: {"status":"healthy","services":{"qdrant":"connected","llm":"ready","database":"connected"}}
```

### Test 3: RAG Query
```bash
curl -X POST https://physical-ai-backend.onrender.com/query \
  -H "Content-Type: application/json" \
  -d '{"query":"What is Physical AI?","session_id":"test-123"}'
# Expected: JSON response with answer and sources
```

### Test 4: Manual Browser Tests
1. ✅ Visit https://physical-ai-book1.vercel.app
2. ✅ Open chatbot widget (bottom-right)
3. ✅ Ask: "What is the Zero Moment Point?"
4. ✅ Verify response with source citations
5. ✅ Test OAuth login (Google/GitHub)
6. ✅ Highlight text and ask context-specific question
7. ✅ Check conversation history persists

---

## 🚨 Common Issues & Fixes

### Backend sleeping (Render free tier)
**Issue**: First request takes 30-60 seconds after 15 min inactivity
**Fix**: Use UptimeRobot (free) to ping `/health` every 5 minutes

### CORS errors
**Issue**: Frontend can't reach backend
**Fix**: Update `CORS_ORIGINS` on Render to include Vercel URL

### OAuth redirect mismatch
**Issue**: "Redirect URI mismatch" error
**Fix**: Verify redirect URIs in Google/GitHub match exactly

### Embeddings missing
**Issue**: Chatbot returns "No relevant information found"
**Fix**: Already loaded! 333 chunks ready. If needed: `./scripts/embed-book.sh`

---

## 📊 Deployment URLs

After deployment, your URLs will be:
- **Frontend**: https://physical-ai-book1.vercel.app
- **Backend**: https://physical-ai-backend.onrender.com
- **Health Check**: https://physical-ai-backend.onrender.com/health

---

## 📚 Resources

- **Full Guide**: See `DEPLOYMENT_GUIDE.md`
- **Auto Script**: Run `./scripts/deploy-production.sh`
- **Test Script**: Run `cd backend && python3 test_connections.py`

---

**Estimated Total Time**: 20 minutes
**Cost**: $0 (All free tiers)
**Status**: ✅ Ready to deploy
