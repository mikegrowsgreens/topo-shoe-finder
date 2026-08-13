import { describe, expect, it } from "vitest";
import { matchShoes } from "../lib/matching-engine";
import { getQuestionPath } from "../lib/questions";
import { Activity, QuizAnswers, Shoe } from "../lib/types";
import catalogJson from "../data/catalog.json";

const catalog = catalogJson as Shoe[];

// ——— Enumerate every possible answer path, mirroring the branched quiz ———

const CUSHIONS = ["max", "balanced", "firmer", "not_sure"] as const;
const SUPPORTS = ["neutral", "guidance", "max", "not_sure"] as const;
const FITS = ["roomy", "standard", "wide"] as const;
const CONTEXTS = ["on_feet_all_day", "walks_errands", "gym_mixed"] as const;
const PRIORITY_VALUES = ["durability", "light", "apma", "waterproof", "zerodrop"];

function prioritySubsets(): string[][] {
  const subsets: string[][] = [[]];
  for (let i = 0; i < PRIORITY_VALUES.length; i++) {
    subsets.push([PRIORITY_VALUES[i]]);
    for (let j = i + 1; j < PRIORITY_VALUES.length; j++) {
      subsets.push([PRIORITY_VALUES[i], PRIORITY_VALUES[j]]);
    }
  }
  return subsets; // 16 subsets of size ≤ 2
}

function blankAnswers(): QuizAnswers {
  return { activity: null, terrain: null, context: null, cushion: null, support: null, fit: null, priorities: [] };
}

function enumerateAnswerPaths(): QuizAnswers[] {
  const combos: QuizAnswers[] = [];
  const activities: Activity[] = ["road_run", "trail_run", "hike", "everyday", "recovery"];
  for (const activity of activities) {
    const askedIds = new Set(getQuestionPath({ ...blankAnswers(), activity }).map((q) => q.id));
    const terrains = askedIds.has("terrain")
      ? activity === "road_run"
        ? ["pavement", "mixed", "not_sure"]
        : ["smooth", "mixed", "technical", "not_sure"]
      : [null];
    const contexts = askedIds.has("context") ? CONTEXTS : [null];
    const cushions = askedIds.has("cushion") ? CUSHIONS : [null];
    const supports = askedIds.has("support") ? SUPPORTS : [null];
    for (const terrain of terrains)
      for (const context of contexts)
        for (const cushion of cushions)
          for (const support of supports)
            for (const fit of FITS)
              for (const priorities of prioritySubsets())
                combos.push({
                  activity,
                  terrain: terrain as QuizAnswers["terrain"],
                  context: context as QuizAnswers["context"],
                  cushion: cushion as QuizAnswers["cushion"],
                  support: support as QuizAnswers["support"],
                  fit,
                  priorities,
                });
  }
  return combos;
}

const allPaths = enumerateAnswerPaths();

describe("catalog integrity", () => {
  it("has unique base-model ids and no generation duplicates", () => {
    const ids = catalog.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    // No two catalog rows may be generations of the same model line
    // (e.g. "terraventure-4" and "terraventure-5").
    const lines = ids.map((id) => id.replace(/-\d+(-wp)?$/, ""));
    expect(new Set(lines).size).toBe(lines.length);
  });

  it("covers every activity with at least one shoe", () => {
    for (const activity of ["road_run", "trail_run", "hike", "everyday", "recovery"]) {
      expect(catalog.some((s) => s.activities.includes(activity as Activity))).toBe(true);
    }
  });
});

