/* ═══════════════════════════════════════════════════════════════
   assets/stripLight.js — a bar of orange light on the wall.
   Its halo is added by the scene's lighting pass.

   stripLight(wall, u, z, w)
     from u to u+w along the wall, centred on height z.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, rgb } = QH.draw;

  QH.assets.stripLight = (wall, u, z, w) => {
    const Wl = W[wall];
    Wl.box(u, z - 0.13, w, 0.26, 0.14, M.navyDk, { colTop: M.navy });
    Wl.rect(u + 0.1, z - 0.07, u + w - 0.1, z + 0.07, rgb(M.bright), 0.15);
    Wl.rect(u + 0.14, z - 0.03, u + w - 0.14, z + 0.03, rgb(M.glow), 0.16);
  };
})(QH);
