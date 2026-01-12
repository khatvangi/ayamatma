# Ayamatma.com - Project Documentation

## Overview

A Vedānta + Science website exploring Advaita philosophy with analytical rigor.

**Live site:** https://ayamatma.com
**Stack:** Astro + Starlight, Cloudflare Pages
**Author:** Kiran Boggavarapu

---

## Lessons Learned

### Design

1. **"Zen" doesn't mean "dead"** — Initial organic theme was too flat/monotone. Calm meditation sites (Calm, Headspace) use subtle gradients, soft glows, and color variation while maintaining minimalism.

2. **Typography matters** — Lora was too "bookish/literary." Fraunces + DM Sans pairing feels more contemporary and calm. Serif for headings/body, clean sans for UI elements.

3. **Shadows create depth** — Flat cards feel cheap. Layered shadows (`shadow-medium`, `shadow-glow`) with slight color tint create floating, premium feel.

4. **Gradients add life** — Background gradient (cream → sage), card top borders (warm → cool), section backgrounds break monotony without being loud.

5. **Dark mode is expected** — Users want manual toggle, not just system preference. Store choice in localStorage.

### Content

1. **Translation precision matters** — "Ātman is Brahman" not "Self is Brahman" — we wrote an essay arguing Ātman ≠ soul/self! Consistency with content is critical.

2. **Placeholder content should be real** — Lorem ipsum feels dead. Real Vedānta content (even as placeholders) makes the site feel alive and purposeful.

3. **Images transform perception** — The red tree, geometric tree, and logo images completely changed site feel from "boring" to "beautiful."

### Technical

1. **Theme system via CSS variables** — Easy to swap themes by changing one import line. All themes preserved for rollback.

2. **Audio hosting is tricky** — External CDN URLs break. Options: local hosting (reliable), or use known-stable sources like Mixkit.

3. **Keep all versions** — Never delete old themes. User changed mind multiple times. Having `theme-subtle`, `theme-bold`, `theme-organic`, `theme-editorial`, `theme-zen` allows instant rollback.

### Philosophy & Process (Jan 2026)

1. **Practice what you preach** — If the manifesto says "use Sanskrit terms with definitions," do it. Changed "Through rigorous debate" to "In vāda after vāda" with inline definition. Consistency builds trust.

2. **Manifesto without enforcement is decoration** — Added required `protocols` fields to every essay in CMS: claim, terms, fallacy, steel_man, practice. Can't publish without answering. The manifesto is now infrastructure, not just words.

3. **Dictionary grows organically** — Every term defined on the site should go into `/dictionary`. Added "ayamatma" as a source alongside "paribhasha". When you use a term, define it, then add it to dictionary.

4. **The gate is the sūtra** — Splash screen replaced with "Jijñāsā is ānanda" (The desire to know is bliss). One sūtra, one truth, one entry point. Not a Voltaire quote — our own philosophy.

5. **Clear paths, not hidden content** — Landing page must show ALL navigation: Primer, Essays, Science, Dictionary, Manifesto. If visitors don't see it, it doesn't exist.

6. **Simpler is stronger** — Contributor template went from 6 detailed fields to 1 sūtra. Manifesto went from verbose explanations to punchy statements. "Energy, Vibration, Frequency without equations are noise. We do not permit noise."

7. **GitHub OAuth without external providers** — Cloudflare Pages Functions (`/auth`, `/callback`) handle OAuth directly. No Netlify dependency. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Cloudflare env vars.

8. **CMS requires redeploy after env vars** — Environment variables only apply to NEW deployments. Always redeploy after adding secrets.

---

## Current Theme: theme-zen

```
Colors (light):
- Background: #fafaf8 → #f0f5f4 gradient
- Text: #2d3436
- Accent warm: #b08d7a (terracotta)
- Accent cool: #5a9b8f (sage/teal)

Colors (dark):
- Background: #0f1419 → #1a2027
- Text: #e8eaed
- Accent warm: #d4a88c
- Accent cool: #7cc4b8

Typography:
- Headings/prose: Fraunces (variable serif)
- UI/body: DM Sans (clean sans)
```

