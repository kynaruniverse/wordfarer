/**
 * core/organism.ts
 * The organism entity (persisted/archive-relevant fields) plus runtime
 * state (position, animation phase — never persisted, always
 * reconstructed). Also the merge() orchestration function that ties
 * inheritance + mutation + seed encoding together for a single merge
 * event.
 */

import { generateRandomGenome, rngFromSeed, type Genome } from './genome';
import { inherit } from './inheritance';
import { mutate } from './mutation';
import { encodeGenome } from './seed';
import { GENERATOR_VERSION } from '../config';

export interface Organism {
  id: string;
  genome: Genome;
  seed: string; // shareable, reconstructs genome directly
  parentIds: [string, string] | null; // null for starting-roster organisms
  generation: number; // max(parent generations) + 1; 0 for starting roster
  generatorVersion: number;
  discoveredAt: number; // epoch ms
  wasDramaticMutation: boolean;
}

/** Runtime-only animation/position state — never persisted, always
 *  reconstructed fresh from the genome when an organism becomes active. */
export interface OrganismRuntimeState {
  x: number;
  y: number;
  heading: number; // radians
  phase: number; // animation cycle position, advances each tick
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `org_${Date.now().toString(36)}_${idCounter}`;
}

export function createStartingOrganism(seedStr: string): Organism {
  const genome = generateRandomGenome(seedStr);
  return {
    id: nextId(),
    genome,
    seed: encodeGenome(genome),
    parentIds: null,
    generation: 0,
    generatorVersion: GENERATOR_VERSION,
    discoveredAt: Date.now(),
    wasDramaticMutation: false,
  };
}

/**
 * Performs a full merge: derives a deterministic generation seed from
 * both parent seeds plus a caller-supplied nonce (so re-merging the
 * same pair twice doesn't always produce the same child), runs
 * inheritance then mutation, and returns a new archived-ready Organism.
 */
export function merge(parentA: Organism, parentB: Organism, nonce: string): Organism {
  const generationSeed = `${parentA.seed}:${parentB.seed}:${nonce}`;
  const rng = rngFromSeed(generationSeed);

  const preMutation = inherit(parentA.genome, parentB.genome, rng);
  const { genome, wasDramatic } = mutate(preMutation, rng);

  return {
    id: nextId(),
    genome,
    seed: encodeGenome(genome),
    parentIds: [parentA.id, parentB.id],
    generation: Math.max(parentA.generation, parentB.generation) + 1,
    generatorVersion: GENERATOR_VERSION,
    discoveredAt: Date.now(),
    wasDramaticMutation: wasDramatic,
  };
}

export function createRuntimeState(x: number, y: number): OrganismRuntimeState {
  return { x, y, heading: Math.random() * Math.PI * 2, phase: 0 };
}
