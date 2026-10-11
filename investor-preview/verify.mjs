import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import {createRequire} from 'node:module';
import {projects} from './portfolio.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
const evidence=path.join(root,'evidence');fs.mkdirSync(evidence,{recursive:true});
const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const browser=await puppeteer.launch({executablePath,headless:true,args:['--disable-background-networking']});
const results=[];
try{
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setRequestInterception(true);
  page.on('request',r=>r.url().startsWith('http://127.0.0.1:4387/')||r.url().startsWith('data:')?r.continue():r.abort());
  for(const width of [320,375,768,1440]){
    await page.setViewport({width,height:950,deviceScaleFactor:1});
    for(const route of ['/','/accessibility/']){
      const response=await page.goto('http://127.0.0.1:4387'+route,{waitUntil:'networkidle0'});
      assert.equal(response.status(),200);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${route} overflow`);
      await page.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8'));
      const axe=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}));
      results.push({width,route,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
      if(route==='/'){
        await page.screenshot({path:path.join(evidence,`home-${width}.png`),fullPage:true});
        await page.screenshot({path:path.join(evidence,`hero-${width}.png`)});
        await page.click('.all-projects>summary');
        await page.click('#siteguide summary');
        const expanded=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
        results.push({width,route:'expanded-catalog',violations:expanded.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
      }
    }
  }
  await page.setViewport({width:1440,height:1000});
  await page.goto('http://127.0.0.1:4387/',{waitUntil:'networkidle0'});
  assert.equal(await page.$$eval('.project',p=>p.length),43);
  await page.click('.all-projects>summary');
  await page.click('[data-filter="Products"]');
  assert.equal(await page.$$eval('.project:not([hidden])',p=>p.length),projects.filter(p=>p.category==='Products').length);
  await page.type('#search','nothing-matches-123');
  assert.ok(await page.$eval('#empty',e=>!e.hidden));
  await page.click('#reset');
  assert.equal(await page.$$eval('.project:not([hidden])',p=>p.length),43);
  await page.click('[data-filter="Experiments"]');
  await page.click('a[href="#cull"]');
  await page.waitForFunction(()=>document.querySelector('#cull details').open&&!document.querySelector('#cull').hidden);
  await page.click('#cull summary');
  await page.click('a[href="#cull"]');
  assert.ok(await page.$eval('#cull details',d=>d.open));
  await page.click('[data-project="cull"]');
  assert.ok(await page.$eval('#player',d=>d.open));
  await page.$eval('#player-video',v=>v.load());
  await page.waitForFunction(()=>document.querySelector('#player-video').readyState>=1);
  assert.equal(await page.$eval('#player-video',v=>v.duration),18);
  await page.$eval('#player-video',v=>v.play());
  await page.waitForFunction(()=>document.querySelector('#player-video').currentTime>0);
  await page.screenshot({path:path.join(evidence,'video-dialog.png')});
  await page.keyboard.press('Escape');
  assert.ok(await page.$eval('#player',d=>!d.open));
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.project),'cull');
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
  await page.setJavaScriptEnabled(false);
  await page.goto('http://127.0.0.1:4387/',{waitUntil:'networkidle0'});
  assert.equal(await page.$$eval('.project',p=>p.length),43);
  assert.ok(await page.$eval('.filters',e=>e.hidden));
  await page.click('.all-projects>summary');
  await page.click('#siteguide summary');
  assert.ok(await page.$eval('#siteguide details',e=>e.open));
  const response=await fetch('http://127.0.0.1:4387/assets/siteguide.mp4',{headers:{Range:'bytes=0-99'}});
  assert.equal(response.status,206);assert.equal((await response.arrayBuffer()).byteLength,100);
  assert.deepEqual(errors,[]);
  assert.ok(results.every(r=>r.violations.length===0),JSON.stringify(results.filter(r=>r.violations.length)));
  for(const p of projects){assert.ok(fs.statSync(path.join(root,'dist/assets',p.slug+'.mp4')).size>1000);assert.ok(fs.existsSync(path.join(root,'dist/assets',p.slug+'.jpg')))}
  results.push({behavior:'category/search/empty/reset/deep-link/18-second-playback/Escape/focus-return/reduced-motion/no-JS/video-range',passed:true});
  await page.setJavaScriptEnabled(true);
  page.removeAllListeners('request');
  await page.setRequestInterception(false);
  if(!process.argv.includes('--http-only')) {
  await page.goto(new URL('./dist/index.html',import.meta.url).href,{waitUntil:'networkidle0'});
  assert.equal(await page.title(),'M3MM — Build the next chapter');
  await page.click('[data-project="cull"]');
  await page.$eval('#player-video',v=>v.load());
  await page.waitForFunction(()=>document.querySelector('#player-video').readyState>=1);
  assert.equal(await page.$eval('#player-video',v=>v.duration),18);
  results.push({behavior:'offline-file-open-and-video',passed:true});
  }
  console.log('PASS: 12 viewport/route/state accessibility checks; 43 video assets; browser interactions and video playback. Offline check: '+(!process.argv.includes('--http-only')));
}finally{
  fs.writeFileSync(path.join(evidence,'browser-verification.json'),JSON.stringify(results,null,2));
  await browser.close();
}
