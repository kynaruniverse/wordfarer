/**
 * ui/habitatView.ts
 * Owns the habitat canvas: sizing/resize, the render loop, and organism
 * hit-testing. mergeInteraction.ts uses findOrganismAt() and the drag
 * overlay hook rather than touching the canvas or Habitat directly.
 */

import type { Habitat } from '../habitat/habitat';
import { tick } from '../habitat/simulation';
import { drawFrame } from '../render/renderer';
import { organismHitRadius } from '../render/shapes';
import { HABITAT_BOUNDS } from '../config';

export interface DragOverlayState {
  draggedId: string;
  targetId: string | null;
  x: number;
  y: number;
}

export type DragOverlayProvider = () => DragOverlayState | null;

export function initHabitatCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  function resize(): void {
    const scale = Math.min(
      window.innerWidth / HABITAT_BOUNDS.width,
      window.innerHeight / HABITAT_BOUNDS.height,
    );
    canvas.width = HABITAT_BOUNDS.width;
    canvas.height = HABITAT_BOUNDS.height;
    canvas.style.width = `${HABITAT_BOUNDS.width * scale}px`;
    canvas.style.height = `${HABITAT_BOUNDS.height * scale}px`;
  }
  resize();
  window.addEventListener('resize', resize);

  return ctx;
}

function drawDragOverlay(ctx: CanvasRenderingContext2D, overlay: DragOverlayState): void {
  // Valid-target feedback must not rely on colour alone — a dashed
  // pulsing ring plus a shape change reads clearly regardless of the
  // target organism's own genetic hue.
  if (!overlay.targetId) return;
  const pulse = 4 + Math.sin(performance.now() / 120) * 2;
  ctx.save();
  ctx.setLineDash([6, 5]);
  ctx.lineWidth = 3 + pulse * 0.3;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(overlay.x, overlay.y, 46 + pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function startRenderLoop(
  ctx: CanvasRenderingContext2D,
  habitat: Habitat,
  getDragOverlay: DragOverlayProvider,
): void {
  let lastTime = performance.now();
  function frame(now: number): void {
    const dtSeconds = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    tick(habitat, dtSeconds);
    drawFrame(ctx, habitat);

    const overlay = getDragOverlay();
    if (overlay) drawDragOverlay(ctx, overlay);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/** Finds the organism whose hit-radius contains the given canvas-space
 *  point, preferring the closest centre if radii overlap. */
export function findOrganismAt(habitat: Habitat, x: number, y: number): string | null {
  let bestId: string | null = null;
  let bestDist = Infinity;
  for (const entry of habitat.entries()) {
    const radius = organismHitRadius(entry.organism.genome);
    const dx = entry.runtime.x - x;
    const dy = entry.runtime.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= radius && dist < bestDist) {
      bestDist = dist;
      bestId = entry.organism.id;
    }
  }
  return bestId;
}
