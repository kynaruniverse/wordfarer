import type { SaveState } from '@/types';
import { migrateSaveState } from './schema';

export function exportSaveStateToFile(state: SaveState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStamp = new Date().toISOString().slice(0, 10);
  a.href = url;
a.download = `wordfarer-wordbank-${dateStamp}.json`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export class ImportValidationError extends Error {}

/**
 * Parses and sanity-checks an imported save file before it's allowed to
 * overwrite the current Wordbank. Deliberately conservative — a bad import
 * destroying weeks of collection progress is the single worst failure mode
 * in this game.
 */
export function parseImportedSaveState(fileContents: string): SaveState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContents);
  } catch {
    throw new ImportValidationError('That file isn\'t valid Wordfarer save data.');
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('schemaVersion' in parsed) ||
    !('wordbank' in parsed) ||
    !Array.isArray((parsed as SaveState).wordbank)
  ) {
    throw new ImportValidationError('That file isn\'t valid Wordfarer save data.');
  }

  return migrateSaveState(parsed as SaveState);
}
