/* ═══════════════════════════════════════════════════════════════
   engine/light.js — light, in screen space.

   Lighting isn't per-face. Surfaces the lamp touches pick their
   colour with warm(dark, lit); then, after the scene is painted,
   glow() composites soft radial gradients over it with 'lighter'.
   The quantiser turns those into stepped rings of ink.

   Each room has its own lamp, a `switch` that is 0..1 and eases
   toward its target. use(name) makes one of them the current
   `lamp`, which is what warm() and the assets read — so switching
   a lamp off is still one number changing.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const { mix, clamp } = QH;
  const { P, cam } = QH.cam;

  const light = { lamp: 1, target: 1, sources: [], switches: {} };

  /** The switch called `name`, made on first use (on). */
  light.switch = name => light.switches[name] || (light.switches[name] = { v: 1, target: 1 });
  /** Make one switch the lamp the assets read. */
  light.use = name => { const s = light.switch(name); light.lamp = s.v; light.target = s.target; };
  light.set = (name, on) => { light.switch(name).target = on ? 1 : 0; };
  light.isOn = name => light.switch(name).target > 0.5;

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
    for (const s of Object.values(light.switches)) {
      s.v += (s.target - s.v) * 0.12;
      if (Math.abs(s.target - s.v) < 0.005) s.v = s.target;
    }
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
