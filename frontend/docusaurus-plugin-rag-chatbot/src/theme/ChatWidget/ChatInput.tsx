/**
 * Chat input component for user queries.
 * Handles text input, validation, and submission.
 */

import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';

export interface ChatInputProps {
  onSubmit: (query: string, selectedText?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  disabled = false,
  placeholder = 'Ask a question about the Physical AI book...',
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    // Get selected text from page
    const selectedText = window.getSelection()?.toString().trim() || undefined;

    // Submit query
    onSubmit(trimmedQuery, selectedText);

    // Clear input
    setQuery('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    setIsTyping(true);
  };

  // Debounce effect: Mark as not typing after 500ms of inactivity
  useEffect(() => {
    if (isTyping) {
      const timeoutId = setTimeout(() => {
        setIsTyping(false);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [query, isTyping]);

  const isValid = query.trim().length > 0 && !isTyping;

  return (
    <div className="chat-input-container">
      <textarea
        className="chat-input-field"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={2}
        maxLength={2000}
        aria-label="Chat message input"
      />
      <button
        className="chat-input-submit"
        onClick={handleSubmit}
        disabled={disabled || !isValid}
        aria-label="Send message"
      >
        {isLoading ? (
          <div className="chat-input-loading">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="chat-input-spinner"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          'Send'
        )}
      </button>
    </div>
  );
};
