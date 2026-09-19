/* ═══════════════════════════════════════════════════════════════
   engine/storm.js — the lightning outside a window.

   Each window that can be struck keeps one of these. strike()
   starts a flash; flash() is how bright it is right now, 0..1,
   read off a few keyframes from the moment of the strike — the
   first stroke, a dip, the return stroke, the fade, three-quarters
   of a second in all — and that one number is what the window,
   the room's faces and its glows all read. Thunder follows a beat
   later. Under reduced motion the flicker is one soft swell.

   QH.storm() → { strike(at), flash(), busy(), seed }
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const { lerp } = QH;
  const STILL = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEYS = STILL ? [[0, 0], [0.2, 0.7], [1.0, 0]]                                          // [seconds since the strike, brightness]
                     : [[0, 1], [0.08, 1], [0.16, 0.2], [0.22, 0.9], [0.3, 0.45], [0.75, 0]];
  const LEN = KEYS[KEYS.length - 1][0] * 1000;
  const now = () => performance.now();

  QH.storm = () => {
    const s = { start: -1e9, seed: 0 };
    return {
      /** Lightning now — or from `at`, in ms as performance.now() gives it. */
      strike(at = now()) {
        s.start = at;
        s.seed++;                                                     // a new bolt each time
        QH.sound.thunder(0.5 + Math.random() * 0.7);
      },
      /** How bright the lightning is right now, 0..1. */
      flash() {
        const t = (now() - s.start) / 1000;
        if (t < 0) return 0;
        for (let i = 1; i < KEYS.length; i++) {
          const [t0, v0] = KEYS[i - 1], [t1, v1] = KEYS[i];
          if (t <= t1) return lerp(v0, v1, (t - t0) / (t1 - t0));
        }
        return 0;
      },
      /** Is the flash still going, wanting every frame? */
      busy: () => now() - s.start < LEN + 50,
      /** Which bolt this is — a new number every strike, so the window draws a new one. */
      get seed() { return s.seed; },
    };
  };
})(QH);
