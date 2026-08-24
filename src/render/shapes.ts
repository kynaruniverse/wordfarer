import { Genome } from '../core/genome';

const BASE_UNIT = 60;

function genomeColor(genome: Genome): string {
  return `hsl(${genome.hue.toFixed(0)}, ${(genome.saturation * 100).toFixed(0)}%, 55%)`;
}

export function drawQuadruped(
  ctx: CanvasRenderingContext2D,
  genome: Genome,
  x: number,
  y: number,
  heading: number,
  t: number
) {
  const s = genome.scale;
  const bodyW = genome.bodyWidth * BASE_UNIT * s;
  const bodyL = genome.bodyLength * BASE_UNIT * s;
  const limbLen = genome.limbLength * BASE_UNIT * s;
  const color = genomeColor(genome);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, bodyW * 0.15);

  // Faster genomes step quicker; front/back limb pairs swing in opposition
  // to approximate a diagonal walking gait.
  const gaitFreq = genome.speed * 8 + 2;
  const swing = Math.sin(t * gaitFreq) * 0.5;

  const limbOffsetsX = [-bodyL * 0.35, bodyL * 0.35];
  limbOffsetsX.forEach((ox, pairIndex) => {
    const pairPhase = pairIndex === 0 ? swing : -swing;
    const leftAngle = Math.PI / 2 + 0.3 + pairPhase;
    const rightAngleBase = Math.PI / 2 - 0.3 - pairPhase;
    const rightAngle = rightAngleBase * genome.symmetry + leftAngle * (1 - genome.symmetry);

    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox - Math.cos(leftAngle) * limbLen, Math.sin(leftAngle) * limbLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox + Math.cos(rightAngle) * limbLen, Math.sin(rightAngle) * limbLen);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.ellipse(0, 0, bodyL / 2, bodyW / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawSerpent(
  ctx: CanvasRenderingContext2D,
  genome: Genome,
  x: number,
  y: number,
  heading: number,
  t: number
) {
  const s = genome.scale;
  const segCount = genome.segments;
  const totalLength = genome.bodyLength * BASE_UNIT * 3 * s;
  const segSpacing = totalLength / segCount;
  const radius = genome.bodyWidth * BASE_UNIT * 0.5 * s;
  const color = genomeColor(genome);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.fillStyle = color;

  const waveFreq = genome.speed * 4 + 1;
  const curveAmplitude = (1 - genome.symmetry) * 40 + 10;

  for (let i = 0; i < segCount; i++) {
    const sx = -totalLength / 2 + i * segSpacing;
    // Traveling wave: phase shifts along the body AND over time -> undulation
    const sy = Math.sin(t * waveFreq - i * 0.8) * curveAmplitude;
    const segRadius = radius * (1 - (i / (segCount - 1)) * 0.4);

    ctx.beginPath();
    ctx.arc(sx, sy, segRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawOrganism(
  ctx: CanvasRenderingContext2D,
  genome: Genome,
  x: number,
  y: number,
  heading: number,
  t: number
) {
  if (genome.bodyPlan === 'quadruped') {
    drawQuadruped(ctx, genome, x, y, heading, t);
  } else if (genome.bodyPlan === 'serpent') {
    drawSerpent(ctx, genome, x, y, heading, t);
  }
}