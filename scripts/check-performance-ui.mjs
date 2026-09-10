/** Browser interaction checks against a running local Astro preview. No outbound requests. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const origin = 'http://127.0.0.1:4321';
const output = new URL('../output/orbit-qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const evidence = [];
try {
  for (const width of [320, 375, 768, 1440]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900 });
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (req.url().startsWith(origin + '/api/')) req.respond({ status: 204 });
      else if (req.url().startsWith(origin) || req.url().startsWith('data:')) req.continue();
      else req.abort();
    });
    await page.goto(origin, { waitUntil: 'networkidle0' });
    await page.evaluate(() => { localStorage.removeItem('m3mm-motion'); });
    await page.reload({ waitUntil: 'networkidle0' });
    await page.$eval('[data-kinetic]', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForFunction(() => document.querySelector('[data-kinetic]').dataset.inView === 'true');
    await page.waitForFunction(() => document.querySelector('[data-orbit-canvas]').closest('[data-kinetic]').dataset.animationState === 'running');
    const pixels = () => page.$eval('[data-orbit-canvas]', el => el.toDataURL());
    const moving = await pixels();
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 180)));
    assert.notEqual(await pixels(), moving, 'Visible galaxy pixels animate');
    await page.click('[data-cta="hq-motion-toggle"]');
    assert.equal(await page.$eval('html', el => el.dataset.motion), 'paused');
    const paused = await pixels();
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 180)));
    assert.equal(await pixels(), paused, 'Pause freezes actual canvas pixels');
    await page.reload({ waitUntil: 'networkidle0' });
    assert.equal(await page.$eval('html', el => el.dataset.motion), 'paused', 'Pause persists on reload');
    await page.click('[data-cta="hq-motion-toggle"]');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'paused');
    assert.equal(await page.$eval('[data-cta="hq-motion-toggle"]', el => el.disabled), true);
    assert.equal(await page.$eval('[data-kinetic]', el => el.dataset.animationState), 'paused');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'full');
    await page.$eval('footer', el => el.scrollIntoView({ behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('[data-kinetic]').dataset.inView === 'false');
    assert.equal(await page.$eval('[data-kinetic]', el => el.dataset.animationState), 'paused', 'Offscreen artwork stops');

    await page.goto(origin + '/roadmap', { waitUntil: 'networkidle0' });
    await page.$eval('.release-path', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.track-light')).animationName.includes('release-flow'));
    await page.click('[data-cta="roadmap-motion-toggle"]');
    assert.equal(await page.$eval('.track-light', el => getComputedStyle(el).animationName), 'none');
    await page.click('[data-cta="roadmap-motion-toggle"]');
    const detail = await page.$('[data-roadmap-status="testing"] details');
    assert.equal(await detail.evaluate(el => el.open), false);
    await (await detail.$('summary')).focus();
    await page.keyboard.press('Enter');
    assert.equal(await detail.evaluate(el => el.open), true, 'Keyboard expands build details');
    await page.keyboard.press('Space');
    assert.equal(await detail.evaluate(el => el.open), false, 'Keyboard collapses build details');
    assert.equal(await page.$$eval('[data-roadmap-status]:not([hidden])', els => els.length), 21);
    for (const [key, count] of [['released', 1], ['next', 1], ['testing', 4], ['upcoming', 15], ['all', 21]]) {
      const button = await page.$(`[data-filter="${key}"]`);
      await button.focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.$$eval('[data-roadmap-status]:not([hidden])', els => els.length), count, key);
      assert.equal(await button.evaluate(el => el.getAttribute('aria-pressed')), 'true');
      assert.equal(await page.$$eval('[data-roadmap-quarter]:not([hidden])', els => els.every(el => el.querySelector('[data-roadmap-status]:not([hidden])'))), true);
    }
    await page.click('[data-filter="released"]');
    await page.click('a[href="#quarter-1"]');
    assert.equal(await page.$$eval('[data-roadmap-status]:not([hidden])', els => els.length), 21, 'Quarter jump restores every build');
    assert.equal(await page.$eval('#quarter-1', el => el.closest('section').hidden), false);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'paused');
    await page.click('[data-filter="testing"]');
    assert.equal(await page.$$eval('[data-roadmap-status]', els => els.flatMap(el => el.getAnimations()).length), 0, 'Reduced-motion filters have no animation');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    if (width === 375 || width === 1440) {
      for (const [route, name] of [['/', 'home'], ['/roadmap', 'roadmap'], ['/websites', 'websites'], ['/audit', 'audit'], ['/policies', 'policies'], ['/resume', 'resume'], ['/compare/website-options', 'comparison'], ['/start/thanks', 'receipt'], ['/for/outdoor-living', 'trade']]) {
        await page.goto(origin + route, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: new URL(`${name}-${width}.png`, output).pathname.replace(/^\/(\w:)/, '$1') });
        if (['home', 'roadmap', 'websites'].includes(name)) {
          await page.screenshot({ path: new URL(`${name}-${width}-full.png`, output).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true });
        }
      }
    }
    await page.setJavaScriptEnabled(false);
    await page.goto(origin + '/roadmap', { waitUntil: 'networkidle0' });
    assert.equal(await page.$$eval('[data-roadmap-status]:not([hidden])', els => els.length), 21);
    assert.equal(await page.$eval('[data-roadmap-filters]', el => getComputedStyle(el).display), 'none');
    await page.goto(origin, { waitUntil: 'networkidle0' });
    assert.equal(await page.$eval('.orbit-fallback', el => getComputedStyle(el).opacity), '1');
    assert.equal(await page.$eval('.orbit-canvas', el => getComputedStyle(el).opacity), '0');
    assert.equal(await page.$$eval('nav[aria-label="Primary"] a', els => els.every(el => el.getBoundingClientRect().height >= 44)), true);
    evidence.push({ width, motion: 'on/pause/persist/OS override/offscreen verified', filters: 'keyboard counts, details, quarter reset and reduced motion verified', noJS: 'all builds, visible navigation, static artwork' });
    console.log(`PASS ${width}px: motion, persistence, OS override, offscreen stop, keyboard filters/details, reduced-motion transitions, quarter reset, no-JS`);
    await page.close();
  }
  const fallback = await browser.newPage();
  await fallback.setRequestInterception(true);
  fallback.on('request', req => req.url().startsWith(origin + '/api/') ? req.respond({ status: 204 }) : req.url().startsWith(origin) || req.url().startsWith('data:') ? req.continue() : req.abort());
  await fallback.evaluateOnNewDocument(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await fallback.goto(origin, { waitUntil: 'networkidle0' });
  assert.equal(await fallback.$eval('.orbit-fallback', el => getComputedStyle(el).opacity), '1');
  assert.equal(await fallback.$eval('.orbit-canvas', el => getComputedStyle(el).opacity), '0');
  console.log('PASS unavailable canvas: static SVG remains visible');
  await fallback.close();
} finally { await browser.close(); }
await writeFile(new URL('interactions.json', output), JSON.stringify(evidence, null, 2));
