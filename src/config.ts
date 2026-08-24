/**
 * Single source of truth for tunable constants.
 * Nothing in core/ or habitat/ should hardcode a magic number that
 * balancing might need to change — it belongs here instead.
 */

export const GENERATOR_VERSION = 1;

export const HABITAT_BOUNDS = {
  width: 1000,
  height: 1600,
} as const;

export const MAX_POPULATION = 24;

/** Minimum touch hit-radius in canvas px, independent of an organism's
 *  rendered size — small procedural creatures must stay reliably draggable. */
export const MIN_HIT_RADIUS = 34;

export const STARTING_ORGANISM_COUNT = 3;

/** Fixed deterministic seeds used to generate the first-run roster. */
export const STARTING_SEEDS = ['GNS1-000001', 'GNS1-000002', 'GNS1-000003'] as const;

export const MUTATION = {
  /** Chance, per trait, of a subtle mutation on any given merge. */
  subtleChance: 0.85,
  /** Max fractional jitter applied by a subtle mutation (of trait range). */
  subtleMagnitude: 0.06,
  /** Chance of a rare dramatic mutation occurring at all during a merge. */
  dramaticChance: 0.04,
  /** Max fractional jump applied by a dramatic mutation. */
  dramaticMagnitude: 0.35,
  /** Chance a dramatic mutation flips the body plan instead of jittering traits. */
  dramaticBodyPlanFlipChance: 0.25,
} as const;

export const INHERITANCE = {
  /**
   * How strongly the child is pulled toward the parent with the higher
   * expressed trait value. 0 = plain 50/50 average, 1 = winner takes all.
   */
  biasStrength: 0.65,
} as const;

export const REVEAL_SEQUENCE_MS = 2400;

export const SIMULATION_TICK_MS = 1000 / 60;
