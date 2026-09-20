/* ═══════════════════════════════════════════════════════════════
   assets/galleryFrame.js — the lit shadow-box on the wall: a deep
   frame, its inside edge glowing orange, a cat's face drawn in
   the same orange on the dark behind — on a wood ledge under it.

   galleryFrame(wall, u, z, w, h, o)
     the box from (u, z) to (u+w, z+h). o.depth (0.3) is how far
     it stands off the wall; o.on 0..1 (1) the edge light.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, stroke, dot, rgb } = QH.draw;
  const { mix, TAU } = QH;
  const light = QH.light;

  QH.assets.galleryFrame = (wall, u, z, w, h, o = {}) => {
    const Wl = W[wall], depth = o.depth || 0.3, on = o.on ?? 1, F = 0.1;
    const edge = mix(M.rustDk, M.amber, on), edgeLt = mix(M.rust, M.glow, on);

    // the ledge first, so the box sits over it
    const wood = light.warm(M.rust, M.rustLt);
    Wl.box(u - 0.08, z - 0.12, w + 0.16, 0.12, depth + 0.12, wood, { colTop: light.warm(M.rustLt, M.orangeDk), left: 0.9, right: 0.7 });

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
  };
})(QH);
