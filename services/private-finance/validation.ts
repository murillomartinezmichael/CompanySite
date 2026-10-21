import type {OperationsRecords} from '../../src/lib/finance/operations';
import { validateActivity, validateGoal, reconciliation, selectObservation, quantityValue, type FinanceState, type Observation } from '../../src/lib/finance/model';
import { SafeError, stableJson, sha256 } from '../shared/safe-json';

const ID=/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
const QUANTITY=/^\d{1,10}(\.\d{1,12})?$/;
function object(value:unknown,allowed:string[],required=allowed):Record<string,any>{
  if(!value||typeof value!=='object'||Array.isArray(value))throw new SafeError('invalid_record');
  const v=value as Record<string,any>;
  if(Object.keys(v).some(k=>!allowed.includes(k))||required.some(k=>!(k in v)))throw new SafeError('unknown_or_missing_fields');
  return v;
}
const text=(v:unknown,max=500,nullable=false)=>{if(nullable&&v===null)return;if(typeof v!=='string'||!v.trim()||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))throw new SafeError('invalid_text');};
const id=(v:unknown)=>{if(typeof v!=='string'||!ID.test(v))throw new SafeError('invalid_record_id');};
const cents=(v:unknown,signed=false)=>{if(v!==null&&(!Number.isSafeInteger(v)||Math.abs(Number(v))>999999999999||(!signed&&Number(v)<0)))throw new SafeError('invalid_amount');};
const bool=(v:unknown)=>{if(typeof v!=='boolean')throw new SafeError('invalid_boolean');};
const enumeration=(v:unknown,options:string[])=>{if(typeof v!=='string'||!options.includes(v))throw new SafeError('invalid_enum');};
export function validDate(value:unknown,nullable=false):void {
  if(nullable&&value===null)return;
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw new SafeError('invalid_date');
}
export function validTimestamp(value:unknown,nullable=false):void {
  if(nullable&&value===null)return;
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.test(value)||!Number.isFinite(Date.parse(value)))throw new SafeError('invalid_timestamp');
  validDate(value.slice(0,10));
}
function list(value:unknown,max=10000):any[]{if(!Array.isArray(value)||value.length>max)throw new SafeError('invalid_collection');return value;}
function unique(rows:any[]){const seen=new Set<string>();for(const row of rows){id(row.id);if(seen.has(row.id))throw new SafeError('duplicate_record_id');seen.add(row.id);}}
function history(value:unknown,mode:'private'|'synthetic'){const values=list(value);unique(values);for(const row of values)validateObservation(row,mode);}
export function validateObservation(value:unknown,mode:'private'|'synthetic'='private'):Observation {
  const v=object(value,['id','observedAt','priceDate','source','sourceType','userConfirmed','valueCents','quantityAtObservation','unitPriceCents','cashCents','marginCents','snapshot'],['id','observedAt','priceDate','source','sourceType','userConfirmed','valueCents']);
  id(v.id);validTimestamp(v.observedAt);validDate(v.priceDate);text(v.source,200);bool(v.userConfirmed);cents(v.valueCents,true);
  enumeration(v.sourceType,mode==='private'?['user','provider']:['user','provider','synthetic']);
  if(Date.parse(v.observedAt)>Date.now()+30000||v.priceDate>new Date().toISOString().slice(0,10))throw new SafeError('future_observation');
  if(v.quantityAtObservation!==undefined&&v.quantityAtObservation!==null&&(!QUANTITY.test(v.quantityAtObservation)||Number(v.quantityAtObservation)<0))throw new SafeError('invalid_quantity');
  for(const key of ['unitPriceCents','cashCents','marginCents'])if(v[key]!==undefined)cents(v[key],key==='cashCents');
  if(v.snapshot!==undefined)validateBrokerageSnapshot(v.snapshot,v.priceDate);
  if(v.priceDate>new Date(v.observedAt).toISOString().slice(0,10))throw new SafeError('price_date_after_observation');
  return structuredClone(v) as Observation;
}
export function validateFinanceState(value:unknown,mode:'private'|'synthetic'='private'):FinanceState {
  const v=object(value,['schemaVersion','mode','asOf','accounts','silver','cds','contributors','obligations','activity','goals','contributionPlan','refresh','operations'],['schemaVersion','mode','asOf','accounts','silver','cds','contributors','obligations','activity','goals','contributionPlan','refresh']);
  if(v.schemaVersion!==1||v.mode!==mode)throw new SafeError('wrong_state_schema_or_mode');
  if(v.asOf!=='')validTimestamp(v.asOf);
  for(const key of ['accounts','silver','cds','contributors','obligations','activity','goals'])unique(list(v[key],key==='activity'?10000:500));
  const accountIds=new Set<string>();
  for(const row of [...v.accounts,...v.silver,...v.cds]){if(accountIds.has(row.id))throw new SafeError('duplicate_account_identity');accountIds.add(row.id);}
  for(const raw of v.accounts){const a=object(raw,['id','name','ownership','securitiesCents','cryptoCents','cashCents','marginCents','netEquityCents','deficitCents','holdings','history','snapshotObservedAt','snapshotSource','snapshotPriceDate'],['id','name','ownership','securitiesCents','cryptoCents','cashCents','marginCents','netEquityCents','deficitCents','holdings','history']);if(a.snapshotObservedAt!==undefined)validTimestamp(a.snapshotObservedAt,true);if(a.snapshotSource!==undefined)text(a.snapshotSource,200,true);if(a.snapshotPriceDate!==undefined)validDate(a.snapshotPriceDate,true);text(a.name,120);enumeration(a.ownership,['personal','investor-managed','unresolved']);for(const key of ['securitiesCents','cryptoCents','cashCents','marginCents','netEquityCents','deficitCents'])cents(a[key],['cashCents','netEquityCents'].includes(key));history(a.history,mode);const symbols=new Set<string>();for(const rawHolding of list(a.holdings,1000)){const h=object(rawHolding,['symbol','identityVerified','quantity','unitPriceCents','priceDate']);text(h.symbol,20);if(symbols.has(h.symbol))throw new SafeError('duplicate_holding_identity');symbols.add(h.symbol);bool(h.identityVerified);if(h.quantity!==null&&(typeof h.quantity!=='string'||!QUANTITY.test(h.quantity)))throw new SafeError('invalid_quantity');cents(h.unitPriceCents);validDate(h.priceDate,true);}}
  for(const raw of v.silver){const s=object(raw,['id','name','coinType','quantity','troyOzEach','weightVerified','recordedCostCents','history','dealerBuybackCents','retailPremiumCents','dealerSource','dealerAsOf','retailSource','retailAsOf'],['id','name','coinType','quantity','troyOzEach','weightVerified','recordedCostCents','history','dealerBuybackCents','retailPremiumCents']);text(s.name,120);text(s.coinType,150,true);if(s.quantity!==null&&(!Number.isSafeInteger(s.quantity)||s.quantity<0))throw new SafeError('invalid_coin_count');if(s.troyOzEach!==null&&(typeof s.troyOzEach!=='string'||!QUANTITY.test(s.troyOzEach)||Number(s.troyOzEach)<=0))throw new SafeError('invalid_coin_weight');bool(s.weightVerified);for(const key of ['recordedCostCents','dealerBuybackCents','retailPremiumCents'])cents(s[key]);history(s.history,mode);for(const pair of [['dealerBuybackCents','dealerSource','dealerAsOf'],['retailPremiumCents','retailSource','retailAsOf']]){if(s[pair[0]]!==null){text(s[pair[1]],200);validTimestamp(s[pair[2]]);}}}
  for(const raw of v.cds){const c=object(raw,['id','name','balanceCents','principalCents','apyPercent','openedAt','maturesAt','termMonths','renewal','penalty','history']);text(c.name,120);cents(c.balanceCents);cents(c.principalCents);if(c.apyPercent!==null&&(!Number.isFinite(c.apyPercent)||c.apyPercent<0||c.apyPercent>100))throw new SafeError('invalid_apy');validDate(c.openedAt,true);validDate(c.maturesAt,true);if(c.openedAt&&c.maturesAt&&c.maturesAt<c.openedAt)throw new SafeError('invalid_maturity');if(c.termMonths!==null&&(!Number.isSafeInteger(c.termMonths)||c.termMonths<1))throw new SafeError('invalid_term');text(c.renewal,500,true);text(c.penalty,500,true);history(c.history,mode);}
  for(const raw of v.contributors){const c=object(raw,['id','name','kind']);text(c.name,120);enumeration(c.kind,['owner','investor','unresolved']);}
  for(const raw of v.obligations){const o=object(raw,['id','name','creditorId','reportedCents','status','monthlyCents','startDate','interestAgreed']);text(o.name,120);if(o.creditorId!==null&&!v.contributors.some((c:any)=>c.id===o.creditorId))throw new SafeError('unknown_creditor');cents(o.reportedCents);cents(o.monthlyCents);if(o.monthlyCents===0)throw new SafeError('zero_monthly_repayment');enumeration(o.status,['reported','unresolved']);validDate(o.startDate,true);bool(o.interestAgreed);}
  const prior:any[]=[];for(const raw of v.activity){const a=object(raw,['id','requestId','accountId','date','kind','symbol','identityVerified','quantity','amountCents','feesCents','contributorId','sourceRef','correctsId','note','cashDirection','obligationId','correctionAction','replacementKind'],['id','requestId','accountId','date','kind','symbol','identityVerified','quantity','amountCents','feesCents','contributorId','sourceRef','correctsId','note']);try{validateActivity(a,{...v,activity:prior} as FinanceState);}catch{throw new SafeError('invalid_activity_record');}prior.push(a);}
  const requestIds=new Set<string>();for(const a of v.activity){if(requestIds.has(a.requestId))throw new SafeError('duplicate_request_id');requestIds.add(a.requestId);}
  for(const raw of v.goals){const g=object(raw,['id','name','targetCents','targetDate','savedCents']);text(g.name,120);try{validateGoal(g,v as FinanceState);}catch{throw new SafeError('invalid_goal_record');}}
  const plan=object(v.contributionPlan,['accountId','ownerMonthlyCents','investorMonthlyCents']);if(plan.accountId!==''&&!v.accounts.some((a:any)=>a.id===plan.accountId))throw new SafeError('unknown_contribution_account');cents(plan.ownerMonthlyCents);cents(plan.investorMonthlyCents);
  const refresh=object(v.refresh,['lastSuccessAt','priceDate','source','status','error']);validTimestamp(refresh.lastSuccessAt,true);validDate(refresh.priceDate,true);text(refresh.source,200,true);text(refresh.error,200,true);enumeration(refresh.status,['not-configured','error','ready']);
  if(v.operations!==undefined)validateOperations(v.operations);
  const copy=structuredClone(v) as FinanceState;
  if(new TextEncoder().encode(stableJson(copy)).byteLength>524288)throw new SafeError('state_capacity_limit',413);
  return copy;
}
export function emptyFinanceState():FinanceState{return{schemaVersion:1,mode:'private',asOf:'',accounts:[],silver:[],cds:[],contributors:[],obligations:[],activity:[],goals:[{id:'school',name:'School',targetCents:null,savedCents:null,targetDate:null},{id:'license',name:'Real estate license',targetCents:null,savedCents:null,targetDate:null},{id:'travel',name:'Asia travel',targetCents:null,savedCents:null,targetDate:null}],contributionPlan:{accountId:'',ownerMonthlyCents:null,investorMonthlyCents:null},refresh:{lastSuccessAt:null,priceDate:null,source:null,status:'not-configured',error:null}};}
export async function previewImport(value:unknown){
  const state=validateFinanceState(value);const warnings:string[]=[];
  for(const a of state.accounts){const r=reconciliation(a);if(r.differenceCents!==0)warnings.push(r.differenceCents===null?'account_reconciliation_incomplete':'account_reconciliation_mismatch');if(a.ownership!=='personal')warnings.push('account_not_confirmed_personal');if(a.holdings.some(h=>!h.identityVerified||h.quantity===null))warnings.push('holdings_verification_required');}
  if(state.silver.some(s=>!s.weightVerified))warnings.push('metal_type_or_weight_provisional');
  if(state.obligations.some(o=>o.status==='unresolved'))warnings.push('unresolved_obligation_preserved');
  return{digest:await sha256(stableJson(state)),accounts:state.accounts.length,cds:state.cds.length,silverLots:state.silver.length,activity:state.activity.length,warnings:[...new Set(warnings)],state};
}
export interface ObservationImport {accountId:string;kind:'account-net-equity'|'brokerage-snapshot'|'cd-balance'|'silver-spot-estimate';observation:Observation;quoteType?:'spot';quoteCurrency?:'USD';quoteUnit?:'troy-ounce';}
export function applyObservation(state:FinanceState,value:unknown):{state:FinanceState;changed:boolean;duplicate:boolean;selected:boolean}{
  const v=object(value,['accountId','kind','observation','quoteType','quoteCurrency','quoteUnit'],['accountId','kind','observation']);id(v.accountId);
  enumeration(v.kind,['account-net-equity','brokerage-snapshot','cd-balance','silver-spot-estimate']);const observation=validateObservation(v.observation,state.mode);
  const next=structuredClone(state);const collection=['account-net-equity','brokerage-snapshot'].includes(v.kind)?next.accounts:v.kind==='cd-balance'?next.cds:next.silver;
  const account=collection.find(a=>a.id===v.accountId);if(!account)throw new SafeError('unknown_account');
  if(v.kind==='silver-spot-estimate'&&(v.quoteType!=='spot'||v.quoteCurrency!=='USD'||v.quoteUnit!=='troy-ounce'||observation.quantityAtObservation==null||observation.unitPriceCents==null))throw new SafeError('verified_silver_spot_required');
  if(v.kind==='silver-spot-estimate'){if(observation.unitPriceCents!<=0||observation.valueCents!==quantityValue(observation.quantityAtObservation!,observation.unitPriceCents!))throw new SafeError('silver_value_does_not_reconcile');}
  if(v.kind==='cd-balance'&&observation.valueCents!==null&&observation.valueCents<0)throw new SafeError('invalid_cd_balance');
  if(v.kind==='brokerage-snapshot'){if(!observation.snapshot)throw new SafeError('brokerage_snapshot_required');validateBrokerageSnapshot(observation.snapshot,observation.priceDate);if(observation.snapshot.netEquityCents!==observation.valueCents)throw new SafeError('snapshot_net_value_mismatch');}
  const old=account.history.find(o=>o.id===observation.id);
  if(old){if(stableJson(old)!==stableJson(observation))throw new SafeError('observation_id_conflict',409);return{state,changed:false,duplicate:true,selected:false};}
  const last=[...account.history].sort((a,b)=>Date.parse(b.observedAt)-Date.parse(a.observedAt))[0]||null;
  const storedSnapshot=account as typeof next.accounts[number];
  const snapshotBoundary=v.kind!=='brokerage-snapshot'||!storedSnapshot.snapshotObservedAt
    ||(Date.parse(observation.observedAt)>=Date.parse(storedSnapshot.snapshotObservedAt)
       &&(!storedSnapshot.snapshotPriceDate||observation.priceDate>=storedSnapshot.snapshotPriceDate));
  const selected=selectObservation(last,observation).accepted && (!last||observation.priceDate>=last.priceDate) && observation.valueCents!==null && snapshotBoundary;
  account.history.push(observation);
  if(v.kind==='brokerage-snapshot'&&selected&&observation.snapshot){Object.assign(account,structuredClone(observation.snapshot),{snapshotObservedAt:observation.observedAt,snapshotSource:observation.source,snapshotPriceDate:observation.priceDate});}
  // Null means unavailable, not a new zero or a reason to erase known equity.
  // An isolated net-equity point does not rewrite a separate gross/margin snapshot.
  if(v.kind==='cd-balance'&&selected&&observation.valueCents!==null)(account as any).balanceCents=observation.valueCents;
  return{state:next,changed:true,duplicate:false,selected};
}

