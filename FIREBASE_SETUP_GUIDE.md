# Firebase Authentication Setup Guide

## Current Status

✅ **OAuth Implementation**: Complete  
✅ **Login Page**: Working with Google & GitHub buttons  
✅ **Navbar Integration**: User display with avatar support  
✅ **Error Handling**: Comprehensive error messages  
⚠️ **Firebase Config**: Needs your actual credentials  

---

## Quick Setup (5 minutes)

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Create a project"** (or select existing)
3. Enter project name: `physical-ai-book` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Get Firebase Configuration

1. In your Firebase project, click **⚙️ Settings** (gear icon)
2. Go to **"Project settings"**
3. Scroll to **"Your apps"** section
4. Click **Web icon** (`</>`)
5. Register app nickname: `Physical AI Book`
6. Copy the `firebaseConfig` object

**Example config you'll see:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA1b2C3d4E5f6G7h8I9j0K1L2M3N4O5P6Q",
  authDomain: "your-project-123.firebaseapp.com",
  projectId: "your-project-123",
  storageBucket: "your-project-123.appspot.com",
  messagingSenderId: "987654321",
  appId: "1:987654321:web:abc123def456"
};
```

7. **Paste this config** into `src/firebase/config.ts` (lines 48-53)

### Step 3: Enable Authentication Methods

1. In Firebase Console, go to **Build** > **Authentication**
2. Click **"Get started"** (if first time)
3. Go to **"Sign-in method"** tab
4. Enable each method:

#### **Email/Password**
- Click "Email/Password"
- Toggle **"Enable"**
- Click **"Save"**

#### **Google**
- Click "Google"
- Toggle **"Enable"**
- Select support email from dropdown
- Click **"Save"**

#### **GitHub**
- Click "GitHub"
- Toggle **"Enable"**
- **Create GitHub OAuth App:**
  1. Go to https://github.com/settings/developers
  2. Click **"New OAuth App"**
  3. Fill in:
     - Application name: `Physical AI Book`
     - Homepage URL: `http://localhost:3001`
     - Authorization callback URL: (copy from Firebase - looks like `https://your-project.firebaseapp.com/__/auth/handler`)
  4. Click **"Register application"**
  5. Copy **Client ID** and **Client Secret**
  6. Paste into Firebase GitHub settings
- Click **"Save"**

### Step 4: Update Your Code

Open `src/firebase/config.ts` and replace lines 48-53:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",           // ← Paste from Firebase
  authDomain: "your-project.firebaseapp.com",  // ← Paste from Firebase
  projectId: "your-project-id",            // ← Paste from Firebase
  storageBucket: "your-project.appspot.com",   // ← Paste from Firebase
  messagingSenderId: "123456789",          // ← Paste from Firebase
  appId: "1:123456789:web:abcdef"          // ← Paste from Firebase
};
```

### Step 5: Rebuild and Test

```bash
npm run build
npm run serve -- --port 3001
```

Visit: http://localhost:3001/

---

## Testing Checklist

### Email/Password Authentication
- [ ] Click "Register" tab
- [ ] Enter name, email, password
- [ ] Click "Create Account"
- [ ] Should redirect to homepage
- [ ] Name appears in navbar

### Google OAuth
- [ ] Click "Google" button
- [ ] Google account selector popup opens
- [ ] Select account
- [ ] Should redirect to homepage
- [ ] Google name and avatar appear in navbar

### GitHub OAuth
- [ ] Click "GitHub" button
- [ ] GitHub authorization page opens
- [ ] Click "Authorize"
- [ ] Should redirect to homepage
- [ ] GitHub username appears in navbar

### Logout
- [ ] Click user name in navbar
- [ ] Click "Sign Out"
- [ ] Should redirect to login page
- [ ] User session cleared

---

## Troubleshooting

### "auth/api-key-not-valid"
**Solution**: Replace demo API key with your real Firebase API key from Project Settings

### "auth/unauthorized-domain"
**Solution**: 
1. Go to Firebase Console > Authentication > Settings
2. Add `localhost` to Authorized domains
3. Add your production domain

### Google OAuth popup blocked
**Solution**: 
1. Allow popups for localhost in browser
2. Check browser console for errors
3. Verify Google is enabled in Firebase Console

### GitHub OAuth fails
**Solution**:
1. Verify GitHub OAuth App callback URL matches Firebase exactly
2. Check Client ID and Secret are correct
3. Ensure GitHub auth is enabled in Firebase Console

### Blank page after login
**Solution**: Check browser console - likely Firebase config issue

---

## Current Implementation

### Files Modified
- `src/firebase/config.ts` - Firebase initialization
- `src/pages/login.tsx` - Login page with OAuth
- `src/theme/Navbar/Content/UserMenu.tsx` - User display with avatar
- `src/pages/index.tsx` - Homepage with auth check

### Features Implemented
✅ Google OAuth with `signInWithPopup()`  
✅ GitHub OAuth with `signInWithPopup()`  
✅ Email/Password login and registration  
✅ Profile picture display from OAuth  
✅ User name in navbar  
✅ Sign out functionality  
✅ Error handling with shake animation  
✅ Loading spinners  
✅ Session persistence via localStorage  
✅ Responsive design  
✅ Dark mode support  

### Authentication Flow
1. Visit homepage → Redirect to /login
2. Choose auth method (Email/Google/GitHub)
3. Authenticate via Firebase
4. Store user data in localStorage
5. Redirect to homepage
6. Show user name/avatar in navbar
7. Sign out clears session

---

## Security Notes

⚠️ **API Key in Frontend is Safe**
- Firebase API keys are meant to be public
- They identify your project, not authenticate access
- Security is enforced by Firebase Security Rules

⚠️ **Enable Security Rules**
- Go to Firestore Database > Rules
- Set appropriate read/write rules
- Default: Authenticated users only

---

## Next Steps

1. **Create Firebase project** (5 min)
2. **Copy Firebase config** (1 min)
3. **Enable auth methods** (3 min)
4. **Update config.ts** (1 min)
5. **Test login flows** (2 min)

**Total time: ~12 minutes**

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Firebase config is correct
3. Ensure auth methods are enabled
4. Check authorized domains include localhost

For Firebase-specific help: https://firebase.google.com/docs/auth
