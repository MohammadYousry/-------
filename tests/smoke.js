// Smoke test: every chapter builds, simulates for a few seconds and renders without errors. Saves a screenshot per chapter.
// Usage: node tests/smoke.js [outDir] [chapters...]
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
(async () => {
  const out = process.argv[2] || path.join(ROOT, 'shots');
  const only = process.argv.slice(3).map(Number);
  fs.mkdirSync(out, { recursive: true });
  const srv = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(0);
  await new Promise((r) => srv.on('listening', r));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 620 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto('http://localhost:' + srv.address().port + '/index.html?debug=1');
  await page.waitForFunction(() => window.__MM && window.__MM.state === 'title', null, { timeout: 30000 });
  const n = await page.evaluate(() => MM.CHAPTERS.length);
  console.log('chapters:', n);
  for (let c = 1; c <= n; c++) {
    if (only.length && only.indexOf(c) < 0) continue;
    const before = errs.length;
    await page.evaluate((c) => window.__MM.startGame('solo', c), c);
    await page.waitForTimeout(900);
    await page.evaluate(() => { window.__MM.go(); });
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => { const g = window.__MM; return { st: g.state, title: g.chapter.title, items: g.level ? g.level.items.length : null, hearts: g.level ? g.level.heartsTotal : null, mems: g.level ? g.level.memTotal : null, calls: g.renderer.info.render.calls }; });
    await page.screenshot({ path: path.join(out, 'ch' + String(c).padStart(2, '0') + '.png') });
    console.log(c, JSON.stringify(info), errs.length > before ? 'ERRORS: ' + errs.slice(before).join(' | ') : 'ok');
    await page.evaluate(() => window.__MM.quitToTitle(false));
    await page.waitForTimeout(600);
  }
  await browser.close(); srv.close();
  process.exit(errs.length ? 1 : 0);
})();
