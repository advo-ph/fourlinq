---
version: alpha
name: FourlinQ-design-analysis
description: A photography-first editorial interface for a premium uPVC windows and doors brand, calibrated against marvin.com production CSS. Full-bleed project photography, hairline rules, a serif display headline (Instrument Serif) paired with a clean sans (Inter), a single FourlinQ red (#C8102E) used as state and accent only, and the Marvin signature easing curve cubic-bezier(.68, 0, .33, 1) on every transition. UI chrome recedes — no decorative gradients, no heavy shadows, no rounded card chrome. The catalog stays brochure-verified; everything else stays out of the visual.

colors:
  accent: "#C8102E"
  accent-hover: "#A00D26"
  accent-quiet: "rgba(200, 16, 46, 0.08)"
  ink-primary: "#242424"
  ink-secondary: "#444444"
  ink-muted: "#686868"
  ink-faint: "#767676"
  ink-inverse: "#FFFFFF"
  ink-on-dark-primary: "#FFFFFF"
  ink-on-dark-secondary: "rgba(255, 255, 255, 0.78)"
  ink-on-dark-muted: "rgba(255, 255, 255, 0.62)"
  ink-on-dark-faint: "rgba(255, 255, 255, 0.42)"
  canvas-white: "#FFFFFF"
  canvas-soft: "#F8F8F8"
  canvas-cream: "#F9F7F1"
  canvas-dark: "#242424"
  rule-strong: "#D4D4D4"
  rule-soft: "#DFDFDF"
  rule-faint: "rgba(36, 36, 36, 0.06)"
  on-primary: "#FFFFFF"
  on-dark: "#FFFFFF"

typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: 88px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: -0.025em
  display-sm:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: 56px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.02em
  h1:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.02em
  h2:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: 56px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.02em
  h3:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: -0.015em
  h4:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: -0.01em
  h5:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: -0.01em
  h6:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: -0.005em
  lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  eyebrow-l:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.10em
    textTransform: uppercase
  eyebrow:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.12em
    textTransform: uppercase
  eyebrow-s:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.15em
    textTransform: uppercase

rounded:
  none: "0"
  xs: "2px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  pill: "9999px"

spacing:
  "0": "0"
  "050": "2px"
  "100": "4px"
  "200": "8px"
  "250": "12px"
  "300": "16px"
  "350": "20px"
  "400": "24px"
  "500": "32px"
  "600": "40px"
  "700": "48px"
  "800": "56px"
  "900": "64px"
  section-mobile: "48px"
  section-tablet: "72px"
  section-desktop: "120px"

motion:
  ease: "cubic-bezier(.68, 0, .33, 1)"
  ease-in: "cubic-bezier(.33, 0, .68, 0)"
  ease-out: "cubic-bezier(.33, 1, .68, 1)"
  duration-instant: "100ms"
  duration-quick: "200ms"
  duration-base: "300ms"
  duration-slow: "500ms"
  duration-cinematic: "1200ms"

elevation:
  depth-1: "0 0 1px 0 rgba(36,36,36,0.04), 0 0.5px 1.5px 0 rgba(36,36,36,0.19)"
  depth-2: "0 0.25px 1px 0 rgba(36,36,36,0.04), 0 0.85px 3px 0 rgba(36,36,36,0.19)"
  depth-4: "0 0.5px 1.75px 0 rgba(36,36,36,0.04), 0 1.85px 6.25px 0 rgba(36,36,36,0.19)"
  depth-6: "0 0.25px 3px 0 rgba(36,36,36,0.04), 0 2.75px 9px 0 rgba(36,36,36,0.19)"
  depth-8: "0 0.5px 5px 0 rgba(36,36,36,0.04), 0 3.75px 11px 0 rgba(36,36,36,0.19)"

layout:
  container-max: "1400px"
  reading-max: "840px"
  header-height: "72px"
  breakpoints:
    sm: "576px"
    md: "768px"
    lg: "992px"
    xl: "1200px"
    "2xl": "1400px"
  grid-gutter: "20px"

components:
  button-primary:
    background: "accent"
    color: "on-primary"
    radius: "pill"
    border: "2px solid accent"
    paddingY: "12px"
    paddingX: "24px"
    fontWeight: 500
    fontSize: "body"
    minHeight: "44px"
    hover-background: "accent-hover"
    transition: "duration-base ease"
    focus-ring: "2px solid accent, offset 3px"
  button-secondary:
    background: "transparent"
    color: "ink-primary"
    radius: "none"
    border: "2px solid ink-primary"
    paddingY: "12px"
    paddingX: "24px"
    fontWeight: 500
    fontSize: "body"
    minHeight: "44px"
    hover-background: "ink-primary"
    hover-color: "on-dark"
  button-ghost:
    background: "transparent"
    color: "ink-primary"
    border: "none"
    paddingY: "12px"
    paddingX: "8px"
    fontWeight: 500
    fontSize: "body"
    minHeight: "44px"
    hover-color: "accent"
    hover-underline: true
    underline-offset: "4px"
  feature-link:
    description: "Signature link with chevron arrow that translates on hover. Stolen from Marvin's `FeatureLink_*` component."
    color: "ink-primary"
    icon: "ArrowUpRight from lucide"
    hover-color: "accent"
    hover-icon-translate: "+0.5px right, -0.5px up"
  eyebrow:
    fontFamily: "Inter, sans-serif"
    fontSize: "13px"
    textTransform: "uppercase"
    letterSpacing: "0.12em"
    color: "ink-muted"
    optional-prefix: "12px × 1px hairline rule, gap 12px"
  card-image-led:
    description: "No border, no shadow at rest. Image tops a content block with eyebrow + serif title + body-sm description + chevron arrow."
    aspect: "4/5 portrait"
    image-hover-scale: 1.03
    image-hover-duration: "700ms ease"
    title-hover-color: "accent"
    chevron-hover-translate: "+0.5px right, -0.5px up"
  filter-tab-rail:
    description: "Hairline-underlined tab row, not pills. Active gets red underline."
    active-color: "ink-primary"
    active-border: "2px solid accent"
    rest-color: "ink-muted"
    rest-border: "transparent"
    hover-color: "ink-primary"
    transition: "duration-base ease"
  hairline-list:
    description: "Vertical stack of items separated by 1px rules. Used for FAQ accordion, action links in chat, contact rows."
    divider: "1px rule-soft"
    item-padding: "16px 0"
    hover-color: "accent"
  section-band:
    description: "Page composition unit with tone alternation."
    tones: ["canvas-white", "canvas-soft", "canvas-cream", "canvas-dark"]
    padding-mobile: "section-mobile"
    padding-tablet: "section-tablet"
    padding-desktop: "section-desktop"
  side-panel:
    description: "Right-side full-height panel used for chat, product drawer, quote modal."
    width-desktop: "480px"
    width-mobile: "100vw"
    background: "canvas-white"
    accent-stripe-top: "3px accent"
    shadow: "depth-8"
    motion-in: "translateX(100%) -> 0, 500ms ease"
    close-trigger: "Escape key, scrim click, X button"
  hero-photo:
    aspect: "min(100dvh, 920px) full-bleed"
    scrim: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.25), rgba(0,0,0,0.05))"
    headline-color: "ink-inverse"
    headline-text-shadow: "0 1px 3px rgba(0,0,0,0.35)"
    pagination-dot-target: "44px height, 2px visible bar"
  hero-video:
    description: "Same shape as hero-photo but with a looping muted video. Falls back to hero-photo carousel on prefers-reduced-motion / save-data / slow-2g / 2g."
    file: "1920×1080 H.264 high profile, CRF 21-24, no audio, faststart, ~12-18MB target"
