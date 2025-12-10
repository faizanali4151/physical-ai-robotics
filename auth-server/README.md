# Physical AI Book - BetterAuth Server

Complete authentication server with OAuth support for Google, GitHub, and Facebook.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd auth-server
npm install
```

### 2. Database Setup

You can use your existing Neon Postgres database or create a new one.

**Option A: Use Existing Neon Database**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your Neon database URL
# DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
```

**Option B: Create New Database**
- Go to https://neon.tech
- Create a new database
- Copy the connection string to .env

### 3. Run Database Migration

```bash
npm run db:migrate
# Or manually: tsx src/migrate.ts
```

This creates the necessary tables:
- `users` - User accounts
- `sessions` - Active sessions
- `accounts` - OAuth provider links
- `passwords` - Hashed passwords
- `verification_tokens` - Email verification

### 4. Configure OAuth Providers

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
7. Copy Client ID and Client Secret to `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

#### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: "Physical AI Book"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3001/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add to `.env`:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

#### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app → "Consumer"
3. Add "Facebook Login" product
4. Settings → Basic:
   - Copy App ID and App Secret
5. Facebook Login → Settings:
   - Valid OAuth Redirect URIs: `http://localhost:3001/api/auth/callback/facebook`
6. Add to `.env`:
   ```
   FACEBOOK_CLIENT_ID=your-app-id
   FACEBOOK_CLIENT_SECRET=your-app-secret
   ```

### 5. Generate Secret Key

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Add to `.env`:
```
BETTER_AUTH_SECRET=your-generated-secret
```

### 6. Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

Server will start on `http://localhost:3001`

## 📡 API Endpoints

BetterAuth automatically creates these endpoints:

### Authentication
- `POST /api/auth/sign-in/email` - Email/password sign in
- `POST /api/auth/sign-up/email` - Email/password sign up
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

### OAuth
- `GET /api/auth/sign-in/google` - Start Google OAuth
- `GET /api/auth/sign-in/github` - Start GitHub OAuth
- `GET /api/auth/sign-in/facebook` - Start Facebook OAuth
- `GET /api/auth/callback/{provider}` - OAuth callback

### User Management
- `GET /api/auth/user` - Get current user
- `PATCH /api/auth/user` - Update user profile

## 🔧 Environment Variables

```env
# Required
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-key

# Optional (enable providers you want)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Configuration
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3000
AUTH_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 🧪 Testing

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

Test session retrieval:
```bash
curl http://localhost:3001/api/auth/session \
  -H "Cookie: better-auth.session_token=your-token"
```

## 🚢 Production Deployment

### Environment Updates

Update `.env` for production:
```env
NODE_ENV=production
APP_URL=https://your-domain.com
AUTH_URL=https://auth.your-domain.com
ALLOWED_ORIGINS=https://your-domain.com

# Use secure secrets
BETTER_AUTH_SECRET=<strong-random-key>
```

### OAuth Redirect URLs

Update OAuth provider settings with production URLs:
- Google: `https://auth.your-domain.com/api/auth/callback/google`
- GitHub: `https://auth.your-domain.com/api/auth/callback/github`
- Facebook: `https://auth.your-domain.com/api/auth/callback/facebook`

### Deploy Options

**Option 1: Railway/Render**
```bash
# These platforms auto-detect Node.js apps
# Just connect your repo and set environment variables
```

**Option 2: Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

**Option 3: VPS (Ubuntu)**
```bash
# Install Node.js 20
# Clone repo
npm install
npm run build
# Use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name auth-server
pm2 save
pm2 startup
```

## 🔍 Troubleshooting

**Database connection fails:**
- Check DATABASE_URL format
- Ensure database exists
- Verify network access to database

**OAuth doesn't work:**
- Check redirect URIs match exactly
- Verify client ID/secret are correct
- Check provider app is in correct mode (development/production)

**CORS errors:**
- Add frontend URL to ALLOWED_ORIGINS
- Check protocol (http vs https)
- Verify credentials: true in requests

## 📚 Additional Resources

- [BetterAuth Documentation](https://better-auth.com/docs)
- [OAuth Provider Setup Guides](https://better-auth.com/docs/social-signin)
