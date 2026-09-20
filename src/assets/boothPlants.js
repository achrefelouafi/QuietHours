/* ═══════════════════════════════════════════════════════════════
   assets/boothPlants.js — the potted plants round the booth, all
   in terracotta. Each takes the pot's centre (x, y) on a surface
   at z, and sways under the pointer like every plant here.

   tallPot(x, y, z, o)   — a snake plant in a tall orange pot, a
                           dark band low on it. o.size (1.9), o.r (0.42), o.n (11)
   bushPot(x, y, z, o)   — a bushy thing in a squat pot with a
                           dark rim. o.size (1.1), o.r (0.5), o.n (14)
   cactusPot(x, y, z, o) — a small cactus, a column with two arms,
                           in a little pot. o.size (0.7), o.r (0.28)
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cyl, ring, beam, dot, disc, rgb } = QH.draw;
  const { TAU, rnd } = QH;
  const light = QH.light, sway = QH.sway;
  const A = QH.assets;

  const clay = () => light.warm(M.rustLt, M.orange), clayDk = () => light.warm(M.rust, M.rustLt);

  A.tallPot = (x, y, z, o = {}) => {
    const r = o.r || 0.42, ph = o.ph || 1.05, size = o.size || 1.9, n = o.n || 11, R = rnd(o.seed || 121);
    cyl(x, y, z, r * 0.82, ph, clay(), { n: 14, rt: r, colTop: M.woodDk, topK: 1 });
    cyl(x, y, z + 0.08, r * 0.84, ph * 0.22, clayDk(), { n: 14, rt: r * 0.87, top: false, edge: false });      // the band low down
    ring(x, y, z + ph - 0.08, r * 0.99, rgb(clayDk()), 14);
    const zb = z + ph - 0.05, leaves = [], S = sway.plant('tallPot', x, y, zb, size);
    for (let i = 0; i < n; i++) leaves.push({ i, a: R() * TAU, l: size * (0.5 + R() * 0.5), o: 0.04 + R() * r * 0.45, w: 0.08 + R() * 0.06, lt: R() > 0.5, bend: 0.2 + R() * 0.3 });
    leaves.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));
    for (const L of leaves) {
      const ux = Math.cos(L.a), uy = Math.sin(L.a), c = L.lt ? M.leafLt : M.leaf;
      const b = [x + ux * L.o, y + uy * L.o, zb];
      const m = S.at(L.i, [x + ux * (L.o + L.l * L.bend * 0.5), y + uy * (L.o + L.l * L.bend * 0.5), zb + L.l * 0.6], 0.6);
      const t = S.at(L.i, [x + ux * (L.o + L.l * L.bend), y + uy * (L.o + L.l * L.bend), zb + L.l], 1);
      beam(b, m, L.w, c, 1);
      beam(m, t, L.w * 0.5, c, 1.05);
      beam([b[0], b[1], b[2] + 0.05], m, L.w * 0.3, M.leafDk, 1);
    }
  };

  A.bushPot = (x, y, z, o = {}) => {
    const r = o.r || 0.5, ph = o.ph || 0.55, size = o.size || 1.1, n = o.n || 14, R = rnd(o.seed || 127);
    cyl(x, y, z, r * 0.88, ph, clay(), { n: 14, rt: r, colTop: M.woodDk, topK: 1 });
    cyl(x, y, z + ph - 0.16, r * 1.0, 0.16, M.navy, { n: 14, rt: r * 1.04, colTop: M.woodDk, topK: 1 });         // the dark rim
    const zb = z + ph - 0.04, ls = [], S = sway.plant('bushPot', x, y, zb, size);
    for (let i = 0; i < n; i++) ls.push({ i, a: R() * TAU, l: size * (0.45 + R() * 0.55), lt: R() > 0.5, up: 0.5 + R() * 0.5 });
    ls.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));
    for (const L of ls) {
      const ux = Math.cos(L.a), uy = Math.sin(L.a), c = L.lt ? M.leafLt : M.leaf;
      const m = S.at(L.i, [x + ux * L.l * 0.35, y + uy * L.l * 0.35, zb + L.l * L.up * 0.7], 0.6);
      const t = S.at(L.i, [x + ux * L.l * 0.55, y + uy * L.l * 0.55, zb + L.l * L.up], 1);
      beam([x, y, zb], m, 0.04, M.leafDk, 1);
      beam(m, t, 0.16, c, 1);                                                                  // the leaf, a fat stroke
      beam(m, t, 0.03, M.leafDk, 1);
    }
  };

  A.cactusPot = (x, y, z, o = {}) => {
    const r = o.r || 0.28, ph = o.ph || 0.4, size = o.size || 0.7, R = rnd(o.seed || 131);
    cyl(x, y, z, r * 0.85, ph, clay(), { n: 10, rt: r, colTop: M.woodDk, topK: 1 });
    const zb = z + ph - 0.05, S = sway.plant('cactusPot', x, y, zb, size, 0.5);
    const top = S.at(0, [x, y, zb + size], 1);
    beam([x, y, zb], top, 0.22, M.leaf, 1);                                                      // the column
    beam([x - 0.04, y - 0.04, zb], [top[0] - 0.04, top[1] - 0.04, top[2]], 0.06, M.leafLt, 1);   // its lit ridge
    for (const [s, f] of [[-1, 0.45], [1, 0.62]]) {                                              // two arms, out then up
      const a = [x + s * 0.02, y - s * 0.02, zb + size * f], e = S.at(s > 0 ? 1 : 2, [x + s * 0.2, y - s * 0.2, zb + size * (f + 0.25)], 1);
      beam(a, [a[0] + s * 0.16, a[1] - s * 0.16, a[2]], 0.13, M.leaf, 1);
      beam([a[0] + s * 0.16, a[1] - s * 0.16, a[2]], e, 0.13, M.leaf, 1);
    }
    disc(top[0], top[1], top[2] + 0.02, 0.06, rgb(M.bright), 6);                                                  // a flower on top
  };
})(QH);
