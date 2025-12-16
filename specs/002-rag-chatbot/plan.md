# Implementation Plan: RAG Chatbot for Physical AI Book

**Branch**: `002-rag-chatbot` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-rag-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a CLI-automatable RAG chatbot that integrates with the Physical AI Docusaurus book. The system provides students with instant, contextually relevant answers to questions based solely on book content. Core features include vector similarity search with Qdrant, LLM-powered answer generation (ChatKit/Gemini), selected-text query support, and conversation history persistence. All setup, ingestion, embedding, and deployment operations are executed via CLI commands with no manual configuration steps.

## Technical Context

**Language/Version**: Python 3.11+ (backend), Node.js 18+ (frontend plugin)
**Primary Dependencies**: FastAPI 0.104+, Qdrant Client 1.7+, OpenAI/Google Generative AI SDKs, Docusaurus 3.x, React 18+
**Storage**: Qdrant Cloud Free (vector store), Neon Postgres Free (conversation history), Browser localStorage (session data)
**Testing**: pytest (backend contract/integration tests), Jest (frontend unit tests)
**Target Platform**: Linux/macOS (development), free-tier cloud platforms (Render/Railway/Fly.io for backend, Vercel/Netlify for frontend)
**Project Type**: Web application (backend API + frontend Docusaurus plugin)
**Performance Goals**: <3 second p95 latency for query→answer, 50+ concurrent users, <100MB backend memory footprint
**Constraints**: Qdrant 1GB free tier limit, Neon 512MB storage limit, LLM API free-tier rate limits, CLI-only operations (no manual edits)
**Scale/Scope**: 15 book chapters (~350-800 words each), ~50-100 concurrent learners, ~1000 Q&A interactions/day

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: CLI-First Automation (NON-NEGOTIABLE)
- ✅ **PASS**: All operations (install, ingest, embed, deploy) have CLI scripts
- ✅ User input specifies: `./scripts/install.sh`, `./scripts/ingest-book.sh`, `spec-run rag.dev`, `spec-run rag.deploy`
- ✅ No manual configuration steps; `.env` generated via `./scripts/setup-env.sh`

### Principle II: Deterministic & File-Safe Operations
- ✅ **PASS**: Ingestion pipelines produce deterministic chapter IDs (based on chapter number)
- ✅ Embedding operations are idempotent (upsert to Qdrant by chapter ID)
- ✅ Scripts check existing state before modifying (e.g., skip already-embedded chapters)

### Principle III: Spec-Kit Convention Compliance
- ✅ **PASS**: Following `specs/002-rag-chatbot/` structure for all artifacts
- ✅ Standard filenames: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `tasks.md`
- ✅ YAML frontmatter for metadata, markdown formatting conventions

### Principle IV: Free-Tier Infrastructure Only
- ✅ **PASS**: Backend uses FastAPI (open source)
- ✅ Vector store: Qdrant Cloud Free (1GB limit)
- ✅ Database: Neon Postgres Free (512MB limit)
- ✅ LLM: ChatKit or Gemini Free Tier (auto-selected via ENV)
- ✅ No paid services or proprietary dependencies

### Principle V: Book-Content-Only RAG (Default Mode)
- ✅ **PASS**: System prompt restricts answers to book content
- ✅ RAG pipeline retrieves only from embedded book chapters
- ✅ Clear user messaging when query cannot be answered from book ("I can only answer...")
- ⚠️ **NEEDS DESIGN**: Explicit opt-out mechanism for general knowledge queries (defer to Phase 1)

### Principle VI: Selected-Text Query Override
- ✅ **PASS**: Frontend captures selected text with queries (via browser selection API)
- ✅ Backend accepts `selected_text` as optional parameter in query endpoint
- ✅ When present, selected-text overrides similarity search in RAG prompt

### Principle VII: Minimal & CLI-Installable Code
- ✅ **PASS**: No over-engineering; implement only specified requirements
- ✅ Python dependencies in `requirements.txt` (installable via `pip install -r`)
- ✅ Node dependencies in `package.json` (installable via `npm install` or `yarn`)
- ✅ No unnecessary abstractions or design patterns

### Principle VIII: Docusaurus Plugin-Based Integration
- ✅ **PASS**: Chatbot UI implemented as custom Docusaurus plugin (`docusaurus-plugin-rag-chatbot`)
- ✅ Plugin installable via `npm install` or `yarn add`
- ✅ Configuration in `docusaurus.config.js` (API endpoint URL, UI theme)
- ✅ No manual HTML/CSS injection into Docusaurus core files

### Principle IX: Re-runnable Pipelines
- ✅ **PASS**: Ingestion scripts detect existing data and skip/update intelligently
- ✅ Embedding pipelines support incremental processing (process only new/changed chapters)
- ✅ Vector database operations use upsert (insert or update by chapter ID)
- ✅ CLI flags: `--full-rebuild` vs `--incremental` (default)

### Principle X: Simplest CLI-Automatable Solution
- ✅ **PASS**: User input emphasizes simplest approach: flat `backend/`, `scripts/`, `config/` structure
- ✅ Direct FastAPI implementation (no unnecessary middleware layers)
- ✅ Bash scripts for orchestration (no complex tools like Airflow/Prefect)
- ✅ Flat `.env` configuration (no nested YAML hierarchies)

**Gate Status**: ✅ PASS (all principles satisfied; 1 minor design detail deferred to Phase 1)

## Project Structure

### Documentation (this feature)

