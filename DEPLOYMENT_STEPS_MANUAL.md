# 🚀 Manual Deployment Steps (Recommended)

Railway CLI se kuch issues aa rahi hain service linking mein. **Railway Dashboard** use karna zyada reliable hai.

---

## ✅ Step-by-Step Railway Backend Deployment

### 1. Open Railway Dashboard
```
https://railway.com/project/d9096bec-6226-418f-9bda-39ee9188cb2a
```

### 2. Create New Service
- Click "+ New" button
- Select "GitHub Repo"
- Connect your GitHub account (if not already)
- Select repository: `physical-ai-book1`
- Click "Deploy"

### 3. Configure Service Settings

**Root Directory:** Leave empty (project root)

**Build Command:**
```bash
pip install -r backend/requirements.txt
```

**Start Command:**
```bash
cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

### 4. Add Environment Variables

Go to **Settings > Variables** and add:

```
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyC2EbV8wTwd20T_SgcCByEfHP3O8v11gq8
QDRANT_URL=https://c793b077-b46d-4f37-b38b-a572f2362704.us-east-1-1.aws.cloud.qdrant.io
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.rX6vEg6XOSDtUuK9iXi3AKsP4JweBtgGHG_MNwgWVwU
NEON_CONNECTION_STRING=postgresql://neondb_owner:npg_8PVlFAR3LfrZ@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000
```

### 5. Generate Public Domain
- Go to **Settings > Networking**
- Click "Generate Domain"
- Copy the generated URL (e.g., `https://physical-ai-backend-production.up.railway.app`)

### 6. Wait for Deployment
- Check **Deployments** tab
- Wait for "Success" status
- Check logs for any errors

---

## ✅ Railway Auth Server Deployment

### 1. Create Another Service in Same Project
- Click "+ New" in the same project
- Select "GitHub Repo"
- Select same repository
- Click "Deploy"

### 2. Configure Root Directory
**IMPORTANT:** Set root directory to `auth-server`

**Settings > General > Root Directory:**
```
auth-server
```

### 3. Commands

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### 4. Add Environment Variables

```
DATABASE_URL=postgresql://neondb_owner:npg_8PVlFAR3LfrZ@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
```

Generate secret:
```bash
openssl rand -base64 32
```
Add as:
```
BETTER_AUTH_SECRET=<generated-secret>
```

### 5. Generate Public Domain
- Settings > Networking > Generate Domain
- Copy URL

---

## ▲ Vercel Frontend Deployment

This can still be done via CLI:

```bash
# From project root
vercel

# Follow prompts:
# - Project name: physical-ai-book
# - Directory: . (current)
# - Override settings? No

# After first deployment, set env vars:
vercel env add CHATBOT_API_URL production
# Enter your Railway backend URL

vercel env add AUTH_URL production
# Enter your Railway auth URL

# Deploy to production:
vercel --prod
```

---

## 🔄 Update CORS After All Deployments

Once you have all URLs:

### Update Backend CORS on Railway:
```
CORS_ORIGINS=https://your-vercel-app.vercel.app,https://your-vercel-app-*.vercel.app
```

### Update Auth CORS on Railway:
```
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
APP_URL=https://your-vercel-app.vercel.app
```

### Redeploy Both Services
Click "Redeploy" in Railway dashboard after updating variables.

---

## ✅ Verification

### Backend Health Check:
```bash
curl https://your-backend.railway.app/health
```

### Auth Health Check:
```bash
curl https://your-auth.railway.app/health
```

### Frontend:
Open `https://your-app.vercel.app` in browser

---

Yeh approach zyada reliable hai! 🚀
