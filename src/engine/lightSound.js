/* ═══════════════════════════════════════════════════════════════
   engine/lightSound.js — sound effects for the lights in the house.

   Each light gets its own sound when it goes on or off, the way each
   one looks. A click — switch, relay or starter, the sound the
   mechanism makes — then whatever it does in the moment after: a
   tungsten filament warming, a bathroom bar light and a neon tube tinking like the LED strip, a CRT flyback whine, a
   stepper motor swinging the spotlights into place. Synthesised in
   Web Audio, the way sound.js does thunder and the three record
   loops — no audio files, no samples.

   Every sound here is short (most under 400 ms, the longest about
   a second), so toggling several lamps in a row never piles up into
   mush. They share one noise buffer and one dynamics compressor on
   the way out, both made on the first user gesture, the same trick
   sound.js uses for the thunder roll. Where Web Audio isn't there
   (the preview tool) every call is a quiet no-op.

   The dispatch — which room's lamp is which kind, and which switch
   name is which kind — lives at the bottom in two small tables.
   main.js hands the function a lamp id (`one`, `two`, …) for the
   four main lamps, or a switch name (`one-strip`, `four-mixer`, …)
   for the wall lights, the PC and the mixer. Anything new plugged
   in elsewhere maps the same way.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, noise = null, out = null;
  const R = () => Math.random() * 2 - 1;                            // a small per-call detune, so two clicks back to back never feel like the same sample

  /** Make the context, the noise buffer and the master on first call. Returns null if Web Audio isn't there. */
  function ready() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      const n = ctx.sampleRate * 2, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;     // two seconds of noise — every click plays a slice of it
      noise = b;
      out = ctx.createDynamicsCompressor();
      out.threshold.value = -16; out.knee.value = 10; out.ratio.value = 4;
      out.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ── primitives ──────────────────────────────────────────────
     Every sound in the file is built from these. Click is a
     filtered noise burst — the universal mechanical impact. Sine
     is a single tone with a quick envelope. Sweep is a sine whose
     frequency ramps. Hum layers a sawtooth (the harmonic series
     of the mains or a transformer) with a low sine, lowpassed,
     with a flat sustain and a small fade in and out. Warble is a
     sine whose frequency wobbles — stepper motors, fluorescent
     flicker, that kind of thing. */

  /** A click: noise through a bandpass at `f` Hz with Q `q`, peaking at `p` and gone in `d` seconds. */
  function click(at, f, q, d, p) {
    const src = ctx.createBufferSource(); src.buffer = noise;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * (1 + R() * 0.04); bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(p, at + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, at + d);
    src.connect(bp); bp.connect(g); g.connect(out);
    src.start(at); src.stop(at + d + 0.02);
  }
  /** A single sine at `f` Hz, peaking at `p` and gone in `d` seconds. */
  function sine(at, f, d, p) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * (1 + R() * 0.01);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(p, at + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, at + d);
    o.connect(g); g.connect(out);
    o.start(at); o.stop(at + d + 0.02);
  }
  /** A sine sweeping linearly from f0 to f1 over `d` seconds, peak p. */
  function sweep(at, f0, f1, d, p) {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f0, at);
    o.frequency.linearRampToValueAtTime(f1, at + d);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(p, at + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, at + d);
    o.connect(g); g.connect(out);
    o.start(at); o.stop(at + d + 0.02);
  }
  /** A hum: a sawtooth at `f` through a lowpass, plus a low sine a fifth below for the body, peaking at `p`, lasting `d` seconds. */
  function hum(at, f, dur, p) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 280; lp.Q.value = 0.6;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 0.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(p, at + 0.04);
    g.gain.setValueAtTime(p, at + dur - 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(lp); lp.connect(g); o2.connect(g); g.connect(out);
    o.start(at); o2.start(at); o.stop(at + dur + 0.04); o2.stop(at + dur + 0.04);
  }
  /** A warble: a sine at `f` whose frequency wobbles `depth` Hz at 25 Hz — stepper motors, fluorescent catch. */
  function warble(at, f, d, p, depth = 14) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 25;
    const lfoG = ctx.createGain(); lfoG.gain.value = depth;
    lfo.connect(lfoG); lfoG.connect(o.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(p, at + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, at + d);
    o.connect(g); g.connect(out);
    o.start(at); lfo.start(at);
    o.stop(at + d + 0.02); lfo.stop(at + d + 0.02);
  }

  /* ── the lights ─────────────────────────────────────────────
     Each entry has an `on()` and an `off()`. Both are short — a
     click then whatever the kind does in the moment after. They
     share `t0` = `ctx.currentTime`, the moment the click handler
     asked for them. */

  /** Room one — the desk lamp. A small adjustable arm with a metal shade and a tungsten bulb. */
  const deskLamp = {
    on() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        2800, 4,   0.012, 0.45);                     // the switch
      sine (t0 + 0.005, 180, 0.10, 0.18);                            // the filament warming
      sine (t0 + 0.05, 1500, 0.10, 0.08);                            // a tiny tink on top — the ring of glass
    },
    off() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        2400, 4,   0.010, 0.32);                     // softer switch
      sine (t0 + 0.02, 2400, 0.10, 0.07);                            // the filament pinging as it cools
    },
  };

  /** Room two — the bedside lamp. The same sound as the desk lamp in room one. */
  const bedsideLamp = deskLamp;

  /** Room three — the bar light over the bathroom mirror. The strip's touch and tink again, a touch brighter for the steel channel. */
  const barLight = {
    on() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        4000, 6,   0.008, 0.18);                     // the touch
      sine (t0 + 0.005, 3000, 0.06, 0.10);                           // a clean tink
    },
    off() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        3200, 6,   0.008, 0.12);                     // softer
      sine (t0 + 0.005, 2200, 0.05, 0.06);
    },
  };

  /** Room four — the truss of stage spotlights. A heavy lattice girder, four cans hung underneath, a stepper motor swinging them into place. */
  const trussSpots = {
    on() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,         700, 2,   0.025, 0.55);                     // the heavy relay
      click(t0 + 0.04, 1100, 3,   0.020, 0.35);                     // a contactor snapping
      warble(t0 + 0.06, 850, 0.30, 0.10, 18);                       // the stepper motor swinging the rig into place
      for (let i = 0; i < 4; i++) click(t0 + 0.18 + i * 0.08, 2200, 5, 0.012, 0.30);   // the four cans firing, one after another
    },
    off() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,         700, 2,   0.025, 0.50);                     // the relay dropping
      for (let i = 0; i < 4; i++) click(t0 + 0.05 + i * 0.06, 2000, 5, 0.010, 0.22);   // the cans going dark one after another
      warble(t0 + 0.06, 700, 0.20, 0.06, 14);                       // the rig swinging home
    },
  };

  /** Room one — the thin LED strip over the poster. A capacitive touch switch. */
  const ledStrip = {
    on() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        4500, 6,   0.008, 0.18);                     // the capacitive touch
      sine (t0 + 0.005, 3200, 0.05, 0.10);                           // a clean high tink
    },
    off() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        3500, 6,   0.008, 0.12);                     // softer
      sine (t0 + 0.005, 2400, 0.04, 0.06);
    },
  };

  /** Room two — a single bent neon tube over the bed. The same recipe as the strip in room one — a touch and a clean tink — pitched a little lower for the bigger tube. */
  const neonSign = {
    on() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        4200, 6,   0.008, 0.18);                     // the touch
      sine (t0 + 0.005, 2800, 0.06, 0.10);                           // a clean tink, a little lower than the strip's
    },
    off() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        3300, 6,   0.008, 0.12);                     // softer
      sine (t0 + 0.005, 2100, 0.05, 0.06);
    },
  };

  /** Room four — four neon tubes, the ring round the stage, the badge on top, the traces in the floor and the strip under the truss, all on one switch. The strip's touch and tink, one tink per tube, in quick order. */
  const neonRigs = {
    on() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        4500, 6,   0.008, 0.18);                     // one touch
      for (let i = 0; i < 4; i++) sine(t0 + 0.005 + i * 0.035, 3200 - i * 150, 0.05, 0.09);   // four tinks, one per tube, stepping down
    },
    off() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        3500, 6,   0.008, 0.12);                     // softer
      for (let i = 0; i < 4; i++) sine(t0 + 0.005 + i * 0.03, 2400 - i * 120, 0.04, 0.05);   // the tubes going dark in order
    },
  };

  /** Room one — the PC monitor on the desk. A button click, then the flyback transformer's whine sweeping down. */
  const monitor = {
    on() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        3500, 5,   0.008, 0.28);                     // the power button
      sweep(t0 + 0.01, 2400,  120, 0.18, 0.12);                     // the flyback whine, high to low
      hum  (t0 + 0.20,   60, 0.45, 0.05);                            // the body settling in
      sine (t0 + 0.21, 1200, 0.04, 0.04);                            // a faint backlight ting
    },
    off() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        3200, 5,   0.008, 0.22);
      sweep(t0 + 0.01, 1000,   60, 0.15, 0.08);                     // the screen settling down
      hum  (t0 + 0.02,   60, 0.18, 0.04);                            // the body fading
    },
  };

  /** Room four — the mixing desk's console. A chunky button, then the LED on top of it lighting up. */
  const mixerDesk = {
    on() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        2000, 5,   0.014, 0.42);                     // the chunky on/off button
      sine (t0 + 0.005, 1100, 0.04, 0.10);                           // the LED coming on, a small beep
      hum  (t0 + 0.03,   80, 0.30, 0.04);                            // the power supply
    },
    off() {
      if (!ready()) return;
      const t0 = ctx.currentTime;
      click(t0,        1800, 5,   0.014, 0.32);
      sine (t0 + 0.005,  900, 0.04, 0.07);
    },
  };

  /* ── dispatch ────────────────────────────────────────────────
     The light kinds, mapped to lamp ids (for the lamps in the
     four rooms) and to switch names (for the wall lights, the PC
     and the mixer). main.js hands the function a lamp id (`one`,
     `two`, …) for the four main lamps, or a switch name
     (`one-strip`, `four-mixer`, …) for everything else. Anything
     new plugged in elsewhere maps the same way. */

  const LAMP_KIND   = { one: 'deskLamp', two: 'bedsideLamp', three: 'barLight', four: 'trussSpots' };
  const SWITCH_KIND = {
    'one-strip':  'ledStrip',
    'one-pc':     'monitor',
    'two-neon':   'neonSign',
    'four-neon':  'neonRigs',
    'four-mixer': 'mixerDesk',
  };
  const KINDS = { deskLamp, bedsideLamp, barLight, trussSpots, ledStrip, neonSign, neonRigs, monitor, mixerDesk };

  /** Play the sound for the lamp in room `id`, going on or off. */
  function playForLamp(id, on) { const k = LAMP_KIND[id]; if (k) KINDS[k][on ? 'on' : 'off'](); }
  /** Play the sound for the wall light on switch `sw`. */
  function playForSwitch(sw, on) { const k = SWITCH_KIND[sw]; if (k) KINDS[k][on ? 'on' : 'off'](); }
  /** Play the sound for any kind by name, on or off. */
  function play(kind, on) { if (KINDS[kind]) KINDS[kind][on ? 'on' : 'off'](); }

  QH.sound.lights = { play, playForLamp, playForSwitch, kinds: KINDS };
})(QH);
