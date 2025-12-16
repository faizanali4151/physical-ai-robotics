import React from 'react';
import styles from './ChapterProgress.module.css';

export interface ChapterProgressProps {
  currentChapter: number;
  totalChapters: number;
  compact?: boolean;
}

export default function ChapterProgress({
  currentChapter,
  totalChapters,
  compact = false,
}: ChapterProgressProps): JSX.Element {
  const percentage = (currentChapter / totalChapters) * 100;

  if (compact) {
    return (
      <div className={styles.compactProgress}>
        <span className={styles.compactText}>
          Chapter {currentChapter} of {totalChapters}
        </span>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.progress}>
      <div className={styles.progressInfo}>
        <span className={styles.progressText}>
          Chapter {currentChapter} of {totalChapters}
        </span>
        <span className={styles.progressPercentage}>{Math.round(percentage)}%</span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={styles.chapterDots}>
        {Array.from({ length: totalChapters }, (_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${
              i < currentChapter ? styles.dotCompleted : ''
            } ${i === currentChapter - 1 ? styles.dotCurrent : ''}`}
            title={`Chapter ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
