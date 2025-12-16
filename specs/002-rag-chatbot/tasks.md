---
description: "Task list for RAG Chatbot implementation"
---

# Tasks: RAG Chatbot for Physical AI Book

**Input**: Design documents from `/specs/002-rag-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in feature specification, so omitted from this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/` at repository root
- **Frontend**: `frontend/docusaurus-plugin-rag-chatbot/` at repository root
- **Scripts**: `scripts/` at repository root
- **Config**: `config/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure (backend/src/{models,services,api,cli}, backend/tests/)
- [x] T002 Create frontend plugin directory structure (frontend/docusaurus-plugin-rag-chatbot/src/)
- [x] T003 Create scripts directory (scripts/)
- [x] T004 Create config directory (config/)
- [x] T005 [P] Create backend/requirements.txt with dependencies (fastapi, qdrant-client, google-generativeai, psycopg2, uvicorn, python-dotenv, pydantic, nltk, tiktoken)
- [x] T006 [P] Create frontend/docusaurus-plugin-rag-chatbot/package.json with dependencies (react, typescript, @docusaurus/types)
- [x] T007 [P] Create backend/.env.example template file with environment variable placeholders
- [x] T008 [P] Create config/qdrant_schema.json with collection configuration (768 dimensions, Cosine distance)
- [x] T009 [P] Create config/neon_schema.sql with Postgres DDL (conversation_sessions, chat_messages tables)
- [x] T010 [P] Create config/system_prompt.txt with book-content-only LLM system prompt template

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Implement backend/src/config.py to load environment variables from .env (LLM_PROVIDER, GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY, NEON_CONNECTION_STRING, BACKEND_PORT)
- [x] T012 [P] Implement backend/src/models/chapter.py with Chapter Pydantic model (id, number, title, content, url, word_count, metadata)
- [x] T013 [P] Implement backend/src/models/chunk.py with ChunkEmbedding Pydantic model (id, chapter_id, chapter_number, chunk_text, embedding, position, token_count)
- [x] T014 [P] Implement backend/src/models/chat.py with ChatMessage and ConversationSession Pydantic models
- [x] T015 [P] Implement backend/src/models/query.py with QueryRequest, QueryResponse, QueryContext Pydantic models
- [x] T016 Implement backend/src/services/qdrant_service.py with QdrantService class (connect, create_collection, upsert_chunks, search_similar methods)
- [x] T017 Implement backend/src/services/llm_service.py with LLMService class (generate_embedding, generate_answer, auto-select provider based on LLM_PROVIDER env)
- [x] T018 Implement backend/src/services/db_service.py with DBService class (connect to Neon, create_session, save_message, get_history, delete_history methods)
- [x] T019 Implement backend/src/api/middleware.py with CORS, logging, and error handling middleware
- [x] T020 Implement backend/src/main.py FastAPI app entry point with router registration and middleware setup
- [x] T021 [P] Implement scripts/install.sh to install backend (pip install -r requirements.txt) and frontend (npm install) dependencies
- [x] T022 [P] Implement scripts/setup-env.sh interactive script to prompt for API keys and generate backend/.env file
- [x] T023 [P] Implement scripts/setup-qdrant.sh to create Qdrant collection using config/qdrant_schema.json
- [x] T024 [P] Implement scripts/setup-neon.sh to execute config/neon_schema.sql on Neon Postgres
- [x] T025 Implement scripts/start-backend.sh to start FastAPI with uvicorn (uvicorn backend.src.main:app --reload --port 8000)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Ask Question About Book Content (Priority: P1) 🎯 MVP

**Goal**: Enable students to ask questions and receive answers based solely on book content

**Independent Test**: Open any book page, type "What is embodied intelligence?", verify chatbot returns answer citing Chapter 1 content

### Implementation for User Story 1

- [x] T026 [P] [US1] Implement backend/src/cli/ingest.py to scan docs/ directory, parse markdown files, extract frontmatter (chapter number, title), chunk content (512 tokens, 128 overlap, sentence boundaries using nltk)
- [x] T027 [P] [US1] Implement backend/src/cli/embed.py to load chunks, generate embeddings via Gemini API (batch size 10), upsert to Qdrant with chapter metadata
- [x] T028 [P] [US1] Implement backend/src/cli/setup_db.py to create Neon schema (execute neon_schema.sql)
- [x] T029 [US1] Implement backend/src/services/rag_service.py with RAGService class (retrieve_and_generate method: embed query → Qdrant search → build prompt → LLM generate → return answer + sources)
- [x] T030 [US1] Implement backend/src/api/routes/query.py with POST /query endpoint (accept QueryRequest, call RAGService, save to Neon, return QueryResponse)
- [x] T031 [US1] Implement backend/src/api/routes/health.py with GET /health endpoint (check Qdrant, Neon, LLM API status)
- [x] T032 [US1] Implement frontend/docusaurus-plugin-rag-chatbot/src/index.js plugin entry point (export plugin function with getClientModules)
- [x] T033 [US1] Implement frontend/docusaurus-plugin-rag-chatbot/src/api/chatClient.ts API client (submitQuery, getHealth methods with fetch, error handling, retry logic)
- [x] T034 [US1] Implement frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/ChatInput.tsx component (text input, validation, submit on Enter)
- [x] T035 [US1] Implement frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/ChatHistory.tsx component (render messages, display sources, markdown formatting)
- [x] T036 [US1] Implement frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/index.tsx main widget component (state management, integrate ChatInput + ChatHistory, floating button UI, open/close modal)
- [x] T037 [US1] Implement frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/styles.module.css with responsive styling (floating button, modal, message bubbles)
- [x] T038 [US1] Update docusaurus.config.js to register plugin with apiEndpoint configuration (http://localhost:8000 for dev, production URL env var)
- [x] T039 [US1] Implement scripts/ingest-book.sh wrapper script to run backend/src/cli/ingest.py with --full-rebuild or --incremental flags
- [x] T040 [US1] Implement scripts/embed-book.sh wrapper script to run backend/src/cli/embed.py with progress bar and error handling
- [x] T041 [US1] Implement scripts/dev.sh to start backend (./scripts/start-backend.sh) and Docusaurus (npm start) concurrently with healthcheck
- [x] T042 [US1] Add book-content-only validation logic in backend/src/services/rag_service.py (if no relevant chunks found with score >0.7, return "I can only answer questions based on the Physical AI book content")

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 4 - Install and Configure via CLI (Priority: P1)

**Goal**: Enable developers to set up the RAG chatbot entirely via CLI commands with no manual steps

**Independent Test**: On fresh Linux/macOS machine with Node.js and Python, run install scripts, verify chatbot appears and functions

### Implementation for User Story 4

- [x] T043 [P] [US4] Add prerequisite checks to scripts/install.sh (validate Python 3.11+, Node.js 18+, curl, jq, git exist)
- [x] T044 [P] [US4] Add credential validation to scripts/setup-env.sh (test Gemini API key, Qdrant connection, Neon connection before writing .env)
- [x] T045 [P] [US4] Add idempotency checks to scripts/setup-qdrant.sh (check if collection exists before creating, skip if already present)
- [x] T046 [P] [US4] Add idempotency checks to scripts/setup-neon.sh (check if tables exist before creating, skip if already present)
- [x] T047 [US4] Create scripts/cleanup-old-sessions.sh to delete Neon sessions older than 30 days (DELETE FROM conversation_sessions WHERE last_activity < NOW() - INTERVAL '30 days')
- [x] T048 [US4] Implement scripts/deploy.sh with --backend (render|railway|flyio) and --frontend (vercel|netlify|github-pages) options using respective CLIs
- [x] T049 [US4] Create frontend/docusaurus-plugin-rag-chatbot/README.md with installation instructions, configuration options, and troubleshooting guide
- [x] T050 [US4] Add environment validation function to backend/src/config.py (raise error if required env vars missing on startup)
- [x] T051 [US4] Add --full-rebuild and --incremental flags to scripts/ingest-book.sh (full: delete all Qdrant chunks first; incremental: skip unchanged chapters)
- [x] T052 [US4] Add --full-rebuild and --incremental flags to scripts/embed-book.sh (full: re-embed all; incremental: only new/changed chapters based on file mtime)

**Checkpoint**: CLI installation and setup fully automated, reproducible across environments

---

## Phase 5: User Story 2 - Query with Selected Text (Priority: P2)

**Goal**: Enable users to highlight text and ask questions with that passage as primary context

**Independent Test**: Select paragraph about "Zero Moment Point (ZMP)" in Chapter 7, type "Explain this in simpler terms", verify response addresses ZMP from that paragraph

### Implementation for User Story 2

- [x] T053 [P] [US2] Add selected text capture logic to frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/ChatInput.tsx (call window.getSelection().toString() on submit, validate non-empty)
- [x] T054 [US2] Update frontend/docusaurus-plugin-rag-chatbot/src/api/chatClient.ts submitQuery method to include optional selected_text parameter
- [x] T055 [US2] Update backend/src/services/rag_service.py retrieve_and_generate method to prioritize selected_text in LLM prompt when present (add SELECTED TEXT CONTEXT section before retrieved chunks)
- [x] T056 [US2] Add visual indicator in frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/ChatHistory.tsx to display selected text context (light gray background, label "Based on your selected text")
- [x] T057 [US2] Update frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/styles.module.css with styling for selected text display (.selectedTextContext class)

**Checkpoint**: Selected-text queries work independently, prioritize highlighted passages

---

## Phase 6: User Story 3 - Browse Conversation History (Priority: P3)

**Goal**: Enable users to view previous chat interactions across browser sessions

**Independent Test**: Ask 3 questions, close browser, reopen, verify chat history restored

### Implementation for User Story 3

- [x] T058 [P] [US3] Implement backend/src/api/routes/history.py with GET /history/{session_id} endpoint (call db_service.get_history, return HistoryResponse)
- [x] T059 [P] [US3] Implement backend/src/api/routes/history.py with DELETE /history/{session_id} endpoint (call db_service.delete_history, return 204 No Content)
- [x] T060 [US3] Add session ID management to frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/index.tsx (generate UUID on first visit, store in localStorage, load on mount)
- [x] T061 [US3] Implement history loading in frontend/docusaurus-plugin-rag-chatbot/src/api/chatClient.ts (getHistory, clearHistory methods)
- [x] T062 [US3] Add useEffect hook to frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/index.tsx to load history on component mount (check localStorage for session_id, call getHistory if exists)
- [x] T063 [US3] Implement "Clear History" button in frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/index.tsx (confirmation dialog, call clearHistory, reset local state, generate new session ID)
- [x] T064 [US3] Update frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/styles.module.css with styling for Clear History button and confirmation dialog

**Checkpoint**: Conversation history persists and loads independently across sessions

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T065 [P] Add rate limit handling to frontend/docusaurus-plugin-rag-chatbot/src/api/chatClient.ts (detect 429 status, extract Retry-After header, display countdown timer)
- [x] T066 [P] Add request queue with exponential backoff to backend/src/services/llm_service.py (handle Gemini 15 RPM limit gracefully)
- [x] T067 [P] Add logging to all backend services (backend/src/services/*.py) using Python logging module with structured format (timestamp, level, service, message, context)
- [x] T068 [P] Add error boundaries to frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/index.tsx (catch React errors, display user-friendly fallback UI)
- [x] T069 [P] Add accessibility attributes to frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/ components (ARIA labels, keyboard navigation support, screen reader compatibility)
- [x] T070 [P] Create .gitignore files for backend/ (exclude .env, __pycache__, .pytest_cache) and frontend/ (exclude node_modules/, dist/, build/)
- [x] T071 [P] Add input debouncing to frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/ChatInput.tsx (500ms delay after last keystroke before enabling Send button)
- [x] T072 [P] Add progress indicators to scripts/ingest-book.sh and scripts/embed-book.sh (display current chapter, chunks processed, estimated time remaining)
- [x] T073 Update quickstart.md validation steps to match implemented CLI commands and verify all paths are correct

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - Core MVP functionality
- **User Story 4 (Phase 4)**: Depends on Foundational phase completion - Can run in parallel with US1 (different files, independent testing)
- **User Story 2 (Phase 5)**: Depends on User Story 1 completion (extends query functionality)
- **User Story 3 (Phase 6)**: Depends on Foundational phase completion (uses history endpoints) - Can run in parallel with US1/US2 (different files)
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: No dependencies on other stories - Core Q&A functionality
- **User Story 4 (P1 - CLI Setup)**: No dependencies on other stories - Installation and configuration automation
- **User Story 2 (P2 - Selected Text)**: Depends on User Story 1 (extends QueryRequest model and RAG pipeline)
- **User Story 3 (P3 - History)**: No dependencies on other stories - Independent history management (can implement even if US1 not complete, but needs Foundational phase)

### Within Each User Story

- Models (T012-T015) before services (T016-T018)
- Services before API routes (T030-T031, T058-T059)
- Backend API before frontend integration (T032-T038)
- Core implementation before polish (Phase 7)

### Parallel Opportunities

- **Setup phase**: All tasks marked [P] can run in parallel (T005-T010)
- **Foundational phase**: Models (T012-T015) can run in parallel, services (T016-T018) can run in parallel after models
- **User Story 1**: CLI tools (T026-T028) can run in parallel, frontend components (T034-T037) can run in parallel
- **User Story 4**: All script enhancement tasks (T043-T046) can run in parallel
- **User Story 2**: Tasks T053-T054 can run in parallel
- **User Story 3**: Backend endpoints (T058-T059) can run in parallel, frontend methods (T061-T062) can run in parallel after
- **After Foundational completes**: User Stories 1, 3, and 4 can be worked on in parallel by different team members (independent files)

---

## Parallel Example: User Story 1

```bash
# Launch backend CLI tools in parallel:
Task T026: Implement ingest.py (backend/src/cli/ingest.py)
Task T027: Implement embed.py (backend/src/cli/embed.py)
Task T028: Implement setup_db.py (backend/src/cli/setup_db.py)

