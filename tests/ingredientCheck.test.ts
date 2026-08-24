import { describe, it, expect } from 'vitest';
import { checkIngredientsFor } from '@/engine/ingredientCheck';
import wordsData from '@/content/words.json';
import recipesData from '@/content/recipes.json';
import type { WordDef, RecipeDef } from '@/types';

const words = wordsData as WordDef[];
const recipes = recipesData as RecipeDef[];
const starterIds = new Set(words.filter((w) => w.isStarter).map((w) => w.id));

const recipeCountByOutput = new Map<string, number>();
for (const r of recipes) {
  recipeCountByOutput.set(r.output, (recipeCountByOutput.get(r.output) ?? 0) + 1);
}
const singleRecipeOutput = (id: string) => (recipeCountByOutput.get(id) ?? 0) <= 1;

const byOutputSingle = new Map(recipes.map((r) => [r.output, r.inputs] as const));

/**
 * Independent reference implementation of "every base word required along
 * every path to `id`" — tracks ancestors per-path, so it does NOT reproduce
 * the bug where a shared dependency across two branches gets dropped.
 * Only valid for single-recipe words; multi-recipe words (relief) get their
 * own dedicated tests below since "every base word must be flagged" isn't
 * true once an alternate path can route around a missing ingredient.
 */
function allRequiredBases(id: string, ancestors: ReadonlySet<string> = new Set()): Set<string> {
  if (ancestors.has(id)) return new Set();
  const inputs = byOutputSingle.get(id);
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

  it('flags every base word actually required, for words with exactly one recipe path', () => {
    for (const w of words) {
      if (!singleRecipeOutput(w.id)) continue;
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

  describe('multi-recipe target: relief (fog+worry OR rain+calm)', () => {
    it('is "ok" as soon as ANY one path is fully satisfied, even if another path is blocked', () => {
      const owned = new Set([...starterIds].filter((id) => id !== 'earth'));
      expect(checkIngredientsFor('relief', owned).status).toBe('ok');
    });

    it('reports missing-base when an ingredient required by every path is absent', () => {
      const owned = new Set([...starterIds].filter((id) => id !== 'wind'));
      const result = checkIngredientsFor('relief', owned);
      expect(result.status).toBe('missing-base');
      if (result.status === 'missing-base') {
        expect(result.missingWordIds).toContain('wind');
      }
    });

    it('picks the path with the fewest missing ingredients rather than unioning every path', () => {
      const owned = new Set(['water', 'heat', 'air', 'cold']);
      const result = checkIngredientsFor('relief', owned);
      expect(result.status).toBe('missing-base');
      if (result.status === 'missing-base') {
        expect(result.missingWordIds).toEqual(['wind']);
      }
    });
  });
});