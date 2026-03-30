"""
Rāma Nivedana — Manim Animation Scripts
========================================
Requires: pip install manim (Community Edition)
Render:   manim -pqh rama_animations.py MeruMountain
          manim -pqh rama_animations.py RamMarReversal
          manim -pqh rama_animations.py StringExplore
          manim -pqh rama_animations.py BijaComposition

For GIF export (slides): manim -pqh --format=gif rama_animations.py RamMarReversal
"""

from manim import *
import numpy as np
from math import comb

# Colors
BLUE_ACCENT = "#2171b5"
RED_ACCENT  = "#cb181d"
GREEN_ACCENT = "#238b45"
GREY_CONTEXT = "#bdbdbd"
GOLD = "#d4a017"

# ============================================================
# SCENE 1: The Meru Prastāra Mountain
# ============================================================
class MeruMountain(Scene):
    """Builds the mountain layer by layer, then marks Layer 7."""

    def construct(self):
        self.camera.background_color = WHITE

        title = Text("Meru Prastāra", font_size=36, color=BLACK, weight=BOLD)
        subtitle = Text("the mountain inside the name", font_size=20, color=GREY_CONTEXT)
        subtitle.next_to(title, DOWN, buff=0.2)
        self.play(Write(title), FadeIn(subtitle, shift=UP*0.2))
        self.wait(1)
        self.play(FadeOut(title), FadeOut(subtitle))

        layers = [comb(13, k) for k in range(14)]
        max_val = max(layers)
        max_width = 10
        bar_height = 0.35
        total_height = 14 * (bar_height + 0.08)
        start_y = total_height / 2

        bars = VGroup()
        labels_left = VGroup()
        labels_right = VGroup()

        for k, count in enumerate(layers):
            w = (count / max_val) * max_width
            y = start_y - k * (bar_height + 0.08)

            bar = Rectangle(
                width=w, height=bar_height,
                fill_color=GREY_CONTEXT, fill_opacity=0.4,
                stroke_width=0, corner_radius=0.05
            )
            bar.move_to([0, y, 0])
            bars.add(bar)

            lbl = Text(str(k), font_size=14, color=GREY_CONTEXT)
            lbl.next_to(bar, LEFT, buff=0.3)
            labels_left.add(lbl)

            cnt = Text(f"{count:,}", font_size=12, color=GREY_CONTEXT)
            cnt.next_to(bar, RIGHT, buff=0.2)
            labels_right.add(cnt)

        # Build layer by layer
        for k in range(14):
            self.play(
                GrowFromCenter(bars[k]),
                FadeIn(labels_left[k]),
                FadeIn(labels_right[k]),
                run_time=0.3
            )

        self.wait(0.5)

        # Highlight Layer 7 — tradition
        tradition_bar = bars[7]
        self.play(
            tradition_bar.animate.set_fill(BLUE_ACCENT, opacity=0.9),
            run_time=0.5
        )

        star = Text("★ tradition stands here", font_size=16, color=BLUE_ACCENT, weight=BOLD)
        star.next_to(tradition_bar, RIGHT, buff=0.4)
        self.play(FadeIn(star, shift=LEFT*0.3))
        self.wait(1)

        # Highlight twin peak
        self.play(bars[6].animate.set_fill(ManimColor(BLUE_ACCENT), opacity=0.5), run_time=0.3)
        twin = Text("twin peak — unexplored", font_size=14, color=ManimColor(BLUE_ACCENT))
        twin.next_to(bars[6], RIGHT, buff=0.4)
        self.play(FadeIn(twin))
        self.wait(1)

        # Show total
        total_text = Text("2¹³ = 8,192 total segmentations", font_size=24, color=BLACK, weight=BOLD)
        total_text.to_edge(DOWN, buff=0.5)
        self.play(Write(total_text))
        self.wait(2)


