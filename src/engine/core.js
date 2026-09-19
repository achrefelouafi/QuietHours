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

  /** Something that runs between two places when you touch it — a blind,
      a duvet. `v` eases from `rest` to 1 and back over `ms`, the camera's
      ease; ms 0 (reduced motion) just jumps. toggle() sends it the other
      way from where it's headed, step() moves it each frame, open() is
      whether it's headed for 1, busy() while it's still going, set(v)
      puts it somewhere with no easing. */
  function slider(ms, rest = 0) {
    const s = { v: rest, from: rest, to: rest, start: -1e9 };
    const now = () => performance.now();
    s.toggle = () => { s.from = s.v; s.to = s.to === 1 ? rest : 1; s.start = now(); };
    s.open = () => s.to === 1;
    s.busy = () => now() - s.start < ms + 50;
    s.set = v => { s.v = s.from = s.to = clamp(v, 0, 1); s.start = -1e9; };
    s.step = () => {
      const u = ms ? clamp((now() - s.start) / ms, 0, 1) : 1;
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      s.v = lerp(s.from, s.to, e);
    };
    return s;
  }

  return { TAU, clamp, lerp, mix, rnd, slider, assets: {}, scenes: {} };
})();
