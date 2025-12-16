# Quick Start - Better Auth OAuth

## 🚀 Start in 3 Commands

```bash
# 1. Database migration (creates tables)
npm run db:migrate

# 2. Start auth server
npm run dev

# 3. Test it works
curl http://localhost:3001/health
```

## ✅ Expected Output

**After migration:**
```
✓ User table created
✓ Account table created
✓ Session table created
✓ Verification table created
✓ Indexes created

✅ Database migration completed successfully!
```

**After starting server:**
```
🔐 OAuth Providers Configuration:
  - GitHub: ✓ Configured
  - Facebook: ✗ Missing
  - Google: ✗ Missing

🚀 Authentication server running on http://localhost:3001
```

**After health check:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-09T...",
  "service": "Physical AI Auth Server"
}
```

## 🧪 Test GitHub Login

### From Browser
1. Start server: `npm run dev`
2. Visit: `http://localhost:3000/login`
3. Click: **"Sign in with GitHub"**
4. Should redirect to GitHub (not 404!)

### From Command Line
```bash
# Test OAuth endpoint (should redirect, not 404)
curl -I http://localhost:3001/api/auth/sign-in/github

# Expected response:
HTTP/1.1 302 Found
Location: https://github.com/login/oauth/authorize?...
```

## 📋 Verification Checklist

Run automated test:
```bash
./TEST_OAUTH.sh
```

Manual checks:
- [ ] Server starts on port 3001
- [ ] No "relation 'user' does not exist" error
- [ ] GitHub shows: `✓ Configured`
- [ ] `/api/auth/sign-in/github` returns 302 (not 404)
- [ ] Can complete GitHub OAuth flow

## 🔧 Common Issues

### Port Already in Use
```bash
lsof -ti:3001 | xargs kill -9
npm run dev
```

### Tables Don't Exist
```bash
npm run db:migrate
npm run dev
```

### OAuth Returns 404
Check server console for errors, restart server:
```bash
npm run dev
```

## 📚 Full Documentation

- **Complete guide:** `OAUTH_SETUP_COMPLETE.md`
- **Integration:** `../BETTER_AUTH_INTEGRATION_COMPLETE.md`
- **Summary:** `../OAUTH_FIXED_SUMMARY.md`

## 🎯 What Works

| Feature | Status |
|---------|--------|
| Email/Password | ✅ Working |
| GitHub OAuth | ✅ Working |
| Facebook OAuth | 🔧 Needs credentials |
| Google OAuth | 🔧 Needs credentials |
| Session Management | ✅ Working |
| Database Tables | ✅ Created |

---

**Ready to use!** Start server and test GitHub login now. 🚀
