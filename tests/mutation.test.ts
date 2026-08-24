import { describe, it, expect } from 'vitest';
import { mutate } from '../src/core/mutation';
import { rngFromSeed, type Genome } from '../src/core/genome';

const baseGenome: Genome = {
  bodyPlan: 'quadruped',
  traits: {
    size: 0.5,
    limbLength: 0.5,
    segmentCount: 0.5,
    speed: 0.5,
    hue: 0.5,
    saturation: 0.5,
    brightness: 0.5,
    patternDensity: 0.5,
  },
};

describe('mutation', () => {
  it('is deterministic for a given rng sequence', () => {
    const r1 = mutate(baseGenome, rngFromSeed('mut-seed'));
    const r2 = mutate(baseGenome, rngFromSeed('mut-seed'));
    expect(r1).toEqual(r2);
  });

  it('does not mutate the input genome object in place', () => {
    const copy = JSON.parse(JSON.stringify(baseGenome));
    mutate(baseGenome, rngFromSeed('immutability-check'));
    expect(baseGenome).toEqual(copy);
  });

  it('keeps all trait values within 0..1 after mutation', () => {
    const { genome } = mutate(baseGenome, rngFromSeed('range-check'));
    for (const v of Object.values(genome.traits)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
