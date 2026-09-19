/* ═══════════════════════════════════════════════════════════════
   assets/fern.js — a fern: a dozen fronds arching out of a pot
   and drooping at the tips, leaflets ticked along each one.

   fern(x, y, z, o)
     pot centre (x, y) on a surface at z. o.size is the longest
     frond (1.5), o.r the pot radius (0.45), o.n the frond count.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cyl, ring, beam, rgb } = QH.draw;
  const { TAU, rnd } = QH;
  const light = QH.light, sway = QH.sway;

  QH.assets.fern = (x, y, z, o = {}) => {
    const r = o.r || 0.45, ph = o.ph || 0.7, size = o.size || 1.5, n = o.n || 13, R = rnd(o.seed || 89);
    cyl(x, y, z, r * 0.8, ph, M.navyLt, { n: 14, rt: r, colTop: M.woodDk, topK: 1 });
    ring(x, y, z + ph + 0.005, r, rgb(light.warm(M.rust, M.orangeDk)), 14);

    const zb = z + ph - 0.05, fronds = [], S = sway.plant('fern', x, y, zb, size, 0.35);
    for (let i = 0; i < n; i++) fronds.push({ i, a: (i + R() * 0.7) / n * TAU, l: size * (0.5 + R() * 0.5), rise: 0.35 + R() * 0.45, lt: R() > 0.5 });
    fronds.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));
    for (const F of fronds) {
      const ux = Math.cos(F.a), uy = Math.sin(F.a), col = F.lt ? M.leafLt : M.leaf;
      // a quadratic arc: up and out, then over
      const p0 = [x + ux * 0.05, y + uy * 0.05, zb];
      const p1 = [x + ux * F.l * 0.45, y + uy * F.l * 0.45, zb + F.l * F.rise * 1.6];
      const p2 = [x + ux * F.l, y + uy * F.l, zb + F.l * F.rise * 0.5];
      const at = t => S.at(F.i, [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
                                 (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
                                 (1 - t) * (1 - t) * p0[2] + 2 * (1 - t) * t * p1[2] + t * t * p2[2]], t);
      const K = 7;
      let prev = at(0);
      for (let k = 1; k <= K; k++) {
        const t = k / K, p = at(t);
        beam(prev, p, 0.04, M.leafDk, 1);
        // leaflets either side, shorter toward the tip
        const s = 0.16 * (1 - t * 0.55);
        beam(p, [p[0] - uy * s, p[1] + ux * s, p[2] - s * 0.4], 0.07, col, 1);
        beam(p, [p[0] + uy * s, p[1] - ux * s, p[2] - s * 0.4], 0.07, col, 1);
        prev = p;
      }
    }
  };
})(QH);
