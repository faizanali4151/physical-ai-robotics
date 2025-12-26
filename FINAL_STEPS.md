# 🎯 FINAL DEPLOYMENT STEPS - Complete Checklist

## Current Status

✅ **All services deployed but environment variables not syncing properly**

---

## 🔧 Required Railway Updates

### Backend Service (physical-ai-backend):

**Railway Dashboard → Variables Tab → Update:**

```
CORS_ORIGINS=https://physical-ai-book1-kty6qi9ud-muhammad-faizans-projects-c907627a.vercel.app,http://localhost:3000
```

**After saving:** Wait for auto-redeploy (~2 min)

---

### Auth Service (physical-ai-auth):

**Railway Dashboard → Variables Tab → Update 2 variables:**

```
APP_URL=https://physical-ai-book1-kty6qi9ud-muhammad-faizans-projects-c907627a.vercel.app
```

```
ALLOWED_ORIGINS=https://physical-ai-book1-kty6qi9ud-muhammad-faizans-projects-c907627a.vercel.app,http://localhost:3000
```

**After saving:** Wait for auto-redeploy (~2 min)

---

## ⚠️ Current Issues from Console

1. **Backend CORS Error:**
   ```
   No 'Access-Control-Allow-Origin' header
   ```
   **Fix:** Update CORS_ORIGINS in Railway backend (see above)

2. **Auth Still Using localhost:**
   ```
   localhost:3001/api/auth/sign-in/social Failed (403)
   ```
   **Fix:** Vercel env vars not injected at build time

3. **Chat Widget Hidden:**
   ```
   [ChatWidget] User not logged in, hiding widget
   ```
   **Expected behavior** - will show after login works

---

## 🎯 Final Solution: Manual Vercel Env Update

**Problem:** Vercel CLI `vercel env add` sometimes doesn't work for build-time injection.

**Solution:** Use Vercel Dashboard

### Steps:

1. Go to: https://vercel.com/muhammad-faizans-projects-c907627a/physical-ai-book1/settings/environment-variables

2. Check if these exist and are correct:
   - `AUTH_URL` = `https://physical-ai-auth-production.up.railway.app`
   - `CHATBOT_API_URL` = `https://physical-ai-backend-production-9f13.up.railway.app`

3. If wrong or missing, **DELETE** old ones and **ADD** new:
   - Click variable → Delete
   - Click "Add New" → Enter name & value
   - Select **ALL environments** (Production, Preview, Development)

4. After updating, go to **Deployments** tab

5. Click latest deployment → **"..."** → **"Redeploy"**

6. Check **"Use existing Build Cache"** = **OFF** (important!)

7. Click **"Redeploy"**

---

## ✅ Verification Steps (After All Updates)

### 1. Railway Services Active:
- Backend: https://railway.com/project/d9096bec-6226-418f-9bda-39ee9188cb2a
- Auth: Check both services show "Active" (green)

### 2. Test Backend CORS:
```bash
curl -H "Origin: https://physical-ai-book1-kty6qi9ud-muhammad-faizans-projects-c907627a.vercel.app" \
     -I https://physical-ai-backend-production-9f13.up.railway.app/health
```
Should see: `access-control-allow-origin` header

### 3. Test Auth Server:
```bash
curl https://physical-ai-auth-production.up.railway.app/health
```
Should return: `{"status":"healthy"...}`

### 4. Open Frontend & Check Console:
```
https://physical-ai-book1-kty6qi9ud-muhammad-faizans-projects-c907627a.vercel.app
```

**Console should show:**
- ✅ No `localhost:3001` errors
- ✅ Railway auth URLs being used
- ✅ CORS errors resolved

### 5. Test Login:
- Email: fkaaa568@gmail.com
- Password: qweasdty123
- Should redirect to home page after successful login

---

## 📋 Complete Checklist

- [ ] Railway Backend → CORS_ORIGINS updated → Redeployed → Active
- [ ] Railway Auth → APP_URL updated → Redeployed → Active
- [ ] Railway Auth → ALLOWED_ORIGINS updated
- [ ] Vercel Dashboard → Environment variables verified
- [ ] Vercel → Redeployed without cache
- [ ] Test: No localhost errors in console
- [ ] Test: Login successful and redirects to home
- [ ] Test: Chat widget appears after login

---

## 🚨 If Still Not Working

The issue is **customFields not being injected**. Alternative solution:

Create `.env.production` in project root:
```
AUTH_URL=https://physical-ai-auth-production.up.railway.app
CHATBOT_API_URL=https://physical-ai-backend-production-9f13.up.railway.app
```

Commit and push, then Vercel will use these for build.

---

**Follow these steps carefully and verify each checkbox!** ✅
