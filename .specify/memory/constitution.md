<!--
SYNC IMPACT REPORT
==================
Version Change: Initial → 1.0.0
Modified Principles: N/A (Initial constitution creation)
Added Sections:
  - Core Principles (10 principles total)
  - Development Workflow
  - Architecture Standards
  - Governance

Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section already present
  ✅ spec-template.md - Requirements section aligns with CLI-first principle
  ✅ tasks-template.md - Task structure supports CLI automation

Follow-up TODOs: None (all placeholders filled)
-->

# PhysicalAI-RAG-Assistant Constitution

## Core Principles

### I. CLI-First Automation (NON-NEGOTIABLE)

All feature development, deployment, and operation MUST be executable via CLI commands. Manual edits, UI configuration, or interactive steps are PROHIBITED unless technically impossible.

**Rationale**: Ensures reproducibility, enables CI/CD automation, supports infrastructure-as-code, and eliminates configuration drift. Manual processes cannot be versioned, tested, or reliably reproduced across environments.

**Requirements**:
- Every feature MUST provide CLI entry points for all operations
- Scripts MUST be idempotent (safe to re-run)
- All configuration MUST be file-based (no environment-specific manual setup)
- Installation, ingestion, embedding, deployment MUST have CLI commands

### II. Deterministic & File-Safe Operations

All operations MUST produce predictable, reproducible outputs. File operations MUST be atomic and safe for concurrent access where applicable.

**Rationale**: Prevents race conditions, ensures consistency across environments, enables reliable testing, and supports team collaboration without conflicts.

**Requirements**:
- Generated files MUST have deterministic names and content
- Operations MUST check for existing state before modifying
- File writes MUST be atomic (write-then-move pattern where needed)
- No random IDs or timestamps in file content unless required for uniqueness

### III. Spec-Kit Convention Compliance

All outputs MUST follow established spec-kit directory structure, file naming, and content format conventions.

**Rationale**: Maintains consistency across features, enables tooling to parse and validate artifacts, and ensures team members can navigate any feature's documentation.

**Requirements**:
- Follow `specs/<feature-name>/` structure for all feature artifacts
- Use standard filenames: `spec.md`, `plan.md`, `tasks.md`, `research.md`, etc.
- Follow YAML frontmatter conventions for metadata
- Use established markdown formatting and heading structure

### IV. Free-Tier Infrastructure Only

The RAG chatbot MUST run entirely on free-tier services: Qdrant Cloud Free, Neon Postgres Free, and free LLM APIs (ChatKit or Gemini Free Tier).

**Rationale**: Ensures accessibility for educational purposes, eliminates cost barriers for students and learners, and aligns with the Physical AI book's mission to democratize robotics knowledge.

**Requirements**:
- Backend MUST use FastAPI (open source)
- Vector storage MUST use Qdrant Cloud Free tier
- Database MUST use Neon Postgres Free tier
- LLM MUST use ChatKit free tier or Gemini Free Tier
- No paid services or proprietary infrastructure dependencies

### V. Book-Content-Only RAG (Default Mode)

RAG retrieval MUST default to answering ONLY from book content. General knowledge or external information is PROHIBITED unless explicitly opted out by the user.

**Rationale**: Ensures factual accuracy aligned with book material, prevents hallucinations from general LLM knowledge, and maintains educational integrity of the learning resource.

**Requirements**:
- Default system prompt MUST restrict answers to book content
- RAG pipeline MUST retrieve only from embedded book chapters
- Clear user messaging when query cannot be answered from book
- Explicit opt-out mechanism for general knowledge queries

### VI. Selected-Text Query Override

When users select text before querying, the RAG system MUST prioritize that context over normal similarity-based retrieval.

**Rationale**: Enables precise, context-aware answers for specific passages, supports clarification questions, and improves user experience for deep-dive learning.

**Requirements**:
- Frontend MUST capture selected text with queries
- Backend MUST accept selected-text as optional context parameter
- When present, selected-text MUST override similarity search
- LLM prompt MUST prioritize selected-text context over retrieved chunks

### VII. Minimal & CLI-Installable Code

Generated code MUST be minimal, focused, and avoid unnecessary abstractions. All dependencies MUST be installable via CLI package managers.

**Rationale**: Reduces maintenance burden, improves readability, accelerates development, and ensures reproducible environments.

**Requirements**:
- No over-engineering: implement only specified requirements
- No unnecessary design patterns or abstractions
- All Python dependencies MUST be in `requirements.txt` or `pyproject.toml`
- All Node dependencies MUST be in `package.json`
- Installation MUST succeed via `pip install -r requirements.txt` or `npm install`

### VIII. Docusaurus Plugin-Based Integration

Chatbot integration into the Docusaurus book MUST be plugin-based and installable via CLI commands.

**Rationale**: Maintains separation of concerns, enables independent chatbot updates, and follows Docusaurus architecture patterns.

**Requirements**:
- Chatbot UI MUST be a custom Docusaurus plugin
- Plugin MUST be installable via `npm install` or `yarn add`
- Plugin configuration MUST be in `docusaurus.config.js`
- No manual HTML/CSS injection into Docusaurus core files

