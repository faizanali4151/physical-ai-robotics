/**
 * Main chat widget component.
 * Manages state, integrates ChatInput and ChatHistory, and handles API calls.
 *
 * ENHANCED WITH:
 * - Login-only visibility
 * - Physical AI theming
 * - Hover-to-ask feature
 * - Debug logging
 * - Improved animations
 */

import React, { useState, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { ChatHistory, ChatMessage } from './ChatHistory';
import { ChatClient, ChatClientError, QueryContext } from '../../api/chatClient';
import { ErrorBoundary } from './ErrorBoundary';
import './styles.css';

// Import Better Auth client
let authClient: any = null;
if (typeof window !== 'undefined') {
  // Dynamically import auth-client to avoid SSR issues
  import('../../../../../src/lib/auth-client').then(module => {
    authClient = module.authClient;
  }).catch(err => {
    console.error('[ChatWidget] Failed to load auth client:', err);
  });
}

// Check if user is logged in using Better Auth
const checkAuthSession = async (): Promise<boolean> => {
  if (!authClient) {
    console.log('[ChatWidget] Auth client not yet loaded');
    return false;
  }

  try {
    const session = await authClient.getSession();
    if (session?.data?.user) {
      console.log('[ChatWidget] User authenticated via Better Auth:', session.data.user.email);
      return true;
    }
  } catch (e) {
    console.error('[ChatWidget] Error checking Better Auth session:', e);
  }

  console.log('[ChatWidget] No Better Auth session found');
  return false;
};

export const ChatWidget: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [chatClient] = useState(() => {
    const endpoint = ChatClient.getApiEndpoint();
    console.log('[ChatWidget] Initializing ChatClient with endpoint:', endpoint);
    return new ChatClient(endpoint);
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number>(0);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showSelectionTooltip, setShowSelectionTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Check login status on mount and periodically using Better Auth
  useEffect(() => {
    console.log('[ChatWidget] Component mounted');

    const checkLogin = async () => {
      const loggedIn = await checkAuthSession();
      const wasLoggedIn = isLoggedIn;

      setIsLoggedIn(loggedIn);

      // If user just logged out, clean up
      if (wasLoggedIn && !loggedIn) {
        console.log('[ChatWidget] User logged out, destroying session');
        setIsOpen(false);
        setMessages([]);
        setError(null);
        ChatClient.clearSessionId();
      }
    };

    // Initial check after a small delay to ensure auth client is loaded
    const initialTimeout = setTimeout(() => {
      checkLogin();
    }, 500);

    // Check periodically for session changes
    const interval = setInterval(checkLogin, 3000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isLoggedIn]);

  // Listen for text selection on the page
  useEffect(() => {
    console.log('[ChatWidget] Setting up text selection listener');

    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 10 && text.length < 500) {
        console.log('[ChatWidget] Text selected:', text.substring(0, 30));
        setSelectedText(text);

        // Get selection position for tooltip
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          const x = rect.left + rect.width / 2 - 100; // Center tooltip
          const y = rect.top - 60; // Position above selection

          setTooltipPosition({ x: Math.max(10, x), y: Math.max(10, y) });
          setShowSelectionTooltip(true);
        }
      } else {
        setShowSelectionTooltip(false);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('selectionchange', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('selectionchange', handleSelection);
    };
  }, []);

  // Listen for hover-to-ask events
  useEffect(() => {
    console.log('[ChatWidget] Setting up hover-to-ask listener');

    const handleAskEvent = ((event: CustomEvent) => {
      const { text, query } = event.detail;
      console.log('[ChatWidget] Received hover-to-ask event');

      if (query && text) {
        // Open chatbot and send query
        setIsOpen(true);
        setTimeout(() => {
          handleSubmit(query, text);
        }, 300);
      }
    }) as EventListener;

    window.addEventListener('chatbot:ask', handleAskEvent);

    return () => {
      window.removeEventListener('chatbot:ask', handleAskEvent);
    };
  }, []);

  // Initialize session ID and load history
  useEffect(() => {
    const initializeSession = async () => {
      console.log('[ChatWidget] Initializing session');
      const id = ChatClient.getSessionId();
      console.log('[ChatWidget] Session ID:', id);
      setSessionId(id);

      // Load history if session exists
      if (id) {
        setIsLoadingHistory(true);
        try {
          const historyResponse = await chatClient.getHistory(id);

          if (historyResponse.messages.length > 0) {
            // Convert backend messages to ChatMessage format
            const loadedMessages: ChatMessage[] = historyResponse.messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              selectedText: msg.selected_text,
              sources: msg.sources,
              timestamp: new Date(msg.timestamp),
            }));

            setMessages(loadedMessages);
          }
        } catch (err) {
          console.error('Failed to load conversation history:', err);
          // Don't show error to user - just start with empty history
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };

    initializeSession();
  }, [chatClient]);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (rateLimitCountdown > 0) {
      const timer = setTimeout(() => {
        setRateLimitCountdown(rateLimitCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (rateLimitCountdown === 0 && error && error.includes('Rate limit')) {
      // Clear rate limit error when countdown reaches 0
      setError(null);
    }
  }, [rateLimitCountdown, error]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setError(null);
    }
  };

  const handleAskAboutSelection = () => {
    if (selectedText) {
      setIsOpen(true);
      setShowSelectionTooltip(false);
      setTimeout(() => {
        handleSubmit(`Explain this: "${selectedText}"`, selectedText);
      }, 300);
    }
  };

  const handleSubmit = async (query: string, selectedText?: string) => {
    console.log('[ChatWidget] handleSubmit called with query:', query.substring(0, 50));
    console.log('[ChatWidget] Selected text:', selectedText ? 'Yes (' + selectedText.substring(0, 30) + '...)' : 'No');
    console.log('[ChatWidget] Session ID:', sessionId);

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: query,
      selectedText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Submit query to backend
      console.log('[ChatWidget] Sending query to backend...');
      const response = await chatClient.submitQuery({
        query,
        selected_text: selectedText,
        session_id: sessionId,
      });
      console.log('[ChatWidget] Received response, answer length:', response.answer?.length || 0);
      console.log('[ChatWidget] Sources count:', response.sources?.length || 0);

      // Update session ID if new
      if (response.session_id !== sessionId) {
        setSessionId(response.session_id);
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      const error = err as ChatClientError;

      let errorMessage = 'Failed to get response. Please try again.';

      if (error.statusCode === 429) {
        const retryAfter = error.retryAfter || 60;
        setRateLimitCountdown(retryAfter);
        errorMessage = `Rate limit exceeded. Please wait ${retryAfter} seconds and try again.`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setError(errorMessage);

      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: `❌ ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorChatMessage]);

    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your conversation history? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Delete history from backend
      if (sessionId) {
        await chatClient.clearHistory(sessionId);
      }

      // Clear local state
      setMessages([]);

      // Clear session ID from localStorage and generate new one
      ChatClient.clearSessionId();
      const newSessionId = ChatClient.getSessionId();
      setSessionId(newSessionId);

    } catch (err) {
      const error = err as ChatClientError;
      const errorMessage = `Failed to clear history: ${error.message}`;
      setError(errorMessage);
      console.error('Failed to clear conversation history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login check - only show chatbot if user is logged in
  if (!isLoggedIn) {
    console.log('[ChatWidget] User not logged in, hiding widget');
    return null;
  }

  console.log('[ChatWidget] Rendering widget, isOpen:', isOpen, 'messages:', messages.length);

  return (
    <ErrorBoundary>
      {/* Floating button with Physical AI Robotics icon - only show when closed */}
      {!isOpen && (
        <button
          className="chat-widget-button"
          onClick={handleToggle}
          aria-label="Open chat"
          title="Physical AI Assistant"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Robot Head */}
            <rect x="5" y="8" width="14" height="11" rx="2" fill="currentColor" fillOpacity="0.1" />
            <rect x="5" y="8" width="14" height="11" rx="2" />
            {/* Eyes */}
            <circle cx="9" cy="12" r="1.5" fill="currentColor" />
            <circle cx="15" cy="12" r="1.5" fill="currentColor" />
            {/* Antenna */}
            <line x1="12" y1="8" x2="12" y2="5" />
            <circle cx="12" cy="4" r="1" fill="currentColor" />
            {/* Mouth - smile */}
            <path d="M9 15 Q12 17 15 15" fill="none" />
            {/* Body connection */}
            <line x1="12" y1="19" x2="12" y2="21" />
            {/* Arms */}
            <path d="M5 11 L3 13" />
            <path d="M19 11 L21 13" />
          </svg>
        </button>
      )}

      {/* Chat panel with backdrop */}
      {isOpen && (
        <>
          <div
            className="chat-widget-backdrop"
            onClick={handleToggle}
            aria-hidden="true"
          />
          <div
            className="chat-widget-modal"
            role="dialog"
            aria-label="AI Assistant Chat"
            aria-modal="true"
          >
          <div className="chat-widget-header">
            <div className="chat-widget-avatar">
              <img
                src="data:image/png;base64,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"
                alt="AI Chatbot"
                width="40"
                height="40"
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
            <div className="chat-widget-header-info">
              <h3 className="chat-widget-title">Physical AI Assistant</h3>
              <p className="chat-widget-subtitle">Robotics Expert</p>
            </div>
            <button
              className="chat-widget-close-button"
              onClick={handleToggle}
              aria-label="Close chat"
              title="Close"
            >
              ×
            </button>
          </div>

          {error && (
            <div
              className="chat-widget-error"
              role="alert"
              aria-live="polite"
            >
              {error}
              {rateLimitCountdown > 0 && (
                <div className="chat-widget-countdown" aria-live="polite" aria-atomic="true">
                  Retry in: {rateLimitCountdown}s
                </div>
              )}
            </div>
          )}

          <div className="chat-widget-body" role="log" aria-live="polite" aria-relevant="additions">
            <ChatHistory messages={messages} isLoading={isLoading} />
          </div>

          <div className="chat-widget-footer">
            <ChatInput onSubmit={handleSubmit} disabled={isLoading} isLoading={isLoading} />
          </div>
        </div>
        </>
      )}

      {/* Selection tooltip */}
      {showSelectionTooltip && selectedText && (
        <div
          className="chat-selection-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <button
            className="chat-selection-ask-button"
            onClick={handleAskAboutSelection}
            aria-label="Ask chatbot about selected text"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ marginRight: '6px' }}
            >
              <rect x="5" y="8" width="14" height="11" rx="2" />
              <circle cx="9" cy="12" r="1" fill="currentColor" />
              <circle cx="15" cy="12" r="1" fill="currentColor" />
              <line x1="12" y1="8" x2="12" y2="5" />
              <circle cx="12" cy="4" r="0.8" fill="currentColor" />
              <path d="M9 15 Q12 16.5 15 15" fill="none" />
            </svg>
            Ask AI about this
          </button>
        </div>
      )}
    </ErrorBoundary>
  );
};

// Auto-inject widget on page load and persist across Docusaurus navigation
if (typeof document !== 'undefined') {
  let reactRoot: any = null;

  const initWidget = () => {
    // Check if widget root already exists
    let root = document.getElementById('rag-chatbot-root');

    if (!root) {
      // Create root element
      root = document.createElement('div');
      root.id = 'rag-chatbot-root';
      document.body.appendChild(root);

      // Render widget (Docusaurus will handle React rendering)
      import('react-dom/client').then(({ createRoot }) => {
        reactRoot = createRoot(root);
        reactRoot.render(<ChatWidget />);
      });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  // Re-initialize on Docusaurus route changes
  if (typeof window !== 'undefined') {
    // Listen for both regular navigation and Docusaurus-specific events
    window.addEventListener('popstate', initWidget);

    // Docusaurus client-side navigation event
    const handleRouteChange = () => {
      // Small delay to ensure DOM is ready
      setTimeout(initWidget, 100);
    };

    // Listen for Docusaurus route updates
    if ('navigation' in window) {
      window.addEventListener('docusaurus:route-update', handleRouteChange);
    }
  }
}

export default ChatWidget;
