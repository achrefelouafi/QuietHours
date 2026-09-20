/* ═══════════════════════════════════════════════════════════════
   scene/roomOne.js — room one: a small flat at night, rain on the
   window, lit by one desk lamp and a strip light over the poster.

   Everything is placed here and nowhere else. Positions are world
   units with the origin at the far corner: the room is 14 × 14,
   walls 8 high; +x runs along the back wall, +y along the left.
   Things are drawn back to front — the order below is the painter
   order, so keep it when moving furniture.

   Seven things here you can touch: the lamp, the strip light on
   the back wall and the PC on the desk, each on its own switch,
   the window — a click brings lightning over the city, and
   thunder a beat after — the blanket on the daybed, turned down
   toward the foot and back with a click, the desk chair,
   rolled in under the desk and back out, and the turntable on
   the hi-fi console: a click plays the record, the next pauses it.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const A = QH.assets;
  const light = QH.light;
  const { slider, lerp, TAU } = QH;

  const room = QH.scenes.room(14, 14, 8);
  const T = A.desk.H;                                          // the desk top
  const LAMP = { x: 3.3, y: 1.2, head: [0.25, 0.55, 1.55] };
  const HEAD = [LAMP.x + LAMP.head[0], LAMP.y + LAMP.head[1], T + LAMP.head[2]];
  const STRIP = { u: 8.8, z: 6.4, w: 3.0, sw: 'one-strip' };          // sw: its switch in light.switches
  /** How lit the strip light is right now, 0..1, easing after a click. */
  const stripOn = () => light.switch(STRIP.sw).v;
  const WINDOW = { u: 1.05, z: 2.3, w: 6.65, h: 4.3 };
  const PC = { sw: 'one-pc' };                                        // the monitor on the desk: its switch in light.switches
  /** How lit the PC's screen is right now, 0..1, easing after a click. */
  const pcOn = () => light.switch(PC.sw).v;
  let pcGeo = null;                                                   // the screen's geometry from the last draw, for the click

  // the storm outside the window: a click strikes it (see engine/storm.js)
  const storm = QH.storm();
  let windowGeo = null, lightning = 0;                                // the glass's screen geometry, for the click; how bright the lightning is this frame

  // what shades the faces: the lamp, a little from the strip light — and the lightning, hard and cold, while it lasts
  const sources = [
    { x: HEAD[0], y: HEAD[1], z: HEAD[2] - 0.2, range: 11, k: 0.6, on: () => light.lamp },
    { x: STRIP.u + STRIP.w / 2, y: 0.1, z: STRIP.z, range: 6, k: 0.2, on: stripOn },
    { x: WINDOW.u + WINDOW.w / 2, y: 0.05, z: WINDOW.z + WINDOW.h / 2, range: 13, k: 0.7, on: () => lightning },
  ];
  light.sources = sources;
  let lamp = null, strip = null;                                      // screen geometry of the lamp and the strip, for the click
  // the blanket: a slider (core.js) from made to turned down; its screen geometry from the last draw
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duvet = slider(still ? 0 : 900);
  let duvetGeo = null;
  // the desk chair: a slider from pulled out (where it sits) to tucked in under the desk,
  // the seat half under the top and the back left standing in front of its edge
  const CHAIR = { x: 4.9, out: 3.1, in: 2.2 };
  const chair = slider(still ? 0 : 700);
  let chairGeo = null;

  /* ── the record ───────────────────────────────────────────────
     A click on the turntable opens the popup (sound.js / main.js),
     and the popup's three buttons toggle the three synth loops.
     `rec` is its slider (core.js), 0..1 — it follows the OR of
     the three loops each frame, so the ripples off the platter and
     the bounce in the speakers by it come up and die away rather
     than snap; `spin` is how far the record has turned, gathering
     while any loop plays. Under reduced motion nothing turns or
     bounces, but the ripples still come up if a loop is on. */
  const RPM = 33.3;
  const rec = slider(still ? 0 : 600);
  let recGeo = null, spin = 0, lastT = null, recAt = null;
  /** A click: open the record popup — the loops it toggles drive `rec` from the next frame. With `at` (the preview tool),
      that's when the loops switched: the slider is backdated to it, so a frame can be drawn with the record well up. */
  function playRecord(at) { if (at === undefined) QH.sound.record.toggle(); else recAt = at; }
  const recordOn = () => rec.open();

  function draw(t) {
    lightning = storm.flash();
    duvet.step(); chair.step();
    if (QH.sound.record.playing() !== rec.open()) { rec.toggle(); if (recAt !== null) rec.start = recAt; }   // a loop switched, in the popup — and the room follows
    recAt = null;
    rec.step();
    const dt = lastT === null ? 0 : Math.min(0.1, Math.max(0, t - lastT)); lastT = t;
    spin += dt * rec.v * RPM / 60 * TAU;                                // the record turns while the play is up, slowing as it dies
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
    windowGeo = A.window('B', WINDOW.u, WINDOW.z, WINDOW.w, WINDOW.h, t, { flash: lightning, bolt: storm.seed });
    strip = A.stripLight('B', STRIP.u, STRIP.z, STRIP.w, { on: stripOn() });
    A.poster('B', 9.25, 3.0, 1.45, 2.75, { art: 'sun' });
    A.wallShelf('B', 11.05, 3.6, 2.45);                         // lower: books and a box
    A.bookRow(11.2, 0.12, 3.7, 1.0, { along: 'x', depth: 0.55, seed: 45, hMin: 0.5, hMax: 0.7 });
    A.smallBox(12.45, 0.15, 3.7, 0.7, 0.5, 0.35, M.navy);
    A.wallShelf('B', 11.05, 4.6, 2.45);                         // upper (drawn over the books): a little speaker and a trailing plant
    A.speaker(11.2, 0.15, 4.7, { w: 0.45, d: 0.4, h: 0.75 });
    A.pottedPlant(12.5, 0.4, 4.7, { r: 0.22, kind: 'leafy', size: 0.6, seed: 43 });
    A.vines(12.5, 0.55, 4.97, 1.6, 5, 44);                     // from the pot's front rim, down past the lower board

    /* ── the floor, far corner outward ── */
    duvetGeo = A.bed(0.15, 2.3, { w: 2.0, d: 3.4, open: duvet.v });

    A.desk(2.4, 0.4, { w: 7.0, d: 1.9 });
    lamp = A.deskLamp(LAMP.x, LAMP.y, T, { head: LAMP.head });
    A.book(2.65, 1.55, T, 0.7, 0.5, M.cream, { h: 0.1 });               // in front of the lamp base
    A.journal(2.7, 1.55, T + 0.1, { w: 0.6, d: 0.45, col: light.warm(M.rustLt, M.orange) });
    pcGeo = A.monitor(3.9, 0.75, T, t, { w: 2.0, h: 1.45, on: pcOn() });
    A.keyboard(4.1, 1.45, T, { w: 1.9, d: 0.6 });
    A.mouse(6.3, 1.7, T);
    A.photoFrame(6.7, 1.2, T);
    A.penCup(7.45, 1.0, T);
    A.notepad(7.3, 1.7, T);
    A.speaker(8.1, 0.85, T, { w: 0.35, d: 0.35, h: 0.6 });

    A.nightstand(0.15, 5.85, { face: '+x' });
    chairGeo = A.chair(CHAIR.x, lerp(CHAIR.out, CHAIR.in, chair.v));

    A.speaker(9.75, 0.2, 0, { w: 0.85, d: 0.8, h: 2.9, beat: rec.v, t });
    recGeo = A.hifiConsole(10.6, 0.4, { w: 3.0, d: 1.5, play: rec.v, spin, t });
    A.speaker(12.75, 0.55, A.hifiConsole.H, { w: 0.8, d: 0.8, h: 1.2, beat: rec.v, t });
    A.headphones(12.35, 1.25, A.hifiConsole.H, { size: 0.4 });
    A.snakePlant(9.6, 1.9, 0, { r: 0.45, size: 2.4 });

    A.bookshelf(0, 7.2, { w: 2.7, depth: 1.1, h: 4.8 });
    A.coffeeTable(5.3, 5.7, { w: 2.5, d: 1.3, t });
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

    light.glow(4.9, 0.8, T + 1.2, 1.5, [70, 120, 190], 0.09 * pcOn());            // monitor
    light.glow(4.4, 0, 4.5, 4.5, [60, 90, 140], 0.03 + 0.05 * (1 - light.lamp)); // the city, more of it with the lamp off
    light.glow(0.2, 11.65, 0.05, 1.3, [180, 200, 230], 0.12);                    // hall light under the door

    // the lightning: a cold wash from the window, hardest on the glass, over the desk and out across the floor
    const wu = WINDOW.u + WINDOW.w / 2, wz = WINDOW.z + WINDOW.h / 2;
    light.glow(wu, 0.1, wz, 4.5, [200, 215, 240], 0.3 * lightning);
    light.glow(wu, 1.5, WINDOW.z, 9, [150, 175, 220], 0.32 * lightning);
    light.glow(wu + 1, 5, 1.0, 11, [110, 140, 200], 0.14 * lightning);
    light.end();
  }

  QH.scenes.roomOne = {
    room, sources, draw, lights,
    lamp: () => lamp,
    strip: () => strip, stripSwitch: STRIP.sw,
    pc: () => pcGeo, pcSwitch: PC.sw,
    duvet: () => duvetGeo, toggleDuvet: duvet.toggle, duvetOpen: duvet.open, setDuvet: duvet.set,
    chair: () => chairGeo, toggleChair: chair.toggle, chairIn: chair.open, setChair: chair.set,
    storm: () => windowGeo, strike: storm.strike,
    record: () => recGeo, playRecord, recordOn,
    busy: () => duvet.busy() || chair.busy() || storm.busy() || rec.open() || rec.busy(),
  };
})(QH);
