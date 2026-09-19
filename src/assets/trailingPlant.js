/* ═══════════════════════════════════════════════════════════════
   assets/trailingPlant.js — a plant in a dark pot on a shelf,
   spilling over the edge: strands that reach out level and then
   fall, with leaves ticked along them. A pothos, with rounded
   leaves, or a fern, with feathery fronds.

   trailingPlant(x, y, z, o)
     pot centre (x, y) on a surface at z. o.kind = 'pothos' |
     'fern'; o.drop is how far the longest strand hangs (1.6),
     o.n the strand count (7), o.r the pot radius (0.28).
     o.dir = [dx, dy] is the way off the shelf (out from the
     wall); the strands fan round it, a few going the other way
     and stopping short on the board.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cyl, ring, beam, rgb } = QH.draw;
  const { TAU, rnd } = QH;
  const light = QH.light;

  QH.assets.trailingPlant = (x, y, z, o = {}) => {
    const r = o.r || 0.28, ph = o.ph || 0.4, drop = o.drop || 1.6, n = o.n || 7, kind = o.kind || 'pothos';
    const [dx, dy] = o.dir || [1, 1], base = Math.atan2(dy, dx), R = rnd(o.seed || 67);
    cyl(x, y, z, r * 0.82, ph, o.pot || M.navyDk, { n: 12, rt: r, colTop: M.woodDk, topK: 1 });
    ring(x, y, z + ph + 0.005, r, rgb(light.warm(M.rustDk, M.rust)), 12);

    const zb = z + ph - 0.03, strands = [];
    for (let i = 0; i < n; i++) {
      const a = base + (i / (n - 1) - 0.5) * TAU * 0.62 + (R() - 0.5) * 0.3;
      const off = Math.cos(a - base);                                  // 1 straight out, 0 sideways
      strands.push({ a, out: 0.35 + R() * 0.3 + off * 0.2, fall: off > 0.1 ? drop * (0.45 + R() * 0.55) : 0.15 + R() * 0.15, lt: R() > 0.5 });
    }
    strands.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));
    for (const s of strands) {
      const ux = Math.cos(s.a), uy = Math.sin(s.a), col = s.lt ? M.leafLt : M.leaf;
      // a curve from the rim: out and a little up, over the edge, then down
      const p0 = [x + ux * r * 0.7, y + uy * r * 0.7, zb];
      const p1 = [x + ux * s.out, y + uy * s.out, zb + 0.18];
      const p2 = [x + ux * (s.out + 0.12), y + uy * (s.out + 0.12), zb - s.fall];
      const at = t => [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
                       (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
                       (1 - t) * (1 - t) * p0[2] + 2 * (1 - t) * t * p1[2] + t * t * p2[2]];
      const K = 3 + Math.round(s.fall / 0.22);
      let prev = at(0);
      for (let k = 1; k <= K; k++) {
        const t = k / K, p = at(t);
        beam(prev, p, 0.03, M.leafDk, 1);
        if (kind === 'fern') {
          const w = 0.13 * (1 - t * 0.4);
          beam(p, [p[0] - uy * w, p[1] + ux * w, p[2] - w * 0.5], 0.06, col, 1);
          beam(p, [p[0] + uy * w, p[1] - ux * w, p[2] - w * 0.5], 0.06, col, 1);
        } else {
          const side = k % 2 ? 1 : -1, w = 0.09;
          beam([p[0] + uy * side * 0.03, p[1] - ux * side * 0.03, p[2]], [p[0] + uy * side * w * 1.6, p[1] - ux * side * w * 1.6, p[2] - w], w * 1.3, k % 3 ? col : M.leafLt, 1);
        }
        prev = p;
      }
    }
    // a small tuft standing up in the pot
    for (let i = 0; i < 5; i++) {
      const a = R() * TAU, l = 0.18 + R() * 0.15;
      beam([x, y, zb], [x + Math.cos(a) * l, y + Math.sin(a) * l, zb + l * 1.1], 0.07, i % 2 ? M.leaf : M.leafLt, 1);
    }
  };
})(QH);
