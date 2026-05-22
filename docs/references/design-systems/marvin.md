---
version: alpha
name: Marvin-design-analysis
description: American luxury residential windows + doors. Editorial photography-led with full-bleed lifestyle imagery, generous vertical breathing room, restrained accent usage, and a confident commercial serif (TabacG1) paired with Klim's Nationale sans. Photography does 80% of the storytelling — every page is paced like a print catalog. Yellow brand accent (#FFC600) is reserved for state and structural moments, never for area fills.
source: marvin.com — extracted from 156 production CSS bundles + 14 page templates (see ./docs/REDESIGN_ROADMAP.md §13 for the full grep)

colors:
  primary-yellow: "#FFC600"
  primary-yellow-700: "#B78600"
  primary-blue: "#0075C9"
  primary-blue-700: "#00416B"
  ink-display: "#242424"
  ink-body: "#444444"
  ink-muted: "#686868"
  ink-faint: "#909090"
  hairline-soft: "#DFDFDF"
  hairline-strong: "#D4D4D4"
  canvas-white: "#FFFFFF"
  canvas-soft: "#F8F8F8"
  canvas-cream: "#E7E5DD"
  error: "#D92D20"
  success: "#12B76A"
  warning: "#F79009"
  info: "#0202FE"
  mch-teal: "#18414A"

typography:
  primary-pair:
    sans: "Nationale (custom commercial, Klim Type Foundry)"
    serif: "TabacG1 (custom commercial, Suitcase Type)"
  secondary-pair:
    sans: "Apercu (custom commercial, Colophon)"
    serif: "Grifo (custom commercial, Production Type)"
  hjumbo:
    fontFamily: "TabacG1, serif"
    fontSize: 88px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.02em
  h1-desktop:
    fontFamily: "TabacG1, serif"
    fontSize: 56px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.02em
  h2-desktop:
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
  body:
    fontFamily: "Nationale, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  eyebrow:
    fontSize: 13-15px
    fontWeight: 500
    letterSpacing: 0.10-0.16em
    textTransform: uppercase
  scale-tokens:
    v-font-size-025: 10px
    v-font-size-050: 12px
    v-font-size-075: 14px
    v-font-size-100: 16px
    v-font-size-150: 18px
    v-font-size-200: 20px
    v-font-size-250: 24px
    v-font-size-300: 28px
    v-font-size-350: 32px
    v-font-size-400: 40px
    v-font-size-500: 48px
    v-font-size-600: 56px
    v-font-size-700: 64px
    v-font-size-800: 88px

rounded:
  v-border-radius-000: "0"
  v-border-radius-050: "2px"
  v-border-radius-100: "4px"
  v-border-radius-200: "8px"
  v-border-radius-250: "12px"
  v-border-radius-400: "24px"
  v-border-radius-full: "9999px"
  button-rule: "Either 0 (square / utility) OR pill (consumer CTAs). Never 4/8/12/24 on buttons."

spacing:
  v-space-000: "0"
  v-space-050: "2px"
  v-space-100: "4px"
  v-space-200: "8px"
  v-space-250: "12px"
  v-space-300: "16px"
  v-space-350: "20px"
  v-space-400: "24px"
  v-space-500: "32px"
  v-space-600: "40px"
  v-space-700: "48px"
  v-space-800: "56px"
  v-space-900: "64px"
  section-padding-desktop: "120px"
  grid-gutter: "20px"
  container-max: "1400px"

motion:
  signature-ease: "cubic-bezier(.68, 0, .33, 1)"
  ease-in: "cubic-bezier(.33, 0, .68, 0)"
  ease-out: "cubic-bezier(.33, 1, .68, 1)"
  hover-default: "300ms cubic-bezier(.68, 0, .33, 1)"
  image-ken-burns: "8000ms cubic-bezier(.68, 0, .33, 1)"
  v-animation-duration-100: "100ms"
  v-animation-duration-200: "200ms"
  v-animation-duration-300: "300ms"
  v-animation-duration-400: "400ms"
  v-animation-duration-500: "500ms"

