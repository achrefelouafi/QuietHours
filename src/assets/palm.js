/* ═══════════════════════════════════════════════════════════════
   assets/palm.js — the tall broad-leaved plant: a short trunk,
   then long lance leaves rising and nodding over at the tips.

   palm(x, y, z, o)
     pot centre (x, y) on a surface at z. o.size is the longest
     leaf (2.2), o.r the pot radius (0.45), o.n the leaf count (9).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cyl, ring, beam, rgb } = QH.draw;
  const { TAU, rnd } = QH;
  const light = QH.light;

  QH.assets.palm = (x, y, z, o = {}) => {
    const r = o.r || 0.45, ph = o.ph || 0.75, size = o.size || 2.2, n = o.n || 9, R = rnd(o.seed || 101);
    cyl(x, y, z, r * 0.8, ph, M.navyLt, { n: 14, rt: r, colTop: M.woodDk, topK: 1 });
    ring(x, y, z + ph + 0.005, r, rgb(light.warm(M.rust, M.orangeDk)), 14);

    const zb = z + ph - 0.05, trunk = 0.5;
    beam([x, y, zb], [x, y, zb + trunk], 0.14, M.woodDk, 1);
    const leaves = [];
    for (let i = 0; i < n; i++) leaves.push({ a: (i + R() * 0.5) / n * TAU, l: size * (0.55 + R() * 0.45), rise: 0.55 + R() * 0.35, lt: R() > 0.5, w: 0.2 + R() * 0.08 });
    leaves.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));
    for (const L of leaves) {
      const ux = Math.cos(L.a), uy = Math.sin(L.a), col = L.lt ? M.leafLt : M.leaf;
      const b = [x + ux * 0.05, y + uy * 0.05, zb + trunk];
      const m = [x + ux * L.l * 0.42, y + uy * L.l * 0.42, zb + trunk + L.l * L.rise];           // widest point
      const t = [x + ux * L.l * 0.78, y + uy * L.l * 0.78, zb + trunk + L.l * L.rise * 0.72];    // the tip, nodding over
      beam(b, m, L.w * 0.7, col, 1);                                   // the leaf, broad in the middle
      beam([b[0] + (m[0] - b[0]) * 0.35, b[1] + (m[1] - b[1]) * 0.35, b[2] + (m[2] - b[2]) * 0.35], m, L.w, col, 1.04);
      beam(m, t, L.w * 0.55, col, 1);
      beam(b, m, 0.035, M.leafDk, 1);                                  // midrib
      beam(m, t, 0.03, M.leafDk, 1);
    }
  };
})(QH);
