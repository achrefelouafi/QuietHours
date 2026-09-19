/* ═══════════════════════════════════════════════════════════════
   assets/wallCabinet.js — small open cabinet hung on the wall, a
   radio sitting inside it.

   wallCabinet(wall, u, z, w, h, o)
     from u to u+w along the wall, z to z+h up it, o.depth (0.9)
     proud of the wall; open toward the room.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, rgb } = QH.draw;
  const A = QH.assets;

  QH.assets.wallCabinet = (wall, u, z, w, h, o = {}) => {
    const dp = o.depth || 0.9, Wl = W[wall];
    Wl.box(u, z, w, h, dp, M.navy, { colTop: M.navyLt });
    Wl.rect(u + 0.08, z + 0.08, u + w - 0.08, z + h - 0.08, rgb(M.ink), dp + 0.01);
    if (o.bare) return;
    if (wall === 'L') A.radio(0.12, u + 0.2, z + 0.08, { w: dp - 0.3, d: w - 0.4, h: h * 0.4, face: '+x', edge: false });
    else              A.radio(u + 0.2, 0.12, z + 0.08, { w: w - 0.4, d: dp - 0.3, h: h * 0.4, face: '+y', edge: false });
  };
})(QH);
