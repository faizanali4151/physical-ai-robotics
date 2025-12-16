# 🔧 Vercel Deployment Fix Guide

## Issues Identified

### 1. **Incorrect vercel.json Configuration** ❌
- **Problem**: Was pointing to `frontend/package.json` and `frontend/build`
- **Reality**: Docusaurus is in the root directory, not `frontend/`
- **Impact**: Build failed or served wrong files

### 2. **Wrong Production URL** ❌
- **Problem**: `docusaurus.config.ts` had placeholder URL
- **Impact**: Assets, routing, and meta tags pointing to wrong domain

### 3. **Missing Production Environment Variables** ❌
- **Problem**: No `.env.production` file with backend URL
- **Impact**: Chatbot couldn't connect to backend API

### 4. **Incorrect Routing Configuration** ❌
- **Problem**: Routes not configured for Docusaurus SPA
- **Impact**: Direct navigation to `/docs/intro` would fail with 404

---

## ✅ Fixes Applied

### Fix 1: Updated `vercel.json`
**Location**: `/home/muhammad-faizan/Desktop/physical-ai-book1/vercel.json`

**Changes**:
```json
{
  "version": 2,
  "name": "physical-ai-book",
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "framework": "docusaurus",
  "rewrites": [
    {
      "source": "/docs/:path*",
      "destination": "/docs/:path*"
    },
    {
      "source": "/:path*",
      "destination": "/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Why This Works**:
- ✅ Correct build directory (`build` in root, not `frontend/build`)
- ✅ Proper Docusaurus framework detection
- ✅ Rewrites handle SPA routing
- ✅ Security headers added
- ✅ Asset caching configured

### Fix 2: Updated `docusaurus.config.ts`
**Location**: `/home/muhammad-faizan/Desktop/physical-ai-book1/docusaurus.config.ts`

**Change**:
```typescript
url: 'https://physical-ai-book1.vercel.app',  // Was: 'https://your-docusaurus-site.example.com'
```

**Why This Works**:
- ✅ Correct canonical URL for SEO
- ✅ Proper asset paths
- ✅ Correct sitemap URLs

### Fix 3: Created `.env.production`
**Location**: `/home/muhammad-faizan/Desktop/physical-ai-book1/.env.production`

**Content**:
```bash
CHATBOT_API_URL=https://physical-ai-backend.onrender.com
AUTH_URL=https://physical-ai-backend.onrender.com
NODE_ENV=production
```

**Why This Works**:
- ✅ Chatbot connects to production backend
- ✅ Auth redirects work correctly
- ✅ Environment-specific configuration

---

## 🚀 Deployment Steps

### Step 1: Verify Local Build (Optional but Recommended)
```bash
cd /home/muhammad-faizan/Desktop/physical-ai-book1

# Clean previous builds
npm run clear
rm -rf build .docusaurus

# Install dependencies
npm install

# Build for production
NODE_ENV=production npm run build

# Test locally
npm run serve
# Visit http://localhost:3000 to verify
```

**What to Check Locally**:
- ✅ Homepage loads correctly
- ✅ `/docs/intro` loads without errors
- ✅ All CSS and styles applied
- ✅ Chatbot widget appears (bottom-right)
- ✅ Navigation works (sidebar, header)
- ✅ Images and assets load

### Step 2: Configure Vercel Environment Variables

**Option A: Via Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Select project: `physical-ai-book1`
3. Go to: **Settings → Environment Variables**
4. Add the following for **Production**:

| Variable | Value |
|----------|-------|
| `CHATBOT_API_URL` | `https://physical-ai-backend.onrender.com` |
| `AUTH_URL` | `https://physical-ai-backend.onrender.com` |
| `NODE_ENV` | `production` |

**Option B: Via Vercel CLI**
```bash
cd /home/muhammad-faizan/Desktop/physical-ai-book1

# Add environment variables
vercel env add CHATBOT_API_URL production
# Enter: https://physical-ai-backend.onrender.com

vercel env add AUTH_URL production
# Enter: https://physical-ai-backend.onrender.com

vercel env add NODE_ENV production
# Enter: production
```

