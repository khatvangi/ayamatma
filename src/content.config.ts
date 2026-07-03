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

// formal journal articles — the citable layer, distinct from public essays.
// the schema enforces the full bibliographic contract so an "article" cannot
// exist without the metadata that makes it citable.
const journalAuthor = z.object({
  name: z.string(),
  affiliation: z.string().optional(),
  orcid: z.string().optional(),
});

const journal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    authors: z.array(journalAuthor).min(1),
    correspondingAuthor: z.string().optional(),
    articleType: z.enum([
      'research-article',
      'editor-reviewed-essay',
      'translation-commentary',
      'review-essay',
      'dialogue',
      'editorial',
    ]),
    reviewStatus: z.enum([
      'peer-reviewed',
      'editor-reviewed',
      'signed-editorial',
      'not-peer-reviewed',
    ]),
    reviewPath: z.string().optional(),
    volume: z.number(),
    issue: z.number(),
    articleNumber: z.number(),
    publishedDate: z.string(),
    receivedDate: z.string().optional(),
    revisedDate: z.string().optional(),
    acceptedDate: z.string().optional(),
    abstract: z.string(),
    keywords: z.array(z.string()),
    license: z.string(),
    // doi stays null until an identifier is actually registered — never faked
    doi: z.string().nullable().optional(),
    doiStatus: z.enum(['planned', 'registered', 'not-applicable']).default('planned'),
    citation: z.string().optional(),
    pdf: z.string().optional(),
    htmlCanonical: z.string().optional(),
    // set only on essays formally converted into journal articles
    adaptedFrom: z
      .object({
        title: z.string().optional(),
        href: z.string().optional(),
        date: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = {
  essays,
  gita,
  daily,
  glossary,
  listen,
  docs,
  journal,
};
