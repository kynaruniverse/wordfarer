import type { RecipeDef, CraftResult } from '@/types';
import recipesData from '@/content/recipes.json';

const recipes = recipesData as RecipeDef[];

/** order-independent key for a pair of ingredient ids */
function pairKey(a: string, b: string): string {
  return [a, b].sort().join('::');
}

// Built once at module load — recipe lists stay small (hundreds, not
// thousands) so a flat map is simpler than a graph structure and just as fast.
const recipeIndex = new Map<string, string>();
for (const r of recipes) {
  recipeIndex.set(pairKey(r.inputs[0], r.inputs[1]), r.output);
}

/**
 * Attempt to craft by combining two word ids. Does not mutate anything —
 * callers (state layer) decide what to do with the result.
 */
export function tryCraft(
  ingredientA: string,
  ingredientB: string,
  ownedWordIds: ReadonlySet<string>
): CraftResult {
  const outputId = recipeIndex.get(pairKey(ingredientA, ingredientB));
  if (!outputId) {
    return { ok: false, reason: 'no-recipe' };
  }
  return { ok: true, outputId, alreadyOwned: ownedWordIds.has(outputId) };
}

/** All recipe outputs reachable directly from the given owned set (one craft deep). */
export function reachableFrom(ownedWordIds: ReadonlySet<string>): Set<string> {
  const owned = [...ownedWordIds];
  const reachable = new Set<string>();
  for (let i = 0; i < owned.length; i++) {
    for (let j = i + 1; j < owned.length; j++) {
      const outputId = recipeIndex.get(pairKey(owned[i], owned[j]));
      if (outputId) reachable.add(outputId);
    }
  }
  return reachable;
}

export function getRecipeFor(outputId: string): RecipeDef | undefined {
  return recipes.find((r) => r.output === outputId);
}
