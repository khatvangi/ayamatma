# Rāma Nivedana — Presentation Plan

## Talk Metadata

- **Title**: The Mountain Inside the Name: What Hides in śrīrāma rāmeti rāme rāme manorame
- **Venue**: Adaptable — temple talk (30 min) / university seminar (50 min) / conference (15 min)
- **Takehome message**: The traditional recitation of the Rāma verse sits at the exact combinatorial peak of 8,192 possible segmentations — the tradition reached the summit before the mountain was drawn.

---

## 15-Minute Conference Version (Digital Humanities / Sanskrit Studies)

| Slide | Assertion Title | Visual | Time |
|-------|----------------|--------|------|
| 1 | The name Rāma is not merely a name — it is a generating function | Devanāgarī verse in large type, audio if possible | 0:30 |
| 2 | Śiva's claim: one name equals a thousand | Source verse + Padma Purāṇa / VS phala-śruti citation | 1:00 |
| 3 | 29 characters contain 13 binary split-points | **Interactive string** (or static annotated string) with numbered positions | 1:00 |
| 4 | 2¹³ = 8,192: every subset of split-points is a valid segmentation | The number, large. Brief explanation of why this verse uniquely converges formal/filtered counts | 1:00 |
| 5 | The segmentations form Meru Prastāra (Piṅgala's own tool) | **Mountain animation** — build layer by layer. Note: Piṅgala is a Vedāṅga, tradition's own math | 1:30 |
| 6 | The tradition stands at Layer 7 — the exact peak | Mountain with Layer 7 highlighted. ★ marker. THIS IS THE SURPRISE SLIDE | 1:30 |
| 7 | Seven darśanas emerge from boundary placement alone | Table or interactive selector showing Bhakti/Jñāna/Advaita/Mantra/etc. | 1:30 |
| 8 | Death hides inside the name — and the name reverses it | **ram ↔ mar animation**. rāma → mara → amara. Bṛhadāraṇyaka quote | 2:00 |
| 9 | At Layer 13, the verse is 57% rā-me: giving-to-me | Bīja composition visual. The cycling substrate IS japa | 1:30 |
| 10 | The seed is smaller than the tree. The seed contains the tree | Synthesis: Rāma-nāma as generating function → Sahasranāma as enumeration. Ekam sat | 1:00 |
| 11 | Acknowledgments | Brief | 0:30 |
| 12+ | Backup: full 14-layer table, comparison with VS verse 14 and Śiva SN 150, methodology details | For Q&A | — |

**Total: ~13 min**

---

## 30-Minute Temple / Devotional Talk

### Act I: The Verse We Know (10 min)

1. Open with live recitation (speaker or recording)
2. Śiva's claim — equal to a thousand names
3. Devotion's hunger: what did Śiva see?
4. The string: 29 characters, show it whole
5. The three operations (counting, grammar, nirukta) — briefly

### Act II: The Mountain (12 min)

6. 13 split-points → 2¹³ = 8,192 (the audience gasps here)
7. **Build the mountain** (animated or slide-by-slide)
8. Walk through layers: 0 = Brahman, ascending = sṛṣṭi, peak = saṃsāra
9. **Layer 7 reveal**: the tradition stands at the summit
10. The descent: nirukta layers, dissolution back to seeds
11. Layer 13: rā-me cycling — the verse IS japa at its core

### Act III: What Hides at the Boundaries (8 min)

12. eti (he approaches) — the hidden verb
13. **ram ↔ mar** — the devotional center (animated)
14. man ↔ nam — thinking is bowing
15. The fifteen themes in 29 characters
16. What Śiva meant: the seed contains the tree
17. Close with recitation: rā-me · rā-me · rā-me

---

## 50-Minute University Seminar (Sanskrit / Digital Humanities)

Same as temple talk but with:
- Full methodology section: why binary boundary analysis, how Piṅgala's system applies
- Detailed comparison data: VS verse 14 (54.5B filtered, asymmetric) vs. Śiva SN 150 (271.8B) vs. Rāma verse (8,192 = converged)
- The seven readings presented individually with grammatical parse
- Discussion of the three-operation taxonomy as methodological contribution
- Extended Q&A with backup slides on every nirukta finding

---

## Visualization Assets Needed

| Asset | Tool | Format | Status |
|-------|------|--------|--------|
| Interactive string explorer | React (built) | .jsx → web embed | ✅ Built |
| Meru Prastāra mountain animation | Manim (built) | .mp4 / .gif | ✅ Script ready |
| ram ↔ mar reversal animation | Manim (built) | .mp4 / .gif | ✅ Script ready |
| Bīja composition (Layer 13) | Manim (built) | .mp4 / .gif | ✅ Script ready |
| String with split-points | Manim (built) | .mp4 / .gif | ✅ Script ready |
| Seven darśana selector | React (built) | .jsx → web embed | ✅ Built |
| Breath shape curve | Flourish or Matplotlib | .svg / .html | ☐ To build |
| Comparison table (VS/ŚivaSN) | Datawrapper or Matplotlib | .svg / embed | ☐ To build |
| Static string diagram (for print) | Inkscape / Matplotlib | .svg / .pdf | ☐ To build |

---

## Transition Script (key narrative joints)

- **Verse → String**: "Remove the spaces. Write it as a single current of sound. Now count."
- **Count → Mountain**: "Those 8,192 segmentations are not random. They organize themselves into a shape the tradition already knew."
- **Mountain → Layer 7**: "And where does the tradition stand? At the summit. Before the mountain was drawn."
- **Layer 7 → Descent**: "The left slope is creation. The peak is maximum manifestation. The right slope is the return."
- **Descent → ram/mar**: "At the boundaries, something else is hiding. The name contains its own negation — and the negation of that negation."
- **ram/mar → Synthesis**: "The Sahasranāma enumerates. The Rāma verse generates. A list can end. A seed continues to yield."

---

## Audience Calibration Notes

**For devotees (temple)**: Lead with recitation and Śiva's authority. The mathematics is the surprise, not the premise. Use the mountain as wonder, not as proof. End with devotional closing.

**For scholars (university)**: Lead with the methodological novelty — binary boundary analysis applied to mantra. The devotional readings are examples, not conclusions. Emphasize the comparison data. End with the taxonomy (formal/derived/devotional) as methodological contribution.

**For mixed audience (conference)**: Lead with the hook ("what hides inside 29 syllables?"). Show just enough method to establish credibility. Emphasize the Layer 7 finding as the centerpiece. The mountain does the work for both audiences simultaneously — the bilingual figure.
