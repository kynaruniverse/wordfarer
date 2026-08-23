import { create } from 'zustand';
import type { SaveState, WordbankEntry, ExpeditionDef, FieldbookEntry } from '@/types';
import { loadSaveState, persistSaveState } from '@/persistence/db';
import { tryCraft } from '@/engine/craftEngine';
import { checkIngredientsFor } from '@/engine/ingredientCheck';
import regionData from '@/content/regions/coastal-fog.json';

const expeditions = regionData.expeditions as ExpeditionDef[];

interface CraftFeedback {
  kind: 'bloom' | 'bounce';
  outputId?: string;
  key: number; // increments to re-trigger animation on repeat crafts
}

interface GameState {
  ready: boolean;
  save: SaveState | null;
  activeExpeditionId: string | null;
  currentExpeditionMoves: number;
  currentExpeditionWordsUsed: string[];
  ingredientNudge: string[] | null; // missing base word ids, or null
  feedback: CraftFeedback | null;
  justSolvedExpeditionId: string | null;

  init: () => Promise<void>;
  setActiveExpedition: (expeditionId: string) => void;
  ownedWordIds: () => Set<string>;
  craft: (ingredientA: string, ingredientB: string) => void;
  dismissNudge: () => void;
  replaceSaveState: (next: SaveState) => Promise<void>;
  advanceToNext: () => void;
}

function activeExpeditionOf(id: string | null): ExpeditionDef | undefined {
  return expeditions.find((e) => e.id === id);
}

export const useGameStore = create<GameState>((set, get) => ({
  ready: false,
  save: null,
  activeExpeditionId: null,
  currentExpeditionMoves: 0,
  currentExpeditionWordsUsed: [],
  ingredientNudge: null,
  feedback: null,
  justSolvedExpeditionId: null,

  init: async () => {
    const save = await loadSaveState();
    set({ save, ready: true });
  },

  setActiveExpedition: (expeditionId) => {
    set({
      activeExpeditionId: expeditionId,
      currentExpeditionMoves: 0,
      currentExpeditionWordsUsed: [],
      ingredientNudge: null
    });

    const expedition = activeExpeditionOf(expeditionId);
    const { save } = get();
    if (!expedition || !save) return;

    const owned = new Set(save.wordbank.map((w) => w.wordId));
    const check = checkIngredientsFor(expedition.targetId, owned);
    if (check.status === 'missing-base') {
      set({ ingredientNudge: check.missingWordIds });
    }
  },

  ownedWordIds: () => {
    const { save } = get();
    return new Set(save?.wordbank.map((w) => w.wordId) ?? []);
  },

  craft: (ingredientA, ingredientB) => {
    const { save, activeExpeditionId, currentExpeditionMoves, currentExpeditionWordsUsed } = get();
    if (!save) return;

    const owned = new Set(save.wordbank.map((w) => w.wordId));
    const result = tryCraft(ingredientA, ingredientB, owned);

    if (!result.ok) {
      set({ feedback: { kind: 'bounce', key: Date.now() } });
      return;
    }

    const nextMoves = currentExpeditionMoves + 1;
    const nextWordsUsed = [...currentExpeditionWordsUsed, result.outputId];

    let nextSave = save;
    if (!result.alreadyOwned) {
      const newEntry: WordbankEntry = {
        wordId: result.outputId,
        discoveredAt: Date.now(),
        discoveredVia: 'craft'
      };
      nextSave = { ...save, wordbank: [...save.wordbank, newEntry] };
    }

    // Check whether this craft solved the active expedition.
    const expedition = activeExpeditionOf(activeExpeditionId);
    let justSolvedExpeditionId: string | null = null;
    if (expedition && result.outputId === expedition.targetId) {
      const alreadyCompleted = nextSave.completedExpeditionIds.includes(expedition.id);
      if (!alreadyCompleted) {
        const fieldbookEntry: FieldbookEntry = {
          expeditionId: expedition.id,
          solvedAt: Date.now(),
          wordsUsed: nextWordsUsed,
          moveCount: nextMoves
        };
        nextSave = {
          ...nextSave,
          completedExpeditionIds: [...nextSave.completedExpeditionIds, expedition.id],
          fieldbook: [...nextSave.fieldbook, fieldbookEntry]
        };
        justSolvedExpeditionId = expedition.id;
      }
    }

    set({
      save: nextSave,
      currentExpeditionMoves: nextMoves,
      currentExpeditionWordsUsed: nextWordsUsed,
      feedback: { kind: 'bloom', outputId: result.outputId, key: Date.now() },
      ingredientNudge: null
    });

    void persistSaveState(nextSave);

    // Let the bloom animation finish before covering it with the solved
    // overlay — otherwise the player's final craft feels swallowed.
    if (justSolvedExpeditionId) {
      setTimeout(() => set({ justSolvedExpeditionId }), 650);
    }
  },

  dismissNudge: () => set({ ingredientNudge: null }),

  replaceSaveState: async (next) => {
    set({ save: next });
    await persistSaveState(next);
  },

  advanceToNext: () => {
    const { save } = get();
    if (!save) return;
    set({ justSolvedExpeditionId: null });
    const next = expeditions.find((e) => !save.completedExpeditionIds.includes(e.id));
    if (next) {
      get().setActiveExpedition(next.id);
    } else {
      set({ activeExpeditionId: null });
    }
  }
}));

export function getExpeditionById(id: string): ExpeditionDef | undefined {
  return activeExpeditionOf(id);
}

export function allExpeditions(): ExpeditionDef[] {
  return expeditions;
}
