# FourlinQ Restraint Rulebook

External design rulebook. Overrides any default AI design instincts.
Reference brands: **marvin.com**, **apple.com/mac**. When in doubt, look there.

The visual identity already lives in `DESIGN.md` and CSS tokens. This file is
the **negative space** — the things that are forbidden because they read as
AI-generated.

---

## Forbidden — never ship any of these

### Hero
- **No stacked gradient overlays.** Marvin/Apple never put `bg-gradient-to-tr` +
  `bg-gradient-to-b` on a single photo. Pick a photo with built-in dark zones,
  or use a contained two-column layout (photo right, text left on white).
- **No `font-serif italic` display words** inside a serif headline
  (`Why <italic>uPVC</italic>`). It is the most identifiable AI tell.
- **No scroll cues** — no "Scroll ↓" indicator, no animated vertical line.
- **No Ken Burns / slow-zoom on hero images.** A still is a still.
- **No 88vh "cinematic" heroes.** Marvin heroes are ~60–70vh.

### Section rhythm
- **Do not give every section a different visual register.** Pick one or two
  layout patterns and repeat them. Marvin's "Inspiration" page uses the same
  large-photo-then-caption block six times in a row. The rhythm IS the design.
- **No "By the numbers" dark-background stat strips** with giant tabular-nums
  and tiny eyebrows. Corporate-deck cliché.
- **No "numbered eyebrows"** (`01 · Attractive`, `02 · Fire`). Apple and
  Marvin never number sections this way.

### Typography flourishes
- **No hairline-flanked centered text** (`— · — title — · —`). Decorative
  rules around a phrase is an AI staple.
- **No `before:content-['']` hairline prefixes** on eyebrows.
- **Max one display weight per page.** No mixing italic + roman + bold + light
  inside one headline.

### Components
- **No "Default" badge** on a comparison card to indicate the recommended
  option. If a column is the default, just bold its column header.
- **No `border-2`** anywhere. Marvin uses 1px hairlines only.
- **No emoji icons, no lucide icons inside headings**, no decorative SVG blobs.
- **No `shadow-xl` / `shadow-2xl` / glow / colored shadows.** Photography
  provides the depth.

### Animation
- **No custom `@keyframes` inside a page component.** If an animation is
  needed, it lives in tokens. Default to: no animation.
- **No `ScrollReveal` on every element.** Use it sparingly or not at all —
  staggered fade-ins on a 10-section page feel like a portfolio template.

---

## Required — Apple/Marvin defaults

- **White canvas. Black ink.** Dark sections are the exception, not the rhythm.
- **Generous vertical breathing room** between sections (use `Section size="lg"`).
- **One accent color per viewport.** FourlinQ red appears once, as a CTA or a
  single state — never as a decorative line or eyebrow color.
- **Real product / project photography ≥ 60% of any visual element.** If a
  block has no photo, it should be quiet typography on white, not decorative
  geometry.
- **Hairline borders only.** `border` (1px) with `--rule-soft` or `--rule-strong`.
- **Container: `container-editorial` (1400px max).** Do not invent new widths.
- **Buttons: existing `<Button>` primitive.** Solid fill primary, text-only
  secondary. Nothing else.

---

## Self-check before shipping a page

Run this list. If any answer is "yes" — delete it.

1. Does the hero have more than one gradient overlay?
2. Is any display word italicized inside a serif headline?
3. Is there a numbered eyebrow (`01 ·`, `02 ·`)?
4. Is there a scroll indicator?
5. Does the page use more than 2 distinct section layouts?
6. Are there decorative hairlines flanking any centered text?
7. Is there a "by the numbers" stat strip?
8. Is any border thicker than 1px?
9. Are there custom `@keyframes` in the page file?
10. Does every section have its own animation entrance?

If a section is hard to justify against marvin.com or apple.com, cut it.
