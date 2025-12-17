import { betterAuth } from "better-auth";
import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

// Create PostgreSQL connection pool with SSL configuration for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false }, // More lenient in development
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log OAuth provider configuration
console.log("🔐 OAuth Providers Configuration:");
console.log("  - Google:", process.env.GOOGLE_CLIENT_ID ? "✓ Configured" : "✗ Missing");
console.log("  - GitHub:", process.env.GITHUB_CLIENT_ID ? "✓ Configured" : "✗ Missing");

export const auth = betterAuth({
  // Database configuration - Better Auth uses Pool directly
  database: pool,

  // Security settings
  secret: process.env.BETTER_AUTH_SECRET || "secret-key-change-in-production",

  // Base URL configuration
  appUrl: process.env.APP_URL || "http://localhost:3000",
  baseURL: process.env.AUTH_URL || "http://localhost:3001",
  basePath: "/api/auth",

  // Trusted origins for CORS and OAuth redirects
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://physical-ai-book1-inky.vercel.app",
    "https://physical-ai-book1-muhammad-faizans-projects-c907627a.vercel.app",
  ],

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },

  // Social authentication providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },

  // Advanced options
  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    // CRITICAL: Must use SameSite=None for cross-domain authentication (Vercel -> Render)
    // This allows cookies to be sent with cross-origin requests during OAuth flow
    sameSiteCookieAttribute: process.env.NODE_ENV === "production" ? "none" : "lax",
  },

  // Logging for debugging
  logger: {
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
    disabled: false,
  },
});