/** A current holdings update must be one reconciled, dated brokerage snapshot.
 * Old snapshots remain in history and never reset quantities on a newer record. */
export function validateBrokerageSnapshot(value:unknown,priceDate:string):void {
 const s=object(value,['securitiesCents','cryptoCents','cashCents','marginCents','netEquityCents','deficitCents','holdings']);
 for(const key of ['securitiesCents','cryptoCents','cashCents','marginCents','netEquityCents','deficitCents'])cents(s[key],['cashCents','netEquityCents'].includes(key));
 const identities=new Set<string>();
 for(const raw of list(s.holdings,1000)){
   const h=object(raw,['symbol','identityVerified','quantity','unitPriceCents','priceDate']);text(h.symbol,20);bool(h.identityVerified);cents(h.unitPriceCents);validDate(h.priceDate,true);
   if(identities.has(h.symbol))throw new SafeError('duplicate_holding_identity');identities.add(h.symbol);
   if(h.quantity!==null&&(typeof h.quantity!=='string'||!QUANTITY.test(h.quantity)))throw new SafeError('invalid_quantity');
   if(h.unitPriceCents!==null&&h.priceDate!==priceDate)throw new SafeError('mismatched_position_timestamps');
 }
 const result=reconciliation({...s,id:'snapshot-validation',name:'Snapshot',ownership:'unresolved',history:[]} as any);
 if(result.differenceCents!==null&&result.differenceCents!==0)throw new SafeError('snapshot_reconciliation_mismatch');
}

