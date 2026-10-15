// Each proposed system has an independent budget. Hardware totals come from future-build.mjs.
// USD planning allowances as of 2026-10-15, NOT retailer quotes, commitments or purchases.
import {futureBuild,phaseCost,totalCost,money} from './future-build.mjs';
const hardware=[
  ['recovery','Independent backup recovery',5,'Verify restorable backups before repairing Windows C: or migrating Linux data'],
  ['network','Lab firewall and segmentation',0,'Separate M3MM.NET from household Xfinity; verify Cisco VLANs and DHCP first'],
  ['storage','NAS file and snapshot server',5,'Central shares, snapshots, user permissions and backup restore tests'],
  ['virtualization','Proxmox hypervisor',5,'VMs, containers, recovery images and isolated test environments'],
  ['server','Upgraded always-on application server',15,'Migrate services away from the aging Pentium box with rollback'],
  ['ai','Dedicated high-VRAM local AI workstation',30,'Benchmark local inference, model-serving and GPU-assisted development'],
  ['rack','Rack, PDU and patch management',0,'Document cabling, power and serviceability'],
  ['faster-network','2.5/10GbE upgrade',5,'Upgrade only demonstrated bandwidth bottlenecks'],
  ['offsite','Off-site encrypted backup',10,'Keep recoverable copies outside the home'],
  ['cooling','Environmental sensors and airflow',5,'Measure and alert on heat, humidity and physical hazards']
];
const extras=[
 {id:'monitoring',name:'Monitoring and incident response',capital:0,monthly:0,shared:'Existing Pi/VM resources; no dedicated new hardware',deliverable:'Uptime Kuma, logs, alerts, incident runbooks',status:'Planned'},
 {id:'identity',name:'Identity, secrets and access controls',capital:0,monthly:5,shared:'Open-source tooling and existing VM capacity',deliverable:'Least-privilege access, secrets handling, MFA and audit policy',status:'Design and review'},
 {id:'dns',name:'Lab DNS, certificates and remote access',capital:0,monthly:10,shared:'Existing Pis and Tailscale; no new appliance',deliverable:'Documented names, certificate renewal and remote access recovery',status:'Planned; protect home DNS'},
 {id:'dev',name:'Developer environments and CI',capital:0,monthly:10,shared:'Already budgeted Proxmox and existing workstations',deliverable:'Reproducible builds, staging and release checks',status:'Planned'},
 {id:'agents',name:'Isolated AI agents and orchestration',capital:0,monthly:10,shared:'Already budgeted VMs and AI compute',deliverable:'Sandboxed agents, permissions, approvals and audit trails',status:'Design phase'},
 {id:'portfolio',name:'Software product portfolio',capital:0,monthly:20,shared:'Shared existing and proposed infrastructure; product-specific costs TBD',deliverable:'Individual project scopes, labor estimates, API usage and launch budgets',status:'Not yet individually costed'},
 {id:'operations',name:'Operations and replacement reserve',capital:0,monthly:30,shared:'Recurring allowance, not a hardware purchase',deliverable:'Replacement parts, batteries, renewals and unexpected repairs',status:'Planning allowance'}
];
export const workstreams=[
 ...hardware.map(([id,name,monthly,deliverable])=>{
   const p=futureBuild.find(x=>x.id===id);
   if(!p)throw Error('Missing hardware phase '+id);
   return {id,name,capital:phaseCost(p),monthly,shared:p.devices.map(d=>d.name).join(', '),deliverable,status:'Future purchase; '+p.gate};
 }),
 ...extras
];
export const workstreamCapex=workstreams.reduce((n,w)=>n+w.capital,0);
export const monthlyAllowance=workstreams.reduce((n,w)=>n+w.monthly,0);
if(workstreamCapex!==totalCost)throw Error('Hardware budget reconciliation failed');
export const renderBudgets=()=>{
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return `<section class="wrap section" id="separate-budgets" aria-labelledby="separate-budgets-heading">
 <div class="section-heading"><div><p class="section-label">Every system, independently budgeted</p><h2 id="separate-budgets-heading">One budget per build.</h2></div><p>Separate budgets for NAS, AI workstation, replacement application server, firewall, backups, power, virtualization, networking and operations. Shared hardware is counted only once.</p></div>
 <div class="future-summary"><div><span class="section-label">One-time equipment subtotal</span><strong>${money(workstreamCapex)}</strong><p>Matches the detailed device roadmap; before tax, shipping and contingency.</p></div><div><span class="section-label">Illustrative ongoing allowance</span><strong>${money(monthlyAllowance)}/mo</strong><p>${money(monthlyAllowance*12)}/year when all services are active. Excludes measured electricity, labor, insurance, tax and unknown vendor charges.</p></div></div>
 <div class="future-grid">${workstreams.map(w=>`<article class="future-phase"><div class="future-phase-top"><span class="pill">${w.capital>0?'Hardware build':'Operations / software'}</span><strong>${money(w.capital)}</strong></div><h3>${esc(w.name)}</h3><p><strong>Equipment / resource:</strong> ${esc(w.shared)}</p><p><strong>Acceptance outcome:</strong> ${esc(w.deliverable)}</p><p class="fine">Illustrative recurring allowance: ${money(w.monthly)}/month</p><details class="coverage"><summary>Readiness and dependency</summary><p>${esc(w.status)}</p></details></article>`).join('')}</div>
 <p class="fine">Budget guardrails: one-time hardware ${money(workstreamCapex)}, illustrative 15% purchase contingency ${money(Math.ceil(workstreamCapex*1.15/100)*100)}, plus separate recurring costs. Software portfolio items require per-product estimates before funded delivery commitments. No capital contributions or purchases are confirmed.</p></section>`;
};
