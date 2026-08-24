import { CONFIG } from './config';
import { generateGenome } from './core/genome';
import { drawOrganism } from './render/shapes';

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

function render(ctx: CanvasRenderingContext2D) {
  const { innerWidth: w, innerHeight: h } = window;
  ctx.fillStyle = CONFIG.habitatBackground;
  ctx.fillRect(0, 0, w, h);

  // Temporary proof: draw one static organism per body plan, side by side.
  // This block gets replaced by the habitat milestone (multiple organisms,
  // positioned and moving within bounds).
  const quad = generateGenome('quadruped');
  const serp = generateGenome('serpent');

  drawOrganism(ctx, quad, w * 0.3, h * 0.5);
  drawOrganism(ctx, serp, w * 0.7, h * 0.5);

  ctx.fillStyle = '#dfffe8';
  ctx.font = '12px monospace';
  ctx.fillText('quadruped', w * 0.3 - 35, h * 0.5 + 80);
  ctx.fillText('serpent', w * 0.7 - 25, h * 0.5 + 60);
}

const ctx = initCanvas();
render(ctx);