import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One MDX file per paper. Frontmatter feeds the home-page Contents list, the footer and the paper header.
const papers = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/papers' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    short: z.string(), // footer and nav label
    description: z.string(), // meta description
    summary: z.string(), // 1–2 sentences for Contents
    context: z.array(z.string()), // type · dates · data · tools · status
    inProgress: z.boolean().default(false),
    thumb: z.enum(['event-window', 'research-design', 'rubric', 'sum-check', 'regression-table', 'research-flow', 'did']),
    thumbAlt: z.string(),
    provenance: z.object({ repo: z.string(), data: z.string(), stack: z.string(), status: z.string() }),
    updated: z.coerce.date().optional(), // fallback only; the page uses the file's last git commit date
    reader: z.boolean().default(false), // new reading layout (abstract, contents, sidenotes, references)
  }),
});

export const collections = { papers };
