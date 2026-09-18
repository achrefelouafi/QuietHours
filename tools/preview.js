/**
 * tools/preview.js — render a frame of index.html to a PNG, no browser.
 *
 *   node tools/preview.js [outfile] [seconds] [width] [height] [lamp] [zoom] [panX] [panY]
 *
 * Pulls the <script> straight out of index.html and runs it against a
 * minimal DOM backed by node-canvas. Handy for eyeballing changes fast.
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

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function mkCanvas(w, h) {
  const c = createCanvas(w || 300, h || 150);
  c.clientWidth = W; c.clientHeight = H;
  c.style = {};
  c.addEventListener = () => {};
  c.setPointerCapture = () => {};
  c.getBoundingClientRect = () => ({ left: 0, top: 0, width: W, height: H });
  return c;
}

const stage = mkCanvas(W, H);
const stubEl = { textContent: '', innerHTML: '', style: {}, addEventListener: () => {} };

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
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const QH = sandbox.QH;
if (LIT !== 1) QH.setLights(false);
if (ZOOM !== 1 || PANX || PANY) { QH.cam.z *= ZOOM; QH.cam.x += PANX; QH.cam.y += PANY; }
QH.frame(time * 1000);
// settle the lamp easing (it lerps toward target over several frames)
for (let i = 0; i < 40; i++) QH.frame(time * 1000);

// blow it up nearest-neighbour, the way the browser does, so detail is judgeable
const up = createCanvas(stage.width * 2, stage.height * 2);
const uc = up.getContext('2d');
uc.imageSmoothingEnabled = false;
uc.drawImage(stage, 0, 0, up.width, up.height);
fs.writeFileSync(out, up.toBuffer('image/png'));
console.log('wrote ' + out + '  ' + up.width + 'x' + up.height + ' (buffer ' + stage.width + 'x' + stage.height + ')');
