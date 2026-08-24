/**
 * core/bodyPlans.ts
 * The fixed set of base body plans. MVP ships exactly two (quadruped,
 * serpent) per the design spec's recommendation to prove the pipeline
 * before multiplying it. Adding a third later means adding one entry
 * here plus matching cases in render/shapes.ts and render/animate.ts —
 * nothing else in the engine needs to change.
 */

import type { BodyPlanId } from './genome';

export interface BodyPlanDefinition {
  id: BodyPlanId;
  /** Movement archetype used by render/animate.ts to pick an algorithm. */
  movementType: 'gait' | 'undulate';
  /** Real-world ranges that 0..1 trait values map onto for this plan. */
  ranges: {
    size: [number, number];
    limbLength: [number, number];
    segmentCount: [number, number];
    speed: [number, number];
  };
}

export const BODY_PLANS: Record<BodyPlanId, BodyPlanDefinition> = {
  quadruped: {
    id: 'quadruped',
    movementType: 'gait',
    ranges: {
      size: [18, 46],
      limbLength: [8, 26],
      segmentCount: [3, 5], // body segments, not legs (always 4 legs)
      speed: [20, 90], // px/sec
    },
  },
  serpent: {
    id: 'serpent',
    movementType: 'undulate',
    ranges: {
      size: [14, 34],
      limbLength: [0, 0], // unused for serpent
      segmentCount: [6, 14],
      speed: [15, 70],
    },
  },
};

export function mapRange(t: number, [lo, hi]: [number, number]): number {
  return lo + t * (hi - lo);
}
