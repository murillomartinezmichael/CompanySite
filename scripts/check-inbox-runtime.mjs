/** Actual compiled Pages worker, synthetic receiver, all outbound fetches intercepted. */
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Miniflare, Response, convertV4MiniflareOptions } from 'miniflare';

const root = fileURLToPath(new URL('../', import.meta.url));
const worker = root + 'output/runtime/index.js';
const target = 'https://cockpit.example.invalid/v1/leads/ingest';
const data = { name: 'Synthetic Buyer', email: 'buyer@example.invalid', businessType: 'Synthetic business',
  frustration: 'Synthetic runtime inquiry, never sent outward.', source: 'website' };
const calls = [];
const evidence = [];
let mode = 'new';
let sequence = 0;
// Installed Miniflare 5 exposes the supported adapter for Wrangler's V4 options.
const options = convertV4MiniflareOptions({
  cf: false, host: '127.0.0.1',
  workers: [{ name: 'companysite-inbox-fixture',
  // This fixture uses the installed workerd binary's supported date, not a production setting.
  modules: true, scriptPath: worker, compatibilityDate: '2026-08-27', compatibilityFlags: ['nodejs_compat'],
  bindings: { COCKPIT_LEAD_INBOX_URL: target, COCKPIT_INGEST_TOKEN: 'synthetic-token',
    RESEND_API_KEY: 'synthetic-no-send', N8N_LEAD_WEBHOOK_URL: 'https://workflow.example.invalid/never' },
  serviceBindings: { ASSETS: () => new Response('not a fixture route', { status: 404 }) },
  outboundService: async request => {
    calls.push({ url: request.url, key: request.headers.get('Idempotency-Key') });
    assert.equal(request.url, target, 'No real provider or redirect destination may be contacted');
    assert.equal(request.headers.get('Authorization'), 'Bearer synthetic-token');
    const payload = await request.json();
    assert.deepEqual(payload.notifications, ['acknowledgment_email', 'operator_email']);
    if (mode === 'redirect') return new Response(null, { status: 302, headers: { Location: 'https://redirect.example.invalid/never' } });
    if (mode === 'conflict') return new Response('{}', { status: 409 });
    if (mode === 'unavailable') return new Response('{}', { status: 503 });
    if (mode === 'unauthorized') return new Response('{}', { status: 401 });
    if (mode === 'html') return new Response('<html>Login</html>', { headers: { 'Content-Type': 'text/html' } });
    if (mode === 'fake') return Response.json({ ok: true });
    const receipt = { ...payload, id: 'a'.repeat(32), created_at: '2026-10-02T00:00:00Z',
      deliveries: payload.notifications.map((channel, i) => ({ id: String(i + 1).padStart(32, '0'), channel,
        state: mode === 'held' ? 'uncertain' : 'pending', attempts: 0, provider_receipt: '',
        error: mode === 'held' ? 'transport_uncertain' : '' })) };
    if (mode === 'wrong-context') receipt.context.intent = 'changed';
    if (mode === 'missing-role') receipt.deliveries.pop();
    return Response.json(receipt, { status: mode === 'replay' ? 200 : 201 });
  },
  }],
});
const mf = new Miniflare({ ...options, telemetry: { enabled: false } });
try {
  for (const [scenario, expected] of [['new', 200], ['replay', 200], ['held', 200],
    ['conflict', 409], ['unavailable', 503], ['unauthorized', 503], ['html', 503],
    ['fake', 503], ['wrong-context', 503], ['missing-role', 503], ['redirect', 503]]) {
    mode = scenario; calls.length = 0; sequence++;
    const key = '00000000-0000-4000-8000-' + String(sequence).padStart(12, '0');
    const result = await mf.dispatchFetch('https://m3mm.net/api/lead', {
      method: 'POST', headers: { Origin: 'https://m3mm.net', 'Content-Type': 'application/json',
        'CF-Connecting-IP': '198.51.100.' + sequence, 'Idempotency-Key': key }, body: JSON.stringify(data),
    });
    assert.equal(result.status, expected, scenario);
    assert.equal((await result.json()).ok, expected === 200, scenario);
    assert.equal(calls.length, 1, 'Only the inbox may receive this request');
    assert.equal(calls[0].key, 'companysite:' + key);
    assert.equal(result.headers.get('Cache-Control'), 'no-store');
    assert.equal(result.headers.get('X-Content-Type-Options'), 'nosniff');
    evidence.push({ scenario, status: result.status, receiverCalls: calls.length });
  }
  mode = 'new'; calls.length = 0;
  const native = await mf.dispatchFetch('https://m3mm.net/api/lead', {
    method: 'POST', headers: { Origin: 'https://m3mm.net', 'Content-Type': 'application/x-www-form-urlencoded',
      'CF-Connecting-IP': '198.51.100.100' }, body: new URLSearchParams(data).toString(), redirect: 'manual',
  });
  assert.equal(native.status, 200);
  assert.equal(calls.length, 0, 'Native confirmation must have no receiver effects');
  const confirmation = await native.text();
  const nativeId = confirmation.match(/name="submissionId" value="([^"]+)"/)[1];
  const confirmed = await mf.dispatchFetch('https://m3mm.net/api/lead', {
    method: 'POST', headers: { Origin: 'https://m3mm.net', 'Content-Type': 'application/x-www-form-urlencoded',
      'CF-Connecting-IP': '198.51.100.100' }, body: new URLSearchParams({ ...data, submissionId: nativeId }).toString(), redirect: 'manual',
  });
  assert.equal(confirmed.status, 303);
  assert.equal(confirmed.headers.get('Location'), '/thanks');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].key, 'companysite:' + nativeId);
  evidence.push({ scenario: 'native-form', status: native.status, receiverCalls: calls.length,
    confirmationBeforeEffects: true, confirmedStatus: confirmed.status, stableHiddenIdentity: true });
  const proof = { checkedAt: new Date().toISOString(), runtime: 'actual installed workerd via Miniflare',
    workerSha256: createHash('sha256').update(await readFile(worker)).digest('hex'), evidence,
    boundaries: 'Synthetic receiver only; every outbound intercepted. No live provider, real DB or production configuration.',
    productionVerified: false };
  await mkdir(root + 'output/runtime', { recursive: true });
  await writeFile(root + 'output/runtime/inbox-runtime.json', JSON.stringify(proof, null, 2));
  console.log('PASS ' + evidence.length + ' compiled Pages worker scenarios; all outgoing requests intercepted.');
} finally { await mf.dispose(); }
