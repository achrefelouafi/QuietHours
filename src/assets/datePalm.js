/* ═══════════════════════════════════════════════════════════════
   assets/datePalm.js — a tall palm: a ringed trunk leaning a
   little, a crown of fronds arching out and over, each feathered
   with leaflets, a bunch of dates under it. The booth's two stand
   behind its walls, so only their crowns show, peering over.

   datePalm(x, y, z, o)
     the trunk's foot at (x, y, z). o.h (7.5) is the trunk's
     height, o.n (8) the fronds, o.size (2.0) the longest.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { beam, dot, rgb, disc } = QH.draw;
  const { TAU, rnd } = QH;
  const sway = QH.sway;

  QH.assets.datePalm = (x, y, z, o = {}) => {
    const h = o.h || 7.5, n = o.n || 8, size = o.size || 2.0, R = rnd(o.seed || 113), lean = o.lean ?? 0.35;
    // the trunk, in rings: each a little narrower, leaning as it goes up
    const K = Math.round(h / 0.45);
    let px = x, py = y;
    for (let i = 0; i < K; i++) {
      const f = i / K, nx = x + lean * ((i + 1) / K) ** 1.6, ny = y - lean * 0.4 * ((i + 1) / K) ** 1.6;
      beam([px, py, z + i * 0.45], [nx, ny, z + (i + 1) * 0.45], 0.42 - 0.14 * f, i % 2 ? M.woodDk : M.wood, 1);
      beam([px, py, z + i * 0.45 + 0.02], [nx, ny, z + i * 0.45 + 0.1], 0.44 - 0.14 * f, M.woodDk, 0.8);   // the ring
      px = nx; py = ny;
    }
    const top = [px, py, z + h];
    const S = sway.plant('datePalm', top[0], top[1], top[2], size, 0.2);
    // the dates: two bunches of orange beads under the crown
    for (const a of [0.9, 3.6]) for (let i = 0; i < 5; i++) dot(top[0] + Math.cos(a) * 0.35 + (R() - 0.5) * 0.2, top[1] + Math.sin(a) * 0.35 + (R() - 0.5) * 0.2, top[2] - 0.15 - R() * 0.5, 2, i % 2 ? M.orange : M.orangeLt);
    // the fronds: a stalk in four lengths arching up and over, leaflets close along both sides
    const fronds = [];
    for (let i = 0; i < n; i++) fronds.push({ i, a: (i + R() * 0.6) / n * TAU, l: size * (0.7 + R() * 0.3), rise: 0.45 + R() * 0.2, lt: R() > 0.5 });
    fronds.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));
    for (const F of fronds) {
      const ux = Math.cos(F.a), uy = Math.sin(F.a), col = F.lt ? M.leafLt : M.leaf, K = 4;
      const pts = [top];
      for (let j = 1; j <= K; j++) {
        const f = j / K, r = F.l * f * 0.9, zz = top[2] + F.l * (F.rise * Math.sin(f * Math.PI * 0.9) - 0.22 * f * f);
        pts.push(S.at(F.i, [top[0] + ux * r, top[1] + uy * r, zz], f));
      }
      for (let j = 1; j < pts.length; j++) beam(pts[j - 1], pts[j], 0.07 - 0.012 * j, M.leafDk, 1);
      for (let j = 1; j < pts.length; j++) {
        const a = pts[j - 1], b = pts[j], m = 5;
        for (let k = 0; k < m; k++) {
          const f = (k + 0.5) / m, q = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
          const L = 0.26 - 0.03 * j, s = k % 2 ? 1 : -1;
          beam(q, [q[0] - uy * s * L * 0.7 + ux * L * 0.2, q[1] + ux * s * L * 0.7 + uy * L * 0.2, q[2] - L * 0.35], 0.07, col, 1);
        }
      }
    }
    disc(top[0], top[1], top[2] + 0.02, 0.22, rgb(M.leafDk), 8);
  };
})(QH);
