import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { createInquirySubmission, isInquiryAccepted, InquiryRetryError, inquiryErrorMessage } from '../src/lib/inquiry-submission';
import { validateLead } from '../functions/_lib/validate';

const inquiry = {
  name: 'Synthetic Buyer',
  email: 'buyer@example.invalid',
  businessType: 'Synthetic business',
  frustration: 'Synthetic inquiry details.',
  intent: 'book:free-review',
};

function fixture() {
  let next = 0;
  const uuid = vi.fn(() => `00000000-0000-4000-8000-${String(++next).padStart(12, '0')}`);
  return { uuid, submission: createInquirySubmission(uuid) };
}

afterEach(() => vi.unstubAllGlobals());

describe('same-page inquiry retry identity', () => {
  it('generates a UUID only when an outgoing payload is submitted', () => {
    const { uuid, submission } = fixture();
    expect(uuid).not.toHaveBeenCalled();
    expect(submission.keyFor(inquiry)).toBe('00000000-0000-4000-8000-000000000001');
    expect(uuid).toHaveBeenCalledTimes(1);
  });

  it('keeps the key for unchanged retries after unsuccessful delivery', () => {
    const { uuid, submission } = fixture();
    const first = submission.keyFor(inquiry);
    // Failure does not call reset: both a rejected fetch and non-2xx permit retry.
    expect(submission.keyFor({ ...inquiry })).toBe(first);
    expect(submission.keyFor({ ...inquiry })).toBe(first);
    expect(uuid).toHaveBeenCalledTimes(1);
  });

  it('ignores property insertion order when comparing the final payload', () => {
    const { uuid, submission } = fixture();
    const first = submission.keyFor(inquiry);
    const reordered = Object.fromEntries(Object.entries(inquiry).reverse());
    expect(submission.keyFor(reordered)).toBe(first);
    expect(uuid).toHaveBeenCalledTimes(1);
  });

  it.each(Object.keys(inquiry))('changes the key when outgoing %s changes', (field) => {
    const { uuid, submission } = fixture();
    const first = submission.keyFor(inquiry);
    const edited = { ...inquiry, [field]: 'Synthetic changed value' };
    const changed = submission.keyFor(edited);
    expect(changed).not.toBe(first);
    expect(submission.keyFor(edited)).toBe(changed);
    expect(uuid).toHaveBeenCalledTimes(2);
  });

  it('detects added and removed fields without mutating the final payload', () => {
    const { submission } = fixture();
    const data = Object.freeze({ ...inquiry });
    const first = submission.keyFor(data);
    const added = submission.keyFor({ ...data, source: 'synthetic' });
    const removed = submission.keyFor(data);
    expect(added).not.toBe(first);
    expect(removed).toBe(first);
    expect(data).toEqual(inquiry);
  });

  it('reuses the unresolved original identity after editing and reverting a failed attempt', () => {
    const { uuid, submission } = fixture();
    const original = submission.keyFor(inquiry);
    const changed = submission.keyFor({ ...inquiry, frustration: 'Revised inquiry details.' });
    expect(changed).not.toBe(original);
    expect(submission.keyFor({ ...inquiry })).toBe(original);
    expect(uuid).toHaveBeenCalledTimes(2);
    submission.reset();
    expect(submission.keyFor(inquiry)).not.toBe(original);
  });

  it('distinguishes flat JSON scalar values and punctuation without collisions', () => {
    const { submission } = fixture();
    const payloads: Array<Record<string, string | number | boolean | null>> = [
      { value: 1 }, { value: '1' }, { value: true }, { value: null },
      { 'a:b': 'c' }, { a: 'b:c' }, { a: 'b', c: 'd' }, { a: 'b,c:d' },
    ];
    const keys = payloads.map((data) => submission.keyFor(data));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('starts a fresh inquiry after explicit success reset even for identical data', () => {
    const { uuid, submission } = fixture();
    const first = submission.keyFor(inquiry);
    submission.reset();
    expect(uuid).toHaveBeenCalledTimes(1);
    expect(submission.keyFor(inquiry)).not.toBe(first);
    expect(uuid).toHaveBeenCalledTimes(2);
  });

  it('uses browser crypto.randomUUID with no persistent storage', () => {
    const uuid = vi.fn(() => '00000000-0000-4000-8000-000000000001');
    const storage = new Proxy({}, { get: () => { throw new Error('Storage is forbidden'); } });
    vi.stubGlobal('crypto', { randomUUID: uuid });
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('sessionStorage', storage);
    const submission = createInquirySubmission();
    expect(submission.keyFor(inquiry)).toBe(uuid.mock.results[0].value);
    expect(submission.keyFor(inquiry)).toBe(uuid.mock.results[0].value);
    submission.reset();
    submission.keyFor(inquiry);
    expect(uuid).toHaveBeenCalledTimes(2);
  });
});

describe.each([
  ['intake', '../src/components/Intake.astro', 'intake-form'],
  ['roadmap', '../src/pages/roadmap.astro', 'roadmap-signup'],
])('%s form script retry wiring (synthetic DOM, no browser)', (kind, path, formId) => {
  it('uses the final payload and preserves failure, retry and success behavior', async () => {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    expect(script).toBeTruthy();
    const code = ts.transpileModule(script!, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const { uuid } = fixture();
    const fields = { ...inquiry, topics: '  Synthetic topic  ', source: kind };
    const span = { innerHTML: 'Send' };
    const button = { disabled: false, textContent: 'Send', querySelector: () => span };
    const status = { textContent: '', hidden: true, classList: { add: vi.fn(), remove: vi.fn() } };
    let submit: (event: { preventDefault: () => void }) => Promise<void>;
    const reset = vi.fn();
    const form = {
      dataset: { source: kind, successPath: `/${kind}/thanks` },
      querySelector: () => button,
      addEventListener: (name: string, handler: typeof submit) => { if (name === 'submit') submit = handler; },
      reset,
    };
    const track = vi.fn();
    const fetch = vi.fn()
      .mockRejectedValueOnce(new Error('Synthetic transport failure'))
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockImplementation(() => Promise.resolve(new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } })));
    const navigate = vi.fn();
    runInNewContext(code, {
      exports: {},
      require: (name: string) => {
        if (name === '@/lib/inquiry-submission') return { createInquirySubmission: () => createInquirySubmission(uuid), isInquiryAccepted, InquiryRetryError, inquiryErrorMessage, showInquiryRecovery: vi.fn() };
        if (name === '@/lib/track') return { track };
        if (name === '@/lib/prefill') return { isPriorPrefill: () => false };
        if (name === '../../functions/_lib/validate') return { validateLead };
        throw new Error(`Unexpected script import: ${name}`);
      },
      document: { getElementById: (id: string) => id === formId ? form : status },
      FormData: class { entries() { return Object.entries(fields); } },
      fetch,
      setTimeout: navigate,
      window: { location: { href: '' } },
    });
    const send = () => submit!({ preventDefault: vi.fn() });
    const request = (index: number) => fetch.mock.calls[index][1];
    const key = (index: number) => request(index).headers['Idempotency-Key'];

    await send();
    expect(reset).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(status.textContent).toContain('Something broke on send');
    expect(button.disabled).toBe(false);
    expect(track.mock.calls[0][0].name).toBe('intake_error');
    // Roadmap trims/removes topics before deriving identity; equivalent input stays equivalent.
    if (kind === 'roadmap') fields.topics = 'Synthetic topic';
    await send();
    expect(key(1)).toBe(key(0));
    expect(reset).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(uuid).toHaveBeenCalledTimes(1);

    fields.email = 'changed@example.invalid';
    const pending = send();
    expect(button.disabled).toBe(true);
    // Reentrant submits must not start a second request while one is pending.
    await send();
    expect(fetch).toHaveBeenCalledTimes(3);
    await pending;
    expect(key(2)).not.toBe(key(1));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[2][0].name).toBe('intake_submit');
    expect(button.disabled).toBe(true);
    if (kind === 'roadmap') {
      const payload = JSON.parse(request(2).body);
      expect(payload.frustration).toBe('Roadmap subscriber wants: Synthetic topic');
      expect(payload).not.toHaveProperty('topics');
    }
    await send();
    // A confirmed submission stays locked through the delayed redirect.
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(uuid).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls.every(([url]) => url === '/api/lead')).toBe(true);
  });
});

