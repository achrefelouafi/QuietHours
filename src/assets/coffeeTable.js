/* ═══════════════════════════════════════════════════════════════
   assets/coffeeTable.js — low table on four legs, a journal and a
   mug on it.

   coffeeTable(x, y, o)
     footprint x..x+w (2.5) by y..y+d (1.3). o.bare leaves it empty;
     o.t (seconds) steams the mug.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, grain } = QH.draw;
  const light = QH.light, A = QH.assets;

  const H = 0.9;
  const coffeeTable = (x, y, o = {}) => {
    const w = o.w || 2.5, d = o.d || 1.3;
    for (const [lx, ly] of [[x + 0.08, y + 0.08], [x + w - 0.2, y + 0.08], [x + 0.08, y + d - 0.2], [x + w - 0.2, y + d - 0.2]])
      box(lx, ly, 0, 0.12, 0.12, H - 0.1, M.navyDk, { edge: false });
    const top = light.warm(M.wood, M.rustLt), edge = light.warm(M.woodDk, M.rust);
    box(x, y, H - 0.1, w, d, 0.1, edge, { colTop: top, rim: light.warm(M.rustLt, M.orange) });
    grain(Math.round(w * d * 5), light.warm(M.woodLt, M.orangeDk), 37, 1, R => [x + R() * w, y + R() * d, H + 0.01]);
    if (o.bare) return;
    A.journal(x + 0.55, y + 0.3, H, { w: 0.85, d: 0.6, col: M.navyDk });
    A.mug(x + w - 0.5, y + d - 0.45, H, { col: M.navyDk, t: o.t });
  };
  coffeeTable.H = H;
  QH.assets.coffeeTable = coffeeTable;
})(QH);
