// Investor-safe, provisional future AI target model. October 2026 sourced examples;
// these are NOT verified vendor cart totals, committed purchase requests or funding.
import { futureBuild, phaseCost, totalCost, money } from './future-build.mjs';
import { resilienceCapex } from './resilience-platform.mjs';

const oldAi = futureBuild.find(p => p.id === 'ai');
if (!oldAi) throw Error('Expected legacy AI comparison phase missing');
export const legacyAiAllowance = phaseCost(oldAi);
export const baselineCapital = totalCost + resilienceCapex;
export const otherCapital = baselineCapital - legacyAiAllowance;

export const aiComponents = [
  {name:'Threadripper CPU (24-core example)',low:1240,high:1600,evidence:'CPU example listing; exact platform still TBD',url:'https://www.walmart.com/ip/AMD-Ryzen-Threadripper-7960X-350W-SP6-24-Core-48-Threads-100-100001352WOF/5221773652'},
  {name:'TRX50 motherboard',low:750,high:1000,evidence:'Vendor listing; dual-GPU slot spacing/QVL not approved',url:'https://www.microcenter.com/product/675815/asrock-trx50-ws-amd-str5-eatx-motherboard'},
  {name:'256 GB registered ECC memory',low:7300,high:12000,evidence:'Volatile example listing range; 4×64GB QVL required',url:'https://rams.live/memory/v-color-ecc-rdimm-256gb-4x64gb-ddr5-5600-cl52-ecc-rdimm'},
  {name:'6 TB system/model NVMe allowance',low:600,high:1000,evidence:'Planning allowance; exact SSD/endurance quotes pending',url:null},
  {name:'Airflow, chassis, PSU and CPU cooling',low:1000,high:1800,evidence:'Planning allowance; electrical and two-card clearance study pending',url:null},
  {name:'2× RTX 5090 32GB graphics cards',low:6600,high:7800,evidence:'Two retail card examples; not one unified 64GB memory pool',url:'https://www.microcenter.com/product/690693/zotac-nvidia-geforce-rtx-5090-amp-extreme-infinity-overclocked-triple-fan-32gb-gddr7-pcie-50-graphics-card'}
];
export const aiTargetLow=aiComponents.reduce((n,x)=>n+x.low,0);
export const aiTargetHigh=aiComponents.reduce((n,x)=>n+x.high,0);
export const separateLinuxDesktop={low:1200,high:2200};
export const expandedCapitalLow=otherCapital+aiTargetLow+separateLinuxDesktop.low;
export const expandedCapitalHigh=otherCapital+aiTargetHigh+separateLinuxDesktop.high;
export const allowanceLow=Math.ceil(expandedCapitalLow*1.15/50)*50;
export const allowanceHigh=Math.ceil(expandedCapitalHigh*1.15/50)*50;

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const renderAiExpansionScenario=()=>`<section class="wrap section future-build" id="advanced-ai-scenario" aria-labelledby="advanced-ai-title">
<div class="section-heading"><div><p class="section-label">Updated expansion scenario · October 2026</p><h2 id="advanced-ai-title">What the full AI target could cost.</h2></div><p>The earlier ${money(legacyAiAllowance)} AI budget was a one-GPU conceptual placeholder—not a Threadripper, 256GB ECC and dual-5090 purchase configuration. The full M3MM.NET vision is a larger, separately gated scenario.</p></div>
<div class="future-summary">
<div><span class="section-label">Earlier infrastructure baseline</span><strong>${money(baselineCapital)}</strong><p>Includes ${money(legacyAiAllowance)} placeholder AI hardware, which is replaced—not added again—in the scenario below.</p></div>
<div><span class="section-label">Future dual-GPU AI workstation</span><strong>${money(aiTargetLow)}–${money(aiTargetHigh)}</strong><p>Broad illustrative capital range; 256GB ECC RDIMM and actual RTX 5090 prices dominate uncertainty.</p></div>
<div><span class="section-label">Enlarged environment + Linux desktop</span><strong>${money(expandedCapitalLow)}–${money(expandedCapitalHigh)}</strong><p>Retains other baseline systems once and adds a distinct ${money(separateLinuxDesktop.low)}–${money(separateLinuxDesktop.high)} Linux development desktop.</p></div>
<div><span class="section-label">With simple 15% planning allowance</span><strong>${money(allowanceLow)}–${money(allowanceHigh)}</strong><p>Not a quote or fundraising ask; electrical upgrades, metered power, labor and other unpriced costs could raise totals.</p></div></div>
<div class="future-grid">${aiComponents.map(x=>`<article class="future-phase"><div class="future-phase-top"><span class="pill">Future / unpurchased</span><strong>${money(x.low)}–${money(x.high)}</strong></div><h3>${esc(x.name)}</h3><p>${esc(x.evidence)}</p>${x.url?`<a class="text-link" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer" data-cta="ai-price-source">Check example source ↗</a>`:''}</article>`).join('')}</div>
<p class="fine">Start with a separately quoted lower-cost GPU such as a tested used 3090 only if workloads justify it; do not treat the starter GPU as an additional required purchase in the final two-5090 subtotal. A 128GB ECC configuration may lower initial spend, but replacing four 32GB DIMMs with four 64GB DIMMs can be expensive; no swap/upgrade is approved without exact board QVL and resale analysis. Two 32GB cards do not transparently act as a single 64GB GPU. No investor silver or recurring contribution is counted as available cash.</p></section>`;
