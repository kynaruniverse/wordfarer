import { describe, it, expect } from 'vitest';
import { inherit } from '../src/core/inheritance';
import { rngFromSeed, type Genome } from '../src/core/genome';

function makeGenome(bodyPlan: Genome['bodyPlan'], allTraitsValue: number): Genome {
  return {
    bodyPlan,
    traits: {
      size: allTraitsValue,
      limbLength: allTraitsValue,
      segmentCount: allTraitsValue,
      speed: allTraitsValue,
      hue: allTraitsValue,
      saturation: allTraitsValue,
      brightness: allTraitsValue,
      patternDensity: allTraitsValue,
    },
  };
}

describe('inheritance', () => {
  it('is deterministic for a given rng sequence', () => {
    const a = makeGenome('quadruped', 0.2);
    const b = makeGenome('quadruped', 0.8);
    const child1 = inherit(a, b, rngFromSeed('merge-1'));
    const child2 = inherit(a, b, rngFromSeed('merge-1'));
    expect(child1).toEqual(child2);
  });

  it('biases the child toward the parent with the higher trait value', () => {
    const low = makeGenome('quadruped', 0.1);
    const high = makeGenome('quadruped', 0.9);
    const child = inherit(low, high, rngFromSeed('bias-check'));
    // Biased blend should land closer to the stronger (0.9) parent than
    // a plain 50/50 average (0.5) would.
    expect(child.traits.size).toBeGreaterThan(0.5);
  });

  it('never fabricates a value outside the 0..1 trait range', () => {
    const low = makeGenome('serpent', 0.0);
    const high = makeGenome('serpent', 1.0);
    const child = inherit(low, high, rngFromSeed('range-check'));
    for (const v of Object.values(child.traits)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
