/* ═══════════════════════════════════════════════════════════════
   assets/rollerBlind.js — a roller blind over a window: the roll
   in its housing at the top, the fabric pulled part-way down, a
   weighted bar along its hem and a cord hanging off one end.

   rollerBlind(wall, u, zTop, w, drop)
     housing from u to u+w at height zTop; the fabric hangs `drop`
     below it. window() calls this itself when given o.blind.
   Returns the screen geometry of the draw — the quad from the top
   of the housing to the hem — for hit-testing (also kept in
   rollerBlind.last).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, rgb, sh, beam } = QH.draw;
  const { P } = QH.cam;

  const rollerBlind = (wall, u, zTop, w, drop) => {
    const Wl = W[wall], R = 0.22;
    // the fabric first — it hangs just off the wall — then the roll over it
    Wl.rect(u + 0.06, zTop - drop, u + w - 0.06, zTop, sh(M.navyLt, 0.9), 0.09);
    Wl.rect(u + 0.06, zTop - drop, u + w - 0.06, zTop - drop * 0.5, sh(M.navyLt, 0.82), 0.1);   // the lower half, in shadow
    Wl.rect(u + 0.06, zTop - drop, u + w - 0.06, zTop - drop + 0.12, rgb(M.navyDk), 0.11);   // hem bar
    Wl.box(u - 0.06, zTop - R, w + 0.12, R * 2, R + 0.06, M.slate, { colTop: M.steel, left: 0.85, right: 0.7 });
    Wl.rect(u - 0.06, zTop - R * 0.35, u + w + 0.06, zTop + R * 0.1, rgb(M.steel), R + 0.07);   // the roll's highlight
    // pull cord on the near end, a little bead at the bottom
    const cu = wall === 'L' ? u + w - 0.02 : u + w - 0.02;
    beam(Wl.pt(cu, zTop - R, R), Wl.pt(cu, zTop - drop - 0.5, R), 0.025, M.greyLt, 1);
    beam(Wl.pt(cu, zTop - drop - 0.5, R), Wl.pt(cu, zTop - drop - 0.6, R), 0.06, M.greyLt, 1);

    const q = [[u - 0.06, zTop + R], [u + w + 0.06, zTop + R], [u + w + 0.06, zTop - drop], [u - 0.06, zTop - drop]];
    return (rollerBlind.last = { quad: q.map(([a, b]) => P(...Wl.pt(a, b, R))) });
  };
  rollerBlind.last = null;
  QH.assets.rollerBlind = rollerBlind;
})(QH);
