import { createAuthClient } from "better-auth/react";

// Get AUTH_URL from Docusaurus customFields or fallback to localhost
const getAuthURL = () => {
  if (typeof window !== 'undefined') {
    // Check Docusaurus siteConfig customFields
    // @ts-ignore - Docusaurus injects this
    const docusaurusConfig = window.__DOCUSAURUS__?.siteConfig?.customFields;
    if (docusaurusConfig?.authUrl) {
      return docusaurusConfig.authUrl;
    }

    // Fallback: detect production by hostname
    if (window.location.hostname.includes('vercel.app') ||
        window.location.hostname.includes('physical-ai-book')) {
      return "https://physical-ai-auth-production.up.railway.app";
    }
  }
  return "http://localhost:3001";
};

export const authClient = createAuthClient({
  baseURL: getAuthURL(),
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;
