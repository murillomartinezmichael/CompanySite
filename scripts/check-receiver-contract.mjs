/** Server-free contract stage. Execute the exact compiled Pages worker in a VM;
 * every import is denied and its only fetch is a synthetic receiver function. */
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash, createHmac, webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const mode = process.argv[2] ?? 'capture';
assert.ok(['capture', 'receipts'].includes(mode));
const directory = root + 'output/receiver-contract/';
await mkdir(directory, { recursive: true });
const compiled = await readFile(root + 'output/runtime/index.js', 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const owner = '1'.repeat(32);
// Matches the existing guarded runner's synthetic-only JWT key. Never a real account.
const secret = 'synthetic-test-only-' + 'x'.repeat(50);
const captured = mode === 'receipts' ? JSON.parse(await readFile(directory + 'producer-capture.json', 'utf8')) : null;
const issued = captured?.issued ?? Math.floor(Date.now() / 1000);
const expires = issued + 3600;
const head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
const claims = Buffer.from(JSON.stringify({ sub: owner, iat: issued, exp: expires })).toString('base64url');
const jwt = `${head}.${claims}.${createHmac('sha256', secret).update(`${head}.${claims}`).digest('base64url')}`;
const authHash = sha('Bearer ' + jwt);
const receiver = mode === 'receipts' ? JSON.parse(await readFile(process.argv[3], 'utf8')) : null;
if (captured) {
  assert.equal(sha(compiled), captured.worker_sha256, 'Compiled source changed between linked stages');
  assert.equal(receiver.capture_sha256, sha(await readFile(directory + 'producer-capture.json')), 'Receiver proof belongs to another capture');
}
const incoming = captured?.cases ?? [
  { name: 'website', id: '00000000-0000-4000-8000-000000000101', data: {
    name: 'Synthetic Renée 😀', email: 'website@example.invalid', businessType: 'Synthetic café and workshop services '.repeat(3),
    currentUrl: 'https://example.invalid/current?view=one&label=café', frustration: 'Synthetic A&B, "quotes" and café 😀 inquiry; never delivered.',
    preferredStart: 'Next quarter', source: 'website', referredBy: 'Synthetic referral', intent: 'book:free-review',
    utm_source: 'synthetic-source', utm_medium: 'referral', utm_campaign: 'synthetic-campaign', utm_content: 'synthetic-content', utm_term: 'synthetic-term',
  } },
  { name: 'roadmap', id: '00000000-0000-4000-8000-000000000102', data: {
    name: 'Roadmap subscriber', email: 'roadmap@example.invalid', businessType: 'roadmap-subscriber', source: 'roadmap',
    intent: 'book:roadmap-subscribe', frustration: 'Roadmap subscriber wants: synthetic previews, café 😀 updates',
    utm_source: 'synthetic-source', utm_campaign: 'synthetic-roadmap',
  } },
];
let active; let reply; const wire = []; const denied = [];
const sink = async (url, init) => {
  if (String(url) !== 'https://cockpit.example.invalid/v1/leads/ingest') { denied.push('unapproved-fetch'); throw new Error('Denied fetch'); }
  assert.equal(init.method, 'POST'); assert.equal(init.redirect, 'manual');
  const headers = new Headers(init.headers); assert.equal(headers.get('Authorization'), 'Bearer ' + jwt);
  const out = { url: String(url), method: init.method, redirect: init.redirect, body: String(init.body),
    headers: { 'Content-Type': headers.get('Content-Type'), 'Idempotency-Key': headers.get('Idempotency-Key') }, authorization_sha256: sha(headers.get('Authorization')) };
  wire.push(out);
  if (mode === 'receipts') {
    assert.deepEqual(out, active.outbound, 'Replay must regenerate the exact captured payload/header identity');
    return Response.json(reply.body, { status: reply.status });
  }
  // Capture does not pretend this fake response is a stored receipt.
  return Response.json({}, { status: 503 });
};
const context = vm.createContext({ Request, Response, Headers, URL, URLSearchParams, TextEncoder, TextDecoder, AbortController,
  ReadableStream, WritableStream, TransformStream, crypto: webcrypto, fetch: sink, setTimeout, clearTimeout,
  console: { log() {}, warn() {}, error() {} } }, { codeGeneration: { strings: false, wasm: false } });
const module = new vm.SourceTextModule(compiled, { context, identifier: 'exact-compiled-pages-worker',
  importModuleDynamically() { denied.push('dynamic-import'); throw new Error('Imports denied'); } });
await module.link(() => { denied.push('static-import'); throw new Error('Imports denied'); });
await module.evaluate({ timeout: 10000 });
assert.equal(vm.runInContext('typeof process', context), 'undefined');
assert.equal(vm.runInContext('typeof require', context), 'undefined');
assert.throws(() => vm.runInContext('eval("1")', context));
const env = { COCKPIT_LEAD_INBOX_URL: 'https://cockpit.example.invalid/v1/leads/ingest', COCKPIT_INGEST_TOKEN: jwt,
  ASSETS: { fetch() { throw new Error('Asset route denied'); } } };
const evidence = [];
for (const item of incoming) {
  active = item;
  const responses = mode === 'capture' ? [{ name: 'capture', status: 503 }] : receiver.cases.find(row => row.name === item.name).responses;
  for (const candidate of responses) {
    reply = candidate;
    const request = new Request('https://m3mm.net/api/lead', { method: 'POST', headers: {
      Origin: 'https://m3mm.net', 'Content-Type': 'application/json', 'Idempotency-Key': item.id,
      'CF-Connecting-IP': `192.0.2.${evidence.length + 1}`,
    }, body: JSON.stringify(item.data) });
    const before = wire.length;
    const result = await module.namespace.default.fetch(request, env, { waitUntil() {}, passThroughOnException() {} });
    const body = await result.json();
    assert.equal(wire.length, before + 1);
    if (mode === 'capture') { assert.equal(result.status, 503); item.outbound = wire.at(-1); }
    else { assert.equal(result.status, candidate.status === 409 ? 409 : 200); assert.equal(body.ok, candidate.status !== 409); }
    evidence.push({ name: item.name, receiverScenario: candidate.name, producerStatus: result.status, receiptAccepted: body.ok === true });
  }
}
assert.deepEqual(denied, []);
const proof = { mode, checkedAt: new Date().toISOString(), node: process.version, worker_sha256: sha(compiled),
  script_sha256: sha(await readFile(fileURLToPath(import.meta.url))), issued, expires, owner,
  authorization_sha256: authHash, cases: incoming, evidence, violations: denied,
  controls: ['no process global', 'no require global', 'string code generation denied', 'module imports denied', 'single synthetic fetch function'],
  limits: 'Exact compiled worker under Node VM/web APIs, not workerd runtime or a networked bridge. Synthetic JWT hash only; no live token/secret retained.',
  ...(receiver ? { receiver_proof_sha256: sha(await readFile(process.argv[3])) } : {}),
};
await writeFile(directory + (mode === 'capture' ? 'producer-capture.json' : 'producer-acceptance.json'), JSON.stringify(proof, null, 2));
console.log(`PASS ${mode}: ${evidence.length} compiled producer cases, no app server/import/network/provider access.`);
