/* ═══════════════════════════════════════════════════════════════
   assets/wallShelf.js — one wall-mounted board on two brackets.
   Put things on it from the scene, at z + wallShelf.T.

   wallShelf(wall, u, z, w, o)
     board from u to u+w along the wall, at height z, o.depth
     (0.8) proud of the wall.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W } = QH.draw;
  const light = QH.light;

  const T = 0.1;
  const wallShelf = (wall, u, z, w, o = {}) => {
    const dp = o.depth || 0.8, Wl = W[wall];
    for (const bu of [u + 0.2, u + w - 0.3]) Wl.box(bu, z - 0.45, 0.1, 0.45, dp * 0.6, M.navyDk, { edge: false });
    Wl.box(u, z, w, T, dp, M.navyDk, { colTop: light.warm(M.wood, M.rustLt), rim: light.warm(M.rustLt, M.orange) });
  };
  wallShelf.T = T;
  QH.assets.wallShelf = wallShelf;
})(QH);