### IX. Re-runnable Pipelines

All data pipelines (ingestion, embedding, indexing) MUST support idempotent re-runs from CLI without breaking existing state.

**Rationale**: Enables content updates, supports incremental development, allows error recovery, and facilitates testing.

**Requirements**:
- Ingestion scripts MUST detect existing data and skip or update intelligently
- Embedding pipelines MUST support incremental processing
- Vector database operations MUST be upsert-based (insert or update)
- Clear CLI flags for full rebuild vs incremental update

### X. Simplest CLI-Automatable Solution (Default)

When requirements are ambiguous or multiple approaches exist, ALWAYS choose the simplest solution that is fully CLI-automatable.

**Rationale**: Reduces complexity, accelerates delivery, minimizes maintenance, and adheres to YAGNI (You Aren't Gonna Need It) principle.

**Requirements**:
- Prefer fewer files over complex directory structures
- Prefer direct implementations over abstraction layers
- Prefer bash scripts over complex orchestration tools
- Prefer flat configuration over nested hierarchies
- Always document the simpler alternative rejected (if any)

## Development Workflow

### Feature Lifecycle

1. **Constitution Check**: Verify feature aligns with all 10 core principles
2. **Specification (`/sp.specify`)**: Define user stories, requirements, acceptance criteria
3. **Planning (`/sp.plan`)**: Design architecture, contracts, data models
4. **Task Generation (`/sp.tasks`)**: Break down into CLI-automatable tasks
5. **Implementation (`/sp.implement`)**: Execute tasks in dependency order
6. **Validation**: Run CLI commands to verify end-to-end functionality

### Testing Strategy

- **Contract Tests**: Validate API contracts match specifications
- **Integration Tests**: Verify CLI commands produce expected outputs
- **End-to-End Tests**: Test full user journeys from CLI
- Testing is OPTIONAL unless explicitly requested in feature specification
- When tests are requested, they MUST be written FIRST and FAIL before implementation

### CLI Command Requirements

Every feature MUST provide:
- **Installation command**: Set up dependencies and configuration
- **Run command**: Start the service or execute the operation
- **Test command**: Validate functionality
- **Clean command**: Remove generated artifacts for fresh start

## Architecture Standards

### Backend (FastAPI)

- RESTful API design with clear endpoint naming
- Request/response validation via Pydantic models
- Environment variables for all configuration (never hardcode)
- Structured logging for all operations
- Error responses with clear, actionable messages

### RAG Pipeline

- **Ingestion**: Parse Docusaurus markdown, extract chapters, store metadata
- **Embedding**: Generate embeddings via free LLM API, batch processing
- **Indexing**: Upsert to Qdrant with chapter metadata (title, number, URL)
- **Retrieval**: Similarity search with configurable top-k, re-ranking optional
- **Generation**: Prompt engineering with book context, selected-text override

### Frontend (Docusaurus Plugin)

- React component for chat widget (floating or embedded)
- State management via React hooks (no Redux unless justified)
- API client with error handling and retry logic
- Markdown rendering for LLM responses
- Accessibility: keyboard navigation, ARIA labels, screen reader support

### Data Models

- **Chapter**: id, number, title, content, url, metadata
- **ChatMessage**: id, role (user/assistant), content, timestamp
- **QueryContext**: query, selected_text (optional), top_k, filters

### Deployment

- Backend: Deploy to free-tier platforms (Render, Railway, Fly.io)
- Frontend: Docusaurus static build, deploy to Vercel/Netlify/GitHub Pages
- Environment: `.env` files for development, environment variables for production
- Database migrations: Alembic for Postgres schema changes

## Governance

### Amendment Procedure

1. Propose amendment via Pull Request to `.specify/memory/constitution.md`
2. Increment version following semantic versioning:
   - **MAJOR**: Backward-incompatible principle removals or redefinitions
   - **MINOR**: New principles or materially expanded guidance
   - **PATCH**: Clarifications, wording improvements, non-semantic fixes
3. Update `LAST_AMENDED_DATE` to current date (YYYY-MM-DD format)
4. Update dependent templates (plan-template.md, spec-template.md, tasks-template.md)
5. Create Sync Impact Report as HTML comment at top of file
6. Merge only after approval from project maintainers

### Versioning Policy

- Constitution version MUST follow semantic versioning (MAJOR.MINOR.PATCH)
- All feature specs MUST reference constitution version used
- Breaking changes MUST include migration guide
- Deprecation warnings MUST precede removals by at least one MINOR version

### Compliance Review

- All feature specs (`/sp.specify`) MUST pass Constitution Check
- All implementation plans (`/sp.plan`) MUST document principle adherence
- All pull requests MUST verify no constitution violations
- Complexity (principle violations) MUST be explicitly justified in plan.md

### Principle Enforcement

- **NON-NEGOTIABLE principles**: Zero tolerance, feature rejected if violated
- **Standard principles**: Violations require explicit justification and approval
- **Guidance principles**: Best practices, deviations allowed with documentation

**Version**: 1.0.0 | **Ratified**: 2025-12-07 | **Last Amended**: 2025-12-07
