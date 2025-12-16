/**
 * Firebase Configuration
 *
 * ⚠️ IMPORTANT: Replace the config below with your actual Firebase credentials
 *
 * SETUP INSTRUCTIONS:
 *
 * Step 1: Create Firebase Project
 * -------------------------------
 * 1. Go to https://console.firebase.google.com/
 * 2. Click "Create a project" or select existing project
 * 3. Follow the setup wizard
 *
 * Step 2: Get Firebase Config
 * ----------------------------
 * 1. In Firebase Console, go to Project Settings (gear icon)
 * 2. Scroll down to "Your apps" section
 * 3. Click the Web icon (</>) to add a web app
 * 4. Register app with nickname (e.g., "Physical AI Book")
 * 5. Copy the firebaseConfig object from the code snippet
 * 6. Paste it below, replacing the placeholder values
 *
 * Step 3: Enable Authentication Methods
 * --------------------------------------
 * 1. Go to Build > Authentication > Get Started
 * 2. Click "Sign-in method" tab
 * 3. Enable the following:
 *    - Email/Password: Click, toggle Enable, Save
 *    - Google: Click, toggle Enable, Save
 *    - GitHub: Click, toggle Enable, add OAuth App credentials
 *      - Create OAuth App: https://github.com/settings/developers
 *      - Copy Client ID and Client Secret to Firebase
 *
 * Step 4: Add Authorized Domains
 * -------------------------------
 * 1. In Authentication > Settings > Authorized domains
 * 2. Add: localhost (should be there by default)
 * 3. Add your production domain when deploying
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ TODO: Replace with YOUR Firebase project configuration
// Get this from: Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey123456789",  // ← Replace with your API key
  authDomain: "physical-ai-book.firebaseapp.com",  // ← Replace with your auth domain
  projectId: "physical-ai-book",  // ← Replace with your project ID
  storageBucket: "physical-ai-book.appspot.com",  // ← Replace with your storage bucket
  messagingSenderId: "123456789",  // ← Replace with your messaging sender ID
  appId: "1:123456789:web:abcdef123456"  // ← Replace with your app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// OAuth Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account' // Always show account selection
});

export default app;
