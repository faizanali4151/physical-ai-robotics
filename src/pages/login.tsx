import React, { useState, useEffect, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import styles from './login.module.css';

export default function Login(): ReactNode {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.loggedIn) {
            window.location.href = '/';
          }
        } catch (e) {
          // Invalid user data, continue to login
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      if (ExecutionEnvironment.canUseDOM) {
        const userName = isLogin
          ? (email.split('@')[0] || 'User')
          : (displayName.trim() || email.split('@')[0] || 'User');

        const user = {
          email: email,
          name: userName,
          loggedIn: true
        };

        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/';
      }
    }, 500);
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
                setError('');
              }}
            >
              Login
            </button>
            <button
              className={`${styles.tab} ${!isLogin ? styles.active : ''}`}
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
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

          {/* Error Message Display */}
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* Social Login Buttons (UI Only) */}
          <div className={styles.divider}>
            <span className={styles.dividerText}>Or continue with</span>
          </div>

          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.socialButton}
              onClick={() => {
                const demoEmail = 'google.user@example.com';
                const demoName = 'Google User';
                const user = { email: demoEmail, name: demoName, loggedIn: true };
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = '/';
              }}
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
              onClick={() => {
                const demoEmail = 'github.user@example.com';
                const demoName = 'GitHub User';
                const user = { email: demoEmail, name: demoName, loggedIn: true };
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = '/';
              }}
            >
              <svg className={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="#181717" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </button>

            <button
              type="button"
              className={styles.socialButton}
              onClick={() => {
                const demoEmail = 'facebook.user@example.com';
                const demoName = 'Facebook User';
                const user = { email: demoEmail, name: demoName, loggedIn: true };
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = '/';
              }}
            >
              <svg className={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <p className={styles.switchText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              className={styles.switchButton}
              onClick={() => {
                setIsLogin(!isLogin);
              }}
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
