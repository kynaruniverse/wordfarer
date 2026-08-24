import { CONFIG } from './config';
import { createInitialOrganisms, updateHabitat, HabitatBounds } from './habitat/habitat';
import { drawOrganism } from './render/shapes';
import { Organism } from './core/organism';

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

let organisms: Organism[] = [];
let bounds: HabitatBounds;
let lastTime = 0;

function setupHabitat() {
  bounds = { width: window.innerWidth, height: window.innerHeight, padding: 60 };
  organisms = createInitialOrganisms(3, bounds);

  window.addEventListener('resize', () => {
    bounds.width = window.innerWidth;
    bounds.height = window.innerHeight;
  });
}

function loop(ctx: CanvasRenderingContext2D, timestampMs: number) {
  const t = timestampMs / 1000;
  const dt = lastTime ? t - lastTime : 0;
  lastTime = t;

  updateHabitat(organisms, dt, bounds);

  ctx.fillStyle = CONFIG.habitatBackground;
  ctx.fillRect(0, 0, bounds.width, bounds.height);

  for (const org of organisms) {
    drawOrganism(ctx, org.genome, org.x, org.y, org.heading, t);
  }

  requestAnimationFrame((ts) => loop(ctx, ts));
}

const ctx = initCanvas();
setupHabitat();
requestAnimationFrame((ts) => loop(ctx, ts));