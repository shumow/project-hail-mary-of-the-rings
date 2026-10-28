// spacetime.js — View Two: the rubber sheet.
// The same model drawn as a 2D space-time whose grid dents around the wells.
// Hand-projected wireframe height field (no three.js) — the sheet height at a
// point is the Newtonian potential from world.js.

import { world, potential } from "./world.js";

// crude isometric-ish projection: tilt the grid back and push height up.
function project(gx, gy, h, W, H) {
  const c = world.cell;
  const tilt = 0.5; // how much the far edge recedes
  const heightScale = 6.0; // how deep the dents look
  const px = gx * c;
  const py = gy * c * tilt + (world.rows * c) * (1 - tilt) * 0.3;
  return { x: px, y: py - h * heightScale };
}

export function drawSpacetime(ctx) {
  const W = world.cols * world.cell;
  const H = world.rows * world.cell;

  ctx.fillStyle = "#05060f";
  ctx.fillRect(0, 0, W, H);

  const res = 0.5; // sampling resolution in cell units
  ctx.strokeStyle = "rgba(90,130,200,0.55)";
  ctx.lineWidth = 1;

  // lines of constant y (running in x)
  for (let gy = 0; gy <= world.rows; gy += res) {
    ctx.beginPath();
    let first = true;
    for (let gx = 0; gx <= world.cols; gx += res) {
      const h = potential(gx, gy);
      const p = project(gx, gy, h, W, H);
      if (first) {
        ctx.moveTo(p.x, p.y);
        first = false;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
  }

  // lines of constant x (running in y)
  for (let gx = 0; gx <= world.cols; gx += res) {
    ctx.beginPath();
    let first = true;
    for (let gy = 0; gy <= world.rows; gy += res) {
      const h = potential(gx, gy);
      const p = project(gx, gy, h, W, H);
      if (first) {
        ctx.moveTo(p.x, p.y);
        first = false;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
  }

  // the ship, riding the sheet
  const h = potential(world.pos.x, world.pos.y);
  const p = project(world.pos.x, world.pos.y, h, W, H);
  ctx.fillStyle = "#ffd36b";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
  ctx.fill();

  // goal marker on the sheet
  const gh = potential(world.goal.x, world.goal.y);
  const gp = project(world.goal.x, world.goal.y, gh, W, H);
  ctx.strokeStyle = "#ffd36b";
  ctx.lineWidth = 2;
  ctx.strokeRect(gp.x - 4, gp.y - 4, 8, 8);
}
