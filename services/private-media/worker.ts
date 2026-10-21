import {authorizeOwner,denied,privateHeaders,type OwnerEnvironment} from '../../functions/_lib/owner-access';
import {readJson,SafeError,sha256} from '../shared/safe-json';
import {validateFinanceState} from '../private-finance/validation';

interface ObjectHead {size:number;httpMetadata?:{contentType?:string};etag?:string;}
interface ObjectBody extends ObjectHead {body:ReadableStream<Uint8Array>;range?:{offset?:number;length?:number};}
export interface PrivateBucket {head(key:string):Promise<ObjectHead|null>;get(key:string,options?:{range:{offset:number;length:number}}):Promise<ObjectBody|null>;}
export interface MediaEnvironment extends OwnerEnvironment {FINANCE_MEDIA_APPROVED?:string;FINANCE_MEDIA_BUCKET?:PrivateBucket;}
const supported=new Map([['video/mp4','mp4'],['text/vtt','vtt'],['image/png','png'],['image/jpeg','jpg'],['image/webp','webp'],['application/pdf','pdf']]);
const maxChunk=16*1024*1024;
const reject=(status:number,code:string)=>Response.json({ok:false,error:code},{status,headers:privateHeaders});
/** Parse a single byte range. Multiple and malformed ranges never hit storage. */
export function mediaRange(value:string|null,size:number):{offset:number;length:number}|null{
 if(!Number.isSafeInteger(size)||size<0||size>100*1024*1024*1024)throw new SafeError('invalid_media_size',503);
 if(value===null)return null;
 const m=/^bytes=(\d*)-(\d*)$/.exec(value);
 if(!m||(!m[1]&&!m[2])||size===0)throw new SafeError('invalid_media_range',416);
 let start:number,end:number;
 if(!m[1]){const suffix=Number(m[2]);if(!Number.isSafeInteger(suffix)||suffix<=0)throw new SafeError('invalid_media_range',416);start=Math.max(0,size-suffix);end=size-1;}
 else{start=Number(m[1]);end=m[2]?Number(m[2]):Math.min(size-1,start+maxChunk-1);}
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)throw new SafeError('invalid_media_range',416);
 end=Math.min(end,size-1);if(end-start+1>maxChunk)end=start+maxChunk-1;
 return{offset:start,length:end-start+1};
}
export async function mediaObjectKey(subject:string,id:string):Promise<string>{return 'owner/'+await sha256(subject)+'/media/'+id;}

export default {
 async fetch(request:Request,env:MediaEnvironment):Promise<Response>{
  const access=await authorizeOwner(request,env);if(!access.ok)return denied(access);
  if(request.headers.get('X-Owner-Subject')!==access.subject)return reject(403,'owner_binding_mismatch');
  if(env.FINANCE_MEDIA_APPROVED!=='true'||!env.FINANCE_MEDIA_BUCKET||!env.FINANCE_STORE||env.FINANCE_STORE_APPROVED!=='true')return reject(503,'private_media_not_configured');
  if(!['GET','HEAD'].includes(request.method))return reject(405,'method_not_allowed');
  const url=new URL(request.url);const match=/^\/object\/([A-Za-z0-9][A-Za-z0-9_-]{0,79})$/.exec(url.pathname);
  let unknownQuery=false;url.searchParams.forEach((_value,key)=>{if(key!=='download')unknownQuery=true;});
  if(!match||unknownQuery||url.searchParams.getAll('download').length>1||(url.searchParams.has('download')&&url.searchParams.get('download')!=='1'))return reject(404,'not_found');
  try{
   const headers=new Headers({'X-Owner-Subject':access.subject});for(const name of ['Cookie','Authorization','Cf-Access-Jwt-Assertion']){const value=request.headers.get(name);if(value)headers.set(name,value);}
   const result=await env.FINANCE_STORE.fetch(new Request('https://finance-store.internal/state',{headers,redirect:'error',signal:AbortSignal.timeout(5000)}));
   if(!result.ok){await result.body?.cancel();throw new SafeError('private_records_unavailable',503);}
   const state=validateFinanceState(await readJson(result));
   const id=match[1];const known=state.operations?.projects.some(project=>project.media.some(m=>m.privateAssetId===id||m.captionRef===id));
   if(!known)return reject(404,'media_not_registered');
   const key=await mediaObjectKey(access.subject,id);const head=await env.FINANCE_MEDIA_BUCKET.head(key);
   if(!head)return reject(404,'media_unavailable');
   const mime=head.httpMetadata?.contentType?.split(';')[0].trim().toLowerCase()||'';
   if(!supported.has(mime))return reject(415,'unsupported_private_media_type');
   const range=mediaRange(request.headers.get('Range'),head.size);
   const responseHeaders=new Headers({...privateHeaders,'Content-Type':mime,'Accept-Ranges':'bytes','Cross-Origin-Resource-Policy':'same-origin','Content-Security-Policy':"default-src 'none'; sandbox; frame-ancestors 'none'"});
   responseHeaders.set('Content-Disposition',(url.searchParams.has('download')||mime==='application/pdf'?'attachment':'inline')+'; filename="asset-'+id+'.'+supported.get(mime)+'"');
   responseHeaders.set('Content-Length',String(range?range.length:head.size));
   if(range)responseHeaders.set('Content-Range','bytes '+range.offset+'-'+(range.offset+range.length-1)+'/'+head.size);
   if(request.method==='HEAD')return new Response(null,{status:range?206:200,headers:responseHeaders});
   const object=await env.FINANCE_MEDIA_BUCKET.get(key,range?{range}:undefined);
   if(!object||object.size!==head.size||(head.etag!==undefined&&object.etag!==head.etag)||object.httpMetadata?.contentType?.split(';')[0].trim().toLowerCase()!==mime){await object?.body.cancel();throw new SafeError('media_changed_retry',409);}
   return new Response(object.body,{status:range?206:200,headers:responseHeaders});
  }catch(error){return reject(error instanceof SafeError?error.status:503,error instanceof SafeError?error.code:'private_media_unavailable');}
 }
};
