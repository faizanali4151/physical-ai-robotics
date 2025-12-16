#!/bin/bash

# Test Better Auth OAuth Setup
# Run this script to verify everything is working

echo "======================================"
echo "  Better Auth OAuth Test Script"
echo "======================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header() {
    echo -e "${BLUE}━━━ $1 ━━━${NC}"
}

# Check if .env file exists
print_header "Step 1: Environment Configuration"
if [ -f ".env" ]; then
    print_success ".env file found"

    # Check database URL
    if grep -q "DATABASE_URL=" .env; then
        print_success "DATABASE_URL is set"
    else
        print_error "DATABASE_URL not found in .env"
    fi

    # Check auth secret
    if grep -q "BETTER_AUTH_SECRET=" .env; then
        print_success "BETTER_AUTH_SECRET is set"
    else
        print_error "BETTER_AUTH_SECRET not found in .env"
    fi

    # Check OAuth providers
    echo ""
    print_info "OAuth Providers:"
    if grep -q "^GITHUB_CLIENT_ID=" .env; then
        print_success "  GitHub: Configured"
    else
        print_error "  GitHub: Missing CLIENT_ID"
    fi

    if grep -q "^FACEBOOK_CLIENT_ID=" .env; then
        print_success "  Facebook: Configured"
    else
        print_info "  Facebook: Not configured (optional)"
    fi

    if grep -q "^GOOGLE_CLIENT_ID=" .env; then
        print_success "  Google: Configured"
    else
        print_info "  Google: Not configured (optional)"
    fi
else
    print_error ".env file not found!"
    echo "  Copy .env.example to .env and configure it"
    exit 1
fi

echo ""
print_header "Step 2: Database Tables"

# Check database connection and tables
echo "Checking database tables..."
node -e "
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query(\`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user', 'account', 'session', 'verification')
      ORDER BY table_name;
    \`);

    const tables = result.rows.map(r => r.table_name);
    const required = ['user', 'account', 'session', 'verification'];

    required.forEach(table => {
      if (tables.includes(table)) {
        console.log('✓ Table exists:', table);
      } else {
        console.log('✗ Table missing:', table);
        console.log('  Run: npm run db:migrate');
      }
    });

  } catch (error) {
    console.log('✗ Database connection failed:', error.message);
    console.log('  Check DATABASE_URL in .env');
  } finally {
    await pool.end();
  }
})();
" 2>&1

echo ""
print_header "Step 3: Server Status"

# Check if server is running
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Auth server is running on port 3001"

    # Test health endpoint
    HEALTH=$(curl -s http://localhost:3001/health)
    echo "  Response: $HEALTH"

    echo ""
    print_info "Testing OAuth endpoints..."

    # Test GitHub OAuth (should redirect, not 404)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/auth/sign-in/github)
    if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "307" ]; then
        print_success "  GitHub OAuth endpoint: Working (redirect $HTTP_CODE)"
    elif [ "$HTTP_CODE" = "404" ]; then
        print_error "  GitHub OAuth endpoint: 404 Not Found"
        echo "    This means OAuth is not properly configured"
    else
        print_info "  GitHub OAuth endpoint: HTTP $HTTP_CODE"
    fi

else
    print_info "Auth server is NOT running"
    echo ""
    echo "To start the server:"
    echo "  npm run dev"
    echo ""
    echo "Or if port 3001 is in use, kill the process:"
    echo "  lsof -ti:3001 | xargs kill -9"
    echo "  npm run dev"
fi

echo ""
print_header "Step 4: Integration Test"

echo "Manual testing steps:"
echo ""
echo "1. Start auth server (if not running):"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "2. Start your frontend:"
echo "   ${GREEN}cd .. && npm start${NC}"
echo ""
echo "3. Visit login page:"
echo "   ${BLUE}http://localhost:3000/login${NC}"
echo ""
echo "4. Click 'Sign in with GitHub'"
echo ""
echo "5. Expected flow:"
echo "   a) Redirect to: ${BLUE}http://localhost:3001/api/auth/sign-in/github${NC}"
echo "   b) Redirect to: ${BLUE}https://github.com/login/oauth/authorize?...${NC}"
echo "   c) After GitHub authorization:"
echo "      → ${BLUE}http://localhost:3001/api/auth/callback/github${NC}"
echo "      → ${BLUE}http://localhost:3000${NC} (your app)"
echo ""
echo "6. Verify in browser console:"
echo "   ${GREEN}✓ User authenticated via Better Auth${NC}"
echo "   ${GREEN}✓ [ChatWidget] Rendering widget${NC}"
echo ""
echo "7. Verify ChatWidget appears (robot icon in bottom-right)"
echo ""

echo ""
print_header "Summary"

echo ""
echo "📚 Documentation:"
echo "  - ${BLUE}OAUTH_SETUP_COMPLETE.md${NC} - Detailed setup guide"
echo "  - ${BLUE}../BETTER_AUTH_INTEGRATION_COMPLETE.md${NC} - Frontend integration"
echo ""
echo "🔧 Common Issues:"
echo ""
echo "  ${YELLOW}Issue:${NC} OAuth returns 404"
echo "  ${GREEN}Fix:${NC} Run 'npm run db:migrate' to create tables"
echo ""
echo "  ${YELLOW}Issue:${NC} Port 3001 already in use"
echo "  ${GREEN}Fix:${NC} lsof -ti:3001 | xargs kill -9"
echo ""
echo "  ${YELLOW}Issue:${NC} ChatWidget not appearing"
echo "  ${GREEN}Fix:${NC} Check frontend integration (see docs)"
echo ""
echo "======================================"
echo "For detailed troubleshooting, see:"
echo "  ${BLUE}OAUTH_SETUP_COMPLETE.md${NC}"
echo "======================================"
