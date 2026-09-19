/* ═══════════════════════════════════════════════════════════════
   assets/bathShelves.js — two short teak boards one over the
   other: tins stacked at the wall end of the top one and a fern
   in a dark pot at the other, hanging down past the lower board,
   which carries a row of grey boxes.

   bathShelves(wall, u, z, w, o)
     boards from u to u+w along the wall, the lower one's
     underside at height z, the upper o.gap (1.3) above it, both
     o.depth (0.8) proud of the wall. o.bare leaves them empty.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W } = QH.draw;
  const light = QH.light, A = QH.assets;

  const T = 0.1;
  QH.assets.bathShelves = (wall, u, z, w, o = {}) => {
    const Wl = W[wall], dp = o.depth || 0.8, gap = o.gap || 1.3;
    const wood = light.warm(M.rustLt, M.orange), woodDk = light.warm(M.rust, M.rustLt), rim = light.warm(M.orange, M.amber);
    const board = zz => {
      for (const bu of [u + 0.2, u + w - 0.3]) Wl.box(bu, zz - 0.3, 0.1, 0.3, dp * 0.55, M.navyDk, { edge: false });
      Wl.box(u, zz, w, T, dp, woodDk, { colTop: wood, rim });
    };
    // things stand at (along, out) on a board — the same on either wall
    const at = (along, out, zz) => Wl.pt(u + along, zz, out);

    board(z);
    if (!o.bare) {
      const row = [[0.12, 0.42, 0.5, 0.58, M.grey], [0.6, 0.4, 0.46, 0.62, M.greyLt], [1.05, 0.44, 0.48, 0.54, M.grey], [w - 0.48, 0.34, 0.38, 0.4, M.silver]];
      for (const [a, wd, dd, hh, col] of row) {
        const p = at(a, 0.16, z + T);
        if (wall === 'L') A.tin(p[0], p[1], p[2], dd, wd, hh, { col });
        else A.tin(p[0], p[1], p[2], wd, dd, hh, { col });
      }
    }
    board(z + gap);
    if (!o.bare) {
      const p = at(0.14, 0.18, z + gap + T);
      if (wall === 'L') { A.tin(p[0], p[1], p[2], 0.46, 0.5, 0.42, { col: M.grey, label: M.greyDk }); A.tin(p[0] + 0.03, p[1] + 0.04, p[2] + 0.42, 0.4, 0.42, 0.36, { col: M.greyLt }); }
      else              { A.tin(p[0], p[1], p[2], 0.5, 0.46, 0.42, { col: M.grey, label: M.greyDk }); A.tin(p[0] + 0.04, p[1] + 0.03, p[2] + 0.42, 0.42, 0.4, 0.36, { col: M.greyLt }); }
      const q = at(w - 0.5, dp * 0.55, z + gap + T);
      A.trailingPlant(q[0], q[1], q[2], { kind: 'fern', r: 0.28, drop: gap + 0.5, n: 8, dir: wall === 'L' ? [1, 0.7] : [0.7, 1], seed: 71 });
    }
  };
  QH.assets.bathShelves.T = T;
})(QH);
