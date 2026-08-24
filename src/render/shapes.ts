/**
 * render/shapes.ts
 * Pure geometry generation from a genome + animation phase. Depends on
 * Canvas only for the drawing calls themselves — no state lives here.
 */

import type { Genome } from '../core/genome';
import { BODY_PLANS, mapRange } from '../core/bodyPlans';
import type { OrganismRuntimeState } from '../core/organism';
import { MIN_HIT_RADIUS } from '../config';

/** Touch/drag hit-radius for an organism — never smaller than
 *  MIN_HIT_RADIUS regardless of rendered size, so tiny procedural
 *  creatures stay reliably draggable. */
export function organismHitRadius(genome: Genome): number {
  const def = BODY_PLANS[genome.bodyPlan];
  const renderedSize = mapRange(genome.traits.size, def.ranges.size);
  return Math.max(MIN_HIT_RADIUS, renderedSize * 0.75);
}

export interface RenderColor {
  hue: number; // 0-360
  saturation: number; // 0-100
  lightness: number; // 0-100
}

export function genomeColor(genome: Genome): RenderColor {
  return {
    hue: genome.traits.hue * 360,
    saturation: 40 + genome.traits.saturation * 55, // keep it visibly saturated, never grey
    lightness: 45 + genome.traits.brightness * 25,
  };
}

function colorToCss({ hue, saturation, lightness }: RenderColor, alpha = 1): string {
  return `hsla(${hue.toFixed(1)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%, ${alpha})`;
}

export function drawQuadruped(
  ctx: CanvasRenderingContext2D,
  genome: Genome,
  runtime: OrganismRuntimeState,
): void {
  const def = BODY_PLANS.quadruped;
  const size = mapRange(genome.traits.size, def.ranges.size);
  const limbLength = mapRange(genome.traits.limbLength, def.ranges.limbLength);
  const color = genomeColor(genome);

  ctx.save();
  ctx.translate(runtime.x, runtime.y);
  ctx.rotate(runtime.heading);

  // legs — alternating gait pairs driven by phase
  ctx.strokeStyle = colorToCss(color, 0.9);
  ctx.lineWidth = Math.max(2, size * 0.08);
  const legOffsets = [-1, 1];
  for (const side of legOffsets) {
    for (const pairPhaseOffset of [0, Math.PI]) {
      const swing = Math.sin(runtime.phase * 6 + pairPhaseOffset) * limbLength * 0.4;
      const baseX = side * size * 0.35;
      ctx.beginPath();
      ctx.moveTo(baseX, size * 0.2);
      ctx.lineTo(baseX + swing * 0.3, size * 0.2 + limbLength);
      ctx.stroke();
    }
  }

  // body — soft bioluminescent ellipse
  const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, size);
  gradient.addColorStop(0, colorToCss(color, 0.95));
  gradient.addColorStop(1, colorToCss({ ...color, lightness: color.lightness * 0.6 }, 0.85));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawSerpent(
  ctx: CanvasRenderingContext2D,
  genome: Genome,
  runtime: OrganismRuntimeState,
): void {
  const def = BODY_PLANS.serpent;
  const size = mapRange(genome.traits.size, def.ranges.size);
  const segmentCount = Math.round(mapRange(genome.traits.segmentCount, def.ranges.segmentCount));
  const color = genomeColor(genome);

  ctx.save();
  ctx.translate(runtime.x, runtime.y);
  ctx.rotate(runtime.heading);

  const segmentSpacing = size * 0.55;
  ctx.fillStyle = colorToCss(color, 0.9);
  for (let i = 0; i < segmentCount; i++) {
    const along = -i * segmentSpacing;
    const wave = Math.sin(runtime.phase * 4 - i * 0.6) * size * 0.35;
    const radius = size * 0.28 * (1 - (i / segmentCount) * 0.55);
    ctx.beginPath();
    ctx.arc(along, wave, Math.max(1.5, radius), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawOrganism(
  ctx: CanvasRenderingContext2D,
  genome: Genome,
  runtime: OrganismRuntimeState,
): void {
  if (genome.bodyPlan === 'quadruped') {
    drawQuadruped(ctx, genome, runtime);
  } else {
    drawSerpent(ctx, genome, runtime);
  }
}
