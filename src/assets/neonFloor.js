/* ═══════════════════════════════════════════════════════════════
   assets/neonFloor.js — what's laid into the booth's floor: a ring
   of blue neon round the stage, six-sided on screen, the tiles
   inside it warmed by the spots; and circuit traces of the same
   blue running out toward the rails, a pad at the end of each,
   with a bead of light travelling along every one. Painted flat
   on the floor plane, so it goes under everything.

   neonFloor(cx, cy, o)
     the ring centred on (cx, cy), o.a (4.2) half its width, o.c
     (1.4) how much its top and bottom corners are cut. o.traces
     is a list of polylines [[x, y], …] on the floor; o.on is 0..1
     (1), how lit the neon is; o.t the time, for the beads; o.chase
     0..1 brightens them and the ring, for the show.
     o.warm 0..1 (light.lamp) is how much the spots warm the ring's
     inside; o.clipTo the floor polygon the paint stays within.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { beam, poly, dot, rgb, clip, unclip } = QH.draw;
  const { P, cam } = QH.cam;
  const { mix, clamp } = QH;

  const Z = 0.03;

  QH.assets.neonFloor = (cx, cy, o = {}) => {
    const a = o.a || 4.2, c = o.c || 1.4, on = o.on ?? 1, t = o.t || 0, chase = o.chase || 0, warm = o.warm ?? 1;
    const ring = [[cx - a + c, cy - a], [cx + a - c, cy - a], [cx + a, cy - a + c], [cx + a, cy + a - c],
                  [cx + a - c, cy + a], [cx - a + c, cy + a], [cx - a, cy + a - c], [cx - a, cy - a + c]];
    if (o.clipTo) clip(o.clipTo);

    // the apron inside the ring: the tiles warmed toward the stage, a world circle being a 2:1 ellipse on screen
    if (warm > 0.02) {
      const g = QH.draw.g, p = P(cx, cy, Z), R = a * 1.35 * cam.s;
      clip(ring.map(q => [q[0], q[1], Z]));
      g.save(); g.translate(p[0], p[1]); g.scale(1, 0.5);
      const grd = g.createRadialGradient(0, 0, 0, 0, 0, R);
      grd.addColorStop(0, 'rgba(108,53,32,' + 0.85 * warm + ')');
      grd.addColorStop(0.45, 'rgba(87,45,32,' + 0.6 * warm + ')');
      grd.addColorStop(0.8, 'rgba(59,36,31,' + 0.4 * warm + ')');
      grd.addColorStop(1, 'rgba(59,36,31,' + 0.1 * warm + ')');
      g.fillStyle = grd; g.fillRect(-R, -R, R * 2, R * 2);
      g.restore();
      unclip();
    }

    // the ring: wash, tube, core
    const tube = (p, q, k) => {
      const kk = clamp(k, 0, 1);
      if (kk > 0.02) beam([p[0], p[1], Z], [q[0], q[1], Z], 0.3, mix(M.navyDk, M.blueDk, kk), 1);
      beam([p[0], p[1], Z], [q[0], q[1], Z], 0.1, mix(M.navy, M.blueLt, kk), 1);
      beam([p[0], p[1], Z], [q[0], q[1], Z], 0.04, mix(M.navyLt, M.cyan, kk), 1);
    };
    for (let i = 0; i < 8; i++) tube(ring[i], ring[(i + 1) % 8], on * (1 + 0.4 * chase));

    // the traces, thinner, a pad at the far end of each, and the bead running out along it
    for (let i = 0; i < (o.traces || []).length; i++) {
      const T = o.traces[i];
      let len = 0;
      for (let j = 1; j < T.length; j++) len += Math.hypot(T[j][0] - T[j - 1][0], T[j][1] - T[j - 1][1]);
      for (let j = 1; j < T.length; j++) {
        const p = T[j - 1], q = T[j];
        if (on > 0.02) beam([p[0], p[1], Z], [q[0], q[1], Z], 0.16, mix(M.navyDk, M.blueDk, on * 0.8), 1);
        beam([p[0], p[1], Z], [q[0], q[1], Z], 0.05, mix(M.navy, M.blue, on), 1);
      }
      const e = T[T.length - 1];
      poly([[e[0] - 0.13, e[1] - 0.13, Z], [e[0] + 0.13, e[1] - 0.13, Z], [e[0] + 0.13, e[1] + 0.13, Z], [e[0] - 0.13, e[1] + 0.13, Z]], rgb(mix(M.navy, M.blueLt, on)));
      if (on > 0.05) {
        // the bead: a short bright run, each trace on its own beat, hotter for the show (never quicker — a changing speed makes it jump)
        const speed = 1.6, span = len + 3, at = ((t * speed + i * 1.37) % span);
        if (at < len) {
          let d = at, seg = 1;
          while (seg < T.length - 1 && d > Math.hypot(T[seg][0] - T[seg - 1][0], T[seg][1] - T[seg - 1][1])) { d -= Math.hypot(T[seg][0] - T[seg - 1][0], T[seg][1] - T[seg - 1][1]); seg++; }
          const p = T[seg - 1], q = T[seg], sl = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, f = Math.min(1, d / sl), f0 = Math.max(0, f - 0.45 / sl);
          beam([p[0] + (q[0] - p[0]) * f0, p[1] + (q[1] - p[1]) * f0, Z + 0.01], [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, Z + 0.01], 0.07, mix(M.blueLt, M.cyan, 0.5 + 0.5 * chase), 1);
          dot(p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, Z + 0.02, 1, M.ice);
        }
      }
    }
    if (o.clipTo) unclip();
  };
})(QH);
