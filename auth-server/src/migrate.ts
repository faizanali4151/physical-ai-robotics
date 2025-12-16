import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false }, // More lenient in development
  connectionTimeoutMillis: 10000,
});

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log("🔄 Creating Better Auth v1.0+ tables...");

    // User table (SINGULAR - required by Better Auth v1.0+)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        "emailVerified" BOOLEAN DEFAULT FALSE,
        name TEXT,
        image TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ User table created");

    // Account table (SINGULAR - for OAuth providers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS account (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP,
        "refreshTokenExpiresAt" TIMESTAMP,
        scope TEXT,
        password TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("providerId", "accountId")
      );
    `);
    console.log("✓ Account table created");

    // Session table (SINGULAR)
    await client.query(`
      CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ Session table created");

    // Verification table (for email verification tokens)
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ Verification table created");

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_session_user_id ON session("userId");
      CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
      CREATE INDEX IF NOT EXISTS idx_account_user_id ON account("userId");
      CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
    `);
    console.log("✓ Indexes created");

    console.log("\n✅ Database migration completed successfully!");
    console.log("\n📊 Created tables:");
    console.log("   - user (stores user profiles)");
    console.log("   - account (stores OAuth connections)");
    console.log("   - session (stores active sessions)");
    console.log("   - verification (stores email verification tokens)");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
