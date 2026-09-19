/* ═══════════════════════════════════════════════════════════════
   assets/boothProps.js — the small stuff round the booth.

   gamer(x, y, o)          — someone sat cross-legged on the floor,
                             a controller in their hands, facing o.face ('+x' | '+y')
   orangeDrawers(x, y, o)  — a squat three-drawer unit in orange,
                             o.w (1.1), o.d (0.9), o.h (1.4), drawers on the +y face
   edgeLight(wall, u0, u1, z, o) — an amber LED strip run along a
                             wall's top edge, o.on 0..1
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, rectY, beam, dot, disc, cyl, rgb, wall: W } = QH.draw;
  const { mix } = QH;
  const light = QH.light;
  const A = QH.assets;

  A.gamer = (x, y, o = {}) => {
    const X = (o.face || '+x') === '+x';
    const fp = (b, a, z) => X ? [x + b, y + a, z] : [x + a, y + b, z];   // b toward where they look, a across
    const hood = M.navyLt, skin = M.tan, hair = light.warm(M.rust, M.orangeDk);
    // the legs, folded: a low pad; the body over it; the head; the arms out to the pad in front
    if (X) box(x - 0.3, y - 0.3, 0, 0.7, 0.6, 0.22, M.greyDk, { colTop: M.grey, edge: false });
    else   box(x - 0.3, y - 0.3, 0, 0.6, 0.7, 0.22, M.greyDk, { colTop: M.grey, edge: false });
    box(x - 0.2, y - 0.2, 0.2, 0.4, 0.4, 0.5, hood, { colTop: hood, left: 0.9, right: 0.7 });
    cyl(x, y, 0.7, 0.17, 0.26, skin, { n: 8, colTop: hair, topK: 1, edge: false });
    beam(fp(-0.05, -0.16, 0.95), fp(0.14, -0.18, 0.99), 0.16, hair, 1);                  // the hair, swept over
    dot(...fp(0.17, -0.06, 0.82), 1, M.ink); dot(...fp(0.17, 0.05, 0.82), 1, M.ink);        // eyes
    beam(fp(0.05, -0.22, 0.55), fp(0.3, -0.1, 0.4), 0.09, hood, 1);                      // the arms
    beam(fp(0.05, 0.22, 0.55), fp(0.3, 0.1, 0.4), 0.09, hood, 1);
    box(...(X ? [x + 0.24, y - 0.12, 0.34, 0.14, 0.24, 0.08] : [x - 0.12, y + 0.24, 0.34, 0.24, 0.14, 0.08]), M.ink, { colTop: M.greyDk, edge: false });   // the controller
    dot(...fp(0.3, -0.05, 0.43), 1, M.bright); dot(...fp(0.3, 0.05, 0.43), 1, M.leafLt);
  };

  A.orangeDrawers = (x, y, o = {}) => {
    const w = o.w || 1.1, d = o.d || 0.9, h = o.h || 1.4, c = light.warm(M.rustLt, M.orange);
    box(x, y, 0, w, d, h, c, { colTop: light.warm(M.orangeDk, M.orangeLt), left: 0.88, right: 0.68, rim: light.warm(M.orange, M.amber) });
    for (let i = 0; i < 3; i++) {
      const z0 = 0.12 + i * (h - 0.16) / 3, z1 = z0 + (h - 0.16) / 3 - 0.08;
      rectY(y + d + 0.01, x + 0.08, z0, x + w - 0.08, z1, rgb(light.warm(M.rust, M.rustLt)));
      rectY(y + d + 0.02, x + 0.1, z1 - 0.06, x + w - 0.1, z1, rgb(light.warm(M.orangeDk, M.orangeLt)));
      dot(x + w / 2 - 0.05, y + d + 0.03, (z0 + z1) / 2, 2, M.silver);
    }
  };

  A.edgeLight = (wall, u0, u1, z, o = {}) => {
    const Wl = W[wall], on = o.on ?? 1, a = Wl.pt(u0, z, -0.18), b = Wl.pt(u1, z, -0.18);
    beam(a, b, 0.12, M.navyDk, 1);
    beam(a, b, 0.06, mix(M.greyDk, M.orangeLt, on), 1);
    const n = Math.round((u1 - u0) / 0.4);
    for (let i = 0; i <= n; i++) { const p = Wl.pt(u0 + (u1 - u0) * i / n, z + 0.02, -0.18); dot(p[0], p[1], p[2], 1, mix(M.grey, M.amber, on)); }
  };
})(QH);
