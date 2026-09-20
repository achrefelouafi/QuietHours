/* ═══════════════════════════════════════════════════════════════
   engine/bathSound.js — the sound of the bath in room three.

   A click on the clawfoot tub, or on the shower over it, runs the
   bath: rain falls from the shower head, the tub fills to the top
   over twelve seconds, and then the shower stops. This module is
   the sound of those twelve seconds. Like the rest of the engine —
   thunder, the three record loops, the lamp switches — every sound
   here is synthesised in Web Audio out of noise and sine voices, no
   audio files, no samples. The same shared dynamics compressor on
   the way out, and where there is no Web Audio (the preview tool)
   every call is a quiet no-op.

   What you hear, time-stamped from the click:

     0.00   the valve — a quarter-turn ceramic cartridge, the two
            halves of the disk meeting. A sharp high click, a low
            body thock, and a thin squeal on top.
     0.25   the shower ramps in — three layers of filtered noise:
            the rush of the spray, the fine high mist, and a
            fluttering splash where it breaks on the water
     1.00   the fill — a narrow band of noise climbing from 160 Hz
            to 820 Hz over the twelve seconds, the rising note of a
            vessel filling up
     0.15   the first drops. Each is a brief noise transient (the
            impact) and a damped sine at the water's resonance
            frequency (the "plink"). The pitch tracks the fill
            level: 1100 Hz at empty — drops hitting porcelain —
            easing to 600 Hz as the tub fills, longer resonance,
            more mass.
     0.00   a faint low rumble at 56 Hz, the body of the tub
            vibrating with the water mass, swelling with the fill
     11.4   the valve off — a softer click — and the hiss ramps out
     11.6   four final drips with longer tails, panned
     12.0   a low glug and three soft bubbles — the drain settling

   Drops are panned across the tub with `StereoPannerNode`, with a
   per-drop random intensity, and the gain curve peaks mid-fill —
   drops on dry porcelain are quieter than drops on water. A shared
   feedback delay — input → delay → lowpass → feedback → delay, with
   the same lowpass tapped to a wet gain — gives the drops the slight
   "tile room" tail that places them in the bathroom rather than in a
   vacuum. Each drop has its own oscillator, bandpass, panner and
   gain: a few hundred nodes for the whole bath, scheduled up front
   so they cost nothing at run time.

   main.js hands `fill(at)` the same `at` it hands `b.fill(at)` —
   the performance.now() in ms at the moment of the click. Zero or
   omitted means now. The preview tool can back-date the call so the
   frame at the right second of the fill still draws, even though
   there is no audio there to time against.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const AC = window.AudioContext || window.webkitAudioContext;
  const DUR = 12;                                                      // seconds — matches BATH.ms in roomThree.js
  let ctx = null, noise = null, out = null /* master gain, into the compressor */, delay = null, delayWet = null;
  let running = false;

  /** Make the context, the noise buffer, the master and the shared room delay on first call. Returns null if Web Audio isn't there. */
  function ready() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      const n = ctx.sampleRate * 4, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;       // four seconds of noise — every transient plays a slice of it
      noise = b;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 5;
      comp.connect(ctx.destination);
      out = ctx.createGain(); out.gain.value = 0.32;                    // the whole bath, well under the thunder and the lamps — it runs for twelve seconds
      out.connect(comp);

      // the "tile room" tail — a short feedback delay with a lowpass in
      // the loop so each pass loses a little high end. Drops and the
      // hiss are sent here for the spatial feel of a tiled bathroom.
      delay = ctx.createDelay(0.6);
      delay.delayTime.value = 0.19;
      const delayFb = ctx.createGain(); delayFb.gain.value = 0.34;
      const delayLp = ctx.createBiquadFilter(); delayLp.type = 'lowpass'; delayLp.frequency.value = 2400;
      delay.connect(delayLp); delayLp.connect(delayFb); delayFb.connect(delay);
      delayWet = ctx.createGain(); delayWet.gain.value = 0.40;
      delayLp.connect(delayWet); delayWet.connect(out);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ── primitives ────────────────────────────────────────────── */

  /** A sharp noise click — bandpassed at f Hz with Q q, peaking at p, gone in d seconds. */
  function click(at, f, q, d, p) {
    const src = ctx.createBufferSource(); src.buffer = noise;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(p, at + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, at + d);
    src.connect(bp); bp.connect(g); g.connect(out);
    src.start(at); src.stop(at + d + 0.02);
  }

  /** One drop on water at time `at`: impact noise + damped sine plink, panned, sent to the room delay. */
  function drop(at, freq, intensity, pan) {
    const panNode = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const target = panNode || out;
    if (panNode) panNode.pan.value = Math.max(-1, Math.min(1, pan));

    // the impact — brief highpassed noise burst, the splash transient
    const s = ctx.createBufferSource(); s.buffer = noise;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 4500; bp.Q.value = 1.2;
    const ig = ctx.createGain();
    ig.gain.setValueAtTime(0.0001, at);
    ig.gain.exponentialRampToValueAtTime(intensity * 0.35, at + 0.002);
    ig.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
    s.connect(hp); hp.connect(bp); bp.connect(ig); ig.connect(target);
    s.start(at); s.stop(at + 0.07);

    // the plink — a damped sine at `freq`, the water's resonance
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, at);
    og.gain.exponentialRampToValueAtTime(intensity * 0.55, at + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
    o.connect(og); og.connect(target);
    o.start(at); o.stop(at + 0.26);

    if (panNode) {
      const send = ctx.createGain(); send.gain.value = 0.42 * intensity;
      panNode.connect(send); send.connect(delay);
    }
  }

  /** The "glug" — a low thump + three soft bubble bursts, the drain settling at the end. */
  function glug(at) {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(140, at);
    o.frequency.exponentialRampToValueAtTime(55, at + 0.3);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, at);
    og.gain.exponentialRampToValueAtTime(0.45, at + 0.02);
    og.gain.exponentialRampToValueAtTime(0.0001, at + 0.45);
    o.connect(og); og.connect(out);
    o.start(at); o.stop(at + 0.5);

    for (let i = 0; i < 3; i++) {
      const t = at + 0.06 + i * 0.13;
      const s = ctx.createBufferSource(); s.buffer = noise;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = 550 + i * 180; bp.Q.value = 4;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      s.connect(bp); bp.connect(g); g.connect(out);
      s.start(t); s.stop(t + 0.2);
    }
  }

  /** Seeded RNG so the drops are the same every time the bath runs — the preview tool can replay a frame mid-fill without surprises. */
  function mulberry32(seed) {
    let a = seed | 0;
    return function() {
      a = (a + 0x6D2B79F5) | 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── the bath ─────────────────────────────────────────────── */

  /** Run the bath: `at` is the performance.now() in ms when the shower went on. Zero (or omitted) means now. */
  function fill(at = 0) {
    if (!ready()) return;
    if (running) return;                                                // only one bath at a time
    running = true;

    // `at` is a few ms before now on a real click, and the context may
    // have been made just now with currentTime at 0 — so the naive
    // `currentTime + offset` goes negative and every setValueAtTime
    // throws. Never schedule in the past: start a hair from now.
    const t0 = ctx.currentTime + 0.02;
    const tEnd = t0 + DUR;

    /* 1. VALVE ON — a quarter-turn ceramic cartridge: a high click,
          a body thock, and the thin squeal of the seal. */
    click(t0,         3200, 6,   0.010, 0.55);
    click(t0 + 0.004, 1100, 4,   0.022, 0.40);
    click(t0 + 0.008, 5800, 8,   0.012, 0.22);

    /* 2. SHOWER — the water coming down. Three noise layers, all
          fading in over 0.25s and out over the last half second:
            rush   — the body of the spray, a broad band around 900 Hz
            spray  — the fine high mist, highpassed at 2.5 kHz
            splash — the spray breaking on the water: the rush, with
                     a slow 7 Hz flutter on it, so it isn't a flat hiss
          The rush also feeds the tile-room delay. */
    const shower = (type, f, q, peak, flutter) => {
      const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
      src.loopStart = Math.random() * 2;                               // each layer starts elsewhere in the buffer so they don't phase-lock
      const flt = ctx.createBiquadFilter(); flt.type = type; flt.frequency.value = f; flt.Q.value = q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(peak, t0 + 0.25);
      g.gain.setValueAtTime(peak, t0 + DUR - 0.75);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + DUR - 0.2);
      src.connect(flt); flt.connect(g); g.connect(out);
      if (flutter) {                                                   // a slow wobble on the level — water splattering, not a steady hiss
        const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = flutter;
        const depth = ctx.createGain(); depth.gain.value = peak * 0.35;
        lfo.connect(depth); depth.connect(g.gain);
        lfo.start(t0); lfo.stop(t0 + DUR + 0.05);
      }
      src.start(t0); src.stop(t0 + DUR + 0.05);
      return g;
    };
    const rush = shower('bandpass',  900, 0.6, 0.22, 0);
    shower('highpass', 2500, 0.5, 0.09, 0);
    shower('bandpass', 1400, 1.2, 0.12, 7);
    const rushSend = ctx.createGain(); rushSend.gain.value = 0.5;
    rush.connect(rushSend); rushSend.connect(delay);

    /* 3. THE FILL — the sound of the tub filling up. A narrow band of
          noise whose centre climbs from 160 Hz to 820 Hz across the
          twelve seconds: the air column above the water getting
          shorter as the level rises, the classic rising note of a
          filling vessel. Under it a faint 56 Hz rumble, the tub body
          vibrating with the water mass, swelling with the fill. */
    const fillSrc = ctx.createBufferSource(); fillSrc.buffer = noise; fillSrc.loop = true; fillSrc.loopStart = 1.3;
    const fillBp = ctx.createBiquadFilter(); fillBp.type = 'bandpass'; fillBp.Q.value = 9;
    fillBp.frequency.setValueAtTime(160, t0);
    fillBp.frequency.exponentialRampToValueAtTime(820, t0 + DUR - 0.6);
    const fillBp2 = ctx.createBiquadFilter(); fillBp2.type = 'bandpass'; fillBp2.Q.value = 6;   // the octave above, quieter — gives the note some body
    fillBp2.frequency.setValueAtTime(320, t0);
    fillBp2.frequency.exponentialRampToValueAtTime(1640, t0 + DUR - 0.6);
    const fillG = ctx.createGain();
    fillG.gain.setValueAtTime(0.0001, t0);
    fillG.gain.exponentialRampToValueAtTime(0.035, t0 + 1.0);
    fillG.gain.exponentialRampToValueAtTime(0.09, t0 + DUR - 0.8);    // rises with the level, but stays under the shower
    fillG.gain.exponentialRampToValueAtTime(0.0001, t0 + DUR - 0.2);
    const fillG2 = ctx.createGain(); fillG2.gain.value = 0.25;
    fillSrc.connect(fillBp); fillBp.connect(fillG); fillG.connect(out);                 // dry only — through the room delay it piled up into a drone
    fillSrc.connect(fillBp2); fillBp2.connect(fillG2); fillG2.connect(fillG);
    fillSrc.start(t0); fillSrc.stop(t0 + DUR + 0.05);

    const bodyOsc = ctx.createOscillator(); bodyOsc.type = 'sine'; bodyOsc.frequency.value = 56;
    const bodyG = ctx.createGain();
    bodyG.gain.setValueAtTime(0.0001, t0);
    bodyG.gain.exponentialRampToValueAtTime(0.03, t0 + DUR - 0.8);
    bodyG.gain.exponentialRampToValueAtTime(0.0001, t0 + DUR - 0.2);
    bodyOsc.connect(bodyG); bodyG.connect(out);
    bodyOsc.start(t0); bodyOsc.stop(t0 + DUR + 0.05);

    /* 4. DROPS — scheduled randomly across [0.15, 11.0]s with the
          fill level. Pitch eases from 1100 Hz (drops on porcelain) to
          600 Hz (drops on deep water, longer resonance). Intensity
          peaks mid-fill; panned across the tub. */
    const rng = mulberry32(42);
    let t = 0.15;
    while (t < DUR - 1.0) {
      const fillLevel = t / DUR;
      const f = 1100 - 500 * Math.pow(fillLevel, 0.85);
      const intensity = 0.30 + 0.35 * Math.sin(fillLevel * Math.PI);
      const pan = (rng() - 0.5) * 1.6;
      drop(t0 + t, f, intensity, pan);
      t += 0.05 + rng() * 0.13;                                        // 50–180 ms between drops
    }

    /* 5. VALVE OFF + FINAL DRIPS — the shower closes (a softer click),
          the hiss ramps out, and four drips with longer tails. */
    const tOff = t0 + DUR - 0.6;
    click(tOff,         2800, 5,   0.012, 0.42);
    click(tOff + 0.005, 1100, 4,   0.022, 0.28);
    for (let i = 0; i < 4; i++) {
      drop(tOff + 0.18 + i * 0.20, 720 + i * 60, 0.32, (i - 1.5) * 0.4);
    }

    /* 6. GLUG — final drain/settle at t = DUR. */
    glug(t0 + DUR);

    setTimeout(() => { running = false; }, Math.max(0, (tEnd - ctx.currentTime + 0.5) * 1000));
  }

  QH.sound.bath = { fill };
})(QH);