/**
 * tools/build.js — copy the page into dist/, ready to upload.
 *
 *   node tools/build.js [outDir]
 *
 * There is no bundling: the site is index.html plus the plain <script>
 * files it lists, and public/. The build just gathers those into one
 * folder so a host never sees node_modules, docs/ or tools/. The list of
 * scripts is read from index.html, the same way tools/preview.js does it,
 * so a file that isn't loaded by the page isn't shipped either.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(root, 'dist'));

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]);

function copy(rel) {
  const from = path.join(root, rel);
  const to = path.join(out, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

copy('index.html');
for (const s of scripts) copy(s);
if (fs.existsSync(path.join(root, 'public'))) copy('public');
for (const extra of ['_headers', '_redirects', 'favicon.ico']) {
  if (fs.existsSync(path.join(root, extra))) copy(extra);
}

let n = 0, bytes = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else { n++; bytes += fs.statSync(p).size; }
  }
})(out);
console.log(`built ${path.relative(root, out) || out}: ${n} files, ${(bytes / 1024).toFixed(0)} KB`);
