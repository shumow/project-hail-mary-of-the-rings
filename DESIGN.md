# Geodesics of Distraction — Design Notes

*A JavaScript maze game built around one mathematical idea seen from multiple points of view.*

---

## The core conceit

The game is a maze/navigation game built on a single mathematical object: a **potential field over a grid**. A moving point travels through that field, and its path is bent by "wells" in the field. The whole game is about the fact that **one underlying model can be rendered as two (or three) completely different-looking things** — and the player, upon discovering this, gets the "those were the same thing the whole time" realization.

Player input is **identical across every view**. You are always steering the same particle. Only the rendering differs.

---

## View One — The Town

- A grid of streets (a town).
- A kid missed the bus and is walking to school.
- Scattered through the town are **distractions**: a tree with fresh fruit, convenience stores with energy drinks, and so on. Graphics can be crude to start.
- Each distraction exerts a **pull**. It does not fully capture the kid — it *influences* his heading. It bends his path toward the object.
- If the kid is standing still, the pull alone starts nudging him drifting toward the nearest distraction. If he's already moving, it curves his trajectory.
- The goal is to reach school despite the bending.

## View Two — The 2D Space-Time Map

- The *same* model, rendered as a **2D space-time** with a grid that shows its **deformation** — the classic rubber-sheet picture. This will need a pseudo-3D / perspective rendering to show the dents.
- There are stars and **gravity wells** (the same objects that were distractions in the town).
- On top of the deformed sheet there are **hyperspace routes** — paths that get bent by the curvature. The goal here is to **trace / follow the routes**.
- Crucially, this view has **the same graph shape** as the town view. The deformation you see here is caused by the very same attention-grabbing objects from the town.

## View Three — The Easter Egg (hidden)

- A secret third frame the player can turn on.
- A **very abstract view of the whole thing**: just the shared model laid bare — the graph, the raw potential/force field (e.g. field arrows), and a dot.
- This is the game confessing what it actually is.

---

## The shared model (the thing to build first)

Everything hangs off one object. All views are read-only consumers of it.

- A **grid** of streets (cols × rows, some cell size).
- A **position** and **velocity** for the particle (kid / ship / dot), in cell units.
- A **goal** (school / destination).
- A list of **attractors** (distractions = gravity wells), each with a position, a **strength**, and a **radius**.

**Potential:** each attractor contributes a smooth (Gaussian) dip to a scalar potential field. Sum them to get the potential at any point.

**Force:** the force on the particle is the **negative gradient** of the potential, computed by finite differences.

**Tick (one simulation step):** player input nudges the velocity, the field's force bends it, friction settles it, then position integrates from velocity. If the player stops pushing, the field alone carries the kid toward the nearest well — which *is* the drift behavior from View One.

### Skeleton code

```javascript
// world.js — the shared model

const world = {
  cols: 12, rows: 12, cell: 40,       // grid of streets
  pos: { x: 1.5, y: 1.5 },            // kid / ship, in cell units
  vel: { x: 0, y: 0 },
  goal: { x: 10.5, y: 10.5 },         // school / destination
  attractors: [                        // distractions = gravity wells
    { x: 4, y: 3,  strength: 1.2, radius: 2.5, name: "fruit tree" },
    { x: 7, y: 8,  strength: 2.0, radius: 3.0, name: "energy drinks" },
  ],
};

// scalar potential: sum of smooth wells (negative = low)
function potential(x, y) {
  let p = 0;
  for (const a of world.attractors) {
    const dx = x - a.x, dy = y - a.y;
    const r2 = dx*dx + dy*dy;
    p -= a.strength * Math.exp(-r2 / (a.radius * a.radius));
  }
  return p;
}

// force = -gradient of potential (finite differences)
function field(x, y) {
  const h = 0.01;
  return {
    x: -(potential(x + h, y) - potential(x - h, y)) / (2*h),
    y: -(potential(x, y + h) - potential(x, y - h)) / (2*h),
  };
}

// one simulation step: input nudges, field bends, friction settles
function tick(input, dt) {
  const f = field(world.pos.x, world.pos.y);
  const speed = 3;
  world.vel.x += (input.x * speed + f.x) * dt;
  world.vel.y += (input.y * speed + f.y) * dt;
  world.vel.x *= 0.9; world.vel.y *= 0.9;        // friction
  world.pos.x += world.vel.x * dt;
  world.pos.y += world.vel.y * dt;
}
```

### How each view reads the model

- **Town:** draw `pos` as the kid on a flat grid; draw attractors as distraction sprites.
- **Space-time:** draw `potential` as a height map in perspective; draw hyperspace routes as curves on that surface.
- **Easter egg:** draw the raw `field` arrows plus the graph and the dot.

---

## Build order

1. **Shared physics model first** (this document's skeleton) — get the drift-and-bend behavior feeling right by playing with constants (`strength`, `radius`, `speed`, friction).
2. Then the two renderers (plain canvas; space-time view as a hand-projected wireframe height field).
3. Then the hidden third frame.

## Open knobs to tune

- Attractor `strength` and `radius` (how hard distractions pull, how far their reach extends).
- `speed` of intentional input vs. field force (how much agency vs. how much pull).
- Friction coefficient (how quickly the particle settles).
- Whether wells ever fully capture, or only ever bend.
