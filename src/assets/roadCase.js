/* ═══════════════════════════════════════════════════════════════
   assets/roadCase.js — an orange flight case: a stitched lid, a
   round teal gauge set into the top, a vent grille in the side
   and a handle. What the booth's gear came in.

   roadCase(x, y, o)
     (x, y) is the far corner. o.w (1.5) along x, o.d (1.3) along
     y, o.h (1.4) high.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectX, rectY, cyl, disc, dot, beam, rgb } = QH.draw;
  const light = QH.light;

  QH.assets.roadCase = (x, y, o = {}) => {
    const w = o.w || 1.5, d = o.d || 1.3, h = o.h || 1.4;
    const c = light.warm(M.rustLt, M.orange), top = light.warm(M.orangeDk, M.orangeLt);
    box(x, y, 0, w, d, h - 0.16, c, { colTop: top, left: 0.88, right: 0.68 });
    box(x - 0.03, y - 0.03, h - 0.16, w + 0.06, d + 0.06, 0.16, c, { colTop: top, left: 0.88, right: 0.68, rim: light.warm(M.orange, M.amber) });
    // the stitching round the lid, and the seam where it closes
    for (let i = 0.12; i < w; i += 0.18) { dot(x + i, y + 0.08, h + 0.01, 1, M.rustDk); dot(x + i, y + d - 0.08, h + 0.01, 1, M.rustDk); }
    for (let j = 0.12; j < d; j += 0.18) { dot(x + 0.08, y + j, h + 0.01, 1, M.rustDk); dot(x + w - 0.08, y + j, h + 0.01, 1, M.rustDk); }
    beam([x - 0.03, y + d + 0.04, h - 0.16], [x + w + 0.03, y + d + 0.04, h - 0.16], 0.025, M.rustDk, 1);
    beam([x + w + 0.04, y + d + 0.03, h - 0.16], [x + w + 0.04, y - 0.03, h - 0.16], 0.025, M.rustDk, 1);
    // the gauge in the top: a teal dial in a ring
    cyl(x + w * 0.5, y + d * 0.42, h, 0.22, 0.07, M.rustDk, { n: 10, colTop: M.rustDk, topK: 1 });
    disc(x + w * 0.5, y + d * 0.42, h + 0.08, 0.17, rgb(M.leaf), 10);
    disc(x + w * 0.5, y + d * 0.42, h + 0.085, 0.1, rgb(M.leafLt), 8);
    dot(x + w * 0.5 - 0.02, y + d * 0.42 - 0.06, h + 0.09, 1, M.cream);
    // the grille in the +x side, the handle on the +y
    rectX(x + w + 0.01, y + d * 0.25, h * 0.4, y + d * 0.75, h * 0.56, rgb(M.silver));
    for (let j = 0.3; j < 0.72; j += 0.09) rectX(x + w + 0.02, y + d * j, h * 0.42, y + d * j + 0.03, h * 0.54, rgb(M.greyDk));
    beam([x + w * 0.35, y + d + 0.04, h * 0.7], [x + w * 0.65, y + d + 0.04, h * 0.7], 0.06, M.rustDk, 1);
  };
})(QH);
