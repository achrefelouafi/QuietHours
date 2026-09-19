/* ═══════════════════════════════════════════════════════════════
   assets/rug.js — woven rug: dark cells in a lighter grid, a
   border, a few dark flecks. Goes warm when the lamp is on.

   rug(x, y, w, d, o)
     o.weave = true for the plain one: no cells, a diagonal weave
     and a double border instead.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { poly, stroke, rgb, grain } = QH.draw;
  const light = QH.light;

  QH.assets.rug = (x, y, w, d, o = {}) => {
    const z = 0.02;
    if (o.weave) {
      // the plain one: a redder ground, herringbone rows of ticks leaning one way then the other, two borders
      const g = light.warm(M.rustLt, M.orangeDk), tick = light.warm(M.rust, M.rustLt), bd = light.warm(M.rust, M.rustLt);
      poly([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], rgb(g));
      let row = 0;
      for (let j = 0.45; j < d - 0.45; j += 0.22, row++) {
        const lean = row & 1 ? 0.14 : -0.14;
        for (let i = 0.5; i < w - 0.5; i += 0.3) stroke([[x + i, y + j - 0.07, z], [x + i + lean, y + j + 0.07, z]], rgb(tick));
      }
      stroke([[x + 0.1, y + 0.1, z], [x + w - 0.1, y + 0.1, z], [x + w - 0.1, y + d - 0.1, z], [x + 0.1, y + d - 0.1, z]], rgb(bd), 1, true);
      stroke([[x + 0.32, y + 0.32, z], [x + w - 0.32, y + 0.32, z], [x + w - 0.32, y + d - 0.32, z], [x + 0.32, y + d - 0.32, z]], rgb(light.warm(M.orangeDk, M.orange)), 1, true);
      grain(Math.round(w * d * 6), light.warm(M.orangeDk, M.orange), 5, 1, R => [x + R() * w, y + R() * d, z]);
      grain(Math.round(w * d * 5), M.rustDk, 6, 1, R => [x + R() * w, y + R() * d, z]);
      return;
    }

    const base = light.warm(M.rustDk, M.rust), cell = light.warm(M.woodDk, M.rustDk);
    const line = light.warm(M.rust, M.rustLt), edge = light.warm(M.rustLt, M.orangeDk);
    poly([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], rgb(base));

    const nx = o.nx || Math.round(w / 1.2), ny = o.ny || Math.round(d / 1.2);
    const cw = (w - 0.5) / nx, cd = (d - 0.5) / ny;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      if (!((i + j) & 1)) continue;
      const cx = x + 0.25 + i * cw, cy = y + 0.25 + j * cd;
      poly([[cx + 0.06, cy + 0.06, z], [cx + cw - 0.06, cy + 0.06, z], [cx + cw - 0.06, cy + cd - 0.06, z], [cx + 0.06, cy + cd - 0.06, z]], rgb(cell));
    }
    for (let i = 0; i <= nx; i++) stroke([[x + 0.25 + i * cw, y + 0.25, z], [x + 0.25 + i * cw, y + d - 0.25, z]], rgb(line));
    for (let j = 0; j <= ny; j++) stroke([[x + 0.25, y + 0.25 + j * cd, z], [x + w - 0.25, y + 0.25 + j * cd, z]], rgb(line));
    stroke([[x + 0.1, y + 0.1, z], [x + w - 0.1, y + 0.1, z], [x + w - 0.1, y + d - 0.1, z], [x + 0.1, y + d - 0.1, z]], rgb(edge), 1, true);
    grain(Math.round(w * d * 5), M.woodDk, 6, 1, R => [x + R() * w, y + R() * d, z]);
  };
})(QH);
