/**
 * API client for RAG chatbot backend.
 * Handles query submissions and health checks with retry logic.
 */

export interface QueryRequest {
  query: string;
  selected_text?: string;
  top_k?: number;
  session_id?: string;
}

export interface QueryContext {
  chunk_text: string;
  chapter_number: number;
  chapter_title: string;
  similarity_score: number;
  position: number;
}

export interface QueryResponse {
  answer: string;
  sources: QueryContext[];
  session_id: string;
  message_id: string;
}

export interface HealthResponse {
  status: string;
  services: {
    qdrant: string;
    llm: string;
    database: string;
  };
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  selected_text?: string;
  sources?: QueryContext[];
  timestamp: string;
}

export interface HistoryResponse {
  session_id: string;
  messages: ChatMessage[];
}

export class ChatClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'ChatClientError';
  }
}

export class ChatClient {
  private apiEndpoint: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    apiEndpoint: string = 'http://localhost:8000',
    maxRetries: number = 3,
    retryDelay: number = 1000,
  ) {
    this.apiEndpoint = apiEndpoint.replace(/\/$/, ''); // Remove trailing slash
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * Get API endpoint from meta tag or use default.
   */
  static getApiEndpoint(): string {
    if (typeof document !== 'undefined') {
      const meta = document.querySelector('meta[name="rag-chatbot-api"]');
      if (meta) {
        return meta.getAttribute('content') || 'http://localhost:8000';
      }
    }
    return process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  }

  /**
   * Submit a query to the RAG chatbot backend.
   *
   * @param request Query request parameters
   * @returns Query response with answer and sources
   * @throws ChatClientError on failure
   */
  async submitQuery(request: QueryRequest): Promise<QueryResponse> {
    console.log('[ChatClient] submitQuery called');
    console.log('[ChatClient] Request:', { ...request, query: request.query.substring(0, 50) + '...' });
    console.log('[ChatClient] Endpoint:', `${this.apiEndpoint}/query`);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        console.log(`[ChatClient] Attempt ${attempt + 1}/${this.maxRetries}`);

        const response = await fetch(`${this.apiEndpoint}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        console.log('[ChatClient] Response status:', response.status, response.statusText);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = parseInt(
            response.headers.get('Retry-After') || '60',
            10,
          );
          throw new ChatClientError(
            'Rate limit exceeded',
            429,
            retryAfter,
          );
        }

        // Handle other errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ChatClientError(
            errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
          );
        }

        // Parse and return response
        const data: QueryResponse = await response.json();
        console.log('[ChatClient] Success! Answer length:', data.answer?.length || 0);
        console.log('[ChatClient] Sources:', data.sources?.length || 0);
        console.log('[ChatClient] Session ID:', data.session_id);
        return data;

      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx except 429)
        if (error instanceof ChatClientError && error.statusCode) {
          if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
            throw error;
          }
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.maxRetries - 1) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw new ChatClientError(
      `Failed after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    );
  }

  /**
   * Check health status of backend services.
   *
   * @returns Health status response
   * @throws ChatClientError on failure
   */
  async getHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new ChatClientError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
        );
      }

      const data: HealthResponse = await response.json();
      return data;

    } catch (error) {
      if (error instanceof ChatClientError) {
        throw error;
      }
      throw new ChatClientError(
        `Health check failed: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get or create session ID from localStorage.
   *
   * @returns Session ID (UUID)
   */
  static getSessionId(): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }

    const storageKey = 'rag-chatbot-session-id';
    let sessionId = localStorage.getItem(storageKey);

    if (!sessionId) {
      // Generate UUID v4
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      localStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
  }

  /**
   * Clear session ID from localStorage.
   */
  static clearSessionId(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('rag-chatbot-session-id');
    }
  }

  /**
   * Get conversation history for a session.
   *
   * @param sessionId Session UUID
   * @param limit Maximum number of messages to retrieve (default: 50)
   * @returns History response with messages
   * @throws ChatClientError on failure
   */
  async getHistory(sessionId: string, limit: number = 50): Promise<HistoryResponse> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/history/${sessionId}?limit=${limit}`,
        {
          method: 'GET',
        },
      );

      if (response.status === 404) {
        // Session not found - return empty history
        return {
          session_id: sessionId,
          messages: [],
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ChatClientError(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
        );
      }

      const data: HistoryResponse = await response.json();
      return data;

    } catch (error) {
      if (error instanceof ChatClientError) {
        throw error;
      }
      throw new ChatClientError(
        `Failed to get history: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Delete conversation history for a session.
   *
   * @param sessionId Session UUID
   * @throws ChatClientError on failure
   */
  async clearHistory(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiEndpoint}/history/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.status === 404) {
        // Session not found - already cleared
        return;
      }

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        throw new ChatClientError(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
        );
      }

    } catch (error) {
      if (error instanceof ChatClientError) {
        throw error;
      }
      throw new ChatClientError(
        `Failed to clear history: ${(error as Error).message}`,
      );
    }
  }
}
