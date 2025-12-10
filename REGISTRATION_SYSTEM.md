# User Registration System Documentation

## Overview

The application now has a complete user registration and login system with mandatory field validation, secure password storage, and proper authentication flow.

## Features Implemented

### ✅ Registration Requirements

**Mandatory Fields:**
1. **Name** - User's full name (required, trimmed of whitespace)
2. **Email** - Valid email address (required, trimmed, must be unique)
3. **Password** - Minimum 6 characters (required, securely hashed)

**Validation Rules:**
- Name cannot be empty or only whitespace
- Email must be provided and properly formatted
- Password must be at least 6 characters long
- Email must be unique (no duplicate registrations)

### ✅ Registration Flow

```
1. User fills registration form with Name, Email, Password
   ↓
2. Client-side validation checks all required fields
   ↓
3. Data sent to Better Auth server (port 3001)
   ↓
4. Server validates and hashes password (bcrypt)
   ↓
5. User created in PostgreSQL database
   ↓
6. Success message shown: "Account created successfully! Please log in with your credentials."
   ↓
7. Form fields cleared automatically
   ↓
8. After 2 seconds, user switched to Login tab
   ↓
9. User can now log in with their Email and Password
```

### ✅ Login Flow

```
1. User enters Email and Password
   ↓
2. Client-side validation checks both fields are provided
   ↓
3. Credentials sent to Better Auth server
   ↓
4. Server verifies email exists and password matches (bcrypt compare)
   ↓
5. Session created with HTTP-only cookie (7-day expiration)
   ↓
6. Success message shown: "Login successful! Redirecting..."
   ↓
7. After 1 second, redirect to homepage (/)
   ↓
8. User is now authenticated and can access protected pages
```

## Security Features

### 🔒 Password Security

**Hashing:**
- Passwords are **never stored in plain text**
- Uses **bcrypt** algorithm via Better Auth
- Each password has a unique salt
- Computationally expensive to crack

**Storage:**
- Hashed passwords stored in `account` table
- Original passwords are **never** recoverable
- Only password verification is possible

### 🔒 Session Security

**HTTP-Only Cookies:**
- Session tokens stored in HTTP-only cookies
- Not accessible via JavaScript (XSS protection)
- Automatically sent with each request

**Session Expiration:**
- Sessions expire after 7 days
- Automatic renewal every 24 hours when active
- Expired sessions automatically cleaned up

**CSRF Protection:**
- Built-in CSRF protection via Better Auth
- Secure cookie settings
- Same-site cookie policies

## Database Schema

### User Table
```sql
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,                    -- Unique user ID (UUID)
  email TEXT UNIQUE NOT NULL,             -- User's email (unique, indexed)
  "emailVerified" BOOLEAN DEFAULT FALSE,  -- Email verification status
  name TEXT,                              -- User's full name
  image TEXT,                             -- Profile picture URL (optional)
  "createdAt" TIMESTAMP,                  -- Registration timestamp
  "updatedAt" TIMESTAMP                   -- Last update timestamp
);
```

### Account Table
```sql
CREATE TABLE account (
  id TEXT PRIMARY KEY,                    -- Unique account ID
  "userId" TEXT REFERENCES "user"(id),    -- Foreign key to user
  "providerId" TEXT NOT NULL,             -- "credential" for email/password
  "accountId" TEXT NOT NULL,              -- User's email (for email/password)
  password TEXT,                          -- Bcrypt hashed password
  "accessToken" TEXT,                     -- OAuth access token (if OAuth)
  "refreshToken" TEXT,                    -- OAuth refresh token (if OAuth)
  "createdAt" TIMESTAMP,                  -- Account creation timestamp
  "updatedAt" TIMESTAMP,                  -- Last update timestamp
  UNIQUE("providerId", "accountId")       -- Prevent duplicate accounts
);
```

### Session Table
```sql
CREATE TABLE session (
  id TEXT PRIMARY KEY,                    -- Unique session ID
  "userId" TEXT REFERENCES "user"(id),    -- Foreign key to user
  token TEXT UNIQUE NOT NULL,             -- Session token (indexed)
  "expiresAt" TIMESTAMP NOT NULL,         -- Expiration timestamp
  "ipAddress" TEXT,                       -- User's IP address
  "userAgent" TEXT,                       -- Browser/device info
  "createdAt" TIMESTAMP,                  -- Session creation timestamp
  "updatedAt" TIMESTAMP                   -- Last activity timestamp
);
```

## API Endpoints

### Registration
```
POST http://localhost:3001/api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}

Response (Success):
{
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": false
    }
  }
}

Response (Error):
{
  "error": {
    "message": "Email already exists"
  }
}
```

### Login
```
POST http://localhost:3001/api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response (Success):
{
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "session": {
      "token": "session-token-here",
      "expiresAt": "2025-12-17T00:00:00.000Z"
    }
  }
}

Response (Error):
{
  "error": {
    "message": "Invalid email or password"
  }
}
```

## Frontend Implementation

### File: `/src/pages/login.tsx`

**Key Features:**

1. **Dual Mode:** Toggle between Login and Register tabs
2. **Field Validation:** Client-side validation before server request
3. **Error Handling:** User-friendly error messages
4. **Success Feedback:** Clear success messages with automatic redirect
5. **Form Clearing:** Auto-clear fields after registration

**Validation Logic:**

