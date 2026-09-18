/* ═══════════════════════════════════════════════════════════════
   assets/keyboard.js — keyboard and mouse.

   keyboard(x, y, z, o)   footprint x..x+w (1.9) by y..y+d (0.6)
   mouse(x, y, z)
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, dot } = QH.draw;

  QH.assets.keyboard = (x, y, z, o = {}) => {
    const w = o.w || 1.9, d = o.d || 0.6;
    box(x, y, z, w, d, 0.07, M.navyDk, { colTop: M.navy, top: 1.05 });
    const cols = Math.floor((w - 0.2) / 0.12);
    for (let i = 0; i < cols; i++) for (let j = 0; j < 4; j++) dot(x + 0.12 + i * 0.12, y + 0.1 + j * 0.12, z + 0.08, 1, M.slate);
  };

  QH.assets.mouse = (x, y, z) => {
    box(x, y, z, 0.28, 0.42, 0.11, M.navyDk, { colTop: M.navy, top: 1.05 });
    dot(x + 0.14, y + 0.12, z + 0.12, 1, M.greyLt);
  };
})(QH);
