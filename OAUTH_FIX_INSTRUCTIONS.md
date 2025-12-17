# 🔧 OAuth & CORS Fix - Manual Steps Required

## ⚠️ Current Issues

1. **Vercel Build Failing** - Latest deployments show "Error" status
2. **CORS Blocking Backend** - `physical-ai-backend.onrender.com` not allowing Vercel domain
3. **OAuth Not Completing** - Missing callback handler logs

---

## 🚨 **CRITICAL: Fix CORS on Render Backend**

The browser console shows:
```
Access to fetch at 'https://physical-ai-backend.onrender.com/history/...'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

### **Fix Steps:**

1. **Go to Render Dashboard**: https://render.com/dashboard

2. **Select Service**: `physical-ai-backend`

3. **Go to**: **Environment** tab

4. **Find**: `CORS_ORIGINS` variable

5. **Update Value** to include Vercel domain:
   ```
   https://physical-ai-book1-inky.vercel.app,https://physical-ai-book1-muhammad-faizans-projects-c907627a.vercel.app,http://localhost:3000
   ```

6. **Click**: **Save Changes**

7. **Service will auto-redeploy** (wait 3-5 minutes)

---

## 🔄 **Deploy Auth Server on Render**

The auth server needs to be deployed with the new cookie fixes:

1. **Go to Render Dashboard**: https://render.com/dashboard

2. **Select Service**: `physical-ai-auth`

3. **Click**: **Manual Deploy** → **Deploy latest commit**

4. **Wait**: 3-5 minutes for build to complete

5. **Verify**: Visit https://physical-ai-auth.onrender.com/health
   - Should return: `{"status": "healthy", ...}`

---

## 🔍 **Fix Vercel Build Errors**

The latest Vercel deployments are failing. To debug:

### **Option 1: Check Build Logs on Vercel Dashboard**
1. Go to: https://vercel.com/muhammad-faizans-projects-c907627a/physical-ai-book1
2. Click on the latest deployment (with Error status)
3. Check the **Build Logs** tab
4. Look for TypeScript errors or build failures

### **Option 2: Clear Build Cache**
If it's a caching issue:
1. Go to: Project Settings → General
2. Scroll to "Build & Development Settings"
3. Add Environment Variable:
   - Name: `VERCEL_FORCE_NO_BUILD_CACHE`
   - Value: `1`
4. Trigger a new deployment:
   ```bash
   git commit --allow-empty -m "Force rebuild"
   git push origin main
   ```

### **Option 3: Check TypeScript Errors Locally**
```bash
cd /home/muhammad-faizan/Desktop/physical-ai-book1
npm run build
```

If there are TypeScript errors in the OAuth callback code, they need to be fixed.

---

## 🔐 **Update OAuth Provider Callback URLs**

### **Google Cloud Console**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, ensure you have:
   ```
   https://physical-ai-auth.onrender.com/api/auth/callback/google
   ```
4. **Save changes**

### **GitHub OAuth Settings**
1. Go to: https://github.com/settings/developers
2. Select your OAuth App
3. Under **Authorization callback URL**, ensure it's set to:
   ```
   https://physical-ai-auth.onrender.com/api/auth/callback/github
   ```
4. **Update application**

---

## ✅ **Testing After Fixes**

Once all fixes are applied:

1. **Wait 5-10 minutes** for all deployments to complete

2. **Test Homepage**:
   - Visit: https://physical-ai-book1-inky.vercel.app
   - Should load without CORS errors in console
   - ChatWidget should initialize

3. **Test OAuth Login**:
   - Visit: https://physical-ai-book1-inky.vercel.app/login
   - Click "Login with Google" or "Login with GitHub"
   - Complete OAuth consent
   - **Expected console logs**:
     ```
     🔗 Initiating google OAuth...
     📍 OAuth callback URL: https://physical-ai-book1-inky.vercel.app/login
     🔍 OAuth callback detected, checking session...
     ✅ OAuth login successful: your.email@gmail.com
     ```
   - Should redirect to homepage as authenticated user

4. **Verify Session**:
   - Navbar should show your name/avatar
   - No "Sign In" button should be visible

---

## 🐛 **If Issues Persist**

### **Check Browser Console**
```javascript
// Should see these logs after clicking OAuth login:
🔗 Initiating google OAuth...
📍 OAuth callback URL: https://physical-ai-book1-inky.vercel.app/login

// After returning from OAuth:
🔍 OAuth callback detected, checking session...
✅ OAuth login successful: your.email@gmail.com
```

### **Check Network Tab**
1. Filter by "auth" or "session"
2. Look for failed requests (red)
3. Check Response headers for CORS errors
4. Verify cookies are being set (Application → Cookies)

### **Check Auth Server**
```bash
curl https://physical-ai-auth.onrender.com/health
```
Should return: `{"status":"healthy","timestamp":"...","service":"Physical AI Auth Server"}`

---

## 📊 **Summary of Code Changes Already Made**

✅ **auth-server/src/auth.ts**:
- Added `sameSiteCookieAttribute: "none"` for cross-domain cookies

✅ **src/lib/auth-client.ts**:
- Added `credentials: 'include'` to send cookies

✅ **src/pages/login.tsx**:
- Added OAuth callback detection in useEffect
- Added 5-second timeout for session check
- Changed callbackURL to `/login` for proper handling

✅ **All changes committed**: Commit `e25db07`

⚠️ **Still Needed**:
- Fix Vercel build errors
- Update CORS_ORIGINS on Render backend
- Deploy auth server on Render
- Verify OAuth callback URLs in provider dashboards
