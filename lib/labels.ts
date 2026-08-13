import { Activity, QuizAnswers, UseCase } from "./types";

export const useCaseLabel: Record<UseCase, string> = {
  daily: "Daily training",
  tempo_race: "Tempo & racing",
  long_distance: "Long distance",
  all_day_comfort: "All-day comfort",
  post_activity: "Recovery",
  natural_minimal: "Natural running",
  gym_training: "Gym & training",
  backpacking: "Hiking & backpacking",
};

export const activityLabel: Record<Activity, string> = {
  road_run: "road running",
  trail_run: "trail running",
  hike: "hiking",
  everyday: "everyday comfort",
  recovery: "recovery",
};

/** "Why we're recommending these" paragraph that echoes the user's answers. */
export function whyParagraph(answers: QuizAnswers): string {
  const parts: string[] = [];
  if (answers.activity) parts.push(`you told us ${activityLabel[answers.activity]} comes first`);
  if (answers.cushion && answers.cushion !== "not_sure") {
    parts.push(
      answers.cushion === "max"
        ? "you want maximum cushion"
        : answers.cushion === "balanced"
          ? "you like balanced cushioning"
          : "you prefer a firmer, responsive feel"
    );
  }
  if (answers.terrain === "technical") parts.push("your terrain gets rocky and steep");
  if (answers.terrain === "mixed") parts.push("you cover mixed surfaces");
  if (answers.support === "guidance" || answers.support === "max") parts.push("extra support matters to you");
  if (answers.fit === "wide") parts.push("you need wide widths, so we only picked wide-available models");

  const joined =
    parts.length > 1 ? parts.slice(0, -1).join(", ") + ", and " + parts[parts.length - 1] : parts[0] ?? "";
  return `We picked these because ${joined}. Every Topo pairs a roomy, foot-shaped toe box with a secure heel and midfoot, and a low drop for a natural ride.`;
}
