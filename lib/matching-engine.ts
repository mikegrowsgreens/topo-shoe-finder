import { Activity, QuizAnswers, ScoredShoe, Shoe, ShoeVariant, UseCase } from "./types";

/**
 * Matching architecture (filter-then-rank, per industry consensus):
 *   Stage 1 — Gates: activity hard-filters the catalog to a pool; "wide" fit
 *             hard-filters to wide-available models when enough survive.
 *   Stage 2 — Weighted scoring within the surviving pool only.
 *   Stage 3 — Diversity: top 3 must differ on cushion or primary use case;
 *             short pools are completed with a labeled cross-sell.
 *   Stage 4 — Variant resolution: a waterproof priority selects the WP variant
 *             of a winning model — variants never compete as separate results.
 */

// ——— Stage 1: gates ———

function gatePool(catalog: Shoe[], answers: QuizAnswers): Shoe[] {
  if (!answers.activity) return catalog;
  let pool = catalog.filter((s) => s.activities.includes(answers.activity as Activity));

  // Wide width is a need, not a taste — hard filter when it leaves real choice.
  if (answers.fit === "wide") {
    const wide = pool.filter((s) => s.features.wideAvailable);
    if (wide.length >= 3) pool = wide;
  }
  return pool;
}

// ——— Stage 2: weighted scoring within the pool ———

const ADJACENT_CUSHION: Record<string, string[]> = {
  max: ["balanced"],
  balanced: ["max", "firmer"],
  firmer: ["balanced"],
};

// Which use cases each quiz intent rewards (activity gate already passed).
const USE_CASE_AFFINITY: Record<Activity, Partial<Record<UseCase, number>>> = {
  road_run: { daily: 10, tempo_race: 4, long_distance: 4, natural_minimal: 2 },
  trail_run: { daily: 6, long_distance: 6, tempo_race: 4 },
  hike: { backpacking: 10, all_day_comfort: 6, long_distance: 4 },
  everyday: { all_day_comfort: 10, post_activity: 6, gym_training: 4, daily: 2 },
  recovery: { post_activity: 10, all_day_comfort: 4 },
};

function scoreShoe(shoe: Shoe, answers: QuizAnswers): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Use-case affinity within the gated pool
  if (answers.activity) {
    const affinity = USE_CASE_AFFINITY[answers.activity];
    for (const uc of shoe.useCases) {
      score += affinity[uc] ?? 0;
    }
  }

  // Cushion preference (25 exact / 12 adjacent; "not sure" scores nothing)
  if (answers.cushion && answers.cushion !== "not_sure") {
    if (shoe.cushion === answers.cushion) {
      score += 25;
      reasons.push(
        shoe.cushion === "max"
          ? "Maximum cushioning, just like you asked for"
          : shoe.cushion === "balanced"
            ? "Balanced cushioning with ground feel — your pick"
            : "Firm, responsive ride — the ground feel you wanted"
      );
    } else if (ADJACENT_CUSHION[answers.cushion]?.includes(shoe.cushion)) {
      score += 12;
    }
  }

  // Terrain detail (20 exact / 10 partial for mixed)
  if (answers.terrain && answers.terrain !== "not_sure") {
    if (shoe.terrain.includes(answers.terrain)) {
      score += 20;
      if (answers.terrain === "technical") {
        reasons.push("Handles the rocky, technical terrain you run");
      } else if (answers.terrain === "mixed") {
        reasons.push("Built for the mixed surfaces you cover");
      }
    } else if (answers.terrain === "mixed" && shoe.terrain.length > 1) {
      score += 10;
    }
  }

  // Support (15 exact / 7 neutral↔guidance)
  if (answers.support && answers.support !== "not_sure") {
    if (shoe.support === answers.support) {
      score += 15;
      if (answers.support !== "neutral") {
        reasons.push(
          shoe.support === "max"
            ? "Maximum stability for the support you need"
            : "Gentle guidance for mild overpronation"
        );
      }
    } else if (
      (answers.support === "guidance" && shoe.support === "neutral") ||
      (answers.support === "neutral" && shoe.support === "guidance")
    ) {
      score += 7;
    }
  }

  // Everyday-branch context
  if (answers.activity === "everyday" && answers.context) {
    if (answers.context === "on_feet_all_day") {
      if (shoe.cushion === "max") score += 10;
      if (shoe.useCases.includes("all_day_comfort")) {
        score += 5;
        reasons.push("Made for long days on your feet");
      }
    }
    if (answers.context === "walks_errands" && shoe.useCases.includes("all_day_comfort")) {
      score += 5;
      reasons.push("Easy comfort for daily walks and errands");
    }
    if (answers.context === "gym_mixed" && shoe.useCases.includes("gym_training")) {
      score += 10;
      reasons.push("Versatile enough for the gym and everything after");
    }
  }

  // Fit: wide is gated above; "roomy" is every Topo's selling point (messaging, not score)

  // Priorities (10 each, max 2 selections)
  for (const priority of answers.priorities ?? []) {
    switch (priority) {
      case "durability":
        if (shoe.features.rockPlate || shoe.features.vibram) {
          score += 10;
          reasons.push("Rugged build that lasts — you said durability matters");
        }
        break;
      case "light":
        if (shoe.weightOz < 9) {
          score += 10;
          reasons.push(`Ultra-light at ${shoe.weightOz} oz — you wanted lightweight`);
        } else if (shoe.weightOz < 10) {
          score += 6;
        }
        break;
      case "apma":
        if (shoe.features.apma) {
          score += 10;
          reasons.push("APMA accepted — the foot-health seal you asked about");
        }
        break;
      case "waterproof":
        // Small bonus only — the variant resolver (stage 4) does the real work,
        // so base + WP versions never compete for separate result slots.
        if (shoe.features.waterproof || hasWaterproofVariant(shoe)) {
          score += 8;
        }
        break;
      case "zerodrop":
        if (shoe.features.zeroDrop) {
          score += 10;
          reasons.push("Zero-drop platform for the natural feel you want");
        }
        break;
    }
  }

  return { score, reasons };
}

