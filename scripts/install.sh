#!/bin/bash
# Install script for RAG Chatbot
# Installs both backend (Python) and frontend (Node.js) dependencies

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================="
echo "RAG Chatbot Installation Script"
echo "========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Python 3.11+
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 11 ]); then
    echo "❌ Error: Python 3.11+ is required (found: $PYTHON_VERSION)"
    exit 1
fi

echo "✅ Python $PYTHON_VERSION"

# Check Node.js 18+
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required (found: $NODE_VERSION)"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm $NPM_VERSION"

# Check curl
if ! command -v curl &> /dev/null; then
    echo "⚠️  Warning: curl is not installed (required for API testing)"
    echo "   Install: Ubuntu/Debian: sudo apt-get install curl"
    echo "           macOS: brew install curl"
fi

# Check jq
if ! command -v jq &> /dev/null; then
    echo "⚠️  Warning: jq is not installed (recommended for JSON parsing)"
    echo "   Install: Ubuntu/Debian: sudo apt-get install jq"
    echo "           macOS: brew install jq"
fi

# Check git
if ! command -v git &> /dev/null; then
    echo "⚠️  Warning: git is not installed (required for version control)"
    echo "   Install: Ubuntu/Debian: sudo apt-get install git"
    echo "           macOS: brew install git"
else
    GIT_VERSION=$(git --version | awk '{print $3}')
    echo "✅ git $GIT_VERSION"
fi

echo ""
echo "Prerequisites check passed!"
echo ""

# Install backend dependencies
echo "========================================="
echo "Installing Backend Dependencies"
echo "========================================="
echo ""

cd "$PROJECT_ROOT/backend"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip --quiet

# Install requirements
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Backend dependencies installed successfully"
echo ""

# Deactivate virtual environment
deactivate

# Install frontend dependencies
echo "========================================="
echo "Installing Frontend Dependencies"
echo "========================================="
echo ""

cd "$PROJECT_ROOT/frontend/docusaurus-plugin-rag-chatbot"

echo "Installing Node.js dependencies..."
npm install

echo ""
echo "✅ Frontend dependencies installed successfully"
echo ""

# Summary
cd "$PROJECT_ROOT"

echo "========================================="
echo "Installation Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Configure environment: ./scripts/setup-env.sh"
echo "  2. Setup Qdrant: ./scripts/setup-qdrant.sh"
echo "  3. Setup Neon: ./scripts/setup-neon.sh"
echo "  4. Ingest book: ./scripts/ingest-book.sh"
echo "  5. Generate embeddings: ./scripts/embed-book.sh"
echo "  6. Start development: ./scripts/dev.sh"
echo ""
