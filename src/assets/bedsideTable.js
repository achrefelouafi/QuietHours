/* ═══════════════════════════════════════════════════════════════
   assets/bedsideTable.js — the two wooden tables beside the bed.

   bedsideTable(x, y, o)
     footprint x..x+w by y..y+d, o.h tall; drawers face +x.
     o.kind = 'drawer' (1.4 × 1.4 × 1.7: a cube with one drawer,
              a stack of books and a mug on top)
            | 'open'   (2.1 × 2.0 × 2.1: a thick top on end panels,
              open through the middle, a low shelf — the lamp table)
     o.bare = true leaves the top empty.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectX, rgb, beam } = QH.draw;
  const light = QH.light, A = QH.assets;

  QH.assets.bedsideTable = (x, y, o = {}) => {
    const kind = o.kind || 'drawer';
    const wood = light.warm(M.rustLt, M.orange), woodTop = light.warm(M.orange, M.orangeLt);
    const woodDk = light.warm(M.rust, M.rustLt), rim = light.warm(M.orange, M.amber);
    const W = { colTop: woodTop, colLeft: woodDk, colRight: wood, left: 0.9, right: 0.72 };

    if (kind === 'open') {
      const w = o.w || 2.1, d = o.d || 2.0, h = o.h || 2.1, T = 0.25, P = 0.18;
      box(x, y, 0, 0.15, d, h - T, wood, W);                                   // back panel, against the wall
      box(x, y, 0, w, P, h - T, wood, W);                                      // far end panel
      box(x + 0.15, y + P, 0.55, w - 0.3, d - 2 * P, 0.1, wood, { ...W, top: 0.8 });   // low shelf
      if (!o.bare) A.book(x + 0.5, y + 0.6, 0.65, 0.8, 0.6, M.navy, { h: 0.12 });
      box(x, y + d - P, 0, w, P, h - T, wood, W);                              // near end panel
      box(x, y, h - T, w, d, T, wood, { ...W, rim });                          // the top
      return;
    }

    const w = o.w || 1.4, d = o.d || 1.4, h = o.h || 1.7;
    for (const [lx, ly] of [[x + 0.05, y + d - 0.2], [x + w - 0.2, y + d - 0.2], [x + w - 0.2, y + 0.05]]) box(lx, ly, 0, 0.15, 0.15, 0.15, M.ink, { edge: false });
    box(x, y, 0.15, w, d, h - 0.35, wood, W);
    box(x - 0.04, y - 0.04, h - 0.2, w + 0.08, d + 0.08, 0.2, wood, { ...W, rim });   // a thicker top
    // one drawer low on the +x face, its handle a short bar
    rectX(x + w + 0.01, y + 0.12, 0.38, y + d - 0.12, h - 0.5, rgb(M.rustDk));
    rectX(x + w + 0.02, y + 0.18, 0.44, y + d - 0.18, h - 0.56, rgb(light.warm(M.rust, M.rustLt)));
    beam([x + w + 0.03, y + d * 0.35, h - 0.95], [x + w + 0.03, y + d * 0.65, h - 0.95], 0.06, M.greyLt, 1);
    if (o.bare) return;
    A.bookStack(x + 0.15, y + 0.2, h, { w: 0.75, d: 0.55, seed: 19 });
    A.mug(x + w - 0.4, y + d - 0.42, h, { r: 0.19, h: 0.42, col: M.silver });
  };
})(QH);
