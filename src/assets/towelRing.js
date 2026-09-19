/* ═══════════════════════════════════════════════════════════════
   assets/towelRing.js — a hand towel folded over a ring on the
   wall: a charcoal ring on a small plate, the towel hanging
   through it in a rust fold with a crease down its middle.

   towelRing(wall, u, z)
     the ring's centre is at (u, z); the towel hangs to z - 1.25.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, stroke, rgb, sh } = QH.draw;
  const { TAU } = QH;
  const light = QH.light;

  QH.assets.towelRing = (wall, u, z) => {
    const Wl = W[wall], r = 0.22, off = 0.16;
    const towel = light.warm(M.rustLt, M.orange), fold = light.warm(M.orange, M.orangeLt), shade = light.warm(M.rust, M.rustLt);
    Wl.box(u - 0.1, z + 0.12, 0.2, 0.22, 0.1, M.navyDk, { colTop: M.navy });                        // the plate
    const ring = [];
    for (let i = 0; i <= 16; i++) { const a = i / 16 * TAU; ring.push(Wl.pt(u + Math.cos(a) * r, z + 0.12 + Math.sin(a) * r, off)); }
    stroke(ring, rgb(M.greyDk), 2, true);
    // the towel: the hanging length, then the fold over the ring's bar on top of it
    Wl.box(u - 0.3, z - 1.25, 0.6, 1.15, 0.14, towel, { colTop: fold, colLeft: towel, colRight: shade, left: 0.95, right: 0.8 });
    stroke([Wl.pt(u - 0.02, z - 1.2, off - 0.02), Wl.pt(u - 0.02, z - 0.2, off - 0.02)], rgb(shade));
    stroke([Wl.pt(u - 0.3, z - 1.25, off - 0.02), Wl.pt(u + 0.3, z - 1.25, off - 0.02)], sh(shade, 0.8));
    Wl.box(u - 0.27, z - 0.22, 0.54, 0.3, 0.27, towel, { colTop: fold, colRight: shade, left: 0.95, right: 0.8, rim: fold });
  };
})(QH);
