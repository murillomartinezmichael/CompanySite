/** Homepage and roadmap browser gate, adapted from ResumeSite/tests/a11y/axe.mjs. Build first. */
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, normalize as normalizePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer-core';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(ROOT, 'dist');
const require = createRequire(import.meta.url);
const AXE_SOURCE = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

const ROUTES = ['/', '/roadmap/'];
const VIEWPORTS = [
  { name: 'narrow', width: 320, height: 812, deviceScaleFactor: 1, isMobile: true },
  { name: 'tablet', width: 768, height: 1024, deviceScaleFactor: 1, isMobile: true },
  { name: 'mobile', width: 375, height: 812, deviceScaleFactor: 2, isMobile: true },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false },
];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  return candidates.find((path) => existsSync(path)) ?? null;
}

/**
 * Static server with exactly the resolution rules Cloudflare Workers static
 * assets uses: exact file, then `<path>/index.html`, then `<path>.html`, then
 * 404. No listings, no fallbacks, no invention.
 */
function serveDist() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const rel = normalizePath(decodeURIComponent(url.pathname)).replace(/^[\\/]+/, '');
    if (rel.includes('..')) {
      res.writeHead(403).end('forbidden');
      return;
    }
    const candidates = rel === '' ? ['index.html'] : [rel, join(rel, 'index.html'), `${rel}.html`];
    for (const candidate of candidates) {
      const abs = join(DIST, candidate);
      try {
        if (!(await stat(abs)).isFile()) continue;
        res.writeHead(200, { 'Content-Type': MIME[extname(abs)] ?? 'application/octet-stream' });
        res.end(await readFile(abs));
        return;
      } catch {
        /* next candidate */
      }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end(`404 ${url.pathname}`);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const chromePath = findChrome();
if (!chromePath) {
  console.error(
    'No Chrome binary found. Install Google Chrome, or set CHROME_PATH to its executable.\n' +
      'This check is optional; `npm test` covers the static accessibility baseline without a browser.',
  );
  process.exit(2);
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/ is not built. Run `npm run build` first.');
  process.exit(2);
}

const server = await serveDist();
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

let failures = 0;
const evidence = [];
const artifacts = join(ROOT, 'output', 'design-qa');
await mkdir(artifacts, { recursive: true });
try {
  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      const isHome = route === '/';
      const prefix = isHome ? '' : 'roadmap-';
      const consoleErrors = [];
      const failedRequests = [];
      page.on('pageerror', (error) => consoleErrors.push(String(error)));
      page.on('console', (msg) => msg.type() === 'error' && consoleErrors.push(msg.text()));
      page.on('requestfailed', (req) => failedRequests.push(req.url()));

      await page.setRequestInterception(true);
      page.on('request', (req) => {
        // Analytics is observed locally; this static gate never contacts production APIs.
        if (req.url().startsWith(origin + '/api/track')) req.respond({ status: 204 });
        else if (!req.url().startsWith(origin) && !req.url().startsWith('data:')) req.abort();
        else req.continue();
      });
      await page.setViewport(viewport);
      await page.goto(`${origin}${route}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      if (!(await page.$(isHome ? '#hub-heading' : '#roadmap-heading'))) throw new Error(`Expected ${route}, not a fallback`);
      await page.screenshot({ path: join(artifacts, `${prefix}${viewport.name}-hero.png`) });
      await page.keyboard.press('Tab');
      const skipVisible = await page.evaluate(() => {
        const a = document.activeElement, r = a.getBoundingClientRect();
        return a.getAttribute('href') === '#main' && r.top >= 0 && r.width > 1 && r.height > 1;
      });
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      const skipWorks = await page.evaluate(expected => document.activeElement.getAttribute('data-cta') === expected, isHome ? 'hq-released' : 'roadmap-drop-open');
      const focusVisible = await page.evaluate(() => parseFloat(getComputedStyle(document.activeElement).outlineWidth) >= 2);
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      const reducedMotion = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior === 'auto');
      if (!skipVisible || !skipWorks || !focusVisible || !reducedMotion) {
        throw new Error(`Keyboard/motion regression: ${JSON.stringify({ skipVisible, skipWorks, focusVisible, reducedMotion })}`);
      }
      await page.evaluate(() => { document.activeElement.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
      await page.evaluate(AXE_SOURCE);
      const results = await page.evaluate(
        (tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
        TAGS,
      );

      // Horizontal overflow is not an axe rule but it is the failure mode a
      // 375px recruiter actually hits.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );

      const label = `${route} @ ${viewport.name} (${viewport.width}px)`;
      const bad = results.violations.length + results.incomplete.length;
      if (bad === 0 && overflow <= 0 && consoleErrors.length === 0 && failedRequests.length === 0) {
        console.log(`PASS  ${label} — ${results.passes.length} rules passed, 0 violations`);
      } else {
        failures += 1;
        console.error(`FAIL  ${label}`);
        for (const v of results.violations) {
          console.error(`  violation [${v.impact}] ${v.id}: ${v.help}`);
          for (const node of v.nodes) console.error(`    ${node.target.join(' ')}`);
        }
        for (const v of results.incomplete) console.error(`  incomplete ${v.id}: ${v.help}`);
        if (overflow > 0) console.error(`  horizontal overflow: ${overflow}px`);
        for (const e of consoleErrors) console.error(`  console error: ${e}`);
        for (const r of failedRequests) console.error(`  failed request: ${r}`);
      }
      await page.click('#chat-trigger');
      await page.screenshot({ path: join(artifacts, `${prefix}${viewport.name}-chat.png`) });
      const chat = await page.evaluate((tags) => window.axe.run(document.getElementById('chat-widget'), {
        runOnly: { type: 'tag', values: tags }
      }), TAGS);
      // Reviewed in the screenshots: axe treats the greeting's wrapped inline
      // link as a partial overlap. Keep the raw finding, and independently
      // measure that specific message; never suppress violations or other nodes.
      const greetingReview = await page.evaluate(() => {
        const message = document.querySelector('.chat-msg-assistant');
        const viewport = document.querySelector('.chat-messages');
        const css = getComputedStyle(message);
        const link = getComputedStyle(message.querySelector('a'));
        const luminance = (color) => {
          const rgb = color.match(/[\d.]+/g).map(Number);
          if (rgb.length === 4 && rgb[3] !== 1) return NaN;
          return rgb.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
            .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
        };
        const ratio = (fg, bg) => (Math.max(luminance(fg), luminance(bg)) + .05) / (Math.min(luminance(fg), luminance(bg)) + .05);
        const m = message.getBoundingClientRect(), v = viewport.getBoundingClientRect();
        return { textRatio: ratio(css.color, css.backgroundColor), linkRatio: ratio(link.color, css.backgroundColor),
          unclipped: m.top >= v.top && m.bottom <= v.bottom && m.left >= v.left && m.right <= v.right };
      });
      const unreviewedChat = chat.incomplete.filter(finding => !(finding.id === 'color-contrast'
        && finding.nodes.every(node => node.target.length === 1 && node.target[0] === '.chat-msg')
        && greetingReview.textRatio >= 4.5 && greetingReview.linkRatio >= 4.5 && greetingReview.unclipped));
      if (chat.violations.length || unreviewedChat.length) {
        failures += 1;
        console.error('FAIL chat open', viewport.name, JSON.stringify([...chat.violations, ...chat.incomplete].map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))));
      } else console.log(`PASS chat open @ ${viewport.name} — 0 violations; greeting review ${greetingReview.textRatio.toFixed(2)}:1 text, ${greetingReview.linkRatio.toFixed(2)}:1 link`);
      await page.click('#chat-close');
      const releaseSelector = isHome ? '#released' : '#quarter-0';
      // Avoid the global smooth-scroll transition in the screenshot.
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.evaluate(selector => document.querySelector(selector).scrollIntoView({ behavior: 'instant' }), releaseSelector);
      await page.screenshot({ path: join(artifacts, `${prefix}${viewport.name}-releases.png`) });
      for (const section of (isHome ? ['.departments', '#roadmap', 'footer'] : ['#quarter-2', '.signup', 'footer'])) {
        await page.evaluate(selector => document.querySelector(selector).scrollIntoView({ behavior: 'instant' }), section);
        await page.screenshot({ path: join(artifacts, `${prefix}${viewport.name}-${section.replace(/[.#]/g, '')}.png`) });
      }
      evidence.push({ route, viewport, axeVersion: await page.evaluate(() => window.axe.version),
        violations: results.violations, incomplete: results.incomplete, overflow,
        skipVisible, skipWorks, focusVisible, reducedMotion,
        consoleErrors, failedRequests, chatViolations: chat.violations, chatIncomplete: chat.incomplete, greetingReview });
      await page.close();
    }
  }
  const noScript = await browser.newPage();
  await noScript.setJavaScriptEnabled(false);
  await noScript.setViewport({ width: 375, height: 812 });
  await noScript.goto(origin, { waitUntil: 'networkidle0' });
  const noScriptNavigation = await noScript.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Primary"]');
    return nav.getBoundingClientRect().height >= 44 && nav.querySelectorAll('a').length === 4
      && document.querySelector('.action-live').getAttribute('href') === '#released';
  });
  if (!noScriptNavigation) throw new Error('Homepage navigation must work without JavaScript');
  console.log('PASS keyboard skip, focus outline, reduced motion, and mobile navigation without JavaScript');
  evidence.push({ noScriptNavigation });
  await noScript.close();
} finally {
  await browser.close();
  server.close();
}

await writeFile(join(artifacts, 'axe-home.json'), JSON.stringify({ checkedAt: new Date().toISOString(), evidence }, null, 2));

console.log(
  failures === 0
    ? `\naxe-core: clean on ${ROUTES.length * VIEWPORTS.length} page × viewport combinations.`
    : `\naxe-core: ${failures} failing combination(s).`,
);
process.exit(failures === 0 ? 0 : 1);
