# 🔧 Quick Fix for Auth Issues

## Problem Summary

Frontend still using `localhost:3001` for auth instead of production Railway URL.

## Root Cause

Vercel build cache using old code. Need to force rebuild.

## Solution

### Option 1: Vercel Dashboard (Fastest)

1. Go to: https://vercel.com/muhammad-faizans-projects-c907627a/physical-ai-book1
2. Click on latest deployment
3. Click **"⋮"** (three dots)
4. Select **"Redeploy"**
5. Check **"Clear cache and rebuild"**
6. Click **"Redeploy"**

### Option 2: CLI Force Rebuild

```bash
vercel --prod --force
```

---

## Railway CORS Updates (Confirm These)

### Backend Service:
```
CORS_ORIGINS=https://physical-ai-book1-hh89iekac-muhammad-faizans-projects-c907627a.vercel.app,http://localhost:3000
```

### Auth Service:
```
APP_URL=https://physical-ai-book1-hh89iekac-muhammad-faizans-projects-c907627a.vercel.app
ALLOWED_ORIGINS=https://physical-ai-book1-hh89iekac-muhammad-faizans-projects-c907627a.vercel.app,http://localhost:3000
```

---

## After Fix

Login should work with:
- Email: fkaaa568@gmail.com
- Password: qweasdty123

Or GitHub OAuth.
