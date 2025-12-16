#!/bin/bash
# Development server script
# Starts backend (FastAPI) and Docusaurus concurrently with healthcheck

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "RAG Chatbot Development Server"
echo "========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check if .env exists
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo "❌ Error: backend/.env not found. Run ./scripts/setup-env.sh first."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "$PROJECT_ROOT/backend/venv" ]; then
    echo "❌ Error: Virtual environment not found. Run ./scripts/install.sh first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "❌ Error: Node modules not found. Run ./scripts/install.sh first."
    exit 1
fi

# Check if embeddings exist
if [ ! -f "$PROJECT_ROOT/backend/data/ingested_chunks.json" ]; then
    echo "⚠️  Warning: No ingested data found."
    echo "   Run ./scripts/ingest-book.sh and ./scripts/embed-book.sh to enable chatbot functionality."
    echo ""
fi

echo "✅ Prerequisites check passed"
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo "Servers stopped."
}

trap cleanup EXIT INT TERM

# Start backend
echo "========================================="
echo "Starting Backend (FastAPI)"
echo "========================================="
echo ""

cd "$PROJECT_ROOT"
source "$PROJECT_ROOT/backend/venv/bin/activate"

# Start backend in background
"$PROJECT_ROOT/scripts/start-backend.sh" &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo ""

# Wait for backend to start
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start after 30 seconds"
        exit 1
    fi
    sleep 1
    echo -n "."
done

echo ""
echo ""

# Start frontend
echo "========================================="
echo "Starting Frontend (Docusaurus)"
echo "========================================="
echo ""

cd "$PROJECT_ROOT"

# Start Docusaurus in background
npm start &
FRONTEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"
echo ""

# Wait for frontend to start
echo "Waiting for frontend to be ready..."
for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ Frontend failed to start after 60 seconds"
        exit 1
    fi
    sleep 1
    echo -n "."
done

echo ""
echo ""

# Print status
echo "========================================="
echo "✅ Development Server Running!"
echo "========================================="
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Health:   http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
wait
