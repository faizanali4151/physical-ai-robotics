import { createAuthClient } from "better-auth/react";

// Production auth server URL
const PRODUCTION_AUTH_URL = "https://physical-ai-auth-production.up.railway.app";

// Get AUTH_URL from Docusaurus customFields or fallback
const getAuthURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Debug logging
    console.log('🔐 Auth client initializing...');
    console.log('   Hostname:', hostname);

    // Check Docusaurus siteConfig customFields first
    // @ts-ignore - Docusaurus injects this
    const docusaurusConfig = window.__DOCUSAURUS__?.siteConfig?.customFields;
    if (docusaurusConfig?.authUrl) {
      console.log('   Using Docusaurus customFields authUrl:', docusaurusConfig.authUrl);
      return docusaurusConfig.authUrl;
    }

    // Fallback: detect production by hostname patterns
    const isProduction =
      hostname.includes('vercel.app') ||
      hostname.includes('physical-ai-book') ||
      hostname.endsWith('.vercel.app') ||
      !hostname.includes('localhost');

    if (isProduction) {
      console.log('   Using production auth URL:', PRODUCTION_AUTH_URL);
      return PRODUCTION_AUTH_URL;
    }
  }

  console.log('   Using localhost auth URL');
  return "http://localhost:3001";
};

const authURL = getAuthURL();

export const authClient = createAuthClient({
  baseURL: authURL,
  fetchOptions: {
    credentials: 'include', // Important for cookies
  },
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;
