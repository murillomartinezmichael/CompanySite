import {beforeAll,describe,it,expect} from 'vitest';
import {sealRecoveryKey,openRecoveryKey,type RecoveryEnvelope} from '../../services/shared/recovery-envelope';
import fs from 'node:fs';

const passphrase='synthetic recovery passphrase for tests only';
const context='synthetic-companysite-finance:recovery-test';
let key:Uint8Array,envelope:RecoveryEnvelope;
beforeAll(async()=>{key=crypto.getRandomValues(new Uint8Array(32));envelope=await sealRecoveryKey(key,passphrase,context);});
describe('Portable encrypted recovery envelope — synthetic keys only',()=>{
 it('round trips a key without changing its bytes',async()=>{const recovered=await openRecoveryKey(envelope,passphrase,context);expect(recovered).toEqual(key);recovered.fill(0);});
 it('does not embed the raw key or passphrase',()=>{const text=JSON.stringify(envelope);expect(text).not.toContain(passphrase);expect(text).not.toContain(Buffer.from(key).toString('base64'));expect(text).not.toContain(Buffer.from(key).toString('hex'));});
 it('creates an independent salt, IV and ciphertext for another recovery copy',async()=>{const another=await sealRecoveryKey(key,passphrase,context);expect(another.kdf.salt).not.toBe(envelope.kdf.salt);expect(another.cipher.iv).not.toBe(envelope.cipher.iv);expect(another.cipher.ciphertext).not.toBe(envelope.cipher.ciphertext);});
 it('rejects the wrong recovery passphrase',async()=>await expect(openRecoveryKey(envelope,'another synthetic recovery phrase',context)).rejects.toThrow('recovery_verification_failed'));
 it('binds recovery to its expected application context',async()=>await expect(openRecoveryKey(envelope,passphrase,'another-companysite:recovery')).rejects.toThrow('invalid_recovery_envelope'));
 it('authenticates metadata rather than trusting the visible label',async()=>{const changed=structuredClone(envelope);changed.createdAt='2026-01-01T00:00:00Z';await expect(openRecoveryKey(changed,passphrase,context)).rejects.toThrow('recovery_verification_failed');});
 it('detects tampered ciphertext',async()=>{const changed=structuredClone(envelope);changed.cipher.ciphertext=(changed.cipher.ciphertext[0]==='A'?'B':'A')+changed.cipher.ciphertext.slice(1);await expect(openRecoveryKey(changed,passphrase,context)).rejects.toThrow();});
 it.each([0,1,599999,999999999])('rejects an untrusted work factor %s before deriving a key',async iterations=>{const changed=structuredClone(envelope);(changed.kdf as any).iterations=iterations;await expect(openRecoveryKey(changed,passphrase,context)).rejects.toThrow('invalid_recovery_envelope');});
 it.each(['short','', 'x'.repeat(1025)])('rejects invalid passphrase length',async p=>await expect(sealRecoveryKey(key,p,context)).rejects.toThrow());
 it.each([0,16,31,33,64])('does not accept a key of %s bytes',async size=>await expect(sealRecoveryKey(new Uint8Array(size),passphrase,context)).rejects.toThrow('invalid_recovery_key_or_context'));
 it('requires a bounded valid encoding and exact nonce length',async()=>{const changed=structuredClone(envelope);changed.cipher.iv='not-base64';await expect(openRecoveryKey(changed,passphrase,context)).rejects.toThrow('invalid_recovery_envelope');});
 it('operator script refuses a noninteractive secret path and never prints keys',()=>{const source=fs.readFileSync('scripts/prepare-finance-recovery.mjs','utf8');expect(source).toContain('!process.stdin.isTTY');expect(source).toContain("flag:'wx'");expect(source).toContain('raw?.fill(0)');expect(source).not.toContain('console.log(raw');expect(source).not.toContain('console.log(first');expect(source).not.toContain('wrangler');});
});
