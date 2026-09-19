/* ═══════════════════════════════════════════════════════════════
   assets/clubChair.js — the cream armchair from docs/sofas.jpg. Fat
   square arms either side of a narrow seat, a tall straight back
   the full width of the chair, a loose pillow propped against it,
   and four stubby dark feet.

   clubChair(x, y, o)
     (x, y) is the far corner, behind the back.
     o.face = '+y'  (default, as on the sheet) the back runs along x
                    at y, the seat looks down-left.
              '+x'  turned to look down-right: back along y at x.
     Footprint: 2.1 across by 2.0 deep.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, cyl, stroke, rgb } = QH.draw;

  // in the chair's own units: `a` runs across it, `b` from the back forward
  const W = 2.1, D = 2.0, ARM = 0.6, BACK = 0.5;
  const Z0 = 0.15, SEAT = 0.75, ARM_H = 1.05, BACK_H = 1.9;            // over the feet: the seat's top, the arms', the back's

  QH.assets.clubChair = (x, y, o = {}) => {
    const Y = (o.face || '+y') === '+y';
    const pt = (a, b, z) => (Y ? [x + a, y + b, z] : [x + b, y + a, z]);
    const bx = (a, b, z, wa, wb, h, col, op) => (Y ? box(x + a, y + b, z, wa, wb, h, col, op) : box(x + b, y + a, z, wb, wa, h, col, op));
    const cloth = { colTop: M.cream, left: 1.0, right: 0.78 };
    const seam = rgb(M.woodLt);

    for (const [a, b] of [[0.2, 0.2], [W - 0.2, 0.2], [0.2, D - 0.2], [W - 0.2, D - 0.2]]) { const f = pt(a, b, 0); cyl(f[0], f[1], f[2], 0.11, Z0, M.woodDk, { n: 8, edge: false }); }

    bx(0, 0, Z0, W, BACK, BACK_H, M.tan, cloth);                          // the back, full width
    bx(0, BACK, Z0, ARM, D - BACK, ARM_H, M.tan, cloth);                  // the far arm
    bx(ARM, BACK, Z0, W - 2 * ARM, D - BACK, SEAT - 0.3, M.tan, { colTop: M.tan, left: 0.9, right: 0.72 });   // the base under the seat
    bx(ARM, BACK, Z0 + SEAT - 0.3, W - 2 * ARM, D - BACK - 0.05, 0.3, M.tan, cloth);                          // the seat cushion
    bx(ARM + 0.12, BACK, Z0 + SEAT, W - 2 * ARM - 0.24, 0.32, 0.9, M.tan, cloth);                             // the pillow, propped against the back
    stroke([pt(ARM + 0.12, BACK + 0.33, Z0 + SEAT + 0.45), pt(W - ARM - 0.12, BACK + 0.33, Z0 + SEAT + 0.45)], seam);   // its crease
    bx(W - ARM, BACK, Z0, ARM, D - BACK, ARM_H, M.tan, cloth);            // the near arm
    stroke([pt(ARM, D - 0.02, Z0 + SEAT - 0.3), pt(W - ARM, D - 0.02, Z0 + SEAT - 0.3)], seam);              // the piping under the seat cushion
  };
})(QH);
