#!/usr/bin/env node
// Produces public/resume.pdf. Two modes:
//   1. Vendored (default): if assets/resume/source.pdf exists, it IS the
//      resume — Mike's real document gets copied verbatim to public/ and
//      output/pdf/. The site serves his exact resume, not a rendering of it.
//   2. Generated (fallback): no vendored file → render from
//      src/data/resume.json with pdfkit. The JSON still drives the /resume
//      HTML page in both modes — keep it in sync with the vendored PDF.
//
// Runs BEFORE `astro build` (see the `build` script in package.json). Astro
// copies public/ into dist/, so a PDF written after that copy never ships.
//
// Ported from the standalone ResumeSite Worker per ADR 0001. One deliberate
// change: `pdfkit` is imported lazily inside the fallback branch instead of
// at module top level. The vendored path — the only one that runs today —
// needs no third-party module at all, so the hub does not take on a build
// dependency it never executes. If the vendored master is ever removed, the
// fallback asks for the dependency by name instead of failing cryptically.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const resume = JSON.parse(fs.readFileSync(path.join(root, 'src/data/resume.json'), 'utf-8'));
const outPath = path.join(root, 'public/resume.pdf');
const artifactDir = path.join(root, 'output/pdf');
const artifactPath = path.join(artifactDir, 'michael-murillo-martinez-resume.pdf');
const vendoredPath = path.join(root, 'assets/resume/source.pdf');

if (fs.existsSync(vendoredPath)) {
  const bytes = fs.readFileSync(vendoredPath);
  if (bytes.length < 10_000 || !bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    console.error(`vendored resume at ${vendoredPath} is not a plausible PDF (${bytes.length} bytes) — aborting build`);
    process.exit(1);
  }
  fs.writeFileSync(outPath, bytes);
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(artifactPath, bytes);
  console.log(`resume.pdf: vendored copy (${bytes.length} bytes) → public/ + output/pdf/`);
  process.exit(0);
}

let PDFDocument;
try {
  ({ default: PDFDocument } = await import('pdfkit'));
} catch {
  console.error(
    'resume.pdf: no vendored master at assets/resume/source.pdf and `pdfkit` is not installed.\n' +
      'Restore the vendored PDF (preferred — it is the real document) or run `npm i -D pdfkit` to render from src/data/resume.json.',
  );
  process.exit(1);
}

const INK = '#111318';
const MUTED = '#343B49';
const ACCENT = '#1557A0';
const pdfText = (value) => String(value).replace(/[–—]/g, '-').replace(/→/g, 'to');

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 48, bottom: 48, left: 52, right: 52 },
  info: {
    Title: `${resume.name} — Resume`,
    Author: resume.name,
    Subject: resume.title,
    CreationDate: new Date('2026-07-19T00:00:00Z'),
    ModDate: new Date('2026-07-19T00:00:00Z'),
  },
});
const outputStream = fs.createWriteStream(outPath);
doc.pipe(outputStream);

doc.fillColor(INK).font('Helvetica-Bold').fontSize(22).text(pdfText(resume.name));
doc.fillColor(MUTED).font('Helvetica').fontSize(11).text(pdfText(`${resume.title} · ${resume.location}`));
doc.fillColor(ACCENT).fontSize(9.5).text(resume.email, {
  continued: true,
  link: `mailto:${resume.email}`,
  underline: true,
});
doc.text('  ·  ', { continued: true, underline: false });
doc.text('LinkedIn', { continued: true, link: `https://${resume.linkedin}`, underline: true });
doc.text('  ·  ', { continued: true, underline: false });
doc.text('GitHub', { link: `https://${resume.github}`, underline: true });
doc.moveDown(0.8);

doc.fillColor(INK).font('Helvetica').fontSize(10.5).text(pdfText(resume.summary), { lineGap: 2 });
doc.moveDown(0.7);

function sectionHeading(text) {
  doc.moveDown(0.25);
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(13).text(text.toUpperCase(), { characterSpacing: 0.5 });
  const y = doc.y + 2;
  doc.moveTo(54, y).lineTo(doc.page.width - 54, y).strokeColor('#D8DCE4').lineWidth(1).stroke();
  doc.moveDown(0.45);
}

sectionHeading('Experience');
for (const job of resume.experience) {
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(11).text(pdfText(`${job.role} - ${job.company}`), { continued: false });
  doc.fillColor(MUTED).font('Helvetica').fontSize(9.5).text(pdfText(`${job.location}  ·  ${job.start} - ${job.end}`));
  doc.moveDown(0.2);
  for (const bullet of job.bullets) {
    doc.fillColor(INK).font('Helvetica').fontSize(9.25).text(`•  ${pdfText(bullet)}`, { indent: 8, lineGap: 1.25 });
  }
  doc.moveDown(0.45);
}

doc.addPage();
sectionHeading('Selected Live Work');
for (const work of resume.liveWork) {
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(10).text(pdfText(`${work.name} - ${work.label}`), { continued: false });
  doc.fillColor(ACCENT).font('Helvetica').fontSize(8.75).text(work.url, { link: work.url, underline: true });
  doc.fillColor(INK).font('Helvetica').fontSize(9.25).text(pdfText(work.detail), { lineGap: 1 });
  doc.moveDown(0.25);
}

sectionHeading('Education');
for (const ed of resume.education) {
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(11).text(pdfText(ed.school));
  doc.fillColor(MUTED).font('Helvetica').fontSize(9.5).text(pdfText(`${ed.degree} · ${ed.detail}`));
  doc.moveDown(0.4);
}

sectionHeading('Skills');
const skillLines = [
  ['Production', resume.skills.production],
  ['Working', resume.skills.working],
  ['Learning', resume.skills.learning],
];
for (const [label, items] of skillLines) {
  doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(9.5).text(`${label}: `, { continued: true });
  doc.fillColor(INK).font('Helvetica').fontSize(9.5).text(pdfText(items.join(', ')));
  doc.moveDown(0.3);
}

sectionHeading('Community & Leadership');
for (const c of resume.community) {
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(11).text(pdfText(c.org));
  doc.fillColor(MUTED).font('Helvetica').fontSize(9.5).text(pdfText(`${c.role} · ${c.detail}`));
  doc.moveDown(0.2);
  for (const bullet of c.bullets) {
    doc.fillColor(INK).font('Helvetica').fontSize(9.5).text(`•  ${pdfText(bullet)}`, { indent: 8, lineGap: 1.5 });
  }
}

sectionHeading('Awards & Credentials');
for (const credential of resume.credentials) {
  doc.fillColor(INK).font('Helvetica').fontSize(9.5).text(`•  ${pdfText(credential)}`, { indent: 8, lineGap: 1.25 });
}

doc.end();

outputStream.on('finish', () => {
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.copyFileSync(outPath, artifactPath);
  console.log(`[resume:pdf] wrote ${outPath}`);
  console.log(`[resume:pdf] copied ${artifactPath}`);
});