elevation:
  depth-2: "0 .25px 1px 0 rgba(36,36,36,.04), 0 .85px 3px 0 rgba(36,36,36,.19)"
  depth-6: "0 .25px 3px 0 rgba(36,36,36,.04), 0 2.75px 9px 0 rgba(36,36,36,.19)"
  note: "Two-layer shadows. Both extremely subtle — depth-2 is 1px blur, depth-6 is 9px. Premium feel comes from LOW elevation."

layout:
  container-max: "87.5rem (1400px)"
  reading-max: "62.5rem (1000px)"
  header-height-mobile: "64px"
  header-height-desktop: "72px"
  breakpoints-primary:
    sm: "576px"
    md: "768px"
    lg: "992px (dominant — 751 occurrences in CSS)"
    xl: "1200px"
    "2xl": "1320px"
    "3xl": "1400px"
  grid-system: "Bootstrap 5 base, 20px gutter, repeat(N, minmax(0, 1fr)) for blowout protection"
  subgrid-usage: "14 places — card titles align across rows via subgrid"
  text-transform-uppercase: "41 occurrences, used structurally (eyebrows, filter chips, footer column heads) NOT decoratively"
  aspect-ratios-canonical:
    "1/1": "36× — square product tiles"
    "16/9": "24× — landscape hero, video"
    "3/2": "12× — classic photo"
    "5/4": "10× — portrait-landscape"
    "4/5": "6× — portrait inspiration cards"
    "2/1": "6× — ultrawide section dividers"
---

## Overview

Marvin is a 100-year American windows-and-doors manufacturer based in Warroad, Minnesota. The site reads like *Architectural Digest* — photography-first, generous editorial pacing, restrained typography, single-color brand accent reserved for state moments. Five product collections (Modern, Elevate, Essential, Ultimate, Vivid) anchor the catalog, and roughly 1300 dealer pages anchor the IA.

**Voice:** confident, descriptive, history-conscious ("for over 100 years"). Uses "we" and "our" generously. Editorial in tone, never breathless.

**Key visual move:** the 5.5× type contrast between display headlines (88px) and body text (16px). Most premium sites overshoot body size trying to feel editorial; Marvin keeps body small and lets the headline do all the work.

## Colors

Marvin runs a **dual-primary system** — the `--color-primary-*` token resolves to **either yellow or blue** depending on page/section context, set higher in the cascade.

- **Yellow ramp (consumer / brand pages):** `#fff8df` → `#ffc600` → `#b78600`. `#FFC600` is the headline brand color — used on the home, collection pages, and inspiration. Hi-saturation but used sparingly (single state markers, not area fills).
- **Blue ramp (corporate / info contexts):** `#e3f5ff` → `#0075c9` → `#00416b`. `#00416B` is named `--color-dusk` and appears as the deep-blue text accent on corporate pages.
- **Neutrals (hardcoded):** `#f5f5f5` → `#242424`. Standard premium charcoal-on-white system. `#242424` is the canonical display color — 14% lighter than true black, intentionally.
- **`canvas-cream` (`#E7E5DD`)** — warm off-white used as alternate backdrop for editorial sections (not just `#F8F8F8` gray-tinted soft). The warm tint is the signature "magazine page" feel.
- **Special: `--color-mch` (`#18414A`)** — dark teal for the Marvin Connected Home sub-brand. Their answer to "we have a smart-home line that needs its own visual identity without breaking the master brand".

## Typography

**Pairing:** Nationale (sans, by Klim) + TabacG1 (serif, by Suitcase Type). Both commercial licenses, probably $300-600 each per platform. The combo is what gives the site its print-catalog feel.

**Scale:** the canonical 14-step ramp from 10px (micro labels) to 88px (`hjumbo`). Body sits at 16px; the contrast ratio with the 88px headline is 5.5×.

**Eyebrows:** uppercase, tracked 0.10-0.16em, 13-15px, used as **structural section markers**. Letter-spacing on the eyebrow is the only positive-tracking instance — body has zero tracking, display has negative tracking.

**Headlines never go above weight 600.** Most h1s are weight 500 (medium). The serif typeface does the visual weight, not bold weight.

