/* ═══════════════════════════════════════════════════════════════
   engine/sway.js — the plants moving under the pointer.

   Every leaf of every plant is a small spring. When the pointer
   is over a plant it parts the leaves nearest it; when it moves
   it sweeps them along with it; under a still hand they tremble.
   When it goes they spring back, overshooting a little, each at
   its own rate. A tap on a plant shakes the whole thing.

   The assets don't know any of that. As a plant is drawn it says
   plant(name, x, y, z, reach) — where it stands and how far its
   foliage goes — and gets back a handle; at(i, p, f) moves world
   point p, which sits a fraction f along leaf i (0 at the base,
   1 at the tip), by that leaf's displacement right now. The base
   never moves and the tip moves most, so a leaf bends.

   Displacements are kept in screen-oriented units of `reach`, so
   the same hand feels the same on a small pot and a tall palm, at
   any zoom. State is keyed on the plant's name and where it
   stands, so it survives from frame to frame; the screen position
   of every tip from the last draw is what the pointer is tested
   against.

   main.js feeds the pointer in buffer px — move(), leave(),
   shake() — and calls step(t) before each paint.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const { clamp, lerp, TAU } = QH;
  const { P, cam } = QH.cam;

  const CAP   = 0.4;        // how far a tip may go, as a fraction of reach
  const PART  = 0.2;        // how far the leaves under a still pointer lean away
  const INFL  = 0.5;        // how near the pointer must be to a leaf, in reach, to be felt
  const STIFF = 70;         // the spring, 1/s² — with the damping ratio below, bouncy, settled in about a second
  const ZETA  = 0.28;
  const SWEEP = 6.5;        // how hard a moving pointer drags the leaves it crosses — a quick swipe swings them right over
  const SHAKE = 4;          // the kick a tap gives the leaves, reach/s

  const plants = new Map();                            // key → { bx, by, cx, cy, px, reach, sag, seen, leaves, h }
  const ptr = { x: 0, y: 0, vx: 0, vy: 0, on: false, t: 0 };
  let frame = 0, lastT = -1, active = false;

  const hash = i => { const v = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return v - Math.floor(v); };
  const smooth = u => u * u * (3 - 2 * u);

  function leafOf(p, i) {
    return p.leaves[i] || (p.leaves[i] = {
      ex: 0, ey: 0, vx: 0, vy: 0,                      // displacement and velocity, screen-oriented, in reach
      sx: 0, sy: 0, f: -1, frame: -1,                  // the tip on screen at the last draw
      k: 0.75 + 0.5 * hash(i), ph: hash(i + 100) * TAU, // its own stiffness and tremble phase
    });
  }

  /** Where world point q ends up, a fraction f along leaf L of plant p. */
  function place(p, L, q, f) {
    const k = f * f * p.reach, ex = L.ex * k, ey = L.ey * k;
    // a screen offset taken back into the floor plane (sx = (x − y)s, sy = (x + y)s/2), and a sag as the leaf bends
    return [q[0] + (ex + 2 * ey) * 0.5, q[1] + (2 * ey - ex) * 0.5, q[2] - Math.hypot(ex, ey) * p.sag];
  }

  function handle(p) {
    return p.h || (p.h = {
      at(i, q, f = 1) {
        const L = leafOf(p, i);
        const r = L.ex || L.ey ? place(p, L, q, f) : q;
        if (L.frame !== frame) { L.frame = frame; L.f = -1; }
        if (f >= L.f) { L.f = f; const s = P(r[0], r[1], r[2]); L.sx = s[0]; L.sy = s[1]; }
        return r;
      },
    });
  }

  /** Register a plant standing at world (x, y, z) whose foliage reaches
      `reach` units; `up` is where its middle is, in reach, above that
      (negative for something hanging). Returns the handle. */
  function plant(name, x, y, z, reach, up = 0.45) {
    const key = name + '|' + cam.ox + ',' + cam.oy + ',' + cam.oz + '|' + x + ',' + y + ',' + z;
    let p = plants.get(key);
    if (!p) plants.set(key, p = { leaves: [], h: null });
    const b = P(x, y, z), c = P(x, y, z + reach * up);
    p.bx = b[0]; p.by = b[1]; p.cx = c[0]; p.cy = c[1];
    p.reach = reach; p.px = reach * cam.s; p.seen = frame;
    p.sag = up < 0 ? -0.25 : 0.4;                      // a bent leaf sags; a swung strand lifts a little, like a pendulum
    return handle(p);
  }

  /** The nearest point on leaf L (base to tip on screen) to (x, y): sets
      out = [dx, dy, d], the way from the point to the leaf and how far. */
  function nearest(p, L, x, y, out) {
    const ax = p.bx, ay = p.by, bx = L.sx, by = L.sy;
    const len = (bx - ax) ** 2 + (by - ay) ** 2 || 1;
    const u = clamp(((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / len, 0, 1);
    let dx = ax + (bx - ax) * u - x, dy = ay + (by - ay) * u - y, d = Math.hypot(dx, dy);
    if (d < 1) { dx = bx - ax; dy = by - ay; d = Math.sqrt(len); }   // right on the leaf: push it outward
    out[0] = dx / d; out[1] = dy / d; out[2] = d;
  }
  const near = [0, 0, 0];

  /** Advance every spring to time t (seconds). */
  function step(t) {
    const dt = lastT < 0 ? 0 : clamp(t - lastT, 0, 0.05);
    lastT = t; frame++;
    if (dt <= 0) return;
    const decay = Math.exp(-dt / 0.08);                // a pointer that's stopped reads as still within a few frames
    ptr.vx *= decay; ptr.vy *= decay;
    active = false;
    for (const p of plants.values()) {
      if (frame - p.seen > 2) continue;                // not drawn lately
      let wp = 0, svx = 0, svy = 0;
      if (ptr.on) {
        const dc = Math.hypot(ptr.x - p.cx, ptr.y - p.cy) / p.px;
        if (dc < 1.4) wp = smooth(1 - dc / 1.4);       // the pointer is over this plant
        svx = ptr.vx * 1000 / p.px; svy = ptr.vy * 1000 / p.px;   // its speed, in reach per second
        const sp = Math.hypot(svx, svy);
        if (sp > 30) { svx *= 30 / sp; svy *= 30 / sp; }
      }
      for (let i = 0; i < p.leaves.length; i++) {
        const L = p.leaves[i]; if (!L) continue;
        const K = STIFF * L.k, C = 2 * ZETA * Math.sqrt(K);
        let fx = 0, fy = 0;
        if (wp > 0) {
          nearest(p, L, ptr.x, ptr.y, near);
          const d = near[2] / p.px;
          let w = d < INFL ? smooth(1 - d / INFL) : 0;   // this leaf is under the pointer
          w += 0.12 * wp * (1 - w);                      // and the rest of the plant stirs a little
          // part the leaves away from the pointer, sweep them along with it, let them tremble under it
          fx = K * (near[0] * PART * w + 0.025 * w * Math.sin(t * 13 + L.ph)) + SWEEP * svx * w;
          fy = K * (near[1] * PART * w + 0.025 * w * Math.cos(t * 11 + L.ph)) + SWEEP * svy * w;
        }
        L.vx += (-K * L.ex - C * L.vx + fx) * dt;
        L.vy += (-K * L.ey - C * L.vy + fy) * dt;
        L.ex += L.vx * dt; L.ey += L.vy * dt;
        const m = Math.hypot(L.ex, L.ey);
        if (m > CAP) { L.ex *= CAP / m; L.ey *= CAP / m; L.vx *= 0.5; L.vy *= 0.5; }
        if (m > 5e-3 || Math.abs(L.vx) + Math.abs(L.vy) > 0.05) active = true;
        else L.ex = L.ey = L.vx = L.vy = 0;
      }
    }
  }

  /** The pointer is at buffer px (x, y) at time `now` (ms). */
  function move(x, y, now) {
    if (ptr.on) {
      const dt = Math.max(1, now - ptr.t);
      ptr.vx = lerp(ptr.vx, (x - ptr.x) / dt, 0.5);
      ptr.vy = lerp(ptr.vy, (y - ptr.y) / dt, 0.5);
    }
    ptr.x = x; ptr.y = y; ptr.t = now; ptr.on = true;
  }
  const leave = () => { ptr.on = false; ptr.vx = ptr.vy = 0; };

  /** A tap at buffer px (x, y): every leaf of the plant under it jumps
      away from the spot, the nearest most. True if it found one. */
  function shake(x, y) {
    let hit = false;
    for (const p of plants.values()) {
      if (frame - p.seen > 2 || Math.hypot(x - p.cx, y - p.cy) > p.px * 1.2) continue;
      hit = active = true;
      for (let i = 0; i < p.leaves.length; i++) {
        const L = p.leaves[i]; if (!L) continue;
        nearest(p, L, x, y, near);
        const w = 0.35 + 0.65 * smooth(1 - Math.min(1, near[2] / (p.px * 1.1)));
        const kick = SHAKE * w * (0.7 + 0.6 * hash(i + 7));
        L.vx += near[0] * kick; L.vy += near[1] * kick;
      }
    }
    return hit;
  }

  QH.sway = { plant, step, move, leave, shake, busy: () => active };
})(QH);
