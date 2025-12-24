# Deployment Quick Reference

## Changes Made for Free-Tier Deployment

### 1. Backend Changes (FastAPI)

**Files Modified:**
- `backend/requirements.txt` - Added `gunicorn==21.2.0`
- `backend/src/config.py` - Fixed PORT handling for Render (line 50)
- `backend/src/config.py` - Made .env file optional (line 36-38)

**Files Created:**
- `backend/render.yaml` - Render deployment configuration

**Key Fixes:**
- ✅ Uses `PORT` environment variable (Render requirement)
- ✅ Fallback to local .env file for development
- ✅ Gunicorn + Uvicorn workers for production
- ✅ Single worker (512MB RAM limit)
- ✅ 120-second timeout for cold starts

---

### 2. Auth Server Changes (Node.js)

**Files Modified:**
- `auth-server/src/index.ts` - Dynamic CORS from env var (line 15-28)

**Files Created:**
- `auth-server/render.yaml` - Render deployment configuration

**Key Fixes:**
- ✅ CORS origins from `CORS_ORIGINS` environment variable
- ✅ PORT already configurable via env (line 11)
- ✅ Proper production build workflow

---

### 3. Frontend Changes (Docusaurus)

**Files Created:**
- `vercel.json` - Vercel deployment configuration
- `.env.production.example` - Production environment template

**Already Configured:**
- ✅ Environment variables in `docusaurus.config.ts`
- ✅ Custom fields for API URLs
- ✅ Static site generation compatible with Vercel

---

## Start Commands

### Backend (Render)
```bash
gunicorn src.main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120 --log-level info
```

### Auth Server (Render)
```bash
npm start
```

### Frontend (Vercel)
```bash
npm run build
```
Output directory: `build`

---

## Environment Variables Required

### Backend (Render)
```bash
# Required
LLM_PROVIDER=gemini
GEMINI_API_KEY=<key>
QDRANT_URL=<url>
QDRANT_API_KEY=<key>
NEON_CONNECTION_STRING=<postgres-url>
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000

# Optional (have defaults)
LOG_LEVEL=INFO
CHUNK_SIZE=512
CHUNK_OVERLAP=128
TOP_K_RESULTS=5
SIMILARITY_THRESHOLD=0.7
```

### Auth Server (Render)
```bash
# Required
DATABASE_URL=<postgres-auth-url>
BETTER_AUTH_SECRET=<32-char-random-string>
BETTER_AUTH_URL=https://your-auth-server.onrender.com
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000

# OAuth (Optional)
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
GITHUB_CLIENT_ID=<id>
GITHUB_CLIENT_SECRET=<secret>

# Node
NODE_ENV=production
```

### Frontend (Vercel)
```bash
AUTH_URL=https://your-auth-server.onrender.com
CHATBOT_API_URL=https://your-backend.onrender.com
```

---

## Deployment Order

1. **Setup External Services First:**
   - Qdrant Cloud (vector DB)
   - Neon Postgres (2 databases)
   - Google Gemini API key
   - OAuth apps (Google, GitHub)

2. **Deploy Backend (Render):**
   - Create web service from `backend/` directory
   - Set environment variables
   - Deploy and verify `/health` endpoint
   - Run `python src/cli/ingest.py` to load book content

3. **Deploy Auth Server (Render):**
   - Create web service from `auth-server/` directory
   - Set environment variables
   - Deploy and verify `/health` endpoint
   - Run `npm run db:migrate` in Render shell

4. **Deploy Frontend (Vercel):**
   - Import repository
   - Set environment variables
   - Deploy
   - Verify app loads

5. **Update CORS:**
   - Update both Render services with Vercel URL
   - Update OAuth redirect URIs

---

## Testing Checklist

After deployment, test in order:

### Backend
- [ ] `https://backend-url.onrender.com/` returns API info
- [ ] `https://backend-url.onrender.com/health` returns healthy status
- [ ] No CORS errors in browser console when accessing from Vercel

