/* ═══════════════════════════════════════════════════════════════
   main.js — the canvas, the frame loop, and the one input: the
   lamp. Paints the scene into a small offscreen buffer, snaps it
   to the inks, and blits it up pixelated.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { cam, fit } = QH.cam;
  const draw = QH.draw, light = QH.light;
  const scene = QH.scenes.roomOne;

  const view = document.getElementById('stage');
  const stateEl = document.getElementById('state');
  const PIXEL = 3;                                   // css px per rendered px — the chunkiness dial
  const buf = document.createElement('canvas');
  const bctx = buf.getContext('2d', { willReadFrequently: true });
  const vctx = view.getContext('2d');
  let iw = 0, ih = 0, hot = false, lampOn = true;

  function size() {
    const w = view.clientWidth || 800, h = view.clientHeight || 600;
    iw = Math.max(160, Math.round(w / PIXEL));
    ih = Math.max(120, Math.round(h / PIXEL));
    buf.width = iw; buf.height = ih;
    view.width = iw; view.height = ih;
    view.style.width = w + 'px'; view.style.height = h + 'px';
    home();
  }
  function home() { fit(scene.room.W, scene.room.D, scene.room.H, iw, ih, 8); }

  function frame(ms) {
    const t = ms / 1000;
    light.ease();
    draw.use(bctx);
    bctx.globalCompositeOperation = 'source-over';
    bctx.fillStyle = draw.rgb(M.outside);
    bctx.fillRect(0, 0, iw, ih);
    scene.draw(t);
    scene.lights(t);
    const snap = bctx.getImageData(0, 0, iw, ih);
    QH.inks.quantise(snap, iw, ih);
    vctx.putImageData(snap, 0, 0);
  }

  /* input — the lamp is the only thing in the room you can touch */
  function overLamp(cx, cy) {
    const L = scene.lamp();
    if (!L) return false;
    const bx = cx * iw / (view.clientWidth || iw * PIXEL), by = cy * ih / (view.clientHeight || ih * PIXEL);
    if ((bx - L.head[0]) ** 2 + (by - L.head[1]) ** 2 < L.r * L.r) return true;
    const [a, b] = L.stem;
    const len = ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) || 1;
    const t = QH.clamp(((bx - a[0]) * (b[0] - a[0]) + (by - a[1]) * (b[1] - a[1])) / len, 0, 1);
    const qx = a[0] + (b[0] - a[0]) * t, qy = a[1] + (b[1] - a[1]) * t;
    return (bx - qx) ** 2 + (by - qy) ** 2 < L.stemR * L.stemR;
  }
  function setLamp(on) {
    lampOn = on;
    light.target = on ? 1 : 0;
    stateEl.textContent = on ? 'lamp on' : 'lamp off';
  }

  view.addEventListener('pointermove', e => {
    const r = view.getBoundingClientRect();
    const h = overLamp(e.clientX - r.left, e.clientY - r.top);
    if (h !== hot) { hot = h; view.classList.toggle('hot', hot); }
  });
  view.addEventListener('pointerleave', () => { hot = false; view.classList.remove('hot'); });
  view.addEventListener('pointerdown', e => {
    const r = view.getBoundingClientRect();
    if (overLamp(e.clientX - r.left, e.clientY - r.top)) setLamp(!lampOn);
  });
  view.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'l') { setLamp(!lampOn); e.preventDefault(); }
  });

  /* loop — capped, and honest about reduced motion */
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = 0;
  function loop(ms) {
    if (ms - last > 33) { frame(still ? 4200 : ms); last = ms; }
    requestAnimationFrame(loop);
  }
  addEventListener('resize', size);
  size();
  requestAnimationFrame(loop);

  /* exposed so tools/preview.js can render a frame outside the browser */
  QH.app = { frame, size, home, cam, setLamp: on => { setLamp(on); light.lamp = light.target; } };
})(QH);
