export type BodyPlanId = 'quadruped' | 'serpent';

export interface BodyPlanRanges {
  segments: [number, number];
  limbCount: number; // fixed per plan, not a range — defines the archetype
  limbLength: [number, number]; // normalized 0-1
  bodyLength: [number, number]; // normalized 0-1
  bodyWidth: [number, number]; // normalized 0-1
  speed: [number, number]; // normalized 0-1
}

export const BODY_PLANS: Record<BodyPlanId, BodyPlanRanges> = {
  quadruped: {
    segments: [1, 2],
    limbCount: 4,
    limbLength: [0.3, 0.8],
    bodyLength: [0.4, 0.9],
    bodyWidth: [0.4, 0.8],
    speed: [0.3, 0.9]
  },
  serpent: {
    segments: [5, 12],
    limbCount: 0,
    limbLength: [0, 0],
    bodyLength: [0.7, 1.0],
    bodyWidth: [0.1, 0.3],
    speed: [0.2, 0.7]
  }
};

export const ALL_BODY_PLANS: BodyPlanId[] = ['quadruped', 'serpent'];