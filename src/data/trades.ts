// intent values are analytics keys: keep them stable (home-services was shipped as 'home-service').
export const trades = [
  { slug: 'construction', label: 'Construction companies', href: '/for/construction', intent: 'product:construction-websites' },
  { slug: 'hvac', label: 'HVAC contractors', href: '/for/hvac', intent: 'product:hvac-websites' },
  { slug: 'home-services', label: 'Home-service pros', href: '/for/home-services', intent: 'product:home-service-websites' },
  { slug: 'landscaping', label: 'Landscaping contractors', href: '/for/landscaping', intent: 'product:landscaping-websites' },
  { slug: 'outdoor-living', label: 'Outdoor-living companies', href: '/for/outdoor-living', intent: 'product:outdoor-living-websites' },
  { slug: 'roofing', label: 'Roofing contractors', href: '/for/roofing', intent: 'product:roofing-websites' },
] as const;
