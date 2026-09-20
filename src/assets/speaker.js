/* ═══════════════════════════════════════════════════════════════
   assets/speaker.js — box speaker with two orange-ringed cones.
   One file, every size: the tall floor speaker, the one on the
   console, the little ones on the desk and the wall shelf.

   speaker(x, y, z, o)
     footprint x..x+w by y..y+d, standing on z, h tall.
     Cones face o.face ('+y' default | '+x'). While o.beat (0..1)
     is up the cones bounce — the big one kicks on the beat, the
     small one twice as often and less — o.t (seconds) keeping time.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, discY, discX, rgb } = QH.draw;
  const light = QH.light;

  const BEAT = 1.5;                                                       // beats a second — ninety a minute, about the record's pace
  /** How far out a cone is on its beat: all the way as it lands, back to rest before the next. */
  const kick = (t, hz) => Math.exp(-((t * hz) % 1) * 5);

  QH.assets.speaker = (x, y, z, o = {}) => {
    const w = o.w || 0.85, d = o.d || 0.8, h = o.h || 2.9, face = o.face || '+y', beat = o.beat || 0, t = o.t || 0;
    box(x, y, z, w, d, h, M.navy, { colTop: M.navyLt });
    const ring = light.warm(M.orangeDk, M.orange), R0 = Math.min(w, d) * 0.34;
    const R1 = R0 * (1 + 0.18 * beat * kick(t, BEAT)), R2 = R0 * 0.55 * (1 + 0.12 * beat * kick(t, BEAT * 2));
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
