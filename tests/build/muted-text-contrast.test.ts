import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

// WCAG 1.4.3 AA — body copy needs 4.5:1. The intake step numbers shipped
// dimmed to 60% alpha (3.51:1). This pins the measured pair so the ratio
// cannot be walked back by a later "that looks too bright" edit.
//
// The sibling `--ink-mute` fix (roadmap/hub cards, 2.37:1 -> 5.67:1) is
// tested on the feat/roadmap-hub branch, where those pages live — this
// branch (money-path/checkout-fence) does not ship roadmap.astro or
// hub.astro.

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

describe('muted greys clear the AA body-copy floor', () => {
  it('the contrast maths agrees with the rendered measurement', () => {
    // Sanity check on the helper itself, against the pair measured in Chrome.
    expect(contrast('#387986', '#161A24')).toBeCloseTo(3.518, 2);
    expect(contrast('#4FB8C7', '#161A24')).toBeCloseTo(7.465, 2);
  });

  it('the intake step numbers are not dimmed below the floor', () => {
    // `text-clay/60` composites to #387986 on #161A24 = 3.51:1. Full-strength
    // clay is 7.47:1.
    expect(read('src/components/Intake.astro')).not.toMatch(/text-clay\/\d+ mono/);
  });
});
