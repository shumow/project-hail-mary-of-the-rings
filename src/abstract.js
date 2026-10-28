// abstract.js — View Three: the Easter egg.
// The game confessing what it actually is: just the graph, the raw force
// field, and a dot. Toggle with the `~` key (see main.js).

import { world, gravity, captureRadius } from "./world.js";

export function drawAbstract(ctx) {
  const c = world.cell;
  const W = world.cols * c;
  const H = world.rows * c;

  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(0, 0, W, H);

  // faint lattice
  ctx.strokeStyle = "#1e1e2e";
  ctx.lineWidth = 1;
  for (let i = 0; i <= world.cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * c, 0);
    ctx.lineTo(i * c, H);
    ctx.stroke();
  }
  for (let j = 0; j <= world.rows; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * c);
    ctx.lineTo(W, j * c);
    ctx.stroke();
  }

  // force field: sample the gradient on a coarse grid, draw little arrows
  const step = 0.5;
  ctx.strokeStyle = "#3b6ea5";
  ctx.lineWidth = 1;
  for (let gx = step; gx < world.cols; gx += step) {
    for (let gy = step; gy < world.rows; gy += step) {
      const f = gravity(gx, gy);
      const m = Math.hypot(f.x, f.y) || 1;
      const scale = Math.min(0.45, 0.12 * Math.log1p(m)); // tame long arrows
      const x0 = gx * c,
        y0 = gy * c;
      const x1 = x0 + (f.x / m) * scale * c * 2;
      const y1 = y0 + (f.y / m) * scale * c * 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }

  // capture radii — the no-escape zones
  ctx.strokeStyle = "rgba(220,80,80,0.6)";
  ctx.lineWidth = 1.5;
  for (const a of world.attractors) {
    const r = captureRadius(a);
    if (r > 0) {
      ctx.beginPath();
      ctx.arc(a.x * c, a.y * c, r * c, 0, 2 * Math.PI);
      ctx.stroke();
    }
    // the attractor itself
    ctx.fillStyle = "#d85050";
    ctx.beginPath();
    ctx.arc(a.x * c, a.y * c, 3, 0, 2 * Math.PI);
    ctx.fill();
  }

  // the dot — all three views are this same point
  ctx.fillStyle = "#e8e8f0";
  ctx.beginPath();
  ctx.arc(world.pos.x * c, world.pos.y * c, c * 0.18, 0, 2 * Math.PI);
  ctx.fill();
}
