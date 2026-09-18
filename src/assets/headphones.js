/* ═══════════════════════════════════════════════════════════════
   assets/headphones.js — headphones hung on a stand.

   headphones(x, y, z, o)
     stand base at (x, y) on a surface at z. o.size (0.55) is the
     half-width of the band.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cyl, beam, discY, rgb, box } = QH.draw;
  const light = QH.light;

  QH.assets.headphones = (x, y, z, o = {}) => {
    const s = o.size || 0.55, ring = light.warm(M.orangeDk, M.orange);
    cyl(x, y, z, s * 0.4, 0.05, M.navyDk, { n: 10 });
    beam([x, y, z + 0.05], [x, y, z + s * 1.6], 0.05, M.navyLt, 1);

    const cz = z + s * 1.05, pts = [];                                       // the band, an arc
    for (let i = 0; i <= 8; i++) { const a = Math.PI * i / 8; pts.push([x + Math.cos(a) * s * 0.5, y, cz + Math.sin(a) * s * 0.55]); }
    for (let i = 0; i < 8; i++) beam(pts[i], pts[i + 1], 0.07, M.navy, 1);

    for (const dx of [-0.5, 0.5]) {                                          // the cups
      box(x + dx * s - s * 0.13, y - 0.1, cz - s * 0.2, s * 0.26, 0.2, s * 0.4, M.navyDk, { colTop: M.navy, edge: false });
      discY(x + dx * s, y + 0.11, cz, s * 0.12, rgb(ring), 8);
      discY(x + dx * s, y + 0.115, cz, s * 0.06, rgb(M.ink), 6);
    }
  };
})(QH);
