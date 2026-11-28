import { globSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { BASIC_SITE, HOSTING_PLAN } from '../../src/config/offers';
import { contactEmail } from '../../src/config/contact';
import { PUBLIC_PROJECTS, statusLabel } from '../../src/config/public-projects';
import { CATALOG } from '../../src/lib/prefill';

const page = (route: string) => readFileSync(`dist/${route}index.html`, 'utf8');
const price = `$${BASIC_SITE.priceUsd}`;
const deposit = `$${BASIC_SITE.depositUsd}`;
const percent = `${BASIC_SITE.depositPercent}%`;

it('publishes the configured basic price in discovery, comparison, and intake prefill', () => {
  expect(page('services/')).toContain(`Basic sites from ${price}.`);
  const comparison = page('compare/website-options/');
  expect(comparison).toContain(`Basic site or cleanup: ${price}.`);
  expect(comparison).toContain(`work starts after ${percent} down.`);
  const websites = page('websites/');
  for (const copy of [
    `Custom site, one engineer, from ${price}`, `${price} for simple`,
    `Budget under ${price}?`, `What can I get for ${price}?`,
    `What if my budget is under ${price}?`, `Start with ${deposit} down`,
    `optional $${HOSTING_PLAN.monthlyUsd}/month hosting + help plan`,
  ]) expect(websites).toContain(copy);
  expect(CATALOG['tier:website:starter'].from).toBe(price);
});

it('matches the basic offer in structured data to its checkout price', () => {
  const schemas = [...page('').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1]));
  const catalog = schemas.find(schema => schema.hasOfferCatalog).hasOfferCatalog;
  const basic = catalog.itemListElement.find((offer: {name: string}) => offer.name === 'Basic site or cleanup');
  expect(basic.priceSpecification).toMatchObject({
    price: BASIC_SITE.priceUsd, minPrice: BASIC_SITE.priceUsd, priceCurrency: 'USD',
  });
});

it('carries the checkout terms from metadata through the receipt', () => {
  const start = page('start/');
  for (const copy of [
    `Start your ${price} business site`, `with a ${deposit} non-refundable down payment`,
    `${price} site</span></span> with ${deposit} down`, `The ${deposit} down payment is non-refundable`,
    `${percent} down`, `Hosting + help, $${HOSTING_PLAN.monthlyUsd}/month`,
  ]) expect(start).toContain(copy);
  if (start.includes('data-cta="start-pay-deposit"')) {
    for (const copy of [`Pay the ${percent} down payment`, `Pay ${deposit} securely`, `Your ${deposit} down payment reserves`])
      expect(start).toContain(copy);
  }
  expect(page('start/thanks/')).toContain(`The ${deposit} down payment is non-refundable`);
});

it('uses the contact address on every published email link', () => {
  for (const file of globSync('dist/**/*.html')) {
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/<a\b[^>]*\bdata-em-u="([^"]+)"[^>]*\bdata-em-h="([^"]+)"[^>]*>/g)) {
      expect(`${match[1]}@${match[2]}`, file).toBe(contactEmail);
    }
  }
  const scripts = globSync('dist/_astro/*.js').map(file => readFileSync(file, 'utf8')).join('\n');
  expect(scripts).toContain(`Email ${contactEmail} for help.`);
  expect(scripts).toContain(`email ${contactEmail} for help.`);
  expect(page('') + scripts).toContain(`free review form instead, or email ${contactEmail}.`);
  for (const route of ['', 'resume/', 'thanks/', 'accessibility/']) {
    expect(page(route).match(/data-em-u="/g)?.length).toBe(route ? 2 : 1);
  }
});

it('resolves published project links to registry pages and labels featured projects by status', () => {
  const registry = new Map(PUBLIC_PROJECTS.map(project => [project.slug, project]));
  for (const file of globSync('dist/**/*.html')) {
    for (const [, slug] of readFileSync(file, 'utf8').matchAll(/href="\/projects\/([^/"?#]+)\/?(?:[?#][^"]*)?"/g)) {
      expect(registry.has(slug), `${file} links to ${slug}`).toBe(true);
      expect(page(`projects/${slug}/`)).toContain('class="m3-detail-meta"');
    }
  }
  const directory = page('projects/');
  for (const status of ['released', 'next', 'upcoming']) {
    expect(directory).toContain(`<option value="${status}">${statusLabel(status)}</option>`);
  }
  const featured = [...page('').matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)]
    .map(match => match[1]).filter(card => card.includes('data-cta="selected-project"'));
  expect(featured).toHaveLength(3);
  for (const card of featured) {
    const slug = card.match(/href="\/projects\/([^"]+)"/)![1];
    const project = registry.get(slug)!;
    expect(card).toContain(`<h3>${project.name}</h3>`);
    expect(card).toContain(`data-status="${project.status}">${statusLabel(project.status)}</span>`);
  }
});
