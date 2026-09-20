/* ═══════════════════════════════════════════════════════════════
   engine/sound.js — the sounds in the house: thunder, the record on
   the turntable downstairs, and two HUD-only test loops — a 10s lofi
   chord pad and a 10s drum pattern at 96 BPM.

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

   The lofi pad and the drum loop are both 10-second AudioBuffers
   rendered once on first toggle and played with loop=true. They
   share an epoch — the audio time at which the loop conceptually
   started — so whichever one you toggle on second joins the other
   in phase. 96 BPM gives exactly 4 bars × 2.5 s = 10 s, so the
   kick on beat 1 of every bar lines up with the chord change.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, noise = null, out = null, loopEpoch = null;

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

  /** The lofi pad and the drum loop share one 10-second epoch — the
  audio time at which their loops conceptually started — so whichever
  is toggled second joins the other in phase. Returns `when` and
  `offset` for `BufferSource.start(when, offset)`. */
  function getLoopStart() {
    if (loopEpoch === null) loopEpoch = ctx.currentTime;
    const elapsed = ctx.currentTime - loopEpoch;
    const offset = elapsed < 0 ? 0 : elapsed % LOFI.dur;
    return { when: ctx.currentTime, offset };
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

  /* ── the lofi loop ───────────────────────────────────────────
     A 10-second chord pad, rendered into an AudioBuffer once on
     first toggle and played with loop=true. Four chords, each a
     bar of 2.5s, the chord 4 release meeting the chord 1 attack
     at zero amplitude so the seam is inaudible. Two sines per
     note — one straight, one a hair sharp — give a chorus warmth;
     a low-pass softens the highs; a soft tape hiss underneath.

     Lofi progression:
       Dm9     (0.0–2.5s)  D3 F3 A3 C4 E4
       Gm9     (2.5–5.0s)  G3 Bb3 D4 F4 A4
       Cmaj7   (5.0–7.5s)  C3 E3 G3 B3
       Fmaj7   (7.5–10.0s) F3 A3 C4 E4
  */
  const LOFI = {
    dur: 12,
    chords: [
      { at: 0.0, notes: [146.83, 174.61, 220.00, 261.63, 329.63] },      // Dm9:    D3 F3 A3 C4 E4
      { at: 3.0, notes: [196.00, 233.08, 293.66, 349.23, 440.00] },      // Gm9:    G3 Bb3 D4 F4 A4
      { at: 6.0, notes: [130.81, 164.81, 196.00, 246.94, 293.66] },      // Cmaj9:  C3 E3 G3 B3 D4
      { at: 9.0, notes: [174.61, 220.00, 261.63, 329.63, 392.00] },      // Fmaj9:  F3 A3 C4 E4 G4
    ],
  };
  function makeLofiBuffer() {
    const sr = ctx.sampleRate, n = sr * LOFI.dur;
    const buf = ctx.createBuffer(1, n, sr);
    const d = buf.getChannelData(0);
    const atk = 0.4, sus = 1.6, rel = 0.5;                              // 0.4 + 1.6 + 0.5 = 2.5 — each chord's full length
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      let s = 0;
      for (const c of LOFI.chords) {
        const u = t - c.at;
        if (u < 0 || u > atk + sus + rel) continue;
        let env;
        if (u < atk) env = u / atk;                                     // attack
        else if (u < atk + sus) env = 1;                                // sustain
        else env = 1 - (u - atk - sus) / rel;                           // release — meets the next chord at 0
        for (const f of c.notes) {
          s += Math.sin(2 * Math.PI * f * t) * env;                     // the voice
          s += Math.sin(2 * Math.PI * f * 1.005 * t) * env * 0.7;       // a hair sharp — chorus warmth
        }
      }
      s += (Math.random() * 2 - 1) * 0.012;                             // tape hiss
      d[i] = Math.tanh(s * 0.16) * 0.55;                                // soft saturation, headroom
    }
    return buf;
  }
  const lofi = {
    src: null, g: null, on: false,
    /** Play the lofi loop if it's stopped, silence it if it's playing. Returns whether it's on now. */
    toggle() {
      if (!ready()) return false;
      if (!this.src) {                                                  // build the graph once, on the first user gesture
        const { when, offset } = getLoopStart();                       // join the drum loop in phase, if it's already going
        this.src = ctx.createBufferSource();
        this.src.buffer = makeLofiBuffer();
        this.src.loop = true;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = 0.7;
        this.g = ctx.createGain(); this.g.gain.value = 0;               // start silent, fade in
        this.src.connect(lp); lp.connect(this.g); this.g.connect(out);
        this.src.start(when, offset);
      }
      this.on = !this.on;
      this.g.gain.cancelScheduledValues(ctx.currentTime);
      this.g.gain.setTargetAtTime(this.on ? 0.45 : 0, ctx.currentTime, 0.25);
      return this.on;
    },
    /** Is the lofi loop playing right now? */
    playing: () => lofi.on,
  };

  /* ── the drum loop ────────────────────────────────────────────
     Same 10-second loop as the pad. At 96 BPM, 4 bars fit in 10 s
     exactly, so the kick on beat 1 lines up with each chord change.

     Pattern per bar (8 hits on every 8th note):
       kick  on beats 1 and 3
       snare on beats 2 and 4, plus a ghost on the "and of 2" in bar 2
       hat   closed on every 8th, slightly swung
       ohat  on the "and of 4" in bars 2 and 4

     Synthesis per hit, no samples:
       kick  — sine sweep 80 → 35 Hz, exp decay, beater click
       snare — filtered noise + 180 Hz tone, exp decay
       hat   — high noise burst, ~60 ms
       ohat  — high noise burst, longer tail

     Independent toggle from lofi so each can be played alone or
     together; both share the dynamics compressor on the way out.
  */
  function writeKick(d, sr, start, vel) {
    const len = Math.min(Math.floor(0.32 * sr), d.length - start);
    if (len <= 0) return;
    let phase = 0;
    const clickLen = Math.floor(0.004 * sr);
    for (let i = 0; i < len; i++) {
      const u = i / sr;
      const f = 35 + 45 * Math.exp(-u / 0.04);                         // 80 → 35 Hz, fast drop
      phase += 2 * Math.PI * f / sr;
      const env = Math.exp(-u / 0.08);
      const click = i < clickLen ? (Math.random() * 2 - 1) * 0.3 : 0;
      d[start + i] += (Math.sin(phase) * env + click) * vel;
    }
  }
  function writeSnare(d, sr, start, vel) {
    const len = Math.min(Math.floor(0.18 * sr), d.length - start);
    if (len <= 0) return;
    let phase = 0;
    for (let i = 0; i < len; i++) {
      const u = i / sr;
      const env = Math.exp(-u / 0.05);
      const noise = Math.random() * 2 - 1;
      phase += 2 * Math.PI * 180 / sr;
      const tone = Math.sin(phase) * 0.4;
      d[start + i] += (noise * 0.7 + tone) * env * vel;
    }
  }
  function writeHat(d, sr, start, vel) {
    const len = Math.min(Math.floor(0.06 * sr), d.length - start);
    if (len <= 0) return;
    for (let i = 0; i < len; i++) {
      const u = i / sr;
      const env = Math.exp(-u / 0.018);
      d[start + i] += (Math.random() * 2 - 1) * env * vel * 0.5;
    }
  }
  function writeOHat(d, sr, start, vel) {
    const len = Math.min(Math.floor(0.25 * sr), d.length - start);
    if (len <= 0) return;
    for (let i = 0; i < len; i++) {
      const u = i / sr;
      const env = Math.exp(-u / 0.1);
      d[start + i] += (Math.random() * 2 - 1) * env * vel * 0.45;
    }
  }
  function makeDrumsBuffer() {
    const sr = ctx.sampleRate, n = sr * LOFI.dur;
    const buf = ctx.createBuffer(1, n, sr);
    const d = buf.getChannelData(0);
    const beat = 0.75;                                                 // 80 BPM — 4 bars × 3 s = 12 s exactly, classic lofi tempo
    const swing = 0.012;                                               // 12 ms — the lofi shuffle on the off-beats
    for (let bar = 0; bar < 4; bar++) {
      const off = bar * 4 * beat;
      writeKick(d, sr, Math.round((off + 0 * beat) * sr), 1.0);
      writeKick(d, sr, Math.round((off + 2 * beat) * sr), 0.95);
      writeSnare(d, sr, Math.round((off + 1 * beat) * sr), 1.0);
      writeSnare(d, sr, Math.round((off + 3 * beat) * sr), 0.95);
      for (let i = 0; i < 4; i++) {                                    // closed hat on every quarter — sparser, less busy
        const t = off + i * beat + (i % 2 ? swing : 0);
        const v = i % 2 === 0 ? 0.7 : 0.45;
        writeHat(d, sr, Math.round(t * sr), v);
      }
      if (bar === 1 || bar === 3) writeOHat(d, sr, Math.round((off + 3.5 * beat + swing) * sr), 0.5);
      if (bar === 1) writeSnare(d, sr, Math.round((off + 1.5 * beat + swing) * sr), 0.35);   // the ghost — the lofi tell
    }
    for (let i = 0; i < n; i++) d[i] = Math.tanh(d[i] * 1.2) * 0.5;   // soft saturation, headroom
    return buf;
  }
  const drums = {
    src: null, g: null, on: false,
    /** Play the drum loop if it's stopped, silence it if it's playing. Returns whether it's on now. */
    toggle() {
      if (!ready()) return false;
      if (!this.src) {
        const { when, offset } = getLoopStart();                       // join the lofi pad in phase, if it's already going
        this.src = ctx.createBufferSource();
        this.src.buffer = makeDrumsBuffer();
        this.src.loop = true;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7500; lp.Q.value = 0.6;
        this.g = ctx.createGain(); this.g.gain.value = 0;
        this.src.connect(lp); lp.connect(this.g); this.g.connect(out);
        this.src.start(when, offset);
      }
      this.on = !this.on;
      this.g.gain.cancelScheduledValues(ctx.currentTime);
      this.g.gain.setTargetAtTime(this.on ? 0.55 : 0, ctx.currentTime, 0.12);
      return this.on;
    },
    /** Are the drums playing right now? */
    playing: () => drums.on,
  };

  /* ── the piano loop ────────────────────────────────────────────
     Same 10-second loop, locked to the pad and drums. Eight arpeggio
     notes per bar (every 8th), four bars of 2.5s, following the chord
     tones of LOFI.chords (which is why every chord there is a
     chord now — the pattern needs a fifth tone).

     Per note, additive synthesis with six inharmonic partials, each
     with its own decay rate — the higher ones die faster, like a
     real piano string. A 5 ms attack and a 3 ms hammer transient
     sit on top.

     Pattern within each bar (8 8th notes, off-beats swung):
       i:    0  1  2  3  4  5  6  7
       tone: 1  3  5  7  9  5  3  1
       vel:  5  3  4  3  5  3  4  3  (×0.1)
  */
  const PARTIALS = [
    { ratio: 1.0, gain: 0.5,  decay: 0.6 },                              // fundamental — longest ring
    { ratio: 2.0, gain: 0.3,  decay: 0.4 },
    { ratio: 3.0, gain: 0.18, decay: 0.25 },
    { ratio: 4.0, gain: 0.1,  decay: 0.15 },
    { ratio: 5.0, gain: 0.06, decay: 0.1 },
    { ratio: 6.0, gain: 0.03, decay: 0.08 },                             // upper partials — die quick
  ];
  const STRETCH = [1.0, 1.003, 1.008, 1.015, 1.024, 1.035];             // inharmonic stretch — string stiffness
  function writePianoNote(d, sr, start, freq, vel) {
    const dur = 0.5;                                                    // each note rings ~3 16ths, so they overlap
    const len = Math.min(Math.floor(dur * sr), d.length - start);
    if (len <= 0) return;
    const phases = PARTIALS.map(() => 0);
    const hammerLen = Math.floor(0.003 * sr);
    for (let i = 0; i < len; i++) {
      const u = i / sr;
      let s = 0;
      for (let p = 0; p < PARTIALS.length; p++) {
        const part = PARTIALS[p];
        const f = freq * part.ratio * STRETCH[p];
        phases[p] += 2 * Math.PI * f / sr;
        const env = u < 0.005 ? u / 0.005 : Math.exp(-(u - 0.005) / part.decay);
        s += Math.sin(phases[p]) * part.gain * env;
      }
      const hammer = i < hammerLen ? (Math.random() * 2 - 1) * 0.12 : 0;
      d[start + i] += (s + hammer) * vel;
    }
  }
  function makePianoBuffer() {
    const sr = ctx.sampleRate, n = sr * LOFI.dur;
    const buf = ctx.createBuffer(1, n, sr);
    const d = buf.getChannelData(0);
    const beat = 0.75;                                                 // 80 BPM — matches the drums
    const step = beat / 2;                                             // 8th note — sparser, sits behind the pad
    const swing = 0.012;
    const PAT  = [0, 1, 2, 3, 4, 2, 1, 0];                             // which chord tone to play
    const VELS = [0.5, 0.3, 0.4, 0.3, 0.5, 0.35, 0.4, 0.3];           // softer than the first cut — the downbeat still leads
    for (let bar = 0; bar < 4; bar++) {
      const off = bar * 4 * beat;
      const chord = LOFI.chords[bar].notes;
      for (let i = 0; i < 8; i++) {
        const f = chord[PAT[i]];
        const t = off + i * step + (i % 2 ? swing : 0);
        writePianoNote(d, sr, Math.round(t * sr), f, VELS[i]);
      }
    }
    for (let i = 0; i < n; i++) d[i] = Math.tanh(d[i] * 1.2) * 0.55;  // soft saturation, headroom
    return buf;
  }
  const piano = {
    src: null, g: null, on: false,
    /** Play the piano loop if it's stopped, silence it if it's playing. Returns whether it's on now. */
    toggle() {
      if (!ready()) return false;
      if (!this.src) {
        const { when, offset } = getLoopStart();                       // join lofi / drums in phase
        this.src = ctx.createBufferSource();
        this.src.buffer = makePianoBuffer();
        this.src.loop = true;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3500; lp.Q.value = 0.6;
        this.g = ctx.createGain(); this.g.gain.value = 0;
        this.src.connect(lp); lp.connect(this.g); this.g.connect(out);
        this.src.start(when, offset);
      }
      this.on = !this.on;
      this.g.gain.cancelScheduledValues(ctx.currentTime);
      this.g.gain.setTargetAtTime(this.on ? 0.22 : 0, ctx.currentTime, 0.2);
      return this.on;
    },
    /** Is the piano loop playing right now? */
    playing: () => piano.on,
  };

  QH.sound = { thunder, record, lofi, drums, piano };
})(QH);
