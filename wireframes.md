# wireframes.md — Ayamatma page-by-page wireframes (plain language)

These are **layout descriptions**, not pixel specs. Implement the *feel*: editorial, calm, designed.

Global principles:
- Dark-first with light toggle (persistent).
- Deep indigo accent only.
- Typography-led: big readable type, generous whitespace, visible grid.
- No clutter: every page has one clear primary object.
- No public comments.

---

## 1) Global Shell (every page)

### Header (top, always visible but not sticky unless you choose)
Left:
- **Ayamatma** (wordmark; simple, not a logo)

Center or right:
- Nav links: **Essays | Gītā Path | Daily | Listen | Glossary | Manifesto**
- Search icon or “Search”
- Theme toggle (dark/light)

Behavior:
- On mobile: a hamburger that opens a full-screen minimal menu.
- Menu uses large type, lots of space, no icons except close.

### Footer (minimal, quiet)
- Small links: **House Style | Contact | RSS | GitHub**
- One line mission in muted text (optional)
- Copyright

---

## 2) Home page (the “return loop”)

### Above the fold (no scrolling needed on desktop)
1) **One sentence mission** (bold, single line if possible)
   - Example vibe (not exact copy): “Vedānta with rigor: śāstra, argument, practice.”

2) Three primary actions (button row):
- **Start Here**
- **Today’s Śloka**
- **Listen (7 min)**

3) A single featured block (not a carousel):
- **Today’s Śloka card** preview:
  - Verse ref (BG x.y)
  - Devanāgarī line (1–2 lines)
  - IAST line (muted)
  - 1–2 line meaning
  - A small “Read today” link

### Below the fold (in this order)
A) **Featured Essay**
- Title + 1 sentence description
- Small row: reading time, date, version
- “Read” link

B) **Three paths (persona entry points)**
Three small columns or cards:
- Scientist
- Philosopher
- Practitioner
Each shows exactly 3 links (no more).

C) **Listen**
- Latest episode card (title + duration + play)
- Two “clips” below as small rows

D) **Recent essays**
- A clean list (title + 1 line) with “View all”

---

## 3) Essays index (browse without chaos)

Top:
- Page title: **Essays**
- Short line: “Short, direct, rigorous.”

Below:
- A clean list of essays (not cards), each row:
  - Title
  - One-line description
  - Tiny metadata: reading time • date
  - Small tag chips (max 2–3)

Optional (if you want):
- A simple filter row:
  - Path: Scientist / Philosopher / Practitioner
  - Tag (dropdown)
No multi-filter UI.

---

## 4) Essay detail page (your core reading experience)

### Top section
- Title (large)
- One-line **Claim** (bold, short)
- Metadata row (small): date • reading time • version

Right side (desktop) / below (mobile):
- **Language pill:** `EN | हिंदी | తెలుగు`
- If translation missing: show “Not available yet” in muted text.

### Body layout
Desktop: two-column
- Left: main prose column
- Right: side rail with:
  1) Table of contents (TOC)
  2) Key terms (TermChips)
  3) Quick links: “Related Gītā verse”, “Listen”

Mobile: single column
- TOC collapsible (“On this page”)
- Key terms collapsible

### Signature block types (must exist)
A) **VerseBlock**
- Verse ref line (e.g., BG 2.20)
- Devanāgarī (default visible)
- IAST (default visible, muted)
- Translation (normal text)
- Your interpretation (slightly indented or bordered)
- Small “Copy ref” and optional “Play clip”

B) **Objections + What would change my mind**
Near the end, visually distinct but quiet:
- “Objections” (2 bullets)
- “What would change my mind” (1 sentence)

C) End matter
- Related essays (3 max)
- Related Gītā Path entries (2 max)
- Version notes (small)

---

## 5) Gītā Path index (verse spine)

Top:
- Title: **Gītā Path**
- One line: “Verse-first reading.”

Below:
- A simple chapter/verse browsing mechanism:
  - Either: chapter list (1–18) then verse list
  - Or: searchable list by ref (BG 2.20)

Each entry row:
- Ref (BG 2.20)
- Short title
- One-line “what it teaches”
- Tiny icons avoided; use text only.

---

## 6) Gītā Path entry page (verse-focused, short)

Top:
- Ref + title
- Language pill (EN/HI/TE)

Body:
- VerseBlock (centerpiece)
- “Meaning in one paragraph” (150–300 words)
- “Practice” (1–3 minutes)
- “Read more” links:
  - one essay
  - one daily entry if relevant
- Optional: short audio clip

Side rail (desktop):
- Nearby verses (previous/next)
- Key terms chips

---

## 7) Daily index (the “something every day” page)

Top:
- Title: **Daily**
- Subline: “Three things: a śloka, a term, a question.”

First block:
- **Today’s DailyCard** (full content):
  1) Śloka of the day (VerseBlock compact)
  2) One Term (3 lines + misuse)
  3) One Question (one sentence + link)

Below:
- Archive list by date:
  - Date + sloka ref + term (compact row)
- Search by date optional (simple)

Fallback behavior:
- If current locale daily doesn’t exist, show English daily with a small note:
  - “Hindi not available for this day.”

---

## 8) Listen index (audio-first without clutter)

Top:
- Title: **Listen**
- Subline: “Short episodes + clips.”

Two sections:
A) Episodes (list)
- Title, duration, date
- Play button (inline)
- “Transcript” link
- “Companion note” link (to essay)

B) Clips (list)
- Clip title, duration
- Verse ref or essay ref
- Play inline

No embedded Spotify/Apple widgets on index page.

---

## 9) Listen detail page (episode page)

Top:
- Episode title
- Duration + date
- AudioPlayer (centerpiece)
- Buttons: Transcript (toggle), Companion reading

Body:
- Transcript collapsible (default collapsed)
- Companion links list (2–5)
- Optional: “Key terms” chips

---

## 10) Glossary index (precision tool)

Top:
- Title: **Glossary**
- Search field (simple)
- “A–Z” quick jump row (optional)

List:
- Term in IAST + Devanāgarī
- One-line definition
- Click → term page

---

## 11) Glossary term page

Top:
- Term: IAST (large) + Devanāgarī (smaller)
- Short definition (bold)
- “Avoid translating as:” (small, if you use it)

Body sections:
- Definition
- What it is NOT (common confusions)
- Text anchors (BG/Upaniṣad refs)
- Related terms (chips)

---

## 12) Manifesto page (Vicāra-Niyama)

This should read like a constitution:
- Title
- One paragraph setup
- Five protocols as numbered sections
- Each protocol has:
  - Principle line
  - 2–4 bullets max
- No decorative imagery.

---

## 13) House Style page (linked in footer)
Short, enforceable:
- Lexicon rule (avoid Abrahamic microcopy in UI; define exceptions)
- Science boundary rule (no quantum mysticism; no “energy/vibration” word salad)
- Translation rule: Sanskrit term + English in parentheses on first use
- Tone: direct, precise

---

## 14) Contact page
Minimal form:
- name, email, message
- checkbox: “This is a sincere inquiry, not promotion.”
No comments, no community board.

---

## Notes on “visual elements” (non-flashy)
Use design objects, not illustrations:
- Thin rules
- Quiet callouts
- VerseBlock styling
- Chips
- Margin notes / side rail
- Shareable verse cards (optional later)

Everything should feel like a modern research notebook + sacred text reader, not an influencer feed.

