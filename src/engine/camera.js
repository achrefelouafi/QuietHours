/* ═══════════════════════════════════════════════════════════════
   engine/camera.js — 2:1 isometric projection.

     sx = (x - y) * s
     sy = (x + y) * s/2 - z * s

   `s` is screen pixels per world unit along x. +x runs screen
   down-right, +y down-left, +z straight up. The camera sits at
   +x +y +z, so the faces you can see on any solid are the ones
   whose normals point +x, +y or +z.

   `at(ox, oy, oz)` moves the world origin, so a whole room can be
   drawn in its own coordinates and then placed — that is how the
   two rooms share one scene.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const cam = { x: 0, y: 0, s: 12, ox: 0, oy: 0, oz: 0 };

  function P(x, y, z) {
    const s = cam.s;
    x += cam.ox; y += cam.oy; z += cam.oz;
    return [(x - y) * s + cam.x, (x + y) * s * 0.5 - z * s + cam.y];
  }

  /** Move the world origin (in world units). at() alone resets it. */
  function at(ox = 0, oy = 0, oz = 0) { cam.ox = ox; cam.oy = oy; cam.oz = oz; }

  /** Fit a box in projected units (the projection at s = 1) into iw×ih pixels. */
  function fitBox(b, iw, ih, pad = 6) {
    cam.s = Math.min((iw - pad * 2) / (b.x1 - b.x0), (ih - pad * 2) / (b.y1 - b.y0));
    cam.x = iw / 2 - (b.x0 + b.x1) * 0.5 * cam.s;
    cam.y = ih / 2 - (b.y0 + b.y1) * 0.5 * cam.s;
  }

  /** Fit a w×d room with walls h high into a buffer of iw×ih pixels. */
  function fit(w, d, h, iw, ih, pad = 6) {
    fitBox({ x0: -d, x1: w, y0: -h, y1: (w + d) * 0.5 + 0.4 }, iw, ih, pad);
  }

  QH.cam = { cam, P, at, fit, fitBox };
})(QH);
