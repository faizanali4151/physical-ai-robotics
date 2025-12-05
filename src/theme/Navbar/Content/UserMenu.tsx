/**
 * User Menu Component
 *
 * Displays user authentication state in the navbar
 * Shows user name and logout button when logged in
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from '@docusaurus/Link';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import styles from './UserMenu.module.css';

interface User {
  name: string;
  email: string;
  loggedIn: boolean;
  avatar?: string;
}

export default function UserMenu(): JSX.Element | null {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user from localStorage
  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.loggedIn) {
            setCurrentUser(user);
          }
        } catch (e) {
          console.error('Failed to parse user data', e);
        }
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (ExecutionEnvironment.canUseDOM) {
      localStorage.removeItem('user');
      setIsOpen(false);
      window.location.href = '/login';
    }
  };

  // Not logged in - show login button
  if (!currentUser) {
    return (
      <Link to="/login" className={styles.signInButton}>
        Sign In
      </Link>
    );
  }

  // Logged in - show user menu
  const displayName = currentUser.name || currentUser.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const hasAvatar = currentUser.avatar && currentUser.avatar.trim() !== '';

  return (
    <div className={styles.userMenuContainer} ref={dropdownRef}>
      <button
        className={styles.userButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={styles.userAvatar}>
          {hasAvatar ? (
            <img
              src={currentUser.avatar}
              alt={displayName}
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarInitial}>{initial}</span>
          )}
        </div>
        <span className={styles.userName}>{displayName}</span>
        <svg
          className={styles.dropdownArrow}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.dropdownUserInfo}>
              <div className={styles.dropdownName}>{displayName}</div>
              <div className={styles.dropdownEmail}>{currentUser.email}</div>
            </div>
          </div>

          <div className={styles.dropdownDivider} />

          <button
            className={styles.dropdownItem}
            onClick={handleLogout}
          >
            <svg
              className={styles.dropdownIcon}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.6667 11.3333L14 8L10.6667 4.66667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 8H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
