/* ═══════════════════════════════════════════════════════════════
   assets/desk.js — the desk itself: orange top, a pedestal with
   three drawers at the +x end, a thin leg panel at the other.
   What sits on it is placed by the scene, at desk.H.

   desk(x, y, o)
     footprint x..x+w (7.0) by y..y+d (1.9); drawers face +y.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectY, rgb, sh, grain } = QH.draw;
  const light = QH.light;

  const H = 2.4;                                                     // height of the top surface
  const desk = (x, y, o = {}) => {
    const w = o.w || 7.0, d = o.d || 1.9, T = 0.16;
    const rim = light.warm(M.rust, M.orangeDk);

    // pedestal with drawers
    const pw = o.pedestal || 1.8, px0 = x + w - pw - 0.1;
    box(px0, y + 0.1, 0, pw, d - 0.2, H - T, M.navy, { colTop: M.navyLt, rim });
    const dh = (H - T - 0.3) / 3;
    for (let i = 0; i < 3; i++) {
      const z0 = 0.2 + i * dh, z1 = z0 + dh - 0.08, zm = (z0 + z1) / 2;
      rectY(y + d - 0.09, px0 + 0.1, z0, px0 + pw - 0.1, z1, sh(M.navy, 0.95));
      rectY(y + d - 0.08, px0 + pw * 0.3, zm - 0.03, px0 + pw * 0.7, zm + 0.04, rgb(light.warm(M.orangeDk, M.bright)));
    }
    // a thin leg panel at the other end
    box(x + 0.15, y + 0.15, 0, 0.14, d - 0.3, H - T, M.navyDk, { colTop: M.navy });

    // the top: dull wood until the lamp lights it
    const top = light.warm(M.woodDk, M.orangeLt), edge = light.warm(M.wood, M.orange);
    box(x, y, H - T, w, d, T, edge, { colTop: top, top: 1, left: 0.9, right: 0.7, rim: light.warm(M.woodLt, M.amber) });
    grain(Math.round(w * d * 6), light.warm(M.wood, M.bright), 31, 1, R => [x + R() * w, y + R() * d, H + 0.01]);
  };
  desk.H = H;
  QH.assets.desk = desk;
})(QH);
