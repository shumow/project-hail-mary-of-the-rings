// town.js — View One: the flat town.
// A kid who missed the bus walks to school, bent off course by distractions.

import { world } from "./world.js";

export function drawTown(ctx) {
  const c = world.cell;
  const W = world.cols * c;
  const H = world.rows * c;

  // grass blocks
  ctx.fillStyle = "#3a5f3a";
  ctx.fillRect(0, 0, W, H);

  // streets
  ctx.strokeStyle = "#999";
  ctx.lineWidth = c * 0.4;
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

  // distractions
  for (const a of world.attractors) {
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(a.x * c, a.y * c, c * 0.35, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "12px sans-serif";
    ctx.fillText(a.name, a.x * c + c * 0.4, a.y * c);
  }

  // school
  ctx.fillStyle = "gold";
  ctx.fillRect(
    world.goal.x * c - c * 0.3,
    world.goal.y * c - c * 0.3,
    c * 0.6,
    c * 0.6,
  );

  // the kid
  ctx.fillStyle = "deepskyblue";
  ctx.beginPath();
  ctx.arc(world.pos.x * c, world.pos.y * c, c * 0.2, 0, 2 * Math.PI);
  ctx.fill();
}
