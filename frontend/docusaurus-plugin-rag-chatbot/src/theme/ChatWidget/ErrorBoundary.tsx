/**
 * Error Boundary component for catching React errors.
 * Displays user-friendly fallback UI when component tree crashes.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('ChatWidget Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Reload the page to fully reset the widget
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="chat-widget-error-boundary">
          <div className="chat-widget-error-boundary-content">
            <div className="chat-widget-error-boundary-icon">⚠️</div>
            <h3 className="chat-widget-error-boundary-title">
              Something went wrong
            </h3>
            <p className="chat-widget-error-boundary-message">
              The chat widget encountered an unexpected error.
            </p>
            <button
              className="chat-widget-error-boundary-button"
              onClick={this.handleReset}
            >
              Reload Chat
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="chat-widget-error-boundary-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="chat-widget-error-boundary-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
