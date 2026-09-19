/* ═══════════════════════════════════════════════════════════════
   assets/mixerDesk.js — the mixing desk: a dark teal cabinet on
   four posts with two frosted panels in its front, a wood lip
   round the top, and on the top a console of knobs in rows, a
   bank of faders, four orange buttons, a bottle at the back and
   a curved arm — a mic boom — rearing up over it. A few of the
   knobs' lights blink.

   mixerDesk(x, y, t, o)
     (x, y) is the far corner; the front faces +y. o.w (3.2) runs
     along x, o.d (1.5) along y, o.h (1.7) is the top.
   mixerDesk.H(o) is the top's height.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectY, poly, beam, dot, disc, cyl, rgb, sh } = QH.draw;
  const { rnd, mix } = QH;
  const light = QH.light;

  const H = o => o.h || 1.7;

  const mixerDesk = (x, y, t = 0, o = {}) => {
    const w = o.w || 3.2, d = o.d || 1.5, h = H(o), teal = M.leafDk;
    // four posts, then the cabinet a little in from them, and the top slab over both
    for (const [px, py] of [[0.05, 0.05], [w - 0.2, 0.05], [0.05, d - 0.2], [w - 0.2, d - 0.2]]) box(x + px, y + py, 0, 0.15, 0.15, 0.3, M.ink, { edge: false });
    box(x + 0.1, y + 0.1, 0.3, w - 0.2, d - 0.2, h - 0.5, teal, { colTop: teal, left: 0.85, right: 0.65 });
    // the frosted panels in the front, a slant of light across each
    for (const [a, b] of [[0.2, 0.48], [0.52, 0.8]]) {
      rectY(y + d - 0.09, x + w * a, 0.5, x + w * b, h - 0.6, rgb(M.slate));
      poly([[x + w * a + 0.1, y + d - 0.08, 0.55], [x + w * a + 0.3, y + d - 0.08, 0.55], [x + w * b - 0.1, y + d - 0.08, h - 0.65], [x + w * b - 0.3, y + d - 0.08, h - 0.65]], rgb(M.steel));
    }
    box(x, y, h - 0.2, w, d, 0.2, teal, { colTop: teal, left: 0.85, right: 0.65 });
    // the wood lip round the top
    const wood = light.warm(M.rust, M.rustLt);
    poly([[x, y + d - 0.14, h + 0.01], [x + w, y + d - 0.14, h + 0.01], [x + w, y + d, h + 0.01], [x, y + d, h + 0.01]], rgb(wood));
    poly([[x + w - 0.14, y, h + 0.01], [x + w, y, h + 0.01], [x + w, y + d, h + 0.01], [x + w - 0.14, y + d, h + 0.01]], rgb(wood));

    // the console: a dark plate across the middle, knobs in rows, the fader bank, the buttons
    const cz = h + 0.02;
    box(x + 0.3, y + 0.25, h, w - 0.6, d - 0.55, 0.06, M.ink, { colTop: M.ink, edge: false });
    const R = rnd(31), blink = Math.floor(t * 3);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) {
      const kx = x + 0.55 + c * 0.24, ky = y + 0.4 + r * 0.24;
      const lit = ((r * 8 + c + blink) % 7) === 0;
      disc(kx, ky, cz + 0.04, 0.055, rgb(lit ? M.cyan : R() > 0.6 ? M.silver : M.greyLt), 6);
    }
    for (let i = 0; i < 5; i++) {                                     // the faders
      const fx = x + w - 1.15 + i * 0.16;
      beam([fx, y + 0.42, cz + 0.05], [fx, y + 0.85, cz + 0.05], 0.03, M.greyDk, 1);
      dot(fx - 0.03, y + 0.5 + R() * 0.3, cz + 0.06, 2, M.silver);
    }
    for (let i = 0; i < 4; i++) disc(x + w - 0.95 + i * 0.17, y + d - 0.42, cz + 0.05, 0.06, rgb(i === blink % 4 ? M.amber : M.orange), 6);   // the buttons
    for (let i = 0; i < 3; i++) disc(x + 0.5 + i * 0.2, y + d - 0.42, cz + 0.05, 0.05, rgb(M.leafLt), 6);

    // the bottle at the back, and the boom arm curving up over the desk
    cyl(x + 0.55, y + 0.22, h, 0.1, 0.32, light.warm(M.orange, M.orangeLt), { n: 8, colTop: M.orangeDk, topK: 1 });
    cyl(x + 0.55, y + 0.22, h + 0.32, 0.05, 0.1, M.ink, { n: 6, edge: false });
    const ax = x + w * 0.5, ay = y + 0.2;
    const arm = [[ax, ay, h], [ax + 0.05, ay - 0.02, h + 0.4], [ax + 0.2, ay - 0.02, h + 0.72], [ax + 0.45, ay, h + 0.9], [ax + 0.7, ay + 0.06, h + 0.92]];
    for (let i = 1; i < arm.length; i++) beam(arm[i - 1], arm[i], 0.09, M.ink, 1);
    for (let i = 1; i < arm.length; i++) beam(arm[i - 1], arm[i], 0.035, M.greyDk, 1);
    cyl(ax, ay, h, 0.12, 0.08, M.greyDk, { n: 8, colTop: M.grey, topK: 1 });
    disc(ax + 0.72, ay + 0.06, h + 0.9, 0.07, rgb(M.cyan), 6);
  };
  mixerDesk.H = H;
  QH.assets.mixerDesk = mixerDesk;
})(QH);
