/**
 * ui/debugPanel.ts
 * Shows raw genome values for development/balancing only. Never shipped —
 * main.ts only imports this module via a dynamic import gated on
 * import.meta.env.DEV, so Vite's production define + dead-code
 * elimination drops it from the shipped bundle entirely.
 */

import type { Organism } from '../core/organism';

const panel = document.getElementById('debug-panel') as HTMLDivElement;

export function setupDebugPanel(): { show: (organism: Organism) => void; hide: () => void } {
  panel.classList.remove('hidden');

  function show(organism: Organism): void {
    const lines = [
      `id: ${organism.id}`,
      `seed: ${organism.seed}`,
      `bodyPlan: ${organism.genome.bodyPlan}`,
      `generation: ${organism.generation}`,
      `parents: ${organism.parentIds?.join(', ') ?? 'none (starting roster)'}`,
      `dramaticMutation: ${organism.wasDramaticMutation}`,
      '--- traits (0..1) ---',
      ...Object.entries(organism.genome.traits).map(([k, v]) => `${k}: ${v.toFixed(4)}`),
    ];
    panel.textContent = lines.join('\n');
  }

  function hide(): void {
    panel.classList.add('hidden');
  }

  return { show, hide };
}
