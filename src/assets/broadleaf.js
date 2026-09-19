/* ═══════════════════════════════════════════════════════════════
   assets/broadleaf.js — the big broad-leaved plant: a fan of
   wide, pointed leaves on short stems, the lower ones leaning out
   and over, each with a dark midrib and an ink edge, out of a
   terracotta pot with a thick lip.

   broadleaf(x, y, z, o)
     pot centre (x, y) on a surface at z. o.size is the longest
     leaf (1.5), o.n the count (9), o.r the pot radius (0.42).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cyl, poly, stroke, beam, rgb } = QH.draw;
  const { TAU, rnd, lerp } = QH;
  const light = QH.light;

  QH.assets.broadleaf = (x, y, z, o = {}) => {
    const r = o.r || 0.42, ph = o.ph || 0.7, size = o.size || 1.5, n = o.n || 9, R = rnd(o.seed || 59);
    const pot = light.warm(M.rustLt, M.orangeLt), lip = light.warm(M.orangeDk, M.bright);
    cyl(x, y, z, r * 0.74, ph - 0.16, pot, { n: 14, rt: r * 0.94, top: false });
    cyl(x, y, z + ph - 0.16, r, 0.16, lip, { n: 14, colTop: M.woodDk, topK: 1 });

    const zb = z + ph - 0.04, leaves = [];
    for (let i = 0; i < n; i++) {
      const low = i % 2 === 0;                                       // alternate: a low leaf leaning out, a tall one standing
      leaves.push({ a: (i + R() * 0.5) / n * TAU, l: size * (low ? 0.75 + R() * 0.25 : 0.55 + R() * 0.3),
                    rise: low ? 0.35 + R() * 0.2 : 0.9 + R() * 0.3, lt: R() > 0.5, w: 0.22 + R() * 0.1 });
    }
    leaves.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));   // far leaves first
    for (const L of leaves) {
      const ux = Math.cos(L.a), uy = Math.sin(L.a), vx = -uy, vy = ux, col = L.lt ? M.leafLt : M.leaf;
      const stem = [x + ux * 0.08, y + uy * 0.08, zb + 0.3];
      beam([x + ux * 0.04, y + uy * 0.04, zb], stem, 0.05, M.leafDk, 1);
      // the leaf: from the stem up and out to its widest, then on to a pointed tip that nods over
      const at = (f, side) => {
        const out = L.l * f, up = L.l * L.rise * (f < 0.6 ? f / 0.6 : 1 - (f - 0.6) * 1.1);
        const wd = L.w * Math.sin(Math.min(1, f / 0.9) * Math.PI) * side;
        return [stem[0] + ux * out + vx * wd, stem[1] + uy * out + vy * wd, stem[2] + up];
      };
      const edge = [at(0, 0), at(0.2, 0.7), at(0.45, 1), at(0.7, 0.85), at(0.9, 0.45), at(1, 0), at(0.9, -0.45), at(0.7, -0.85), at(0.45, -1), at(0.2, -0.7)];
      poly(edge, rgb(col));
      poly([at(0.05, 0), at(0.3, 0.45), at(0.55, 0.55), at(0.8, 0.35), at(0.95, 0)], rgb(L.lt ? M.leaf : M.leafDk));   // the shaded half
      stroke([at(0, 0), at(0.35, 0), at(0.7, 0), at(1, 0)], rgb(M.leafDk));                                              // midrib
      stroke(edge, rgb(M.ink), 1, true);
    }
  };
})(QH);
