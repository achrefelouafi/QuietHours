/* ═══════════════════════════════════════════════════════════════
   scene/booth.js — the sponsor booth's shell. Like room.js — a
   floor slab and walls with their thickness showing — but the far
   corner is cut off by a third panel that runs from (0, C) on the
   left wall to (C, 0) on the back, so it faces the camera square
   on. That is the wall the screen hangs on. Panel walls, so no
   blockwork: a seam every few units instead.

   QH.scenes.booth(W, D, H, C, WT, FT)
     → { W, D, H, C, WT, FT, S, floor(), walls(), bounds() }

   S is the screen wall as a wall helper (also registered as
   draw.wall.S while the booth exists), the shape of draw.wall.L
   and .B: u runs along it from its left end, 0 to S.len, and
   `off` stands a thing proud of it, toward the camera.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { box, poly, stroke, rgb, grain, wall } = QH.draw;
  const R2 = Math.SQRT2;

  QH.scenes.booth = (W, D, H, C, WT = 0.4, FT = 0.4) => {
    const L = C * R2;
    const S = {
      len: L,
      pt:   (u, z, off = 0) => [(u + off) / R2, C - (u - off) / R2, z],
      rect: (u0, z0, u1, z1, fill, off = 0.02) => poly([S.pt(u0, z0, off), S.pt(u1, z0, off), S.pt(u1, z1, off), S.pt(u0, z1, off)], fill),
      disc: (u, z, r, fill, n = 18, off = 0.02) => {
        const pts = [];
        for (let i = 0; i < n; i++) { const a = i / n * QH.TAU; pts.push(S.pt(u + r * Math.cos(a), z + r * Math.sin(a), off)); }
        poly(pts, fill);
      },
    };
    wall.S = S;

    return {
      W, D, H, C, WT, FT, S,

      /** The shell's extent in projected units — with room over the walls for the truss and the palms. */
      bounds() { return { x0: -(D + WT), x1: W + WT, y0: -(H + 3.6), y1: (W + D) * 0.5 + FT }; },

      floor() {
        box(0, 0, -FT, W, D, FT, M.navyDk, { colTop: M.navyDk, top: 1, left: 0.85, right: 0.65, edgeCol: M.navy });
        const TX = W / 4, TY = D / 4;                                   // big tiles, four across each way
        for (let i = 0; i <= W + 0.01; i += TX) stroke([[i, 0, 0], [i, D, 0]], rgb(M.navy));
        for (let j = 0; j <= D + 0.01; j += TY) stroke([[0, j, 0], [W, j, 0]], rgb(M.navy));
        grain(Math.round(W * D * 2.0), M.floor, 3, 1, R => [R() * W, R() * D, 0.01]);
        grain(Math.round(W * D * 0.7), M.ink, 4, 1, R => [R() * W, R() * D, 0.01]);
      },

      walls() {
        const E = 0.3;                                                  // the side walls run on a little under the screen wall's ends
        box(-WT, C - E, 0, WT, D - C + E, H, M.steel, { colRight: M.wall, right: 1, left: 0.8, top: 1, edgeCol: M.ink });
        box(C - E, -WT, 0, W - C + E, WT, H, M.steel, { colLeft: M.wallB, left: 1, right: 0.6, top: 1, edgeCol: M.ink });
        // the screen wall: its face, then its top back to the outer line
        const o = WT / R2;
        poly([[0, C, 0], [C, 0, 0], [C, 0, H], [0, C, H]], rgb(M.navyDk));
        poly([[0, C, H], [C, 0, H], [C - o, -o, H], [-o, C - o, H]], rgb(M.steel));
        stroke([[0, C, 0], [C, 0, 0], [C, 0, H], [0, C, H]], rgb(M.ink), 1, true);
        stroke([[-o, C - o, H], [C - o, -o, H]], rgb(M.ink));
        // panel seams, and a skirting line along the foot of each wall
        const cl = rgb(M.floor), cb = rgb(M.ink);
        for (let y = C + 2.9; y < D - 0.5; y += 2.9) stroke([[0, y, 0.3], [0, y, H - 0.3]], cl);
        for (let x = C + 2.9; x < W - 0.5; x += 2.9) stroke([[x, 0, 0.3], [x, 0, H - 0.3]], cb);
        stroke([[0, D, 0.3], [0, C, 0.3], [C, 0, 0.3], [W, 0, 0.3]], cb);
        grain(Math.round(D * H * 1.2), M.navyDk, 8, 1, R => [0.01, C + R() * (D - C), R() * H]);
        grain(Math.round(W * H * 1.0), M.ink, 9, 1, R => [C + R() * (W - C), 0.01, R() * H]);
        grain(Math.round(L * H * 1.0), M.ink, 10, 1, R => S.pt(R() * L, R() * H, 0.01));
      },
    };
  };
})(QH);
