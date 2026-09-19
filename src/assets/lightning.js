/* ═══════════════════════════════════════════════════════════════
   assets/lightning.js — the bolt a window draws in a flash: a
   jagged run down from over the glass into the city, in one pane
   or the other, forking once or twice on the way, a dark halo
   round a bright core so it reads on a white sky.

   lightning(wall, u, z, w, h, seed, off)
     the glass is (u, z) to (u+w, z+h) — clip to it first. seed
     picks the shape (any integer; a new one for a new bolt); off
     is how far off the wall it's drawn, so a window can put it
     behind its towers or between two rows of them.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, beam } = QH.draw;
  const { rnd } = QH;

  QH.assets.lightning = (wall, u, z, w, h, seed = 0, off = 0.035) => {
    const Wl = W[wall], B = rnd(1000 + (seed | 0)), runs = [];
    const fork = (pu, pz, step, lean, n) => {
      const pts = [[pu, pz]];
      for (let k = 0; k < n && pz > z + h * 0.15; k++) {
        pu += lean + (B() - 0.5) * 0.6; pz -= step * (0.6 + B() * 0.8);
        pts.push([pu, pz]);
      }
      runs.push(pts);
      return pts;
    };
    const pane = B() > 0.5 ? 0.6 : 0.12;
    const main = fork(u + w * (pane + B() * 0.28), z + h + 0.2, 0.4, 0, 16);
    for (const i of [2 + ((B() * 3) | 0), 5 + ((B() * 3) | 0)]) if (main[i]) fork(main[i][0], main[i][1], 0.3, B() > 0.5 ? 0.3 : -0.3, 3 + ((B() * 3) | 0));
    for (const [wd, col] of [[0.22, M.navy], [0.08, M.cream]]) for (const pts of runs) for (let k = 1; k < pts.length; k++) {
      beam(Wl.pt(pts[k - 1][0], pts[k - 1][1], off), Wl.pt(pts[k][0], pts[k][1], off), wd, col, 1);
    }
  };
})(QH);
