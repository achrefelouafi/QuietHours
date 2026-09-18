/* ═══════════════════════════════════════════════════════════════
   assets/chest.js — storage chest with a lid, a few books standing
   on it and a small box beside them.

   chest(x, y, o)
     footprint x..x+w (1.8) by y..y+d (1.4), o.h (1.0) tall.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box } = QH.draw;
  const light = QH.light, A = QH.assets;

  QH.assets.chest = (x, y, o = {}) => {
    const w = o.w || 1.8, d = o.d || 1.4, h = o.h || 1.0;
    box(x, y, 0, w, d, h - 0.12, M.navy, { colTop: M.navyLt });
    box(x - 0.05, y - 0.05, h - 0.12, w + 0.1, d + 0.1, 0.12, M.navy, { colTop: M.navyLt, rim: light.warm(M.rust, M.orangeDk) });
    if (o.bare) return;
    A.bookRow(x + 0.25, y + 0.3, h, 0.85, { along: 'x', depth: 0.6, seed: 91, hMin: 0.55, hMax: 0.72, cols: [M.orange, M.cream, M.slate, M.navyLt] });
    A.smallBox(x + 1.15, y + 0.45, h, 0.45, 0.5, 0.2, M.navyDk, { label: false });
  };
})(QH);
