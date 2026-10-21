/** Offline operator recovery checks. No network, secret installation or raw-key output. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const MAX_ENVELOPE_BYTES = 8192;
const CONTEXT = /^m3-companysite-finance:[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const FINGERPRINT = /^[a-f0-9]{64}$/i;
const failure = () => new Error('Recovery verification failed. Check the envelope, separately retained context/fingerprint, and passphrase.');

export function validateRecoveryOptions(options) {
  if (!options || typeof options !== 'object' ||
      Object.keys(options).sort().join(',') !== 'context,envelope,fingerprint' ||
      typeof options.envelope !== 'string' || !path.isAbsolute(options.envelope) ||
      !options.envelope.endsWith('.recovery-envelope.json') ||
      typeof options.context !== 'string' || !CONTEXT.test(options.context) ||
      typeof options.fingerprint !== 'string' || !FINGERPRINT.test(options.fingerprint)) {
    throw new Error('Provide an absolute .recovery-envelope.json path, the original context, and its separately retained SHA-256 key fingerprint.');
  }
  return {...options, fingerprint: options.fingerprint.toLowerCase()};
}

export function parseRecoveryArguments(args) {
  if (!Array.isArray(args) || args.length !== 6) throw new Error('Invalid recovery verification arguments.');
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--envelope', '--context', '--fingerprint'].includes(args[i])) throw new Error('Invalid recovery verification arguments.');
    const key = args[i].slice(2);
    if (Object.hasOwn(options, key)) throw new Error('Duplicate recovery verification argument.');
    options[key] = args[i + 1];
  }
  return validateRecoveryOptions(options);
}

export function fingerprintKey(key) {
  if (!(key instanceof Uint8Array) || key.byteLength !== 32) throw failure();
  return crypto.createHash('sha256').update(key).digest('hex');
}

/** Bounded regular-file reads; never follow a final symlink or open a pipe/device. */
export function readRecoveryEnvelope(filename) {
  if (typeof filename !== 'string' || !path.isAbsolute(filename) || !filename.endsWith('.recovery-envelope.json')) throw failure();
  let fd;
  const buffer = Buffer.alloc(MAX_ENVELOPE_BYTES + 1);
  try {
    if (!fs.lstatSync(filename).isFile()) throw failure();
    const flags = fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0) | (fs.constants.O_NONBLOCK || 0);
    fd = fs.openSync(filename, flags);
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size < 1 || stat.size > MAX_ENVELOPE_BYTES) throw failure();
    let length = 0;
    while (length < buffer.length) {
      const count = fs.readSync(fd, buffer, length, buffer.length - length, length);
      if (!count) break;
      length += count;
    }
    if (length !== stat.size || length > MAX_ENVELOPE_BYTES) throw failure();
    const text = new TextDecoder('utf-8', {fatal: true}).decode(buffer.subarray(0, length));
    const envelope = JSON.parse(text);
    return {envelope, envelopeSha256: crypto.createHash('sha256').update(buffer.subarray(0, length)).digest('hex')};
  } catch {
    throw failure();
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
    buffer.fill(0);
  }
}

let recoveryModule;
export async function loadRecoveryModule() {
  if (!recoveryModule) {
    // Use the same existing implementation as key preparation; do not fork crypto.
    const {default: ts} = await import('typescript');
    const source = fs.readFileSync(fileURLToPath(new URL('../../services/shared/recovery-envelope.ts', import.meta.url)), 'utf8');
    const code = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext}}).outputText;
    recoveryModule = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  }
  return recoveryModule;
}

export async function verifyRecoveryFile(input, passphrase) {
  const options = validateRecoveryOptions(input);
  let restored;
  try {
    const {envelope, envelopeSha256} = readRecoveryEnvelope(options.envelope);
    const {openRecoveryKey} = await loadRecoveryModule();
    restored = await openRecoveryKey(envelope, passphrase, options.context);
    const actual = fingerprintKey(restored);
    if (!crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(options.fingerprint, 'hex'))) throw failure();
    return {
      format: 'm3mm-private-recovery-check-v1', result: 'verified',
      context: options.context, keyFingerprint: actual, envelopeSha256,
      envelopeCreatedAt: envelope.createdAt, checkedAt: new Date().toISOString(),
      independentCustody: 'not_assessed', productionActivated: false,
    };
  } catch {
    // Never propagate provider/parser errors containing input or decrypted bytes.
    throw failure();
  } finally {
    restored?.fill(0);
  }
}
