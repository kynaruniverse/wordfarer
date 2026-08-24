/**
 * core/seed.ts
 * Encodes a genome as a short, shareable string (an "organism seed")
 * and decodes it back. This is distinct from the internal
 * "generation seed" used to drive inheritance/mutation RNG during a
 * merge (see organism.ts) — the organism seed encodes the *result*,
 * so it reconstructs the organism directly with no parent data needed.
 *
 * Format: GNS<version><bodyPlanCode>-<16 hex chars: 8 traits x 2 hex>-<2 hex checksum>
 * e.g.    GNS1Q-3F2A1B0C4D5E6F7A-9C
 */

import { CONTINUOUS_TRAIT_KEYS, clamp01, type BodyPlanId, type Genome } from './genome';
import { GENERATOR_VERSION } from '../config';

const BODY_PLAN_CODE: Record<BodyPlanId, string> = {
  quadruped: 'Q',
  serpent: 'S',
};
const CODE_TO_BODY_PLAN: Record<string, BodyPlanId> = {
  Q: 'quadruped',
  S: 'serpent',
};

function toHexByte(v01: number): string {
  const byte = Math.round(clamp01(v01) * 255);
  return byte.toString(16).padStart(2, '0');
}

function fromHexByte(hex: string): number {
  return parseInt(hex, 16) / 255;
}

function checksum(payload: string): string {
  let sum = 0;
  for (let i = 0; i < payload.length; i++) sum = (sum + payload.charCodeAt(i) * (i + 1)) % 256;
  return sum.toString(16).padStart(2, '0');
}

export function encodeGenome(genome: Genome): string {
  const bodyCode = BODY_PLAN_CODE[genome.bodyPlan];
  const traitHex = CONTINUOUS_TRAIT_KEYS.map((k) => toHexByte(genome.traits[k])).join('');
  const payload = `${GENERATOR_VERSION}${bodyCode}-${traitHex}`;
  return `GNS${payload}-${checksum(payload)}`;
}

export interface DecodeResult {
  ok: boolean;
  genome?: Genome;
  error?: string;
}

const EXPECTED_TRAIT_HEX_LENGTH = CONTINUOUS_TRAIT_KEYS.length * 2;

export function decodeGenome(seedStr: string): DecodeResult {
  if (!seedStr.startsWith('GNS')) {
    return { ok: false, error: "That doesn't look like a valid Genesis code." };
  }
  const body = seedStr.slice(3);
  const parts = body.split('-');
  if (parts.length !== 3) {
    return { ok: false, error: "That doesn't look like a valid Genesis code." };
  }
  const [versionAndCode, traitHex, sum] = parts as [string, string, string];
  const version = Number(versionAndCode[0]);
  const bodyCode = versionAndCode.slice(1);

  if (version !== GENERATOR_VERSION) {
    return { ok: false, error: `Seed is from generator version ${version}, this build supports ${GENERATOR_VERSION}.` };
  }
  const bodyPlan = CODE_TO_BODY_PLAN[bodyCode];
  if (!bodyPlan) {
    return { ok: false, error: "That doesn't look like a valid Genesis code." };
  }
  if (traitHex.length !== EXPECTED_TRAIT_HEX_LENGTH || !/^[0-9a-f]+$/i.test(traitHex)) {
    return { ok: false, error: "That doesn't look like a valid Genesis code." };
  }
  const payload = `${versionAndCode}-${traitHex}`;
  if (checksum(payload) !== sum.toLowerCase()) {
    return { ok: false, error: "That doesn't look like a valid Genesis code." };
  }

  const traits = {} as Genome['traits'];
  CONTINUOUS_TRAIT_KEYS.forEach((key, i) => {
    traits[key] = fromHexByte(traitHex.slice(i * 2, i * 2 + 2));
  });

  return { ok: true, genome: { bodyPlan, traits } };
}
