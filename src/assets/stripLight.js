/* ═══════════════════════════════════════════════════════════════
   assets/stripLight.js — a bar of orange light on the wall.
   Lit or not, as the scene says.

   stripLight(wall, u, z, w, o)
     from u to u+w along the wall, centred on height z. o.on is
     0..1 (1): how lit the bar is — at 0 it is a dark tube in its
     housing.
   Returns the screen geometry of the draw, for hit-testing (also
   kept in stripLight.last): the bar as a screen polyline and a
   radius around it.
   stripLight.halo(k) — call from the scene's lighting pass to add
     the glow along whatever was last drawn (k scales it).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { mix } = QH;
  const { wall: W, rgb } = QH.draw;
  const { P, cam } = QH.cam;
  const light = QH.light;

  let last = null;                                                   // [wall pts, world] of the bar's ends
  const stripLight = (wall, u, z, w, o = {}) => {
    const Wl = W[wall], on = o.on === undefined ? 1 : o.on;
    Wl.box(u, z - 0.13, w, 0.26, 0.14, M.navyDk, { colTop: M.navy });
    // the tube, then its hot core — each fading toward dark glass as it goes out
    Wl.rect(u + 0.1, z - 0.07, u + w - 0.1, z + 0.07, rgb(mix(M.greyDk, M.bright, on)), 0.15);
    Wl.rect(u + 0.14, z - 0.03, u + w - 0.14, z + 0.03, rgb(mix(M.grey, M.glow, on)), 0.16);

    last = [Wl.pt(u, z, 0.15), Wl.pt(u + w, z, 0.15)];
    return (stripLight.last = { line: last.map(p => P(p[0], p[1], p[2])), r: 0.45 * cam.s });
  };
  stripLight.last = null;

  stripLight.halo = (k = 1) => {
    if (k <= 0.002 || !last) return;
    const [a, b] = last, n = 3;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      light.glow(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, 1.6, [240, 150, 60], 0.14 * k);
    }
    light.glow((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, 3.2, [230, 140, 50], 0.07 * k);
  };

  QH.assets.stripLight = stripLight;
})(QH);
