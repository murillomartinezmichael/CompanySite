// POST /api/chat — Claude-powered assistant widget, replacing the SiteGuide
// embed (2026-08-20). Owned end-to-end by CompanySite: its own rate limit,
// its own CORS grant, its own system prompt (chat-system-prompt.ts). Streams
// the reply back as NDJSON so the widget can render tokens as they arrive.
//
// Same hardening shape as lead.ts/track.ts:
// - 16 KB body cap, JSON only
// - Origin allowlist (../_lib/cors.ts)
// - Per-IP rate limit — tighter than /api/lead (5/60s) because a chat turn
//   costs real Claude API spend per request, not just an email send.
// - History length + per-message length caps so a malicious client can't
//   force an unbounded-cost request
// - Graceful degradation: no ANTHROPIC_API_KEY -> a clear 503, never a silent
//   fake reply (LAW 6)

import Anthropic from '@anthropic-ai/sdk';
import { checkRate, rateKey } from '../_lib/rate';
import { originAllowed, corsResponseHeaders, preflightResponse } from '../_lib/cors';
import { withSecurityHeaders, secureResponse } from '../_lib/security-headers';
import { CHAT_SYSTEM_PROMPT } from '../_lib/chat-system-prompt';

type Env = {
  ANTHROPIC_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
};

type ChatRole = 'user' | 'assistant';
type ChatMessage = { role: ChatRole; content: string };

const MAX_BODY_BYTES = 16 * 1024;
const RATE_MAX = 15;
const RATE_WINDOW_S = 60;
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_TOKENS = 2_048;
const MODEL = 'claude-opus-5';

function jsonResponse(status: number, body: unknown, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: withSecurityHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    }),
  });
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === 'user' || v.role === 'assistant') &&
    typeof v.content === 'string' &&
    v.content.trim().length > 0 &&
    v.content.length <= MAX_MESSAGE_CHARS
  );
}

/** NDJSON line encoder — one JSON object per line, matches the widget's parser. */
function ndjsonLine(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(obj)}\n`);
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  const origin = request.headers.get('Origin');
  const cors = corsResponseHeaders(env, origin);

  if (origin && !originAllowed(env, origin)) {
    return jsonResponse(403, { ok: false, error: 'origin_not_allowed' }, cors);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rate = checkRate(rateKey('chat', ip), RATE_MAX, RATE_WINDOW_S);
  if (!rate.ok) {
    return jsonResponse(
      429,
      { ok: false, error: 'rate_limited' },
      { ...cors, 'Retry-After': String(rate.retryAfter) },
    );
  }

  const contentLengthRaw = request.headers.get('Content-Length');
  const contentLength = contentLengthRaw ? Number(contentLengthRaw) : NaN;
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse(413, { ok: false, error: 'payload_too_large' }, cors);
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return jsonResponse(400, { ok: false, error: 'invalid_body' }, cors);
  }
  if (text.length > MAX_BODY_BYTES) {
    return jsonResponse(413, { ok: false, error: 'payload_too_large' }, cors);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return jsonResponse(400, { ok: false, error: 'invalid_json' }, cors);
  }

  const rawMessages = parsed && typeof parsed === 'object' ? (parsed as { messages?: unknown }).messages : undefined;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return jsonResponse(400, { ok: false, error: 'validation', field: 'messages' }, cors);
  }
  if (rawMessages.length > MAX_HISTORY_MESSAGES) {
    return jsonResponse(400, { ok: false, error: 'validation', field: 'messages', reason: 'too_many' }, cors);
  }
  if (!rawMessages.every(isChatMessage)) {
    return jsonResponse(400, { ok: false, error: 'validation', field: 'messages', reason: 'malformed' }, cors);
  }
  const messages = rawMessages as ChatMessage[];
  if (messages[messages.length - 1].role !== 'user') {
    return jsonResponse(400, { ok: false, error: 'validation', field: 'messages', reason: 'must_end_with_user' }, cors);
  }
  // The Anthropic Messages API requires the conversation to start with a user
  // turn and roles to strictly alternate. Enforce it here so a malformed or
  // direct client can't push a bad sequence through to a (billed) API call
  // that would just 400 anyway.
  if (messages[0].role !== 'user') {
    return jsonResponse(400, { ok: false, error: 'validation', field: 'messages', reason: 'must_start_with_user' }, cors);
  }
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === messages[i - 1].role) {
      return jsonResponse(400, { ok: false, error: 'validation', field: 'messages', reason: 'must_alternate' }, cors);
    }
  }

  if (!env.ANTHROPIC_API_KEY) {
    // LAW 6 — never fake a reply. A visitor who gets a canned "I can't help
    // right now" at least knows to use the free-review form instead. Checked
    // after validation so a malformed request is still reported as 400, not
    // masked behind a generic "unavailable".
    return jsonResponse(503, { ok: false, error: 'assistant_unavailable' }, cors);
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: CHAT_SYSTEM_PROMPT,
          output_config: { effort: 'low' }, // snappy, low-cost — this is a Q&A widget, not a reasoning task
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of anthropicStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(ndjsonLine({ type: 'delta', text: event.delta.text }));
          }
        }

        const final = await anthropicStream.finalMessage();
        if (final.stop_reason === 'refusal') {
          controller.enqueue(ndjsonLine({ type: 'error', message: 'The assistant declined to answer that.' }));
        } else {
          controller.enqueue(ndjsonLine({ type: 'done' }));
        }
      } catch (err) {
        controller.enqueue(
          ndjsonLine({
            type: 'error',
            message: err instanceof Anthropic.APIError ? 'The assistant is temporarily unavailable.' : 'Something broke on send.',
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: withSecurityHeaders({
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      ...cors,
    }),
  });
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method === 'OPTIONS') {
    // `secureResponse` (not `withSecurityHeaders`) because the CORS module owns
    // the preflight's construction — the grant/deny decision stays entirely in
    // cors.ts and this only layers headers on top of whatever it returned.
    // Measured 2026-09-07: without this wrap the OPTIONS 204 shipped ZERO of the
    // five security headers, while /api/lead and /api/track (which do wrap) shipped
    // all five. Same bug class as the one security-headers.ts was written to kill.
    return secureResponse(preflightResponse(env, request));
  }
  return new Response('Method Not Allowed', {
    status: 405,
    headers: withSecurityHeaders({ Allow: 'POST, OPTIONS', 'Cache-Control': 'no-store' }),
  });
};
