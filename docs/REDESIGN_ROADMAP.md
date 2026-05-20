# FourlinQ Redesign Roadmap

> Branch: `redesign-marvin`
> Status: planning — no code changes yet
> Reference brand: marvin.com (client-provided)
> Owner: Angelo
> Last updated: 2026-04-26

This document captures **why** we're redesigning, **what** the new direction is, and **how** we'll execute it. It is the source of truth for the redesign branch. Update it as decisions land.

---

## 1. Why we're redesigning

After round 1 client review, the client (Tita) responded with the following (paraphrased from her own messages):

> "It's nowhere even close to this. Website seemed rushed and simplistic."
> "I'm expecting more from your output... and don't rely much on AI to do your website. Otherwise, the page seems to be all over the places. Not impressed :("
> "The page seems to be all over the places."
> "If all of you are still in school and would not be able to work on this... I can switch to a professional team."
> "I gave you a sample website: marvin.com"

The current build is functionally complete (admin, chat, design tool, forms, DB, deploy). What failed was the **visual and narrative direction**. We built a product catalog. She wants a brand magazine in the spirit of Marvin Windows & Doors.

The fix isn't more features — it's a different design language. Hence: a redesign branch, not a patch.

---

## 2. What Tita wants (verbatim, synthesized)

### 2.1 Structural requests

1. **Systems-led organization** with three buckets:
   - **Window Systems** — highlight all window types
   - **Door Systems** — must include:
     - Slide & Fold System
     - Large Panel Doors (up to 6 m wide)
     - 90 Series Door System
     - Lift & Slide System
   - **Specialist Systems** — must include:
     - Arch shapes and other special designs
     - Curtain wall
     - Different-shaped panels
2. **Every product/system** must show visuals for **different colored frames** AND **actual project photos**.
3. **Photo area must allow switching between project photos using the cursor.**
4. **Front-page hero** must have **moving photos showing different projects** — Marvin-style.
5. **"What's New" / "What's the Latest?"** section — for new project announcements, news, updates.

### 2.2 Tonal / qualitative feedback

- "Rushed and simplistic" → needs editorial polish, not card grids.
- "All over the places" → needs a single coherent visual language, not feature-pile.
- "Don't rely much on AI" → output must read as designed, not generated. (See §4.3 — this is about *judgment*, not which tools we use.)
- Marvin.com is the reference for aspiration level.

### 2.3 What she explicitly said she likes

- Marvin's homepage hero
- Marvin's Collections grid (5-up tile layout under a navigation tab)
- Editorial pacing
- Project-driven storytelling

---

## 3. What's not working in the current site

Diagnosed from the screenshots she sent of our build vs. Marvin:

| Area | Current (broken) | Why it reads wrong |
|---|---|---|
| **Header** | Dark gradient, white all-caps menu, red square CTA, heavy chrome | Reads aggressive / startup-y. Premium brands lean light and quiet. |
| **Hero** | Single static photo with overlay text + two CTAs side-by-side | Static = lifeless. Premium category expects motion. |
| **Hero copy** | "Precision. Performance. Perfection." stacked across 3 lines, generic | Stacked one-word headlines is dated. Marvin uses sentence-style editorial copy. |
| **Home sections** | "Our Systems" 3-card grid with bordered cards + tight captions | Cards-with-borders is the universal "I'm a SaaS landing page" tell. |
| **Products page** | Filter pills + 3-column card grid with cutout product images | Reads as e-commerce. Marvin uses big lifestyle photography, not product cutouts. |
| **Design tool** | Tiny SVG icons in cards + small live preview panel | Icons read as wireframe. Should be photographic. |
| **Color use** | Red accents on nav, CTAs, badges everywhere | Over-applied accent loses impact. Marvin uses yellow only on the primary CTA and one or two highlights per page. |
| **Motion** | Bounce / spring transitions on cards (now fixed to ease-out), but motion-on-everything | Premium sites use motion sparingly — slow cross-fades and a few hover scales. We had motion on everything. |
| **Typography hierarchy** | Headlines are reasonably sized but body text is tight, spacing is regular | Marvin uses dramatic type scale: hero 80-100px, section heads 48-64px, body 18-20px, with lots of whitespace between. |
| **Card chrome** | Borders, rounded corners, shadow on hover, icon badge top-right | Each chrome element is a small "junky" signal. Marvin tiles have no border, no shadow, no badge. |
| **Photography** | One photo per product (cutout), one hero photo | No variety, no narrative, no project context. |

---

## 4. Marvin design language — analyzed

**Methodology:** Pulled directly from Marvin's production CSS and HTML on 2026-04-26. Fetched 158 CSS bundles from `_next/static/css/`, parsed `--font-size-*`, `--color-*`, `--space-*` design tokens, plus aspect-ratio and max-width values. Probed home, `/products/collections/vivid`, `/inspiration/photo-gallery`, `/products/collections/compare-collections`, and home rendered with a mobile user-agent. Pages NOT probed: individual blog post layout, find-a-dealer detail, individual window product page, mega-menu open-state JS, news article template, mobile hamburger drawer.

Values below are **extracted from real CSS** unless explicitly marked `(visual estimate)`.

### 4.1 Typography (extracted from CSS)

Marvin actually ships **two parallel typeface stacks** in their CSS, suggesting a migration in progress between two design systems:

| Stack | Sans (body) | Serif (headlines) |
|---|---|---|
| Legacy (`apercu` stack) | **Apercu** — Colophon Foundry, ~$200/weight commercial | **Grifo** — Rosetta Type, commercial serif |
| New (`nationale` stack) | **Nationale** — Klim Type Foundry, ~$300/weight commercial | **TabacG1** — Suitcase Type, commercial serif |

All four are commercial licenses, total ~$1,500-2,500 to replicate exactly. **We won't.** See §6.2 for free-tier alternates.

**Real type scale (from `--font-size-*` CSS vars):**

```
font-size-tiny:    12px
font-size-small:   14px
font-size-regular: 16px            ← body default (NOT 18-20)
font-size-medium:  18px
font-size-large:   20px
font-size-h6:      18px
font-size-h5:      18-20px
font-size-h4:      20-24px (responsive)
font-size-h3:      24-32px (responsive)
font-size-h2:      28-48px (responsive)
font-size-h1:      32-56px (responsive)
font-size-hjumbo:  48-88px (responsive)   ← hero headlines max at 88px, not 100
```

**Eyebrows:**
```
eyebrow-s: 11-14px
eyebrow-m: 15-16px
eyebrow-l: 20px
```

**Key correction from initial estimate:** body text is **16px**, not 17-20px. Marvin's editorial feel comes from typographic *hierarchy contrast* (88px → 16px = 5.5x), not from oversizing the body. Hero is ~5x body, h1 is ~3.5x body. Restraint at the bottom of the scale; aggression at the top.

### 4.2 Color (extracted from CSS, ranked by frequency of use)

| Hex | Frequency | Role |
|---|---|---|
| `#242424` | 170 uses | Primary text + dark surface (NOT pure black — 14% lighter) |
| `#ffffff` | 93 uses | White surfaces |
| `#444444` | 66 uses | Secondary text |
| `#909090` | 34 uses | Muted text / icons |
| `#f8f8f8` | 27 uses | Light surface variant (page bg in some sections) |
| `#d4d4d4` | 27 uses | Light borders / dividers |
| `#d92d20` | 24 uses | **Marvin RED** — alerts, error states, some accents |
| `#ffc600` | 23 uses | **Marvin YELLOW** — primary CTA, logo dot, key highlights |
| `#686868` | 21 uses | Dark grey, secondary text variant |
| `#dfdfdf` | 16 uses | Lighter border |
| `#282b2f` | 16 uses | Slate dark variant |
| `#0096db` | 6 uses | **Blue** — info/links |
| `#fff8df` | 10 uses | Yellow-tinted background (CTA hover/active) |
| `#fef0c7` | 4 uses | Light yellow card bg |
| `#fef3f2` | 5 uses | Light pink (red tint bg) |
| `#ecfdf3` | 5 uses | Light green (success tint) |

