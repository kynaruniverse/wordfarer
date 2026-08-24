import { Genome } from '../core/genome';

const BASE_UNIT = 60; // px, scales all organism dimensions before genome.scale is applied

function genomeColor(genome: Genome): string {
  return `hsl(${genome.hue.toFixed(0)}, ${(genome.saturation * 100).toFixed(0)}%, 55%)`;
}

export function drawQuadruped(ctx: CanvasRenderingContext2D, genome: Genome, x: number, y: number) {
  const s = genome.scale;
  const bodyW = genome.bodyWidth * BASE_UNIT * s;
  const bodyL = genome.bodyLength * BASE_UNIT * s;
  const limbLen = genome.limbLength * BASE_UNIT * s;
  const color = genomeColor(genome);

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, bodyW * 0.15);

  // Four limbs, mirrored front/back and left/right — symmetry pulls the
  // right-side limbs toward matching the left-side ones exactly.
  const limbOffsetsX = [-bodyL * 0.35, bodyL * 0.35]; // front, back
  for (const ox of limbOffsetsX) {
    const leftAngle = Math.PI / 2 + 0.3;
    const rightAngleBase = Math.PI / 2 - 0.3;
    const rightAngle = rightAngleBase * genome.symmetry + leftAngle * (1 - genome.symmetry);

    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox - Math.cos(leftAngle) * limbLen, Math.sin(leftAngle) * limbLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox + Math.cos(rightAngle) * limbLen, Math.sin(rightAngle) * limbLen);
    ctx.stroke();
  }

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyL / 2, bodyW / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawSerpent(ctx: CanvasRenderingContext2D, genome: Genome, x: number, y: number) {
  const s = genome.scale;
  const segCount = genome.segments;
  const totalLength = genome.bodyLength * BASE_UNIT * 3 * s;
  const segSpacing = totalLength / segCount;
  const radius = genome.bodyWidth * BASE_UNIT * 0.5 * s;
  const color = genomeColor(genome);

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;

  for (let i = 0; i < segCount; i++) {
    // Static sine curve for now — this becomes a time-driven wave in the
    // animation milestone. Symmetry controls how tightly it curls.
    const t = i / (segCount - 1);
    const curveAmplitude = (1 - genome.symmetry) * 40 + 10;
    const sx = -totalLength / 2 + i * segSpacing;
    const sy = Math.sin(t * Math.PI * 2) * curveAmplitude;
    const segRadius = radius * (1 - t * 0.4); // tapers toward the tail

    ctx.beginPath();
    ctx.arc(sx, sy, segRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawOrganism(ctx: CanvasRenderingContext2D, genome: Genome, x: number, y: number) {
  if (genome.bodyPlan === 'quadruped') {
    drawQuadruped(ctx, genome, x, y);
  } else if (genome.bodyPlan === 'serpent') {
    drawSerpent(ctx, genome, x, y);
  }
}