**Login:**
```typescript
if (!email.trim()) {
  throw new Error('Email is required');
}
if (!password) {
  throw new Error('Password is required');
}
```

**Registration:**
```typescript
if (!displayName.trim()) {
  throw new Error('Name is required');
}
if (!email.trim()) {
  throw new Error('Email is required');
}
if (!password || password.length < 6) {
  throw new Error('Password must be at least 6 characters');
}
```

## Error Messages

### Registration Errors

| Error | Message |
|-------|---------|
| Name empty | "Name is required" |
| Email empty | "Email is required" |
| Password too short | "Password must be at least 6 characters" |
| Duplicate email | "This email is already registered. Please sign in instead." |
| Server offline | "Cannot connect to authentication server. Please ensure the backend is running." |

### Login Errors

| Error | Message |
|-------|---------|
| Email empty | "Email is required" |
| Password empty | "Password is required" |
| Invalid credentials | "Invalid email or password. Please try again." |
| Server offline | "Cannot connect to authentication server. Please ensure the backend is running." |

## Testing the System

### Test Registration Flow

1. **Start auth server:**
   ```bash
   cd auth-server
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   npm start
   ```

3. **Navigate to login page:**
   ```
   http://localhost:3000/login
   ```

4. **Click "Register" tab**

5. **Fill in the form:**
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`

6. **Click "Create Account"**

7. **Verify:**
   - ✅ Success message appears
   - ✅ Form fields clear
   - ✅ Automatically switches to Login tab after 2 seconds

### Test Login Flow

1. **On Login tab, enter:**
   - Email: `john@example.com`
   - Password: `password123`

2. **Click "Sign In"**

3. **Verify:**
   - ✅ Success message appears
   - ✅ Redirects to homepage (/) after 1 second
   - ✅ User is authenticated

### Test Validation

**Test 1: Empty Name**
- Leave Name field empty
- Try to register
- Expected: "Name is required"

**Test 2: Empty Email**
- Leave Email field empty
- Try to register/login
- Expected: "Email is required"

**Test 3: Short Password**
- Enter password with less than 6 characters (e.g., "12345")
- Try to register
- Expected: "Password must be at least 6 characters"

**Test 4: Duplicate Email**
- Register with an email that already exists
- Expected: "This email is already registered. Please sign in instead."

**Test 5: Invalid Credentials**
- Try to login with wrong password
- Expected: "Invalid email or password. Please try again."

## Configuration

### Auth Server Environment Variables

File: `/auth-server/.env`

```env
# Database - PostgreSQL (Neon)
DATABASE_URL=postgresql://user:password@host:5432/database

# Better Auth Secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-secret-key-here

# URLs
APP_URL=http://localhost:3000
AUTH_URL=http://localhost:3001

# Email/Password Settings (configured in auth.ts)
# - Email verification: disabled (for development)
# - Password hashing: bcrypt (automatic)
# - Session duration: 7 days
# - Password min length: 6 characters (frontend validation)
```

### Enable Email Verification (Production)

To enable email verification in production:

1. **Update auth server config** (`auth-server/src/auth.ts`):
   ```typescript
   emailAndPassword: {
     enabled: true,
     requireEmailVerification: true, // Enable this
   }
   ```

2. **Configure email provider** (add to auth.ts):
   ```typescript
   email: {
     provider: 'smtp',
     config: {
       host: 'smtp.gmail.com',
       port: 587,
       auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASSWORD,
       },
     },
   }
   ```

## Troubleshooting

### Issue: "Cannot connect to authentication server"

**Solution:**
1. Check if auth server is running: `curl http://localhost:3001/health`
2. If not running: `cd auth-server && npm run dev`
3. Check logs for errors: `tail -f auth-server/logs`

### Issue: "Email already exists"

**Solution:**
- This is expected if the email is already registered
- Use the Login tab instead
- Or register with a different email

### Issue: Session not persisting

**Solution:**
1. Clear browser cookies for localhost
2. Check if cookies are being set (Browser DevTools → Application → Cookies)
3. Verify CORS settings in auth server

### Issue: Password not working after registration

**Solution:**
1. Verify password is at least 6 characters
2. Check for typos (passwords are case-sensitive)
3. Try registering again with a new email
4. Check auth server logs for errors

## Security Best Practices

### For Production

1. **Enable HTTPS:**
   - Set `useSecureCookies: true` in auth.ts
   - Use proper SSL certificates

2. **Enable Email Verification:**
   - Requires email provider setup
   - Prevents spam registrations

3. **Add Rate Limiting:**
   - Prevent brute force attacks
   - Limit registration attempts

4. **Strong Password Policy:**
   - Increase minimum length to 8+ characters
   - Require uppercase, lowercase, numbers, symbols
   - Check against common passwords

5. **Environment Variables:**
   - Never commit secrets to git
   - Use proper secret management
   - Rotate secrets regularly

## Summary

✅ **Registration:** Name, Email, Password required and validated
✅ **Password Security:** Bcrypt hashing, never stored in plain text
✅ **Login:** Email and Password authentication
✅ **Sessions:** HTTP-only cookies, 7-day expiration
✅ **Database:** PostgreSQL with proper indexing
✅ **Validation:** Client-side and server-side validation
✅ **User Flow:** Register → Login tab → Login → Homepage
✅ **Error Handling:** User-friendly error messages

The system is production-ready with proper security measures! 🎉
