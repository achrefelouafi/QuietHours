/* ═══════════════════════════════════════════════════════════════
   assets/dresser.js — low dark dresser: six drawers in two rows,
   each with a short orange handle, on four stub legs.

   dresser(x, y, o)
     footprint x..x+w (3.7) by y..y+d (1.4), o.h (2.3) tall.
     Drawers face +y. o.cols / o.rows change the grid.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectY, rgb, sh, beam } = QH.draw;

  QH.assets.dresser = (x, y, o = {}) => {
    const w = o.w || 3.7, d = o.d || 1.4, h = o.h || 2.3, cols = o.cols || 3, rows = o.rows || 2, L = 0.25;
    for (const [lx, ly] of [[x + 0.1, y + d - 0.25], [x + w - 0.25, y + d - 0.25], [x + w - 0.25, y + 0.1]]) box(lx, ly, 0, 0.15, 0.15, L, M.ink, { edge: false });
    box(x, y, L, w, d, h - L - 0.1, M.navy, { colTop: M.navyLt, colLeft: M.navy, colRight: M.navyDk });
    box(x - 0.04, y - 0.04, h - 0.1, w + 0.08, d + 0.08, 0.1, M.navy, { colTop: M.navyLt });

    // the drawers: a lighter front in a dark reveal, a handle low on each
    const fy = y + d, gap = 0.1, dw = (w - gap * (cols + 1)) / cols, dh = (h - L - 0.2 - gap * (rows + 1)) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const u0 = x + gap + c * (dw + gap), z0 = L + gap + r * (dh + gap);
      rectY(fy + 0.01, u0, z0, u0 + dw, z0 + dh, rgb(M.ink));
      rectY(fy + 0.02, u0 + 0.04, z0 + 0.04, u0 + dw - 0.04, z0 + dh - 0.04, sh(M.navy, 1.08));
      beam([u0 + dw * 0.32, fy + 0.03, z0 + dh * 0.5], [u0 + dw * 0.68, fy + 0.03, z0 + dh * 0.5], 0.05, M.orangeLt, 1);
    }
  };
})(QH);
