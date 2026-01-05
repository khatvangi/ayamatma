import { defineCollection, z } from 'astro:content';

const localeSchema = z.enum(['en', 'hi', 'te']);

const pathsSchema = z.object({
  en: z.string(),
  hi: z.string().optional(),
  te: z.string().optional(),
});

const essays = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    lang: localeSchema,
    title: z.string(),
    description: z.string(),
    date: z.string(),
    version: z.string(),
    reading_time: z.number().optional(),
    claim: z.string().optional(),
    paths: pathsSchema,
    tags: z.array(z.string()).optional(),
    series: z.string().optional(),
    featured: z.boolean().optional(),
    audio: z
      .object({
        episode: z.string().optional(),
        clip: z.string().optional(),
      })
      .optional(),
  }),
});

const gita = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    lang: localeSchema,
    ref: z.string(),
    chapter: z.number(),
    verse: z.number(),
    title: z.string(),
    date: z.string(),
    paths: pathsSchema,
    related_essays: z.array(z.string()).optional(),
    audio: z
      .object({
        clip: z.string().optional(),
      })
      .optional(),
  }),
});

const daily = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    date: z.string(),
    lang: localeSchema,
    sloka_ref: z.string(),
    sloka_id: z.string().optional(),
    term: z.string(),
    term_id: z.string().optional(),
    question: z.string(),
    audio: z
      .object({
        clip: z.string().optional(),
      })
      .optional(),
    paths: pathsSchema,
  }),
});

const glossary = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    term: z.string(),
    devanagari: z.string(),
    iast: z.string(),
    short: z.string(),
    avoid: z.array(z.string()).optional(),
    see_also: z.array(z.string()).optional(),
  }),
});

const listen = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    date: z.string(),
    audio_url: z.string(),
    duration_seconds: z.number(),
    kind: z.enum(['episode', 'clip']),
    lang: localeSchema.optional(),
    companion: z.array(z.string()).optional(),
    transcript_available: z.boolean().optional(),
    paths: pathsSchema,
  }),
});

const docs = defineCollection({
  type: 'content',
  schema: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .passthrough(),
});

export const collections = {
  essays,
  gita,
  daily,
  glossary,
  listen,
  docs,
};
