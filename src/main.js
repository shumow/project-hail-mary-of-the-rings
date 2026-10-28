// main.js — input + the loop. Wires the shared model to the three views.

import { tick } from "./world.js";
import { drawTown } from "./town.js";
import { drawSpacetime } from "./spacetime.js";
import { drawAbstract } from "./abstract.js";

const keys = {};
addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === "`" || e.key === "~") {
    // toggle the Easter-egg third frame
    const egg = document.getElementById("egg-wrap");
    egg.style.display = egg.style.display === "none" ? "block" : "none";
  }
});
addEventListener("keyup", (e) => (keys[e.key] = false));

const townCtx = document.getElementById("town").getContext("2d");
const stCtx = document.getElementById("spacetime").getContext("2d");
const eggCtx = document.getElementById("egg").getContext("2d");

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  const input = {
    x: (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0),
    y: (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0),
  };
  tick(input, dt);

  drawTown(townCtx);
  drawSpacetime(stCtx);
  if (document.getElementById("egg-wrap").style.display !== "none") {
    drawAbstract(eggCtx);
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
