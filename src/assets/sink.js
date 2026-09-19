/* ═══════════════════════════════════════════════════════════════
   assets/sink.js — the wall-hung basin: a dark walnut box floating
   off the floor, a thick stone slab on it with a square basin cut
   into the slab, a tall square tap at the back and a pump bottle
   in the corner.

   sink(x, y, z, o)
     footprint x..x+w (2.3) by y..y+d (1.7), the box's underside at
     z; o.h is the box (1.0), the slab adds sink.T. The basin and
     tap face +y (the back wall). o.bare leaves the bottle off.
     sink.H(z, o) is the slab top.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, poly, stroke, disc, clip, unclip, rgb, sh } = QH.draw;
  const light = QH.light, A = QH.assets;

  const T = 0.28;
  const sink = (x, y, z, o = {}) => {
    const w = o.w || 2.3, d = o.d || 1.7, h = o.h || 1.0, zt = z + h + T;
    const wood = light.warm(M.woodDk, M.wood), woodLt = light.warm(M.wood, M.woodLt);
    box(x, y, z, w, d, h, wood, { colLeft: woodLt, left: 0.9, right: 0.7 });
    for (let i = 1; i < 4; i++) {                                                          // the grain, a few boards
      stroke([[x, y + d + 0.01, z + h * i / 4], [x + w, y + d + 0.01, z + h * i / 4]], rgb(M.woodDk));
      stroke([[x + w + 0.01, y, z + h * i / 4], [x + w + 0.01, y + d, z + h * i / 4]], rgb(M.woodDk));
    }

    // the slab: charcoal stone, its top gone warm under the light
    const top = light.warm(M.greyLt, M.tan);
    box(x - 0.05, y - 0.05, z + h, w + 0.1, d + 0.1, T, M.navy, { colTop: top, top: 1, left: 0.9, right: 0.72, rim: light.warm(M.greyLt, M.cream) });

    // the basin: a square well; its floor and far walls show through the opening
    const bx0 = x + 0.3, by0 = y + 0.42, bx1 = x + w - 0.72, by1 = y + d - 0.28, dp = 0.22;
    clip([[bx0, by0, zt], [bx1, by0, zt], [bx1, by1, zt], [bx0, by1, zt]]);
    poly([[bx0, by0, zt - dp], [bx1, by0, zt - dp], [bx1, by1, zt - dp], [bx0, by1, zt - dp]], sh(top, 0.62));
    poly([[bx0, by0, zt - dp], [bx0, by1, zt - dp], [bx0, by1, zt], [bx0, by0, zt]], sh(top, 0.74));
    poly([[bx0, by0, zt - dp], [bx1, by0, zt - dp], [bx1, by0, zt], [bx0, by0, zt]], sh(top, 0.84));
    disc((bx0 + bx1) / 2, (by0 + by1) / 2, zt - dp + 0.01, 0.07, rgb(M.ink), 8);
    unclip();
    stroke([[bx0, by0, zt], [bx1, by0, zt], [bx1, by1, zt], [bx0, by1, zt]], rgb(M.ink), 1, true);

    // the tap: a square column at the back, its spout reaching over the basin
    const tx = x + w * 0.56, ty = y + 0.14;
    box(tx, ty, zt, 0.16, 0.16, 0.55, M.greyDk, { colTop: M.greyLt, top: 1, left: 0.85, right: 0.65 });
    box(tx - 0.01, ty + 0.16, zt + 0.42, 0.18, 0.3, 0.1, M.greyDk, { colTop: M.grey, top: 1, left: 0.85, right: 0.65 });
    box(tx + 0.03, ty + 0.03, zt + 0.55, 0.1, 0.1, 0.08, M.grey, { edge: false });
    if (!o.bare) A.pumpBottle(x + w - 0.36, y + 0.4, zt, { r: 0.13, h: 0.5, col: M.navyDk });
  };
  sink.T = T;
  sink.H = (z, o = {}) => z + (o.h || 1.0) + T;
  QH.assets.sink = sink;
})(QH);
