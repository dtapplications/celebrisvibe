import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One MDX file per service. The file name is the URL slug (/uslugi/<slug>/) and the
// body is the intro text shown at the top of the service page.
const services = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/services' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    intro: z.string(),
    photo: z.string(),
    quote: z.string(),
    formServices: z.array(z.string()),
    includes: z.array(z.string()),
    fits: z.array(z.string()),
    highlights: z.array(z.object({
      title: z.string(),
      photo: z.string(),
      occasions: z.array(z.string()),
      desc: z.string(),
    })),
  }),
});

export const collections = { services };
