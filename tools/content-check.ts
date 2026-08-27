/**
 * Validates the content graph before it ships. Run via `npm run check-content`,
 * wired into CI so a typo'd word id in a hand-edited JSON file (easy to do
 * from a phone) fails the build instead of shipping a broken expedition.
 *
 * Reads files directly off disk rather than using static ESM JSON imports —
 * this avoids environment-specific module resolution issues and means a new
 * region file is picked up automatically, with no import list to maintain.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { WordDef, RecipeDef, ExpeditionDef } from '../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'src', 'content');

function readJson<T>(relativePath: string): T {
  const fullPath = join(CONTENT_DIR, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Content file not found on disk: ${fullPath}`);
  }
  return JSON.parse(readFileSync(fullPath, 'utf-8')) as T;
}

let errors = 0;
function fail(message: string) {
  console.error(`✗ ${message}`);
  errors++;
}

const words = readJson<WordDef[]>('words.json');
const recipes = readJson<RecipeDef[]>('recipes.json');

const regionsDir = join(CONTENT_DIR, 'regions');
const regionFileNames = existsSync(regionsDir)
  ? readdirSync(regionsDir).filter((f) => f.endsWith('.json'))
  : [];

if (regionFileNames.length === 0) {
  fail(`No region files found in ${regionsDir}`);
}

const regionFiles = regionFileNames.map((name) =>
  readJson<{ region: { id: string; expeditionIds: string[] }; expeditions: ExpeditionDef[] }>(
    join('regions', name)
  )
);

const wordIds = new Set(words.map((w) => w.id));

// Duplicate word ids
const seen = new Set<string>();
for (const w of words) {
  if (seen.has(w.id)) fail(`Duplicate word id: "${w.id}"`);
  seen.add(w.id);
}

// Recipes reference real word ids, and don't collide on the same input pair
const pairSeen = new Set<string>();
for (const r of recipes) {
  for (const id of r.inputs) {
    if (!wordIds.has(id)) fail(`Recipe output "${r.output}" references unknown input word id "${id}"`);
  }
  if (!wordIds.has(r.output)) fail(`Recipe output word id "${r.output}" is not defined in words.json`);

  const key = [...r.inputs].sort().join('::');
  if (pairSeen.has(key)) fail(`Duplicate recipe for input pair: ${r.inputs.join(' + ')}`);
  pairSeen.add(key);
}

// Expeditions reference real target/chain word ids
for (const file of regionFiles) {
  for (const exp of file.expeditions) {
    if (!wordIds.has(exp.targetId)) {
      fail(`Expedition "${exp.id}" targets unknown word id "${exp.targetId}"`);
    }
    for (const id of exp.chain ?? []) {
      if (!wordIds.has(id)) fail(`Expedition "${exp.id}" chain references unknown word id "${id}"`);
    }
  }

  const expeditionIds = new Set(file.expeditions.map((e) => e.id));
  for (const id of file.region.expeditionIds) {
    if (!expeditionIds.has(id)) {
      fail(`Region "${file.region.id}" lists expedition id "${id}" with no matching expedition definition`);
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} content error(s) found.`);
  process.exit(1);
} else {
  console.log(
    `✓ Content graph OK — ${words.length} words, ${recipes.length} recipes, ${regionFiles.length} region file(s).`
  );
}