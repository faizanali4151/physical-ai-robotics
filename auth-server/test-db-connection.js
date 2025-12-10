#!/usr/bin/env node
/**
 * Database Connection Test Script for Neon Postgres
 * This script tests your DATABASE_URL and verifies connectivity
 */

const { Pool } = require('pg');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function testConnection() {
  console.log(`${colors.cyan}🔍 Testing Neon Postgres Connection...${colors.reset}\n`);

  // Check if DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    console.error(`${colors.red}❌ ERROR: DATABASE_URL not found in .env file${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}📋 Connection String:${colors.reset}`);
  // Mask password in output
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
  console.log(`   ${maskedUrl}\n`);

  // Parse connection details
  const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^/]+)\/(.+)/;
  const match = process.env.DATABASE_URL.match(urlPattern);

  if (match) {
    const [, user, , host, dbWithParams] = match;
    const [database] = dbWithParams.split('?');

    console.log(`${colors.blue}📊 Connection Details:${colors.reset}`);
    console.log(`   User:     ${user}`);
    console.log(`   Host:     ${host}`);
    console.log(`   Database: ${database}`);
    console.log(`   SSL Mode: ${process.env.DATABASE_URL.includes('sslmode=require') ? 'Required' : 'Optional'}\n`);
  }

  // Create pool with proper SSL configuration
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Lenient for testing
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  try {
    // Test 1: Basic connectivity
    console.log(`${colors.yellow}🔌 Test 1: Testing basic connectivity...${colors.reset}`);
    const client = await pool.connect();
    console.log(`${colors.green}✅ Successfully connected to database!${colors.reset}\n`);

    // Test 2: Query version
    console.log(`${colors.yellow}🔍 Test 2: Checking PostgreSQL version...${colors.reset}`);
    const versionResult = await client.query('SELECT version()');
    const version = versionResult.rows[0].version;
    console.log(`${colors.green}✅ PostgreSQL Version: ${version.split(',')[0]}${colors.reset}\n`);

    // Test 3: Check database
    console.log(`${colors.yellow}📂 Test 3: Checking current database...${colors.reset}`);
    const dbResult = await client.query('SELECT current_database()');
    console.log(`${colors.green}✅ Current Database: ${dbResult.rows[0].current_database}${colors.reset}\n`);

    // Test 4: Check Better Auth tables
    console.log(`${colors.yellow}📋 Test 4: Checking Better Auth tables...${colors.reset}`);
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'sessions', 'accounts', 'verification_tokens', 'passwords')
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log(`${colors.green}✅ Found Better Auth tables:${colors.reset}`);
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      console.log();
    } else {
      console.log(`${colors.yellow}⚠️  No Better Auth tables found. You need to run migrations!${colors.reset}`);
      console.log(`${colors.cyan}   Run: npm run db:migrate${colors.reset}\n`);
    }

    // Test 5: Check pool status
    console.log(`${colors.yellow}🔧 Test 5: Pool statistics...${colors.reset}`);
    console.log(`   Total connections: ${pool.totalCount}`);
    console.log(`   Idle connections:  ${pool.idleCount}`);
    console.log(`   Waiting clients:   ${pool.waitingCount}\n`);

    client.release();

    console.log(`${colors.green}╔═══════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║  ✅ ALL TESTS PASSED SUCCESSFULLY!   ║${colors.reset}`);
    console.log(`${colors.green}╚═══════════════════════════════════════╝${colors.reset}\n`);

    if (tablesResult.rows.length === 0) {
      console.log(`${colors.yellow}⚠️  NEXT STEP: Run database migrations:${colors.reset}`);
      console.log(`${colors.cyan}   cd auth-server && npm run db:migrate${colors.reset}\n`);
    } else {
      console.log(`${colors.cyan}🚀 Your database is ready! Start the server with:${colors.reset}`);
      console.log(`${colors.cyan}   npm run dev${colors.reset}\n`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Database Connection Failed!${colors.reset}\n`);
    console.error(`${colors.red}Error Details:${colors.reset}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Code:    ${error.code || 'N/A'}`);

    if (error.message.includes('channel_binding')) {
      console.error(`\n${colors.yellow}💡 SOLUTION:${colors.reset}`);
      console.error(`   Remove 'channel_binding=require' from your DATABASE_URL`);
      console.error(`   Node.js pg library doesn't support channel binding`);
    } else if (error.message.includes('timeout')) {
      console.error(`\n${colors.yellow}💡 SOLUTION:${colors.reset}`);
      console.error(`   Connection timeout. Check your network or firewall settings`);
    } else if (error.message.includes('authentication')) {
      console.error(`\n${colors.yellow}💡 SOLUTION:${colors.reset}`);
      console.error(`   Check your database credentials (username/password)`);
    }

    console.error();
    process.exit(1);

  } finally {
    await pool.end();
    console.log(`${colors.cyan}🔌 Connection pool closed${colors.reset}`);
  }
}

// Run the test
testConnection().catch(error => {
  console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
  process.exit(1);
});
