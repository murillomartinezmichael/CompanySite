import { beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost as chatPost } from '../../functions/api/chat';
import { __resetBuckets } from '../../functions/_lib/rate';

// Provider edge cases that run to completion (no client cancellation; see
// chat-cancellation.test.ts for those). The widget (ChatWidget.astro) only
// shows an error when an `error` line arrives before any delta text, and a
// bare `done` with no text leaves an empty assistant bubble on screen.
type Step = { text: string } | { throw: Error };
const sdk = vi.hoisted(() => ({ steps: [] as unknown[], final: (async () => ({ stop_reason: 'end_turn' })) as () => Promise<unknown> }));
vi.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error {}
  return {
    default: class FakeAnthropic {
      static APIError = APIError;
      messages = {
        stream: () => ({
          async *[Symbol.asyncIterator]() {
            for (const step of sdk.steps as Step[]) {
              if ('throw' in step) throw step.throw;
              yield { type: 'content_block_delta', delta: { type: 'text_delta', text: step.text } };
            }
          },
          finalMessage: () => sdk.final(),
        }),
      };
    },
  };
});

async function lines(): Promise<unknown[]> {
  const request = new Request('https://m3mm.net/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.88' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Synthetic question' }] }),
  });
  const response = await chatPost({ request, env: { ANTHROPIC_API_KEY: 'synthetic-fixture' } } as unknown as Parameters<typeof chatPost>[0]);
  expect(response.status).toBe(200);
  return (await response.text()).trim().split('\n').map((l) => JSON.parse(l));
}

const EMPTY = { type: 'error', message: 'The assistant did not return an answer. Try asking again.' };

beforeEach(() => {
  __resetBuckets();
  sdk.steps = [];
  sdk.final = async () => ({ stop_reason: 'end_turn' });
});

describe('/api/chat never ends a turn with nothing to show', () => {
  it('reports an empty upstream reply as an error, not a silent done', async () => {
    expect(await lines()).toEqual([EMPTY]);
  });

  it('reports a reply that hit max_tokens before any text as an error', async () => {
    sdk.final = async () => ({ stop_reason: 'max_tokens' });
    expect(await lines()).toEqual([EMPTY]);
  });

  it('treats empty-string deltas as no text', async () => {
    sdk.steps = [{ text: '' }];
    expect(await lines()).toEqual([EMPTY]);
  });
});

describe('/api/chat mid-stream upstream failures (pinned)', () => {
  it('ends with an unavailable error after partial text when the provider errors', async () => {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    sdk.steps = [{ text: 'Partial ' }, { throw: new (Anthropic as unknown as { APIError: new (m: string) => Error }).APIError('Synthetic overloaded') }];
    expect(await lines()).toEqual([
      { type: 'delta', text: 'Partial ' },
      { type: 'error', message: 'The assistant is temporarily unavailable.' },
    ]);
  });

  it('ends with a generic error, never the raw message, on a non-API failure', async () => {
    sdk.steps = [{ text: 'Partial ' }, { throw: new Error('Synthetic private detail') }];
    const out = await lines();
    expect(out).toEqual([
      { type: 'delta', text: 'Partial ' },
      { type: 'error', message: 'Something broke on send.' },
    ]);
    expect(JSON.stringify(out)).not.toContain('Synthetic private detail');
  });

  it('ends with an error when the final message rejects after text', async () => {
    sdk.steps = [{ text: 'Whole answer' }];
    sdk.final = async () => { throw new Error('Synthetic stream ended without message_stop'); };
    expect(await lines()).toEqual([
      { type: 'delta', text: 'Whole answer' },
      { type: 'error', message: 'Something broke on send.' },
    ]);
  });

  it('keeps a normal answer ending in done', async () => {
    sdk.steps = [{ text: 'Hello' }];
    expect(await lines()).toEqual([{ type: 'delta', text: 'Hello' }, { type: 'done' }]);
  });
});
