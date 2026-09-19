/* ═══════════════════════════════════════════════════════════════
   assets/snakePlant.js — tall spiky plant in a navy pot.

   snakePlant(x, y, z, o)
     pot centre (x, y) on a surface at z. o.size is the longest
     leaf (2.4), o.r the pot radius (0.45).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cyl, ring, beam, rgb } = QH.draw;
  const { TAU, rnd } = QH;
  const light = QH.light, sway = QH.sway;

  QH.assets.snakePlant = (x, y, z, o = {}) => {
    const r = o.r || 0.45, ph = o.ph || 0.85, size = o.size || 2.4, n = o.n || 12, R = rnd(o.seed || 83);
    cyl(x, y, z, r * 0.82, ph, M.navyLt, { n: 14, rt: r, colTop: M.woodDk, topK: 1 });
    ring(x, y, z + ph + 0.005, r, rgb(light.warm(M.rust, M.orangeDk)), 14);

    const zb = z + ph - 0.05, leaves = [], S = sway.plant('snakePlant', x, y, zb, size);
    for (let i = 0; i < n; i++) leaves.push({ i, a: R() * TAU, l: size * (0.55 + R() * 0.5), o: 0.05 + R() * r * 0.5, w: 0.09 + R() * 0.06, lt: R() > 0.55, bend: 0.25 + R() * 0.3 });
    leaves.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));
    for (const L of leaves) {
      const ux = Math.cos(L.a), uy = Math.sin(L.a), c = L.lt ? M.leafLt : M.leaf;
      const b = [x + ux * L.o, y + uy * L.o, zb];
      const m = S.at(L.i, [x + ux * (L.o + L.l * L.bend * 0.5), y + uy * (L.o + L.l * L.bend * 0.5), zb + L.l * 0.62], 0.62);
      const t = S.at(L.i, [x + ux * (L.o + L.l * L.bend), y + uy * (L.o + L.l * L.bend), zb + L.l], 1);
      beam(b, m, L.w, c, 1);
      beam(m, t, L.w * 0.55, c, 1.05);
      beam([b[0], b[1], b[2] + 0.05], m, L.w * 0.3, M.leafDk, 1);          // the dark vein
    }
  };
})(QH);
