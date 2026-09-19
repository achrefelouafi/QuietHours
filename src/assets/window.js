/* ═══════════════════════════════════════════════════════════════
   assets/window.js — the window: night sky, a city asleep except
   for the odd lit window, rain running down the glass, a frame
   with a mullion down the middle.

   window(wall, u, z, w, h, t, o)
     glass from (u, z) to (u+w, z+h); t animates the rain.
     o.moon = [fu, fz] hangs a crescent at that fraction of the
     glass; o.skyline caps the buildings at that fraction of h
     (0.5); o.drops thins the rain; o.blind = 0..1 pulls a roller
     blind down over that much of the glass (see rollerBlind.js).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, rgb, beam, dot, clip, unclip } = QH.draw;
  const { rnd } = QH;
  const A = QH.assets;

  QH.assets.window = (wall, u, z, w, h, t = 0, o = {}) => {
    const Wl = W[wall];
    Wl.rect(u, z, u + w, z + h, rgb(M.navyLt), 0.02);
    clip([Wl.pt(u, z, 0.02), Wl.pt(u + w, z, 0.02), Wl.pt(u + w, z + h, 0.02), Wl.pt(u, z + h, 0.02)]);

    if (o.moon) {
      // a crescent: the moon, then the sky bitten out of it
      const mu = u + w * o.moon[0], mz = z + h * o.moon[1], r = o.moonR || 0.42;
      Wl.disc(mu, mz, r + 0.14, rgb(M.slate), 16, 0.025);
      Wl.disc(mu, mz, r, rgb(M.glow), 16, 0.03);
      Wl.disc(mu - r * 0.5, mz + r * 0.3, r * 0.82, rgb(M.slate), 16, 0.035);
      Wl.disc(mu - r * 0.58, mz + r * 0.34, r * 0.72, rgb(M.navyLt), 16, 0.04);
    }

    // the city
    const R = rnd(o.seed || 7);
    let bu = u - 0.3;
    while (bu < u + w) {
      const bw = 0.35 + R() * 0.55, bh = 0.5 + R() * h * (o.skyline ?? 0.5);
      Wl.rect(bu, z, bu + bw, z + bh, rgb(R() > 0.5 ? M.navy : M.navyDk), 0.03);
      const cols = Math.max(1, (bw / 0.18) | 0), rows = (bh / 0.22) | 0;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        if (R() > 0.5) continue;
        const p = Wl.pt(bu + 0.06 + i * 0.18, z + 0.1 + j * 0.22, 0.04);
        dot(p[0], p[1], p[2], R() > 0.4 ? 2 : 1, R() > 0.5 ? M.amber : M.orange);
      }
      bu += bw + 0.05;
    }

    // rain
    const RN = rnd(21);
    for (let i = 0; i < (o.drops || 60); i++) {
      const su = u + RN() * w, speed = 1.5 + RN() * 2, len = 0.3 + RN() * 0.5;
      const sz = z + h - ((RN() * h + t * speed) % h);
      beam(Wl.pt(su, sz, 0.05), Wl.pt(su - 0.12, sz - len, 0.05), 0.03, RN() > 0.7 ? M.greyLt : M.sky, 1);
    }
    unclip();

    // frame and mullion: sill, then the uprights standing on it,
    // then the head last so it sits over their caps
    const F = 0.16, D = 0.12, fo = { colTop: M.steel };
    Wl.box(u - F, z - F, w + 2 * F, F, D, M.slate, fo);
    Wl.box(u - F, z, F, h, D, M.slate, fo);
    Wl.box(u + w, z, F, h, D, M.slate, fo);
    Wl.box(u + w / 2 - 0.07, z, 0.14, h, D * 0.8, M.slate, fo);
    Wl.box(u - F, z + h, w + 2 * F, F, D, M.slate, fo);

    if (o.blind && A.rollerBlind) A.rollerBlind(wall, u - F, z + h + F, w + 2 * F, h * o.blind + F);
  };
})(QH);