**rgba overlays:**
- `rgba(36,36,36,.19)` — 19% dark overlay (shadows, scrim)
- `rgba(36,36,36,.04)` — 4% dark overlay (whisper-light dividers)

**Key corrections from initial estimate:**
- Dark text is `#242424`, NOT `#1A1A1A` (I was too dark)
- Marvin yellow is `#FFC600` (pure saturated yellow), NOT `#FFD23F`
- Page background is `#f8f8f8` or `#ffffff` — they do NOT use a warm cream like I guessed
- Their palette includes a real **blue** `#0096db` for info/links — I missed this entirely

**CSS variable system:**
```
--color-primary-500     (the brand color — yellow #FFC600)
--color-primary-050     (lightest tint — #FFF8DF)
--color-info-500        (blue — #0096DB)
--color-info-050        (lightest blue tint)
--color-hardcoded-neutral-050 / 100 / 500 / 700  (neutral scale)
```

Material/Bootstrap-style numeric scale (050, 100, 500, 700).

**Principle confirmed:** Color is restrained. The brand yellow `#FFC600` appears in only 23 spots across the entire CSS — once per important element, never as decoration.

### 4.3 Spacing & layout (extracted from CSS)

**Content max-widths used (sorted by frequency):**
- `87.5rem` (1400px) — primary max-width, 30 uses ✓ confirmed
- `1400px` — same target, declared in px elsewhere (14 uses)
- `992px` — tablet container max (18 uses)
- `768px` — small tablet (11 uses)
- `62.5rem` (1000px) — narrower reading container (7 uses)
- `1200px` — md desktop (5 uses)
- `52.5rem` (840px) — text column max (3 uses)
- `27.5rem` (440px) — small content blocks

**Section padding (real values found):**
- `padding-top/bottom: 120px` (5 uses each) — large section padding ✓
- `padding-top/bottom: 48px` (5 uses) — medium section padding
- `padding: 24px` / `16px` — small block padding
- `padding: 1rem` (16px) — micro-spacing

**Gutter:** `--bs-gutter-x: 20px` (Bootstrap-style grid gutter — 20px between columns, not 24-32 like I guessed)

**Spacing scale (inferred from `--v-space-*` references):**
```
v-space-050: ~2px
v-space-100:  4px
v-space-200:  8px
v-space-300: 16px      ← most common section internal padding
v-space-400: ~24px (estimated)
v-space-500: ~32px
v-space-600: ~48px
v-space-700: ~64px
v-space-800: ~96px (estimated max)
```

**Aspect ratios used in layout (extracted):**
```
1/1                square — used in mega-menu (600×600 product thumbnails)
16/9               standard widescreen
1400/710           cinema hero (~1.97:1)   ← hero default
1400/540           ultra-wide letterbox (~2.59:1)   ← image bands
1400/786           ~16:9 variant
1400/954           ~3:2 variant
1180/1040          near-square landscape
1365/1040          landscape
1000/1400          portrait — for tall architectural shots
```

**Key principle stays right:** whitespace is the layout, but I overestimated. Gutter is **20px**, not 24-32. Section padding is **120px desktop / 48px medium**. Their grid is Bootstrap 5-derived.

### 4.4 Buttons & CTAs (extracted from CSS vars)

```
--button-border-radius: 50px      ← pill button (primary)
--button-border-radius: 0         ← square button (secondary)
--button-border-width:  0         ← filled buttons
--button-border-width:  2px       ← outlined buttons
```

**Two parallel button systems:**
- **Primary CTA:** pill (border-radius 50px), filled yellow, no border, no shadow
- **Secondary:** square (border-radius 0), with 2px border, ghost/outlined

| Type | Treatment (real) |
|---|---|
| **Primary** | Yellow pill `#FFC600` bg, `#242424` text, `border-radius: 50px`, no border, no shadow. Hover state via 4% dark overlay `rgba(36,36,36,.04)` or color shift. |
| **Secondary** | Square outlined button — `border: 2px solid #242424`, transparent bg, `border-radius: 0`, dark text. Hover: bg fill 4% dark overlay. |
| **Filter chip** | Has separate token system (`--button-filter-chip-*`) — used on Inspiration/Photo Gallery for taxonomy filters. Pill shape, lighter bg. |
| **Text link** | Plain text + arrow. Underline on hover only. No button chrome. |

**Transition:** `transition: all .25s` (250ms) — faster than I estimated.

**Key correction:** Marvin uses **both pill and square buttons**, not pill-only. The square outlined secondary is everywhere — I missed it.

### 4.5 Navigation

- **Background:** white, with subtle 1px bottom border `#E5E2DC`.
- **Logo:** word-mark "MARVIN" + yellow dot icon, ~32-40px tall.
- **Menu items:** plain mixed-case (not uppercase!), 14-16px, 400-500 weight, ~32px horizontal spacing.
- **Mega-menu on hover:** opens a wide panel with image thumbnails alongside text — products with little photo previews, not just text lists.
- **Right side:** search icon (no label), "For Pros" dropdown link, yellow pill "Find a Dealer" CTA.
- **Sticky behavior:** appears sticky on scroll, possibly with slight shadow on scroll engagement.

**FourlinQ current is the opposite:** dark gradient, uppercase, red. Everything reads "loud." Even before we touch hero, just flipping the nav to a light, quiet treatment will be a 40% perceptual shift.

### 4.6 Hero

- **Format:** Full-bleed photo, ~85vh tall desktop. Cross-fading carousel between 4-6 lifestyle shots.
- **Auto-advance:** ~6-7 seconds per slide. Cross-fade duration ~1.2-1.5s, ease-in-out.
- **Headline placement:** Bottom-left or bottom-center, with a subtle dark gradient scrim (top-transparent → bottom-darker, ~0-40% opacity).
- **Headline copy:** Editorial sentence-style, not stacked one-word slogans. Example: "Inspired by the architecture of life, made by people who care."
- **CTA below headline:** ONE yellow pill button. Maybe a tiny secondary text link below.
- **Carousel controls:** Subtle bottom-center pagination dots, or arrows fading in on mouse-near.
- **No video by default** on home — sometimes a single hero video on product pages.

### 4.7 Imagery treatment

- **Aspect ratios:** Full-bleed hero ~16:9 or wider; collection tiles ~16:10; project galleries ~3:2 or 4:3 portrait mixed in for variety.
- **Color grading:** Subtle warm cast — never blue-cool. Skies have natural color, not boosted-saturation. Interior shots have golden-hour warmth. Suggests their photo team applies a consistent light grade.
- **Composition:** Architectural — wide shots of finished homes with strong horizon lines, dramatic skies, sometimes a person in the frame at scale.
- **No cutouts.** No products on white. Always in context.

### 4.8 Cards / tiles

- **No border, no shadow, no rounded corners** (or 0-4px radius max — visually negligible).
- **Photo on top, caption below in a tight typographic column.**
- **Hover effect:** Subtle photo scale (1.02-1.04x) over 400-600ms. No card lift. No shadow grow. No color shift.
- **No icon badges, no "NEW" tags, no overlay chips.** The photo and the headline do the work.

### 4.9 Accent lines & dividers (extracted from CSS)

```
--accent-height: 1px              ← thin hairline divider
--accent-height: 5px              ← thick colored accent stripe
--accent-width: 100px             ← long accent
--accent-width: 48px              ← short accent
```

Two distinct accent treatments:
- **1px hairline**, neutral color (`#d4d4d4` or `rgba(36,36,36,.19)`), 100px or 48px wide — used as soft section separators.
- **5px colored stripe**, brand color or category color, 48-100px wide — used as bold underlines beneath collection names (the colored bars I noticed in the Vivid/Modern/Elevate screenshot).

Border-radius values used:
- `0` — square (zero-radius — most cards and images)
- `0.25rem` (4px) — barely-rounded
- `0.5rem` (8px) — moderately rounded

**Key correction:** the 5px colored accent stripes are real and standardized in their token system — these are the most distinctive visual flourish on the site. The colored line under each Collection title is at fixed widths of 48px or 100px, not arbitrary.

### 4.10 Motion (extracted from CSS)

Real transition declarations found:
- `transition: all .25s` (250ms)
- `transition: border .25s ease, background-color .25s`

