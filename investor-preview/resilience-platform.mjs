// Additional resilience and service-layer investments. USD planning allowances, NOT current vendor quotes.
// Incremental capex only; do not re-count existing NAS, UPS, GPU, Proxmox, firewall or server.
export const resilience=[
{group:'Resilience and facilities',items:[
{name:'Secondary ISP / 5G failover',capex:350,monthly:65,detail:'Compatible modem/router, service plan, antenna and failover test; coverage and CGNAT constraints TBD'},
{name:'Encrypted off-site cloud backup',capex:0,monthly:30,detail:'B2/Wasabi-class storage; actual stored TB, retrieval, API and retention costs must be modeled'},
{name:'Out-of-band KVM and safe power control',capex:500,monthly:0,detail:'PiKVM/IPMI where compatible, monitored PDU or managed power; prevent unsafe power cycling'},
{name:'Rack heat/noise survey',capex:150,monthly:0,detail:'Thermal/acoustic measurement and room survey; prior rack fans and environmental sensors not counted twice'}]},
{group:'Identity, deployment and observability',items:[
{name:'Identity / SSO',capex:0,monthly:10,detail:'Authentik or Keycloak on isolated VMs; break-glass administrator access retained'},
{name:'Password and application secrets',capex:0,monthly:15,detail:'Bitwarden/Vaultwarden plus dedicated application secret handling, MFA and backup'},
{name:'Reverse proxy, TLS and DNS',capex:0,monthly:10,detail:'Caddy/Traefik, DNS provider, certificate automation; no direct admin exposure'},
{name:'Git CI/CD and image registry',capex:0,monthly:20,detail:'GitHub Actions or Forgejo, isolated runners and artifact/container retention'},
{name:'Central logs and metrics',capex:0,monthly:10,detail:'Loki/Graylog, Grafana and metrics; storage/retention quotas on shared host'},
{name:'Staging and client isolation',capex:0,monthly:25,detail:'Separate staging and production identities, networks, credentials and backups'}]},
{group:'AI platform',items:[
{name:'Inference gateway and metering',capex:0,monthly:20,detail:'Ollama/vLLM behind LiteLLM where supported; per-client credentials, quotas, privacy and billing review'},
{name:'GPU monitoring',capex:0,monthly:0,detail:'NVIDIA DCGM exporter where supported, Prometheus/Grafana, thermals and capacity alerts'},
{name:'Fast model storage expansion',capex:400,monthly:0,detail:'Additional local NVMe capacity for weights and caches; do not count existing model SSD twice'}]},
{group:'Business operations and recovery',items:[
{name:'Patch and vulnerability management',capex:0,monthly:15,detail:'Inventory, approved patch windows, scanning only authorized assets and remediation tracking'},
{name:'Disaster recovery exercises',capex:0,monthly:20,detail:'Restore rehearsals, runbooks, RPO/RTO evidence and encrypted off-site key custody'},
{name:'Cyber and E&O insurance allowance',capex:0,monthly:150,detail:'Illustrative placeholder only; obtain underwriting quotes and verify exclusions'},
{name:'Client SLA and legal review allowance',capex:0,monthly:75,detail:'Service levels, response hours, privacy, incident notices, contracts and legal review'}]}
];
export const resilienceItems=resilience.flatMap(g=>g.items);
export const resilienceCapex=resilienceItems.reduce((n,x)=>n+x.capex,0);
export const resilienceMonthly=resilienceItems.reduce((n,x)=>n+x.monthly,0);
const money=n=>'$'+n.toLocaleString('en-US');
export const renderResilience=()=>{
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return `<section class="wrap section" id="resilience" aria-labelledby="resilience-title"><div class="section-heading"><div><p class="section-label">Continuity, software and operations</p><h2 id="resilience-title">What keeps M3MM.NET running.</h2></div><p>These are incremental future capabilities beyond the physical hardware roadmap. Shared servers, storage and GPUs are not charged twice.</p></div><div class="future-summary"><div><span class="section-label">Additional one-time allowances</span><strong>${money(resilienceCapex)}</strong><p>Failover hardware, remote console, room assessment and additional model storage.</p></div><div><span class="section-label">Additional monthly allowances</span><strong>${money(resilienceMonthly)}/mo</strong><p>${money(resilienceMonthly*12)}/year if fully activated. Includes illustrative insurance and legal provisions; not vendor quotes.</p></div></div>${resilience.map(group=>`<div class="future-category"><h3>${esc(group.group)}</h3><div class="future-grid">${group.items.map(x=>`<article class="future-phase"><div class="future-phase-top"><span class="pill">Future capability</span><strong>${money(x.capex)}</strong></div><h3>${esc(x.name)}</h3><p>${esc(x.detail)}</p><p class="fine">Estimated incremental operating allowance: ${money(x.monthly)}/month</p></article>`).join('')}</div></div>`).join('')}<p class="fine">Planning only. No purchases, coverage, SLA, uptime guarantee or investor return is promised. Cloud storage costs depend on volume and retrieval; insurance and legal costs require real quotes. Avoid exposing private admin interfaces or client data from the home lab.</p></section>`;
};
