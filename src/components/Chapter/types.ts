// TypeScript interfaces for Chapter components
// Feature: Introduction to Physical AI

export interface ChapterMetadata {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  wordCount: number;
  readingTime: number;
  learningObjectives: string[];
  prerequisites?: string[];
  nextChapter?: string;
  previousChapter?: string;
}

export interface ChapterHeroProps {
  title: string;
  subtitle: string;
  icon?: string;
}

export interface QuizOption {
  label: string; // A, B, C, D
  value: string; // option-a, option-b, etc.
  text: string;  // The actual answer text
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string; // matches one option.value
  explanation?: string;
}

export interface QuizProps {
  questions: QuizQuestion[];
  showFeedback?: boolean; // default true
  allowRetry?: boolean;   // default true
  onComplete?: (score: number, total: number) => void;
}

export interface QuizState {
  selectedAnswers: Record<string, string>; // questionId -> optionValue
  submitted: boolean;
  score: number;
}

export interface Exercise {
  id: string;
  title: string;
  objective: string;
  instructions: string;
  expectedOutcome: string;
  hints: string[];
  solution?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime?: number; // in minutes
}

export interface ExerciseProps {
  exercise: Exercise;
  defaultExpanded?: boolean;
}

export interface TranslationToggleProps {
  currentLocale: 'en' | 'ur';
  onLocaleChange: (locale: 'en' | 'ur') => void;
  availableLocales?: Array<{ code: string; label: string }>;
}

export interface CodeExample {
  language: string;
  title: string;
  code: string;
  description: string;
  dependencies: string[];
  runnable: boolean;
  filename?: string;
}

export interface MermaidDiagram {
  id: string;
  title: string;
  type: 'flowchart' | 'sequence' | 'class' | 'state' | 'architecture' | 'comparison';
  mermaidCode: string;
  description: string; // for alt-text (accessibility)
  caption?: string;
}

export interface ChapterProgressProps {
  currentChapter: number;
  totalChapters: number;
  compact?: boolean;
}

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
