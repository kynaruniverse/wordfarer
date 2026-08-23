import type { SaveState, WordbankEntry } from '@/types';
import wordsData from '@/content/words.json';
import type { WordDef } from '@/types';

export const CURRENT_SCHEMA_VERSION = 1;

const words = wordsData as WordDef[];

export function createDefaultSaveState(): SaveState {
  const starterEntries: WordbankEntry[] = words
    .filter((w) => w.isStarter)
    .map((w) => ({
      wordId: w.id,
      discoveredAt: Date.now(),
      discoveredVia: 'starter'
    }));

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    wordbank: starterEntries,
    completedExpeditionIds: [],
    fieldbook: [],
    dispatchResults: [],
    ink: { balance: 0 }
  };
}

/**
 * Migration entry point. Region packs or save-shape changes bump
 * CURRENT_SCHEMA_VERSION and add a case here — this is what stops a future
 * content update from corrupting an existing player's Wordbank.
 */
export function migrateSaveState(raw: SaveState): SaveState {
  let state = raw;
  // if (state.schemaVersion === 1) { state = migrateV1ToV2(state); }
  return state;
}
