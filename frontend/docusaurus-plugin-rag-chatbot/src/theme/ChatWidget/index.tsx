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

// Import Better Auth client from plugin-local shim
let authClient: any = null;
if (typeof window !== 'undefined') {
  // Dynamically import auth-client to avoid SSR issues
  import('../../lib/auth-client').then(module => {
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
              <svg
                width="40"
                height="40"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Robot head with AI text */}
                <rect x="50" y="30" width="100" height="70" rx="15" fill="#7BA3D8" stroke="#000" strokeWidth="6"/>
                <text x="100" y="75" fontSize="40" fontWeight="bold" textAnchor="middle" fill="#000">AI</text>

                {/* Antennas */}
                <line x1="65" y1="30" x2="65" y2="10" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
                <circle cx="65" cy="5" r="8" fill="#FF6B9D" stroke="#000" strokeWidth="5"/>
                <line x1="135" y1="30" x2="135" y2="10" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
                <circle cx="135" cy="5" r="8" fill="#FF6B9D" stroke="#000" strokeWidth="5"/>

                {/* Headphones/ears */}
                <rect x="30" y="45" width="15" height="30" rx="8" fill="#5A7FA8" stroke="#000" strokeWidth="5"/>
                <rect x="155" y="45" width="15" height="30" rx="8" fill="#5A7FA8" stroke="#000" strokeWidth="5"/>

                {/* Neck */}
                <rect x="80" y="100" width="40" height="15" fill="#5A7FA8" stroke="#000" strokeWidth="5"/>

                {/* Body */}
                <rect x="60" y="115" width="80" height="30" rx="8" fill="#E8F0F8" stroke="#000" strokeWidth="6"/>

                {/* Arms with circles */}
                <line x1="60" y1="130" x2="30" y2="130" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
                <circle cx="25" cy="130" r="8" fill="#FF6B9D" stroke="#000" strokeWidth="5"/>
                <line x1="140" y1="130" x2="170" y2="130" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
                <circle cx="175" cy="130" r="8" fill="#FF6B9D" stroke="#000" strokeWidth="5"/>

                {/* Center body detail */}
                <rect x="85" y="122" width="30" height="16" rx="5" fill="#7BA3D8" stroke="#000" strokeWidth="4"/>

                {/* Lower connection nodes */}
                <circle cx="70" cy="155" r="8" fill="#FF6B9D" stroke="#000" strokeWidth="5"/>
                <line x1="70" y1="155" x2="70" y2="175" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
                <circle cx="100" cy="160" r="6" fill="#5A7FA8" stroke="#000" strokeWidth="4"/>
                <line x1="100" y1="160" x2="100" y2="180" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
                <circle cx="130" cy="155" r="8" fill="#FF6B9D" stroke="#000" strokeWidth="5"/>
                <line x1="130" y1="155" x2="130" y2="175" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
              </svg>
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
