# 🚀 Complete Deployment Guide - Physical AI Book with RAG Chatbot

## Overview
This guide will help you deploy the complete stack:
- **Backend API**: Render (free tier)
- **Frontend**: Vercel (free tier)
- **Auth Server**: Render (free tier) or integrate with backend
- **Databases**: Qdrant Cloud (already configured) + Neon Postgres (already configured)

---

## 📋 Prerequisites

✅ **Already Configured:**
- Python 3.11+ installed
- Node.js 20+ installed
- Vercel CLI installed
- Git repository initialized
- Environment variables configured in `.env` files
- Book content ingested (668 KB in `backend/data/ingested_chunks.json`)
- Qdrant cluster created and configured
- Neon Postgres database created
- OAuth credentials obtained (Google, GitHub)

✅ **What You Need:**
- [ ] Render account (free): https://render.com
- [ ] Vercel account (free): https://vercel.com
- [ ] GitHub repository (for deployment triggers)

---

## 🗂️ Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER (Browser)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│         VERCEL FRONTEND (Docusaurus + React)                 │
│         URL: https://physical-ai-book1.vercel.app            │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Render    │ │   Qdrant    │ │    Neon     │
│   Backend   │ │   Vector    │ │  Postgres   │
│   FastAPI   │ │   Database  │ │  Database   │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## 🎯 Step-by-Step Deployment

### **Phase 1: Verify Database Setup**

#### 1.1 Test Qdrant Connection
```bash
cd /home/muhammad-faizan/Desktop/physical-ai-book1
python3 -c "
from backend.src.services.qdrant_service import QdrantService
qs = QdrantService()
qs.connect()
print('✅ Qdrant connected successfully')
"
```

#### 1.2 Test Neon Postgres Connection
```bash
python3 -c "
from backend.src.services.db_service import DBService
db = DBService()
db.connect()
print('✅ Neon Postgres connected successfully')
"
```

#### 1.3 Verify Embeddings (Optional - Run if needed)
```bash
# Check if embeddings already exist in Qdrant
cd backend
python3 -c "
from src.services.qdrant_service import QdrantService
qs = QdrantService()
qs.connect()
collection_info = qs.client.get_collection('physical_ai_book_chunks')
print(f'✅ Collection has {collection_info.points_count} embedded chunks')
"
```

If embeddings are missing, run:
```bash
./scripts/embed-book.sh
```

---

### **Phase 2: Deploy Backend to Render**

#### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize GitHub access

#### 2.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `physical-ai-book1`
3. Configure service:
   - **Name**: `physical-ai-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main` or `002-rag-chatbot`
   - **Root Directory**: Leave blank
   - **Runtime**: Python 3
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

#### 2.3 Add Environment Variables on Render
Go to **Environment** tab and add:

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
BACKEND_PORT=8000
```

#### 2.4 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Copy the service URL (e.g., `https://physical-ai-backend.onrender.com`)

#### 2.5 Test Backend API
```bash
# Replace with your actual Render URL
BACKEND_URL="https://physical-ai-backend.onrender.com"

# Test health endpoint
curl $BACKEND_URL/health

# Expected response:
# {"status":"healthy","services":{"qdrant":"connected","llm":"ready","database":"connected"}}
```

---

### **Phase 3: Deploy Auth Server to Render (Optional)**

**Note**: Auth server can be deployed separately or integrated into main backend.

#### Option A: Separate Auth Service (Recommended)
1. Create another Web Service on Render
   - **Name**: `physical-ai-auth`
   - **Build Command**: `cd auth-server && npm install`
   - **Start Command**: `cd auth-server && npm start`
   - **Environment Variables**:
     ```bash
     DATABASE_URL=postgresql://neondb_owner:npg_8PVlFAR3LfrZ@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
     BETTER_AUTH_SECRET=4e96b823853baf74a79f334d40bbe78f7e9429ce954334f6496bdb879a4122b8
     PORT=3001
     NODE_ENV=production
     APP_URL=https://physical-ai-book1.vercel.app
     AUTH_URL=https://physical-ai-auth.onrender.com
     GOOGLE_CLIENT_ID=1004242255254-jlespd5c6ajshrtredear4rjlvt80qgn.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=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
     GITHUB_CLIENT_ID=Ov23liJaZbEmsgqAQeUj
     GITHUB_CLIENT_SECRET=6b494173536d9474a1a387bdadbdaa2f31b1e212
     ALLOWED_ORIGINS=https://physical-ai-book1.vercel.app
     ```

