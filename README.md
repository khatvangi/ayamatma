# Ayamatma

Production-ready Astro + MDX site for ayamatma.com with EN/HI/TE routing, dark-first theme, and minimal JS islands.

## Commands

- `pnpm dev`
- `pnpm build`
- `pnpm preview`

## Content

- Essays: `src/content/essays/<slug>.<lang>.mdx`
- Gita: `src/content/gita/<slug>.<lang>.mdx`
- Daily: `src/content/daily/YYYY-MM-DD.<lang>.mdx`
- Glossary: `src/content/glossary/<term>.mdx`
- Listen: `src/content/listen/<slug>.<lang>.mdx`

Languages use subpaths: `/` (en), `/hi`, `/te`.

## Key components

- `src/components/VerseBlock.astro`
- `src/components/LanguagePill.astro`
- `src/components/TermChip.astro`
- `src/components/AudioPlayer.astro`
- `src/components/DailyCard.astro`

## Docs pages (Starlight)

- `src/content/docs/manifesto.mdx`
- `src/content/docs/glossary.mdx`
- `src/content/docs/methods.mdx`
- `src/content/docs/house-style.mdx`

## Add an essay

1. Create `src/content/essays/<slug>.en.mdx`.
2. Fill frontmatter: id/slug/lang/title/description/date/version/paths.
3. Add content + VerseBlock + Objections.
4. Add translations later as `.hi.mdx` and `.te.mdx` with same `id` and `slug`.
