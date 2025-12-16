# Feature Specification: RAG Chatbot for Physical AI Book

**Feature Branch**: `002-rag-chatbot`
**Created**: 2025-12-07
**Status**: Draft
**Input**: User description: "Functional Requirements: Chat widget answers user questions inside Docusaurus. RAG pipeline: embeddings + Qdrant + ChatKit/Gemini. Selected text queries supported. Backend: FastAPI (CLI scaffold), uvicorn, .env config, Qdrant API key, Neon URL. Frontend: Docusaurus plugin installed via CLI. Technical Requirements: CLI portable: Linux/macOS. Vector store: Qdrant 1GB free cluster. DB: Neon free-tier Postgres. LLM: ChatKit or Gemini Free Tier (auto select via ENV). Build system: spec-kit + spec-kit-plus. Outputs: CLI tasks only. Scaffolding: backend/, frontend plugin, scripts/, config files. Pipelines run via spec-run commands."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask Question About Book Content (Priority: P1)

A student reading the Physical AI book encounters a concept they want clarified. They type a question into the chat widget and receive an answer based solely on the book's content.

**Why this priority**: This is the core value proposition - enabling students to get instant, contextually relevant answers while learning. Without this, the chatbot has no purpose.

**Independent Test**: Can be fully tested by opening any book page, typing a question related to that chapter (e.g., "What is embodied intelligence?"), and verifying the chatbot returns an answer citing book content.

**Acceptance Scenarios**:

1. **Given** a user is reading Chapter 1 on Physical AI, **When** they type "What is embodied intelligence?" in the chat widget, **Then** the system returns an answer extracted from Chapter 1 content with relevant context
2. **Given** a user asks "How do humanoid robots balance?", **When** the query is submitted, **Then** the system retrieves relevant sections from the locomotion chapter and generates a coherent answer
3. **Given** a user asks a question outside book scope (e.g., "What is quantum computing?"), **When** the query is submitted, **Then** the system responds with "I can only answer questions based on the Physical AI book content"

---

### User Story 2 - Query with Selected Text (Priority: P2)

A student highlights a specific passage in the book (e.g., a technical term or diagram description) and asks a clarifying question. The chatbot prioritizes that selected text as context for answering.

**Why this priority**: Enhances precision and reduces ambiguity. Users can get targeted explanations for specific passages without the system guessing which section they mean.

**Independent Test**: Select a paragraph about "Zero Moment Point (ZMP)" in Chapter 7, type "Explain this in simpler terms", and verify the response specifically addresses ZMP concepts from that paragraph.

**Acceptance Scenarios**:

1. **Given** a user selects text containing "inverse kinematics" from Chapter 4, **When** they ask "How does this work in practice?", **Then** the system uses the selected text as primary context and explains inverse kinematics
2. **Given** a user selects a code example from Chapter 9, **When** they ask "What does this line do?", **Then** the system references the selected code specifically in its explanation
3. **Given** a user selects text but asks an unrelated question, **When** the query is submitted, **Then** the system still prioritizes the selected text context but notes the question seems unrelated

---

### User Story 3 - Browse Conversation History (Priority: P3)

A student returns to the book after a break and wants to review their previous chat interactions to recall what they learned.

**Why this priority**: Improves learning continuity and allows students to revisit explanations. Lower priority because the core learning value is in the initial Q&A.

**Independent Test**: Ask 3 questions in a session, close the browser, reopen the book, and verify the chat widget displays the previous conversation history.

**Acceptance Scenarios**:

1. **Given** a user has asked 5 questions in a previous session, **When** they return to the book site, **Then** their chat history is loaded and displayed in the widget
2. **Given** a user scrolls through old messages, **When** they click on a previous answer, **Then** the answer remains readable and properly formatted
3. **Given** a user wants to start fresh, **When** they click "Clear History", **Then** all previous messages are removed from the interface and storage

---

### User Story 4 - Install and Configure via CLI (Priority: P1)

A developer or instructor wants to set up the RAG chatbot for their own Docusaurus book instance. They run CLI commands to install dependencies, configure API keys, and deploy the system.

**Why this priority**: Essential for reproducibility and self-hosting. Without CLI automation, the system violates the constitution's CLI-First principle.

**Independent Test**: On a fresh Linux/macOS machine with Node.js and Python installed, run the install script, provide API keys via .env, and verify the chatbot appears and functions on the Docusaurus site.

**Acceptance Scenarios**:

1. **Given** a developer has cloned the repository, **When** they run `./scripts/install.sh`, **Then** all backend and frontend dependencies are installed without manual intervention
2. **Given** a user runs `./scripts/setup-env.sh`, **When** prompted for Qdrant and Neon credentials, **Then** a valid `.env` file is created with all required configuration
3. **Given** a user runs `./scripts/ingest-book.sh`, **When** the script completes, **Then** all Docusaurus markdown chapters are embedded and indexed in Qdrant
4. **Given** a user runs `./scripts/start-backend.sh`, **When** the backend starts, **Then** the FastAPI server is accessible on the configured port and healthcheck passes

---

### Edge Cases

