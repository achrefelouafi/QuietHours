/* ═══════════════════════════════════════════════════════════════
   assets/sideTable.js — the small dark tables the plants stand
   on: four square legs and a slab top with a lit edge, and, when
   asked, a low rack between the legs with folded towels on it.

   sideTable(x, y, o)
     footprint x..x+w by y..y+d, o.h tall (1.45). o.shelf = true
     adds the rack and a stack of towels on it (o.bare for the rack
     alone — the near leg has to go over the towels, so they are
     drawn here). sideTable.T is the top's thickness.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box } = QH.draw;
  const light = QH.light, A = QH.assets;

  const T = 0.14, LEG = 0.14, SHELF = 0.36;
  const sideTable = (x, y, o = {}) => {
    const w = o.w || 1.4, d = o.d || 1.4, h = o.h || 1.45;
    const frame = M.navyDk, rim = light.warm(M.rust, M.orange);
    const leg = (lx, ly) => box(lx, ly, 0, LEG, LEG, h - T, frame, { colTop: frame, left: 0.9, right: 0.7 });
    leg(x, y);
    leg(x + w - LEG, y);
    leg(x, y + d - LEG);
    if (o.shelf) {
      box(x + LEG * 0.5, y + LEG * 0.5, SHELF - 0.08, w - LEG, d - LEG, 0.08, frame, { colTop: M.navy, top: 0.9 });
      if (!o.bare) A.towelStack(x + LEG + 0.12, y + LEG + 0.12, SHELF, { w: w - 2 * LEG - 0.3, d: d - 2 * LEG - 0.3, cols: o.towels || ['navy', 'slate', 'rust', 'orange'] });
    }
    leg(x + w - LEG, y + d - LEG);
    box(x, y, h - T, w, d, T, frame, { colTop: light.warm(M.woodDk, M.wood), top: 1, left: 0.9, right: 0.7, rim });
  };
  sideTable.T = T; sideTable.SHELF = SHELF;
  QH.assets.sideTable = sideTable;
})(QH);
