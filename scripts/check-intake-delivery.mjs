import assert from 'node:assert/strict';
import { join } from 'node:path';

/** Exercise receipt/error UI using intercepted responses; never send a lead. */
export async function checkIntakeDelivery(browser, origin, artifacts) {
  const evidence = [];
  const forms = [
    { route: '/websites/', form: '#intake-form', status: '#intake-status', receipt: '/thanks',
      fields: { name: 'Synthetic Buyer', email: 'buyer@example.invalid', businessType: 'Synthetic business', frustration: 'Synthetic inquiry that must survive a delivery failure.' } },
    { route: '/roadmap/', form: '#roadmap-signup', status: '#roadmap-status', receipt: '/roadmap/thanks',
      fields: { email: 'reader@example.invalid', topics: 'Synthetic preview updates' } },
  ];
  for (const width of [375, 1440]) {
    for (const fixture of forms) {
      const page = await browser.newPage();
      let responseStatus = 503;
      let responseBody;
      let responseType = 'application/json';
      let deferResponse = false;
      const submitted = [];
      const keys = [];
      let releaseResponse;
      try {
        await page.setViewport({ width, height: 900 });
        await page.setRequestInterception(true);
        page.on('request', req => {
          if (req.url() === origin + '/api/lead') {
            submitted.push(JSON.parse(req.postData()));
            keys.push(req.headers()['idempotency-key']);
            const respond = () => req.respond({ status: responseStatus, contentType: responseType,
              body: responseBody ?? JSON.stringify(responseStatus === 503 ? { ok: false, error: 'delivery_unavailable' } : { ok: true }) });
            if (deferResponse) { releaseResponse = respond; return; }
            return respond();
          }
          if (req.url().startsWith(origin + '/api/')) return req.respond({ status: 204 });
          if (req.url().startsWith(origin + '/') || req.url().startsWith('data:')) return req.continue();
          return req.abort();
        });
        await page.goto(origin + fixture.route, { waitUntil: 'networkidle0' });
        for (const [name, value] of Object.entries(fixture.fields)) {
          await page.type(`${fixture.form} [name="${name}"]`, value);
        }
        const button = `${fixture.form} button[type="submit"]`;
        await page.click(button);
        await page.waitForFunction(selector => document.querySelector(selector)?.textContent.includes('Something broke on send'), {}, fixture.status);
        assert.equal(submitted.length, 1, 'Failure must not trigger automatic retries');
        assert.equal(new URL(page.url()).pathname, fixture.route, 'Failure must not navigate to a receipt');
        for (const [name, value] of Object.entries(fixture.fields)) {
          assert.equal(await page.$eval(`${fixture.form} [name="${name}"]`, input => input.value), value);
        }
        assert.equal(await page.$eval(button, el => el.disabled), false);
        assert.match(await page.$eval(fixture.status, el => el.textContent), /Email murillomartinezmichael@gmail\.com/);
        await page.screenshot({ path: join(artifacts, `delivery-${fixture.route.split('/')[1]}-${width}.png`) });
        responseStatus = 200;
        for (const [type, body] of [['application/json', '{"ok":false}'], ['text/html', '<html>Login</html>']]) {
          responseType = type;
          responseBody = body;
          await page.click(button);
          await page.waitForFunction(selector => document.querySelector(selector)?.textContent.includes('Something broke on send'), {}, fixture.status);
          assert.equal(new URL(page.url()).pathname, fixture.route, 'False 200 receipt must not navigate');
          for (const [name, value] of Object.entries(fixture.fields)) {
            assert.equal(await page.$eval(`${fixture.form} [name="${name}"]`, input => input.value), value);
          }
        }
        assert.equal(submitted.length, 3);
        responseType = 'application/json';
        responseBody = undefined;
        deferResponse = true;
        const retryRequest = page.waitForRequest(req => req.url() === origin + '/api/lead');
        await page.click(button);
        await retryRequest;
        await page.waitForFunction(selector => document.querySelector(selector)?.disabled, {}, button);
        // A submit event can be reentrant even when the visible button is disabled.
        await page.$eval(fixture.form, form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
        await page.waitForFunction(selector => document.querySelector(selector)?.textContent === 'Sending…', {}, fixture.status);
        assert.equal(submitted.length, 4, 'Pending submission must not dispatch twice');
        assert.match(keys[0], /^[0-9a-f-]{36}$/i);
        assert.equal(new Set(keys).size, 1, 'Every unchanged retry must reuse its logical identity');
        assert.equal(typeof releaseResponse, 'function');
        await releaseResponse();
        await page.waitForFunction(selector => document.querySelector(selector)?.textContent.includes('Redirecting'), {}, fixture.status);
        assert.equal(await page.$eval(button, el => el.disabled), true, 'Confirmed submission stays disabled until navigation');
        await page.$eval(fixture.form, form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
        await page.waitForFunction(receipt => location.pathname.replace(/\/$/, '') === receipt, {}, fixture.receipt);
        assert.equal(submitted.length, 4);
        assert.deepEqual(submitted[3], submitted[0], 'Deliberate retry must preserve the submitted inquiry');
        evidence.push({ route: fixture.route, width, retainedInput: true, manualFallback: true, deliberateRetry: true, sameRetryIdentity: true, false200ReceiptRejected: true, pendingAndAcceptedDuplicateBlocked: true });
        console.log(`PASS delivery failure / retry ${fixture.route} @ ${width}px`);
      } finally {
        await page.close();
      }
    }
  }
  return evidence;
}
