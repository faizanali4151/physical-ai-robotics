# 🚀 Quick Start Deployment

Deploy your Physical AI Book in **4 commands**.

---

## Prerequisites (5 minutes)

1. **Create accounts** (all free):
   - Render: https://render.com
   - Vercel: https://vercel.com
   - Qdrant: https://cloud.qdrant.io
   - Neon: https://neon.tech

2. **Get API keys**:
   - Gemini: https://aistudio.google.com/apikey
   - Qdrant: Create cluster, copy URL + API key
   - Neon: Create 2 databases, copy connection strings

3. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

---

## Deploy (3 commands)

### 1. Deploy Backend (Render)
```bash
./deploy-backend.sh
```
- Generates `.env.render.backend`
- Follow prompts to deploy via Render UI
- Test: `curl https://your-backend.onrender.com/health`

### 2. Deploy Auth Server (Render)
```bash
./deploy-auth.sh
```
- Generates `.env.render.auth` with random secret
- Follow prompts to deploy via Render UI
- Test: `curl https://your-auth.onrender.com/health`

### 3. Deploy Frontend (Vercel) - Fully Automated! ✨
```bash
./deploy-frontend.sh
```
- **Automatically deploys** with Vercel CLI
- No manual steps needed
- Opens browser when done

---

## Or Deploy Everything at Once

```bash
./deploy-all.sh
```

Guides you through all 3 deployments step-by-step.

---

## Post-Deployment (2 minutes)

### Update CORS in Both Services

**Backend:**
```
Render Dashboard > Backend Service > Environment
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
Save & Redeploy
```

**Auth Server:**
```
Render Dashboard > Auth Service > Environment
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
Save & Redeploy
```

### Ingest Book Content (One-Time)

```bash
cd backend
python src/cli/ingest.py
```

Or in Render Shell:
```
Dashboard > Backend Service > Shell
python src/cli/ingest.py
```

---

## Test Your Deployment

Visit: `https://your-app.vercel.app`

✅ Homepage loads
✅ Log in works
✅ Chatbot responds
✅ Conversation persists

---

## Deployment URLs

All URLs saved in: `.deployment-urls.txt`

---

## Need Help?

- **Full Guide:** `DEPLOYMENT.md` (comprehensive)
- **CLI Guide:** `DEPLOYMENT_CLI.md` (detailed CLI usage)
- **Quick Ref:** `DEPLOYMENT_SUMMARY.md` (troubleshooting)

---

## Time Estimate

- Prerequisites: 5-10 minutes
- Backend deploy: 10-15 minutes
- Auth deploy: 10-15 minutes
- Frontend deploy: 5 minutes (automated!)
- CORS update: 2 minutes
- Testing: 5 minutes

**Total: 40-50 minutes** ⚡

---

## Cost

**$0/month** (all free tiers) 🎉

---

**Ready?** Run `./deploy-all.sh` and follow the prompts! 🚀
