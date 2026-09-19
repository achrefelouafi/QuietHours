/* ═══════════════════════════════════════════════════════════════
   assets/poster.js — framed print, dark paper, orange art.

   poster(wall, u, z, w, h, o)
     o.art = 'mountain' (two peaks, two lines) | 'sun' (a disc,
     three lines) | 'moon' (a full moon over two lines of small
     print) | 'stars' (a scatter of stars, cream frame).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, rgb, poly, beam, dot } = QH.draw;
  const { rnd } = QH;
  const light = QH.light;

  QH.assets.poster = (wall, u, z, w, h, o = {}) => {
    const Wl = W[wall], F = 0.06, art = o.art || 'mountain';
    const night = art === 'moon' || art === 'stars';
    Wl.rect(u - F, z - F, u + w + F, z + h + F, rgb(night ? M.tan : M.grey), 0.04);
    Wl.rect(u, z, u + w, z + h, rgb(night ? M.ink : M.navyDk), 0.05);
    const ink = light.warm(M.orangeDk, M.orange);
    const pt = (fu, fz) => Wl.pt(u + w * fu, z + h * fz, 0.06);
    if (art === 'moon') {
      // a scatter of stars, the moon, two lines of small print under it
      const R = rnd(o.seed || 31);
      for (let i = 0; i < 14; i++) { const p = pt(0.08 + R() * 0.84, 0.1 + R() * 0.84); dot(p[0], p[1], p[2], 1, R() > 0.7 ? M.greyLt : M.grey); }
      const r = Math.min(w, h) * 0.3, mu = u + w / 2, mz = z + h * 0.68;
      Wl.disc(mu, mz, r, rgb(light.warm(M.tan, M.amber)), 16, 0.06);
      Wl.disc(mu - r * 0.3, mz + r * 0.25, r * 0.22, rgb(light.warm(M.woodLt, M.orangeLt)), 8, 0.07);   // maria
      Wl.disc(mu + r * 0.35, mz - r * 0.2, r * 0.16, rgb(light.warm(M.woodLt, M.orangeLt)), 8, 0.07);
      for (let i = 0; i < 2; i++) beam(pt(0.22, 0.34 - i * 0.07), pt(0.78 - i * 0.16, 0.34 - i * 0.07), 0.025, M.greyLt, 1);
      beam(pt(0.3, 0.16), pt(0.7, 0.16), 0.02, M.grey, 1);
    } else if (art === 'stars') {
      const R = rnd(o.seed || 37);
      for (let i = 0; i < 22; i++) {
        const p = pt(0.08 + R() * 0.84, 0.08 + R() * 0.84), big = R() > 0.8;
        dot(p[0], p[1], p[2], big ? 2 : 1, big ? M.cream : R() > 0.5 ? M.greyLt : M.grey);
      }
      const p = pt(0.62, 0.7); dot(p[0], p[1], p[2], 2, M.amber);
    } else if (art === 'mountain') {
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
