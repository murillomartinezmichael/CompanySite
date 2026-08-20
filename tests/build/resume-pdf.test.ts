/**
 * The resume PDF — the artifact recruiters actually keep.
 *
 * `npm run build` runs `npm run resume:pdf` BEFORE `astro build`, because
 * Astro copies `public/` into `dist/` and a PDF written after that copy
 * never ships. A silent failure here means the "Download PDF" button 404s
 * or hands a recruiter a zero-byte file — the page would still look perfect.
 *
 * Ported from the standalone ResumeSite Worker per ADR 0001. The dist/
 * assertions follow this suite's existing convention (see
 * shipped-source-hygiene / start-checkout): skip when no build is present,
 * so a bare `vitest run` is green while CI — which builds first — really
 * exercises them.
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DIST = join(ROOT, 'dist');
const PUBLIC_PDF = join(ROOT, 'public/resume.pdf');
const DIST_PDF = join(DIST, 'resume.pdf');
const VENDORED = join(ROOT, 'assets/resume/source.pdf');
const EXPECTED_RESUME_SHA256 = 'f71d89ceaea7e488a2d4ad700a2d402067c284f6cfd79fdb1214af53ec6ab1ee';

/** A resume PDF smaller than this is a rendering failure, not a short resume. */
const MIN_BYTES = 50_000;

const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');

describe('resume.pdf builds', () => {
  it('the generator runs clean and writes public/resume.pdf', () => {
    // Runs the real build step, not a re-implementation of it. Non-zero exit
    // (the vendored-source guard, malformed resume.json, a missing renderer)
    // fails here loudly instead of shipping a broken download.
    const before = existsSync(PUBLIC_PDF) ? sha256(PUBLIC_PDF) : null;
    const output = execFileSync(process.execPath, ['scripts/generate-resume-pdf.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    expect(output).toMatch(/resume\.pdf/);
    expect(existsSync(PUBLIC_PDF), 'generator did not write public/resume.pdf').toBe(true);
    // Generation is byte-reproducible on purpose (vendored copy, or a fixed
    // PDF CreationDate/ModDate in the fallback) so a rebuild never churns
    // the deployed bytes.
    if (before) expect(sha256(PUBLIC_PDF), 'PDF generation is no longer byte-reproducible').toBe(before);
  });

  it('serves the vendored master verbatim, not a re-render of it', () => {
    // The vendored file IS Mike's real document. If public/resume.pdf ever
    // diverges from it, the site is handing out a generated approximation
    // of a résumé that is on live job applications.
    expect(existsSync(VENDORED), 'vendored résumé master is missing').toBe(true);
    expect(sha256(VENDORED), 'vendored master is not Michael\'s approved résumé').toBe(EXPECTED_RESUME_SHA256);
    expect(sha256(PUBLIC_PDF), 'shipped PDF differs from the vendored master').toBe(sha256(VENDORED));
  });

  it('is a structurally valid, non-trivially sized PDF', () => {
    const bytes = readFileSync(PUBLIC_PDF);
    expect(bytes.subarray(0, 5).toString('latin1'), 'not a PDF').toBe('%PDF-');
    expect(bytes.subarray(-1024).toString('latin1'), 'PDF has no %%EOF trailer').toContain('%%EOF');
    expect(bytes.subarray(-2048).toString('latin1'), 'PDF has no xref offset').toContain('startxref');
    expect(bytes.length, `resume.pdf is only ${bytes.length} bytes`).toBeGreaterThan(MIN_BYTES);
  });

  it('the build wires PDF generation ahead of astro build', () => {
    // The ordering bug this guards: PDF generated after `astro build` copies
    // `public/`, so dist/resume.pdf is stale or absent. Pin the order in the
    // build script itself, since Cloudflare Pages only ever runs that.
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    const build: string = pkg.scripts.build;
    expect(build, 'build script no longer generates the résumé PDF').toContain('resume:pdf');
    expect(
      build.indexOf('resume:pdf') < build.indexOf('astro build'),
      'résumé PDF generation must run BEFORE astro build, or it never reaches dist/',
    ).toBe(true);
  });

  it('is copied into dist/ byte-identically when a build is present', () => {
    if (!existsSync(DIST)) return;
    expect(existsSync(DIST_PDF), 'dist/resume.pdf missing — the download link 404s').toBe(true);
    expect(sha256(DIST_PDF), 'dist/resume.pdf differs from public/resume.pdf').toBe(sha256(PUBLIC_PDF));
  });

  it('the built /resume page links the PDF as a download', () => {
    if (!existsSync(DIST)) return;
    const html = readFileSync(join(DIST, 'resume/index.html'), 'utf8');
    const anchors = html.match(/<a\b[^>]*href="\/resume\.pdf"[^>]*>/gi) ?? [];
    const downloads = anchors.filter((a) => /\bdownload\b/i.test(a));
    expect(downloads.length, 'no download link to /resume.pdf on the built résumé page').toBeGreaterThan(0);
  });

  it('the built /resume page renders the hub chrome, not a ported second design', () => {
    if (!existsSync(DIST)) return;
    const html = readFileSync(join(DIST, 'resume/index.html'), 'utf8');
    // Hub Header brand mark + hub Footer tagline: proves the page mounts the
    // company chrome rather than importing the old standalone site's own.
    expect(html, 'hub Header brand mark missing').toContain('/mark-light.png');
    expect(html, 'hub Footer missing').toMatch(/Modernize\. Mobilize\. Multiply\./);
    expect(html, 'canonical is not the hub URL').toContain('href="https://m3mm.net/resume"');
    // The retired accent token from the standalone site must not survive the
    // port — a stray `text-signal` renders as an unstyled class on the hub.
    expect(html, 'stale `signal` accent classes ported from the old site').not.toMatch(/\b(?:text|bg|border)-signal\b/);
  });

  it('the résumé record and the page agree on the headline facts', () => {
    if (!existsSync(DIST)) return;
    const resume = JSON.parse(readFileSync(join(ROOT, 'src/data/resume.json'), 'utf8'));
    // Astro escapes `&` to `&#38;` in text nodes ("Founder & Product
    // Engineer"), so compare against decoded text — otherwise this fence
    // fails on markup rather than on a real content drift.
    const decode = (s: string) =>
      s
        .replace(/&#38;|&amp;/g, '&')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    const html = decode(readFileSync(join(DIST, 'resume/index.html'), 'utf8'));
    // Faithfulness fence: this is a real résumé on live job applications, so
    // the rendered page must carry the record's own strings, not a retyped
    // paraphrase that could drift from the PDF.
    expect(html).toContain(resume.name);
    for (const job of resume.experience) {
      expect(html, `experience entry missing: ${job.company}`).toContain(job.company);
      expect(html, `role missing for ${job.company}`).toContain(job.role);
      expect(html, `dates missing for ${job.company}`).toContain(job.start);
    }
    for (const ed of resume.education) {
      expect(html, `education entry missing: ${ed.school}`).toContain(ed.school);
    }
  });
});
