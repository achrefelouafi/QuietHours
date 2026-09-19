/* ═══════════════════════════════════════════════════════════════
   assets/waterCooler.js — a water cooler: a pale cabinet with a
   dark tap panel in its front, a drip tray under it, and the big
   blue bottle upended on top, its ribs catching the light.

   waterCooler(x, y, o)
     (x, y) is the far corner of its footprint. o.face is '+y'
     (default) or '+x', where the taps are; o.w (0.7) is the
     cabinet's side, o.h (1.35) its height.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectX, rectY, cyl, ring, disc, dot, rgb } = QH.draw;
  const { mix } = QH;

  QH.assets.waterCooler = (x, y, o = {}) => {
    const w = o.w || 0.7, h = o.h || 1.35, X = (o.face || '+y') === '+x';
    const front = (a0, z0, a1, z1, fill) => X ? rectX(x + w + 0.01, y + a0, z0, y + a1, z1, fill) : rectY(y + w + 0.01, x + a0, z0, x + a1, z1, fill);
    const fp = (a, z) => X ? [x + w + 0.02, y + a, z] : [x + a, y + w + 0.02, z];

    // the cabinet, its top a shade lighter, a seam where the door is
    box(x, y, 0, w, w, h, M.greyLt, { colTop: M.silver, left: 0.92, right: 0.7 });
    front(0.06, 0.08, w - 0.06, h * 0.42, rgb(M.grey));                    // the lower door
    front(0.14, h * 0.5, w - 0.14, h * 0.86, rgb(M.greyDk));                // the tap panel
    dot(...fp(w * 0.32, h * 0.72), 1, M.blueLt);                            // cold
    dot(...fp(w * 0.62, h * 0.72), 1, M.bright);                            // hot
    front(0.2, h * 0.53, w - 0.2, h * 0.6, rgb(M.blue));                    // the tray
    // the bottle: a neck into the cabinet, the body in ribs
    const cx = x + w / 2, cy = y + w / 2, r = w * 0.36;
    cyl(cx, cy, h, r * 0.55, 0.12, M.silver, { n: 10, colTop: M.grey, topK: 1 });
    cyl(cx, cy, h + 0.12, r, 0.75, M.blue, { n: 14, colTop: M.blueLt, topK: 1, rt: r * 0.9 });
    for (const zz of [0.3, 0.52]) ring(cx, cy, h + 0.12 + zz, r * (1 - zz * 0.13), rgb(M.blueLt), 14);
    ring(cx, cy, h + 0.12 + 0.18, r * 0.98, rgb(M.blueDk), 14);
    disc(cx, cy, h + 0.87, r * 0.5, rgb(M.blue), 10);
    cyl(cx, cy, h + 0.87, r * 0.45, 0.08, M.blueDk, { n: 8, colTop: M.blue, topK: 1 });
    // the light on the water
    QH.draw.beam([cx - r * 0.55, cy - r * 0.2, h + 0.25], [cx - r * 0.55, cy - r * 0.2, h + 0.75], 0.06, mix(M.blueLt, M.cyan, 0.6), 1);
  };
})(QH);