Marvin's actual motion is **faster than I estimated**. Their site uses snappy 250ms transitions for hover/state changes — not the languorous 600-800ms I assumed for everything.

What's likely longer (visual estimate, not in CSS):
- **Cross-fade carousel:** 1000-1500ms (animations of this scale live in JS, not CSS, so not captured in our extraction)
- **Fade-up on scroll:** likely 400-600ms ease-out
- **Page transitions:** soft fade

**Corrected motion language for our build:**
- Hover/state changes: **250ms ease**
- Hero carousel cross-fade: 1200ms
- Fade-up on scroll: 500ms ease-out
- No spring, no bounce — easeOut cubic only

**Nothing bounces. Nothing springs. Nothing wobbles.** Premium sites use motion to *settle*, not to attract attention.

### 4.11 Responsive behavior (extracted breakpoints)

Real `@media (min-width: X)` breakpoints found in Marvin's CSS:
- `375px` — small phone threshold
- `376px` — phone bump
- `576px` — sm (Bootstrap 5)
- `768px` — md
- `991/992px` — lg
- `1064px` — custom intermediate
- `1200px` — xl
- `1320px` — xxl variant
- `1400px` — xxl (Bootstrap 5)
- `1464px` — XXL+

This is **Bootstrap 5's breakpoint system** (576/768/992/1200/1400) with a couple of custom thresholds. Our redesign should adopt the same — there's no reason to invent our own.

**Behavior per breakpoint (visual inferences from probing):**

| Breakpoint | Container max-width | Section padding | Grid columns | Behavior |
|---|---|---|---|---|
| `<576px` (mobile) | full-width with 20px gutter | ~48px | 1 col | Hamburger nav, single-column stack, photos full-bleed, buttons full-width |
| `576-768px` (large phone / small tablet) | 540px or full | 48-72px | 1-2 col | Two-up grid emerges |
| `768-992px` (tablet) | 720px-992px max | 72-96px | 2-3 col | Sidebar layouts possible |
| `992-1200px` (small desktop) | 992-1200px max | 96px | 3-4 col | Mega-menu opens |
| `1200-1400px` (desktop) | 1200-1400px max | 120px | 4-5 col | Full editorial layouts |
| `>1400px` (large desktop) | 1400px max (87.5rem) | 120px | 5 col | Max content width — content centers, gutters grow |

**Key principle stays right:** Mobile isn't a smaller desktop — different reading rhythm. Photos full-bleed on mobile, text gets generous padding, buttons stretch.

### 4.12 Component inventory (extracted from CSS module class names)

Probed 14 production pages, parsed CSS-module class names, ranked by usage. These are the architectural patterns that compose Marvin's site:

| Component | Uses | Purpose |
|---|---|---|
| **SwatchList** | 114 | Finish/color swatch grid — directly applies to FourlinQ's 11 finishes |
| **Modal** | 97 | Modal/dialog system — quote requests, brochure downloads |
| **Header** | 76 | Top navigation with mega-menu, blur backdrop, logo |
| **Spacer** | 68 | Explicit vertical spacer component (Squarespace-style — they put `<Spacer />` between content blocks) |
| **ColorMode** | 50 | Light/dark section toggle — same page alternates between cream/white and dark `#242424` |
| **ThreeUpImageGroup** | 48 | 3-up image grid layout primitive |
| **SubHeadCopy** | 45 | Subhead + paragraph combo (editorial typographic block) |
| **SubHeadListGroup** | 43 | Subhead + bullet list combo |
| **Category** | 42 | Category navigation pattern |
| **Media** | 41 | Generic image/video media wrapper |
| **ProductCard** | 38 | Product card with photo + name + caption |
| **AccordionsMobile** | 31 | Mobile-only accordion (FAQ, spec lists collapse on small screens) |
| **FilterVista** | 30 | Filter UI (used on photo gallery) |
| **FeatureLink** | 27 | Text + arrow link (their "Learn More →" pattern) |
| **AccordionsDesktop** | 27 | Desktop accordion (different markup than mobile) |
| **FilterRow** | 26 | Filter pill row |
| **TwoUpImageGroup** | 25 | 2-up image grid layout |
| **TextBlock** | 13 | Standalone text content block |
| **SbTestimonialCard** | 11 | Testimonial card |
| **SbTestimonialCarousel** | 10 | Testimonial carousel wrapper |
| **LayoutGridBleedGridItem** | 9 | Full-bleed grid item |
| **SbFeaturedImage** | 7 | Featured image with caption |
| **StoryExpander*** | 6+ | Editorial story expander — used on news/blog posts |
| **ResourceCard / ResourcesSection** | 6 | Downloads, specs, brochures section |
| **PageHeaderDisplayTextHero** | 5 | Page hero header with display text |
| **CollectionLogo** | 4 | Collection-specific logo treatment |
| **Carousel** | 2 | Generic carousel (separate from testimonial carousel) |
| **StickyTitleBar** | 1 | Sticky page title that pins on scroll |
| **YoutubeVideo** | 2 | YouTube embed wrapper |
| **SbForm** | 1 | Form component (CMS-driven) |
| **SbPhotoGalleryVista** | 1 | Photo gallery (Vista variant) |
| **SbQuoteCard** | 1 | Pull-quote card |

**The `Sb` prefix is Storyblok** — Marvin's CMS. Components prefixed `Sb` are content-block components delivered from Storyblok and rendered into the page. Marvin's content is *editorial-CMS-driven* — editors compose pages from these blocks.

For FourlinQ this is a model worth borrowing in principle, even though we don't have Storyblok — we have admin + Postgres. The same idea: design composable content blocks (TextBlock, TwoUpImageGroup, AccordionDesktop, etc.) that can be assembled into a page rather than hardcoding layouts.

### 4.13 Elevation / shadow system (extracted)

Marvin has a **7-level elevation scale**, all ultra-subtle (4-19% opacity):

```css
--depth-1:  0 0 1px 0 rgba(39,39,39,.04), 0 .5px 1.5px 0 rgba(36,36,36,.19);
--depth-2:  0 .25px 1px 0 rgba(36,36,36,.04), 0 .85px 3px 0 rgba(36,36,36,.19);
--depth-4:  0 .5px 1.75px 0 rgba(36,36,36,.04), 0 1.85px 6.25px 0 rgba(36,36,36,.19);
--depth-6:  0 .25px 3px 0 rgba(36,36,36,.04), 0 2.75px 9px 0 rgba(36,36,36,.19);
--depth-8:  0 .5px 5px 0 rgba(36,36,36,.04), 0 3.75px 11px 0 rgba(36,36,36,.19);
--depth-12: 0 .5px 5px 0 rgba(39,39,39,.04), 0 3.75px 11px 0 rgba(39,39,39,.19);
--depth-6-top-shadow: .25px -2.75px 3px 0 rgba(36,36,36,.04), 0 0 9px 0 rgba(36,36,36,.19);
```

**Key insights:**
- Every shadow uses **two layers** — a 4% near-shadow (sharpness) + a 19% farther shadow (depth). Single-layer shadows look cheap; two-layer shadows feel physical.
- All offsets are sub-pixel (0.25px, 0.5px, 0.85px, 1.85px, 2.75px, 3.75px) — fractional values, not integers.
- A `top-shadow` variant exists for elements that need to cast shadow upward (sticky bottom bars).
- Max blur on any depth is 11px — never the 20-40px blur common in startup-y card UIs.

Translation: ditch the `shadow-md` / `shadow-lg` Tailwind defaults. Implement the same two-layer subtle-shadow system in our tokens.

### 4.14 Animation curves used

Real `cubic-bezier()` values from Marvin's CSS:

```
cubic-bezier(.215, .61, .355, 1)      ← easeOutCubic (most common)
cubic-bezier(.55, .055, .675, .19)    ← easeInQuart (rare, for exits)
cubic-bezier(.54, 1.5, .38, 1.11)     ← gentle spring overshoot — used VERY sparingly
ease-out                              ← default
```

The `1.5` y-value in the third curve is a mild overshoot — Marvin DOES allow a touch of spring on specific transitions, but the overshoot is tiny (1.5, vs 1.7+ for visible bounce). Most of their motion is straight cubic-out.

