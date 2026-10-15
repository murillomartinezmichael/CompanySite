// Investor-facing future hardware plan: estimates only, not quotes or purchases.
// All values USD, dated 2026-10-15. Adjust after compatibility, tax, shipping and vendor checks.
export const futureBuild = [
  {id:'recovery',phase:'01',title:'Recovery and continuity',window:'First priority',purpose:'Protect irreplaceable work before expanding infrastructure.',devices:[
    {name:'Independent backup drive',spec:'8 TB external HDD, verified restore target',qty:1,unit:200},
    {name:'Pure-sine UPS',spec:'1500 VA class, measured load and runtime required',qty:2,unit:240},
    {name:'Console and cabling kit',spec:'Compatible Cisco console adapter, Cat6 patch cables, labels',qty:1,unit:110}
  ],gate:'Independent sample restore and measured UPS loads before filesystem repair or migrations.'},
  {id:'network',phase:'02',title:'Secure lab network',window:'After recovery gate',purpose:'Keep Xfinity household Wi-Fi stable while separating M3MM.NET.',devices:[
    {name:'UniFi Cloud Gateway Fiber',spec:'UCG-Fiber, integrated management, multi-gig routing and firewall',qty:1,unit:308}
  ],gate:'Verify Cisco uplink, VLANs, TP-Link mode, DHCP and physical rollback. No household cutover.'},
  {id:'storage',phase:'03',title:'Shared storage and backups',window:'When capacity is justified',purpose:'Provide central project storage and recoverable service data.',devices:[
    {name:'Four-bay NAS enclosure',spec:'x86 NAS with snapshots and user permissions; exact model TBD',qty:1,unit:600},
    {name:'8 TB CMR NAS HDD',spec:'Two matched NAS-rated disks; mirrored ≈8 TB raw usable before filesystem overhead',qty:2,unit:230}
  ],gate:'Confirm drive compatibility, backup destinations, restore proof and ongoing operating costs.'},
  {id:'virtualization',phase:'04',title:'Dedicated virtualization',window:'After network and backup validation',purpose:'Isolate apps, monitoring and disposable development workloads.',devices:[
    {name:'Proxmox mini PC',spec:'Modern x86 CPU, 32–64 GB RAM, 1 TB NVMe; exact model TBD',qty:1,unit:750}
  ],gate:'Validate CPU/RAM/SSD capacity and VM restore; do not erase existing Windows or Ubuntu hosts.'},
  {id:'ai',phase:'05',title:'Expandable AI workstation',window:'Later, based on measured demand',purpose:'High-VRAM local inference, model evaluation and agent development.',devices:[
    {name:'High-VRAM NVIDIA GPU',spec:'24–32 GB VRAM class, availability and benchmarks TBD',qty:1,unit:2600},
    {name:'CPU, motherboard and cooling',spec:'12–16-core desktop platform, PCIe expansion and adequate cooling',qty:1,unit:1050},
    {name:'System RAM',spec:'128 GB supported memory configuration',qty:1,unit:420},
    {name:'NVMe storage',spec:'2 TB system/projects plus 4 TB AI models',qty:1,unit:440},
    {name:'Case and power supply',spec:'Airflow-focused chassis, quality PSU sized for GPU',qty:1,unit:440}
  ],gate:'Benchmark current RTX 3050/3070 Ti systems, verify thermals, VRAM need, power and payback.'}
];
export const phaseCost=phase=>phase.devices.reduce((sum,d)=>sum+d.qty*d.unit,0);
export const totalCost=futureBuild.reduce((sum,phase)=>sum+phaseCost(phase),0);
export const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export const roadmapMarkup=()=>{
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return `<section class="wrap section future-build" id="future-build" aria-labelledby="future-build-title">
 <div class="section-heading"><div><p class="section-label">Future equipment roadmap · 2026 planning estimates</p><h2 id="future-build-title">What we intend to build next.</h2></div><p>Device-by-device specifications, estimated costs and approval gates. This is a future plan—not equipment already owned, purchased, pledged or installed.</p></div>
 <div class="future-summary"><div><span class="section-label">Illustrative equipment subtotal</span><strong>${money(totalCost)}</strong><p>Before sales tax, shipping, recurring costs, repairs and contingency. Prices are budget assumptions, not live retailer quotes.</p></div><div><span class="section-label">Estimated all-in planning envelope</span><strong>${money(Math.ceil(totalCost*1.15/100)*100)}</strong><p>Subtotal plus an illustrative 15% allowance for taxes, shipping and contingency; actual costs may differ.</p></div></div>
 <div class="future-grid">${futureBuild.map(phase=>`<article class="future-phase" id="future-${esc(phase.id)}"><div class="future-phase-top"><span class="pill">Phase ${phase.phase} · Proposed</span><strong>${money(phaseCost(phase))}</strong></div><h3>${esc(phase.title)}</h3><p class="fine">${esc(phase.window)}</p><p>${esc(phase.purpose)}</p><div class="future-devices">${phase.devices.map(d=>`<div class="future-device"><div><strong>${esc(d.name)}</strong><p>${esc(d.spec)}</p><small>Quantity ${d.qty} · ${money(d.unit)} estimated each</small></div><strong>${money(d.qty*d.unit)}</strong></div>`).join('')}</div><p class="future-gate"><strong>Before purchase:</strong> ${esc(phase.gate)}</p></article>`).join('')}</div>
 <p class="fine">Existing assets retained: Xfinity household gateway, TP-Link pending role verification, Cisco 2960-CX, D-Link/NETGEAR switches, Ubuntu RTX 3050 server with USB-attached drives, Windows Ryzen 9 workstation, ThinkPad and Raspberry Pis. Existing devices are not double-counted in the new-equipment budget. NAS mirroring is not a substitute for independent backup.</p>
 </section>`;
};
