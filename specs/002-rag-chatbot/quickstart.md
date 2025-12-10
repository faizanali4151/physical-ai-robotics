# Quickstart: RAG Chatbot Setup and Deployment

**Feature**: RAG Chatbot for Physical AI Book
**Target Audience**: Developers, instructors, self-hosters
**Prerequisites**: Node.js 18+, Python 3.11+, bash shell (Linux/macOS or WSL on Windows)

---

## Overview

This guide walks through the complete setup process for the RAG chatbot, from installation to deployment. All steps are CLI-driven with no manual configuration required.

**Time Estimate**: 15-20 minutes (excluding API key signup)

---

## Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/physical-ai-book.git
cd physical-ai-book
git checkout 002-rag-chatbot
```

---

## Step 2: Install Dependencies

Run the installation script to set up both backend and frontend dependencies:

```bash
./scripts/install.sh
```

**What it does**:
- Installs Python dependencies: `pip install -r backend/requirements.txt`
- Installs Node dependencies: `cd frontend/docusaurus-plugin-rag-chatbot && npm install`
- Validates Python 3.11+ and Node.js 18+ are installed
- Checks for required system tools (`curl`, `jq`, `git`)

**Expected output**:
```
✓ Python 3.11.5 detected
✓ Node.js 18.17.0 detected
✓ Installing backend dependencies...
✓ Installing frontend dependencies...
✓ Installation complete!
```

**Troubleshooting**:
- **Error: `python3: command not found`**: Install Python 3.11+ from [python.org](https://python.org)
- **Error: `npm: command not found`**: Install Node.js 18+ from [nodejs.org](https://nodejs.org)

---

## Step 3: Configure Environment Variables

### 3.1 Sign Up for Free-Tier Services

Before running the setup script, obtain API keys and connection URLs for the following services:

#### Gemini API (Google Generative AI)
1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (format: `AIzaSy...`)
4. **Free Tier**: 15 RPM, 1 million tokens/month

#### Qdrant Cloud
1. Go to [https://cloud.qdrant.io](https://cloud.qdrant.io)
2. Sign up for free account
3. Create a new cluster (select "Free" tier, 1GB storage)
4. Copy the cluster URL (format: `https://xyz.qdrant.io`)
5. Copy the API key from "API Keys" tab

#### Neon Postgres
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project
4. Copy the connection string from "Connection Details" (format: `postgres://user:pass@host/db`)
5. **Free Tier**: 512MB storage, 3GB data transfer/month

### 3.2 Run Setup Script

```bash
./scripts/setup-env.sh
```

**Interactive prompts**:
```
Enter your Gemini API key (AIzaSy...): [paste key]
Enter your Qdrant cluster URL (https://...): [paste URL]
Enter your Qdrant API key: [paste key]
Enter your Neon connection string (postgres://...): [paste connection string]
Enter backend API port [8000]: [press Enter for default]
```

**What it does**:
- Creates `backend/.env` file with provided credentials
- Validates API keys by testing connections
- Creates `frontend/docusaurus-plugin-rag-chatbot/.env` with `REACT_APP_API_ENDPOINT`

**Expected output**:
```
✓ Gemini API key validated
✓ Qdrant connection successful
✓ Neon connection successful
✓ Environment configuration complete!
✓ .env file created at backend/.env
```