### Step 3: Deploy to Vercel

**Option A: Automatic Deploy (Git Push)**
```bash
cd /home/muhammad-faizan/Desktop/physical-ai-book1

# Stage changes
git add vercel.json docusaurus.config.ts .env.production

# Commit
git commit -m "Fix Vercel deployment configuration

- Update vercel.json with correct build paths
- Set production URL in docusaurus.config.ts
- Add .env.production with backend URLs
- Fix routing for Docusaurus SPA"

# Push to trigger Vercel deployment
git push origin main
```

Vercel will automatically detect the push and redeploy.

**Option B: Manual Deploy via CLI**
```bash
cd /home/muhammad-faizan/Desktop/physical-ai-book1

# Deploy to production
vercel --prod

# Or deploy with specific environment
NODE_ENV=production vercel --prod
```

### Step 4: Verify Deployment

**Automated Checks**:
```bash
# Check if site is live
curl -I https://physical-ai-book1.vercel.app
# Expected: HTTP/2 200

# Check docs page
curl -I https://physical-ai-book1.vercel.app/docs/intro
# Expected: HTTP/2 200

# Check assets
curl -I https://physical-ai-book1.vercel.app/assets/css/styles.css
# Expected: HTTP/2 200
```

**Manual Browser Checks**:
1. ✅ Visit: https://physical-ai-book1.vercel.app
2. ✅ Click "Book" or "Start Reading"
3. ✅ Navigate to: https://physical-ai-book1.vercel.app/docs/intro
4. ✅ Verify:
   - Page loads without 404
   - Sidebar appears on left
   - Content is styled correctly
   - Mermaid diagrams render
   - Code blocks have syntax highlighting
5. ✅ Test chatbot:
   - Widget appears in bottom-right corner
   - Click to open
   - Type a message: "What is Physical AI?"
   - Verify response from backend
6. ✅ Test navigation:
   - Click sidebar links
   - Use browser back/forward
   - Direct URL navigation works

---

## 🐛 Troubleshooting

### Issue 1: "404 - Page Not Found" on /docs/* routes

**Cause**: Vercel not properly handling SPA routing

**Fix**:
1. Verify `vercel.json` has correct rewrites (already done above)
2. Clear Vercel cache: Settings → Data Cache → Clear All
3. Redeploy

### Issue 2: Chatbot Widget Not Appearing

**Cause**: Environment variable not set or backend unreachable

**Check**:
```bash
# 1. Verify backend is running
curl https://physical-ai-backend.onrender.com/health

# 2. Check browser console for errors
# Open DevTools → Console → Look for CORS or network errors

# 3. Verify environment variable in Vercel
# Dashboard → Settings → Environment Variables → CHATBOT_API_URL
```

**Fix**:
- Ensure `CHATBOT_API_URL` is set in Vercel
- Verify backend CORS includes: `https://physical-ai-book1.vercel.app`
- Check Render backend logs for errors

### Issue 3: CSS Not Loading / Unstyled Content

**Cause**: Incorrect asset paths or baseUrl

**Fix**:
1. Verify `baseUrl: '/'` in `docusaurus.config.ts` (already set)
2. Verify `url: 'https://physical-ai-book1.vercel.app'` (already set)
3. Check Network tab in DevTools for 404 assets
4. Clear Docusaurus cache: `npm run clear`
5. Rebuild: `npm run build`
6. Redeploy

### Issue 4: Build Fails on Vercel

**Check Vercel Build Logs**:
1. Go to: https://vercel.com/dashboard
2. Select deployment
3. View build logs

**Common Errors**:

**Error: "Cannot find module 'frontend/package.json'"**
- **Fix**: Already fixed in new `vercel.json`

**Error: "Build command failed"**
- **Check**: `npm install` works locally
- **Check**: `npm run build` works locally
- **Fix**: Commit `package-lock.json` to Git

**Error: "Plugin not found"**
- **Cause**: Custom plugin path issue
- **Check**: `frontend/docusaurus-plugin-rag-chatbot/src/index.js` exists
- **Fix**: Verify plugin path in `docusaurus.config.ts`

