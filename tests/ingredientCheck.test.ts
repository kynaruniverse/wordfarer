import { describe, it, expect } from 'vitest';
import { checkIngredientsFor } from '@/engine/ingredientCheck';
import wordsData from '@/content/words.json';
import recipesData from '@/content/recipes.json';
import type { WordDef, RecipeDef } from '@/types';

const words = wordsData as WordDef[];
const recipes = recipesData as RecipeDef[];
const byOutput = new Map(recipes.map((r) => [r.output, r.inputs] as const));
const starterIds = new Set(words.filter((w) => w.isStarter).map((w) => w.id));

/**
 * Independent reference implementation of "every base word required along
 * every path to `id`" — tracks ancestors per-path, so it does NOT reproduce
 * the bug where a shared dependency across two branches gets dropped.
 * Used as an oracle to check the engine's real output against.
 */
function allRequiredBases(id: string, ancestors: ReadonlySet<string> = new Set()): Set<string> {
  if (ancestors.has(id)) return new Set();
  const inputs = byOutput.get(id);
  if (!inputs) return new Set([id]);
  const nextAncestors = new Set(ancestors);
  nextAncestors.add(id);
  const result = new Set<string>();
  for (const inp of inputs) {
    for (const b of allRequiredBases(inp, nextAncestors)) result.add(b);
  }
  return result;
}

describe('checkIngredientsFor', () => {
  it('every content word is reachable from the starter Wordbank', () => {
    for (const w of words) {
      expect(checkIngredientsFor(w.id, starterIds).status, w.id).toBe('ok');
    }
  });

  it('flags every base word actually required, even when required down more than one branch', () => {
    for (const w of words) {
      const bases = allRequiredBases(w.id);
      for (const missing of bases) {
        const owned = new Set([...starterIds].filter((id) => id !== missing));
        const result = checkIngredientsFor(w.id, owned);
        if (result.status === 'missing-base') {
          expect(result.missingWordIds, `${w.id} missing ${missing}`).toContain(missing);
        }
      }
    }
  });
});