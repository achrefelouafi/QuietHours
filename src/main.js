/* ═══════════════════════════════════════════════════════════════
   main.js — the canvas, the frame loop, the camera and the few
   things you can touch: each room's lamp (in room three, the bar
   light over the mirror; in room four, the rig of spots on the
   truss), the strip light in room one, the neon sign and the
   blind over the window in room two, the neon tubes in room
   four, every window for the lightning, the tub in room three
   (or the shower over it) to run the bath, once, the stage or
   the screen in room four to run the show — and every plant,
   whose leaves part and sway under the pointer and shake at a
   tap. Paints the scene into a
   small offscreen buffer, snaps it to the inks, and blits it up
   pixelated — three css px to the pixel at home and closer; zoomed
   out the pixels shrink to two, then one, so the house keeps its
   detail small instead of dissolving into blocks.

   The page never scrolls. The canvas is the whole viewport and
   the camera does the moving: drag to pan (with a fling), wheel
   or pinch to zoom about the pointer, arrows / WASD / + - 0 on
   the keyboard, 1, 2, 3 and 4 to fly to a room, double-click to
   lean in and back out.
   ═══════════════════════════════════════════════════════════════ */
(QH => {
  const M = QH.M;
  const { clamp, lerp } = QH;
  const { cam, fitBox } = QH.cam;
  const draw = QH.draw, light = QH.light, sway = QH.sway;
  const scene = QH.scenes.house;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;   // honest about reduced motion: nothing moves on its own

  const view = document.getElementById('stage');
  const stateEl = document.getElementById('state');
  const PIXEL = 3;                                   // css px per rendered px, at home and closer — the chunkiness dial
  const MIN = 0.35, MAX = 6;                         // zoom, relative to the fitted room
  const buf = document.createElement('canvas');
  const bctx = buf.getContext('2d', { willReadFrequently: true });
  const vctx = view.getContext('2d');
  let iw = 0, ih = 0, w = 0, h = 0, hot = null;
  // Zoomed out, the pixels shrink with the house — 3 css px, then 2, then 1 —
  // so it keeps its detail instead of dissolving into blocks; the buffer grows to match.
  let pixel = 0;                                     // css px per rendered px right now
  const fit = { w: 0, h: 0 };                        // the buffer at PIXEL: what the house is fitted into
  const pixelAt = zoom => clamp(Math.round(PIXEL * zoom), 1, PIXEL);

  /* ── camera ──────────────────────────────────────────────────
     `eye` is the scene point (projection at s = 1) sitting at the
     centre of the screen, and how far in we are over the fitted
     scale `s0`. look() turns that into the engine's cam each frame. */
  const eye = { x: 0, y: 0, zoom: 1 };
  const home = { x: 0, y: 0 };
  let s0 = 12, tween = null, velocity = { x: 0, y: 0 }, lastMove = -1e9, placed = false;

  function look() {
    const p = pixelAt(eye.zoom);
    if (p !== pixel) {                               // a new pixel size: size the buffer (and the canvas showing it) to suit
      pixel = p;
      iw = Math.max(160, Math.round(w / p));
      ih = Math.max(120, Math.round(h / p));
      buf.width = iw; buf.height = ih;
      view.width = iw; view.height = ih;
    }
    cam.s = s0 * eye.zoom * PIXEL / pixel;           // the screen scale is s0 · zoom · PIXEL css px per unit whatever the pixel
    cam.x = iw / 2 - eye.x * cam.s;
    cam.y = ih / 2 - eye.y * cam.s;
  }
  /** css px on the canvas → buffer px. */
  const toBuf = (cx, cy) => [cx * iw / (w || 1), cy * ih / (h || 1)];
  /** scene units per css px, at the current zoom. */
  const unitsPerCss = () => iw / ((w || 1) * cam.s);
  /** css px on the canvas → scene units. */
  function toScene(cx, cy) {
    look();                                          // the eye may have moved since the last frame
    const [bx, by] = toBuf(cx, cy);
    return { x: (bx - cam.x) / cam.s, y: (by - cam.y) / cam.s };
  }
  /** Zoom so that scene point `a` stays under css px (cx, cy). */
  function zoomAbout(zoom, a, cx, cy) {
    eye.zoom = clamp(zoom, MIN, MAX);
    look();                                          // the pixel may have changed with the zoom, and the buffer with it
    const [bx, by] = toBuf(cx, cy);
    eye.x = a.x - (bx - iw / 2) / cam.s;
    eye.y = a.y - (by - ih / 2) / cam.s;
  }
  function moveCamera(to, ms) {
    to.zoom = clamp(to.zoom, MIN, MAX);
    velocity = { x: 0, y: 0 };
    if (ms <= 0) { Object.assign(eye, to); tween = null; look(); return; }
    tween = { from: { ...eye }, to, start: performance.now(), ms };
  }
  const interrupt = () => { tween = null; lastMove = performance.now(); };
  const moving = now => tween !== null || pointers.size > 0 || now - lastMove < 200
    || Math.abs(velocity.x) + Math.abs(velocity.y) > 1e-5 || scene.busy() || sway.busy();

  function size() {
    w = Math.max(1, innerWidth); h = Math.max(1, innerHeight);
    view.style.width = w + 'px'; view.style.height = h + 'px';
    // fit the whole house into the buffer at PIXEL, then remember that as "home" — the eye keeps its place across resizes
    fit.w = Math.max(160, Math.round(w / PIXEL));
    fit.h = Math.max(120, Math.round(h / PIXEL));
    fitBox(scene.bounds, fit.w, fit.h, 8);
    s0 = cam.s;
    home.x = (fit.w / 2 - cam.x) / s0;
    home.y = (fit.h / 2 - cam.y) / s0;
    if (!placed) { placed = true; Object.assign(eye, { x: home.x, y: home.y, zoom: 1 }); }
    pixel = 0;                                       // the buffer is sized afresh by look()
    look();
  }
  const goHome = ms => moveCamera({ x: home.x, y: home.y, zoom: 1 }, ms);
  /** Fly to one room: centre it and zoom until it fills the view. */
  function goRoom(id, ms) {
    const r = scene.rooms.find(r => r.id === id); if (!r) return;
    const b = scene.boundsOf(r);
    const zoom = Math.min((fit.w - 16) / (b.x1 - b.x0), (fit.h - 16) / (b.y1 - b.y0)) / s0;
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
    sway.step(t);                                     // the leaves catch up with the pointer before they're drawn
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
  /** The neon sign or strip light under this css point, or null. A room's neon may be several lines — the booth's four tubes. */
  function overNeon(cx, cy) {
    const [bx, by] = toBuf(cx, cy);
    for (const n of wallLights()) {
      if (!n.geo) continue;
      for (const line of n.geo.lines || [n.geo.line]) if (nearLine(line, n.geo.r, bx, by)) return n;
    }
    return null;
  }
  function setNeon(sw, on) { light.set(sw, on); showState(); }
  const toggleNeon = sw => setNeon(sw, !light.isOn(sw));
  /** Switch the neon (or strip, as asked) in this room, if it has one. */
  const toggleNeonIn = (id, kind = 'neon') => { const n = wallLights().find(n => n.id === id && n.kind === kind); if (n) toggleNeon(n.sw); };

  /* ── the blinds ───────────────────────────────────────────── */
  /** Is (bx, by) inside this convex polygon of screen points? */
  function inPoly(q, bx, by) {
    if (!q) return false;
    let sign = 0;
    for (let i = 0; i < q.length; i++) {
      const [ax, ay] = q[i], [cx, cy] = q[(i + 1) % q.length];
      const cross = (cx - ax) * (by - ay) - (cy - ay) * (bx - ax);
      if (cross === 0) continue;
      if (sign === 0) sign = Math.sign(cross); else if (Math.sign(cross) !== sign) return false;
    }
    return true;
  }
  /** Which room's blind is under this css point, or null. */
  function overBlind(cx, cy) {
    const [bx, by] = toBuf(cx, cy);
    for (const b of scene.blinds()) if (inPoly(b.geo && b.geo.quad, bx, by)) return b;
    return null;
  }
  const toggleBlind = id => { const b = scene.blinds().find(b => b.id === id); if (b) b.toggle(); };

  /* ── the storm ────────────────────────────────────────────── */
  /** Which room's window is under this css point, or null. */
  function overStorm(cx, cy) {
    const [bx, by] = toBuf(cx, cy);
    for (const s of scene.storms()) if (inPoly(s.geo && s.geo.quad, bx, by)) return s;
    return null;
  }
  /** Lightning over this room's window — every room's, with no id. `at` is when the strike began (now). */
  const strike = (id, at) => { for (const s of scene.storms()) if (!id || s.id === id) s.strike(at); };

  /* ── the bath ─────────────────────────────────────────────── */
  /** Which room's tub — or the shower over it, head or mixer — is under this css point, or null. A tub that's been run isn't there to hit. */
  function overTub(cx, cy) {
    const [bx, by] = toBuf(cx, cy);
    for (const b of scene.tubs()) {
      if (!b.geo) continue;
      const hd = b.geo.head;
      if (hd && (bx - hd.at[0]) ** 2 + (by - hd.at[1]) ** 2 < hd.r * hd.r) return b;
      if (inPoly(b.geo.tap, bx, by) || inPoly(b.geo.hull, bx, by)) return b;
    }
    return null;
  }
  /** Run the bath in this room — every room's, with no id. `at` is when the shower went on (now). */
  const fillTub = (id, at) => { for (const b of scene.tubs()) if (!id || b.id === id) b.fill(at); };

  /* ── the show ─────────────────────────────────────────────── */
  /** Which room's stage or screen is under this css point, or null. */
  function overShow(cx, cy) {
    const [bx, by] = toBuf(cx, cy);
    for (const s of scene.shows()) for (const q of (s.geo && s.geo.polys) || []) if (inPoly(q, bx, by)) return s;
    return null;
  }
  /** Run the show in this room — every room's, with no id. `at` is when it began (now). */
  const playShow = (id, at) => { for (const s of scene.shows()) if (!id || s.id === id) s.play(at); };

  /** What's under this css point that you can touch: 'lamp', 'neon', 'blind', 'storm', 'tub', 'show' or null. */
  const overThing = (cx, cy) => overLamp(cx, cy) ? 'lamp' : overNeon(cx, cy) ? 'neon' : overBlind(cx, cy) ? 'blind' : overStorm(cx, cy) ? 'storm' : overTub(cx, cy) ? 'tub' : overShow(cx, cy) ? 'show' : null;

  /* ── the plants ───────────────────────────────────────────────
     Nothing to hit-test here: sway.js knows where every leaf was
     drawn. The pointer is handed over while it hovers — a drag is
     the camera's, so it lets go — and a still tap shakes a plant. */
  const brush = (cx, cy) => { if (!still) sway.move(...toBuf(cx, cy), performance.now()); };
  const shake = (cx, cy) => !still && sway.shake(...toBuf(cx, cy));

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
    sway.leave();
  });
  view.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) {
      const on = overThing(e.clientX, e.clientY);
      if (on !== hot) { hot = on; view.classList.toggle('hot', !!hot); }
      brush(e.clientX, e.clientY);
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
    const k = unitsPerCss();                         // css px → scene units
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
      const s = id || n || b ? null : overStorm(e.clientX, e.clientY);
      const bt = id || n || b || s ? null : overTub(e.clientX, e.clientY);
      const sh = id || n || b || s || bt ? null : overShow(e.clientX, e.clientY);
      if (id) toggleLamp(id); else if (n) toggleNeon(n.sw); else if (b) b.toggle(); else if (s) s.strike(); else if (bt) bt.fill(); else if (sh) sh.play(); else shake(e.clientX, e.clientY);
    }
    if (!drag || performance.now() - drag.t > 90) velocity = { x: 0, y: 0 };
    drag = null; pinch = null; press = null;
    view.classList.remove('drag');
    interrupt();
  };
  view.addEventListener('pointerup', up);
  view.addEventListener('pointercancel', up);
  view.addEventListener('pointerleave', () => { hot = null; view.classList.remove('hot'); sway.leave(); });

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
    const k = e.key.toLowerCase(), step = 120 * unitsPerCss();
    if (k === 'arrowleft' || k === 'a') { interrupt(); eye.x -= step; }
    else if (k === 'arrowright' || k === 'd') { interrupt(); eye.x += step; }
    else if (k === 'arrowup' || k === 'w') { interrupt(); eye.y -= step; }
    else if (k === 'arrowdown' || k === 's') { interrupt(); eye.y += step; }
    else if (k === '+' || k === '=') { interrupt(); zoomAbout(eye.zoom * 1.2, toScene(w / 2, h / 2), w / 2, h / 2); }
    else if (k === '-' || k === '_') { interrupt(); zoomAbout(eye.zoom / 1.2, toScene(w / 2, h / 2), w / 2, h / 2); }
    else if (k === '0') goHome(900);
    else if (k === '1' || k === '2' || k === '3' || k === '4') goRoom({ 1: 'one', 2: 'two', 3: 'three', 4: 'four' }[k], 1100);
    else if (k === 'enter' || k === ' ' || k === 'l') toggleLamp(roomInView().id);
    else if (k === 'b') toggleBlind(roomInView().id);
    else if (k === 'n') toggleNeonIn(roomInView().id);
    else if (k === 't') toggleNeonIn(roomInView().id, 'strip');
    else if (k === 'f') strike(roomInView().id);
    else if (k === 'p') playShow(roomInView().id);
    else return;
    e.preventDefault();
  });
  addEventListener('resize', size);

  /* ── loop: every frame while the camera or a plant moves,
     otherwise ~30fps for the ambient animation ─────────────── */
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
    strike: (id, ago = 0) => strike(id, performance.now() - ago * 1000),   // one room's window, or every window; `ago` seconds into the flash
    fillTub: (id, ago = 0) => fillTub(id, performance.now() - ago * 1000), // run the bath in one room, or every room's; `ago` seconds since the shower went on
    playShow: (id, ago = 0) => playShow(id, performance.now() - ago * 1000), // run the show in one room, or every room's; `ago` seconds since it began
  };
})(QH);
