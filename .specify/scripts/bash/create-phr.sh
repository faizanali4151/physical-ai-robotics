#!/bin/bash
# create-phr.sh - Create Prompt History Record

set -e

# Parse arguments
TITLE=""
STAGE=""
FEATURE="none"
OUTPUT_JSON=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --title)
      TITLE="$2"
      shift 2
      ;;
    --stage)
      STAGE="$2"
      shift 2
      ;;
    --feature)
      FEATURE="$2"
      shift 2
      ;;
    --json)
      OUTPUT_JSON=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate required arguments
if [ -z "$TITLE" ] || [ -z "$STAGE" ]; then
  echo "Error: --title and --stage are required"
  echo "Usage: $0 --title \"Title\" --stage <stage> [--feature <name>] [--json]"
  exit 1
fi

# Generate slug from title
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')

# Determine output directory based on stage
case $STAGE in
  constitution)
    OUTPUT_DIR="history/prompts/constitution"
    ;;
  spec|plan|tasks|red|green|refactor|explainer|misc)
    if [ "$FEATURE" = "none" ]; then
      echo "Error: Feature stages require --feature argument"
      exit 1
    fi
    OUTPUT_DIR="history/prompts/$FEATURE"
    ;;
  general)
    OUTPUT_DIR="history/prompts/general"
    ;;
  *)
    echo "Error: Invalid stage '$STAGE'"
    echo "Valid stages: constitution, spec, plan, tasks, red, green, refactor, explainer, misc, general"
    exit 1
    ;;
esac

# Create directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Find next available ID
ID=1
while [ -f "$OUTPUT_DIR/${ID}-"*".prompt.md" ]; do
  ID=$((ID + 1))
done

# Generate filename
FILENAME="${ID}-${SLUG}.${STAGE}.prompt.md"
OUTPUT_PATH="$OUTPUT_DIR/$FILENAME"

# Get current date
DATE_ISO=$(date +%Y-%m-%d)

# Get git info if available
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
USER=$(git config user.name 2>/dev/null || echo "unknown")

# Read template
TEMPLATE_PATH=".specify/templates/phr-template.prompt.md"
if [ ! -f "$TEMPLATE_PATH" ]; then
  TEMPLATE_PATH="templates/phr-template.prompt.md"
fi

if [ ! -f "$TEMPLATE_PATH" ]; then
  echo "Error: PHR template not found at $TEMPLATE_PATH"
  exit 1
fi

# Copy template and replace placeholders
cp "$TEMPLATE_PATH" "$OUTPUT_PATH"

# Replace placeholders
sed -i "s/{{ID}}/$ID/g" "$OUTPUT_PATH"
sed -i "s/{{TITLE}}/$TITLE/g" "$OUTPUT_PATH"
sed -i "s/{{STAGE}}/$STAGE/g" "$OUTPUT_PATH"
sed -i "s/{{DATE_ISO}}/$DATE_ISO/g" "$OUTPUT_PATH"
sed -i "s/{{SURFACE}}/agent/g" "$OUTPUT_PATH"
sed -i "s/{{MODEL}}/claude-sonnet-4-5/g" "$OUTPUT_PATH"
sed -i "s/{{FEATURE}}/$FEATURE/g" "$OUTPUT_PATH"
sed -i "s/{{BRANCH}}/$BRANCH/g" "$OUTPUT_PATH"
sed -i "s/{{USER}}/$USER/g" "$OUTPUT_PATH"
sed -i "s/{{COMMAND}}/\/sp.constitution/g" "$OUTPUT_PATH"
sed -i "s/{{LABELS_YAML}}/[\"constitution\", \"governance\"]/g" "$OUTPUT_PATH"
sed -i "s/{{SPEC_LINK}}/null/g" "$OUTPUT_PATH"
sed -i "s/{{TICKET_LINK}}/null/g" "$OUTPUT_PATH"
sed -i "s/{{ADR_LINK}}/null/g" "$OUTPUT_PATH"
sed -i "s/{{PR_LINK}}/null/g" "$OUTPUT_PATH"
sed -i "s/{{FILES_YAML}}/- .specify\/memory\/constitution.md/g" "$OUTPUT_PATH"
sed -i "s/{{TESTS_YAML}}/- none/g" "$OUTPUT_PATH"
sed -i "s/{{PROMPT_TEXT}}/See full prompt in record/g" "$OUTPUT_PATH"
sed -i "s/{{RESPONSE_TEXT}}/Constitution created successfully/g" "$OUTPUT_PATH"
sed -i "s/{{OUTCOME}}/Constitution v1.0.0 created with 10 core principles/g" "$OUTPUT_PATH"
sed -i "s/{{EVALUATION}}/Complete - all placeholders filled/g" "$OUTPUT_PATH"

# Output result
if [ "$OUTPUT_JSON" = true ]; then
  echo "{\"id\": $ID, \"path\": \"$OUTPUT_PATH\", \"stage\": \"$STAGE\", \"title\": \"$TITLE\"}"
else
  echo "PHR created: $OUTPUT_PATH"
  echo "  ID: $ID"
  echo "  Stage: $STAGE"
  echo "  Title: $TITLE"
fi
