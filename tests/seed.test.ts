import { describe, it, expect } from 'vitest';
import { encodeGenome, decodeGenome } from '../src/core/seed';
import { generateRandomGenome } from '../src/core/genome';

describe('seed encode/decode', () => {
  it('round-trips a genome through encode -> decode', () => {
    const original = generateRandomGenome('roundtrip-test');
    const seed = encodeGenome(original);
    const result = decodeGenome(seed);

    expect(result.ok).toBe(true);
    expect(result.genome?.bodyPlan).toBe(original.bodyPlan);
    // Traits are quantized to 8-bit on encode, so compare within
    // tolerance rather than exact equality.
    for (const key of Object.keys(original.traits) as (keyof typeof original.traits)[]) {
      expect(result.genome!.traits[key]).toBeCloseTo(original.traits[key], 2);
    }
  });

  it('fails gracefully on garbage input instead of throwing', () => {
    expect(() => decodeGenome('not-a-real-seed')).not.toThrow();
    const result = decodeGenome('not-a-real-seed');
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects a seed with a tampered checksum', () => {
    const seed = encodeGenome(generateRandomGenome('tamper-test'));
    const tampered = seed.slice(0, -2) + '00';
    const result = decodeGenome(tampered === seed ? seed.slice(0, -2) + 'ff' : tampered);
    expect(result.ok).toBe(false);
  });
});
