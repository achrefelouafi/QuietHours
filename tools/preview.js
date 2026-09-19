/**
 * tools/preview.js — render a frame of the room to a PNG, no browser.
 *
 *   node tools/preview.js [outfile] [seconds] [width] [height] [lamp] [zoom] [panX] [panY] [room]
 *
 * `lamp` 0 switches every lamp off; `room` (one | two) frames that
 * room instead of the whole house, before zoom and pan apply.
 *
 * Reads the <script src> list out of index.html, runs those files in
 * order against a minimal DOM backed by node-canvas, and writes the
 * frame out at 2× nearest-neighbour so detail is judgeable.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createCanvas, ImageData } = require('canvas');

const root = path.join(__dirname, '..');
const out = process.argv[2] || path.join(root, 'preview.png');
const time = parseFloat(process.argv[3] || '4.2');
const W = parseInt(process.argv[4] || '1100', 10);
const H = parseInt(process.argv[5] || '760', 10);
const LIT = parseFloat(process.argv[6] || '1');
const ZOOM = parseFloat(process.argv[7] || '1');
const PANX = parseFloat(process.argv[8] || '0');
const PANY = parseFloat(process.argv[9] || '0');
const ROOM = process.argv[10] || '';

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const code = files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');

function mkCanvas(w, h) {
  const c = createCanvas(w || 300, h || 150);
  c.clientWidth = W; c.clientHeight = H;
  c.style = {};
  c.classList = { toggle() {}, remove() {}, add() {} };
  c.addEventListener = () => {};
  c.getBoundingClientRect = () => ({ left: 0, top: 0, width: W, height: H });
  return c;
}

const stage = mkCanvas(W, H);
const stubEl = { textContent: '', style: {}, addEventListener: () => {} };

const sandbox = {
  console,
  ImageData,
  document: {
    getElementById: id => (id === 'stage' ? stage : stubEl),
    createElement: tag => (tag === 'canvas' ? mkCanvas() : stubEl),
  },
  requestAnimationFrame: () => 0,     // we drive frames by hand
  addEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  innerWidth: W, innerHeight: H,
  performance: { now: () => 0 },
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: 'quiet-hours.js' });

const app = sandbox.QH.app;
if (LIT < 1) app.setLamp(false);
if (ROOM) { app.room(ROOM); app.look(); }
if (ZOOM !== 1 || PANX || PANY) { app.cam.s *= ZOOM; app.cam.x += PANX; app.cam.y += PANY; }
app.frame(time * 1000);

const up = createCanvas(stage.width * 2, stage.height * 2);
const uc = up.getContext('2d');
uc.imageSmoothingEnabled = false;
uc.drawImage(stage, 0, 0, up.width, up.height);
fs.writeFileSync(out, up.toBuffer('image/png'));
console.log('wrote ' + out + '  ' + up.width + 'x' + up.height + ' (buffer ' + stage.width + 'x' + stage.height + ')');
