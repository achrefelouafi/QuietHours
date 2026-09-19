/* ═══════════════════════════════════════════════════════════════
   assets/vineShelf.js — a short teak board on the wall with a
   pothos in a dark pot at one end, its strands hanging down over
   the front and off the end, and a candle in a jar at the other.

   vineShelf(wall, u, z, w, o)
     board from u to u+w along the wall, its underside at height
     z, o.depth (0.7) proud of the wall. The plant sits toward the
     u+w end (o.plantAt, 0..1, 0.78), the candle at the other.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W } = QH.draw;
  const light = QH.light, A = QH.assets;

  const T = 0.1;
  QH.assets.vineShelf = (wall, u, z, w, o = {}) => {
    const Wl = W[wall], dp = o.depth || 0.7;
    const wood = light.warm(M.rustLt, M.orange), woodDk = light.warm(M.rust, M.rustLt);
    for (const bu of [u + 0.2, u + w - 0.3]) Wl.box(bu, z - 0.3, 0.1, 0.3, dp * 0.55, M.navyDk, { edge: false });
    Wl.box(u, z, w, T, dp, woodDk, { colTop: wood, rim: light.warm(M.orange, M.amber) });

    const pa = o.plantAt ?? 0.78, pp = Wl.pt(u + w * pa, z + T, dp * 0.55);
    const cp = Wl.pt(u + w * (pa > 0.5 ? 0.2 : 0.8), z + T, dp * 0.5);
    A.candleJar(cp[0], cp[1], cp[2], { r: 0.17, h: 0.42 });
    // the strands fall away from the wall and toward the board's near end
    const dir = wall === 'L' ? [1, 0.6] : [0.6, 1];
    A.trailingPlant(pp[0], pp[1], pp[2], { kind: 'pothos', r: 0.27, drop: o.drop || 1.7, n: 8, dir, seed: 61 });
  };
  QH.assets.vineShelf.T = T;
})(QH);
