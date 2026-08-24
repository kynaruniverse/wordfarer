import { CONFIG } from './config';
import { generateGenome } from './core/genome';

function initCanvas(): CanvasRenderingContext2D {
  const canvas = document.getElementById('habitat') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  function resize() {
    const ratio = CONFIG.canvasPixelRatio;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  return ctx;
}

function drawGenomeDebug(ctx: CanvasRenderingContext2D, label: string, genome: object, y: number) {
  ctx.fillStyle = '#dfffe8';
  ctx.font = '14px monospace';
  ctx.fillText(label, 16, y);
  Object.entries(genome).forEach(([key, value], i) => {
    const displayValue = typeof value === 'number' ? value.toFixed(3) : String(value);
    ctx.fillText(`  ${key}: ${displayValue}`, 16, y + 18 * (i + 1));
  });
}

function render(ctx: CanvasRenderingContext2D) {
  const { innerWidth: w, innerHeight: h } = window;
  ctx.fillStyle = CONFIG.habitatBackground;
  ctx.fillRect(0, 0, w, h);

  // Temporary debug proof: generate one genome per body plan and print it.
  // This block gets removed once the renderer milestone draws real shapes.
  const quad = generateGenome('quadruped');
  const serp = generateGenome('serpent');
  drawGenomeDebug(ctx, 'QUADRUPED GENOME:', quad, 30);
  drawGenomeDebug(ctx, 'SERPENT GENOME:', serp, 260);

  // Determinism proof: regenerating with the SAME seed should match exactly.
  const repeat = generateGenome('quadruped', quad.seed);
  const matches = JSON.stringify(repeat) === JSON.stringify(quad);
  ctx.fillStyle = matches ? '#7CFC9A' : '#FF6B6B';
  ctx.fillText(`Same-seed regeneration matches: ${matches}`, 16, 490);
}

const ctx = initCanvas();
render(ctx);