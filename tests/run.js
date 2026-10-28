// Bot playthrough tests: drive both characters through every chapter's puzzles with the real game physics.
// Usage: npm install --no-save playwright && npx playwright install chromium && node tests/run.js [1 2 ...]
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, () => resolve(srv));
  });
}

(async () => {
  const chapters = process.argv.slice(2).length ? process.argv.slice(2) : ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const srv = await serve();
  const url = 'http://localhost:' + srv.address().port + '/index.html?debug=1';
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let fails = 0;
  for (const ch of chapters) {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
    const errs = [];
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    await page.goto(url);
    await page.waitForFunction(() => window.__MM && window.__MM.state === 'title', null, { timeout: 30000 });
    await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'harness.js'), 'utf8') });
    const check = (name, ok, info) => { if (!ok) fails++; console.log((ok ? '  PASS ' : '  FAIL ') + name + (ok || info === undefined ? '' : '  ' + JSON.stringify(info))); };
    const ev = (fn, arg) => page.evaluate(fn, arg);
    const start = async (n, mode) => {
      await ev(([n, mode]) => window.__MM.startGame(mode || 'solo', n), [n, mode]);
      await page.waitForTimeout(900);
      await ev(() => { window.__MM.go(); window.__MM.state = 'test'; });
    };
    console.log('Chapter ' + ch);
    try { await require('./ch' + ch + '.test.js')({ ev, check, start, page }); } catch (e) { fails++; console.log('  EXCEPTION ' + e.message); }
    errs.forEach((e) => { fails++; console.log('  ' + e); });
    await page.close();
  }
  await browser.close();
  srv.close();
  console.log(fails ? fails + ' failed' : 'All chapters passed');
  process.exit(fails ? 1 : 0);
})();
