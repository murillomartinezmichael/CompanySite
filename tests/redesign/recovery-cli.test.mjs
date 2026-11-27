import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {MAX_ENVELOPE_BYTES, fingerprintKey, loadRecoveryModule, parseRecoveryArguments, readRecoveryEnvelope, validateRecoveryOptions, verifyRecoveryFile} from '../../scripts/lib/recovery-verification.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const passphrase = 'synthetic recovery ceremony phrase - never a production secret';
const context = 'm3-companysite-finance:00000000-0000-4000-8000-000000000001';
let directory, envelope, key, options, encoded;
before(async () => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'm3mm-recovery-test-'));
  key = crypto.getRandomValues(new Uint8Array(32));
  const {sealRecoveryKey} = await loadRecoveryModule();
  envelope = await sealRecoveryKey(key, passphrase, context);
  encoded = JSON.stringify(envelope, null, 2);
  const filename = path.join(directory, 'original.recovery-envelope.json');
  fs.writeFileSync(filename, encoded, {flag: 'wx', mode: 0o600});
  options = {envelope: filename, context, fingerprint: fingerprintKey(key)};
});
after(() => {key?.fill(0); if (directory) fs.rmSync(directory, {recursive: true, force: true});});
const altered = (name, transform) => {
  const value = structuredClone(envelope); transform(value);
  const filename = path.join(directory, name + '.recovery-envelope.json');
  fs.writeFileSync(filename, JSON.stringify(value), {flag: 'wx', mode: 0o600});
  return {...options, envelope: filename};
};
const cli = args => spawnSync(process.execPath, ['scripts/verify-finance-recovery.mjs', ...args], {cwd: root, input: passphrase + '\n', encoding: 'utf8', timeout: 10000});
const validArgs = () => ['--envelope', options.envelope, '--context', context, '--fingerprint', options.fingerprint];

