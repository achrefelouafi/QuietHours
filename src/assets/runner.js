/* ═══════════════════════════════════════════════════════════════
   assets/runner.js — a small jute mat: pale weave, a darker
   stripe near each short end, fringe along both.

   runner(x, y, w, d)
     footprint x..x+w by y..y+d; the fringe is on the y ends.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { poly, stroke, beam, rgb, grain } = QH.draw;
  const light = QH.light;

  QH.assets.runner = (x, y, w, d) => {
    const z = 0.02;
    const base = light.warm(M.woodLt, M.tan), weave = light.warm(M.wood, M.woodLt), lt = light.warm(M.woodLt, M.tan);
    poly([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], rgb(base));
    for (let i = 0.12; i < w; i += 0.24) stroke([[x + i, y, z], [x + i, y + d, z]], rgb(weave));   // the weave, in rows
    for (const sy of [y + 0.35, y + d - 0.45]) {                                                     // a stripe at each end
      poly([[x, sy, z], [x + w, sy, z], [x + w, sy + 0.12, z], [x, sy + 0.12, z]], rgb(weave));
    }
    stroke([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], rgb(weave), 1, true);
    for (let i = 0.1; i < w; i += 0.2) {                                                           // fringe
      beam([x + i, y, z], [x + i + 0.03, y - 0.22, z], 0.035, base, 1);
      beam([x + i, y + d, z], [x + i - 0.03, y + d + 0.22, z], 0.035, base, 1);
    }
    grain(Math.round(w * d * 7), lt, 23, 1, R => [x + R() * w, y + R() * d, z]);
    grain(Math.round(w * d * 4), M.wood, 24, 1, R => [x + R() * w, y + R() * d, z]);
  };
})(QH);
