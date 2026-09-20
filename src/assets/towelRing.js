/* ═══════════════════════════════════════════════════════════════
   assets/towelRing.js — a hand towel over a hook on the wall: a
   charcoal double hook on a small plate, the towel draped over its
   bar in a rounded fold that is lit along its crown. Under the
   fold the two leaves hang close together: the front one wide and
   long, a lit edge down its left, shadow toward the crease; the
   back one showing narrower and shorter past the front's right
   edge, in shadow, the towel's dark end beyond it. A dobby band
   over each hem, terry flecks over the cloth.

   towelRing(wall, u, z)
     the hook's centre is at (u, z); the towel hangs to z - 1.4.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { TAU, clamp, lerp } = QH;
  const { wall: W, poly, stroke, beam, grain, rgb, sh, F } = QH.draw;
  const { cam } = QH.cam;
  const light = QH.light;

  QH.assets.towelRing = (wall, u, z) => {
    const Wl = W[wall], B = wall === 'B', ink = rgb(M.ink);
    const nrm = (out, up) => (B ? [0, out, up] : [out, 0, up]);            // a normal from its out-from-the-wall and up parts
    const nEnd = B ? [1, 0, 0] : [0, 1, 0];                                 // the normal of a face at the towel's +u end
    const kFace = B ? F.left : F.right, kEnd = B ? F.right : F.left;     // the base shade of a face out from the wall, of one facing +u
    const lit = light.warm(M.orange, M.orangeLt), cloth = light.warm(M.rustLt, M.orange);
    const shade = light.warm(M.rust, M.rustLt), deep = light.warm(M.rustDk, M.rust);

    const w = 0.64, u0 = u - w / 2, u1 = u + w / 2;
    const bar = 0.2, r = 0.12;                        // the hook's bar stands this far out; the fold's radius over it
    const zf = z - 0.26, taper = 0.35;                // the fold's axis, hung under the bar so the knobs show; how far below it the leaves come together
    const yl = bar + 0.03, yb = yl - 0.06;            // the front leaf's face where it hangs flat, the back leaf's behind it
    const uf = u1 - 0.2, hemF = z - 1.4;              // the front leaf's right edge, its hem
    const ub = u0 + 0.06, hemB = z - 1.22;            // the back leaf's left edge, its hem
    const at = a => [zf + r * Math.sin(a), bar + r * Math.cos(a)];      // [z, off] on the fold's surface at angle a from the front
    const lean = zz => (zz > zf - taper ? lerp(yl, bar + r, (zz - zf + taper) / taper) : yl);   // the front leaf eases out to meet the fold
    const Lf = (uu, zz) => Wl.pt(uu, zz, lean(zz));

    /* the hook: a slim charcoal plate on the wall, a bar out from it with a knob on each end */
    Wl.box(u - 0.28, z - 0.05, 0.56, 0.1, 0.04, M.greyDk, { colTop: M.grey });

    /* the back leaf: narrow and short, showing past the front leaf's right edge; the towel's end beyond it */
    const kb = light.shade(...Wl.pt(u, zf - 0.5, yb), ...nrm(1, 0), kFace);
    poly([Wl.pt(ub, zf, yb), Wl.pt(u1, zf, yb), Wl.pt(u1, hemB + 0.05, yb), Wl.pt(u1 - 0.05, hemB, yb), Wl.pt(ub, hemB, yb)], sh(shade, kb));
    poly([Wl.pt(u1, zf, 0), Wl.pt(u1, zf, yb), Wl.pt(u1, hemB + 0.05, yb), Wl.pt(u1, hemB + 0.05, 0)], sh(deep, kEnd));
    // the front leaf's shadow on it, along the crease, and the band over its hem
    poly([Wl.pt(u1 - 0.02, zf, yb), Wl.pt(u1, zf, yb), Wl.pt(u1, zf - 0.08, yb), Wl.pt(uf + 0.12, zf - 0.2, yb), Wl.pt(uf + 0.07, zf - taper, yb), Wl.pt(uf + 0.07, hemB, yb), Wl.pt(uf, hemB, yb), Wl.pt(uf, zf - taper, yb), Wl.pt(uf + 0.03, zf - 0.18, yb), Wl.pt(uf + 0.09, zf - 0.08, yb)], sh(deep, kb));
    for (const dz of [0.1, 0.2]) stroke([Wl.pt(uf, hemB + dz, yb), Wl.pt(u1 - 0.01, hemB + dz, yb)], sh(deep, kb));
    stroke([Wl.pt(u1, zf - r, yb), Wl.pt(u1, hemB + 0.05, yb), Wl.pt(u1 - 0.05, hemB, yb), Wl.pt(uf, hemB, yb)], ink);
    stroke([Wl.pt(u1, hemB + 0.05, yb), Wl.pt(u1, hemB + 0.05, 0), Wl.pt(u1, zf - r, 0)], ink);

    for (const s of [-1, 1]) beam(Wl.pt(u + s * 0.18, z, 0.04), Wl.pt(u + s * 0.18, z, bar), 0.06, M.greyDk, 0.7);
    beam(Wl.pt(u - 0.26, z, bar), Wl.pt(u + 0.26, z, bar), 0.08 + 2 / cam.s, M.ink);         // the bar, inked round, a light along its top
    beam(Wl.pt(u - 0.26, z, bar), Wl.pt(u + 0.26, z, bar), 0.08, M.greyDk, 1.1);
    stroke([Wl.pt(u - 0.2, z + 0.03, bar + 0.01), Wl.pt(u + 0.2, z + 0.03, bar + 0.01)], rgb(M.grey));
    for (const s of [-1, 1]) {
      const ring = [];
      for (let i = 0; i < 8; i++) ring.push(Wl.pt(u + s * 0.26 + Math.cos(i / 8 * TAU) * 0.085, z + Math.sin(i / 8 * TAU) * 0.085, bar + 0.03));
      Wl.disc(u + s * 0.26, z, 0.085, rgb(M.grey), 8, bar + 0.02);
      stroke(ring, ink, 1, true);
      Wl.disc(u + s * 0.26 - 0.025, z + 0.025, 0.03, rgb(M.greyLt), 6, bar + 0.04);         // the knob's glint
    }

    /* the fold over the bar: a half-round along the wall, strip by strip up to its silhouette, lit on the crown */
    const n = 7, aMax = TAU * 3 / 8;
    for (let i = 0; i < n; i++) {
      const a0 = i / n * aMax, a1 = (i + 1) / n * aMax, am = (a0 + a1) / 2, c = Math.cos(am), s = Math.sin(am);
      const [zm, om] = at(am), [za, oa] = at(a0), [zb, ob] = at(a1);
      const k = light.shade(...Wl.pt(u, zm, om), ...nrm(c, s), lerp(kFace, F.top, clamp(s, 0, 1)));
      poly([Wl.pt(u0, za, oa), Wl.pt(u1, za, oa), Wl.pt(u1, zb, ob), Wl.pt(u0, zb, ob)], sh(s > 0.45 ? lit : cloth, k));
    }
    // its end: the round over the bar tapering into the two leaves
    const cap = [];
    for (let i = 0; i <= 8; i++) cap.push(Wl.pt(u1, ...at(i / 8 * TAU / 2)));
    cap.push(Wl.pt(u1, zf - taper, yb), Wl.pt(u1, zf - taper, yl));
    poly(cap, sh(shade, light.shade(...Wl.pt(u1, zf, bar), ...nEnd, kEnd)));
    stroke(cap, ink);
    const arc = [];
    for (let i = 0; i <= 6; i++) arc.push(Wl.pt(u0, ...at(i / 6 * aMax)));
    stroke(arc, ink);                                                                        // the fold's near end
    stroke([Wl.pt(u0, ...at(aMax)), Wl.pt(u1, ...at(aMax))], ink);                          // its crown

    /* the front leaf: wide and long, easing out from the fold, a lit edge down its left, shadow toward the crease */
    const kf = light.shade(...Wl.pt(u, zf - 0.6, yl), ...nrm(1, 0), kFace);
    const face = [Lf(u0, zf), Lf(u1 - 0.02, zf), Lf(uf + 0.09, zf - 0.08), Lf(uf + 0.03, zf - 0.18), Lf(uf, zf - taper), Lf(uf, hemF + 0.06), Lf(uf - 0.06, hemF), Lf(u0 + 0.07, hemF), Lf(u0, hemF + 0.07)];
    poly(face, sh(cloth, kf));
    poly([Lf(u0, zf), Lf(u0 + 0.08, zf), Lf(u0 + 0.08, hemF + 0.07), Lf(u0 + 0.02, hemF + 0.07), Lf(u0, hemF + 0.09)], sh(lit, kf));
    poly([Lf(uf - 0.1, zf - taper + 0.08), Lf(uf, zf - taper), Lf(uf, hemF + 0.06), Lf(uf - 0.1, hemF + 0.06)], sh(shade, kf));
    poly([Wl.pt(uf, zf - taper, yb), Lf(uf, zf - taper), Lf(uf, hemF + 0.06), Wl.pt(uf, hemF + 0.06, yb)], sh(deep, kEnd));   // the crease: its edge, the dark between the leaves
    // the dobby band over the hem
    poly([Lf(u0 + 0.03, hemF + 0.12), Lf(uf, hemF + 0.12), Lf(uf, hemF + 0.22), Lf(u0 + 0.03, hemF + 0.22)], sh(shade, kf));
    for (const dz of [0.12, 0.22]) stroke([Lf(u0 + 0.03, hemF + dz), Lf(uf, hemF + dz)], sh(deep, kf));
    stroke([...face.slice(1), Lf(u0, zf)], ink);

    /* terry: flecks over the cloth, as many as the pixels ask for */
    const flecks = Math.round(w * (zf - hemF) * cam.s * cam.s * 0.04);
    const onFront = R => Lf(u0 + 0.1 + R() * (uf - u0 - 0.2), hemF + 0.25 + R() * (zf - taper - hemF - 0.28));
    grain(flecks, shade, 31, 1, onFront);
    grain(flecks >> 2, lit, 32, 1, onFront);
    grain(flecks >> 2, deep, 33, 1, R => Wl.pt(uf + 0.09 + R() * (u1 - uf - 0.12), hemB + 0.24 + R() * (zf - taper - hemB - 0.26), yb));
  };
})(QH);
