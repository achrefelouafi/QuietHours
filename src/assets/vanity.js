/* ═══════════════════════════════════════════════════════════════
   assets/vanity.js — the vanity cabinet: a teak box, its room
   side set with charcoal panels — a door on the left, two drawers
   on the right — and the top dressed with a tray of bottles, a
   soap dish, a pump bottle and a tumbler of toothbrushes.

   vanity(x, y, o)
     footprint x..x+w (3.0) by y..y+d (1.7), o.h tall (2.2); the
     panels face +y (the back wall). o.bare leaves the top empty.
     vanity.H is the top height.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectY, stroke, rgb } = QH.draw;
  const light = QH.light, A = QH.assets;

  const H = 2.2;
  const vanity = (x, y, o = {}) => {
    const w = o.w || 3.0, d = o.d || 1.7, h = o.h || H;
    const wood = light.warm(M.rustLt, M.orange), woodTop = light.warm(M.orange, M.orangeLt);
    const woodDk = light.warm(M.rust, M.rustLt), rim = light.warm(M.orange, M.amber);
    box(x, y, 0, w, d, h, wood, { colTop: woodTop, colLeft: wood, colRight: woodDk, left: 0.92, right: 0.74, rim });

    // the panels, each a shade darker toward its middle and a hairline round it
    const F = 0.13, mid = x + w * 0.5, yf = y + d + 0.01;
    const panel = (x0, z0, x1, z1) => {
      rectY(yf, x0, z0, x1, z1, rgb(M.navyDk));
      rectY(yf + 0.005, x0 + 0.08, z0 + 0.08, x1 - 0.08, z1 - 0.08, rgb(M.ink));
      rectY(yf + 0.01, x0 + 0.11, z0 + 0.11, x1 - 0.11, z1 - 0.11, rgb(M.navyDk));
      stroke([[x0, yf, z0], [x1, yf, z0], [x1, yf, z1], [x0, yf, z1]], rgb(M.rustDk), 1, true);
    };
    panel(x + F, F, mid - 0.05, h - F);
    panel(mid + 0.05, F, x + w - F, h * 0.5 - 0.04);
    panel(mid + 0.05, h * 0.5 + 0.04, x + w - F, h - F);

    if (o.bare) return;
    A.tray(x + 0.85, y + 0.6, h, 0.44);
    A.bottle(x + 0.7, y + 0.42, h + 0.05, { r: 0.13, h: 0.7, col: M.navy });
    A.bottle(x + 1.05, y + 0.5, h + 0.05, { r: 0.12, h: 0.5, col: M.greyDk, cap: M.grey });
    A.jar(x + 0.9, y + 0.85, h + 0.05, { r: 0.13, h: 0.24, col: M.navyDk, lid: M.grey });
    A.soapDish(x + 1.5, y + 1.05, h);
    A.pumpBottle(x + 2.05, y + 0.5, h, { r: 0.13, h: 0.5, col: M.grey });
    A.tumbler(x + 2.4, y + 0.95, h, { r: 0.15, h: 0.42 });
  };
  vanity.H = H;
  QH.assets.vanity = vanity;
})(QH);