// ——— Stage 3: diversity ———

function primaryUseCase(shoe: Shoe): UseCase | undefined {
  return shoe.useCases[0];
}

function differsFrom(shoe: Shoe, picks: Shoe[]): boolean {
  return picks.every(
    (p) => p.cushion !== shoe.cushion || primaryUseCase(p) !== primaryUseCase(shoe)
  );
}

// ——— Stage 4: variant resolution ———

function hasWaterproofVariant(shoe: Shoe): boolean {
  return (shoe.variants ?? []).some((v) => v.type === "waterproof");
}

function resolveVariant(shoe: Shoe, answers: QuizAnswers): ShoeVariant | undefined {
  if (!answers.priorities?.includes("waterproof")) return undefined;
  return (shoe.variants ?? []).find((v) => v.type === "waterproof");
}

// ——— Assembly ———

const RANKS = ["best", "great", "good"] as const;

export function matchShoes(answers: QuizAnswers, catalog: Shoe[]): ScoredShoe[] {
  const pool = gatePool(catalog, answers);

  const ranked = pool
    .map((shoe) => ({ shoe, ...scoreShoe(shoe, answers) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.shoe.popularity - b.shoe.popularity ||
        a.shoe.name.localeCompare(b.shoe.name)
    );

  // Greedy diverse top 3: each pick must differ from previous picks on
  // cushion or primary use case; fall back to next-best if impossible.
  const picks: typeof ranked = [];
  for (const candidate of ranked) {
    if (picks.length === 0 || differsFrom(candidate.shoe, picks.map((p) => p.shoe))) {
      picks.push(candidate);
      if (picks.length === 3) break;
    }
  }
  for (const candidate of ranked) {
    if (picks.length === 3) break;
    if (!picks.includes(candidate)) picks.push(candidate);
  }

  const results: ScoredShoe[] = picks.map((item, index) => {
    const selectedVariant = resolveVariant(item.shoe, answers);
    const reasons = [...item.reasons];
    if (selectedVariant) {
      reasons.unshift("Waterproof version — picked because weather protection matters to you");
    } else if (item.shoe.features.waterproof && answers.priorities?.includes("waterproof")) {
      reasons.unshift("Fully waterproof — the protection you asked for");
    }
    if (answers.fit === "roomy" && reasons.length < 3) {
      reasons.push("Anatomical toe box gives your toes the room you want");
    }
    return {
      shoe: item.shoe,
      score: item.score,
      rank: RANKS[index],
      matchReasons: reasons.slice(0, 3).length > 0 ? reasons.slice(0, 3) : [`A strong ${item.shoe.category} match for your answers`],
      skipIf: item.shoe.skipIf,
      selectedVariant,
    };
  });

  // Short pool (e.g. recovery has 2 shoes): complete the shortlist with a
  // clearly-labeled cross-sell instead of leaving an empty slot.
  if (results.length < 3 && answers.activity) {
    const crossSellActivity: Activity = answers.activity === "recovery" ? "everyday" : "recovery";
    const usedIds = new Set(results.map((r) => r.shoe.id));
    const crossSell = catalog
      .filter((s) => !usedIds.has(s.id) && s.activities.includes(crossSellActivity))
      .sort((a, b) => a.popularity - b.popularity)[0];
    if (crossSell) {
      results.push({
        shoe: crossSell,
        score: 0,
        rank: RANKS[results.length],
        matchReasons:
          crossSellActivity === "recovery"
            ? ["For after the miles — slip on when the workout's done"]
            : ["An everyday companion to round out your rotation"],
        skipIf: crossSell.skipIf,
        selectedVariant: resolveVariant(crossSell, answers),
        crossSell: true,
      });
    }
  }

  return results;
}
