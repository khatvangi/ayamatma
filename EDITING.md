# Ayamatma Editing Guide

Quick reference for making content changes without Claude.

---

## File Locations

```
src/content/essays/       # essay MDX files
src/content/gita/         # Gita verses
src/content/glossary/     # term definitions
src/data/dictionary.json  # Vedanta Paribhasha dictionary
public/images/            # all images
```

---

## Edit an Essay

1. Open the file:
   ```
   src/content/essays/ananta-not-infinity.en.mdx
   ```

2. Edit the text (it's just markdown with frontmatter)

3. Preview locally:
   ```bash
   npm run dev
   ```
   Open http://localhost:4321 - changes hot-reload instantly

4. Deploy:
   ```bash
   git add .
   git commit -m "Fix typo in ananta essay"
   git push
   ```
   Live in ~90 seconds.

---

## Essay Frontmatter Reference

```yaml
---
id: "essay-slug"
lang: "en"                    # en, hi, or te
title: "Essay Title"
description: "Short description for SEO"
date: "2026-01-12"
version: "v1.0"
reading_time: 10              # minutes
claim: "One-line thesis"
paths:
  en: "/essays/essay-slug"
  hi: "/hi/essays/essay-slug"
  te: "/te/essays/essay-slug"
tags: ["Science", "Vedanta"]
featured: true                # shows in carousel
---
```

---

## Common Tasks

### Add a pull quote
```html
<span class="pullquote">Your highlighted text here.</span>
```

### Add a verse reference (shows sidebar on hover)
```html
<span class="verse-ref" data-verse="tai-2-1">*satyaṃ jñānam anantaṃ brahma*</span>
```
Available verses: tai-2-1, brsu-1-1-2, bg-9-4, bg-2-20

### Add an image
```html
<figure class="essay-figure">
  <img src="/images/your-image.png" alt="Description" />
</figure>
```
Put the image file in `public/images/`

### Add a new essay
1. Create `src/content/essays/my-essay.en.mdx`
2. Copy frontmatter from existing essay
3. Update id, title, paths, date
4. Write content
5. `git push`

---

## Dictionary Translation

Edit `src/data/dictionary.json`:

```json
{
  "term": "अध्यक्ष",
  "transliteration": "adhyakṣa",
  "translation": "Your English translation here"  // add this line
}
```

---

## Commands

```bash
npm run dev      # local preview with hot reload
npm run build    # test production build
git push         # deploy to ayamatma.com
```

---

## Troubleshooting

**Build fails?**
```bash
npm run build 2>&1 | tail -50
```
Look for the error. Usually a missing closing tag or bad frontmatter.

**Changes not showing?**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check Cloudflare dashboard for build status

**Need to undo?**
```bash
git checkout -- src/content/essays/file.mdx   # discard changes
git revert HEAD                                # undo last commit
```
