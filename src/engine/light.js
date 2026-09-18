/* ═══════════════════════════════════════════════════════════════
   engine/light.js — light, in screen space.

   Lighting isn't per-face. Surfaces the lamp touches pick their
   colour with warm(dark, lit); then, after the scene is painted,
   glow() composites soft radial gradients over it with 'lighter'.
   The quantiser turns those into stepped rings of ink.

   `lamp` is 0..1 and eases toward `target`, so switching the lamp
   off is one number changing.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const { mix, clamp } = QH;
  const { P, cam } = QH.cam;

  const light = { lamp: 1, target: 1, sources: [] };

  /** Brightness of a face at p with normal n: its base factor plus
      whatever the point lights add. Each source is
      { x, y, z, range, k, on: () => 0..1 }. */
  light.shade = (px, py, pz, nx, ny, nz, base) => {
    let k = base;
    for (const s of light.sources) {
      const on = s.on(); if (on <= 0) continue;
      const dx = s.x - px, dy = s.y - py, dz = s.z - pz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const nd = (nx * dx + ny * dy + nz * dz) / dist;
      if (nd <= 0) continue;
      k += nd * Math.max(0, 1 - dist / s.range) * s.k * on;
    }
    return k > 1.3 ? 1.3 : k;
  };

  /** A surface colour that depends on the lamp. */
  light.warm = (dark, lit, k = 1) => mix(dark, lit, clamp(light.lamp * k, 0, 1));

  light.ease = () => {
    light.lamp += (light.target - light.lamp) * 0.12;
    if (Math.abs(light.target - light.lamp) < 0.005) light.lamp = light.target;
  };

  light.begin = () => { QH.draw.g.globalCompositeOperation = 'lighter'; };
  light.end   = () => { QH.draw.g.globalCompositeOperation = 'source-over'; };

  /** Radial glow at a world point. `r` in world units. */
  light.glow = (x, y, z, r, col, strength) => {
    if (strength <= 0.002) return;
    const g = QH.draw.g, p = P(x, y, z), R = r * cam.s;
    const c = col[0] + ',' + col[1] + ',' + col[2] + ',';
    const grd = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], R);
    grd.addColorStop(0,    'rgba(' + c + strength + ')');
    grd.addColorStop(0.45, 'rgba(' + c + strength * 0.35 + ')');
    grd.addColorStop(1,    'rgba(' + c + '0)');
    g.fillStyle = grd;
    g.fillRect(p[0] - R, p[1] - R, R * 2, R * 2);
  };

  QH.light = light;
})(QH);