### Issue 5: Environment Variables Not Applied

**Symptom**: Chatbot still trying to connect to `localhost:8000`

**Fix**:
1. Verify variables set in Vercel Dashboard
2. Redeploy after adding variables (Vercel requires redeploy)
3. Check browser DevTools → Network → Look for API calls
4. Verify API endpoint in HTML: View Source → Search for "rag-chatbot-api"

---

## 🔍 Verification Checklist

After deployment, verify each item:

### Frontend
- [ ] Homepage loads: `https://physical-ai-book1.vercel.app`
- [ ] Docs intro loads: `https://physical-ai-book1.vercel.app/docs/intro`
- [ ] All chapters load: `/docs/foundations`, `/docs/perception`, etc.
- [ ] Sidebar navigation works
- [ ] Header navigation works
- [ ] Footer links work
- [ ] Search works (if enabled)
- [ ] Dark mode toggle works
- [ ] Mobile responsive (check on phone or DevTools)

### Styling
- [ ] CSS fully loaded (no unstyled content flash)
- [ ] Custom styles applied
- [ ] Mermaid diagrams render correctly
- [ ] Code blocks have syntax highlighting
- [ ] Prism theme working (light/dark)
- [ ] Custom fonts loaded

### Chatbot
- [ ] Widget visible in bottom-right corner
- [ ] Widget opens on click
- [ ] Can type messages
- [ ] Backend responds (not timeout)
- [ ] Source citations appear
- [ ] Message history persists
- [ ] Selected-text query works (highlight text → ask question)

### Authentication (if deployed)
- [ ] Login button appears
- [ ] Google OAuth redirects correctly
- [ ] GitHub OAuth redirects correctly
- [ ] User session persists

### Performance
- [ ] Page load < 3 seconds
- [ ] Assets cached (check Network tab)
- [ ] No console errors
- [ ] No 404 errors for assets

---

## 📊 Expected Results

**Before Fixes**:
- ❌ 404 errors on `/docs/*` routes
- ❌ Unstyled content or missing CSS
- ❌ Chatbot not working or missing
- ❌ Build failing or serving wrong directory

**After Fixes**:
- ✅ All routes load correctly
- ✅ Full styling applied
- ✅ Chatbot functional and connected to backend
- ✅ Build succeeds in ~2-3 minutes
- ✅ Production site matches local version

---

## 🚀 Quick Deploy Commands

```bash
# Full deployment workflow
cd /home/muhammad-faizan/Desktop/physical-ai-book1

# 1. Clean and build locally (optional verification)
npm run clear && npm run build

# 2. Test locally (optional)
npm run serve

# 3. Commit fixes
git add .
git commit -m "Fix Vercel deployment configuration"

# 4. Deploy to Vercel
git push origin main  # Triggers auto-deploy

# Or manual deploy:
vercel --prod
```

---

## 📞 Support

If issues persist:

1. **Check Vercel Status**: https://www.vercel-status.com
2. **Check Render Status**: https://status.render.com
3. **View Vercel Logs**: Dashboard → Project → Deployments → Latest → View Logs
4. **View Render Logs**: Dashboard → physical-ai-backend → Logs
5. **Browser Console**: Open DevTools → Console for client-side errors

---

## 📝 Summary

**Files Modified**:
1. ✅ `vercel.json` - Fixed build and routing configuration
2. ✅ `docusaurus.config.ts` - Updated production URL
3. ✅ `.env.production` - Added backend API URLs

**Environment Variables Required**:
- `CHATBOT_API_URL`: `https://physical-ai-backend.onrender.com`
- `AUTH_URL`: `https://physical-ai-backend.onrender.com`
- `NODE_ENV`: `production`

**Deployment Method**:
- Automatic: Git push to main branch
- Manual: `vercel --prod`

**Estimated Fix Time**: 10 minutes
**Estimated Redeploy Time**: 3-5 minutes

---

✅ **All configuration fixes applied and ready for redeployment!**
