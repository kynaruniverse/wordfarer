import { openDB, type IDBPDatabase } from 'idb';
import type { SaveState } from '@/types';
import { createDefaultSaveState, migrateSaveState } from './schema';

const DB_NAME = 'wordfarer';
const DB_VERSION = 1;
const STORE_NAME = 'save';
const SAVE_KEY = 'main';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      }
    });
  }
  return dbPromise;
}

export async function loadSaveState(): Promise<SaveState> {
  const db = await getDb();
  const raw = await db.get(STORE_NAME, SAVE_KEY);
  if (!raw) {
    const fresh = createDefaultSaveState();
    await db.put(STORE_NAME, fresh, SAVE_KEY);
    return fresh;
  }
  return migrateSaveState(raw as SaveState);
}

export async function persistSaveState(state: SaveState): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, state, SAVE_KEY);
}
