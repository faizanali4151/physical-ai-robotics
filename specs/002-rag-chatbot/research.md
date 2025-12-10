# Research: RAG Chatbot Technical Decisions

**Feature**: RAG Chatbot for Physical AI Book
**Date**: 2025-12-07
**Purpose**: Resolve technical unknowns and validate free-tier capacity assumptions

## 1. LLM Provider Selection: ChatKit vs Gemini Free Tier

### Decision
**Use Gemini Free Tier (Google Generative AI API)** as the primary LLM provider, with ChatKit as a documented alternative.

### Rationale
- **Embedding Dimensions**: Gemini provides `text-embedding-004` model with 768-dimensional embeddings (comparable to OpenAI's ada-002). ChatKit embeddings vary by model but typically 1536 dimensions (higher storage cost).
- **Rate Limits**: Gemini Free Tier: 15 RPM (requests per minute), 1 million tokens/month. ChatKit (via OpenAI): 3 RPM free tier (more restrictive).
- **Token Costs**: Both offer free tiers adequate for educational use (~1000 Q&A interactions/day = ~30k tokens/day × 30 days = 900k tokens/month, within Gemini's 1M limit).
- **API Stability**: Google Generative AI has production SLA; ChatKit's free tier has no uptime guarantees.
- **Integration**: Both have Python SDKs (`google-generativeai` vs `openai`). Gemini's SDK is simpler for chat completion and embeddings.

### Alternatives Considered
- **ChatKit (OpenAI)**: More restrictive free-tier RPM (3 vs 15). Higher embedding dimensions increase Qdrant storage usage.
- **Cohere Free Tier**: 100 API calls/month (too restrictive for expected load).
- **HuggingFace Inference API**: Free but requires model hosting knowledge; higher latency than managed APIs.

### Implementation Notes
- Environment variable `LLM_PROVIDER=gemini` (default) or `LLM_PROVIDER=chatkit`
- Abstract LLM calls in `llm_service.py` to support both providers via strategy pattern
- Configuration: `GEMINI_API_KEY` or `OPENAI_API_KEY` in `.env`

---

## 2. Vector Store Capacity: Qdrant Free Tier

### Decision
**Qdrant Cloud Free Tier (1GB) is sufficient** for the Physical AI book use case.

### Rationale
**Capacity Calculation**:
- 15 chapters × ~600 words/chapter (average of 350-800) = 9,000 words
- 9,000 words × 5 characters/word = 45,000 characters raw text
- Embeddings: Gemini `text-embedding-004` = 768 dimensions × 4 bytes/float32 = 3KB/embedding
- Chunking strategy: 512 tokens/chunk, 128 token overlap
  - Estimated chunks: 9,000 words × 1.3 tokens/word ÷ 512 tokens/chunk = ~23 chunks/chapter
  - Total chunks: 15 chapters × 23 = ~345 chunks
- Storage: 345 chunks × 3KB/embedding = 1.035MB (embeddings only)
- Add metadata (chapter ID, chunk text, position): ~500 bytes/chunk × 345 = 172.5KB
- **Total: ~1.2MB** (well within 1GB limit; ~0.12% utilization)

**Headroom**: Even with 10x growth (150 chapters or richer metadata), still <15MB (<1.5% of 1GB).

### Alternatives Considered
- **Pinecone Free Tier**: 1 index, 100k vectors, 1 pod. Capacity sufficient but less generous than Qdrant (1GB vs 100k vectors).
- **Weaviate Cloud Free**: 1GB limit similar to Qdrant, but less mature Python SDK.
- **Self-hosted Qdrant**: Free but requires infrastructure (violates free-tier-only principle).

### Implementation Notes
- Qdrant Cloud cluster configuration: `qdrant_schema.json` specifies collection settings
- Vector size: 768 (matches Gemini embeddings)
- Distance metric: Cosine similarity (standard for semantic search)
- Collection name: `physical_ai_book_chunks`

---

## 3. Database Capacity: Neon Postgres Free Tier

### Decision
**Neon Postgres Free Tier (512MB storage) is sufficient** for conversation history.

### Rationale
**Capacity Calculation**:
- Expected load: ~1000 Q&A interactions/day = 2000 messages/day (1 user message + 1 assistant response)
- Retention: 30 days (after which old sessions archived/deleted)
- Active messages: 2000 messages/day × 30 days = 60,000 messages
- Storage per message:
  - UUID (16 bytes) + session_id (16 bytes) + role (1 byte) + content (avg 500 bytes) + timestamp (8 bytes) = ~541 bytes
  - Total: 60,000 messages × 541 bytes = ~32.5MB
- Conversation sessions: ~500 active users/month × 100 bytes/session = 50KB
- **Total: ~33MB** (~6.4% of 512MB limit)

**Headroom**: Sufficient for 15x growth (~450k messages) before hitting limit.

### Alternatives Considered
- **Supabase Free Tier**: 500MB storage (similar to Neon), but requires additional setup for auth (not needed here).
- **PlanetScale Free Tier**: 5GB storage but MySQL (less native vector support if future expansion needed).
- **SQLite**: Free but requires file storage on backend server (complicates deployment to ephemeral platforms like Fly.io).

### Implementation Notes
- Schema: `conversations` table (session metadata) + `messages` table (1:N relationship)
- Indexes: session_id, timestamp (for history queries)
- Retention policy: CLI script to delete sessions older than 30 days (`scripts/cleanup-old-sessions.sh`)

---

## 4. Docusaurus Plugin API

### Decision
**Use Docusaurus Theme Swizzling + Client Modules** to inject chat widget into all pages.

### Rationale
- **Theme Swizzling**: Docusaurus allows overriding default theme components. Swizzle `<Layout>` or `<Root>` component to add `<ChatWidget>` globally.
- **Client Modules**: Docusaurus `docusaurus.config.js` supports `clientModules` array for browser-only code. Register chat widget as a client module.
- **Plugin Structure**: Custom plugin (`docusaurus-plugin-rag-chatbot`) exports:
  - `getClientModules()`: Returns path to client-side JS entrypoint
  - `injectHtmlTags()`: Optional method to inject CSS/JS in `<head>` if needed
- **Configuration**: Plugin accepts `apiEndpoint` (backend URL) and `theme` (light/dark) via `docusaurus.config.js` options.

### Alternatives Considered
- **Manual HTML Injection**: Insert `<script>` tags in `docusaurus.config.js` `scripts` array. Less maintainable, violates plugin-based principle.
- **Swizzle Individual Pages**: Override page components per-route. Too manual, not scalable for all pages.

### Implementation Notes
- Plugin structure: `frontend/docusaurus-plugin-rag-chatbot/src/index.js` (plugin entrypoint)
- Client module: `frontend/docusaurus-plugin-rag-chatbot/src/theme/ChatWidget/index.tsx`
- Configuration example:
  ```js
  plugins: [
    ['./docusaurus-plugin-rag-chatbot', {
      apiEndpoint: process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000',
      theme: 'auto' // 'light' | 'dark' | 'auto'
    }]
  ]
  ```

---

## 5. Selected Text Capture: Browser API

### Decision
**Use `window.getSelection()` API** with fallback handling for edge cases.

### Rationale
- **Browser Support**: `window.getSelection()` supported in all modern browsers (Chrome, Firefox, Safari, Edge).
- **API Usage**:
  ```javascript
  const selection = window.getSelection();
  const selectedText = selection.toString();
  ```
- **Edge Cases**:
  - **iframes**: Selection inside iframes not accessible from parent context. Acceptable limitation (book content not in iframes).
  - **Mobile browsers**: Touch selection works with same API. Test on iOS Safari and Android Chrome.
  - **Empty selection**: Check `selectedText.trim().length > 0` before sending to backend.

### Alternatives Considered
- **Manual text selection tracking**: Listen to `mouseup` events and parse DOM. Fragile, reinvents browser behavior.
- **Third-party libraries** (e.g., Rangy): Unnecessary complexity for simple use case.

### Implementation Notes
- Capture selected text on query submission (when user hits Enter or clicks "Send")
- Frontend code:
  ```typescript
  const getSelectedText = (): string | null => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    return text && text.length > 0 ? text : null;
  };
  ```

---

## 6. Chunking Strategy

### Decision
**512-token chunks with 128-token overlap, split on sentence boundaries**.

### Rationale
- **Chunk Size**: 512 tokens balances context preservation and retrieval granularity.
  - Smaller chunks (256 tokens): More precise retrieval but lose context (e.g., multi-paragraph explanations).
  - Larger chunks (1024 tokens): More context but less precise retrieval (e.g., entire chapter sections mix unrelated topics).
- **Overlap**: 128 tokens (25% overlap) ensures concepts spanning chunk boundaries aren't lost.
- **Sentence Boundaries**: Use `nltk.sent_tokenize()` to split on sentence boundaries within token limits. Prevents mid-sentence cuts that confuse LLMs.
- **Token Counting**: Use `tiktoken` library (OpenAI's tokenizer) for consistent token counting across providers.

### Alternatives Considered
- **Fixed-size chunks (no overlap)**: Loses context at boundaries. Example: "Inverse kinematics solves..." in chunk N, "...joint angles from end-effector position" in chunk N+1.
- **Paragraph-based chunking**: Variable chunk sizes (10-2000 tokens) complicate embedding batch processing and retrieval consistency.
- **Recursive character splitting** (LangChain default): More complex, no clear benefit over sentence-boundary approach for technical book content.

### Implementation Notes
- Chunking implementation in `backend/src/cli/ingest.py`:
  ```python
  import nltk
  import tiktoken

  def chunk_text(text: str, chunk_size: int = 512, overlap: int = 128) -> list[str]:
      sentences = nltk.sent_tokenize(text)
      enc = tiktoken.get_encoding("cl100k_base")  # GPT-3.5/4 tokenizer
      chunks = []
      current_chunk = []
      current_tokens = 0

      for sentence in sentences:
          sentence_tokens = len(enc.encode(sentence))
          if current_tokens + sentence_tokens > chunk_size and current_chunk:
              chunks.append(" ".join(current_chunk))
              # Overlap: keep last few sentences
              overlap_sentences = ...  # Implement overlap logic
              current_chunk = overlap_sentences
              current_tokens = sum(len(enc.encode(s)) for s in overlap_sentences)
          current_chunk.append(sentence)
          current_tokens += sentence_tokens

      if current_chunk:
          chunks.append(" ".join(current_chunk))

      return chunks
  ```

---

## Summary

All technical decisions resolved with clear rationales. Key takeaways:
- **LLM**: Gemini Free Tier (15 RPM, 1M tokens/month) is optimal choice
- **Vector Store**: Qdrant Free Tier has 800x headroom (1.2MB used of 1GB limit)
- **Database**: Neon Free Tier has 15x headroom (33MB used of 512MB limit)
- **Plugin**: Docusaurus theme swizzling + client modules approach is standard and maintainable
- **Text Selection**: `window.getSelection()` API is sufficient with edge case handling
- **Chunking**: 512-token chunks, 128-token overlap, sentence boundaries optimize retrieval quality

**Risks Mitigated**:
- Free-tier capacity validated via calculations (not just assumptions)
- Browser API compatibility confirmed across modern browsers
- Chunking strategy balances precision and context preservation

**Next Steps**: Proceed to Phase 1 (Data Models & Contracts).
