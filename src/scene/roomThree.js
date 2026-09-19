/* ═══════════════════════════════════════════════════════════════
   scene/roomThree.js — room three: the bathroom. A clawfoot tub
   under a shower and a framed star chart, the toilet in the far
   corner, a wide window of towers and rain over the vanity, a
   floating sink under a mirror with a bar light over it — the
   only light in here — shelves of tins and a fern, towels folded
   on a low table, plants on stools.

   Everything is placed here and nowhere else. Positions are in
   this room's own units — 14 × 14, walls 8 high, origin at the far
   corner — and the scene that holds the rooms puts it where it
   goes. Painter order, as in the other rooms.

   One thing here you can touch: the light over the mirror.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const A = QH.assets;
  const light = QH.light;

  const room = QH.scenes.room(14, 14, 8, 0.4, 0.4);
  const MIRROR = { u: 8.85, z: 3.0, w: 2.15, h: 3.3 };
  const BAR = { u: MIRROR.u - 0.2, w: MIRROR.w + 0.4, z: MIRROR.z + MIRROR.h + 0.45 };   // where vanityMirror hangs its light
  const BARC = [BAR.u + BAR.w / 2, 0.22, BAR.z];
  const WINDOW = { u: 1.2, z: 3.1, w: 6.5, h: 3.7 };
  const SINK = { x: 8.75, y: 0.1, z: 1.5, w: 2.3, d: 1.7 };
  const VANITY = { x: 4.4, y: 0.15, w: 3.0, d: 1.7 };

  // what shades the faces: the bar light, and the city through the window a little
  const sources = [
    { x: BARC[0], y: BARC[1], z: BARC[2] - 0.1, range: 11.5, k: 0.62, on: () => light.lamp },
    { x: WINDOW.u + WINDOW.w / 2, y: 0.05, z: WINDOW.z + WINDOW.h / 2, range: 5, k: 0.08, on: () => 1 },
  ];
  let lamp = null;                                                    // the bar's screen geometry, for the click

  /* The light's pool on the tiles. The reference recolours the floor
     rather than blooming over it, so this is painted on the floor
     plane in the orange inks, fading out with distance: a world
     circle is a 2:1 ellipse on screen, so the gradient is drawn
     squashed. It goes down with the floor, under everything, and
     is clipped to the slab so it can't spill past the room's edge. */
  function pool(x, y, r) {
    const g = QH.draw.g, [px, py] = QH.cam.P(x, y, 0.02), R = r * QH.cam.cam.s * 1.41;
    const c = k => { const v = light.warm(M.navyDk, k); return 'rgba(' + (v[0] | 0) + ',' + (v[1] | 0) + ',' + (v[2] | 0) + ','; };
    QH.draw.clip([[0, 0, 0], [room.W, 0, 0], [room.W, room.D, 0], [0, room.D, 0]]);
    g.translate(px, py); g.scale(1, 0.5);
    const grd = g.createRadialGradient(0, 0, 0, 0, 0, R);
    grd.addColorStop(0,    c(M.orange) + 0.95 * light.lamp + ')');
    grd.addColorStop(0.4,  c(M.orangeDk) + 0.85 * light.lamp + ')');
    grd.addColorStop(0.72, c(M.rust) + 0.55 * light.lamp + ')');
    grd.addColorStop(1,    c(M.navyDk) + '0)');
    g.fillStyle = grd;
    g.fillRect(-R, -R, R * 2, R * 2);
    // the tile lines again, through the pool, in a darker orange that fades with it
    const dk = g.createRadialGradient(0, 0, 0, 0, 0, R);
    dk.addColorStop(0,   c(M.rustLt) + 0.9 * light.lamp + ')');
    dk.addColorStop(0.7, c(M.rustDk) + 0.6 * light.lamp + ')');
    dk.addColorStop(1,   c(M.navyDk) + '0)');
    g.strokeStyle = dk; g.lineWidth = 1;
    const tile = (a, b) => { const p = QH.cam.P(...a), q = QH.cam.P(...b); g.beginPath(); g.moveTo(Math.round(p[0] - px) + 0.5, (Math.round(p[1] - py) + 0.5) * 2); g.lineTo(Math.round(q[0] - px) + 0.5, (Math.round(q[1] - py) + 0.5) * 2); g.stroke(); };
    const W = room.W, D = room.D;
    for (let i = Math.max(0, Math.floor((x - r) / 2) * 2); i <= Math.min(W, x + r); i += 2) tile([i, Math.max(0, y - r), 0.03], [i, Math.min(D, y + r), 0.03]);
    for (let j = Math.max(0, Math.floor((y - r) / 2) * 2); j <= Math.min(D, y + r); j += 2) tile([Math.max(0, x - r), j, 0.03], [Math.min(W, x + r), j, 0.03]);
    QH.draw.unclip();
  }

  function draw(t) {
    room.floor();
    pool(BARC[0] + 0.5, 3.3, 4.4);
    A.bathMat(3.9, 8.6, 2.7, 1.7);
    room.walls();

    /* ── left wall, far to near ── */
    A.clockShelf('L', 0.5, 4.7, 2.7, t);
    A.starChart('L', 4.1, 4.5, 1.6, 2.3);
    A.showerColumn('L', 8.0, 2.4, { h: 3.6, out: 0.95 });
    A.vineShelf('L', 9.9, 4.6, 2.5);

    /* ── back wall, far to near ── */
    A.paperHolder('B', 2.3, 2.45);
    A.rainWindow('B', WINDOW.u, WINDOW.z, WINDOW.w, WINDOW.h, t);
    lamp = A.vanityMirror('B', MIRROR.u, MIRROR.z, MIRROR.w, MIRROR.h);
    A.towelRing('B', 8.15, 3.65);
    A.bathShelves('B', 11.5, 3.9, 2.0);

    /* ── the floor, far corner outward ── */
    A.toilet(0.15, 0.85);
    A.toiletBrush(2.6, 0.45, 0);
    A.sideTable(0.55, 3.4, { w: 1.3, d: 1.3, h: 1.35 });
    A.broadleaf(1.2, 4.05, 1.35, { r: 0.4, size: 1.5, seed: 59 });

    A.vanity(VANITY.x, VANITY.y, { w: VANITY.w, d: VANITY.d });
    A.sink(SINK.x, SINK.y, SINK.z, { w: SINK.w, d: SINK.d });
    A.sideTable(12.25, 0.3, { w: 1.6, d: 1.6, h: 1.6, shelf: true });
    A.aloe(13.05, 1.1, 1.6, { r: 0.3, size: 1.1, n: 9, spread: 0.4, seed: 53 });

    A.bathtub(0.5, 6.0, { w: 2.5, l: 5.6 });
    A.sideTable(0.3, 11.9, { w: 1.4, d: 1.4, h: 1.45 });
    A.aloe(1.0, 12.6, 1.45, { r: 0.32, size: 1.5, n: 11, spread: 0.9, pot: M.navyLt, lip: light.warm(M.rust, M.orangeDk), seed: 51 });
    A.towelStack(3.05, 11.2, 0);
  }

  /* The lighting pass: the tube's halo, its wash down the wall
     and over the mirror, the sink top lit. The pool on the floor
     is mostly painted, above; only its heart blooms. */
  function lights(t) {
    light.begin();
    const f = light.lamp * (0.94 + 0.06 * Math.sin(t * 5.7) * Math.sin(t * 2.1));
    for (let i = 0; i < 3; i++) light.glow(BAR.u + BAR.w * (0.2 + i * 0.3), 0, BAR.z, 1.4, [240, 150, 60], 0.14 * f);   // along the tube
    light.glow(BARC[0], 0.1, BAR.z - 1.7, 3.8, [230, 140, 50], 0.08 * f);                       // down the wall, over the mirror
    light.glow(BARC[0] + 0.1, 1.0, A.sink.H(SINK.z), 2.6, [240, 160, 70], 0.15 * f);           // the sink top
    light.glow(BARC[0] + 0.3, 2.6, 0.05, 3.4, [240, 150, 60], 0.1 * f);                         // a little bloom where the pool is hottest
    light.glow(VANITY.x + VANITY.w * 0.6, 1.0, A.vanity.H, 2.8, [230, 140, 50], 0.07 * f);      // the vanity top
    light.glow(WINDOW.u + WINDOW.w / 2, 0, WINDOW.z + WINDOW.h * 0.4, 4.5, [60, 90, 140], 0.04 + 0.05 * (1 - light.lamp));   // the city, more of it with the light off
    light.end();
  }

  QH.scenes.roomThree = { room, sources, draw, lights, lamp: () => lamp };
})(QH);
