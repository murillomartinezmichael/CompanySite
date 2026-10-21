/** Portable encrypted recovery envelope. Passphrases and raw keys never belong
 * in git, logs, browser storage, command arguments or a financial data export. */
export interface RecoveryEnvelope {
 format:'m3mm-private-recovery-v1';
 context:string;
 createdAt:string;
 kdf:{name:'PBKDF2';hash:'SHA-256';iterations:600000;salt:string};
 cipher:{name:'AES-GCM';iv:string;tagLength:128;ciphertext:string};
}
const encoder=new TextEncoder();
const b64=(value:Uint8Array)=>btoa(String.fromCharCode(...value));
function bytes(value:unknown,expected:number):Uint8Array<ArrayBuffer>{
 if(typeof value!=='string'||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)||value.length>1024)throw new Error('invalid_recovery_envelope');
 let result:Uint8Array<ArrayBuffer>;try{result=Uint8Array.from(atob(value),c=>c.charCodeAt(0));}catch{throw new Error('invalid_recovery_envelope');}
 if(result.length!==expected)throw new Error('invalid_recovery_envelope');return result;
}
function password(value:string):Uint8Array<ArrayBuffer>{
 if(typeof value!=='string'||value.length<16||value.length>1024||!value.trim())throw new Error('recovery_passphrase_must_be_16_to_1024_characters');return encoder.encode(value);
}
const contextValid=(context:string)=>typeof context==='string'&&/^[A-Za-z0-9][A-Za-z0-9._:-]{7,199}$/.test(context);
async function wrappingKey(passphrase:string,salt:Uint8Array<ArrayBuffer>):Promise<CryptoKey>{
 const raw=password(passphrase);
 try{const material=await crypto.subtle.importKey('raw',raw,'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',iterations:600000,salt},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
 finally{raw.fill(0);}
}
const aad=(envelope:Pick<RecoveryEnvelope,'format'|'context'|'createdAt'>)=>encoder.encode(JSON.stringify({format:envelope.format,context:envelope.context,createdAt:envelope.createdAt}));
export async function sealRecoveryKey(key:Uint8Array,passphrase:string,context:string):Promise<RecoveryEnvelope>{
 if(!(key instanceof Uint8Array)||key.length!==32||!contextValid(context))throw new Error('invalid_recovery_key_or_context');
 const salt=crypto.getRandomValues(new Uint8Array(32)),iv=crypto.getRandomValues(new Uint8Array(12));
 const envelope:RecoveryEnvelope={format:'m3mm-private-recovery-v1',context,createdAt:new Date().toISOString(),kdf:{name:'PBKDF2',hash:'SHA-256',iterations:600000,salt:b64(salt)},cipher:{name:'AES-GCM',iv:b64(iv),tagLength:128,ciphertext:''}};
 const plaintext=new Uint8Array(key);
 try{const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(envelope),tagLength:128},await wrappingKey(passphrase,salt),plaintext);envelope.cipher.ciphertext=b64(new Uint8Array(ciphertext));return envelope;}finally{plaintext.fill(0);}
}
export async function openRecoveryKey(value:unknown,passphrase:string,expectedContext:string):Promise<Uint8Array>{
 const e=value as RecoveryEnvelope;
 if(!e||typeof e!=='object'||Array.isArray(e)||Object.keys(e).sort().join(',')!=='cipher,context,createdAt,format,kdf'||e.format!=='m3mm-private-recovery-v1'||e.context!==expectedContext||!contextValid(expectedContext)||!Number.isFinite(Date.parse(e.createdAt))||e.kdf?.name!=='PBKDF2'||e.kdf.hash!=='SHA-256'||e.kdf.iterations!==600000||e.cipher?.name!=='AES-GCM'||e.cipher.tagLength!==128)throw new Error('invalid_recovery_envelope');
 const salt=bytes(e.kdf.salt,32),iv=bytes(e.cipher.iv,12),ciphertext=bytes(e.cipher.ciphertext,48);
 try{const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad(e),tagLength:128},await wrappingKey(passphrase,salt),ciphertext);const result=new Uint8Array(raw);if(result.length!==32)throw new Error();return result;}
 catch{throw new Error('recovery_verification_failed');}
}
