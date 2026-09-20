/* ═══════════════════════════════════════════════════════════════
   assets/bathtub.js — the clawfoot tub: a deep stadium-shaped
   shell in blue-grey enamel, its belly tucked in under a pale
   rolled rim, a darker well inside with the drain at the far end,
   and four copper claw feet. And the water in it, when there is
   any: a surface standing in the well with the light scattered
   over it in pale flecks, and while the shower runs, rain falling
   out of the head into it and small rings opening where it lands.

   bathtub(x, y, o)
     footprint x..x+w by y..y+d; the long axis runs along o.along
     ('y', down the left wall, or 'x'). o.w is across (2.5), o.l
     along (5.6). bathtub.H is the rim height.
     o.water (0..1) is how full it is — at 1 the water stands a
     hand's breadth under the rim. o.shower is the rain head over
     the tub, { at: [x, y, z], r }: while o.flow (0..1) is up, rain
     falls from it into the well. o.t moves the rain and the light
     on the water. o.flash (0..1) is the lightning, thrown back.
   Returns the tub's screen silhouette — a convex polygon — for
   hit-testing (also kept in bathtub.last).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { prism, poly, stroke, disc, ring, cyl, beam, clip, unclip, rgb, sh } = QH.draw;
  const { TAU, mix, clamp, rnd } = QH;
  const { P } = QH.cam;
  const light = QH.light;

  const RIM = 1.95, BELLY = 0.6, DEPTH = 1.0, BRIM = 0.1;   // BRIM: how far under the rim a full tub's water stands

  /** A stadium: two half-circles of radius r, `straight` apart,
      centred at (cx, cy), long axis along `along`. */
  function stadium(cx, cy, r, straight, along, n = 9) {
    const pts = [], h = straight / 2;
    for (let i = 0; i <= n; i++) { const a = -TAU / 4 + i / n * TAU / 2; pts.push([h + r * Math.cos(a), r * Math.sin(a)]); }
    for (let i = 0; i <= n; i++) { const a = TAU / 4 + i / n * TAU / 2; pts.push([-h + r * Math.cos(a), r * Math.sin(a)]); }
    return pts.map(([u, v]) => along === 'y' ? [cx + v, cy + u] : [cx + u, cy + v]);
  }

  /** The convex hull of screen points (Andrew's monotone chain): the tub's silhouette, for the click. */
  function hull(pts) {
    const S = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const turn = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = run => { const h = []; for (const p of run) { while (h.length > 1 && turn(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); } h.pop(); return h; };
    return half(S).concat(half(S.reverse()));
  }

  const bathtub = (x, y, o = {}) => {
    const along = o.along || 'y', w = o.w || 2.5, l = o.l || 5.6, t = o.t || 0;
    const cx = x + (along === 'y' ? w : l) / 2, cy = y + (along === 'y' ? l : w) / 2;
    const r = w / 2, straight = l - w;
    const enamel = M.sky, dark = M.slate;
    const loc = (u, v) => along === 'y' ? [cx + v, cy + u] : [cx + u, cy + v];   // tub-local (along, across) → world

    // feet: a copper ball on a splayed claw, under the shell toward each end, well
    // forward under the near cap so they show beneath it — far ones first
    const copper = light.warm(M.orangeDk, M.orangeLt);
    const fu = straight / 2 + r * 0.45, fv = r * 0.6;
    const feet = [[-fu, -fv], [fu, -fv], [-fu, fv], [fu, fv]].map(([u, v]) => loc(u, v));
    feet.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
    for (const [fx, fy] of feet) {
      cyl(fx, fy, 0, 0.22, 0.24, copper, { n: 8, rt: 0.13, top: false });
      cyl(fx, fy, 0.24, 0.13, BELLY - 0.24 + 0.1, copper, { n: 8, rt: 0.2, top: false, edge: false });
    }

    // the shell, clear of the floor: a tucked-in belly, then the body stepping out over it
    prism(stadium(cx, cy, r - 0.26, straight, along), BELLY, 0.4, enamel, { top: false, side: 0.82 });
    prism(stadium(cx, cy, r, straight, along), BELLY + 0.38, RIM - BELLY - 0.38, enamel, { top: false });

    // the rim: a pale roll, the opening dark inside it
    const outer = stadium(cx, cy, r, straight, along), inner = stadium(cx, cy, r - 0.22, straight - 0.08, along);
    poly(outer.map(p => [p[0], p[1], RIM]), rgb(M.greyLt));
    poly(inner.map(p => [p[0], p[1], RIM]), rgb(dark));

    // the water: how high it stands; the rain, if the head over the tub is running — and where in the well its drops come down
    const water = clamp(o.water || 0, 0, 1), zw = RIM - DEPTH + water * (DEPTH - BRIM), flow = o.shower ? o.flow || 0 : 0;
    const ri = r - 0.22, si = (straight - 0.08) / 2;                    // the well: its half-width, and half its straight run
    const well = (px, py) => along === 'y' ? [clamp(px, cx - ri + 0.15, cx + ri - 0.15), clamp(py, cy - si, cy + si)]
                                            : [clamp(px, cx - si, cx + si), clamp(py, cy - ri + 0.15, cy + ri - 0.15)];
    /** A point in the rain's footprint — inside the head's circle, kept within the well. R is a seeded generator. */
    const drop = R => { const a = R() * TAU, rr = o.shower.r * Math.sqrt(R()); return well(o.shower.at[0] + rr * Math.cos(a), o.shower.at[1] + rr * Math.sin(a)); };

    // inside: the well, the far wall rising out of it, the drain at the far end
    clip(inner.map(p => [p[0], p[1], RIM]));
    poly(inner.map(p => [p[0], p[1], RIM - DEPTH]), rgb(M.steel));
    prism(inner, RIM - DEPTH, DEPTH, dark, { inside: true, side: 0.92 });
    const [dx, dy] = loc(-straight / 2 + 0.05, 0);
    disc(dx, dy, RIM - DEPTH + 0.01, 0.11, rgb(M.ink), 8);
    disc(dx, dy, RIM - DEPTH + 0.02, 0.05, rgb(M.greyLt), 6);

    // the water over it all: a surface, silver in the lightning; the light on it, pale flecks scattered
    // everywhere, each coming and going in its own time; and while it rains, small rings opening on it
    if (water > 0) {
      const surface = inner.map(p => [p[0], p[1], zw]);
      poly(surface, rgb(mix(M.sky, M.silver, 0.6 * (o.flash || 0))));
      clip(surface);                                                     // nothing on the water leaves it
      const G = rnd(23);
      for (let i = 0; i < 30; i++) {
        const u = (G() * 2 - 1) * (si + ri * 0.7), v = (G() * 2 - 1) * ri * 0.85, len = 0.12 + G() * 0.3, ph = G() * TAU;
        const du = Math.max(0, Math.abs(u) - si);
        if (du * du + v * v > (ri - 0.14) ** 2 || Math.sin(t * 1.3 + ph) < -0.35) continue;   // off the water, or gone for the moment
        stroke([[...loc(u - len / 2, v), zw + 0.005], [...loc(u + len / 2, v), zw + 0.005]], rgb(M.greyLt));
      }
      if (flow > 0) for (let k = 0; k < 9; k++) {                        // a ring where each drop struck, a fresh spot every time
        const cyc = t * 1.3 + k / 9, ph = cyc % 1, [px, py] = drop(rnd(41 + k * 17 + Math.floor(cyc) * 101));
        ring(px, py, zw + 0.005, 0.04 + ph * 0.28, rgb(ph < 0.5 ? M.greyLt : M.steel), 10);
      }
      unclip();
    }
    unclip();

    // contours round the opening and the rim
    stroke(inner.map(p => [p[0], p[1], RIM]), rgb(M.ink), 1, true);
    stroke(outer.map(p => [p[0], p[1], RIM]), rgb(M.ink), 1, true);
    // the run of the outline whose outward normal faces the camera: the near end and the +x flank
    const near = outer.filter(p => {
      const [u, v] = along === 'y' ? [p[1] - cy, p[0] - cx] : [p[0] - cx, p[1] - cy];
      return (u > 0 ? u - straight / 2 : u + straight / 2) + v > r * 0.15;
    });
    stroke(near.map(p => [p[0], p[1], BELLY + 0.38]), sh(enamel, 0.55));           // the shadow line where the body overhangs the belly

    // the rain, over everything: drops out of the head straight down into the well, each a short streak on its own fall
    if (flow > 0) {
      const D = rnd(29), hz = o.shower.at[2], L = Math.max(0.1, hz - zw);
      for (let i = 0; i < 20; i++) {
        const [px, py] = drop(D), speed = 3.2 + D() * 2.4, col = D() > 0.75 ? M.cream : D() > 0.4 ? M.greyLt : M.sky;
        const z0 = hz - ((D() * L + t * speed) % L);
        beam([px, py, z0], [px, py, Math.max(zw, z0 - 0.3)], 0.03, col, 1);
      }
    }

    return (bathtub.last = { hull: hull([...outer.map(p => P(p[0], p[1], RIM)), ...outer.map(p => P(p[0], p[1], BELLY))]) });
  };
  bathtub.H = RIM;
  bathtub.last = null;
  QH.assets.bathtub = bathtub;
})(QH);
