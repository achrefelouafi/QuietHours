/* ═══════════════════════════════════════════════════════════════
   QUIET HOURS — engine/core.js
   The one global (QH) every other file hangs off, plus the maths
   helpers they all share. Loads first.
   ═══════════════════════════════════════════════════════════════ */
window.QH = (() => {
  const TAU   = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp  = (a, b, t) => a + (b - a) * t;
  const mix   = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

  /** Seeded noise, so anything scattered stays put between frames. */
  function rnd(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  return { TAU, clamp, lerp, mix, rnd, assets: {}, scenes: {} };
})();
