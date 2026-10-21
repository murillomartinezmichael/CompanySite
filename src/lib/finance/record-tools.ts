import {moneyToCents,type FinanceState} from './model';
const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
interface Readiness {ok?:boolean;storageReady?:boolean;realImportAllowed?:boolean;recordsImported?:boolean;refreshConfigured?:boolean;}
interface Preview {ok:boolean;digest:string;expectedRevision:number;canCommit:boolean;accounts:number;cds:number;silverLots:number;activity:number;warnings:string[];}
const hint=(text:string)=>'<p class="ws-muted">'+text+'</p>';
const row=(label:string,control:string)=>'<label>'+label+control+'</label>';
const field=(name:string,type='text',extra='')=>'<input name="'+name+'" type="'+type+'" '+extra+'/>';
const select=(name:string,options:[string,string][])=>'<select name="'+name+'">'+options.map(([value,label])=>'<option value="'+escape(value)+'">'+escape(label)+'</option>').join('')+'</select>';

/** No secret or financial record is persisted in browser storage. Uploaded JSON
 * is held only in this component's memory until preview/commit or navigation. */
export async function mountRecordTools(root:HTMLElement,state:FinanceState,reload:()=>Promise<void>):Promise<void>{
  if(root.dataset.view!=='activity')return;
  const mount=document.createElement('section');mount.className='ws-section';mount.id='finance-record-tools';
  mount.innerHTML='<div class="ws-section-head"><h2>Verified records & recovery</h2></div>'+hint('Activity records what happened. A dated account snapshot records what the source actually showed. Keep the two separate.')+
  '<p id="record-tool-status" class="ws-notice" role="status">Checking private storage and import permissions.</p>'+
  '<details class="ws-panel"><summary>Import the starting account snapshot</summary>'+hint('One initial import only, after private storage is approved. Preview validates accounts, sources, quantities, ownership and duplicate identities without saving. Never paste bank passwords or credentials.')+
  '<form id="snapshot-import-form" class="ws-form"><label class="wide">Private source-state JSON<input id="snapshot-source-file" type="file" accept="application/json,.json" required disabled/></label><button type="submit" class="ws-button" disabled>Preview without saving</button><p class="ws-form-status" role="status" hidden></p></form>'+
  '<form id="snapshot-commit-form" class="ws-form" hidden><label class="wide">Type IMPORT VERIFIED RECORDS to confirm<input name="confirmation" autocomplete="off" required pattern="IMPORT VERIFIED RECORDS"/></label><button type="submit" class="ws-button primary">Import verified records</button><p class="ws-form-status" role="status" hidden></p></form></details>'+
  '<details class="ws-panel"><summary>Add a dated value observation</summary>'+hint('This adds a source observation without executing a trade. An account net-value observation does not silently replace a different gross-holdings or margin snapshot.')+
  '<form id="observation-form" class="ws-form">'+row('Account',select('accountId',[['','Choose an account'],...[...state.accounts,...state.silver,...state.cds].map(a=>[a.id,a.name] as [string,string])]))+
  row('Observation type',select('kind',[['account-net-equity','Brokerage net equity'],['cd-balance','CD balance'],['silver-spot-estimate','Silver: estimated metal value']]))+
  row('Observed at, with timezone',field('observedAt','text','placeholder="YYYY-MM-DDTHH:MM:SSZ" required'))+
  row('Value / price date',field('priceDate','date','required'))+
  row('Reported value, USD',field('value','number','step="0.01" min="-9999999999"'))+
  row('Dated source reference',field('source','text','maxlength="200" required'))+
  '<label class="check wide"><input name="unavailable" type="checkbox"/> Source value was unavailable; keep a gap, not a zero.</label>'+
  '<label class="check wide"><input name="userConfirmed" type="checkbox" required/> I verified this observation against its source.</label>'+
  '<fieldset class="wide" id="silver-observation-fields" hidden><legend>Silver spot estimate</legend><div class="ws-form">'+row('Total troy ounces on that date',field('ounces','text','inputmode="decimal"'))+row('USD spot price per troy ounce',field('unitPrice','number','min="0.01" step="0.01"'))+'</div>'+hint('Use a verified silver spot source, not an ETF, futures contract, retail price or dealer bid. The server checks the metal-value arithmetic.')+'</fieldset>'+
  '<button type="submit" class="ws-button primary" disabled>Save dated observation</button><p class="ws-form-status" role="status" hidden></p></form></details>'+
  '<details class="ws-panel"><summary>Recovery and read-only refresh</summary>'+hint('The encrypted backup does not include the encryption key. Recovery must be tested with the approved key in a separate empty store. The refresh action is unavailable until its source and permissions are approved.')+
  '<div class="ws-actions"><button id="finance-backup" type="button" disabled>Download encrypted backup</button><button id="finance-refresh" type="button" disabled>Refresh approved read-only source</button></div><p id="finance-recovery-status" role="status" class="ws-muted">No refresh has been scheduled or performed.</p></details>';
  mount.insertAdjacentHTML('beforeend','<details class="ws-panel"><summary>Update brokerage holdings from a verified snapshot</summary>'+hint('After a purchase, record the activity first. Then import a new dated brokerage snapshot with exact holdings, unit-price dates, gross securities, crypto, cash, margin and net equity. Investor ownership does not change. Older records remain in history.')+'<form id="brokerage-snapshot-form" class="ws-form"><label class="wide">Dated brokerage-snapshot JSON<input type="file" name="snapshotFile" accept="application/json,.json" required/></label><button type="submit" class="ws-button primary" disabled>Save verified holdings snapshot</button><p class="ws-form-status" role="status" hidden></p></form></details>');
  root.appendChild(mount);
  const status=mount.querySelector<HTMLElement>('#record-tool-status')!;
  let readiness:Readiness={};let uploaded:unknown;let preview:Preview|null=null;let observationKey:string|null=null;
  const show=(form:HTMLFormElement,text:string)=>{const p=form.querySelector<HTMLElement>('[role=status]')!;p.hidden=false;p.textContent=text;};
  async function send(route:string,body:unknown,key?:string){
    const response=await fetch('/api/workspace/'+route,{method:'POST',credentials:'same-origin',cache:'no-store',redirect:'error',headers:{'Content-Type':'application/json',...(key?{'Idempotency-Key':key}:{})},body:JSON.stringify(body)});
    const data=await response.json();if(!response.ok||data.ok!==true)throw new Error('The private operation was not confirmed. Review its approval, source data or conflicting earlier request before retrying.');return data;
  }
  try{const response=await fetch('/api/workspace/readiness',{credentials:'same-origin',cache:'no-store',redirect:'error'});if(response.ok)readiness=await response.json();}catch{}
  if(!mount.isConnected)return;
  status.textContent=readiness.storageReady?'Private storage responded. Each import, recovery and refresh action still requires its own approval.':'Private storage is not ready. These tools are disabled; no real records have been loaded.';
  const importForm=mount.querySelector<HTMLFormElement>('#snapshot-import-form')!;
  const commitForm=mount.querySelector<HTMLFormElement>('#snapshot-commit-form')!;
  const fileInput=mount.querySelector<HTMLInputElement>('#snapshot-source-file')!;
  const canImport=readiness.storageReady===true&&readiness.realImportAllowed===true&&readiness.recordsImported===false;
  fileInput.disabled=!canImport;importForm.querySelector<HTMLButtonElement>('button')!.disabled=!canImport;
  fileInput.addEventListener('change',()=>{uploaded=undefined;preview=null;commitForm.hidden=true;});
  importForm.addEventListener('submit',async event=>{event.preventDefault();if(!canImport)return;const button=importForm.querySelector<HTMLButtonElement>('button')!;button.disabled=true;try{
    const file=fileInput.files?.[0];if(!file||file.size>524288)throw new Error('Select a source-state JSON file smaller than 512 KB.');uploaded=JSON.parse(await file.text());preview=await send('import/preview',{state:uploaded}) as Preview;
    if(!preview.canCommit)throw new Error('The initial snapshot is already present. It has not been overwritten.');
    show(importForm,'Preview only — nothing saved. '+preview.accounts+' brokerages, '+preview.cds+' CDs, '+preview.silverLots+' silver lots, '+preview.activity+' activity records. Review flags: '+(preview.warnings.join(', ')||'none')+'.');commitForm.hidden=false;
  }catch(error){preview=null;commitForm.hidden=true;show(importForm,error instanceof Error?error.message:'Import preview unavailable.');}finally{button.disabled=false;}});
  commitForm.addEventListener('submit',async event=>{event.preventDefault();if(!preview||!uploaded||!canImport)return;const button=commitForm.querySelector<HTMLButtonElement>('button')!;button.disabled=true;try{
    const confirmation=String(new FormData(commitForm).get('confirmation'));const receipt=await send('import/commit',{state:uploaded,digest:preview.digest,expectedRevision:preview.expectedRevision,confirmation});
    if(receipt.confirmed!==true)throw new Error('The import was not confirmed. Keep the original file and do not assume it was saved.');uploaded=undefined;preview=null;await reload();
  }catch(error){show(commitForm,error instanceof Error?error.message:'Import unconfirmed.');button.disabled=false;}});
  const observationForm=mount.querySelector<HTMLFormElement>('#observation-form')!;
  observationForm.querySelector<HTMLButtonElement>('button')!.disabled=!(readiness.storageReady&&readiness.recordsImported);
  observationForm.querySelector<HTMLSelectElement>('[name=kind]')!.addEventListener('change',event=>{mount.querySelector<HTMLElement>('#silver-observation-fields')!.hidden=(event.target as HTMLSelectElement).value!=='silver-spot-estimate';});
  observationForm.addEventListener('submit',async event=>{event.preventDefault();if(!readiness.storageReady||!readiness.recordsImported)return;const button=observationForm.querySelector<HTMLButtonElement>('button')!;button.disabled=true;try{
    const data=new FormData(observationForm);observationKey=observationKey||crypto.randomUUID();const signedCents=(value:string)=>value.startsWith('-')?-moneyToCents(value.slice(1)):moneyToCents(value);
    const body:any={accountId:String(data.get('accountId')),kind:String(data.get('kind')),observation:{id:observationKey,observedAt:String(data.get('observedAt')),priceDate:String(data.get('priceDate')),source:String(data.get('source')),sourceType:'user',userConfirmed:data.has('userConfirmed'),valueCents:data.has('unavailable')?null:signedCents(String(data.get('value')))}};
    if(body.kind==='silver-spot-estimate'){body.quoteType='spot';body.quoteCurrency='USD';body.quoteUnit='troy-ounce';body.observation.quantityAtObservation=String(data.get('ounces'));body.observation.unitPriceCents=moneyToCents(String(data.get('unitPrice')));}
    const receipt=await send('observation',body,observationKey);if(receipt.confirmed!==true)throw new Error('Observation save was not confirmed.');observationKey=null;observationForm.reset();show(observationForm,'Observation saved. Older source data is retained without replacing a newer value.');
  }catch(error){show(observationForm,error instanceof Error?error.message:'Observation unconfirmed.');}finally{button.disabled=false;}});
  const holdingsForm=mount.querySelector<HTMLFormElement>('#brokerage-snapshot-form')!;
  holdingsForm.querySelector<HTMLButtonElement>('button')!.disabled=!(readiness.storageReady&&readiness.recordsImported);
  let holdingsKey:string|null=null;holdingsForm.querySelector('input')!.addEventListener('change',()=>{holdingsKey=null;});
  holdingsForm.addEventListener('submit',async event=>{event.preventDefault();if(!readiness.storageReady||!readiness.recordsImported)return;const button=holdingsForm.querySelector<HTMLButtonElement>('button')!;button.disabled=true;try{
    const file=(holdingsForm.elements.namedItem('snapshotFile') as HTMLInputElement).files?.[0];if(!file||file.size>262144)throw new Error('Select a brokerage-snapshot JSON file smaller than 256 KB.');const body=JSON.parse(await file.text());if(body.kind!=='brokerage-snapshot'||body.observation?.userConfirmed!==true)throw new Error('Use an explicitly source-verified brokerage snapshot.');holdingsKey=holdingsKey||crypto.randomUUID();const receipt=await send('observation',body,holdingsKey);if(receipt.confirmed!==true)throw new Error('Holdings snapshot save was not confirmed.');show(holdingsForm,'Holdings snapshot recorded. A newer dated snapshot may update current holdings; older records stay in history. No ownership or trading changes were made.');
  }catch(error){show(holdingsForm,error instanceof Error?error.message:'Holdings snapshot unconfirmed.');}finally{button.disabled=false;}});
  const recovery=mount.querySelector<HTMLElement>('#finance-recovery-status')!;
  const backup=mount.querySelector<HTMLButtonElement>('#finance-backup')!;backup.disabled=!(readiness.storageReady&&readiness.recordsImported);
  backup.addEventListener('click',async()=>{backup.disabled=true;try{const r=await fetch('/api/workspace/backup',{credentials:'same-origin',cache:'no-store',redirect:'error'});if(!r.ok)throw new Error('Encrypted backup was not available.');const blob=await r.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='finance-encrypted-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);recovery.textContent='Encrypted backup prepared. Keep the approved recovery key separately; it is not in this file.';}catch(e){recovery.textContent=e instanceof Error?e.message:'Backup unavailable.';}finally{backup.disabled=false;}});
  const refresh=mount.querySelector<HTMLButtonElement>('#finance-refresh')!;refresh.disabled=readiness.refreshConfigured!==true;
  refresh.addEventListener('click',async()=>{refresh.disabled=true;try{const receipt=await send('refresh',{confirmation:'REFRESH READ-ONLY VALUATIONS'},crypto.randomUUID());if(receipt.confirmed!==true)throw new Error('Refresh was not confirmed.');recovery.textContent='Read-only refresh processed. Inspect source dates and gaps; no trading or money movement occurred.';}catch(e){recovery.textContent=e instanceof Error?e.message:'Refresh unavailable.';}finally{refresh.disabled=readiness.refreshConfigured!==true;}});
}
