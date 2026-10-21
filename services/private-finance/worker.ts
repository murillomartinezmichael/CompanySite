import { authorizeOwner, denied, privateHeaders, type OwnerEnvironment, type ServiceBinding } from '../../functions/_lib/owner-access';
import { validateActivity, validateGoal, appendActivity, activityFingerprint, type FinanceState } from '../../src/lib/finance/model';
import { readJson, stableJson, sha256, SafeError } from '../shared/safe-json';
import { FinanceRepository, type PrivateDatabase, type Receipt, type StoreDocument } from './repository';
import { emptyFinanceState, previewImport, validateFinanceState, validateOperations, applyObservation } from './validation';
import { applyRefresh } from './refresh';

export interface StoreEnvironment extends OwnerEnvironment {
  FINANCE_DB?:PrivateDatabase;
  FINANCE_ENCRYPTION_KEY?:string;
  FINANCE_IMPORT_APPROVED?:string;
  FINANCE_RESTORE_APPROVED?:string;
  FINANCE_REFRESH_APPROVED?:string;
  FINANCE_SOURCE_NAME?:string;
  FINANCE_SOURCE?:ServiceBinding;
}
const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{...privateHeaders,'Content-Type':'application/json'}});
const requestId=(request:Request)=>{const key=request.headers.get('Idempotency-Key');if(!key||!/^[A-Za-z0-9_-]{8,80}$/.test(key))throw new SafeError('idempotency_key_required');return key;};
const freshDocument=(state:FinanceState):StoreDocument=>({state,receipts:[],refreshRunIds:[],refreshRunDigests:[]});

