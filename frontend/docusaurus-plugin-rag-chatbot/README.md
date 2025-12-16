# Docusaurus RAG Chatbot Plugin

A Docusaurus plugin that adds an AI-powered RAG (Retrieval-Augmented Generation) chatbot to your documentation site. The chatbot answers questions based solely on your book content using vector similarity search and LLM generation.

## Features

- 🤖 **Book-Content-Only Responses**: Answers questions strictly based on your documentation
- 💬 **Floating Chat Widget**: Non-intrusive UI with modal interface
- 🎯 **Selected Text Queries**: Highlight text and ask questions about it
- 📚 **Source Citations**: Shows which chapters were used for each answer
- 💾 **Conversation History**: Persists across browser sessions
- 📱 **Responsive Design**: Works on desktop and mobile
- ⚡ **Real-time Feedback**: Loading states and error handling
- 🎨 **Customizable Styling**: Theme integration with Docusaurus

## Prerequisites

- **Backend**: Python 3.11+, FastAPI, Qdrant, Neon Postgres, Gemini API
- **Frontend**: Node.js 18+, React 18+, Docusaurus 3.x
- **APIs**: Gemini API key (free tier: 15 RPM), Qdrant Cloud (free tier: 1GB), Neon Postgres (free tier: 512MB)

## Installation

### 1. Install Dependencies

```bash
# From repository root
./scripts/install.sh
```

This will install:
- Backend Python dependencies (FastAPI, Qdrant client, Gemini SDK, etc.)
- Frontend Node.js dependencies

### 2. Configure Environment

```bash
./scripts/setup-env.sh
```

Prompts for:
- **LLM Provider**: Gemini (recommended) or ChatKit
- **Gemini API Key**: Get from https://makersuite.google.com/app/apikey
- **Qdrant URL & API Key**: Get from https://cloud.qdrant.io/
- **Neon Connection String**: Get from https://neon.tech/
- **Backend Port**: Default 8000
- **CORS Origins**: Allowed origins for API requests

### 3. Setup Databases

```bash
# Create Qdrant collection
./scripts/setup-qdrant.sh

# Create Neon Postgres schema
./scripts/setup-neon.sh
```

### 4. Ingest Book Content

```bash
# Parse markdown files and chunk content
./scripts/ingest-book.sh --full-rebuild

# Generate embeddings and upload to Qdrant
./scripts/embed-book.sh --full-rebuild
```

### 5. Register Plugin

Add to your `docusaurus.config.js`:

\`\`\`javascript
module.exports = {
  plugins: [
    [
      './frontend/docusaurus-plugin-rag-chatbot',
      {
        apiEndpoint: process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000',
      },
    ],
  ],
};
\`\`\`

### 6. Start Development Server

```bash
./scripts/dev.sh
```

Opens:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Configuration Options

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiEndpoint` | string | `http://localhost:8000` | Backend API URL |

### Environment Variables

**Backend (.env file)**:

```bash
# LLM Provider
LLM_PROVIDER=gemini                    # gemini or chatkit

# Gemini Configuration
GEMINI_API_KEY=your_api_key_here

# Qdrant Configuration
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_key

# Neon Postgres Configuration
NEON_CONNECTION_STRING=postgres://user:password@host/database

# Server Configuration
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# RAG Configuration (optional)
CHUNK_SIZE=512                         # Tokens per chunk
CHUNK_OVERLAP=128                      # Overlapping tokens
TOP_K_RESULTS=5                        # Results to retrieve
SIMILARITY_THRESHOLD=0.7               # Minimum similarity score
LOG_LEVEL=INFO                         # Logging level
```

**Frontend (environment variables)**:

```bash
REACT_APP_API_ENDPOINT=http://localhost:8000   # Backend URL
```

## Usage

### For End Users

1. **Ask Questions**: Click the floating chat button (💬) at the bottom-right
2. **Type Query**: Enter your question in the text box
3. **Submit**: Press Enter or click "Send"
4. **View Answer**: See AI-generated response with source citations
5. **Selected Text**: Highlight text on the page before asking for context-aware answers
6. **Clear History**: Click the trash icon (🗑️) to reset conversation

### For Developers

#### CLI Commands