```text
specs/002-rag-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── api.yaml         # OpenAPI 3.0 spec for backend REST API
│   └── events.md        # Frontend-backend event flows
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Environment variable loading (.env)
│   ├── models/
│   │   ├── chapter.py          # Chapter data model (Pydantic)
│   │   ├── chunk.py            # ChunkEmbedding data model
│   │   ├── chat.py             # ChatMessage, ConversationSession models
│   │   └── query.py            # QueryContext, QueryRequest/Response models
│   ├── services/
│   │   ├── qdrant_service.py   # Vector store operations (search, upsert)
│   │   ├── llm_service.py      # LLM API abstraction (ChatKit/Gemini)
│   │   ├── rag_service.py      # RAG orchestration (retrieve + generate)
│   │   └── db_service.py       # Neon Postgres operations (chat history)
│   ├── api/
│   │   ├── routes/
│   │   │   ├── query.py        # POST /query endpoint
│   │   │   ├── history.py      # GET/DELETE /history endpoints
│   │   │   └── health.py       # GET /health endpoint
│   │   └── middleware.py       # CORS, logging, error handling
│   └── cli/
│       ├── ingest.py           # Parse Docusaurus markdown chapters
│       ├── embed.py            # Generate embeddings, upsert to Qdrant
│       └── setup_db.py         # Create Neon Postgres schema
├── tests/
│   ├── contract/               # API contract tests (pytest)
│   ├── integration/            # End-to-end RAG pipeline tests
│   └── unit/                   # Service-level unit tests
├── requirements.txt            # Python dependencies
└── .env.example                # Template for environment variables

frontend/
├── docusaurus-plugin-rag-chatbot/
│   ├── src/
│   │   ├── index.js            # Plugin entry point
│   │   ├── theme/
│   │   │   └── ChatWidget/
│   │   │       ├── index.tsx   # Main widget component
│   │   │       ├── ChatInput.tsx
│   │   │       ├── ChatHistory.tsx
│   │   │       └── styles.module.css
│   │   └── api/
│   │       └── chatClient.ts   # API client for backend
│   ├── package.json            # Node dependencies
│   └── README.md               # Plugin installation/usage docs
└── tests/
    └── ChatWidget.test.tsx     # Jest unit tests

scripts/
├── install.sh                  # Install all dependencies (backend + frontend)
├── setup-env.sh                # Generate .env from user input
├── ingest-book.sh              # Run ingestion CLI (backend/src/cli/ingest.py)
├── embed-book.sh               # Run embedding CLI (backend/src/cli/embed.py)
├── setup-qdrant.sh             # Create Qdrant collection via API
├── setup-neon.sh               # Create Neon schema via CLI
├── start-backend.sh            # Start FastAPI server (uvicorn)
├── dev.sh                      # Combined dev environment (backend + Docusaurus)
└── deploy.sh                   # Deploy backend + frontend to free-tier platforms

config/
├── qdrant_schema.json          # Qdrant collection configuration
├── neon_schema.sql             # Postgres schema DDL
└── system_prompt.txt           # LLM system prompt template
```

**Structure Decision**: Web application (Option 2) selected because feature requires both backend API (FastAPI) and frontend UI (Docusaurus plugin). Backend handles RAG pipeline and data storage; frontend provides chat widget integrated into book pages. Clear separation enables independent testing and deployment.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution principles satisfied.

## Phase 0: Research (Deferred Details)

**Research Tasks**:
1. **ChatKit vs Gemini Free Tier**: Compare embedding dimensions, rate limits, token costs, API stability
2. **Qdrant Free Tier Capacity**: Validate 1GB limit supports 15 chapters (~6000 words each = 90k words × avg 4 chars/word × 1 byte/char = 360KB raw text; embeddings ~10-20MB depending on dimensions)
3. **Neon Free Tier Schema**: Confirm 512MB supports conversation history (estimate: 10k messages × 500 bytes avg = 5MB; plenty of headroom)
4. **Docusaurus Plugin API**: Research `docusaurus.config.js` plugin structure, theme swizzling, and client module API
5. **Selected Text Capture**: Investigate browser `window.getSelection()` API and edge cases (iframes, mobile browsers)
6. **Chunking Strategy**: Research optimal chunk size (512 vs 1024 tokens), overlap (64 vs 128 tokens), and semantic splitting (sentence boundaries vs fixed tokens)

**Output**: `research.md` documenting decisions, rationales, and alternatives considered.

## Phase 1: Design (Data Models & Contracts)

**Data Models** (`data-model.md`):
- Chapter: id (int), number (int), title (str), content (text), url (str), word_count (int), metadata (json)
- ChunkEmbedding: id (uuid), chapter_id (fk), chunk_text (text), embedding (vector), position (int)
- ChatMessage: id (uuid), session_id (fk), role (enum: user/assistant), content (text), timestamp (datetime)
- ConversationSession: id (uuid), user_id (str), created_at (datetime), last_activity (datetime)
- QueryContext: query (str), selected_text (optional str), top_k (int), chapter_filters (optional list)

**API Contracts** (`contracts/api.yaml`):
- POST /query: Accept QueryRequest (query, selected_text, top_k), return QueryResponse (answer, sources, confidence)
- GET /history/{session_id}: Return list of ChatMessage
- DELETE /history/{session_id}: Clear conversation history
- GET /health: Return service status (Qdrant, Neon, LLM API availability)

**Quickstart** (`quickstart.md`):
- Step-by-step CLI commands for installation, configuration, ingestion, and deployment
- Example queries with expected outputs
- Troubleshooting common errors (API key invalid, Qdrant connection failed, etc.)

**Agent Context Update**:
- Run `.specify/scripts/bash/update-agent-context.sh claude` to add FastAPI, Qdrant, Neon, Docusaurus context

## Phase 2: Tasks (NOT Generated by /sp.plan)

Phase 2 (task breakdown) is handled by `/sp.tasks` command, which reads this plan and generates `tasks.md` with CLI-executable implementation tasks grouped by user story.

---

**Plan Status**: ✅ Complete (Phases 0-1 design artifacts to be generated next)
