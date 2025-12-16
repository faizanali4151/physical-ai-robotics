/**
 * Protected Route Component
 *
 * Redirects to login page if user is not authenticated
 * Shows loading spinner while checking auth state
 */

import React, { useEffect, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element | null {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    // Only redirect on client-side
    if (!loading && !currentUser && ExecutionEnvironment.canUseDOM) {
      window.location.href = '/login';
    }
  }, [currentUser, loading]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Loading...</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect happening in useEffect
  if (!currentUser) {
    return null;
  }

  // Authenticated - show content
  return <>{children}</>;
}