test('verifies the actual existing crypto and reports only non-secret evidence', async () => {
  const receipt = await verifyRecoveryFile(options, passphrase);
  assert.equal(receipt.result, 'verified');
  assert.equal(receipt.keyFingerprint, options.fingerprint);
  assert.equal(receipt.envelopeSha256, crypto.createHash('sha256').update(encoded).digest('hex'));
  assert.equal(receipt.context, context);
  assert.equal(receipt.productionActivated, false);
  assert.equal(receipt.independentCustody, 'not_assessed');
  const text = JSON.stringify(receipt);
  for (const secret of [passphrase, Buffer.from(key).toString('hex'), Buffer.from(key).toString('base64'), envelope.cipher.ciphertext]) assert.ok(!text.includes(secret));
  assert.equal(fs.readFileSync(options.envelope, 'utf8'), encoded);
});
test('rejects a wrong passphrase without echoing its contents', async () => {
  const secret = 'wrong-synthetic-passphrase-123456';
  await assert.rejects(verifyRecoveryFile(options, secret), error => !error.message.includes(secret) && error.message.startsWith('Recovery verification failed.'));
});
test('rejects the wrong independently retained key fingerprint', async () => {
  await assert.rejects(verifyRecoveryFile({...options, fingerprint: '0'.repeat(64)}, passphrase), /Recovery verification failed/);
});
test('accepts uppercase fingerprint without changing key identity', async () => {
  assert.equal((await verifyRecoveryFile({...options, fingerprint: options.fingerprint.toUpperCase()}, passphrase)).keyFingerprint, options.fingerprint);
});
test('rejects a wrong expected context', async () => {
  await assert.rejects(verifyRecoveryFile({...options, context: context.slice(0, -1) + '2'}, passphrase), /Recovery verification failed/);
});
test('rejects modified authenticated envelope metadata', async () => {
  await assert.rejects(verifyRecoveryFile(altered('metadata', value => {value.createdAt = '2025-01-01T00:00:00Z';}), passphrase), /Recovery verification failed/);
});
test('rejects modified ciphertext', async () => {
  await assert.rejects(verifyRecoveryFile(altered('ciphertext', value => {value.cipher.ciphertext = (value.cipher.ciphertext[0] === 'A' ? 'B' : 'A') + value.cipher.ciphertext.slice(1);}), passphrase), /Recovery verification failed/);
});
test('rejects unsupported KDF work factors without deriving a key', async () => {
  await assert.rejects(verifyRecoveryFile(altered('kdf', value => {value.kdf.iterations = 999999999;}), passphrase), /Recovery verification failed/);
});
test('rejects extra envelope fields rather than returning their data', async () => {
  await assert.rejects(verifyRecoveryFile(altered('extra', value => {value.privateData = 'do-not-return';}), passphrase), /Recovery verification failed/);
});
test('requires all three exact non-secret arguments and rejects duplicates', () => {
  assert.deepEqual(parseRecoveryArguments(validArgs()), options);
  assert.throws(() => parseRecoveryArguments(validArgs().slice(0, 4)));
  assert.throws(() => parseRecoveryArguments(['--envelope', options.envelope, '--envelope', options.envelope, '--fingerprint', options.fingerprint]));
  assert.throws(() => parseRecoveryArguments(['--passphrase', passphrase, ...validArgs().slice(2)]));
});
test('rejects relative paths, unexpected option properties and secret-file names', () => {
  for (const value of [{...options, envelope: 'relative.recovery-envelope.json'}, {...options, envelope: path.join(directory, '.env')}, {...options, passphrase}, {...options, fingerprint: 'not-a-hash'}, {...options, context: 'another-product'}]) assert.throws(() => validateRecoveryOptions(value));
});
test('bounds file reads and rejects oversized input', () => {
  const filename = path.join(directory, 'oversize.recovery-envelope.json');
  fs.writeFileSync(filename, 'x'.repeat(MAX_ENVELOPE_BYTES + 1));
  assert.throws(() => readRecoveryEnvelope(filename), /Recovery verification failed/);
});
test('rejects empty, invalid JSON and invalid UTF-8 files', () => {
  for (const [name, data] of [['empty', ''], ['json', '{bad'], ['utf8', Buffer.from([0xff, 0xff])]]) {
    const filename = path.join(directory, name + '.recovery-envelope.json');
    fs.writeFileSync(filename, data); assert.throws(() => readRecoveryEnvelope(filename), /Recovery verification failed/);
  }
});
test('rejects directories and missing files without revealing input contents', () => {
  const filename = path.join(directory, 'directory.recovery-envelope.json');
  fs.mkdirSync(filename); assert.throws(() => readRecoveryEnvelope(filename));
  assert.throws(() => readRecoveryEnvelope(path.join(directory, 'missing.recovery-envelope.json')));
});
test('rejects final symlinks', {skip: process.platform === 'win32' ? 'Windows symlink creation can require elevation; Linux CI exercises this boundary.' : false}, () => {
  const filename = path.join(directory, 'link.recovery-envelope.json');
  fs.symlinkSync(options.envelope, filename); assert.throws(() => readRecoveryEnvelope(filename), /Recovery verification failed/);
});
test('validates key length before fingerprinting', () => {
  assert.throws(() => fingerprintKey(new Uint8Array(31)));
  assert.throws(() => fingerprintKey('not-a-key'));
});
test('real CLI refuses piped passphrases before reading or decrypting a file', () => {
  const result = cli(validArgs());
  assert.equal(result.status, 1); assert.match(result.stderr, /local interactive terminal/);
  assert.equal(result.stdout, ''); assert.ok(!result.stderr.includes(passphrase));
});
test('real CLI help and invalid-argument handling do not read secrets', () => {
  const help = cli(['--help']); assert.equal(help.status, 0); assert.match(help.stdout, /Usage:/);
  const invalid = cli(['--passphrase', passphrase]); assert.equal(invalid.status, 1);
  assert.ok(!(invalid.stdout + invalid.stderr).includes(passphrase));
});
test('preparation retains overwrite protection and adds independent verification evidence', () => {
  const source = fs.readFileSync(path.join(root, 'scripts/prepare-finance-recovery.mjs'), 'utf8');
  assert.ok(source.includes("flag:'wx'")); assert.ok(source.includes('raw?.fill(0)'));
  assert.ok(source.includes('!process.stdin.isTTY')); assert.ok(source.includes('Recovery context:'));
  assert.ok(source.includes("crypto.createHash('sha256').update(raw).digest('hex')"));
  assert.ok(!source.includes('console.log(raw')); assert.ok(!source.includes('console.log(first'));
});
