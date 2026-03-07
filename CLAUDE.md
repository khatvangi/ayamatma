# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Ayamatma.com — a Vedanta + Science website exploring Advaita philosophy with analytical rigor. Built with Astro + Starlight, deployed on Cloudflare Pages.

**Live site:** https://ayamatma.com

## Commands

```bash
npm run dev       # start dev server
npm run build     # production build (uses Cloudflare adapter)
npm run preview   # preview production build locally
```

Package manager is **pnpm** (pinned in package.json `packageManager` field).

## Architecture

### Stack
- **Astro 5** with MDX, Tailwind CSS, Cloudflare adapter
- **Starlight** (Astro's docs framework) for structured content
- **Tailwind** with `@tailwindcss/typography` plugin; config in `tailwind.config.cjs`
- **Cloudflare Pages Functions** in `functions/` for OAuth and voice messages

### Internationalization (i18n)
Content supports **en**, **hi** (Hindi), **te** (Telugu). The routing pattern:
- Default (English): `/essays/[slug]`, `/gita/[slug]`, `/daily/[slug]`
- Translated: `/[lang]/essays/[slug]`, `/[lang]/gita/[slug]`, `/[lang]/daily/[slug]`

Content files use lang suffix: `atman-not-soul.en.mdx`, `atman-not-soul.hi.mdx`, `atman-not-soul.te.mdx`. Each has a `paths` frontmatter field linking translations together.

Pages in `src/pages/` mirror this: top-level routes for English, `[lang]/` dynamic routes for translations.

### Theme System
All styling flows through CSS variables defined in theme files (`src/styles/theme-*.css`). Switch themes by changing the import in `src/layouts/BaseLayout.astro:5`. Current theme: **theme-zen**.

Available themes: `theme-zen` (current), `theme-organic`, `theme-bold`, `theme-editorial`, `theme-subtle`. Never delete old themes — they serve as rollbacks.

Tailwind maps CSS variables to utility classes in `tailwind.config.cjs` (colors: `bg`, `surface`, `text`, `muted`, `border`, `accent`). Custom font families: `font-ui`, `font-serif`, `font-devanagari`, `font-telugu`.

Typography: Fraunces (variable serif) for headings/prose, DM Sans for UI.

### Content Collections
Located in `src/content/`:
- **essays/** — MDX with required `protocols` frontmatter (claim, terms, fallacy, steel_man, practice). This enforces the site's manifesto.
- **gita/** — Bhagavad Gita verse commentaries, multi-language
- **daily/** — daily reflections, multi-language
- **glossary/** — Sanskrit term definitions (atman, brahman, avidya, pramana, moksha)
- **listen/** — audio episode content
- **docs/** — Starlight docs (manifesto, house-style, methods)

### Data Files
- `src/data/dictionary.json` — 1600+ Sanskrit terms (sources: "paribhasha", "ayamatma")
- `src/data/videos.json` — video content metadata

### API Routes (Server-side, Cloudflare Workers)
`src/pages/api/`:
- `room-peers.ts`, `video-room.ts`, `audio-room.ts` — WebRTC room state via R2 storage
- `voice-message.ts` — voice message handling

### Cloudflare Functions
`functions/`:
- `auth.js` — GitHub OAuth redirect (for Decap CMS)
- `callback.js` — OAuth token exchange
- `voice-message.js` — voice message endpoint

### Key Components
- `BaseLayout.astro` — main layout, imports theme CSS, sets up meta/OG tags
- `SplashScreen.astro` — entry gate ("Jijnasa is ananda")
- `Term.astro` — inline Sanskrit term component with IAST transliteration
- `SiteHeader.astro` / `SiteFooter.astro` — site chrome
- `ThemeToggle.astro` — dark/light mode (persisted in localStorage)

### CMS
Decap CMS at `/admin/` with config at `public/admin/config.yml`. Uses GitHub OAuth via Cloudflare Functions. Env vars needed: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.

## Content Conventions

- Use Sanskrit terms with IAST diacritics (Atman, Brahman, etc.)
- "Atman is Brahman" not "Self is Brahman" — translation precision is core to the site's philosophy
- Every new Sanskrit term used on-site should be added to the dictionary
- Essays require all `protocols` fields — this is enforced infrastructure, not optional metadata
- Use the `<Term iast="...">` component for inline Sanskrit terms in MDX

## Design Principles

- "Zen" aesthetic: calm, meditative, but not flat/dead. Subtle gradients, soft glows, layered shadows
- Solarpunk theme does NOT apply to ayamatma (it uses Zen aesthetic)
- Dark mode is expected and must work via manual toggle
- Fraunces + DM Sans typography pairing. Avoid generic fonts (Inter, Roboto, Arial)

## Lessons Learned (Technical)

- **WebRTC needs TURN servers** — STUN alone fails across different NATs. Use `openrelay.metered.ca`.
- **Browser autoplay is blocked** — must call `.play()` explicitly and catch rejection; show "Tap to enable audio" button
- **localStorage is browser-local** — cannot use for cross-device peer discovery. Use R2 for shared state.
- **PeerJS needs ICE config** — always pass `{ config: { iceServers: [...] } }` with STUN + TURN
- **sendBeacon for cleanup** — use `navigator.sendBeacon()` on `beforeunload`, not regular `fetch`
- **CMS requires redeploy after env vars** — Cloudflare env vars only apply to NEW deployments
- **Audio hosting** — external CDN URLs break. Prefer local hosting in `public/audio/`
