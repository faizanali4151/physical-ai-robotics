#!/bin/bash
# Start FastAPI backend server with uvicorn
# Runs in development mode with auto-reload

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/backend/.env"

echo "========================================="
echo "Starting RAG Chatbot Backend"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env file not found. Run ./scripts/setup-env.sh first."
    exit 1
fi

# Load environment variables
source "$ENV_FILE"

# Check if virtual environment exists
if [ ! -d "$PROJECT_ROOT/backend/venv" ]; then
    echo "❌ Error: Virtual environment not found. Run ./scripts/install.sh first."
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source "$PROJECT_ROOT/backend/venv/bin/activate"

# Change to project root (uvicorn needs to be run from root for module imports)
cd "$PROJECT_ROOT"

echo "✅ Environment loaded"
echo ""
echo "Configuration:"
echo "  Backend port: $BACKEND_PORT"
echo "  Log level: $LOG_LEVEL"
echo "  CORS origins: $CORS_ORIGINS"
echo "  LLM provider: $LLM_PROVIDER"
echo ""
echo "Starting uvicorn server..."
echo "----------------------------------------"
echo ""

# Start uvicorn with reload
uvicorn backend.src.main:app \
    --host 0.0.0.0 \
    --port "$BACKEND_PORT" \
    --reload \
    --log-level "$(echo "$LOG_LEVEL" | tr '[:upper:]' '[:lower:]')" \
    --reload-dir backend/src
