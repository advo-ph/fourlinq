---
version: alpha
name: Vitrocsa-design-analysis
description: Swiss / French luxury minimalism — the most extreme architectural restraint in the windows industry. Vitrocsa makes frameless sliding windows where the sight-line is 21mm; the site mirrors that ambition with near-invisible UI, near-black charcoal text, and photography that defines the product by what isn't there. Where Sky-Frame is restrained, Vitrocsa is austere.
source: vitrocsa.com — observed from HTML markup (JS-driven content limits CSS extraction)

colors:
  ink-display: "#10182F"
  ink-body: "#32373C"
  ink-secondary: "#484848"
  navy-accent: "#10182F"
  blue-accent: "#3971DD"
  blue-deep: "#2D5EBD"
  canvas-white: "#FFFFFF"
  approach: "Near-monochrome. The navy and the deep charcoal blur together at small sizes. The brand DNA is 'imperceptible difference'."

typography:
  approach: "System sans stack — Helvetica Neue or similar. No custom commercial typeface. Restraint as anti-decoration."
  body:
    fontFamily: "inherit (system stack)"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  scale: "Standard editorial — 14, 16, 18, 24, 32, 48px"
  no-serif: "Vitrocsa uses sans-only — serif would feel too decorative for the brand"

rounded:
  none: "0"
  approach: "Zero corner radius everywhere. The product is frameless glass; the UI is frameless too."

spacing:
  approach: "Extreme — sometimes 200px+ between sections. Photography occupies entire viewports with text floating in the margins."
  container-max: "1280px or narrower — content stays focused, doesn't sprawl"

motion:
  approach: "Imperceptible. Hovers are color-shift only. No image scale, no parallax, no scroll-jacking. The brand says 'we don't need motion to impress you'."

elevation:
  approach: "None. Vitrocsa is the only brand in this reference set with effectively zero shadows of any kind. Even card hovers stay flat."

layout:
  approach: "Photo-dominant. Most viewports are 80-90% photograph. Text floats at the edges in small, almost-disposable blocks."
  text-columns: "Narrow — 400-560px max"
  hero-pattern: "Full-bleed full-viewport photograph with a single line of text overlaid at the corner — usually project name, never marketing copy"
---

## Overview

Vitrocsa is a Swiss-engineered luxury sliding-window brand (now French-owned, sold globally) whose USP is a **21mm sight-line** — the slimmest visible frame in the industry. Their windows are frequently used in Hollywood-tier residential, Apple stores, museum architecture.

The site's design intent: **be invisible.** The product is invisible windows; the website mirrors that ambition. Where Sky-Frame uses an orange accent for one moment of warmth, Vitrocsa refuses even that — the entire site is near-monochrome navy-blue and charcoal-black.

**Voice:** quiet, almost reluctant. Project pages don't describe — they show. Copy is in the past tense, project-by-project, archival rather than promotional.

## Colors

Near-monochrome. The "color" of the brand is the absence of color.

- **`ink-display` / `navy-accent` (`#10182F`)** — deep navy used for headlines AND for the brand's blue accent. At a glance reads as nearly-black, but holds a slight cool tint that distinguishes it from true `#000`.
- **`ink-body` (`#32373C`)** — body text. Marginally lighter than display; a designer would call this "deep gunmetal".
- **`blue-accent` (`#3971DD`)** — the only saturated color on the site. Used sparingly, for links and the rare interactive emphasis. Avoids feeling promotional.

Vitrocsa **deliberately rejects** the "warm cream" backdrop that Marvin uses and even the soft-gray that Sky-Frame uses. Their canvas is pure white, full stop.

## Typography

**System sans stack only.** No custom commercial typeface. The visual language is "Helvetica Neue Light at 14-16px most places". This is unusual for a luxury brand and is the move that defines Vitrocsa's anti-design design: refusing to telegraph "we're premium" via typeface choice.

**Scale is small.** Body 14-16px, lede 18px, h2 24-32px, h1 caps at ~48px. Even the homepage hero stays understated.

**No serif anywhere.** Vitrocsa is sans-only; a serif would feel too decorative for the brand.

## Layout

**Photography-dominant.** Most viewports are 80-90% photograph. Body text is brief and floats at the edges. Project pages are essentially photo galleries with captions; "About" and "Technical" pages keep text in narrow 400-560px columns.

**Generous breathing room.** 200px+ between sections is common. The brand isn't trying to keep you on the page; it's expecting you to dwell on each section before scrolling.

## Elevation & Depth

**None.** No shadows, no card chrome, no elevation of any kind. Cards exist as photo + caption, not as elevated containers.

## Shapes

**Zero radius everywhere.** Buttons, cards, badges, inputs — every corner is sharp. The product is frameless glass; the UI is frameless too.

## Components

### The full-bleed project hero
Single photograph fills the viewport. One line of text overlaid at the corner — usually the project name only, no marketing copy. No CTA visible above the fold.

### Project gallery
Grid of square or 4:5 thumbnails, no captions visible until hover. Clicking opens a fullscreen lightbox.

### The minimal nav
Top bar with logo + 4-5 link items. No mega-menu, no search bar above the fold. Hover state on nav is color-shift only.

### Footer
Single-line dense block at page bottom. Multiple-column layouts found elsewhere on the web are abandoned here — Vitrocsa's footer is editorial restraint at the structural level.

## Do's and Don'ts

**Do:**
- Near-monochrome palette (one cool color + ink shades)
- System sans only — no commercial typeface
- Photography-as-content (80-90% of any viewport)
- Zero corner radius everywhere
- Generous (200px+) section breathing room

**Don't:**
- Don't add a second accent color
- Don't oversize headlines (max ~48px)
- Don't add card chrome or shadows
- Don't add motion beyond color-shift hover
- Don't write promotional copy in headlines — project name only

## Responsive Behavior

Mobile is even more restrained than desktop. Most sections collapse to a single full-bleed photograph with a single caption below. The brand accepts that mobile readers will see less; they don't try to compensate with denser layouts.

## Iteration Guide

If you cite Vitrocsa in a redesign brief, the most-quoted moves:
1. **System sans only** (no custom typeface — anti-luxury signaling)
2. **Near-monochrome palette** — one cool accent and ink shades
3. **Zero shadows, zero radius, zero motion beyond hover**
4. **Photography occupies 80-90% of every viewport**
5. **Project name as the only headline copy**

## When to choose Vitrocsa over Marvin / Sky-Frame / Schüco

- Your audience is **trained architects** who recognize understatement as luxury signaling
- Your projects speak for themselves and **don't need marketing language**
- You sell **bespoke commission work**, not catalog products
- You're confident your visitor came to your site with intent — they already know who you are

## Known Gaps

Heavy JS site — most observable design tokens are from rendered HTML, not extracted CSS. The brand's typography may include subtle custom variants not visible in the source.
