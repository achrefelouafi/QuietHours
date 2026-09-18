/* ═══════════════════════════════════════════════════════════════
   assets/monitor.js — monitor on a stand, lines of something being
   written on the screen, cursor blinking.

   monitor(x, y, z, t, o)
     panel from x to x+w (2.0), back edge at y, screen facing +y,
     stand on a surface at z.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectY, rgb } = QH.draw;
  const { rnd } = QH;

  QH.assets.monitor = (x, y, z, t = 0, o = {}) => {
    const w = o.w || 2.0, h = o.h || 1.45, lift = 0.5;
    // base straddles the panel's back edge; the neck sits under the panel
    // (not in front of it) so its top disappears into the panel's underside
    box(x + w / 2 - 0.35, y - 0.1, z, 0.7, 0.5, 0.06, M.navyDk, { colTop: M.navy });
    box(x + w / 2 - 0.08, y - 0.06, z + 0.06, 0.16, 0.12, lift - 0.06, M.navyDk, { edge: false });
    box(x, y, z + lift, w, 0.08, h, M.navyDk, { colTop: M.navy, left: 0.85 });

    const sy = y + 0.085, z0 = z + lift + 0.06, z1 = z + lift + h - 0.06;
    rectY(sy, x + 0.06, z0, x + w - 0.06, z1, rgb(M.slate));
    const R = rnd(13);
    for (let i = 0; i < 9; i++) {
      const lz = z1 - 0.12 - i * 0.13, ind = (R() * 3 | 0) * 0.14, len = 0.3 + R() * 0.9;
      rectY(sy + 0.01, x + 0.16 + ind, lz, x + 0.16 + ind + len, lz + 0.05, rgb(R() > 0.7 ? M.amber : M.sky));
    }
    if (Math.floor(t * 2) % 2 === 0) rectY(sy + 0.01, x + 0.3, z0 + 0.08, x + 0.38, z0 + 0.15, rgb(M.cream));
  };
})(QH);
