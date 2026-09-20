/* ═══════════════════════════════════════════════════════════════
   assets/props.js — the small things: what sits on desks, shelves
   and tables. Each takes the point it stands on (x, y) and the
   height z of the surface under it.

   mug (+ steam) · penCup · photoFrame · notepad · book · bookRow · smallBox
   crate · lidBox · vinyl · radio · laptop · journal · turntable
   openBook · bookStack · ball
   pottedPlant (+ spikes, leaves, vines)
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, cyl, disc, discX, discY, ring, beam, dot, rectX, rectY, poly, stroke, rgb, sh, px } = QH.draw;
  const { TAU, rnd, mix } = QH;
  const { P, cam } = QH.cam;
  const light = QH.light, sway = QH.sway;
  const A = QH.assets;

  /** Steam off something hot at (x, y, z): a few wisps of single
      pixels drifting up and fading out, each on its own loop so
      they never rise in step. `t` in seconds moves them; a fixed
      t is one still frame. o.rise is how high they get, o.r how
      wide the mouth they leave from. */
  A.steam = (x, y, z, t, o = {}) => {
    const g = QH.draw.g, rise = o.rise || 0.75, r = o.r || 0.1, R = rnd(o.seed || 5);
    const n = o.n || 3, size = px(0.055), was = g.globalAlpha;
    for (let i = 0; i < n; i++) {
      const loop = 2.6 + R() * 1.2, ph = R() * loop, sx = (R() - 0.5) * r * 1.4, sy = (R() - 0.5) * r * 1.4;
      const wob = 0.05 + R() * 0.04, wph = R() * TAU, u0 = ((t + ph) % loop) / loop;   // where this wisp is on its way up
      // the wisp is a short trail of dots behind its head, each older one fainter and further blown
      for (let k = 0; k < 7; k++) {
        const u = u0 - k * 0.06; if (u < 0) continue;
        const f = u < 0.1 ? u / 0.1 : 1 - (u - 0.1) / 0.9;                            // fades in fast, out slowly
        const sway = Math.sin(u * 5.5 + wph + t * 0.6) * wob * (0.3 + u);           // widens as it thins out
        g.globalAlpha = was * Math.min(1, f * 1.6) * (1 - k * 0.12) * 0.9;
        dot(x + sx + sway, y + sy - sway * 0.6, z + u * rise, size, k < 2 ? M.cream : k < 5 ? M.greyLt : M.grey);
      }
    }
    g.globalAlpha = was;
  };

  /** Mug, handle on the +x side. o.t (seconds) puts steam over it. */
  A.mug = (x, y, z, o = {}) => {
    const r = o.r || 0.14, h = o.h || 0.3, col = o.col || M.navy;
    cyl(x, y, z, r, h, col, { n: 10, colTop: M.ink, topK: 1 });
    beam([x + r, y, z + h * 0.35], [x + r + 0.1, y, z + h * 0.5], 0.05, col, 0.9);
    beam([x + r + 0.1, y, z + h * 0.5], [x + r, y, z + h * 0.8], 0.05, col, 0.9);
    dot(x - r * 0.3, y + r * 0.7, z + h * 0.5, 1, M.orangeDk);
    if (o.t !== undefined) A.steam(x, y, z + h, o.t, { r: r * 0.6, rise: 0.6 + r * 1.2, seed: (x * 31 + y * 7) | 0 });
  };

  /** Pen cup with a few pens leaning out. */
  A.penCup = (x, y, z) => {
    cyl(x, y, z, 0.13, 0.36, M.navy, { n: 10, colTop: M.ink, topK: 1 });
    beam([x - 0.04, y - 0.03, z + 0.34], [x - 0.08, y - 0.08, z + 0.70], 0.04, M.cream, 1);
    beam([x + 0.03, y + 0.02, z + 0.34], [x + 0.07, y + 0.06, z + 0.72], 0.04, M.orange, 1);
    beam([x + 0.02, y - 0.05, z + 0.34], [x + 0.05, y - 0.10, z + 0.66], 0.04, M.slate, 1);
    beam([x - 0.02, y + 0.05, z + 0.34], [x - 0.04, y + 0.10, z + 0.62], 0.035, M.greyLt, 1);
  };

  /** Standing photo frame, picture facing +y. */
  A.photoFrame = (x, y, z, o = {}) => {
    const w = o.w || 0.5, h = o.h || 0.62;
    beam([x + w * 0.5, y - 0.02, z + 0.02], [x + w * 0.5, y - 0.2, z + h * 0.5], 0.04, M.greyDk, 1);   // kickstand
    box(x, y, z, w, 0.06, h, M.grey, { top: 1, left: 0.8, right: 0.6 });
    rectY(y + 0.065, x + 0.05, z + 0.05, x + w - 0.05, z + h - 0.05, rgb(M.navyDk));
    poly([[x + 0.1, y + 0.07, z + 0.15], [x + w / 2, y + 0.07, z + h - 0.15], [x + w - 0.1, y + 0.07, z + 0.15]], rgb(M.orange));
    beam([x + w / 2 - 0.05, y + 0.07, z + h - 0.2], [x + w / 2 + 0.05, y + 0.07, z + h - 0.2], 0.04, M.cream, 1);
  };

  /** A pad of paper with a couple of lines on it. */
  A.notepad = (x, y, z, o = {}) => {
    const w = o.w || 0.55, d = o.d || 0.42;
    box(x, y, z, w, d, 0.04, M.cream, { top: 0.95, edge: false });
    beam([x + 0.08, y + 0.12, z + 0.05], [x + w - 0.12, y + 0.12, z + 0.05], 0.025, M.greyLt, 1);
    beam([x + 0.08, y + 0.24, z + 0.05], [x + w - 0.20, y + 0.24, z + 0.05], 0.025, M.greyLt, 1);
  };

  /** A book lying flat: cover on top, pages on the sides. */
  A.book = (x, y, z, w, d, col, o = {}) => {
    const h = o.h || 0.12;
    box(x, y, z, w, d, h, col, { colLeft: M.silver, left: 0.75, colRight: M.silver, right: 0.6, top: 1 });
  };

  /** Standing books packed along an axis. o.along = 'x' | 'y'; spines face the other way. */
  A.bookRow = (x, y, z, len, o = {}) => {
    const along = o.along || 'y', depth = o.depth || 0.7;
    const cols = o.cols || [M.orange, M.cream, M.slate, M.tan, M.rustLt, M.navyLt, M.orangeDk, M.greyLt];
    const hMin = o.hMin ?? 0.7, hMax = o.hMax ?? 1.0;
    const R = rnd(o.seed || 7);
    let u = 0;
    while (u < len - 0.08) {
      if (R() > 0.86) { u += 0.1 + R() * 0.15; continue; }                       // a gap
      const th = 0.14 + R() * 0.1, hh = hMin + R() * (hMax - hMin);
      if (u + th > len) break;
      const c = cols[(R() * cols.length) | 0];
      const opts = { colTop: mix(c, M.cream, 0.4), top: o.topK ?? 0.9, left: 0.85, right: 0.7, edge: false };
      if (along === 'y') box(x, y + u, z, depth, th, hh, c, opts);
      else               box(x + u, y, z, th, depth, hh, c, opts);
      u += th + 0.04;
    }
  };

  /** A small closed box, optionally with a label on its +y face. */
  A.smallBox = (x, y, z, w, d, h, col, o = {}) => {
    box(x, y, z, w, d, h, col, { colTop: o.colTop || mix(col, M.navyLt, 0.4), rim: o.rim });
    if (o.label !== false) rectY(y + d + 0.01, x + w * 0.3, z + h * 0.35, x + w * 0.7, z + h * 0.6, rgb(o.labelCol || M.greyLt));
  };

  /** Orange crate with a dark strap across it. */
  A.crate = (x, y, z, o = {}) => {
    const w = o.w || 0.8, d = o.d || 0.8, h = o.h || 0.6;
    const c = light.warm(M.rustLt, M.orange), s = M.navyDk;
    box(x, y, z, w, d, h, c, { colTop: light.warm(M.orangeDk, M.orangeLt), rim: light.warm(M.orange, M.amber) });
    // strap over the top and down the two visible faces
    poly([[x, y + d * 0.42, z + h + 0.01], [x + w, y + d * 0.42, z + h + 0.01], [x + w, y + d * 0.58, z + h + 0.01], [x, y + d * 0.58, z + h + 0.01]], rgb(s));
    poly([[x + w + 0.01, y + d * 0.42, z], [x + w + 0.01, y + d * 0.58, z], [x + w + 0.01, y + d * 0.58, z + h], [x + w + 0.01, y + d * 0.42, z + h]], sh(s, 0.8));
    poly([[x + w * 0.42, y, z + h + 0.01], [x + w * 0.58, y, z + h + 0.01], [x + w * 0.58, y + d, z + h + 0.01], [x + w * 0.42, y + d, z + h + 0.01]], rgb(s));
    poly([[x + w * 0.42, y + d + 0.01, z], [x + w * 0.58, y + d + 0.01, z], [x + w * 0.58, y + d + 0.01, z + h], [x + w * 0.42, y + d + 0.01, z + h]], sh(s, 0.9));
    beam([x, y + d + 0.01, z + h * 0.7], [x + w, y + d + 0.01, z + h * 0.7], 0.02, M.rustDk, 1);            // lid line
    beam([x + w + 0.01, y + d, z + h * 0.7], [x + w + 0.01, y, z + h * 0.7], 0.02, M.rustDk, 1);
  };

  /** Navy box with a lid — the one on top of the bookshelf. */
  A.lidBox = (x, y, z, o = {}) => {
    const w = o.w || 0.9, d = o.d || 1.0, h = o.h || 0.6;
    box(x, y, z, w, d, h - 0.12, M.navyDk);
    box(x - 0.04, y - 0.04, z + h - 0.12, w + 0.08, d + 0.08, 0.12, M.navy, { colTop: M.navyLt });
    rectX(x + w + 0.01, y + d * 0.35, z + 0.15, y + d * 0.65, z + h - 0.2, rgb(light.warm(M.rustLt, M.orangeDk)));
  };

  /** A record, lying flat. With o.spin (radians) two marks on the label show which way round it is — how you see it turn. */
  A.vinyl = (x, y, z, r, o = {}) => {
    disc(x, y, z, r, rgb(M.ink), 16);
    ring(x, y, z + 0.005, r * 0.7, rgb(M.navyDk), 16);
    disc(x, y, z + 0.01, r * 0.32, rgb(light.warm(M.rustLt, M.orange)), 10);
    disc(x, y, z + 0.015, r * 0.08, rgb(M.ink), 6);
    if (o.spin !== undefined) for (const a of [o.spin, o.spin + Math.PI]) {
      const c = Math.cos(a), s = Math.sin(a);
      beam([x + c * r * 0.14, y + s * r * 0.14, z + 0.02], [x + c * r * 0.28, y + s * r * 0.28, z + 0.02], 0.025, M.ink, 1);
    }
  };

  /** Small radio / receiver: a dial strip and a knob. Face toward o.face ('+y' | '+x'). */
  A.radio = (x, y, z, o = {}) => {
    const w = o.w || 0.9, d = o.d || 0.5, h = o.h || 0.42, col = o.col || M.navy;
    box(x, y, z, w, d, h, col, { colTop: o.colTop || mix(col, M.navyLt, 0.5), rim: o.rim });
    if ((o.face || '+y') === '+y') {
      rectY(y + d + 0.01, x + 0.1, z + h * 0.45, x + w - 0.1, z + h * 0.72, rgb(M.ink));
      for (let i = 0; i < 4; i++) dot(x + 0.16 + i * 0.16, y + d + 0.02, z + h * 0.6, 1, i === 1 ? M.amber : M.orange);
      discY(x + w - 0.2, y + d + 0.02, z + h * 0.25, 0.05, rgb(M.greyLt), 8);
    } else {
      rectX(x + w + 0.01, y + 0.08, z + h * 0.45, y + d - 0.08, z + h * 0.72, rgb(M.ink));
      for (let i = 0; i < 3; i++) dot(x + w + 0.02, y + 0.14 + i * 0.12, z + h * 0.6, 1, i === 1 ? M.amber : M.orange);
      discX(x + w + 0.02, y + d - 0.12, z + h * 0.25, 0.05, rgb(M.greyLt), 8);
    }
  };

  /** Laptop: closed by default, or open with a prompt on the screen. Screen faces +y. */
  A.laptop = (x, y, z, o = {}) => {
    const w = o.w || 1.0, d = o.d || 0.75;
    box(x, y, z, w, d, 0.08, M.navyDk, { colTop: M.navy, top: 1 });
    if (!o.open) { dot(x + w / 2, y + d / 2, z + 0.09, 1, M.slate); return; }
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) dot(x + 0.15 + i * 0.12, y + 0.12 + j * 0.13, z + 0.09, 1, M.slate);
    const lean = 0.25, top = z + 0.08 + 0.7;
    poly([[x, y, z + 0.08], [x + w, y, z + 0.08], [x + w, y - lean, top], [x, y - lean, top]], sh(M.navyDk, 0.9));
    poly([[x + 0.05, y - 0.01, z + 0.13], [x + w - 0.05, y - 0.01, z + 0.13], [x + w - 0.05, y - lean + 0.02, top - 0.06], [x + 0.05, y - lean + 0.02, top - 0.06]], rgb(M.navyDk));
    beam([x + 0.15, y - 0.08, z + 0.5], [x + 0.25, y - 0.08, z + 0.42], 0.035, M.orange, 1);        // >_
    beam([x + 0.25, y - 0.08, z + 0.42], [x + 0.15, y - 0.08, z + 0.34], 0.035, M.orange, 1);
    beam([x + 0.30, y - 0.08, z + 0.32], [x + 0.40, y - 0.08, z + 0.32], 0.035, M.orange, 1);
  };

  /** Journal with an orange strap. */
  A.journal = (x, y, z, o = {}) => {
    const w = o.w || 0.7, d = o.d || 0.5, h = 0.14, s = light.warm(M.rustLt, M.orangeDk);
    A.book(x, y, z, w, d, o.col || M.navy, { h });
    poly([[x + w * 0.62, y, z + h + 0.01], [x + w * 0.72, y, z + h + 0.01], [x + w * 0.72, y + d, z + h + 0.01], [x + w * 0.62, y + d, z + h + 0.01]], rgb(s));
    poly([[x + w * 0.62, y + d + 0.01, z], [x + w * 0.72, y + d + 0.01, z], [x + w * 0.72, y + d + 0.01, z + h], [x + w * 0.62, y + d + 0.01, z + h]], sh(s, 0.8));
  };

  /** Turntable: plinth, platter with a record on it, tone arm. The
      record has turned o.spin radians; while o.play (0..1) is up, white
      rings ripple out from it — the sound coming off the platter —
      o.t (seconds) moving them along. Returns the plinth top's screen
      quad for the click. */
  A.turntable = (x, y, z, o = {}) => {
    const w = o.w || 1.3, d = o.d || 1.0, h = 0.14, play = o.play || 0, spin = o.spin || 0;
    box(x, y, z, w, d, h, M.navyDk, { colTop: M.navy, rim: o.rim });
    const cx = x + w * 0.42, cy = y + d * 0.5, r = Math.min(w, d) * 0.36;
    A.vinyl(cx, cy, z + h + 0.01, r, { spin });
    if (play > 0) A.turntable.ripples(cx, cy, z + h + 0.02, r, o.t || 0, spin, play);
    cyl(x + w - 0.2, y + 0.2, z + h, 0.06, 0.12, M.grey, { n: 8, edge: false });
    beam([x + w - 0.2, y + 0.2, z + h + 0.14], [x + w * 0.55, y + d * 0.45, z + h + 0.1], 0.035, M.greyLt, 1);
    return { quad: [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]].map(p => P(...p)) };
  };
  /** The sound off a playing record: three dashed white rings, each
      widening out from the record's rim and fading as it goes, one
      after another round a loop, the dashes turning with the record.
      `k` (0..1) is how strong they are — the play easing in and out. */
  A.turntable.ripples = (cx, cy, z, r, t, spin, k) => {
    const g = QH.draw.g, was = g.globalAlpha, N = 3, LOOP = 1.6, DASH = 8, col = rgb(M.ice);
    for (let i = 0; i < N; i++) {
      const u = (t / LOOP + i / N) % 1;                                    // how far out this ring is: 0 at the rim, 1 gone
      const rr = r * (1.12 + u * 0.95);
      g.globalAlpha = was * k * Math.min(1, u / 0.12) * (1 - u) ** 1.2;   // in fast at the rim, out slowly as it widens
      for (let j = 0; j < DASH; j++) {                                     // dashes with gaps between, all turning with the record
        const a0 = spin + j / DASH * TAU, a1 = a0 + TAU / DASH * 0.55, pts = [];
        for (let s = 0; s <= 3; s++) { const a = a0 + (a1 - a0) * s / 3; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a), z]); }
        stroke(pts, col, 1);
      }
    }
    g.globalAlpha = was;
  };

  /* ── plants ──────────────────────────────────────────────────── */

  /** A fan of stiff blades — the snake-plant look, small. */
  A.spikes = (x, y, z, size, n, seed) => {
    const R = rnd(seed), blades = [], S = sway.plant('spikes', x, y, z, size);
    for (let i = 0; i < n; i++) blades.push({ i, a: R() * TAU, l: size * (0.55 + R() * 0.5), o: 0.03 + R() * 0.05, w: 0.05 + R() * 0.03, lt: R() > 0.6 });
    blades.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));
    for (const b of blades) {
      const ux = Math.cos(b.a), uy = Math.sin(b.a), c = b.lt ? M.leafLt : M.leaf;
      const m = S.at(b.i, [x + ux * b.l * 0.3, y + uy * b.l * 0.3, z + b.l * 0.65], 0.65);
      beam([x + ux * b.o, y + uy * b.o, z], m, b.w, c, 1);
      beam(m, S.at(b.i, [x + ux * b.l * 0.42, y + uy * b.l * 0.42, z + b.l], 1), b.w * 0.6, c, 1);
    }
  };

  /** Rounder leaves on short stems — the pothos look. */
  A.leaves = (x, y, z, size, n, seed) => {
    const R = rnd(seed), ls = [], S = sway.plant('leaves', x, y, z, size);
    for (let i = 0; i < n; i++) ls.push({ i, a: R() * TAU, l: size * (0.5 + R() * 0.5), lt: R() > 0.5 });
    ls.sort((p, q) => (Math.cos(p.a) + Math.sin(p.a)) - (Math.cos(q.a) + Math.sin(q.a)));
    for (const L of ls) {
      const ux = Math.cos(L.a), uy = Math.sin(L.a), c = L.lt ? M.leafLt : M.leaf;
      beam([x, y, z], S.at(L.i, [x + ux * L.l * 0.6, y + uy * L.l * 0.6, z + L.l * 0.45], 0.8), 0.04, M.leafDk, 1);
      beam(S.at(L.i, [x + ux * L.l * 0.55, y + uy * L.l * 0.55, z + L.l * 0.42], 0.8), S.at(L.i, [x + ux * L.l * 0.75, y + uy * L.l * 0.75, z + L.l * 0.5], 1), 0.14, c, 1);
    }
  };

  /** Trailing vines hanging down from a point, leaves along them. */
  A.vines = (x, y, z, drop, n, seed) => {
    const R = rnd(seed), S = sway.plant('vines', x, y, z, drop, -0.5);   // hanging, so its middle is below the anchor
    for (let i = 0; i < n; i++) {
      const sx = x + (R() - 0.5) * 0.5, sy = y + R() * 0.2, len = drop * (0.5 + R() * 0.5);
      const ex = sx + (R() - 0.5) * 0.25, fl = len / drop;              // a short vine swings less than a long one
      // the stem in a few pieces, so it can curve as it swings, with a leaf at each joint
      const k = 2 + ((len / 0.35) | 0), K = k + 1, pts = [[sx, sy, z]];
      for (let j = 1; j <= K; j++) { const f = j / K; pts.push(S.at(i, [sx + (ex - sx) * f, sy + 0.05 * f, z - len * f], f * fl)); }
      for (let j = 1; j <= K; j++) beam(pts[j - 1], pts[j], 0.035, M.leafDk, 1);
      for (let j = 1; j <= k; j++) {
        const p = pts[j], ly = p[1] + 0.05 * (1 - j / K);               // the leaves hang just off the stem
        beam([p[0] - 0.06, ly, p[2]], [p[0] + 0.07, ly, p[2] - 0.08], 0.1, j % 2 ? M.leaf : M.leafLt, 1);
      }
    }
  };

  /** A book lying open: two pages, a spine, a few lines of print. */
  A.openBook = (x, y, z, o = {}) => {
    const w = o.w || 0.9, d = o.d || 0.62, h = 0.07;
    box(x, y, z, w, d, h, M.silver, { colTop: M.cream, top: 0.98, left: 0.8, right: 0.65, edgeCol: M.grey });
    stroke([[x + w / 2, y, z + h + 0.01], [x + w / 2, y + d, z + h + 0.01]], rgb(M.greyLt));
    for (const px of [x + 0.1, x + w / 2 + 0.1]) for (let i = 0; i < 3; i++) {
      beam([px, y + 0.14 + i * 0.15, z + h + 0.01], [px + w / 2 - 0.2, y + 0.14 + i * 0.15, z + h + 0.01], 0.02, M.greyLt, 1);
    }
  };

  /** A few books stacked flat, each a little offset. */
  A.bookStack = (x, y, z, o = {}) => {
    const cols = o.cols || [M.navy, light.warm(M.rustLt, M.orange), M.slate], R = rnd(o.seed || 17);
    let zz = z;
    for (let i = 0; i < cols.length; i++) {
      const w = (o.w || 0.7) - i * 0.05, d = (o.d || 0.5) - i * 0.03, h = 0.1 + R() * 0.05;
      A.book(x + (R() - 0.5) * 0.08, y + (R() - 0.5) * 0.08, zz, w, d, cols[i], { h });
      zz += h;
    }
  };

  /** A ball resting on a surface. A sphere is a circle on screen from any
      angle, so it is drawn there: dark underneath, lit up toward the light,
      a contour, and a soft shadow on whatever it sits on. */
  A.ball = (x, y, z, r, col = M.greyDk) => {
    const g = QH.draw.g, p = P(x, y, z + r), R = Math.max(2, Math.round(r * cam.s));
    // the contact shadow: a thin sliver under the ball, drifting a little to the side away from the light
    g.beginPath(); g.ellipse(p[0] + R * 0.12, p[1] + R * 0.92, R * 0.95, R * 0.26, 0, 0, TAU); g.fillStyle = 'rgba(8,16,26,0.5)'; g.fill();
    const round = (dx, dy, k, c) => { g.beginPath(); g.arc(p[0] + dx * R, p[1] + dy * R, R * k, 0, TAU); g.fillStyle = rgb(c); g.fill(); };
    round(0, 0, 1, mix(col, M.ink, 0.45));
    round(-0.14, -0.16, 0.8, col);
    round(-0.32, -0.36, 0.42, mix(col, M.cream, 0.4));
    g.beginPath(); g.arc(p[0], p[1], R, 0, TAU); g.strokeStyle = rgb(M.ink); g.lineWidth = 1; g.stroke();
  };

  /** Small potted plant. o.kind = 'spiky' (default) | 'leafy'; o.pot recolours the pot. */
  A.pottedPlant = (x, y, z, o = {}) => {
    const r = o.r || 0.2, ph = o.ph || 0.3, size = o.size || 0.7, seed = o.seed || 11;
    cyl(x, y, z, r * 0.85, ph, o.pot || M.navyLt, { n: 10, rt: r, colTop: M.woodDk, topK: 1 });
    ring(x, y, z + ph + 0.005, r, rgb(o.rim || light.warm(M.rust, M.orangeDk)), 10);
    if ((o.kind || 'spiky') === 'spiky') A.spikes(x, y, z + ph - 0.03, size, o.n || 8, seed);
    else A.leaves(x, y, z + ph - 0.03, size, o.n || 7, seed);
  };
})(QH);
