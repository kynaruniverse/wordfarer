/**
 * core/inheritance.ts
 * Takes two parent genomes + a deterministic child-generation RNG and
 * produces a pre-mutation child genome. Biased toward the parent with
 * the higher expressed value per trait, never a plain 50/50 average,
 * never fully random. Output is handed to mutation.ts next — this
 * module never applies mutation itself.
 */

import {
  CONTINUOUS_TRAIT_KEYS,
  clamp01,
  type ContinuousTraits,
  type Genome,
} from './genome';
import { INHERITANCE } from '../config';

/**
 * For a single trait: blend two parent values, biased toward whichever
 * is higher, with a touch of RNG-driven variance so the weaker parent
 * still visibly matters and outcomes aren't purely predictable from
 * "highest value always wins".
 */
function inheritTrait(a: number, b: number, rng: () => number): number {
  const stronger = Math.max(a, b);
  const weaker = Math.min(a, b);
  // Base weight toward the stronger value, then jitter the weighting
  // itself slightly per-trait so the same two parents don't always
  // resolve to an identical blend ratio.
  const weightJitter = (rng() - 0.5) * 0.2; // +/-0.1
  const weight = clamp01(INHERITANCE.biasStrength + weightJitter);
  return stronger * weight + weaker * (1 - weight);
}

function inheritBodyPlan(
  a: Genome['bodyPlan'],
  b: Genome['bodyPlan'],
  aExpressedStrength: number,
  bExpressedStrength: number,
  rng: () => number,
): Genome['bodyPlan'] {
  if (a === b) return a;
  const total = aExpressedStrength + bExpressedStrength || 1;
  const aProbability = aExpressedStrength / total;
  return rng() < aProbability ? a : b;
}

/** A rough scalar of "how expressed" a genome's traits are overall —
 *  used only to weight body-plan inheritance between two different plans. */
function overallExpression(traits: ContinuousTraits): number {
  return CONTINUOUS_TRAIT_KEYS.reduce((sum, k) => sum + traits[k], 0);
}

export function inherit(
  parentA: Genome,
  parentB: Genome,
  rng: () => number,
): Genome {
  const traits = {} as ContinuousTraits;
  for (const key of CONTINUOUS_TRAIT_KEYS) {
    traits[key] = clamp01(inheritTrait(parentA.traits[key], parentB.traits[key], rng));
  }

  const bodyPlan = inheritBodyPlan(
    parentA.bodyPlan,
    parentB.bodyPlan,
    overallExpression(parentA.traits),
    overallExpression(parentB.traits),
    rng,
  );

  return { bodyPlan, traits };
}
