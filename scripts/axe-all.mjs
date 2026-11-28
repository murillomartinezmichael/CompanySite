/**
 * axe-core over EVERY built HTML page in dist/, at a phone and a desktop
 * viewport, in both the dark and the light theme. Build first.
 *
 *   node scripts/axe-all.mjs                 # report every violation, exit 1 if any
 *   node scripts/axe-all.mjs --rules=a,b     # gate: exit 1 only on these rule ids
 *   node scripts/axe-all.mjs --json=out.json # also write the raw grouped report
 *
 * The browser only ever talks to a 127.0.0.1 server over dist/; every other
 * request is aborted. Set CHROME_PATH to the Chrome/Chromium binary.
 * scripts/axe-home.mjs stays the keyboard/screenshot/chat gate for key routes.
 */
import { createServer } from 'node:http';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer-core';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(ROOT, 'dist');
const require = createRequire(import.meta.url);
const AXE_SOURCE = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844, deviceScaleFactor: 1, isMobile: true },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false },
];
const THEMES = ['dark', 'light'];
const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const GATE = arg('rules')?.split(',').filter(Boolean) ?? null;
const JSON_OUT = arg('json');

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.xml': 'application/xml' };

async function htmlPages(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlPages(abs)));
    else if (entry.name.endsWith('.html')) out.push('/' + relative(DIST, abs).split(sep).join('/'));
  }
  return out.sort();
}

function serveDist() {
  const server = createServer(async (req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
    if (rel.includes('..')) return void res.writeHead(403).end();
    for (const candidate of rel === '' ? ['index.html'] : [rel, join(rel, 'index.html'), `${rel}.html`]) {
      const abs = join(DIST, candidate);
      try {
        if (!(await stat(abs)).isFile()) continue;
        res.writeHead(200, { 'Content-Type': MIME[extname(abs)] ?? 'application/octet-stream' });
        return void res.end(await readFile(abs));
      } catch { /* next */ }
    }
    res.writeHead(404).end();
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const chromePath = process.env.CHROME_PATH;
if (!chromePath || !existsSync(chromePath)) { console.error('Set CHROME_PATH to a Chrome/Chromium binary.'); process.exit(2); }
if (!existsSync(join(DIST, 'index.html'))) { console.error('dist/ is not built. Run `npm run build` first.'); process.exit(2); }

const pages = await htmlPages(DIST);
const server = await serveDist();
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ executablePath: chromePath, headless: true,
  args: ['--disable-dev-shm-usage', ...(process.env.AXE_NO_SANDBOX ? ['--no-sandbox'] : [])] });

const byRule = new Map(); // id -> { impact, help, pages:Set, nodes, targets: Map(target -> count) }
const incomplete = new Map(); // 'needs review' findings: reported in --json, never gated
const tally = (map, v, path) => {
  const rec = map.get(v.id) ?? { impact: v.impact, help: v.help, pages: new Set(), combos: 0, nodes: 0, targets: new Map() };
  rec.pages.add(path); rec.combos += 1; rec.nodes += v.nodes.length;
  for (const n of v.nodes) {
    const key = n.target.join(' ') + '  ::  ' + n.html.slice(0, 140).replace(/\s+/g, ' ');
    rec.targets.set(key, (rec.targets.get(key) ?? 0) + 1);
  }
  map.set(v.id, rec);
};
try {
  for (const theme of THEMES) for (const viewport of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (r) => (r.url().startsWith(origin) || r.url().startsWith('data:') ? r.continue() : r.abort()));
    await page.evaluateOnNewDocument((t) => { try { localStorage.setItem('m3mm-theme', t); } catch {} }, theme);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport(viewport);
    for (const path of pages) {
      await page.goto(origin + path, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(AXE_SOURCE);
      const results = await page.evaluate((tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS);
      for (const v of results.incomplete) tally(incomplete, v, path);
      for (const v of results.violations) {
        tally(byRule, v, path);
        if (!GATE || GATE.includes(v.id)) console.error(`FAIL ${path} @ ${viewport.name}/${theme}: ${v.id} (${v.nodes.length})`);
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

const summarise = (map) => [...map].map(([id, r]) => ({ id, impact: r.impact, help: r.help, pages: r.pages.size, combos: r.combos, nodes: r.nodes,
  pageList: [...r.pages], targets: [...r.targets].sort((a, b) => b[1] - a[1]).map(([t, c]) => ({ t, c })) }));
const summary = summarise(byRule);
if (JSON_OUT) await writeFile(JSON_OUT, JSON.stringify({ pages, summary, incomplete: summarise(incomplete) }, null, 2));
console.log(`\naxe-all: ${pages.length} pages × ${VIEWPORTS.length} viewports × ${THEMES.length} themes`);
for (const r of summary) console.log(`  ${r.id} [${r.impact}] ${r.pages} pages, ${r.nodes} nodes`);
const failing = summary.filter((r) => !GATE || GATE.includes(r.id));
console.log(failing.length ? `axe-all: ${failing.length} failing rule(s)${GATE ? ' in gate' : ''}.` : `axe-all: clean${GATE ? ` for ${GATE.join(', ')}` : ''}.`);
process.exit(failing.length ? 1 : 0);