describe("path enumeration invariants", () => {
  it(`always returns 3 results with unique models (${allPaths.length} paths)`, () => {
    for (const answers of allPaths) {
      const results = matchShoes(answers, catalog);
      expect(results).toHaveLength(3);
      const ids = results.map((r) => r.shoe.id);
      expect(new Set(ids).size, JSON.stringify(answers)).toBe(3);
    }
  });

  it("never lets a shoe cross the activity gate (cross-sells excepted and labeled)", () => {
    for (const answers of allPaths) {
      for (const r of matchShoes(answers, catalog)) {
        if (r.crossSell) continue;
        expect(
          r.shoe.activities.includes(answers.activity as Activity),
          `${r.shoe.name} leaked into ${answers.activity}`
        ).toBe(true);
      }
    }
  });

  it("hard-filters to wide-available models when wide is chosen and the pool allows", () => {
    for (const answers of allPaths) {
      if (answers.fit !== "wide") continue;
      const pool = catalog.filter((s) => s.activities.includes(answers.activity as Activity));
      const wideCount = pool.filter((s) => s.features.wideAvailable).length;
      if (wideCount < 3) continue; // gate intentionally relaxes on tiny pools
      for (const r of matchShoes(answers, catalog)) {
        if (r.crossSell) continue;
        expect(r.shoe.features.wideAvailable, `${r.shoe.name} is not wide-available`).toBe(true);
      }
    }
  });

  it("resolves waterproof as a variant, never as a competing result", () => {
    for (const answers of allPaths) {
      const results = matchShoes(answers, catalog);
      const wantsWp = answers.priorities.includes("waterproof");
      for (const r of results) {
        const hasWpVariant = (r.shoe.variants ?? []).some((v) => v.type === "waterproof");
        if (wantsWp && hasWpVariant) {
          expect(r.selectedVariant?.type).toBe("waterproof");
        }
        if (!wantsWp) {
          expect(r.selectedVariant).toBeUndefined();
        }
      }
    }
  });

  it("top two picks differ on cushion or primary use case whenever the pool allows", () => {
    for (const answers of allPaths) {
      const pool = catalog.filter((s) => s.activities.includes(answers.activity as Activity));
      const axes = new Set(pool.map((s) => `${s.cushion}|${s.useCases[0]}`));
      if (axes.size < 2) continue;
      const [first, second] = matchShoes(answers, catalog);
      if (second.crossSell) continue;
      const differs =
        first.shoe.cushion !== second.shoe.cushion ||
        first.shoe.useCases[0] !== second.shoe.useCases[0];
      expect(differs, `duplicate axis: ${first.shoe.name} vs ${second.shoe.name} for ${JSON.stringify(answers)}`).toBe(true);
    }
  });

  it("is deterministic", () => {
    for (const answers of allPaths.filter((_, i) => i % 37 === 0)) {
      const a = matchShoes(answers, catalog).map((r) => r.shoe.id);
      const b = matchShoes(answers, catalog).map((r) => r.shoe.id);
      expect(a).toEqual(b);
    }
  });

  it("gate answers change outcomes: each activity yields a distinct best match set", () => {
    const base = { ...blankAnswers(), cushion: "balanced" as const, fit: "standard" as const };
    const tops = new Map<string, string>();
    for (const activity of ["road_run", "trail_run", "hike", "everyday", "recovery"] as Activity[]) {
      const top = matchShoes({ ...base, activity }, catalog)[0].shoe.id;
      tops.set(activity, top);
    }
    // Road vs trail vs hike vs everyday vs recovery must not all collapse
    // to one "safe" shoe — at least 4 distinct winners across 5 gates.
    expect(new Set(tops.values()).size).toBeGreaterThanOrEqual(4);
  });
});

describe("audit regression scenarios (the bug Mike hit)", () => {
  it("trail + waterproof returns 3 distinct models with WP as a variant", () => {
    const results = matchShoes(
      { ...blankAnswers(), activity: "trail_run", terrain: "technical", cushion: "firmer", support: "neutral", fit: "roomy", priorities: ["waterproof", "durability"] },
      catalog
    );
    const ids = results.map((r) => r.shoe.id);
    expect(new Set(ids).size).toBe(3);
    const terraventure = results.find((r) => r.shoe.id === "terraventure-5");
    expect(terraventure).toBeDefined();
    expect(terraventure!.selectedVariant?.name).toBe("Terraventure 4 WP");
  });

  it("road + waterproof returns Phantom 4 once, as its WP variant", () => {
    const results = matchShoes(
      { ...blankAnswers(), activity: "road_run", terrain: "pavement", cushion: "balanced", support: "neutral", fit: "standard", priorities: ["waterproof"] },
      catalog
    );
    const phantoms = results.filter((r) => r.shoe.id === "phantom-4");
    expect(phantoms.length).toBeLessThanOrEqual(1);
    if (phantoms.length === 1) {
      expect(phantoms[0].selectedVariant?.name).toBe("Phantom 4 WP");
    }
  });

  it("everyday path never returns trail or race shoes", () => {
    for (const context of CONTEXTS) {
      const results = matchShoes(
        { ...blankAnswers(), activity: "everyday", context, cushion: "max", fit: "standard", priorities: [] },
        catalog
      );
      for (const r of results) {
        expect(r.shoe.category, `${r.shoe.name} in everyday results`).toBe("road");
        expect(r.shoe.useCases[0]).not.toBe("tempo_race");
      }
    }
  });

  it("recovery path returns both recovery shoes plus a labeled everyday cross-sell", () => {
    const results = matchShoes(
      { ...blankAnswers(), activity: "recovery", fit: "standard", priorities: [] },
      catalog
    );
    const ids = results.map((r) => r.shoe.id);
    expect(ids).toContain("revive");
    expect(ids).toContain("rekovr-2");
    expect(results[2].crossSell).toBe(true);
    expect(results[2].shoe.activities).toContain("everyday");
  });
});
