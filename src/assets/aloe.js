/* ═══════════════════════════════════════════════════════════════
   assets/aloe.js — the stiff succulents: a rosette of thick
   blades, each tapering to a point with a dark keel down its
   middle, out of a terracotta pot with a lip. Upright like an
   aloe, or opened out flat like an agave.

   aloe(x, y, z, o)
     pot centre (x, y) on a surface at z. o.size is the longest
     blade (1.2), o.n the count (9), o.r the pot radius (0.3).
     o.spread is how far the blades lean out, 0..1 (0.45) — 0.9 is
     the agave; o.pot recolours the pot (terracotta by default).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cyl, beam } = QH.draw;
  const { TAU, rnd, lerp } = QH;
  const light = QH.light;

  QH.assets.aloe = (x, y, z, o = {}) => {
    const r = o.r || 0.3, ph = o.ph || r * 1.3, size = o.size || 1.2, n = o.n || 9, spread = o.spread ?? 0.45;
    const pot = o.pot || light.warm(M.rustLt, M.orangeLt), lip = o.lip || light.warm(M.orangeDk, M.bright);
    cyl(x, y, z, r * 0.78, ph - 0.12, pot, { n: 12, rt: r * 0.95, top: false });
    cyl(x, y, z + ph - 0.12, r, 0.12, lip, { n: 12, colTop: M.woodDk, topK: 1 });

    const R = rnd(o.seed || 53), zb = z + ph - 0.04, blades = [];
    for (let i = 0; i < n; i++) {
      blades.push({ a: (i + R() * 0.6) / n * TAU, l: size * (0.55 + R() * 0.45), lt: R() > 0.5,
                    out: spread * (0.7 + R() * 0.6), w: 0.1 + R() * 0.05 });
    }
    blades.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));   // far blades first
    for (const b of blades) {
      const ux = Math.cos(b.a), uy = Math.sin(b.a), col = b.lt ? M.leafLt : M.leaf;
      const rise = lerp(1.0, 0.35, b.out), droop = b.out > 0.6 ? b.l * 0.25 : 0;
      const p0 = [x + ux * 0.06, y + uy * 0.06, zb];
      const p1 = [x + ux * b.l * b.out * 0.55, y + uy * b.l * b.out * 0.55, zb + b.l * rise * 0.6];
      const p2 = [x + ux * b.l * b.out, y + uy * b.l * b.out, zb + b.l * rise - droop];
      beam(p0, p1, b.w, col, 1);                                       // thick at the base
      beam(p1, p2, b.w * 0.55, col, 1.04);                             // tapering to the tip
      beam([p0[0], p0[1], p0[2] + 0.04], p1, b.w * 0.3, M.leafDk, 1);  // the keel
      beam(p1, [lerp(p1[0], p2[0], 0.7), lerp(p1[1], p2[1], 0.7), lerp(p1[2], p2[2], 0.7)], b.w * 0.2, M.leafDk, 1);
    }
  };
})(QH);
