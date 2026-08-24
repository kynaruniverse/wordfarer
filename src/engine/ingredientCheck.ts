import type { IngredientCheckResult } from '@/types';
import { getRecipesFor, reachableFrom } from './craftEngine';

/**
 * Expands an owned set through every reachable craft (not just one step deep)
 * until nothing new can be made. Used to answer "can this player reach the
 * target at all from what they currently hold?"
 */
function fullClosure(ownedWordIds: ReadonlySet<string>): Set<string> {
  let closure = new Set(ownedWordIds);
  while (true) {
    const next = reachableFrom(closure);
    const before = closure.size;
    for (const id of next) closure.add(id);
    if (closure.size === before) break;
  }
  return closure;
}

/**
 * Walks down ONE recipe path from an id to find every base (unrecipe-able)
 * word it needs. Ancestors are tracked per-path, so a base word required
 * down two different branches of the same path is never dropped — only a
 * true cycle back to an ancestor on *this* path is skipped.
 *
 * If `id` itself has more than one recipe, this follows its first-authored
 * one; top-level path ambiguity (e.g. "relief" via fog+worry OR rain+calm)
 * is resolved by checkIngredientsFor trying every path, not by this helper.
 */
function basesAlongPath(id: string, ancestors: ReadonlySet<string> = new Set()): Set<string> {
  if (ancestors.has(id)) return new Set();
  const recipes = getRecipesFor(id);
  if (recipes.length === 0) {
    return new Set([id]);
  }

  const nextAncestors = new Set(ancestors);
  nextAncestors.add(id);

  const [a, b] = recipes[0].inputs;
  const result = new Set<string>();
  for (const x of basesAlongPath(a, nextAncestors)) result.add(x);
  for (const x of basesAlongPath(b, nextAncestors)) result.add(x);
  return result;
}

/**
 * Checks whether the target is reachable at all from the player's current
 * Wordbank. If not, surfaces which base words are missing — this is what
 * powers the quiet "you may need to craft something new first" prompt.
 *
 * When a target has more than one valid recipe, every path is tried and the
 * one with the fewest missing base words is reported, so the nudge points
 * at whichever route the player is already closest to completing.
 */
export function checkIngredientsFor(
  targetId: string,
  ownedWordIds: ReadonlySet<string>
): IngredientCheckResult {
  const closure = fullClosure(ownedWordIds);
  if (closure.has(targetId)) {
    return { status: 'ok' };
  }

  const candidateRecipes = getRecipesFor(targetId);
  if (candidateRecipes.length === 0) {
    return { status: 'missing-base', missingWordIds: [targetId] };
  }

  let best: string[] | null = null;
  for (const recipe of candidateRecipes) {
    const bases = new Set<string>();
    for (const input of recipe.inputs) {
      for (const b of basesAlongPath(input)) bases.add(b);
    }
    const missing = [...bases].filter((id) => !ownedWordIds.has(id));
    if (best === null || missing.length < best.length) {
      best = missing;
    }
  }
  return { status: 'missing-base', missingWordIds: best ?? [] };
}