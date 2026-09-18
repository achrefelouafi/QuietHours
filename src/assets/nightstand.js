/* ═══════════════════════════════════════════════════════════════
   assets/nightstand.js — two drawers, a book left on top.

   nightstand(x, y, o)
     footprint x..x+w (1.0) by y..y+d (1.0), o.h (1.9) tall.
     Drawers face o.face ('+x' default | '+y').
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectX, rectY, rgb, sh } = QH.draw;
  const light = QH.light, A = QH.assets;

  QH.assets.nightstand = (x, y, o = {}) => {
    const w = o.w || 1.0, d = o.d || 1.0, h = o.h || 1.9, face = o.face || '+x';
    for (const [lx, ly] of [[x + 0.05, y + d - 0.2], [x + w - 0.2, y + d - 0.2], [x + w - 0.2, y + 0.05]]) box(lx, ly, 0, 0.15, 0.15, 0.15, M.ink, { edge: false });
    box(x, y, 0.15, w, d, h - 0.15, M.navy, { colTop: M.navyLt, rim: light.warm(M.rust, M.orangeDk) });
    const dh = (h - 0.6) / 2;
    for (let i = 0; i < 2; i++) {
      const z0 = 0.35 + i * dh, z1 = z0 + dh - 0.1, zm = (z0 + z1) / 2;
      if (face === '+x') {
        rectX(x + w + 0.01, y + 0.1, z0, y + d - 0.1, z1, sh(M.navyDk, 1.15));
        rectX(x + w + 0.02, y + d * 0.4, zm - 0.03, y + d * 0.6, zm + 0.03, rgb(M.greyLt));
      } else {
        rectY(y + d + 0.01, x + 0.1, z0, x + w - 0.1, z1, sh(M.navyDk, 1.15));
        rectY(y + d + 0.02, x + w * 0.4, zm - 0.03, x + w * 0.6, zm + 0.03, rgb(M.greyLt));
      }
    }
    if (!o.bare) A.book(x + 0.2, y + 0.22, h, 0.6, 0.5, light.warm(M.rustLt, M.orange));
  };
})(QH);
