/* ═══════════════════════════════════════════════════════════════
   assets/wardrobe.js — tall wooden wardrobe: two panelled doors
   with a pair of handles, a drawer across the bottom, a plinth,
   the grain showing through.

   wardrobe(x, y, o)
     footprint x..x+w (3.6) by y..y+d (1.4), o.h (6.6) tall.
     Doors face +y (it stands against the back wall).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectY, rgb, sh, beam } = QH.draw;
  const { rnd } = QH;

  QH.assets.wardrobe = (x, y, o = {}) => {
    const w = o.w || 3.6, d = o.d || 1.4, h = o.h || 6.6;
    const face = M.orange, top = M.orangeLt, side = M.rustLt;
    const fy = y + d;                                                // the door plane

    box(x + 0.08, y + 0.08, 0, w - 0.16, d - 0.16, 0.3, M.rustDk, { edge: false });   // plinth, set back
    box(x, y, 0.3, w, d, h - 0.3, face, { colTop: top, colLeft: face, colRight: side, left: 0.92, right: 0.72 });
    box(x - 0.05, y - 0.05, h - 0.25, w + 0.1, d + 0.1, 0.25, face, { colTop: top, colLeft: face, colRight: side, left: 0.92, right: 0.72, rim: M.amber });   // cornice

    // the drawer band and the two doors, drawn as inset panels on the face
    const dk = rgb(M.rustLt);
    const z0 = 0.45, zd = 1.35, zt = h - 0.4;                        // plinth top, drawer top, door top
    rectY(fy + 0.01, x + 0.12, z0, x + w - 0.12, zd - 0.1, dk);      // drawer front
    rectY(fy + 0.02, x + 0.2, z0 + 0.08, x + w - 0.2, zd - 0.18, sh(face, 0.92));
    beam([x + w * 0.42, fy + 0.03, (z0 + zd) / 2 - 0.05], [x + w * 0.58, fy + 0.03, (z0 + zd) / 2 - 0.05], 0.05, M.greyDk, 1);   // its handle

    for (const [du0, du1] of [[x + 0.12, x + w / 2 - 0.03], [x + w / 2 + 0.03, x + w - 0.12]]) {
      rectY(fy + 0.01, du0, zd + 0.05, du1, zt, dk);                 // door edge
      rectY(fy + 0.02, du0 + 0.08, zd + 0.13, du1 - 0.08, zt - 0.08, sh(face, 0.92));
      rectY(fy + 0.025, du0 + 0.3, zd + 0.35, du1 - 0.3, zt - 0.3, dk);      // raised panel
      rectY(fy + 0.03, du0 + 0.36, zd + 0.41, du1 - 0.36, zt - 0.36, sh(face, 0.95));
    }
    beam([x + w / 2, fy + 0.03, zd + 0.05], [x + w / 2, fy + 0.03, zt], 0.04, M.rustDk, 1);   // the gap between the doors
    for (const hu of [x + w / 2 - 0.25, x + w / 2 + 0.25]) {         // handles: two long bars, a shadow beside each
      beam([hu + 0.03, fy + 0.035, h * 0.44], [hu + 0.03, fy + 0.035, h * 0.58], 0.09, M.rustDk, 1);
      beam([hu, fy + 0.04, h * 0.44], [hu, fy + 0.04, h * 0.58], 0.07, M.greyDk, 1);
      beam([hu, fy + 0.045, h * 0.44], [hu, fy + 0.045, h * 0.58], 0.025, M.greyLt, 1);
    }

    // grain: faint vertical streaks down the doors and the side
    const R = rnd(o.seed || 57);
    for (let i = 0; i < 26; i++) {
      const gu = x + 0.2 + R() * (w - 0.4), gz = zd + 0.5 + R() * (zt - zd - 1.4), len = 0.3 + R() * 0.9;
      beam([gu, fy + 0.05, gz], [gu, fy + 0.05, gz + len], 0.025, R() > 0.5 ? M.orangeLt : M.rustLt, 1);
    }
    for (let i = 0; i < 8; i++) {
      const gv = y + 0.15 + R() * (d - 0.3), gz = 0.8 + R() * (h - 1.8), len = 0.3 + R() * 0.8;
      beam([x + w + 0.01, gv, gz], [x + w + 0.01, gv, gz + len], 0.025, M.rust, 1);
    }
  };
})(QH);
