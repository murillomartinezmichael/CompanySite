import {authorizeOwner,denied,privateHeaders,privateResponse,type OwnerEnvironment} from '../../_lib/owner-access';
import {validateActivity,validateGoal,activityCsv} from '../../../src/lib/finance/model';
import {validateFinanceState} from '../../../services/private-finance/validation';
import {readJson,SafeError} from '../../../services/shared/safe-json';
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{...privateHeaders,'Content-Type':'application/json'}});

/** Pages facade. The separate private store independently verifies the session.
 * No browser role, account value, source URL or actor header grants authority. */
export const onRequest:PagesFunction<OwnerEnvironment>=async({request,env,params})=>{
  const access=await authorizeOwner(request,env);if(!access.ok)return denied(access);
  const raw=params.path;const route=Array.isArray(raw)?raw.join('/'):String(raw||'');
  if(route.startsWith('media/')){
    if(!/^media\/[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(route)||!['GET','HEAD'].includes(request.method))return json({ok:false,error:'not_found'},404);
    if(env.FINANCE_MEDIA_APPROVED!=='true'||!env.FINANCE_MEDIA)return json({ok:false,error:'private_media_not_configured'},503);
    const headers=new Headers({'X-Owner-Subject':access.subject});
    for(const name of ['Cookie','Authorization','Cf-Access-Jwt-Assertion','Range']){const value=request.headers.get(name);if(value)headers.set(name,value);}
    try{const target=new URL('https://private-media.internal/object/'+route.slice(6));target.search=new URL(request.url).search;return privateResponse(await env.FINANCE_MEDIA.fetch(new Request(target,{method:request.method,headers,redirect:'error',signal:AbortSignal.timeout(10000)})));}
    catch{return json({ok:false,error:'private_media_unavailable'},503);}
  }
  const methods:Record<string,string>={state:'GET',activity:'POST',goal:'POST','export.csv':'GET',readiness:'GET','import/preview':'POST','import/commit':'POST',observation:'POST',refresh:'POST',backup:'GET',restore:'POST',operations:'POST'};
  if(!methods[route])return json({ok:false,error:'not_found'},404);
  if(request.method!==methods[route])return json({ok:false,error:'method_not_allowed'},405);
  const configured=Boolean(env.FINANCE_STORE&&env.FINANCE_STORE_APPROVED==='true');
  if(route==='readiness'&&!configured)return json({ok:true,ownerOnly:true,storageReady:false,dailyRefreshVerified:false,realImportAllowed:false});
  if(!configured)return json({ok:false,error:'private_storage_not_configured'},503);
  const sessionHeaders=new Headers({'X-Owner-Subject':access.subject});
  for(const name of ['Cookie','Authorization','Cf-Access-Jwt-Assertion']){const value=request.headers.get(name);if(value)sessionHeaders.set(name,value);}
  const storeCall=(target:string,method='GET',body?:unknown,key?:string)=>{
    const headers=new Headers(sessionHeaders);
    if(body!==undefined)headers.set('Content-Type','application/json');
    if(key)headers.set('Idempotency-Key',key);
    return env.FINANCE_STORE!.fetch(new Request('https://finance-store.internal/'+target,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(10000)}));
  };
  try{
    if(route==='readiness'){
      const r=await storeCall('readiness');if(!r.ok)return json({ok:false,error:'private_store_unavailable'},503);
      const readiness=await readJson(r,8192) as Record<string,unknown>;
      return json({ok:true,ownerOnly:true,storageReady:readiness.storageReady===true,recordsImported:readiness.recordsImported===true,revision:readiness.revision,dailyRefreshVerified:false,realImportAllowed:env.FINANCE_IMPORT_APPROVED==='true'&&readiness.importAllowed===true,refreshConfigured:env.FINANCE_REFRESH_APPROVED==='true'&&readiness.refreshConfigured===true,mediaConfigured:env.FINANCE_MEDIA_APPROVED==='true'&&Boolean(env.FINANCE_MEDIA)});
    }
    if(request.method==='POST'){
      if(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return json({ok:false,error:'cross_site_write_rejected'},403);
    }
    if(['state','export.csv','activity','goal'].includes(route)){
      const stateResponse=await storeCall('state');if(!stateResponse.ok)return json({ok:false,error:'private_store_unavailable'},503);
      let state;
      try{state=validateFinanceState(await readJson(stateResponse));}catch{return json({ok:false,error:'private_store_invalid_response'},503);}
      if(route==='state')return json(state);
      if(route==='export.csv')return new Response(activityCsv(state.activity),{headers:{...privateHeaders,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="activity.csv"'}});
      const body=await readJson(request,16384);
      if(route==='goal'){
        let goal;try{goal=validateGoal(body,state);}catch{return json({ok:false,error:'invalid_goal'},400);}
        const key=request.headers.get('Idempotency-Key')||crypto.randomUUID();
        const saved=await storeCall('goal','POST',goal,key);if(!saved.ok)return json({ok:false,error:'private_store_write_unconfirmed'},saved.status===409?409:503);
        const receipt=await readJson(saved,8192) as {confirmed?:boolean};if(receipt.confirmed!==true)return json({ok:false,error:'private_store_write_unconfirmed'},503);
        return json({ok:true,confirmed:true,goalId:goal.id});
      }
      let activity;try{activity=validateActivity(body,state);}catch{return json({ok:false,error:'invalid_activity',message:'Check the account, date, quantity, source and contributor.'},400);}
      if(request.headers.get('Idempotency-Key')!==activity.requestId)return json({ok:false,error:'idempotency_key_mismatch'},400);
      const saved=await storeCall('activity','POST',activity,activity.requestId);
      if(!saved.ok)return json({ok:false,error:saved.status===409?'duplicate_conflict':'private_store_write_unconfirmed'},saved.status===409?409:503);
      const receipt=await readJson(saved,8192) as {confirmed?:boolean;recordId?:string;duplicate?:boolean};
      if(receipt.confirmed!==true||typeof receipt.recordId!=='string')return json({ok:false,error:'private_store_write_unconfirmed'},503);
      return json({ok:true,confirmed:true,recordId:receipt.recordId,duplicate:receipt.duplicate===true},receipt.duplicate?200:201);
    }
    if((route.startsWith('import/')||route==='operations')&&env.FINANCE_IMPORT_APPROVED!=='true')return json({ok:false,error:'private_import_not_approved'},503);
    if(route==='refresh'&&env.FINANCE_REFRESH_APPROVED!=='true')return json({ok:false,error:'valuation_refresh_not_approved'},503);
    if(route==='restore'&&env.FINANCE_RESTORE_APPROVED!=='true')return json({ok:false,error:'restore_not_approved'},503);
    const body=request.method==='POST'?await readJson(request,route.startsWith('import/')||route==='restore'?1200000:524288):undefined;
    const response=await storeCall(route,request.method,body,request.headers.get('Idempotency-Key')||undefined);
    if(!response.ok){await response.body?.cancel();return json({ok:false,error:'private_operation_unconfirmed'},[400,403,404,409,413,415,503].includes(response.status)?response.status:503);}
    const result=await readJson(response,route==='backup'?1200000:524288);
    return new Response(JSON.stringify(result),{status:response.status,headers:{...privateHeaders,'Content-Type':'application/json',...(route==='backup'?{'Content-Disposition':'attachment; filename="finance-encrypted-backup.json"'}:{})}});
  }catch(error){return json({ok:false,error:error instanceof SafeError?error.code:'private_store_unavailable'},error instanceof SafeError?error.status:503);}
};
