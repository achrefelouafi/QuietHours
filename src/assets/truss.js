/* ═══════════════════════════════════════════════════════════════
   assets/truss.js — the lighting rig over the booth: a lattice
   girder run along the wall tops, a strip of blue LEDs under its
   middle span, spotlight cans hung from it and the beams they
   throw down the screen wall. This is the booth's lamp.

   truss(path, z, o)
     the girder through the world points path = [[x, y], …], its
     bottom chord at height z, o.depth (0.6) to the top chord.
     o.led is 0..1, the LED strip under span o.ledSpan (1) —
     o.on is the rig's switch, 0..1: the cans' lenses go dark
     with it. o.cans = [{ s, f, col, dim }] hangs a can under span
     s a fraction f along it, `col` an [r,g,b]; `dim` for the small
     ones that are never really on. o.heads = [{ s, f }] are the
     little moving heads between them.
   truss.canAt(path, z, can) → the world point of a can's lens.
   truss.beam(apex, a, b, col, k, clipTo)
     a cone of light from the world point `apex` to the base a—b,
     `k` how strong, clipped to the world polygon clipTo. Drawn
     onto the wall between the screen's panel and its art.
   Returns the rig's screen geometry for the click, in the shape
   main.js reads for a lamp: a head over the middle of span
   o.ledSpan and a stem along it (also kept in truss.last).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { beam, stroke, dot, poly, rgb, clip, unclip } = QH.draw;
  const { P, cam } = QH.cam;
  const { mix, lerp } = QH;

  const along = (path, s, f) => {
    const a = path[s], b = path[s + 1];
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
  };

  /** Where a can's lens is: it hangs a stem and a yoke under the chord. */
  const canAt = (path, z, can) => { const p = along(path, can.s, can.f); return [p[0], p[1], z - 1.0]; };

  const truss = (path, z, o = {}) => {
    const depth = o.depth || 0.6, on = o.on ?? 1, zt = z + depth;
    const steel = M.grey, dark = M.greyDk;

    for (let s = 0; s < path.length - 1; s++) {
      const a = path[s], b = path[s + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      // the lattice: diagonals zig-zagging between the chords, a post at each end
      const n = Math.max(2, Math.round(len / 0.7));
      for (let i = 0; i < n; i++) {
        const p = along(path, s, i / n), q = along(path, s, (i + 1) / n);
        beam([p[0], p[1], i & 1 ? zt : z], [q[0], q[1], i & 1 ? z : zt], 0.07, steel, 0.9);
      }
      beam([a[0], a[1], z], [a[0], a[1], zt], 0.1, steel, 0.85);
      beam([b[0], b[1], z], [b[0], b[1], zt], 0.1, steel, 0.85);
      // the chords
      beam([a[0], a[1], z], [b[0], b[1], z], 0.16, dark, 1);
      beam([a[0], a[1], zt], [b[0], b[1], zt], 0.16, steel, 1);
    }

    // the LED strip under the middle span: a thin bar with a bead of light every so often
    const led = o.led ?? 1, ls = o.ledSpan ?? 1;
    if (path.length > ls + 1) {
      const a = along(path, ls, 0.04), b = along(path, ls, 0.96), zl = z - 0.12;
      beam([a[0], a[1], zl], [b[0], b[1], zl], 0.1, M.navyDk, 1);
      if (led > 0.02) {
        beam([a[0], a[1], zl], [b[0], b[1], zl], 0.05, mix(M.navyDk, M.blueLt, led), 1);
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.round(len / 0.45);
        for (let i = 0; i <= n; i++) { const p = along(path, ls, 0.04 + 0.92 * i / n); dot(p[0], p[1], zl + 0.03, 1, mix(M.blue, M.cyan, led)); }
      }
    }

    // the cans: a stem, a yoke, the body hanging off it, the lens bright when the rig is on
    for (const c of o.cans || []) {
      const p = along(path, c.s, c.f), lens = canAt(path, z, c), col = c.col || M.orangeLt;
      const k = c.dim ? on * 0.35 : on;
      beam([p[0], p[1], z], [p[0], p[1], z - 0.3], 0.06, dark, 1);                  // stem
      beam([p[0] - 0.12, p[1] - 0.12, z - 0.3], [p[0] + 0.12, p[1] + 0.12, z - 0.3], 0.07, steel, 1);   // yoke
      beam([p[0], p[1], z - 0.32], [lens[0], lens[1], lens[2] + 0.12], 0.34, M.navyDk, 1);         // body
      beam([p[0], p[1], z - 0.32], [lens[0], lens[1], lens[2] + 0.12], 0.14, M.greyDk, 1);
      QH.draw.disc(lens[0], lens[1], lens[2], 0.2, rgb(mix(M.greyDk, col, k)), 8);    // the lens
      if (k > 0.05) QH.draw.disc(lens[0], lens[1], lens[2] + 0.001, 0.1, rgb(mix(col, M.glow, 0.5 * k)), 6);
    }
    // the moving heads: a small dome each on a short bracket
    for (const h of o.heads || []) {
      const p = along(path, h.s, h.f);
      beam([p[0], p[1], z], [p[0], p[1], z - 0.25], 0.06, dark, 1);
      QH.draw.cyl(p[0], p[1], z - 0.55, 0.17, 0.3, M.greyDk, { n: 8, colTop: mix(M.greyDk, M.cyan, on * 0.7), topK: 1 });
    }

    const a = along(path, ls, 0), b = along(path, ls, 1), m = along(path, ls, 0.5);
    return (truss.last = { head: P(m[0], m[1], z - 0.5), r: 1.0 * cam.s, stem: [P(a[0], a[1], z - 0.4), P(b[0], b[1], z - 0.4)], stemR: 0.85 * cam.s });
  };
  truss.last = null;
  truss.canAt = canAt;

  /** A cone of light: bright at the lens, thinning out where it lands. Screen space, clipped to the wall it falls on. */
  truss.beam = (apex, a, b, col, k = 1, clipTo = null) => {
    if (k <= 0.02) return;
    const g = QH.draw.g, A = P(...apex), Pa = P(...a), Pb = P(...b), mid = [(Pa[0] + Pb[0]) / 2, (Pa[1] + Pb[1]) / 2];
    if (clipTo) clip(clipTo);
    const grd = g.createLinearGradient(A[0], A[1], mid[0], mid[1]);
    const c = col[0] + ',' + col[1] + ',' + col[2] + ',';
    grd.addColorStop(0, 'rgba(' + c + 0.5 * k + ')');
    grd.addColorStop(0.4, 'rgba(' + c + 0.26 * k + ')');
    grd.addColorStop(1, 'rgba(' + c + 0.1 * k + ')');
    g.fillStyle = grd;
    g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(Pa[0], Pa[1]); g.lineTo(Pb[0], Pb[1]); g.closePath(); g.fill();
    if (clipTo) unclip();
  };

  QH.assets.truss = truss;
})(QH);
