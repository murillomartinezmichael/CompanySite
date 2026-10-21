import {operationsFixture} from './operations-fixture';
import {beforeAll,afterAll,describe,it,expect} from 'vitest';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import http from 'node:http';
import puppeteer,{type Browser,type Page} from 'puppeteer-core';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {onRequest as pagesApi} from '../../functions/api/workspace/[[path]]';
import {onRequest as pageBoundary} from '../../functions/_middleware';
import authWorker from '../../services/owner-auth/worker';
import storeWorker,{type StoreEnvironment} from '../../services/private-finance/worker';
import {FinanceRepository,type PrivateDatabase} from '../../services/private-finance/repository';
import {toBase64} from '../../services/shared/safe-json';
import {makeFixture} from './fixtures.mjs';
import {contributionTotals} from '../../src/lib/finance/model';
import type {OwnerEnvironment} from '../../functions/_lib/owner-access';

const root=path.resolve('.');const out=path.join(root,'output/redesign/continuation-20261020/browser-service');fs.mkdirSync(out,{recursive:true});
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'m3mm-browser-synthetic-'));
const owner='browser-synthetic-owner',issuer='https://browser-synthetic.cloudflareaccess.com',audience='browser-synthetic-audience';
let mf:Miniflare,browser:Browser,page:Page,server:http.Server,origin:string,token:string,db:PrivateDatabase,storeEnv:StoreEnvironment;
let dropNextActivityResponse=false,importPermitted=true,revoked=false;
const requests:Array<{route:string;key:string|null}> = [];const results:Array<{route:string;width:number;screenshot:string;overflow:boolean;violations:string[]}> = [];
const encoded=(value:unknown)=>toBase64(new TextEncoder().encode(JSON.stringify(value))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
async function fill(selector:string,values:Record<string,string|boolean>){await page.$eval(selector,(form,values)=>{for(const [name,value] of Object.entries(values)){const input=(form as HTMLFormElement).elements.namedItem(name) as HTMLInputElement;if(!input)throw new Error('Missing form field');if(input.type==='checkbox')input.checked=Boolean(value);else input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}},values);}
async function open(){await page.goto(origin+'/workspace/activity',{waitUntil:'networkidle0'});await page.waitForFunction(()=>document.getElementById('record-tool-status')?.textContent?.includes('Private storage responded'));}
async function disclose(form:string){await page.$eval(form,element=>{(element.closest('details') as HTMLDetailsElement).open=true;});}
const types:Record<string,string>={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.woff2':'font/woff2','.svg':'image/svg+xml','.webp':'image/webp'};

beforeAll(async()=>{
 const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']) as CryptoKeyPair;
 const jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'synthetic-browser-key',alg:'RS256',use:'sig'};
 const now=Math.floor(Date.now()/1000);const header=encoded({alg:'RS256',typ:'JWT',kid:jwk.kid});const claims=encoded({sub:owner,iss:issuer,aud:[audience],type:'app',iat:now-10,exp:now+1800});
 token=header+'.'+claims+'.'+toBase64(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(header+'.'+claims)))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
 const authEnv={OWNER_AUTH_APPROVED:'true',OWNER_ISSUER:issuer,OWNER_AUDIENCE:audience,OWNER_SUBJECT:owner,OWNER_KEYS:{fetch:async()=>Response.json({keys:[jwk]})},OWNER_SESSION_STATUS:{fetch:async(req:Request)=>{const value=await req.json() as any;return Response.json({active:!revoked,...value,checkedAt:new Date().toISOString()});}}};
 mf=new Miniflare({...convertV4MiniflareOptions({name:'synthetic-browser-database',modules:true,script:'export default {fetch(){return new Response("synthetic-only")}}',compatibilityDate:'2026-08-27',d1Databases:{DB:'synthetic-browser-finance-db'}}),resourcePersistencePath:directory});
 db=await mf.getD1Database('DB') as unknown as PrivateDatabase;
 const sql=fs.readFileSync(path.join(root,'services/private-finance/migrations/0001_encrypted_store.sql'),'utf8');for(const statement of sql.match(/CREATE TABLE[\s\S]*?;|CREATE TRIGGER[\s\S]*?END;/g)!)await db.prepare(statement).run();
 const auth={fetch:(req:Request)=>authWorker.fetch(req,authEnv)};
 storeEnv={OWNER_AUTH:auth,OWNER_SUBJECT:owner,OWNER_AUTH_ISSUER:issuer,OWNER_AUTH_AUDIENCE:audience,FINANCE_STORE_APPROVED:'true',FINANCE_IMPORT_APPROVED:'true',FINANCE_DB:db,FINANCE_ENCRYPTION_KEY:toBase64(crypto.getRandomValues(new Uint8Array(32)))};
 const appEnv:OwnerEnvironment={...storeEnv,FINANCE_STORE:{fetch:(req:Request)=>storeWorker.fetch(req,storeEnv)}};
 server=http.createServer(async(req,res)=>{
  try{
   const url=new URL(req.url!,origin);let response:Response;const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(','):value);
   const chunks:Uint8Array[]=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1200000)throw new Error('Oversized synthetic request');chunks.push(chunk);}
   const request=new Request(url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method!)?undefined:Buffer.concat(chunks)});
   appEnv.FINANCE_IMPORT_APPROVED=importPermitted?'true':'false';
   if(url.pathname.startsWith('/api/workspace/')){
    const route=url.pathname.slice('/api/workspace/'.length);requests.push({route,key:headers.get('Idempotency-Key')});
    response=await(pagesApi as any)({request,env:appEnv,params:{path:route.split('/')}});
    if(route==='activity'&&dropNextActivityResponse&&response.status<300){dropNextActivityResponse=false;await response.arrayBuffer();response=Response.json({ok:false,error:'synthetic_lost_receipt'},{status:503});}
   }else if(url.pathname==='/api/track'){response=new Response(null,{status:204});}
   else{
    const staticReply=async()=>{let target=path.resolve(root,'dist','.'+decodeURIComponent(url.pathname));const base=path.join(root,'dist');if(!target.startsWith(base+path.sep)&&target!==base)return new Response('Forbidden',{status:403});if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');if(!fs.existsSync(target)&&!path.extname(target))target=path.join(target,'index.html');return fs.existsSync(target)?new Response(fs.readFileSync(target),{headers:{'Content-Type':types[path.extname(target)]||'application/octet-stream'}}):new Response('Not found',{status:404});};
    response=await(pageBoundary as any)({request,env:appEnv,next:staticReply});
   }
   res.writeHead(response.status,Object.fromEntries(response.headers.entries()));res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500,{'Content-Type':'application/json'});res.end('{"ok":false,"error":"synthetic_harness_failure"}');}
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+(server.address() as any).port;
 const chrome=[process.env.CHROME_PATH,process.env.PUPPETEER_EXECUTABLE_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter((value):value is string=>Boolean(value)).find(file=>fs.existsSync(file));
 if(!chrome)throw new Error('Chrome is required for private-service browser acceptance. Configure CHROME_PATH or PUPPETEER_EXECUTABLE_PATH; do not skip this test.');
 browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run']});
 page=await browser.newPage();await page.setViewport({width:1440,height:1000});await page.setExtraHTTPHeaders({'Cf-Access-Jwt-Assertion':token});await page.setRequestInterception(true);page.on('request',req=>req.url().startsWith(origin)||req.url().startsWith('data:')||req.url().startsWith('blob:')?req.continue():req.abort());
 await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:'dark'},{name:'prefers-reduced-motion',value:'reduce'}]);
},30000);
afterAll(async()=>{fs.writeFileSync(path.join(out,'screenshots.json'),JSON.stringify({mode:'Synthetic browser records only; actual RSA verification, Pages facade, store implementation and local D1. No live account, external identity or production store.',results},null,2));await browser?.close();if(server)await new Promise<void>(resolve=>server.close(()=>resolve()));await mf?.dispose();},15000);

