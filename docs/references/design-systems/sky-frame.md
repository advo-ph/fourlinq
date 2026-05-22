---
version: alpha
name: Sky-Frame-design-analysis
description: Swiss minimalist sliding-window manufacturer. Editorial calm with a single confident orange accent (#EB5A05), nearly invisible chrome, Gotham sans + Mercury Text G4 serif pairing. The site treats their frameless sliding panels as architecture, not product — image-led layouts where photographs frequently bleed beyond the container into negative space. Less ornament than Marvin, more restraint than Schüco.
source: sky-frame.com — extracted from /static/main.41c4b01d86d6.css (single 218KB stylesheet)

colors:
  accent-orange: "#EB5A05"
  accent-orange-bright: "#FF5A00"
  secondary-red: "#9D0D15"
  ink-display: "#1D1D1B"
  ink-body: "#4F4E52"
  ink-muted: "#7D7D7D"
  ink-faint: "#979797"
  hairline: "#898989"
  canvas-white: "#FFFFFF"
  canvas-soft: "#F3F3F3"
  divider-light: "#D8D8D8"

typography:
  primary-sans: "Gotham (Hoefler & Co commercial)"
  primary-serif: "Mercury Text G4 (Hoefler & Co commercial)"
  icon-font: "SkyframeIcon (custom)"
  body:
    fontFamily: "Gotham A, Gotham B, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontSize: 14px
  caption:
    fontSize: 12px
  body-lg:
    fontSize: 18px
  lead:
    fontSize: 21px
  h-display:
    fontFamily: "Gotham, sans-serif"
    fontSize: 36px
    fontWeight: 600
  h1:
    fontSize: 32px
  h2:
    fontSize: 24px
  h3:
    fontSize: 21px
  scale:
    "12, 13, 14, 16, 18, 21, 24, 32, 36"

rounded:
  none: "0"
  note: "Sky-Frame uses essentially zero radius — buttons are sharp rectangles, cards are sharp rectangles. Maximum visual restraint."

spacing:
  scale: "Multiples of 4px (4, 8, 12, 16, 24, 32, 48, 64)"
  section-padding: "Generous — typically 80-120px between sections"
  container-max: "Approximately 1440px"

motion:
  approach: "Minimal. Most interactions are simple fade or color transition; no dramatic motion. Image-led sections favor still photography over animation."
  hover-default: "200-300ms ease-out"

elevation:
  approach: "Almost no shadows. The brand sells frameless windows where the architectural intent is invisible edges — the UI reflects that. When elevation is needed, it's a single hairline rule, not a drop shadow."

layout:
  approach: "Asymmetric grids. Photos frequently break out of the container into the page margin — full-bleed image with a single column of text floating beside it. Negative space is treated as a design element."
  text-columns: "Narrow — typically 480-640px max for body prose"
---

## Overview

Sky-Frame makes the world's slimmest sliding-glass window systems out of Switzerland (Frauenfeld factory). The site's design DNA is **Swiss-Modernist restraint** — generous white space, asymmetric layouts, single-accent color, photography that floats rather than encloses.

**Voice:** quiet, precise, architectural. Sentences are short. Verbs are passive. Sky-Frame doesn't sell windows; they offer "openings".

**The single signature move:** the orange accent (`#EB5A05`). Bold, saturated, surprisingly warm against the otherwise cool gray-and-white palette. Used for hover states, single CTA buttons, eyebrow highlights — never for area fills. The contrast against the otherwise quiet palette makes the orange unmistakably "Sky-Frame" even at thumbnail size.

## Colors

- **`accent-orange` (`#EB5A05`)** — the brand color. 80 occurrences in CSS, dominant interactive color. Saturated and warm; reads as confident-but-Swiss against the cool gray neutrals.
- **`secondary-red` (`#9D0D15`)** — deep blood-red used for error states and the rare emergency-emphasis moment. Visibly different from the orange to avoid confusion.
- **Ink scale:** `#1D1D1B` (deep charcoal, just shy of black) → `#4F4E52` (body) → `#7D7D7D` (muted) → `#979797` (faint). Wider step between body and muted than Marvin uses.
- **Canvas:** pure white `#FFFFFF` and a single off-white `#F3F3F3` for section alternation. **No warm cream tint** — Sky-Frame stays cool.

## Typography

**Pairing:** Gotham (sans, Hoefler & Co) + Mercury Text G4 (serif, Hoefler & Co). Both commercial typefaces, premium licenses. Mercury Text is the serif used for the largest editorial moments — most body and UI is Gotham sans.

**Scale is dense and Swiss:** 12, 13, 14, 16, 18, 21, 24, 32, 36px. **No 88px or 64px headlines.** Sky-Frame caps headlines at 36px desktop — restraint over impact. The photography does the dramatic work; type stays small and refined.

**Body is 16px**, matching Marvin. The Sky-Frame look is achieved by **scaling everything down compared to American luxury sites** — headlines are 40-60% smaller than Marvin's, with proportionally more whitespace around them.

## Layout

**Asymmetric grids.** A typical Sky-Frame section is: one column of body text at 480-640px width, anchored to one side, with a full-bleed photograph occupying 70%+ of the viewport on the other side. The photograph often extends beyond the container into the page margin.

**Negative space as a structural element.** A section may be 90% empty. The 10% of content is positioned with extreme intentionality. This is the move you can't fake — it requires editorial confidence to ship a page that feels "empty" by SaaS standards.

**Photography style:** muted color grading, slight desaturation, often shot in overcast light. Frameless glass means very subtle edge definition — the photos sell the architecture, not the windows.

## Elevation & Depth

**Almost none.** Sky-Frame makes frameless windows; the UI carries the same intent. When elevation is needed, it's a single 1px hairline rule, not a drop shadow. Cards exist as image + text blocks, not as elevated container chrome.

## Shapes

**Zero radius everywhere.** Buttons are sharp rectangles. Cards are sharp rectangles. Even the smallest UI elements (badges, tags) use 0 or near-0 corner radius. The visual language is "architectural detailing".

## Components

### The signature CTA
Orange-filled rectangle, white text, zero radius, generous internal padding. Used once per fold, never twice.

### Asymmetric image-text section
Most-used pattern: 60/40 split between full-bleed photo and a narrow text column. Text column has eyebrow + h2 + 2-3 paragraphs + single chevron link.

### Footer
Multi-column hairline grid, very dense. Email signup form is full-width within the footer.

## Do's and Don'ts

**Do:**
- Restrict accent to a single bold color (orange in their case)
- Use generous negative space — at least 40% of any viewport should be empty
- Asymmetric layouts where photography breaks the column grid
- Cool palette only, no warm tints

**Don't:**
- Don't use multiple accent colors
- Don't add shadows or rounded corners
- Don't oversized headlines — Sky-Frame caps at 36px desktop
- Don't decorate. If a flourish is optional, remove it.

## Responsive Behavior

Layout collapses to single-column stack on mobile. The asymmetry that defines desktop is lost on small screens — Sky-Frame intentionally accepts this rather than trying to preserve it. Mobile becomes traditional one-column editorial.

## Iteration Guide

If you cite Sky-Frame in a redesign brief, the most-quoted moves:
1. **Single bold accent color** (any saturated warm color) against an otherwise cool gray-and-white palette
2. **Headlines capped at 36px desktop** — restraint as the aesthetic
3. **Asymmetric grid with photography breaking the container**
4. **Zero corner radius across the entire UI**
5. **Negative space as 40%+ of every viewport**

## Known Gaps

Single-CSS extraction (no JS interactions probed). Image lazy-loading and gallery filters not analyzed.
