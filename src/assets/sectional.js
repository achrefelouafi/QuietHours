/* ═══════════════════════════════════════════════════════════════
   assets/sectional.js — the orange L-shaped sofa from docs/sofas.jpg.
   Two back cushions along one side, a fat arm at one end with a
   fabric tray slung over it — a mug on the tray, the remote on the
   seat beside it — and at the other end the seat runs on out into
   a wide chaise. A dark plinth under the lot, on stub feet.

   sectional(x, y, o)
     (x, y) is the far corner, where the back meets the chaise end.
     o.face = '+x'  (default, as on the sheet) the back runs along y
                    at x, the seats look down-right, the chaise
                    reaches out along +x at the low-y end, the arm
                    with the tray is at the high-y end.
              '+y'  the mirror: back along x at y, seats look
                    down-left, chaise along +y, arm at the high-x end.
     Footprint: 3.4 along the back by 3.0 out from it.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, poly, stroke, cyl, disc, dot, rgb, sh } = QH.draw;
  const light = QH.light;

  // the shape, in its own units: `a` runs along the back from the chaise end, `b` runs out from the back
  const L = 3.4, T = 0.55, SEAT = 1.25, CW = 1.45, REACH = 3.0;
  const Z0 = 0.1, PL = 0.3, CUSH = 0.45, ARM = 0.8, BACK = 1.15;        // feet, plinth, cushion, arm and back heights, stacked

  QH.assets.sectional = (x, y, o = {}) => {
    const X = (o.face || '+x') === '+x';
    const pt = (a, b, z) => (X ? [x + b, y + a, z] : [x + a, y + b, z]);
    /** A box in the sofa's own units: a-extent `wa`, b-extent `wb`. */
    const bx = (a, b, z, wa, wb, h, col, op) => (X ? box(x + b, y + a, z, wb, wa, h, col, op) : box(x + a, y + b, z, wa, wb, h, col, op));

    const body = light.warm(M.rustLt, M.orange), top = light.warm(M.orangeDk, M.orangeLt);
    const plinth = light.warm(M.rustDk, M.rustLt), rim = light.warm(M.orange, M.bright);
    const cush = { colTop: top, left: 1.0, right: 0.84, rim };
    const zc = Z0 + PL, zs = zc + CUSH;                                // where the cushions sit, and the seat's top

    // the feet, then the plinth — the chaise's leg first, the long one over it
    for (const [a, b] of [[0.1, 0.1], [L - 0.25, 0.1], [L - 0.25, SEAT + T - 0.25], [0.1, REACH - 0.25], [CW - 0.25, REACH - 0.25]]) bx(a, b, 0, 0.15, 0.15, Z0, M.ink, { edge: false });
    bx(0, T, Z0, CW, REACH - T, PL, plinth, { colTop: plinth, left: 1.0, right: 0.85 });
    bx(0, 0, Z0, L, SEAT + T, PL, plinth, { colTop: plinth, left: 1.0, right: 0.85 });

    // the back: one block, two cushions — a seam down its face and across its top where they meet
    bx(0, 0, zc, L - T, T, BACK, body, cush);
    stroke([pt(CW, T + 0.01, zc), pt(CW, T + 0.01, zc + BACK), pt(CW, 0, zc + BACK)], rgb(plinth));
    // the chaise, then the seat cushion beside it — a seam between, and a fold along the chaise
    bx(0.02, T, zc, CW - 0.02, REACH - T, CUSH, body, cush);
    bx(CW + 0.02, T, zc, L - T - CW - 0.04, SEAT, CUSH, body, cush);
    stroke([pt(CW, T, zs + 0.01), pt(CW, T + SEAT, zs + 0.01)], rgb(plinth));
    stroke([pt(CW * 0.5, T + SEAT + 0.1, zs + 0.01), pt(CW * 0.5, REACH - 0.15, zs + 0.01)], rgb(sh(top, 0.8)));

    // the remote, on the seat by the arm
    const rmA = L - T - 0.34, rmB = T + 0.35;
    bx(rmA, rmB, zs, 0.22, 0.55, 0.06, M.ink, { colTop: M.greyDk, edge: false });
    for (let i = 0; i < 3; i++) dot(...pt(rmA + 0.11, rmB + 0.1 + i * 0.13, zs + 0.07), 1, [M.blueLt, M.bright, M.cream][i]);

    // the arm, and the tray over its front half: a flat, a flap down the outside, the mug on it
    bx(L - T, 0, zc, T, SEAT + T, ARM, body, cush);
    const za = zc + ARM, tb0 = 0.75, tb1 = SEAT + T - 0.1, trayT = M.tan, trayS = M.woodLt;
    bx(L - T - 0.02, tb0, za, T + 0.04, tb1 - tb0, 0.06, trayS, { colTop: trayT, top: 1, left: 1, right: 0.9 });
    poly([pt(L + 0.01, tb0, za), pt(L + 0.01, tb1, za), pt(L + 0.01, tb1, za - 0.45), pt(L + 0.01, tb0, za - 0.45)], rgb(trayS));
    stroke([pt(L + 0.01, tb0, za - 0.45), pt(L + 0.01, tb1, za - 0.45)], rgb(M.ink));
    stroke([pt(L + 0.01, tb0, za - 0.3), pt(L + 0.01, tb1, za - 0.3)], rgb(M.tan));
    const mug = pt(L - T / 2, (tb0 + tb1) / 2, za + 0.06);
    cyl(mug[0], mug[1], mug[2], 0.13, 0.24, M.cream, { n: 8, colTop: M.cream, topK: 1 });
    disc(mug[0], mug[1], mug[2] + 0.25, 0.08, rgb(M.rustDk), 8);
    dot(...pt(L - T / 2, (tb0 + tb1) / 2 + 0.17, za + 0.2), 2, M.cream);
  };
})(QH);