## Layout

**Container:** 1400px max. On laptops < 1320px, content sits flush to the viewport edge — this is intentional pacing.

**Grid:** Bootstrap 5 base, 20px gutter (`--bs-gutter-x: 20px`), `minmax(0, 1fr)` everywhere to prevent text overflow. Heavy use of CSS `subgrid` (14 places) so card titles align across rows even with variable-length titles.

**Section padding:** 120px desktop / 72px tablet / 48px mobile (Marvin's exact values). These are the editorial pacing constants; don't compress them.

**Dominant breakpoint:** 992px (lg). 751 `@media` rules cite it. Marvin's design pivot is `lg`, not `xl`.

## Elevation & Depth

**Two-layer shadows, ultra-subtle.** Two canonical depths: `depth-2` (1px blur) and `depth-6` (9px blur). Premium feel = low elevation. Tailwind's default `shadow-md` (6px blur) is heavier than Marvin's heaviest `depth-6`.

## Shapes

**Buttons binary:** pill (`9999px`) for consumer CTAs, square (`0`) for utility / data UI. Never 4/8/12/24 radius on a button.

**Cards:** zero radius preferred. The image-led card pattern uses no border, no shadow at rest — the image and serif title carry the weight.

## Components

### Header (Marvin's mega-menu)
Sticky 72px desktop / 64px mobile, full-width white. Hovering a nav item drops a full-bleed flyout with a blur layer over the page content. The flyout uses a 4-column card grid: collection tiles on the left, featured editorial card on the right. "Mega menu but tasteful" — not a long list of text links, but a grid of products with images.

### Image-led card (`CollectionCard_*`)
No border, no rounded corners, no shadow at rest. Image tops a content block with eyebrow + serif title + body-sm description + chevron arrow. Hover: image scales 1.03 over 700ms with the signature ease curve; title turns yellow; chevron arrow translates `+0.5px` right.

### Feature Link (`FeatureLink_*`)
Text + chevron arrow. Hover: text turns accent, arrow translates. Used 50+ times across the site.

### Color Mode wrapper (`ColorMode_*`)
A wrapper that switches the entire token set for a section. Lets one section render with cream bg + dark text + light-tone shadows while the next is white + standard. Avoids per-section token overrides.

### Hero
Full-bleed photo or video. Bottom-up gradient scrim. Single primary CTA + ghost secondary CTA. Caption above headline in tracked-uppercase. Marvin's signature: the headline is enormous (88px) and the lede is small (16-18px) — 5× contrast.

## Do's and Don'ts

**Do:**
- Use the canonical 14-step type scale (10 → 88)
- Eyebrow above headline with hairline prefix
- Image hover-scale 1.03 over 700ms
- Two-tone section alternation (white → cream → white → dark → white)
- Reserve accent (yellow) for state markers and structural emphasis, never area fills

**Don't:**
- Don't use the yellow as a section background
- Don't introduce shadows above `depth-6`
- Don't decorate eyebrows — they're structural
- Don't use two accent colors simultaneously (yellow + blue contexts are mutually exclusive per page)

## Responsive Behavior

Dominant pivot is 992px. Mobile (≤575px) gets a hamburger drawer with the full nav flattened. Tablet (768-991px) keeps the desktop layout largely intact but compresses photo grids from 3-up to 2-up.

## Iteration Guide

When citing Marvin in a redesign brief, the most-quoted moves:
1. **The yellow + cream + dark trinity** — section tone alternation that defines the brand
2. **The 5.5× type contrast** between headline and body
3. **The 700ms image-zoom ease** with `.68,0,.33,1`
4. **The 20px Bootstrap grid gutter** + subgrid for card alignment
5. **The hairline-prefix eyebrow** (`—— EYEBROW`) as the section opener

## Known Gaps

This extraction is from the **rendered CSS** only. Not extracted:
- JS-driven interactions (search modal, dealer-locator map, gallery filters)
- Mobile hamburger drawer behavior beyond the markup structure
- Specific font-weight per-element rules within long-form blog posts
