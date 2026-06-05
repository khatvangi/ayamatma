# VSN Cards — editing guide

Ekam Sat Project · Kiran Boggavarapu · ayamatma.com

## What this is

A deck of contemplative cards for the Viṣṇu Sahasranāma.
Each card holds a *cluster* of 3–8 names taught together,
with Śaṅkara's gloss, verse anchor, and synthesis.

## File layout

```
/storage/ayamatma/public/vsn-cards/    ← English set
├── style.css                          ← ALL shared styling. one source of truth.
├── index.html                         ← deck home
├── intro/                             ← intro cards (research, method)
├── content/                           ← interpretation cards (name-clusters)
├── img/                               ← drop ChatGPT/MJ illustrations here
└── exports/                           ← generated PNGs + PDFs (later)

/storage/ayamatma/public/te/vsn-cards/ ← Telugu mirror, same structure
```

## How to view

While Astro dev server is running (it is — see `pnpm dev`):

- English deck: http://localhost:4321/vsn-cards/index.html
- English card 1: http://localhost:4321/vsn-cards/content/01-vishvam-vishnu-bhutabhavyabhavatprabhuh.html
- Telugu deck: http://localhost:4321/te/vsn-cards/index.html
- Telugu card 1: http://localhost:4321/te/vsn-cards/content/01-vishvam-vishnu-bhutabhavyabhavatprabhuh.html

For production (after `pnpm build` + Cloudflare deploy):
- https://ayamatma.com/vsn-cards/
- https://ayamatma.com/te/vsn-cards/

## How to edit a card

1. Open the `.html` file in any editor.
2. Look for the named slots — `<header class="card-header">`, `<div class="medallion">`,
   `<div class="synthesis">`, etc.
3. Edit the text *between* the tags. Don't change the tag structure.
4. Save. Refresh browser. See change immediately.

Don't touch the `<style>` blocks or the `<svg>` placeholder until ready —
those edit the visual layout, not the content.

## How to make a new card

1. Copy `content/01-vishvam-...html` to `content/NN-new-cluster-name.html`.
2. Edit:
   - `<title>` and OG metadata
   - `card-title` and `card-subtitle` (the names)
   - Each `medallion` block (one per name, Sanskrit + Śaṅkara + English)
   - `verse-anchor` (the BORI śloka, both pādas in Devanagari)
   - `vedic-source` (Upaniṣad/Gītā citation)
   - `synthesis` (what the cluster teaches together)
   - `bhakti` (what the bhakta does with this contemplation)
   - `card-meta` (śloka number, movement, etc.)
3. Drop the illustration into `img/NN-...png`, swap the `<svg>` placeholder
   with `<img src="../img/NN-....png" alt="…">`.
4. Add a `<li>` to `index.html` pointing at the new file.
5. Mirror the file under `te/vsn-cards/content/` for the Telugu set.

## Where the source research lives

Card content draws from these locked Phase-A documents in `/storage/mbh/vsn/`:

- `nama_krama_domain_segments.md` — the 7 movements
- `essay_dharma_satya.md` — dharma quarantine
- `project_vsn_metrical_analysis_corrected.md` — pathyā/vipulā numbers
- `nama_krama_commentary_verification.md` — Śaṅkara/Bhaṭṭar 8 clusters
- `three_way_comparison.md` — BORI / Bhaṭṭar / Śaṅkara
- `nama_krama_graph_stats.md` — multilayer graph
- `vsn_mantra_encoding_analysis.md` — 3 Vedas, 24 Keśavādi, astronomical layer
- `shankara_bhashya_ocr.txt` — Śaṅkara's bhāṣya (OCR; verify load-bearing quotes
  against the printed Anantakrishna Sastry edition)

## Footer (brand spine — never remove)

Every card carries, in the footer:

> ॐ एकं सत् · The Ekam Sat Project · Kiran Boggavarapu · ayamatma.com

(Telugu: ॐ ఏకం సత్ · ఏకం సత్ ప్రాజెక్ట్ · కిరణ్ బొగ్గవరపు · ayamatma.com)

## Production: PNG and PDF export (later)

When the deck is content-complete and edits stabilize:

- PNG (1080×1350 social): Playwright/Puppeteer script screenshots each
  card URL → `exports/png/`.
- PDF (A5 print): browser `Cmd-P` or scripted `page.pdf({format:'A5'})` →
  `exports/pdf/`.

The card's `@page` and `@media print` rules already set this up cleanly.
