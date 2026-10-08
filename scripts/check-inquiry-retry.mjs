/** Compiled forms + compiled Pages route, synthetic retained receiver, no providers. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import puppeteer from 'puppeteer-core';
import { Miniflare, Response as WorkerResponse, convertV4MiniflareOptions } from 'miniflare';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist'); const out = join(root, 'output/retry-lifecycle');
const target = 'https://cockpit.example.invalid/v1/leads/ingest';
const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find(path => path && existsSync(path));
assert.ok(chrome, 'Installed Chrome required; no installation or fallback');
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
let mf; let serial = 0; let mode = 'lost'; let beforeReceipt;
const saved = new Map(); const calls = []; const evidence = [];
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/lead' && req.method === 'POST') {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value);
      // Independent synthetic client per step; rate limiter itself has unit coverage.
      headers.set('CF-Connecting-IP', `192.0.2.${++serial}`);
      const response = await mf.dispatchFetch('https://m3mm.net/api/lead', { method: 'POST', headers, body: Buffer.concat(chunks), redirect: 'manual' });
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer())); return;
    }
    if (url.pathname.startsWith('/api/')) { res.writeHead(204).end(); return; }
    const base = resolve(dist, '.' + decodeURIComponent(url.pathname));
    if (base !== dist && !base.startsWith(dist + sep)) { res.writeHead(403).end(); return; }
    for (const path of [base, join(base, 'index.html'), base + '.html']) {
      try { if (!(await stat(path)).isFile()) continue;
        res.writeHead(200, { 'Content-Type': mime[extname(path)] ?? 'application/octet-stream' }); res.end(await readFile(path)); return;
      } catch { /* next built path */ }
    }
    res.writeHead(404).end();
  } catch (error) { res.writeHead(500).end('Fixture error'); console.error(error); }
});
let browser;
let failure;
try {
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => { server.removeListener('error', reject); resolve(); });
});
const origin = `http://127.0.0.1:${server.address().port}`;
mf = new Miniflare({ ...convertV4MiniflareOptions({ cf: false, host: '127.0.0.1', workers: [{
  name: 'inquiry-browser-fixture', modules: true, scriptPath: join(root, 'output/runtime/index.js'),
  compatibilityDate: '2026-08-27', compatibilityFlags: ['nodejs_compat'],
  bindings: { ALLOWED_ORIGINS: origin, COCKPIT_LEAD_INBOX_URL: target, COCKPIT_INGEST_TOKEN: 'synthetic-only',
    RESEND_API_KEY: 'synthetic-never-send', N8N_LEAD_WEBHOOK_URL: 'https://workflow.example.invalid/never' },
  serviceBindings: { ASSETS: () => new WorkerResponse('not used', { status: 404 }) },
  outboundService: async request => {
    assert.equal(request.url, target, 'Every outward request is intercepted; only synthetic receiver allowed');
    const key = request.headers.get('Idempotency-Key'); const payload = await request.json();
    calls.push({ key, payload });
    const old = saved.get(key);
    if (old && JSON.stringify(old.payload) !== JSON.stringify(payload)) return WorkerResponse.json({}, { status: 409 });
    if (!old) saved.set(key, { payload, receipt: { ...payload, id: String(saved.size + 1).padStart(32, '0'), created_at: '2026-10-02T00:00:00Z',
      deliveries: payload.notifications.map((channel, i) => ({ id: String(saved.size * 3 + i + 1).padStart(32, '0'), channel, state: 'pending', attempts: 0, provider_receipt: '', error: '' })) } });
    if (beforeReceipt) { const hook = beforeReceipt; beforeReceipt = undefined; await hook(); }
    // Retained data with deliberately lost receipt, not a real DB/network failure.
    return mode === 'lost' ? WorkerResponse.json({}, { status: 503 }) : WorkerResponse.json(saved.get(key).receipt, { status: old ? 200 : 201 });
  },
}] }), telemetry: { enabled: false } });
// Observe worker startup before opening Chrome; startup failures still reach cleanup.
await mf.ready;
browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--disable-dev-shm-usage'] });
const forms = [
  { route: '/websites/', form: '#intake-form', status: '#intake-status', field: 'frustration',
    values: { name: 'Synthetic Renée 😀', email: 'buyer@example.invalid', businessType: 'Synthetic café', frustration: 'Synthetic A&B, "quotes" and <script>bad()</script> 😀.' } },
  { route: '/roadmap/', form: '#roadmap-signup', status: '#roadmap-status', field: 'topics',
    values: { email: 'reader@example.invalid', topics: 'Synthetic café, <script>bad()</script> 😀.' } },
];
async function pageFor(f, width = 375, js = true) {
  const context = await browser.createBrowserContext(); const page = await context.newPage();
  await page.setViewport({ width, height: 900 }); await page.setJavaScriptEnabled(js);
  await page.setRequestInterception(true);
  page.on('request', req => req.url().startsWith(origin + '/') || req.url().startsWith('data:') ? req.continue() : req.abort());
  await page.goto(origin + f.route, { waitUntil: 'networkidle0' }); return { page, context };
}
async function fill(page, f, values = f.values) {
  await page.evaluate((selector, values) => {
    for (const [name, value] of Object.entries(values)) {
      const input = document.querySelector(`${selector} [name="${name}"]`); input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, f.form, values);
}
async function waitStatus(page, f, text) { await page.waitForFunction((selector, text) => document.querySelector(selector)?.textContent.includes(text), {}, f.status, text); }
async function send(page, f) { await page.click(`${f.form} button[type=submit]`); }
async function separate(page, f) {
  page.once('dialog', dialog => dialog.accept());
  await page.click(f.form + '-new-inquiry'); await waitStatus(page, f, 'This button has not sent');
}
function reset() { calls.length = 0; saved.clear(); mode = 'lost'; beforeReceipt = undefined; }
  await mkdir(out, { recursive: true });
  for (const width of [375, 1440]) for (const f of forms) {
    reset(); const { page, context } = await pageFor(f, width);
    try {
      await fill(page, f); await send(page, f); await waitStatus(page, f, 'Delivery was not confirmed');
      const a = calls[0].key; assert.equal(saved.size, 1);
      const storage = await page.evaluate(() => Object.fromEntries(Object.entries(sessionStorage)));
      for (const raw of Object.values(storage)) {
        assert.ok(!raw.includes(f.values.email)); assert.ok(!raw.includes(f.values[f.field]));
        for (const record of JSON.parse(raw)) assert.deepEqual(Object.keys(record).sort(), ['fingerprint', 'key', 'status']);
      }
      await page.reload({ waitUntil: 'networkidle0' }); await fill(page, f); await send(page, f);
      await waitStatus(page, f, 'Delivery was not confirmed'); assert.equal(calls.at(-1).key, a); assert.equal(saved.size, 1);
      await fill(page, f, { ...f.values, [f.field]: 'A genuinely different synthetic inquiry.' });
      await send(page, f); await waitStatus(page, f, 'earlier inquiry may already be saved'); assert.equal(calls.length, 2);
      page.once('dialog', dialog => dialog.dismiss()); await page.click(f.form + '-new-inquiry'); assert.equal(calls.length, 2);
      await separate(page, f); assert.equal(calls.length, 2);
      await send(page, f); await waitStatus(page, f, 'Delivery was not confirmed');
      assert.notEqual(calls.at(-1).key, a); assert.equal(saved.size, 2);
      await fill(page, f); await send(page, f); await waitStatus(page, f, 'Delivery was not confirmed'); assert.equal(calls.at(-1).key, a);
      mode = 'ok'; await send(page, f); await page.waitForFunction(() => location.pathname.includes('thanks'));
      assert.equal(saved.size, 2); assert.equal(calls.length, 5);
      await page.goto(origin + f.route, { waitUntil: 'networkidle0' }); await fill(page, f); await send(page, f);
      await waitStatus(page, f, 'already confirmed in this tab'); assert.equal(calls.length, 5);
      await page.screenshot({ path: join(out, `${f.form.slice(1)}-${width}-confirmed.png`) });
      await separate(page, f); await send(page, f); await page.waitForFunction(() => location.pathname.includes('thanks'));
      assert.equal(saved.size, 3); assert.notEqual(calls.at(-1).key, a);
      evidence.push({ scenario: 'reload-deliberate-new-revert-accepted', route: f.route, width, requests: calls.length,
        retainedInquiries: saved.size, noRawBrowserStorage: true, oldIdentityPreserved: true, acceptedReplaySuppressed: true });
    } finally { await context.close(); }
  }
  for (const f of forms) {
    reset(); const { page, context } = await pageFor(f, 375, false);
    try {
      await fill(page, f); await Promise.all([page.waitForNavigation(), send(page, f)]);
      assert.equal(calls.length, 0); assert.equal(new URL(page.url()).pathname, '/api/lead');
      const first = await page.$eval('input[name=submissionId]', el => el.value);
      const hidden = await page.$$eval('input[type=hidden]', nodes => Object.fromEntries(nodes.map(el => [el.name, el.value])));
      assert.equal(hidden.email, f.values.email);
      assert.ok(hidden.frustration.includes(f.values[f.field]));
      assert.equal(await page.$$eval('script', nodes => nodes.length), 0);
      await page.screenshot({ path: join(out, `${f.form.slice(1)}-native-confirm.png`) });
      const [nativeResult] = await Promise.all([page.waitForNavigation(), page.click('button[type=submit]')]);
      assert.equal(saved.size, 1, `Native confirmation status=${nativeResult.status()} origin=${nativeResult.request().headers().origin}`); assert.equal(await page.$eval('input[name=submissionId]', el => el.value), first);
      assert.ok((await page.content()).includes('may already be saved'));
      mode = 'ok'; await Promise.all([page.waitForNavigation(), page.click('button[type=submit]')]);
      assert.ok(new URL(page.url()).pathname.includes('thanks')); assert.equal(saved.size, 1);
      assert.equal(calls.length, 2); assert.equal(calls[0].key, calls[1].key);
      evidence.push({ scenario: 'native-no-js-confirm-lost-response-retry', route: f.route, width: 375, requests: 2,
        retainedInquiries: 1, sameHiddenIdentity: true, escapedFieldsRoundTrip: true });
    } finally { await context.close(); }
  }
  for (const f of forms) for (const phase of ['before', 'after']) {
    reset(); mode = 'ok'; const { page, context } = await pageFor(f);
    try {
      const blockStorage = () => page.evaluate(() => Object.defineProperty(window, 'sessionStorage', { configurable: true, get() { throw new Error('Synthetic storage denied'); } }));
      await fill(page, f);
      if (phase === 'before') await blockStorage(); else beforeReceipt = blockStorage;
      await send(page, f);
      if (phase === 'before') {
        await waitStatus(page, f, 'No request was made this time'); assert.equal(calls.length, 0); assert.equal(saved.size, 0);
      } else {
        await waitStatus(page, f, 'Your inquiry was confirmed');
        assert.equal(await page.$eval(`${f.form} button[type=submit]`, button => button.disabled), true);
        await page.$eval(f.form, form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
        assert.equal(calls.length, 1); assert.equal(saved.size, 1);
        await page.waitForFunction(() => location.pathname.includes('thanks'));
      }
      evidence.push({ scenario: 'storage-' + phase + '-send', route: f.route, requests: calls.length, retainedInquiries: saved.size, honestStatus: true });
    } finally { await context.close(); }
  }
  const hashes = {};
  for (const path of ['src/lib/inquiry-submission.ts', 'src/components/Intake.astro', 'src/pages/roadmap.astro', 'functions/api/lead.ts', 'functions/_lib/inquiry-confirmation.ts', 'output/runtime/index.js', 'dist/websites/index.html', 'dist/roadmap/index.html']) {
    hashes[path] = createHash('sha256').update(await readFile(join(root, path))).digest('hex');
  }
  await writeFile(join(out, 'browser-evidence.json'), JSON.stringify({ checkedAt: new Date().toISOString(), browser: await browser.version(), hashes,
    evidence, boundaries: 'Local compiled forms and Pages worker with synthetic retained receiver. No real database, provider, authentication or production call.', productionVerified: false }, null, 2));
  console.log(`PASS ${evidence.length} compiled form/Pages retry scenarios; all outbound intercepted.`);
} catch (error) {
  failure = error;
} finally {
  // Every acquired resource gets its cleanup attempt even if another close fails.
  const results = await Promise.allSettled([
    Promise.resolve().then(() => browser?.close()),
    Promise.resolve().then(() => mf?.dispose()),
    Promise.resolve().then(() => {
      server.closeAllConnections();
      if (!server.listening) return;
      return new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }),
  ]);
  const errors = results.filter(result => result.status === 'rejected').map(result => result.reason);
  if (failure) errors.unshift(failure);
  if (errors.length) throw new AggregateError(errors, 'Inquiry fixture failed; startup/test and cleanup errors retained');
}
