/* ═══════════════════════════════════════════════════════════════
   assets/door.js — door in its frame, name plate, handle, a mat in
   front, and the light from the hall showing underneath.

   door(wall, u, o)
     from u to u+w (2.5) along the wall, o.h (5.3) tall.
     o.mat = false to skip the mat.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, box, rgb, grain, beam } = QH.draw;

  QH.assets.door = (wall, u, o = {}) => {
    const w = o.w || 2.5, h = o.h || 5.3, F = 0.16, D = 0.14, Wl = W[wall];
    const fo = { colTop: M.sky, left: 0.85, right: 0.7 };

    // frame: two posts and a lintel, proud of the wall
    Wl.box(u - F, 0, F, h + F, D, M.steel, fo);
    Wl.box(u + w, 0, F, h + F, D, M.steel, fo);
    Wl.box(u - F, h, w + 2 * F, F, D, M.steel, fo);

    // the door, set back in the frame, with an inset panel
    Wl.rect(u, 0, u + w, h, rgb(M.navyDk), 0.03);
    Wl.rect(u + 0.2, 0.3, u + w - 0.2, h - 0.3, rgb(M.wallB), 0.04);
    Wl.rect(u + 0.28, 0.38, u + w - 0.28, h - 0.38, rgb(M.navyDk), 0.05);

    // name plate high up, handle on the opening side
    Wl.rect(u + w * 0.3, h * 0.72, u + w * 0.72, h * 0.78, rgb(M.silver), 0.06);
    Wl.rect(u + w * 0.34, h * 0.735, u + w * 0.68, h * 0.765, rgb(M.greyLt), 0.07);
    beam(Wl.pt(u + 0.35, 2.4, 0.1), Wl.pt(u + 0.6, 2.4, 0.1), 0.06, M.silver, 1);

    // light from the hall, under the door
    Wl.rect(u + 0.05, 0, u + w - 0.05, 0.07, rgb(M.greyLt), 0.06);

    if (o.mat !== false) {
      const md = o.matDepth || 1.5;
      const m = wall === 'L' ? [0.1, u - 0.05, md, w + 0.1] : [u - 0.05, 0.1, w + 0.1, md];
      box(m[0], m[1], 0, m[2], m[3], 0.05, M.navy, { colTop: M.navy, top: 0.9 });
      grain(40, M.slate, 19, 1, R => [m[0] + R() * m[2], m[1] + R() * m[3], 0.06]);
    }
  };
})(QH);
