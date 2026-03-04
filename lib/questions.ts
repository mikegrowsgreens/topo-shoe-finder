import { QuizQuestion } from "./types";

export const questions: QuizQuestion[] = [
  {
    id: "activity",
    step: 1,
    title: "What's your primary activity?",
    subtitle: "This helps us narrow down road vs. trail options.",
    options: [
      { value: "road", label: "Road Running", description: "Pavement, sidewalks, treadmill" },
      { value: "trail", label: "Trail Running", description: "Dirt paths, single track, mountains" },
      { value: "hike", label: "Hiking", description: "Day hikes and backpacking" },
      { value: "walk", label: "Walking", description: "Daily walks and fitness walking" },
      { value: "recovery", label: "Recovery", description: "Easy days and active recovery" },
    ],
  },
  {
    id: "cushion",
    step: 2,
    title: "How much cushion do you prefer?",
    subtitle: "Think about how you like the ground to feel underfoot.",
    options: [
      { value: "max", label: "Maximum", description: "Plush, cloud-like feel" },
      { value: "balanced", label: "Balanced", description: "Medium cushion with ground feel" },
      { value: "firmer", label: "Firmer", description: "More ground contact and feedback" },
    ],
  },
  {
    id: "terrain",
    step: 3,
    title: "What terrain will you cover?",
    subtitle: "We'll match outsole and protection to your surfaces.",
    options: [
      { value: "pavement", label: "Pavement", description: "Roads, sidewalks, smooth surfaces" },
      { value: "mixed", label: "Mixed", description: "Road-to-trail and varied surfaces" },
      { value: "technical", label: "Technical", description: "Rocky, rooty, steep terrain" },
    ],
    conditional: {
      field: "activity",
      values: ["trail", "hike", "road", "walk", "recovery"],
    },
  },
  {
    id: "support",
    step: 4,
    title: "What level of support do you need?",
    subtitle: "If you overpronate or want stability, choose more support.",
    options: [
      { value: "neutral", label: "Neutral", description: "No correction, natural stride" },
      { value: "guidance", label: "Guidance", description: "Mild support for overpronation" },
      { value: "max", label: "Maximum", description: "Strong stability and motion control" },
    ],
  },
  {
    id: "fit",
    step: 5,
    title: "What's your fit preference?",
    subtitle: "Topo is known for its anatomical toe box.",
    options: [
      { value: "roomy", label: "Roomy", description: "Extra space for toe splay" },
      { value: "standard", label: "Standard", description: "Comfortable everyday fit" },
      { value: "wide", label: "Wide", description: "Extra width throughout" },
    ],
  },
  {
    id: "priorities",
    step: 6,
    title: "What matters most to you?",
    subtitle: "Select up to 2 priorities.",
    multiSelect: true,
    maxSelections: 2,
    options: [
      { value: "durability", label: "Durability", description: "Long-lasting materials" },
      { value: "light", label: "Lightweight", description: "Minimal weight for speed" },
      { value: "apma", label: "Foot Health (APMA)", description: "Podiatrist approved" },
      { value: "waterproof", label: "Waterproof", description: "Protection from wet conditions" },
      { value: "zerodrop", label: "Zero Drop", description: "Natural foot position" },
    ],
  },
];
