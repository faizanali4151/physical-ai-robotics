#!/bin/bash
# Cleanup script for old conversation sessions
# Deletes Neon sessions older than 30 days

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/backend/.env"

echo "========================================="
echo "Cleanup Old Sessions Script"
echo "========================================="
echo ""

# Parse arguments
DAYS=30
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --days)
            DAYS="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--days N] [--dry-run]"
            exit 1
            ;;
    esac
done

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env file not found. Run ./scripts/setup-env.sh first."
    exit 1
fi

# Load environment variables
source "$ENV_FILE"

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

echo "Configuration:"
echo "  Delete sessions older than: $DAYS days"
echo "  Dry run: $DRY_RUN"
echo ""

# Count sessions to delete
echo "Checking for old sessions..."
echo ""

COUNT_QUERY="SELECT COUNT(*) FROM conversation_sessions WHERE last_activity < NOW() - INTERVAL '$DAYS days';"

SESSION_COUNT=$(psql "$NEON_CONNECTION_STRING" -t -c "$COUNT_QUERY" 2>/dev/null || echo "0")
SESSION_COUNT=$(echo "$SESSION_COUNT" | tr -d ' ')

if [ "$SESSION_COUNT" == "0" ]; then
    echo "✅ No sessions older than $DAYS days found."
    exit 0
fi

echo "Found $SESSION_COUNT session(s) older than $DAYS days."
echo ""

# Show sample of sessions to be deleted
echo "Sample of sessions to be deleted:"
SAMPLE_QUERY="SELECT id, user_id, last_activity FROM conversation_sessions WHERE last_activity < NOW() - INTERVAL '$DAYS days' LIMIT 5;"

psql "$NEON_CONNECTION_STRING" -c "$SAMPLE_QUERY"

echo ""

if [ "$DRY_RUN" = true ]; then
    echo "Dry run mode - no sessions deleted."
    echo ""
    echo "To delete these sessions, run without --dry-run:"
    echo "  ./scripts/cleanup-old-sessions.sh --days $DAYS"
    exit 0
fi

# Confirm deletion
read -p "Delete $SESSION_COUNT session(s)? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

# Delete old sessions
echo ""
echo "Deleting old sessions..."

DELETE_QUERY="DELETE FROM conversation_sessions WHERE last_activity < NOW() - INTERVAL '$DAYS days';"

if psql "$NEON_CONNECTION_STRING" -c "$DELETE_QUERY"; then
    echo ""
    echo "✅ Deleted $SESSION_COUNT session(s) successfully."
    echo ""
    echo "Note: Associated chat_messages were CASCADE deleted automatically."
else
    echo ""
    echo "❌ Failed to delete sessions."
    exit 1
fi

echo ""
echo "========================================="
echo "Cleanup Complete!"
echo "========================================="
echo ""
