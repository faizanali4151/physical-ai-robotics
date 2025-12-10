import React, { useState, useEffect, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { authClient } from '../lib/auth-client';
import styles from './login.module.css';

export default function Login(): ReactNode {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // DO NOT auto-redirect if already authenticated
  // Let user see login page, they can navigate away manually
  // This prevents redirect loops and unexpected behavior

  // Handle email/password authentication with Better Auth
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Validate required fields
        if (!email.trim()) {
          throw new Error('Email is required');
        }
        if (!password) {
          throw new Error('Password is required');
        }

        // Sign in with Better Auth
        console.log('🔐 Attempting sign in with:', email);
        const result = await authClient.signIn.email({
          email: email.trim(),
          password,
        });

        console.log('📊 Sign in result:', result);

        if (result.error) {
          throw new Error(result.error.message || 'Sign in failed');
        }

        setSuccess('✅ Login successful! Redirecting...');
        console.log('✅ Login successful!', result.data?.user);

        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        // Validate required fields
        if (!displayName.trim()) {
          throw new Error('Name is required');
        }
        if (!email.trim()) {
          throw new Error('Email is required');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        // Sign up with Better Auth
        console.log('📝 Attempting sign up with:', email, displayName);
        const result = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: displayName.trim(),
        });

        console.log('📊 Sign up result:', result);

        if (result.error) {
          throw new Error(result.error.message || 'Sign up failed');
        }

        setSuccess('✅ Account created successfully! Please log in with your credentials.');
        console.log('✅ Account created!', result.data?.user);

        // Clear form fields
        setEmail('');
        setPassword('');
        setDisplayName('');

        // Redirect to login tab after 2 seconds
        setTimeout(() => {
          setIsLogin(true);
          setSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error('❌ Authentication error:', err);

      // User-friendly error messages
      let errorMessage = err.message || 'Authentication failed. Please try again.';

      if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
        errorMessage = '⚠️ Cannot connect to authentication server. Please ensure the backend is running.';
      } else if (errorMessage.includes('Invalid') || errorMessage.includes('credentials')) {
        errorMessage = '❌ Invalid email or password. Please try again.';
      } else if (errorMessage.includes('exists') || errorMessage.includes('already')) {
        errorMessage = '⚠️ This email is already registered. Please sign in instead.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth sign in with Better Auth
  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔗 Initiating ${provider} OAuth...`);

      // Use Better Auth client to initiate OAuth flow
      // IMPORTANT: Use absolute URL for callbackURL to prevent redirect to wrong domain
      await authClient.signIn.social({
        provider: provider,
        callbackURL: 'http://localhost:3000/', // Absolute URL to frontend
      });
    } catch (err: any) {
      console.error(`❌ ${provider} OAuth error:`, err);
      setError(err.message || `${provider} sign-in failed`);
      setLoading(false);
    }
  };

  return (
    <Layout title="Login" description="Login to Physical AI Book">
      <div className={styles.loginPage}>
        {/* Animated Background */}
        <div className={styles.background}>
          <div className={styles.orb1}></div>
          <div className={styles.orb2}></div>
          <div className={styles.orb3}></div>
        </div>

        {/* Content Container */}
        <div className={styles.contentContainer}>
          {/* Login Card */}
          <div className={styles.loginCard}>
            <div className={styles.cardHeader}>
              <h1 className={styles.title}>Welcome Back</h1>
              <p className={styles.subtitle}>
                {isLogin ? 'Sign in to access the book' : 'Create your account'}
              </p>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${isLogin ? styles.active : ''}`}
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                  setSuccess(null);
                }}
                disabled={loading}
              >
                Login
              </button>
              <button
                className={`${styles.tab} ${!isLogin ? styles.active : ''}`}
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                  setSuccess(null);
                }}
                disabled={loading}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {!isLogin && (
                <div className={styles.inputGroup}>
                  <label htmlFor="displayName" className={styles.label}>
                    Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    className={styles.input}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              )}

              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Success Message */}
            {success && (
              <div className={styles.success} style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#d4edda',
                color: '#155724',
                border: '1px solid #c3e6cb',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
                {success}
              </div>
            )}

            {/* Error Message Display */}
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {/* Social Login Buttons */}
            <div className={styles.divider}>
              <span className={styles.dividerText}>Or continue with</span>
            </div>

            <div className={styles.socialButtons}>
              <button
                type="button"
                className={styles.socialButton}
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
              >
                <svg className={styles.socialIcon} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              <button
                type="button"
                className={styles.socialButton}
                onClick={() => handleOAuthSignIn('github')}
                disabled={loading}
              >
                <svg className={styles.socialIcon} viewBox="0 0 24 24">
                  <path fill="#181717" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>

            <p className={styles.switchText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                className={styles.switchButton}
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
                }}
                disabled={loading}
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>

          {/* Footer - Inside content container */}
          <footer className={styles.loginFooter}>
            <div className={styles.footerLinks}>
              <a href="/docs/intro" className={styles.footerLink}>About</a>
              <span className={styles.footerSeparator}>•</span>
              <a href="/docs/intro" className={styles.footerLink}>Help</a>
              <span className={styles.footerSeparator}>•</span>
              <a href="/docs/intro" className={styles.footerLink}>Privacy</a>
              <span className={styles.footerSeparator}>•</span>
              <a href="/docs/intro" className={styles.footerLink}>Terms</a>
            </div>
            <p className={styles.footerTitle}>Physical AI & Humanoid Robotics Book</p>
            <p className={styles.footerCopyright}>© 2025 All rights reserved</p>
          </footer>
        </div>
      </div>
    </Layout>
  );
}
