import React, { useState } from 'react';
import clsx from 'clsx';
import type { ExerciseProps } from './types';
import styles from './ExerciseComponent.module.css';

export default function ExerciseComponent({
  exercise,
  defaultExpanded = false,
}: ExerciseProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const revealNextHint = () => {
    if (revealedHints < exercise.hints.length) {
      setRevealedHints(revealedHints + 1);
    }
  };

  const toggleSolution = () => setShowSolution(!showSolution);

  const getDifficultyColor = () => {
    switch (exercise.difficulty) {
      case 'easy':
        return styles.difficultyEasy;
      case 'medium':
        return styles.difficultyMedium;
      case 'hard':
        return styles.difficultyHard;
      default:
        return '';
    }
  };

  return (
    <div className={styles.exerciseContainer} data-aos="fade-up">
      <div className={styles.exerciseHeader} onClick={toggleExpanded}>
        <div className={styles.headerLeft}>
          <span className={clsx(styles.difficultyBadge, getDifficultyColor())}>
            {exercise.difficulty.toUpperCase()}
          </span>
          <h4 className={styles.exerciseTitle}>{exercise.title}</h4>
        </div>
        <button className={styles.expandButton} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
          <span className={clsx(styles.expandIcon, { [styles.expanded]: isExpanded })}>
            ▼
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className={styles.exerciseContent}>
          <div className={styles.objectiveSection}>
            <h5 className={styles.sectionHeading}>Objective</h5>
            <p className={styles.objective}>{exercise.objective}</p>
          </div>

          <div className={styles.instructionsSection}>
            <h5 className={styles.sectionHeading}>Instructions</h5>
            <div className={styles.instructions}>
              {exercise.instructions.split('\n').map((line, idx) => (
                <p key={idx} className={styles.instructionLine}>
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className={styles.expectedSection}>
            <h5 className={styles.sectionHeading}>Expected Outcome</h5>
            <p className={styles.expectedOutcome}>{exercise.expectedOutcome}</p>
          </div>

          {exercise.hints && exercise.hints.length > 0 && (
            <div className={styles.hintsSection}>
              <div className={styles.hintsHeader}>
                <h5 className={styles.sectionHeading}>Hints</h5>
                {revealedHints < exercise.hints.length && (
                  <button className={styles.revealButton} onClick={revealNextHint}>
                    Reveal Hint {revealedHints + 1}/{exercise.hints.length}
                  </button>
                )}
              </div>

              <div className={styles.hintsList}>
                {exercise.hints.slice(0, revealedHints).map((hint, idx) => (
                  <div key={idx} className={styles.hint}>
                    <span className={styles.hintNumber}>Hint {idx + 1}:</span> {hint}
                  </div>
                ))}
              </div>
            </div>
          )}

          {exercise.solution && (
            <div className={styles.solutionSection}>
              <button className={styles.solutionButton} onClick={toggleSolution}>
                {showSolution ? 'Hide' : 'Show'} Solution
              </button>

              {showSolution && (
                <div className={styles.solutionContent}>
                  <div className={styles.solutionWarning}>
                    Try solving the exercise yourself before viewing the solution!
                  </div>
                  <div className={styles.solutionText}>{exercise.solution}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
