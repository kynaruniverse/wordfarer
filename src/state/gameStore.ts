import { create } from 'zustand';
import type { SaveState, WordbankEntry, ExpeditionDef, FieldbookEntry, HintTier } from '@/types';
import { loadSaveState, persistSaveState } from '@/persistence/db';
import { tryCraft } from '@/engine/craftEngine';
import { checkIngredientsFor } from '@/engine/ingredientCheck';
import { getTier1Hint, getTier2Hint, getTier3Hint, HINT_COSTS } from '@/engine/inkEconomy';
import { useWorkbenchStore } from './workbenchStore';
import regionData from '@/content/regions/coastal-fog.json';

const expeditions = regionData.expeditions as ExpeditionDef[];

// Simple MVP earn rule: solving funds the next hint. Rewarded-ad and Daily
// Dispatch earn paths are separate systems, added when those screens exist.
const INK_REWARD_NORMAL = 15;
const INK_REWARD_LANDMARK = 30;

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
  hintHighlightWordIds: string[] | null;
  hintReveal: [string, string] | null;

  init: () => Promise<void>;
  setActiveExpedition: (expeditionId: string) => void;
  ownedWordIds: () => Set<string>;
  craft: (ingredientA: string, ingredientB: string) => void;
  dismissNudge: () => void;
  replaceSaveState: (next: SaveState) => Promise<void>;
  advanceToNext: () => void;
  useHint: (tier: HintTier) => void;
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
  hintHighlightWordIds: null,
  hintReveal: null,

  init: async () => {
    const save = await loadSaveState();
    set({ save, ready: true });
  },

  setActiveExpedition: (expeditionId) => {
    set({
      activeExpeditionId: expeditionId,
      currentExpeditionMoves: 0,
      currentExpeditionWordsUsed: [],
      ingredientNudge: null,
      hintHighlightWordIds: null,
      hintReveal: null
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
      set({ feedback: { kind: 'bounce', key: Date.now() }, hintHighlightWordIds: null, hintReveal: null });
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
          fieldbook: [...nextSave.fieldbook, fieldbookEntry],
          ink: { balance: nextSave.ink.balance + (expedition.isLandmark ? INK_REWARD_LANDMARK : INK_REWARD_NORMAL) }
        };
        justSolvedExpeditionId = expedition.id;
      }
    }

    set({
      save: nextSave,
      currentExpeditionMoves: nextMoves,
      currentExpeditionWordsUsed: nextWordsUsed,
      feedback: { kind: 'bloom', outputId: result.outputId, key: Date.now() },
      ingredientNudge: null,
      hintHighlightWordIds: null,
      hintReveal: null
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
  },

  useHint: (tier) => {
    const { save, activeExpeditionId } = get();
    const expedition = activeExpeditionOf(activeExpeditionId);
    if (!save || !expedition) return;

    const cost = HINT_COSTS[tier];
    if (save.ink.balance < cost) return; // buttons are disabled below cost, but guard here too

    const owned = new Set(save.wordbank.map((w) => w.wordId));

    if (tier === 1) {
      const hint = getTier1Hint(expedition.targetId, owned);
      if (!hint || hint.tier !== 1) return;
      const nextSave = { ...save, ink: { balance: save.ink.balance - cost } };
      set({ save: nextSave, hintHighlightWordIds: hint.highlightWordIds });
      void persistSaveState(nextSave);
      return;
    }

    if (tier === 2) {
      const hint = getTier2Hint(expedition.targetId, owned);
      if (!hint || hint.tier !== 2) return;
      const nextSave = { ...save, ink: { balance: save.ink.balance - cost } };
      set({ save: nextSave });
      void persistSaveState(nextSave);
      useWorkbenchStore.getState().pin(hint.pinnedWordId);
      return;
    }

    // tier === 3
    const hint = getTier3Hint(expedition.targetId);
    if (!hint || hint.tier !== 3) return;
    const nextSave = { ...save, ink: { balance: save.ink.balance - cost } };
    set({ save: nextSave, hintReveal: hint.inputs });
    void persistSaveState(nextSave);
  }
}));

export function getExpeditionById(id: string): ExpeditionDef | undefined {
  return activeExpeditionOf(id);
}

export function allExpeditions(): ExpeditionDef[] {
  return expeditions;
}
