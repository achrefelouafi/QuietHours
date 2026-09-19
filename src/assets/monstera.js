/* ═══════════════════════════════════════════════════════════════
   assets/monstera.js — the big split-leaf plant: a handful of
   leaves on tall stems, each leaf a fan of lobes with a dark
   midrib, in a navy pot.

   monstera(x, y, z, o)
     pot centre (x, y) on a surface at z. o.size is the tallest
     stem (2.3), o.r the pot radius (0.5), o.n the leaf count (5).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cyl, ring, beam, rgb } = QH.draw;
  const { TAU, rnd } = QH;
  const light = QH.light, sway = QH.sway;

  QH.assets.monstera = (x, y, z, o = {}) => {
    const r = o.r || 0.5, ph = o.ph || 0.85, size = o.size || 2.3, n = o.n || 5, R = rnd(o.seed || 97);
    cyl(x, y, z, r * 0.8, ph, M.navyLt, { n: 14, rt: r, colTop: M.woodDk, topK: 1 });
    ring(x, y, z + ph + 0.005, r, rgb(light.warm(M.rust, M.orangeDk)), 14);

    const zb = z + ph - 0.05, leaves = [], S = sway.plant('monstera', x, y, zb, size, 0.7);
    for (let i = 0; i < n; i++) {
      const a = (i + R() * 0.6) / n * TAU;
      leaves.push({ i, a, h: size * (0.5 + R() * 0.5), out: 0.45 + R() * 0.55, s: 0.7 + R() * 0.4, lt: R() > 0.5, tilt: 0.15 + R() * 0.3 });
    }
    leaves.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));   // far leaves first
    for (const L of leaves) {
      const ux = Math.cos(L.a), uy = Math.sin(L.a);
      const c0 = [x + ux * L.out, y + uy * L.out, zb + L.h];                         // where the leaf starts
      const c = S.at(L.i, c0, 0.75);                                                 // …the stem's top swaying with it
      beam([x + ux * 0.08, y + uy * 0.08, zb], [c[0], c[1], c[2] - 0.05], 0.05, M.leafDk, 1);   // stem
      const col = L.lt ? M.leafLt : M.leaf;
      // the lobes: five fingers fanned round the leaf's direction, the outer ones shorter and drooping
      for (const k of [-2, 2, -1, 1, 0]) {
        const a = L.a + k * 0.42, len = L.s * (k === 0 ? 1 : Math.abs(k) === 1 ? 0.88 : 0.66);
        const tip = S.at(L.i, [c0[0] + Math.cos(a) * len, c0[1] + Math.sin(a) * len, c0[2] - len * L.tilt - Math.abs(k) * 0.05], 1);
        beam(c, tip, 0.2, col, 1);
        beam(S.at(L.i, [c0[0] + Math.cos(a) * len * 0.35, c0[1] + Math.sin(a) * len * 0.35, c0[2] - len * L.tilt * 0.35], 0.85), tip, 0.13, col, 1.06);
      }
      beam(c, S.at(L.i, [c0[0] + ux * L.s * 0.85, c0[1] + uy * L.s * 0.85, c0[2] - L.s * L.tilt * 0.85], 0.95), 0.03, M.leafDk, 1);   // midrib
    }
  };
})(QH);
