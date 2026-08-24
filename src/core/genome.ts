import { mulberry32, randomSeed, range, rangeInt, RNG } from './prng';
import { BODY_PLANS, BodyPlanId } from './bodyPlans';

export interface Genome {
  seed: number;
  bodyPlan: BodyPlanId;
  segments: number;
  limbCount: number;
  limbLength: number;
  bodyLength: number;
  bodyWidth: number;
  symmetry: number; // 0-1, how evenly paired features are
  hue: number; // 0-360
  saturation: number; // 0-1
  speed: number; // 0-1
  scale: number; // overall size multiplier, 0.6-1.4
}

// Generates a genome. If `seed` is omitted, a fresh random seed is created
// (for brand-new starting organisms). If a seed IS provided, the exact same
// genome is produced every time — this determinism is what makes seed
// sharing and the dev debug panel meaningful.
export function generateGenome(bodyPlan: BodyPlanId, seed?: number): Genome {
  const usedSeed = seed ?? randomSeed();
  const rng: RNG = mulberry32(usedSeed);
  const ranges = BODY_PLANS[bodyPlan];

  return {
    seed: usedSeed,
    bodyPlan,
    segments: rangeInt(rng, ranges.segments[0], ranges.segments[1]),
    limbCount: ranges.limbCount,
    limbLength: range(rng, ranges.limbLength[0], ranges.limbLength[1]),
    bodyLength: range(rng, ranges.bodyLength[0], ranges.bodyLength[1]),
    bodyWidth: range(rng, ranges.bodyWidth[0], ranges.bodyWidth[1]),
    symmetry: range(rng, 0.6, 1.0),
    hue: range(rng, 0, 360),
    saturation: range(rng, 0.4, 0.9),
    speed: range(rng, ranges.speed[0], ranges.speed[1]),
    scale: range(rng, 0.6, 1.4)
  };
}