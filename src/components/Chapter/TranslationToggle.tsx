import React from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx';
import type { TranslationToggleProps } from './types';
import styles from './TranslationToggle.module.css';

export default function TranslationToggle(): JSX.Element {
  const { i18n } = useDocusaurusContext();
  const location = useLocation();

  const switchLocale = (locale: string) => {
    const currentPath = location.pathname;
    let newPath = currentPath;

    // Remove existing locale prefix if present
    newPath = newPath.replace(/^\/(en|ur)\//, '/');

    // Add new locale prefix (except for default locale 'en')
    if (locale !== 'en') {
      newPath = `/${locale}${newPath}`;
    }

    // Navigate to new path
    window.location.href = newPath;
  };

  const currentLocale = i18n.currentLocale;

  return (
    <div className={styles.toggleContainer}>
      <div className={styles.toggleLabel}>Language:</div>
      <div className={styles.toggleButtons}>
        <button
          className={clsx(styles.toggleButton, {
            [styles.active]: currentLocale === 'en',
          })}
          onClick={() => switchLocale('en')}
          disabled={currentLocale === 'en'}
          aria-label="Switch to English"
        >
          <span className={styles.flag}>🇬🇧</span>
          <span className={styles.langText}>English</span>
        </button>

        <button
          className={clsx(styles.toggleButton, {
            [styles.active]: currentLocale === 'ur',
          })}
          onClick={() => switchLocale('ur')}
          disabled={currentLocale === 'ur'}
          aria-label="Switch to Urdu"
        >
          <span className={styles.flag}>🇵🇰</span>
          <span className={styles.langText}>اردو</span>
        </button>
      </div>
    </div>
  );
}
