import { defineCollection, z } from 'astro:content';

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    client: z.string(),
    kind: z.string(),
    location: z.string().optional(),
    year: z.number(),
    video: z.string().optional(),
    poster: z.string().optional(),
    liveUrl: z.string().url().optional(),
    problem: z.string(),
    outcome: z.string(),
    metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    order: z.number().default(100),
  }),
});

export const collections = { caseStudies };
