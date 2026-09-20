/* ═══════════════════════════════════════════════════════════════
   engine/draw.js — the drawing primitives every asset is built from.

   All sizes are in world units. Colours are [r,g,b] arrays from
   QH.M; `sh(col, k)` darkens one for a face. Faces get F.top /
   F.left (+y, screen-left) / F.right (+x, screen-right).

   Every solid also gets a one-pixel dark contour round its
   silhouette — that is what makes a box read as pixel art instead
   of a render. Edges are only ever the face colour or that contour:
   the old `rim` highlight along the lit top edges is gone, and a
   `rim` option is ignored.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const { TAU, clamp, lerp } = QH;
  const { P, cam } = QH.cam;

  let g = null;                                   // the 2D context being painted into
  const use = ctx => { g = ctx; };

  const rgb = c => 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')';
  const sh  = (c, k) => rgb([clamp(c[0] * k, 0, 255), clamp(c[1] * k, 0, 255), clamp(c[2] * k, 0, 255)]);
  const F   = { top: 1.0, left: 0.88, right: 0.68 };
  const px  = len => Math.max(1, Math.round(len * cam.s));

  function path(pts, snap) {
    g.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const q = P(pts[i][0], pts[i][1], pts[i][2]);
      const x = snap ? Math.round(q[0]) + 0.5 : q[0];
      const y = snap ? Math.round(q[1]) + 0.5 : q[1];
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
  }

  /** Flat polygon in world space. pts = [[x,y,z], …] */
  function poly(pts, fill) { path(pts, false); g.closePath(); g.fillStyle = fill; g.fill(); }

  /** A line through world points. `w` is in pixels. */
  function stroke(pts, col, w = 1, close = false) {
    path(pts, w <= 1);
    if (close) g.closePath();
    g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'butt'; g.lineJoin = 'miter';
    g.stroke();
  }

  /** Axis-aligned solid: +y face, +x face, top, contour. */
  function box(x, y, z, w, d, h, col, o = {}) {
    const cT = o.colTop || col, cL = o.colLeft || col, cR = o.colRight || col;
    const zt = z + h, S = QH.light.shade, zm = z + h / 2;
    const kT = o.top   ?? S(x + w / 2, y + d / 2, zt, 0, 0, 1, F.top);
    const kL = o.left  ?? S(x + w / 2, y + d, zm, 0, 1, 0, F.left);
    const kR = o.right ?? S(x + w, y + d / 2, zm, 1, 0, 0, F.right);
    if (h > 0) {
      poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, zt], [x, y + d, zt]], sh(cL, kL));
      poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, zt], [x + w, y, zt]], sh(cR, kR));
    }
    poly([[x, y, zt], [x + w, y, zt], [x + w, y + d, zt], [x, y + d, zt]], sh(cT, kT));
    if (o.edge !== false) {
      const c = rgb(o.edgeCol || QH.M.ink);
      stroke([[x, y, zt], [x + w, y, zt], [x + w, y + d, zt], [x, y + d, zt]], c, 1, true);
      if (h > 0) {
        stroke([[x + w, y + d, zt], [x + w, y + d, z]], c);
        stroke([[x, y + d, zt], [x, y + d, z]], c);
        stroke([[x + w, y, zt], [x + w, y, z]], c);
      }
    }
  }

  /** Rectangle flat against the left wall plane (x = const), facing +x. */
  function rectX(x, y0, z0, y1, z1, fill) { poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], fill); }
  /** Rectangle flat against the back wall plane (y = const), facing +y. */
  function rectY(y, x0, z0, x1, z1, fill) { poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], fill); }

  function circle(fn, r, n) {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * TAU; pts.push(fn(r * Math.cos(a), r * Math.sin(a))); }
    return pts;
  }
  /** Circles lying flat, on an x = const plane, on a y = const plane. */
  const disc  = (cx, cy, z, r, fill, n = 18) => poly(circle((u, v) => [cx + u, cy + v, z], r, n), fill);
  const discX = (x, cy, cz, r, fill, n = 18) => poly(circle((u, v) => [x, cy + u, cz + v], r, n), fill);
  const discY = (cx, y, cz, r, fill, n = 18) => poly(circle((u, v) => [cx + u, y, cz + v], r, n), fill);
  const ring  = (cx, cy, z, r, col, n = 18) => stroke(circle((u, v) => [cx + u, cy + v, z], r, n), col, 1, true);

  /** Vertical cylinder, or a cone when `rt` (top radius) differs from `r`.
      Only the segments facing the camera are drawn, back to front. */
  function cyl(cx, cy, z, r, h, col, o = {}) {
    const n = o.n || 16, rt = o.rt ?? r;
    const tilt = h > 0 ? (r - rt) / h : 0;        // normal tips up when the base is wider
    const segs = [];
    for (let i = 0; i < n; i++) {
      const am = (i + 0.5) / n * TAU, c = Math.cos(am), s = Math.sin(am);
      if (c + s + tilt * 1.1 <= 0) continue;
      segs.push({ i, d: c + s, c, s });
    }
    segs.sort((a, b) => a.d - b.d);
    for (const { i, c, s } of segs) {
      const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
      let k = lerp(F.right, F.left, clamp((s - c) * 0.5 + 0.5, 0, 1)) + tilt * 0.25;
      k = QH.light.shade(cx + c * r, cy + s * r, z + h / 2, c, s, tilt, clamp(k, 0.4, 1.1)) * (o.side || 1);
      poly([[cx + r  * Math.cos(a0), cy + r  * Math.sin(a0), z],     [cx + r  * Math.cos(a1), cy + r  * Math.sin(a1), z],
            [cx + rt * Math.cos(a1), cy + rt * Math.sin(a1), z + h], [cx + rt * Math.cos(a0), cy + rt * Math.sin(a0), z + h]],
           sh(col, k));
    }
    if (o.top !== false && rt > 0) disc(cx, cy, z + h, rt, sh(o.colTop || col, o.topK ?? QH.light.shade(cx, cy, z + h, 0, 0, 1, F.top)), n);
    if (o.edge !== false) {
      const c = rgb(o.edgeCol || QH.M.ink);
      if (rt > 0) ring(cx, cy, z + h, rt, c, n);
      for (const a of [TAU * 3 / 8, TAU * 7 / 8]) {
        stroke([[cx + r * Math.cos(a), cy + r * Math.sin(a), z], [cx + rt * Math.cos(a), cy + rt * Math.sin(a), z + h]], c);
      }
    }
  }

  /** Vertical prism over any flat outline: pts = [[x, y], …] in either
      winding, from z up h. Like cyl, only the sides facing the camera
      are drawn, each shaded by its normal; o.inside draws the far sides
      from within instead — how a tub shows its inner wall. */
  function prism(pts, z, h, col, o = {}) {
    const n = pts.length;
    let area = 0;
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
    const Q = area < 0 ? pts.slice().reverse() : pts;               // counter-clockwise, so (dy, -dx) points out
    const facing = i => { const a = Q[i], b = Q[(i + 1) % n]; return (b[1] - a[1]) - (b[0] - a[0]) > 0; };
    const faces = [];
    for (let i = 0; i < n; i++) {
      if (facing(i) === !!o.inside) continue;
      const a = Q[i], b = Q[(i + 1) % n], len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const s = o.inside ? -1 : 1;
      faces.push({ a, b, nx: s * (b[1] - a[1]) / len, ny: -s * (b[0] - a[0]) / len });
    }
    for (const f of faces) {
      let k = lerp(F.right, F.left, clamp((f.ny - f.nx) * 0.5 + 0.5, 0, 1));
      k = QH.light.shade((f.a[0] + f.b[0]) / 2, (f.a[1] + f.b[1]) / 2, z + h / 2, f.nx, f.ny, 0, k) * (o.side || 1);
      poly([[f.a[0], f.a[1], z], [f.b[0], f.b[1], z], [f.b[0], f.b[1], z + h], [f.a[0], f.a[1], z + h]], sh(col, k));
    }
    if (o.top !== false && !o.inside) {
      let cx = 0, cy = 0;
      for (const p of Q) { cx += p[0] / n; cy += p[1] / n; }
      poly(Q.map(p => [p[0], p[1], z + h]), sh(o.colTop || col, o.topK ?? QH.light.shade(cx, cy, z + h, 0, 0, 1, F.top)));
    }
    if (o.edge !== false) {
      const c = rgb(o.edgeCol || QH.M.ink);
      if (!o.inside) stroke(Q.map(p => [p[0], p[1], z + h]), c, 1, true);
      // the silhouette's uprights: where the outline turns from facing away to facing the camera
      for (let i = 0; i < n; i++) if (facing((i + n - 1) % n) !== facing(i)) stroke([[Q[i][0], Q[i][1], z], [Q[i][0], Q[i][1], z + h]], c);
    }
  }

  /** Thick line between two world points; width in world units. */
  function beam(a, b, w, col, k = 1) {
    const p = P(a[0], a[1], a[2]), q = P(b[0], b[1], b[2]);
    g.strokeStyle = sh(col, k); g.lineWidth = px(w); g.lineCap = 'round';
    g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke();
  }

  /** One screen-space square at a world point. `size` in pixels. */
  function dot(x, y, z, size, col) {
    const p = P(x, y, z);
    g.fillStyle = rgb(col);
    g.fillRect(Math.round(p[0]), Math.round(p[1]), size, size);
  }

  /** Scatter `count` flecks; `sample(R)` returns a world point. */
  function grain(count, col, seed, size, sample) {
    const R = QH.rnd(seed);
    g.fillStyle = rgb(col);
    for (let i = 0; i < count; i++) {
      const w = sample(R), p = P(w[0], w[1], w[2]);
      g.fillRect(Math.round(p[0]), Math.round(p[1]), size, size);
    }
  }

  /** Clip everything until unclip() to a world polygon. */
  function clip(pts) { g.save(); path(pts, false); g.closePath(); g.clip(); }
  function unclip() { g.restore(); }

  /* ── walls ─────────────────────────────────────────────────────
     Anything hung on a wall takes a wall and a position `u` along
     it, so the same poster can go on either. `off` is how far it
     stands proud of the wall. */
  const wall = {
    L: {                                             // left wall: x = 0, faces +x, u runs along y
      pt:   (u, z, off = 0) => [off, u, z],
      rect: (u0, z0, u1, z1, fill, off = 0.02) => rectX(off, u0, z0, u1, z1, fill),
      box:  (u, z, w, h, depth, col, o) => box(0, u, z, depth, w, h, col, o),
      disc: (u, z, r, fill, n, off = 0.02) => discX(off, u, z, r, fill, n),
    },
    B: {                                             // back wall: y = 0, faces +y, u runs along x
      pt:   (u, z, off = 0) => [u, off, z],
      rect: (u0, z0, u1, z1, fill, off = 0.02) => rectY(off, u0, z0, u1, z1, fill),
      box:  (u, z, w, h, depth, col, o) => box(u, 0, z, w, depth, h, col, o),
      disc: (u, z, r, fill, n, off = 0.02) => discY(u, off, z, r, fill, n),
    },
  };

  QH.draw = {
    get g() { return g; }, use,
    rgb, sh, F, px,
    poly, stroke, box, rectX, rectY, disc, discX, discY, ring, cyl, prism, beam, dot, grain, clip, unclip,
    wall,
  };
})(QH);
