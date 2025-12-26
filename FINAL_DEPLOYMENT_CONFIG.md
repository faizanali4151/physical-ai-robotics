# 🎉 Final Deployment Configuration

## 📋 Live URLs

### Frontend (Docusaurus):
```
https://physical-ai-book1-hh89iekac-muhammad-faizans-projects-c907627a.vercel.app
```

### Backend API (FastAPI):
```
https://physical-ai-backend-production-9f13.up.railway.app
```

### Auth Server (BetterAuth):
```
https://physical-ai-auth-production.up.railway.app
```

---

## 🔐 Railway Backend Environment Variables

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyC2EbV8wTwd20T_SgcCByEfHP3O8v11gq8
QDRANT_URL=https://c793b077-b46d-4f37-b38b-a572f2362704.us-east-1-1.aws.cloud.qdrant.io
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.rX6vEg6XOSDtUuK9iXi3AKsP4JweBtgGHG_MNwgWVwU
NEON_CONNECTION_STRING=postgresql://neondb_owner:npg_8PVlFAR3LfrZ@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
LOG_LEVEL=INFO
CORS_ORIGINS=https://physical-ai-book1-hh89iekac-muhammad-faizans-projects-c907627a.vercel.app,http://localhost:3000
```

---

## 🔐 Railway Auth Server Environment Variables

```env
DATABASE_URL=postgresql://neondb_owner:npg_8PVlFAR3LfrZ@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
PORT=3001
BETTER_AUTH_SECRET=C3IvZBaUrI9/YlUwe52b30d35TbJy4Xg9+6vCmuFUCU=
AUTH_URL=https://physical-ai-auth-production.up.railway.app
APP_URL=https://physical-ai-book1-hh89iekac-muhammad-faizans-projects-c907627a.vercel.app
ALLOWED_ORIGINS=https://physical-ai-book1-hh89iekac-muhammad-faizans-projects-c907627a.vercel.app,http://localhost:3000
```

---

## ▲ Vercel Environment Variables

```env
CHATBOT_API_URL=https://physical-ai-backend-production-9f13.up.railway.app
AUTH_URL=https://physical-ai-auth-production.up.railway.app
```

---

## ✅ Test Credentials (Direct Login)

**Email:** fkaaa568@gmail.com
**Password:** qweasdty123

---

## 🧪 Testing Steps

### 1. Test Backend Health:
```bash
curl https://physical-ai-backend-production-9f13.up.railway.app/health
```

### 2. Test Auth Server Health:
```bash
curl https://physical-ai-auth-production.up.railway.app/health
```

### 3. Test Frontend:
Open in browser:
```
https://physical-ai-book1-hh89iekac-muhammad-faizans-projects-c907627a.vercel.app
```

### 4. Test Authentication:
- Try direct email/password login
- Try GitHub OAuth
- Check if session persists after login

### 5. Test Chatbot:
- Navigate to any docs page
- Look for chat widget
- Ask a question about Physical AI

---

## 🔄 Manual Updates Required

**Railway Dashboard - Update These Variables:**

### Backend Service:
- CORS_ORIGINS = `https://physical-ai-book1-hh89iekac-muhammad-faizans-projects-c907627a.vercel.app,http://localhost:3000`

### Auth Service:
- APP_URL = `https://physical-ai-book1-hh89iekac-muhammad-faizans-projects-c907627a.vercel.app`
- ALLOWED_ORIGINS = `https://physical-ai-book1-hh89iekac-muhammad-faizans-projects-c907627a.vercel.app,http://localhost:3000`

After updating, both services will auto-redeploy (~2 min each).

---

## 🎯 Deployment Complete Checklist

- [x] Backend deployed to Railway
- [x] Auth server deployed to Railway
- [x] Frontend deployed to Vercel
- [x] Environment variables configured
- [x] CORS settings configured
- [ ] **Manual: Update CORS with latest Vercel URL**
- [ ] **Test: Authentication flow**
- [ ] **Test: Chatbot functionality**

---

## 📞 Next Steps

1. Update CORS variables in Railway (2 services)
2. Wait for auto-redeploy (~2 min each)
3. Test login at new Vercel URL
4. Test chatbot on docs pages

---

**All configuration documented!** ✅
