import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {root} from './demo-runtime.mjs';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),manifest=JSON.parse(fs.readFileSync(path.join(root,'demo-manifest.json'),'utf8'));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
 await context.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:4387'?r.continue():r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4387/');
 for(const demo of Object.values(manifest)){
  await page.locator(`#actual-demos [data-narrate="${demo.id}"]`).click();
  await page.waitForFunction(()=>{const v=document.querySelector('#scene-video');return !v.paused&&v.currentTime>1&&!v.muted&&v.readyState>=2});
  assert.ok(await page.locator('#narration-audio').evaluate(a=>a.paused&&!a.getAttribute('src')));
  assert.ok((await page.locator('#scene-video').getAttribute('src')).includes(`/demos/${demo.id}.mp4`));
  await page.locator('.talking-point').nth(1).click();
  await page.waitForFunction(t=>Math.abs(document.querySelector('#scene-video').currentTime-t)<2,demo.steps[1].start);
  await page.locator('.demo-detail summary').nth(1).click();
  await page.waitForFunction(()=>document.querySelector('#scene-video').paused);
  assert.ok(await page.locator('.demo-detail').nth(1).getAttribute('open')!==null);
  await page.locator('#narration-play').click();await page.waitForFunction(()=>!document.querySelector('#scene-video').paused);
  await page.selectOption('#narration-rate','1.2');assert.equal(await page.locator('#scene-video').evaluate(v=>v.playbackRate),1.2);
  await page.locator('#auto-advance').uncheck();await page.locator('#scene-video').evaluate(v=>v.currentTime=v.duration-.15);
  await page.waitForFunction(()=>document.querySelector('#narration-play').textContent==='Replay chapter');
  await page.locator('#narration-play').click();await page.waitForFunction(()=>document.querySelector('#scene-video').currentTime<3&&!document.querySelector('#scene-video').paused);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#presenter').open&&document.querySelector('#scene-video').paused);
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.narrate),demo.id);
  const caption=await fetch(`http://127.0.0.1:4387/${demo.captions.slice(2)}`);assert.equal(caption.headers.get('content-type'),'text/vtt');assert.ok((await caption.text()).startsWith('WEBVTT'));
  results.push({id:demo.id,passed:true,checks:'real decoded video/audio, step seek, detail pause, resume, rate, natural end, replay, Escape, focus, captions'});
 }
 for(const width of [320,375,768,1440]){
  await page.setViewportSize({width,height:1000});await page.locator('#actual-demos [data-narrate="campaignforge"]').click();await page.locator('#narration-play').click();
  assert.ok(await page.locator('#presenter').evaluate(d=>d.scrollWidth<=d.clientWidth),`overflow ${width}`);
  await page.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8'));
  const axe=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
  assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
  await page.screenshot({path:path.join(root,`evidence/actual-demos/presenter-${width}.png`)});
  results.push({width,accessibility:'zero automated violations',overflow:false});await page.locator('#presentation-close').click();
 }
 await page.setViewportSize({width:1440,height:1000});await page.locator('#actual-demos [data-narrate="companysite"]').click();await page.locator('#auto-advance').check();
 await page.waitForFunction(()=>document.querySelector('#scene-video').readyState>=2);await page.locator('#scene-video').evaluate(v=>v.currentTime=v.duration-.15);
 await page.waitForFunction(()=>document.querySelector('#chapter-title').textContent==='SiteGuide');await page.waitForFunction(()=>!document.querySelector('#scene-video').paused);
 await page.locator('#presentation-close').click();
 await page.locator('#actual-demos [data-narrate="campaignforge"]').click();
 await page.locator('#scene-video').evaluate(v=>{v.src='./assets/missing-demo.mp4';v.load();});
 await page.waitForFunction(()=>!document.querySelector('#narration-error').hidden&&document.querySelector('#scene-video').paused);
 assert.ok((await page.locator('#narration-error').innerText()).includes('spoken script and step details'));
 await page.locator('#presentation-close').click();
 assert.deepEqual(errors,[]);results.push({autoAdvance:true,missingDemoFallback:true,pageErrors:errors});
 console.log(`PASS: ${Object.keys(manifest).length} narrated application/report recordings; step/detail/media controls; 4 responsive accessibility states.`);
}finally{await browser.close();fs.writeFileSync(path.join(root,'evidence/actual-demos/verification.json'),JSON.stringify(results,null,2));}
