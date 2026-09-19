/* ═══════════════════════════════════════════════════════════════
   assets/plantShelf.js — narrow open shelf: books on two boards,
   a trailing plant on top with vines down the side.

   plantShelf(x, y, o)
     footprint x..x+w (1.2) by y..y+d (0.55); the open side faces +y.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box } = QH.draw;
  const A = QH.assets;

  QH.assets.plantShelf = (x, y, o = {}) => {
    const w = o.w || 1.2, d = o.d || 0.55, H = o.h || 2.4;
    box(x, y, 0, 0.08, 0.08, H, M.navyLt);
    box(x + w - 0.08, y, 0, 0.08, 0.08, H, M.navyLt);
    [0.1, 1.2, H - 0.08].forEach((z, i) => {
      box(x, y, z, w, d, 0.08, M.navy, { colTop: M.navyLt });
      if (i < 2) A.bookRow(x + 0.12, y + 0.05, z + 0.08, w - 0.24, { along: 'x', depth: d - 0.1, seed: 61 + i, hMin: 0.7, hMax: 0.95 });
    });
    box(x, y + d - 0.08, 0, 0.08, 0.08, H, M.navyLt);
    box(x + w - 0.08, y + d - 0.08, 0, 0.08, 0.08, H, M.navyLt);
    A.pottedPlant(x + w * 0.55, y + d * 0.5, H, { r: 0.22, kind: 'leafy', size: 0.6, seed: 63 });
    A.vines(x + w, y + d * 0.5, H + 0.2, 1.6, 4, 64);
  };
})(QH);
