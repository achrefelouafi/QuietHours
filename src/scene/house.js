/* ═══════════════════════════════════════════════════════════════
   scene/house.js — the rooms in one scene. Room one is where it
   always was; room two sits on top of its left wall and room
   three on top of its back wall, each set back so its floor rests
   on the wall's top and nothing in one room hides anything in
   another. The two upstairs rooms meet at a corner over room
   one's far corner — and room four, the booth, sits up over that
   corner in turn, its floor on the tops of room two's back wall
   and room three's left, so it's as wide as the one and as deep
   as the other.

   Each room is drawn in its own coordinates with the origin moved
   (cam.at), its own light sources and its own lamp switch made
   current — so the rooms never need to know about each other.
   Under them all is the ground (scene/ground.js), drawn first in
   room one's coordinates.

   QH.scenes.house → { rooms, bounds, draw, lights, lamps, neons, strips, pcs, mixers, blinds, duvets, chairs, storms, tubs, shows, records, busy, boundsOf }
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const { at } = QH.cam;
  const light = QH.light;
  const { roomOne, roomTwo, roomThree, roomFour, ground } = QH.scenes;
  const up = roomOne.room.H;                                          // the upstairs rooms stand on room one's walls
  const top = up + roomTwo.room.FT + roomTwo.room.H;                  // and the booth on theirs

  const rooms = [
    { id: 'one',   name: 'room one',   scene: roomOne,   at: [0, 0, 0] },
    { id: 'two',   name: 'room two',   scene: roomTwo,   at: [-roomTwo.room.W, 0, up + roomTwo.room.FT] },
    { id: 'three', name: 'room three', scene: roomThree, at: [0, -roomThree.room.D, up + roomThree.room.FT] },
    { id: 'four',  name: 'room four',  scene: roomFour,  at: [-roomFour.room.W, -roomFour.room.D, top + roomFour.room.FT] },
  ];
  /* Painter order. Room four first: it's behind everything, its
     floor over the tops of the upstairs back walls. Then room one:
     the others' floors lie over its wall tops. Then room three,
     then room two — where the two meet, the end of room two's back
     wall closes the corner over room three's left wall, and it's
     the darker of the two, so it goes on last. */
  const painted = [rooms[3], rooms[0], rooms[2], rooms[1]];

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

  /** The ground first, in room one's coordinates — it's under everything — then the rooms. */
  const draw   = t => { at(); ground.draw(t); each(r => r.scene.draw(t)); };
  const lights = t => each(r => r.scene.lights(t));
  /** The lamps' screen geometry from the last draw, one per room. */
  const lamps  = () => rooms.map(r => ({ id: r.id, name: r.name, geo: r.scene.lamp() }));
  /** The neon signs' screen geometry from the last draw, with the switch each one is on. */
  const neons  = () => rooms.filter(r => r.scene.neon).map(r => ({ id: r.id, name: r.name, kind: 'neon', geo: r.scene.neon(), sw: r.scene.neonSwitch }));
  /** The strip lights' screen geometry from the last draw, with the switch each one is on. */
  const strips = () => rooms.filter(r => r.scene.strip).map(r => ({ id: r.id, name: r.name, kind: 'strip', geo: r.scene.strip(), sw: r.scene.stripSwitch }));
  /** The PCs' screen geometry from the last draw — the glass of the monitor — with the switch each one is on, in the rooms with one. */
  const pcs    = () => rooms.filter(r => r.scene.pc).map(r => ({ id: r.id, name: r.name, kind: 'pc', geo: r.scene.pc(), sw: r.scene.pcSwitch }));
  /** The mixing desks' screen geometry from the last draw — the desk's faces — with the switch each console is on, in the rooms with one. */
  const mixers = () => rooms.filter(r => r.scene.mixer).map(r => ({ id: r.id, name: r.name, kind: 'mixer', geo: r.scene.mixer(), sw: r.scene.mixerSwitch }));
  /** The blinds' screen geometry from the last draw, in the rooms that have one. */
  const blinds = () => rooms.filter(r => r.scene.blind).map(r => ({ id: r.id, name: r.name, geo: r.scene.blind(), toggle: r.scene.toggleBlind }));
  /** The duvets' screen geometry from the last draw, in the rooms with a bed you can turn down. */
  const duvets = () => rooms.filter(r => r.scene.duvet).map(r => ({ id: r.id, name: r.name, geo: r.scene.duvet(), toggle: r.scene.toggleDuvet, set: r.scene.setDuvet }));
  /** The desk chairs' screen geometry from the last draw, in the rooms with one you can roll under the desk. */
  const chairs = () => rooms.filter(r => r.scene.chair).map(r => ({ id: r.id, name: r.name, geo: r.scene.chair(), toggle: r.scene.toggleChair, set: r.scene.setChair }));
  /** The rain windows' screen geometry from the last draw, in the rooms where a click brings the lightning. */
  const storms = () => rooms.filter(r => r.scene.storm).map(r => ({ id: r.id, name: r.name, geo: r.scene.storm(), strike: r.scene.strike }));
  /** The tubs' screen geometry from the last draw — the tub and the shower over it — in the rooms with one, while a click can still run it. */
  const tubs   = () => rooms.filter(r => r.scene.tub).map(r => ({ id: r.id, name: r.name, geo: r.scene.tub(), fill: r.scene.fillTub }));
  /** The stages' screen geometry from the last draw, in the rooms where a click runs a show. */
  const shows  = () => rooms.filter(r => r.scene.show).map(r => ({ id: r.id, name: r.name, geo: r.scene.show(), play: r.scene.play }));
  /** The turntables' screen geometry from the last draw, in the rooms with a record to play. */
  const records = () => rooms.filter(r => r.scene.record).map(r => ({ id: r.id, name: r.name, geo: r.scene.record(), play: r.scene.playRecord, playing: r.scene.recordOn }));
  /** Is anything in a room mid-animation and wanting every frame? */
  const busy   = () => rooms.some(r => r.scene.busy && r.scene.busy());

  QH.scenes.house = { rooms, bounds, draw, lights, lamps, neons, strips, pcs, mixers, blinds, duvets, chairs, storms, tubs, shows, records, busy, boundsOf };
})(QH);
