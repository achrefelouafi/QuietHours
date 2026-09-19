/* ═══════════════════════════════════════════════════════════════
   scene/roomTwo.js — room two: the bedroom upstairs. A big bed
   under three prints, a lamp on the table beside it, the moon in
   a half-blinded window, a wardrobe, a neon line of hills over a
   shelf and a dresser, plants everywhere.

   Everything is placed here and nowhere else. Positions are in
   this room's own units — the room is 15 × 14, walls 8 high,
   origin at its far corner — and the scene that holds both rooms
   puts it where it goes. Painter order, as in room one.

   Four things here you can touch: the lamp, the neon over the
   shelf (its own switch, off and on like the lamp), the blind
   over the window — a click runs it all the way down over the
   glass, another runs it back up to where it hangs — and the
   glass itself, for lightning over the city and thunder a beat
   after; the blind keeps most of the flash out of the room.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const A = QH.assets;
  const light = QH.light;
  const { clamp, lerp } = QH;

  const room = QH.scenes.room(15, 14, 8, 0.4, 0.4);
  const TABLE = { x: 0.3, y: 3.9, w: 2.1, d: 2.0, h: 2.1 };            // the lamp table
  const LAMP = { x: 1.05, y: 4.55, head: [0.35, 0.65, 1.55] };
  const HEAD = [LAMP.x + LAMP.head[0], LAMP.y + LAMP.head[1], TABLE.h + LAMP.head[2]];
  const NEON = { u: 10.6, z: 6.0, w: 3.8, sw: 'two-neon' };            // sw: its switch in light.switches
  /** How lit the neon is right now, 0..1, easing after a click. */
  const neonOn = () => light.switch(NEON.sw).v;
  const WINDOW = { u: 1.3, z: 2.0, w: 4.7, h: 4.55, moon: [0.7, 0.44] };

  /* ── the blind ────────────────────────────────────────────────
     `v` is how much of the glass it covers, 0..1. It rests part-way
     down and a click runs it between there and all the way, eased
     like the camera. Under reduced motion it just jumps. */
  const BLIND = { rest: 0.4, ms: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900 };
  const blind = { v: BLIND.rest, from: BLIND.rest, to: BLIND.rest, start: -1e9 };
  let blindGeo = null;
  const now = () => performance.now();
  function toggleBlind() {
    blind.from = blind.v;
    blind.to = blind.to === 1 ? BLIND.rest : 1;
    blind.start = now();
  }
  const blindDown = () => blind.to === 1;
  const blindBusy = () => now() - blind.start < BLIND.ms + 50;
  function easeBlind() {
    const u = BLIND.ms ? clamp((now() - blind.start) / BLIND.ms, 0, 1) : 1;
    const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    blind.v = lerp(blind.from, blind.to, e);
  }
  /** How much of the moon still shows past the hem, 0..1. */
  const moonOut = () => clamp(((1 - WINDOW.moon[1] + 0.06) - blind.v) / 0.12, 0, 1);
  /** How much of the city still shows, 0..1. */
  const cityOut = () => clamp((1 - blind.v) / (1 - BLIND.rest), 0, 1);

  // the storm outside the window: a click on the glass strikes it (see engine/storm.js)
  const storm = QH.storm();
  let windowGeo = null, lightning = 0;                                // the glass's screen geometry, for the click; how much lightning is in the room this frame

  // what shades the faces: the lamp, the neon, the moon a little — and the lightning, hard and cold, while it lasts
  const sources = [
    { x: HEAD[0], y: HEAD[1], z: HEAD[2] - 0.2, range: 10, k: 0.6, on: () => light.lamp },
    { x: NEON.u + NEON.w * 0.4, y: 0.15, z: NEON.z + 0.5, range: 7.5, k: 0.38, on: neonOn },
    { x: 4.7, y: 0.1, z: 3.6, range: 4.5, k: 0.1, on: moonOut },
    { x: WINDOW.u + WINDOW.w / 2, y: 0.05, z: WINDOW.z + WINDOW.h / 2, range: 13, k: 0.7, on: () => lightning },
  ];
  let lamp = null, neon = null;

  function draw(t) {
    easeBlind();
    const flash = storm.flash();
    lightning = flash * (0.2 + 0.8 * cityOut());                     // the blind keeps most of it out
    room.floor();
    A.runner(2.9, 0.9, 2.1, 3.4);
    A.rug(7.7, 4.4, 4.5, 8.2, { weave: true });
    room.walls();

    /* ── left wall, far to near ── */
    A.poster('L', 1.3, 5.35, 1.0, 1.2, { art: 'stars' });
    A.poster('L', 1.3, 3.65, 1.0, 1.3, { art: 'mountain' });
    A.poster('L', 2.85, 3.5, 2.0, 3.2, { art: 'moon' });

    /* ── back wall, far to near ── */
    windowGeo = A.window('B', WINDOW.u, WINDOW.z, WINDOW.w, WINDOW.h, t, { moon: WINDOW.moon, skyline: 0.32, blind: blind.v, drops: 22, seed: 9, flash, bolt: storm.seed });
    blindGeo = windowGeo.blind;
    A.wardrobe(6.5, 0.1, { w: 3.6, d: 1.4, h: 6.6 });          // over the window's edge, but the shelf's end is nearer than its side
    neon = A.neonSign('B', NEON.u, NEON.z, NEON.w, { h: 0.9, on: neonOn() });
    A.wallShelf('B', 10.5, 3.6, 3.9, { depth: 0.9 });
    A.snakePlant(11.15, 0.45, 3.7, { r: 0.3, ph: 0.55, size: 1.35, n: 10, seed: 85 });
    A.bookRow(12.35, 0.15, 3.7, 1.75, { along: 'x', depth: 0.6, seed: 47, hMin: 0.7, hMax: 0.95, cols: [M.navy, M.rustLt, M.slate, M.orange, M.greyDk, M.cream] });

    /* ── the floor, far corner outward ── */
    A.snakePlant(0.8, 0.8, 0, { r: 0.42, size: 2.3, n: 12, seed: 83 });
    A.bedsideTable(TABLE.x, TABLE.y, { kind: 'open', w: TABLE.w, d: TABLE.d, h: TABLE.h });
    lamp = A.deskLamp(LAMP.x, LAMP.y, TABLE.h, { head: LAMP.head });
    A.openBook(1.35, 4.95, TABLE.h, { w: 0.95, d: 0.65 });

    A.platformBed(0.3, 5.9, { w: 6.9, d: 6.3 });
    A.dresser(11.2, 0.35, { w: 3.7, d: 1.4, h: 2.3 });
    A.bedsideTable(0.3, 12.35, { kind: 'drawer', w: 1.4, d: 1.4, h: 1.7 });

    A.pottedPlant(10.6, 8.7, 0, { r: 0.3, ph: 0.45, kind: 'leafy', size: 1.0, n: 8, seed: 63, pot: M.rustLt, rim: M.orange });
    A.palm(14.15, 4.7, 0, { r: 0.42, size: 2.3, seed: 101 });
    A.tvStand(12.5, 7.1, { w: 2.3, d: 2.5, h: 1.3 });
    A.monstera(13.4, 10.4, 0, { r: 0.5, size: 2.4, seed: 97 });
    A.fern(14.0, 12.4, 0, { r: 0.48, size: 1.8, seed: 89 });
  }

  /* The lighting pass: the lamp's small halo and its pool over the
     bed head, the neon's wash on the wall, the moon on the glass. */
  function lights(t) {
    light.begin();
    const f = light.lamp * (0.92 + 0.08 * Math.sin(t * 6.3) * Math.sin(t * 2.9));
    const [hx, hy, hz] = HEAD;
    light.glow(hx, hy, hz - 0.15, 0.5, [255, 200, 120], 0.35 * f);                 // the bulb
    light.glow(hx + 0.2, hy + 0.3, TABLE.h, 2.4, [255, 170, 80], 0.24 * f);         // pool on the table
    light.glow(hx + 0.6, hy + 2.2, TABLE.h - 0.6, 5.5, [220, 130, 50], 0.08 * f);   // warm wash over the bed head
    light.glow(0.1, 3.9, 5.0, 3.0, [220, 140, 60], 0.05 * f);                       // up the wall, onto the prints

    const n = neonOn() * (0.9 + 0.1 * Math.sin(t * 9.7) * Math.sin(t * 3.1));   // the neon, flickering a little
    A.neonSign.halo(n);
    light.glow(NEON.u + NEON.w * 0.45, 0.6, 3.9, 3.2, [235, 130, 45], 0.14 * n);    // its pool on the shelf and the dresser top
    light.glow(NEON.u + NEON.w * 0.5, 0.1, NEON.z + 1.2, 3.6, [220, 120, 40], 0.06 * n); // and up the wall above it
    light.glow(4.6, 0, 4.0, 1.0, [200, 220, 255], 0.1 * moonOut());                 // the moon, until the blind hides it
    light.glow(3.9, 0, 3.0, 4.0, [70, 100, 150], (0.04 + 0.05 * (1 - light.lamp)) * cityOut());   // the city, more of it with the lamp off

    // the lightning: a cold wash from the window, hardest on the glass, over the bed head and out across the floor
    const wu = WINDOW.u + WINDOW.w / 2, wz = WINDOW.z + WINDOW.h / 2;
    light.glow(wu, 0.1, wz, 4.5, [200, 215, 240], 0.3 * lightning);
    light.glow(wu, 1.5, WINDOW.z, 9, [150, 175, 220], 0.32 * lightning);
    light.glow(wu + 1, 5, 1.0, 11, [110, 140, 200], 0.14 * lightning);
    light.end();
  }

  QH.scenes.roomTwo = {
    room, sources, draw, lights, lamp: () => lamp,
    neon: () => neon, neonSwitch: NEON.sw,
    blind: () => blindGeo, toggleBlind, blindDown,
    storm: () => windowGeo, strike: storm.strike,
    busy: () => blindBusy() || storm.busy(),
  };
})(QH);
