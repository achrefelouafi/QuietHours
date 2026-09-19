/* ═══════════════════════════════════════════════════════════════
   assets/glassRail.js — a glass balustrade along the booth's open
   edge: a wood plinth, dark posts, panes of tinted glass between
   them with a slant of light across each, a slim rail on top.
   The glass is see-through, so the traces in the floor show
   past it.

   glassRail(x, y, len, o)
     from (x, y) for `len` along o.along ('x' default, or 'y').
     o.h (1.2) is the rail's height, o.gap (2.3) between posts,
     o.base (0.3) the plinth's width — it sits on the +side of the
     line, so a rail along x at y = 13.6 fills to 13.9.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, poly, beam, rgb } = QH.draw;
  const light = QH.light;

  QH.assets.glassRail = (x, y, len, o = {}) => {
    const alongX = (o.along || 'x') === 'x', h = o.h || 1.2, gap = o.gap || 2.3, bw = o.base || 0.3;
    const pt = (u, s, z) => alongX ? [x + u, y + s, z] : [x + s, y + u, z];           // u along the rail, s across it
    const n = Math.max(1, Math.round(len / gap)), step = len / n;
    // the plinth
    const wood = light.warm(M.rust, M.rustLt), woodLt = light.warm(M.rustLt, M.orangeDk);
    if (alongX) box(x, y, 0, len, bw, 0.22, wood, { colTop: woodLt, left: 0.9, right: 0.7 });
    else        box(x, y, 0, bw, len, 0.22, wood, { colTop: woodLt, left: 0.9, right: 0.7 });
    // each bay: the pane, its slant of light, then the posts either side and the rail over
    const g = QH.draw.g, mid = bw / 2;
    for (let i = 0; i < n; i++) {
      const u0 = i * step + 0.06, u1 = (i + 1) * step - 0.06;
      poly([pt(u0, mid, 0.22), pt(u1, mid, 0.22), pt(u1, mid, h - 0.06), pt(u0, mid, h - 0.06)], 'rgba(34,57,78,0.55)');
      const a = u0 + (u1 - u0) * 0.25, b = u0 + (u1 - u0) * 0.5;
      poly([pt(a, mid + 0.005, 0.3), pt(a + 0.16, mid + 0.005, 0.3), pt(b + 0.16, mid + 0.005, h - 0.14), pt(b, mid + 0.005, h - 0.14)], 'rgba(156,208,255,0.22)');
    }
    for (let i = 0; i <= n; i++) beam(pt(i * step, mid, 0.2), pt(i * step, mid, h), 0.08, M.ink, 1);
    beam(pt(0, mid, h), pt(len, mid, h), 0.07, M.greyDk, 1);
    beam(pt(0, mid, h + 0.03), pt(len, mid, h + 0.03), 0.025, M.grey, 1);
    g.lineWidth = 1;
  };
})(QH);
