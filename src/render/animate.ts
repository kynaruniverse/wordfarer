/**
 * render/animate.ts
 * Advances an organism's runtime position/heading/phase for one tick.
 * Movement algorithm is chosen by body plan; morphology traits (speed,
 * segmentCount, limbLength) causally influence the motion, not just
 * the static shape.
 */

import type { Genome } from '../core/genome';
import type { OrganismRuntimeState } from '../core/organism';
import { BODY_PLANS, mapRange } from '../core/bodyPlans';
import { HABITAT_BOUNDS } from '../config';

function containWithinBounds(runtime: OrganismRuntimeState): void {
  const margin = 40;
  if (runtime.x < margin) {
    runtime.x = margin;
    runtime.heading = Math.PI - runtime.heading;
  } else if (runtime.x > HABITAT_BOUNDS.width - margin) {
    runtime.x = HABITAT_BOUNDS.width - margin;
    runtime.heading = Math.PI - runtime.heading;
  }
  if (runtime.y < margin) {
    runtime.y = margin;
    runtime.heading = -runtime.heading;
  } else if (runtime.y > HABITAT_BOUNDS.height - margin) {
    runtime.y = HABITAT_BOUNDS.height - margin;
    runtime.heading = -runtime.heading;
  }
}

function gaitStep(genome: Genome, runtime: OrganismRuntimeState, dt: number): void {
  const def = BODY_PLANS.quadruped;
  const speed = mapRange(genome.traits.speed, def.ranges.speed);

  // Gentle wander: heading drifts randomly rather than snapping.
  runtime.heading += (Math.random() - 0.5) * 0.6 * dt;
  runtime.phase += speed * 0.05 * dt;

  runtime.x += Math.cos(runtime.heading) * speed * dt;
  runtime.y += Math.sin(runtime.heading) * speed * dt;
}

function undulateStep(genome: Genome, runtime: OrganismRuntimeState, dt: number): void {
  const def = BODY_PLANS.serpent;
  const speed = mapRange(genome.traits.speed, def.ranges.speed);
  const segmentCount = mapRange(genome.traits.segmentCount, def.ranges.segmentCount);

  // More segments -> slower, wider sinuous turning; fewer -> darts more.
  const turnRate = 1.4 / Math.max(4, segmentCount);
  runtime.heading += Math.sin(runtime.phase) * turnRate * dt;
  runtime.phase += speed * 0.08 * dt;

  runtime.x += Math.cos(runtime.heading) * speed * dt;
  runtime.y += Math.sin(runtime.heading) * speed * dt;
}

export function stepOrganism(genome: Genome, runtime: OrganismRuntimeState, dtSeconds: number): void {
  if (genome.bodyPlan === 'quadruped') {
    gaitStep(genome, runtime, dtSeconds);
  } else {
    undulateStep(genome, runtime, dtSeconds);
  }
  containWithinBounds(runtime);
}