export default {
  async fetch(request:Request,env:StoreEnvironment):Promise<Response>{
    // The store verifies the session independently. X-Owner-Subject alone is never trusted.
    const access=await authorizeOwner(request,env);if(!access.ok)return denied(access);
    const actor=request.headers.get('X-Owner-Subject');if(actor!==access.subject)return reply({ok:false,error:'owner_binding_mismatch'},403);
    if(!env.FINANCE_DB||!env.FINANCE_ENCRYPTION_KEY||env.FINANCE_STORE_APPROVED!=='true')return reply({ok:false,error:'private_storage_not_configured'},503);
    const repository=new FinanceRepository(env.FINANCE_DB,access.subject,env.FINANCE_ENCRYPTION_KEY);
    const route=new URL(request.url).pathname;
    const getRoutes=['/state','/readiness','/backup'];
    const postRoutes=['/activity','/goal','/import/preview','/import/commit','/observation','/refresh','/restore','/operations'];
    if(![...getRoutes,...postRoutes].includes(route))return reply({ok:false,error:'not_found'},404);
    if(request.method!==(getRoutes.includes(route)?'GET':'POST'))return reply({ok:false,error:'method_not_allowed'},405);
    try{
      if(route==='/readiness'){const stored=await repository.load();return reply({ok:true,storageReady:true,importAllowed:env.FINANCE_IMPORT_APPROVED==='true',recordsImported:Boolean(stored),revision:stored?.revision||0,dailyRefreshVerified:false,refreshConfigured:env.FINANCE_REFRESH_APPROVED==='true'&&Boolean(env.FINANCE_SOURCE&&env.FINANCE_SOURCE_NAME)});}
      if(route==='/state'){const stored=await repository.load();return reply(stored?.document.state||emptyFinanceState());}
      if(route==='/backup'){const backup=await repository.backup();return new Response(JSON.stringify(backup),{headers:{...privateHeaders,'Content-Type':'application/json','Content-Disposition':'attachment; filename="finance-encrypted-backup.json"'}});}
      const body=await readJson(request,route.startsWith('/import/')||route==='/restore'?1200000:524288) as Record<string,unknown>;
      if(route==='/import/preview'){
        if(env.FINANCE_IMPORT_APPROVED!=='true')throw new SafeError('private_import_not_approved',503);
        const preview=await previewImport(body.state);const current=await repository.load();const {state:_,...receipt}=preview;
        return reply({ok:true,...receipt,expectedRevision:current?.revision||0,initialImportOnly:true,canCommit:!current});
      }
      if(route==='/import/commit'){
        if(env.FINANCE_IMPORT_APPROVED!=='true')throw new SafeError('private_import_not_approved',503);
        if(body.expectedRevision!==0||body.confirmation!=='IMPORT VERIFIED RECORDS')throw new SafeError('explicit_import_confirmation_required');
        const preview=await previewImport(body.state);if(body.digest!==preview.digest)throw new SafeError('preview_changed',409);
        const state=preview.state;
        // A pasted file cannot claim a scheduled provider refresh happened.
        state.refresh={...state.refresh,lastSuccessAt:null,status:'not-configured',error:null};
        const saved=await repository.commit(freshDocument(state),0,'initial-import');
        if(!saved)throw new SafeError('initial_import_already_exists',409);
        return reply({ok:true,confirmed:true,revision:1,imported:true});
      }
      if(route==='/restore'){
        if(env.FINANCE_RESTORE_APPROVED!=='true'||body.confirmation!=='RESTORE INTO EMPTY STORE')throw new SafeError('restore_not_approved',503);
        if(!(await repository.restoreIntoEmpty(body.backup)))throw new SafeError('restore_conflict',409);
        return reply({ok:true,confirmed:true,restored:true});
      }
      if(route==='/operations'&&(env.FINANCE_IMPORT_APPROVED!=='true'||body.confirmation!=='IMPORT PRIVATE OPERATIONS'))throw new SafeError('private_operations_import_not_approved',503);
      const key=requestId(request);
      const fingerprint=await sha256(stableJson({route,body}));
      // A known committed retry must not invoke the external source again.
      const initial=await repository.load();if(!initial)throw new SafeError('initial_import_required',409);
      const committed=initial.document.receipts.find(r=>r.requestId===key);
      if(committed){if(committed.fingerprint!==fingerprint)throw new SafeError('idempotency_conflict',409);return reply({ok:true,confirmed:true,recordId:committed.recordId,duplicate:true,revision:initial.revision});}
      // Expensive external fetch occurs once, not again on each CAS retry.
      let refreshEnvelope:unknown;
      if(route==='/refresh'){
        if(env.FINANCE_REFRESH_APPROVED!=='true'||!env.FINANCE_SOURCE||!env.FINANCE_SOURCE_NAME)throw new SafeError('valuation_refresh_not_approved',503);
        if(body.confirmation!=='REFRESH READ-ONLY VALUATIONS')throw new SafeError('refresh_confirmation_required');
        try{
          const response=await env.FINANCE_SOURCE.fetch(new Request('https://finance-source.internal/observations',{method:'GET',headers:{'X-Owner-Subject':access.subject},redirect:'error',signal:AbortSignal.timeout(5000)}));
          if(!response.ok){await response.body?.cancel();throw new SafeError('valuation_source_unavailable',503);}
          refreshEnvelope=await readJson(response,524288);
        }catch{
          // Persist a bounded failure status without recording a false quote,
          // refreshing timestamps or exposing a provider's exception text.
          const accounts=[...initial.document.state.accounts,...initial.document.state.silver,...initial.document.state.cds];
          refreshEnvelope={runId:key,source:env.FINANCE_SOURCE_NAME,attemptedAt:new Date().toISOString(),observations:[],errors:accounts.map(account=>({accountId:account.id,code:'source-unavailable'}))};
        }
      }
      for(let attempt=0;attempt<4;attempt++){
        const stored=await repository.load();if(!stored)throw new SafeError('initial_import_required',409);
        const document=stored.document;
        const previous=document.receipts.find(r=>r.requestId===key);
        if(previous){if(previous.fingerprint!==fingerprint)throw new SafeError('idempotency_conflict',409);return reply({ok:true,confirmed:true,recordId:previous.recordId,duplicate:true,revision:stored.revision});}
        let recordId=key,duplicate=false;
        if(route==='/activity'){
          const original=body as any;
          if(original.requestId!==key)throw new SafeError('idempotency_key_mismatch');
          const activity=validateActivity(original,document.state);
          const sameId=document.state.activity.find(a=>a.id===activity.id);
          if(sameId&&activityFingerprint(sameId)!==activityFingerprint(activity))throw new SafeError('activity_id_conflict',409);
          const saved=appendActivity(document.state.activity,activity);document.state.activity=saved.rows;recordId=saved.record.id;duplicate=saved.duplicate;
        }else if(route==='/goal'){
          const goal=validateGoal(body,document.state);document.state.goals=document.state.goals.map(g=>g.id===goal.id?goal:g);recordId=goal.id;
        }else if(route==='/operations'){
          if(body.expectedRevision!==stored.revision)throw new SafeError('operations_revision_changed',409);
          document.state.operations=validateOperations(body.operations);recordId=key;
        }else if(route==='/observation'){
          const result=applyObservation(document.state,body);document.state=result.state;recordId=(body.observation as any).id;duplicate=result.duplicate;
        }else if(route==='/refresh'){
          const result=applyRefresh(document.state,refreshEnvelope,env.FINANCE_SOURCE_NAME!);recordId=result.runId;
          const digest=await sha256(stableJson(refreshEnvelope));
          const priorRun=document.refreshRunDigests?.find(item=>item.runId===result.runId);
          if(document.refreshRunIds.includes(result.runId)){
            if(priorRun&&priorRun.digest!==digest)throw new SafeError('refresh_run_content_conflict',409);
            duplicate=true;
          }else{document.state=result.state;document.refreshRunIds.push(result.runId);(document.refreshRunDigests||=[]).push({runId:result.runId,digest});}
        }
        validateFinanceState(document.state);
        document.receipts.push({requestId:key,fingerprint,recordId,duplicate} satisfies Receipt);
        if(await repository.commit(document,stored.revision,route.slice(1))){return reply({ok:true,confirmed:true,recordId,duplicate,revision:stored.revision+1},duplicate?200:201);}
      }
      throw new SafeError('concurrent_write_retry_required',409);
    }catch(error){return reply({ok:false,error:error instanceof SafeError?error.code:'private_operation_unconfirmed'},error instanceof SafeError?error.status:503);}
  }
};