### 4.15 Performance & loading patterns

- **Font preloading:** 10+ woff2 files preloaded via `<link rel="preload">` — aggressive for a marketing site (would hurt LCP). We'll do less.
- **No `dns-prefetch` for external CDNs** — they self-host or proxy through Next.js Image.
- **Image optimization:** Next.js Image at `q=75` (not 90+) — they accept slightly softer images for smaller payload.
- **CSS layering:** They use `@layer reset` + `@layer default` for cascade ordering. Modern, clean. We should adopt.

### 4.16 SEO / structured data (JSON-LD types found)

On home: `Organization`, `ContactPoint`, `PostalAddress`, `WebSite`, `SearchAction`, `EntryPoint`
On collection pages: `WebPage`, `ViewAction`, `DownloadAction`, `Thing`, `PropertyValue`, `EntryPoint`

For FourlinQ, equivalent schema additions worth doing:
- `Organization` + `ContactPoint` on home (with our showroom addresses as `PostalAddress` entries)
- `LocalBusiness` on each showroom page (4 entries — Main, Ortigas, Alabang, Cebu)
- `Product` schema on each System type
- `WebPage` + `BreadcrumbList` on all content pages

---

## 5. Translation — what we take, what we don't, what's ours

### 5.1 Principles we adopt (these are universal premium-site rules, not Marvin's IP)

- ✅ Photography-first hierarchy (photos lead, text supports)
- ✅ Restrained color use (one accent, applied sparingly)
- ✅ Generous whitespace and dramatic typography scale
- ✅ Editorial sentence-style copy, not one-word slogans
- ✅ Quiet, slow, easeOut motion only
- ✅ Asymmetric layouts (5/7, 4/8 splits) instead of equal columns
- ✅ Cards with no chrome (no borders, shadows, rounded corners)
- ✅ Sections separated by whitespace, not dividers
- ✅ Single primary CTA per section; secondary actions are text + arrow

### 5.2 Marvin specifics we explicitly do NOT copy

