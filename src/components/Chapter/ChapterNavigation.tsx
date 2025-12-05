import React from 'react';
import Link from '@docusaurus/Link';
import styles from './ChapterNavigation.module.css';

export interface ChapterNavigationProps {
  previousChapter?: {
    url: string;
    title: string;
  };
  nextChapter?: {
    url: string;
    title: string;
  };
}

export default function ChapterNavigation({
  previousChapter,
  nextChapter,
}: ChapterNavigationProps): JSX.Element {
  return (
    <nav className={styles.chapterNav}>
      <div className={styles.navButtons}>
        {previousChapter ? (
          <Link to={previousChapter.url} className={`${styles.navButton} ${styles.prev}`}>
            <span className={styles.navLabel}>← Previous</span>
            <span className={styles.navTitle}>{previousChapter.title}</span>
          </Link>
        ) : (
          <div className={styles.navPlaceholder} />
        )}

        {nextChapter ? (
          <Link to={nextChapter.url} className={`${styles.navButton} ${styles.next}`}>
            <span className={styles.navLabel}>Next →</span>
            <span className={styles.navTitle}>{nextChapter.title}</span>
          </Link>
        ) : (
          <div className={styles.navPlaceholder} />
        )}
      </div>
    </nav>
  );
}
