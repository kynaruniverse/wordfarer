/**
 * ui/revealSequence.ts
 * The moment-of-discovery overlay. Never states what changed or why —
 * the organism itself is the evidence; the player compares it against
 * their own prediction. Flavour text only hints at whether something
 * unusual happened, never labels genetics explicitly.
 */

import type { Organism } from '../core/organism';
import { createRuntimeState } from '../core/organism';
import { drawOrganism } from '../render/shapes';
import { REVEAL_SEQUENCE_MS } from '../config';

const overlay = document.getElementById('reveal-overlay') as HTMLDivElement;
const canvas = document.getElementById('reveal-canvas') as HTMLCanvasElement;
const caption = document.getElementById('reveal-caption') as HTMLDivElement;
const ctx = canvas.getContext('2d');

function fadeTransitionMs(): number {
  return 200;
}

export function showReveal(organism: Organism, durationMs: number = REVEAL_SEQUENCE_MS): Promise<void> {
  return new Promise((resolve) => {
    if (!ctx) {
      resolve();
      return;
    }

    caption.textContent = organism.wasDramaticMutation
      ? 'Something unexpected happened.'
      : 'A new organism.';

    const runtime = createRuntimeState(canvas.width / 2, canvas.height / 2);
    overlay.classList.remove('hidden');
    // Force a reflow so the opacity transition actually plays.
    void overlay.offsetHeight;
    overlay.classList.add('visible');

    const start = performance.now();
    let rafId: number;

    function paint(now: number): void {
      const elapsed = now - start;
      runtime.phase = elapsed / 250;
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      drawOrganism(ctx!, organism.genome, runtime);

      if (elapsed < durationMs) {
        rafId = requestAnimationFrame(paint);
      } else {
        overlay.classList.remove('visible');
        setTimeout(() => {
          overlay.classList.add('hidden');
          resolve();
        }, fadeTransitionMs());
      }
    }
    rafId = requestAnimationFrame(paint);

    // Safety: if the tab is backgrounded during a reveal, still resolve
    // eventually rather than blocking merges forever.
    void rafId;
  });
}
