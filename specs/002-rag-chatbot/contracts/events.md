# Event Flows: Frontend-Backend Interactions

**Feature**: RAG Chatbot for Physical AI Book
**Date**: 2025-12-07
**Purpose**: Document frontend-backend communication patterns and event sequences

---

## 1. User Query Flow (Basic)

**Trigger**: User types a question and presses Enter or clicks "Send" button

### Sequence

```
User → ChatWidget → chatClient → Backend API → LLM Service → Qdrant → Backend API → ChatWidget → User
```

### Steps

1. **Frontend: Capture Input**
   - User enters query in `ChatInput` component: "What is embodied intelligence?"
   - Frontend validates: query not empty, trim whitespace
   - ChatWidget adds "user" message to local state (optimistic UI update)

2. **Frontend: Send Request**
   - `chatClient.ts` constructs `POST /query` request:
     ```json
     {
       "query": "What is embodied intelligence?",
       "top_k": 5,
       "session_id": "550e8400-e29b-41d4-a716-446655440000"
     }
     ```
   - Sets `Content-Type: application/json`, includes CORS headers
   - Displays loading indicator ("Thinking...")

3. **Backend: Receive and Validate**
   - FastAPI `query.py` endpoint receives request
   - Pydantic validates `QueryRequest` schema
   - If invalid: return `400` with error details
   - Extract `query`, `session_id`, `top_k` from payload

4. **Backend: RAG Pipeline**
   - `rag_service.py` orchestrates:
     a. Generate query embedding via `llm_service.py` (Gemini API)
     b. Search Qdrant for top 5 similar chunks (cosine similarity)
     c. Build LLM prompt with retrieved chunks + system prompt
     d. Generate answer via Gemini Chat API
     e. Calculate confidence score (avg relevance of top chunks)

5. **Backend: Save to Database**
   - `db_service.py` saves user message to Neon:
     ```sql
     INSERT INTO chat_messages (session_id, role, content)
     VALUES ('550e8400...', 'user', 'What is embodied intelligence?');
     ```
   - Save assistant response with sources JSON
   - Update `conversation_sessions.last_activity` timestamp

6. **Backend: Return Response**
   - Construct `QueryResponse`:
     ```json
     {
       "answer": "Embodied intelligence refers to...",
       "sources": [
         {"chapter_title": "Introduction to Physical AI", "chapter_number": 1, ...}
       ],
       "confidence": 0.89,
       "session_id": "550e8400-e29b-41d4-a716-446655440000"
     }
     ```
   - Return `200 OK` with JSON payload

7. **Frontend: Display Response**
   - `chatClient.ts` receives response, parses JSON
   - ChatWidget adds "assistant" message to local state
   - Remove loading indicator
   - Render answer with markdown formatting
   - Optionally display source chips (chapter links)

### Error Handling

- **Network Error**: Display "Connection failed. Check your internet."
- **400 Validation Error**: Display error detail from backend response
- **429 Rate Limit**: Display "Too many requests. Try again in X seconds."
- **503 Service Unavailable**: Display "Service temporarily unavailable."

---

## 2. Selected Text Query Flow

**Trigger**: User highlights text on page, then asks a question

### Sequence

```
User → Browser Selection API → ChatWidget → chatClient → Backend API (prioritizes selected_text) → ChatWidget → User
```

### Steps

1. **Frontend: Capture Selected Text**
   - User highlights passage: "Zero Moment Point (ZMP) ensures stability..."
   - ChatWidget listens for `mouseup` event on query submission
   - Call `window.getSelection().toString()` to get selected text
   - Store in component state: `selectedText`

2. **Frontend: Send Request with Context**
   - User types query: "Explain this in simpler terms"
   - `chatClient.ts` constructs request with `selected_text`:
     ```json
     {
       "query": "Explain this in simpler terms",
       "selected_text": "Zero Moment Point (ZMP) ensures stability...",
       "top_k": 3,
       "session_id": "550e8400..."
     }
     ```

