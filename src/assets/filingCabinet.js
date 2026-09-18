/* ═══════════════════════════════════════════════════════════════
   assets/filingCabinet.js — three drawers, small handles, a book
   left on top.

   filingCabinet(x, y, o)
     footprint x..x+w (1.0) by y..y+d (1.0); drawers face +y.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectY, rgb, sh } = QH.draw;
  const light = QH.light, A = QH.assets;

  QH.assets.filingCabinet = (x, y, o = {}) => {
    const w = o.w || 1.0, d = o.d || 1.0, h = o.h || 1.75;
    box(x, y, 0, w, d, h, M.navy, { colTop: M.navyLt, rim: light.warm(M.rust, M.orangeDk) });
    const dh = (h - 0.2) / 3;
    for (let i = 0; i < 3; i++) {
      const z0 = 0.12 + i * dh, z1 = z0 + dh - 0.08, zm = (z0 + z1) / 2;
      rectY(y + d + 0.01, x + 0.08, z0, x + w - 0.08, z1, sh(M.navyDk, 1.15));
      rectY(y + d + 0.02, x + w * 0.4, zm - 0.03, x + w * 0.6, zm + 0.03, rgb(M.greyLt));
    }
    if (!o.bare) A.book(x + 0.2, y + 0.25, h, 0.6, 0.45, M.navy);
  };
})(QH);
