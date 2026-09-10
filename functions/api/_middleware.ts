import { secureResponse, withSecurityHeaders } from '../_lib/security-headers';

// Covers all API routes, including future handlers. Existing handler wrappers
// retain their specific CORS, beacon and error behavior. Never buffer chat streams.
export const onRequest: PagesFunction = async ({ next }) => {
  try {
    return secureResponse(await next());
  } catch {
    // Do not expose exception messages: providers may include request data.
    console.error(JSON.stringify({ event: 'api_unhandled_error' }));
    return new Response(JSON.stringify({ ok: false, error: 'internal_error' }), {
      status: 500,
      headers: withSecurityHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      }),
    });
  }
};
