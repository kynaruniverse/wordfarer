import { CONFIG } from './config';

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
  requestAnimationFrame(() => render(ctx));
}

const ctx = initCanvas();
render(ctx);