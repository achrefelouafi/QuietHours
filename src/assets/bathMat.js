/* ═══════════════════════════════════════════════════════════════
   assets/bathMat.js — the bath mat: a rust weave in a fine grid,
   a coarser dark grid over it where the weave is bound, a dark
   bound edge, a few dark flecks in the pile.

   bathMat(x, y, w, d)
     footprint x..x+w by y..y+d, flat on the floor.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { poly, stroke, rgb, grain } = QH.draw;
  const light = QH.light;

  QH.assets.bathMat = (x, y, w, d) => {
    const z = 0.03;
    const base = light.warm(M.rustLt, M.orange), weave = light.warm(M.rust, M.rustLt);
    poly([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], rgb(base));
    for (let i = 0.22; i < w; i += 0.22) stroke([[x + i, y, z], [x + i, y + d, z]], rgb(weave));
    for (let j = 0.22; j < d; j += 0.22) stroke([[x, y + j, z], [x + w, y + j, z]], rgb(weave));
    // the binding: a coarser grid in the dark ink, cells about half a unit, whole ones the short way
    const cell = Math.min(w, d) / Math.round(Math.min(w, d) / 0.5);
    for (let i = cell; i < w - 0.05; i += cell) stroke([[x + i, y, z], [x + i, y + d, z]], rgb(M.rustDk));
    for (let j = cell; j < d - 0.05; j += cell) stroke([[x, y + j, z], [x + w, y + j, z]], rgb(M.rustDk));
    stroke([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], rgb(M.rustDk), 1, true);
    stroke([[x + 0.1, y + 0.1, z], [x + w - 0.1, y + 0.1, z], [x + w - 0.1, y + d - 0.1, z], [x + 0.1, y + d - 0.1, z]], rgb(weave), 1, true);
    grain(Math.round(w * d * 5), M.rustDk, 28, 1, R => [x + R() * w, y + R() * d, z]);
  };
})(QH);
