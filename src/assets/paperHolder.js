/* ═══════════════════════════════════════════════════════════════
   assets/paperHolder.js — the toilet-roll holder: a charcoal
   plate on the wall, a roll of paper lying along the wall in
   front of it, the end of the spindle showing past the roll.

   paperHolder(wall, u, z)
     the roll's axis runs along the wall, centred on (u, z).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { TAU, clamp, lerp } = QH;
  const { wall: W, poly, stroke, discX, discY, beam, rgb, sh, F } = QH.draw;
  const light = QH.light;

  /* A cylinder lying along a wall: its axis runs u0 → u0 + L, `off`
     out from the wall, at height z. Like draw.cyl, only the strips
     facing the camera are drawn, far to near, each shaded by its
     normal — the top strips in `colTop`, the rest in `col` — then
     the cap at the +u end, the one end the camera can see on either
     wall. Contour: the cap's rim, the two silhouette edges along the
     roll, and the far rim's visible arc. */
  function roll(wall, u0, z, off, L, r, col, colTop, n = 12) {
    const B = wall === 'B';
    const pt = B ? (u, c, s) => [u, off + c * r, z + s * r] : (u, c, s) => [off + c * r, u, z + s * r];
    const nrm = B ? (c, s) => [0, c, s] : (c, s) => [c, 0, s];
    const side = B ? F.left : F.right;                                   // the strip whose normal points out from the wall
    const segs = [];
    for (let i = 0; i < n; i++) {
      const am = (i + 0.5) / n * TAU, c = Math.cos(am), s = Math.sin(am);
      if (c + s <= 0) continue;
      segs.push({ i, d: c + s, c, s });
    }
    segs.sort((a, b) => a.d - b.d);
    for (const { i, c, s } of segs) {
      const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
      const mid = pt(u0 + L / 2, c, s), [nx, ny, nz] = nrm(c, s);
      const k = light.shade(mid[0], mid[1], mid[2], nx, ny, nz, lerp(side, F.top, clamp((s - c) * 0.5 + 0.5, 0, 1)));
      poly([pt(u0, Math.cos(a0), Math.sin(a0)), pt(u0 + L, Math.cos(a0), Math.sin(a0)),
            pt(u0 + L, Math.cos(a1), Math.sin(a1)), pt(u0, Math.cos(a1), Math.sin(a1))],
           sh(s > 0.5 ? colTop : col, k));
    }
    // the open end: the paper's layered edge, so it reads light rather than as a shaded +u face
    const cap = pt(u0 + L, 0, 0);
    const kc = light.shade(cap[0], cap[1], cap[2], B ? 1 : 0, B ? 0 : 1, 0, 0.9);
    (B ? discX : discY)(cap[0], cap[1], cap[2], r, sh(col, kc), n);
    const ink = rgb(M.ink), arc = a => [Math.cos(a), Math.sin(a)];
    const rim = []; for (let i = 0; i < n; i++) rim.push(pt(u0 + L, ...arc(i / n * TAU)));
    stroke(rim, ink, 1, true);
    for (const a of [TAU * 3 / 8, TAU * 7 / 8]) stroke([pt(u0, ...arc(a)), pt(u0 + L, ...arc(a))], ink);
    const far = []; for (let i = 0; i <= n / 2; i++) far.push(pt(u0, ...arc(TAU * 7 / 8 + i / n * TAU)));
    stroke(far, ink);
  }

  QH.assets.paperHolder = (wall, u, z) => {
    const Wl = W[wall], r = 0.2, L = 0.46, off = 0.1 + r;             // the roll's axis stands `off` out from the wall
    const u0 = u - L / 2;
    // the plate on the wall: charcoal, a little taller than the roll, reaching out past its closed end
    Wl.box(u0 - 0.24, z - r - 0.07, L - 0.02, r * 2 + 0.14, 0.06, M.greyDk, { colTop: M.grey });
    // the roll, then the cardboard core and the spindle's stub on its open end
    roll(wall, u0, z, off, L, r, M.silver, M.cream);
    const B = wall === 'B', end = B ? [u0 + L, off, z] : [off, u0 + L, z];
    (B ? discX : discY)(end[0] + (B ? 0.01 : 0), end[1] + (B ? 0 : 0.01), z, r * 0.36, rgb(M.greyLt), 8);
    beam(end, B ? [end[0] + 0.14, off, z] : [off, end[1] + 0.14, z], 0.09, M.greyDk, 0.8);
  };
})(QH);
