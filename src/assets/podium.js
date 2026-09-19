/* ═══════════════════════════════════════════════════════════════
   assets/podium.js — the round stage in the middle of the booth:
   a low drum on an eight-sided step, panelled round its side with
   two lit windows, a ring of blue neon just under its rim, and
   the sponsor's badge glowing on top. A click on it runs the show.

   podium(x, y, o)
     centred on (x, y). o.r (3.0) is the drum's radius, o.h (1.1)
     its height. o.on is 0..1 (1), how lit the neon is; o.pulse
     0..1 swells the ring for the show.
   Returns the top's screen polygon for the click (also kept in
   podium.last).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cyl, prism, poly, beam, disc, rgb, sh, clip, unclip } = QH.draw;
  const { P, cam } = QH.cam;
  const { TAU, mix } = QH;
  const light = QH.light;

  const octagon = (cx, cy, a, c) => [[cx - a + c, cy - a], [cx + a - c, cy - a], [cx + a, cy - a + c], [cx + a, cy + a - c],
                                    [cx + a - c, cy + a], [cx - a + c, cy + a], [cx - a, cy + a - c], [cx - a, cy - a + c]];

  const podium = (x, y, o = {}) => {
    const r = o.r || 3.0, h = o.h || 1.1, on = o.on ?? 1, pulse = o.pulse || 0, n = 28;
    const STEP = 0.14, top = STEP + h;

    // the step: eight-sided, its tread warmed by the spots
    prism(octagon(x, y, r + 0.45, 0.8), 0, STEP, M.navy, { colTop: light.warm(M.rustDk, M.rustLt), topK: 1, edgeCol: M.ink });

    // the drum, the panels round its side, the two windows lit orange
    cyl(x, y, STEP, r, h, M.navy, { n, colTop: M.navyLt, topK: 0.95, edgeCol: M.ink });
    const face = (a0, a1, z0, z1, fill) => poly([[x + (r + 0.02) * Math.cos(a0), y + (r + 0.02) * Math.sin(a0), z0], [x + (r + 0.02) * Math.cos(a1), y + (r + 0.02) * Math.sin(a1), z0],
                                                [x + (r + 0.02) * Math.cos(a1), y + (r + 0.02) * Math.sin(a1), z1], [x + (r + 0.02) * Math.cos(a0), y + (r + 0.02) * Math.sin(a0), z1]], fill);
    const D2R = TAU / 360;
    for (let a = -30; a <= 120; a += 30) face((a - 8) * D2R, (a + 8) * D2R, STEP + 0.22, STEP + h * 0.62, rgb(M.ink));
    for (const a of [15, 75]) {
      face((a - 5) * D2R, (a + 5) * D2R, STEP + 0.3, STEP + h * 0.52, rgb(light.warm(M.rust, M.orange)));
      face((a - 3) * D2R, (a + 3) * D2R, STEP + 0.36, STEP + h * 0.46, rgb(light.warm(M.rustLt, M.amber)));
    }
    // a seam round the drum where the panels stop
    QH.draw.ring(x, y, STEP + h * 0.68, r + 0.01, rgb(M.navyDk), n);

    // the cool sheen across the top, off toward the screen
    const g = QH.draw.g, c = P(x + r * 0.25, y - r * 0.35, top), R = r * 1.1 * cam.s;
    const topPts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; topPts.push([x + r * Math.cos(a), y + r * Math.sin(a), top]); }
    clip(topPts);
    const grd = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], R);
    grd.addColorStop(0, 'rgba(40,98,200,0.32)'); grd.addColorStop(0.55, 'rgba(40,98,200,0.1)'); grd.addColorStop(1, 'rgba(40,98,200,0)');
    g.fillStyle = grd; g.fillRect(c[0] - R, c[1] - R, R * 2, R * 2);
    unclip();

    // the neon ring under the rim: the wash, the tube, the core; the top's own edge over it
    const zr = top - 0.12, rr = r + 0.03, k = on * (1 + 0.5 * pulse);
    const pt = i => { const a = i / n * TAU; return [x + rr * Math.cos(a), y + rr * Math.sin(a), zr]; };
    for (let i = 0; i < n; i++) {
      const a = (i + 0.5) / n * TAU; if (Math.cos(a) + Math.sin(a) < -0.15) continue;   // the back of the ring is under the top
      const p = pt(i), q = pt(i + 1);
      if (k > 0.02) beam(p, q, 0.36, mix(M.navy, M.blueDk, Math.min(1, k)), 1);
      beam(p, q, 0.14, mix(M.greyDk, M.blueLt, Math.min(1, k)), 1);
      beam(p, q, 0.06, mix(M.grey, M.cyan, Math.min(1, k)), 1);
    }
    QH.draw.ring(x, y, top, r, rgb(M.ink), n);

    // the badge: an eight-sided plate with a bar across it, a pool of blue under it
    const bs = 0.8, bc = 0.3;
    if (on > 0.02) {
      const cc = P(x, y, top), BR = bs * 2.2 * cam.s;
      clip(topPts);
      const bg = g.createRadialGradient(cc[0], cc[1], 0, cc[0], cc[1], BR);
      bg.addColorStop(0, 'rgba(88,154,255,' + 0.5 * on + ')'); bg.addColorStop(1, 'rgba(88,154,255,0)');
      g.fillStyle = bg; g.fillRect(cc[0] - BR, cc[1] - BR, BR * 2, BR * 2);
      unclip();
    }
    const badge = mix(M.slate, M.ice, on), oct = octagon(x, y, bs, bc).map(p => [p[0], p[1], top + 0.01]);
    for (let i = 0; i < 8; i++) beam(oct[i], oct[(i + 1) % 8], 0.11, badge, 1);
    poly([[x - 0.42, y + 0.1, top + 0.01], [x + 0.28, y - 0.2, top + 0.01], [x + 0.42, y - 0.1, top + 0.01], [x - 0.28, y + 0.2, top + 0.01]], rgb(badge));

    return (podium.last = { top: topPts.map(p => P(...p)), centre: [x, y, top] });
  };
  podium.last = null;
  QH.assets.podium = podium;
})(QH);
