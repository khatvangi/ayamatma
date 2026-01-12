# Ayamatma Editing Guide
*A complete beginner's guide to editing your website*

---

## Where Are Things?

Your website files live in folders like a filing cabinet:

```
ayamatma/
├── src/
│   ├── pages/          ← Main pages (home, about, etc.)
│   ├── components/     ← Reusable pieces (splash screen, header, etc.)
│   ├── content/
│   │   └── essays/     ← Your essays go here
│   └── styles/         ← Colors and fonts
└── public/
    └── images/         ← Pictures
```

---

## How to Edit the Splash Screen

**File:** `src/components/SplashScreen.astro`

Open this file and find lines 13-20. You'll see:

```html
<p>Struck by the happiness of this poor creature...</p>
<p>"Are you not ashamed," I said...</p>
```

**To change text:** Just type new words between `<p>` and `</p>`

**To add a new paragraph:** Add a new line like:
```html
<p>Your new sentence here.</p>
```

**To remove a paragraph:** Delete the entire line including `<p>` and `</p>`

**The last line (in soft color):** Always keep `class="splash-final"` on the last paragraph:
```html
<p class="splash-final">"—it is a happiness I do not desire."</p>
```

---

## How to Edit the Home Page

**File:** `src/pages/index.astro`

This is what visitors see after clicking the splash.

**The Sanskrit title (line 18):**
```html
<h1 class="sutra">अयमात्मा ब्रह्म</h1>
```

**The transliteration (line 19):**
```html
<p class="sutra-translit">Ayam Ātmā Brahma</p>
```

**The tagline (line 20):**
```html
<p class="tagline">A quiet space where Vedānta, rigorous science, and clear thinking meet.</p>
```

**The three cards (Primer, Science, Essays):** Lines 40-67

---

## How to Edit Other Pages

| Page | File |
|------|------|
| Home | `src/pages/index.astro` |
| Primer | `src/pages/primer.astro` |
| Essays list | `src/pages/essays/index.astro` |
| Glossary | `src/pages/glossary/index.astro` |
| Science | `src/pages/science.astro` |
| About | `src/pages/about.astro` |

---

## How to Add a New Essay

**Step 1:** Go to `src/content/essays/`

**Step 2:** Create a new file with a name like: `my-new-essay.mdx`

**Step 3:** Start the file with this header (copy exactly):
```
---
title: "Your Essay Title"
description: "A short description of your essay"
pubDate: 2026-01-11
tags: ["vedanta", "philosophy"]
---

Your essay text goes here.

This is a new paragraph.

## This is a Heading

More text under the heading.
```

**Step 4:** Save and push (see below)

---

## How to Add Images

**Step 1:** Put your image in `public/images/`
- Example: Save `my-picture.png` to `public/images/my-picture.png`

**Step 2:** Use it in any page like this:
```html
<img src="/images/my-picture.png" alt="Description of image" />
```

---

## How to Push Changes to the Live Website

After you edit files, you need to "push" them to make them live.

### Option A: Using Terminal (Command Line)

**Step 1:** Open terminal in the ayamatma folder

**Step 2:** Type these three commands, one at a time:

```bash
git add .
```
*(This says "I want to save all my changes")*

```bash
git commit -m "Updated the splash screen text"
```
*(This saves your changes with a note about what you did)*

```bash
git push
```
*(This sends your changes to the internet)*

**Step 3:** Wait 1-2 minutes. Cloudflare will automatically update your website.

**Step 4:** Visit https://ayamatma.com to see your changes!

---

### Option B: Using VS Code (Easier)

**Step 1:** Look at the left sidebar, click the branch icon (Source Control)

**Step 2:** You'll see a list of changed files

**Step 3:** Type a message in the box like "Updated splash text"

**Step 4:** Click the checkmark ✓ to commit

**Step 5:** Click "Sync Changes" or the cloud icon to push

---

## Quick Reference: Common Edits

| I want to... | Edit this file |
|--------------|----------------|
| Change splash screen text | `src/components/SplashScreen.astro` |
| Change splash screen image | Line 8: change `tree-geometric.png` to your image |
| Change home page text | `src/pages/index.astro` |
| Change the motto in footer | `src/components/SiteFooter.astro` |
| Add a new essay | Create new file in `src/content/essays/` |
| Change colors | `src/styles/theme-zen.css` |
| Change the logo | Replace `public/images/logo-circle.png` |

---

## Formatting Text in Essays (.mdx files)

```markdown
Regular text just type normally.

**Bold text** use two stars on each side.

*Italic text* use one star on each side.

## Big Heading (use ##)

### Smaller Heading (use ###)

> This is a quote block
> Use > at the start of lines

- Bullet point 1
- Bullet point 2
- Bullet point 3

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

[Link text](https://example.com)

![Image description](/images/picture.png)
```

---

## If Something Goes Wrong

**Problem:** Website looks broken after pushing
**Solution:** Wait 2 minutes for Cloudflare to rebuild, then hard refresh (Ctrl+Shift+R)

**Problem:** Git says "conflict" or "error"
**Solution:** Don't panic. Type: `git stash` then `git pull` then `git stash pop`

**Problem:** Changes not showing up
**Solution:** Clear browser cache or try incognito window

---

## Need Help?

The website is built with **Astro** (https://astro.build)

Files ending in `.astro` are page templates.
Files ending in `.mdx` are content (essays).
Files ending in `.css` are styles (colors, fonts).

---

*Last updated: January 2026*
