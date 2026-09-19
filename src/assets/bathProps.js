/* ═══════════════════════════════════════════════════════════════
   assets/bathProps.js — the small things in the bathroom: what
   stands on the vanity, the sink and the shelves. Each takes the
   point it stands on (x, y) and the height z of the surface.

   bottle · pumpBottle · jar · tray · soapDish · tumbler
   candleJar · toiletBrush · tin
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, cyl, disc, ring, beam, dot, rgb } = QH.draw;
  const { mix } = QH;
  const light = QH.light;
  const A = QH.assets;

  /** A bottle: body, shoulder, cap, and a label facing the room. */
  A.bottle = (x, y, z, o = {}) => {
    const r = o.r || 0.13, h = o.h || 0.6, col = o.col || M.navy;
    cyl(x, y, z, r, h * 0.78, col, { n: 10, top: false });
    cyl(x, y, z + h * 0.78, r, h * 0.1, col, { n: 10, rt: r * 0.55, top: false, edge: false });
    cyl(x, y, z + h * 0.88, r * 0.55, h * 0.12, o.cap || M.greyDk, { n: 8, colTop: mix(o.cap || M.greyDk, M.greyLt, 0.4) });
    if (o.label !== false) beam([x + r * 0.62, y + r * 0.62, z + h * 0.28], [x + r * 0.62, y + r * 0.62, z + h * 0.58], r * 0.9, o.label || light.warm(M.rustLt, M.orange), 1);
  };

  /** A pump bottle: body, a thin neck, the nozzle bent over toward +y. */
  A.pumpBottle = (x, y, z, o = {}) => {
    const r = o.r || 0.14, h = o.h || 0.55, col = o.col || M.greyDk;
    cyl(x, y, z, r, h, col, { n: 10, colTop: mix(col, M.greyLt, 0.3) });
    cyl(x, y, z + h, r * 0.35, 0.16, M.greyDk, { n: 8, edge: false });
    box(x - r * 0.35, y - r * 0.35, z + h + 0.16, r * 0.7, r * 0.7, 0.08, M.greyDk, { colTop: M.grey, edge: false });
    beam([x, y + r * 0.2, z + h + 0.2], [x, y + r * 1.4, z + h + 0.2], 0.06, M.greyDk, 0.9);
    beam([x, y + r * 1.4, z + h + 0.2], [x, y + r * 1.4, z + h + 0.1], 0.06, M.greyDk, 0.9);
  };

  /** A squat jar with a lid. */
  A.jar = (x, y, z, o = {}) => {
    const r = o.r || 0.16, h = o.h || 0.28, col = o.col || M.navyDk;
    cyl(x, y, z, r, h, col, { n: 10, top: false });
    cyl(x, y, z + h, r * 1.04, 0.06, o.lid || M.greyDk, { n: 10, colTop: mix(o.lid || M.greyDk, M.greyLt, 0.35) });
  };

  /** A round tray, its lip a shade lighter. */
  A.tray = (x, y, z, r = 0.42) => {
    cyl(x, y, z, r, 0.05, M.navyDk, { n: 14, colTop: M.navy, topK: 1 });
    ring(x, y, z + 0.055, r * 0.9, rgb(M.slate), 14);
  };

  /** A dish with a bar of soap sitting in it. */
  A.soapDish = (x, y, z) => {
    box(x, y, z, 0.5, 0.36, 0.06, M.navyDk, { colTop: M.navy, top: 1 });
    box(x + 0.08, y + 0.06, z + 0.06, 0.34, 0.24, 0.12, M.tan, { colTop: M.cream, top: 0.95, left: 0.8, right: 0.68, edgeCol: M.wood });
  };

  /** A tumbler with a few toothbrushes leaning out of it. */
  A.tumbler = (x, y, z, o = {}) => {
    const r = o.r || 0.16, h = o.h || 0.45;
    cyl(x, y, z, r, h, M.grey, { n: 10, colTop: M.ink, topK: 1 });
    const sticks = [[-0.05, -0.03, M.cream, M.orange], [0.04, 0.02, M.greyLt, M.slate], [0.0, -0.06, M.cream, M.greyLt]];
    sticks.forEach(([dx, dy, c, head], i) => {
      const top = [x + dx * 2.2, y + dy * 2.2, z + h + 0.34 + i * 0.03];
      beam([x + dx, y + dy, z + h - 0.05], top, 0.04, c, 1);
      beam(top, [top[0] + dx * 0.4, top[1] + dy * 0.4, top[2] + 0.1], 0.06, head, 1);
    });
  };

  /** A candle in a glass jar, burnt down a little. */
  A.candleJar = (x, y, z, o = {}) => {
    const r = o.r || 0.17, h = o.h || 0.42;
    cyl(x, y, z, r, h, M.silver, { n: 10, colTop: M.greyDk, topK: 1 });
    disc(x, y, z + h + 0.005, r * 0.72, rgb(M.cream), 8);
    dot(x, y, z + h + 0.02, 1, M.greyDk);
  };

  /** A toilet brush standing in its cup. */
  A.toiletBrush = (x, y, z) => {
    cyl(x, y, z, 0.15, 0.4, M.navyDk, { n: 10, colTop: M.ink, topK: 1 });
    beam([x, y, z + 0.38], [x, y, z + 1.1], 0.05, M.greyDk, 1);
    cyl(x, y, z + 1.1, 0.06, 0.08, M.greyDk, { n: 6, edge: false });
  };

  /** A tin or box: grey, its lid a shade lighter, a dark label if asked. */
  A.tin = (x, y, z, w, d, h, o = {}) => {
    const col = o.col || M.grey;
    box(x, y, z, w, d, h, col, { colTop: o.colTop || mix(col, M.silver, 0.45), top: 0.95, left: 0.85, right: 0.68 });
    if (o.label) dot(x + w + 0.01, y + d * 0.5, z + h * 0.55, 1, o.label);
  };
})(QH);
