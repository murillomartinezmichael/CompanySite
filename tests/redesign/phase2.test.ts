import {operationsFixture} from './operations-fixture';
import {beforeAll,afterAll,describe,it,expect} from 'vitest';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import authWorker,{verifySignedOwnerToken,extractSession,type OwnerAuthEnvironment, type PublicJwk} from '../../services/owner-auth/worker';
import storeWorker,{type StoreEnvironment} from '../../services/private-finance/worker';
import {FinanceRepository,type PrivateDatabase} from '../../services/private-finance/repository';
import {validateFinanceState,previewImport,applyObservation,emptyFinanceState} from '../../services/private-finance/validation';
import {applyRefresh} from '../../services/private-finance/refresh';
import {sha256,stableJson,toBase64} from '../../services/shared/safe-json';
import {makeFixture,makeActivity} from './fixtures.mjs';
import type {FinanceState} from '../../src/lib/finance/model';

const owner='synthetic-owner';const issuer='https://synthetic.cloudflareaccess.com';const audience='synthetic-audience';
let privateKey:CryptoKey;let jwk:PublicJwk;let signedToken:string;let authEnv:OwnerAuthEnvironment;
let mf:Miniflare;let db:PrivateDatabase;let env:StoreEnvironment;let sessionActive=true;
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'m3mm-finance-synthetic-'));
const encoder=new TextEncoder();
function encoded(value:unknown){return toBase64(encoder.encode(JSON.stringify(value))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
async function token(payloadChanges:Record<string,unknown>={},headerChanges:Record<string,unknown>={}){
 const now=Math.floor(Date.now()/1000);
 const header=encoded({alg:'RS256',typ:'JWT',kid:'synthetic-key',...headerChanges});
 const payload=encoded({sub:owner,iss:issuer,aud:[audience],type:'app',iat:now-10,exp:now+1800,...payloadChanges});
 const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',privateKey,encoder.encode(header+'.'+payload));
 return header+'.'+payload+'.'+toBase64(new Uint8Array(signature)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
function privateFixture():FinanceState{
 const state=makeFixture();state.mode='private';
 for(const item of [...state.accounts,...state.silver,...state.cds])for(const point of item.history)point.sourceType='user';
 return state;
}
function request(route:string,body?:unknown,key?:string,changes:Record<string,string>={}){return new Request('https://finance-store.internal'+route,{method:body===undefined?'GET':'POST',headers:{'Cf-Access-Jwt-Assertion':signedToken,'X-Owner-Subject':owner,...(body===undefined?{}:{'Content-Type':'application/json'}),...(key?{'Idempotency-Key':key}:{}),...changes},body:body===undefined?undefined:JSON.stringify(body)});}
async function call(route:string,body?:unknown,key?:string,environment=env){return storeWorker.fetch(request(route,body,key),environment);}
const parsed=async(response:Response)=>({status:response.status,body:await response.json() as any,headers:response.headers});
const newMf=()=>new Miniflare({...convertV4MiniflareOptions({name:'synthetic-finance-test',modules:true,script:'export default {fetch(){return new Response("synthetic database harness")}}',compatibilityDate:'2026-08-27',d1Databases:{DB:'m3mm-phase2-synthetic-db',RESTORE_DB:'m3mm-phase2-restore-db'}}),resourcePersistencePath:directory});

beforeAll(async()=>{
 const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']) as CryptoKeyPair;
 privateKey=pair.privateKey;jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'synthetic-key',use:'sig',alg:'RS256'};
 signedToken=await token();
 authEnv={OWNER_AUTH_APPROVED:'true',OWNER_ISSUER:issuer,OWNER_AUDIENCE:audience,OWNER_SUBJECT:owner,OWNER_KEYS:{fetch:async()=>Response.json({keys:[jwk]})},OWNER_SESSION_STATUS:{fetch:async request=>{const value=await request.json() as any;return Response.json({active:sessionActive,subject:value.subject,tokenHash:value.tokenHash,checkedAt:new Date().toISOString()});}}};
 mf=newMf();db=await mf.getD1Database('DB') as unknown as PrivateDatabase;
 const sql=fs.readFileSync(path.resolve('services/private-finance/migrations/0001_encrypted_store.sql'),'utf8');
 const statements=sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g)!;
 for(const statement of statements)await db.prepare(statement).run();
 env={OWNER_AUTH:{fetch:request=>authWorker.fetch(request,authEnv)},OWNER_SUBJECT:owner,OWNER_AUTH_ISSUER:issuer,OWNER_AUTH_AUDIENCE:audience,FINANCE_STORE_APPROVED:'true',FINANCE_DB:db,FINANCE_ENCRYPTION_KEY:toBase64(crypto.getRandomValues(new Uint8Array(32))),FINANCE_IMPORT_APPROVED:'true'};
},30000);
afterAll(async()=>{await mf?.dispose();});

describe('Actual RSA signature and owner-session verification',()=>{
 it('accepts a correctly signed owner application token',async()=>expect((await verifySignedOwnerToken(signedToken,{issuer,audience,ownerSubject:owner},[jwk])).sub).toBe(owner));
 it('rejects an altered payload even when the subject looks correct',async()=>{const parts=signedToken.split('.');parts[1]=encoded({sub:owner,iss:issuer,aud:[audience]});await expect(verifySignedOwnerToken(parts.join('.'),{issuer,audience,ownerSubject:owner},[jwk])).rejects.toThrow();});
 it.each([{alg:'none'},{alg:'HS256'},{jku:'https://untrusted.invalid/keys'},{x5u:'https://untrusted.invalid/cert'},{kid:'unknown-key'},{typ:'refresh'},{crit:['b64']}])('rejects untrusted JOSE headers %j',async header=>await expect(verifySignedOwnerToken(await token({},header),{issuer,audience,ownerSubject:owner},[jwk])).rejects.toThrow());
 it.each([{sub:'synthetic-investor'},{iss:'https://other.invalid'},{aud:['other-app']},{type:'global'},{exp:1},{iat:9999999999},{nbf:9999999999}])('rejects invalid signed claims %j',async changes=>await expect(verifySignedOwnerToken(await token(changes),{issuer,audience,ownerSubject:owner},[jwk])).rejects.toThrow());
 it('rejects duplicate key identifiers',async()=>await expect(verifySignedOwnerToken(signedToken,{issuer,audience,ownerSubject:owner},[jwk,jwk])).rejects.toThrow());
 it('rejects conflicting header and cookie tokens',()=>expect(()=>extractSession(new Request('https://owner-auth.internal/verify',{headers:{'Cf-Access-Jwt-Assertion':'one',Cookie:'CF_Authorization=two'}}))).toThrow());
 it('accepts the one explicit authorization cookie',()=>expect(extractSession(new Request('https://owner-auth.internal/verify',{headers:{Cookie:'CF_Authorization='+signedToken}}))).toBe(signedToken));
 it('fails closed before service activation',async()=>expect((await authWorker.fetch(new Request('https://owner-auth.internal/verify'),{})).status).toBe(503));
 it('checks revocation instead of relying only on a valid signature',async()=>{sessionActive=false;try{expect((await authWorker.fetch(new Request('https://owner-auth.internal/verify',{headers:{'Cf-Access-Jwt-Assertion':signedToken}}),authEnv)).status).toBe(401);}finally{sessionActive=true;}});
 it('rejects stale revocation evidence',async()=>{const altered={...authEnv,OWNER_SESSION_STATUS:{fetch:async(r:Request)=>{const value=await r.json() as any;return Response.json({active:true,...value,checkedAt:'2001-01-01T00:00:00Z'});}}};expect((await authWorker.fetch(new Request('https://owner-auth.internal/verify',{headers:{'Cf-Access-Jwt-Assertion':signedToken}}),altered)).status).toBe(503);});
});

describe('Private source validation and truthful observations',()=>{
 it('accepts synthetic source-shaped records without changing their values',()=>expect(validateFinanceState(privateFixture())).toEqual(privateFixture()));
 it('keeps demonstrations out of the real-record import path',()=>expect(()=>validateFinanceState(makeFixture())).toThrow());
 it.each([['extraField','not allowed'],['accounts','not-an-array'],['asOf','yesterday']])('rejects invalid root field %s',(key,value)=>expect(()=>validateFinanceState({...privateFixture(),[key]:value})).toThrow());
 it('rejects duplicate account identities across brokerage and CDs',()=>{const s=privateFixture();s.cds[0].id=s.accounts[0].id;expect(()=>validateFinanceState(s)).toThrow();});
 it('requires a dated source for dealer proceeds',()=>{const s=privateFixture();s.silver[0].dealerBuybackCents=100;expect(()=>validateFinanceState(s)).toThrow();});
 it('keeps provisional coin identity and unresolved obligations in the preview',async()=>{const p=await previewImport(privateFixture());expect(p.warnings).toContain('metal_type_or_weight_provisional');expect(p.warnings).toContain('unresolved_obligation_preserved');expect(p.accounts).toBe(2);});
 it('retains separate same-account observations rather than creating accounts',()=>expect(privateFixture().accounts).toHaveLength(2));
 it('does not treat a later retrieval of an older balance as a newer CD balance',()=>{const s=privateFixture();const before=s.cds[0].balanceCents;const result=applyObservation(s,{accountId:'cd-0',kind:'cd-balance',observation:{id:'old-but-retrieved-now',source:'synthetic source',sourceType:'user',userConfirmed:true,priceDate:'2026-10-01',observedAt:new Date().toISOString(),valueCents:1}});expect(result.state.cds[0].balanceCents).toBe(before);expect(result.selected).toBe(false);expect(result.state.cds[0].history).toHaveLength(2);});
 it('does not replace a known value with missing-price zero',()=>{const s=privateFixture();const r=applyObservation(s,{accountId:'cd-0',kind:'cd-balance',observation:{...s.cds[0].history[0],id:'missing-price',observedAt:new Date().toISOString(),valueCents:null}});expect(r.state.cds[0].balanceCents).toBe(s.cds[0].balanceCents);});
 it('rejects futures and ETF substitutes for silver spot',()=>{const s=privateFixture();expect(()=>applyObservation(s,{accountId:'american',kind:'silver-spot-estimate',quoteType:'futures',observation:{...s.silver[0].history[0],id:'bad-proxy',quantityAtObservation:'60',unitPriceCents:3000}})).toThrow();});
 it('reconciles metal value from historical ounces and price exactly',()=>{const s=privateFixture();const r=applyObservation(s,{accountId:'american',kind:'silver-spot-estimate',quoteType:'spot',quoteCurrency:'USD',quoteUnit:'troy-ounce',observation:{...s.silver[0].history[0],id:'new-spot',quantityAtObservation:'60',unitPriceCents:3000,valueCents:180000}});expect(r.changed).toBe(true);});
 it('rejects inconsistent silver arithmetic',()=>{const s=privateFixture();expect(()=>applyObservation(s,{accountId:'american',kind:'silver-spot-estimate',quoteType:'spot',quoteCurrency:'USD',quoteUnit:'troy-ounce',observation:{...s.silver[0].history[0],id:'bad-spot',quantityAtObservation:'60',unitPriceCents:3000,valueCents:1}})).toThrow();});
});

describe('Actual local D1 persistence with signed owner sessions',()=>{
 it('denies direct access with a forged owner header but no session',async()=>expect((await storeWorker.fetch(new Request('https://finance-store.internal/state',{headers:{'X-Owner-Subject':owner}}),env)).status).toBe(401));
 it('denies a verified session with the wrong actor header',async()=>expect((await storeWorker.fetch(request('/state',undefined,undefined,{'X-Owner-Subject':'synthetic-investor'}),env)).status).toBe(403));
 it('starts with an empty private state rather than fabricated balances',async()=>{const r=await parsed(await call('/state'));expect(r.status).toBe(200);expect(r.body.accounts).toEqual([]);});
 it('checks both storage and import approval separately',async()=>{expect((await call('/state',undefined,undefined,{...env,FINANCE_STORE_APPROVED:'false'})).status).toBe(503);expect((await call('/import/preview',{state:privateFixture()},undefined,{...env,FINANCE_IMPORT_APPROVED:'false'})).status).toBe(503);});
 it('previews without writing',async()=>{const r=await parsed(await call('/import/preview',{state:privateFixture()}));expect(r.body.canCommit).toBe(true);expect(r.body.expectedRevision).toBe(0);expect((await db.prepare('SELECT COUNT(*) AS count FROM finance_state').first<any>())!.count).toBe(0);});
 it('rejects changed records after the preview',async()=>{const p=await previewImport(privateFixture());const state=privateFixture();state.cds[0].balanceCents=1;expect((await call('/import/commit',{state,digest:p.digest,expectedRevision:0,confirmation:'IMPORT VERIFIED RECORDS'})).status).toBe(409);});
 it('commits an initial import only after explicit confirmation',async()=>{const state=privateFixture(),p=await previewImport(state);expect((await call('/import/commit',{state,digest:p.digest,expectedRevision:0,confirmation:'IMPORT VERIFIED RECORDS'})).status).toBe(200);const r=await parsed(await call('/state'));expect(r.body.cds).toHaveLength(5);expect(r.body.refresh.lastSuccessAt).toBeNull();});
 it('refuses to overwrite an existing database with another initial snapshot',async()=>{const state=privateFixture(),p=await previewImport(state);expect((await call('/import/commit',{state,digest:p.digest,expectedRevision:0,confirmation:'IMPORT VERIFIED RECORDS'})).status).toBe(409);});
 it('stores ciphertext, not financial JSON or investor names',async()=>{const row=await db.prepare('SELECT sealed_json FROM finance_state').first<any>();expect(row!.sealed_json).not.toContain('Example owner');expect(row!.sealed_json).not.toContain('securitiesCents');expect(row!.sealed_json).toContain('ciphertext');});
 it('atomically handles simultaneous duplicate receipts',async()=>{const activity=makeActivity({id:'parallel-duplicate',requestId:'parallel-duplicate-request'});const responses=await Promise.all([call('/activity',activity,activity.requestId),call('/activity',activity,activity.requestId)]);expect(responses.map(r=>r.status).sort()).toEqual([200,201]);const state=(await parsed(await call('/state'))).body;expect(state.activity.filter((a:any)=>a.id===activity.id)).toHaveLength(1);});
 it('does not lose a distinct concurrent write',async()=>{const one=makeActivity({id:'concurrent-one',requestId:'concurrent-request-one',sourceRef:'Concurrent synthetic one'}),two=makeActivity({id:'concurrent-two',requestId:'concurrent-request-two',sourceRef:'Concurrent synthetic two'});expect((await Promise.all([call('/activity',one,one.requestId),call('/activity',two,two.requestId)])).map(r=>r.status)).toEqual([201,201]);const state=(await parsed(await call('/state'))).body;expect(state.activity.some((a:any)=>a.id===one.id)).toBe(true);expect(state.activity.some((a:any)=>a.id===two.id)).toBe(true);});
 it('rejects reusing a key for different content',async()=>{const activity=makeActivity({id:'parallel-duplicate',requestId:'parallel-duplicate-request',amountCents:777});expect((await call('/activity',activity,activity.requestId)).status).toBe(409);});
 it('persists duplicate aliases as receipts',async()=>{const activity=makeActivity({id:'new-alias-id',requestId:'alias-request-new'});expect((await call('/activity',activity,activity.requestId)).status).toBe(200);expect((await call('/activity',{...activity,feesCents:1},activity.requestId)).status).toBe(409);});
 it('records a real correction entry without deleting the original',async()=>{const correction=makeActivity({id:'correction-real',requestId:'correction-request-real',kind:'correction',correctsId:'concurrent-one',sourceRef:'Synthetic correction receipt'});expect((await call('/activity',correction,correction.requestId)).status).toBe(201);const s=(await parsed(await call('/state'))).body;expect(s.activity.some((a:any)=>a.id==='concurrent-one')).toBe(true);expect(s.activity.some((a:any)=>a.id==='correction-real')).toBe(true);});
 it('persists a goal update without inventing a payment',async()=>{const before=(await parsed(await call('/state'))).body.activity.length;expect((await call('/goal',{id:'school',targetCents:77123,targetDate:null,savedCents:null},'goal-synthetic-request')).status).toBe(201);const s=(await parsed(await call('/state'))).body;expect(s.goals[0].targetCents).toBe(77123);expect(s.activity).toHaveLength(before);});
 it('gives every committed revision exactly one private audit receipt',async()=>{const revision=await db.prepare('SELECT revision FROM finance_state').first<any>();const audit=await db.prepare('SELECT COUNT(*) AS count FROM finance_audit').first<any>();expect(audit!.count).toBe(revision!.revision);});
 it('retains data and idempotency receipts after a local database restart',async()=>{await mf.dispose();mf=newMf();db=await mf.getD1Database('DB') as unknown as PrivateDatabase;env.FINANCE_DB=db;await new FinanceRepository(db,owner,env.FINANCE_ENCRYPTION_KEY!).load();const result=await parsed(await call('/state'));expect(result.status,JSON.stringify(result.body)).toBe(200);const s=result.body;expect(s.goals[0].targetCents).toBe(77123);const activity=makeActivity({id:'parallel-duplicate',requestId:'parallel-duplicate-request'});expect((await call('/activity',activity,activity.requestId)).status).toBe(200);});
 it('rejects a wrong encryption key without exposing records',async()=>{const altered={...env,FINANCE_ENCRYPTION_KEY:toBase64(crypto.getRandomValues(new Uint8Array(32)))};const r=await parsed(await call('/state',undefined,undefined,altered));expect(r.status).toBe(503);expect(JSON.stringify(r.body)).not.toContain('Example');});
 it('exports an encrypted backup without its encryption key',async()=>{const r=await parsed(await call('/backup'));expect(r.status).toBe(200);expect(r.body.format).toBe('m3mm-finance-encrypted-v1');expect(JSON.stringify(r.body)).not.toContain(env.FINANCE_ENCRYPTION_KEY);expect(JSON.stringify(r.body)).not.toContain('Example owner');});
 it('rejects a restore into a nonempty database',async()=>{const backup=(await parsed(await call('/backup'))).body;expect((await call('/restore',{backup,confirmation:'RESTORE INTO EMPTY STORE'},undefined,{...env,FINANCE_RESTORE_APPROVED:'true'})).status).toBe(409);});

 it('restores an encrypted backup into an independent empty local database',async()=>{
   const destination=await mf.getD1Database('RESTORE_DB') as unknown as PrivateDatabase;
   const sql=fs.readFileSync(path.resolve('services/private-finance/migrations/0001_encrypted_store.sql'),'utf8');
   for(const statement of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g)!)await destination.prepare(statement).run();
   const repository=new FinanceRepository(db,owner,env.FINANCE_ENCRYPTION_KEY!);
   const backup=await repository.backup();
   const restored=new FinanceRepository(destination,owner,env.FINANCE_ENCRYPTION_KEY!);
   expect(await restored.restoreIntoEmpty(backup)).toBe(true);
   expect((await restored.load())!.document).toEqual((await repository.load())!.document);
   const receipt=await destination.prepare('SELECT event_type FROM finance_audit').first<any>();expect(receipt!.event_type).toBe('restore');
 });
 it('detects tampered ciphertext even when the outer hash is recomputed',async()=>{
   const repository=new FinanceRepository(db,owner,env.FINANCE_ENCRYPTION_KEY!);const backup=await repository.backup();
   const sealed=JSON.parse(backup.row.sealed_json);sealed.ciphertext=(sealed.ciphertext[0]==='A'?'B':'A')+sealed.ciphertext.slice(1);backup.row.sealed_json=JSON.stringify(sealed);backup.digest=await sha256(stableJson(backup.row));
   const row=await repository.row();expect(row).not.toBeNull();
   const fakeEmptyDb={prepare:(sql:string)=>({bind:()=>({first:async()=>null,run:async()=>({success:true,meta:{changes:1}})})})} as unknown as PrivateDatabase;
   await expect(new FinanceRepository(fakeEmptyDb,owner,env.FINANCE_ENCRYPTION_KEY!).restoreIntoEmpty(backup)).rejects.toThrow('private_store_integrity_error');
 });
 it('rejects a backup for another owner',async()=>{
   const backup=await new FinanceRepository(db,owner,env.FINANCE_ENCRYPTION_KEY!).backup();
   await expect(new FinanceRepository(db,'another-synthetic-owner',env.FINANCE_ENCRYPTION_KEY!).restoreIntoEmpty(backup)).rejects.toThrow('invalid_backup');
 });
 it('rolls back the state update when the audit transaction fails',async()=>{
   const repository=new FinanceRepository(db,owner,env.FINANCE_ENCRYPTION_KEY!);const before=await repository.load();
   await db.prepare("CREATE TRIGGER synthetic_reject_goal BEFORE UPDATE ON finance_state WHEN NEW.event_type = 'goal' BEGIN SELECT RAISE(ABORT, 'synthetic audit failure'); END;").run();
   try{const result=await call('/goal',{id:'school',targetCents:123,targetDate:null,savedCents:null},'rollback-goal-request');expect(result.status).toBe(503);expect(await repository.load()).toEqual(before);}
   finally{await db.prepare('DROP TRIGGER synthetic_reject_goal').run();}
 });
 it('does not enable refresh because a database now exists',async()=>expect((await call('/refresh',{confirmation:'REFRESH READ-ONLY VALUATIONS'},'refresh-not-approved')).status).toBe(503));
});

describe('Daily valuation pipeline without live scheduling',()=>{
 const envelope=(changes:Record<string,unknown>={})=>({runId:'synthetic-refresh-run',source:'Approved synthetic source',attemptedAt:new Date().toISOString(),observations:[],errors:[],...changes});
 it('does not fabricate zeros when the market is closed',()=>{const state=privateFixture();const r=applyRefresh(state,envelope({errors:[{accountId:'robinhood',code:'market-closed'}]}),'Approved synthetic source');expect(r.state.accounts).toEqual(state.accounts);expect(r.state.refresh.lastSuccessAt).toBeNull();});
 it('rejects an unapproved source',()=>expect(()=>applyRefresh(privateFixture(),envelope({source:'Wrong source'}),'Approved synthetic source')).toThrow());
 it('rejects a provider claiming owner confirmation',()=>{const o=privateFixture().accounts[0].history[0];expect(()=>applyRefresh(privateFixture(),envelope({observations:[{accountId:'robinhood',kind:'account-net-equity',observation:{...o,source:'Approved synthetic source',sourceType:'provider',userConfirmed:true}}]}),'Approved synthetic source')).toThrow();});
 it('adds a dated provider observation without silently overwriting the imported gross/margin snapshot',()=>{const state=privateFixture();const o={id:'provider-synthetic-new',observedAt:new Date().toISOString(),priceDate:new Date().toISOString().slice(0,10),source:'Approved synthetic source',sourceType:'provider',userConfirmed:false,valueCents:411000};const result=applyRefresh(state,envelope({observations:[{accountId:'robinhood',kind:'account-net-equity',observation:o}]}),'Approved synthetic source');expect(result.state.accounts[0].history).toHaveLength(6);expect(result.state.accounts[0].netEquityCents).toBe(state.accounts[0].netEquityCents);expect(result.selected).toBe(1);});
});


describe('resumed completion checks against actual local storage',()=>{
 it('does not advertise readiness with an invalid encryption key',async()=>{
   const r=await call('/readiness',undefined,undefined,{...env,FINANCE_ENCRYPTION_KEY:'invalid'});expect(r.status).toBe(503);
 });
 it('records a source outage without erasing balances or claiming successful refresh',async()=>{
   const before=(await parsed(await call('/state'))).body;
   let calls=0;const refreshEnv={...env,FINANCE_REFRESH_APPROVED:'true',FINANCE_SOURCE_NAME:'Resume synthetic source',FINANCE_SOURCE:{fetch:async()=>{calls++;return Response.json({error:'synthetic upstream failure'},{status:503});}}};
   const body={confirmation:'REFRESH READ-ONLY VALUATIONS'};
   expect((await call('/refresh',body,'source-outage-resume',refreshEnv)).status).toBe(201);
   const current=(await parsed(await call('/state'))).body;
   expect(current.accounts).toEqual(before.accounts);expect(current.refresh.lastSuccessAt).toBe(before.refresh.lastSuccessAt);expect(current.refresh.status).toBe('error');
   expect((await call('/refresh',body,'source-outage-resume',refreshEnv)).status).toBe(200);expect(calls).toBe(1);
 });
 it('rejects a reused source run identifier carrying different observations',async()=>{
   let value=415000;
   const source='Resume synthetic source';const date=new Date().toISOString().slice(0,10);const at=new Date().toISOString();
   const refreshEnv={...env,FINANCE_REFRESH_APPROVED:'true',FINANCE_SOURCE_NAME:source,FINANCE_SOURCE:{fetch:async()=>Response.json({runId:'same-source-run-resume',source,attemptedAt:at,observations:[{accountId:'robinhood',kind:'account-net-equity',observation:{id:'resume-observation-'+value,source,sourceType:'provider',userConfirmed:false,observedAt:at,priceDate:date,valueCents:value}}],errors:[]})}};
   const body={confirmation:'REFRESH READ-ONLY VALUATIONS'};
   expect((await call('/refresh',body,'first-source-run-resume',refreshEnv)).status).toBe(201);
   value=416000;expect((await call('/refresh',body,'changed-source-run-resume',refreshEnv)).status).toBe(409);
   const state=(await parsed(await call('/state'))).body;expect(state.accounts[0].history.some((o:any)=>o.valueCents===416000)).toBe(false);
 });
});

describe('Private operations import in the encrypted store',()=>{
 it('requires explicit import approval independently of an owner session',async()=>{const revision=(await new FinanceRepository(db,owner,env.FINANCE_ENCRYPTION_KEY!).load())!.revision;const r=await call('/operations',{operations:operationsFixture(),expectedRevision:revision,confirmation:'IMPORT PRIVATE OPERATIONS'},'operations-unapproved-request',{...env,FINANCE_IMPORT_APPROVED:'false'});expect(r.status).toBe(503);});
 it('preserves ownership and null budgets in a confirmed encrypted update',async()=>{const repo=new FinanceRepository(db,owner,env.FINANCE_ENCRYPTION_KEY!);const before=await repo.load();const operations=operationsFixture();expect((await call('/operations',{operations,expectedRevision:before!.revision,confirmation:'IMPORT PRIVATE OPERATIONS'},'operations-approved-request')).status).toBe(201);const after=await repo.load();expect(after!.document.state.operations).toEqual(operations);expect(after!.document.state.accounts).toEqual(before!.document.state.accounts);expect((await repo.row())!.sealed_json).not.toContain('Existing synthetic execution owner');});
 it('refuses an outdated revision rather than overwrite newer records',async()=>{expect((await call('/operations',{operations:operationsFixture(),expectedRevision:1,confirmation:'IMPORT PRIVATE OPERATIONS'},'operations-stale-request')).status).toBe(409);});
});
