export const locales = ['en', 'hi', 'te'] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  hi: 'हिंदी',
  te: 'తెలుగు',
};

export const withLocale = (path: string, lang: Locale) => {
  if (lang === 'en') return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${normalized}`;
};

export const getLocaleFromPath = (pathname: string): Locale => {
  if (pathname.startsWith('/hi')) return 'hi';
  if (pathname.startsWith('/te')) return 'te';
  return 'en';
};
