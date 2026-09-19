/* ═══════════════════════════════════════════════════════════════
   assets/paperHolder.js — the toilet-roll holder: a charcoal
   bracket on the wall, a roll of paper on its spindle, the end of
   the spindle showing past the roll.

   paperHolder(wall, u, z)
     the roll's axis runs along the wall, centred on (u, z).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, box, discX, discY, beam, rgb, stroke } = QH.draw;

  QH.assets.paperHolder = (wall, u, z) => {
    const Wl = W[wall], r = 0.2, L = 0.46;
    Wl.box(u - 0.12, z - 0.28, 0.24, 0.5, 0.1, M.navyDk, { colTop: M.navy });                        // the plate on the wall
    Wl.box(u - 0.06, z - 0.06, 0.12, 0.12, 0.45, M.navyDk, { edge: false });                          // the arm out to the spindle
    // the roll: a box the height of the paper, its top rounded off by a light along the front edge
    const a = Wl.pt(u - L * 0.5, z - r, 0.1);
    if (wall === 'B') {
      box(a[0], 0.12, z - r, L, r * 2, r * 2, M.silver, { colTop: M.cream, top: 0.95, left: 0.88, right: 0.72 });
      discX(a[0] + L + 0.01, 0.12 + r, z, r, rgb(M.greyLt), 12);
      discX(a[0] + L + 0.02, 0.12 + r, z, r * 0.4, rgb(M.grey), 8);
      beam([a[0] + L, 0.12 + r, z], [a[0] + L + 0.14, 0.12 + r, z], 0.08, M.greyDk, 0.8);
      stroke([[a[0] + 0.03, 0.12 + r * 2 + 0.01, z + r - 0.04], [a[0] + L - 0.03, 0.12 + r * 2 + 0.01, z + r - 0.04]], rgb(M.cream));
    } else {
      box(0.12, a[1], z - r, r * 2, L, r * 2, M.silver, { colTop: M.cream, top: 0.95, left: 0.88, right: 0.72 });
      discY(0.12 + r, a[1] + L + 0.01, z, r, rgb(M.greyLt), 12);
      discY(0.12 + r, a[1] + L + 0.02, z, r * 0.4, rgb(M.grey), 8);
      beam([0.12 + r, a[1] + L, z], [0.12 + r, a[1] + L + 0.14, z], 0.08, M.greyDk, 0.8);
      stroke([[0.12 + r * 2 + 0.01, a[1] + 0.03, z + r - 0.04], [0.12 + r * 2 + 0.01, a[1] + L - 0.03, z + r - 0.04]], rgb(M.cream));
    }
  };
})(QH);
