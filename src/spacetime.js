// spacetime.js — View Two: a true 3D rubber sheet, drag to rotate.
// The same model as a real 3D surface with perspective: wells dip as actual
// funnels. Click-drag to spin, scroll to zoom. The ship rides the surface.

import { world, potential, routes, routeDistance } from "./world.js";

const cam = { yaw: 0.6, pitch: 0.9, dist: 22, focal: 520, depth: 0.35 };
let wired = false;

function wireMouse(canvas) {
  let dragging = false,
    lx = 0,
    ly = 0;
  canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    lx = e.clientX;
    ly = e.clientY;
  });
  addEventListener("mouseup", () => (dragging = false));
  addEventListener("mousemove", (e) => {
    if (!dragging) return;
    cam.yaw += (e.clientX - lx) * 0.01;
    cam.pitch += (e.clientY - ly) * 0.01;
    cam.pitch = Math.max(0.1, Math.min(1.5, cam.pitch)); // don't flip under
    lx = e.clientX;
    ly = e.clientY;
  });
  canvas.addEventListener(
    "wheel",
    (e) => {
      // scroll to zoom
      e.preventDefault();
      cam.dist = Math.max(8, Math.min(60, cam.dist + e.deltaY * 0.02));
    },
    { passive: false },
  );
}

// sheet height: potential, clamped so the wells don't spike to infinity
function height(gx, gy) {
  return Math.max(-12, potential(gx, gy)) * cam.depth;
}

// grid coords -> rotated 3D -> perspective screen point
function project(gx, gy, h, W, H) {
  let x = gx - world.cols / 2,
    z = gy - world.rows / 2,
    y = h;
  const cy = Math.cos(cam.yaw),
    sy = Math.sin(cam.yaw);
  [x, z] = [x * cy - z * sy, x * sy + z * cy]; // yaw about vertical
  const cp = Math.cos(cam.pitch),
    sp = Math.sin(cam.pitch);
  [y, z] = [y * cp - z * sp, y * sp + z * cp]; // pitch about horizontal
  const d = z + cam.dist;
  return { x: W / 2 + (cam.focal * x) / d, y: H / 2 - (cam.focal * y) / d, d };
}

export function drawSpacetime(ctx) {
  const W = ctx.canvas.width,
    H = ctx.canvas.height;
  if (!wired) {
    wireMouse(ctx.canvas);
    wired = true;
  }

  ctx.fillStyle = "#05060f";
  ctx.fillRect(0, 0, W, H);

  const res = 0.25;
  ctx.lineWidth = 1;
  const line = (pts) => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  };

  for (let pass = 0; pass < 2; pass++) {
    for (let a = 0; a <= (pass ? world.cols : world.rows); a += 1) {
      const pts = [];
      for (let b = 0; b <= (pass ? world.rows : world.cols); b += res) {
        const gx = pass ? a : b,
          gy = pass ? b : a;
        pts.push(project(gx, gy, height(gx, gy), W, H));
      }
      ctx.strokeStyle = "rgba(90,140,220,0.6)";
      line(pts);
    }
  }

  // wells: a faint marker at the bottom of each dent
  for (const at of world.attractors) {
    const p = project(at.x, at.y, height(at.x, at.y), W, H);
    ctx.fillStyle = "rgba(220,90,90,0.8)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }

  // hyperspace routes, glowing on the sheet
  const off = routeDistance(world.pos.x, world.pos.y);
  for (const r of routes) {
    const pts = r.map((q) => project(q.x, q.y, height(q.x, q.y) + 0.02, W, H));
    ctx.strokeStyle = "rgba(120,255,200,0.25)";
    ctx.lineWidth = 6;
    line(pts);
    ctx.strokeStyle = "rgba(160,255,220,0.9)";
    ctx.lineWidth = 1.5;
    line(pts);
  }
  ctx.fillStyle = off < 0.3 ? "#7dffc8" : "#ff8a7a"; // on route or not
  ctx.font = "12px sans-serif";
  ctx.fillText(off < 0.3 ? "ON ROUTE" : `off route ${off.toFixed(2)}`, 10, 18);

  // goal and ship, sitting on the surface
  const g = project(
    world.goal.x,
    world.goal.y,
    height(world.goal.x, world.goal.y),
    W,
    H,
  );
  ctx.strokeStyle = "#ffd36b";
  ctx.lineWidth = 2;
  ctx.strokeRect(g.x - 5, g.y - 5, 10, 10);

  const s = project(
    world.pos.x,
    world.pos.y,
    height(world.pos.x, world.pos.y),
    W,
    H,
  );
  ctx.fillStyle = "#ffd36b";
  ctx.beginPath();
  ctx.arc(s.x, s.y, Math.max(3, 140 / s.d), 0, 2 * Math.PI);
  ctx.fill();
}
