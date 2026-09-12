import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/caseStudies', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z
      .object({
        client: z.string(),
        kind: z.string(),
        location: z.string().optional(),
        year: z.number(),
        video: z.string().optional(),
        poster: z.string().optional(),
        // Still-image fallback when no scroll video exists yet — a real
        // screenshot of the shipped site, optimized by astro:assets at build.
        image: image().optional(),
        imageAlt: z.string().optional(),
        liveUrl: z.url().optional(),
        problem: z.string(),
        outcome: z.string(),
        metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
        order: z.number().default(100),
      })
      // LAW 11: a screenshot can never ship without honest alt text.
      .refine((d) => !d.image || Boolean(d.imageAlt), {
        message: 'imageAlt is required whenever image is set',
      }),
});

export const collections = { caseStudies };
