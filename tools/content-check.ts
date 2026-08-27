/**
 * Validates the content graph before it ships. Run via `npm run check-content`,
 * wired into CI so a typo'd word id in a hand-edited JSON file (easy to do
 * from a phone) fails the build instead of shipping a broken expedition.
 */
import wordsData from '../src/content/words.json';
import recipesData from '../src/content/recipes.json';
import coastalFog from '../src/content/regions/coastal-fog.json';
import type { WordDef, RecipeDef, ExpeditionDef } from '../src/types';

const words = wordsData as WordDef[];
const recipes = recipesData as RecipeDef[];
const regionFiles = [coastalFog];

let errors = 0;

function fail(message: string) {
  console.error(`✗ ${message}`);
  errors++;
}

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
  const expeditions = file.expeditions as ExpeditionDef[];
  for (const exp of expeditions) {
    if (!wordIds.has(exp.targetId)) {
      fail(`Expedition "${exp.id}" targets unknown word id "${exp.targetId}"`);
    }
    for (const id of exp.chain ?? []) {
      if (!wordIds.has(id)) fail(`Expedition "${exp.id}" chain references unknown word id "${id}"`);
    }
  }

  const expeditionIds = new Set(expeditions.map((e) => e.id));
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
  console.log(`✓ Content graph OK — ${words.length} words, ${recipes.length} recipes, ${regionFiles.length} region file(s).`);
}