---

## Overview

FourlinQ is a premium uPVC windows and doors brand serving the Philippine market. The design language is **editorial**, calibrated against [marvin.com](https://marvin.com) production CSS (every token here is grep'd from real CSS bundles — see [docs/REDESIGN_ROADMAP.md §13](./docs/REDESIGN_ROADMAP.md) for the full extraction). The principle: **photography does the storytelling, chrome stays out of the way.**

**Voice:** confident, restrained, declarative. Past-tense and present-action; no marketing fluff, no exclamation marks, no "We're excited to announce". Editorial copy length — single sentences and short paragraphs preferred. Eyebrow labels are structural (category, section), not decorative.

**Anti-patterns** carried over from the v2.0 "Tropical Futurism" predecessor that explicitly do NOT apply:
- Decorative gradients
- Tracked-uppercase decorative subtitles (use only for structural eyebrows)
- Heavy drop shadows (`shadow-lg` and above)
- Multi-corner-radius card chrome
- Bouncy spring animations on entry

**Audience tiers (in priority order):**
1. Architects + interior designers — they sell FourlinQ to clients; site reads like *AD* / *Dezeen*
2. Affluent homeowners building or renovating — site supports a slow, considered browse
3. Contractors needing specs — served by FAQ + Care guide + (planned) spec PDFs
4. First-time DIY renovators — served by `/help-me-choose` flow

## Colors

- **`accent` (`#C8102E`)** — FourlinQ red. Used for: active filter underlines, send/submit CTAs, FAQ category labels (when filtered), single per-fold CTA highlights, focus rings. **Never** used as a background block for sections or hero overlays. Restraint over volume.
- **`accent-hover` (`#A00D26`)** — slightly darkened accent for hover states. Applied only to filled-accent surfaces (primary buttons).
- **`accent-quiet` (8% accent)** — for very rare quiet backgrounds where accent context is needed without volume.
- **`ink-primary` (`#242424`)** — body text and display headings on light backgrounds. Charcoal, not true black. 14.4:1 on white, AAA.
- **`ink-secondary` (`#444444`)** — sub-body, lede paragraphs. 9.5:1 on white, AAA.
- **`ink-muted` (`#686868`)** — captions, eyebrows, byline metadata. 5.7:1 on white, AA.
- **`ink-faint` (`#767676`)** — disabled states, placeholders. 4.5:1 on white, **AA minimum** — bumped from the original `#909090` (which failed AA at 3.0:1) in the P0 accessibility sweep.
- **`ink-on-dark-*`** — full mirror of the ink scale for dark sections. `secondary` at 78% white passes AA on `canvas-dark`; `muted` at 62% white is the AA minimum.
- **`canvas-white` (`#FFFFFF`)** — default page background.
- **`canvas-soft` (`#F8F8F8`)** — alternate section background, ~1.5% darker than white. Used for tone alternation between `Section tone="canvas"` and `tone="soft"`.
- **`canvas-cream` (`#F9F7F1`)** — warm editorial backdrop, for sections that should feel "magazine page", not "SaaS interface". Use sparingly (one or two per page).
- **`canvas-dark` (`#242424`)** — dark section background. Used in BrandCTA, warranty band, BrandCTA-style invitations.
- **`rule-strong` / `rule-soft` / `rule-faint`** — three weights of hairline divider. `soft` (`#DFDFDF`) is the default everywhere; `strong` for eyebrow-prefix hairlines; `faint` (8% black) for very low-emphasis section breaks.

## Typography

**Pairing:** Instrument Serif (display) + Inter (sans). Both load free via Google Fonts. The pairing is the closest free analog to Marvin's commercial TabacG1 + Nationale.

**Scale rules:**
- The display scale (`display`, `display-sm`, `h1`–`h6`) is **always serif**. No sans h1.
- The body scale (`lead`, `body-lg`, `body`, `body-sm`) is **always sans**. No serif paragraphs.
- The eyebrow scale (`eyebrow-l`, `eyebrow`, `eyebrow-s`) is **always uppercase, tracked, sans, medium-weight**. Use as structural section markers, **never as decorative subtitles**.

**Display-to-body contrast:** the headline is the dominant element on every section. The body text intentionally stays at 16-18px so the contrast ratio between headline and body is 3-5×. This is the single biggest editorial-feel lever — see [REDESIGN_ROADMAP §13.2](./docs/REDESIGN_ROADMAP.md).

**Tracking:**
- Display: negative tracking (`-0.02em` to `-0.025em`) — tightens visual weight on serif
- Body: zero tracking
- Eyebrow: positive tracking (`0.10em` to `0.15em`) — opens up uppercase legibility

**No font-weight 700+ on serif.** Display sizes use weight 400 (regular). Bold serif reads dated; the size does the visual weight.

## Layout

**Container:** `1400px` max-width, centered. Mirrors Marvin's `87.5rem` constant. On viewports < 1320px, content sits flush to viewport edges — this is intentional editorial pacing; the photos and headlines fill the screen.

**Grid:** 20px gutter (Bootstrap 5's `--bs-gutter-x`), matches Marvin exactly. `repeat(2, minmax(0, 1fr))` and `repeat(3, minmax(0, 1fr))` are the dominant patterns. `minmax(0, 1fr)` prevents long-text overflow.

**Breakpoints:**
- `sm: 576px` — large mobile
- `md: 768px` — tablet
- `lg: 992px` — **dominant desktop pivot** (matches Marvin's most-used breakpoint)
- `xl: 1200px` — wide desktop
- `2xl: 1400px` — max container

**Vertical rhythm (section padding):**
- Mobile: 48px top + bottom per section
- Tablet: 72px
- Desktop: 120px

These are the editorial pacing values. Don't compress them — Marvin's premium feel comes from generous vertical breathing room.

**Reading width:** 840px max (`container-reading`) used only for prose-heavy pages — Legal, blog-style content. Body text wider than 840px loses scan-ability.

## Elevation & Depth

Five-step shadow scale. **All extremely subtle** — `depth-2` is 1px blur, `depth-8` is the maximum at 11px. The premium feel comes from low elevation, not from heavy drop shadows.

- `depth-1` — 0.5px blur, virtually invisible at rest. Use for active hover states on flat surfaces.
- `depth-2` — 1px blur. Default for cards-at-rest that need any elevation at all.
- `depth-6` — 9px blur. Use for image-led card hover states (replaces the v2 default `shadow-lg`).
- `depth-8` — 11px blur. Side panels, chat panel, product drawer, quote modal. The maximum.

**Never use Tailwind's default `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`.** Those were calibrated for SaaS dashboards, not premium home goods.

## Shapes

**Buttons are binary:** either `pill` (rounded-full) for primary CTAs OR `none` (zero radius) for utility / data UI. Never 4px, 8px, or 12px on a button — those are mid-range radii reserved for cards, inputs, and dialogs.

**Cards:** zero radius preferred (matches Marvin's `border-radius: 0`). 4px maximum if the card is enclosed by other rounded elements (e.g. a 4px corner on a form field's submit button).

**Inputs:** zero radius for buttons-in-inputs; bottom-border-only (no full enclosure) for text inputs in the new editorial style. Old shadcn rounded-lg inputs are deprecated.

## Components

### Buttons

- **Primary** = filled pill, red accent, white text, 2px accent border. Used once per fold. Min 44px height (tap target).
- **Secondary** = outlined square (zero radius), 2px charcoal border, transparent fill. Used for paired secondary action in a CTA row.
- **Ghost** = text-only with underline-on-hover. Used for tertiary actions where a button would feel heavy.

All buttons use `cubic-bezier(.68,0,.33,1)` at 300ms for color/state transitions.

### Feature Link

Signature pattern: text + `ArrowUpRight` icon. On hover: text turns accent red, arrow translates `+0.5px` right and `-0.5px` up. Used 50+ times across the site for navigation between related sections. Stolen verbatim from Marvin's `FeatureLink_*` component.

### Hairline list

Vertical stack with 1px `rule-soft` dividers between items, no outer container chrome. Used for:
- FAQ accordion (Plus/Minus toggles)
- Action chips in chat panel (Call / Email / Directions)
- Contact rows on `/brand` (Phone, Email)
- Help-me-choose options
- Showroom listings within a region

### Section band

Page composition unit. Wraps content with one of four tones (`canvas-white`, `canvas-soft`, `canvas-cream`, `canvas-dark`) and applies the vertical rhythm padding. Tone alternation is the structural device — each adjacent section should change tone so the page has visible rhythm.

### Side panel

Right-side slide-in panel used identically for:
- Chat (LinQ assistant)
- Product drawer (catalog detail)
- Quote modal

Same shape: 480px width on desktop, 100vw on mobile, 3px red accent stripe at top, serif title, hairline-divided body, charcoal text, single close X. Backdrop is `ink-primary` at 30% with `backdrop-blur-sm`. Closes on Escape, scrim click, or X.

### Hero (photo + video)

`100dvh` full-bleed (corrected from the original `100vh` to fix iOS Safari address-bar jump). Single bottom-up gradient scrim (`linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,.25), rgba(0,0,0,.05))`) — never two-layer, never side-darkening. Headline + lede + CTA pair anchor bottom-left. Pagination dots, if multiple slides, are 2px-tall visible bars on 44px-tall buttons (the dots themselves are accessibility-tap-target-compliant).

**Video hero** (`VideoHero` component): falls back to photo carousel on `prefers-reduced-motion`, `Save-Data`, or `slow-2g/2g`. Mobile width alone is not a fallback trigger.

## Do's and Don'ts

**Do:**
- Use `ease-marvin` (`cubic-bezier(.68,0,.33,1)`) for every transition. Tailwind's default `ease-out` is fine for hovers but loses the brand signature.
- Use full-bleed photography as a section's hero element when one exists.
- Use a single accent CTA per fold. If you need two CTAs, the second is `ghost` or `secondary`, not a second filled accent.
- Use `text-h2 lg:text-h2` pattern for editorial section headlines — same desktop size, slightly smaller mobile (48px) — see `EyebrowHeading` primitive.
- Eyebrow above headline with hairline-prefix: `eyebrow mb-5 inline-flex items-center gap-3 before:content-[''] before:w-12 before:h-px before:bg-rule-strong`. This is the signature opener.
- Lazy-load below-fold images (`loading="lazy" decoding="async"`).
- For modals/drawers: enforce Escape close, scroll-lock body, restore focus on close.

**Don't:**
- Don't use shadcn defaults — `bg-card`, `bg-secondary`, `text-muted-foreground`, `border-border`. They're calibrated for SaaS, not editorial. Use the `--canvas-*`, `--ink-*`, `--rule-*` CSS vars instead.
- Don't add `shadow-lg` or heavier shadows. The maximum is `shadow-depth-8` and only for floating panels.
- Don't use multi-corner rounded card chrome (`rounded-xl`, `rounded-2xl`). Editorial means flat or pill.
- Don't write decorative subtitles in tracked-uppercase. Tracked-uppercase is reserved for structural eyebrows only.
- Don't introduce a second accent color. Red is the only state color. Errors, success states, and info states should use neutral tones with the accent reserved for "this is an action you can take".
- Don't restore old "Tropical Futurism" patterns — gradients, glow shadows, glassmorphism backdrops, Playfair Display "Q" monogram. These are explicitly deprecated.

## Responsive Behavior

**The 992-1199 zone is the weak spot** (flagged in the red-team audit). The Marvin breakpoint pivot is 992px, but a 1100px laptop screen lands in a window between "tablet feel" and "desktop feel". When designing, test at:
- 375px (iPhone SE) — narrowest realistic mobile
- 768px (iPad portrait) — md breakpoint
- 992px (lg pivot) — desktop layout activates
- 1280px — common laptop
- 1440px — common external monitor
- 1920px — full HD desktop

**Mobile-specific patterns:**
- Headline scales: display-sm (56px) for hero, 48px (`text-[3rem]`) for level-2 editorial headings, 36px (`text-[2.25rem]`) for level-3
- Tap targets enforce `min-h-[44px]` (iOS guideline). Critical: filter tabs, breadcrumbs, footer links.
- Horizontal scroll strips for category carousels — `flex overflow-x-auto no-scrollbar` with `w-[78vw] sm:w-[58vw] md:w-[42vw] lg:w-auto` per item.
- Mobile drawer for nav at `< lg`: full-page overlay, font-serif text-h4 nav links.

**Reduced motion:** all non-essential animations are disabled globally via `@media (prefers-reduced-motion: reduce)`. The Ken Burns hero zoom and cross-fade respect this; the chat-bubble footer-lift does too.

## Iteration Guide

When the client says **"I don't like the buttons"**:
- The button variants live in [src/components/primitives/Button.tsx](./src/components/primitives/Button.tsx) and reference [src/theme.config.ts](./src/theme.config.ts) `BUTTON` block.
- To change all primary buttons from pill → square: change `BUTTON.primaryShape` and `BUTTON.primaryRadiusClass` in `theme.config.ts`, then update the `variantClass` in `Button.tsx` to consume from the config. (The current implementation hardcodes `rounded-full`; refactor when this lever is actually pulled.)

When the client says **"change the brand color"**:
- Single source: `src/theme.config.ts` `BRAND` block. Then mirror to `tailwind.config.ts` `colors.brand.*` and `src/index.css` `--accent` / `--accent-hover` / `--accent-quiet`. Three files, ~5 minutes.

When the client says **"the spacing feels too tight / too loose"**:
- Section padding lives in `tailwind.config.ts` `spacing.section-mobile/tablet/desktop`. Adjust there — it cascades through every page that uses the `Section` primitive.

When the client says **"make the buttons feel snappier"**:
- Motion duration token in `theme.config.ts` `MOTION.duration.base` (currently 300ms). 200ms reads "snappier" but loses some Marvin character. 250ms is a tasteful compromise.

When the client says **"can we have a dark theme?"**:
- The token scale already supports it — `ink-on-dark-*` is the full mirror. Wrap the page in a `Section tone="dark"` context and the editorial language adapts. Implementing a global dark-mode toggle would require generalizing the `Section` tone propagation to a context provider; out of scope unless requested.

## Known Gaps

These are deliberate omissions on the active redesign branch, tracked in [docs/REDESIGN_ROADMAP.md §14](./docs/REDESIGN_ROADMAP.md):

- **Hero copy direction** — still placeholder. Three editorial alternatives pending Tita's pick.
- **Product catalog completeness** — held to brochure-verified rule. Specifically: Large Panel up to 6m, 90 Series, Lift & Slide, Curtain Wall are NOT in the catalog because their specs were never confirmed.
- **Project case studies** — `/inspiration` strip exists, full project pages do not. Blocked on Tita's photo-strategy answer (Scenario A / B / C — current photos / hi-res originals / commissioned shoot).
- **Spec PDF downloads** — referenced in FAQ but not implemented. Needs Tita's source data.
- **Price-context content** — deliberately absent until Tita confirms a price-context stance.
- **Testimonials** — needs Tita to collect quotes.
- **Tablet 992-1199 audit** — flagged but not yet executed.
- **Admin page chrome rewrite** — internal-only, deliberately skipped.
- **Designer agent test coverage** — zero tests on the new components. Recommended Playwright smoke tests for 4 critical flows: home → hero CTA, /products filter + drawer, contact form submit, chat open + send.

---

*This file is the single canonical design contract for the FourlinQ codebase. Three mirrors consume from it: [tailwind.config.ts](./tailwind.config.ts) for build-time tokens, [src/index.css](./src/index.css) `:root` for runtime CSS vars, [src/theme.config.ts](./src/theme.config.ts) for JS imports. Changing a value here requires updating all three mirrors — they are caches of this spec.*

*For the full extraction story (how every value was grep'd from marvin.com production CSS), see [docs/REDESIGN_ROADMAP.md §13](./docs/REDESIGN_ROADMAP.md).*

*For DESIGN.md files of other premium fenestration brands (Marvin, Sky-Frame, Vitrocsa, Schüco) — used as references when iterating on FourlinQ — see [docs/references/design-systems/](./docs/references/design-systems/).*
