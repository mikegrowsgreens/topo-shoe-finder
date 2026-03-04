import { Shoe, QuizAnswers, ScoredShoe } from "./types";

// Shoes that should ONLY appear for specific activities
const RECOVERY_SHOES = ["revive", "rekovr-2"];
const HIKING_SHOES = ["trailventure-2-wp", "traverse"];
const MINIMALIST_SHOES = ["st-6"];

function scoreShoe(shoe: Shoe, answers: QuizAnswers): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // ——— Hard penalties: specialty shoes that don't match the activity ———
  if (answers.activity) {
    // Recovery shoes should only surface for recovery/walk
    if (RECOVERY_SHOES.includes(shoe.id) && answers.activity !== "recovery" && answers.activity !== "walk") {
      return { score: -100, reasons: [] };
    }
    // Hiking boots should only surface for hiking/walk
    if (HIKING_SHOES.includes(shoe.id) && answers.activity !== "hike" && answers.activity !== "walk") {
      return { score: -100, reasons: [] };
    }
    // Minimalist shoes shouldn't appear for walk/recovery/hike
    if (MINIMALIST_SHOES.includes(shoe.id) && (answers.activity === "walk" || answers.activity === "recovery" || answers.activity === "hike")) {
      return { score: -100, reasons: [] };
    }
  }

  // ——— Activity match (30 points) ———
  if (answers.activity) {
    const activityCategoryMap: Record<string, string[]> = {
      road: ["road"],
      trail: ["trail"],
      hike: ["trail"],
      walk: ["road"],
      recovery: ["road"],
    };
    const matchCategories = activityCategoryMap[answers.activity] || [];
    if (matchCategories.includes(shoe.category)) {
      score += 30;
      reasons.push(`Designed for ${shoe.category} ${answers.activity === "hike" ? "& hiking" : "running"}`);
    }

    // Activity-specific bonuses
    if (answers.activity === "recovery" && shoe.bestFor === "recovery") {
      score += 20;
      reasons.push("Purpose-built for post-activity recovery");
    }
    if (answers.activity === "hike") {
      if (shoe.bestFor.includes("hiking") || shoe.bestFor.includes("thru-hiking")) {
        score += 15;
        reasons.push("Built specifically for hiking");
      }
    }
    if (answers.activity === "road") {
      // Bonus for true running shoes (daily trainers, tempo, racing)
      if (shoe.bestFor.includes("daily") || shoe.bestFor.includes("running")) {
        score += 5;
        reasons.push("Versatile daily runner");
      }
      if (shoe.bestFor.includes("tempo") || shoe.bestFor.includes("racing")) {
        score += 5;
      }
    }
    if (answers.activity === "trail") {
      if (shoe.bestFor.includes("trail") && !shoe.bestFor.includes("hiking")) {
        score += 5;
      }
    }
    if (answers.activity === "walk" && (shoe.bestFor.includes("walking") || shoe.bestFor === "recovery")) {
      score += 10;
      reasons.push("Great for walking comfort");
    }
  }

  // ——— Cushion match (25 points) ———
  if (answers.cushion) {
    if (shoe.cushion === answers.cushion) {
      score += 25;
      reasons.push(`${shoe.cushion === "max" ? "Maximum" : shoe.cushion === "balanced" ? "Balanced" : "Firm, responsive"} cushioning`);
    } else if (
      (answers.cushion === "max" && shoe.cushion === "balanced") ||
      (answers.cushion === "balanced" && shoe.cushion === "max") ||
      (answers.cushion === "firmer" && shoe.cushion === "balanced")
    ) {
      score += 12;
    }
  }

  // ——— Terrain match (20 points) ———
  if (answers.terrain) {
    if (shoe.terrain.includes(answers.terrain)) {
      score += 20;
      reasons.push(`Built for ${answers.terrain} terrain`);
    } else if (answers.terrain === "mixed" && shoe.terrain.length > 1) {
      score += 10;
    }
  }

  // ——— Support match (15 points) ———
  if (answers.support) {
    if (shoe.support === answers.support) {
      score += 15;
      reasons.push(
        `${shoe.support === "neutral" ? "Neutral" : shoe.support === "guidance" ? "Guided" : "Maximum"} support`
      );
    } else if (
      (answers.support === "guidance" && shoe.support === "neutral") ||
      (answers.support === "neutral" && shoe.support === "guidance")
    ) {
      score += 7;
    }
  }

  // ——— Priorities bonus (10 points each, max 20) ———
  if (answers.priorities && answers.priorities.length > 0) {
    for (const priority of answers.priorities) {
      if (priority === "durability" && (shoe.terrain.includes("technical") || shoe.benefits.some(b => b.toLowerCase().includes("durable")))) {
        score += 10;
        reasons.push("Built for durability on tough terrain");
      }
      if (priority === "light") {
        const weightNum = parseFloat(shoe.weight);
        if (weightNum < 9) {
          score += 10;
          reasons.push(`Ultra-lightweight at ${shoe.weight}`);
        } else if (weightNum < 10) {
          score += 6;
          reasons.push(`Lightweight at ${shoe.weight}`);
        }
      }
      if (priority === "apma" && shoe.benefits.some(b => b.toLowerCase().includes("apma"))) {
        score += 10;
        reasons.push("APMA accepted for foot health");
      }
      if (priority === "waterproof" && shoe.benefits.some(b => b.toLowerCase().includes("waterproof"))) {
        score += 10;
        reasons.push("Waterproof protection for wet conditions");
      }
      if (priority === "zerodrop" && shoe.drop === "0mm") {
        score += 10;
        reasons.push("Zero-drop design for natural foot position");
      }
    }
  }

  // ——— Walk/recovery bonus for comfort features ———
  if (answers.activity === "walk" || answers.activity === "recovery") {
    if (shoe.cushion === "max") score += 10;
    if (shoe.support === "max" || shoe.support === "guidance") score += 5;
  }

  return { score, reasons };
}

export function matchShoes(answers: QuizAnswers, catalog: Shoe[]): ScoredShoe[] {
  const scored = catalog.map((shoe) => {
    const { score, reasons } = scoreShoe(shoe, answers);
    return { shoe, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);

  const top3 = scored.slice(0, 3);

  return top3.map((item, index) => ({
    shoe: item.shoe,
    score: item.score,
    rank: index === 0 ? "best" : index === 1 ? "great" : "good",
    matchReasons: item.reasons.length > 0 ? item.reasons.slice(0, 3) : [`Great ${item.shoe.category} option`],
  }));
}