# ============================================================
# SCENE 2: ram ↔ mar Reversal
# ============================================================
class RamMarReversal(Scene):
    """Animates the phonemic reversal from rāma to mara,
    then the japa cycling that produces amara."""

    def construct(self):
        self.camera.background_color = WHITE

        # Phase 1: rāma
        letters_rama = VGroup(*[
            Text(ch, font_size=64, color=BLUE_ACCENT, weight=BOLD)
            for ch in ["r", "ā", "m", "a"]
        ]).arrange(RIGHT, buff=0.3)

        label_rama = Text("rāma — the name — √ram: delight", font_size=20, color=BLACK)
        label_rama.next_to(letters_rama, DOWN, buff=0.6)

        self.play(LaggedStart(*[FadeIn(l, shift=UP*0.3) for l in letters_rama], lag_ratio=0.15))
        self.play(FadeIn(label_rama))
        self.wait(1.5)

        # Phase 2: reverse to mara
        self.play(FadeOut(label_rama))

        target_positions = [letters_rama[3-i].get_center() for i in range(4)]
        self.play(
            *[letters_rama[i].animate.move_to(target_positions[i]) for i in range(4)],
            run_time=1.5,
            rate_func=smooth
        )

        # Change colors to red
        self.play(*[letters_rama[i].animate.set_color(RED_ACCENT) for i in range(4)])

        label_mara = Text("mara — death — √mṛ: to die", font_size=20, color=RED_ACCENT)
        label_mara.next_to(letters_rama, DOWN, buff=0.6)
        self.play(FadeIn(label_mara))
        self.wait(1.5)

        # Phase 3: fade out and show japa
        self.play(FadeOut(letters_rama), FadeOut(label_mara))

        japa_text = Text("rāmarāmarāma...", font_size=48, color=BLUE_ACCENT, weight=BOLD)
        japa_label = Text("continuous japa", font_size=18, color=GREY_CONTEXT)
        japa_label.next_to(japa_text, DOWN, buff=0.3)
        self.play(Write(japa_text), FadeIn(japa_label))
        self.wait(1)

        # Phase 4: re-segment to show amara
        self.play(FadeOut(japa_text), FadeOut(japa_label))

        # Show the re-segmentation
        parts = VGroup(
            Text("a", font_size=56, color=GREEN_ACCENT, weight=BOLD),
            Text("·", font_size=56, color=GREY_CONTEXT),
            Text("mara", font_size=56, color=GREEN_ACCENT, weight=BOLD),
            Text("·", font_size=56, color=GREY_CONTEXT),
            Text("mara", font_size=56, color=GREEN_ACCENT, weight=BOLD),
            Text("·", font_size=56, color=GREY_CONTEXT),
            Text("mara", font_size=56, color=GREEN_ACCENT, weight=BOLD),
        ).arrange(RIGHT, buff=0.1)

        amara_label = Text("amara — the deathless", font_size=24, color=GREEN_ACCENT, weight=BOLD)
        amara_label.next_to(parts, DOWN, buff=0.6)

        upanishad = Text("mṛtyor mā amṛtaṃ gamaya", font_size=18, color=BLACK,
                         slant=ITALIC)
        upanishad.next_to(amara_label, DOWN, buff=0.4)

        self.play(LaggedStart(*[FadeIn(p, shift=UP*0.2) for p in parts], lag_ratio=0.1))
        self.play(FadeIn(amara_label, shift=UP*0.2))
        self.play(FadeIn(upanishad))
        self.wait(3)