---

## File Structure

```
src/
├── components/
│   ├── SplashScreen.astro     # gate: "Jijñāsā is ānanda"
│   ├── DailyVerse.astro       # rotating verse widget
│   ├── RecentEssays.astro     # latest essays grid
│   ├── ThemeToggle.astro      # dark/light switch
│   ├── SiteHeader.astro       # nav with logo
│   ├── SiteFooter.astro       # motto + credit
│   └── ...
├── layouts/
│   └── BaseLayout.astro       # main layout, theme import
├── pages/
│   ├── index.astro            # homepage with Explore paths
│   ├── manifesto.astro        # Protocols of Inquiry
│   ├── dictionary.astro       # 1600+ Sanskrit terms
│   ├── primer.astro           # Vedānta introduction
│   ├── science.astro          # Science & Vedānta
│   └── essays/                # essay listing + slugs
├── content/
│   ├── essays/                # mdx with protocols frontmatter
│   ├── gita/                  # Gita verses
│   └── glossary/              # term definitions
├── data/
│   ├── dictionary.json        # Sanskrit dictionary (paribhasha + ayamatma sources)
│   └── daily-verses.json      # verse rotation data
├── styles/
│   ├── base.css               # structural styles
│   ├── theme-zen.css          # current theme ✓
│   └── theme-*.css            # archived themes
functions/
├── auth.js                    # GitHub OAuth redirect
└── callback.js                # OAuth token exchange
public/
├── admin/
│   ├── index.html             # Decap CMS
│   └── config.yml             # CMS schema with protocols
└── images/
    └── ...
```

---

## Future Plans

### Content
- [ ] Complete Primer sections with deeper explanations
- [ ] Write full Science & Vedānta articles (not just stubs)
- [ ] Add more essays (weekly cadence?)
- [ ] Gita verse commentaries with audio
- [x] Dictionary with 1600+ terms ✓
- [x] Hindi/Telugu translations for key content ✓

### Design
- [ ] Add subtle scroll animations (fade-in sections)
- [ ] Hero image parallax effect
- [x] Card hover micro-interactions ✓
- [ ] Custom cursor (optional, subtle)
- [ ] Reading progress indicator for essays
- [ ] Table of contents for long pages

### Features
- [x] Search functionality (dictionary) ✓
- [ ] RSS feed for essays
- [ ] Newsletter signup
- [x] Daily verse/reflection widget ✓
- [ ] Audio narration for essays
- [ ] Better ambient music — curated meditation playlist
- [ ] Bookmark/save essays (localStorage)
- [x] Reading time estimates ✓

### Technical
- [ ] Image optimization (WebP, responsive sizes)
- [ ] Performance audit (Lighthouse)
- [ ] SEO meta tags for social sharing
- [ ] Sitemap generation
- [ ] Analytics (privacy-respecting)
- [ ] PWA support (offline reading)
- [x] CMS admin panel (/admin) ✓
- [x] GitHub OAuth (Cloudflare Functions) ✓

### Stretch Goals
- [ ] Interactive Vedānta concept map
- [ ] Guided meditation audio series
- [ ] Community discussion (comments?)
- [ ] Print-friendly CSS for essays
- [ ] eBook export of essays

---

## Quick Commands

```bash
# development
npm run dev

# build
npm run build

# switch theme (edit src/layouts/BaseLayout.astro line 5)
import '../styles/theme-zen.css';      # current
import '../styles/theme-organic.css';  # warm fallback
import '../styles/theme-bold.css';     # dark dramatic

# add meditation music
# save mp3 to: public/audio/ambient.mp3
```

---

## Philosophy

> "Clarity is a form of devotion."

This site exists to explore Vedānta with the rigor of a scientist and the precision of a philosopher. No watering down for Western audiences, no assuming Sanskrit fluency. A third path: fidelity to source texts in language anyone can understand.

---

DISTILLED_AESTHETICS_PROMPT = """
<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.

Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
</frontend_aesthetics>
"""

