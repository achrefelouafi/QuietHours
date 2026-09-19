/* ═══════════════════════════════════════════════════════════════
   assets/tvStand.js — the low dark stand at the foot of the bed,
   and the screen on it, turned to face the bed (so what you see
   is its back, its thin edge and the foot it stands on).

   tvStand(x, y, o)
     footprint x..x+w (2.3) by y..y+d (2.5), o.h (1.3) tall.
     o.bare = true for the stand alone.
   tv(x, y, z, o)
     the screen: its foot is centred at (x, y) on a surface at z,
     the panel o.w (1.9) wide by o.h (1.3) high, turned o.turn
     (0.35 rad) from the y axis toward the bed.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, poly, stroke, rgb, sh, dot } = QH.draw;
  const A = QH.assets;

  A.tv = (x, y, z, o = {}) => {
    const w = o.w || 1.9, h = o.h || 1.3, a = o.turn ?? 0.35, lift = 0.28, T = 0.07;
    const ux = -Math.sin(a), uy = Math.cos(a);                        // along the panel
    const nx = Math.cos(a), ny = Math.sin(a);                         // its back, toward the camera
    box(x - 0.3, y - 0.2, z, 0.6, 0.4, 0.05, M.navyDk, { colTop: M.navy });                       // foot
    box(x - 0.06, y - 0.05, z + 0.05, 0.12, 0.1, lift - 0.05, M.navyDk, { edge: false });         // neck
    const c = (k, s) => [x + ux * k * w / 2 + nx * s, y + uy * k * w / 2 + ny * s];
    const z0 = z + lift, z1 = z0 + h;
    const [a0, a1, b0, b1] = [c(-1, 0), c(1, 0), c(-1, T), c(1, T)];
    poly([[a0[0], a0[1], z1], [a1[0], a1[1], z1], [b1[0], b1[1], z1], [b0[0], b0[1], z1]], sh(M.rustLt, 0.9));   // the top edge, wood-rimmed
    poly([[b0[0], b0[1], z0], [b1[0], b1[1], z0], [b1[0], b1[1], z1], [b0[0], b0[1], z1]], sh(M.navyDk, 0.9));  // the back
    poly([[b0[0], b0[1], z0 + 0.08], [b1[0], b1[1], z0 + 0.08], [b1[0], b1[1], z1 - 0.08], [b0[0], b0[1], z1 - 0.08]], rgb(M.navyDk));
    stroke([[a0[0], a0[1], z1], [a1[0], a1[1], z1], [b1[0], b1[1], z1], [b1[0], b1[1], z0], [b0[0], b0[1], z0], [b0[0], b0[1], z1]], rgb(M.ink), 1, true);
    stroke([[b0[0], b0[1], z1], [b1[0], b1[1], z1]], rgb(M.rustLt));
    dot(b1[0] - nx * 0.02, b1[1] - ny * 0.02, z0 + 0.15, 1, M.orange);                            // standby light
  };

  A.tvStand = (x, y, o = {}) => {
    const w = o.w || 2.3, d = o.d || 2.5, h = o.h || 1.3;
    for (const [lx, ly] of [[x + 0.1, y + d - 0.2], [x + w - 0.2, y + d - 0.2], [x + w - 0.2, y + 0.1]]) box(lx, ly, 0, 0.12, 0.12, 0.15, M.ink, { edge: false });
    box(x, y, 0.15, w, d, h - 0.25, M.navyDk, { colTop: M.navy, colLeft: M.navyDk, colRight: M.navyDk, left: 0.9, right: 0.7 });
    box(x - 0.05, y - 0.05, h - 0.1, w + 0.1, d + 0.1, 0.1, M.navy, { colTop: M.navyLt });
    if (!o.bare) A.tv(x + w * 0.55, y + d * 0.5, h, { w: Math.min(d - 0.5, 1.9) });
  };
})(QH);
