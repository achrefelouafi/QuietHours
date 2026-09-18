/* ═══════════════════════════════════════════════════════════════
   assets/bookshelf.js — open metal shelf unit: five boards on four
   posts, books, a radio, a crate, and a plant and a box on top.

   bookshelf(x, y, o)
     back at x, footprint x..x+depth (1.1) by y..y+w (2.7);
     the shelves open toward +x (it lives on the left wall).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box } = QH.draw;
  const light = QH.light, A = QH.assets;

  QH.assets.bookshelf = (x, y, o = {}) => {
    const w = o.w || 2.7, dp = o.depth || 1.1, H = o.h || 4.8, n = 4, post = 0.1;
    const rim = light.warm(M.rust, M.orangeDk);
    const boards = [];
    for (let i = 0; i <= n; i++) boards.push(0.12 + i * (H - 0.12) / n);

    box(x, y, 0, post, post, H, M.navyLt);                              // back posts
    box(x, y + w - post, 0, post, post, H, M.navyLt);

    boards.forEach((z, i) => {
      box(x, y, z, dp, w, 0.08, M.navy, { colTop: M.navyLt, rim });
      const zt = z + 0.08, row = (u, len, seed, hi) => A.bookRow(x + 0.2, y + u, zt, len, { along: 'y', depth: 0.7, seed, hMin: 0.65, hMax: hi || 0.95 });
      switch (i) {
        case 0: row(0.15, w - 0.3, 51); break;
        case 1: row(0.15, w - 1.35, 52); A.crate(x + 0.15, y + w - 1.05, zt, { w: 0.8, d: 0.9, h: 0.55 }); break;
        case 2: row(0.15, w - 0.3, 53, 0.85); break;
        case 3: A.radio(x + 0.1, y + 0.15, zt, { w: 0.85, d: 0.9, h: 0.45, face: '+x' }); row(1.2, w - 1.35, 54); break;
        case n: A.lidBox(x + 0.15, y + 0.25, zt, { w: 0.8, d: 1.0, h: 0.6 });
                A.pottedPlant(x + 0.55, y + w - 0.5, zt, { r: 0.22, size: 0.8, seed: 41 }); break;
      }
    });

    box(x + dp - post, y, 0, post, post, H, M.navyLt, { rim });         // front posts
    box(x + dp - post, y + w - post, 0, post, post, H, M.navyLt, { rim });
  };
})(QH);
