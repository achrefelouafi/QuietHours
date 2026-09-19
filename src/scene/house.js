/* ═══════════════════════════════════════════════════════════════
   scene/house.js — the rooms in one scene. Room one is where it
   always was; room two sits on top of its left wall and room
   three on top of its back wall, each set back so its floor rests
   on the wall's top and nothing in one room hides anything in
   another. The two upstairs rooms meet at a corner over room
   one's far corner.

   Each room is drawn in its own coordinates with the origin moved
   (cam.at), its own light sources and its own lamp switch made
   current — so the rooms never need to know about each other.

   QH.scenes.house → { rooms, bounds, draw, lights, lamps, neons, strips, blinds, busy, boundsOf }
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const { at } = QH.cam;
  const light = QH.light;
  const { roomOne, roomTwo, roomThree } = QH.scenes;
  const up = roomOne.room.H;                                          // the upstairs rooms stand on room one's walls

  const rooms = [
    { id: 'one',   name: 'room one',   scene: roomOne,   at: [0, 0, 0] },
    { id: 'two',   name: 'room two',   scene: roomTwo,   at: [-roomTwo.room.W, 0, up + roomTwo.room.FT] },
    { id: 'three', name: 'room three', scene: roomThree, at: [0, -roomThree.room.D, up + roomThree.room.FT] },
  ];
  /* Painter order. Room one first: the others' floors lie over its
     wall tops. Then room three, then room two — where the two meet,
     the end of room two's back wall closes the corner over room
     three's left wall, and it's the darker of the two, so it goes
     on last. */
  const painted = [rooms[0], rooms[2], rooms[1]];

  /** A room's shell in projected units, moved to where the room is. */
  function boundsOf(r) {
    const b = r.scene.room.bounds(), [ox, oy, oz] = r.at;
    const dx = ox - oy, dy = (ox + oy) * 0.5 - oz;
    return { x0: b.x0 + dx, x1: b.x1 + dx, y0: b.y0 + dy, y1: b.y1 + dy };
  }
  const bounds = rooms.map(boundsOf).reduce((a, b) => ({
    x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1),
  }));

  function each(fn) {
    for (const r of painted) {
      at(r.at[0], r.at[1], r.at[2]);
      light.use(r.id);
      light.sources = r.scene.sources;
      fn(r);
    }
    at();
  }

  const draw   = t => each(r => r.scene.draw(t));
  const lights = t => each(r => r.scene.lights(t));
  /** The lamps' screen geometry from the last draw, one per room. */
  const lamps  = () => rooms.map(r => ({ id: r.id, name: r.name, geo: r.scene.lamp() }));
  /** The neon signs' screen geometry from the last draw, with the switch each one is on. */
  const neons  = () => rooms.filter(r => r.scene.neon).map(r => ({ id: r.id, name: r.name, kind: 'neon', geo: r.scene.neon(), sw: r.scene.neonSwitch }));
  /** The strip lights' screen geometry from the last draw, with the switch each one is on. */
  const strips = () => rooms.filter(r => r.scene.strip).map(r => ({ id: r.id, name: r.name, kind: 'strip', geo: r.scene.strip(), sw: r.scene.stripSwitch }));
  /** The blinds' screen geometry from the last draw, in the rooms that have one. */
  const blinds = () => rooms.filter(r => r.scene.blind).map(r => ({ id: r.id, name: r.name, geo: r.scene.blind(), toggle: r.scene.toggleBlind }));
  /** Is anything in a room mid-animation and wanting every frame? */
  const busy   = () => rooms.some(r => r.scene.busy && r.scene.busy());

  QH.scenes.house = { rooms, bounds, draw, lights, lamps, neons, strips, blinds, busy, boundsOf };
})(QH);
