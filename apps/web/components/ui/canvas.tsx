'use client';

/**
 * Estelas neón que siguen el cursor, dibujadas sobre un <canvas id="canvas">.
 *
 * Adaptado del componente original (aliimam/designali) a TypeScript limpio y a
 * este proyecto. La física de las estelas (resortes + amortiguación) es idéntica;
 * lo que cambié es el andamiaje para que funcione bien acá:
 *   - escala al tamaño del propio canvas (su contenedor), no a la ventana;
 *   - mapea el mouse relativo al canvas → respeta el navbar sticky y el scroll;
 *   - devuelve una función de limpieza (quita listeners y frena el requestAnimationFrame);
 *   - respeta `prefers-reduced-motion` (no anima si el usuario lo pidió).
 */

const CONFIG = {
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
};

interface Pos {
  x: number;
  y: number;
}

/** Oscilador senoidal: mueve el matiz (hue) del trazo con el tiempo. */
class Oscillator {
  private phase: number;
  private readonly offset: number;
  private readonly frequency: number;
  private readonly amplitude: number;

  constructor({ phase = 0, offset = 0, frequency = 0.001, amplitude = 1 } = {}) {
    this.phase = phase;
    this.offset = offset;
    this.frequency = frequency;
    this.amplitude = amplitude;
  }

  update() {
    this.phase += this.frequency;
    return this.offset + Math.sin(this.phase) * this.amplitude;
  }
}

class Node {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
}

/** Una estela: cadena de nodos unidos por resortes que persiguen al cursor. */
class Line {
  private readonly spring: number;
  private readonly friction: number;
  private readonly nodes: Node[] = [];

  constructor(spring: number, pos: Pos) {
    this.spring = spring + 0.1 * Math.random() - 0.05;
    this.friction = CONFIG.friction + 0.01 * Math.random() - 0.005;
    for (let i = 0; i < CONFIG.size; i++) {
      const node = new Node();
      node.x = pos.x;
      node.y = pos.y;
      this.nodes.push(node);
    }
  }

  update(pos: Pos) {
    let spring = this.spring;
    const head = this.nodes[0];
    head.vx += (pos.x - head.x) * spring;
    head.vy += (pos.y - head.y) * spring;

    for (let i = 0, len = this.nodes.length; i < len; i++) {
      const node = this.nodes[i];
      if (i > 0) {
        const prev = this.nodes[i - 1];
        node.vx += (prev.x - node.x) * spring;
        node.vy += (prev.y - node.y) * spring;
        node.vx += prev.vx * CONFIG.dampening;
        node.vy += prev.vy * CONFIG.dampening;
      }
      node.vx *= this.friction;
      node.vy *= this.friction;
      node.x += node.vx;
      node.y += node.vy;
      spring *= CONFIG.tension;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const first = this.nodes[0];
    let x = first.x;
    let y = first.y;
    ctx.beginPath();
    ctx.moveTo(x, y);

    let i = 1;
    const end = this.nodes.length - 2;
    for (; i < end; i++) {
      const node = this.nodes[i];
      const next = this.nodes[i + 1];
      x = 0.5 * (node.x + next.x);
      y = 0.5 * (node.y + next.y);
      ctx.quadraticCurveTo(node.x, node.y, x, y);
    }

    const node = this.nodes[i];
    const next = this.nodes[i + 1];
    if (node && next) {
      ctx.quadraticCurveTo(node.x, node.y, next.x, next.y);
    }
    ctx.stroke();
    ctx.closePath();
  }
}

/**
 * Arranca el efecto sobre `<canvas id="canvas">`. Devuelve una función de
 * limpieza que hay que llamar al desmontar (p.ej. en el `return` de un useEffect).
 */
export function renderCanvas(): () => void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return () => {};

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return () => {};
  }

  const pos: Pos = { x: 0, y: 0 };
  const oscillator = new Oscillator({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 85,
    frequency: 0.0015,
    offset: 285,
  });
  let lines: Line[] = [];
  let running = true;
  let frameId = 0;

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  const buildLines = () => {
    lines = [];
    for (let i = 0; i < CONFIG.trails; i++) {
      lines.push(new Line(0.45 + (i / CONFIG.trails) * 0.025, pos));
    }
  };

  const setPos = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    pos.x = clientX - rect.left;
    pos.y = clientY - rect.top;
  };

  const onMouseMove = (e: MouseEvent) => setPos(e.clientX, e.clientY);
  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) setPos(e.touches[0].clientX, e.touches[0].clientY);
  };

  const frame = () => {
    if (!running) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `hsla(${Math.round(oscillator.update())},100%,50%,0.025)`;
    ctx.lineWidth = 10;
    for (const line of lines) {
      line.update(pos);
      line.draw(ctx);
    }
    frameId = window.requestAnimationFrame(frame);
  };

  resize();
  pos.x = canvas.width / 2;
  pos.y = canvas.height / 2;
  buildLines();

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('resize', resize);
  frame();

  return () => {
    running = false;
    window.cancelAnimationFrame(frameId);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('resize', resize);
  };
}
