import { createAuthClient } from "better-auth/react";

// Helper to get auth URL from window (injected by Docusaurus)
const getAuthURL = (): string => {
  if (typeof window !== 'undefined') {
    // Check if Docusaurus injected the config
    const docusaurusConfig = (window as any).docusaurus?.siteConfig?.customFields;
    if (docusaurusConfig?.authUrl) {
      return docusaurusConfig.authUrl;
    }
  }

  // IMPORTANT: Auth server is separate from the RAG backend
  // Auth server handles Better Auth OAuth and session management
  // RAG backend handles chatbot queries and embeddings
  const productionAuthServer = "https://physical-ai-auth.onrender.com"; // Better Auth server
  const developmentAuthServer = "http://localhost:3001";

  // Check if we're in production by looking at the current URL
  if (typeof window !== 'undefined') {
    const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
    return isProduction ? productionAuthServer : developmentAuthServer;
  }

  return developmentAuthServer;
};

// Helper function to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

// BetterAuth client configuration
export const authClient = createAuthClient({
  baseURL: getAuthURL(),
});

// Export useful methods for React components
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  useUser,
} = authClient;

// Helper function to check if user is authenticated with timeout
export const isAuthenticated = async (timeoutMs: number = 5000): Promise<boolean> => {
  try {
    const session = await withTimeout(
      authClient.getSession(),
      timeoutMs,
      'Auth server timeout - server may be sleeping or unreachable'
    );
    return !!session.data;
  } catch (error) {
    console.warn('⚠️ Auth check failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// Get current user session with timeout
export const getCurrentUser = async (timeoutMs: number = 5000) => {
  try {
    const session = await withTimeout(
      authClient.getSession(),
      timeoutMs,
      'Auth server timeout - server may be sleeping or unreachable'
    );
    return session.data?.user || null;
  } catch (error) {
    console.warn('⚠️ Failed to get current user:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

// Get session data with timeout
export const getSession = async (timeoutMs: number = 5000) => {
  try {
    const session = await withTimeout(
      authClient.getSession(),
      timeoutMs,
      'Auth server timeout - server may be sleeping or unreachable'
    );
    return session.data || null;
  } catch (error) {
    console.warn('⚠️ Failed to get session:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

// Type definitions for Better Auth
export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}
