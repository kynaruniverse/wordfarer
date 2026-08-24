/**
 * ui/mergeInteraction.ts
 * Touch-only drag-to-merge: drag one organism onto another to trigger
 * a merge. This is the entire input surface for MVP — organisms are
 * otherwise passive/ambient (no feeding, poking, etc.).
 */

import type { Habitat } from '../habitat/habitat';
import type { Archive } from '../archive/archive';
import type { Organism } from '../core/organism';
import { merge } from '../core/organism';
import { screenToCanvas } from './canvasCoords';
import { findOrganismAt, type DragOverlayState } from './habitatView';
import { showReveal } from './revealSequence';

export interface MergeInteractionCallbacks {
  onArchiveUpdated?: () => void;
  onOrganismSelected?: (organism: Organism) => void;
}

interface DragState {
  draggedId: string;
  targetId: string | null;
}

export function setupMergeInteraction(
  canvas: HTMLCanvasElement,
  habitat: Habitat,
  archive: Archive,
  callbacks: MergeInteractionCallbacks = {},
): () => DragOverlayState | null {
  let drag: DragState | null = null;
  let mergeInFlight = false;

  function findTargetExcluding(x: number, y: number, excludeId: string): string | null {
    // findOrganismAt already returns the closest hit; re-derive excluding
    // the dragged organism by checking every candidate manually would
    // duplicate logic, so filter the habitat directly here instead.
    let bestId: string | null = null;
    let bestDist = Infinity;
    for (const entry of habitat.entries()) {
      if (entry.organism.id === excludeId) continue;
      const dx = entry.runtime.x - x;
      const dy = entry.runtime.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = entry.organism.id;
      }
    }
    // Reuse the real hit-test radius by checking membership via findOrganismAt
    // at the target's own centre would be redundant; a fixed generous
    // drop radius is used instead since the target is stationary while
    // dragging the source organism onto it.
    if (bestId === null || bestDist > 70) return null;
    return bestId;
  }

  async function completeMerge(draggedId: string, targetId: string): Promise<void> {
    const a = habitat.get(draggedId);
    const b = habitat.get(targetId);
    if (!a || !b) return;

    mergeInFlight = true;
    const nonce = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const child = merge(a.organism, b.organism, nonce);
    archive.record(child);
    callbacks.onArchiveUpdated?.();
    callbacks.onOrganismSelected?.(child);

    await showReveal(child);

    if (!habitat.isFull()) {
      const spawnX = (a.runtime.x + b.runtime.x) / 2;
      const spawnY = (a.runtime.y + b.runtime.y) / 2;
      habitat.add(child, { x: spawnX, y: spawnY });
    }
    mergeInFlight = false;
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (mergeInFlight) return;
    const { x, y } = screenToCanvas(canvas, e.clientX, e.clientY);
    const hitId = findOrganismAt(habitat, x, y);
    if (!hitId) return;
    drag = { draggedId: hitId, targetId: null };
    canvas.setPointerCapture(e.pointerId);
    const entry = habitat.get(hitId);
    if (entry) callbacks.onOrganismSelected?.(entry.organism);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drag || mergeInFlight) return;
    const { x, y } = screenToCanvas(canvas, e.clientX, e.clientY);
    const entry = habitat.get(drag.draggedId);
    if (!entry) return;
    entry.runtime.x = x;
    entry.runtime.y = y;
    drag.targetId = findTargetExcluding(x, y, drag.draggedId);
  });

  function endDrag(e: PointerEvent): void {
    if (!drag || mergeInFlight) {
      drag = null;
      return;
    }
    const { draggedId, targetId } = drag;
    drag = null;
    canvas.releasePointerCapture(e.pointerId);
    if (targetId) {
      void completeMerge(draggedId, targetId);
    }
  }

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  return function getDragOverlay(): DragOverlayState | null {
    if (!drag) return null;
    const draggedEntry = habitat.get(drag.draggedId);
    if (!draggedEntry) return null;
    const targetEntry = drag.targetId ? habitat.get(drag.targetId) : undefined;
    return {
      draggedId: drag.draggedId,
      targetId: drag.targetId,
      x: targetEntry ? targetEntry.runtime.x : draggedEntry.runtime.x,
      y: targetEntry ? targetEntry.runtime.y : draggedEntry.runtime.y,
    };
  };
}
