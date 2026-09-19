/* ═══════════════════════════════════════════════════════════════
   assets/toilet.js — the toilet: a tank standing on the back of a
   rounded pedestal, an oval bowl with the seat lid down on it, a
   flush lever on the tank's side. Warm grey porcelain, the tops
   picking up the light.

   toilet(x, y, o)
     the tank's back is on the x side (against the left wall), the
     bowl points +x; footprint x..x+2.2 by y..y+1.5. o.face = '+y'
     turns it to stand against the back wall instead.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, prism, stroke, beam, rgb } = QH.draw;
  const { TAU } = QH;
  const light = QH.light;

  const L = 2.2, W = 1.5, BASE = 1.05, SEAT = 1.48;

  /** A rounded rectangle u0..u1 by v0..v1 with corner radius c. */
  function rounded(u0, v0, u1, v1, c, n = 4) {
    const pts = [], cs = [[u1 - c, v1 - c, 0], [u0 + c, v1 - c, 1], [u0 + c, v0 + c, 2], [u1 - c, v0 + c, 3]];
    for (const [cu, cv, q] of cs) for (let i = 0; i <= n; i++) { const a = (q + i / n) * TAU / 4; pts.push([cu + c * Math.cos(a), cv + c * Math.sin(a)]); }
    return pts;
  }
  /** An oval, flattened where it meets the tank at u = flat. */
  function oval(cu, cv, ru, rv, flat, n = 18) {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * TAU; pts.push([Math.max(flat, cu + ru * Math.cos(a)), cv + rv * Math.sin(a)]); }
    return pts;
  }

  const toilet = (x, y, o = {}) => {
    const face = o.face || '+x';
    const at = ([u, v]) => face === '+x' ? [x + u, y + v] : [x + v, y + u];
    const body = M.greyLt, top = light.warm(M.greyLt, M.tan);
    const B = { colTop: top, top: 0.98, left: 0.9, right: 0.7 };

    // the pedestal, running under the tank and out to carry the bowl
    prism(rounded(0.12, 0.36, 1.75, 1.14, 0.22).map(at), 0, BASE, body, { colTop: top, side: 0.88 });

    // the tank on the back of it, its lid a little wider, the lever on the room side
    const tank = face === '+x' ? [x + 0.05, y + 0.1, 0.6, 1.3] : [x + 0.1, y + 0.05, 1.3, 0.6];
    box(tank[0], tank[1], BASE + 0.02, tank[2], tank[3], 1.42, body, B);
    box(tank[0] - 0.04, tank[1] - 0.04, BASE + 1.44, tank[2] + 0.08, tank[3] + 0.08, 0.14, body, { ...B, rim: light.warm(M.silver, M.cream) });
    const lv = face === '+x' ? [[x + 0.3, y + 1.41, BASE + 1.2], [x + 0.5, y + 1.41, BASE + 1.2]] : [[x + 1.41, y + 0.3, BASE + 1.2], [x + 1.41, y + 0.5, BASE + 1.2]];
    beam(lv[0], lv[1], 0.06, M.greyDk, 1);

    // the bowl: an oval flat against the tank, then the seat lid closed over it
    prism(oval(1.45, 0.75, 0.82, 0.64, 0.68).map(at), BASE, 0.3, body, { top: false, side: 0.9 });
    prism(oval(1.45, 0.75, 0.78, 0.6, 0.68).map(at), BASE + 0.3, SEAT - BASE - 0.3, body, { colTop: top, top: 1.0, side: 0.95 });
    stroke(oval(1.45, 0.75, 0.62, 0.45, 0.72, 14).map(at).map(p => [p[0], p[1], SEAT + 0.01]), rgb(M.grey), 1, true);   // the lid's edge
    const hinge = face === '+x' ? [x + 0.66, y + 0.55, 0.1, 0.4] : [x + 0.55, y + 0.66, 0.4, 0.1];
    box(hinge[0], hinge[1], SEAT - 0.02, hinge[2], hinge[3], 0.08, M.greyDk, { edge: false });
  };
  toilet.L = L; toilet.W = W;
  QH.assets.toilet = toilet;
})(QH);
