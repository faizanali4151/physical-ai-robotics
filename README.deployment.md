# 🚀 Deployment Ready - Free-Tier Architecture

## Status: ✅ Ready for Deployment

All fixes have been applied to make this project deployable on **free-tier services only**.

## Quick Start Deployment

### Prerequisites
You need accounts on these **free** services:
1. [Vercel](https://vercel.com) - Frontend
2. [Render](https://render.com) - Backend + Auth
3. [Neon](https://neon.tech) - PostgreSQL
4. [Qdrant Cloud](https://cloud.qdrant.io) - Vector DB
5. [Google AI Studio](https://aistudio.google.com) - Gemini API

### Deployment Steps

1. **Read the deployment guide:**
   ```bash
   # Comprehensive guide (recommended)
   cat DEPLOYMENT.md

   # Quick reference
   cat DEPLOYMENT_SUMMARY.md
   ```

2. **Setup external services** (Qdrant, Neon, Gemini)

3. **Deploy in this order:**
   - Backend (Render)
   - Auth Server (Render)
   - Frontend (Vercel)

4. **Update CORS** with your actual Vercel URL

5. **Ingest book content** into Qdrant

**Total time:** ~45-60 minutes (first deployment)

---

## Changes Made for Deployment

### Backend (FastAPI)
- ✅ Added `gunicorn` for production WSGI server
- ✅ Fixed PORT handling (Render uses `PORT` env var)
- ✅ Made .env file optional (uses env vars in production)
- ✅ Created `backend/render.yaml` config

**Start Command:**
```bash
gunicorn src.main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120
```

### Auth Server (Node.js)
- ✅ Fixed CORS to use `CORS_ORIGINS` env var (dynamic)
- ✅ Created `auth-server/render.yaml` config

**Start Command:**
```bash
npm start
```

### Frontend (Docusaurus)
- ✅ Created `vercel.json` config
- ✅ Already uses env vars (`AUTH_URL`, `CHATBOT_API_URL`)

**Build Command:**
```bash
npm run build
```

---

## Environment Variables

See `.env.production.example` for all required environment variables.

### Backend (9 variables)
```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=<key>
QDRANT_URL=<url>
QDRANT_API_KEY=<key>
NEON_CONNECTION_STRING=<postgres-url>
CORS_ORIGINS=<vercel-url>,http://localhost:3000
LOG_LEVEL=INFO
# ... + 3 more optional
```

### Auth Server (9 variables)
```bash
DATABASE_URL=<postgres-auth-url>
BETTER_AUTH_SECRET=<32-char-random>
BETTER_AUTH_URL=<auth-server-url>
CORS_ORIGINS=<vercel-url>,http://localhost:3000
# ... + OAuth credentials
```

### Frontend (2 variables)
```bash
AUTH_URL=<auth-server-url>
CHATBOT_API_URL=<backend-url>
```

---

## Architecture

```
Vercel (Frontend)
  ├── Docusaurus 3.9.2
  └── React 19.0.0
        │
        ├─────> Render (Auth Server)
        │         ├── Node.js 20
        │         ├── Express + Better Auth
        │         └── Neon Postgres (auth_db)
        │
        └─────> Render (Backend)
                  ├── Python 3.11
                  ├── FastAPI + Gunicorn
                  ├── Qdrant Cloud (vectors)
                  ├── Neon Postgres (history)
                  └── Gemini API (LLM)
```

---

## Free-Tier Limits

| Service | Limit | Usage |
|---------|-------|-------|
| Render (Backend) | 512MB RAM | ✅ Single worker |
| Render (Auth) | 512MB RAM | ✅ Lightweight |
| Render (Both) | Spin down after 15min | ⚠️ 30-60s cold start |
| Vercel | 100GB bandwidth | ✅ Static files |
| Neon | 512MB × 2 projects | ✅ Two DBs |
| Qdrant | 1GB storage | ✅ 171 chunks |
| Gemini | 15 req/min | ✅ With retry |

**Total Cost: $0/month** 🎉

---

## Local Development

For local development, use the existing scripts:

```bash
# Start all services (local)
./start_all.sh

# Or manually:
cd backend && python src/main.py  # Port 8000
cd auth-server && npm run dev     # Port 3001
npm start                          # Port 3000
```

---

## Files Added/Modified

### Created
- `backend/render.yaml` - Render deployment config
- `auth-server/render.yaml` - Render deployment config
- `vercel.json` - Vercel deployment config
- `.env.production.example` - Environment template
- `DEPLOYMENT.md` - Full deployment guide (comprehensive)
- `DEPLOYMENT_SUMMARY.md` - Quick reference
- `README.deployment.md` - This file

### Modified
- `backend/requirements.txt` - Added gunicorn
- `backend/src/config.py` - PORT handling, optional .env
- `auth-server/src/index.ts` - Dynamic CORS

---

## Testing Deployment

After deploying, test this flow:

1. ✅ Visit your Vercel URL
2. ✅ Click login (OAuth should work)
3. ✅ Navigate to any chapter
4. ✅ Open chatbot widget (bottom right)
5. ✅ Send message: "What is Physical AI?"
6. ✅ Verify response is from book content
7. ✅ Check conversation persists on refresh

---

## Troubleshooting

### Backend 502 Error
- Wait 60 seconds for cold start
- Check Render logs for errors
- Verify all env vars are set

### CORS Errors
- Add Vercel URL to `CORS_ORIGINS`
- Remove trailing slashes
- Redeploy backend and auth server

### Chatbot Not Responding
- Check `/health` endpoint on backend
- Verify Qdrant has data (171 points)
- Check Network tab for API errors

**Full troubleshooting guide:** See `DEPLOYMENT.md` section "Common Issues & Solutions"

---

## Next Steps

1. **Deploy now:** Follow `DEPLOYMENT.md`
2. **Monitor usage:** Stay within free tiers
3. **Test thoroughly:** All features working
4. **Document URLs:** Save your deployed URLs
5. **Setup monitoring:** Optional but recommended

---

## Support

- 📖 **Full Guide:** `DEPLOYMENT.md`
- 📋 **Quick Ref:** `DEPLOYMENT_SUMMARY.md`
- 🔧 **Changes:** `git diff` to see exact modifications

---

## Success Criteria

Your deployment is successful when:
- ✅ Frontend loads on Vercel
- ✅ Can log in with OAuth
- ✅ Chatbot responds to queries
- ✅ Responses are based on book content
- ✅ Conversation history persists
- ✅ No console errors
- ✅ All within free tiers

---

**Ready to deploy?** Start with `DEPLOYMENT.md` 🚀