describe('Actual private service workflow in Chrome',()=>{
 it('denies anonymous access to private HTML and export endpoints',async()=>{expect((await fetch(origin+'/workspace')).status).toBe(401);expect((await fetch(origin+'/api/workspace/export.csv')).status).toBe(401);});
 it('keeps initial imports disabled without both approvals',async()=>{importPermitted=false;try{await open();expect(await page.$eval('#snapshot-source-file',(e:any)=>e.disabled)).toBe(true);}finally{importPermitted=true;}});
 it('previews the source inventory without creating database records',async()=>{
   await open();await disclose('#snapshot-import-form');const state=makeFixture();state.mode='private';for(const a of [...state.accounts,...state.silver,...state.cds])for(const o of a.history)o.sourceType='user';
   const file=path.join(out,'SYNTHETIC-import-test.json');fs.writeFileSync(file,JSON.stringify(state));await(await page.$('#snapshot-source-file'))!.uploadFile(file);await page.click('#snapshot-import-form button');
   await page.waitForFunction(()=>document.querySelector('#snapshot-import-form [role=status]')?.textContent?.includes('nothing saved'));
   expect((await db.prepare('SELECT COUNT(*) AS count FROM finance_state').first<any>())!.count).toBe(0);
   expect(await page.$eval('#snapshot-commit-form',(f:any)=>f.checkValidity())).toBe(false);
 },15000);
 it('imports only after confirmation and keeps both brokerages and all CDs separate',async()=>{
   await fill('#snapshot-commit-form',{confirmation:'IMPORT VERIFIED RECORDS'});await page.click('#snapshot-commit-form button');await page.waitForFunction(()=>document.querySelector('#record-tool-status')?.textContent?.includes('Private storage responded')&&document.querySelectorAll('#activity-form [name=accountId] option').length>5);
   const state=(await new FinanceRepository(db,owner,storeEnv.FINANCE_ENCRYPTION_KEY!).load())!.document.state;expect(state.accounts).toHaveLength(2);expect(state.cds).toHaveLength(5);
   expect(await page.$eval('#snapshot-source-file',(e:any)=>e.disabled)).toBe(true);
 },15000);
 it('retries an uncertain activity save with one stable identity and no duplicate',async()=>{
   await fill('#activity-form',{accountId:'fidelity',kind:'purchase',date:'2026-10-16',contributorId:'example-owner',symbol:'SYN-A',quantity:'2',amount:'160',fees:'0',identityVerified:true,sourceRef:'Synthetic browser end-to-end receipt',cashDirection:'outflow',note:'Synthetic acceptance only'});
   dropNextActivityResponse=true;await page.click('#activity-form button[type=submit]');await page.waitForFunction(()=>document.querySelector('#activity-form [role=status]')?.textContent?.includes('not confirmed'));
   await page.click('#activity-form button[type=submit]');await page.waitForFunction(()=>document.querySelector('#activity-form [role=status]')?.textContent?.includes('No duplicate'));
   const state=(await new FinanceRepository(db,owner,storeEnv.FINANCE_ENCRYPTION_KEY!).load())!.document.state;expect(state.activity.filter(a=>a.sourceRef==='Synthetic browser end-to-end receipt')).toHaveLength(1);
   const writes=requests.filter(r=>r.route==='activity');expect(writes.at(-1)!.key).toBe(writes.at(-2)!.key);
 },15000);
 it('adds a dated CD observation through the actual protected endpoint',async()=>{
   await disclose('#observation-form');await fill('#observation-form',{accountId:'cd-0',kind:'cd-balance',observedAt:new Date().toISOString(),priceDate:new Date().toISOString().slice(0,10),value:'211.25',source:'Synthetic verified CD statement',userConfirmed:true});await page.click('#observation-form button');await page.waitForFunction(()=>document.querySelector('#observation-form [role=status]')?.textContent?.includes('Observation saved'));
   const state=(await new FinanceRepository(db,owner,storeEnv.FINANCE_ENCRYPTION_KEY!).load())!.document.state;expect(state.cds[0].balanceCents).toBe(21125);expect(state.cds[0].history).toHaveLength(2);
 },15000);

 it('updates exact holdings from a reconciled full source snapshot',async()=>{
   await open();await disclose('#brokerage-snapshot-form');
   const at=new Date().toISOString(),date=at.slice(0,10);
   const body={accountId:'robinhood',kind:'brokerage-snapshot',observation:{id:'browser-complete-snapshot',observedAt:at,priceDate:date,source:'Synthetic verified full brokerage statement',sourceType:'user',userConfirmed:true,valueCents:450000,snapshot:{securitiesCents:700000,cryptoCents:1000,cashCents:9000,marginCents:260000,netEquityCents:450000,deficitCents:5000,holdings:[{symbol:'SYN-A',identityVerified:true,quantity:'87.5',unitPriceCents:8000,priceDate:date}]}}};
   const file=path.join(out,'SYNTHETIC-holdings-snapshot.json');fs.writeFileSync(file,JSON.stringify(body));
   await(await page.$('#brokerage-snapshot-form input[type=file]'))!.uploadFile(file);
   await page.click('#brokerage-snapshot-form button');await page.waitForFunction(()=>document.querySelector('#brokerage-snapshot-form [role=status]')?.textContent?.includes('Holdings snapshot recorded'));
   const state=(await new FinanceRepository(db,owner,storeEnv.FINANCE_ENCRYPTION_KEY!).load())!.document.state;
   expect(state.accounts[0].holdings[0].quantity).toBe('87.5');expect(state.accounts[0].netEquityCents).toBe(450000);expect(state.accounts[0].deficitCents).toBe(5000);expect(state.accounts[0].ownership).toBe('investor-managed');
 },15000);
 it('records an explicit replacement correction and adjusts contribution totals',async()=>{
   await open();await fill('#activity-form',{accountId:'fidelity',kind:'correction',date:'2026-10-16',contributorId:'example-owner',symbol:'',quantity:'',amount:'190',fees:'0',identityVerified:false,sourceRef:'Synthetic contribution correction',cashDirection:'inflow',note:'Correct the original amount; do not add another deposit.',correctionAction:'replace',replacementKind:'deposit',correctsId:'activity-owner'});
   await page.click('#activity-form button[type=submit]');await page.waitForFunction(()=>document.querySelector('#activity-form [role=status]')?.textContent?.includes('Activity recorded'));
   const state=(await new FinanceRepository(db,owner,storeEnv.FINANCE_ENCRYPTION_KEY!).load())!.document.state;
   expect(contributionTotals(state.activity,'example-owner','fidelity')).toBe(19000);expect(state.activity.find(a=>a.id==='activity-owner')!.amountCents).toBe(15000);
   await page.waitForFunction(()=>document.getElementById('activity-ledger-table')?.textContent?.includes('Synthetic contribution correction'),{timeout:10000});
   expect(await page.$eval('#activity-ledger-table',e=>e.textContent?.includes('Synthetic contribution correction'))).toBe(true);
 },15000);
 it('does not enable a daily refresh merely because records exist',async()=>expect(await page.$eval('#finance-refresh',(e:any)=>e.disabled)).toBe(true));
 it('exports encrypted backup data through the independently authorized store',async()=>{
   const result=await page.evaluate(async()=>{const r=await fetch('/api/workspace/backup',{cache:'no-store'});const data=await r.json();return{status:r.status,format:data.format,text:JSON.stringify(data),cache:r.headers.get('Cache-Control')};});
   expect(result.status).toBe(200);expect(result.format).toBe('m3mm-finance-encrypted-v1');expect(result.text).not.toContain('Example owner');expect(result.cache).toContain('no-store');
 });

 it('imports reviewed operations without changing original ownership or financial holdings',async()=>{
   await page.goto(origin+'/workspace/operations',{waitUntil:'networkidle0'});await page.waitForFunction(()=>document.getElementById('operations-readiness')?.textContent?.includes('Private import is approved'));
   await disclose('#operations-preview-form');const records=operationsFixture();const file=path.join(out,'SYNTHETIC-operations-import.json');fs.writeFileSync(file,JSON.stringify(records));
   await(await page.$('#operations-source-file'))!.uploadFile(file);await page.click('#operations-preview-form button');await page.waitForFunction(()=>document.querySelector('#operations-preview-form [role=status]')?.textContent?.includes('nothing saved'));
   const repo=new FinanceRepository(db,owner,storeEnv.FINANCE_ENCRYPTION_KEY!);const before=await repo.load();expect(before!.document.state.operations).toBeUndefined();
   await fill('#operations-commit-form',{confirmation:'IMPORT PRIVATE OPERATIONS'});await page.click('#operations-commit-form button');await page.waitForFunction(()=>document.getElementById('finance-app')?.textContent?.includes('Synthetic operations acceptance record'));
   const after=await repo.load();expect(after!.document.state.operations).toEqual(records);expect(after!.document.state.accounts).toEqual(before!.document.state.accounts);
   await page.goto(origin+'/workspace/operations/catalog',{waitUntil:'networkidle0'});expect(await page.$eval('#finance-app',e=>e.textContent?.includes('Existing synthetic execution owner'))).toBe(true);expect(await page.$eval('#finance-app',e=>e.textContent?.includes('Parked — needs original owner review'))).toBe(true);
 },15000);
 it('captures the new controls and charts on desktop and mobile',async()=>{
   const axe=fs.readFileSync(path.join(root,'node_modules/axe-core/axe.min.js'),'utf8');
   for(const width of [1440,375])for(const route of ['/workspace/activity','/workspace/cds','/workspace/operations/catalog','/workspace/operations/infrastructure']){
     await page.setViewport({width,height:width===375?812:1000});await page.goto(origin+route,{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
     await page.evaluate(()=>{const app=document.getElementById('finance-app')!;const banner=document.createElement('p');banner.className='ws-synthetic';banner.textContent='SYNTHETIC ACCEPTANCE RECORDS — no real balances or accounts. Local database test only.';app.prepend(banner);});
     if(route.endsWith('activity')){await disclose('#observation-form');await page.$eval('#finance-record-tools',e=>e.scrollIntoView());}
     const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);await page.addScriptTag({content:axe});const violations=await page.evaluate(async()=>{const a=(window as any).axe;const result=await a.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return result.violations.map((v:any)=>v.id);});
     const screenshot=route.replaceAll('/','-').slice(1)+'-'+width+'.png';await page.evaluate(async()=>{window.scrollTo(0,0);await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));});await page.screenshot({path:path.join(out,screenshot),fullPage:true});results.push({route,width,screenshot,overflow,violations});expect(overflow).toBe(false);expect(violations).toEqual([]);
   }
 },30000);
 it('rejects private data after the verified session is revoked',async()=>{revoked=true;try{expect((await fetch(origin+'/api/workspace/state',{headers:{'Cf-Access-Jwt-Assertion':token}})).status).toBe(401);}finally{revoked=false;}});
});
