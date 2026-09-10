/** Browser interaction checks against a running local Astro preview. No outbound requests. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const origin = 'http://127.0.0.1:4321';
const output = new URL(process.env.M3_QA_OUTPUT || '../output/orbit-qa/', import.meta.url);
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
    await page.select('[data-stage-select]', '0');
    await page.$eval('.release-path', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.track-light')).animationName.includes('release-flow'));
    await page.click('[data-cta="roadmap-motion-toggle"]');
    assert.equal(await page.$eval('.track-light', el => getComputedStyle(el).animationName), 'none');
    await page.click('[data-cta="roadmap-motion-toggle"]');
    await page.select('[data-stage-select]', '1');
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
    await page.select('[data-stage-select]', '1');
    assert.equal(await page.$eval('[data-stage-title]', el => el.textContent), 'Aries Outdoor Living');
    await page.focus(width > 1100 ? '[data-stage-index="1"]' : '[data-stage-select]');
    await page.keyboard.press('End');
    assert.equal(await page.$eval('[data-stage-title]', el => el.textContent), 'Big7 Construction');
    assert.equal(await page.$eval('[data-stage-state]', el => el.textContent), 'Planned');
    assert.equal(await page.$eval('[data-stage-description]', el => el.textContent.includes('photography')), true);
    await page.waitForFunction(() => { const img = document.querySelector('[data-stage-image]'); return !img.hidden && img.complete && img.naturalWidth > 0; });
    assert.equal(await page.$eval('[data-stage-link]', el => el.getAttribute('href')), '#quarter-6');
    await page.click('[data-filter="released"]');
    await page.click('[data-stage-link]');
    assert.equal(await page.$eval('#quarter-6', el => el.closest('section').hidden), false, 'Selected build jump exposes its filtered destination');
    await page.focus(width > 1100 ? '[data-stage-index="20"]' : '[data-stage-select]');
    await page.keyboard.press('Home');
    assert.equal(await page.$eval('[data-stage-title]', el => el.textContent), 'M3MM Hub');
    assert.equal(await page.$eval('[data-stage-state]', el => el.textContent), 'Officially released');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'paused');
    await page.select('[data-stage-select]', '2');
    assert.equal(await page.$eval('[data-stage-copy]', el => el.getAnimations().length), 0);
    assert.equal(await page.$eval('[data-stage-state]', el => el.textContent), 'Testing preview');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await page.goto(origin + '/websites', { waitUntil: 'networkidle0' });
    await page.$eval('.project-story video', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    assert.equal(await page.$eval('.project-story video', el => el.paused && el.controls && !el.autoplay && el.preload === 'none'), true, 'Proof video waits for user playback');
    await page.$eval('.project-story video', video => video.play());
    await page.waitForFunction(() => document.querySelector('.project-story video').currentTime > .4);
    assert.equal(await page.$eval('.project-story video', video => video.paused), false, 'Requested video actually plays');
    await page.$eval('footer', el => el.scrollIntoView({ behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('.project-story video').paused);
    await page.$eval('.project-story video', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForFunction(() => !document.querySelector('#sticky-cta').classList.contains('is-visible'));
    assert.equal(await page.$eval('#sticky-cta', el => el.tabIndex), -1, 'Hidden sticky action leaves the tab order');
    await page.addScriptTag({ path: fileURLToPath(new URL('../node_modules/axe-core/axe.min.js', import.meta.url)) });
    for (const slug of ['aries', 'big7']) {
      await page.click(`[data-project-open="project-view-${slug}"]`);
      assert.equal(await page.$eval(`#project-view-${slug}`, el => el.open && el.contains(document.activeElement)), true);
      await page.waitForFunction(id => { const img = document.querySelector(`#project-view-${id} img`); return img.complete && img.naturalWidth > 0; }, {}, slug);
      assert.equal(await page.$eval(`#project-view-${slug}`, el => el.getBoundingClientRect().width <= innerWidth), true);
      const modalAxe = await page.evaluate(async () => { const result = await axe.run(document.querySelector('dialog[open]')); return { violations: result.violations.map(item => item.id), incomplete: result.incomplete.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary, checks: node.any.map(check => ({ id: check.id, data: check.data })) })) })) }; });
      // Chromium's native top layer can make axe attribute an underlying element
      // to a modal heading. Only that exact finding is reviewed, with independent
      // opaque-color contrast and title/close-button geometry checks below.
      const headingReview = await page.$eval(`#project-view-${slug}`, dialog => {
        const title = dialog.querySelector('h2');
        const button = dialog.querySelector('.viewer-close');
        const style = getComputedStyle(title);
        const luminance = color => {
          const values = color.match(/[\d.]+/g).map(Number);
          if (values.length > 3 && values[3] !== 1) throw new Error('Modal heading must have opaque colors');
          const linear = values.slice(0,3).map(value => { const c = value / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; });
          return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
        };
        const a = luminance(style.color), b = luminance(style.backgroundColor);
        const titleBox = title.getBoundingClientRect(), closeBox = button.getBoundingClientRect(), panel = dialog.getBoundingClientRect();
        return { ratio: (Math.max(a,b) + .05) / (Math.min(a,b) + .05),
          overlapsClose: Math.max(titleBox.left, closeBox.left) < Math.min(titleBox.right, closeBox.right) && Math.max(titleBox.top, closeBox.top) < Math.min(titleBox.bottom, closeBox.bottom),
          contained: titleBox.left >= panel.left && titleBox.right <= panel.right && titleBox.top >= panel.top && titleBox.bottom <= panel.bottom };
      });
      assert.equal(headingReview.ratio >= 4.5 && !headingReview.overlapsClose && headingReview.contained, true, 'Modal heading contrast and geometry');
      assert.deepEqual(modalAxe.violations, [], 'Open viewer axe violations');
      assert.equal(modalAxe.incomplete.every(finding => finding.id === 'color-contrast' && finding.nodes.every(node => node.target.length === 1 && node.target[0] === `#viewer-title-${slug}` && node.checks.every(check => check.data?.messageKey === 'elmPartiallyObscuring'))), true, 'No unreviewed modal axe findings');
      if (modalAxe.incomplete.length) console.log(`REVIEW ${width}px ${slug}: native-modal heading overlap finding; verified ${headingReview.ratio.toFixed(2)}:1 opaque contrast, no close-button overlap, contained title`);
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval(`#project-view-${slug}`, el => el.open), false);
      assert.equal(await page.$eval(`[data-project-open="project-view-${slug}"]`, el => el === document.activeElement), true, 'Viewer returns keyboard focus');
    }
    console.log(`PASS ${width}px: roadmap stage source state, keyboard navigation, image, filtered jump; project viewer Escape/focus; video manual playback`);
    if (width === 375 || width === 1440) {
      for (const [route, name] of [['/', 'home'], ['/roadmap', 'roadmap'], ['/websites', 'websites'], ['/audit', 'audit'], ['/policies', 'policies'], ['/resume', 'resume'], ['/compare/website-options', 'comparison'], ['/start/thanks', 'receipt'], ['/for/outdoor-living', 'trade']]) {
        await page.goto(origin + route, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: new URL(`${name}-${width}.png`, output).pathname.replace(/^\/(\w:)/, '$1') });
        if (name === 'roadmap') {
          await page.$eval('[data-release-stage]', el => el.scrollIntoView({ behavior: 'instant' }));
          await page.screenshot({ path: new URL(`roadmap-stage-${width}.png`, output).pathname.replace(/^\/(\w:)/, '$1') });
        }
        if (name === 'websites') {
          await page.$eval('#proof', el => el.scrollIntoView({ behavior: 'instant' }));
          // Let Chromium settle its native preload=none control UI before visual review.
          await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
          await page.screenshot({ path: new URL(`websites-proof-${width}.png`, output).pathname.replace(/^\/(\w:)/, '$1') });
          await page.click('[data-project-open="project-view-big7"]');
          await page.screenshot({ path: new URL(`project-viewer-${width}.png`, output).pathname.replace(/^\/(\w:)/, '$1') });
          await page.keyboard.press('Escape');
        }
        if (['home', 'roadmap', 'websites'].includes(name)) {
          await page.screenshot({ path: new URL(`${name}-${width}-full.png`, output).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true });
        }
      }
    }
    await page.setJavaScriptEnabled(false);
    await page.goto(origin + '/roadmap', { waitUntil: 'networkidle0' });
    assert.equal(await page.$$eval('[data-roadmap-status]:not([hidden])', els => els.length), 21);
    assert.equal(await page.$eval('[data-roadmap-filters]', el => getComputedStyle(el).display), 'none');
    assert.equal(await page.$eval('[data-stage-select]', el => el.closest('[data-stage-controls]').hidden), true);
    await page.goto(origin, { waitUntil: 'networkidle0' });
    assert.equal(await page.$eval('.orbit-fallback', el => getComputedStyle(el).opacity), '1');
    assert.equal(await page.$eval('.orbit-canvas', el => getComputedStyle(el).opacity), '0');
    assert.equal(await page.$$eval('nav[aria-label="Primary"] a', els => els.every(el => el.getBoundingClientRect().height >= 44)), true);
    evidence.push({ width, cinematic: 'source state, keyboard stage, filtered jump, viewer Escape/focus, image load, no video autoplay verified', motion: 'on/pause/persist/OS override/offscreen verified', filters: 'keyboard counts, details, quarter reset and reduced motion verified', noJS: 'all builds, visible navigation, static artwork' });
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
