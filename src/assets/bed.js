/* ═══════════════════════════════════════════════════════════════
   assets/bed.js — the daybed: a long rail on the wall side, a
   headboard at the head, grey sheet and pillow, orange blanket.

   bed(x, y, o)
     footprint x..x+w (2.0) by y..y+d (3.4); the head is at y,
     the rail runs down the x side. o.rail = false for the plain
     bed with just a headboard (the sheet's second bed).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, poly, rgb } = QH.draw;
  const light = QH.light;

  QH.assets.bed = (x, y, o = {}) => {
    const w = o.w || 2.0, d = o.d || 3.4, rail = o.rail !== false;
    const rim = light.warm(M.rust, M.orangeDk);
    const RT = 0.4, RH = 1.9;                                          // rail thickness, height

    // rail down the wall side, headboard across the head
    if (rail) box(x - RT, y - RT, 0, RT, d + RT + 0.1, RH, M.navyLt, { colTop: M.slate, rim });
    box(x - (rail ? RT : 0), y - RT, 0, w + (rail ? RT : 0) + 0.1, RT, RH, M.navyLt, { colTop: M.slate, rim });

    // legs, then the base they carry
    const LZ = 0.25;
    for (const [lx, ly] of [[x, y + d - 0.2], [x + w - 0.2, y + d - 0.2], [x + w - 0.2, y]]) box(lx, ly, 0, 0.2, 0.2, LZ, M.ink, { edge: false });
    box(x, y, LZ, w, d, 0.45, M.navy, { colTop: M.navyLt });

    // mattress: grey sheet at the head, the blanket over the rest, bare at the foot
    const MZ = LZ + 0.45, MH = 0.32, split = y + 1.35;
    box(x + 0.08, y + 0.1, MZ, w - 0.16, split - y - 0.1, MH, M.navy, { colTop: M.grey, top: 0.95 });
    const bl = light.warm(M.rust, M.rustLt);
    box(x + 0.06, split, MZ, w - 0.12, d - (split - y) - 0.25, MH + 0.02, bl,
        { colTop: light.warm(M.rustLt, M.orangeDk), colLeft: M.navy, left: 0.85, right: 0.62, rim: light.warm(M.orangeDk, M.orange) });
    box(x + 0.08, y + d - 0.25, MZ, w - 0.16, 0.17, MH, M.navy, { colTop: M.navy });
    // the fold at the blanket's top edge
    poly([[x + 0.06, split, MZ + MH + 0.03], [x + w - 0.06, split, MZ + MH + 0.03],
          [x + w - 0.06, split + 0.3, MZ + MH + 0.03], [x + 0.06, split + 0.3, MZ + MH + 0.03]],
         rgb(light.warm(M.orangeDk, M.orange)));

    // pillow
    box(x + 0.3, y + 0.28, MZ + MH, w - 0.6, 0.72, 0.24, M.greyLt, { colTop: M.silver, top: 0.95, left: 0.78, right: 0.6 });
  };
})(QH);
