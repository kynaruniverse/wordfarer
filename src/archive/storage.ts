/**
 * archive/storage.ts
 * localStorage persistence for the Archive. Only Organism records are
 * stored — rendered geometry/animation state is reconstructed from the
 * genome when needed, never persisted.
 */

import type { Organism } from '../core/organism';

const STORAGE_KEY = 'genesis.archive.v1';

export function loadArchive(): Organism[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt or inaccessible storage should never crash the app —
    // treat it as an empty archive and let first-run bootstrap fill it.
    return [];
  }
}

export function saveArchive(organisms: Organism[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(organisms));
  } catch {
    // Storage full or unavailable — silently skip persistence rather
    // than interrupting gameplay; nothing gameplay-critical depends
    // on the write succeeding immediately.
  }
}
