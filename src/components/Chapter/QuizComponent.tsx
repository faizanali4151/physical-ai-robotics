import React, { useState } from 'react';
import clsx from 'clsx';
import type { QuizProps, QuizState } from './types';
import styles from './QuizComponent.module.css';

export default function QuizComponent({
  questions,
  showFeedback = true,
  allowRetry = true,
  onComplete,
}: QuizProps): JSX.Element {
  const [state, setState] = useState<QuizState>({
    selectedAnswers: {},
    submitted: false,
    score: 0,
  });

  const handleSelectAnswer = (questionId: string, optionValue: string) => {
    if (state.submitted) return; // Don't allow changes after submission

    setState({
      ...state,
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: optionValue,
      },
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (state.selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    setState({
      ...state,
      submitted: true,
      score: correct,
    });

    if (onComplete) {
      onComplete(correct, questions.length);
    }
  };

  const handleRetry = () => {
    setState({
      selectedAnswers: {},
      submitted: false,
      score: 0,
    });
  };

  const allQuestionsAnswered = questions.every((q) => state.selectedAnswers[q.id]);

  return (
    <div className={styles.quizContainer} data-aos="zoom-in">
      <div className={styles.quizHeader}>
        <h3 className={styles.quizTitle}>Quiz: Test Your Understanding</h3>
        <p className={styles.quizDescription}>
          Answer all questions to check your understanding of Physical AI concepts.
        </p>
      </div>

      <div className={styles.questionsContainer}>
        {questions.map((question, idx) => {
          const selectedOption = state.selectedAnswers[question.id];
          const isCorrect = selectedOption === question.correctAnswer;
          const showQuestionFeedback = state.submitted && showFeedback;

          return (
            <div key={question.id} className={styles.questionBlock}>
              <div className={styles.questionHeader}>
                <span className={styles.questionNumber}>Question {idx + 1}</span>
              </div>

              <p className={styles.questionText}>{question.question}</p>

              <div className={styles.optionsContainer} role="radiogroup" aria-labelledby={`question-${question.id}`}>
                {question.options.map((option) => {
                  const isSelected = selectedOption === option.value;
                  const isCorrectOption = option.value === question.correctAnswer;
                  const showCorrect = showQuestionFeedback && isCorrectOption;
                  const showIncorrect = showQuestionFeedback && isSelected && !isCorrect;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={clsx(styles.option, {
                        [styles.selected]: isSelected && !state.submitted,
                        [styles.correct]: showCorrect,
                        [styles.incorrect]: showIncorrect,
                        [styles.disabled]: state.submitted,
                      })}
                      onClick={() => handleSelectAnswer(question.id, option.value)}
                      disabled={state.submitted}
                      role="radio"
                      aria-checked={isSelected}
                    >
                      <span className={styles.optionLabel}>{option.label}</span>
                      <span className={styles.optionText}>{option.text}</span>
                      {showCorrect && <span className={styles.feedbackIcon}>✓</span>}
                      {showIncorrect && <span className={styles.feedbackIcon}>✗</span>}
                    </button>
                  );
                })}
              </div>

              {showQuestionFeedback && question.explanation && (
                <div className={clsx(styles.explanation, {
                  [styles.explanationCorrect]: isCorrect,
                  [styles.explanationIncorrect]: !isCorrect,
                })}>
                  <strong>{isCorrect ? 'Correct!' : 'Incorrect.'}</strong> {question.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.quizActions}>
        {!state.submitted ? (
          <button
            className={clsx(styles.submitButton, {
              [styles.submitDisabled]: !allQuestionsAnswered,
            })}
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered}
          >
            Submit Quiz
          </button>
        ) : (
          <div className={styles.resultsContainer}>
            <div className={styles.scoreDisplay}>
              <span className={styles.scoreLabel}>Your Score:</span>
              <span className={styles.scoreValue}>
                {state.score} / {questions.length}
              </span>
              <span className={styles.scorePercent}>
                ({Math.round((state.score / questions.length) * 100)}%)
              </span>
            </div>

            {allowRetry && (
              <button className={styles.retryButton} onClick={handleRetry}>
                Retry Quiz
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
