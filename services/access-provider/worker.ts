import {readJson,SafeError} from '../shared/safe-json';
import {privateHeaders} from '../../functions/_lib/owner-access';

export interface AccessProviderEnvironment {
 OWNER_ACCESS_PROVIDER_APPROVED?:string;
 OWNER_ISSUER?:string;
 OWNER_AUDIENCE?:string;
 OWNER_SUBJECT?:string;
 CLOUDFLARE_ACCOUNT_ID?:string;
 CLOUDFLARE_ACCESS_APP_ID?:string;
 CLOUDFLARE_ACCESS_READ_TOKEN?:string;
}
type Fetcher=(request:Request)=>Promise<Response>;
const reply=(value:unknown,status=200)=>Response.json(value,{status,headers:privateHeaders});
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
/** The configured issuer alone chooses the public key endpoint. Tokens cannot
 * nominate a URL, redirect destination, account, application or user. */
export function issuerUrl(issuer:string|undefined):URL {
 if(!issuer)throw new SafeError('access_issuer_not_configured',503);
 let url:URL;try{url=new URL(issuer);}catch{throw new SafeError('invalid_configured_issuer',503);}
 if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||!/^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)\.cloudflareaccess\.com$/.test(url.hostname)||!['','/'].includes(url.pathname))throw new SafeError('invalid_configured_issuer',503);
 return new URL(url.origin);
}
async function load(response:Response,limit=65536):Promise<any>{if(response.status!==200||response.redirected){await response.body?.cancel();throw new SafeError('access_provider_unavailable',503);}return readJson(response,limit);}

export async function handleAccessProvider(request:Request,env:AccessProviderEnvironment,upstream:Fetcher=fetch):Promise<Response>{
 const route=new URL(request.url).pathname;
 if(!['/keys','/status'].includes(route))return reply({ok:false,error:'not_found'},404);
 if(request.method!==(route==='/keys'?'GET':'POST'))return reply({ok:false,error:'method_not_allowed'},405);
 if(env.OWNER_ACCESS_PROVIDER_APPROVED!=='true')return reply({ok:false,error:'access_provider_not_configured'},503);
 try{
  const issuer=issuerUrl(env.OWNER_ISSUER);
  if(route==='/keys'){
   const result=await load(await upstream(new Request(new URL('/cdn-cgi/access/certs',issuer),{redirect:'error',signal:AbortSignal.timeout(3000)})));
   if(!result||!Array.isArray(result.keys)||!result.keys.length||result.keys.length>12)throw new SafeError('invalid_access_keys',503);
   const ids=new Set<string>();
   const keys=result.keys.map((k:any)=>{
    if(!k||k.kty!=='RSA'||k.alg!=='RS256'||k.use!=='sig'||typeof k.kid!=='string'||!k.kid||k.kid.length>256||ids.has(k.kid)||typeof k.n!=='string'||typeof k.e!=='string'||['d','p','q','dp','dq','qi'].some(x=>x in k))throw new SafeError('invalid_access_keys',503);
    ids.add(k.kid);return{kty:'RSA',alg:'RS256',use:'sig',kid:k.kid,n:k.n,e:k.e};
   });
   return reply({keys});
  }
  if(!env.OWNER_AUDIENCE||!UUID.test(env.OWNER_SUBJECT||'')||!UUID.test(env.CLOUDFLARE_ACCESS_APP_ID||'')||!/^[a-f0-9]{32}$/i.test(env.CLOUDFLARE_ACCOUNT_ID||'')||!env.CLOUDFLARE_ACCESS_READ_TOKEN)throw new SafeError('session_source_not_configured',503);
  const input=await readJson(request,8192) as Record<string,unknown>;
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['subject','tokenHash','identityNonce','issuer','audience','issuedAt','expiresAt'].includes(k))||input.subject!==env.OWNER_SUBJECT||input.issuer!==issuer.origin||input.audience!==env.OWNER_AUDIENCE||typeof input.tokenHash!=='string'||!/^[a-f0-9]{64}$/.test(input.tokenHash)||typeof input.identityNonce!=='string'||!/^[A-Za-z0-9_-]{8,256}$/.test(input.identityNonce)||!Number.isSafeInteger(input.issuedAt)||!Number.isSafeInteger(input.expiresAt))throw new SafeError('invalid_session_context',400);
  const now=Math.floor(Date.now()/1000);
  if(Number(input.expiresAt)<=now||Number(input.issuedAt)>now+30||Number(input.expiresAt)<=Number(input.issuedAt))throw new SafeError('invalid_session_context',400);
  const prefix='https://api.cloudflare.com/client/v4/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/access/users/'+env.OWNER_SUBJECT+'/active_sessions';
  const options={headers:{Authorization:'Bearer '+env.CLOUDFLARE_ACCESS_READ_TOKEN,Accept:'application/json'},redirect:'error' as const,signal:AbortSignal.timeout(3500)};
  // Check both the exact session identity and its application membership.
  const sessionResponse=await upstream(new Request(prefix+'/'+encodeURIComponent(input.identityNonce),options));
  if(sessionResponse.status===404){await sessionResponse.body?.cancel();return reply({active:false,subject:input.subject,tokenHash:input.tokenHash,checkedAt:new Date().toISOString()});}
  const single=await load(sessionResponse);
  if(single?.success!==true||single.result?.account_id!==env.CLOUDFLARE_ACCOUNT_ID||single.result?.user_uuid!==env.OWNER_SUBJECT)throw new SafeError('session_identity_unverified',503);
  if(single.result.isActive!==true)return reply({active:false,subject:input.subject,tokenHash:input.tokenHash,checkedAt:new Date().toISOString()});
  const listing=await load(await upstream(new Request(prefix,options)));
  if(listing?.success!==true||!Array.isArray(listing.result)||listing.result.length>500)throw new SafeError('session_membership_unverified',503);
  const matching=listing.result.filter((s:any)=>s?.metadata?.nonce===input.identityNonce);
  if(matching.length!==1)throw new SafeError('session_membership_unverified',503);
  const item=matching[0],metadata=item.metadata;
  const expiry=Number.isFinite(metadata.expires)?metadata.expires:item.expiration;
  if(!Number.isFinite(expiry)||!Number.isFinite(metadata.iat)||metadata.iat>Number(input.issuedAt)+30||!metadata.apps||typeof metadata.apps!=='object')throw new SafeError('session_membership_unverified',503);
  const appKnown=Object.values(metadata.apps).some((a:any)=>a?.uid===env.CLOUDFLARE_ACCESS_APP_ID);
  return reply({active:expiry>now&&appKnown,subject:input.subject,tokenHash:input.tokenHash,checkedAt:new Date().toISOString()});
 }catch(error){return reply({ok:false,error:error instanceof SafeError?error.code:'access_provider_unavailable'},error instanceof SafeError?error.status:503);}
}
export default {fetch:(request:Request,env:AccessProviderEnvironment)=>handleAccessProvider(request,env)};
