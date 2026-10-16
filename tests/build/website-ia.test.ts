import { describe, expect, it } from 'vitest';
import { PRIMARY_NAVIGATION, navigationIsCurrent } from '../../src/config/site-navigation';
import { DROPS } from '../../src/config/roadmap';
import { projectSlug } from '../../src/lib/project-slugs';
import { ENVIRONMENT_AREAS, INFRASTRUCTURE_MILESTONES, INFRASTRUCTURE_PHASES } from '../../src/config/environment';

describe('M3MM information architecture', () => {
  it('keeps six clear primary destinations without losing legacy active-route grouping', () => {
    expect(PRIMARY_NAVIGATION.map(item => item.label)).toEqual(['Home', 'Projects', 'Environment', 'Roadmaps', 'Business', 'About']);
    expect(navigationIsCurrent('/roadmap', '/roadmaps')).toBe(true);
    expect(navigationIsCurrent('/roadmaps/environment', '/roadmaps')).toBe(true);
    expect(navigationIsCurrent('/investors/', '/business')).toBe(true);
    expect(navigationIsCurrent('/projects/example', '/projects')).toBe(true);
    expect(navigationIsCurrent('/roadmaps/environment', '/projects')).toBe(false);
  });

  it('creates one unique detail URL per published project without promoting previews', () => {
    const slugs = DROPS.map(drop => projectSlug(drop.name));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every(Boolean)).toBe(true);
    expect(DROPS.some(drop => drop.status === 'testing')).toBe(true);
  });

  it('maintains an independent, deliberately unverified infrastructure plan', () => {
    const phases = new Set(INFRASTRUCTURE_PHASES.map(phase => phase.id));
    expect(INFRASTRUCTURE_MILESTONES.length).toBeGreaterThan(5);
    expect(new Set(INFRASTRUCTURE_MILESTONES.map(item => item.id)).size).toBe(INFRASTRUCTURE_MILESTONES.length);
    expect(INFRASTRUCTURE_MILESTONES.every(item => phases.has(item.phase))).toBe(true);
    expect(INFRASTRUCTURE_MILESTONES.every(item => item.status === 'planned' || item.status === 'verify')).toBe(true);
    expect(new Set(ENVIRONMENT_AREAS.map(area => area.slug)).size).toBe(ENVIRONMENT_AREAS.length);
  });
});
