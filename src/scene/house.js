/* ═══════════════════════════════════════════════════════════════
   scene/house.js — both rooms in one scene. Room one is where it
   always was; room two sits on top of its left wall, set back so
   its floor rests on the wall's top and nothing in either room
   hides anything in the other.

   Each room is drawn in its own coordinates with the origin moved
   (cam.at), its own light sources and its own lamp switch made
   current — so the rooms never need to know about each other.

   QH.scenes.house → { rooms, bounds, draw, lights, lamps, boundsOf }
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const { at } = QH.cam;
  const light = QH.light;

  const rooms = [
    { id: 'one', name: 'room one', scene: QH.scenes.roomOne, at: [0, 0, 0] },
    { id: 'two', name: 'room two', scene: QH.scenes.roomTwo, at: [-QH.scenes.roomTwo.room.W, 0, QH.scenes.roomOne.room.H + QH.scenes.roomTwo.room.FT] },
  ];

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
    for (const r of rooms) {
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

  QH.scenes.house = { rooms, bounds, draw, lights, lamps, boundsOf };
})(QH);
