// Lazy-load `<video data-lazy>` — hydrate + autoplay only when the element
// enters the viewport. Cuts the 7 MB case-study video off first-load for
// visitors who bail before scrolling to Proof (2026-07-07 Rung IV strike;
// see docs/lighthouse-baseline.md).
export function wireLazyVideos() {
  const videos = document.querySelectorAll<HTMLVideoElement>('video[data-lazy]');
  if (videos.length === 0) return;

  const hydrate = (video: HTMLVideoElement) => {
    const sources = video.querySelectorAll<HTMLSourceElement>('source[data-src]');
    let changed = false;
    sources.forEach((s) => {
      if (s.dataset.src && !s.src) {
        s.src = s.dataset.src;
        changed = true;
      }
    });
    if (changed) video.load();
    void video.play().catch(() => {
      /* autoplay blocked (no user gesture yet) — leave paused, poster stays. */
    });
  };

  if (!('IntersectionObserver' in window)) {
    videos.forEach(hydrate);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        hydrate(entry.target as HTMLVideoElement);
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '200px 0px' }
  );

  videos.forEach((v) => io.observe(v));
}

// Set `<video data-poster-srcset>` posters only when the video nears the
// viewport, choosing the smallest candidate covering its rendered width
// (DPR capped at 2). A bare `poster` downloads at full size on first load.
export function wireLazyPosters() {
  const videos = document.querySelectorAll<HTMLVideoElement>('video[data-poster-srcset]');
  if (videos.length === 0) return;
  const setPoster = (video: HTMLVideoElement) => {
    if (video.poster) return;
    const candidates = (video.dataset.posterSrcset ?? '').split(',').map((entry) => {
      const [url, width] = entry.trim().split(/\s+/);
      return { url, width: parseInt(width ?? '', 10) || Infinity };
    }).filter((c) => c.url).sort((a, b) => a.width - b.width);
    if (candidates.length === 0) return;
    const needed = (video.clientWidth || window.innerWidth) * Math.min(window.devicePixelRatio || 1, 2);
    video.poster = (candidates.find((c) => c.width >= needed) ?? candidates[candidates.length - 1]).url;
  };
  if (!('IntersectionObserver' in window)) {
    videos.forEach(setPoster);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      setPoster(entry.target as HTMLVideoElement);
      io.unobserve(entry.target);
    }
  }, { rootMargin: '600px 0px' });
  videos.forEach((video) => io.observe(video));
}
