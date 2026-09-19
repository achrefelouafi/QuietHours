/* ═══════════════════════════════════════════════════════════════
   assets/monitor.js — monitor on a stand, code being typed on the
   screen: each line grows behind a cursor, and when a new one
   starts the page scrolls up a row to make room.

   monitor(x, y, z, t, o)
     panel from x to x+w (2.0), back edge at y, screen facing +y,
     stand on a surface at z. t is seconds; the typing is a fixed
     cycle of it, so the screen is the same for the same t.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectY, rgb, clip, unclip } = QH.draw;
  const { rnd } = QH;

  /* ── the file being written ──────────────────────────────────
     A cycle of lines, each with its indent, its tokens, how fast
     it gets typed and the pause after it. Made once, from a seed,
     so the screen never jumps between frames. The indent walks
     in and out a step at a time, the way nested code does. */
  const ROWS = 9, PITCH = 0.13, CH = 0.045;                   // rows on the screen, row pitch, one character
  const N = 48, lines = [];
  let period = 0;
  {
    const R = rnd(13);
    let indent = 0;
    for (let i = 0; i < N; i++) {
      const blank = R() < 0.1;
      const chars = blank ? 0 : 4 + (R() * 20 | 0);
      if (!blank) indent = Math.max(0, Math.min(3, indent + (R() < 0.3 ? 1 : R() < 0.35 ? -1 : 0)));
      const rate = 9 + R() * 7;                               // characters a second
      const pause = 0.15 + R() * 0.5 + (R() < 0.12 ? 1.5 + R() * 2 : 0);   // and now and then a think
      // the tokens: a few words with a space between — pale grey, brighter for a keyword, amber for a string, the odd dim one
      const words = [];
      for (let c = 0; c < chars;) {
        const len = Math.min(chars - c, 2 + (R() * 7 | 0));
        const r = R(), col = r < 0.18 ? M.amber : r < 0.38 ? M.silver : r < 0.48 ? M.sky : M.greyLt;
        words.push({ c0: c, c1: c + len, col });
        c += len + 1;
      }
      lines.push({ at: period, chars, indent, rate, words });
      period += chars / rate + pause;
    }
  }
  const smooth = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);

  QH.assets.monitor = (x, y, z, t = 0, o = {}) => {
    const w = o.w || 2.0, h = o.h || 1.45, lift = 0.5;
    // base straddles the panel's back edge; the neck sits under the panel
    // (not in front of it) so its top disappears into the panel's underside
    box(x + w / 2 - 0.35, y - 0.1, z, 0.7, 0.5, 0.06, M.navyDk, { colTop: M.navy });
    box(x + w / 2 - 0.08, y - 0.06, z + 0.06, 0.16, 0.12, lift - 0.06, M.navyDk, { edge: false });
    box(x, y, z + lift, w, 0.08, h, M.navyDk, { colTop: M.navy, left: 0.85 });

    const sy = y + 0.085, z0 = z + lift + 0.06, z1 = z + lift + h - 0.06;
    const x0 = x + 0.06, x1 = x + w - 0.06;
    rectY(sy, x0, z0, x1, z1, rgb(M.slate));

    // where we are in the file: the line under the cursor, how far into it
    const tt = ((t % period) + period) % period;
    let cur = 0;
    while (cur + 1 < N && lines[cur + 1].at <= tt) cur++;
    const el = tt - lines[cur].at;
    const typed = Math.min(lines[cur].chars, Math.floor(el * lines[cur].rate));
    const scroll = 1 - smooth(el / 0.12);                     // rows still to slide up since this line began

    const gx = x + 0.13, tx = x + 0.24;                       // the gutter, the left edge of the text
    const rowZ = r => z1 - 0.12 - (r + scroll) * PITCH;       // bottom edge of row r (0 at the top, ROWS-1 the cursor's)
    const t0 = sy + 0.01, t1 = sy + 0.02;

    clip([[x0, sy, z0], [x1, sy, z0], [x1, sy, z1], [x0, sy, z1]]);
    rectY(t0, x0, rowZ(ROWS - 1) - 0.04, x1 - 0.08, rowZ(ROWS - 1) + 0.09, rgb(M.navyLt));   // the line being written
    // from the row sliding out over the top down to the cursor's, which slides in from under the bottom edge
    for (let r = -1; r < ROWS; r++) {
      const i = cur - (ROWS - 1 - r), L = lines[((i % N) + N) % N], lz = rowZ(r);
      const done = r < ROWS - 1 ? L.chars : typed;            // the rows above are finished; the cursor's is as far as it's got
      rectY(t0, gx, lz, gx + 0.06, lz + 0.05, rgb(M.sky));    // the gutter: line numbers
      for (const wd of L.words) {
        const c1 = Math.min(wd.c1, done);
        if (c1 <= wd.c0) break;
        const wx = tx + (L.indent * 3 + wd.c0) * CH;
        rectY(t1, wx, lz, wx + (c1 - wd.c0) * CH, lz + 0.05, rgb(wd.col));
      }
    }
    // the cursor: solid while the line's being typed, blinking while it thinks
    const cx = tx + (lines[cur].indent * 3 + typed) * CH, cz = rowZ(ROWS - 1);
    if (typed < lines[cur].chars || Math.floor(t * 2.5) % 2 === 0) rectY(t1, cx, cz - 0.01, cx + 0.07, cz + 0.07, rgb(M.cream));
    // the scrollbar, its thumb creeping down as the file grows
    const next = cur + 1 < N ? lines[cur + 1].at : period;
    const sx = x1 - 0.06, sz = z1 - 0.08 - (z1 - z0 - 0.4) * ((cur + el / (next - lines[cur].at)) / N);
    rectY(t0, sx, z0 + 0.06, sx + 0.03, z1 - 0.06, rgb(M.navyLt));
    rectY(t1, sx, sz - 0.24, sx + 0.03, sz, rgb(M.sky));
    unclip();
  };
})(QH);
