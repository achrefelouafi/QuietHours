/* ═══════════════════════════════════════════════════════════════
   assets/hifiConsole.js — low console against the back wall: two
   cubbies full of records, a turntable on top. The speakers go
   beside and on it from the scene (speaker.js).

   hifiConsole(x, y, o)
     footprint x..x+w (3.0) by y..y+d (1.5); the open side faces +y.
     o.play, o.spin and o.t go to the turntable (props.js): how far
     the record's play is up, how far it has turned, the time.
   Returns the turntable's screen quad for the click — null if bare.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, poly, clip, unclip, rgb } = QH.draw;
  const A = QH.assets;

  const H = 1.6;
  const hifiConsole = (x, y, o = {}) => {
    const w = o.w || 3.0, d = o.d || 1.5;
    for (const [lx, ly] of [[x + 0.1, y + d - 0.2], [x + w - 0.2, y + d - 0.2], [x + w - 0.2, y + 0.1]]) box(lx, ly, 0, 0.12, 0.12, 0.15, M.ink, { edge: false });
    box(x, y, 0.15, w, d, H - 0.15, M.navy, { colTop: M.navyLt });

    // two cubbies cut into the front, records in each — painted only
    // through the opening, so the frame round it stays over them
    const cw = (w - 0.45) / 2, yf = y + d + 0.01;
    for (let i = 0; i < 2; i++) {
      const cx = x + 0.15 + i * (cw + 0.15);
      const hole = [[cx, yf, 0.3], [cx + cw, yf, 0.3], [cx + cw, yf, H - 0.25], [cx, yf, H - 0.25]];
      poly(hole, rgb(M.ink));
      clip(hole);
      A.bookRow(cx + 0.08, y + d - 0.5, 0.3, cw - 0.12, { along: 'x', depth: 0.45, seed: 71 + i, hMin: 0.68, hMax: 0.8, topK: 0.5,
                                                          cols: [M.orange, M.cream, M.slate, M.orangeDk, M.tan, M.navyLt, M.greyLt] });
      unclip();
    }
    return o.bare ? null : A.turntable(x + 0.15, y + 0.2, H, { w: 1.3, d: 1.05, play: o.play, spin: o.spin, t: o.t });
  };
  hifiConsole.H = H;
  QH.assets.hifiConsole = hifiConsole;
})(QH);
