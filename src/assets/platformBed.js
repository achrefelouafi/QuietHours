/* ═══════════════════════════════════════════════════════════════
   assets/platformBed.js — the double bed from the reference: a
   deep wooden platform with a ledge showing round the mattress,
   a bookcase headboard down the wall side — a ledge over a
   set-back panel, an open shelf above it, a thick top board, a
   post at each end — a pale sheet at the head, two
   orange pillows leaning under the ledge with two charcoal ones
   propped in front, and a rust duvet folded back over the rest,
   hanging down over the sides and the foot.

   platformBed(x, y, o)
     footprint x..x+w (6.9) by y..y+d (6.3); the headboard runs
     down the x side (against the left wall), the foot is at +x.
     o.bare leaves the shelves empty.
     platformBed.H is the mattress top.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, poly, stroke, beam, rgb, sh } = QH.draw;
  const { rnd, mix } = QH;
  const { P } = QH.cam;
  const light = QH.light, A = QH.assets;

  const PH = 0.55, MH = 0.5;                                          // platform, mattress
  const H = PH + MH;

  /** Move p a distance c toward q (never past halfway). */
  const toward = (p, q, c) => {
    const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) || 1, k = Math.min(c / d, 0.5);
    return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
  };
  /** Cut every corner of a polygon back by c along both of its edges —
      how a cushion gets its rounded corners at this scale. */
  function soft(pts, c) {
    const out = [], n = pts.length;
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      out.push(toward(p, pts[(i + n - 1) % n], c), toward(p, pts[(i + 1) % n], c));
    }
    return out;
  }
  /** The outside of a convex solid on screen: the hull of its points.
      silhouette() fills it, contour() draws one ink line round it. Faces
      inside stay unlined, which is what keeps a pillow from reading as a
      crate, and the fill under them is what keeps its cut corners solid. */
  function hull(pts) {
    const s = pts.map(p => P(p[0], p[1], p[2])).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    for (const p of s) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of s.reverse()) { while (hi.length > 1 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    const g = QH.draw.g;
    g.beginPath();
    lo.slice(0, -1).concat(hi.slice(0, -1)).forEach((q, i) => (i ? g.lineTo : g.moveTo).call(g, Math.round(q[0]) + 0.5, Math.round(q[1]) + 0.5));
    g.closePath();
  }
  const silhouette = (pts, col) => { hull(pts); const g = QH.draw.g; g.fillStyle = col; g.fill(); };
  const contour    = (pts, col) => { hull(pts); const g = QH.draw.g; g.strokeStyle = col; g.lineWidth = 1; g.stroke(); };

  /** A pillow leaning back against the headboard: t thick, h tall, its
      foot `lean` further out than its head, y0..y1 wide. Three faces, a
      puffed lighter patch up the front, and one contour round the lot. */
  function pillow(xh, y0, y1, pz, t, h, lean, col, top, end, o = {}) {
    const c = o.soft ?? 0.14, puff = o.puff ?? 0.55, xt = xh + t, xb = xh + lean, xf = xb + t, zt = pz + h;
    const front = [[xf, y0, pz], [xf, y1, pz], [xt, y1, zt], [xt, y0, zt]];
    const topF  = [[xh, y0, zt], [xt, y0, zt], [xt, y1, zt], [xh, y1, zt]];
    const endF  = [[xb, y1, pz], [xf, y1, pz], [xt, y1, zt], [xh, y1, zt]];
    const pF = soft(front, c), pT = soft(topF, c), pE = soft(endF, c), all = pF.concat(pT, pE);
    silhouette(all, rgb(end));                                        // the corners the faces are cut back from, in shadow
    poly(pE, rgb(end));
    poly(pT, rgb(top));
    poly(pF, rgb(col));
    // the puffed middle: inset from the sides, more from the bottom than the top
    const ins = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    const bl = ins(front[0], front[3], 0.38), br = ins(front[1], front[2], 0.38);
    const tl = ins(front[3], front[0], 0.14), tr = ins(front[2], front[1], 0.14);
    const yw = (y1 - y0) * 0.16;
    poly(soft([[bl[0], bl[1] + yw, bl[2]], [br[0], br[1] - yw, br[2]], [tr[0], tr[1] - yw, tr[2]], [tl[0], tl[1] + yw, tl[2]]], c), rgb(mix(col, top, puff)));
    if (o.seam) stroke([[xt, y0 + c, zt], [xt, y1 - c, zt]], rgb(o.seam));
    contour(all, rgb(M.ink));
  }

  /** A colour darkened for a face, kept as an array so it can still be mixed. */
  const sh2 = (col, k) => col.map(v => Math.min(255, v * k));

  const platformBed = (x, y, o = {}) => {
    const w = o.w || 6.9, d = o.d || 6.3;
    const HB = 0.8, LEDGE = 0.35, POST = 0.14;                         // headboard depth, how far the ledge stands out, its end posts
    const SHELF = 1.9, HBH = 3.3, TOP = 0.35;                          // ledge height, headboard height, top board
    const wood = light.warm(M.rustLt, M.orange), woodTop = light.warm(M.orange, M.orangeLt);
    const woodDk = light.warm(M.rust, M.rustLt), rim = light.warm(M.orange, M.amber);
    const W = { colTop: woodTop, colLeft: woodDk, colRight: wood, left: 0.9, right: 0.82 };

    /* ── headboard, the full width of the bed: a panel set back behind a
          ledge the pillows tuck under, an open bookcase above the ledge, a
          thick top board, a post at each end closing it all. The far post
          is furthest from the camera, so it goes down first ── */
    box(x, y, 0, HB, POST, HBH - TOP, wood, { ...W, left: 0.62 });      // far post, its inner face in the bookcase's shadow
    const iy = y + POST, il = d - 2 * POST;                             // between the posts
    box(x, iy, 0, HB - LEDGE, il, SHELF, wood, { ...W, colRight: woodDk, right: 0.8, edge: false });   // the panel, in the ledge's shadow
    box(x, iy, SHELF, HB, il, 0.12, wood, { ...W, top: 0.88, rim, edge: false });                       // the ledge, a lit shelf against the dark back
    stroke([[x + HB, iy, SHELF], [x + HB, iy + il, SHELF]], rgb(M.ink));                                 // the shadow line under the lip
    const zc = SHELF + 0.12, ch = HBH - TOP - zc;                       // the bookcase floor and its height
    box(x, iy, zc, 0.2, il, ch, wood, { ...W, colRight: woodDk, right: 0.5, edge: false });               // its back
    if (!o.bare) {
      A.bookRow(x + 0.28, y + POST + 0.1, zc, 1.2, { along: 'y', depth: 0.42, seed: o.seed || 71, hMin: 0.6, hMax: 0.82,
                                                    cols: [M.navy, M.greyDk, light.warm(M.rustLt, M.orange), M.slate] });
      A.ball(x + 0.45, y + 2.1, zc, 0.27, M.greyLt);
      A.book(x + 0.32, y + d - 1.45, zc, 0.42, 0.6, light.warm(M.rustLt, M.orange), { h: 0.09 });         // a book lying on the ledge
      A.book(x + 0.35, y + d - 1.42, zc + 0.09, 0.38, 0.55, M.navy, { h: 0.08 });
      box(x + 0.3, y + d - 0.6, zc, 0.42, 0.2, 0.8, M.greyDk, { colTop: M.grey, top: 0.9, left: 0.85, right: 0.7, edge: false });   // two standing at the near end
      box(x + 0.3, y + d - 0.38, zc, 0.42, 0.18, 0.74, light.warm(M.rustLt, M.orange), { colTop: light.warm(M.orange, M.orangeLt), top: 0.9, left: 0.85, right: 0.7, edge: false });
    }
    box(x, y + d - POST, 0, HB, POST, HBH - TOP, wood, W);               // near post
    box(x, y, HBH - TOP, HB, d, TOP, wood, { ...W, rim });               // top board

    /* ── the platform: one slab on the floor, a lit ledge round the mattress ── */
    const px0 = x + HB, py0 = y + 0.05, pw = w - HB, pd = d - 0.05;
    box(px0, py0, 0, pw, pd, PH, M.rust, { colTop: light.warm(M.rustLt, M.orangeDk), colLeft: light.warm(M.rustDk, M.rust), left: 0.9,
                                           colRight: light.warm(M.rust, M.orange), right: 0.8, rim: light.warm(M.rustLt, M.orangeLt) });
    const lip = rgb(light.warm(M.orange, M.orangeLt));                   // the ledge's outer edges catching the light
    stroke([[px0 + 0.1, py0 + pd - 0.1, PH + 0.01], [px0 + pw - 0.1, py0 + pd - 0.1, PH + 0.01], [px0 + pw - 0.1, py0 + 0.1, PH + 0.01]], lip);

    /* ── the sheet: the mattress shows only at the head ── */
    const mx = px0, my = y + 0.3, mw = pw - 0.7, md = d - 0.8;
    const split = mx + 1.85;                                             // where the duvet starts
    box(mx, my, PH, split - mx + 0.25, md, MH, M.silver, { colTop: M.silver, top: 0.95, left: 0.75, right: 0.62 });

    /* ── pillows: orange leaning on the headboard under the ledge, charcoal
          ones propped against them in front ── */
    const PW = 1.9, gy = [my + (md - 2 * PW - 0.4) / 2, my + (md + 0.4) / 2];
    const or = light.warm(M.rustLt, M.orange), orTop = light.warm(M.orangeDk, M.orangeLt), orEnd = light.warm(M.rust, M.orangeDk);
    for (const y0 of gy) {
      pillow(mx, y0, y0 + PW, H, 0.35, 0.85, 0.28, sh2(or, 0.95), orTop, sh2(orEnd, 0.85));
      pillow(mx + 0.5, y0 + 0.08, y0 + PW - 0.12, H, 0.3, 0.6, 0.45, M.greyDk, sh2(M.grey, 0.9), sh2(M.greyDk, 0.8), { seam: M.grey, soft: 0.15, puff: 0.35 });
    }

    /* ── the duvet: folded back at the head, hanging over the sides and
          the foot, its near corner rounded off ── */
    const dx0 = split, dx1 = mx + mw + 0.15, dy0 = my - 0.12, dy1 = my + md + 0.14;
    const zT = H + 0.12, zB = PH + 0.04, c = 0.18;
    const dvL = sh(light.warm(M.rust, M.orangeDk), 0.85), dvR = sh(light.warm(M.rustLt, M.orange), 0.82);
    poly([[dx0, dy1, zB], [dx1 - c, dy1, zB], [dx1 - c, dy1, zT], [dx0, dy1, zT]], dvL);
    poly([[dx1, dy0, zB], [dx1, dy1 - c, zB], [dx1, dy1 - c, zT], [dx1, dy0, zT]], dvR);
    poly([[dx1 - c, dy1, zB], [dx1, dy1 - c, zB], [dx1, dy1 - c, zT], [dx1 - c, dy1, zT]], sh(light.warm(M.rust, M.orangeDk), 0.95));

    // the top: lit along the far edge by the lamp, falling into shadow toward the near side
    const g = QH.draw.g, xm = (dx0 + dx1) / 2;
    const a = P(xm, dy0, zT), b = P(xm, dy1, zT);
    const grd = g.createLinearGradient(a[0], a[1], b[0], b[1]);
    grd.addColorStop(0,    rgb(light.warm(M.orangeDk, M.orangeLt)));
    grd.addColorStop(0.5,  rgb(light.warm(M.rustLt, M.orange)));
    grd.addColorStop(1,    rgb(light.warm(M.rustDk, M.orangeDk)));
    poly([[dx0, dy0, zT], [dx1, dy0, zT], [dx1, dy1 - c, zT], [dx1 - c, dy1, zT], [dx0, dy1, zT]], grd);

    // the fold at the head: a roll a step lighter than the body, a crease where it meets it
    const zf = zT + 0.01, fx = dx0 + 0.55;
    const roll = g.createLinearGradient(a[0], a[1], b[0], b[1]);
    roll.addColorStop(0,   rgb(light.warm(M.orange, M.orangeLt)));
    roll.addColorStop(0.5, rgb(light.warm(M.orangeDk, M.orangeLt)));
    roll.addColorStop(1,   rgb(light.warm(M.rustLt, M.orange)));
    poly([[dx0, dy0, zf], [fx, dy0, zf], [fx, dy1, zf], [dx0, dy1, zf]], roll);
    stroke([[fx, dy0 + 0.03, zf], [fx, dy1 - 0.03, zf]], rgb(light.warm(M.rustDk, M.rust)));
    // wrinkles: short creases running toward the foot, each a dark line with a lit ridge beside it
    const R = rnd(o.seed || 73), dark = light.warm(M.rustDk, M.rust), sheen = light.warm(M.orange, M.orangeLt);
    for (let i = 0; i < 6; i++) {
      const cx = fx + 0.35 + R() * (dx1 - fx - 1.0), cy = dy0 + 0.4 + R() * (dy1 - dy0 - 0.8), len = 0.3 + R() * 0.35, dy = len * (R() - 0.4) * 0.35;
      beam([cx, cy, zf], [cx + len, cy + dy, zf], 0.03, dark, 1);
      beam([cx + 0.05, cy - 0.07, zf], [cx + len - 0.05, cy + dy - 0.07, zf], 0.03, sheen, 1);
    }
    // folds down the hanging faces, deeper near the corner
    for (const u of [dx1 - 0.45, dx1 - 1.05, dx1 - 2.0]) beam([u, dy1 + 0.01, zT - 0.06], [u - 0.03, dy1 + 0.01, zT - 0.32], 0.03, dark, 1);
    for (const u of [dy1 - 0.5, dy1 - 1.2, dy0 + 0.9]) beam([dx1 + 0.01, u, zT - 0.06], [dx1 + 0.01, u - 0.03, zT - 0.3], 0.03, dark, 1);

    // the contour: ink on the near edges and where it lies on the platform, light along the far edge
    const ink = rgb(M.ink);
    stroke([[dx0, dy0, zT], [dx0, dy1, zT], [dx1 - c, dy1, zT], [dx1, dy1 - c, zT], [dx1, dy0, zT]], ink);
    for (const [ex, ey] of [[dx0, dy1], [dx1, dy0]]) stroke([[ex, ey, zT], [ex, ey, zB]], ink);
    stroke([[dx0, dy1, zB], [dx1 - c, dy1, zB], [dx1, dy1 - c, zB], [dx1, dy0, zB]], ink);
    stroke([[dx0 + 0.02, dy0, zT], [dx1, dy0, zT]], rgb(light.warm(M.orange, M.bright)));
  };
  platformBed.H = H;
  QH.assets.platformBed = platformBed;
})(QH);
