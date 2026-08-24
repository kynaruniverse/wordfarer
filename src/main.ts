/**
 * main.ts
 * Bootstraps the Archive (generating the starting roster on first run),
 * the Habitat, and every UI screen, then wires them together. Kept
 * thin by design — the actual logic for each screen lives in its own
 * ui/ module.
 */

import { Archive } from './archive/archive';
import { Habitat } from './habitat/habitat';
import { createStartingOrganism } from './core/organism';
import { STARTING_SEEDS } from './config';
import { initHabitatCanvas, startRenderLoop } from './ui/habitatView';
import { setupMergeInteraction } from './ui/mergeInteraction';
import { setupArchiveView } from './ui/archiveView';

const canvas = document.getElementById('habitat-canvas') as HTMLCanvasElement;
const navHabitatBtn = document.getElementById('nav-habitat') as HTMLButtonElement;
const navArchiveBtn = document.getElementById('nav-archive') as HTMLButtonElement;
const archiveViewEl = document.getElementById('archive-view') as HTMLDivElement;

const archive = new Archive();
const habitat = new Habitat();

function bootstrapFirstRun(): void {
  for (const seed of STARTING_SEEDS) {
    const organism = createStartingOrganism(seed);
    archive.record(organism);
    habitat.add(organism);
  }
}

if (archive.isEmpty()) {
  bootstrapFirstRun();
} else {
  // Population-management UI is deferred per spec — this simple
  // "most recent N" rule is a placeholder for repopulating the habitat
  // across sessions until that ships.
  const recent = archive.all().slice(-6);
  for (const organism of recent) habitat.add(organism);
}

const ctx = initHabitatCanvas(canvas);
const archiveUi = setupArchiveView(archive);

let debugPanel: { show: (o: import('./core/organism').Organism) => void } | null = null;
if (import.meta.env.DEV) {
  // Dynamic + DEV-gated so this whole module (and its DOM wiring) is
  // dead-code-eliminated from the production bundle.
  import('./ui/debugPanel').then(({ setupDebugPanel }) => {
    debugPanel = setupDebugPanel();
  });
}

const getDragOverlay = setupMergeInteraction(canvas, habitat, archive, {
  onArchiveUpdated: () => archiveUi.refresh(),
  onOrganismSelected: (organism) => debugPanel?.show(organism),
});

startRenderLoop(ctx, habitat, getDragOverlay);
archiveUi.refresh();

function showHabitat(): void {
  archiveViewEl.classList.add('hidden');
  canvas.classList.remove('hidden');
  navHabitatBtn.classList.add('active');
  navArchiveBtn.classList.remove('active');
}

function showArchive(): void {
  archiveUi.refresh();
  archiveViewEl.classList.remove('hidden');
  canvas.classList.add('hidden');
  navArchiveBtn.classList.add('active');
  navHabitatBtn.classList.remove('active');
}

navHabitatBtn.addEventListener('click', showHabitat);
navArchiveBtn.addEventListener('click', showArchive);
