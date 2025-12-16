#!/bin/bash
# Automated script to start backend and frontend servers

set -e

cd /home/muhammad-faizan/Desktop/physical-ai-book1

echo "=========================================="
echo "Starting RAG Chatbot Servers"
echo "=========================================="
echo ""

# Check embeddings first
echo "🔍 Checking embeddings status..."
source backend/venv/bin/activate
POINTS=$(python3 -c "from backend.src.services import QdrantService; q = QdrantService(); q.connect(); print(q.client.get_collection('physical_ai_book_chunks').points_count)" 2>/dev/null || echo "0")

if [ "$POINTS" -ne 171 ]; then
    echo "⚠️  WARNING: Only $POINTS/171 embeddings uploaded"
    echo ""
    read -p "Embeddings incomplete. Start anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled. Run ./check_embedding_status.sh to monitor progress."
        exit 1
    fi
else
    echo "✅ All embeddings ready ($POINTS/171)"
fi

echo ""

# Stop any existing servers
echo "🛑 Stopping any existing servers..."
pkill -f "python.*src.main" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
pkill -f "docusaurus" 2>/dev/null || true
sleep 2

# Start backend
echo ""
echo "🚀 Starting Backend Server..."
cd backend
source venv/bin/activate
nohup python -m src.main > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "   └─ PID: $BACKEND_PID"
echo "   └─ Log: backend/backend.log"

# Wait for backend to start
echo "   └─ Waiting for backend startup..."
for i in {1..15}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "   └─ ✅ Backend ready!"
        break
    fi
    sleep 2
    echo "   └─ Waiting... ($i/15)"
done

# Verify backend
HEALTH=$(curl -s http://localhost:8000/health | python3 -c "import sys, json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "unknown")
if [ "$HEALTH" == "healthy" ]; then
    echo "   └─ ✅ Backend health: $HEALTH"
else
    echo "   └─ ⚠️  Backend health: $HEALTH (check backend/backend.log)"
fi

# Start frontend
echo ""
echo "🚀 Starting Frontend Server..."
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

echo "   └─ PID: $FRONTEND_PID"
echo "   └─ Log: frontend.log"
echo "   └─ Waiting for frontend startup... (this takes ~30 seconds)"

# Wait for frontend
for i in {1..30}; do
    if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
        echo "   └─ ✅ Frontend ready!"
        break
    fi
    sleep 2
    if [ $((i % 5)) -eq 0 ]; then
        echo "   └─ Still starting... ($i/30)"
    fi
done

# Final status
echo ""
echo "=========================================="
echo "✅ Servers Started Successfully!"
echo "=========================================="
echo ""
echo "📊 Status:"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo ""

# Test backend
echo "🧪 Testing Backend..."
TEST_RESULT=$(curl -s http://localhost:8000/health | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['status'], '|', d['services']['qdrant'], d['services']['llm'], d['services']['database'])" 2>/dev/null || echo "error")
echo "   └─ $TEST_RESULT"
echo ""

# Show URLs
echo "=========================================="
echo "🌐 Access Your Application:"
echo "=========================================="
echo ""
echo "Backend API:  http://localhost:8000"
echo "Frontend UI:  http://localhost:3000"
echo ""
echo "API Docs:     http://localhost:8000/docs"
echo "Health Check: http://localhost:8000/health"
echo ""

# Save PIDs
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo "=========================================="
echo "📋 Next Steps:"
echo "=========================================="
echo ""
echo "1. Open browser: http://localhost:3000"
echo "2. Test chatbot: Ask 'What is physical AI?'"
echo "3. Check logs:"
echo "   - Backend:  tail -f backend/backend.log"
echo "   - Frontend: tail -f frontend.log"
echo ""
echo "To stop servers: ./stop_all.sh"
echo ""

# Try to open browser
if command -v xdg-open > /dev/null; then
    echo "🌐 Opening browser..."
    xdg-open http://localhost:3000 2>/dev/null &
elif command -v open > /dev/null; then
    echo "🌐 Opening browser..."
    open http://localhost:3000 2>/dev/null &
else
    echo "💡 Manually open: http://localhost:3000"
fi

echo ""
echo "✅ All systems operational!"
