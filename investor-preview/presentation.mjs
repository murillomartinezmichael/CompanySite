import { projects, featured } from './portfolio.mjs';
export const chapters = [
  {id:'welcome',title:'Back the next chapter.',label:'The M3MM story',kind:'intro',points:[
    ['What we build','M3MM brings together client websites, practical software, and reusable delivery tools. This presentation walks through the work, the infrastructure behind it, and a focused funding request.'],
    ['How to explore','You can pause me at any time, choose a chapter, or click a step to jump. Recorded software demos show actual workflows, with more detail available beside each step. Other entries have labeled overviews. Each project keeps its current status.'],
    ['The ask','We are discussing a long-term, phased investment in reliable infrastructure, secure development and local artificial intelligence. No funding commitment or investor terms have been agreed. Let’s start with the portfolio.']
  ]},
  ...projects.map(p=>({id:p.slug,title:p.name,label:p.category,kind:'product',status:p.status,url:p.url,video:`./assets/${p.slug}.mp4`,poster:`./assets/${p.slug}.jpg`,points:[
    ['The product',`${p.name}. ${p.description}`],
    ['Who it serves',`${p.audience} ${p.path}`],
    ['Where it stands',`The recorded status is ${p.status}. This is a product overview, not a live demonstration. Commercial positioning is proposed; it does not establish customer demand, current revenue, or investment returns.`]
  ]})),
  {id:'client-proof',title:'A real client-site walkthrough.',label:'Recorded demonstration',kind:'product',status:'Next official launch',video:'./assets/aries-recorded-demo.mp4',poster:'./assets/aries-recorded-demo.webp',url:'https://ariesoutdoorliving.com',points:[
    ['See the delivered work','This is an existing twenty-second recording of the Aries Outdoor Living website. Unlike the captioned portfolio explainers, this clip shows the actual website experience.'],
    ['The business role','The client website presents outdoor-living work and a path to an inquiry. It demonstrates custom-site delivery. The client owns its website; it is not an additional software subscription product.'],
    ['Explore together','The company roadmap lists Aries as the next official launch. Use Open product to inspect the public website in a separate tab. This recording does not prove current lead delivery or customer conversion.']
  ]},
  {id:'infrastructure-tour',title:'The foundation already exists.',label:'Development infrastructure',kind:'hardware',points:[
    ['Current capacity','The October ninth inventory records the existing server with a two-core Pentium processor, about sixteen gigabytes of memory, and an RTX thirty fifty graphics card with six gigabytes of video memory. Those resources support local models, application hosting, and background work.'],
    ['Supporting equipment','A Windows workstation handles delivery and creative work. A ThinkPad provides portable Linux development. Two Raspberry Pi three boards support monitoring and network tooling. The historical Linux desktop shares the server chassis, so it is not counted as a separate server.'],
    ['What is verified','The ThinkPad connection was verified on October tenth. The server and both Pis were offline during that check, so their hardware details remain dated. Hardware upgrades must be paired with power checks, backups, and a successful restore.']
  ]},
  {id:'ask',title:'A serious long-term build.',label:'Proposed funding strategy',kind:'budget',points:[
    ['Start with reliability','The first stage protects existing work: independent backups, successful sample restores, reliable power and a separate firewall for the lab while household internet remains unchanged.'],
    ['Build reusable capacity','Later stages add central storage and virtualization, then an expandable local AI workstation with high GPU memory when benchmarks and business needs justify the investment.'],
    ['Discuss terms before capital','A hypothetical contribution schedule is two hundred fifty dollars from the founder plus two hundred fifty dollars from outside contributors collectively every two weeks. One hundred twenty American-minted one-troy-ounce silver coins are also under discussion. None of this is pledged, received or valued here; ownership and legal terms must be agreed first.']
  ]},
  {id:'outcomes',title:'Measure what the funding changes.',label:'Acceptance milestones',kind:'outcomes',points:[
    ['Measure first','Before buying, record the time and resource use of a representative local-model task, product build, and background job. Compare reuse, upgraded hardware, and rented compute before choosing the final quote.'],
    ['Prove recovery','After installation, verify hardware operation, thermals, protected power, and an isolated backup restore. Move critical workloads only after the acceptance checks pass.'],
    ['Show the difference','Repeat the same workloads and present before-and-after evidence. Pair the results with recorded product demonstrations. The proposal is for measured capacity and reliability, not an invented performance multiplier.']
  ]},
  {id:'discussion',title:'Let’s discuss the next step.',label:'Investor discussion',kind:'closing',points:[
    ['The work','You have seen the range of client work, product development, and supporting tools. The full catalog remains available, including testing, planned, and parked entries. Repository count is not revenue.'],
    ['The decision','The next decisions are the phased infrastructure budget, the investor audience, and mutually agreed funding terms. That could involve different structures, but no structure or ownership arrangement is represented as agreed today.'],
    ['Your questions','Pause here for questions, revisit any chapter, or switch to the full portfolio tour. The contact link opens an email draft to Michael. This site does not accept payments or send a message automatically.']
  ]}
];
export const pitchIds=['welcome',...featured.map(id=>projects.find(p=>p.id===id).slug),'client-proof','infrastructure-tour','ask','outcomes','discussion'];
export const presenterMarkup=`
<dialog id="presenter" aria-labelledby="presenter-title">
  <header class="presenter-top"><div><span class="section-label">M3MM presenter</span><h2 id="presenter-title">Investor presentation</h2></div><div class="presenter-top-actions"><button id="narration-top-toggle" data-cta="presentation-toggle" aria-label="Pause narration">Pause</button><button id="presentation-fullscreen" data-cta="presentation-fullscreen">Full screen</button><button id="presentation-close" data-cta="presentation-close">Exit presentation</button></div></header>
  <div class="presenter-layout"><aside class="chapter-sidebar"><label for="tour-mode">Presentation</label><select id="tour-mode"><option value="pitch">Investor pitch · 12 chapters</option><option value="all">Entire portfolio · 49 chapters</option></select><label for="chapter-select">Jump to a chapter</label><select id="chapter-select"></select><nav id="chapter-nav" aria-label="Presentation chapters"></nav></aside>
  <section class="presenter-stage" aria-label="Current chapter"><div class="chapter-meta"><span id="chapter-label"></span><span id="chapter-count"></span></div><h3 id="chapter-title" tabindex="-1"></h3>
  <div class="scene-grid"><div id="scene-visual"><video id="scene-video" muted playsinline preload="none" controls></video><div id="scene-art"></div><p id="scene-media-note" class="fine"></p><a id="scene-live" class="text-link" target="_blank" rel="noopener noreferrer" data-cta="presentation-open-product" hidden>Open product in a new tab</a></div><div id="talking-points" role="group" aria-label="Choose a talking point"></div></div>
  <div class="narration-box"><span>Synthetic narration <span id="narration-position"></span></span><p id="narration-text"></p><p id="narration-error" role="status" hidden></p></div>
  </section></div>
  <div class="presenter-controls"><div class="transport"><button id="chapter-prev" data-cta="presentation-prev" aria-label="Previous chapter">← Previous</button><button id="narration-play" class="button" data-cta="presentation-play">Play narration</button><button id="chapter-next" data-cta="presentation-next" aria-label="Next chapter">Next →</button></div><div class="sound-controls"><label for="narration-rate">Speed<select id="narration-rate"><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.2">1.2×</option></select></label><label for="narration-volume">Volume<input id="narration-volume" type="range" min="0" max="1" step="0.1" value="0.9"></label><label class="auto-label"><input id="auto-advance" type="checkbox" checked>Advance automatically</label></div><p class="presenter-help">Space: play/pause · ← →: chapters · Escape: exit. Click any talking point to jump.</p></div><audio id="narration-audio" preload="none"></audio>
</dialog>`;
