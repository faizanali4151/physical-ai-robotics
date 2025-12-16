/**
 * Chat history component for displaying messages.
 * Renders user queries and assistant responses with sources.
 */

import React, { useEffect, useRef } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  selectedText?: string;
  sources?: Array<{
    chunk_text: string;
    chapter_number: number;
    chapter_title: string;
    similarity_score: number;
  }>;
  timestamp?: Date;
}

export interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  messages,
  isLoading = false,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  const formatMarkdown = (text: string): string => {
    // Simple markdown formatting (can be enhanced with markdown library)
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />');
  };

  const renderSelectedTextContext = (selectedText: string) => (
    <div className="chat-selected-context">
      <div className="chat-selected-context-label">Based on your selected text:</div>
      <div className="chat-selected-context-text">{selectedText}</div>
    </div>
  );

  const renderSources = (sources: Array<{
    chunk_text: string;
    chapter_number: number;
    chapter_title: string;
    similarity_score: number;
  }>) => {
    // Sources section removed as per user request
    return null;
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';

    return (
      <div
        key={index}
        className={`chat-message chat-message-${message.role}`}
      >
        <div className="chat-message-role">
          {isUser ? 'You' : 'Assistant'}
        </div>

        {message.selectedText && isUser && renderSelectedTextContext(message.selectedText)}

        <div
          className="chat-message-content"
          dangerouslySetInnerHTML={{
            __html: formatMarkdown(message.content),
          }}
        />

        {message.sources && !isUser && renderSources(message.sources)}

        {message.timestamp && (
          <div className="chat-message-timestamp">
            {message.timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-history" role="log" aria-label="Chat conversation history">
      {messages.length === 0 && !isLoading && (
        <div className="chat-empty-state">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            className="chat-empty-icon"
          >
            <rect x="5" y="8" width="14" height="11" rx="2" fill="currentColor" fillOpacity="0.05" />
            <rect x="5" y="8" width="14" height="11" rx="2" />
            <circle cx="9" cy="12" r="1.5" fill="currentColor" />
            <circle cx="15" cy="12" r="1.5" fill="currentColor" />
            <line x1="12" y1="8" x2="12" y2="5" />
            <circle cx="12" cy="4" r="1" fill="currentColor" />
            <path d="M9 15 Q12 17 15 15" fill="none" />
            <line x1="12" y1="19" x2="12" y2="21" />
            <path d="M5 11 L3 13" />
            <path d="M19 11 L21 13" />
          </svg>
          <h3 className="chat-empty-title">Welcome to Physical AI Assistant!</h3>
          <p className="chat-empty-text">Ask me anything about robotics, humanoid systems, and embodied AI.</p>
          <div className="chat-empty-suggestions">
            <div className="chat-empty-suggestion">💡 Hover over any chapter content to ask questions</div>
            <div className="chat-empty-suggestion">🤖 Get instant answers from the Physical AI book</div>
            <div className="chat-empty-suggestion">📚 Explore concepts with AI-powered explanations</div>
          </div>
        </div>
      )}

      {messages.map(renderMessage)}

      {isLoading && (
        <div className="chat-message chat-message-assistant" aria-live="polite">
          <div className="chat-message-role">Assistant</div>
          <div className="chat-message-loading" aria-label="Loading response">
            <div className="chat-loading-robot">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="chat-loading-robot-icon"
              >
                <rect x="5" y="8" width="14" height="11" rx="2" fill="currentColor" fillOpacity="0.1" />
                <rect x="5" y="8" width="14" height="11" rx="2" />
                <circle cx="9" cy="12" r="1.5" fill="currentColor" className="chat-loading-eye-left" />
                <circle cx="15" cy="12" r="1.5" fill="currentColor" className="chat-loading-eye-right" />
                <line x1="12" y1="8" x2="12" y2="5" className="chat-loading-antenna" />
                <circle cx="12" cy="4" r="1" fill="currentColor" className="chat-loading-antenna-tip" />
                <path d="M9 15 Q12 17 15 15" fill="none" />
                <line x1="12" y1="19" x2="12" y2="21" />
                <path d="M5 11 L3 13" />
                <path d="M19 11 L21 13" />
              </svg>
            </div>
            <div className="chat-loading-text">
              <span className="chat-loading-message">Processing your query</span>
              <div className="chat-loading-dots">
                <span className="chat-loading-dot"></span>
                <span className="chat-loading-dot"></span>
                <span className="chat-loading-dot"></span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
