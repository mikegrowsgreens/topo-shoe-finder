import { QuizAnswers, QuizQuestion } from "./types";

/**
 * Branched question flow. Q1 is a hard gate; the rest of the path depends on
 * the chosen activity so casual buyers never see pace/pronation questions and
 * trail runners get real terrain options. Total path length: 3–6 questions.
 */

const activityQuestion: QuizQuestion = {
  id: "activity",
  title: "What will you use your Topos for most?",
  subtitle: "This decides which shoes we consider — pick your main use.",
  options: [
    { value: "road_run", label: "Road Running", description: "Pavement, bike paths, treadmill" },
    { value: "trail_run", label: "Trail Running", description: "Dirt, roots, rocks, singletrack" },
    { value: "hike", label: "Hiking & Backpacking", description: "Day hikes to thru-hikes" },
    { value: "everyday", label: "Everyday Walking & All-Day Comfort", description: "Work shifts, errands, casual wear" },
    { value: "recovery", label: "Recovery & Post-Run", description: "Easy slip-ons after big days" },
  ],
};

const roadTerrainQuestion: QuizQuestion = {
  id: "terrain",
  title: "Where will you run most?",
  subtitle: "We'll match the outsole to your surfaces.",
  options: [
    { value: "pavement", label: "Mostly Pavement", description: "Roads, sidewalks, track" },
    { value: "mixed", label: "Pavement + Light Trails", description: "Gravel paths, park loops" },
    { value: "not_sure", label: "Not Sure — Show Me a Mix", description: "We'll keep it versatile" },
  ],
};

const trailTerrainQuestion: QuizQuestion = {
  id: "terrain",
  title: "What do your trails look like?",
  subtitle: "Traction and protection scale with terrain.",
  options: [
    { value: "smooth", label: "Smooth Paths", description: "Park trails, groomed singletrack" },
    { value: "mixed", label: "Mixed", description: "Some roots, rocks, moderate climbs" },
    { value: "technical", label: "Technical", description: "Rocky, rooty, steep or muddy" },
    { value: "not_sure", label: "Not Sure — Show Me a Mix", description: "We'll keep it versatile" },
  ],
};

const everydayContextQuestion: QuizQuestion = {
  id: "context",
  title: "What does your day look like?",
  subtitle: "So we match comfort to how long you're on your feet.",
  options: [
    { value: "on_feet_all_day", label: "On My Feet All Day", description: "Long shifts, standing work" },
    { value: "walks_errands", label: "Walks & Errands", description: "Daily walks, casual wear" },
    { value: "gym_mixed", label: "Gym + Everything Else", description: "Workouts plus daily wear" },
  ],
};

const cushionQuestion: QuizQuestion = {
  id: "cushion",
  title: "How should they feel underfoot?",
  subtitle: "Think about how you like the ground to feel.",
  options: [
    { value: "max", label: "Maximum Cushion", description: "Plush and protective" },
    { value: "balanced", label: "Balanced", description: "Cushioned but connected" },
    { value: "firmer", label: "Firmer & Responsive", description: "I like to feel the surface" },
    { value: "not_sure", label: "Not Sure — Show Me a Mix", description: "We'll pick a range" },
  ],
};

const supportQuestion: QuizQuestion = {
  id: "support",
  title: "Which sounds most like you?",
  subtitle: "No jargon — just how much help your stride wants.",
  options: [
    { value: "neutral", label: "No Extra Support Needed", description: "Natural, uncorrected stride" },
    { value: "guidance", label: "A Bit of Guidance", description: "Mild support feels good" },
    { value: "max", label: "As Much Support as Possible", description: "History of aches or overpronation" },
    { value: "not_sure", label: "Not Sure", description: "We'll keep options open" },
  ],
};

const fitQuestion: QuizQuestion = {
  id: "fit",
  title: "How do your shoes usually fit?",
  subtitle: "Every Topo has a roomy, foot-shaped toe box with a secure heel.",
  options: [
    { value: "roomy", label: "I Love a Roomy Toe Box", description: "Wide forefoot, toes splay" },
    { value: "standard", label: "Standard Is Usually Fine", description: "Typical athletic fit" },
    { value: "wide", label: "I Need Wide Widths", description: "We'll only show wide-available models" },
  ],
};

const prioritiesQuestion: QuizQuestion = {
  id: "priorities",
  title: "What matters most to you?",
  subtitle: "Select up to 2 priorities.",
  multiSelect: true,
  maxSelections: 2,
  options: [
    { value: "durability", label: "Durability", description: "Long-lasting, protective build" },
    { value: "light", label: "Lightweight", description: "Minimal weight, nimble feel" },
    { value: "apma", label: "Foot Health (APMA)", description: "Podiatrist accepted" },
    { value: "waterproof", label: "Waterproof", description: "We'll pick waterproof versions" },
    { value: "zerodrop", label: "Zero Drop", description: "Natural foot position" },
  ],
};

/**
 * The question path for the current answers. Recomputes as answers change;
 * before an activity is chosen it shows the default (road) length so the
 * progress bar stays sensible.
 */
export function getQuestionPath(answers: QuizAnswers): QuizQuestion[] {
  switch (answers.activity) {
    case "trail_run":
    case "hike":
      return [activityQuestion, trailTerrainQuestion, cushionQuestion, supportQuestion, fitQuestion, prioritiesQuestion];
    case "everyday":
      return [activityQuestion, everydayContextQuestion, cushionQuestion, fitQuestion, prioritiesQuestion];
    case "recovery":
      return [activityQuestion, fitQuestion, prioritiesQuestion];
    case "road_run":
    default:
      return [activityQuestion, roadTerrainQuestion, cushionQuestion, supportQuestion, fitQuestion, prioritiesQuestion];
  }
}

export const stepLabelFor: Record<string, string> = {
  activity: "Activity",
  terrain: "Terrain",
  context: "Your Day",
  cushion: "Cushion",
  support: "Support",
  fit: "Fit",
  priorities: "Priorities",
};
