type Trade = 'roofing' | 'landscaping' | 'hvac' | 'construction' | 'home-services' | 'outdoor-living';

export function tradeServiceJsonLd(trade: Trade): Record<string, unknown> {
  const audience = trade === 'hvac' ? 'HVAC' : trade.replace(/-/g, ' ');
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Website design for ${audience} contractors`,
    serviceType: 'Website design',
    audience: { '@type': 'BusinessAudience', name: `${audience} contractors` },
    areaServed: {
      '@type': 'City',
      name: 'Atlanta',
      containedInPlace: { '@type': 'State', name: 'Georgia' },
    },
    provider: { '@type': 'ProfessionalService', name: 'M3MM', url: 'https://m3mm.net/' },
    url: `https://m3mm.net/for/${trade}/`,
  };
}
