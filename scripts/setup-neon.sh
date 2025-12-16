#!/bin/bash
# Setup Neon Postgres schema using config/neon_schema.sql
# Idempotent: uses CREATE TABLE IF NOT EXISTS

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SCHEMA_FILE="$PROJECT_ROOT/config/neon_schema.sql"
ENV_FILE="$PROJECT_ROOT/backend/.env"

echo "========================================="
echo "Neon Postgres Schema Setup"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env file not found. Run ./scripts/setup-env.sh first."
    exit 1
fi

# Load environment variables
source "$ENV_FILE"

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Error: Schema file not found at: $SCHEMA_FILE"
    exit 1
fi

echo "✅ Found schema: $SCHEMA_FILE"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql (PostgreSQL client) is required but not installed"
    echo ""
    echo "Install instructions:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  macOS: brew install postgresql"
    echo "  Fedora/RHEL: sudo dnf install postgresql"
    echo ""
    exit 1
fi

echo "Connecting to Neon Postgres..."
echo ""

# Execute schema
echo "Executing schema..."

if psql "$NEON_CONNECTION_STRING" -f "$SCHEMA_FILE"; then
    echo ""
    echo "✅ Schema executed successfully"
    echo ""

    # Verify tables created
    echo "Verifying tables..."
    echo ""

    TABLES=$(psql "$NEON_CONNECTION_STRING" -t -c "
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    ")

    echo "Created tables:"
    echo "$TABLES" | sed 's/^/  - /'

    # Get table counts
    echo ""
    echo "Table statistics:"

    SESSIONS_COUNT=$(psql "$NEON_CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM conversation_sessions;")
    MESSAGES_COUNT=$(psql "$NEON_CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM chat_messages;")

    echo "  - conversation_sessions: $SESSIONS_COUNT rows"
    echo "  - chat_messages: $MESSAGES_COUNT rows"

else
    echo ""
    echo "❌ Error: Failed to execute schema"
    exit 1
fi

echo ""
echo "========================================="
echo "Neon Setup Complete!"
echo "========================================="
echo ""
echo "Database schema is ready for conversation history storage."
echo ""
echo "Next steps:"
echo "  1. Ingest book content: ./scripts/ingest-book.sh"
echo "  2. Generate embeddings: ./scripts/embed-book.sh"
echo "  3. Start development: ./scripts/dev.sh"
echo ""