/** Source ownership and status are copied as supplied, never inferred from URLs.
 * Media are private object references only; no raw filesystem paths or public URLs. */
export function validateOperations(value:unknown):OperationsRecords {
 const v=object(value,['sourceRef','asOf','projects','workstreams']);text(v.sourceRef,200);validTimestamp(v.asOf,true);
 if(v.asOf&&Date.parse(v.asOf)>Date.now()+30000)throw new SafeError('future_operations_source');
 unique(list(v.projects,500));unique(list(v.workstreams,100));
 for(const raw of v.projects){const p=object(raw,['id','name','owner','status','category','description','nextAction','sourceRef','reviewedAt','media']);
  for(const key of ['name','owner','status','category'])text(p[key],120);
  for(const key of ['description','nextAction'])text(p[key],1500);text(p.sourceRef,200);validTimestamp(p.reviewedAt,true);
  if(p.reviewedAt&&Date.parse(p.reviewedAt)>Date.now()+30000)throw new SafeError('future_operations_source');
  for(const rawMedia of list(p.media,50)){const m=object(rawMedia,['title','kind','privateAssetId','captionRef']);text(m.title,200);enumeration(m.kind,['workflow','overview','output']);if(m.privateAssetId!==null)id(m.privateAssetId);if(m.captionRef!==null)id(m.captionRef);}
 }
 for(const raw of v.workstreams){const w=object(raw,['id','name','owner','status','capitalCents','monthlyCents','sourceRef','observedAt','readinessGate']);
  for(const key of ['name','owner','status'])text(w[key],120);text(w.sourceRef,200);text(w.readinessGate,1500);cents(w.capitalCents);cents(w.monthlyCents);validTimestamp(w.observedAt,true);
  if(w.observedAt&&Date.parse(w.observedAt)>Date.now()+30000)throw new SafeError('future_operations_source');
 }
 const copy=structuredClone(v) as OperationsRecords;
 if(new TextEncoder().encode(stableJson(copy)).byteLength>262144)throw new SafeError('operations_capacity_limit',413);
 return copy;
}
