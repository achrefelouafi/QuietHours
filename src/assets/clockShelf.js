/* ═══════════════════════════════════════════════════════════════
   assets/clockShelf.js — a teak board on the wall with a round
   clock standing on it, leaning back against the wall, and a
   small aloe in a dark pot beside it.

   clockShelf(wall, u, z, w, t, o)
     board from u to u+w along the wall, its underside at height
     z, o.depth (0.75) proud of the wall; t ticks the second hand.
     o.clockAt / o.plantAt place the two along the board, 0..1.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, rgb, beam, dot } = QH.draw;
  const { TAU } = QH;
  const light = QH.light, A = QH.assets;

  const T = 0.1;
  QH.assets.clockShelf = (wall, u, z, w, t = 0, o = {}) => {
    const Wl = W[wall], dp = o.depth || 0.75, r = o.r || 0.5;
    const wood = light.warm(M.rustLt, M.orange), woodDk = light.warm(M.rust, M.rustLt);
    for (const bu of [u + 0.25, u + w - 0.35]) Wl.box(bu, z - 0.3, 0.1, 0.3, dp * 0.55, M.navyDk, { edge: false });
    Wl.box(u, z, w, T, dp, woodDk, { colTop: wood, rim: light.warm(M.orange, M.amber) });

    // the clock: a charcoal case, a cream face, the marks, the hands — standing on the board just off the wall
    const cu = u + w * (o.clockAt ?? 0.68), cz = z + T + r + 0.06, off = 0.16;
    Wl.disc(cu, cz - 0.03, r + 0.1, rgb(M.ink), 16, off);
    Wl.disc(cu, cz, r + 0.1, rgb(M.navyDk), 16, off + 0.1);
    Wl.disc(cu, cz, r, rgb(M.cream), 16, off + 0.12);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU, p = Wl.pt(cu + Math.cos(a) * r * 0.82, cz + Math.sin(a) * r * 0.82, off + 0.13);
      dot(p[0], p[1], p[2], 1, i % 3 ? M.grey : M.greyDk);
    }
    const dir = wall === 'L' ? -1 : 1;                                 // 3 o'clock is the viewer's right
    const hand = (frac, len, wd, col) => {
      const th = frac * TAU;
      beam(Wl.pt(cu, cz, off + 0.14), Wl.pt(cu + dir * Math.sin(th) * r * len, cz + Math.cos(th) * r * len, off + 0.14), wd, col, 1);
    };
    hand((12 + 5 / 60) / 12, 0.5, 0.06, M.greyDk);
    hand(5 / 60, 0.72, 0.045, M.greyDk);
    hand((t % 60) / 60, 0.76, 0.03, M.orange);
    Wl.disc(cu, cz, 0.05, rgb(M.greyDk), 6, off + 0.15);

    const pu = u + w * (o.plantAt ?? 0.24), pp = Wl.pt(pu, z + T, dp * 0.5);
    A.aloe(pp[0], pp[1], pp[2], { r: 0.22, size: 0.62, n: 8, spread: 0.4, pot: M.greyDk, lip: M.grey, seed: 57 });
  };
  QH.assets.clockShelf.T = T;
})(QH);
