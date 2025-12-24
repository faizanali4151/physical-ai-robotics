# 🚀 DEPLOY NOW - Fastest Path

## You Need To Do 2 Manual Steps (Render Limitation)

Render doesn't have CLI deployment, so you must create services via their web UI.

---

## Step 1: Deploy Backend (10 minutes)

### Quick Setup:
1. **Open:** https://dashboard.render.com/create?type=web
2. **Connect:** GitHub repo `faizanali4151/physical-ai-robotics`
3. **Branch:** `deployment_features` (or `main` if you merged)
4. **Fill Form:**

```
Name: physical-ai-backend
Region: Oregon (or closest to you)
Root Directory: backend
Runtime: Python 3
Build Command:
  pip install --upgrade pip && pip install -r requirements.txt && python -m nltk.downloader punkt

Start Command:
  gunicorn src.main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120 --log-level info

Instance Type: Free
```

5. **Add Environment Variables** (click "Advanced" button):

```bash
PYTHON_VERSION = 3.11.0
LLM_PROVIDER = gemini
GEMINI_API_KEY = AIzaSyAkjvl47WWw_a1qVPD59j7mEiLWubUx8TU
QDRANT_URL = https://c793b077-b46d-4f37-b38b-a572f2362704.us-east-1-1.aws.cloud.qdrant.io
QDRANT_API_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.rX6vEg6XOSDtUuK9iXi3AKsP4JweBtgGHG_MNwgWVwU
NEON_CONNECTION_STRING = postgresql://neondb_owner:npg_8PVlFAR3LfrZ@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
CORS_ORIGINS = http://localhost:3000,https://physical-ai-book1.vercel.app
LOG_LEVEL = INFO
CHUNK_SIZE = 512
CHUNK_OVERLAP = 128
TOP_K_RESULTS = 5
SIMILARITY_THRESHOLD = 0.7
```

6. **Click:** "Create Web Service"
7. **Wait:** 5-10 minutes (watch logs)
8. **Copy URL:** Something like `https://physical-ai-backend-xxxx.onrender.com`

---

## Step 2: Deploy Auth Server (10 minutes)

### Quick Setup:
1. **Open:** https://dashboard.render.com/create?type=web
2. **Same GitHub repo:** `faizanali4151/physical-ai-robotics`
3. **Branch:** `deployment_features`
4. **Fill Form:**

```
Name: physical-ai-auth-server
Region: Oregon (same as backend)
Root Directory: auth-server
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Instance Type: Free
```

5. **Generate Auth Secret** (run this in your terminal):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. **Add Environment Variables:**

```bash
NODE_VERSION = 20.10.0
NODE_ENV = production
DATABASE_URL = <YOU-NEED-SEPARATE-NEON-DB-FOR-AUTH>
BETTER_AUTH_SECRET = <PASTE-GENERATED-SECRET-FROM-ABOVE>
BETTER_AUTH_URL = https://physical-ai-auth-server-xxxx.onrender.com
CORS_ORIGINS = http://localhost:3000,https://physical-ai-book1.vercel.app
GOOGLE_CLIENT_ID = <YOUR-GOOGLE-OAUTH-ID-IF-YOU-HAVE-IT>
GOOGLE_CLIENT_SECRET = <YOUR-GOOGLE-OAUTH-SECRET>
GITHUB_CLIENT_ID = <YOUR-GITHUB-OAUTH-ID-IF-YOU-HAVE-IT>
GITHUB_CLIENT_SECRET = <YOUR-GITHUB-OAUTH-SECRET>
```

**Note:** If you don't have OAuth setup, leave Google/GitHub fields empty for now.

7. **Click:** "Create Web Service"
8. **Wait:** 5-10 minutes
9. **After Deploy:** Go to Shell tab, run: `npm run db:migrate`
10. **Copy URL:** Something like `https://physical-ai-auth-server-xxxx.onrender.com`

---

## Step 3: I'll Deploy Frontend Automatically (2 minutes)

Once you have both URLs, tell me:
- Backend URL
- Auth URL

I'll run the Vercel CLI deployment automatically!

---

## Even Faster Alternative

If you already have accounts and know the drill:

### Open 2 Tabs:
- Tab 1: https://dashboard.render.com/create?type=web (Backend)
- Tab 2: https://dashboard.render.com/create?type=web (Auth)

### Fill both forms in parallel (5 minutes total)

### Tell me the URLs, I'll deploy frontend immediately!

---

## Troubleshooting

**"I don't have a separate Neon database for auth"**
- Go to https://neon.tech
- Create new project
- Database name: `authdb`
- Copy connection string
- Make sure it ends with `?sslmode=require`

**"I don't have OAuth setup"**
- Skip it for now! You can add it later
- Leave GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET empty
- The app will work without OAuth (just no login)

**"Build is failing"**
- Check the build logs in Render
- Most common: Wrong Root Directory (should be `backend` or `auth-server`)
- Second most common: Missing environment variable

**"Service won't start"**
- Check Start Command is exactly as shown above
- Check all required env vars are set
- Wait 60 seconds for cold start

---

## What Happens After

Once I have both URLs, I'll:
1. ✅ Login to Vercel automatically
2. ✅ Deploy frontend with your URLs
3. ✅ Deploy to production
4. ✅ Update your CORS (you'll need to redeploy backend/auth)
5. ✅ Test the deployment

Total time: **15-20 minutes** for everything!

---

**Ready?** Start with backend deployment now: https://dashboard.render.com/create?type=web
