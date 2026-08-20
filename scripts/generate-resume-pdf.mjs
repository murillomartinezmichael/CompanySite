#!/usr/bin/env node
// Produces the downloadable resume from the same structured data that drives
// the HTML resume. Keeping one source of truth prevents the PDF from drifting
// away from the public release status shown on m3mm.net.
//
// Runs BEFORE `astro build` (see the `build` script in package.json). Astro
// copies public/ into dist/, so a PDF written after that copy never ships.
//
// A byte-identical copy is also kept in assets/resume/source.pdf as the
// repository master and in output/pdf/ as the reviewed artifact.
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

const { default: PDFDocument } = await import('pdfkit');

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
sectionHeading('Selected Deployed Work');
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
  fs.mkdirSync(path.dirname(vendoredPath), { recursive: true });
  fs.copyFileSync(outPath, artifactPath);
  fs.copyFileSync(outPath, vendoredPath);
  console.log(`[resume:pdf] wrote ${outPath}`);
  console.log(`[resume:pdf] copied ${artifactPath}`);
  console.log(`[resume:pdf] updated ${vendoredPath}`);
});
