import {beforeAll,afterAll,describe,it,expect,vi} from 'vitest';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import {handleAccessProvider,issuerUrl,type AccessProviderEnvironment} from '../../services/access-provider/worker';
import mediaWorker,{mediaRange,mediaObjectKey,type MediaEnvironment} from '../../services/private-media/worker';
import {onRequest as pagesApi} from '../../functions/api/workspace/[[path]]';
import {makeFixture} from './fixtures.mjs';import {operationsFixture} from './operations-fixture';
import {ENVIRONMENT_AREAS,INFRASTRUCTURE_PHASES,INFRASTRUCTURE_MILESTONES} from '../../src/config/environment';

const subject='11111111-1111-4111-8111-111111111111',account='11111111111111111111111111111111',app='22222222-2222-4222-8222-222222222222';
const policy:AccessProviderEnvironment={OWNER_ACCESS_PROVIDER_APPROVED:'true',OWNER_ISSUER:'https://synthetic-owner.cloudflareaccess.com',OWNER_AUDIENCE:'synthetic-app-audience',OWNER_SUBJECT:subject,CLOUDFLARE_ACCOUNT_ID:account,CLOUDFLARE_ACCESS_APP_ID:app,CLOUDFLARE_ACCESS_READ_TOKEN:'synthetic-not-a-real-token'};
const context=()=>({subject,tokenHash:'a'.repeat(64),identityNonce:'synthetic_nonce_001',issuer:policy.OWNER_ISSUER,audience:policy.OWNER_AUDIENCE,issuedAt:Math.floor(Date.now()/1000)-30,expiresAt:Math.floor(Date.now()/1000)+1800});
const statusRequest=(changes={})=>new Request('https://internal/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...context(),...changes})});
function sourceResponses(changes:{active?:boolean;appKnown?:boolean;expires?:number;nonce?:string;identity?:string}={}){
 return vi.fn(async(request:Request)=>new URL(request.url).pathname.endsWith('/active_sessions')
  ?Response.json({success:true,result:[{metadata:{nonce:changes.nonce||'synthetic_nonce_001',iat:Math.floor(Date.now()/1000)-60,expires:changes.expires??Math.floor(Date.now()/1000)+3600,apps:{synthetic:{uid:changes.appKnown===false?'33333333-3333-4333-8333-333333333333':app}}}}]})
  :Response.json({success:true,result:{account_id:account,user_uuid:changes.identity||subject,isActive:changes.active??true}}));
}
describe('Approved Cloudflare Access source adapter — synthetic upstream evidence',()=>{
 it.each(['http://synthetic-owner.cloudflareaccess.com','https://synthetic-owner.cloudflareaccess.com.evil.invalid','https://127.0.0.1','https://user:pass@synthetic-owner.cloudflareaccess.com','https://synthetic-owner.cloudflareaccess.com:9443','https://synthetic-owner.cloudflareaccess.com/path','https://synthetic-owner.cloudflareaccess.com?jku=evil'])('rejects unsafe issuer %s',issuer=>expect(()=>issuerUrl(issuer)).toThrow());
 it('accepts only the configured HTTPS Access team origin',()=>expect(issuerUrl(policy.OWNER_ISSUER).origin).toBe(policy.OWNER_ISSUER));
 it('does not call a source before provider approval',async()=>{const upstream=vi.fn();expect((await handleAccessProvider(new Request('https://internal/keys'),{},upstream)).status).toBe(503);expect(upstream).not.toHaveBeenCalled();});
 it('fetches signing keys without forwarding tokens or browser headers',async()=>{const upstream=vi.fn(async(request:Request)=>{expect(request.url).toBe(policy.OWNER_ISSUER+'/cdn-cgi/access/certs');expect(request.headers.get('Authorization')).toBeNull();expect(request.headers.get('Cookie')).toBeNull();expect(request.redirect).toBe('error');return Response.json({keys:[{kid:'synthetic-key',kty:'RSA',alg:'RS256',use:'sig',n:'synthetic-public-modulus',e:'AQAB'}],public_cert:{ignored:true}});});const r=await handleAccessProvider(new Request('https://internal/keys',{headers:{Authorization:'Bearer browser-secret',Cookie:'secret=synthetic'}}),policy,upstream);expect(r.status).toBe(200);expect(Object.keys(await r.json())).toEqual(['keys']);});
 it.each([{keys:[]},{keys:[{kid:'a',kty:'RSA',alg:'HS256',use:'sig',n:'n',e:'AQAB'}]},{keys:[{kid:'a',kty:'RSA',alg:'RS256',use:'sig',n:'n',e:'AQAB',d:'private-key'}]}])('rejects invalid key sets',async body=>expect((await handleAccessProvider(new Request('https://internal/keys'),policy,async()=>Response.json(body))).status).toBe(503));
 it('does not follow source redirects',async()=>expect((await handleAccessProvider(new Request('https://internal/keys'),policy,async()=>new Response(null,{status:302,headers:{Location:'https://attacker.invalid'}}))).status).toBe(503));
 it('checks the exact active session and application membership',async()=>{const upstream=sourceResponses();const r=await handleAccessProvider(statusRequest(),policy,upstream);expect(r.status).toBe(200);expect(await r.json()).toMatchObject({active:true,subject,tokenHash:'a'.repeat(64)});expect(upstream).toHaveBeenCalledTimes(2);for(const [req]of upstream.mock.calls){expect(req.url).toMatch(/^https:\/\/api\.cloudflare\.com\/client\/v4\/accounts\/1111/);expect(req.headers.get('Authorization')).toBe('Bearer synthetic-not-a-real-token');expect(req.redirect).toBe('error');}});
 it.each([{subject:'different-owner'},{identityNonce:'../escape'},{issuer:'https://wrong.invalid'},{audience:'different-app'},{tokenHash:'invalid'},{expiresAt:1},{identityNonce:null}])('rejects untrusted session context %j',async change=>{const upstream=sourceResponses();expect((await handleAccessProvider(statusRequest(change),policy,upstream)).status).toBe(400);expect(upstream).not.toHaveBeenCalled();});
 it.each([{active:false},{appKnown:false},{expires:1}])('denies inactive or unrelated application evidence %j',async change=>{const r=await handleAccessProvider(statusRequest(),policy,sourceResponses(change));expect(await r.json()).toMatchObject({active:false});});
 it.each([{nonce:'not-the-same-session'},{identity:'33333333-3333-4333-8333-333333333333'}])('fails closed on mismatched authoritative evidence %j',async change=>expect((await handleAccessProvider(statusRequest(),policy,sourceResponses(change))).status).toBe(503));
 it('does not leak provider errors or its read token',async()=>{const r=await handleAccessProvider(statusRequest(),policy,async()=>{throw new Error('synthetic-not-a-real-token');});expect(r.status).toBe(503);expect(await r.text()).not.toContain('synthetic-not-a-real-token');});
});

let mf:Miniflare;let bucket:any;let mediaEnv:MediaEnvironment;
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'m3mm-private-media-synthetic-'));
const ownerAuth={fetch:async()=>Response.json({authenticated:true,subject,issuer:'synthetic-issuer',audience:'synthetic-audience',expiresAt:new Date(Date.now()+60000).toISOString()})};
const privateState=()=>{const s=makeFixture();s.mode='private';for(const a of [...s.accounts,...s.silver,...s.cds])for(const p of a.history)p.sourceType='user';s.operations=operationsFixture();return s;};
const mediaRequest=(id='synthetic-private-media',extra:Record<string,string>={},method='GET')=>new Request('https://private-media.internal/object/'+id,{method,headers:{Cookie:'synthetic_session=owner','X-Owner-Subject':subject,...extra}});
beforeAll(async()=>{
 mf=new Miniflare({...convertV4MiniflareOptions({name:'synthetic-media-tests',modules:true,script:'export default {fetch(){return new Response("synthetic local only")}}',compatibilityDate:'2026-08-27',r2Buckets:['MEDIA']}),resourcePersistencePath:temporary});
 bucket=await mf.getR2Bucket('MEDIA');await bucket.put(await mediaObjectKey(subject,'synthetic-private-media'),'0123456789abcdef',{httpMetadata:{contentType:'video/mp4'}});
 mediaEnv={OWNER_AUTH:ownerAuth,OWNER_SUBJECT:subject,OWNER_AUTH_ISSUER:'synthetic-issuer',OWNER_AUTH_AUDIENCE:'synthetic-audience',FINANCE_STORE_APPROVED:'true',FINANCE_STORE:{fetch:async()=>Response.json(privateState())},FINANCE_MEDIA_APPROVED:'true',FINANCE_MEDIA_BUCKET:bucket};
},30000);
afterAll(async()=>{await mf?.dispose();});
describe('Protected media and actual local R2 reads',()=>{
 it('requires a verified session rather than an actor header',async()=>expect((await mediaWorker.fetch(new Request('https://private-media.internal/object/synthetic-private-media',{headers:{'X-Owner-Subject':subject}}),mediaEnv)).status).toBe(401));
 it('requires the independent media approval',async()=>expect((await mediaWorker.fetch(mediaRequest(),{...mediaEnv,FINANCE_MEDIA_APPROVED:'false'})).status).toBe(503));
 it('rejects another actor even with a verified session',async()=>expect((await mediaWorker.fetch(mediaRequest('synthetic-private-media',{'X-Owner-Subject':'different-owner'}),mediaEnv)).status).toBe(403));
 it('returns only a registered private object',async()=>{const r=await mediaWorker.fetch(mediaRequest(),mediaEnv);expect(r.status).toBe(200);expect(await r.text()).toBe('0123456789abcdef');expect(r.headers.get('Cache-Control')).toContain('no-store');expect(r.headers.get('X-Robots-Tag')).toContain('noindex');expect(r.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');});
 it('supports verified partial content without public bucket URLs',async()=>{const r=await mediaWorker.fetch(mediaRequest('synthetic-private-media',{Range:'bytes=2-5'}),mediaEnv);expect(r.status).toBe(206);expect(r.headers.get('Content-Range')).toBe('bytes 2-5/16');expect(await r.text()).toBe('2345');});
 it('supports owner-authorized HEAD without returning file contents',async()=>{const r=await mediaWorker.fetch(mediaRequest('synthetic-private-media',{},'HEAD'),mediaEnv);expect(r.status).toBe(200);expect(r.headers.get('Content-Length')).toBe('16');expect(await r.text()).toBe('');});
 it('does not expose objects absent from the encrypted registry',async()=>{await bucket.put(await mediaObjectKey(subject,'unregistered-file'),'synthetic',{httpMetadata:{contentType:'video/mp4'}});expect((await mediaWorker.fetch(mediaRequest('unregistered-file'),mediaEnv)).status).toBe(404);});
 it('rejects active HTML/SVG even for a registered object',async()=>{const other={...mediaEnv,FINANCE_MEDIA_BUCKET:{head:async()=>({size:10,httpMetadata:{contentType:'image/svg+xml'}}),get:vi.fn()}};expect((await mediaWorker.fetch(mediaRequest(),other)).status).toBe(415);expect(other.FINANCE_MEDIA_BUCKET.get).not.toHaveBeenCalled();});
 it.each(['../other','%2e%2e%2fother','a/b','synthetic-private-media?url=https://attacker.invalid'])('rejects unsafe object references %s',async id=>expect((await mediaWorker.fetch(mediaRequest(id),mediaEnv)).status).toBe(404));
 it.each(['bytes=0-1,4-5','bytes=-0','bytes=999-','garbage','bytes=5-2'])('rejects malformed media range %s',async Range=>expect((await mediaWorker.fetch(mediaRequest('synthetic-private-media',{Range}),mediaEnv)).status).toBe(416));
 it('supports bounded suffix ranges',()=>expect(mediaRange('bytes=-4',16)).toEqual({offset:12,length:4}));
 it('bounds an open-ended chunk',()=>expect(mediaRange('bytes=0-',100*1024*1024)?.length).toBe(16*1024*1024));
 it('does not expose bucket names or owner identities in object keys',async()=>{const key=await mediaObjectKey(subject,'synthetic-private-media');expect(key).not.toContain(subject);expect(key).toMatch(/^owner\/[a-f0-9]{64}\/media\/synthetic-private-media$/);});
 it('the Pages media facade also denies missing activation',async()=>{const r=await(pagesApi as any)({request:new Request('https://m3mm.net/api/workspace/media/synthetic-private-media',{headers:{Cookie:'synthetic=owner'}}),env:mediaEnv,params:{path:['media','synthetic-private-media']}});expect(r.status).toBe(503);});
 it('the Pages facade preserves the independent media authorization and private headers',async()=>{const env={...mediaEnv,FINANCE_MEDIA:{fetch:(req:Request)=>mediaWorker.fetch(req,mediaEnv)}};const r=await(pagesApi as any)({request:new Request('https://m3mm.net/api/workspace/media/synthetic-private-media',{headers:{Cookie:'synthetic=owner',Range:'bytes=1-3'}}),env,params:{path:['media','synthetic-private-media']}});expect(r.status).toBe(206);expect(await r.text()).toBe('123');expect(r.headers.get('Cache-Control')).toContain('no-store');});
});

describe('PR38 content preserved without competing navigation',()=>{
 it('keeps all six environment areas and twelve exact source milestones',()=>{expect(ENVIRONMENT_AREAS).toHaveLength(6);expect(INFRASTRUCTURE_PHASES).toHaveLength(6);expect(INFRASTRUCTURE_MILESTONES).toHaveLength(12);expect(INFRASTRUCTURE_MILESTONES.some(x=>x.status==='complete')).toBe(false);});
 it('preserves all previous environment destinations as redirects',()=>{const redirects=fs.readFileSync('public/_redirects','utf8');for(const a of ENVIRONMENT_AREAS)expect(redirects).toContain('/environment/'+a.slug+' /roadmaps/infrastructure/'+a.slug+' 301');expect(redirects).toContain('/roadmaps/environment /roadmaps/infrastructure 301');});
 it('does not introduce a second about route or public investor showcase',()=>{expect(fs.existsSync('src/pages/about/index.astro')).toBe(false);expect(fs.readFileSync('scripts/build-investors.mjs','utf8')).not.toMatch(/^import.*investor-preview/m);});
});
