import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

// WCAG 1.4.3 AA — body copy needs 4.5:1. Three surfaces shipped below it:
// the muted greys on /roadmap and the M3MM homepage (2.37:1 on the card, 2.62:1 on
// the page ground) and the intake step numbers, which were dimmed to 60%
// alpha (3.51:1). This pins the measured pairs so the ratios cannot be
// walked back by a later "that looks too bright" edit.

const srgb = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const luminance = (hex: string) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
};
const contrast = (fg: string, bg: string) => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};

const AA_BODY = 4.5;

// Every background `--ink-mute` text renders against: the card fill and the
// page ground.
const BACKGROUNDS = ['#191922', '#0D0E14'];

const mutedOf = (file: string, variable: string) => {
  const m = read(file).match(new RegExp(`--${variable}:\\s*(#[0-9a-fA-F]{6})`));
  expect(m, `${file} no longer declares --${variable}`).toBeTruthy();
  return m![1];
};

describe('muted greys clear the AA body-copy floor', () => {
  it('the contrast maths agrees with the rendered measurement', () => {
    // Sanity check on the helper itself, against pairs measured in Chrome.
    expect(contrast('#55555f', '#191922')).toBeCloseTo(2.37, 2);
    expect(contrast('#8a8a99', '#0D0E14')).toBeCloseTo(5.67, 2);
    expect(contrast('#4FB8C7', '#161A24')).toBeCloseTo(7.47, 2);
  });

  for (const { file, variable } of [
    { file: 'src/pages/roadmap.astro', variable: 'ink-mute' },
    { file: 'src/pages/index.astro', variable: 'hq-muted' },
  ]) {
    it(`${file} --${variable} clears 4.5:1 on every background it renders on`, () => {
      const fg = mutedOf(file, variable);
      for (const bg of BACKGROUNDS) {
        expect(contrast(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(AA_BODY);
      }
    });
  }

  it('the intake step numbers are not dimmed below the floor', () => {
    // `text-clay/60` composites to #387986 on #161A24 = 3.51:1. Full-strength
    // clay is 7.47:1.
    expect(read('src/components/Intake.astro')).not.toMatch(/text-clay\/\d+ mono/);
  });
});
