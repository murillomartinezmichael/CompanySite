import { type FinanceState } from '../../src/lib/finance/model';
import { validateFinanceState } from './validation';
import { SafeError, stableJson, toBase64, fromBase64, sha256 } from '../shared/safe-json';

export interface Statement {
  bind(...values:unknown[]):Statement;
  first<T=Record<string,unknown>>():Promise<T|null>;
  run():Promise<{success:boolean;meta:{changes:number}}>;
}
export interface PrivateDatabase { prepare(sql:string):Statement; }
export interface Receipt {requestId:string;fingerprint:string;recordId:string;duplicate:boolean;}
export interface StoreDocument {state:FinanceState;receipts:Receipt[];refreshRunIds:string[];refreshRunDigests?:Array<{runId:string;digest:string}>;}
export interface StoredRow {owner_subject:string;revision:number;sealed_json:string;event_type:string;updated_at:string;}
export interface StoredDocument {revision:number;document:StoreDocument;}
export interface EncryptedBackup {format:'m3mm-finance-encrypted-v1';row:StoredRow;digest:string;}
interface Sealed {v:1;nonce:string;ciphertext:string;}
const encoder=new TextEncoder();

async function dataKey(value:string):Promise<CryptoKey>{
  try {const raw=fromBase64(value);if(raw.length!==32)throw new Error();return await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);}
  catch {throw new SafeError('private_key_unavailable',503);}
}
const aad=(owner:string,revision:number)=>encoder.encode(stableJson({application:'m3mm-finance',schema:1,owner,revision}));
async function seal(document:StoreDocument,owner:string,revision:number,key:CryptoKey):Promise<string>{
  const text=stableJson(document);
  if(encoder.encode(text).length>786432)throw new SafeError('state_capacity_limit',413);
  const nonce=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce,additionalData:aad(owner,revision),tagLength:128},key,encoder.encode(text));
  return JSON.stringify({v:1,nonce:toBase64(nonce),ciphertext:toBase64(new Uint8Array(ciphertext))} satisfies Sealed);
}
async function open(row:StoredRow,key:CryptoKey):Promise<StoreDocument>{
  try {
    const payload=JSON.parse(row.sealed_json) as Sealed;
    if(payload.v!==1||typeof payload.nonce!=='string'||typeof payload.ciphertext!=='string'||payload.ciphertext.length>1100000)throw new Error();
    const nonce=fromBase64(payload.nonce);if(nonce.length!==12)throw new Error();
    const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:nonce,additionalData:aad(row.owner_subject,row.revision),tagLength:128},key,fromBase64(payload.ciphertext));
    const document=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(plaintext)) as StoreDocument;
    validateFinanceState(document.state);
    if(!Array.isArray(document.receipts)||document.receipts.length>20000||!Array.isArray(document.refreshRunIds)||document.refreshRunIds.length>10000)throw new Error();
    if(document.refreshRunDigests!==undefined&&(!Array.isArray(document.refreshRunDigests)||document.refreshRunDigests.length>10000||document.refreshRunDigests.some(item=>!item||!/^[A-Za-z0-9_-]{8,80}$/.test(item.runId)||!/^[a-f0-9]{64}$/.test(item.digest))))throw new Error();
    return document;
  }catch{throw new SafeError('private_store_integrity_error',503);}
}
/** Encrypted single-owner store. Updates compare revision atomically; callers
 * re-read and revalidate on conflict rather than losing another write. */
export class FinanceRepository {
  constructor(private readonly db:PrivateDatabase,private readonly owner:string,private readonly encodedKey:string){
    if(!owner||owner.length>256)throw new SafeError('owner_not_configured',503);
  }
  async row():Promise<StoredRow|null>{return this.db.prepare('SELECT owner_subject,revision,sealed_json,event_type,updated_at FROM finance_state WHERE owner_subject = ?').bind(this.owner).first<StoredRow>();}
  async load():Promise<StoredDocument|null>{
    const key=await dataKey(this.encodedKey);
    const row=await this.row();if(!row)return null;
    return{revision:row.revision,document:await open(row,key)};
  }
  async commit(document:StoreDocument,expectedRevision:number,eventType:string):Promise<boolean>{
    if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0)throw new SafeError('invalid_expected_revision');
    if(!['initial-import','activity','goal','observation','refresh','restore','operations'].includes(eventType))throw new SafeError('invalid_event_type');
    validateFinanceState(document.state);
    const next=expectedRevision+1;const encrypted=await seal(document,this.owner,next,await dataKey(this.encodedKey));const now=new Date().toISOString();
    const statement=expectedRevision===0
      ?this.db.prepare('INSERT OR IGNORE INTO finance_state (owner_subject,revision,sealed_json,event_type,updated_at) VALUES (?, ?, ?, ?, ?)').bind(this.owner,next,encrypted,eventType,now)
      :this.db.prepare('UPDATE finance_state SET revision = ?, sealed_json = ?, event_type = ?, updated_at = ? WHERE owner_subject = ? AND revision = ?').bind(next,encrypted,eventType,now,this.owner,expectedRevision);
    const result=await statement.run();if(!result.success)throw new SafeError('private_store_write_unconfirmed',503);
    // D1 counts the audit-trigger insertion as well as the state row. A CAS
    // miss performs neither operation; any positive change count confirms it.
    return result.meta.changes>0;
  }
  async backup():Promise<EncryptedBackup>{
    const row=await this.row();if(!row)throw new SafeError('no_private_records',404);
    // Verify before exporting. A corrupted ciphertext is not a valid backup.
    await open(row,await dataKey(this.encodedKey));
    return{format:'m3mm-finance-encrypted-v1',row,digest:await sha256(stableJson(row))};
  }
  async restoreIntoEmpty(value:unknown):Promise<boolean>{
    const backup=value as EncryptedBackup;
    if(!backup||backup.format!=='m3mm-finance-encrypted-v1'||!backup.row||backup.row.owner_subject!==this.owner||!Number.isSafeInteger(backup.row.revision)||backup.row.revision<1||typeof backup.digest!=='string'||backup.digest!==await sha256(stableJson(backup.row)))throw new SafeError('invalid_backup');
    if(await this.row())throw new SafeError('restore_requires_empty_store',409);
    const document=await open(backup.row,await dataKey(this.encodedKey));
    return this.commit(document,0,'restore');
  }
}
