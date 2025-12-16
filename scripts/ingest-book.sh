#!/bin/bash
# Wrapper script for book ingestion
# Runs backend/src/cli/ingest.py with --full-rebuild or --incremental flags

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "Book Ingestion Script"
echo "========================================="
echo ""

# Parse arguments
FULL_REBUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --full-rebuild)
            FULL_REBUILD=true
            shift
            ;;
        --incremental)
            FULL_REBUILD=false
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--full-rebuild|--incremental]"
            exit 1
            ;;
    esac
done

# Check if virtual environment exists
if [ ! -d "$PROJECT_ROOT/backend/venv" ]; then
    echo "❌ Error: Virtual environment not found. Run ./scripts/install.sh first."
    exit 1
fi

# Activate virtual environment
source "$PROJECT_ROOT/backend/venv/bin/activate"

# Change to project root
cd "$PROJECT_ROOT"

# Build command
CMD="python backend/src/cli/ingest.py"

if [ "$FULL_REBUILD" = true ]; then
    echo "Mode: Full rebuild (ignore existing data)"
    CMD="$CMD --full-rebuild"
else
    echo "Mode: Incremental (skip unchanged files)"
fi

echo ""
echo "Starting ingestion..."
echo "----------------------------------------"
echo ""

# Run ingestion
$CMD

echo ""
echo "========================================="
echo "Ingestion Complete!"
echo "========================================="
echo ""
echo "Next step: Generate embeddings with ./scripts/embed-book.sh"
echo ""
