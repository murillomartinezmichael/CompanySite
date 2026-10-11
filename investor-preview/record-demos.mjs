import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {openDemo,click,root,targets} from './demo-runtime.mjs';
const scripts=JSON.parse(fs.readFileSync(path.join(root,'demo-scripts.json'),'utf8'));
const selected=process.argv.slice(2);
const out=path.join(root,'dist/assets/demos');fs.mkdirSync(out,{recursive:true});
const evidenceDir=path.join(root,'evidence/actual-demos');fs.mkdirSync(evidenceDir,{recursive:true});
const manifestFile=path.join(root,'demo-manifest.json');
const manifest=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):{};
const probe=file=>JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,width,height','-of','json',file],{encoding:'utf8'}));
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const actions={
  handoffkit:[
    async p=>{await p.getByRole('heading',{level:1,name:'Butter & Crumb Bakery'}).waitFor();},
    async p=>{await click(p,p.getByRole('link',{name:'Manage your specials',exact:true}));await p.locator('#coll-specials').waitFor();},
    async p=>{await click(p,p.getByRole('link',{name:'Ongoing support',exact:true}).first());await p.locator('#retainer').waitFor();}
  ],
  big7construction:[
    async p=>{await p.getByRole('heading',{level:1}).waitFor();},
    async p=>{await click(p,p.getByRole('link',{name:'Explore commercial →',exact:true}));await p.getByRole('heading',{level:1}).waitFor();assert.ok(p.url().includes('commercial-industrial'));},
    async p=>{await click(p,p.locator('a[href="/residential-construction"]').first());await p.getByRole('heading',{level:1}).waitFor();assert.ok(p.url().includes('residential-construction'));}
  ],
  codereviewhub:[
    async p=>{await p.getByRole('heading',{level:1}).waitFor();},
    async p=>{await p.locator('#intake').scrollIntoViewIfNeeded();await click(p,p.locator('[name=name]'));await p.locator('[name=name]').fill('Demo Owner');await p.locator('[name=email]').fill('demo@example.com');await p.locator('[name=businessType]').fill('Fictional sample website');},
    async p=>{await click(p,p.locator('[name=frustration]'));await p.locator('[name=frustration]').fill('Sample request: review the navigation and accessibility. This demo is not submitted.');assert.ok((await p.locator('[name=frustration]').inputValue()).includes('not submitted'));}
  ],
  cockpit:[
    async p=>{assert.equal(await p.locator('.card').count(),0);},
    async p=>{await click(p,p.getByRole('button',{name:'+ Create',exact:true}));await p.locator('#m-name').fill('Sample website review');await p.locator('#m-next').fill('Check the fictional sample navigation');await click(p,p.getByRole('button',{name:'Save',exact:true}));await p.getByText('Sample website review',{exact:true}).waitFor();},
    async p=>{await click(p,p.locator('#search-input'));await p.locator('#search-input').fill('Sample website');assert.ok(await p.getByText('Sample website review',{exact:true}).isVisible());}
  ],
  'ariesoutdoorliving-v2':[
    async p=>{await p.getByRole('heading',{level:1}).waitFor();},
    async p=>{await click(p,p.getByRole('button',{name:'Start 3D walkthrough',exact:true}));await p.locator('canvas').waitFor();await p.locator('[data-walk-stage]').evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(2000);},
    async p=>{await click(p,p.getByRole('button',{name:/03.*On the deck/i}));await p.locator('[data-walk-stage]').evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(2400);assert.ok(await p.locator('canvas').isVisible());}
  ],
  teardown:[
    async p=>{assert.ok((await p.locator('body').innerText()).includes('Northwind Digital'));},
    async p=>{await p.getByRole('heading',{name:/Top 3/}).scrollIntoViewIfNeeded();},
    async p=>{await p.getByRole('heading',{name:/Full fix list/}).scrollIntoViewIfNeeded();await p.mouse.wheel(0,170);}
  ],
  campaignforge:[
    async p=>{await click(p,p.getByRole('button',{name:'Open the sample campaign',exact:true}));await p.getByRole('heading',{name:/concepts \(4\)/i}).waitFor();},
    async p=>{await p.getByRole('heading',{name:/concepts \(4\)/i}).scrollIntoViewIfNeeded();await p.waitForTimeout(1800);await click(p,p.getByRole('button',{name:/open in editor/i}).first());await p.getByRole('complementary',{name:'Insert and layers'}).waitFor();},
    async p=>{await click(p,p.getByRole('button',{name:'Headline line 1',exact:true}));const field=p.getByLabel('Text content',{exact:true});await click(p,field);await field.fill('GRAND OPENING');await p.getByText('Saved',{exact:true}).waitFor();assert.equal(await field.inputValue(),'GRAND OPENING');},
    async p=>{await click(p,p.getByRole('button',{name:/run review/i}));await p.getByRole('heading',{name:/review/i}).waitFor();},
    async p=>{const pending=p.waitForEvent('download');await click(p,p.getByRole('button',{name:'PNG',exact:true}));const download=await pending;const file=path.join(evidenceDir,'campaignforge-export.png');await download.saveAs(file);assert.equal(await download.failure(),null);assert.equal(fs.readFileSync(file).subarray(0,8).toString('hex'),'89504e470d0a1a0a');}
  ],
  companysite:[
    async p=>{await p.getByRole('heading',{level:1}).waitFor();},
    async p=>{await click(p,p.getByRole('link',{name:'Open the roadmap',exact:true}));await p.getByRole('button',{name:/Testing 4/}).waitFor();},
    async p=>{const b=p.getByRole('button',{name:/Testing 4/});await click(p,b);assert.equal(await b.getAttribute('aria-pressed'),'true');await p.waitForTimeout(600);}
  ],
  m3websites:[
    async p=>{await p.getByRole('heading',{level:1}).waitFor();},
    async p=>{await p.locator('#proof').scrollIntoViewIfNeeded();await p.mouse.wheel(0,150);},
    async p=>{await p.locator('#services').scrollIntoViewIfNeeded();await p.mouse.wheel(0,120);assert.ok(await p.locator('#services').isVisible());}
  ],
  siteguide:[
    async p=>{await p.getByRole('heading',{level:1}).waitFor();},
    async p=>{await p.locator('[data-slug="soma"]').scrollIntoViewIfNeeded();await p.waitForTimeout(1800);await click(p,p.locator('[data-slug="soma"] .preview'));assert.ok(p.url().endsWith('/demo/soma'));},
    async p=>{assert.ok(await p.locator('.pv-img').first().evaluate(i=>i.complete&&i.naturalWidth>0));await p.getByRole('heading',{name:'Five ways to spend an hour with yourself.',exact:true}).evaluate(e=>e.scrollIntoView({block:'start'}));await p.waitForTimeout(700);}
  ],
  'southernvn-adaptive':[
    async p=>{await p.getByRole('heading',{name:'Dashboard',exact:true}).waitFor();},
    async p=>{await click(p,p.locator('[data-action=baseline]'));await p.locator('[data-answer="1"]').waitFor();},
    async p=>{await click(p,p.locator('[data-answer="1"]'));await p.locator('#feedback-slot .feedback').waitFor();await p.waitForTimeout(2300);await click(p,p.locator('[data-next]'));assert.ok((await p.locator('main').innerText()).includes('Exercise 2'));}
  ]
};
for(const demo of scripts.filter(d=>!selected.length||selected.includes(d.id))){
  console.log(`Recording real workflow: ${demo.id}`);
  const d=await openDemo(demo.id,{record:true}),video=d.page.video(),steps=[];let finished=false;
  try{
    for(let i=0;i<demo.steps.length;i++){
      const start=(Date.now()-d.started)/1000;
      const wav=path.join(root,`.video-work/actual/${demo.id}/${i}.wav`);
      const duration=Number(probe(wav).format.duration);
      await d.page.waitForTimeout(900);await actions[demo.id][i](d.page);
      await d.page.screenshot({path:path.join(evidenceDir,`${demo.id}-${i}.png`)});
      const left=(start+duration+1.2)*1000-(Date.now()-d.started);
      if(left>0)await d.page.waitForTimeout(left);
      steps.push({...demo.steps[i],start,duration,wav});
      console.log(`  Verified: ${demo.steps[i].title}`);
    }
    await d.close();finished=true;
    const raw=await video.path(),file=path.join(out,`${demo.id}.mp4`);
    const args=['-hide_banner','-loglevel','error','-y','-i',raw];
    for(const s of steps)args.push('-i',s.wav);
    const filters=steps.map((s,i)=>`[${i+1}:a]adelay=${Math.round(s.start*1000)}:all=1[a${i}]`);
    filters.push(steps.map((s,i)=>`[a${i}]`).join('')+`amix=inputs=${steps.length}:normalize=0,apad[audio]`);
    args.push('-filter_complex',filters.join(';'),'-map','0:v','-map','[audio]','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',file);
    execFileSync('ffmpeg',args,{stdio:'pipe'});
    const info=probe(file);assert.ok(info.streams.some(s=>s.codec_type==='audio'));assert.ok(info.streams.some(s=>s.codec_type==='video'));
    const poster=path.join(out,`${demo.id}.jpg`);execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(steps[Math.min(1,steps.length-1)].start+4),'-i',file,'-frames:v','1',poster]);
    const publicSteps=steps.map(({wav,...s})=>s);
    const vtt='WEBVTT\n\n'+publicSteps.map((s,i)=>`${i+1}\n${stamp(s.start)} --> ${stamp(s.start+s.duration)}\n${s.text}\n`).join('\n');
    fs.writeFileSync(path.join(out,`${demo.id}.vtt`),vtt);
    manifest[demo.id]={id:demo.id,kind:demo.kind||'application',title:demo.title,qualification:demo.qualification,video:`./assets/demos/${demo.id}.mp4`,poster:`./assets/demos/${demo.id}.jpg`,captions:`./assets/demos/${demo.id}.vtt`,duration:Number(info.format.duration),steps:publicSteps};
    const durable=path.join(root,'media/demos');fs.mkdirSync(durable,{recursive:true});
    for(const ext of ['mp4','jpg','vtt'])fs.copyFileSync(path.join(out,`${demo.id}.${ext}`),path.join(durable,`${demo.id}.${ext}`));
    const current=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):{};
    fs.writeFileSync(manifestFile,JSON.stringify({...current,[demo.id]:manifest[demo.id]},null,2));
    fs.writeFileSync(path.join(evidenceDir,`${demo.id}.json`),JSON.stringify({recordedAt:new Date().toISOString(),source:targets[demo.id],sourceIndexSha256:hash(path.resolve(root,'../..',targets[demo.id].root,'index.html')),videoSha256:hash(file),blockedRequests:d.blocked,steps:publicSteps,media:info},null,2));
  }finally{if(!finished)await d.close();}
}
function stamp(t){return new Date(Math.round(t*1000)).toISOString().slice(11,23);}
