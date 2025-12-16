# ⚡ Deploy Now - Quick Commands

## 🎯 Run These Commands in Order

### Step 1: Update Backend CORS on Render (Manual - 2 minutes)

1. Open: **https://render.com/dashboard**
2. Click: **physical-ai-backend**
3. Click: **Environment** tab
4. Find: **CORS_ORIGINS**
5. Click **Edit**
6. Paste this:
   ```
   http://localhost:3000,https://physical-ai-book1.vercel.app,https://physical-ai-book1-4oj1u9fsh-muhammad-faizans-projects-c907627a.vercel.app
   ```
7. Click **Save**
8. Wait 3 minutes for redeploy ⏰

---

### Step 2: Deploy Frontend (2 minutes)

```bash
cd /home/muhammad-faizan/Desktop/physical-ai-book1

# Clean previous builds
npm run clear

# Build for production
NODE_ENV=production npm run build

# Deploy to Vercel
vercel --prod
```

**Alternative (Git Push Auto-Deploy)**:
```bash
cd /home/muhammad-faizan/Desktop/physical-ai-book1

# Commit changes
git add .
git commit -m "Fix: Auto-detect production backend URLs"

# Push (triggers auto-deploy)
git push origin main
```

---

### Step 3: Update OAuth URLs (5 minutes)

#### Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit Client ID: `1004242255254-jlespd5c6ajshrtredear4rjlvt80qgn.apps.googleusercontent.com`
3. Add to **Authorized redirect URIs**:
   ```
   https://physical-ai-book1.vercel.app/auth/callback/google
   https://physical-ai-book1-4oj1u9fsh-muhammad-faizans-projects-c907627a.vercel.app/auth/callback/google
   https://physical-ai-backend.onrender.com/auth/callback/google
   ```
4. Add to **Authorized JavaScript origins**:
   ```
   https://physical-ai-book1.vercel.app
   https://physical-ai-backend.onrender.com
   ```
5. Save

#### GitHub Settings
1. Go to: https://github.com/settings/developers
2. Edit App: `Ov23liJaZbEmsgqAQeUj`
3. **Homepage URL**: `https://physical-ai-book1.vercel.app`
4. **Callback URL**: `https://physical-ai-backend.onrender.com/auth/callback/github`
5. Update

---

## ✅ Test It

### Quick Test Commands
```bash
# 1. Test backend CORS
curl -I https://physical-ai-backend.onrender.com/health

# 2. Test OPTIONS (CORS preflight)
curl -X OPTIONS -I \
  -H "Origin: https://physical-ai-book1-4oj1u9fsh-muhammad-faizans-projects-c907627a.vercel.app" \
  https://physical-ai-backend.onrender.com/query
```

### Browser Test
1. Visit: `https://physical-ai-book1-4oj1u9fsh-muhammad-faizans-projects-c907627a.vercel.app`
2. Open DevTools (F12)
3. Console tab - should see NO errors
4. Network tab - requests should go to `physical-ai-backend.onrender.com`
5. Open chatbot - ask "What is Physical AI?" - should work
6. Click Login - should work without "Cannot connect" error

---

## 🐛 If Something's Wrong

### CORS Errors?
**Fix**: Check backend CORS_ORIGINS includes your Vercel URL (step 1 above)

### Still seeing localhost?
**Fix**: Hard refresh browser (Ctrl+Shift+R)

### OAuth fails?
**Fix**: Verify redirect URIs in Google/GitHub match exactly (step 3 above)

---

## 📝 What Was Fixed

All these files were updated to auto-detect production:
- ✅ `src/lib/auth-client.ts`
- ✅ `frontend/docusaurus-plugin-rag-chatbot/src/api/chatClient.ts`
- ✅ `frontend/docusaurus-plugin-rag-chatbot/src/index.js`
- ✅ `docusaurus.config.ts`

**No more hard-coded localhost!** 🎉

---

**Total Time**: ~10 minutes
**Result**: Fully working deployment ✅