#### Option B: Integrate Auth into Backend
Skip separate deployment; auth will be handled via frontend callbacks.

---

### **Phase 4: Configure Frontend for Production**

#### 4.1 Update OAuth Redirect URIs
1. **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
   - Edit OAuth 2.0 Client ID
   - Add Authorized Redirect URIs:
     - `https://physical-ai-book1.vercel.app/auth/callback/google`
     - `https://physical-ai-auth.onrender.com/auth/callback/google` (if using separate auth)

2. **GitHub Developer Settings**: https://github.com/settings/developers
   - Edit OAuth App
   - Update Authorization callback URL:
     - `https://physical-ai-book1.vercel.app/auth/callback/github`

#### 4.2 Create Production Environment File
```bash
cat > /home/muhammad-faizan/Desktop/physical-ai-book1/.env.production << 'EOF'
# Production environment variables for Vercel
CHATBOT_API_URL=https://physical-ai-backend.onrender.com
AUTH_URL=https://physical-ai-auth.onrender.com
NODE_ENV=production
EOF
```

---

### **Phase 5: Deploy Frontend to Vercel**

#### 5.1 Login to Vercel CLI
```bash
cd /home/muhammad-faizan/Desktop/physical-ai-book1
vercel login
```

#### 5.2 Link Project to Vercel
```bash
vercel link
# Answer prompts:
# - Set up and deploy "~/Desktop/physical-ai-book1"? Yes
# - Which scope? (Your account)
# - Link to existing project? No
# - What's your project's name? physical-ai-book1
# - In which directory is your code located? ./
```

#### 5.3 Configure Vercel Environment Variables
```bash
# Add environment variables via CLI or dashboard
vercel env add CHATBOT_API_URL production
# Enter: https://physical-ai-backend.onrender.com

vercel env add AUTH_URL production
# Enter: https://physical-ai-auth.onrender.com

vercel env add NODE_ENV production
# Enter: production
```

Or via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select project: `physical-ai-book1`
3. Settings → Environment Variables
4. Add:
   - `CHATBOT_API_URL` = `https://physical-ai-backend.onrender.com`
   - `AUTH_URL` = `https://physical-ai-auth.onrender.com`

#### 5.4 Build and Deploy to Vercel
```bash
# Test build locally first
npm install
npm run build

# Deploy to production
vercel --prod
```

Expected output:
```
✔  Preview: https://physical-ai-book1-xyz.vercel.app
✔  Production: https://physical-ai-book1.vercel.app
```

---

### **Phase 6: Post-Deployment Configuration**

#### 6.1 Update Backend CORS
Update CORS_ORIGINS on Render backend to include Vercel URL:
```
CORS_ORIGINS=https://physical-ai-book1.vercel.app,https://physical-ai-backend.onrender.com
```

#### 6.2 Test End-to-End Flow

**Test 1: Frontend Loads**
```bash
curl https://physical-ai-book1.vercel.app
# Should return HTML with status 200
```

**Test 2: Backend API Connection**
```bash
curl https://physical-ai-backend.onrender.com/health
# Should return: {"status":"healthy",...}
```

**Test 3: RAG Query** (from browser console or curl)
```bash
curl -X POST https://physical-ai-backend.onrender.com/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is Physical AI?",
    "session_id": "test-session-123"
  }'
```

**Test 4: OAuth Login**
1. Visit: https://physical-ai-book1.vercel.app
2. Click login button
3. Select Google/GitHub
4. Verify redirect and successful authentication