**Troubleshooting**:
- **Error: `Invalid Gemini API key`**: Verify key format and check quota at [console.cloud.google.com](https://console.cloud.google.com)
- **Error: `Qdrant connection failed`**: Check cluster URL format and ensure API key is correct
- **Error: `Neon connection failed`**: Verify connection string includes username, password, and database name

---

## Step 4: Initialize Database and Vector Store

### 4.1 Create Qdrant Collection

```bash
./scripts/setup-qdrant.sh
```

**What it does**:
- Reads collection configuration from `config/qdrant_schema.json`
- Creates collection `physical_ai_book_chunks` with:
  - Vector size: 768 (Gemini embeddings)
  - Distance metric: Cosine similarity
  - Optimized for semantic search
- Checks if collection exists (idempotent operation)

**Expected output**:
```
✓ Connecting to Qdrant at https://xyz.qdrant.io
✓ Creating collection 'physical_ai_book_chunks'
✓ Collection created successfully (768 dimensions, Cosine distance)
```

### 4.2 Create Neon Schema

```bash
./scripts/setup-neon.sh
```

**What it does**:
- Reads schema DDL from `config/neon_schema.sql`
- Creates tables: `conversation_sessions`, `chat_messages`
- Creates indexes: `session_id`, `timestamp`
- Checks if schema exists (idempotent operation)

**Expected output**:
```
✓ Connecting to Neon at ep-xyz.us-east-2.aws.neon.tech
✓ Creating table 'conversation_sessions'
✓ Creating table 'chat_messages'
✓ Creating indexes
✓ Schema created successfully
```

---

## Step 5: Ingest and Embed Book Content

### 5.1 Ingest Docusaurus Markdown

```bash
./scripts/ingest-book.sh
```

**What it does**:
- Scans `docs/` directory for markdown files
- Parses frontmatter (chapter number, title)
- Extracts content (skips code blocks with language annotation)
- Chunks content into 512-token segments (128-token overlap)
- Saves chunks to temporary JSON file: `backend/data/chunks.json`

**Expected output**:
```
✓ Scanning docs/ directory
✓ Found 15 chapters
✓ Parsing chapter 1: Introduction to Physical AI
✓ Parsing chapter 2: Foundations of Robotics
...
✓ Parsing chapter 15: Getting Started & Resources
✓ Generated 345 chunks (avg 23 chunks/chapter)
✓ Saved to backend/data/chunks.json
```

**Troubleshooting**:
- **Error: `No markdown files found`**: Verify `docs/` directory exists and contains `.md` files
- **Warning: `Skipping malformed chapter X`**: Check markdown frontmatter format (YAML)

### 5.2 Generate Embeddings and Index

```bash
./scripts/embed-book.sh
```

**What it does**:
- Reads chunks from `backend/data/chunks.json`
- Generates embeddings via Gemini API (batch size: 10 chunks/request)
- Upserts to Qdrant with chapter metadata
- Shows progress bar (e.g., `[=====>    ] 50% (172/345)`)

**Expected output**:
```
✓ Loading 345 chunks from backend/data/chunks.json
✓ Generating embeddings (batch size: 10)
[==========] 100% (345/345) - ETA: 0s
✓ Upserting to Qdrant collection 'physical_ai_book_chunks'
✓ Indexing complete! 345 chunks embedded.
✓ Storage used: 1.24 MB (0.12% of 1GB limit)
```

**Troubleshooting**:
- **Error: `Rate limit exceeded (429)`**: Slow down batch size or wait 60 seconds
- **Error: `Qdrant storage limit reached`**: Delete old embeddings or upgrade to paid tier

---

## Step 6: Start Development Environment

```bash
./scripts/dev.sh
```

**What it does**:
- Starts FastAPI backend: `uvicorn backend.src.main:app --reload --port 8000`
- Starts Docusaurus dev server: `npm start` (port 3000)
- Opens browser at `http://localhost:3000`

**Expected output**:
```
✓ Starting backend at http://localhost:8000
✓ Starting Docusaurus at http://localhost:3000
✓ Backend health check: PASS
✓ Dev environment ready!

Press Ctrl+C to stop both servers.
```

**Verify setup**:
1. Navigate to `http://localhost:3000`
2. Look for chat widget in bottom-right corner (floating icon)
3. Click widget to open chat interface
4. Type a test query: "What is Physical AI?"
5. Verify answer appears within 3 seconds

---

## Step 7: Test the Chatbot

### 7.1 Basic Query Test

**Query**: "What is embodied intelligence?"

**Expected behavior**:
- Answer appears within 3 seconds
- Answer references Chapter 1 content
- Source chips show "Introduction to Physical AI"
- Message saved to conversation history

### 7.2 Selected Text Query Test

1. Highlight this text on a book page: "Zero Moment Point (ZMP)"
2. Type query: "Explain this concept"
3. Verify answer specifically addresses ZMP (from Chapter 7)

### 7.3 Conversation History Test

1. Ask 3 different questions
2. Close browser tab
3. Reopen `http://localhost:3000`
4. Verify chat history restored (3 previous messages visible)

### 7.4 Clear History Test

1. Click "Clear History" button in chat widget
2. Confirm deletion in dialog
3. Verify chat interface resets to empty state

---

## Step 8: Deploy to Production

### 8.1 Deploy Backend

**Option A: Render (Recommended)**

```bash
./scripts/deploy.sh --backend render
```

**What it does**:
- Builds backend Docker image
- Pushes to Render via Render API
- Sets environment variables from `backend/.env`
- Deploys to free-tier web service (512MB RAM, 400 build minutes/month)

**Expected output**:
```
✓ Building backend Docker image
✓ Pushing to Render
✓ Deploying to https://rag-chatbot-xyz.onrender.com
✓ Health check: PASS
✓ Backend deployed successfully!
```

**Option B: Railway**

```bash
./scripts/deploy.sh --backend railway
```

**Option C: Fly.io**

```bash
./scripts/deploy.sh --backend flyio
```

### 8.2 Deploy Frontend

**Option A: Vercel (Recommended)**

```bash
./scripts/deploy.sh --frontend vercel
```

**What it does**:
- Builds Docusaurus static site: `npm run build`
- Deploys `build/` directory to Vercel via Vercel CLI
- Sets `REACT_APP_API_ENDPOINT` to production backend URL
- Free tier: 100GB bandwidth/month, unlimited builds

**Expected output**:
```
✓ Building Docusaurus site
✓ Deploying to Vercel
✓ Production URL: https://physical-ai-book.vercel.app
✓ Frontend deployed successfully!
```

**Option B: Netlify**

```bash
./scripts/deploy.sh --frontend netlify
```

**Option C: GitHub Pages**

```bash
./scripts/deploy.sh --frontend github-pages
```

### 8.3 Update Frontend API Endpoint

After backend deployment, update frontend to point to production API:

```bash
# Edit docusaurus.config.js
plugins: [
  ['./docusaurus-plugin-rag-chatbot', {
    apiEndpoint: 'https://rag-chatbot-xyz.onrender.com',  // ← Update this
    theme: 'auto'
  }]
]

# Redeploy frontend
./scripts/deploy.sh --frontend vercel
```

---

## Step 9: Monitor and Maintain

### 9.1 Set Up Monitoring

**Healthchecks.io (Free)**:
1. Sign up at [healthchecks.io](https://healthchecks.io)
2. Create new check: `GET https://rag-chatbot-xyz.onrender.com/health` (60-second interval)
3. Configure alerts: Email or Slack on failure

**Expected health response**:
```json
{
  "status": "healthy",
  "dependencies": {
    "qdrant": {"status": "healthy", "latency_ms": 45},
    "neon": {"status": "healthy", "latency_ms": 32},
    "llm_api": {"status": "healthy", "provider": "gemini", "latency_ms": 120}
  },
  "timestamp": "2025-12-07T10:30:00Z"
}
```

### 9.2 Clean Up Old Sessions

Run cleanup script weekly to delete sessions older than 30 days:

```bash
./scripts/cleanup-old-sessions.sh
```

### 9.3 Re-ingest Book Content (Updates)

When book content changes, re-run ingestion and embedding:

```bash
./scripts/ingest-book.sh --full-rebuild
./scripts/embed-book.sh --full-rebuild
```

**Note**: `--full-rebuild` deletes old embeddings before creating new ones (vs `--incremental` which only processes changed chapters).

---

## Troubleshooting

### Issue: Chat widget not appearing

**Solution**:
1. Check browser console for errors (`F12` → Console tab)
2. Verify plugin configured in `docusaurus.config.js`
3. Ensure Docusaurus dev server is running (`npm start`)

### Issue: "Service unavailable" error

**Solution**:
1. Check backend health: `curl http://localhost:8000/health`
2. Verify Qdrant and Neon connections in backend logs
3. Re-run `./scripts/setup-env.sh` to validate credentials

### Issue: Slow responses (>5 seconds)

**Solution**:
1. Check Gemini API quota: [console.cloud.google.com](https://console.cloud.google.com)
2. Reduce `top_k` parameter in frontend (5 → 3)
3. Optimize chunking strategy (re-ingest with smaller chunks)

### Issue: Rate limit errors (429)

**Solution**:
1. Implement caching for frequent queries (backend)
2. Add request queue with exponential backoff (backend)
3. Debounce user input (frontend: 500ms delay)

---

## Summary

✅ **Completed Steps**:
1. Installed dependencies (Python, Node.js)
2. Configured environment variables (Gemini, Qdrant, Neon)
3. Initialized database and vector store
4. Ingested and embedded 15 book chapters (345 chunks)
5. Started dev environment (backend + frontend)
6. Tested chatbot functionality (queries, history, clear)
7. Deployed to production (Render + Vercel)
8. Set up monitoring and maintenance

**Next Steps**:
- Customize chat widget styling (CSS in `frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/styles.module.css`)
- Add analytics tracking (Google Analytics, Plausible)
- Implement feedback mechanism (thumbs up/down on answers)
- Expand book content and re-embed

**Support**:
- Issues: [github.com/yourusername/physical-ai-book/issues](https://github.com/yourusername/physical-ai-book/issues)
- Discussions: [github.com/yourusername/physical-ai-book/discussions](https://github.com/yourusername/physical-ai-book/discussions)
