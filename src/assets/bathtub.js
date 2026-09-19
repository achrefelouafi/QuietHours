/* ═══════════════════════════════════════════════════════════════
   assets/bathtub.js — the clawfoot tub: a deep stadium-shaped
   shell in blue-grey enamel, its belly tucked in under a pale
   rolled rim, a darker well inside with the drain at the far end,
   and four copper claw feet.

   bathtub(x, y, o)
     footprint x..x+w by y..y+d; the long axis runs along o.along
     ('y', down the left wall, or 'x'). o.w is across (2.5), o.l
     along (5.6). bathtub.H is the rim height.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { prism, poly, stroke, disc, cyl, clip, unclip, rgb, sh } = QH.draw;
  const { TAU } = QH;
  const light = QH.light;

  const RIM = 1.95, BELLY = 0.6, DEPTH = 1.0;

  /** A stadium: two half-circles of radius r, `straight` apart,
      centred at (cx, cy), long axis along `along`. */
  function stadium(cx, cy, r, straight, along, n = 9) {
    const pts = [], h = straight / 2;
    for (let i = 0; i <= n; i++) { const a = -TAU / 4 + i / n * TAU / 2; pts.push([h + r * Math.cos(a), r * Math.sin(a)]); }
    for (let i = 0; i <= n; i++) { const a = TAU / 4 + i / n * TAU / 2; pts.push([-h + r * Math.cos(a), r * Math.sin(a)]); }
    return pts.map(([u, v]) => along === 'y' ? [cx + v, cy + u] : [cx + u, cy + v]);
  }

  const bathtub = (x, y, o = {}) => {
    const along = o.along || 'y', w = o.w || 2.5, l = o.l || 5.6;
    const cx = x + (along === 'y' ? w : l) / 2, cy = y + (along === 'y' ? l : w) / 2;
    const r = w / 2, straight = l - w;
    const enamel = M.sky, dark = M.slate;

    // feet: a copper ball on a splayed claw, under the shell toward each end, well
    // forward under the near cap so they show beneath it — far ones first
    const copper = light.warm(M.orangeDk, M.orangeLt);
    const fu = straight / 2 + r * 0.45, fv = r * 0.6;
    const feet = [[-fu, -fv], [fu, -fv], [-fu, fv], [fu, fv]].map(([u, v]) => along === 'y' ? [cx + v, cy + u] : [cx + u, cy + v]);
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

    // inside: the well, the far wall rising out of it, the drain at the far end
    clip(inner.map(p => [p[0], p[1], RIM]));
    poly(inner.map(p => [p[0], p[1], RIM - DEPTH]), rgb(M.steel));
    prism(inner, RIM - DEPTH, DEPTH, dark, { inside: true, side: 0.92 });
    const [dx, dy] = along === 'y' ? [cx, cy - straight / 2 + 0.05] : [cx - straight / 2 + 0.05, cy];
    disc(dx, dy, RIM - DEPTH + 0.01, 0.11, rgb(M.ink), 8);
    disc(dx, dy, RIM - DEPTH + 0.02, 0.05, rgb(M.greyLt), 6);
    unclip();

    // contours round the opening and the rim, and a light along the rim's near side
    stroke(inner.map(p => [p[0], p[1], RIM]), rgb(M.ink), 1, true);
    stroke(outer.map(p => [p[0], p[1], RIM]), rgb(M.ink), 1, true);
    // the run of the outline whose outward normal faces the camera: the near end and the +x flank
    const near = outer.filter(p => {
      const [u, v] = along === 'y' ? [p[1] - cy, p[0] - cx] : [p[0] - cx, p[1] - cy];
      return (u > 0 ? u - straight / 2 : u + straight / 2) + v > r * 0.15;
    });
    stroke(near.map(p => [p[0], p[1], RIM - 0.06]), sh(M.greyLt, 1.15));
    stroke(near.map(p => [p[0], p[1], BELLY + 0.38]), sh(enamel, 0.55));           // the shadow line where the body overhangs the belly
  };
  bathtub.H = RIM;
  QH.assets.bathtub = bathtub;
})(QH);
