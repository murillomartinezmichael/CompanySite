// Read-only allowlisted static builds, isolated browser profiles, no provider calls.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '../../CampaignForge/node_modules/playwright/index.mjs';
export const root=path.dirname(fileURLToPath(import.meta.url));
const fleet=path.resolve(root,'../..');
export const targets={
  companysite:{root:'CompanySite/dist'},
  m3websites:{root:'CompanySite/dist',start:'/websites/'},
  siteguide:{root:'SiteGuide/demo',start:'/demos'},
  campaignforge:{root:'CampaignForge/dist'},
  'southernvn-adaptive':{root:'SouthernVN-Adaptive/dist'},
  'ariesoutdoorliving-v2':{root:'AriesOutdoorLiving-V2/dist'},
  teardown:{root:'CompanySite/investor-preview/.video-work/teardown-report'},
  big7construction:{root:'Big7Construction'},
  codereviewhub:{root:'CodeReviewHub/dist'},
  cockpit:{root:'Cockpit'},
  handoffkit:{root:'CompanySite/investor-preview/.video-work/handoffkit'},
};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4','.glb':'model/gltf-binary','.avif':'image/avif'};
export async function openDemo(id,{record=false}={}){
  const target=targets[id];if(!target)throw Error('Not an allowlisted demo');
  const base=path.resolve(fleet,target.root);
  const server=http.createServer((req,res)=>{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
    let route;try{route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
    if(id==='siteguide')route=route==='/demos'?'/gallery.html':route==='/demo'?'/index.html':route.startsWith('/demo/')?route.slice(5)+'.html':route;
    let file=path.resolve(base,'.'+route);
    if(id==='big7construction'&&!/^\/(?:index\.html|commercial-industrial(?:\.html)?|residential-construction(?:\.html)?|accessibility(?:\.html)?|big7\.js|images\/[^?]+)?$/.test(route)){res.writeHead(404).end();return;}
    if(id==='cockpit'&&!['/','/index.html'].includes(route)){res.writeHead(404).end();return;}
    if(!file.startsWith(base+path.sep)&&file!==base){res.writeHead(403).end();return;}
    if(id==='siteguide'&&/^\/(previews\/soma\/(hero|card-1|card-2)\.jpg|favicons\/soma\.svg)$/.test(route))file=path.resolve(fleet,'SiteGuide/product','.'+route);
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(id==='big7construction'&&!fs.existsSync(file)&&fs.existsSync(file+'.html'))file+='.html';
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()||!mime[path.extname(file)]){res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-store'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`;
  let browser;
  try{
    browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-background-networking']});
    const dir=path.join(root,'.video-work','actual',id);fs.mkdirSync(dir,{recursive:true});
    const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block',...(record?{recordVideo:{dir,size:{width:1440,height:900}}}:{})});
    const blocked=[];
    if(id==='cockpit')await context.addInitScript(()=>{if(!localStorage.getItem('mc_board_v3')){localStorage.setItem('mc_board_v3','[]');localStorage.setItem('mc_worklog_v1','[]');}});
    await context.routeWebSocket(/.*/,ws=>ws.close());
    await context.route('**/*',route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.origin===origin&&['GET','HEAD'].includes(request.method()))return route.continue();
      blocked.push({origin:url.origin,method:request.method()});return route.abort();
    });
    await context.addInitScript(()=>{
      addEventListener('DOMContentLoaded',()=>{
        const cursor=document.createElement('div');cursor.id='demo-cursor';cursor.setAttribute('aria-hidden','true');
        cursor.style.cssText='position:fixed;top:0;left:0;width:24px;height:24px;border:3px solid #131313;border-radius:50%;background:#d9ff43;box-shadow:0 0 0 3px white;z-index:2147483647;pointer-events:none;transform:translate(-50%,-50%);';document.body.append(cursor);
        addEventListener('mousemove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';});
        addEventListener('mousedown',()=>{cursor.style.background='#43caff';cursor.style.scale='1.6';});
        addEventListener('mouseup',()=>setTimeout(()=>{cursor.style.background='#d9ff43';cursor.style.scale='1';},250));
      });
    });
    const started=Date.now();
    const page=await context.newPage();page.setDefaultTimeout(15000);
    await page.goto(origin+(target.start||'/'));await page.waitForTimeout(800);
    return {page,context,origin,blocked,started,close:async()=>{await context.close();await browser.close();await new Promise(r=>server.close(r));}};
  }catch(e){if(browser)await browser.close();await new Promise(r=>server.close(r));throw e;}
}
export async function click(page,locator){
  await locator.scrollIntoViewIfNeeded();const box=await locator.boundingBox();
  if(!box)throw Error('Demo target is not visible');
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:18});
  await page.waitForTimeout(350);await locator.click();await page.waitForTimeout(450);
}