### Auth Server
- [ ] `https://auth-url.onrender.com/health` returns healthy status
- [ ] Can navigate to OAuth routes without 404
- [ ] No CORS errors in browser console

### Frontend
- [ ] Homepage loads
- [ ] Can navigate to chapters
- [ ] Can log in via Google/GitHub
- [ ] Chatbot widget appears
- [ ] Can send messages and receive responses
- [ ] Conversation persists across page refreshes

---

## Common Deployment Failures & Fixes

### Backend Won't Start
```
Error: Could not import 'backend.src.main:app'
```
**Fix:** Check `startCommand` uses `src.main:app` (not `backend.src.main:app`)

### Auth Server Build Fails
```
Error: Cannot find module 'typescript'
```
**Fix:** Ensure `npm install` runs before `npm run build`

### Frontend Build Fails
```
Error: Cannot find module './frontend/docusaurus-plugin-rag-chatbot'
```
**Fix:** Ensure build runs from project root, not subdirectory

### CORS Errors
```
Access to fetch at 'https://backend...' from origin 'https://app...' has been blocked
```
**Fix:** Add Vercel URL to `CORS_ORIGINS` in both backend and auth server

### Database Connection Fails
```
Error: connection to server failed: SSL required
```
**Fix:** Add `?sslmode=require` to Neon connection strings

---

## Free-Tier Limits Summary

| Service | Limit | Impact |
|---------|-------|--------|
| Render | 512MB RAM | Use 1 worker only |
| Render | Spins down after 15min | 30-60s cold start |
| Vercel | 100GB bandwidth | Sufficient for most use |
| Neon | 512MB storage | ~100K conversations |
| Qdrant | 1GB vectors | ~171 book chunks (current) |
| Gemini | 15 req/min | Add retry logic |

---

## Files Changed Summary

```
Modified:
  backend/requirements.txt                    (+1 line: gunicorn)
  backend/src/config.py                       (PORT handling, optional .env)
  auth-server/src/index.ts                    (dynamic CORS)

Created:
  backend/render.yaml                         (Render config)
  auth-server/render.yaml                     (Render config)
  vercel.json                                 (Vercel config)
  .env.production.example                     (Environment template)
  DEPLOYMENT.md                               (Full deployment guide)
  DEPLOYMENT_SUMMARY.md                       (This file)
```

---

## Next Steps After Deployment

1. **Monitor first week:**
   - Check Render logs for errors
   - Monitor Vercel bandwidth usage
   - Check Neon connection count

2. **Optimize if needed:**
   - Reduce `CHUNK_SIZE` if memory issues
   - Reduce `TOP_K_RESULTS` if slow responses
   - Add caching if hitting rate limits

3. **Security audit:**
   - Verify all secrets are in env vars
   - Check CORS is not `*`
   - Ensure SSL/TLS on all connections

4. **Documentation:**
   - Document your actual deployment URLs
   - Save all environment variables securely
   - Create runbook for common issues

---

## Rollback Plan

If deployment fails, you can roll back:

**Code Changes:**
```bash
git checkout <previous-commit>
git push --force
```

**Services:**
- Render: Dashboard > Service > Events > Rollback
- Vercel: Dashboard > Deployments > Promote Previous

**Databases:**
- Neon: Point-in-time restore (paid) or restore from backup
- Qdrant: Re-run ingest script

---

## Support Contacts

- **Render Issues:** https://render.com/docs/troubleshooting
- **Vercel Issues:** https://vercel.com/docs/support
- **Neon Issues:** https://neon.tech/docs/introduction
- **Qdrant Issues:** https://qdrant.tech/documentation/

---

**Deployment Status:** ✅ All fixes applied, ready for deployment

**Estimated Total Deployment Time:** 45-60 minutes (first time)

**Cost:** $0/month (all free tiers)
