/* ═══════════════════════════════════════════════════════════════
   assets/neonSign.js — a neon tube bent into a line of hills,
   mounted on the wall. Lit or not, as the scene says.

   neonSign(wall, u, z, w, o)
     from u to u+w along the wall, its baseline at height z; the
     hills rise o.h (0.9) above it. o.pts overrides the shape as
     [[fu, fz], …] in 0..1. o.on is 0..1 (1): how lit the tube
     is — at 0 it is dark glass on the wall.
   Returns the screen geometry of the draw, for hit-testing (also
   kept in neonSign.last): the tube as a screen polyline and a
   radius around it.
   neonSign.halo(k) — call from the scene's lighting pass to add
     the glow along whatever was last drawn (k scales it).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { mix } = QH;
  const { wall: W, beam, rgb } = QH.draw;
  const { P, cam } = QH.cam;
  const light = QH.light;

  // two hills, the second lower, ending low on the right
  const SHAPE = [[0, 0.3], [0.07, 0.62], [0.16, 0.95], [0.26, 1.0], [0.36, 0.78], [0.46, 0.42], [0.56, 0.32],
                 [0.66, 0.5], [0.76, 0.6], [0.86, 0.38], [0.94, 0.12], [1, 0.02]];

  // Catmull-Rom through the control points, `n` samples per span
  function curve(pts, n) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let j = 0; j < n; j++) {
        const t = j / n, t2 = t * t, t3 = t2 * t;
        out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                  0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
      }
    }
    out.push(pts[pts.length - 1].slice());
    return out;
  }

  let last = [];
  const neonSign = (wall, u, z, w, o = {}) => {
    const Wl = W[wall], h = o.h || 0.9, off = 0.14, on = o.on === undefined ? 1 : o.on;
    const pts = curve(o.pts || SHAPE, 5).map(([fu, fz]) => Wl.pt(u + fu * w, z + fz * h, off));
    last = pts;

    // the wash on the wall behind it, then the tube, then its hot core —
    // each fading toward dark glass as the tube goes out
    const wash = mix(M.wallB, M.rustDk, on), tube = mix(M.greyDk, M.bright, on), core = mix(M.grey, M.glow, on);
    if (on > 0.02) for (let i = 1; i < pts.length; i++) beam(pts[i - 1], pts[i], 0.42, wash, 1);
    for (let i = 1; i < pts.length; i++) beam(pts[i - 1], pts[i], 0.19, tube, 1);
    for (let i = 1; i < pts.length; i++) beam(pts[i - 1], pts[i], 0.08, core, 1);

    // mounting clips at each end
    const S = o.pts || SHAPE;
    for (const [fu, fz] of [S[0], S[S.length - 1]]) Wl.disc(u + fu * w, z + fz * h - 0.12, 0.07, rgb(M.greyDk), 6, off + 0.02);

    return (neonSign.last = { line: pts.filter((_, i) => i % 3 === 0).map(p => P(p[0], p[1], p[2])), r: 0.45 * cam.s });
  };
  neonSign.last = null;

  neonSign.halo = (k = 1) => {
    if (k <= 0.002) return;
    for (let i = 0; i < last.length; i += 4) light.glow(last[i][0], last[i][1], last[i][2], 1.1, [255, 150, 50], 0.16 * k);
    if (last.length) {
      const m = last[last.length >> 1];
      light.glow(m[0], m[1], m[2], 4.2, [235, 130, 45], 0.09 * k);
    }
  };

  QH.assets.neonSign = neonSign;
})(QH);
