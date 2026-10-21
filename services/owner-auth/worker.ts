import { readJson, sha256, SafeError } from '../shared/safe-json';
import { privateHeaders, type ServiceBinding } from '../../functions/_lib/owner-access';

export interface JwtPolicy { issuer: string; audience: string; ownerSubject: string; maxSessionSeconds?: number; }
export interface PublicJwk extends JsonWebKey { kid?: string; }
export interface OwnerAuthEnvironment {
  OWNER_ISSUER?: string;
  OWNER_AUDIENCE?: string;
  OWNER_SUBJECT?: string;
  OWNER_AUTH_APPROVED?: string;
  OWNER_KEYS?: ServiceBinding;
  OWNER_SESSION_STATUS?: ServiceBinding;
}
interface VerifiedClaims { sub: string; iss: string; aud: string[]; exp: number; iat: number; nbf?: number; type: string; identity_nonce?:string; }
function decode(segment: string) {
  if (!segment || !/^[A-Za-z0-9_-]+$/.test(segment)) throw new SafeError('invalid_token',401);
  const value = segment.replace(/-/g,'+').replace(/_/g,'/');
  try { return Uint8Array.from(atob(value.padEnd(Math.ceil(value.length/4)*4,'=')), c=>c.charCodeAt(0)); }
  catch { throw new SafeError('invalid_token',401); }
}
function parsed(segment: string): Record<string,unknown> {
  try { const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(decode(segment)));
    if (!value || typeof value!=='object' || Array.isArray(value)) throw new Error(); return value;
  } catch { throw new SafeError('invalid_token',401); }
}
/** Pure verifier: the key set and issuer come from configuration, never from jku/x5u/iss in a request. */
export async function verifySignedOwnerToken(token: string, policy: JwtPolicy, keys: PublicJwk[], nowSeconds=Math.floor(Date.now()/1000)): Promise<VerifiedClaims> {
  if (token.length>16384 || !policy.issuer || !policy.audience || !policy.ownerSubject) throw new SafeError('invalid_token',401);
  const parts=token.split('.'); if(parts.length!==3)throw new SafeError('invalid_token',401);
  const header=parsed(parts[0]), payload=parsed(parts[1]);
  if(header.alg!=='RS256'||header.typ!=='JWT'||typeof header.kid!=='string'||header.kid.length>256||header.crit!==undefined||header.jku!==undefined||header.x5u!==undefined||header.jwk!==undefined)throw new SafeError('invalid_token',401);
  const matching=keys.filter(k=>k.kid===header.kid && k.kty==='RSA' && (!k.alg||k.alg==='RS256') && (!k.use||k.use==='sig') && !k.d);
  if(matching.length!==1)throw new SafeError('unknown_signing_key',401);
  const jwk=matching[0];
  if(!jwk.n||decode(jwk.n).byteLength<256||!jwk.e)throw new SafeError('invalid_signing_key',401);
  let valid=false;
  try {
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    valid=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
  } catch { throw new SafeError('invalid_token',401); }
  if(!valid)throw new SafeError('invalid_token',401);
  const aud=Array.isArray(payload.aud)?payload.aud:[];
  if(payload.iss!==policy.issuer||!aud.every(a=>typeof a==='string')||!aud.includes(policy.audience)||payload.type!=='app')throw new SafeError('invalid_claims',401);
  const exp=payload.exp,iat=payload.iat,nbf=payload.nbf;
  if(!Number.isSafeInteger(exp)||!Number.isSafeInteger(iat)||Number(exp)<=nowSeconds||Number(iat)>nowSeconds+30||Number(exp)<=Number(iat)||Number(exp)-Number(iat)>(policy.maxSessionSeconds??86400))throw new SafeError('invalid_session_time',401);
  if(nbf!==undefined&&(!Number.isSafeInteger(nbf)||Number(nbf)>nowSeconds))throw new SafeError('session_not_active',401);
  if(typeof payload.sub!=='string'||!payload.sub)throw new SafeError('invalid_subject',401);
  if(payload.sub!==policy.ownerSubject)throw new SafeError('owner_only',403);
  return payload as unknown as VerifiedClaims;
}
export function extractSession(request: Request): string {
  const candidates:string[]=[];
  const assertion=request.headers.get('Cf-Access-Jwt-Assertion'); if(assertion)candidates.push(assertion);
  const authorization=request.headers.get('Authorization');
  if(authorization){if(!/^Bearer [^ ]+$/.test(authorization))throw new SafeError('invalid_session',401);candidates.push(authorization.slice(7));}
  const cookies=(request.headers.get('Cookie')||'').split(';').map(p=>p.trim()).filter(p=>p.startsWith('CF_Authorization='));
  if(cookies.length>1)throw new SafeError('ambiguous_session',401);
  if(cookies[0])candidates.push(cookies[0].slice('CF_Authorization='.length));
  if(!candidates.length||candidates.some(t=>t!==candidates[0]))throw new SafeError('missing_or_ambiguous_session',401);
  return candidates[0];
}
const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{...privateHeaders,'Content-Type':'application/json'}});
export default {
  async fetch(request:Request,env:OwnerAuthEnvironment):Promise<Response>{
    if(request.method!=='GET'||new URL(request.url).pathname!=='/verify')return reply({authenticated:false,error:'not_found'},404);
    if(env.OWNER_AUTH_APPROVED!=='true'||!env.OWNER_ISSUER||!env.OWNER_AUDIENCE||!env.OWNER_SUBJECT||!env.OWNER_KEYS||!env.OWNER_SESSION_STATUS)return reply({authenticated:false,error:'owner_auth_not_configured'},503);
    try{
      const token=extractSession(request);
      const response=await env.OWNER_KEYS.fetch(new Request('https://owner-keys.internal/keys',{redirect:'error',signal:AbortSignal.timeout(3000)}));
      if(!response.ok)throw new SafeError('keys_unavailable',503);
      const keyset=await readJson(response,65536) as {keys?:PublicJwk[]};
      if(!Array.isArray(keyset.keys)||keyset.keys.length>12)throw new SafeError('keys_unavailable',503);
      const identity=await verifySignedOwnerToken(token,{issuer:env.OWNER_ISSUER,audience:env.OWNER_AUDIENCE,ownerSubject:env.OWNER_SUBJECT},keyset.keys);
      const tokenHash=await sha256(token);
      // Revocation is NOT inferred from a valid signature. A separately approved
      // authoritative session-status service must confirm this exact token now.
      const sessionResponse=await env.OWNER_SESSION_STATUS.fetch(new Request('https://owner-session.internal/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject:identity.sub,tokenHash,...(identity.identity_nonce?{identityNonce:identity.identity_nonce,issuer:identity.iss,audience:env.OWNER_AUDIENCE,issuedAt:identity.iat,expiresAt:identity.exp}:{})}),redirect:'error',signal:AbortSignal.timeout(3000)}));
      if(!sessionResponse.ok)throw new SafeError('session_status_unavailable',503);
      const status=await readJson(sessionResponse,4096) as {active?:boolean;subject?:string;tokenHash?:string;checkedAt?:string};
      const age=Date.now()-Date.parse(status.checkedAt||'');
      if(status.subject!==identity.sub||status.tokenHash!==tokenHash||!Number.isFinite(age)||age< -30000||age>60000)throw new SafeError('session_status_unavailable',503);
      if(status.active!==true)throw new SafeError('session_revoked',401);
      return reply({authenticated:true,subject:identity.sub,issuer:identity.iss,audience:env.OWNER_AUDIENCE,expiresAt:new Date(identity.exp*1000).toISOString()});
    }catch(error){return reply({authenticated:false,error:error instanceof SafeError?error.code:'authentication_unavailable'},error instanceof SafeError?error.status:503);}
  }
};
