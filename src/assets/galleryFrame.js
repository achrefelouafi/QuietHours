/* ═══════════════════════════════════════════════════════════════
   assets/galleryFrame.js — the lit shadow-box on the wall: a deep
   frame, its inside edge glowing orange, a cat's face drawn in
   the same orange on the dark behind — then a wood ledge under
   it and a planter on top with a pothos spilling over the front.

   galleryFrame(wall, u, z, w, h, o)
     the box from (u, z) to (u+w, z+h). o.depth (0.3) is how far
     it stands off the wall; o.on 0..1 (1) the edge light.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, stroke, beam, dot, rgb } = QH.draw;
  const { mix, rnd, TAU } = QH;
  const light = QH.light, sway = QH.sway;

  QH.assets.galleryFrame = (wall, u, z, w, h, o = {}) => {
    const Wl = W[wall], depth = o.depth || 0.3, on = o.on ?? 1, F = 0.1;
    const edge = mix(M.rustDk, M.amber, on), edgeLt = mix(M.rust, M.glow, on);

    // the box, and its inside: dark, with the lit edge just in from the frame
    Wl.box(u, z, w, h, depth, M.navyDk, { colTop: M.navy, left: 0.9, right: 0.7 });
    Wl.rect(u + F, z + F, u + w - F, z + h - F, rgb(M.ink), depth + 0.01);
    const E = 0.07, d2 = depth + 0.02;                                                    // the lit edge: a strip round the inside, brightest along the foot
    Wl.rect(u + F, z + F, u + w - F, z + F + E, rgb(edgeLt), d2);
    Wl.rect(u + F, z + h - F - E, u + w - F, z + h - F, rgb(edge), d2);
    Wl.rect(u + F, z + F, u + F + E, z + h - F, rgb(edge), d2);
    Wl.rect(u + w - F - E, z + F, u + w - F, z + h - F, rgb(edge), d2);

    // the cat: an outline of a head with two ears, eyes, a nose, whiskers — all in the orange
    const cu = u + w * 0.55, cz = z + h * 0.5, r = Math.min(w, h) * 0.26, ink = rgb(edge), d = depth + 0.03;
    const pts = [];
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; pts.push(Wl.pt(cu + r * Math.cos(a) * 1.1, cz + r * Math.sin(a) * 0.9, d)); }
    stroke(pts, ink, 1, true);
    stroke([Wl.pt(cu - r * 0.85, cz + r * 0.5, d), Wl.pt(cu - r * 0.7, cz + r * 1.35, d), Wl.pt(cu - r * 0.25, cz + r * 0.85, d)], ink);
    stroke([Wl.pt(cu + r * 0.85, cz + r * 0.5, d), Wl.pt(cu + r * 0.7, cz + r * 1.35, d), Wl.pt(cu + r * 0.25, cz + r * 0.85, d)], ink);
    dot(...Wl.pt(cu - r * 0.4, cz + r * 0.15, d), 1, edgeLt);
    dot(...Wl.pt(cu + r * 0.3, cz + r * 0.15, d), 1, edgeLt);
    dot(...Wl.pt(cu - 0.03, cz - r * 0.2, d), 1, edge);
    for (const s of [-1, 1]) for (const dz of [-0.05, 0.08]) stroke([Wl.pt(cu + s * r * 0.5, cz - r * 0.25 + dz, d), Wl.pt(cu + s * r * 1.5, cz - r * 0.3 + dz * 2, d)], ink);
    dot(...Wl.pt(u + w * 0.2, z + h * 0.25, d), 1, edge);                                // a signature in the corner

    // the ledge under it
    const wood = light.warm(M.rust, M.rustLt);
    Wl.box(u - 0.08, z - 0.12, w + 0.16, 0.12, depth + 0.12, wood, { colTop: light.warm(M.rustLt, M.orangeDk), left: 0.9, right: 0.7 });

    // the planter on top and the pothos spilling out of it: strands down over the front and off the far end, big leaves along each
    Wl.box(u + w * 0.1, z + h, w * 0.45, 0.22, depth - 0.04, M.navy, { colTop: M.ink, left: 0.9, right: 0.7 });
    const R = rnd(o.seed || 71), top = Wl.pt(u + w * 0.3, z + h + 0.2, depth - 0.1), S = sway.plant('galleryVine', top[0], top[1], top[2], 1.1, -0.4);
    for (let i = 0; i < 7; i++) {
      const su = u + w * (0.02 + R() * 0.5), over = i < 3 ? -0.5 - R() * 0.4 : (R() - 0.5) * 0.5;   // the first few reach off the far end
      const len = 0.5 + R() * 0.7, K = 3, pts = [Wl.pt(su, z + h + 0.22, depth - 0.12 + R() * 0.1)];
      for (let j = 1; j <= K; j++) { const f = j / K; pts.push(S.at(i, Wl.pt(su + over * f, z + h + 0.22 - len * f, depth + 0.02 + 0.12 * f), f)); }
      for (let j = 1; j <= K; j++) beam(pts[j - 1], pts[j], 0.035, M.leafDk, 1);
      for (let j = 1; j <= K; j++) {
        const p = pts[j], c = (i + j) % 2 ? M.leaf : M.leafLt;
        beam([p[0], p[1], p[2] + 0.03], [p[0] + 0.07, p[1] + 0.07, p[2] - 0.13], 0.15, c, 1);
        beam([p[0] - 0.02, p[1] - 0.02, p[2] + 0.02], [p[0] - 0.08, p[1] - 0.08, p[2] - 0.1], 0.11, c, 0.9);
      }
    }
    for (let i = 0; i < 6; i++) { const p = Wl.pt(u + w * (0.08 + i * 0.09), z + h + 0.3 + (i % 2) * 0.1, depth - 0.14 + R() * 0.12); beam(p, [p[0] + 0.1, p[1] + 0.1, p[2] + 0.08], 0.15, i % 2 ? M.leafLt : M.leaf, 1); }
  };
})(QH);
