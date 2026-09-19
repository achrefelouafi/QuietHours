/* ═══════════════════════════════════════════════════════════════
   assets/beanbag.js — a beanbag slumped on the floor. Orange ones
   are lumpy, three lobes with a fold between; the olive one is
   a pear, sagging, with a darker cowl at the top. A bag is soft
   and round from every side, so it's drawn on screen like the
   ball is: a shadow, the body, the lobes, a contour.

   beanbag(x, y, o)
     centred on (x, y). o.kind is 'orange' (default), 'rust' or
     'olive'; o.size (1.5) is its width in world units; o.seed
     turns it a little so no two sit alike.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { rgb } = QH.draw;
  const { P, cam } = QH.cam;
  const { TAU, mix, rnd } = QH;
  const light = QH.light;

  const KIND = {
    orange: () => ({ dk: light.warm(M.rust, M.rustLt), base: light.warm(M.rustLt, M.orange), lit: light.warm(M.orangeDk, M.orangeLt), lumpy: true }),
    rust:   () => ({ dk: M.rustDk, base: light.warm(M.rustDk, M.rust), lit: light.warm(M.rust, M.rustLt), lumpy: true }),
    olive:  () => ({ dk: M.leafDk, base: M.olive, lit: M.oliveLt, lumpy: false }),
  };

  QH.assets.beanbag = (x, y, o = {}) => {
    const g = QH.draw.g, K = (KIND[o.kind] || KIND.orange)(), size = o.size || 1.7, R = rnd(o.seed || 5);
    const p = P(x, y, 0), s = size * 0.5 * cam.s, flip = R() > 0.5 ? -1 : 1;
    const ell = (dx, dy, rx, ry, fill) => { g.beginPath(); g.ellipse(p[0] + dx * s * flip, p[1] + dy * s, rx * s, ry * s, 0, 0, TAU); g.fillStyle = fill; g.fill(); };
    const arc = (dx, dy, r, fill) => { g.beginPath(); g.arc(p[0] + dx * s * flip, p[1] + dy * s, r * s, 0, TAU); g.fillStyle = fill; g.fill(); };

    ell(0.05, 0.05, 1.25, 0.45, 'rgba(8,16,26,0.55)');                                  // the shadow on the tiles
    // every shape in ink first, a pixel bigger, so the bag has one clean outline; then the shapes
    const shapes = K.lumpy
      ? [['e', 0, -0.32, 1.2, 0.58, K.dk], ['a', -0.5, -0.5, 0.44, 0, K.base], ['a', 0.45, -0.46, 0.4, 0, K.base], ['a', -0.05, -0.66, 0.4, 0, K.base], ['e', 0, -0.2, 0.95, 0.3, K.base]]
      : [['e', 0, -0.42, 1.0, 0.7, K.base], ['e', 0.08, -0.9, 0.55, 0.38, K.dk]];
    const px = 1 / s;
    for (const [k, dx, dy, r1, r2] of shapes) k === 'e' ? ell(dx, dy, r1 + px, r2 + px, rgb(M.ink)) : arc(dx, dy, r1 + px, rgb(M.ink));
    for (const [k, dx, dy, r1, r2, c] of shapes) k === 'e' ? ell(dx, dy, r1, r2, rgb(c)) : arc(dx, dy, r1, rgb(c));
    if (K.lumpy) {
      arc(-0.58, -0.58, 0.2, rgb(K.lit));                                                // the light on each lobe
      arc(0.38, -0.54, 0.17, rgb(K.lit));
      arc(-0.13, -0.76, 0.18, rgb(K.lit));
      g.beginPath(); g.moveTo(p[0] - 0.06 * s * flip, p[1] - 0.5 * s); g.lineTo(p[0] + 0.02 * s * flip, p[1] - 0.12 * s);   // the fold between the front lobes
      g.strokeStyle = rgb(K.dk); g.lineWidth = 1; g.stroke();
    } else {
      arc(-0.38, -0.4, 0.34, rgb(K.lit));                                                // the light low on one side
      ell(-0.05, -0.15, 0.85, 0.28, rgb(K.dk));                                          // the sag at the foot
    }
  };
})(QH);
