/* ═══════════════════════════════════════════════════════════════
   assets/lowBookcase.js — low two-cubby unit, books inside, a
   radio and a small box on top.

   lowBookcase(x, y, o)
     footprint x..x+w (2.4) by y..y+d (1.0); the open side faces +y.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectY, rgb } = QH.draw;
  const light = QH.light, A = QH.assets;

  QH.assets.lowBookcase = (x, y, o = {}) => {
    const w = o.w || 2.4, d = o.d || 1.0, h = o.h || 1.2;
    box(x, y, 0, w, d, h, M.navy, { colTop: M.navyLt });
    const cw = (w - 0.4) / 2;
    for (let i = 0; i < 2; i++) {
      const cx = x + 0.13 + i * (cw + 0.14);
      rectY(y + d + 0.01, cx, 0.15, cx + cw, h - 0.15, rgb(M.ink));
      A.bookRow(cx + 0.06, y + d - 0.5, 0.15, cw - 0.1, { along: 'x', depth: 0.45, seed: 81 + i, hMin: 0.5, hMax: 0.62, topK: 0.5 });
    }
    if (o.bare) return;
    A.radio(x + 0.7, y + 0.2, h, { w: 1.0, d: 0.6, h: 0.35, col: light.warm(M.rustLt, M.orange), colTop: light.warm(M.orangeDk, M.orangeLt) });
    A.smallBox(x + 1.85, y + 0.3, h, 0.4, 0.4, 0.25, M.navy);
  };
})(QH);
