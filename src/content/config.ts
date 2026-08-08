import { defineCollection, z } from 'astro:content';

const caseStudies = defineCollection({
  type: 'content',
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
        liveUrl: z.string().url().optional(),
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
