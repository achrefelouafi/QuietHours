/* ═══════════════════════════════════════════════════════════════
   scene/roomOne.js — room one: a small flat at night, rain on the
   window, lit by one desk lamp and a strip light over the poster.

   Everything is placed here and nowhere else. Positions are world
   units with the origin at the far corner: the room is 14 × 14,
   walls 8 high; +x runs along the back wall, +y along the left.
   Things are drawn back to front — the order below is the painter
   order, so keep it when moving furniture.

   Two things here you can touch: the lamp, and the strip light on
   the back wall, each on its own switch.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const A = QH.assets;
  const light = QH.light;

  const room = QH.scenes.room(14, 14, 8);
  const T = A.desk.H;                                          // the desk top
  const LAMP = { x: 3.3, y: 1.2, head: [0.25, 0.55, 1.55] };
  const HEAD = [LAMP.x + LAMP.head[0], LAMP.y + LAMP.head[1], T + LAMP.head[2]];
  const STRIP = { u: 8.8, z: 6.4, w: 3.0, sw: 'one-strip' };          // sw: its switch in light.switches
  /** How lit the strip light is right now, 0..1, easing after a click. */
  const stripOn = () => light.switch(STRIP.sw).v;

  // what shades the faces: the lamp, and a little from the strip light
  const sources = [
    { x: HEAD[0], y: HEAD[1], z: HEAD[2] - 0.2, range: 11, k: 0.6, on: () => light.lamp },
    { x: STRIP.u + STRIP.w / 2, y: 0.1, z: STRIP.z, range: 6, k: 0.2, on: stripOn },
  ];
  light.sources = sources;
  let lamp = null, strip = null;                                      // screen geometry of the lamp and the strip, for the click

  function draw(t) {
    room.floor();
    A.rug(2.2, 3.9, 7.1, 4.0);
    room.walls();

    /* ── left wall, far to near ── */
    A.clock('L', 1.9, 6.4, 0.6, t);
    A.wallCabinet('L', 1.3, 3.7, 1.2, 1.2, { depth: 0.9, bare: true });
    A.pottedPlant(0.45, 1.5, 4.9, { r: 0.2, size: 0.7, seed: 41 });
    A.poster('L', 4.1, 4.0, 1.5, 2.3, { art: 'mountain' });
    A.door('L', 10.4, { w: 2.5, h: 5.3 });

    /* ── back wall, far to near ── */
    A.window('B', 1.05, 2.3, 6.65, 4.3, t);
    strip = A.stripLight('B', STRIP.u, STRIP.z, STRIP.w, { on: stripOn() });
    A.poster('B', 9.25, 3.0, 1.45, 2.75, { art: 'sun' });
    A.wallShelf('B', 11.05, 3.6, 2.45);                         // lower: books and a box
    A.bookRow(11.2, 0.12, 3.7, 1.0, { along: 'x', depth: 0.55, seed: 45, hMin: 0.5, hMax: 0.7 });
    A.smallBox(12.45, 0.15, 3.7, 0.7, 0.5, 0.35, M.navy);
    A.wallShelf('B', 11.05, 4.6, 2.45);                         // upper (drawn over the books): a little speaker and a trailing plant
    A.speaker(11.2, 0.15, 4.7, { w: 0.45, d: 0.4, h: 0.75, rim: false });
    A.pottedPlant(12.5, 0.4, 4.7, { r: 0.22, kind: 'leafy', size: 0.6, seed: 43 });
    A.vines(12.5, 0.75, 4.75, 1.3, 5, 44);

    /* ── the floor, far corner outward ── */
    A.bed(0.15, 2.3, { w: 2.0, d: 3.4 });

    A.desk(2.4, 0.4, { w: 7.0, d: 1.9 });
    lamp = A.deskLamp(LAMP.x, LAMP.y, T, { head: LAMP.head });
    A.book(2.65, 1.55, T, 0.7, 0.5, M.cream, { h: 0.1 });               // in front of the lamp base
    A.journal(2.7, 1.55, T + 0.1, { w: 0.6, d: 0.45, col: light.warm(M.rustLt, M.orange) });
    A.monitor(3.9, 0.75, T, t, { w: 2.0, h: 1.45 });
    A.keyboard(4.1, 1.45, T, { w: 1.9, d: 0.6 });
    A.mouse(6.3, 1.7, T);
    A.photoFrame(6.7, 1.2, T);
    A.penCup(7.45, 1.0, T);
    A.notepad(7.3, 1.7, T);
    A.speaker(8.1, 0.85, T, { w: 0.35, d: 0.35, h: 0.6, rim: false });

    A.nightstand(0.15, 5.85, { face: '+x' });
    A.chair(4.9, 3.1);

    A.speaker(9.75, 0.2, 0, { w: 0.85, d: 0.8, h: 2.9 });
    A.hifiConsole(10.6, 0.4, { w: 3.0, d: 1.5 });
    A.speaker(12.75, 0.55, A.hifiConsole.H, { w: 0.8, d: 0.8, h: 1.2 });
    A.headphones(12.35, 1.25, A.hifiConsole.H, { size: 0.4 });
    A.snakePlant(9.6, 1.9, 0, { r: 0.45, size: 2.4 });

    A.bookshelf(0, 7.2, { w: 2.7, depth: 1.1, h: 4.8 });
    A.coffeeTable(5.3, 5.7, { w: 2.5, d: 1.3 });
    A.chest(11.2, 7.0, { w: 2.2, d: 1.6, h: 1.1 });
    A.sofa(4.4, 9.2, { w: 5.8, d: 2.2, face: '-y' });
    A.pottedPlant(12.9, 10.1, 0, { r: 0.4, ph: 0.5, size: 1.6, n: 12, seed: 61 });
  }

  /* Light is added after the paint: small halos, nothing like a
     spotlight — the reference recolours surfaces rather than
     blooming, and the assets do that themselves with warm(). */
  function lights(t) {
    light.begin();
    const f = light.lamp * (0.92 + 0.08 * Math.sin(t * 7.1) * Math.sin(t * 2.3));
    const [hx, hy, hz] = HEAD;
    light.glow(hx, hy, hz - 0.15, 0.5, [255, 200, 120], 0.35 * f);              // the bulb
    light.glow(hx + 0.3, hy + 0.4, T, 2.6, [255, 170, 80], 0.26 * f);           // pool on the desk
    light.glow(hx + 0.8, hy + 1.2, T - 0.5, 6.0, [220, 130, 50], 0.07 * f);     // warm wash over the room

    A.stripLight.halo(stripOn());                                                // the strip light

    light.glow(4.9, 0.8, T + 1.2, 1.5, [70, 120, 190], 0.09);                    // monitor
    light.glow(4.4, 0, 4.5, 4.5, [60, 90, 140], 0.03 + 0.05 * (1 - light.lamp)); // the city, more of it with the lamp off
    light.glow(0.2, 11.65, 0.05, 1.3, [180, 200, 230], 0.12);                    // hall light under the door
    light.end();
  }

  QH.scenes.roomOne = {
    room, sources, draw, lights,
    lamp: () => lamp,
    strip: () => strip, stripSwitch: STRIP.sw,
  };
})(QH);
