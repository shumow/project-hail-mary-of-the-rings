# Geodesics of Distraction

A little JavaScript maze game built around one mathematical idea seen from
two (secretly three) points of view.

A kid missed the bus and is walking to school. The town is full of
distractions — a fruit tree, a store full of energy drinks, some graffiti —
and each one pulls on him. It doesn't grab him outright; it bends his path.
The same input, at the same moment, also steers a ship across a 2D space-time
whose grid dents around gravity wells. The two frames are the **same
particle** under two renderings. There's a hidden third frame that shows what
that particle really is.

## Run it

It's plain ES modules and `<canvas>` — no build step, but it does need to be
served (modules won't load over `file://`):

```bash
cd project-hail-mary-of-the-rings
python3 -m http.server 8000
# open http://localhost:8000
```

**Controls:** arrow keys to move. Press `` ` `` (backtick) to toggle the
secret frame.

## How it's put together

Everything hangs off one object, `world`, in [`src/world.js`](src/world.js).
Every view is a read-only consumer of it.

- **The physics.** Constant (linear) acceleration up to a hard speed cap.
  Distractions pull with a softened inverse-square law (`1/r²`), which gives a
  real **capture radius**: inside it, the well beats your acceleration and
  there's no escape; outside, your speed decides whether you slingshot past or
  get caught. `captureRadius()` computes it.
- **The town** ([`src/town.js`](src/town.js)) — flat grid, the kid as a dot.
- **The space-time** ([`src/spacetime.js`](src/spacetime.js)) — the same model
  as a hand-projected wireframe rubber sheet; sheet height is the Newtonian
  potential.
- **The Easter egg** ([`src/abstract.js`](src/abstract.js)) — the raw force
  field, the capture radii, and the dot. The game confessing what it is.

See [DESIGN.md](DESIGN.md) for the full design notes.

## Knobs to tune

In `world.js`: each attractor's `strength` and `soft`; the player's `accel`,
`maxSpeed`, and `drag`. The whole feel of the game lives in the balance
between `accel` (your agency) and the wells' `strength` (the pull).

## Status

Early. Physics and all three renderers are in. Not yet done: the hyperspace
routes to trace in the space-time view, real distraction sprites, sound, and
a reason to reach school.

## License

Not chosen yet — **not** GPL. All code here is original; no GPL-licensed
project was copied from.
