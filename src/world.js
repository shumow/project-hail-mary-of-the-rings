// world.js — the shared model
//
// This is the whole game. Every view (town, space-time, the hidden third
// frame) is a read-only consumer of this single object. Player input is
// identical across all views — you are always steering the same particle.

export const world = {
  cols: 12,
  rows: 12,
  cell: 40, // pixels per grid cell
  pos: { x: 1.5, y: 1.5 }, // kid / ship / dot, in cell units
  vel: { x: 0, y: 0 },
  goal: { x: 10.5, y: 10.5 }, // school / destination
  attractors: [
    // distractions = gravity wells. `soft` keeps the inverse-square from
    // blowing up at the center; it also sets how deep the no-escape zone is.
    { x: 4, y: 3, strength: 6.0, soft: 0.6, name: "fruit tree" },
    { x: 7, y: 8, strength: 10.0, soft: 0.7, name: "energy drinks" },
    { x: 5, y: 9, strength: 4.0, soft: 0.5, name: '"big groovy butts"' },
  ],
};

// Player dynamics: constant (linear) acceleration up to a hard speed cap.
export const player = {
  accel: 4.0, // cells/s^2, constant — he "gets trucking"
  maxSpeed: 5.0, // cells/s, hard cap
  drag: 0.6, // per-second coasting decay
};

// Softened inverse-square pull from every attractor.
// Quadratic falloff (1/r^2) even though we're in 2D — it's a game, and it
// gives us a real capture radius instead of a pull you can always beat.
export function gravity(x, y) {
  let fx = 0,
    fy = 0;
  for (const a of world.attractors) {
    const dx = a.x - x,
      dy = a.y - y;
    const r2 = dx * dx + dy * dy + a.soft * a.soft; // softened
    const r = Math.sqrt(r2);
    const f = a.strength / r2; // inverse-square magnitude
    fx += (f * dx) / r;
    fy += (f * dy) / r;
  }
  return { x: fx, y: fy };
}

// Radius inside which a well's pull beats the kid's max acceleration.
// Inside this, there is no escape — an event horizon for distraction.
// Outside it, your speed decides whether you slingshot past or get caught.
export function captureRadius(a) {
  const r2 = a.strength / player.accel - a.soft * a.soft;
  return r2 > 0 ? Math.sqrt(r2) : 0;
}

// One simulation step. `input` is a direction vector (not necessarily unit);
// it's normalized so diagonals aren't faster. dt in seconds.
export function tick(input, dt) {
  const len = Math.hypot(input.x, input.y) || 1;
  const g = gravity(world.pos.x, world.pos.y);

  // intentional input (constant accel) + field pull
  world.vel.x += ((input.x / len) * player.accel + g.x) * dt;
  world.vel.y += ((input.y / len) * player.accel + g.y) * dt;

  // coasting drag — frame-rate independent, lets wells grab you when idle
  const k = Math.exp(-player.drag * dt);
  world.vel.x *= k;
  world.vel.y *= k;

  // clamp to top speed
  const s = Math.hypot(world.vel.x, world.vel.y);
  if (s > player.maxSpeed) {
    world.vel.x *= player.maxSpeed / s;
    world.vel.y *= player.maxSpeed / s;
  }

  world.pos.x += world.vel.x * dt;
  world.pos.y += world.vel.y * dt;

  // keep inside the grid (soft walls)
  world.pos.x = Math.max(0.2, Math.min(world.cols - 0.2, world.pos.x));
  world.pos.y = Math.max(0.2, Math.min(world.rows - 0.2, world.pos.y));
}

// Scalar potential, for the height-field (space-time) view. The height of the
// rubber sheet at a point is just the (negative) Newtonian potential summed
// over wells. Deeper = more negative.
export function potential(x, y) {
  let p = 0;
  for (const a of world.attractors) {
    const dx = x - a.x,
      dy = y - a.y;
    const r = Math.sqrt(dx * dx + dy * dy + a.soft * a.soft);
    p -= a.strength / r;
  }
  return p;
}