**Test 5: Chatbot Widget**
1. Visit any chapter page
2. Open chatbot widget (bottom-right)
3. Ask: "What is the Zero Moment Point?"
4. Verify:
   - Response is generated
   - Source citations appear
   - Message history persists

**Test 6: Selected-Text Query**
1. Highlight text on any page
2. Right-click → "Ask about this"
3. Enter question in chatbot
4. Verify context-aware response

---

## 🔧 Troubleshooting

### Issue: "CORS error" in browser console
**Solution**: Update `CORS_ORIGINS` on Render backend to include Vercel URL.

### Issue: "Cannot connect to Qdrant"
**Solution**:
- Verify `QDRANT_URL` and `QDRANT_API_KEY` are correct
- Check Qdrant cluster status: https://cloud.qdrant.io
- Test connection locally first

### Issue: "Database connection failed"
**Solution**:
- Verify `NEON_CONNECTION_STRING` is correct
- Check Neon project status: https://console.neon.tech
- Ensure SSL mode is enabled: `sslmode=require`

### Issue: "LLM API rate limit exceeded"
**Solution**:
- Gemini free tier: 15 RPM, 1M tokens/month
- Wait or upgrade to paid tier
- Alternative: Switch to ChatKit in production

### Issue: "OAuth redirect mismatch"
**Solution**:
- Verify redirect URIs in Google Cloud Console and GitHub settings
- Must match exactly: `https://physical-ai-book1.vercel.app/auth/callback/{provider}`

### Issue: "Chatbot not loading"
**Solution**:
- Check browser console for errors
- Verify `CHATBOT_API_URL` environment variable
- Test backend `/health` endpoint
- Check network tab for failed requests

### Issue: "Render backend sleeping (cold start)"
**Solution**:
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Keep-alive service: https://uptimerobot.com (free)
- Or upgrade to paid Render plan

---

## 📊 Post-Deployment Monitoring

### Set Up Monitoring (Optional)

**Render Metrics**:
- View logs: Render Dashboard → Service → Logs
- Monitor CPU/Memory: Render Dashboard → Metrics

**Vercel Analytics**:
- Enable: Vercel Dashboard → Analytics
- Track page views, performance, errors

**Uptime Monitoring**:
```bash
# Use UptimeRobot (free) to ping backend every 5 minutes
# This prevents cold starts on Render free tier
# Add monitors for:
# - https://physical-ai-backend.onrender.com/health
# - https://physical-ai-book1.vercel.app
```

---

## 🎉 Deployment Complete!

Your application is now live at:
- **Frontend**: https://physical-ai-book1.vercel.app
- **Backend API**: https://physical-ai-backend.onrender.com
- **Auth Server**: https://physical-ai-auth.onrender.com

### Next Steps:
1. ✅ Test all features thoroughly
2. ✅ Monitor logs for errors
3. ✅ Set up uptime monitoring
4. ✅ Enable Vercel analytics
5. ✅ Create backup of environment variables
6. ✅ Document custom domain setup (optional)

---

## 🚀 Quick Commands Reference

### Local Development
```bash
./scripts/dev.sh                    # Start all services locally
```

### Update Backend
```bash
git push origin main                # Render auto-deploys from main branch
```

### Update Frontend
```bash
vercel --prod                       # Deploy to Vercel production
```

### View Logs
```bash
vercel logs                         # Frontend logs
# Backend logs: Render Dashboard → Logs
```

### Rollback Deployment
```bash
vercel rollback                     # Rollback frontend
# Backend rollback: Render Dashboard → Deployments → Redeploy previous
```

---

## 📞 Support

- **Deployment Issues**: Check Render/Vercel status pages
- **Backend Issues**: Check backend logs on Render
- **Frontend Issues**: Check Vercel logs and browser console
- **Database Issues**: Check Qdrant/Neon dashboards

---

**Deployment Date**: 2025-12-17
**Version**: 1.0.0
**Status**: Production Ready ✅
