/* ═══════════════════════════════════════════════════════════════
   assets/ledScreen.js — the big LED wall across the far corner:
   a charcoal bezel, the panel, the sponsor's mark over their name
   in a pixel face.
   The mark is what the banners carry too, so it's here to borrow.

   The panel and what's on it are two calls, because the truss's
   beams fall on the glass between them:

   ledScreen.panel(wall, u, z, w, h)
     bezel and dark panel from (u, z) to (u+w, z+h) on the wall.
   ledScreen.art(wall, u, z, w, h, t, o)
     the mark and the name. o.text (YOUR SPONSOR) is the name;
     o.glow 0..1 lifts the mark.
   Returns the panel's screen quad, for the click (also kept in
   ledScreen.last).

   ledScreen.mark(at, size, col)
     the mark, `size` high, drawn through at(fx, fz) — a map from
     the mark's own box (0..1.13 across, 0..1 up from its foot) to
     a world point. That is how it lands on any plane.
   ledScreen.text(str, x, y, px, col, o)
     the name in a pixel face, in screen space: top-left (x, y),
     `px` screen pixels to the cell — any real number; each cell's
     edges snap to the pixel grid, so the face stays crisp at any
     size and the name keeps its size on the panel however far in
     or out the camera is. o.face is 5 (5 × 7, default) or 3
     (3 × 5); o.pitch is cells from one letter to the next (7, or
     4 for the small face), o.bold a third of a cell more on each
     stroke. ledScreen.width(str, px, o) is how wide it comes
     out. Only when the cell would be under a pixel does the name
     step down to the small face, and right out there's no room
     for letters at all, so it becomes a row of word-long dashes —
     the way a line of print reads from across the room.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, poly, stroke, rgb, clip, unclip } = QH.draw;
  const { P, cam } = QH.cam;
  const { clamp } = QH;

  /* ── a 5 × 7 face, capitals and figures ── */
  const FONT = {
    A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
    C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
    D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
    E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
    G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
    H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
    J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
    K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
    L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
    M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
    N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
    O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
    R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
    T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
    W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
    X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
    Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
    Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
    0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
    1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
    2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
    3: ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
    4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
    5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
    6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
    7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
    8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
    9: ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
    '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
    '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
    '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
    '&': ['.##..', '#..#.', '#..#.', '.##..', '#.#.#', '#..#.', '.##.#'],
    "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'],
    ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  };
  /* ── and a 3 × 5 face for when the big one won't fit ── */
  const SMALL = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'],
    D: ['##.', '#.#', '#.#', '#.#', '##.'], E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
    G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'],
    J: ['..#', '..#', '..#', '#.#', '.#.'], K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
    M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
    P: ['##.', '#.#', '##.', '#..', '#..'], Q: ['.#.', '#.#', '#.#', '.#.', '..#'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
    S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'], U: ['#.#', '#.#', '#.#', '#.#', '###'],
    V: ['#.#', '#.#', '#.#', '#.#', '.#.'], W: ['#.#', '#.#', '###', '###', '#.#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
    Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
    0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['##.', '..#', '.#.', '#..', '###'],
    3: ['###', '..#', '.#.', '..#', '###'], 4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'],
    6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'], 8: ['###', '#.#', '###', '#.#', '###'],
    9: ['###', '#.#', '###', '..#', '##.'],
    '-': ['...', '...', '###', '...', '...'], '.': ['...', '...', '...', '...', '.#.'], '!': ['.#.', '.#.', '.#.', '...', '.#.'],
    '&': ['.#.', '#.#', '.#.', '#.#', '.##'], "'": ['.#.', '.#.', '...', '...', '...'], ' ': ['...', '...', '...', '...', '...'],
  };
  const FACES = { 5: { font: FONT, cols: 5, rows: 7, pitch: 7 }, 3: { font: SMALL, cols: 3, rows: 5, pitch: 4 } };
  const faceOf = o => FACES[o.face || 5];
  const glyph = (F, ch) => F.font[ch.toUpperCase()] || F.font[' '];
  const BOLD = 0.34;                                                                   // bold: this much of a cell more on each stroke
  const width = (str, px, o = {}) => { const F = faceOf(o); return ((str.length - 1) * (o.pitch || F.pitch) + F.cols + (o.bold ? BOLD : 0)) * px; };

  /** The name, top-left at screen (x, y), `px` screen pixels to the cell — fractional is fine. Runs, not cells, each
      snapped to the pixel grid at both ends so it stays crisp; bold, each run a third of a cell wider than the face,
      for the weight the reference has — unless the cell is under two pixels, where the extra would close the
      gaps between strokes. Never under a pixel: a run or a row that would round away keeps one. */
  function text(str, x, y, px, col, o = {}) {
    const g = QH.draw.g, F = faceOf(o), pitch = o.pitch || F.pitch, extra = o.bold && px >= 2 ? BOLD * px : 0;
    g.fillStyle = rgb(col);
    for (let i = 0; i < str.length; i++) {
      const G = glyph(F, str[i]), gx = x + i * pitch * px;
      for (let r = 0; r < F.rows; r++) {
        const row = G[r], y0 = Math.round(y + r * px), y1 = Math.max(y0 + 1, Math.round(y + (r + 1) * px));
        for (let c = 0; c < F.cols; c++) {
          if (row[c] !== '#') continue;
          let run = 1;
          while (c + run < F.cols && row[c + run] === '#') run++;
          const x0 = Math.round(gx + c * px), x1 = Math.max(x0 + 1, Math.round(gx + (c + run) * px + extra));
          g.fillRect(x0, y0, x1 - x0, y1 - y0);
          c += run - 1;
        }
      }
    }
  }

  /** The name as a row of dashes, one a word, `w` wide in all: what it comes to when the letters would be under a pixel. */
  function dashes(str, x, y, w, col) {
    const g = QH.draw.g, words = str.split(/\s+/).filter(Boolean), chars = str.length || 1;
    g.fillStyle = rgb(col);
    let at = x;
    for (const wd of words) {
      const ww = Math.max(2, Math.round(w * wd.length / chars));
      g.fillRect(Math.round(at), y, ww, 2);
      at += w * (wd.length + 1) / chars;
    }
  }

  /* ── the mark: two bars leaning right, and a third leg down off
        the second — a mountain, or an A with its bar out ── */
  const BARS = [
    [[0.00, 0], [0.17, 0], [0.70, 1], [0.53, 1]],
    [[0.30, 0], [0.47, 0], [1.00, 1], [0.83, 1]],
    [[0.955, 0], [1.125, 0], [0.795, 0.62], [0.625, 0.62]],
  ];
  function mark(at, size, col) {
    for (const b of BARS) poly(b.map(([fx, fz]) => at(fx * size, fz * size)), rgb(col));
  }

  const panel = (wall, u, z, w, h) => {
    const Wl = W[wall], B = 0.14;
    // the bezel: a charcoal slab, its top a little lighter
    Wl.rect(u - B, z - B, u + w + B, z + h + B, rgb(M.greyDk), 0.06);
    Wl.rect(u - B, z + h, u + w + B, z + h + B, rgb(M.grey), 0.07);
    stroke([Wl.pt(u - B, z - B, 0.07), Wl.pt(u + w + B, z - B, 0.07), Wl.pt(u + w + B, z + h + B, 0.07), Wl.pt(u - B, z + h + B, 0.07)], rgb(M.ink), 1, true);
    // the panel: dark, a shade bluer toward the middle where the mark will be
    const q = [Wl.pt(u, z, 0.08), Wl.pt(u + w, z, 0.08), Wl.pt(u + w, z + h, 0.08), Wl.pt(u, z + h, 0.08)];
    poly(q, rgb(M.wallB));
    const g = QH.draw.g, c = P(...Wl.pt(u + w / 2, z + h * 0.6, 0.09)), R = Math.max(w, h) * 0.55 * cam.s;
    clip(q);
    const grd = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], R);
    grd.addColorStop(0, 'rgba(26,56,122,0.55)');
    grd.addColorStop(0.6, 'rgba(26,56,122,0.18)');
    grd.addColorStop(1, 'rgba(26,56,122,0)');
    g.fillStyle = grd; g.fillRect(c[0] - R, c[1] - R, R * 2, R * 2);
    unclip();
    stroke(q, rgb(M.ink), 1, true);
  };

  const art = (wall, u, z, w, h, t = 0, o = {}) => {
    const Wl = W[wall], str = (o.text || 'YOUR SPONSOR').toUpperCase(), glow = o.glow ?? 1;
    const q = [Wl.pt(u, z, 0.1), Wl.pt(u + w, z, 0.1), Wl.pt(u + w, z + h, 0.1), Wl.pt(u, z + h, 0.1)].map(p => P(...p));
    const g = QH.draw.g;

    // the mark, a third of the panel high, over the middle; a soft cast of it behind, so the quantiser lifts the glass around it
    const ms = h * 0.36, mx = u + w / 2 - ms * 0.56, mz = z + h * 0.44;
    const at = (fx, fz) => Wl.pt(mx + fx, mz + fz, 0.11);
    if (glow > 0.02) {
      const c = P(...at(ms * 0.56, ms * 0.5)), R = ms * 1.1 * cam.s;
      clip(q);
      const grd = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], R);
      grd.addColorStop(0, 'rgba(88,154,255,' + 0.35 * glow + ')');
      grd.addColorStop(1, 'rgba(88,154,255,0)');
      g.fillStyle = grd; g.fillRect(c[0] - R, c[1] - R, R * 2, R * 2);
      unclip();
    }
    mark(at, ms, M.ice);

    // the name under it, spanning about two thirds of the panel: the big face, bold and wide-set, its cell a set
    // fraction of the panel's width so it holds its size on the screen at every zoom — the cell comes out however
    // many screen pixels that is, whole or not. Only when that's under a pixel and the letters would smear does it
    // step down to the small face (a bigger cell for the same span), and to dashes when even that won't go
    const room = w * cam.s, tl = P(...Wl.pt(u + w / 2, z + h * 0.2, 0.11)), pen = M.ice;
    const set = (o, k) => { const px = room * k / width(str, 1, o); return px >= 1 ? px : 0; };
    let px, f;
    if ((px = set(f = { bold: true }, 0.72)))                     text(str, tl[0] - width(str, px, f) / 2, tl[1] - 7 * px, px, pen, f);
    else if ((px = set(f = { face: 3 }, 0.7)))                    text(str, tl[0] - width(str, px, f) / 2, tl[1] - 5 * px - 1, px, pen, f);
    else dashes(str, Math.round(tl[0] - room * 0.33), Math.round(tl[1] - 2), room * 0.66, pen);

    return (ledScreen.last = { quad: q, centre: Wl.pt(u + w / 2, z + h * 0.55, 0.1) });
  };

  const ledScreen = { panel, art, mark, text, width, FONT, SMALL, last: null };
  QH.assets.ledScreen = ledScreen;
})(QH);
