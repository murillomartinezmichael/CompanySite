import type { FinanceState } from '../../src/lib/finance/model';
import { applyObservation, validTimestamp, type ObservationImport } from './validation';
import { SafeError } from '../shared/safe-json';

export interface RefreshEnvelope {
  runId: string;
  source: string;
  attemptedAt: string;
  observations: ObservationImport[];
  errors: Array<{accountId:string;code:'missing-price'|'market-closed'|'source-unavailable'}>;
}

/** Read-only source results. This does not enable a scheduler, create a broker
 * connection or treat a retrieval timestamp as the date of an older value. */
export function applyRefresh(state:FinanceState,value:unknown,approvedSource:string):{
  state:FinanceState;runId:string;added:number;duplicates:number;selected:number;
}{
  const v=value as RefreshEnvelope;
  if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!['runId','source','attemptedAt','observations','errors'].includes(k)))throw new SafeError('invalid_refresh');
  if(!/^[A-Za-z0-9_-]{8,80}$/.test(v.runId||'')||!approvedSource||v.source!==approvedSource)throw new SafeError('unapproved_refresh_source');
  validTimestamp(v.attemptedAt);
  const age=Date.now()-Date.parse(v.attemptedAt);
  if(age< -30000||age>3600000)throw new SafeError('stale_refresh_response');
  if(!Array.isArray(v.observations)||v.observations.length>500||!Array.isArray(v.errors)||v.errors.length>500)throw new SafeError('invalid_refresh');
  const ids=new Set([...state.accounts,...state.silver,...state.cds].map(a=>a.id));
  for(const error of v.errors){
    if(!error||typeof error!=='object'||Object.keys(error).some(k=>!['accountId','code'].includes(k))||!ids.has(error.accountId)||!['missing-price','market-closed','source-unavailable'].includes(error.code))throw new SafeError('invalid_refresh_error');
  }
  let next=structuredClone(state);let added=0,duplicates=0,selected=0;
  const selectedDates:string[]=[];
  for(const item of v.observations){
    if(item.observation?.source!==approvedSource||item.observation?.sourceType!=='provider'||item.observation?.userConfirmed!==false)throw new SafeError('provider_must_not_claim_user_confirmation');
    if(Date.parse(item.observation.observedAt)>Date.parse(v.attemptedAt)+30000)throw new SafeError('observation_after_refresh');
    const result=applyObservation(next,item);next=result.state;
    if(result.changed)added++;
    if(result.duplicate)duplicates++;
    if(result.selected&&item.observation.valueCents!==null){selected++;selectedDates.push(item.observation.priceDate);}
  }
  const success=selected>0;
  const hardErrors=v.errors.some(e=>e.code!=='market-closed');
  const priorSuccess=state.refresh.lastSuccessAt;
  const timestampIsNew=!priorSuccess||Date.parse(v.attemptedAt)>=Date.parse(priorSuccess);
  // An out-of-order result may add historical evidence, but must not regress
  // the summary's refresh timestamp or claim a newer successful refresh.
  if(timestampIsNew){
    const selectedDate=selectedDates.sort().at(-1)||null;
    const priceDate=success&&selectedDate
      ?(!state.refresh.priceDate||selectedDate>=state.refresh.priceDate?selectedDate:state.refresh.priceDate)
      :state.refresh.priceDate;
    next.refresh={
      lastSuccessAt:success?v.attemptedAt:priorSuccess,
      priceDate,
      source:approvedSource,
      status:success&&!hardErrors?'ready':'error',
      error:!success?'No newer priced observation; prior values retained.'
        :v.errors.length?'Some source observations were unavailable; inspect dated records.':null
    };
  }
  return{state:next,runId:v.runId,added,duplicates,selected};
}
