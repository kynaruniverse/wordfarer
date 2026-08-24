import { Organism, createOrganism } from '../core/organism';
import { ALL_BODY_PLANS } from '../core/bodyPlans';

export interface HabitatBounds {
  width: number;
  height: number;
  padding: number; // keep-out margin from screen edges
}

export function createInitialOrganisms(count: number, bounds: HabitatBounds): Organism[] {
  const organisms: Organism[] = [];
  for (let i = 0; i < count; i++) {
    const bodyPlan = ALL_BODY_PLANS[i % ALL_BODY_PLANS.length];
    const x = bounds.padding + Math.random() * (bounds.width - bounds.padding * 2);
    const y = bounds.padding + Math.random() * (bounds.height - bounds.padding * 2);
    organisms.push(createOrganism(bodyPlan, x, y));
  }
  return organisms;
}

export function updateHabitat(organisms: Organism[], dt: number, bounds: HabitatBounds) {
  for (const org of organisms) {
    // Occasionally pick a new wander direction
    org.wanderTimer -= dt;
    if (org.wanderTimer <= 0) {
      org.heading += (Math.random() - 0.5) * Math.PI * 0.8;
      org.wanderTimer = 1.5 + Math.random() * 2.5;
    }

    const moveSpeed = org.genome.speed * 30; // px/sec
    org.x += Math.cos(org.heading) * moveSpeed * dt;
    org.y += Math.sin(org.heading) * moveSpeed * dt;

    // Bounce off habitat edges rather than escaping the screen
    const minX = bounds.padding;
    const maxX = bounds.width - bounds.padding;
    const minY = bounds.padding;
    const maxY = bounds.height - bounds.padding;

    if (org.x < minX) { org.x = minX; org.heading = Math.PI - org.heading; }
    if (org.x > maxX) { org.x = maxX; org.heading = Math.PI - org.heading; }
    if (org.y < minY) { org.y = minY; org.heading = -org.heading; }
    if (org.y > maxY) { org.y = maxY; org.heading = -org.heading; }
  }
}