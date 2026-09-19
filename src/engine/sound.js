/* ═══════════════════════════════════════════════════════════════
   engine/sound.js — the one sound in the house: thunder.

   There are no audio files. Thunder is white noise shaped in the
   Web Audio graph: a noise buffer made once, then, for each
   strike, a few rolls of it — a source through a low-pass filter
   whose cutoff sweeps down while a gain envelope rises fast and
   dies slow. One bright short roll is the crack, a long deep one
   the body, and two or three more, later and quieter, the rumble
   rolling off. A compressor on the way out keeps the overlaps
   from clipping.

   The context is made on the first strike — a click or a key, so
   the browser lets it play — and where there is no Web Audio (the
   preview tool) every call is a quiet no-op.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, noise = null, out = null;

  function ready() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      const n = ctx.sampleRate * 4, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;      // four seconds of noise; every roll plays a slice of it
      noise = b;
      out = ctx.createDynamicsCompressor();
      out.threshold.value = -18; out.knee.value = 12; out.ratio.value = 6;
      out.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /** One roll of noise from time `at`: low-passed, the cutoff sweeping
      f0 → f1 over `len` seconds, the gain up to `peak` in `attack`
      seconds and gone by the end. */
  function roll(at, f0, f1, attack, len, peak) {
    const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.8;
    lp.frequency.setValueAtTime(f0, at);
    lp.frequency.exponentialRampToValueAtTime(f1, at + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    src.connect(lp); lp.connect(g); g.connect(out);
    src.start(at, Math.random() * 3);
    src.stop(at + len + 0.1);
  }

  /** Thunder, `delay` seconds from now: the crack, the body, the rumble rolling off. */
  function thunder(delay = 0.6) {
    if (!ready()) return;
    const R = Math.random, t0 = ctx.currentTime + delay;
    roll(t0, 2600, 240, 0.015, 0.45, 0.7);                                                 // the crack
    roll(t0 + 0.05, 700, 90, 0.12, 3.2 + R() * 1.5, 0.55);                                 // the body
    for (let i = 0; i < 3; i++) roll(t0 + 0.7 + R() * 2.2, 280, 60, 0.3 + R() * 0.4, 1.6 + R() * 1.6, 0.2 + R() * 0.2);   // rolling off
  }

  QH.sound = { thunder };
})(QH);
