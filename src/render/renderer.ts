/**
 * render/renderer.ts
 * Draws one frame: clears the canvas, paints habitat background, draws
 * every active organism. Kept separate from simulation — this module
 * only reads state, never mutates it.
 */

import type { Habitat } from '../habitat/habitat';
import { drawOrganism } from './shapes';
import { HABITAT_BOUNDS } from '../config';

const BACKGROUND = '#0b1210';
const VIGNETTE_EDGE = '#050807';

export function drawFrame(ctx: CanvasRenderingContext2D, habitat: Habitat): void {
  const { width, height } = HABITAT_BOUNDS;

  ctx.clearRect(0, 0, width, height);
  const bg = ctx.createRadialGradient(
    width / 2, height / 2, height * 0.15,
    width / 2, height / 2, height * 0.75,
  );
  bg.addColorStop(0, BACKGROUND);
  bg.addColorStop(1, VIGNETTE_EDGE);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  for (const entry of habitat.entries()) {
    drawOrganism(ctx, entry.organism.genome, entry.runtime);
  }
}