- ❌ Marvin yellow `#FFD23F` (their brand color — we have red `#C8102E` or similar)
- ❌ "Collections" naming with "Ultimate / Modern / Vivid / Elevate / Essential" — we use **Systems** with Tita's three buckets
- ❌ "Designed By You" section format
- ❌ "Find a Dealer" CTA wording — we use "Visit a Showroom" or "Request a Quote"
- ❌ "For Pros" navigation tab — irrelevant for FourlinQ's audience
- ❌ Their exact typeface choice (we'll pick our own from the same category)
- ❌ Their exact section copy or photography composition
- ❌ Their logo wordmark style (FourlinQ has its own Playfair Q identity already)

### 5.3 What's distinctly FourlinQ

- 🇵🇭 **Philippine climate context** — typhoon-rated, tropical humidity, salt air, corrosion resistance. Marvin can't claim this; we can.
- 🏗️ **German-engineered, locally fabricated** positioning — leans into European engineering credibility (Schüco-adjacent).
- 🎨 **11-finish swatch system** — the matte black / oak malt / walnut / etc. range is unique. Marvin shows ~3 finishes per collection; we have 11. Lean in.
- 🛠️ **Live Design Tool** — Marvin doesn't have one. We do. Don't bury it; just give it a calmer presentation.
- 📍 **Showroom locations** — Main, Ortigas, Alabang, Cebu. Marvin's "Find a Dealer" maps to our showroom directory.
- 📝 **"Q" word-mark in Playfair Display** — keep this. It's the existing brand asset, doesn't need to change.

---

## 6. FourlinQ Redesign — design tokens (proposed)

Tokens to land before any component work begins. These supersede the current design-system.

### 6.1 Color (revised against real Marvin values)

**Full neutral scale to mirror Marvin's 8-step system:**

```css
--color-neutral-050: #F5F5F5;   /* lightest surface — exact Marvin */
--color-neutral-100: #DFDFDF;   /* light border */
--color-neutral-200: #B6B6B6;   /* faint */
--color-neutral-300: #909090;   /* muted */
--color-neutral-400: #686868;   /* secondary text */
--color-neutral-500: #444444;   /* body de-emphasized */
--color-neutral-600: #282B2F;   /* darkest surface var */
--color-neutral-700: #242424;   /* primary text + dark surfaces — exact Marvin */
```

**FourlinQ primary scale (red — applied with Marvin's restraint):**

```css
--color-primary-050: #FFF5F6;   /* faintest red wash */
--color-primary-100: #FCE8EB;
--color-primary-200: #F4B8C2;
--color-primary-300: #E88598;
--color-primary-500: #C8102E;   /* FourlinQ red — used 23x-style restraint */
--color-primary-600: #A00D26;   /* hover */
--color-primary-700: #7A0A1D;   /* darkest */
```

**Semantic tokens (semantic role, not specific hex):**

Marvin's actual neutrals are flat true greys, not warm cream. Their text-dark is `#242424` (14% lighter than I initially proposed). Aligning:

```css
/* Surfaces */
--bg-canvas:     #FFFFFF;          /* primary page bg — pure white, matches Marvin */
--bg-soft:       #F8F8F8;          /* alternate section bg, matches Marvin #f8f8f8 */
--bg-dark:       #242424;          /* dark sections, footer — exact Marvin dark */

/* Text */
--text-primary:   #242424;         /* exact Marvin dark */
--text-secondary: #444444;         /* exact Marvin secondary */
--text-muted:     #686868;         /* exact Marvin muted */
--text-faint:     #909090;         /* very faint, captions */
--text-inverse:   #FFFFFF;

/* Borders / dividers (matches Marvin's hierarchy of separator weights) */
--border-strong:  #d4d4d4;
--border-soft:    #dfdfdf;
--border-faint:   rgba(36,36,36,0.04);   /* whisper-light */

/* Accent — FourlinQ red, applied with Marvin's restraint principle */
--accent:         #C8102E;         /* FourlinQ red — used like Marvin uses yellow */
--accent-hover:   #A00D26;
--accent-quiet:   rgba(200,16,46,0.08);  /* tinted bg, like Marvin's #fff8df pattern */
--accent-stripe-h: 5px;            /* matches Marvin's --accent-height: 5px */
--accent-stripe-w: 48px;           /* matches Marvin's --accent-width: 48px */
```

**Color rule:** Red is the *only* color outside the neutral scale. Marvin's brand color (yellow) appears 23 times in their entire CSS — once per important element. Our red must show the same discipline. NOT on nav links, NOT on hover states everywhere, NOT on chat bubble, NOT on icon badges.

### 6.1.1 Elevation tokens (mirror Marvin's 7-step depth scale)

```css
--depth-1: 0 0 1px 0 rgba(36,36,36,.04), 0 .5px 1.5px 0 rgba(36,36,36,.19);
--depth-2: 0 .25px 1px 0 rgba(36,36,36,.04), 0 .85px 3px 0 rgba(36,36,36,.19);
--depth-4: 0 .5px 1.75px 0 rgba(36,36,36,.04), 0 1.85px 6.25px 0 rgba(36,36,36,.19);
--depth-6: 0 .25px 3px 0 rgba(36,36,36,.04), 0 2.75px 9px 0 rgba(36,36,36,.19);
--depth-8: 0 .5px 5px 0 rgba(36,36,36,.04), 0 3.75px 11px 0 rgba(36,36,36,.19);
```

**Use sparingly.** Marvin barely uses shadows — most surfaces have no shadow at all. Reserve depths for: header (depth-1 on scroll), modal (depth-6), tooltip (depth-2). Cards and tiles get NO shadow.

### 6.1.2 Animation duration scale (mirror Marvin's 5-step scale)

```css
--dur-100: 100ms;   /* tiny interactions */
--dur-200: 200ms;   /* hover changes (Marvin uses this most) */
--dur-250: 250ms;   /* default transition (Marvin's most common) */
--dur-300: 300ms;   /* state changes */
--dur-400: 400ms;   /* component reveals */
--dur-500: 500ms;   /* page transitions */
--dur-carousel: 1200ms;   /* hero cross-fade (longer, not in Marvin's scale) */
```

### 6.1.3 Header tokens (matching Marvin's exact heights)

```css
--header-height-mobile:  64px;
--header-height-desktop: 72px;
```

### 6.2 Typography (free analogs to Marvin's commercial stack)

Marvin uses two parallel commercial stacks (Apercu+Grifo OR Nationale+TabacG1). We can't license those. Closest free analogs:

**Option A — "Editorial Refined" (RECOMMENDED)**
- Headlines: **Fraunces** (variable serif, Google Fonts free — analog to TabacG1/Grifo)
- Body: **Inter** (Google Fonts free — neutral grotesque, close to Apercu/Nationale)
- Free, both excellent on screen, well-supported, fast to load via Google Fonts CDN.

**Option B — "Closer to Nationale-style"**
- Headlines: **Roboto Serif** (Google Fonts free — variable, refined transitional)
- Body: **DM Sans** (current — already in use, neutral)
- Lower-risk migration since DM Sans is already loaded.

**Option C — "Stay close to current"**
- Headlines: Keep **Playfair Display** (current, but use it bigger and quieter than the current build does)
- Body: Replace **DM Sans** with **Inter**

**Recommendation: Option A.** Fraunces gives the editorial sophistication Marvin gets from TabacG1, with a much wider variable axis (you can use it as a delicate display serif AND as a heavier body emphasis). Inter is the closest free neutral sans to Apercu/Nationale.

**Performance budget:** Total font payload < 80kb after subsetting. Preload only the weights actually used in the hero — defer everything else.

### 6.3 Scale (calibrated to Marvin's real scale)

```
Hjumbo (hero):    88px / 1.05 / -0.02em   (desktop)   ← matches Marvin's hjumbo max
                  48px / 1.1  / -0.01em   (mobile)
H1:               56px / 1.1                          ← matches Marvin's h1 max
                  32px / 1.15             (mobile)
H2:               48px / 1.15                         ← matches Marvin's h2 max
                  28px / 1.2              (mobile)
H3:               32px / 1.2
                  24px / 1.25             (mobile)
H4:               24px / 1.3
H5:               20px / 1.4
H6:               18px / 1.4
Body large:       20px / 1.55
Body regular:     16px / 1.6              ← Marvin body default
Body small:       14px / 1.5
Tiny / caption:   12px / 1.4
Eyebrow large:    20px / 1.4 / 0.10em (caps)
Eyebrow medium:   16px / 1.4 / 0.12em (caps)
Eyebrow small:    14px / 1.4 / 0.15em (caps)
```

**Key change vs initial estimate:** body is **16px**, not 17px. Hero is **88px**, not 96px. The editorial pacing comes from the *contrast ratio* (88:16 = 5.5×), not from absolute size.

### 6.4 Spacing (Bootstrap 5 system + Marvin's section padding)

```
Section padding (desktop):  120px top/bottom         ← matches Marvin
Section padding (tablet):    96px
Section padding (mobile):    48px                    ← matches Marvin

Container max-width:        1400px (87.5rem)         ← matches Marvin exactly
Container narrow:           1000px (62.5rem)         ← matches Marvin
Reading max-width:          840px (52.5rem)          ← matches Marvin

Grid gutter:                20px (--bs-gutter-x)     ← matches Marvin exactly

Spacing scale (mirror Marvin's exact --v-space-* tokens):
  000   -> 0px
  050   -> 2px       ← matches Marvin
  100   -> 4px
  200   -> 8px
  250   -> 12px      ← new vs Marvin (filling 8→16 gap)
  300   -> 16px
  350   -> 20px      ← matches Marvin (grid gutter value)
  400   -> 24px
  500   -> 32px
  600   -> 40px      ← matches Marvin
  700   -> 48px      ← matches Marvin
  800   -> 56px      ← matches Marvin
  900   -> 64px      ← matches Marvin (their MAX semantic spacing)
  --section-pad-desktop: 120px   /* declared directly, not as v-space — matches Marvin */
  --section-pad-tablet:  72px
  --section-pad-mobile:  48px
```

**Breakpoints (Bootstrap 5, matching Marvin):**
```
sm:  576px
md:  768px
lg:  992px
xl:  1200px
xxl: 1400px
```

### 6.5 Motion (calibrated to Marvin's 250ms hover)

```css
--ease:           cubic-bezier(0.16, 1, 0.3, 1);    /* ease-out cubic */
--ease-soft:      cubic-bezier(0.4, 0, 0.2, 1);     /* gentle ease-in-out */

--dur-hover:      250ms;   /* hover/state changes — matches Marvin */
--dur-base:       400ms;   /* most transitions */
--dur-slow:       600ms;   /* fade-ups on scroll */
--dur-carousel:   1200ms;  /* hero cross-fades */
```

**Motion rule:** No spring. No bounce. No overshoot. Always ease-out. Only animate `opacity` and `transform` (never `width`, `height`, `top`).

---

## 6.6 Marvin's actual IA (from sitemap, for reference)

For context, the real Marvin information architecture (extracted from `marvin.com/sitemap.xml`, 2026-04-26):

```
/
/products                            (entry)
  /collections                       (5-up grid of named collections)
    /ultimate
    /modern
    /vivid
    /elevate
    /essential
    /compare-collections             (decision tool)
  /design-options                    (modular options across products)
    /casings, /divided-lites, /exterior-finish, ...
/solutions                           (use-case oriented — 4 entries)
/inspiration
  /photo-gallery
  /email-sign-up
  /request-brochure
    /{collection}-catalog            (PDF brochure per collection)
/our-story
  /history-of-marvin
  /tours-and-training
/news                                (57 press entries)
/blog                                (153 editorial posts)
/find-a-dealer                       (1317 dealer pages — search-driven)
/international-dealers
/careers                             (areas, locations, benefits)
/support                             (131 entries — installation, warranty, etc.)
/c/{campaign}                        (campaign landing pages — e.g. "Meet Vivid")
/marvin-at-7-tide                    (showroom microsite)
/legal/...
```

What translates directly to FourlinQ:
- **`/products/collections`** → our `/systems` with three buckets
- **`/products/collections/compare-collections`** → potential future "compare systems" tool
- **`/inspiration/photo-gallery`** → our `/inspiration` photo gallery
- **`/inspiration/request-brochure`** → could be a useful pattern for sending FourlinQ brochures
- **`/find-a-dealer`** → our `/showrooms` (FourlinQ has 4 locations, much smaller scope)
- **`/our-story`** → our `/brand`
- **`/news`** + **`/blog`** → our `/whats-new` (combined into one feed for our smaller scope)

What we ignore from Marvin's IA:
- `/careers` — too small a company; not needed
- `/solutions` — overlap with `/products` in their structure; not needed for us
- `/legal` sub-tree at the depth they have — keep our minimal `/legal/privacy` + `/legal/terms`
- `/c/{campaign}` — when we eventually run campaigns, this pattern works, but not Day 1

---

## 7. New site architecture

### 7.1 Information architecture changes

```
NEW IA:

  Home                  ← redesigned: cross-fade hero + Systems intro + What's New + Inspiration strip
  Systems
    ├── Window Systems  ← NEW page
    ├── Door Systems    ← NEW page (incl. Slide & Fold, Large Panel, 90 Series, Lift & Slide)
    └── Specialist      ← NEW page (Arch, Curtain Wall, Shaped Panels)
  Inspiration           ← NEW: project gallery (Marvin's editorial answer)
  Why uPVC              ← rewritten editorially
  Design Tool           ← preserved, calmer visual treatment
  Brand                 ← rewritten editorially with project galleries
  What's New            ← NEW page (data-driven entries)
  Showrooms             ← extracted from Brand
```

The old `Products` page becomes irrelevant — its content moves into the three Systems pages.

### 7.2 New components to build

| Component | Purpose | Replaces / additions |
|---|---|---|
| `HeroCarousel` | Cross-fade hero with 4-6 photos, auto-advance, manual dots | Replaces static `HeroSection` |
| `EditorialSection` | Asymmetric text+image with dramatic type | New layout primitive |
| `CollectionTile` | Marvin-style 5-up tile: photo + caption, no chrome | Replaces card primitives |
| `ProjectGallery` | Cursor-switch between project photos for a system | Tita's #3 explicit ask |
| `FinishSwitcher` | Click a finish swatch, the project photo updates to that finish | Tita's "different colored frames" ask |
| `WhatsNewFeed` | Editorial card list of dated entries | Tita's "What's New" ask |
| `InspirationStrip` | Horizontal scroll of project thumbnails on home | Marvin's project teaser pattern |
| `QuietNavbar` | Light bg, mixed-case menu, single accent CTA | Replaces dark `Navbar` |
| `MegaMenu` | Hover panel with image thumbnails per submenu | New |
| `EditorialFooter` | Sectioned, generous padding, two-column on tablet | Replaces current `Footer` |
| `EyebrowHeading` | Eyebrow label + display headline + subhead pattern | Used everywhere |

### 7.3 Components to retire (delete on this branch)

- `WhyUpvcCards` (replace with editorial sections)
- `ProductsPreview` (replaced by Systems tiles)
- `TrustBar` (replaced by quieter inline stats inside editorial sections)
- `InspirationGallery` (rebuilt as `InspirationStrip`)
- `PageHeader` (replaced by per-page editorial headers)
- The current `Products.tsx` filter-card pattern

### 7.4 Components to keep / refactor (minimal touch)

- `Layout` — refactor for new nav/footer, otherwise structure stays
- `QuoteModal` — visual reskin only
- `DesignTool.tsx` — leave functional behavior, redesign the surrounding chrome
- `ChatBubble` — visually quieter (smaller, no red, perhaps a single dark circle)
- Backend, admin, hooks, data — untouched

### 7.5 Data model additions

```ts
// New: project photos for galleries (per-system)
type ProjectPhoto = {
  id: string;
  systemId: string;          // foreign key — which system this belongs to
  src: string;               // image path
  alt: string;
  finishId?: string;         // optional — link to a finish for FinishSwitcher
  location?: string;         // "Tagaytay residence" — captions
  caption?: string;
};

// New: what's new entries
type WhatsNewEntry = {
  id: string;
  date: string;              // ISO
  category: 'project' | 'product' | 'event' | 'press';
  title: string;
  excerpt: string;
  image: string;
  link?: string;             // optional external link
};

// New: system catalog (replaces flat products array)
type System = {
  id: string;                // 'window-systems' | 'door-systems' | 'specialist-systems'
  name: string;
  tagline: string;
  intro: string;
  heroImage: string;
  types: SystemType[];       // the actual products within this system
};

type SystemType = {
  id: string;                // 'slide-and-fold' | 'large-panel' | '90-series' | etc.
  name: string;
  description: string;
  specs: string[];
  availableFinishes: string[];
  projectPhotos: ProjectPhoto[];
};
```

---

## 8. Phased execution plan

Each phase is a separate working session with a clear deliverable. Days are aspirational targets, not contracts. The branch deploys to a Vercel preview URL on every push.

### Phase 0 — Setup (today, ~30 min)

- [x] Create `redesign-marvin` branch
- [x] Write this roadmap
- [ ] Send Tita the photo-availability message
- [ ] Wait for her photo decision (option 1 / 2 / 3) — gates Phase 4+
- [ ] Pick typography (commit to Option A / B / C from §6.2)

### Phase 1 — Foundations (Day 1)

- Update Tailwind config + CSS vars to the new design tokens (color, type scale, spacing, motion)
- Install chosen fonts via `@fontsource` or Google Fonts
- Rewrite `Layout` shell — new background color, new font defaults
- Build `QuietNavbar` (light, mixed-case, single CTA)
- Build `EditorialFooter`
- Build `EyebrowHeading` primitive
- Build `Section` primitive (consistent vertical padding, max-width, horizontal gutter)

**Deliverable:** Site shell looks completely different in nav + footer, even though pages are still old. First push to branch → Vercel preview URL → send to Tita as proof of motion.

### Phase 2 — Home rebuild (Day 2)

- Build `HeroCarousel` with cross-fade + autoplay + manual dots
- Curate 4-6 best available photos (from FB scrape) — upscale via Topaz / Magnific if accessible
- New home structure:
  ```
  HeroCarousel (full-bleed)
  Section: "Custom-made windows & doors for the Philippine climate" — editorial intro w/ image
  Section: Systems tiles (3-up, Marvin-style — Window / Door / Specialist)
  Section: Inspiration strip — horizontal scroll of projects
  Section: What's New (latest 3 entries, link to full page)
  Section: Brand CTA — quiet block with link to Brand page
  ```
- Wire `HeroCarousel` to a `homeHero` data array
- Drop `TrustBar`, `WhyUpvcCards`, `ProductsPreview`, `InspirationGallery` from Home

**Deliverable:** Home looks like Marvin in skeleton form — pacing, typography, layout — even if photos are imperfect.

### Phase 3 — Systems pages (Day 3)

- Migrate product data from `products.ts` into the new `System / SystemType` shape (in `fourlinq-data.ts` — keep brochure-verified principle)
- Add new types per Tita's spec:
  - Door: Slide & Fold (exists), Large Panel (new), 90 Series (new), Lift & Slide (new)
  - Specialist: Arch (new), Curtain Wall (new), Shaped Panels (new)
  - For each new type without brochure backing: mark `verified: false` in data, render with placeholder description + "By Inquiry" tag rather than fake specs
- Build `/systems/window-systems`, `/systems/door-systems`, `/systems/specialist-systems` as editorial pages
- Build `CollectionTile` and use it in the Systems index
- Each system page: hero photo + intro paragraph + scrollable list of types, each with `ProjectGallery` and `FinishSwitcher`

**Deliverable:** All three Systems pages are live on the preview URL with the new structure. Photo galleries and finish switchers may be sparse until photos arrive.

### Phase 4 — Project gallery + Finish switcher (Day 4 — depends on photos)

- Build `ProjectGallery`:
  - Thumbnail row below a main image
  - Cursor hover on thumbnail → main image cross-fades to that photo (matches Tita's "switch using cursor" ask)
  - Touch: swipeable on mobile
- Build `FinishSwitcher`:
  - Row of 11 finish swatches under each system type
  - Click a swatch → main image cross-fades to a photo of that system in that finish
  - Falls back to a color-tinted overlay if no real photo exists for that finish

**Deliverable:** Both interactive components live. Quality of this phase tracks directly with photo availability.

### Phase 5 — Inspiration page + What's New (Day 5)

- `/inspiration`:
  - Editorial gallery of projects
  - Filter by system type or finish
  - Click a project → detail page with full photoset + product callouts
- `/whats-new`:
  - Data-driven list of entries from `WhatsNewEntry[]` in `fourlinq-data.ts`
  - Categories filter (project / product / event / press)
  - Latest 3 entries surface on Home

**Deliverable:** Two new pages exist with seed content. Admin panel additions may be added later to let Tita post entries herself.

### Phase 6 — Editorial rewrite of Brand + Why uPVC (Day 6)

- Brand:
  - Open with a wide editorial hero
  - "Our Story" as a long-form column with inline project shots
  - Warranty + Certifications as quieter trust-stamps section
  - Showrooms as a separate dedicated section, possibly with a map per location
- Why uPVC:
  - 7 benefits as alternating editorial sections, not cards
  - Each benefit gets its own paragraph + image
  - Comparison table reflowed into a quieter two-column layout

**Deliverable:** Both pages stop reading like brochure sections and start reading like a magazine.

### Phase 7 — Polish, QA, deploy (Day 7)

- Responsive QA at 1440 / 1280 / 1024 / 768 / 400 widths
- Lighthouse audit — should be 90+ across the board
- SEO + meta refresh for new pages
- Accessibility audit — keyboard nav, focus rings, ARIA labels on carousels
- Update sitemap, OG tags
- Merge `redesign-marvin` → `main`
- Production deploy

---

## 9. Photography strategy

The visual ceiling is set by photo quality. Three scenarios mapped to Tita's possible answers:

### Scenario A — "Work with current photos" (current default)

- Audit the FB scrape and WP exports — pick the 12-15 strongest photos total
- Upscale to ~2400px wide using Topaz Gigapixel, Magnific, or Real-ESRGAN
- Apply a consistent warm color grade (subtle warming filter, +5 saturation, +10 contrast)
- Use the same 4-6 photos as hero carousel (rotated for variety)
- Per-system pages: 2-4 photos each
- Project galleries will look thin; lean on editorial copy and typography to carry weight

**Visual ceiling:** ~70% of Marvin's polish. Marvin's photo budget can't be faked.

### Scenario B — "Original high-res from their photographer"

- Ideal if Tita's existing photographer kept raw files
- 50+ photos per finished project, multiple aspects
- Project galleries become rich; finish switcher works with real variations

**Visual ceiling:** ~85% of Marvin's polish.

### Scenario C — "Commissioned shoot"

- One half-day at one or two showcase projects
- Brief: wide exterior, multiple interior angles, detail shots (handles, profile sections, gasket details), at least one shot per finish family
- Total cost in PH market: ~PHP 15-30k for a half-day with a competent architectural photographer
- This is the only path to genuine Marvin-equivalence

**Visual ceiling:** ~95% of Marvin's polish. The remaining 5% is years of brand photography accumulation that Marvin has and we don't yet.

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Tita doesn't reply with photo plan for days → blocks Phase 4+ | Build Phase 1-3 independently. They land regardless of photo decision. |
| Mid-build, Tita changes direction again | This roadmap is the contract. Any new ask gets logged here as an addendum, not silently absorbed. |
| Adding the new product types (Large Panel, 90 Series, Lift & Slide) without brochure backing violates the "verified data only" principle | Mark unverified entries explicitly with `verified: false` and "By Inquiry" tag. Surface this to Tita as a question: "Do you actually offer these? Send brochure pages if you do." |
| Time pressure → shipping a half-rebuilt site that's worse than the current one | Don't merge to main until Phase 7. The current production site stays up; the redesign lives on a preview URL until it's whole. |
| Tita compares the preview URL to Marvin again and isn't satisfied | Set expectations explicitly with each preview share: "This is end-of-Phase-N — here's what's still ahead." |
| Custom fonts kill performance | Use `font-display: swap`, preload only the weights actually used, subset to Latin. Target: total font payload < 80kb. |

---

## 11. Decisions to lock before Phase 1

Locked 2026-05-20 — Angelo defaults applied (revisable any time, but build off these).

- [x] **Typography** — Option A: **Instrument Serif (display) + Inter (sans)**. Both free via Google Fonts. Already wired in tailwind.config.ts. Closest free analog to Marvin's TabacG1 + Nationale.
- [x] **Accent color** — Keep **FourlinQ red `#C8102E`** (brand-500). Apply with Marvin-style restraint: hairlines, eyebrow color, single CTA per fold. No red blocks.
- [ ] **Hero copy** — Open. Propose 3 options in Phase 2 kickoff; pick with Tita before Phase 2 builds.
- [x] **Design Tool nav location** — Move **under Systems** (footer link + Systems-page sub-CTA). Not main nav. Reduces top-nav weight to 5 items.
- [x] **Chat bubble** — Keep, but **dim to neutral charcoal**, smaller footprint, only appears after 4s scroll. Removes visual loudness without losing the channel.
- [ ] **Product spec confirmation** — BLOCKED on Tita. Catalog stays on §13-memory rule: brochure-verified only.

§13.15 implementations completed on this branch:
- [x] Tailwind: signature easing `cubic-bezier(.68, 0, .33, 1)` exposed as `marvin` / `ease-marvin`
- [x] Tailwind: type scale extended (h1 64, h2 56, display 88) to match Marvin's hjumbo ramp
- [x] CSS: `--canvas-cream: #F9F7F1` added for warm editorial backdrop

---

## 12. Definition of done

The redesign is shippable to `main` when:

1. All three Systems pages exist and link to from nav.
2. Home hero cross-fades through at least 4 photos.
3. Each system type page has at least one `ProjectGallery` and one `FinishSwitcher` — even if photo counts are limited.
4. "What's New" page exists with at least 3 seed entries.
5. Typography, color, spacing, and motion tokens are applied consistently — no remaining `WhyUpvcCards`, `ProductsPreview`, etc.
6. Lighthouse scores ≥ 90 on home, ≥ 85 on Systems pages.
7. Responsive QA passes at all five breakpoints.
8. Tita has reviewed the preview URL and signed off on the direction.
9. CHANGELOG updated, ROADMAP closed, deploy completed.

---

## 13. Open questions (tracking list)

| # | Question | Asked of | Status |
|---|---|---|---|
| 1 | Photo plan — option A, B, or C from §9? | Tita | Open |
| 2 | Does FourlinQ offer Large Panel up to 6m, 90 Series, Lift & Slide, Curtain Wall? | Tita | Open |
| 3 | What entries should populate "What's New" initially? | Tita | Open |
| 4 | Typography — Option A (Fraunces + Inter)? | Angelo | Open |
| 5 | Keep Design Tool in main nav or relocate? | Angelo | Open |
| 6 | LinkedIn page status (carry-over from round 1) | Tita | Open |
| 7 | Confirmed 22-year founding date (carry-over from round 1) | Tita | Open |

---

## §13 — Deep-research addendum (extracted from marvin.com CSS, 156 bundles, 14 page templates)

This section captures the **complete design-token system** as it lives in Marvin's production CSS. Every value here is grep'd from their stylesheets — not estimated.

### §13.1 — Type scale (full ramp)

Marvin's `--v-font-size-*` scale, every step:

| Token | px | Used for |
|---|---|---|
| `--v-font-size-025` | 10 | micro labels |
| `--v-font-size-050` | 12 | tiny / captions |
| `--v-font-size-075` | 14 | small body, eyebrow-s |
| `--v-font-size-100` | 16 | regular body, eyebrow-m |
| `--v-font-size-150` | 18 | medium, h5/h6 mobile |
| `--v-font-size-200` | 20 | large, h4 desktop, eyebrow-l |
| `--v-font-size-250` | 24 | h3 mobile, h4 |
| `--v-font-size-300` | 28 | h2 mobile, h3 |
| `--v-font-size-350` | 32 | h1 mobile, h2 |
| `--v-font-size-400` | 40 | (intermediate) |
| `--v-font-size-500` | 48 | h1 / hjumbo mobile |
| `--v-font-size-600` | 56 | h1 desktop |
| `--v-font-size-700` | 64 | hjumbo tablet |
| `--v-font-size-800` | 88 | hjumbo desktop max |

**Implication for FourlinQ:** adopt this exact scale (rename `v-font-size-*` → `text-*` to match Tailwind). It's a 14-step scale with explicit display sizes — better than the 6-step we use now.

### §13.2 — Font weights, line-heights, letter-spacing

```
Weights:        300 / 400 / 500 / 600 / 700
Line-heights:   1.0  / 1.25 / 1.5  / 1.75 / 2.0  / 2.5 em
Letter-spacing: 0   / 1px  / 1.5px / 2px  / 3px  / 4px
```

Headlines use 500 (medium) and 600 (demibold). Body never goes below 400. **Eyebrows are the only place letter-spacing > 0** — and even there it's only 1-2px, not the tracked 3-4px we have on the current site.

### §13.3 — Spacing scale

```
--v-space-000: 0    --v-space-500: 32
--v-space-050: 2    --v-space-600: 40
--v-space-100: 4    --v-space-700: 48
--v-space-200: 8    --v-space-800: 56
--v-space-250: 12   --v-space-900: 64
--v-space-300: 16
--v-space-350: 20
--v-space-400: 24
```

Finer-grained than Tailwind defaults (which jump 8 → 12 → 16 → 24). The 2/4/8/12/16/20/24 ladder keeps tight type-to-element rhythm.

### §13.4 — Radius scale

```
000:0  050:2  100:4  200:8  250:12  400:24  full:9999 (pill)
```

**Buttons use either 0 or pill.** Cards use 4 or 8. They never use 12 or 24 on buttons. Square = utility/data UI, pill = consumer CTAs.

### §13.5 — Motion system

```
Durations: 100 / 200 / 300 / 400 / 500 ms
Curves:
  ease-in-out:  cubic-bezier(.68, 0, .33, 1)   ← signature curve
  ease-in:      cubic-bezier(.33, 0, .68, 0)
  ease-out:     cubic-bezier(.33, 1, .68, 1)
```

**Default transition: `300ms cubic-bezier(.68,0,.33,1)`** — soft, slightly slow. Most "premium" sites use `ease-out` 200ms; Marvin's curve lingers on entry and exit. Adopt exactly — free brand equity.

### §13.6 — Shadow / depth

```css
--depth-2: 0 .25px 1px 0  rgba(36,36,36,.04), 0 .85px 3px 0  rgba(36,36,36,.19)
--depth-6: 0 .25px 3px 0  rgba(36,36,36,.04), 0 2.75px 9px 0 rgba(36,36,36,.19)
```

**Shadows are tiny.** Premium feel comes from low elevation. Our current build uses Tailwind defaults (`shadow-md` = 6px blur, much heavier). Lighten everything.

### §13.7 — Breakpoints (by usage frequency)

| Breakpoint | Count | Role |
|---|---|---|
| **992px** | 751 | **Primary desktop break** (not 1200) |
| 768px | 205 | Tablet |
| 1200px | 172 | Wide desktop |
| 576px | 122 | Large mobile |
| 1320px | 76 | XL |
| 1400px | 26 | Max-container |

**Key finding:** layout pivot at **992px**, not 1024px (Tailwind's `lg`). Tita's screenshots at ~1100px land in our awkward zone — likely cause of many of her layout complaints.

### §13.8 — Grid layouts

```
1fr                                    38× (single column)
1fr 1fr / repeat(2, minmax(0,1fr))     35× (two-up)
repeat(3, minmax(0, 1fr))               8×
repeat(4, minmax(0, 1fr))               6×
auto 1fr auto                           8× (label–field–action)
60px 1fr                                6× (icon–content)
subgrid                                14× ← cards aligning to outer grid
```

`minmax(0, 1fr)` prevents grid blowout from long text. **We're not using `subgrid` anywhere** — cheap polish win for card alignment.

### §13.9 — Aspect ratios

```
1/1   36×   square — product tiles
16/9  24×   landscape — heroes
3/2   12×   classic photo
5/4   10×   portrait-landscape
4/5    6×   portrait — inspiration cards
2/1    6×   ultrawide section dividers
```

Mobile-specific custom ratios (`343/463`, `343/429`) lock exact pixel heights for above-the-fold mobile composition. Over-engineering for our scope but worth knowing.

### §13.10 — Color system (final)

Marvin runs a **dual-primary** — `--color-primary-*` resolves to yellow OR blue depending on page context.

**Blue primary ramp (corporate / info):**
```
050:#e3f5ff  400:#1592eb
100:#caebff  500:#0075c9  ← primary blue
200:#9acfef  600:#005a9a
300:#78c0eb  700:#00416b  ← "dusk"
```

**Yellow primary ramp (consumer / brand):**
```
050:#fff8df  400:#ffd83f
100:#fff8cc  500:#ffc600  ← primary yellow
200:#ffef99  600:#dba500
300:#ffe366  700:#b78600
```

**Neutrals (hardcoded):**
```
050:#f5f5f5  400:#686868
100:#dfdfdf  500:#444444  ← body text
200:#b6b6b6  600:#282b2f
300:#909090  700:#242424  ← display text
```

**Semantic:** error-600 `#d92d20`, success-500 `#12b76a`, warning-500 `#f79009`, info-500 `#0202fe` (focus rings).

**Special:** `--color-cream:#e7e5dd` (warm off-white for editorial sections), `--color-mch:#18414a` (Marvin Connected Home teal).

**Implication for FourlinQ:** add `--color-cream: #f9f7f1` as alternate background instead of pure `#f8f8f8`. The warm tint is what separates "premium" from "generic SaaS."

### §13.11 — Component nomenclature (their CSS modules)

```
Header_*        — desktop nav + mega flyout (flyout, blurLayer, cardGrid, collectionCard, featuredCard)
Carousel_*      — used heavily on Inspiration + Collections
Category_*      — taxonomy tiles
Collection*     — CollectionCard, CollectionHeroImage, CollectionLogo, CollectionProductListing
HeaderText_*    — h2/h3/h4/h5 + subhead-200 (semantic typography component)
FeatureLink_*   — text link with chevron arrow (signature CTA)
FeaturedCard_*  — large editorial card with overlay
ColorMode_*     — wrapper that switches the entire token set per section
```

**Three patterns worth stealing:**

1. **`HeaderText` as a component** — typography enforced as React component, not raw class. Prevents `<h1 class="text-2xl">` mismatches.
2. **`FeatureLink` arrow chevron** — signature "→" link with hover-translate. One component, 50+ uses.
3. **`ColorMode` wrapper** — lets one section have cream bg + dark text + light-tone shadows while the next is white. Avoids per-section token overrides.

### §13.12 — Header / nav specifics

```
--header-height: 64px (mobile) / 72px (desktop)
```

On hover of a top-nav item, a full-width **flyout** drops with a blur layer behind page content. Flyout uses a 4-column grid: collection tiles + featured editorial card on the right. **Mega-menu but tasteful** — not a long list of links, but a grid of products with images.

For our scope: simple "Systems / Inspiration / Showrooms / About / Contact" at 72px with the same `.68,0,.33,1` fade gets 80% of the feel.

### §13.13 — Text-transform usage

`text-transform: uppercase` appears **41 times** — almost exclusively on:
- Eyebrow labels above headlines (`SOLUTIONS / DOORS / CASEMENT`)
- Filter chips
- Footer column headers

**Structural, not decorative.** Our hero subtitles use tracked-uppercase decoratively (dated). Move uppercase to eyebrow labels only.

### §13.14 — Information architecture (from sitemap.xml, 1817 URLs)

| Top-level | URL count | Maps to FourlinQ |
|---|---|---|
| `/find-a-dealer` | 1317 | → `/showrooms` |
| `/blog` | 153 | → defer (Phase 6+) |
| `/support` | 131 | → `/support` (existing) |
| `/products` | 99 | → `/systems` |
| `/news` | 57 | → defer |
| `/inspiration` | 12 | → `/inspiration` (Phase 4) |
| `/our-story` | 3 | → `/about` |

**Marvin's `/products` IA is 3 levels:**
```
/products
  /collections          ← Modern, Elevate, Essential, Ultimate, Vivid
    /compare-collections ← side-by-side compare page
  /windows              ← /casement, /awning, /double-hung
  /doors                ← /sliding, /french
  /design-options       ← /casings, /divided-lites, /exterior-finish  ← our finish swatches
```

**Insight:** our 8 systems ≈ one of Marvin's Collections. Our `/systems` should pattern-match `/products/collections/compare-collections` — single comparison page, then drill into individual system pages. **Closer to Tita's "explain the four-chamber system properly" ask than what we have now.**

### §13.15 — Revisions to earlier sections after deep probe

1. **Spacing scale:** add `--space-2`, `--space-12`, `--space-20` for finer rhythm.
2. **Motion:** change all transitions from `cubic-bezier(0.4,0,0.2,1)` (Tailwind default) to `cubic-bezier(.68,0,.33,1)`. Single biggest "feel" upgrade for zero code.
3. **Type scale:** add 40px and 56px steps. Current 32 → 48 jump is too coarse for mid-heading hierarchy.

### §13.16 — Confidence tier

| Tier | What | Source |
|---|---|---|
| ✅ Verified | §13.1–§13.13 values | Grep'd from production CSS |
| ✅ Verified | IA in §13.14 | sitemap.xml direct |
| 🟡 Inferred | Mega-menu hover behavior | Markup, not interaction-tested |
| 🟡 Inferred | Yellow vs blue context split | Token naming + page sampling |
| ⚠️ Not probed | Search modal, dealer map, gallery filters | All JS-driven |

The CSS-derived findings (~95% of this addendum) are gold. Interaction findings need browser automation. **Recommend we stop research and start locking decisions.**

---

*This document is the contract for the redesign. If we drift from it, we update it first.*
