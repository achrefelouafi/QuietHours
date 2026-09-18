/* ═══════════════════════════════════════════════════════════════
   assets/rug.js — woven rug: dark cells in a lighter grid, a
   border, flecks. Goes warm when the lamp is on.

   rug(x, y, w, d, o)
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { poly, stroke, rgb, grain } = QH.draw;
  const light = QH.light;

  QH.assets.rug = (x, y, w, d, o = {}) => {
    const z = 0.02;
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
    grain(Math.round(w * d * 9), edge, 5, 1, R => [x + R() * w, y + R() * d, z]);
    grain(Math.round(w * d * 5), M.woodDk, 6, 1, R => [x + R() * w, y + R() * d, z]);
  };
})(QH);
