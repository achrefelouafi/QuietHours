/* ═══════════════════════════════════════════════════════════════
   assets/chair.js — office chair: five-star base, tall back with
   a headrest, armrests.

   chair(x, y, o)
     (x, y) is the seat centre. Faces -y by default (back toward
     the viewer, seat toward the desk); o.face = '+y' flips it.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, cyl, beam } = QH.draw;
  const { TAU } = QH;
  const light = QH.light;

  QH.assets.chair = (x, y, o = {}) => {
    const dir = o.face === '+y' ? -1 : 1;
    
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * TAU + 0.35, ex = x + Math.cos(a) * 0.75, ey = y + Math.sin(a) * 0.75;
      beam([x, y, 0.1], [ex, ey, 0.1], 0.13, M.navy, 1.1);
      cyl(ex, ey, 0, 0.09, 0.1, M.navyDk, { n: 8, edge: false });
    }
    cyl(x, y, 0.1, 0.11, 0.85, M.slate, { n: 10, edge: false });

    const by = dir > 0 ? y + 0.36 : y - 0.52;
    const back = () => {
      box(x - 0.55, by, 1.2, 1.1, 0.18, 1.6, M.navyLt, { colTop: M.slate, rim: M.steel });
      box(x - 0.42, by - 0.02 * dir, 2.8, 0.84, 0.22, 0.3, M.navyLt, { colTop: M.slate });
    };
    if (dir < 0) back();
    box(x - 0.6, y - 0.55, 0.95, 1.2, 1.1, 0.3, M.navyLt, { colTop: M.slate });
    box(x - 0.72, y - 0.35, 1.25, 0.12, 0.7, 0.32, M.navy, { colTop: M.navyLt });
    box(x + 0.6, y - 0.35, 1.25, 0.12, 0.7, 0.32, M.navy, { colTop: M.navyLt });
    if (dir > 0) back();
  };
})(QH);