# ============================================================
# SCENE 3: String with Split-Points
# ============================================================
class StringExplore(Scene):
    """Shows the 29-character string, highlights the 13 split-points,
    then demonstrates how the tradition's reading (Layer 7) emerges."""

    def construct(self):
        self.camera.background_color = WHITE

        chars = list("śrīrāmarāmetirāmerāmemanorame")
        split_positions = [2,4,6,8,10,12,14,16,18,20,22,24,26]

        # Build character display
        char_mobs = VGroup()
        for i, ch in enumerate(chars):
            t = Text(ch, font_size=28, color=BLACK)
            char_mobs.add(t)

        char_mobs.arrange(RIGHT, buff=0.08)
        char_mobs.move_to(ORIGIN + UP*1.5)

        # Position numbers
        pos_nums = VGroup()
        for i, ch_mob in enumerate(char_mobs):
            n = Text(str(i), font_size=10, color=GREY_CONTEXT)
            n.next_to(ch_mob, DOWN, buff=0.15)
            pos_nums.add(n)

        self.play(
            LaggedStart(*[FadeIn(c, shift=DOWN*0.1) for c in char_mobs], lag_ratio=0.03),
            LaggedStart(*[FadeIn(n) for n in pos_nums], lag_ratio=0.03),
        )
        self.wait(1)

        # Title
        title = Text("29 characters · 13 split-points", font_size=18, color=GREY_CONTEXT)
        title.to_edge(UP, buff=0.3)
        self.play(FadeIn(title))

        # Show split-point markers
        markers = VGroup()
        for sp in split_positions:
            line = Line(
                char_mobs[sp].get_bottom() + DOWN*0.4,
                char_mobs[sp].get_bottom() + DOWN*1.0,
                stroke_width=2, color=BLUE_ACCENT, stroke_opacity=0.4
            )
            markers.add(line)

        self.play(LaggedStart(*[Create(m) for m in markers], lag_ratio=0.05))
        self.wait(0.5)

        count_text = Text("2¹³ = 8,192 possible segmentations", font_size=22,
                          color=BLUE_ACCENT, weight=BOLD)
        count_text.next_to(char_mobs, DOWN, buff=1.5)
        self.play(Write(count_text))
        self.wait(1)

        # Show tradition reading: splits at 2,6,10,12,16,20,26
        tradition_splits = [2,6,10,12,16,20,26]
        self.play(FadeOut(count_text))

        tradition_label = Text("The tradition's reading — Layer 7 — the peak",
                               font_size=18, color=BLUE_ACCENT, weight=BOLD)
        tradition_label.next_to(char_mobs, DOWN, buff=1.5)

        # Highlight active splits
        active_markers = VGroup()
        for i, sp in enumerate(split_positions):
            if sp in tradition_splits:
                new_line = Line(
                    char_mobs[sp].get_bottom() + DOWN*0.4,
                    char_mobs[sp].get_bottom() + DOWN*1.0,
                    stroke_width=4, color=BLUE_ACCENT
                )
                active_markers.add(new_line)
                self.play(Transform(markers[i], new_line), run_time=0.15)

        self.play(Write(tradition_label))

        # Show segmented text below
        segs = ["śrī", "rāma", "rāme", "iti", "rāme", "rāme", "mano", "rame"]
        seg_mobs = VGroup(*[
            Text(s, font_size=24, color=BLACK, weight=BOLD)
            for s in segs
        ]).arrange(RIGHT, buff=0.25)
        seg_mobs.next_to(tradition_label, DOWN, buff=0.5)

        self.play(LaggedStart(*[FadeIn(s, shift=UP*0.2) for s in seg_mobs], lag_ratio=0.1))
        self.wait(3)


# ============================================================
# SCENE 4: Bīja Composition at Layer 13
# ============================================================
class BijaComposition(Scene):
    """Shows the 14 atoms at Layer 13 and their frequency distribution,
    ending with the rā-me cycling insight."""

    def construct(self):
        self.camera.background_color = WHITE

        atoms = ["śrī","rā","ma","rā","me","ti","rā","me","rā","me","ma","no","ra","me"]
        colors_map = {"rā": BLUE_ACCENT, "me": "#4292c6", "ma": "#6baed6",
                      "śrī": GREY_CONTEXT, "ti": GREY_CONTEXT,
                      "no": GREY_CONTEXT, "ra": RED_ACCENT}

        title = Text("Layer 13: total atomization", font_size=24, color=BLACK, weight=BOLD)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))

        # Show atoms
        atom_mobs = VGroup()
        for a in atoms:
            box = VGroup(
                RoundedRectangle(
                    width=0.7, height=0.7, corner_radius=0.1,
                    fill_color=colors_map.get(a, GREY_CONTEXT),
                    fill_opacity=0.85, stroke_width=0
                ),
                Text(a, font_size=20, color=WHITE, weight=BOLD)
            )
            atom_mobs.add(box)

        atom_mobs.arrange(RIGHT, buff=0.1)
        atom_mobs.move_to(ORIGIN + UP*0.5)

        self.play(LaggedStart(*[FadeIn(a, shift=UP*0.3) for a in atom_mobs], lag_ratio=0.08))
        self.wait(1)

        # Show the 57% insight
        insight = Text("rā + me = 57%", font_size=28, color=BLUE_ACCENT, weight=BOLD)
        insight.next_to(atom_mobs, DOWN, buff=0.8)

        meaning = Text("giving-to-me · the cycling substrate of japa",
                        font_size=16, color=GREY_CONTEXT)
        meaning.next_to(insight, DOWN, buff=0.3)

        self.play(Write(insight))
        self.play(FadeIn(meaning))
        self.wait(1)

        # Final line
        final = Text("rā-me · rā-me · rā-me · rā-me",
                      font_size=32, color=BLUE_ACCENT, weight=BOLD)
        final.to_edge(DOWN, buff=0.8)
        self.play(FadeOut(meaning), Write(final, run_time=2))
        self.wait(2)
