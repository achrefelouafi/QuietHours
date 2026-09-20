/* ═══════════════════════════════════════════════════════════════
   engine/inks.js — snap a full-colour frame onto the palette.

   The scene is painted in full colour (shading, gradients, glow),
   then every pixel is pushed to the nearest ink. A 32k lookup
   table maps 15-bit RGB to an ink index so the pass is one table
   read per pixel. A light Bayer dither breaks the lamp's falloff
   into rings; a static hash grain gives flat fills the speckled
   texture the reference has.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const INK = [];
  const seen = new Set();
  for (const c of Object.values(QH.M)) {
    const k = c.join(',');
    if (!seen.has(k)) { seen.add(k); INK.push(c); }
  }

  const PAL32 = new Uint32Array(INK.length);
  INK.forEach((c, i) => { PAL32[i] = (255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0]; });

  // The lounge's sages and the booth's olives only take pixels that
  // are about as green as they are: green over red and over blue by
  // at least 0.9 of the ink's own ratios. Without that, a navy face
  // under the lamp's orange glow — a desk leg, the chair, the bed —
  // lands nearest to sage and comes out khaki instead of dithering
  // to grey and orange as it did before those inks came.
  const M = QH.M;
  const GREEN_ONLY = new Map([M.sageDk, M.sage, M.sageLt, M.olive, M.oliveLt]
    .map(c => [c, { gr: 0.9 * c[1] / c[0], gb: 0.9 * c[1] / c[2] }]));

  const LUT = new Uint8Array(32768);
  for (let r = 0; r < 32; r++)
  for (let g = 0; g < 32; g++)
  for (let b = 0; b < 32; b++) {
    const R = (r << 3) | 4, G = (g << 3) | 4, B = (b << 3) | 4;
    let best = 0, bd = Infinity;
    for (let i = 0; i < INK.length; i++) {
      const c = INK[i];
      const gate = GREEN_ONLY.get(c);
      if (gate && (G < gate.gr * R || G < gate.gb * B)) continue;
      const dr = R - c[0], dg = G - c[1], db = B - c[2];
      const d = dr * dr + dg * dg + db * db;
      if (d < bd) { bd = d; best = i; }
    }
    LUT[(r << 10) | (g << 5) | b] = best;
  }

  const BAYER = new Int16Array([
     0,32, 8,40, 2,34,10,42,  48,16,56,24,50,18,58,26,
    12,44, 4,36,14,46, 6,38,  60,28,52,20,62,30,54,22,
     3,35,11,43, 1,33, 9,41,  51,19,59,27,49,17,57,25,
    15,47, 7,39,13,45, 5,37,  63,31,55,23,61,29,53,21,
  ]);

  /** In place: img.data becomes palette colours only. */
  function quantise(img, w, h, o = {}) {
    const spread = o.spread ?? 6, grain = o.grain ?? 5;
    const d = img.data, out = new Uint32Array(d.buffer);
    const bg = QH.M.outside, BG = PAL32[LUT[((bg[0] >> 3) << 10) | ((bg[1] >> 3) << 5) | (bg[2] >> 3)]];
    for (let y = 0; y < h; y++) {
      const brow = (y & 7) << 3;
      for (let x = 0; x < w; x++) {
        const i = y * w + x, p = i << 2;
        if (d[p] === bg[0] && d[p + 1] === bg[1] && d[p + 2] === bg[2]) { out[i] = BG; continue; }
        let hsh = (x * 374761393 + y * 668265263) | 0;
        hsh = ((hsh ^ (hsh >>> 13)) * 1274126177) | 0;
        hsh = (hsh ^ (hsh >>> 16)) >>> 0;
        const n = (BAYER[brow | (x & 7)] / 63 - 0.5) * spread + (hsh / 4294967296 - 0.5) * grain;
        let r = d[p] + n, g = d[p + 1] + n, b = d[p + 2] + n;
        r = r < 0 ? 0 : r > 255 ? 255 : r;
        g = g < 0 ? 0 : g > 255 ? 255 : g;
        b = b < 0 ? 0 : b > 255 ? 255 : b;
        out[i] = PAL32[LUT[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)]];
      }
    }
  }

  QH.inks = { INK, quantise };
})(QH);
