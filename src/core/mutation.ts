/**
 * core/mutation.ts
 * Applies mutation to a pre-mutation child genome. Deterministic from
 * the RNG passed in — callers must derive that RNG from the child's
 * generation seed so the same seed always reproduces the same organism.
 */

import { CONTINUOUS_TRAIT_KEYS, clamp01, cloneGenome, type Genome, BODY_PLAN_IDS } from './genome';
import { MUTATION } from '../config';

export interface MutationResult {
  genome: Genome;
  /** True if a rare dramatic mutation occurred — useful for the reveal
   *  sequence to add extra flourish, and for debug/analytics. Never
   *  shown to the player as a literal label. */
  wasDramatic: boolean;
}

function subtleMutate(traits: Genome['traits'], rng: () => number): void {
  for (const key of CONTINUOUS_TRAIT_KEYS) {
    if (rng() < MUTATION.subtleChance) {
      const jitter = (rng() - 0.5) * 2 * MUTATION.subtleMagnitude;
      traits[key] = clamp01(traits[key] + jitter);
    }
  }
}

function dramaticMutate(genome: Genome, rng: () => number): void {
  if (rng() < MUTATION.dramaticBodyPlanFlipChance) {
    const others = BODY_PLAN_IDS.filter((id) => id !== genome.bodyPlan);
    genome.bodyPlan = others[Math.floor(rng() * others.length)] ?? genome.bodyPlan;
    return;
  }
  // Otherwise: one or two traits take a large jump rather than every
  // trait shifting — dramatic mutations should read as a striking
  // feature, not a uniformly different creature.
  const affectedCount = 1 + (rng() < 0.4 ? 1 : 0);
  const keys = [...CONTINUOUS_TRAIT_KEYS].sort(() => rng() - 0.5).slice(0, affectedCount);
  for (const key of keys) {
    const jump = (rng() - 0.5) * 2 * MUTATION.dramaticMagnitude;
    genome.traits[key] = clamp01(genome.traits[key] + jump);
  }
}

export function mutate(preMutationGenome: Genome, rng: () => number): MutationResult {
  const genome = cloneGenome(preMutationGenome);
  const wasDramatic = rng() < MUTATION.dramaticChance;

  if (wasDramatic) {
    dramaticMutate(genome, rng);
  } else {
    subtleMutate(genome.traits, rng);
  }

  return { genome, wasDramatic };
}
