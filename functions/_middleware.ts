import { withSecurityHeaders } from './_lib/security-headers';
import {authorizeOwner,denied,privatePath,privateResponse,type OwnerEnvironment} from './_lib/owner-access';

// Keep the public hostname aligned with canonical URLs and the API origin policy.
export const onRequest: PagesFunction<OwnerEnvironment> = async ({ request, env, next }) => {
  if (privatePath(new URL(request.url).pathname)) {
    const access=await authorizeOwner(request,env);
    if(!access.ok) return denied(access);
    return privateResponse(await next());
  }
  const url = new URL(request.url);
  if (url.hostname !== 'www.m3mm.net') return next();

  // Assign only path/query to a fixed origin; never retain incoming credentials
  // or ports, or resolve a path beginning with // as a different hostname.
  const destination = new URL('https://m3mm.net');
  destination.pathname = url.pathname;
  destination.search = url.search;
  return new Response(null, {
    status: request.method === 'GET' || request.method === 'HEAD' ? 301 : 308,
    headers: withSecurityHeaders({ Location: destination.href }),
  });
};
