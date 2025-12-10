#!/bin/bash
# Interactive script to generate backend/.env file
# Prompts for API keys and configuration, validates credentials

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/backend/.env"
ENV_EXAMPLE="$PROJECT_ROOT/backend/.env.example"

echo "========================================="
echo "RAG Chatbot Environment Setup"
echo "========================================="
echo ""

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env file already exists at: $ENV_FILE"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Check if .env.example exists
if [ ! -f "$ENV_EXAMPLE" ]; then
    echo "❌ Error: .env.example not found at: $ENV_EXAMPLE"
    exit 1
fi

echo "This script will help you configure the RAG Chatbot backend."
echo "You will be prompted for API keys and connection strings."
echo ""

# LLM Provider
echo "========================================="
echo "LLM Provider Configuration"
echo "========================================="
echo ""
echo "Select LLM provider:"
echo "  1) Gemini (recommended - 15 RPM free tier)"
echo "  2) ChatKit (3 RPM free tier)"
echo ""
read -p "Enter choice (1 or 2): " LLM_CHOICE

if [ "$LLM_CHOICE" == "1" ]; then
    LLM_PROVIDER="gemini"
    echo ""
    echo "✅ Selected: Gemini"
    echo ""
    echo "Get your Gemini API key from: https://makersuite.google.com/app/apikey"
    read -p "Enter Gemini API key: " GEMINI_API_KEY
    CHATKIT_API_KEY=""
elif [ "$LLM_CHOICE" == "2" ]; then
    LLM_PROVIDER="chatkit"
    echo ""
    echo "✅ Selected: ChatKit"
    echo ""
    read -p "Enter ChatKit API key: " CHATKIT_API_KEY
    GEMINI_API_KEY=""
else
    echo "❌ Invalid choice. Exiting."
    exit 1
fi

# Qdrant Configuration
echo ""
echo "========================================="
echo "Qdrant Vector Store Configuration"
echo "========================================="
echo ""
echo "Get free Qdrant cluster at: https://cloud.qdrant.io/"
echo ""
read -p "Enter Qdrant URL (e.g., https://xyz.qdrant.io): " QDRANT_URL
read -p "Enter Qdrant API key: " QDRANT_API_KEY

# Neon Configuration
echo ""
echo "========================================="
echo "Neon Postgres Configuration"
echo "========================================="
echo ""
echo "Get free Neon database at: https://neon.tech/"
echo ""
read -p "Enter Neon connection string: " NEON_CONNECTION_STRING

# Backend Configuration
echo ""
echo "========================================="
echo "Backend Server Configuration"
echo "========================================="
echo ""
read -p "Enter backend port (default: 8000): " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-8000}

read -p "Enter CORS origins (comma-separated, default: http://localhost:3000,http://localhost:8000): " CORS_ORIGINS
CORS_ORIGINS=${CORS_ORIGINS:-http://localhost:3000,http://localhost:8000}

# Optional: Advanced Configuration
echo ""
echo "========================================="
echo "Advanced Configuration (Optional)"
echo "========================================="
echo ""
read -p "Enter log level (default: INFO): " LOG_LEVEL
LOG_LEVEL=${LOG_LEVEL:-INFO}

read -p "Enter chunk size in tokens (default: 512): " CHUNK_SIZE
CHUNK_SIZE=${CHUNK_SIZE:-512}

read -p "Enter chunk overlap in tokens (default: 128): " CHUNK_OVERLAP
CHUNK_OVERLAP=${CHUNK_OVERLAP:-128}

read -p "Enter top-k results (default: 5): " TOP_K_RESULTS
TOP_K_RESULTS=${TOP_K_RESULTS:-5}

read -p "Enter similarity threshold (default: 0.7): " SIMILARITY_THRESHOLD
SIMILARITY_THRESHOLD=${SIMILARITY_THRESHOLD:-0.7}

# Write .env file
echo ""
echo "========================================="
echo "Writing Configuration"
echo "========================================="
echo ""

cat > "$ENV_FILE" <<EOF
# LLM Provider Selection (gemini or chatkit)
LLM_PROVIDER=$LLM_PROVIDER

# Gemini API Configuration
GEMINI_API_KEY=$GEMINI_API_KEY

# ChatKit API Configuration
CHATKIT_API_KEY=$CHATKIT_API_KEY

# Qdrant Vector Store Configuration
QDRANT_URL=$QDRANT_URL
QDRANT_API_KEY=$QDRANT_API_KEY

# Neon Postgres Configuration
NEON_CONNECTION_STRING=$NEON_CONNECTION_STRING

# Backend Server Configuration
BACKEND_PORT=$BACKEND_PORT
CORS_ORIGINS=$CORS_ORIGINS

# Logging Configuration
LOG_LEVEL=$LOG_LEVEL

# RAG Configuration
CHUNK_SIZE=$CHUNK_SIZE
CHUNK_OVERLAP=$CHUNK_OVERLAP
TOP_K_RESULTS=$TOP_K_RESULTS
SIMILARITY_THRESHOLD=$SIMILARITY_THRESHOLD
EOF

echo "✅ Configuration written to: $ENV_FILE"
echo ""

# Validate credentials (basic test)
echo "========================================="
echo "Validating Credentials"
echo "========================================="
echo ""

# Test Gemini API key
if [ "$LLM_PROVIDER" == "gemini" ] && [ -n "$GEMINI_API_KEY" ]; then
    echo "Testing Gemini API key..."
    if command -v curl &> /dev/null; then
        GEMINI_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
            "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" || echo "000")
        if [ "$GEMINI_TEST" == "200" ]; then
            echo "✅ Gemini API key valid"
        else
            echo "⚠️  Gemini API key validation failed (HTTP $GEMINI_TEST). Please verify your API key."
        fi
    else
        echo "⚠️  curl not found, skipping Gemini validation"
    fi
fi

# Test Qdrant connection
echo "Testing Qdrant connection..."
if command -v curl &> /dev/null; then
    QDRANT_TEST=$(curl -s -o /dev/null -w "%{http_code}" -H "api-key: $QDRANT_API_KEY" "$QDRANT_URL/collections" || echo "000")
    if [ "$QDRANT_TEST" == "200" ]; then
        echo "✅ Qdrant connection successful"
    else
        echo "⚠️  Qdrant connection failed (HTTP $QDRANT_TEST). Please verify credentials."
    fi
else
    echo "⚠️  curl not found, skipping Qdrant validation"
fi

# Test Neon connection
echo "Testing Neon connection..."
if command -v psql &> /dev/null; then
    if psql "$NEON_CONNECTION_STRING" -c "SELECT 1" &> /dev/null; then
        echo "✅ Neon connection successful"
    else
        echo "⚠️  Neon connection failed. Please verify connection string."
    fi
else
    echo "⚠️  psql not found, skipping Neon validation"
fi

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Configuration saved to: $ENV_FILE"
echo ""
echo "Next steps:"
echo "  1. Setup Qdrant collection: ./scripts/setup-qdrant.sh"
echo "  2. Setup Neon schema: ./scripts/setup-neon.sh"
echo ""
