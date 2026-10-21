/** Approval-gated private operations import. No records or credentials are
 * bundled in the app, persisted in browser storage or sent to analytics. */
export async function mountOperationsImport(root:HTMLElement,reload:()=>Promise<void>):Promise<void>{
 if(root.dataset.view!=='operations')return;
 const section=document.createElement('section');section.className='ws-section';section.id='operations-import-tools';
 section.innerHTML='<details class="ws-panel"><summary>Import reviewed private operational records</summary><p class="ws-muted">Preserve project owners, exact source statuses, next actions and private media references. The original files remain unchanged. This does not publish content or approve any purchase.</p><form id="operations-preview-form" class="ws-form"><label class="wide">Private operations JSON<input type="file" id="operations-source-file" accept="application/json,.json" required disabled/></label><button type="submit" class="ws-button" disabled>Preview file without saving</button><p class="ws-form-status" role="status" hidden></p></form><form id="operations-commit-form" class="ws-form" hidden><label class="wide">Type IMPORT PRIVATE OPERATIONS to confirm<input name="confirmation" pattern="IMPORT PRIVATE OPERATIONS" autocomplete="off" required/></label><button type="submit" class="ws-button primary">Save private operational records</button><p class="ws-form-status" role="status" hidden></p></form><p id="operations-readiness" class="ws-muted" role="status">Checking private import approval.</p></details>';
 root.append(section);
 let readiness:{storageReady?:boolean;realImportAllowed?:boolean;recordsImported?:boolean;revision?:number}={};
 try{const response=await fetch('/api/workspace/readiness',{cache:'no-store',credentials:'same-origin',redirect:'error'});if(response.ok)readiness=await response.json();}catch{}
 if(!section.isConnected)return;
 const allowed=readiness.storageReady===true&&readiness.realImportAllowed===true&&readiness.recordsImported===true&&Number.isSafeInteger(readiness.revision);
 section.querySelector<HTMLElement>('#operations-readiness')!.textContent=allowed?'Private import is approved. Preview the source file, then explicitly confirm. Server validation and revision checks run before any save.':'Private operations import is disabled until owner authentication, approved storage, the initial account state and import approval are ready.';
 const previewForm=section.querySelector<HTMLFormElement>('#operations-preview-form')!;
 const commitForm=section.querySelector<HTMLFormElement>('#operations-commit-form')!;
 const fileInput=section.querySelector<HTMLInputElement>('#operations-source-file')!;
 fileInput.disabled=!allowed;previewForm.querySelector<HTMLButtonElement>('button')!.disabled=!allowed;
 let operations:unknown;let requestId:string|null=null;
 const show=(form:HTMLFormElement,text:string)=>{const output=form.querySelector<HTMLElement>('[role=status]')!;output.hidden=false;output.textContent=text;};
 fileInput.addEventListener('change',()=>{operations=undefined;requestId=null;commitForm.hidden=true;});
 previewForm.addEventListener('submit',async event=>{
  event.preventDefault();if(!allowed)return;
  try{const file=fileInput.files?.[0];if(!file||file.size>262144)throw new Error('Choose a JSON file smaller than 256 KB.');const candidate=JSON.parse(await file.text());if(!candidate||typeof candidate!=='object'||!Array.isArray(candidate.projects)||!Array.isArray(candidate.workstreams)||typeof candidate.sourceRef!=='string')throw new Error('Use the documented private operations format.');operations=candidate;show(previewForm,'Local file preview only — nothing saved. '+candidate.projects.length+' project records and '+candidate.workstreams.length+' workstreams. The server will validate every field before saving. Existing ownership and status must be preserved.');commitForm.hidden=false;}
  catch(error){operations=undefined;commitForm.hidden=true;show(previewForm,error instanceof Error?error.message:'The file could not be read.');}
 });
 commitForm.addEventListener('submit',async event=>{
  event.preventDefault();if(!allowed||!operations)return;
  const button=commitForm.querySelector<HTMLButtonElement>('button')!;button.disabled=true;
  try{requestId=requestId||crypto.randomUUID();const confirmation=String(new FormData(commitForm).get('confirmation'));const response=await fetch('/api/workspace/operations',{method:'POST',cache:'no-store',credentials:'same-origin',redirect:'error',headers:{'Content-Type':'application/json','Idempotency-Key':requestId},body:JSON.stringify({operations,expectedRevision:readiness.revision,confirmation})});const receipt=await response.json();if(!response.ok||receipt.confirmed!==true)throw new Error('The operations import was not confirmed. The source may be invalid or the private records changed since preview. No overwrite has been assumed.');operations=undefined;await reload();}
  catch(error){show(commitForm,error instanceof Error?error.message:'Operations import unconfirmed.');button.disabled=false;}
 });
}
