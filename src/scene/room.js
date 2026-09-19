/* ═══════════════════════════════════════════════════════════════
   scene/room.js — the shell: a floor slab, two walls with their
   thickness showing, tile lines, faint blockwork, grain.

   QH.scenes.room(W, D, H, WT, FT) → { W, D, H, WT, FT, floor(), walls(), bounds() }
   WT is the wall thickness (0.4), FT the floor slab's (0.35).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, stroke, rgb, grain } = QH.draw;

  QH.scenes.room = (W, D, H, WT = 0.4, FT = 0.35) => ({
    W, D, H, WT, FT,

    /** The shell's extent in projected units (the projection at s = 1). */
    bounds() { return { x0: -(D + WT), x1: W + WT, y0: -(H + WT), y1: (W + D) * 0.5 + FT }; },

    floor() {
      box(0, 0, -FT, W, D, FT, M.navyDk, { colTop: M.navyDk, top: 1, left: 0.85, right: 0.65, edgeCol: M.navy });
      for (let i = 0; i <= W; i += 2) stroke([[i, 0, 0], [i, D, 0]], rgb(M.navy));      // tiles, two units square
      for (let j = 0; j <= D; j += 2) stroke([[0, j, 0], [W, j, 0]], rgb(M.navy));
      grain(Math.round(W * D * 2.2), M.floor, 3, 1, R => [R() * W, R() * D, 0.01]);
      grain(Math.round(W * D * 0.8), M.ink, 4, 1, R => [R() * W, R() * D, 0.01]);
    },

    walls() {
      box(-WT, -WT, 0, WT, D + WT, H, M.steel, { colRight: M.wall, right: 1, left: 0.8, top: 1, edgeCol: M.ink });
      box(0, -WT, 0, W, WT, H, M.steel, { colLeft: M.wallB, left: 1, right: 0.6, top: 1, edgeCol: M.ink });
      // faint blockwork, staggered every other course
      const cl = rgb(M.floor), cb = rgb(M.ink);
      for (let z = 1; z < H; z++) { stroke([[0, 0, z], [0, D, z]], cl); stroke([[0, 0, z], [W, 0, z]], cb); }
      for (let z = 0; z < H; z++) {
        const off = z & 1;
        for (let y = off; y < D; y += 2) stroke([[0, y, z], [0, y, z + 1]], cl);
        for (let x = off; x < W; x += 2) stroke([[x, 0, z], [x, 0, z + 1]], cb);
      }
      grain(Math.round(D * H * 1.5), M.navyDk, 8, 1, R => [0.01, R() * D, R() * H]);
      grain(Math.round(W * H * 1.2), M.ink, 9, 1, R => [R() * W, 0.01, R() * H]);
    },
  });
})(QH);