3. **Backend: RAG Pipeline with Override**
   - `rag_service.py` detects `selected_text` is present
   - **Override similarity search**: Use `selected_text` as primary context
   - Still search Qdrant for supplementary chunks (top 2-3)
   - Build LLM prompt prioritizing `selected_text`:
     ```
     SELECTED TEXT CONTEXT:
     {selected_text}

     ADDITIONAL CONTEXT:
     {retrieved_chunks}

     QUESTION: {query}

     Answer based primarily on the SELECTED TEXT CONTEXT above.
     ```
   - Generate answer via LLM

4. **Frontend: Display Response**
   - Render answer with note: "Based on your selected text"
   - Highlight selected text in chat history (light gray background)

---

## 3. Conversation History Load Flow

**Trigger**: User returns to book site (page reload or new browser tab)

### Sequence

```
User → ChatWidget (componentDidMount) → chatClient → Backend API → Neon DB → Backend API → ChatWidget
```

### Steps

1. **Frontend: Check for Session**
   - ChatWidget `useEffect` hook runs on mount
   - Check `localStorage` for `session_id` key
   - If found: session exists, load history
   - If not found: create new session (UUID generated client-side)

2. **Frontend: Request History**
   - `chatClient.ts` sends `GET /history/{session_id}`
   - Include session ID in URL path

3. **Backend: Fetch from Database**
   - FastAPI `history.py` endpoint receives request
   - `db_service.py` queries Neon:
     ```sql
     SELECT * FROM chat_messages
     WHERE session_id = '550e8400...'
     ORDER BY timestamp ASC;
     ```
   - If session not found: return `404`
   - If found: construct `HistoryResponse` with message list

4. **Backend: Return History**
   - Return `200 OK` with `HistoryResponse` JSON:
     ```json
     {
       "session_id": "550e8400...",
       "messages": [
         {"role": "user", "content": "What is Physical AI?", ...},
         {"role": "assistant", "content": "Physical AI refers to...", ...}
       ],
       "message_count": 10
     }
     ```

5. **Frontend: Render History**
   - ChatWidget iterates over `messages` array
   - Render each message in `ChatHistory` component
   - Scroll to bottom (most recent message)
   - User can scroll up to review older messages

### Edge Cases

- **No history found (404)**: Start with empty chat, treat as new session
- **Network error**: Display "Failed to load history" with retry button

---

## 4. Clear History Flow

**Trigger**: User clicks "Clear History" button in chat widget

### Sequence

```
User → ChatWidget → chatClient → Backend API → Neon DB → Backend API → ChatWidget
```

### Steps

1. **Frontend: Confirm Action**
   - Display confirmation dialog: "Clear all chat history?"
   - If user confirms: proceed to step 2
   - If user cancels: close dialog, no action

2. **Frontend: Send Delete Request**
   - `chatClient.ts` sends `DELETE /history/{session_id}`
   - Include session ID in URL path

3. **Backend: Delete from Database**
   - FastAPI `history.py` endpoint receives request
   - `db_service.py` deletes messages:
     ```sql
     DELETE FROM chat_messages WHERE session_id = '550e8400...';
     ```
   - Cascade delete via FK constraint handles cleanup
   - If session not found: return `404`

4. **Backend: Return Success**
   - Return `204 No Content` (successful deletion, no response body)

5. **Frontend: Update UI**
   - Clear `messages` array in ChatWidget state
   - Display empty chat view with placeholder: "Start a conversation..."
   - Optionally: Generate new session ID and update `localStorage`

### Error Handling

- **404 Not Found**: Warn user "Session not found" but still clear UI
- **503 Service Unavailable**: Display "Failed to clear history. Try again."

---

## 5. Health Check Flow (Monitoring)

**Trigger**: Periodic polling by monitoring system or user navigates to /health endpoint

### Sequence

```
Monitoring System → Backend API → Qdrant/Neon/LLM API → Backend API → Monitoring System
```

### Steps

1. **Request: GET /health**
   - No authentication required (public endpoint)
   - Sent every 60 seconds by monitoring service (e.g., UptimeRobot, Healthchecks.io)

