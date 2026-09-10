/** Decorative, deterministic light field. No external assets or render library. */
type Point = { x: number; y: number; z: number; size: number; tone: number; alpha: number };
export function createOrbitalField(host: HTMLElement) {
  const canvas = host.querySelector<HTMLCanvasElement>('[data-orbit-canvas]');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!canvas || !ctx) return { sync: (_enabled: boolean, _visible: boolean) => {} };
  const surface = canvas;
  const context = ctx;
  const style = getComputedStyle(host);
  const colors = ['--orbit-blue', '--orbit-lime', '--orbit-white'].map(key => style.getPropertyValue(key).trim());
  const rgba = (color: string, alpha: number) => {
    const rgb = color.replace('#', '').match(/.{2}/g)?.map(v => parseInt(v, 16));
    return rgb?.length === 3 ? `rgba(${rgb.join(',')},${alpha})` : color;
  };
  let seed = 84;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const compact = matchMedia('(max-width: 640px)').matches;
  const stars: Point[] = Array.from({ length: compact ? 680 : 1500 }, (_, i) => {
    const r = .07 + Math.pow(random(), .7) * .99;
    const angle = i % 3 * Math.PI * 2 / 3 + r * 5.4 + (random() - .5) * .62;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, z: (random() - .5) * (.12 + r * .18),
      size: .3 + Math.pow(random(), 4) * 1.5, tone: i % 17 === 0 ? 1 : i % 6 === 0 ? 2 : 0, alpha: .25 + random() * .65 };
  });
  const ribbons = Array.from({ length: compact ? 33 : 57 }, (_, i) => Array.from({ length: 110 }, (_, n) => {
    const r = .07 + n / 110;
    const a = i % 3 * Math.PI * 2 / 3 + r * 5.4 + (i / 57 - .5) * .65;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: Math.sin(a * 2 + i * .15) * .08 };
  }));
  let width = 0, height = 0, time = 0, last = 0, frame = 0;
  let enabled = false, visible = false, running = false;
  let pointerX = 0, pointerY = 0, easedX = 0, easedY = 0;
  function draw() {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    const scale = Math.min(width, height) * .415;
    const angle = time * .045 + easedX * .09;
    const tilt = .70 + easedY * .08;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const project = (point: { x: number; y: number; z: number }) => {
      const x = point.x * cos - point.y * sin;
      const y = point.x * sin + point.y * cos;
      return { x: width / 2 + x * scale, y: height / 2 + (y * tilt + point.z) * scale,
        depth: 1 + y * .18 };
    };
    const bloom = context.createRadialGradient(width * .5, height * .5, 0, width * .5, height * .5, scale);
    bloom.addColorStop(0, rgba(colors[2], .2));
    bloom.addColorStop(.12, rgba(colors[0], .14));
    bloom.addColorStop(.56, rgba(colors[0], .035));
    bloom.addColorStop(1, rgba(colors[0], 0));
    context.fillStyle = bloom;
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';
    ribbons.forEach((ribbon, i) => {
      context.beginPath();
      ribbon.forEach((point, n) => { const p = project(point); n ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y); });
      context.strokeStyle = colors[i % 13 === 0 ? 1 : 0];
      context.globalAlpha = .045 + Math.sin(time * .3 + i * .4) * .015;
      context.lineWidth = i % 13 === 0 ? 1 : .65;
      context.stroke();
    });
    for (const star of stars) {
      const p = project(star);
      context.globalAlpha = star.alpha * (.8 + Math.sin(time * .5 + star.x * 9) * .2);
      context.fillStyle = colors[star.tone];
      context.beginPath();
      context.arc(p.x, p.y, star.size * p.depth, 0, Math.PI * 2);
      context.fill();
    }
    // A few soft moving highlights illuminate the three streams without flashing.
    for (let arm = 0; arm < 3; arm++) {
      const r = .28 + (Math.sin(time * .13 + arm * 2) + 1) * .28;
      const a = arm * Math.PI * 2 / 3 + r * 5.4;
      const p = project({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: 0 });
      const light = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, 25);
      light.addColorStop(0, rgba(colors[arm === 1 ? 1 : 0], .18));
      light.addColorStop(1, rgba(colors[0], 0));
      context.globalAlpha = 1;
      context.fillStyle = light;
      context.fillRect(p.x - 25, p.y - 25, 50, 50);
    }
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
    host.dataset.rendered = 'true';
  }
  function tick(now: number) {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    if (last && now - last < 1000 / 30) return;
    const delta = last ? Math.min((now - last) / 1000, .1) : 0;
    last = now;
    time += delta;
    easedX += (pointerX - easedX) * .04;
    easedY += (pointerY - easedY) * .04;
    draw();
  }
  function reconcile() {
    const next = enabled && visible && !document.hidden;
    if (next === running) return;
    running = next;
    host.dataset.animationState = running ? 'running' : 'paused';
    if (running) { last = 0; frame = requestAnimationFrame(tick); }
    else { cancelAnimationFrame(frame); frame = 0; }
  }
  new ResizeObserver(() => {
    const bounds = host.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    surface.width = Math.round(width * ratio); surface.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }).observe(host);
  if (matchMedia('(pointer: fine)').matches) {
    host.addEventListener('pointermove', event => {
      if (!running) return;
      const bounds = host.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - .5;
      pointerY = (event.clientY - bounds.top) / bounds.height - .5;
    }, { passive: true });
    host.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  }
  document.addEventListener('visibilitychange', reconcile);
  host.dataset.animationState = 'paused';
  return { sync(nextEnabled: boolean, nextVisible: boolean) { enabled = nextEnabled; visible = nextVisible; reconcile(); } };
}
