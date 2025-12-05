/**
 * Authentication Context Provider
 *
 * Simple localStorage-based authentication without Firebase
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

interface User {
  email: string;
  displayName: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.loggedIn) {
            setCurrentUser({
              email: user.email,
              displayName: user.name || user.email?.split('@')[0] || 'User'
            });
          }
        } catch (e) {
          console.error('Failed to parse user data', e);
        }
      }
      setLoading(false);
    }
  }, []);

  // Simple sign in - just stores credentials in localStorage
  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // In a real app, you would validate against a backend
    // For now, we just accept any email/password combination
    const user = {
      email,
      name: email.split('@')[0],
      loggedIn: true
    };

    if (ExecutionEnvironment.canUseDOM) {
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser({
        email: user.email,
        displayName: user.name
      });
    }
  };

  // Simple sign up - stores new user in localStorage
  const signUp = async (email: string, password: string, displayName: string) => {
    if (!email || !password || !displayName) {
      throw new Error('All fields are required');
    }

    // In a real app, you would create user in a backend
    // For now, we just store in localStorage
    const user = {
      email,
      name: displayName,
      loggedIn: true
    };

    if (ExecutionEnvironment.canUseDOM) {
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser({
        email: user.email,
        displayName: user.name
      });
    }
  };

  // Log out - clear localStorage
  const logOut = async () => {
    if (ExecutionEnvironment.canUseDOM) {
      localStorage.removeItem('user');
      setCurrentUser(null);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signIn,
    signUp,
    logOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
