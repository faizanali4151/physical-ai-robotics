#!/bin/bash
# Wrapper script for embedding generation
# Runs backend/src/cli/embed.py with progress bar and error handling

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "Embedding Generation Script"
echo "========================================="
echo ""

# Parse arguments
FULL_REBUILD=false
BATCH_SIZE=10
START_INDEX=0

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
        --batch-size)
            BATCH_SIZE="$2"
            shift 2
            ;;
        --start-index)
            START_INDEX="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--full-rebuild|--incremental] [--batch-size N] [--start-index N]"
            exit 1
            ;;
    esac
done

# Check if virtual environment exists
if [ ! -d "$PROJECT_ROOT/backend/venv" ]; then
    echo "❌ Error: Virtual environment not found. Run ./scripts/install.sh first."
    exit 1
fi

# Check if ingested data exists
if [ ! -f "$PROJECT_ROOT/backend/data/ingested_chunks.json" ]; then
    echo "❌ Error: Ingested data not found. Run ./scripts/ingest-book.sh first."
    exit 1
fi

# Activate virtual environment
source "$PROJECT_ROOT/backend/venv/bin/activate"

# Change to project root
cd "$PROJECT_ROOT"

# Build command
CMD="python backend/src/cli/embed.py --batch-size $BATCH_SIZE --start-index $START_INDEX"

if [ "$FULL_REBUILD" = true ]; then
    echo "Mode: Full rebuild (delete existing collection)"
    CMD="$CMD --full-rebuild"
    echo ""
    echo "⚠️  WARNING: This will delete all existing embeddings in Qdrant!"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Embedding generation cancelled."
        exit 0
    fi
else
    echo "Mode: Incremental (upsert to existing collection)"
fi

echo ""
echo "Batch size: $BATCH_SIZE"
echo "Start index: $START_INDEX"
echo ""
echo "Starting embedding generation..."
echo "----------------------------------------"
echo ""

# Run embedding generation
$CMD

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "========================================="
    echo "✅ Embedding Generation Complete!"
    echo "========================================="
    echo ""
    echo "Next step: Start the development server with ./scripts/dev.sh"
else
    echo "========================================="
    echo "❌ Embedding Generation Failed"
    echo "========================================="
    echo ""
    echo "Check the error messages above for details."
    echo ""
    echo "To resume from where it stopped, use:"
    echo "  ./scripts/embed-book.sh --start-index <last-successful-index>"
fi

echo ""

exit $EXIT_CODE
