import { create } from 'zustand';

interface WorkbenchState {
  slotA: string | null;
  slotB: string | null;
  pin: (wordId: string) => void;
  clear: () => void;
}

/**
 * The Workbench is intentionally ephemeral — it holds at most two pinned
 * words at a time and is never saved. This is what keeps "everything I own"
 * (Wordbank, persisted) separate from "what I'm working with right now"
 * (Workbench, disposable), per the core UI hook of the game.
 */
export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  slotA: null,
  slotB: null,

  pin: (wordId) => {
    const { slotA, slotB } = get();
    if (slotA === wordId || slotB === wordId) return; // already pinned
    if (!slotA) {
      set({ slotA: wordId });
    } else if (!slotB) {
      set({ slotB: wordId });
    } else {
      // Both slots full — replace the older pin (slotA) with the new one.
      set({ slotA: slotB, slotB: wordId });
    }
  },

  clear: () => set({ slotA: null, slotB: null })
}));
