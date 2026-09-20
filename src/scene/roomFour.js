/* ═══════════════════════════════════════════════════════════════
   scene/roomFour.js — room four: the sponsor's booth, up over the
   two upstairs rooms. A wall of LEDs across the far corner with
   the sponsor's mark and name on it, a lattice truss over it
   hanging spotlights that throw crossed orange and blue beams
   down the screen, blue neon tubes flanking a banner on each side
   wall, a round stage in the middle ringed in the same blue, and
   circuit traces of it laid into the tiles. Round the edges: an
   arcade cabinet, a mixing desk, water coolers, beanbags, a
   gallery of prints, palms peering over the walls, glass rails
   along the open sides.

   Everything is placed here and nowhere else. Positions are in
   this room's own units — 15 × 14 (as wide as room two, whose
   back wall it stands on, as deep as room three, whose left wall
   it stands on), walls 7 high, origin at the far corner, the
   screen wall cutting that corner from (0, 5.3) to (5.3, 0) —
   and the scene that holds the rooms puts it where it goes.
   Painter order, as in the other rooms.

   Five things here you can touch: the rig — the truss with its
   spots is this room's lamp; the neon — the tubes, the ring, the
   traces and the strip under the truss, on one switch; the mixing
   desk — its knobs blink and its buttons light in turn until a
   click switches the console off; the arcade cabinet — a click on
   its screen switches it on, the marquee lit and rows scrolling,
   until the next click switches it off again; and the stage, or
   the screen: a click switches the rig, and the show goes with it
   — while the spots are on the beams sweep and the traces race,
   looping, and they stop when the spots go off.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const A = QH.assets;
  const light = QH.light;
  const { slider } = QH;

  const room = QH.scenes.booth(15, 14, 7, 5.3, 0.4, 0.4);
  const { W, D, H, C, S } = room;
  const NEON = { sw: 'four-neon' };                                    // sw: the neon's switch in light.switches
  /** How lit the neon is right now, 0..1, easing after a click. */
  const neonOn = () => light.switch(NEON.sw).v;
  const MIXER = { sw: 'four-mixer' };                                  // sw: the mixing desk's console, on its own switch
  const mixerOn = () => light.switch(MIXER.sw).v;
  const ARCADE = { sw: 'four-arcade' };                                // sw: the arcade screen + marquee, on its own switch
  /** How lit the arcade's screen and marquee are right now, 0..1, easing after a click. */
  const arcadeOn = () => light.switch(ARCADE.sw).v;

  const SCREEN = { u: 0.4, z: 0.85, w: S.len - 0.8, h: H - 1.75 };
  const SCREEN_C = S.pt(SCREEN.u + SCREEN.w / 2, SCREEN.z + SCREEN.h / 2, 0.1);
  const FACE = [[0, C, 0], [C, 0, 0], [C, 0, H], [0, C, H]];          // the screen wall's face, for clipping the beams to it

  /* ── the rig ─────────────────────────────────────────────────
     The truss stands a little proud of the walls, along the tops
     of both side walls' far halves and right across the screen
     wall. The four cans over the screen throw the beams: orange
     outside, blue inside, crossing on the way down. */
  const TZ = H + 0.15;                                                 // the bottom chord, just over the wall tops
  const off = 0.55, oc = C + off * Math.SQRT2;                         // the truss's line, offset from the walls
  const TRUSS = [[off, 11.0], [off, oc - off], [oc - off, off], [11.0, off]];
  const CANS = [
    { s: 1, f: 0.16, col: M.orangeLt, glow: [240, 140, 50], at: 0.62, half: 0.9 },
    { s: 1, f: 0.36, col: M.blueLt,   glow: [90, 150, 255],  at: 0.68, half: 0.7 },
    { s: 1, f: 0.64, col: M.blueLt,   glow: [90, 150, 255],  at: 0.32, half: 0.7 },
    { s: 1, f: 0.84, col: M.orangeLt, glow: [240, 140, 50], at: 0.38, half: 0.9 },
    { s: 0, f: 0.35, col: M.blueLt, dim: true }, { s: 0, f: 0.75, col: M.blueLt, dim: true },
    { s: 2, f: 0.25, col: M.blueLt, dim: true }, { s: 2, f: 0.65, col: M.blueLt, dim: true },
  ];
  const HEADS = [{ s: 1, f: 0.26 }, { s: 1, f: 0.5 }, { s: 1, f: 0.74 }, { s: 0, f: 0.55 }, { s: 2, f: 0.45 }];
  const lensOf = c => A.truss.canAt(TRUSS, TZ, c);

  /* ── the show ─────────────────────────────────────────────────
     The show follows the rig: while the spots are on the beams
     swing across the screen, the neon swells and the beads race
     along the traces, looping, and when the spots go off it stops.
     `env` is the show's slider (core.js), 0..1, rising as the rig
     comes on and falling as it goes off so everything settles
     where it started; `u` is the beat the beams swing to, counted
     from the moment it came on. Under reduced motion there is no
     show. A click on the stage or the screen switches the rig. */
  const RIG = { sw: 'four' };                                         // sw: the rig's switch — this room's lamp
  const SHOW = { rise: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1500, beat: 7000 };
  const show = slider(SHOW.rise);
  let began = -1e9;
  const now = () => performance.now();
  /** Switch the rig the other way, the show with it. `at` is when (now) — in the past, it's been on (or off) that long already. */
  function play(at = now()) {
    const on = !light.isOn(RIG.sw);
    light.set(RIG.sw, on);
    sync(at);
  }
  /** Bring the show into step with the rig: start it when the rig is switched on, stop it when it's switched off. */
  function sync(at = now()) {
    if (!SHOW.rise) return;
    const want = light.isOn(RIG.sw);
    if (show.open() === want) return;
    show.toggle(); show.start = at;
    if (want) began = at;
  }
  const showU = () => (now() - began) / SHOW.beat;
  const showBusy = () => show.open() || show.busy();
  const env = () => show.v;

  // what shades the faces: the spots, the neon, the ring round the stage, the screen's own light
  const sources = [
    ...CANS.filter(c => c.at !== undefined).map(c => { const p = lensOf(c); return { x: p[0], y: p[1], z: p[2], range: 13, k: c.col === M.orangeLt ? 0.3 : 0.24, on: () => light.lamp }; }),
    { x: 0.2, y: 8.2, z: 3.7, range: 6, k: 0.28, on: neonOn }, { x: 8.2, y: 0.2, z: 3.7, range: 6, k: 0.28, on: neonOn },
    { x: 5.7, y: 5.7, z: 1.2, range: 6.5, k: 0.2, on: neonOn },
    { x: SCREEN_C[0], y: SCREEN_C[1], z: SCREEN_C[2], range: 10, k: 0.22, on: () => 1 },
  ];
  let lamp = null, tubes = [], screenGeo = null, podiumGeo = null, mixerGeo = null, arcadeGeo = null;

  function draw(t) {
    sync(); show.step();
    const e = env(), u = showU();
    room.floor();
    A.neonFloor(5.7, 5.7, { a: 4.3, c: 1.4, on: neonOn(), t, chase: e, warm: light.lamp, traces: TRACES, clipTo: [[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]] });
    // the palms stand outside, behind the walls — the walls hide their trunks, their crowns look over
    A.datePalm(-1.3, 12.1, 0, { h: 8.2, seed: 113, lean: 0.4 });
    A.datePalm(13.1, -1.3, 0, { h: 7.8, seed: 117, lean: -0.3, n: 8 });
    room.walls();

    /* ── the screen wall: the panel, the beams down it, then the mark and the name ── */
    A.ledScreen.panel('S', SCREEN.u, SCREEN.z, SCREEN.w, SCREEN.h);
    for (const c of CANS) {
      if (c.at === undefined) continue;
      const swing = e * 1.7 * Math.sin(u * Math.PI * 4 + (c.f < 0.5 ? 0 : Math.PI));
      const at = SCREEN.u + SCREEN.w * c.at + swing;
      A.truss.beam(lensOf(c), S.pt(at - c.half, SCREEN.z + 0.05, 0.1), S.pt(at + c.half, SCREEN.z + 0.05, 0.1), c.col, light.lamp * (1 + 0.25 * e), FACE);
    }
    screenGeo = A.ledScreen.art('S', SCREEN.u, SCREEN.z, SCREEN.w, SCREEN.h, t, { text: TEXT });

    /* ── left wall, far to near ── */
    tubes[0] = A.neonTube('L', 6.0, 1.2, 5.0, { on: neonOn() });
    A.banner('L', 6.8, 2.3, 2.6, 3.4, { glow: 0.6 + 0.4 * neonOn() });
    tubes[1] = A.neonTube('L', 10.2, 1.2, 5.0, { on: neonOn() });
    A.galleryFrame('L', 11.5, 4.4, 2.2, 1.4, { on: light.lamp });
    A.posterFrame('L', 11.9, 0.95, 1.6, 2.6);

    /* ── back wall, far to near — a unit longer than the left one, the frames at its end ── */
    tubes[2] = A.neonTube('B', 6.0, 1.2, 5.0, { on: neonOn() });
    A.banner('B', 6.8, 2.3, 2.6, 3.4, { glow: 0.6 + 0.4 * neonOn() });
    tubes[3] = A.neonTube('B', 10.2, 1.2, 5.0, { on: neonOn() });
    A.galleryFrame('B', 12.5, 4.4, 2.2, 1.4, { on: light.lamp });
    A.posterFrame('B', 12.9, 0.95, 1.6, 2.6);

    /* ── the rig, over everything on the walls ── */
    lamp = A.truss(TRUSS, TZ, { on: light.lamp, led: neonOn(), ledSpan: 1, cans: CANS, heads: HEADS });

    /* ── the floor, far corner outward ── */
    A.tallPot(2.3, 4.6, 0, { seed: 121, size: 1.9 });
    A.bushPot(1.1, 6.3, 0, { seed: 127 });
    A.tallPot(4.6, 2.3, 0, { seed: 123, size: 1.8 });
    A.bushPot(6.3, 1.1, 0, { seed: 129 });
    podiumGeo = A.podium(5.7, 5.7, { r: 3.0, h: 1.1, on: neonOn(), pulse: e });

    // along the left wall
    A.roadCase(0.35, 6.9, { w: 1.5, d: 1.3, h: 1.4 });
    arcadeGeo = A.arcadeCabinet(0.3, 8.5, t, { face: '+x', w: 1.2, d: 1.35, on: arcadeOn() });
    A.tallPot(0.85, 10.55, 0, { seed: 125, size: 1.7, r: 0.4 });
    A.cactusPot(0.8, 11.85, 0, { seed: 131 });

    // along the back wall
    A.waterCooler(7.0, 0.3, { face: '+y' });
    A.orangeDrawers(8.05, 0.35, { w: 1.1, d: 0.9, h: 1.4 });
    mixerGeo = A.mixerDesk(9.35, 0.3, t, { w: 3.2, d: 1.5, h: 1.7, on: mixerOn() });
    A.tallPot(14.0, 1.0, 0, { seed: 133, size: 1.6, r: 0.38 });
    A.cactusPot(13.7, 2.3, 0, { seed: 137 });

    // the lounge, from docs/sofas.jpg: two green chairs looking out over each rail — a pair by the left rail, a pair
    // by the right — and the two cream chairs turned in toward each other over the room's diagonal, a corner between them
    A.frameChair(2.35, 10.1, { face: '+y', size: 0.65 });
    A.frameChair(5.3, 10.1, { face: '+y', size: 0.65 });
    A.frameChair(10.4, 2.95, { face: '+x', size: 0.65 });
    A.frameChair(10.4, 5.3, { face: '+x', size: 0.65 });
    A.clubChair(8.8, 10.4, { face: '+x', size: 0.65, w: 2.9 });
    A.clubChair(10.4, 8.8, { face: '+y', size: 0.65, w: 2.9 });
    A.waterCooler(12.6, 9.1, { face: '+y' });                          // beside the right cream chair, facing the way it does

    // the rails along the open edges, the corner post shared
    A.glassRail(0, 13.6, 14.9, { along: 'x' });
    A.glassRail(14.6, 0, 13.9, { along: 'y' });
  }
  const TEXT = 'BECOME A SPONSOR';                                    // the name on the screen — change it here
  const SITE = 'https://chirostudio.xyz';                             // where a click on the screen takes you

  // the traces laid into the tiles: out from the ring toward the rails, each a few right-angled steps, mirrored across the
  // room's diagonal — the right-hand rail being a unit further out than the left, the last legs that way run a unit longer.
  // The one between the green chairs leaves from the ring itself (its near side is at 10.0; it starts just off the tube's core)
  const TRACES = (() => {
    const left = [
      [[1.6, 9.2], [1.6, 10.6], [0.7, 10.6]],
      [[3.2, 10.4], [3.2, 12.2], [1.9, 12.2], [1.9, 13.1]],
      [[5.6, 10.6], [5.6, 12.4], [6.8, 12.4], [6.8, 13.2]],
      [[2.0, 7.6], [0.9, 7.6], [0.9, 8.5]],
      [[4.4, 10.1], [4.4, 11.9], [3.6, 11.9], [3.6, 13.1]],
    ];
    const out = v => (v > 11.5 ? v + (W - D) : v);
    return [...left, ...left.map(T => T.map(([x, y]) => [out(y), x])), [[7.6, 9.7], [8.6, 9.7], [8.6, 10.6]], [[9.7, 7.6], [9.7, 8.6], [10.6, 8.6]]];
  })();

  /* The lighting pass: the lenses and where the beams land, the
     screen's cast on the wall and the tiles, the tubes' halos,
     the ring's glow and the badge's — all swelling for the show. */
  function lights(t) {
    if (arcadeGeo) QH.draw.mask(arcadeGeo.mask);                                                    // the arcade stays flat: no halo on it
    light.begin();
    const f = light.lamp * (0.95 + 0.05 * Math.sin(t * 6.1) * Math.sin(t * 2.3)), e = env();
    for (const c of CANS) {
      if (c.at === undefined) continue;
      const p = lensOf(c);
      light.glow(p[0], p[1], p[2], 0.6, c.glow, 0.4 * f);                                          // the lens
      const at = S.pt(SCREEN.u + SCREEN.w * c.at, SCREEN.z + 0.6, 0.1);
      light.glow(at[0], at[1], at[2], 2.4, c.glow, 0.09 * f * (1 + e));                             // where it lands
    }
    const sc = SCREEN_C;
    light.glow(sc[0], sc[1], sc[2], 4.5, [88, 154, 255], 0.06 + 0.12 * e);                         // the screen's own cast
    light.glow(sc[0] + 1.2, sc[1] + 1.2, 0.2, 6.5, [60, 110, 230], 0.05 + 0.06 * e);                // and on the tiles before it

    const n = neonOn() * (0.93 + 0.07 * Math.sin(t * 8.3) * Math.sin(t * 2.7)) * (1 + 0.7 * e);
    for (const g of tubes) A.neonTube.halo(g, n);
    light.glow(5.7, 5.7, 1.2, 4.6, [70, 130, 255], 0.12 * n);                                       // the ring round the stage
    light.glow(5.7, 5.7, 1.3, 1.6, [120, 180, 255], 0.16 * n);                                      // the badge
    const a = arcadeOn();
    light.glow(1.7, 9.1, 2.4, 2.0, [80, 140, 220], 0.09 * a);                                       // the arcade's screen
    light.glow(1.7, 9.1, 0.1, 2.6, [60, 110, 200], 0.05 * a);                                       // and its pool on the tiles before it
    light.end();
    if (arcadeGeo) QH.draw.unclip();
  }

  QH.scenes.roomFour = {
    room, sources, draw, lights, lamp: () => lamp,
    // the four tubes, the ring round the stage and the badge on it are one light — a click on any of them switches it
    neon: () => ({ lines: tubes.filter(g => g).map(g => g.line), r: tubes[0] ? tubes[0].r : 0,
                   extra: podiumGeo ? podiumGeo.ring.map(line => ({ line, r: podiumGeo.ringR })) : [], polys: podiumGeo ? [podiumGeo.badge] : [] }), neonSwitch: NEON.sw,
    mixer: () => mixerGeo, mixerSwitch: MIXER.sw,
    arcade: () => arcadeGeo, arcadeSwitch: ARCADE.sw,
    show: () => ({ polys: [podiumGeo && podiumGeo.top].filter(p => p) }), play,
    site: () => ({ quad: screenGeo && screenGeo.quad, url: SITE }),                              // the screen: a click opens the sponsor page
    busy: showBusy,
  };
})(QH);
