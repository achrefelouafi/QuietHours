/* ═══════════════════════════════════════════════════════════════
   assets/vanityMirror.js — the mirror over the sink in a teak
   frame, and the bar light mounted above it. The light is the
   one thing in this room you can touch.

   vanityMirror(wall, u, z, w, h, o)
     glass and frame from (u, z) to (u+w, z+h); the bar sits
     o.barUp (0.45) above the frame and overhangs it by o.barOver
     (0.2) each side. o.on is 0..1 (light.lamp): how lit the tube is.
   Returns the bar's screen geometry for hit-testing (also kept in
   vanityMirror.last), in the shape main.js reads for a lamp: a
   head at the bar's centre and a stem along its length. Its glow
   is added by the scene's lighting pass.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { wall: W, rgb, poly } = QH.draw;
  const { mix } = QH;
  const { P, cam } = QH.cam;
  const light = QH.light;

  const vanityMirror = (wall, u, z, w, h, o = {}) => {
    const Wl = W[wall], F = 0.16, on = o.on ?? light.lamp;
    const wood = light.warm(M.rustLt, M.orange), woodLt = light.warm(M.orange, M.orangeLt), woodDk = light.warm(M.rust, M.rustLt);

    // the glass: a slab of the room thrown back — wall above, a lit band, the floor below, the towel's blur
    Wl.rect(u + F, z + F, u + w - F, z + h - F, rgb(M.navyLt), 0.03);
    const pt = (fu, fz, off = 0.04) => Wl.pt(u + F + (w - 2 * F) * fu, z + F + (h - 2 * F) * fz, off);
    poly([pt(0, 0.62), pt(1, 0.86), pt(1, 1), pt(0, 1)], rgb(M.navy));                         // the far wall
    poly([pt(0, 0.28, 0.045), pt(1, 0.52, 0.045), pt(1, 0.72, 0.045), pt(0, 0.48, 0.045)], rgb(M.slate));   // a lit band across
    poly([pt(0.3, 0, 0.05), pt(1, 0, 0.05), pt(1, 0.22, 0.05), pt(0.3, 0.1, 0.05)], rgb(M.greyLt));            // the floor, catching the light
    poly([pt(0, 0.05, 0.05), pt(0.28, 0.14, 0.05), pt(0.28, 0.5, 0.05), pt(0, 0.4, 0.05)], rgb(M.navyDk));     // something dark in the corner
    Wl.disc(u + w * 0.52, z + h * 0.62, 0.16, rgb(light.warm(M.rust, M.orangeDk)), 10, 0.055);
    Wl.disc(u + w * 0.5, z + h * 0.72, 0.12, rgb(light.warm(M.rust, M.orangeDk)), 8, 0.055);

    // the frame: sides, then head and foot over their ends, a bevel line inside
    const fo = { colTop: woodLt, colLeft: wood, colRight: woodDk, left: 0.95, right: 0.75 };
    Wl.box(u, z, F, h, 0.12, wood, fo);
    Wl.box(u + w - F, z, F, h, 0.12, wood, fo);
    Wl.box(u, z, w, F, 0.12, wood, fo);
    Wl.box(u, z + h - F, w, F, 0.12, wood, { ...fo, rim: light.warm(M.orange, M.amber) });
    Wl.rect(u + F - 0.03, z + F - 0.03, u + w - F + 0.03, z + F, rgb(M.ink), 0.125);
    Wl.rect(u + F - 0.03, z + F, u + F, z + h - F, rgb(M.ink), 0.125);

    // the bar light: a charcoal housing, the tube in it, its hot core
    const over = o.barOver ?? 0.2, bu = u - over, bw = w + 2 * over, bz = z + h + (o.barUp ?? 0.45);
    Wl.box(bu, bz - 0.15, bw, 0.3, 0.2, M.navyDk, { colTop: M.navy, left: 0.9, right: 0.7 });
    Wl.box(bu, bz - 0.17, 0.12, 0.34, 0.22, M.greyDk, { edge: false });
    Wl.box(bu + bw - 0.12, bz - 0.17, 0.12, 0.34, 0.22, M.greyDk, { edge: false });
    Wl.rect(bu + 0.14, bz - 0.09, bu + bw - 0.14, bz + 0.09, rgb(mix(M.greyDk, M.bright, on)), 0.21);
    Wl.rect(bu + 0.18, bz - 0.035, bu + bw - 0.18, bz + 0.035, rgb(mix(M.grey, M.glow, on)), 0.22);

    const a = P(...Wl.pt(bu, bz, 0.2)), b = P(...Wl.pt(bu + bw, bz, 0.2)), c = P(...Wl.pt(bu + bw / 2, bz, 0.2));
    return (vanityMirror.last = { head: c, r: 0.55 * cam.s, stem: [a, b], stemR: 0.4 * cam.s });
  };
  vanityMirror.last = null;
  QH.assets.vanityMirror = vanityMirror;
})(QH);
