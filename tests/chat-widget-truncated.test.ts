import { describe, expect, it } from 'vitest';
import { loadPage, type FakeEl } from './helpers/page-scripts';

// /api/chat ends a reply that hit max_tokens with an `error` line after the
// partial text. The widget used to show an error only when no text had
// arrived, so a cut-off answer looked complete. It must keep the partial
// answer and add a short notice under it.
function streamOf(lines: unknown[]) {
  const chunks = lines.map((l) => new TextEncoder().encode(`${JSON.stringify(l)}\n`));
  return {
    ok: true, status: 200,
    body: { getReader: () => ({ read: async () => (chunks.length ? { done: false, value: chunks.shift() } : { done: true, value: undefined }) }) },
  };
}
const messages = (chat: Record<string, FakeEl>) =>
  chat['chat-messages'].children as unknown as Array<{ className: string; textContent: string }>;

async function ask(lines: unknown[]) {
  const page = loadPage({ fetch: async () => streamOf(lines), TextDecoder });
  page.chat['chat-input'].value = 'Synthetic question';
  (page.chat['chat-form'].listeners.submit[0])({ defaultPrevented: false, preventDefault() {} });
  await new Promise((r) => setTimeout(r, 10));
  return page;
}

describe('chat widget truncated answer', () => {
  it('keeps the partial answer and shows the notice under it', async () => {
    const notice = 'This answer was cut off because it ran long. Ask a follow-up for the rest.';
    const { chat } = await ask([{ type: 'delta', text: 'Partial answer' }, { type: 'error', reason: 'max_tokens', message: notice }]);
    const shown = messages(chat).map((m) => [m.className.split(' ')[1], m.textContent]);
    expect(shown).toEqual([
      ['chat-msg-user', 'Synthetic question'],
      ['chat-msg-assistant', 'Partial answer'],
      ['chat-msg-error', notice],
    ]);
  });

  it('a normal answer adds no notice', async () => {
    const { chat } = await ask([{ type: 'delta', text: 'Whole answer' }, { type: 'done' }]);
    expect(messages(chat).map((m) => m.textContent)).toEqual(['Synthetic question', 'Whole answer']);
  });
});
