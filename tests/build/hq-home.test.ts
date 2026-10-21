import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DROPS, LAUNCH_STATS } from '../../src/config/roadmap';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path, 'utf8');

describe('m3mm.net is the umbrella hub', () => {
  const home = read('src/pages/index.astro');
  const websites = read('src/pages/websites.astro');

  it('keeps addressable work and roadmap sections while moving the full directory off Home',()=>{expect(home).toContain('id="released"');expect(home).toContain('id="roadmap"');expect(home).toContain('<RedesignProjectSelection/>');expect(home).toContain('href="/projects"');expect(home).toContain('href="/roadmap"');expect(home).toContain('href="/roadmaps/infrastructure"');expect(home).not.toContain('<RoadmapStage');});
  it('keeps one authoritative public release registry for the directory and roadmap',()=>{expect(read('src/config/public-projects.ts')).toContain('PUBLIC_PROJECTS=DROPS.map');expect(read('src/pages/projects/index.astro')).toContain('PUBLIC_PROJECTS.map');expect(DROPS).toHaveLength(21);expect(LAUNCH_STATS.released).toBe(1);expect(LAUNCH_STATS.next).toBe(1);expect(LAUNCH_STATS.testing).toBe(4);});

  it('pins the public launch truth Michael chose', () => {
    expect(DROPS.filter((drop) => drop.status === 'released').map((drop) => drop.name)).toEqual(['M3MM Hub']);
    expect(DROPS.find((drop) => drop.status === 'next')?.name).toBe('AriesOutdoorLiving');
    expect(DROPS.filter((drop) => drop.status === 'testing').map((drop) => drop.name)).toEqual([
      'M3MM Websites',
      "Michael's Resume + Career Site",
      'SiteGuide',
      'AIMA — AI Manual Assistant',
    ]);

    const big7 = DROPS.find((drop) => drop.name === 'Big7 Construction');
    expect(big7?.status).toBe('upcoming');
    expect(big7?.quarter).toMatch(/Long-term.*jobsite photography/i);
    expect(big7?.url).toBeUndefined();
  });

  it('does not relabel test deployments as live or released on other public surfaces', () => {
    const publicTruth = [
      'src/components/Hero.astro',
      'src/components/CaseStudy.astro',
      'src/content/caseStudies/aries.md',
      'src/content/caseStudies/big7.md',
      'src/data/resume.json',
      'functions/api/lead.ts',
      'src/pages/audit.astro',
      'src/pages/resume.astro',
      'src/pages/thanks.astro',
      'src/pages/for/construction.astro',
      'src/pages/for/home-services.astro',
      'src/pages/for/outdoor-living.astro',
    ].map(read).join('\n');

    for (const staleClaim of [
      'Build + Repair lanes live',
      'Live client website',
      'Live SaaS storefront',
      'Live RAG SaaS',
      'Selected Live Work',
      'Visit the live site',
      'first quote request 3 days after launch',
    ]) {
      expect(publicTruth, `stale release claim: ${staleClaim}`).not.toContain(staleClaim);
    }
  });

  it('keeps the complete website-sales floor intact at /websites', () => {
    for (const component of ['Hero', 'TwoDoor', 'Proof', 'Services', 'Faq', 'Intake']) {
      expect(websites).toContain(`<${component} />`);
    }
    expect(websites).toMatch(/<Layout[\s\S]*?path="\/websites"/);
  });

  it('redirects the retired /hub route to the new homepage', () => {
    expect(read('public/_redirects')).toMatch(/^\/hub\s+\/\s+301$/m);
    expect(read('public/sitemap.xml')).not.toContain('https://m3mm.net/hub');
    expect(read('public/sitemap.xml')).toContain('https://m3mm.net/websites');
  });
});