- What happens when the Qdrant free tier storage limit (1GB) is reached? System should log a warning and gracefully degrade (e.g., skip new embeddings or prompt admin to clean old data).
- How does the system handle malformed markdown in book chapters? Ingestion script should skip unparseable sections and log errors without failing the entire pipeline.
- What if the user's query is empty or only whitespace? Frontend should validate and prevent submission, showing "Please enter a question."
- What if the LLM API (ChatKit/Gemini) is down or rate-limited? Backend should return a user-friendly error message ("Service temporarily unavailable, please try again") and log the failure for monitoring.
- What if multiple users query simultaneously and hit the free-tier rate limit? System should queue requests with a visible "Processing..." indicator and retry with exponential backoff.
- What if a user selects text from a non-book page (e.g., a custom landing page)? System should ignore the selection and fall back to normal RAG retrieval.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a chat widget interface embedded in all Docusaurus book pages
- **FR-002**: System MUST answer user questions using only content from the Physical AI book chapters (default mode)
- **FR-003**: System MUST support selected-text queries where user-highlighted passages override normal similarity search
- **FR-004**: System MUST accept user queries via text input in the chat widget
- **FR-005**: System MUST retrieve relevant book sections using vector similarity search against embedded chapter content
- **FR-006**: System MUST generate natural language answers using retrieved context via LLM API
- **FR-007**: System MUST clearly communicate when a question cannot be answered from book content
- **FR-008**: System MUST persist conversation history for each user session
- **FR-009**: System MUST allow users to clear their conversation history
- **FR-010**: System MUST be installable entirely via CLI commands (no manual configuration steps)
- **FR-011**: System MUST support re-running data pipelines (ingestion, embedding, indexing) without breaking existing state
- **FR-012**: System MUST validate environment configuration (.env) before starting services
- **FR-013**: System MUST log all errors and operational events for debugging
- **FR-014**: System MUST provide healthcheck endpoints for backend services
- **FR-015**: System MUST automatically select available LLM API (ChatKit or Gemini) based on environment configuration

### Key Entities

- **Chapter**: Represents a single chapter from the Physical AI book. Attributes include chapter number, title, markdown content, URL path, and metadata (word count, code examples, diagrams). Related to ChunkEmbedding (one-to-many).

- **ChunkEmbedding**: Represents a semantic chunk of chapter content with its vector embedding. Attributes include chunk text (512-1024 tokens), embedding vector (dimension based on LLM model), source chapter reference, and chunk position. Related to Chapter (many-to-one).

- **ChatMessage**: Represents a single message in a conversation. Attributes include role (user or assistant), message content (text), timestamp, and session identifier. Related to ConversationSession (many-to-one).

- **ConversationSession**: Represents a user's chat session. Attributes include session ID (UUID), user identifier (browser fingerprint or cookie), creation timestamp, and last activity timestamp. Related to ChatMessage (one-to-many).

- **QueryContext**: Represents the context for a user query. Attributes include query text, selected text (optional), top-k retrieval parameter (default 5), and chapter filters (optional). Not persisted, used for request processing only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can receive relevant answers to book-related questions within 3 seconds of submission (p95 latency)
- **SC-002**: System correctly identifies and declines to answer 90% of questions outside book scope ("I can only answer..." message)
- **SC-003**: Selected-text queries return answers that specifically reference the highlighted passage in 95% of cases
- **SC-004**: Installation process completes successfully on fresh Linux/macOS systems with only Node.js and Python pre-installed (100% success rate in testing)
- **SC-005**: Re-running ingestion pipeline on updated book content does not break existing chat functionality (zero downtime)
- **SC-006**: System supports at least 50 concurrent users without response time degradation beyond 5 seconds
- **SC-007**: Conversation history persists across browser sessions for 90% of returning users (allowing for cookie/localStorage clearing)
- **SC-008**: 80% of user queries result in answers rated as "helpful" or "very helpful" (based on optional user feedback)

## Assumptions

1. **Book Format**: The Physical AI book is authored in Docusaurus-compatible Markdown with standard frontmatter (title, chapter number). Custom MDX components (if any) are ignored during ingestion.

2. **User Authentication**: No user authentication or accounts required. Sessions are identified by browser cookies or localStorage. This is acceptable for an educational resource with no sensitive data.

3. **Concurrency Model**: Free-tier Qdrant and Neon can handle expected load (estimated <100 concurrent users for an educational book). If scaling is needed, upgrade to paid tiers (outside scope).

4. **LLM API Selection**: ChatKit and Gemini Free Tier have similar capabilities (text generation, embeddings). System auto-selects based on `LLM_PROVIDER` environment variable. No fallback between providers if one fails (user must reconfigure).

5. **Data Privacy**: Chat history is stored locally in browser (localStorage) and optionally in Neon Postgres with anonymous session IDs. No personally identifiable information (PII) is collected or stored.

6. **Chunk Strategy**: Book chapters are split into 512-1024 token chunks with 128-token overlap. This balances retrieval granularity and context preservation. Exact token count depends on LLM tokenizer.

7. **Error Handling for Free Tiers**: If free-tier limits are hit (Qdrant storage, Neon row count, LLM rate limits), system degrades gracefully with user-facing error messages. No auto-scaling or queue management beyond basic retry logic.

8. **Browser Compatibility**: Chat widget supports modern browsers (Chrome, Firefox, Safari, Edge) with ES6+ JavaScript support. No IE11 support.

9. **Deployment Target**: Backend is deployed to a free-tier platform (Render, Railway, Fly.io) with persistent storage via Neon. Frontend is deployed as static Docusaurus build to Vercel/Netlify/GitHub Pages.

10. **CLI Environment**: Installation and pipeline scripts assume bash shell (Linux/macOS). Windows users should use WSL or Git Bash.
