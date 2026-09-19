/* ═══════════════════════════════════════════════════════════════
   assets/speaker.js — box speaker with two orange-ringed cones.
   One file, every size: the tall floor speaker, the one on the
   console, the little ones on the desk and the wall shelf.

   speaker(x, y, z, o)
     footprint x..x+w by y..y+d, standing on z, h tall.
     Cones face o.face ('+y' default | '+x').
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, discY, discX, rgb } = QH.draw;
  const light = QH.light;

  QH.assets.speaker = (x, y, z, o = {}) => {
    const w = o.w || 0.85, d = o.d || 0.8, h = o.h || 2.9, face = o.face || '+y';
    box(x, y, z, w, d, h, M.navy, { colTop: M.navyLt });
    const ring = light.warm(M.orangeDk, M.orange), R1 = Math.min(w, d) * 0.34, R2 = R1 * 0.55;
    if (face === '+y') {
      const cx = x + w / 2, py = y + d + 0.01;
      discY(cx, py, z + h * 0.3, R1, rgb(ring), 12);  discY(cx, py + 0.005, z + h * 0.3, R1 * 0.5, rgb(M.ink), 10); discY(cx, py + 0.01, z + h * 0.3, R1 * 0.15, rgb(ring), 6);
      discY(cx, py, z + h * 0.72, R2, rgb(ring), 10); discY(cx, py + 0.005, z + h * 0.72, R2 * 0.5, rgb(M.ink), 8);
    } else {
      const cy = y + d / 2, px = x + w + 0.01;
      discX(px, cy, z + h * 0.3, R1, rgb(ring), 12);  discX(px + 0.005, cy, z + h * 0.3, R1 * 0.5, rgb(M.ink), 10); discX(px + 0.01, cy, z + h * 0.3, R1 * 0.15, rgb(ring), 6);
      discX(px, cy, z + h * 0.72, R2, rgb(ring), 10); discX(px + 0.005, cy, z + h * 0.72, R2 * 0.5, rgb(M.ink), 8);
    }
  };
})(QH);
