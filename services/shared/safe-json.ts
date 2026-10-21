/** Bounded input handling. Never include request content or provider errors in logs. */
export class SafeError extends Error {
  constructor(readonly code: string, readonly status = 400) { super(code); }
}
export async function readJson(input: Request | Response, limit = 524288): Promise<unknown> {
  const contentType = input.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') throw new SafeError('json_required', 415);
  if (Number(input.headers.get('Content-Length') || 0) > limit) throw new SafeError('payload_too_large', 413);
  const reader = input.body?.getReader();
  if (!reader) throw new SafeError('json_required');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new SafeError('payload_too_large', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new SafeError('invalid_json'); }
}
export function stableJson(value: unknown): string {
  function ordered(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(ordered);
    if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, ordered((v as Record<string,unknown>)[k])]));
    return v;
  }
  return JSON.stringify(ordered(value));
}
export async function sha256(text: string): Promise<string> {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(v => v.toString(16).padStart(2,'0')).join('');
}
export function toBase64(bytes: Uint8Array): string {
  let s = ''; for (let i=0;i<bytes.length;i+=4096) s += String.fromCharCode(...bytes.subarray(i,i+4096));
  return btoa(s);
}
export function fromBase64(text: string) { return Uint8Array.from(atob(text), c => c.charCodeAt(0)); }
