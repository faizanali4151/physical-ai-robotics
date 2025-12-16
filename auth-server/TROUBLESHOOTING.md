# Better Auth + Neon Postgres Troubleshooting Guide

## Quick Fix Summary

### **Problem:** `Failed to initialize database adapter`

### **Root Cause:**
The `channel_binding=require` parameter in your DATABASE_URL is incompatible with Node.js `pg` library.

### **Solution:**
Remove `channel_binding=require` from your DATABASE_URL:

```bash
# ❌ WRONG (causes errors)
DATABASE_URL=postgresql://...?sslmode=require&channel_binding=require

# ✅ CORRECT
DATABASE_URL=postgresql://...?sslmode=require
```

---

## Step-by-Step Verification Process

### **Step 1: Test Database Connection**

Run the connection test script:

```bash
cd auth-server
node test-db-connection.js
```

This will:
- ✅ Verify your DATABASE_URL is valid
- ✅ Test connectivity to Neon Postgres
- ✅ Check if Better Auth tables exist
- ✅ Display helpful diagnostics

### **Step 2: Run Database Migrations**

If the test script shows "No Better Auth tables found", run migrations:

```bash
cd auth-server
npm run db:migrate
```

This creates the required tables:
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts
- `verification` - Email verification tokens

### **Step 3: Start the Server**

```bash
cd auth-server
npm run dev
```

Expected output:
```
🚀 Authentication server running on http://localhost:3001
📡 Auth endpoints available at http://localhost:3001/api/auth
🏥 Health check: http://localhost:3001/health

🔐 Enabled OAuth providers:
  ✓ Google
  ✓ GitHub
  ✓ Facebook

⚙️  Environment: development
```

### **Step 4: Verify Health Endpoint**

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-09T...",
  "service": "Physical AI Auth Server"
}
```

---

## Common Issues and Solutions

### Issue 1: Channel Binding Error

**Error:**
```
Error: channel_binding not supported
```

**Solution:**
Remove `&channel_binding=require` from your DATABASE_URL. The Node.js `pg` library doesn't support channel binding.

---

### Issue 2: SSL Connection Error

**Error:**
```
Error: self signed certificate
```

**Solution:**
Update `auth-server/src/auth.ts` to accept self-signed certificates in development:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Development only
});
```

---

### Issue 3: Connection Timeout

**Error:**
```
Error: Connection timeout
```

**Solutions:**
1. Check your internet connection
2. Verify Neon database is not suspended (free tier suspends after inactivity)
3. Check firewall settings
4. Try the non-pooled endpoint:

```bash
# Instead of: -pooler.c-2.us-east-1.aws.neon.tech
# Use:        .c-2.us-east-1.aws.neon.tech
```

---

### Issue 4: Authentication Failed

**Error:**
```
Error: password authentication failed
```

**Solutions:**
1. Verify credentials in Neon dashboard
2. Reset password if needed
3. Check if you copied the full connection string correctly

---

### Issue 5: Database Does Not Exist

**Error:**
```
Error: database "neondb" does not exist
```

**Solution:**
1. Log into Neon dashboard
2. Verify database name
3. Update DATABASE_URL with correct database name

---

## Manual Database Connection Test (Using psql)

Install PostgreSQL client:

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql
```

Test connection manually:

```bash
# Use the DATABASE_URL without channel_binding
psql "postgresql://neondb_owner:npg_8PVlFAR3LfrZ@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

Once connected, verify tables:

```sql
-- List all tables
\dt

-- Check Better Auth tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user', 'session', 'account', 'verification');

-- Count users
SELECT COUNT(*) FROM "user";

-- Exit
\q
```

---

## Enable Verbose Logging

### Option 1: Environment Variable

Add to `.env`:

```bash
DEBUG=better-auth:*
NODE_DEBUG=pg
```

### Option 2: Code-level Debugging

Update `auth-server/src/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Enable pg query logging
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Log all queries
pool.on('connect', () => {
  console.log('✅ New database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
});

pool.on('remove', () => {
  console.log('🔌 Database connection removed from pool');
});
```

---

## Verify Environment Variables

Create a quick check script:

```bash
cd auth-server
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@'));"
```

---

## Neon-Specific Configuration Tips

### Connection Pooling (Recommended)

Use the pooled endpoint for better performance:

```
# ✅ GOOD: Uses connection pooling
@ep-steep-paper-adrz1ijz-pooler.c-2.us-east-1.aws.neon.tech

# ⚠️  OK: Direct connection (slower)
@ep-steep-paper-adrz1ijz.c-2.us-east-1.aws.neon.tech
```

### Free Tier Considerations

Neon Free tier:
- Auto-suspends after inactivity
- Takes ~1-2 seconds to wake up
- May cause initial connection timeouts

**Solution:** Increase connection timeout in development:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 20000, // 20 seconds for free tier wake-up
});
```

---

## Production Checklist

Before deploying to production:

- [ ] Use strong BETTER_AUTH_SECRET (32+ characters)
- [ ] Enable `rejectUnauthorized: true` for SSL
- [ ] Set `requireEmailVerification: true`
- [ ] Configure proper CORS origins
- [ ] Use environment-specific DATABASE_URL
- [ ] Enable connection pooling
- [ ] Set up monitoring/logging
- [ ] Configure proper session expiry
- [ ] Test OAuth provider redirects
- [ ] Verify redirect URLs are HTTPS

---

## Quick Reference Commands

```bash
# Test database connection
node test-db-connection.js

# Run migrations
npm run db:migrate

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Test health endpoint
curl http://localhost:3001/health

# Test with verbose output
DEBUG=* npm run dev
```

---

## Getting Help

If you're still experiencing issues:

1. **Check Better Auth Documentation**
   - https://better-auth.com/docs

2. **Check Neon Documentation**
   - https://neon.tech/docs

3. **Enable Debug Logging**
   ```bash
   DEBUG=better-auth:* npm run dev
   ```

4. **Verify Node.js Version**
   ```bash
   node --version  # Should be 18+ or 20+
   ```

5. **Check Package Versions**
   ```bash
   npm list better-auth pg
   ```

---

## Summary of Changes Made

✅ **Fixed `.env` file:**
- Removed `channel_binding=require`
- Kept `sslmode=require` for security

✅ **Enhanced `auth.ts`:**
- Added explicit SSL configuration
- Added connection pool settings
- Added timeout configurations

✅ **Created test script:**
- `test-db-connection.js` for quick diagnostics

✅ **Created this troubleshooting guide**
- Common issues and solutions
- Step-by-step verification
- Debug commands
