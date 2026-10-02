type BodyReadResult =
  | { ok: true; text: string }
  | { ok: false; error: 'too_large' | 'unreadable' };

/** Count raw bytes before buffering or decoding; Content-Length is only a hint. */
export async function readBodyText(request: Request, maxBytes: number): Promise<BodyReadResult> {
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    reader = request.body?.getReader();
    const bytes = new Uint8Array(maxBytes);
    let received = 0;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value.byteLength > maxBytes - received) {
          // A rejecting or stalled cancellation must not delay the rejection.
          void reader.cancel().catch(() => {});
          return { ok: false, error: 'too_large' };
        }
        bytes.set(value, received);
        received += value.byteLength;
      }
    }
    // Decode only after the bounded read so split UTF-8 characters stay intact.
    return { ok: true, text: new TextDecoder().decode(bytes.subarray(0, received)) };
  } catch {
    return { ok: false, error: 'unreadable' };
  } finally {
    reader?.releaseLock();
  }
}
