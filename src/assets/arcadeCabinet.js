/* ═══════════════════════════════════════════════════════════════
   assets/arcadeCabinet.js — an upright arcade cabinet in blue:
   a plinth, the coin door, a control panel jutting out with a
   stick and buttons, the screen under a hood, a lit marquee on
   top. A pale stripe and a little orange creature down its side.
   Something is always scrolling on the screen.

   arcadeCabinet(x, y, t, o)
     (x, y) is the far corner of its footprint. o.face is '+x'
     (default) or '+y', the way the screen looks; o.w (1.2) is its
     width across the front, o.d (1.35) its depth, o.h (3.3) the
     top of the marquee.
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
    const side = (b0, z0, b1, z1, fill) => X ? rectY(y + wd + 0.01, x + b0, z0, x + b1, z1, fill) : rectX(x + wd + 0.01, y + b0, z0, y + b1, z1, fill);
    const sp = (b, z) => X ? [x + b, y + wd + 0.012, z] : [x + wd + 0.012, y + b, z];   // a point on the side face
    const fp = (b, a, z) => X ? [x + b, y + a, z] : [x + a, y + b, z];                  // a point anywhere
    const blue = M.blue, dk = M.blueDk, lt = M.blueLt;
    const opts = { colTop: lt, left: 0.9, right: 0.72 };

    // the plinth, the lower body with its coin door
    B(0, 0, 0, dp, wd, 0.35, dk, { colTop: dk });
    B(0, 0, 0.35, dp * 0.9, wd, 1.35, blue, opts);
    front(dp * 0.9 + 0.01, wd * 0.28, 0.55, wd * 0.72, 1.35, rgb(M.ink));
    front(dp * 0.9 + 0.02, wd * 0.36, 1.0, wd * 0.64, 1.2, rgb(M.greyDk));
    dot(...fp(dp * 0.9 + 0.03, wd * 0.4, 1.1), 1, M.bright);
    dot(...fp(dp * 0.9 + 0.03, wd * 0.56, 1.1), 1, M.bright);
    front(dp * 0.9 + 0.02, wd * 0.4, 0.68, wd * 0.6, 0.76, rgb(M.grey));

    // the control panel, out over the body: a stick and four buttons on top
    B(dp * 0.45, 0, 1.7, dp * 0.62, wd, 0.3, blue, { ...opts, colTop: dk });
    const pz = 2.0, pb = dp * 0.45 + dp * 0.62 * 0.5;
    beam(fp(pb, wd * 0.32, pz), fp(pb, wd * 0.32, pz + 0.28), 0.06, M.ink, 1);
    disc(...fp(pb, wd * 0.32, pz + 0.3), 0.08, rgb(M.bright), 6);
    for (const [b, a, c] of [[0, 0.5, M.leafLt], [0, 0.62, M.bright], [0, 0.74, M.leafLt], [0.18, 0.56, M.bright]]) disc(...fp(pb + b, wd * a, pz + 0.01), 0.055, rgb(c), 6);

    // the screen in its hood
    B(0, 0, 1.7, dp * 0.75, wd, 1.2, blue, opts);
    const sb = dp * 0.75 + 0.01;
    front(sb, wd * 0.1, 1.9, wd * 0.9, 2.75, rgb(M.ink));
    front(sb + 0.01, wd * 0.14, 1.96, wd * 0.86, 2.7, rgb(M.blueLt));
    // rows of something scrolling up the screen
    const R = rnd(29), rows = 6, step = 0.11, scroll = (t * 0.4) % step;
    for (let i = 0; i < rows; i++) {
      const zz = 2.02 + i * step + scroll; if (zz > 2.6) continue;
      const ind = (R() * 3 | 0) * 0.08, len = 0.25 + R() * 0.35;
      front(sb + 0.02, wd * 0.2 + ind, zz, wd * 0.2 + ind + len, zz + 0.05, rgb(R() > 0.75 ? M.cyan : M.blue));
    }
    if (Math.floor(t * 2) % 2 === 0) front(sb + 0.02, wd * 0.66, 2.05, wd * 0.74, 2.12, rgb(M.ice));

    // the marquee, lit, its name a row of pale blocks; the cap over it
    B(0, 0, 2.9, dp * 0.85, wd, h - 2.98, blue, opts);
    B(0, 0, h - 0.08, dp * 0.85, wd, 0.08, dk, { colTop: dk });
    const mb = dp * 0.85 + 0.01;
    front(mb, wd * 0.1, 3.0, wd * 0.9, h - 0.14, rgb(M.cyan));
    for (let i = 0; i < 6; i++) front(mb + 0.01, wd * (0.16 + i * 0.12), 3.06, wd * (0.16 + i * 0.12) + wd * 0.07, h - 0.2, rgb(M.blueDk));

    // down the side: a pale stripe, and the creature — a small orange ghost of a thing
    poly([sp(0.12, 0.45), sp(0.38, 0.45), sp(dp * 0.72, 2.8), sp(dp * 0.72 - 0.26, 2.8)], rgb(lt));
    const cb = dp * 0.32, cz = 1.05, o1 = M.orange, o2 = M.bright;
    side(cb, cz, cb + 0.3, cz + 0.24, rgb(o1));                    // the body
    side(cb + 0.04, cz + 0.24, cb + 0.26, cz + 0.32, rgb(o1));     // the head
    side(cb, cz + 0.32, cb + 0.08, cz + 0.42, rgb(o2));            // ears
    side(cb + 0.22, cz + 0.32, cb + 0.3, cz + 0.42, rgb(o2));
    side(cb + 0.08, cz + 0.26, cb + 0.12, cz + 0.3, rgb(M.ink));   // eyes
    side(cb + 0.18, cz + 0.26, cb + 0.22, cz + 0.3, rgb(M.ink));
    side(cb - 0.06, cz - 0.02, cb, cz + 0.12, rgb(o1));            // a tail
  };
})(QH);
