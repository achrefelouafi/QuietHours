/* ═══════════════════════════════════════════════════════════════
   engine/camera.js — 2:1 isometric projection.

     sx = (x - y) * s
     sy = (x + y) * s/2 - z * s

   `s` is screen pixels per world unit along x. +x runs screen
   down-right, +y down-left, +z straight up. The camera sits at
   +x +y +z, so the faces you can see on any solid are the ones
   whose normals point +x, +y or +z.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const cam = { x: 0, y: 0, s: 12 };

  function P(x, y, z) {
    const s = cam.s;
    return [(x - y) * s + cam.x, (x + y) * s * 0.5 - z * s + cam.y];
  }

  /** Fit a w×d room with walls h high into a buffer of iw×ih pixels. */
  function fit(w, d, h, iw, ih, pad = 6) {
    const width = w + d;                  // in units of s
    const top = -h, bottom = (w + d) * 0.5 + 0.4;
    cam.s = Math.min((iw - pad * 2) / width, (ih - pad * 2) / (bottom - top));
    cam.x = iw / 2 - (w - d) * 0.5 * cam.s;
    cam.y = ih / 2 - (top + bottom) * 0.5 * cam.s;
  }

  QH.cam = { cam, P, fit };
})(QH);
