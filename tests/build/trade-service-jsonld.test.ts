import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const trades = ['roofing', 'landscaping', 'hvac', 'construction', 'home-services', 'outdoor-living'];

describe('built trade Service JSON-LD', () => {
  for (const trade of trades) {
    it(`describes ${trade} with the correct scope`, () => {
      const html = readFileSync(new URL(`../../dist/for/${trade}/index.html`, import.meta.url), 'utf8');
      const blocks = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
        .map((match) => JSON.parse(match[1]));
      const services = blocks.filter((block) => block['@type'] === 'Service');
      expect(services).toHaveLength(1);
      const service = services[0];
      const audience = trade === 'hvac' ? 'HVAC' : trade.replace(/-/g, ' ');
      expect(service).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `Website design for ${audience} contractors`,
        serviceType: 'Website design',
        audience: { '@type': 'BusinessAudience', name: `${audience} contractors` },
        ...(['roofing', 'landscaping', 'hvac'].includes(trade) && {
          areaServed: { '@type': 'City', name: 'Atlanta', containedInPlace: { '@type': 'State', name: 'Georgia' } },
        }),
        provider: { '@type': 'ProfessionalService', name: 'M3MM', url: 'https://m3mm.net/' },
        url: `https://m3mm.net/for/${trade}/`,
      });
      for (const key of ['aggregateRating', 'review', 'offers']) expect(service).not.toHaveProperty(key);
    });
  }
});
