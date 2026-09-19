/* ═══════════════════════════════════════════════════════════════
   assets/bed.js — the daybed: a long rail on the wall side, a
   headboard at the head, grey sheet and pillow, orange blanket.

   bed(x, y, o)
     footprint x..x+w (2.0) by y..y+d (3.4); the head is at y,
     the rail runs down the x side. o.rail = false for the plain
     bed with just a headboard (the sheet's second bed). o.open
     (0..1) turns the blanket down toward the foot, its folded
     edge widening, more of the sheet showing.
     Returns the blanket's screen polygons, for the click.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, poly, rgb } = QH.draw;
  const light = QH.light;
  const { clamp } = QH;
  const { P } = QH.cam;

  QH.assets.bed = (x, y, o = {}) => {
    const w = o.w || 2.0, d = o.d || 3.4, rail = o.rail !== false;
    const RT = 0.4, RH = 1.9;                                          // rail thickness, height

    // rail down the wall side, headboard across the head. The rail owns
    // the corner: the headboard starts at x so it has no face inside the
    // rail, and being drawn second it hides the rail's face inside it.
    if (rail) box(x - RT, y - RT, 0, RT, d + RT + 0.1, RH, M.navyLt, { colTop: M.slate });
    box(x, y - RT, 0, w + 0.1, RT, RH, M.navyLt, { colTop: M.slate });

    // legs, then the base they carry
    const LZ = 0.25;
    for (const [lx, ly] of [[x, y + d - 0.2], [x + w - 0.2, y + d - 0.2], [x + w - 0.2, y]]) box(lx, ly, 0, 0.2, 0.2, LZ, M.ink, { edge: false });
    box(x, y, LZ, w, d, 0.45, M.navy, { colTop: M.navyLt });

    // mattress: grey sheet at the head, the blanket over the rest, bare at the foot.
    // Turned down, the blanket slides toward the foot and its folded edge widens
    const open = clamp(o.open || 0, 0, 1), PULL = 0.85;
    const MZ = LZ + 0.45, MH = 0.32, split = y + 1.35 + PULL * open;
    const bx0 = x + 0.08, bx1 = x + w - 0.08, by1 = y + d - 0.25, zt = MZ + MH;   // the blanket, flush with the sheet so no corner steps out by the rail
    box(bx0, y + 0.1, MZ, w - 0.16, split - y - 0.1, MH, M.navy, { colTop: M.grey, top: 0.95 });
    const bl = light.warm(M.rust, M.rustLt);
    box(bx0, split, MZ, bx1 - bx0, by1 - split, MH, bl,
        { colTop: light.warm(M.rustLt, M.orangeDk), colLeft: M.navy, left: 0.85, right: 0.62, rim: light.warm(M.orangeDk, M.orange) });
    box(bx0, by1, MZ, w - 0.16, 0.17, MH, M.navy, { colTop: M.navy });
    // the fold at the blanket's top edge
    const fold = split + 0.3 + PULL * open * 0.5;
    poly([[bx0, split, zt + 0.01], [bx1, split, zt + 0.01], [bx1, fold, zt + 0.01], [bx0, fold, zt + 0.01]],
         rgb(light.warm(M.orangeDk, M.orange)));

    // pillow
    box(x + 0.3, y + 0.28, MZ + MH, w - 0.6, 0.72, 0.24, M.greyLt, { colTop: M.silver, top: 0.95, left: 0.78, right: 0.6 });

    // where the blanket is on screen, for the click: its top and the two faces you see
    const scr = pts => pts.map(p => P(p[0], p[1], p[2]));
    return { polys: [
      [[bx0, split, zt], [bx1, split, zt], [bx1, by1, zt], [bx0, by1, zt]],
      [[bx1, split, MZ], [bx1, by1, MZ], [bx1, by1, zt], [bx1, split, zt]],
      [[bx0, by1, MZ], [bx1, by1, MZ], [bx1, by1, zt], [bx0, by1, zt]],
    ].map(scr) };
  };
})(QH);
