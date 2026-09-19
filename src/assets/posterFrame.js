/* ═══════════════════════════════════════════════════════════════
   assets/posterFrame.js — a tall print in a pale frame: a dark
   hooded figure against slate, three pale chevrons across its
   chest, a ground of lighter blue under it. A smaller print
   leans at its foot, if asked.

   posterFrame(wall, u, z, w, h, o)
     the frame from (u, z) to (u+w, z+h). o.print puts the small
     one leaning against the wall below it.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, stroke, poly, dot, rgb } = QH.draw;

  QH.assets.posterFrame = (wall, u, z, w, h, o = {}) => {
    const Wl = W[wall], F = 0.1, off = 0.08;
    // the frame, then the picture in it
    Wl.box(u, z, w, h, off, M.silver, { colTop: M.cream, left: 0.95, right: 0.8 });
    Wl.rect(u + F, z + F, u + w - F, z + h - F, rgb(M.slate), off + 0.01);
    const p = (fu, fz) => Wl.pt(u + F + (w - 2 * F) * fu, z + F + (h - 2 * F) * fz, off + 0.02);
    poly([p(0, 0), p(1, 0), p(1, 0.22), p(0, 0.2)], rgb(M.sky));                                                     // the ground
    poly([p(0.12, 0), p(0.88, 0), p(0.8, 0.42), p(0.72, 0.58), p(0.66, 0.75), p(0.7, 0.9), p(0.62, 0.82),           // the figure, hood and shoulders
          p(0.5, 0.86), p(0.38, 0.82), p(0.3, 0.9), p(0.34, 0.75), p(0.28, 0.58), p(0.2, 0.42)], rgb(M.ink));
    poly([p(0.4, 0.62), p(0.6, 0.62), p(0.56, 0.72), p(0.44, 0.72)], rgb(M.greyDk));                                  // the face in the hood
    for (const c of [0.36, 0.5, 0.64]) poly([p(c - 0.05, 0.4), p(c, 0.5), p(c + 0.05, 0.4), p(c, 0.44)], rgb(M.cyan));   // the chevrons
    dot(...p(0.46, 0.68), 1, M.cyan); dot(...p(0.54, 0.68), 1, M.cyan);                                                // its eyes
    stroke([p(0, 0), p(1, 0), p(1, 1), p(0, 1)], rgb(M.greyLt), 1, true);

    // the small print leaning at the foot
    if (o.print) {
      const pw = w * 0.55, ph = h * 0.28, pu = u + w * 0.35;
      Wl.box(pu, 0.02, pw, ph, 0.06, M.greyLt, { colTop: M.silver, left: 0.95, right: 0.8 });
      Wl.rect(pu + 0.06, 0.08, pu + pw - 0.06, ph - 0.04, rgb(M.sky), 0.07);
      Wl.rect(pu + 0.12, 0.14, pu + pw * 0.5, ph * 0.5, rgb(M.slate), 0.08);
      Wl.rect(pu + pw * 0.55, ph * 0.55, pu + pw - 0.12, ph - 0.1, rgb(M.cyan), 0.08);
    }
  };
})(QH);
