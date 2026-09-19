/* ═══════════════════════════════════════════════════════════════
   assets/rainWindow.js — the bathroom window: two big panes in a
   deep steel frame, a city of towers and spires standing tall
   across the glass with most of their windows lit, rain falling
   past in broken streaks.

   rainWindow(wall, u, z, w, h, t, o)
     glass from (u, z) to (u+w, z+h); t moves the rain. o.skyline
     is how high the towers reach as a fraction of h (0.72),
     o.seed changes the city.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, rgb, beam, dot, poly, clip, unclip } = QH.draw;
  const { rnd } = QH;

  QH.assets.rainWindow = (wall, u, z, w, h, t = 0, o = {}) => {
    const Wl = W[wall], sky = o.skyline ?? 0.72;
    Wl.rect(u, z, u + w, z + h, rgb(M.navyLt), 0.02);
    Wl.rect(u, z + h * 0.55, u + w, z + h, rgb(M.slate), 0.025);                    // the sky, paler high up
    clip([Wl.pt(u, z, 0.02), Wl.pt(u + w, z, 0.02), Wl.pt(u + w, z + h, 0.02), Wl.pt(u, z + h, 0.02)]);

    // a far row of towers, dark and low, then the near row over it
    const R = rnd(o.seed || 13);
    const city = (zBase, hMin, hMax, cols, lit, off) => {
      let bu = u - 0.4;
      while (bu < u + w) {
        const bw = 0.3 + R() * 0.6, bh = h * (hMin + R() * (hMax - hMin)), col = cols[(R() * cols.length) | 0];
        Wl.rect(bu, zBase, bu + bw, zBase + bh, rgb(col), off);
        if (R() > 0.45) {                                                           // a spire, or a stepped cap
          const cu = bu + bw / 2;
          if (R() > 0.5) poly([Wl.pt(bu + bw * 0.2, zBase + bh, off), Wl.pt(bu + bw * 0.8, zBase + bh, off), Wl.pt(cu, zBase + bh + 0.35 + R() * 0.4, off)], rgb(col));
          else Wl.rect(bu + bw * 0.25, zBase + bh, bu + bw * 0.75, zBase + bh + 0.18 + R() * 0.2, rgb(col), off);
        }
        const nc = Math.max(1, (bw / 0.17) | 0), nr = ((bh - 0.15) / 0.2) | 0;
        for (let i = 0; i < nc; i++) for (let j = 0; j < nr; j++) {
          if (R() > lit) continue;
          const p = Wl.pt(bu + 0.05 + i * 0.17, zBase + 0.1 + j * 0.2, off + 0.01);
          dot(p[0], p[1], p[2], R() > 0.6 ? 2 : 1, R() > 0.5 ? M.amber : R() > 0.3 ? M.orange : M.bright);
        }
        bu += bw + 0.03 + R() * 0.08;
      }
    };
    city(z, 0.35, sky, [M.wallB, M.navyDk], 0.25, 0.03);
    city(z, 0.2, sky * 0.72, [M.navyDk, M.ink, M.navy], 0.45, 0.04);

    // rain: each streak a run of short dashes down a slant
    const RN = rnd(19);
    for (let i = 0; i < (o.drops || 34); i++) {
      const su = u + RN() * w, speed = 1.4 + RN() * 2.2, col = RN() > 0.75 ? M.cream : RN() > 0.4 ? M.greyLt : M.sky;
      const top = z + h - ((RN() * h + t * speed) % h), n = 2 + ((RN() * 2) | 0);
      for (let k = 0; k < n; k++) {
        const sz = top - k * 0.32;
        beam(Wl.pt(su - k * 0.05, sz, 0.05), Wl.pt(su - k * 0.05 - 0.03, sz - 0.18, 0.05), 0.03, col, 1);
      }
    }
    unclip();

    // the frame: a deep sill, the jambs on it, a mullion between the panes, the head over all
    const F = 0.22, D = 0.2, fo = { colTop: M.steel, colLeft: M.slate, colRight: M.navy, left: 0.95, right: 0.7 };
    Wl.box(u - F, z - F, w + 2 * F, F, D + 0.08, M.slate, fo);
    Wl.box(u - F, z, F, h, D, M.slate, fo);
    Wl.box(u + w, z, F, h, D, M.slate, fo);
    Wl.box(u + w / 2 - 0.08, z, 0.16, h, D * 0.85, M.slate, fo);
    Wl.box(u - F, z + h, w + 2 * F, F, D, M.slate, fo);
  };
})(QH);
