/* ═══════════════════════════════════════════════════════════════
   assets/deskLamp.js — the desk lamp. The one thing in the room
   you can touch.

   deskLamp(x, y, z, o)
     base centre at (x, y) on a surface at height z.
     o.head = [dx, dy, dz] puts the shade relative to the base.
   Returns the screen geometry of the draw, for hit-testing (also
   kept in deskLamp.last). The halo itself is added by the scene's
   lighting pass.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cyl, disc, beam, rgb } = QH.draw;
  const { P, cam } = QH.cam;
  const light = QH.light;

  const deskLamp = (x, y, z, o = {}) => {
    const [hx, hy, hz] = o.head || [0.25, 0.55, 1.55];
    const HX = x + hx, HY = y + hy, HZ = z + hz, jz = z + 1.15;

    cyl(x, y, z, 0.32, 0.08, M.navy, { n: 12, colTop: M.navyLt });
    beam([x, y, z + 0.08], [x, y, jz], 0.08, M.navyLt, 1);                    // stem
    disc(x, y, jz, 0.07, rgb(M.slate), 8);                                     // joint
    beam([x, y, jz], [HX, HY, HZ + 0.55], 0.08, M.navyLt, 1.1);               // arm
    beam([HX, HY, HZ + 0.55], [HX, HY, HZ + 0.36], 0.07, M.navyLt, 0.9);      // down to the shade

    // the lit opening peeks out under the shade's front lip
    if (light.lamp > 0.05) disc(HX + 0.08, HY + 0.08, HZ - 0.1, 0.38, rgb(light.warm(M.orange, M.glow)), 14);
    cyl(HX, HY, HZ, 0.44, 0.38, M.navy, { n: 14, rt: 0.16, colTop: M.navyLt });

    const h = P(HX, HY, HZ + 0.15), b = P(x, y, z), j = P(x, y, jz);
    return (deskLamp.last = { head: h, r: 0.7 * cam.s, stem: [b, j], stemR: 0.3 * cam.s });
  };
  deskLamp.last = null;
  QH.assets.deskLamp = deskLamp;
})(QH);
