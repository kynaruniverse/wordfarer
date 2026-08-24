/**
 * core/genome.ts
 * No dependency on Canvas, DOM, or any browser API — must stay headless
 * so it can be unit-tested and reused by a future renderer unchanged.
 */

export type BodyPlanId = 'quadruped' | 'serpent';

export const BODY_PLAN_IDS: readonly BodyPlanId[] = ['quadruped', 'serpent'];

/** Every continuous, inheritable trait. Each is stored as a 0..1 value
 *  and only mapped to a real-world range at the point of use (render/animate). */
export interface ContinuousTraits {
  size: number;
  limbLength: number;
  segmentCount: number;
  speed: number;
  hue: number;
  saturation: number;
  brightness: number;
  patternDensity: number;
}

export const CONTINUOUS_TRAIT_KEYS: readonly (keyof ContinuousTraits)[] = [
  'size',
  'limbLength',
  'segmentCount',
  'speed',
  'hue',
  'saturation',
  'brightness',
  'patternDensity',
];

export interface Genome {
  bodyPlan: BodyPlanId;
  traits: ContinuousTraits;
}

/**
 * mulberry32 — small, dependency-free, deterministic PRNG.
 * Same numeric seed always produces the same output sequence.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash an arbitrary string seed down to a 32-bit int for mulberry32. */
export function hashStringToInt(str: string): number {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rngFromSeed(seedStr: string): () => number {
  return mulberry32(hashStringToInt(seedStr));
}

function pickBodyPlan(rng: () => number): BodyPlanId {
  const idx = Math.floor(rng() * BODY_PLAN_IDS.length);
  return BODY_PLAN_IDS[Math.min(idx, BODY_PLAN_IDS.length - 1)] as BodyPlanId;
}

/** Generates a wholly new random genome from a seed string. Used only
 *  for the deterministic starting roster — every later organism comes
 *  from inheritance, not this. */
export function generateRandomGenome(seedStr: string): Genome {
  const rng = rngFromSeed(seedStr);
  const traits = {} as ContinuousTraits;
  for (const key of CONTINUOUS_TRAIT_KEYS) {
    traits[key] = rng();
  }
  return {
    bodyPlan: pickBodyPlan(rng),
    traits,
  };
}

export function cloneGenome(g: Genome): Genome {
  return { bodyPlan: g.bodyPlan, traits: { ...g.traits } };
}

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}
