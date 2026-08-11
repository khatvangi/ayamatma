import { defineCollection, z } from 'astro:content';

// formal journal articles — the citable objects. the schema enforces the full
// bibliographic contract so an "article" cannot exist without the metadata
// that makes it citable.
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
      'research-article',      // reserved for independently peer-reviewed work
      'scholarly-essay',       // rigorous written argument, not peer-reviewed
      'editor-reviewed-essay',
      'translation-commentary',
      'review-essay',
      'dialogue',
      'editorial',
      // media-native contributions — each still leaves a stable, citable record
      'vada',                  // structured recorded disagreement / dialogue
      'lecture',               // invited video/audio presentation
      'oral-commentary',       // focused spoken argument
      'visual-essay',          // diagrams / images + argument or narration
      'interview',
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
    // part of a running series, e.g. "Studies on the Vedas · Part I"
    series: z
      .object({ name: z.string(), part: z.number().optional() })
      .optional(),
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

export const collections = { journal };
