import fs from 'node:fs';
import { projects } from './portfolio.mjs';
const demos = JSON.parse(fs.readFileSync(new URL('./demo-manifest.json', import.meta.url), 'utf8'));
const pending = {
  'ai-manual-assistant':'Needs an isolated answering service and approved sample manuals; do not fabricate answers.',
  cull:'Needs a licensed isolated capture environment and rights-cleared sample photos.',
  leadleak:'Needs the dedicated demo backend and fixture audit; production credentials and live delivery are excluded.',
  sitebot:'Needs a demo tenant and answering backend; do not fabricate provider responses.',
  quotemateai:'Needs a sample-only quoting backend and approved provider environment.',
  cockpitcloud:'Needs isolated demo accounts and sample team data; the local Cockpit video does not demonstrate cloud collaboration.',
};
const examples = {
  'anime-console':'Next: capture the UI with a local sample conversation only after the local model endpoint is available.',
  flowforge:'Next: select a product-native offline connector fixture and show its actual result; never invoke a client workflow.',
  siteaudit:'Next: run a bounded audit against a local synthetic website and show the generated scorecard.',
  clipforge:'Next: use rights-cleared local source material and show a generated draft; no publishing.',
  hub:'Next: create sample-only dashboard inputs; do not record the operator’s personal dashboard.',
  contracts:'Resolve the repository scope before selecting a public-safe contract or technical example.',
  packages:'Show a documented public API example after verifying its package and consumer; no standalone app demo needed.',
  fleet:'Show a redacted inventory/output example; do not screen-record private fleet dashboards.',
  'linux-fleet':'Show a public-safe workflow/output example; remote runtime has not been reverified in this pass.',
  'm3mm-sync':'Explain the coordination flow with a sanitized example; do not expose internal handoff contents.',
  kit:'Show an isolated setup dry-run when its target OS is available; do not reconfigure a real workstation.',
  'llm-setup':'Show a measured sample prompt when the established local model endpoint is available.',
  mcplens:'Show synthetic telemetry from a bounded instrumented example, not production traces.',
  learnmicroservices:'Show a local sample service interaction after verifying its isolated runtime.',
  resumesite:'Career evidence only; a further investor demo is low priority and must exclude employer-owned content.',
  games:'Select a runnable, rights-cleared gameplay build before recording; do not present a roadmap as gameplay.',
  viralclips:'Select a rights-cleared edited example; no third-party footage or audience claim.',
};
export const coverage = projects.map(p => {
  let status, next;
  if(demos[p.slug]) {
    status = demos[p.slug].kind === 'output' ? 'Recorded output walkthrough' : 'Recorded app workflow';
    next = demos[p.slug].qualification;
  } else if(p.slug==='ariesoutdoorliving') {
    status='Existing website recording';next='Existing Aries recording is in the client-proof presentation chapter. Embedded business claims still require owner review.';
  } else if(p.slug==='photopicker') {
    status='Verified output example';next='Actual offline run: 40 synthetic images → 10 keepers, 27 duplicates and 3 blurry rejects. No provider call or client photos.';
  } else if(/parked|archived/i.test(p.status)) {
    status='Parked / historical';next='Overview only. No reactivation or new capture; preserve the existing hold.';
  } else if(pending[p.slug]) {
    status='Needs demo environment';next=pending[p.slug];
  } else {
    status='Example pending';next=examples[p.slug]||'Select a safe, product-native example and verify it before adding a demonstration.';
  }
  return {id:p.slug,name:p.name,category:p.category,productStatus:p.status,status,next};
});
export const coverageCounts=Object.fromEntries([...new Set(coverage.map(c=>c.status))].map(s=>[s,coverage.filter(c=>c.status===s).length]));