describe('intake rejects correctable fields before sending', () => {
  it.each([
    ['name', ''], ['name', '   '], ['email', ''], ['email', 'not-an-email'],
    ['businessType', ''], ['businessType', '   '], ['frustration', ''],
    ['frustration', 'short'], ['frustration', '       short       '],
    ['currentUrl', 'not a URL'], ['currentUrl', 'javascript:alert(1)'],
  ])('reports %s error for %j and preserves the valid retry identity', async (fieldName, invalid) => {
    const source = readFileSync(new URL('../src/components/Intake.astro', import.meta.url), 'utf8');
    const script = source.match(/<script>([\s\S]*?)<\/script>/)![1];
    const code = ts.transpileModule(script, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const { uuid } = fixture();
    const fields: Record<string, string> = { ...inquiry, source: 'website', currentUrl: '' };
    const good = fields[fieldName];
    fields[fieldName] = invalid;
    const controls = Object.fromEntries(Object.keys(fields).map(name => [name, { setCustomValidity: vi.fn() }]));
    const span = { innerHTML: 'Send' };
    const button = { disabled: false, querySelector: () => span };
    const reportValidity = vi.fn();
    const reset = vi.fn();
    const listeners: Record<string, (event?: unknown) => Promise<void>> = {};
    const form = {
      dataset: { source: 'website', successPath: '/thanks' },
      querySelector: (selector: string) => selector.startsWith('[name=')
        ? controls[selector.match(/\[name="(.+)"\]/)![1]] : button,
      querySelectorAll: () => Object.values(controls),
      addEventListener: (name: string, handler: typeof listeners[string]) => { listeners[name] = handler; },
      reportValidity, reset,
    };
    const status = { textContent: '', classList: { add: vi.fn(), remove: vi.fn() } };
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    runInNewContext(code, {
      exports: {}, require: (name: string) => {
        if (name === '@/lib/inquiry-submission') return { createInquirySubmission: () => createInquirySubmission(uuid), isInquiryAccepted, InquiryRetryError, inquiryErrorMessage, showInquiryRecovery: vi.fn() };
        if (name === '@/lib/track') return { track: vi.fn() };
        if (name === '@/lib/prefill') return { isPriorPrefill: () => false };
        if (name === '../../functions/_lib/validate') return { validateLead };
        throw new Error('Unexpected source import');
      },
      document: { getElementById: (id: string) => id === 'intake-form' ? form : status },
      FormData: class { entries() { return Object.entries(fields); } }, fetch,
      setTimeout: vi.fn(), window: { location: { href: '' } },
    });
    const send = () => listeners.submit({ preventDefault: vi.fn() });
    await send();
    expect(fetch).not.toHaveBeenCalled();
    expect(uuid).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    expect(button.disabled).toBe(false);
    expect(reportValidity).toHaveBeenCalledOnce();
    expect(controls[fieldName].setCustomValidity).toHaveBeenCalledWith(expect.any(String));
    expect(controls[fieldName].setCustomValidity.mock.calls[0][0]).not.toBe('');
    expect(status.textContent).not.toContain('Something broke');
    fields[fieldName] = good;
    await listeners.input();
    expect(controls[fieldName].setCustomValidity).toHaveBeenLastCalledWith('');
    const pending = send();
    listeners.input();
    expect(status.textContent).toBe('Sending…');
    await pending;
    expect(fetch).toHaveBeenCalledOnce();
    expect(status.textContent).toContain('Something broke');
    fields[fieldName] = invalid;
    await listeners.input();
    expect(status.textContent).toBe('');
    expect(status.classList.add).toHaveBeenLastCalledWith('hidden');
    await send();
    expect(fetch).toHaveBeenCalledOnce();
    expect(status.textContent).toBe('');
    fields[fieldName] = good;
    await listeners.input();
    await send();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][1].headers['Idempotency-Key']).toBe(fetch.mock.calls[0][1].headers['Idempotency-Key']);
    expect(uuid).toHaveBeenCalledOnce();
  });
});


describe('lead endpoint application receipt', () => {
  it('accepts only explicit JSON success, including a charset parameter', async () => {
    expect(await isInquiryAccepted(new Response('{"ok":true}', {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }))).toBe(true);
  });
  it.each([
    ['<html>Login</html>', 200, 'text/html'],
    ['{"ok":false}', 200, 'application/json'],
    ['{"ok":"true"}', 200, 'application/json'],
    ['null', 200, 'application/json'],
    ['[]', 200, 'application/json'],
    ['{}', 200, 'application/json'],
    ['not-json', 200, 'application/json'],
    ['{"ok":true}', 201, 'application/json'],
    ['{"ok":true}', 503, 'application/json'],
    [null, 204, 'application/json'],
  ])('rejects an unconfirmed receipt %j / %i / %s', async (body, status, type) => {
    expect(await isInquiryAccepted(new Response(body, { status, headers: { 'Content-Type': type } }))).toBe(false);
  });
  it('rejects a followed redirect even when its final body looks successful', async () => {
    const response = new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } });
    Object.defineProperty(response, 'redirected', { value: true });
    expect(await isInquiryAccepted(response)).toBe(false);
  });
});
