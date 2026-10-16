/** Public information architecture. Keep the visible header short. */
export interface NavigationItem {
  href: string;
  label: string;
  key: string;
}
export const PRIMARY_NAVIGATION: NavigationItem[] = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/projects', label: 'Projects', key: 'projects' },
  { href: '/environment', label: 'Environment', key: 'environment' },
  { href: '/roadmaps', label: 'Roadmaps', key: 'roadmaps' },
  { href: '/business', label: 'Business', key: 'business' },
  { href: '/about', label: 'About', key: 'about' },
];

/** Legacy/public routes stay reachable, and their parent navigation stays active. */
export function navigationIsCurrent(path: string, href: string): boolean {
  const normalized = (path.split('?')[0].replace(/\/+$/, '') || '/');
  if (href === '/') return normalized === '/';
  if (href === '/roadmaps') return normalized === '/roadmap' || normalized.startsWith('/roadmaps');
  if (href === '/business') return normalized.startsWith('/business') || normalized.startsWith('/investors') || normalized === '/websites';
  if (href === '/about') return normalized.startsWith('/about') || normalized === '/resume' || normalized === '/policies' || normalized === '/accessibility';
  return normalized === href || normalized.startsWith(href + '/');
}
