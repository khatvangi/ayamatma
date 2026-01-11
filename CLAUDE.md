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
│   ├── AmbientPlayer.astro    # floating music player
│   ├── ThemeToggle.astro      # dark/light switch
│   ├── SiteHeader.astro       # nav with logo
│   ├── SiteFooter.astro       # motto + credit
│   └── ...
├── layouts/
│   └── BaseLayout.astro       # main layout, theme import
├── pages/
│   ├── index.astro            # homepage with red tree
│   ├── primer.astro           # Vedānta introduction
│   ├── science.astro          # Science & Vedānta
│   ├── about.astro            # about page
│   └── essays/                # essay listing + slugs
├── content/
│   ├── essays/                # mdx essay files
│   ├── gita/                  # Gita verses
│   └── glossary/              # term definitions
├── styles/
│   ├── base.css               # structural styles
│   ├── theme-zen.css          # current theme ✓
│   ├── theme-subtle.css       # minimal whisper
│   ├── theme-bold.css         # dark dramatic
│   ├── theme-organic.css      # warm earthy
│   └── theme-editorial.css    # magazine clean
public/
├── images/
│   ├── red-tree.png           # hero image
│   ├── tree-geometric.png     # inner pages
│   ├── logo-circle.png        # nav logo
│   └── logo-framed.png        # alt logo
└── audio/
    └── ambient.mp3            # add your own meditation music
```

---

## Future Plans

### Content
- [ ] Complete Primer sections with deeper explanations
- [ ] Write full Science & Vedānta articles (not just stubs)
- [ ] Add more essays (weekly cadence?)
- [ ] Gita verse commentaries with audio
- [ ] Glossary expansion with cross-references
- [ ] Hindi/Telugu translations for key content

### Design
- [ ] Add subtle scroll animations (fade-in sections)
- [ ] Hero image parallax effect
- [ ] Card hover micro-interactions
- [ ] Custom cursor (optional, subtle)
- [ ] Reading progress indicator for essays
- [ ] Table of contents for long pages

### Features
- [ ] Search functionality
- [ ] RSS feed for essays
- [ ] Newsletter signup
- [ ] Daily verse/reflection widget
- [ ] Audio narration for essays
- [ ] Better ambient music — curated meditation playlist
- [ ] Bookmark/save essays (localStorage)
- [ ] Reading time estimates

### Technical
- [ ] Image optimization (WebP, responsive sizes)
- [ ] Performance audit (Lighthouse)
- [ ] SEO meta tags for social sharing
- [ ] Sitemap generation
- [ ] Analytics (privacy-respecting)
- [ ] PWA support (offline reading)

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

*Last updated: January 2026*
