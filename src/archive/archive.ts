/**
 * archive/archive.ts
 * The chronological archive of every discovered organism. Distinct
 * from Habitat (which only holds currently-active organisms).
 */

import type { Organism } from '../core/organism';
import { loadArchive, saveArchive } from './storage';

export class Archive {
  private organisms: Organism[];

  constructor() {
    this.organisms = loadArchive();
  }

  record(organism: Organism): void {
    this.organisms.push(organism);
    saveArchive(this.organisms);
  }

  all(): readonly Organism[] {
    return this.organisms;
  }

  isEmpty(): boolean {
    return this.organisms.length === 0;
  }
}
