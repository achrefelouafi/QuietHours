/* ═══════════════════════════════════════════════════════════════
   assets/poster.js — framed print, dark paper, orange art.

   poster(wall, u, z, w, h, o)
     o.art = 'mountain' (two peaks, two lines) | 'sun' (a disc,
     three lines).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, rgb, poly, beam, dot } = QH.draw;
  const light = QH.light;

  QH.assets.poster = (wall, u, z, w, h, o = {}) => {
    const Wl = W[wall], F = 0.06;
    Wl.rect(u - F, z - F, u + w + F, z + h + F, rgb(M.grey), 0.04);
    Wl.rect(u, z, u + w, z + h, rgb(M.navyDk), 0.05);
    const ink = light.warm(M.orangeDk, M.orange);
    const pt = (fu, fz) => Wl.pt(u + w * fu, z + h * fz, 0.06);
    if ((o.art || 'mountain') === 'mountain') {
      poly([pt(0.12, 0.35), pt(0.42, 0.68), pt(0.55, 0.52), pt(0.7, 0.62), pt(0.9, 0.35)], rgb(ink));
      beam(pt(0.2, 0.24), pt(0.8, 0.24), 0.03, ink, 1);
      beam(pt(0.25, 0.17), pt(0.7, 0.17), 0.03, ink, 1);
    } else {
      Wl.disc(u + w / 2, z + h * 0.66, Math.min(w, h) * 0.26, rgb(ink), 14, 0.06);
      for (let i = 0; i < 3; i++) beam(pt(0.2, 0.36 - i * 0.07), pt(0.8 - i * 0.12, 0.36 - i * 0.07), 0.03, ink, 1);
      const p = pt(0.3, 0.8); dot(p[0], p[1], p[2], 1, ink);
    }
  };
})(QH);
