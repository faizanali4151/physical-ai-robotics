import React, { useEffect } from 'react';

export default function Root({ children }) {
  useEffect(() => {
    // Suppress ResizeObserver error overlay in development
    const resizeObserverErrorHandler = (event: ErrorEvent) => {
      if (
        event.message === 'ResizeObserver loop completed with undelivered notifications.' ||
        event.message === 'ResizeObserver loop limit exceeded'
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    window.addEventListener('error', resizeObserverErrorHandler);

    return () => {
      window.removeEventListener('error', resizeObserverErrorHandler);
    };
  }, []);

  return <>{children}</>;
}
