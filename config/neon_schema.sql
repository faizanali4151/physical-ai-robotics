-- RAG Chatbot Database Schema for Neon Postgres
-- Conversation history and session management

-- Create conversation_sessions table
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_activity TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for conversation_sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON conversation_sessions(last_activity DESC);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    selected_text TEXT,
    sources JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON chat_messages(timestamp DESC);

-- Add comments for documentation
COMMENT ON TABLE conversation_sessions IS 'Stores user chat sessions with 30-day retention policy';
COMMENT ON TABLE chat_messages IS 'Stores individual messages (user queries and assistant responses) with sources';
COMMENT ON COLUMN chat_messages.role IS 'Message sender: user or assistant';
COMMENT ON COLUMN chat_messages.selected_text IS 'User-highlighted text context (only for user messages)';
COMMENT ON COLUMN chat_messages.sources IS 'JSON array of source chunks used for answer generation (only for assistant messages)';
