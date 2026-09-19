/* ═══════════════════════════════════════════════════════════════
   main.js — the canvas, the frame loop, the camera and the few
   things you can touch: each room's lamp (in room three, the bar
   light over the mirror), the strip light in room one, the neon
   sign and the blind over the window in room two. Paints the scene
   into a small offscreen buffer, snaps it to the inks, and blits
   it up pixelated.

   The page never scrolls. The canvas is the whole viewport and
   the camera does the moving: drag to pan (with a fling), wheel
   or pinch to zoom about the pointer, arrows / WASD / + - 0 on
   the keyboard, 1, 2 and 3 to fly to a room, double-click to
   lean in and back out.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { clamp, lerp } = QH;
  const { cam, fitBox } = QH.cam;
  const draw = QH.draw, light = QH.light;
  const scene = QH.scenes.house;

  const view = document.getElementById('stage');
  const stateEl = document.getElementById('state');
  const PIXEL = 3;                                   // css px per rendered px — the chunkiness dial
  const MIN = 0.35, MAX = 6;                         // zoom, relative to the fitted room
  const buf = document.createElement('canvas');
  const bctx = buf.getContext('2d', { willReadFrequently: true });
  const vctx = view.getContext('2d');
  let iw = 0, ih = 0, w = 0, h = 0, hot = null;

  /* ── camera ──────────────────────────────────────────────────
     `eye` is the scene point (projection at s = 1) sitting at the
     centre of the screen, and how far in we are over the fitted
     scale `s0`. look() turns that into the engine's cam each frame. */
  const eye = { x: 0, y: 0, zoom: 1 };
  const home = { x: 0, y: 0 };
  let s0 = 12, tween = null, velocity = { x: 0, y: 0 }, lastMove = -1e9, placed = false;

  function look() {
    cam.s = s0 * eye.zoom;
    cam.x = iw / 2 - eye.x * cam.s;
    cam.y = ih / 2 - eye.y * cam.s;
  }
  /** css px on the canvas → buffer px. */
  const toBuf = (cx, cy) => [cx * iw / (w || 1), cy * ih / (h || 1)];
  /** css px on the canvas → scene units. */
  function toScene(cx, cy) {
    look();                                          // the eye may have moved since the last frame
    const [bx, by] = toBuf(cx, cy);
    return { x: (bx - cam.x) / cam.s, y: (by - cam.y) / cam.s };
  }
  /** Zoom so that scene point `a` stays under css px (cx, cy). */
  function zoomAbout(zoom, a, cx, cy) {
    eye.zoom = clamp(zoom, MIN, MAX);
    const s = s0 * eye.zoom, [bx, by] = toBuf(cx, cy);
    eye.x = a.x - (bx - iw / 2) / s;
    eye.y = a.y - (by - ih / 2) / s;
  }
  function moveCamera(to, ms) {
    to.zoom = clamp(to.zoom, MIN, MAX);
    velocity = { x: 0, y: 0 };
    if (ms <= 0) { Object.assign(eye, to); tween = null; look(); return; }
    tween = { from: { ...eye }, to, start: performance.now(), ms };
  }
  const interrupt = () => { tween = null; lastMove = performance.now(); };
  const moving = now => tween !== null || pointers.size > 0 || now - lastMove < 200
    || Math.abs(velocity.x) + Math.abs(velocity.y) > 1e-5 || scene.busy();

  function size() {
    w = Math.max(1, innerWidth); h = Math.max(1, innerHeight);
    iw = Math.max(160, Math.round(w / PIXEL));
    ih = Math.max(120, Math.round(h / PIXEL));
    buf.width = iw; buf.height = ih;
    view.width = iw; view.height = ih;
    view.style.width = w + 'px'; view.style.height = h + 'px';
    // fit the whole house, then remember that as "home" — the eye keeps its place across resizes
    fitBox(scene.bounds, iw, ih, 8);
    s0 = cam.s;
    home.x = (iw / 2 - cam.x) / s0;
    home.y = (ih / 2 - cam.y) / s0;
    if (!placed) { placed = true; Object.assign(eye, { x: home.x, y: home.y, zoom: 1 }); }
    look();
  }
  const goHome = ms => moveCamera({ x: home.x, y: home.y, zoom: 1 }, ms);
  /** Fly to one room: centre it and zoom until it fills the view. */
  function goRoom(id, ms) {
    const r = scene.rooms.find(r => r.id === id); if (!r) return;
    const b = scene.boundsOf(r);
    const zoom = Math.min((iw - 16) / (b.x1 - b.x0), (ih - 16) / (b.y1 - b.y0)) / s0;
    moveCamera({ x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, zoom }, ms);
  }
  /** The room whose centre is nearest the eye — the one you're looking at. */
  function roomInView() {
    let best = null, bd = Infinity;
    for (const r of scene.rooms) {
      const b = scene.boundsOf(r), d = Math.hypot((b.x0 + b.x1) / 2 - eye.x, (b.y0 + b.y1) / 2 - eye.y);
      if (d < bd) { bd = d; best = r; }
    }
    return best;
  }

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

  /* ── the lamps ────────────────────────────────────────────── */
  function hits(L, bx, by) {
    if (!L) return false;
    if ((bx - L.head[0]) ** 2 + (by - L.head[1]) ** 2 < L.r * L.r) return true;
    const [a, b] = L.stem;
    const len = ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) || 1;
    const t = clamp(((bx - a[0]) * (b[0] - a[0]) + (by - a[1]) * (b[1] - a[1])) / len, 0, 1);
    const qx = a[0] + (b[0] - a[0]) * t, qy = a[1] + (b[1] - a[1]) * t;
    return (bx - qx) ** 2 + (by - qy) ** 2 < L.stemR * L.stemR;
  }
  /** Is (bx, by) within r of the screen polyline `line`? */
  function nearLine(line, r, bx, by) {
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1], b = line[i];
      const len = ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) || 1;
      const t = clamp(((bx - a[0]) * (b[0] - a[0]) + (by - a[1]) * (b[1] - a[1])) / len, 0, 1);
      const qx = a[0] + (b[0] - a[0]) * t, qy = a[1] + (b[1] - a[1]) * t;
      if ((bx - qx) ** 2 + (by - qy) ** 2 < r * r) return true;
    }
    return false;
  }
  /** Which room's lamp is under this css point, or null. */
  function overLamp(cx, cy) {
    const [bx, by] = toBuf(cx, cy);
    for (const l of scene.lamps()) if (hits(l.geo, bx, by)) return l.id;
    return null;
  }
  /** The slate: each room's lamp, and the strip or neon where there is one. */
  function showState() {
    stateEl.textContent = scene.rooms.map(r => r.name + ' · lamp ' + (light.isOn(r.id) ? 'on' : 'off')
      + wallLights().filter(n => n.id === r.id).map(n => ' · ' + n.kind + ' ' + (light.isOn(n.sw) ? 'on' : 'off')).join('')).join(String.fromCharCode(10));
  }
  function setLamp(id, on) { light.set(id, on); showState(); }
  const toggleLamp = id => setLamp(id, !light.isOn(id));

  /* ── the wall lights: the neon and the strip ──────────────── */
  /** Every light on a wall, each { id, name, kind, geo, sw } — both are a line you can click. */
  const wallLights = () => [...scene.neons(), ...scene.strips()];
  /** The neon sign or strip light under this css point, or null. */
  function overNeon(cx, cy) {
    const [bx, by] = toBuf(cx, cy);
    for (const n of wallLights()) if (n.geo && nearLine(n.geo.line, n.geo.r, bx, by)) return n;
    return null;
  }
  function setNeon(sw, on) { light.set(sw, on); showState(); }
  const toggleNeon = sw => setNeon(sw, !light.isOn(sw));
  /** Switch the neon (or strip, as asked) in this room, if it has one. */
  const toggleNeonIn = (id, kind = 'neon') => { const n = wallLights().find(n => n.id === id && n.kind === kind); if (n) toggleNeon(n.sw); };

  /* ── the blinds ───────────────────────────────────────────── */
  /** Is (bx, by) inside this convex quad of screen points? */
  function inQuad(q, bx, by) {
    if (!q) return false;
    let sign = 0;
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = q[i], [cx, cy] = q[(i + 1) % 4];
      const cross = (cx - ax) * (by - ay) - (cy - ay) * (bx - ax);
      if (cross === 0) continue;
      if (sign === 0) sign = Math.sign(cross); else if (Math.sign(cross) !== sign) return false;
    }
    return true;
  }
  /** Which room's blind is under this css point, or null. */
  function overBlind(cx, cy) {
    const [bx, by] = toBuf(cx, cy);
    for (const b of scene.blinds()) if (inQuad(b.geo && b.geo.quad, bx, by)) return b;
    return null;
  }
  /** What's under this css point that you can touch: 'lamp', 'neon', 'blind' or null. */
  const overThing = (cx, cy) => overLamp(cx, cy) ? 'lamp' : overNeon(cx, cy) ? 'neon' : overBlind(cx, cy) ? 'blind' : null;
  const toggleBlind = id => { const b = scene.blinds().find(b => b.id === id); if (b) b.toggle(); };

  /* ── pointer: drag to pan, pinch to zoom, a still tap hits the lamp ── */
  const pointers = new Map();
  let drag = null, pinch = null, press = null;

  view.addEventListener('pointerdown', e => {
    interrupt(); e.preventDefault();
    view.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    velocity = { x: 0, y: 0 };
    drag = { x: e.clientX, y: e.clientY, t: performance.now() };
    press = pointers.size === 1 ? { x: e.clientX, y: e.clientY, t: performance.now(), far: false } : null;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: eye.zoom, anchor: toScene((a.x + b.x) / 2, (a.y + b.y) / 2) };
    }
    hot = null; view.classList.remove('hot'); view.classList.add('drag');
  });
  view.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) {
      const on = overThing(e.clientX, e.clientY);
      if (on !== hot) { hot = on; view.classList.toggle('hot', !!hot); }
      return;
    }
    interrupt();
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 4) press.far = true;
    if (pointers.size >= 2 && pinch) {
      const [a, b] = [...pointers.values()];
      zoomAbout(pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, pinch.d), pinch.anchor, (a.x + b.x) / 2, (a.y + b.y) / 2);
      return;
    }
    if (!drag) return;
    const now = performance.now(), dx = e.clientX - drag.x, dy = e.clientY - drag.y, dt = Math.max(8, now - drag.t);
    const k = 1 / (PIXEL * cam.s);                   // css px → scene units
    eye.x -= dx * k; eye.y -= dy * k;
    velocity.x = lerp(velocity.x, -dx * k / dt, 0.6);
    velocity.y = lerp(velocity.y, -dy * k / dt, 0.6);
    drag = { x: e.clientX, y: e.clientY, t: now };
  });
  const up = e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size) {
      pinch = null; press = null;
      const p = [...pointers.values()][0];
      drag = { x: p.x, y: p.y, t: performance.now() };
      return;
    }
    if (press && !press.far && performance.now() - press.t < 400) {
      const id = overLamp(e.clientX, e.clientY), n = id ? null : overNeon(e.clientX, e.clientY);
      const b = id || n ? null : overBlind(e.clientX, e.clientY);
      if (id) toggleLamp(id); else if (n) toggleNeon(n.sw); else if (b) b.toggle();
    }
    if (!drag || performance.now() - drag.t > 90) velocity = { x: 0, y: 0 };
    drag = null; pinch = null; press = null;
    view.classList.remove('drag');
    interrupt();
  };
  view.addEventListener('pointerup', up);
  view.addEventListener('pointercancel', up);
  view.addEventListener('pointerleave', () => { hot = null; view.classList.remove('hot'); });

  /* ── wheel: zoom about the pointer ────────────────────────── */
  view.addEventListener('wheel', e => {
    e.preventDefault(); interrupt();
    velocity = { x: 0, y: 0 };
    const d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? h : 1);
    zoomAbout(eye.zoom * Math.exp(-clamp(d, -600, 600) * 0.0015), toScene(e.clientX, e.clientY), e.clientX, e.clientY);
  }, { passive: false });

  /* ── double-click: lean in on that spot, or back out to the whole room ── */
  view.addEventListener('dblclick', e => {
    e.preventDefault();
    if (eye.zoom > 1.5) return goHome(1100);
    const a = toScene(e.clientX, e.clientY);
    moveCamera({ x: a.x, y: a.y, zoom: 2.6 }, 1100);
  });

  /* ── keys ─────────────────────────────────────────────────── */
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase(), step = 120 / (PIXEL * cam.s);
    if (k === 'arrowleft' || k === 'a') { interrupt(); eye.x -= step; }
    else if (k === 'arrowright' || k === 'd') { interrupt(); eye.x += step; }
    else if (k === 'arrowup' || k === 'w') { interrupt(); eye.y -= step; }
    else if (k === 'arrowdown' || k === 's') { interrupt(); eye.y += step; }
    else if (k === '+' || k === '=') { interrupt(); zoomAbout(eye.zoom * 1.2, toScene(w / 2, h / 2), w / 2, h / 2); }
    else if (k === '-' || k === '_') { interrupt(); zoomAbout(eye.zoom / 1.2, toScene(w / 2, h / 2), w / 2, h / 2); }
    else if (k === '0') goHome(900);
    else if (k === '1' || k === '2' || k === '3') goRoom({ 1: 'one', 2: 'two', 3: 'three' }[k], 1100);
    else if (k === 'enter' || k === ' ' || k === 'l') toggleLamp(roomInView().id);
    else if (k === 'b') toggleBlind(roomInView().id);
    else if (k === 'n') toggleNeonIn(roomInView().id);
    else if (k === 't') toggleNeonIn(roomInView().id, 'strip');
    else return;
    e.preventDefault();
  });
  addEventListener('resize', size);

  /* ── loop: every frame while the camera moves, otherwise ~30fps
     for the ambient animation; honest about reduced motion ──── */
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = 0, lastNow = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (innerWidth !== w || innerHeight !== h) size();
    const dt = lastNow ? Math.min(64, now - lastNow) : 16.7;
    lastNow = now;
    if (tween) {
      const u = clamp((now - tween.start) / tween.ms, 0, 1);
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      // a small lift on the way — the camera pulls back a touch mid-flight, more for longer trips
      const lift = Math.sin(u * Math.PI) * Math.min(0.35, Math.hypot(tween.to.x - tween.from.x, tween.to.y - tween.from.y) / 60);
      eye.x = lerp(tween.from.x, tween.to.x, e);
      eye.y = lerp(tween.from.y, tween.to.y, e);
      eye.zoom = lerp(tween.from.zoom, tween.to.zoom, e) * (1 - lift);
      if (u >= 1) tween = null;
    } else if (!pointers.size) {
      eye.x += velocity.x * dt; eye.y += velocity.y * dt;
      const decay = Math.exp(-dt / 200);
      velocity.x *= decay; velocity.y *= decay;
      if (Math.abs(velocity.x) + Math.abs(velocity.y) < 1e-5) velocity.x = velocity.y = 0;
    }
    eye.zoom = clamp(eye.zoom, MIN, MAX);
    look();
    if (moving(now) || now - last > 33) { frame(still ? 4200 : now); last = now; }
  }
  size();
  setLamp('one', true);
  requestAnimationFrame(loop);

  /* exposed so tools/preview.js can render a frame outside the browser */
  QH.app = {
    frame, size, home: () => goHome(0), room: id => goRoom(id, 0), look, eye, cam,
    setLamp: (on, id) => { for (const r of scene.rooms) if (!id || r.id === id) { setLamp(r.id, on); light.switch(r.id).v = on ? 1 : 0; } },
    setNeon: (on, id) => { for (const n of scene.neons()) if (!id || n.id === id) { setNeon(n.sw, on); light.switch(n.sw).v = on ? 1 : 0; } },
    setStrip: (on, id) => { for (const n of scene.strips()) if (!id || n.id === id) { setNeon(n.sw, on); light.switch(n.sw).v = on ? 1 : 0; } },
    toggleBlind,
  };
})(QH);
