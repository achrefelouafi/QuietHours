/* ═══════════════════════════════════════════════════════════════
   assets/frameChair.js — the green armchair from docs/sofas.jpg. A
   square wooden frame — four posts, an arm rail down each side, a
   stretcher low round the front and sides — holding a thick green
   seat cushion and a tall green back cushion between the rear posts.

   frameChair(x, y, o)
     (x, y) is the far corner, behind the back.
     o.face = '+y'  (default, as on the sheet) the back runs along x
                    at y, the seat looks down-left.
              '+x'  turned to look down-right: back along y at x.
     o.size (1) scales the whole thing; at 1 the footprint is 2.2
     across by 2.0 deep, the back 2.7 high.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, stroke, rgb } = QH.draw;
  const light = QH.light;

  // in the chair's own units: `a` runs across it, `b` from the back forward
  const W = 2.2, D = 2.0, P = 0.26;                                    // the footprint, and a post's thickness
  const RAIL = 1.72, STRETCH = 0.6, SEAT = 0.85, CUSH = 0.48, BT = 0.55, POST = 2.4, BACK_H = 2.7;   // BT: the back cushion's thickness

  QH.assets.frameChair = (x, y, o = {}) => {
    const Y = (o.face || '+y') === '+y', k = o.size || 1;
    const pt = (a, b, z) => (Y ? [x + a * k, y + b * k, z * k] : [x + b * k, y + a * k, z * k]);
    const bx = (a, b, z, wa, wb, h, col, op) => (Y ? box(x + a * k, y + b * k, z * k, wa * k, wb * k, h * k, col, op) : box(x + b * k, y + a * k, z * k, wb * k, wa * k, h * k, col, op));

    const timber = light.warm(M.rust, M.orangeDk);
    const wood = { colTop: light.warm(M.rustLt, M.orange), left: 1.0, right: 0.8, rim: light.warm(M.orangeDk, M.orangeLt) };
    const green = { colTop: M.sageLt, left: 1.0, right: 0.72, rim: M.sageLt };   // sage in the light, darker sage on the side, the dark one in shadow
    const post = (a, b, h) => bx(a, b, 0, P, P, h, timber, wood);
    const side = a => {                                                  // one side of the frame: the stretcher, the arm rail, the front post
      bx(a, P, STRETCH - 0.14, P, D - 2 * P, 0.14, timber, wood);
      bx(a, 0, RAIL, P, D, 0.18, timber, wood);
      post(a, D - P, RAIL);
    };

    post(0, 0, POST); post(W - P, 0, POST);                              // the rear posts
    bx(P, 0, RAIL + 0.18, W - 2 * P, P, 0.14, timber, wood);              // the rail across the back, between them
    bx(P, 0.04, SEAT + 0.05, W - 2 * P, BT, BACK_H - SEAT - 0.05, M.sage, green);        // the back cushion
    stroke([pt(P + 0.1, BT + 0.05, SEAT + CUSH + 0.4), pt(W - P - 0.1, BT + 0.05, SEAT + CUSH + 0.4)], rgb(M.sageDk));   // where it folds over the seat
    side(0);                                                             // the far side
    bx(P, P, SEAT - 0.16, W - 2 * P, D - 2 * P, 0.16, timber, { ...wood, rim: undefined });   // the seat frame
    bx(P, D - P - 0.02, STRETCH - 0.14, W - 2 * P, P, 0.14, timber, wood);                    // the stretcher across the front
    bx(P, BT, SEAT, W - 2 * P, D - BT - P + 0.06, CUSH, M.sage, green);                      // the seat cushion, over the front rail a little
    side(W - P);                                                         // the near side
  };
})(QH);
