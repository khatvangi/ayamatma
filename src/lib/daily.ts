import type { CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';
import { sortByDateDesc } from './content';

export const getLatestDaily = (
  entries: CollectionEntry<'daily'>[],
  lang: Locale
) => {
  const sorted = sortByDateDesc(entries);
  const latestEnglish = sorted.find((entry) => entry.data.lang === 'en');
  if (!latestEnglish) return { entry: null, note: null };
  if (lang === 'en') return { entry: latestEnglish, note: null };

  const localized = sorted.find(
    (entry) => entry.data.lang === lang && entry.data.date === latestEnglish.data.date
  );

  if (localized) return { entry: localized, note: null };

  return {
    entry: latestEnglish,
    note: `${lang === 'hi' ? 'Hindi' : 'Telugu'} not available for this day.`,
  };
};
