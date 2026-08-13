export type Activity = "road_run" | "trail_run" | "hike" | "everyday" | "recovery";
export type Cushion = "max" | "balanced" | "firmer";
export type Support = "neutral" | "guidance" | "max";
export type Terrain = "pavement" | "smooth" | "mixed" | "technical";
export type UseCase =
  | "daily"
  | "tempo_race"
  | "long_distance"
  | "all_day_comfort"
  | "post_activity"
  | "natural_minimal"
  | "gym_training"
  | "backpacking";

export interface ShoeVariant {
  type: "waterproof";
  name: string;
  pdpMens: string;
  pdpWomens: string;
  weightOz: number;
}

export interface Shoe {
  id: string; // base model id — one row per model, variants nested
  name: string;
  category: "road" | "trail"; // display badge only, not used for gating
  activities: Activity[]; // hard gate: which quiz intents this shoe can appear for
  useCases: UseCase[];
  cushion: Cushion;
  support: Support;
  terrain: Terrain[];
  stack: string;
  dropMm: number;
  weightOz: number;
  features: {
    waterproof: boolean; // true only if the BASE shoe is waterproof
    wideAvailable: boolean;
    rockPlate: boolean;
    vibram: boolean;
    apma: boolean;
    zeroDrop: boolean;
  };
  variants?: ShoeVariant[];
  popularity: number; // 1 = flagship; deterministic tie-break after score
  pdpMens: string;
  pdpWomens: string;
  benefits: string[];
  description: string;
  skipIf: string; // honest "Skip it if…" line shown on the result card
}

export interface QuizAnswers {
  activity: Activity | null;
  terrain: Terrain | "not_sure" | null;
  context: "on_feet_all_day" | "walks_errands" | "gym_mixed" | null; // everyday branch only
  cushion: Cushion | "not_sure" | null;
  support: Support | "not_sure" | null;
  fit: "roomy" | "standard" | "wide" | null;
  priorities: string[];
}

export interface ScoredShoe {
  shoe: Shoe;
  score: number;
  rank: "best" | "great" | "good";
  matchReasons: string[];
  skipIf: string;
  /** Set when the user's answers select a variant (e.g. waterproof) of the base model */
  selectedVariant?: ShoeVariant;
  /** True when this slot is a deliberate recovery cross-sell, not a competing trainer */
  crossSell?: boolean;
}

export interface QuizOption {
  value: string;
  label: string;
  description: string;
  icon?: string;
}

export interface QuizQuestion {
  id: keyof QuizAnswers;
  title: string;
  subtitle: string;
  options: QuizOption[];
  multiSelect?: boolean;
  maxSelections?: number;
}
