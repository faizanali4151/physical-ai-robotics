# 🔧 Firebase Credentials Setup - Quick Guide

## ⚠️ Current Issue

The app shows: **"auth/api-key-not-valid"** error

**Why?** The Firebase config uses placeholder values instead of your actual project credentials.

---

## ✅ Solution (5 Minutes)

### Step 1: Get Your Firebase Config (2 minutes)

1. **Go to Firebase Console**:
   ```
   https://console.firebase.google.com/
   ```

2. **Create or Select Project**:
   - Click "Add project" or select existing project
   - Project name: `physical-ai-book` (or any name you prefer)

3. **Get Configuration**:
   - Click **⚙️ Settings** icon (top left)
   - Select **"Project settings"**
   - Scroll down to **"Your apps"** section
   - If no web app exists:
     - Click **Web icon** (`</>`)
     - App nickname: `Physical AI Book`
     - Click "Register app"
   - Copy the `firebaseConfig` object shown

**You'll see something like this:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC_RealKey_With_39_Characters_Here",
  authDomain: "your-project-abc123.firebaseapp.com",
  projectId: "your-project-abc123",
  storageBucket: "your-project-abc123.appspot.com",
  messagingSenderId: "987654321012",
  appId: "1:987654321012:web:abc123def456ghi789"
};
```

### Step 2: Update Your Code (1 minute)

1. **Open**: `src/firebase/config.ts`
2. **Find lines 48-53** (the firebaseConfig object)
3. **Replace with your actual config**:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY_FROM_FIREBASE",      // ← Paste here
  authDomain: "your-project.firebaseapp.com",       // ← Paste here
  projectId: "your-project-id",                     // ← Paste here
  storageBucket: "your-project.appspot.com",        // ← Paste here
  messagingSenderId: "123456789",                   // ← Paste here
  appId: "1:123456789:web:abcdef123456"             // ← Paste here
};
```

4. **Save the file**

### Step 3: Enable Authentication (2 minutes)

1. **In Firebase Console**, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. **Enable each provider**:

#### Google (Required for Google login)
- Click "Google"
- Toggle **"Enable"** switch
- Select your email from dropdown
- Click **"Save"**

#### GitHub (Optional)
- Click "GitHub"
- Toggle **"Enable"**
- You'll need GitHub OAuth App credentials:
  - Go to https://github.com/settings/developers
  - Click "New OAuth App"
  - Homepage URL: `http://localhost:3001`
  - Callback URL: (copy from Firebase dialog)
  - Get Client ID and Secret
  - Paste into Firebase
- Click **"Save"**

#### Email/Password (For email login)
- Click "Email/Password"
- Toggle **"Enable"**
- Click **"Save"**

### Step 4: Test It (30 seconds)

```bash
# Rebuild
npm run build

# Start server
npm run serve -- --port 3001
```

Visit: http://localhost:3001/

- Click "Google" button
- Should open Google account selector (no errors!)
- Select account
- Should redirect to homepage
- Your name and avatar appear in navbar

---

## 📋 Quick Checklist

- [ ] Created Firebase project
- [ ] Copied firebaseConfig from Firebase Console
- [ ] Updated src/firebase/config.ts lines 48-53
- [ ] Enabled Google in Authentication → Sign-in method
- [ ] Enabled Email/Password in Authentication
- [ ] (Optional) Enabled GitHub with OAuth credentials
- [ ] Ran `npm run build`
- [ ] Tested Google login
- [ ] No "api-key-not-valid" error

---

## 🎯 Example: Before & After

### ❌ Before (Placeholder - Causes Errors)
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey123456789",  // ← WRONG
  authDomain: "physical-ai-book.firebaseapp.com",
  projectId: "physical-ai-book",
  // ...
};
```

### ✅ After (Real Config - Works)
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC_Your_Real_39_Character_Key_Here",  // ← CORRECT
  authDomain: "your-actual-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  // ...
};
```

---

## 🔍 How to Find Each Value

| Field | Where to Find in Firebase Console |
|-------|-----------------------------------|
| **apiKey** | Project Settings → Your apps → Web app |
| **authDomain** | Same location - ends with `.firebaseapp.com` |
| **projectId** | Same as your project name in Firebase |
| **storageBucket** | Same location - ends with `.appspot.com` |
| **messagingSenderId** | Same location - numeric value |
| **appId** | Same location - starts with `1:` |

---

## 🚨 Common Issues

### Issue: "auth/api-key-not-valid"
**Cause**: Using placeholder API key  
**Fix**: Replace with your actual Firebase API key

### Issue: "auth/unauthorized-domain"
**Cause**: Domain not authorized  
**Fix**: 
1. Firebase Console → Authentication → Settings
2. Add `localhost` to Authorized domains

### Issue: Google popup doesn't open
**Cause**: Browser blocked popup  
**Fix**: Allow popups for localhost in browser settings

### Issue: Can't find firebaseConfig
**Cause**: No web app registered  
**Fix**: 
1. Firebase Console → Project Settings
2. Scroll to "Your apps"
3. Click Web icon (`</>`)
4. Register app, get config

---

## 📝 Quick Copy Template

Copy this and fill in your values:

```typescript
// In src/firebase/config.ts, replace lines 48-53:

const firebaseConfig = {
  apiKey: "",              // ← Paste from Firebase
  authDomain: "",          // ← Paste from Firebase
  projectId: "",           // ← Paste from Firebase
  storageBucket: "",       // ← Paste from Firebase
  messagingSenderId: "",   // ← Paste from Firebase
  appId: ""                // ← Paste from Firebase
};
```

---

## ✅ Success Indicators

When it's working correctly:
1. ✅ No "process is not defined" error
2. ✅ No "api-key-not-valid" error
3. ✅ Google button opens account selector
4. ✅ After login, redirects to homepage
5. ✅ User name/avatar appears in navbar
6. ✅ Sign out works and returns to login

---

**Need help?** Check `FIREBASE_SETUP_GUIDE.md` for detailed instructions.
