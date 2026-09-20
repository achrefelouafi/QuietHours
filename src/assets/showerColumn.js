/* ═══════════════════════════════════════════════════════════════
   assets/showerColumn.js — the shower over the tub: a gunmetal
   riser up the wall to an arm and a wide rain head, a slide bar
   in front of it with the hand shower in its bracket, the mixer
   at the bottom with its lever and spout, and the hose looping
   from the mixer up to the hand shower.

   showerColumn(wall, u, z, o)
     the riser stands at u along the wall, the mixer at height z;
     o.h is the riser's height above it (3.6), o.out how far the
     rain head reaches into the room (0.95). o.on (0..1) lifts the
     lever: the shower is running.
   Returns screen geometry for hit-testing — `quad` round the
   mixer, `head` a circle round the rain head — and `rain`, where
   the rain comes out of the head, { at: [x, y, z], r } in the
   room, for whatever it falls into (also kept in showerColumn.last).
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, beam, disc, cyl, box, rgb } = QH.draw;
  const { P: S, cam } = QH.cam;

  const showerColumn = (wall, u, z, o = {}) => {
    const Wl = W[wall], h = o.h || 3.6, out = o.out || 0.95, on = o.on || 0;
    const pipe = M.slate, dark = M.navyLt, lt = M.steel;
    const P = (off, dz, du = 0) => Wl.pt(u + du, z + dz, off);
    const riserOff = 0.18, barOff = 0.42;

    // mixer: a block on the wall, the lever to one side — lying along the wall, or lifted up and out when the shower's on — the spout under it
    Wl.box(u - 0.28, z - 0.16, 0.56, 0.32, 0.3, dark, { colTop: lt, left: 0.85, right: 0.7 });
    beam(P(0.3, 0.02, 0.28), P(0.3 + 0.15 * on, 0.02 + 0.28 * on, 0.62 - 0.19 * on), 0.07, pipe, 1);   // lever
    beam(P(0.15, -0.2), P(0.5, -0.24), 0.09, pipe, 0.95);                            // spout
    beam(P(0.5, -0.24), P(0.5, -0.34), 0.07, pipe, 0.9);
    for (const dz of [0.9, 2.2, h - 0.15]) Wl.disc(u, z + dz, 0.09, rgb(dark), 8, riserOff * 0.6);   // wall brackets

    // riser up to an elbow fitting, a straight arm out over the tub, then a short stem down into a collar on the head — so the head visibly hangs off the arm
    beam(P(riserOff, 0.14), P(riserOff, h), 0.13, pipe, 1);
    const [ex, ey] = P(riserOff, 0);
    cyl(ex, ey, z + h - 0.04, 0.11, 0.2, dark, { n: 10, colTop: lt, topK: 0.9 });                 // the elbow: a fatter knuckle on top of the riser
    const elbow = P(riserOff, h + 0.1), armEnd = Wl.pt(u, z + h + 0.1, out), head = Wl.pt(u, z + h - 0.28, out);
    beam(elbow, armEnd, 0.11, pipe, 1.05);                                                          // the arm, level out over the tub
    cyl(head[0], head[1], head[2] - 0.08, 0.36, 0.08, dark, { n: 14, colTop: lt, topK: 0.95 });    // the head: a flat disc, lit on top
    disc(head[0], head[1], head[2] + 0.005, 0.3, rgb(M.steel), 14);
    disc(head[0], head[1], head[2] + 0.01, 0.1, rgb(M.greyLt), 8);
    cyl(head[0], head[1], head[2], 0.15, 0.07, dark, { n: 10, colTop: lt, topK: 0.85 });           // the collar the stem screws into
    cyl(head[0], head[1], head[2] + 0.07, 0.1, 0.05, pipe, { n: 8, rt: 0.07, top: false, edge: false });   // tapering up to the stem
    const stemEnd = Wl.pt(u, z + h - 0.18, out);                                                    // the stem, straight down into it — over the disc, since it stands above it
    beam(armEnd, stemEnd, 0.11 + 2 / cam.s, M.ink);                                                 // an ink line down either side, so it reads as a rod against the disc
    beam(armEnd, stemEnd, 0.11, pipe, 1);
    cyl(armEnd[0], armEnd[1], armEnd[2] - 0.06, 0.09, 0.12, dark, { n: 8, colTop: lt, topK: 0.9 }); // the elbow above the head

    // slide bar in front of the riser, the hand shower clipped part way up
    const b0 = z + 0.5, b1 = z + 2.75;
    Wl.disc(u, b0, 0.08, rgb(dark), 8, barOff * 0.7);
    Wl.disc(u, b1, 0.08, rgb(dark), 8, barOff * 0.7);
    beam(P(barOff, b0 - z), P(barOff, b1 - z), 0.09, pipe, 1.05);
    const clipZ = z + 2.15;
    box(...(wall === 'L' ? [barOff - 0.1, u - 0.1, clipZ - 0.1, 0.2, 0.2, 0.2] : [u - 0.1, barOff - 0.1, clipZ - 0.1, 0.2, 0.2, 0.2]), dark, { colTop: lt, edge: false });
    beam(P(barOff + 0.08, clipZ - z + 0.1), P(barOff + 0.16, clipZ - z + 0.55), 0.07, pipe, 1);   // the handle, leaning out
    cyl(...P(barOff + 0.18, clipZ - z + 0.55), 0.12, 0.05, dark, { n: 8, colTop: lt });

    // the hose: out of the mixer, down in a loop, up to the hand shower
    const hose = [P(0.28, -0.02, 0.12), P(0.42, -0.5, 0.18), P(0.48, -0.95, 0.05), P(0.46, -1.15, -0.15), P(0.4, -0.7, -0.3),
                  P(0.36, 0.3, -0.25), P(0.34, 1.2, -0.14), P(barOff + 0.1, clipZ - z, -0.02)];
    for (let i = 1; i < hose.length; i++) beam(hose[i - 1], hose[i], 0.055, pipe, 0.9);

    // for the click: the mixer, lever and spout together with a little room round them, and the head; for the water: its underside
    const q = [[u - 0.35, z - 0.42], [u + 0.7, z - 0.42], [u + 0.7, z + 0.26], [u - 0.35, z + 0.26]];
    return (showerColumn.last = {
      quad: q.map(([a, b]) => S(...Wl.pt(a, b, 0.3))),
      head: { at: S(head[0], head[1], head[2] - 0.04), r: 0.5 * cam.s },
      rain: { at: [head[0], head[1], head[2] - 0.08], r: 0.3 },
    });
  };
  showerColumn.last = null;
  QH.assets.showerColumn = showerColumn;
})(QH);
