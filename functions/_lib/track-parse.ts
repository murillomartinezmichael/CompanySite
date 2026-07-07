// Pure parsing for the /api/track beacon. Extracted so the endpoint's
// two-format parse (JSON preferred, URLSearchParams fallback for
// sendBeacon) can be unit-tested without a CF runtime.

import { clean } from './validate';

export const TRACK_LIMITS = {
  bodyBytes: 4 * 1024,
  ctaName: 80,
  section: 40,
  source: 64,
  path: 256,
  referrer: 512,
} as const;

export type CTAEventInput = {
  name?: string;
  section?: string;
  source?: string;
  path?: string;
  referrer?: string;
  ts?: unknown;    // typed unknown so we can honour "number or drop"
};

export type CTAEventCleaned = {
  cta: string;
  section?: string;
  source?: string;
  path?: string;
  referrer?: string;
  ts: number;
};

/**
 * Parse a track body that could be JSON, URL-encoded (sendBeacon default
 * with Blob), or garbage. Never throws. Empty input → empty object.
 * Malformed JSON → try URLSearchParams, then empty.
 */
export function parseTrackBody(raw: string): CTAEventInput {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
      ? parsed as CTAEventInput
      : {};
  } catch {
    // sendBeacon sometimes delivers URL-encoded. Try that; empty on fail.
    try {
      const p = new URLSearchParams(raw);
      return {
        name: p.get('name') || undefined,
        section: p.get('section') || undefined,
        source: p.get('source') || undefined,
      };
    } catch {
      return {};
    }
  }
}

/**
 * Trim, cap, and shape a raw event into the log-line record. `cta` gets
 * an "unknown" default so log filters always find a name field.
 */
export function cleanTrackEvent(body: CTAEventInput, now = Date.now()): CTAEventCleaned {
  return {
    cta: clean(body.name, TRACK_LIMITS.ctaName) || 'unknown',
    section: clean(body.section, TRACK_LIMITS.section) || undefined,
    source: clean(body.source, TRACK_LIMITS.source) || undefined,
    path: clean(body.path, TRACK_LIMITS.path) || undefined,
    referrer: clean(body.referrer, TRACK_LIMITS.referrer) || undefined,
    ts: typeof body.ts === 'number' && Number.isFinite(body.ts) ? body.ts : now,
  };
}
