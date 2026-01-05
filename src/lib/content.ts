import type { CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';

export const getSlugFromPath = (path?: string) => {
  if (!path) return '';
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
};

export const getPathForLocale = (paths: Record<string, string | undefined>, lang: Locale) =>
  paths?.[lang] || paths?.en || '';

export const filterByLang = <T extends CollectionEntry<any>>(
  entries: T[],
  lang: Locale
) => entries.filter((entry) => entry.data.lang === lang);

export const findBySlugAndLang = <T extends CollectionEntry<any>>(
  entries: T[],
  slug: string,
  lang: Locale
) =>
  entries.find(
    (entry) =>
      entry.data.lang === lang &&
      getSlugFromPath(getPathForLocale(entry.data.paths || {}, lang)) === slug
  );

export const sortByDateDesc = <T extends CollectionEntry<any>>(entries: T[]) =>
  entries
    .slice()
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