2. **Backend: Check Dependencies**
   - FastAPI `health.py` endpoint receives request
   - Parallel health checks (with 5-second timeout each):
     a. **Qdrant**: `qdrant_service.py` pings cluster: `GET /collections`
     b. **Neon**: `db_service.py` runs: `SELECT 1`
     c. **LLM API**: `llm_service.py` pings: `GET /models` (Gemini API)
   - Measure latency for each check

3. **Backend: Aggregate Status**
   - If all healthy: `status = "healthy"`, return `200 OK`
   - If any unhealthy: `status = "unhealthy"`, return `503 Service Unavailable`
   - Include individual dependency statuses in response

4. **Response: HealthResponse**
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

5. **Monitoring: Alert on Failure**
   - If `status = "unhealthy"`: send alert (email, Slack, PagerDuty)
   - If latency > 500ms: send warning (degraded performance)

---

## 6. Rate Limit Flow

**Trigger**: User or multiple users exceed LLM API free-tier rate limit (15 RPM for Gemini)

### Sequence

```
User → ChatWidget → chatClient → Backend API → LLM Service (429) → Backend API (429) → ChatWidget
```

### Steps

1. **Backend: Detect Rate Limit**
   - `llm_service.py` calls Gemini API
   - Gemini returns `429 Too Many Requests` with `Retry-After: 60` header
   - `llm_service.py` catches exception, extracts retry delay

2. **Backend: Return Rate Limit Error**
   - Construct `ErrorResponse`:
     ```json
     {
       "error": "Rate limit exceeded",
       "detail": "Gemini API rate limit reached. Try again in 60 seconds.",
       "status_code": 429
     }
     ```
   - Return `429` with `Retry-After: 60` header

3. **Frontend: Display Error**
   - `chatClient.ts` detects `429` status code
   - Extract `Retry-After` header value
   - Display user-friendly message: "Too many requests. Try again in 60 seconds."
   - Optionally: disable "Send" button for 60 seconds with countdown timer

4. **Frontend: Retry Logic**
   - After 60 seconds: re-enable "Send" button
   - User can retry query

### Mitigation Strategies

- **Backend**: Implement request queue with exponential backoff
- **Backend**: Cache frequent queries (e.g., "What is Physical AI?") to reduce API calls
- **Frontend**: Debounce user input (wait 500ms after last keystroke before enabling "Send")

---

## 7. Error Recovery Patterns

### Network Errors

**Scenario**: User's internet connection drops during query submission

**Handling**:
- Frontend: Catch `fetch()` network error
- Display: "Connection failed. Check your internet and try again."
- Provide "Retry" button that re-submits the query
- Do not add failed query to chat history

### Service Unavailable (503)

**Scenario**: Qdrant cluster is down for maintenance

**Handling**:
- Backend: `qdrant_service.py` catches connection error
- Return `503 Service Unavailable` with detail: "Vector store unavailable"
- Frontend: Display: "Service temporarily unavailable. Try again in a few minutes."
- Log error to monitoring system for alerting

### Invalid Query (400)

**Scenario**: User submits empty query or query exceeds 2000 characters

**Handling**:
- Backend: Pydantic validation fails, FastAPI returns `422 Unprocessable Entity`
- Frontend: Display validation error: "Query cannot be empty" or "Query too long (max 2000 characters)"
- Highlight input field with red border
- Do not add invalid query to chat history

---

## Summary

All frontend-backend event flows documented with clear sequences, error handling, and edge cases. Key interaction patterns:

1. **User Query**: Standard RAG pipeline (embed → search → generate → save)
2. **Selected Text Query**: Context override with prioritized LLM prompt
3. **History Load**: Fetch from Neon on page mount, restore session
4. **Clear History**: Confirm → delete → update UI
5. **Health Check**: Periodic monitoring with dependency status aggregation
6. **Rate Limit**: Graceful degradation with user-facing retry guidance
7. **Error Recovery**: Network/service/validation errors handled with clear messaging

All flows align with constitution principles (CLI-automatable, free-tier infrastructure, book-content-only RAG).
