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
     o.size (1) scales the whole thing; at 1 the footprint is 1.9
     across by 2.0 deep, the back 2.7 high.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, cyl, stroke, rgb } = QH.draw;
  const light = QH.light;

  // in the chair's own units: `a` runs across it, `b` from the back forward
  const D = 2.0, ARM = 0.6, BACK = 0.55;
  const Z0 = 0.15, SEAT = 0.9, ARM_H = 1.85, BACK_H = 2.55, PILLOW = 1.05;   // over the feet: the seat's top, the arms', the back's, the pillow's height

  QH.assets.clubChair = (x, y, o = {}) => {
    const Y = (o.face || '+y') === '+y', k = o.size || 1, W = o.w || 1.9;
    const pt = (a, b, z) => (Y ? [x + a * k, y + b * k, z * k] : [x + b * k, y + a * k, z * k]);
    const bx = (a, b, z, wa, wb, h, col, op) => (Y ? box(x + a * k, y + b * k, z * k, wa * k, wb * k, h * k, col, op) : box(x + b * k, y + a * k, z * k, wb * k, wa * k, h * k, col, op));
    // beige where the light is on it, tan on the side, brown in the shadow — each face its own ink pair rather
    // than one colour shaded down, since beige darkened lands between the olive and the brown and dithers
    const cloth = light.warm(M.tan, M.beige), side = light.warm(M.woodLt, M.tan), shadow = light.warm(M.wood, M.woodLt);
    const faces = { colLeft: side, left: 1.0, colRight: shadow, right: 1.0, rim: light.warm(M.beige, M.cream) };
    const seam = rgb(shadow);

    for (const [a, b] of [[0.2, 0.2], [W - 0.2, 0.2], [0.2, D - 0.2], [W - 0.2, D - 0.2]]) { const f = pt(a, b, 0); cyl(f[0], f[1], f[2], 0.11 * k, Z0 * k, M.woodDk, { n: 8, edge: false }); }

    bx(0, 0, Z0, W, BACK, BACK_H, cloth, faces);                          // the back, full width
    bx(0, BACK, Z0, ARM, D - BACK, ARM_H, cloth, faces);                  // the far arm
    bx(ARM, BACK, Z0, W - 2 * ARM, D - BACK, SEAT - 0.35, cloth, { colLeft: shadow, left: 1.0, colRight: shadow, right: 0.85 });   // the base under the seat
    bx(ARM, BACK, Z0 + SEAT - 0.35, W - 2 * ARM, D - BACK - 0.05, 0.35, cloth, faces);        // the seat cushion
    bx(ARM + 0.1, BACK, Z0 + SEAT, W - 2 * ARM - 0.2, 0.38, PILLOW, cloth, faces);            // the pillow, propped against the back
    stroke([pt(ARM + 0.1, BACK + 0.39, Z0 + SEAT + PILLOW * 0.5), pt(W - ARM - 0.1, BACK + 0.39, Z0 + SEAT + PILLOW * 0.5)], seam);   // its crease
    bx(W - ARM, BACK, Z0, ARM, D - BACK, ARM_H, cloth, faces);            // the near arm
    stroke([pt(ARM, D - 0.02, Z0 + SEAT - 0.35), pt(W - ARM, D - 0.02, Z0 + SEAT - 0.35)], seam);            // the piping under the seat cushion
  };
})(QH);
