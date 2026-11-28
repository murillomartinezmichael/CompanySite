// Cloudflare Pages serves dist/<route>/index.html at `/<route>/` and answers
// `/<route>` with a 308 to the slash form. URLs we advertise to crawlers
// (canonical, og:url, sitemap, BreadcrumbList) must be the 200 form.
// Root, already-slashed paths, file-like paths (`/sitemap.xml`) and the
// top-level `/404` page (built as dist/404.html, a file) stay unchanged.
export function servedPath(path: string): string {
  if (path.endsWith('/') || path === '/404') return path;
  const last = path.slice(path.lastIndexOf('/') + 1);
  return last.includes('.') ? path : `${path}/`;
}
