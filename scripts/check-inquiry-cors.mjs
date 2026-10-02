/** Real Chrome preflight → compiled Pages handler, isolated synthetic receiver. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { Miniflare, Response, convertV4MiniflareOptions } from 'miniflare';
const root = fileURLToPath(new URL('../', import.meta.url));
const expectedBlocked = process.argv.includes('--expect-blocked');
const source = createServer((_req, res) => res.writeHead(200, { 'Content-Type': 'text/html' }).end('<!doctype html><html lang="en"><title>Synthetic CORS client</title><body>Synthetic client</body></html>'));
await new Promise(resolve => source.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${source.address().port}`;
let receiverCalls = 0; const retained = new Map(); const traffic = [];
const mf = new Miniflare({ ...convertV4MiniflareOptions({ cf: false, host: '127.0.0.1', workers: [{
  name: 'inquiry-cors-fixture', modules: true, scriptPath: root + 'output/runtime/index.js', compatibilityDate: '2026-08-27', compatibilityFlags: ['nodejs_compat'],
  bindings: { ALLOWED_ORIGINS: origin, COCKPIT_LEAD_INBOX_URL: 'https://cockpit.example.invalid/v1/leads/ingest', COCKPIT_INGEST_TOKEN: 'synthetic-only' },
  serviceBindings: { ASSETS: () => new Response('not used', { status: 404 }) },
  outboundService: async request => {
    assert.equal(request.url, 'https://cockpit.example.invalid/v1/leads/ingest'); receiverCalls++;
    const key = request.headers.get('Idempotency-Key'); const payload = await request.json(); const old = retained.get(key);
    if (old) assert.deepEqual(payload, old.payload);
    if (!old) retained.set(key, { payload, receipt: { ...payload, id: 'a'.repeat(32), created_at: '2026-10-02T00:00:00Z',
      deliveries: payload.notifications.map((channel, i) => ({ id: String(i + 1).padStart(32, '0'), channel, state: 'pending', attempts: 0, provider_receipt: '', error: '' })) } });
    return Response.json(retained.get(key).receipt, { status: old ? 200 : 201 });
  },
}] }), telemetry: { enabled: false } });
const api = createServer(async (req, res) => {
  const headers = new Headers(); for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value);
  const chunks = []; for await (const chunk of req) chunks.push(chunk);
  const response = await mf.dispatchFetch('https://m3mm.net/api/lead', { method: req.method, headers,
    ...(req.method === 'POST' ? { body: Buffer.concat(chunks) } : {}), redirect: 'manual' });
  traffic.push({ method: req.method, origin: req.headers.origin, requestedHeaders: req.headers['access-control-request-headers'],
    status: response.status, allowedHeaders: response.headers.get('Access-Control-Allow-Headers'),
    allowCredentials: response.headers.get('Access-Control-Allow-Credentials') });
  res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer()));
});
await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
const endpoint = `http://127.0.0.1:${api.address().port}/api/lead`;
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage(); await page.setRequestInterception(true);
  page.on('request', request => request.url().startsWith(origin + '/') || request.url().startsWith(endpoint) ? request.continue() : request.abort());
  await page.goto(origin);
  const send = extras => page.evaluate(async (url, extras) => {
    try { const result = await fetch(url, { method: 'POST', credentials: 'omit', headers: {
      'Content-Type': 'application/json', 'Idempotency-Key': '00000000-0000-4000-8000-000000000001', ...extras },
      body: JSON.stringify({ name: 'Synthetic Buyer', email: 'buyer@example.invalid', businessType: 'Synthetic business', frustration: 'Synthetic cross-origin inquiry.' }) });
      return { status: result.status, receipt: await result.json() };
    } catch { return { blocked: true }; }
  }, endpoint, extras);
  const first = await send({});
  if (expectedBlocked) {
    assert.deepEqual(first, { blocked: true }); assert.equal(receiverCalls, 0);
    assert.deepEqual(traffic.map(item => item.method), ['OPTIONS']);
  } else {
    assert.deepEqual(first, { status: 200, receipt: { ok: true } });
    assert.deepEqual(await send({}), first); assert.equal(retained.size, 1); assert.equal(receiverCalls, 2);
    const blocked = await send({ Authorization: 'synthetic-never-forwarded' });
    assert.deepEqual(blocked, { blocked: true }); assert.equal(receiverCalls, 2);
    const preflight = traffic.find(item => item.method === 'OPTIONS');
    assert.match(preflight.requestedHeaders, /idempotency-key/); assert.match(preflight.allowedHeaders, /idempotency-key/i);
    assert.ok(traffic.every(item => item.allowCredentials === null));
  }
  await mkdir(root + 'output/retry-lifecycle', { recursive: true });
  await writeFile(root + `output/retry-lifecycle/cors-${expectedBlocked ? 'before' : 'after'}.json`, JSON.stringify({ checkedAt: new Date().toISOString(), browser: await browser.version(),
    expectedBlocked, traffic, receiverCalls, retainedInquiries: retained.size,
    workerSha256: createHash('sha256').update(await readFile(root + 'output/runtime/index.js')).digest('hex'), productionVerified: false }, null, 2));
  console.log(expectedBlocked ? 'PASS reproduced: browser preflight blocks required retry key; zero receiver calls.' : 'PASS actual browser preflight, same-key replay and unknown-header denial; one retained synthetic inquiry.');
} finally { await browser.close(); await mf.dispose(); await new Promise(resolve => api.close(resolve)); await new Promise(resolve => source.close(resolve)); }
