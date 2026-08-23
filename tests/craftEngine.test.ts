import { describe, it, expect } from 'vitest';
import { tryCraft, reachableFrom } from '@/engine/craftEngine';
import wordsData from '@/content/words.json';
import type { WordDef } from '@/types';

const words = wordsData as WordDef[];
const starterIds = new Set(words.filter((w) => w.isStarter).map((w) => w.id));

describe('craftEngine.tryCraft', () => {
  it('is order-independent: A+B and B+A always agree', () => {
    const owned = new Set(starterIds);
    for (const a of owned) {
      for (const b of owned) {
        if (a === b) continue;
        const forward = tryCraft(a, b, owned);
        const backward = tryCraft(b, a, owned);
        expect(forward.ok).toBe(backward.ok);
        if (forward.ok && backward.ok) {
          expect(forward.outputId).toBe(backward.outputId);
        }
      }
    }
  });

  it('reports no-recipe for a pair with no matching recipe', () => {
    const result = tryCraft('__not-a-real-word__', '__also-not-real__', new Set());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('no-recipe');
    }
  });

  it('flags alreadyOwned correctly', () => {
    const owned = new Set(starterIds);
    for (const a of owned) {
      for (const b of owned) {
        if (a === b) continue;
        const result = tryCraft(a, b, owned);
        if (result.ok) {
          expect(result.alreadyOwned).toBe(owned.has(result.outputId));
        }
      }
    }
  });
});

describe('craftEngine.reachableFrom', () => {
  it('never treats a word combined with itself as reachable', () => {
    const single = new Set([[...starterIds][0]]);
    expect(reachableFrom(single).size).toBe(0);
  });

  it('only returns ids that exist in the content graph', () => {
    const reachable = reachableFrom(starterIds);
    for (const id of reachable) {
      expect(words.some((w) => w.id === id)).toBe(true);
    }
  });
});