/**
 * Captures full-page screenshots of main routes and one session video (WebM)
 * under public/assets/images/web/recordings/.
 * Requires: ng serve on http://localhost:4200
 * Run: npm run capture:ui
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const base = process.env.CAPTURE_BASE_URL || 'http://localhost:4200';
const outDir = path.join(__dirname, '..', 'public', 'assets', 'images', 'web');
const videoDir = path.join(outDir, 'recordings');
fs.mkdirSync(videoDir, { recursive: true });

const routes = [
  { path: '/', file: 'ui-home' },
  { path: '/login', file: 'ui-login' },
  { path: '/register', file: 'ui-register' },
  { path: '/dashboard', file: 'ui-dashboard' },
  { path: '/polls', file: 'ui-polls' },
  { path: '/profile', file: 'ui-profile' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1366, height: 900 } },
  });
  const page = await context.newPage();

  for (const r of routes) {
    try {
      await page.goto(`${base}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(2500);
      await page.screenshot({
        path: path.join(videoDir, `${r.file}.png`),
        fullPage: true,
      });
      console.log('OK screenshot:', r.file);
    } catch (e) {
      console.error('FAIL', r.path, e.message);
    }
  }

  await context.close();
  await browser.close();

  const webms = fs
    .readdirSync(videoDir)
    .filter((f) => f.endsWith('.webm'))
    .map((f) => ({ f, t: fs.statSync(path.join(videoDir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  if (webms.length) {
    const target = path.join(videoDir, 'surveybasket-ui-tour.webm');
    if (fs.existsSync(target)) fs.unlinkSync(target);
    fs.renameSync(path.join(videoDir, webms[0].f), target);
    console.log('OK video:', target);
  }
  console.log('Done. PNGs and tour video in', videoDir);
})();
