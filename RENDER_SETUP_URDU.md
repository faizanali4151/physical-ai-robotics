# 🚀 Render Setup - Step by Step (Urdu/English)

## Pehle ye check karo:

✅ **GitHub Code:** Push ho gaya hai (Done!)
✅ **Render Account:** Agar nahi hai to bana lo: https://render.com/signup

---

## Step 1: Backend Deploy Karo (10 minutes)

### 1️⃣ Browser mein ye link kholo:
```
https://dashboard.render.com
```

### 2️⃣ Click karo: **"New +"** button (top right) → **"Web Service"**

### 3️⃣ GitHub Connect karo:
- Select repository: **faizanali4151/physical-ai-robotics**
- Branch: **deployment_features** (ya **main** agar merge kar diya)
- Click: **"Connect"**

### 4️⃣ Form Fill Karo (exactly aise):

**Name:**
```
physical-ai-backend
```

**Region:**
```
Oregon (US West) ya jo tumhare nazdeek ho
```

**Root Directory:**
```
backend
```

**Runtime:**
```
Python 3
```

**Build Command** (scroll down, expand "Advanced"):
```
pip install --upgrade pip && pip install -r requirements.txt && python -m nltk.downloader punkt
```

**Start Command:**
```
gunicorn src.main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120 --log-level info
```

**Instance Type:**
```
Free (select karo!)
```

### 5️⃣ Environment Variables Add Karo:

Click **"Add Environment Variable"** aur ye **10 variables** add karo:

```bash
PYTHON_VERSION
3.11.0

LLM_PROVIDER
gemini

GEMINI_API_KEY
AIzaSyAkjvl47WWw_a1qVPD59j7mEiLWubUx8TU

QDRANT_URL
https://c793b077-b46d-4f37-b38b-a572f2362704.us-east-1-1.aws.cloud.qdrant.io

QDRANT_API_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.rX6vEg6XOSDtUuK9iXi3AKsP4JweBtgGHG_MNwgWVwU

NEON_CONNECTION_STRING
postgresql://neondb_owner:npg_8PVlFAR3LfrZ@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

CORS_ORIGINS
http://localhost:3000,https://physical-ai-book1.vercel.app

LOG_LEVEL
INFO

CHUNK_SIZE
512

CHUNK_OVERLAP
128

TOP_K_RESULTS
5

SIMILARITY_THRESHOLD
0.7
```

### 6️⃣ Click karo: **"Create Web Service"**

### 7️⃣ Wait karo: 5-10 minutes
- Logs dekhte raho
- Green tick aaye to success!

### 8️⃣ URL Copy karo:
- Top pe dikhega: `https://physical-ai-backend-xxxxx.onrender.com`
- **Is URL ko note kar lo!**

### 9️⃣ Test karo:
Browser mein kholo:
```
https://physical-ai-backend-xxxxx.onrender.com/health
```

Agar `{"status":"healthy"}` dikhe to perfect! ✅

---

## Step 2: Auth Server Deploy Karo (10 minutes)

### 1️⃣ Pehle Secret Generate Karo:

Apne terminal mein ye command run karo:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output aayega kuch aisa:
```
a1b2c3d4e5f6....(64 characters)
```

**Is secret ko copy kar lo!** ✂️

### 2️⃣ Render Dashboard pe wapas jao:
```
https://dashboard.render.com
```

### 3️⃣ Click: **"New +"** → **"Web Service"**

### 4️⃣ Same GitHub Repo Select karo:
- Repository: **faizanali4151/physical-ai-robotics**
- Branch: **deployment_features**
- Click: **"Connect"**

### 5️⃣ Form Fill Karo:

**Name:**
```
physical-ai-auth-server
```

**Region:**
```
Oregon (same as backend)
```

**Root Directory:**
```
auth-server
```

**Runtime:**
```
Node
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Instance Type:**
```
Free
```

### 6️⃣ Environment Variables (9 variables):

**⚠️ Important:** Agar tumhare paas OAuth nahi hai to Google/GitHub waale variables ko **skip kar do** (empty chhod do)

```bash
NODE_VERSION
20.10.0

NODE_ENV
production

DATABASE_URL
<YE TUMHE NEON SE LENA PADEGA - SEPARATE DATABASE>

BETTER_AUTH_SECRET
<STEP 1 MEIN JO SECRET GENERATE KIYA THA WO PASTE KARO>

BETTER_AUTH_URL
https://physical-ai-auth-server-xxxxx.onrender.com

CORS_ORIGINS
http://localhost:3000,https://physical-ai-book1.vercel.app
```

**OAuth Variables (Optional - skip if you don't have):**
```bash
GOOGLE_CLIENT_ID
<agar hai to paste karo, warna skip>

GOOGLE_CLIENT_SECRET
<agar hai to paste karo, warna skip>

GITHUB_CLIENT_ID
<agar hai to paste karo, warna skip>

GITHUB_CLIENT_SECRET
<agar hai to paste karo, warna skip>
```

### 7️⃣ Click: **"Create Web Service"**

### 8️⃣ Wait: 5-10 minutes

### 9️⃣ Database Migration Run Karo:
- Service deploy hone ke baad
- Click: **"Shell"** tab (top navigation)
- Shell mein type karo:
```bash
npm run db:migrate
```
- Enter press karo
- Wait for success message

### 🔟 URL Copy karo:
```
https://physical-ai-auth-server-xxxxx.onrender.com
```
**Is URL ko note kar lo!**

### 1️⃣1️⃣ Test karo:
Browser mein:
```
https://physical-ai-auth-server-xxxxx.onrender.com/health
```

---

## Step 3: Mujhe URLs Do!

Jab dono services deploy ho jayein, mujhe batao:

```
Backend URL: https://physical-ai-backend-xxxxx.onrender.com
Auth URL: https://physical-ai-auth-server-xxxxx.onrender.com
```

**Main automatically frontend deploy kar dunga Vercel pe!** 🚀

---

## Agar Database Nahi Hai (Auth ke liye)

### Neon mein naya database banao:

1. **Jao:** https://console.neon.tech
2. **Click:** "Create Project"
3. **Name:** `auth-database`
4. **Click:** Create
5. **Connection String copy karo** (ensure `?sslmode=require` end mein ho)
6. **Use karo** `DATABASE_URL` mein

---

## Troubleshooting

### ❌ "Build fail ho raha hai"
- Root Directory check karo: `backend` ya `auth-server`
- Logs padho, error dikhega

### ❌ "Service start nahi ho rahi"
- Start Command check karo (exactly waise hi hona chahiye)
- Environment variables dobara check karo
- 60 seconds wait karo (cold start)

### ❌ "OAuth nahi hai"
- Koi baat nahi! Skip kar do
- Google/GitHub variables khali chhod do
- App work karega (bas login nahi hoga)

---

## Timeline

- Backend setup: **10 minutes**
- Auth setup: **10 minutes**
- Main frontend deploy karunga: **2 minutes**
- CORS update: **2 minutes**

**Total: ~25 minutes** ⏱️

---

## Next Steps

Jaise hi tum dono URLs de doge:

✅ Main Vercel CLI se frontend deploy kar dunga
✅ Environment variables automatically set ho jayengi
✅ Production deploy ho jayega
✅ Browser khul jayega testing ke liye

**Bas URLs de do, baaki sab main sambhal lunga!** 💪

---

**Ready?** Backend deploy karne ke liye yahaan jao:
👉 https://dashboard.render.com/create?type=web
