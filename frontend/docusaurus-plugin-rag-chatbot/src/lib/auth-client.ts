import { createAuthClient } from "better-auth/react";

// Get AUTH_URL from window (set by Docusaurus) or fallback to localhost
const getAuthURL = () => {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Docusaurus customFields
    return window.docusaurus?.siteConfig?.customFields?.authUrl || "http://localhost:3001";
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
