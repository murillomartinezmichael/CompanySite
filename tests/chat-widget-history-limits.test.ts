import { describe, expect, it } from 'vitest';
import { loadPage } from './helpers/page-scripts';

// /api/chat rejects any message over 4000 chars and any body over 16 KB
// (functions/api/chat.ts), but one reply can reach ~8000 chars (max_tokens
// 2048). The widget stored the whole reply in history and resent it, so one
// long answer made every later turn fail until a page reload.
const MAX_MESSAGE_CHARS = 4_000;
const MAX_BODY_BYTES = 16 * 1024;

function reply(text: string) {
  const chunks = [new TextEncoder().encode(`${JSON.stringify({ type: 'delta', text })}\n${JSON.stringify({ type: 'done' })}\n`)];
  return { ok: true, status: 200, body: { getReader: () => ({ read: async () => (chunks.length ? { done: false, value: chunks.shift() } : { done: true, value: undefined }) }) } };
}

describe('chat widget history stays within the server limits', () => {
  it('long replies never push a later request past the message or body caps', async () => {
    const bodies: string[] = [];
    const page = loadPage({ fetch: async (_u: string, init: { body: string }) => { bodies.push(init.body); return reply('é'.repeat(7_000)); }, TextDecoder, TextEncoder });
    for (let i = 0; i < 6; i++) {
      page.chat['chat-input'].value = `Question ${i} ${'q'.repeat(3_000)}`;
      page.chat['chat-form'].listeners.submit[0]({ defaultPrevented: false, preventDefault() {} });
      await new Promise((r) => setTimeout(r, 10));
    }
    expect(bodies).toHaveLength(6);
    for (const body of bodies) {
      expect(new TextEncoder().encode(body).length).toBeLessThanOrEqual(MAX_BODY_BYTES);
      const { messages } = JSON.parse(body) as { messages: Array<{ role: string; content: string }> };
      expect(messages[0].role).toBe('user');
      expect(messages.at(-1)!.content.startsWith('Question')).toBe(true);
      for (const m of messages) expect(m.content.length).toBeLessThanOrEqual(MAX_MESSAGE_CHARS);
    }
  });
});
