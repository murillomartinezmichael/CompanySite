import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../investor-preview/build.mjs';
import { projects } from '../investor-preview/portfolio.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'investor-preview/dist');
const target = path.join(root, 'dist/investors');
const media = path.join(root, 'investor-preview/media');
const required = projects.flatMap(p => [`${p.slug}.mp4`, `${p.slug}.jpg`]);
for (const file of required) {
  if (!fs.existsSync(path.join(media, file)) || fs.statSync(path.join(media, file)).size === 0)
    throw new Error(`Missing approved investor media input: ${file}`);
}
// Fail closed if a fresh checkout is missing approved demo/narration inputs.
for (const file of fs.readdirSync(path.join(source, 'assets'))) {
  if (file.endsWith('.mp4') && fs.statSync(path.join(source, 'assets', file)).size > 25 * 1024 * 1024)
    throw new Error(`Investor media exceeds hosting file limit: ${file}`);
}
const demos = JSON.parse(fs.readFileSync(path.join(root, 'investor-preview/demo-manifest.json'), 'utf8'));
for (const demo of Object.values(demos)) {
  for (const field of ['video', 'poster', 'captions']) {
    const relative = demo[field].replace(/^\.\//, '').replace(/^\//, '');
    const input = path.join(root, 'investor-preview/media', relative.replace(/^assets\//, ''));
    if (!fs.existsSync(input)) throw new Error(`Missing approved investor media input: ${relative}`);
  }
}
// Avoid retaining obsolete pitch files from an earlier local build.
fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
fs.copyFileSync(path.join(root, 'investor-preview/site-theme.js'), path.join(target, 'site-theme.js'));
for (const route of ['', 'accessibility/']) {
  const file = path.join(target, route, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace('<head>', '<head><script src="/investors/site-theme.js"></script>');
  html = html.replace(/<nav aria-label="Primary">/, '<nav aria-label="Investor sections">');
  html = html.replace(/<header class="wrap">[\s\S]*?<\/header>/, original => {
    const sections = original.match(/<nav[\s\S]*?<\/nav>/)[0];
    return `<header class="wrap company-header"><a class="brand" href="/" data-cta="investor-back-home" aria-label="Back to M3MM home"><img src="/official-logo.png" alt="" width="48" height="48"><span><strong>M3MM</strong><br>Modernize. Mobilize. Multiply.</span></a><button type="button" data-theme-toggle data-cta="investor-theme" hidden>Switch theme</button><nav class="company-tabs" aria-label="Primary"><a href="/" data-cta="investor-home">← Home</a><a href="/websites" data-cta="investor-websites">Websites</a><a href="/roadmap" data-cta="investor-roadmap">Roadmap</a><a href="/investors/" data-cta="investor-current" aria-current="page">Investors</a><a href="/resume" data-cta="investor-resume">Resume</a></nav></header><div class="wrap investor-section-nav">${sections}</div>`;
  });
  html = html.replace('</head>', `<link rel="canonical" href="https://m3mm.net/investors/${route}"></head>`)
    .replace(/<a class="brand" href="[^"]*"/, '<a class="brand" href="/"')
    .replace('Local review candidate. Publication and investment terms require owner approval.', 'Funding discussion only. No investment terms or returns are offered on this page.');
  fs.writeFileSync(file, html);
}
console.log('Built /investors/ with portfolio and updated phased investment vision; old narrated pitch excluded.');
