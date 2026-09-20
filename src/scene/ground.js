/* ═══════════════════════════════════════════════════════════════
   scene/ground.js — the ground the house stands on.

   An isometric grid of the same two-unit tiles as the floors,
   running out from under room one's slab in every direction and
   dissolving into the dark long before it could show over the
   booth's roof; every seventh line stronger, so room one sits in
   one cell of the coarse grid. A scatter of nodes at the
   crossings, each breathing on its own clock. Every nine seconds
   a ring of light sets out from under the house and dies as it
   runs. Now and then a bead sets off along a line from under the
   house and goes out at the edge. Nothing of the house's light
   reaches the tiles: the ground is dark right up to the slab.

   The grid is drawn on its own transparent canvas, so the fade
   and the ring are compositing operations — 'destination-in'
   thins it toward the edge, 'source-atop' lights just the lines
   under the ring — before it goes on the frame in one drawImage.
   Nothing here can be touched.

   QH.scenes.ground → { draw(t), R, C }
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { TAU, clamp, rnd } = QH;
  const { P, cam } = QH.cam;
  const draw = QH.draw;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;   // nothing moves on its own: no ring, no beads, the nodes hold

  const Z = -0.35;                               // the ground: the underside of room one's slab (room.js's FT)
  const C = [0, 0];                              // where the grid is brightest — room one's far corner, under the middle of the house
  const R = 46;                                  // how far it runs before it's gone, in world units
  const TILE = 2, MAJOR = 14;                    // the tiles, as the floors'; a stronger line every seventh, so room one fills one cell
  const NODE = 0.13;                             // the share of crossings that carry a node
  const RING = { every: 9, run: 6, w: 4.5 };     // seconds between rings, how long one takes to reach the edge, its width in world units
  const BEADS = 5;                               // how many beads can be out at once

  const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  const snap = v => Math.round(v) + 0.5;

  /* ── the layer: a transparent canvas the size of the frame ── */
  let layer = null, lg = null;
  function ready(g) {
    const w = g.canvas.width, h = g.canvas.height;
    if (!layer) { layer = document.createElement('canvas'); lg = layer.getContext('2d'); }
    if (layer.width !== w || layer.height !== h) { layer.width = w; layer.height = h; }
    lg.globalCompositeOperation = 'source-over';
    lg.globalAlpha = 1;
    lg.clearRect(0, 0, w, h);
    return lg;
  }

  /** A radial gradient over a world circle on the ground, centred on
      (cx, cy), radius r — a 2:1 ellipse on screen. stops: [[u, css], …]. */
  function pool(g, cx, cy, r, stops) {
    const p = P(cx, cy, Z), Rp = r * cam.s * Math.SQRT2;
    g.save(); g.translate(p[0], p[1]); g.scale(1, 0.5);
    const grd = g.createRadialGradient(0, 0, 0, 0, 0, Rp);
    for (const s of stops) grd.addColorStop(clamp(s[0], 0, 1), s[1]);
    g.fillStyle = grd; g.fillRect(-Rp, -Rp, Rp * 2, Rp * 2);
    g.restore();
  }

  /** Half the length of the line at `v` across the circle — the chord, so nothing is drawn past where it's faded to nothing. */
  const half = (v, c) => Math.sqrt(Math.max(0, R * R - (v - c) * (v - c)));

  /** The lines, a batch per weight: chords of the circle, one pixel, snapped like every other line in the house. */
  function lines(g) {
    const n = Math.ceil(R / TILE);
    for (const major of [false, true]) {
      g.beginPath();
      for (let k = -n; k <= n; k++) {
        const v = k * TILE;
        if ((v % MAJOR === 0) !== major) continue;
        const hy = half(v, C[0]), hx = half(v, C[1]);
        if (hy > 0) {                            // x = v, running along y
          const p = P(v, C[1] - hy, Z), q = P(v, C[1] + hy, Z);
          g.moveTo(snap(p[0]), snap(p[1])); g.lineTo(snap(q[0]), snap(q[1]));
        }
        if (hx > 0) {                            // y = v, running along x
          const p = P(C[0] - hx, v, Z), q = P(C[0] + hx, v, Z);
          g.moveTo(snap(p[0]), snap(p[1])); g.lineTo(snap(q[0]), snap(q[1]));
        }
      }
      g.strokeStyle = draw.rgb(major ? M.navyLt : M.floor);
      g.lineWidth = 1; g.lineCap = 'butt';
      g.stroke();
    }
  }

  /** The nodes: a hash picks the crossings that carry one, and gives each its own phase and rate to breathe by. */
  function nodes(g, t) {
    const n = Math.ceil(R / TILE), size = cam.s >= 12 ? 2 : 1;
    for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
      if (i * i + j * j > n * n) continue;
      let h = (i * 374761393 + j * 668265263) | 0;
      h = ((h ^ (h >>> 13)) * 1274126177) | 0;
      h = (h ^ (h >>> 16)) >>> 0;
      if (h / 4294967296 > NODE) continue;
      const Rn = rnd(h), phase = Rn() * TAU, rate = 0.4 + Rn() * 0.9;
      const b = still ? 0.4 : Math.pow(0.5 + 0.5 * Math.sin(t * rate + phase), 3);   // mostly dim, now and then bright
      g.globalAlpha = 0.3 + 0.7 * b;
      draw.dot(i * TILE + C[0], j * TILE + C[1], Z, size, M.steel);
    }
    g.globalAlpha = 1;
  }

  /** The beads: each sets off from under the house along a line of its own choosing and runs out to the edge, dimming as it goes.
      Most run toward the camera, where the ground shows; the rest go out under the upstairs rooms' overhangs. */
  function beads(g, t) {
    if (still) return;
    const size = cam.s >= 12 ? 2 : 1;
    for (let i = 0; i < BEADS; i++) {
      const every = 5.5 + i * 1.7, tt = t + i * 2.3;
      const c = Math.floor(tt / every), tau = tt - c * every;
      const u = tau / (every * 0.6); if (u >= 1) continue;
      const Rn = rnd((c * 7919 + i * 104729 + 12345) >>> 0);
      const alongX = Rn() < 0.5, out = Rn() < 0.7 ? 1 : -1;
      const fixed = Math.round((out > 0 ? Rn() * 28 - 14 : Rn() * 14) / TILE) * TILE;
      const from = out > 0 ? 14 : -16, to = out * half(fixed, alongX ? C[1] : C[0]);
      if (out * (to - from) <= 0) continue;
      const pos = from + (to - from) * u, back = pos - out * 2.2;
      const head = alongX ? [pos, fixed, Z] : [fixed, pos, Z], tail = alongX ? [back, fixed, Z] : [fixed, back, Z];
      const p = P(head[0], head[1], Z), q = P(tail[0], tail[1], Z);
      g.globalAlpha = 0.9 * Math.sqrt(1 - u);
      g.beginPath(); g.moveTo(snap(p[0]), snap(p[1])); g.lineTo(snap(q[0]), snap(q[1]));
      g.strokeStyle = draw.rgb(M.steel); g.lineWidth = 1; g.stroke();
      draw.dot(head[0], head[1], Z, size, M.sky);
    }
    g.globalAlpha = 1;
  }

  /** Thin the layer toward the edge: it's whole out to a third of the way, then goes gently, and is gone at R. */
  function fade(g) {
    g.globalCompositeOperation = 'destination-in';
    pool(g, C[0], C[1], R, [
      [0, 'rgba(255,255,255,1)'], [0.32, 'rgba(255,255,255,1)'], [0.5, 'rgba(255,255,255,0.7)'],
      [0.68, 'rgba(255,255,255,0.4)'], [0.85, 'rgba(255,255,255,0.15)'], [1, 'rgba(255,255,255,0)'],
    ]);
    g.globalCompositeOperation = 'source-over';
  }

  /** The ring: a band of light that leaves the house quickly and slows as it dies, lighting only the lines it's over. */
  function ring(g, t) {
    if (still) return;
    const tau = t % RING.every; if (tau >= RING.run) return;
    const u = tau / RING.run, e = 1 - (1 - u) * (1 - u);
    const r = 4 + (R - 4) * e, k = (1 - u) * 0.9;
    const ur = r / R, w = RING.w / R;
    g.globalCompositeOperation = 'source-atop';
    pool(g, C[0], C[1], R, [
      [ur - w * 2.5, rgba(M.sky, 0)], [ur - w * 0.25, rgba(M.sky, k)], [ur, rgba(M.cyan, k)], [ur + w * 0.4, rgba(M.sky, 0)],
    ]);
    g.globalCompositeOperation = 'source-over';
  }

  function drawGround(t) {
    const g = draw.g;                            // the frame
    const L = ready(g);
    draw.use(L);
    lines(L); nodes(L, t); beads(L, t);
    fade(L); ring(L, t);
    draw.use(g);
    g.drawImage(layer, 0, 0);
  }

  QH.scenes.ground = { draw: drawGround, R, C };
})(QH);
