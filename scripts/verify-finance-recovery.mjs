#!/usr/bin/env node
// Local operator only: do not pass secrets through chat, flags, files or pipes.
import {Writable} from 'node:stream';
import readline from 'node:readline/promises';
import {parseRecoveryArguments, verifyRecoveryFile} from './lib/recovery-verification.mjs';

const usage = 'Usage: node scripts/verify-finance-recovery.mjs --envelope <absolute .recovery-envelope.json path> --context <original context> --fingerprint <separately retained SHA-256 key fingerprint>';
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--help') {
  console.log(usage);
  process.exit(0);
}
let options;
try { options = parseRecoveryArguments(args); }
catch { console.error(usage); process.exit(1); }
if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error('Use a local interactive terminal. Passphrases are never accepted in arguments, environment variables, files or noninteractive input.');
  process.exit(1);
}
let muted = false;
const quiet = new Writable({write(chunk, _encoding, done) { if (!muted) process.stdout.write(chunk); done(); }});
const prompt = readline.createInterface({input: process.stdin, output: quiet, terminal: true});
let passphrase = '';
let interrupted = false;
prompt.on('SIGINT', () => { interrupted = true; prompt.close(); });
try {
  console.log('Verify the original context and fingerprint against your separately retained record, not values supplied with an untrusted envelope.');
  process.stdout.write('Recovery passphrase (hidden; local terminal only): ');
  muted = true;
  try { passphrase = await prompt.question(''); }
  finally { muted = false; process.stdout.write('\n'); }
  if (interrupted) throw new Error('interrupted');
  const receipt = await verifyRecoveryFile(options, passphrase);
  passphrase = '';
  console.log(JSON.stringify(receipt, null, 2));
  console.log('No key was printed, saved, uploaded or activated. This check alone does not prove independent recovery custody or a production database restore.');
} catch {
  console.error('Recovery verification failed or was interrupted. No key was exported or activated.');
  process.exitCode = 1;
} finally {
  passphrase = '';
  prompt.close();
}
