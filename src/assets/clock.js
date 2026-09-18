/* ═══════════════════════════════════════════════════════════════
   assets/clock.js — round wall clock, grey face, orange second
   hand ticking round.

   clock(wall, u, z, r, t)
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, rgb, beam, dot } = QH.draw;
  const { TAU } = QH;

  QH.assets.clock = (wall, u, z, r = 0.6, t = 0) => {
    const Wl = W[wall];
    Wl.disc(u, z, r + 0.08, rgb(M.ink), 16, 0.02);        // the rim's depth
    Wl.disc(u, z, r + 0.08, rgb(M.navyLt), 16, 0.14);
    Wl.disc(u, z, r, rgb(M.greyLt), 16, 0.15);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU, p = Wl.pt(u + Math.cos(a) * r * 0.8, z + Math.sin(a) * r * 0.8, 0.16);
      dot(p[0], p[1], p[2], 1, M.greyDk);
    }
    // 3 o'clock is the viewer's right: -u on the left wall, +u on the back wall
    const dir = wall === 'L' ? -1 : 1;
    const hand = (frac, len, w, col) => {
      const th = frac * TAU;
      beam(Wl.pt(u, z, 0.17), Wl.pt(u + dir * Math.sin(th) * r * len, z + Math.cos(th) * r * len, 0.17), w, col, 1);
    };
    hand((10 + 10 / 60) / 12, 0.5, 0.06, M.greyDk);
    hand(10 / 60, 0.7, 0.045, M.greyDk);
    hand((t % 60) / 60, 0.75, 0.03, M.orange);
    Wl.disc(u, z, 0.05, rgb(M.orange), 6, 0.18);
  };
})(QH);
