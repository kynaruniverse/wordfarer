// Deterministic PRNG (mulberry32) — same seed always produces the same
// sequence of values. This is what makes genomes reproducible/shareable.

export type RNG = () => number; // returns a float in [0, 1)

export function mulberry32(seed: number): RNG {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generates a fresh, non-deterministic seed — used only when creating a
// brand-new organism from scratch (e.g. first-run starting roster).
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

// Convenience: pick a float within [min, max) using a given RNG.
export function range(rng: RNG, min: number, max: number): number {
  return min + rng() * (max - min);
}

// Convenience: pick an integer within [min, max] inclusive.
export function rangeInt(rng: RNG, min: number, max: number): number {
  return Math.floor(range(rng, min, max + 1));
}