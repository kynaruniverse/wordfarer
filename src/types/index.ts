// ── Content graph ──────────────────────────────────────────────────────────

export type CategoryId =
  | 'nature'
  | 'home'
  | 'feelings'
  | 'concepts'
  | 'man-made';

export interface WordDef {
  id: string;            // stable id, e.g. "cloud"
  display: string;       // shown to player, e.g. "CLOUD"
  category: CategoryId;
  /** True for the small set of words the player starts with. */
  isStarter?: boolean;
}

export interface RecipeDef {
  /** Two ingredient word ids, order-independent. */
  inputs: [string, string];
  /** The word id produced by combining the two inputs. */
  output: string;
}

export interface ExpeditionDef {
  id: string;
  regionId: string;
  clue: string;
  /** The final word id this expedition is asking for. */
  targetId: string;
  /**
   * Optional authored chain of intermediate word ids leading to the target.
   * Used by the ingredient-check nudge and by hint tiers — not enforced as
   * the only valid path, since multiple valid recipe routes may exist.
   */
  chain?: string[];
  isLandmark?: boolean;
}

export interface RegionDef {
  id: string;
  title: string;
  description: string;
  expeditionIds: string[];
}

export interface DispatchDef {
  id: string;           // e.g. "2026-08-23"
  clue: string;
  targetId: string;
  chain?: string[];
}

// ── Save state ──────────────────────────────────────────────────────────

export interface WordbankEntry {
  wordId: string;
  discoveredAt: number; // epoch ms
  discoveredVia: 'starter' | 'craft' | 'expedition-reward';
}

export interface FieldbookEntry {
  expeditionId: string;
  solvedAt: number;
  wordsUsed: string[]; // ids of words crafted/used en route, in order
  moveCount: number;
}

export interface DispatchResult {
  dispatchId: string;
  solvedAt: number;
  moveCount: number;
}

export interface InkState {
  balance: number;
}

export interface SaveState {
  schemaVersion: number;
  wordbank: WordbankEntry[];
  completedExpeditionIds: string[];
  fieldbook: FieldbookEntry[];
  dispatchResults: DispatchResult[];
  ink: InkState;
}

// ── Engine results ──────────────────────────────────────────────────────

export type CraftResult =
  | { ok: true; outputId: string; alreadyOwned: boolean }
  | { ok: false; reason: 'no-recipe' };

export type IngredientCheckResult =
  | { status: 'ok' }
  | { status: 'missing-base'; missingWordIds: string[] };

export type HintTier = 1 | 2 | 3;

export type HintResult =
  | { tier: 1; highlightWordIds: string[] }
  | { tier: 2; pinnedWordId: string }
  | { tier: 3; inputs: [string, string] };
