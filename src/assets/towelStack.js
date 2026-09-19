/* ═══════════════════════════════════════════════════════════════
   assets/towelStack.js — folded towels piled up, each one a
   little off the one below, the fold showing as a rounded lip on
   the +x side and a line of stitching across the top one.

   towelStack(x, y, z, o)
     footprint x..x+w (1.3) by y..y+d (1.15) on a surface at z.
     o.cols names the towels bottom to top from 'orange' | 'rust' |
     'navy' | 'slate' | 'grey'. towelStack.H(o) is the pile's height.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, stroke, dot, rgb } = QH.draw;
  const { rnd } = QH;
  const light = QH.light;

  const TH = 0.28;
  const shades = () => ({
    orange: [light.warm(M.rustLt, M.orange), light.warm(M.orange, M.orangeLt), light.warm(M.rust, M.rustLt)],
    rust:   [light.warm(M.rust, M.rustLt), light.warm(M.rustLt, M.orangeDk), light.warm(M.rustDk, M.rust)],
    navy:   [M.navy, M.navyLt, M.navyDk],
    slate:  [M.slate, M.steel, M.navy],
    grey:   [M.greyDk, M.grey, M.greyDk],
  });

  const towelStack = (x, y, z, o = {}) => {
    const w = o.w || 1.3, d = o.d || 1.15, cols = o.cols || ['rust', 'slate', 'navy', 'rust', 'orange'];
    const S = shades(), R = rnd(o.seed || 29);
    let zz = z;
    cols.forEach((name, i) => {
      const [col, top, end] = S[name] || S.orange, h = TH * (0.9 + R() * 0.2);
      const ox = (R() - 0.5) * 0.08, oy = (R() - 0.5) * 0.08;
      box(x + ox, y + oy, zz, w, d, h, col, { colTop: top, colRight: end, top: 0.98, left: 0.9, right: 0.85 });
      // the fold: a lit lip along the top of the +x face, a crease under it
      stroke([[x + ox + w + 0.01, y + oy + 0.05, zz + h - 0.03], [x + ox + w + 0.01, y + oy + d - 0.05, zz + h - 0.03]], rgb(top));
      stroke([[x + ox + w + 0.01, y + oy + 0.05, zz + h * 0.45], [x + ox + w + 0.01, y + oy + d - 0.05, zz + h * 0.45]], rgb(M.ink));
      if (i === cols.length - 1) {
        for (let k = 0; k < 4; k++) dot(x + ox + w * (0.25 + k * 0.16), y + oy + d * 0.3, zz + h + 0.01, 1, end);
        for (let k = 0; k < 3; k++) dot(x + ox + w * (0.55 + k * 0.12), y + oy + d * 0.7, zz + h + 0.01, 1, end);
      }
      zz += h;
    });
  };
  towelStack.H = (o = {}) => (o.cols ? o.cols.length : 5) * TH;
  QH.assets.towelStack = towelStack;
})(QH);
