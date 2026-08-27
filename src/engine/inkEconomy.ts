import type { HintResult } from '@/types';
import wordsData from '@/content/words.json';
import type { WordDef } from '@/types';
import { getRecipeFor } from './craftEngine';

const words = wordsData as WordDef[];

export const HINT_COSTS: Record<1 | 2 | 3, number> = {
  1: 10,
  2: 25,
  3: 50
};

/**
 * Tier 1: highlight three Wordbank words, one of which is a genuine
 * ingredient for the target (directly, via its recipe inputs).
 */
export function getTier1Hint(targetId: string, ownedWordIds: ReadonlySet<string>): HintResult | null {
  const recipe = getRecipeFor(targetId);
  if (!recipe) return null;

  const correctCandidates = recipe.inputs.filter((id) => ownedWordIds.has(id));
  if (correctCandidates.length === 0) return null; // ingredient-check should catch this case first

  const correct = correctCandidates[0];
  const decoys = [...ownedWordIds]
    .filter((id) => id !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const highlightWordIds = [correct, ...decoys].sort(() => Math.random() - 0.5);
  return { tier: 1, highlightWordIds };
}

/** Tier 2: auto-pin one correct ingredient to the Workbench. */
export function getTier2Hint(targetId: string, ownedWordIds: ReadonlySet<string>): HintResult | null {
  const recipe = getRecipeFor(targetId);
  if (!recipe) return null;
  const pinnedWordId = recipe.inputs.find((id) => ownedWordIds.has(id));
  if (!pinnedWordId) return null;
  return { tier: 2, pinnedWordId };
}

/** Tier 3: fully reveal the required combination for the immediate next craft. */
export function getTier3Hint(targetId: string): HintResult | null {
  const recipe = getRecipeFor(targetId);
  if (!recipe) return null;
  return { tier: 3, inputs: recipe.inputs };
}

export function wordById(id: string): WordDef | undefined {
  return words.find((w) => w.id === id);
}
