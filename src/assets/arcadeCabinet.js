/* ═══════════════════════════════════════════════════════════════
   assets/arcadeCabinet.js — an upright arcade cabinet in blue:
   a plinth, the coin door, a control panel jutting out with a
   stick and buttons, the screen set back under a hood, a lit
   marquee on top flush with the panel's front. A pale stripe
   down its side. Something is always scrolling on the screen.

   arcadeCabinet(x, y, t, o)
     (x, y) is the far corner of its footprint. o.face is '+x'
     (default) or '+y', the way the screen looks; o.w (1.2) is its
     width across the front, o.d (1.35) its depth, o.h (3.3) the
     top of the marquee. Returns { mask }: the cabinet's outline,
     for draw.mask in the lighting pass so the neon's halo stays
     off it — a glow over the blue dithers into speckle.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectX, rectY, poly, beam, dot, disc, rgb } = QH.draw;
  const { rnd } = QH;

  QH.assets.arcadeCabinet = (x, y, t = 0, o = {}) => {
    const face = o.face || '+x', wd = o.w || 1.2, dp = o.d || 1.35, h = o.h || 3.3;
    const X = face === '+x';
    /* local axes: `a` across the front, `b` from the back (0) to the front (dp) */
    const B = (b0, a0, z, bl, al, hh, col, opt) => X ? box(x + b0, y + a0, z, bl, al, hh, col, opt) : box(x + a0, y + b0, z, al, bl, hh, col, opt);
    const front = (b, a0, z0, a1, z1, fill) => X ? rectX(x + b, y + a0, z0, y + a1, z1, fill) : rectY(y + b, x + a0, z0, x + a1, z1, fill);
    const sp = (b, z) => X ? [x + b, y + wd + 0.012, z] : [x + wd + 0.012, y + b, z];   // a point on the side face
    const fp = (b, a, z) => X ? [x + b, y + a, z] : [x + a, y + b, z];                  // a point anywhere
    const blue = M.blue, dk = M.blueDk, lt = M.blueLt;
    // every face pinned to its own ink: the neon tube is right over this cabinet, and a lit blueLt top lands
    // between blueLt and ice and comes out as speckle, so no face takes the sources' shading
    const opts = { colTop: lt, top: 1, left: 0.9, right: 0.72 };
    const capOpts = { colTop: dk, top: 1, left: 0.9, right: 0.72 };

    // one column, plinth to cap; the control panel and the marquee jut out, the screen sits back between them
    const fb = dp + 0.01, jut = 0.35;
    B(0, 0, 0, dp, wd, 0.35, dk, capOpts);
    B(0, 0, 0.35, dp, wd, 1.35, blue, opts);
    front(fb, wd * 0.28, 0.55, wd * 0.72, 1.35, rgb(M.ink));                                  // the coin door
    front(fb + 0.01, wd * 0.36, 1.0, wd * 0.64, 1.2, rgb(M.greyDk));
    dot(...fp(fb + 0.02, wd * 0.4, 1.1), 1, M.bright);
    dot(...fp(fb + 0.02, wd * 0.56, 1.1), 1, M.bright);
    front(fb + 0.01, wd * 0.4, 0.68, wd * 0.6, 0.76, rgb(M.grey));

    // the control panel, a shelf out over the front: a stick and four buttons on top
    B(0, 0, 1.7, dp + jut, wd, 0.3, blue, capOpts);
    const pz = 2.0, pb = dp + 0.1;
    beam(fp(pb, wd * 0.3, pz), fp(pb, wd * 0.3, pz + 0.28), 0.06, M.ink, 1);
    disc(...fp(pb, wd * 0.3, pz + 0.3), 0.08, rgb(M.bright), 6);
    for (const [b, a, c] of [[0, 0.5, M.leafLt], [0, 0.62, M.bright], [0, 0.74, M.leafLt], [0.16, 0.56, M.bright]]) disc(...fp(pb + b, wd * a, pz + 0.01), 0.055, rgb(c), 6);

    // the screen in its hood, over the panel, set back under the marquee
    B(0, 0, 2.0, dp, wd, 0.9, blue, opts);
    front(fb, wd * 0.1, 2.06, wd * 0.9, 2.72, rgb(M.ink));
    front(fb + 0.01, wd * 0.14, 2.12, wd * 0.86, 2.67, rgb(M.blueLt));
    // rows of something scrolling up the screen
    const R = rnd(29), rows = 6, step = 0.11, scroll = (t * 0.4) % step;
    for (let i = 0; i < rows; i++) {
      const zz = 2.18 + i * step + scroll; if (zz > 2.58) continue;
      const ind = (R() * 3 | 0) * 0.08, len = 0.25 + R() * 0.35;
      front(fb + 0.02, wd * 0.2 + ind, zz, wd * 0.2 + ind + len, zz + 0.05, rgb(R() > 0.75 ? M.cyan : M.blue));
    }
    if (Math.floor(t * 2) % 2 === 0) front(fb + 0.02, wd * 0.66, 2.21, wd * 0.74, 2.28, rgb(M.ice));

    // the marquee, lit, its name a row of pale blocks, out as far as the panel below; the cap over it
    const mb = fb + jut;
    B(0, 0, 2.9, dp + jut, wd, h - 2.98, blue, opts);
    B(0, 0, h - 0.08, dp + jut, wd, 0.08, dk, capOpts);
    front(mb, wd * 0.1, 3.0, wd * 0.9, h - 0.14, rgb(M.cyan));
    for (let i = 0; i < 6; i++) front(mb + 0.01, wd * (0.16 + i * 0.12), 3.06, wd * (0.16 + i * 0.12) + wd * 0.07, h - 0.2, rgb(M.blueDk));

    // a pale stripe down the side
    const st = h - 0.12, sb = dp * 0.8;                                                      // up to just under the cap
    poly([sp(0.12, 0.45), sp(0.38, 0.45), sp(sb, st), sp(sb - 0.26, st)], rgb(lt));

    // its silhouette: the hexagon round its bounding box, panel and marquee included
    const fd = dp + jut;
    return { mask: [fp(0, 0, h), fp(fd, 0, h), fp(fd, 0, 0), fp(fd, wd, 0), fp(0, wd, 0), fp(0, wd, h)] };
  };
})(QH);
