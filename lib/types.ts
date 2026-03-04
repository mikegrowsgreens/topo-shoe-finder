export interface Shoe {
  id: string;
  name: string;
  category: "road" | "trail";
  stack: string;
  drop: string;
  bestFor: string;
  cushion: "max" | "balanced" | "firmer";
  support: "neutral" | "guidance" | "max";
  terrain: string[];
  weight: string;
  pdpMens: string;
  pdpWomens: string;
  benefits: string[];
  description: string;
}

export interface QuizAnswers {
  activity: "road" | "trail" | "hike" | "walk" | "recovery" | null;
  cushion: "max" | "balanced" | "firmer" | null;
  terrain: "pavement" | "mixed" | "technical" | null;
  support: "neutral" | "guidance" | "max" | null;
  fit: "roomy" | "standard" | "wide" | null;
  priorities: string[];
}

export interface ScoredShoe {
  shoe: Shoe;
  score: number;
  rank: "best" | "great" | "good";
  matchReasons: string[];
}

export interface QuizQuestion {
  id: keyof QuizAnswers;
  step: number;
  title: string;
  subtitle: string;
  options: QuizOption[];
  multiSelect?: boolean;
  maxSelections?: number;
  conditional?: {
    field: keyof QuizAnswers;
    values: string[];
  };
}

export interface QuizOption {
  value: string;
  label: string;
  description: string;
  icon?: string;
}
