import { Genome, generateGenome } from './genome';
import { BodyPlanId } from './bodyPlans';

export interface Organism {
  id: string;
  genome: Genome;
  x: number;
  y: number;
  heading: number; // radians, direction of travel
  wanderTimer: number; // seconds remaining until next heading change
}

let nextId = 1;

export function createOrganism(bodyPlan: BodyPlanId, x: number, y: number, seed?: number): Organism {
  return {
    id: `org-${nextId++}`,
    genome: generateGenome(bodyPlan, seed),
    x,
    y,
    heading: Math.random() * Math.PI * 2,
    wanderTimer: 1 + Math.random() * 2
  };
}