# Launch frontend components in parallel (after T032-T033 complete):
Task T034: ChatInput.tsx
Task T035: ChatHistory.tsx
Task T037: styles.module.css
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 4 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T025) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T026-T042) - Core Q&A functionality
4. Complete Phase 4: User Story 4 (T043-T052) - CLI automation
5. **STOP and VALIDATE**: Test User Story 1 independently (ask "What is Physical AI?", verify answer)
6. Test CLI setup on fresh machine (run scripts/install.sh through scripts/dev.sh)
7. Deploy/demo if ready

**Total Tasks for MVP**: 52 tasks (T001-T052)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T025)
2. Add User Story 1 + User Story 4 → Test independently → Deploy/Demo (MVP!) (T026-T052)
3. Add User Story 2 → Test independently → Deploy/Demo (T053-T057)
4. Add User Story 3 → Test independently → Deploy/Demo (T058-T064)
5. Add Polish → Final refinements → Deploy/Demo (T065-T073)
6. Each story adds value without breaking previous stories

**Total Tasks for Full Feature**: 73 tasks

### Parallel Team Strategy

With multiple developers after Foundational phase (T025) completes:

- **Developer A**: User Story 1 (T026-T042) - Core Q&A
- **Developer B**: User Story 4 (T043-T052) - CLI automation
- **Developer C**: User Story 3 (T058-T064) - History (can start in parallel, independent files)

Once User Story 1 complete:
- **Developer A**: User Story 2 (T053-T057) - Selected text (extends US1)

Finally:
- **All developers**: Phase 7 polish tasks (T065-T073) - can divide by area (frontend vs backend vs scripts)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable (except US2 depends on US1)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All paths are relative to repository root
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

**Tests**: Tests not included as they were not explicitly requested in the feature specification. If tests are desired, add test tasks before implementation tasks in each user story phase following the pattern in the template comments.
