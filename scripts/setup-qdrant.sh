#!/bin/bash
# Setup Qdrant collection using config/qdrant_schema.json
# Idempotent: checks if collection exists before creating

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_ROOT/config/qdrant_schema.json"
ENV_FILE="$PROJECT_ROOT/backend/.env"

echo "========================================="
echo "Qdrant Collection Setup"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env file not found. Run ./scripts/setup-env.sh first."
    exit 1
fi

# Load environment variables
source "$ENV_FILE"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Error: Qdrant schema not found at: $CONFIG_FILE"
    exit 1
fi

echo "✅ Found configuration: $CONFIG_FILE"
echo ""

# Extract configuration values
COLLECTION_NAME=$(cat "$CONFIG_FILE" | grep -o '"collection_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*: "\(.*\)".*/\1/')
VECTOR_SIZE=$(cat "$CONFIG_FILE" | grep -o '"size"[[:space:]]*:[[:space:]]*[0-9]*' | head -1 | sed 's/.*: \([0-9]*\).*/\1/')
DISTANCE=$(cat "$CONFIG_FILE" | grep -o '"distance"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*: "\(.*\)".*/\1/')

echo "Collection configuration:"
echo "  Name: $COLLECTION_NAME"
echo "  Vector size: $VECTOR_SIZE"
echo "  Distance metric: $DISTANCE"
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "❌ Error: curl is required but not installed"
    exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "⚠️  Warning: jq is not installed. Proceeding without pretty output."
    JQ_AVAILABLE=false
else
    JQ_AVAILABLE=true
fi

# Check if collection already exists
echo "Checking if collection exists..."

CHECK_RESPONSE=$(curl -s -X GET \
    -H "api-key: $QDRANT_API_KEY" \
    "$QDRANT_URL/collections/$COLLECTION_NAME")

if echo "$CHECK_RESPONSE" | grep -q '"status":"ok"'; then
    echo "⚠️  Collection '$COLLECTION_NAME' already exists."
    read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Deleting existing collection..."
        DELETE_RESPONSE=$(curl -s -X DELETE \
            -H "api-key: $QDRANT_API_KEY" \
            "$QDRANT_URL/collections/$COLLECTION_NAME")

        if echo "$DELETE_RESPONSE" | grep -q '"status":"ok"'; then
            echo "✅ Collection deleted successfully"
        else
            echo "❌ Error: Failed to delete collection"
            if [ "$JQ_AVAILABLE" = true ]; then
                echo "$DELETE_RESPONSE" | jq '.'
            else
                echo "$DELETE_RESPONSE"
            fi
            exit 1
        fi
    else
        echo "Setup cancelled. Existing collection preserved."
        exit 0
    fi
fi

# Create collection
echo ""
echo "Creating Qdrant collection..."

CREATE_PAYLOAD=$(cat <<EOF
{
  "vectors": {
    "size": $VECTOR_SIZE,
    "distance": "$DISTANCE"
  },
  "hnsw_config": {
    "m": 16,
    "ef_construct": 100
  }
}
EOF
)

CREATE_RESPONSE=$(curl -s -X PUT \
    -H "Content-Type: application/json" \
    -H "api-key: $QDRANT_API_KEY" \
    -d "$CREATE_PAYLOAD" \
    "$QDRANT_URL/collections/$COLLECTION_NAME")

if echo "$CREATE_RESPONSE" | grep -q '"status":"ok"'; then
    echo "✅ Collection '$COLLECTION_NAME' created successfully"
    echo ""

    # Get collection info
    echo "Collection details:"
    INFO_RESPONSE=$(curl -s -X GET \
        -H "api-key: $QDRANT_API_KEY" \
        "$QDRANT_URL/collections/$COLLECTION_NAME")

    if [ "$JQ_AVAILABLE" = true ]; then
        echo "$INFO_RESPONSE" | jq '.result'
    else
        echo "$INFO_RESPONSE"
    fi
else
    echo "❌ Error: Failed to create collection"
    if [ "$JQ_AVAILABLE" = true ]; then
        echo "$CREATE_RESPONSE" | jq '.'
    else
        echo "$CREATE_RESPONSE"
    fi
    exit 1
fi

echo ""
echo "========================================="
echo "Qdrant Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Setup Neon schema: ./scripts/setup-neon.sh"
echo "  2. Ingest book content: ./scripts/ingest-book.sh"
echo "  3. Generate embeddings: ./scripts/embed-book.sh"
echo ""
