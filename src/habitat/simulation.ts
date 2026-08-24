/**
 * habitat/simulation.ts
 * The simulation loop's per-tick update. No physics engine — each
 * organism moves via its own procedural animation function.
 */

import type { Habitat } from './habitat';
import { stepOrganism } from '../render/animate';

export function tick(habitat: Habitat, dtSeconds: number): void {
  for (const entry of habitat.entries()) {
    stepOrganism(entry.organism.genome, entry.runtime, dtSeconds);
  }
}
