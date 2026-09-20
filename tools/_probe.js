const fs = require('fs');
const vm = require('vm');
const { createCanvas, ImageData } = require('canvas');
const path = require('path');
const root = process.cwd();

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const code = files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');

const stub = { textContent: '', style: {}, hidden: true, addEventListener: () => {}, querySelectorAll: () => [], querySelector: () => null, classList: { toggle() {}, remove() {}, add() {} }, setAttribute: () => {}, focus: () => {} };
function mkCanvas(w, h) { const c = createCanvas(w || 300, h || 150); c.clientWidth = 1100; c.clientHeight = 760; c.style = {}; c.classList = { toggle() {}, remove() {}, add() {} }; c.addEventListener = () => {}; c.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1100, height: 760 }); return c; }

const sandbox = {
  console,
  ImageData,
  document: { getElementById: id => (id === 'stage' ? mkCanvas() : stub), createElement: tag => (tag === 'canvas' ? mkCanvas() : stub) },
  requestAnimationFrame: () => 0,
  addEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  innerWidth: 1100, innerHeight: 760,
  performance: { now: () => 0 },
};
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: 'quiet-hours.js' });

const app = sandbox.QH.app;
const scene = sandbox.QH.scenes.house;
console.log('app.setArcade type:', typeof app.setArcade);
console.log('arcades():', scene.arcades().map(a => ({ id: a.id, sw: a.sw })));

// Try toggling arcade off
app.setArcade(false);
console.log('after setArcade(false):');
console.log('  light.switch("four-arcade"):', JSON.stringify(sandbox.QH.light.switch('four-arcade')));
console.log('  arcadeOn check (light.switch(four-arcade).v):', sandbox.QH.light.switch('four-arcade').v);
