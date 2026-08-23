import type { IngredientCheckResult } from '@/types';
import { getRecipeFor, reachableFrom } from './craftEngine';

/**
 * Expands an owned set through every reachable craft (not just one step deep)
 * until nothing new can be made. Used to answer "can this player reach the
 * target at all from what they currently hold?"
 */
function fullClosure(ownedWordIds: ReadonlySet<string>): Set<string> {
  let closure = new Set(ownedWordIds);
  // Recipe/content sizes stay in the hundreds for this game, so a naive
  // fixed-point loop is cheap; revisit only if content scale changes.
  while (true) {
    const next = reachableFrom(closure);
    const before = closure.size;
    for (const id of next) closure.add(id);
    if (closure.size === before) break;
  }
  return closure;
}

/**
 * Walks down the recipe tree from a target to find every base (unrecipe-able)
 * word id required along *a* valid path to it. Used only to explain a miss —
 * not to enforce a single "correct" route, since multiple recipe paths to
 * the same word may exist.
 */
function requiredBaseWords(targetId: string, ancestors: ReadonlySet<string> = new Set()): Set<string> {
  if (ancestors.has(targetId)) return new Set(); // guard against cycles on this path only
  const recipe = getRecipeFor(targetId);
  if (!recipe) return new Set([targetId]);
  const nextAncestors = new Set(ancestors);
  nextAncestors.add(targetId);
  const [a, b] = recipe.inputs;
  const result = new Set<string>();
  for (const id of requiredBaseWords(a, nextAncestors)) result.add(id);
  for (const id of requiredBaseWords(b, nextAncestors)) result.add(id);
  return result;
}

/**
 * Checks whether the target is reachable at all from the player's current
 * Wordbank. If not, surfaces which base words are missing — this is what
 * powers the quiet "you may need to craft something new first" prompt,
 * rather than letting the player search indefinitely for pieces they never had.
 */
export function checkIngredientsFor(
  targetId: string,
  ownedWordIds: ReadonlySet<string>
): IngredientCheckResult {
  const closure = fullClosure(ownedWordIds);
  if (closure.has(targetId)) {
    return { status: 'ok' };
  }

  const needed = requiredBaseWords(targetId);
  const missingWordIds = [...needed].filter((id) => !ownedWordIds.has(id));
  return { status: 'missing-base', missingWordIds };
}
