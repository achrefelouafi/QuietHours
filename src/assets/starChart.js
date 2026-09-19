/* ═══════════════════════════════════════════════════════════════
   assets/starChart.js — the framed print over the tub: black
   paper in a thin brass frame, an orange sun, a scatter of
   stars, a constellation drawn in between them and lines of
   small print underneath.

   starChart(wall, u, z, w, h, o)
     paper from (u, z) to (u+w, z+h) on the wall.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, rgb, beam, dot, poly } = QH.draw;
  const { rnd } = QH;
  const light = QH.light;

  QH.assets.starChart = (wall, u, z, w, h, o = {}) => {
    const Wl = W[wall], F = 0.07;
    Wl.rect(u - F, z - F, u + w + F, z + h + F, rgb(light.warm(M.woodLt, M.tan)), 0.04);
    Wl.rect(u - F + 0.03, z - F + 0.03, u + w + F - 0.03, z + h + F - 0.03, rgb(M.ink), 0.05);
    Wl.rect(u, z, u + w, z + h, rgb(M.ink), 0.06);
    const pt = (fu, fz) => Wl.pt(u + w * fu, z + h * fz, 0.07);
    const ink = light.warm(M.orangeDk, M.orange), sun = light.warm(M.rustLt, M.orangeLt);

    const R = rnd(o.seed || 43);
    for (let i = 0; i < 12; i++) { const p = pt(0.1 + R() * 0.8, 0.42 + R() * 0.5); dot(p[0], p[1], p[2], 1, R() > 0.6 ? M.greyLt : M.grey); }
    Wl.disc(u + w * 0.34, z + h * 0.73, Math.min(w, h) * 0.17, rgb(sun), 14, 0.07);

    // the constellation: a line rising to a bright star, a tick off its end
    const C = [[0.42, 0.44], [0.52, 0.5], [0.6, 0.6], [0.68, 0.7], [0.72, 0.78]];
    for (let i = 1; i < C.length; i++) beam(pt(...C[i - 1]), pt(...C[i]), 0.028, ink, 1);
    beam(pt(0.72, 0.78), pt(0.66, 0.79), 0.028, ink, 1);
    for (const c of C) { const p = pt(...c); dot(p[0], p[1], p[2], 1, M.amber); }
    poly([pt(0.7, 0.8), pt(0.75, 0.86), pt(0.78, 0.79)], rgb(ink));

    // the print: rows of dashes, long ones then short
    const R2 = rnd(o.seed2 || 47);
    for (let row = 0; row < 6; row++) {
      const fz = 0.33 - row * 0.05;
      let fu = 0.14;
      while (fu < 0.84) {
        const len = 0.06 + R2() * 0.14;
        if (fu + len > 0.86) break;
        beam(pt(fu, fz), pt(fu + len, fz), 0.022, row < 4 ? ink : light.warm(M.rust, M.orangeDk), 1);
        fu += len + 0.04;
      }
    }
  };
})(QH);
