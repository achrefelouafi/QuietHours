/* ═══════════════════════════════════════════════════════════════
   assets/neonTube.js — a tall blue neon tube standing on a wall,
   a cap at each end. Lit or not, as the scene says. The booth has
   four, flanking its banners, on one switch.

   neonTube(wall, u, z, h, o)
     from height z to z+h at u along the wall. o.on is 0..1 (1):
     how lit the tube is — at 0 it is dark glass in its caps.
   Returns the screen geometry of the draw, for hit-testing: the
   tube as a screen line and a radius around it, and the world
   line for the halo.
   neonTube.halo(geo, k) — call from the scene's lighting pass to
     add the glow along one tube's geometry (k scales it).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { mix } = QH;
  const { wall: W, beam, rgb } = QH.draw;
  const { P, cam } = QH.cam;
  const light = QH.light;

  const neonTube = (wall, u, z, h, o = {}) => {
    const Wl = W[wall], off = 0.16, on = o.on === undefined ? 1 : o.on;
    const a = Wl.pt(u, z, off), b = Wl.pt(u, z + h, off);
    // the wash on the wall, the tube, its hot core — each fading to dark glass as it goes out
    const wash = mix(M.wallB, M.blueDk, on), tube = mix(M.greyDk, M.blueLt, on), core = mix(M.grey, M.cyan, on);
    if (on > 0.02) beam(a, b, 0.5, wash, 1);
    beam(a, b, 0.2, tube, 1);
    beam(a, b, 0.08, core, 1);
    // the caps, and a bracket into the wall at each
    for (const zz of [z - 0.08, z + h + 0.08]) {
      Wl.box(u - 0.14, zz - 0.1, 0.28, 0.2, off + 0.06, M.navyDk, { colTop: M.greyDk, left: 0.9, right: 0.7 });
    }
    return { line: [P(...a), P(...b)], r: 0.45 * cam.s, world: [a, b] };
  };

  neonTube.halo = (geo, k = 1) => {
    if (!geo || k <= 0.002) return;
    const [a, b] = geo.world, n = 4;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      light.glow(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, 1.3, [90, 150, 255], 0.13 * k);
    }
    light.glow((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, 3.4, [60, 110, 230], 0.07 * k);
  };

  QH.assets.neonTube = neonTube;
})(QH);
