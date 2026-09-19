/* ═══════════════════════════════════════════════════════════════
   assets/miniTv.js — a small portable set in an orange shell: a
   dark screen with a picture on it, a grey control strip beside
   it, a handle over the top, an aerial. It sits on the floor by
   the flight case.

   miniTv(x, y, t, o)
     (x, y) is the far corner. o.face is '+x' (default) or '+y',
     the way the screen looks; o.w (1.0) across the front, o.d
     (0.8) deep, o.h (0.85) high.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectX, rectY, beam, dot, rgb } = QH.draw;
  const light = QH.light;

  QH.assets.miniTv = (x, y, t = 0, o = {}) => {
    const X = (o.face || '+x') === '+x', wd = o.w || 1.0, dp = o.d || 0.8, h = o.h || 0.85;
    const front = (a0, z0, a1, z1, fill) => X ? rectX(x + dp + 0.01, y + a0, z0, y + a1, z1, fill) : rectY(y + dp + 0.01, x + a0, z0, x + a1, z1, fill);
    const fp = (b, a, z) => X ? [x + b, y + a, z] : [x + a, y + b, z];
    const c = light.warm(M.rustLt, M.orange), top = light.warm(M.orangeDk, M.orangeLt);
    if (X) box(x, y, 0, dp, wd, h, c, { colTop: top, left: 0.88, right: 0.68 });
    else   box(x, y, 0, wd, dp, h, c, { colTop: top, left: 0.88, right: 0.68 });
    // the screen: a dark tube with a picture — a skyline against a blue sky — and the strip of controls beside it
    front(wd * 0.08, h * 0.16, wd * 0.66, h * 0.86, rgb(M.ink));
    front(wd * 0.12, h * 0.2, wd * 0.62, h * 0.82, rgb(M.slate));
    front(wd * 0.12, h * 0.2, wd * 0.62, h * 0.45, rgb(M.navyDk));
    for (let i = 0; i < 4; i++) front(wd * (0.16 + i * 0.12), h * 0.3, wd * (0.22 + i * 0.12), h * (0.4 + (i % 2) * 0.12), rgb(M.ink));
    if (Math.floor(t * 1.5) % 3 === 0) dot(...fp(dp + 0.02, wd * 0.5, h * 0.7), 1, M.cream);
    front(wd * 0.72, h * 0.16, wd * 0.94, h * 0.86, rgb(M.greyLt));
    dot(...fp(dp + 0.02, wd * 0.8, h * 0.7), 1, M.ink);
    dot(...fp(dp + 0.02, wd * 0.8, h * 0.5), 1, M.ink);
    dot(...fp(dp + 0.02, wd * 0.8, h * 0.3), 1, M.bright);
    // the handle over the top, and the aerial
    beam(fp(dp * 0.35, wd * 0.2, h), fp(dp * 0.35, wd * 0.2, h + 0.18), 0.05, M.rustDk, 1);
    beam(fp(dp * 0.35, wd * 0.8, h), fp(dp * 0.35, wd * 0.8, h + 0.18), 0.05, M.rustDk, 1);
    beam(fp(dp * 0.35, wd * 0.2, h + 0.18), fp(dp * 0.35, wd * 0.8, h + 0.18), 0.07, M.rustDk, 1);
    beam(fp(dp * 0.15, wd * 0.5, h), fp(dp * 0.05, wd * 0.62, h + 0.55), 0.03, M.greyLt, 1);
  };
})(QH);
