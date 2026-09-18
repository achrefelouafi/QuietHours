/* ═══════════════════════════════════════════════════════════════
   assets/sofa.js — two-seater with a throw over one arm.

   sofa(x, y, o)
     footprint x..x+w (5.8) by y..y+d (2.2).
     o.face = '-y'  back at y+d, faces the far wall (as in the room)
              '+y'  back at y, faces the viewer (as on the sheet)
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, poly, sh, beam } = QH.draw;
  const light = QH.light;

  QH.assets.sofa = (x, y, o = {}) => {
    const w = o.w || 5.8, d = o.d || 2.2, face = o.face || '-y';
    const rim = light.warm(M.rust, M.orangeDk);
    const backY = face === '-y' ? y + d - 0.6 : y;
    const seatY = face === '-y' ? y + 0.15 : y + 0.6;

    for (const [lx, ly] of [[x + 0.1, y + d - 0.25], [x + w - 0.25, y + d - 0.25], [x + w - 0.25, y + 0.1]]) box(lx, ly, 0, 0.15, 0.15, 0.2, M.ink, { edge: false });
    box(x, y, 0.2, w, d, 0.5, M.navy, { colTop: M.navyLt });
    box(x, y, 0.7, 0.5, d, 0.7, M.navy, { colTop: M.navyLt, rim });               // far arm

    const back  = () => box(x, backY, 0.7, w, 0.6, 0.75, M.navy, { colTop: M.navyLt, rim });
    const seats = () => {
      const n = o.seats || 2, cw = (w - 1.0 - (n - 1) * 0.06) / n;
      for (let i = 0; i < n; i++) box(x + 0.5 + i * (cw + 0.06), seatY, 0.7, cw, d - 0.75, 0.32, M.navy, { colTop: M.navyLt, top: 0.98 });
    };
    if (face === '-y') { seats(); back(); } else { back(); seats(); }
    box(x + w - 0.5, y, 0.7, 0.5, d, 0.7, M.navy, { colTop: M.navyLt, rim });     // near arm

    // the throw, folded over the near arm and hanging down its end
    if (o.throw !== false) {
      const ty = face === '-y' ? y + d - 1.3 : y + 0.1, tc = light.warm(M.rustLt, M.orange);
      box(x + w - 0.55, ty, 1.4, 0.6, 1.2, 0.1, tc, { colTop: light.warm(M.orangeDk, M.orangeLt), rim: M.orangeDk });
      poly([[x + w + 0.01, ty + 0.1, 1.45], [x + w + 0.01, ty + 1.1, 1.45], [x + w + 0.01, ty + 1.1, 0.45], [x + w + 0.01, ty + 0.1, 0.45]], sh(tc, 0.72));
      for (let i = 0; i < 4; i++) beam([x + w + 0.02, ty + 0.25 + i * 0.25, 1.35], [x + w + 0.02, ty + 0.25 + i * 0.25, 0.5], 0.03, M.rustDk, 1);
      for (let i = 0; i < 5; i++) beam([x + w + 0.02, ty + 0.15 + i * 0.22, 0.45], [x + w + 0.02, ty + 0.15 + i * 0.22, 0.3], 0.03, tc, 0.7);
    }
  };
})(QH);
