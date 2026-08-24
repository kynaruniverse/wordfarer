/**
 * ui/archiveView.ts
 * Chronological list/gallery of every discovered organism (MVP scope —
 * no tree view yet, though lineage data is already recorded on each
 * Organism for when that ships). Deliberately shows no numeric stats,
 * trait labels, or rarity indicators — only generation and discovery
 * order/date, which are chronological metadata, not genetics.
 */

import type { Archive } from '../archive/archive';
import type { Organism } from '../core/organism';
import { createRuntimeState } from '../core/organism';
import { drawOrganism } from '../render/shapes';

const grid = document.getElementById('archive-grid') as HTMLDivElement;
const emptyState = document.getElementById('archive-empty') as HTMLDivElement;
const detail = document.getElementById('archive-detail') as HTMLDivElement;
const detailCanvas = document.getElementById('archive-detail-canvas') as HTMLCanvasElement;
const detailMeta = document.getElementById('archive-detail-meta') as HTMLDivElement;
const detailClose = document.getElementById('archive-detail-close') as HTMLButtonElement;

function renderThumb(canvas: HTMLCanvasElement, organism: Organism): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const runtime = createRuntimeState(canvas.width / 2, canvas.height / 2);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawOrganism(ctx, organism.genome, runtime);
}

function openDetail(organism: Organism, discoveryIndex: number): void {
  renderThumb(detailCanvas, organism);
  const date = new Date(organism.discoveredAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  detailMeta.textContent = `#${discoveryIndex + 1} · Generation ${organism.generation} · discovered ${date}`;
  detail.classList.add('visible');
}

detailClose.addEventListener('click', () => detail.classList.remove('visible'));
detail.addEventListener('click', (e) => {
  if (e.target === detail) detail.classList.remove('visible');
});

export function setupArchiveView(archive: Archive): { refresh: () => void } {
  function refresh(): void {
    const organisms = archive.all();
    grid.innerHTML = '';
    emptyState.classList.toggle('hidden', organisms.length > 0);

    organisms.forEach((organism, index) => {
      const entry = document.createElement('div');
      entry.className = 'archive-entry';
      const canvas = document.createElement('canvas');
      canvas.width = 90;
      canvas.height = 90;
      entry.appendChild(canvas);
      entry.addEventListener('click', () => openDetail(organism, index));
      grid.appendChild(entry);
      renderThumb(canvas, organism);
    });
  }

  return { refresh };
}
