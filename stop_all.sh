#!/bin/bash
# Stop all servers

cd /home/muhammad-faizan/Desktop/physical-ai-book1

echo "=========================================="
echo "Stopping RAG Chatbot Servers"
echo "=========================================="
echo ""

# Stop backend
echo "🛑 Stopping Backend Server..."
if pkill -f "python.*src.main"; then
    echo "   └─ ✅ Backend stopped"
else
    echo "   └─ ℹ️  Backend was not running"
fi

# Stop frontend
echo ""
echo "🛑 Stopping Frontend Server..."
if pkill -f "npm.*start" || pkill -f "docusaurus"; then
    echo "   └─ ✅ Frontend stopped"
else
    echo "   └─ ℹ️  Frontend was not running"
fi

# Remove PID files
rm -f .backend.pid .frontend.pid

echo ""
echo "=========================================="
echo "✅ All Servers Stopped"
echo "=========================================="
echo ""
echo "To start again: ./start_all.sh"
