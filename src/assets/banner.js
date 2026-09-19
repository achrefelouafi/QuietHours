/* ═══════════════════════════════════════════════════════════════
   assets/banner.js — a hanging banner on a wall: a dark cloth
   panel off a steel rail, the sponsor's mark glowing on it, two
   tabs weighting the hem.

   banner(wall, u, z, w, h, o)
     the cloth from (u, z) to (u+w, z+h). o.glow 0..1 (1) is how
     bright the mark is.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, stroke, rgb } = QH.draw;
  const { mix } = QH;
  const A = QH.assets;

  QH.assets.banner = (wall, u, z, w, h, o = {}) => {
    const Wl = W[wall], glow = o.glow ?? 1, off = 0.1;
    // the rail, and the two straps the cloth hangs by
    Wl.box(u - 0.12, z + h + 0.08, w + 0.24, 0.1, 0.16, M.greyDk, { colTop: M.grey, left: 0.9, right: 0.7 });
    for (const su of [u + w * 0.15, u + w * 0.85]) Wl.rect(su - 0.05, z + h - 0.05, su + 0.05, z + h + 0.1, rgb(M.ink), off + 0.01);
    // the cloth: a shade lighter down its middle where the mark lights it
    Wl.rect(u, z, u + w, z + h, rgb(M.navyDk), off);
    Wl.rect(u + w * 0.2, z + h * 0.2, u + w * 0.8, z + h * 0.8, rgb(mix(M.navyDk, M.blueDk, 0.45 * glow)), off + 0.005);
    stroke([Wl.pt(u, z, off + 0.01), Wl.pt(u + w, z, off + 0.01), Wl.pt(u + w, z + h, off + 0.01), Wl.pt(u, z + h, off + 0.01)], rgb(M.ink), 1, true);
    // the mark, a good third of the cloth high, in the middle
    const ms = Math.min(w * 0.5, h * 0.34), mu = u + w / 2 - ms * 0.56, mz = z + h / 2 - ms * 0.5;
    A.ledScreen.mark((fx, fz) => Wl.pt(mu + fx, mz + fz, off + 0.01), ms, mix(M.slate, M.ice, glow));
    // the tabs on the hem
    for (const tu of [u + w * 0.3, u + w * 0.7]) Wl.disc(tu, z - 0.08, 0.06, rgb(M.greyDk), 6, off + 0.02);
  };
})(QH);
