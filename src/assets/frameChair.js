/* ═══════════════════════════════════════════════════════════════
   assets/frameChair.js — the green armchair from docs/sofas.jpg. A
   square wooden frame — four posts, an arm rail down each side with
   a stretcher under it — holding a thick green seat cushion and a
   tall green back cushion between the rear posts.

   frameChair(x, y, o)
     (x, y) is the far corner, behind the back.
     o.face = '+y'  (default, as on the sheet) the back runs along x
                    at y, the seat looks down-left.
              '+x'  turned to look down-right: back along y at x.
     Footprint: 1.9 across by 1.8 deep.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, stroke, rgb } = QH.draw;
  const light = QH.light;

  // in the chair's own units: `a` runs across it, `b` from the back forward
  const W = 1.9, D = 1.8, P = 0.2;                                     // the footprint, and a post's thickness
  const RAIL = 1.0, STRETCH = 0.32, SEAT = 0.5, CUSH = 0.38, BACK_H = 1.75;

  QH.assets.frameChair = (x, y, o = {}) => {
    const Y = (o.face || '+y') === '+y';
    const pt = (a, b, z) => (Y ? [x + a, y + b, z] : [x + b, y + a, z]);
    const bx = (a, b, z, wa, wb, h, col, op) => (Y ? box(x + a, y + b, z, wa, wb, h, col, op) : box(x + b, y + a, z, wb, wa, h, col, op));

    const wood = { colTop: light.warm(M.rustLt, M.orange), left: 1.0, right: 0.8, rim: light.warm(M.orangeDk, M.orangeLt) };
    const timber = light.warm(M.rust, M.orangeDk);
    const green = { colTop: M.leafLt, left: 1.0, right: 0.76 };
    const post = (a, b, h) => bx(a, b, 0, P, P, h, timber, wood);
    const side = a => {                                                  // one side of the frame: the stretcher, the arm rail, the front post
      bx(a, P, STRETCH - 0.12, P, D - 2 * P, 0.12, timber, wood);
      bx(a, 0, RAIL, P, D, 0.14, timber, wood);
      post(a, D - P, RAIL);
    };

    post(0, 0, BACK_H - 0.25); post(W - P, 0, BACK_H - 0.25);            // the rear posts
    bx(P, 0, RAIL + 0.14, W - 2 * P, P, 0.12, timber, wood);              // the rail across the back, between them
    bx(P, 0.05, SEAT + 0.05, W - 2 * P, 0.38, BACK_H - SEAT - 0.05, M.leaf, green);   // the back cushion
    stroke([pt(P + 0.08, 0.44, SEAT + 0.45), pt(W - P - 0.08, 0.44, SEAT + 0.45)], rgb(M.leafDk));   // where it folds over the seat
    side(0);                                                             // the far side
    bx(P, P, SEAT - 0.14, W - 2 * P, D - 2 * P, 0.14, timber, { ...wood, rim: undefined });   // the seat frame
    bx(P, 0.4, SEAT, W - 2 * P, D - 0.4 - P + 0.04, CUSH, M.leaf, green);                    // the seat cushion
    side(W - P);                                                         // the near side
  };
})(QH);
