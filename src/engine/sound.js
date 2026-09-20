/* ═══════════════════════════════════════════════════════════════
   engine/sound.js — the two sounds in the house: thunder, and the
   record on the turntable downstairs.

   Thunder has no audio file. It is white noise shaped in the
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

   The record is the one audio file, public/ambient-lofi.mp3, in an
   <audio> element made on the first click on the turntable and
   looping from there; each click after plays or pauses it. The
   element is the truth about whether it's playing — the media keys
   can stop it too — and the room reads that off record.playing()
   each frame. Where there is no <audio> (the preview tool) the
   record keeps a flag instead, so a frame can still be drawn with
   it on.
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

  /* ── the record ──────────────────────────────────────────── */
  const TRACK = 'public/ambient-lofi.mp3';
  let el = null, flag = false;
  const record = {
    /** Called when the record starts or stops, from a click or from outside — main.js hangs the slate on it. */
    onchange: null,
    /** Is the record playing right now? */
    playing: () => (el ? !el.paused : flag),
    /** Play the record if it's stopped, pause it if it's playing. Returns whether it's playing now. */
    toggle() {
      if (!el && window.Audio) {
        el = new Audio(TRACK); el.loop = true; el.preload = 'auto';
        for (const ev of ['play', 'pause']) el.addEventListener(ev, () => { if (record.onchange) record.onchange(); });
      }
      if (!el) return (flag = !flag);
      if (el.paused) { const p = el.play(); if (p && p.catch) p.catch(() => {}); }   // refused, or the file's missing: it stays paused, and the room sees that
      else el.pause();
      return !el.paused;
    },
  };

  QH.sound = { thunder, record };
})(QH);