```bash
# Install dependencies
./scripts/install.sh

# Configure environment
./scripts/setup-env.sh

# Setup databases
./scripts/setup-qdrant.sh
./scripts/setup-neon.sh

# Ingest and embed book content
./scripts/ingest-book.sh --full-rebuild
./scripts/embed-book.sh --full-rebuild

# Start development servers
./scripts/dev.sh

# Cleanup old sessions (>30 days)
./scripts/cleanup-old-sessions.sh --days 30 --dry-run

# Deploy to production
./scripts/deploy.sh --backend render --frontend vercel
```

#### Incremental Updates

```bash
# Incremental ingestion (skip unchanged files)
./scripts/ingest-book.sh --incremental

# Incremental embedding (only new/changed chapters)
./scripts/embed-book.sh --incremental
```

## Troubleshooting

### Common Issues

**1. "Backend not responding"**

- Check if backend is running: `curl http://localhost:8000/health`
- Verify .env file exists: `backend/.env`
- Check logs in terminal running `./scripts/dev.sh`

**2. "Rate limit exceeded"**

- Gemini Free Tier: 15 requests per minute
- Wait 60 seconds and retry
- Consider upgrading to paid tier for higher limits

**3. "No relevant content found"**

- Question may be outside book scope
- Chatbot only answers based on ingested content
- Try rephrasing with keywords from the book

**4. "Collection not found"**

- Run `./scripts/setup-qdrant.sh` to create collection
- Verify Qdrant credentials in backend/.env

**5. "Database connection failed"**

- Check Neon connection string in backend/.env
- Verify Neon database is running
- Run `./scripts/setup-neon.sh` to create schema

### Debug Mode

Enable detailed logging:

```bash
# In backend/.env
LOG_LEVEL=DEBUG
```

Restart backend to see detailed logs.

### Health Checks

```bash
# Check all services
curl http://localhost:8000/health

# Response:
# {
#   "status": "healthy",
#   "services": {
#     "qdrant": "ok",
#     "llm": "ok",
#     "database": "ok"
#   }
# }
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  User Browser                        │
│  ┌──────────────────────────────────────────────┐  │
│  │    Docusaurus Site (Frontend)                │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │   RAG Chatbot Plugin                   │  │  │
│  │  │  - Chat Widget UI                      │  │  │
│  │  │  - API Client (retry logic)            │  │  │
│  │  │  - Session Management                  │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                      ↓ HTTP/JSON
┌─────────────────────────────────────────────────────┐
│              FastAPI Backend                         │
│  ┌──────────────────────────────────────────────┐  │
│  │  RAG Service                                 │  │
│  │  - Query embedding                           │  │
│  │  - Vector search (Qdrant)                    │  │
│  │  - Context retrieval                         │  │
│  │  - LLM answer generation (Gemini)            │  │
│  │  - History persistence (Neon)                │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
           ↓                  ↓                  ↓
    [Qdrant Cloud]     [Gemini API]     [Neon Postgres]
```

## API Reference

### POST /query

Submit a user query and get RAG-generated answer.

**Request**:

\`\`\`json
{
  "query": "What is embodied intelligence?",
  "selected_text": "...",  // optional
  "top_k": 5,               // optional
  "session_id": "uuid"      // optional
}
\`\`\`

**Response**:

\`\`\`json
{
  "answer": "Embodied intelligence refers to...",
  "sources": [
    {
      "chunk_text": "...",
      "chapter_number": 1,
      "chapter_title": "Chapter 1",
      "similarity_score": 0.89,
      "position": 3
    }
  ],
  "session_id": "uuid",
  "message_id": "uuid"
}
\`\`\`

### GET /health

Check backend service status.

**Response**:

\`\`\`json
{
  "status": "healthy",
  "services": {
    "qdrant": "ok",
    "llm": "ok",
    "database": "ok"
  }
}
\`\`\`

## License

MIT

## Contributing

Pull requests welcome! Please ensure:
- All scripts are idempotent
- Error messages are clear and actionable
- Documentation is updated
- CLI-first approach is maintained

## Support

- GitHub Issues: https://github.com/your-repo/issues
- Documentation: https://your-docs-site.com
