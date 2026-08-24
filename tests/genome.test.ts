import { describe, it, expect } from 'vitest';
import { generateRandomGenome, rngFromSeed } from '../src/core/genome';

describe('genome determinism', () => {
  it('same seed string always produces the same genome', () => {
    const a = generateRandomGenome('GNS1-000001');
    const b = generateRandomGenome('GNS1-000001');
    expect(a).toEqual(b);
  });

  it('different seeds produce different genomes', () => {
    const a = generateRandomGenome('GNS1-000001');
    const b = generateRandomGenome('GNS1-000002');
    expect(a).not.toEqual(b);
  });

  it('rngFromSeed produces a repeatable sequence', () => {
    const seq1 = Array.from({ length: 5 }, () => 0).map((_, i) => i);
    const rngA = rngFromSeed('same-seed');
    const rngB = rngFromSeed('same-seed');
    const outA = seq1.map(() => rngA());
    const outB = seq1.map(() => rngB());
    expect(outA).toEqual(outB);
  });
});
