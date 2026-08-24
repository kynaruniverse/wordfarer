/**
 * habitat/habitat.ts
 * Holds the set of currently-active organisms (distinct from the
 * Archive, which holds every discovered organism ever, active or
 * not). Simulation state here is presentation-only and must never
 * write back into genome/archive data.
 */

import type { Organism, OrganismRuntimeState } from '../core/organism';
import { createRuntimeState } from '../core/organism';
import { HABITAT_BOUNDS, MAX_POPULATION } from '../config';

export interface HabitatEntry {
  organism: Organism;
  runtime: OrganismRuntimeState;
}

export class Habitat {
  private active = new Map<string, HabitatEntry>();

  get size(): number {
    return this.active.size;
  }

  isFull(): boolean {
    return this.active.size >= MAX_POPULATION;
  }

  add(organism: Organism, position?: { x: number; y: number }): boolean {
    if (this.isFull()) return false;
    const x = position?.x ?? Math.random() * HABITAT_BOUNDS.width;
    const y = position?.y ?? Math.random() * HABITAT_BOUNDS.height;
    this.active.set(organism.id, { organism, runtime: createRuntimeState(x, y) });
    return true;
  }

  remove(organismId: string): void {
    this.active.delete(organismId);
  }

  get(organismId: string): HabitatEntry | undefined {
    return this.active.get(organismId);
  }

  entries(): HabitatEntry[] {
    return [...this.active.values()];
  }
}
