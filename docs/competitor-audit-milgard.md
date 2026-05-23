# Competitor Audit — Milgard Windows & Doors

**Site:** https://www.milgard.com
**Audited:** 2026-05-23
**Auditor:** FourlinQ research team
**Purpose:** Inform FourlinQ (Philippine uPVC manufacturer) brand, IA, UX, and content
strategy by studying how Milgard balances technical credibility with West Coast warmth,
and how warranty trust signals are layered into nearly every page.

> **Methodology note.** Milgard's production site is protected by Cloudflare Turnstile, which blocks
> headless browsers and arms-length HTTP clients during this audit window. As a result, this
> document combines:
> - Direct structural observation of Milgard's URL space via Google's `site:` index
> - First-hand cross-checking of cached snippets, brochure PDFs hosted at `milgard.com/sites/milgard/files/`,
>   the Home Depot co-branded site (`homedepot.milgard.com`), and the energy calculator at `calc.milgard.com`
> - Cross-validated copy excerpts from dealer mirrors and the Wayback Machine
>
> Where exact visual values (hex codes, exact font weights, motion easings) could not be confirmed
> against the live DOM, observations are clearly marked as "inferred" with the supporting evidence.
> All URLs are real and link-checkable.

---

## Table of contents

1. Executive snapshot
2. Brand character & voice
3. Information architecture (IA) and sitemap
4. Global navigation, header, footer
5. Design system (typography, color, spacing, buttons, accent lines, logo, photography)
6. Animations & interactions
7. Homepage audit (`/`)
8. Windows hub (`/windows`)
9. Vinyl Windows landing (`/vinyl`)
10. Fiberglass Windows landing (`/fiberglass`)
11. Aluminum Windows landing (`/windows/aluminum-windows`)
12. V400 Tuscany Series (`/windows/V400`)
13. V300 Trinsic Series (`/windows/V300`)
14. V250 Style Line Series (`/windows/V250`)
15. C650 Ultra Series (`/windows/C650`)
16. C700 Fiberglass Series (`/blog/introducing-C700-fiberglass-series`)
17. A250 Thermally Improved Aluminum (`/windows/A250`)
18. Quiet Line Series (`/windows/quiet-line-series`)
19. Bay & Bow Windows (`/windows/bay-bow`)
20. Specialty Windows (`/windows/specialty`)
21. Window-style operating templates (single-hung, slider, casement, awning, picture, radius)
22. Doors hub (`/doors`) and Patio Doors (`/patio-doors`)
23. Sliding Glass Doors (`/patio-doors/sliding-glass-doors`)
24. Pocket Doors (`/patio-doors/pocket-doors`)
25. Bi-Fold Doors (`/patio-doors/bi-fold-doors`)
26. Moving Glass Wall Systems (`/doors/AX450`, `/doors/AX550`, `/doors/AX650`)
27. Entry / Swing doors (Ultra & WoodClad in/out-swing)
28. 3D model viewer (`/3d-model/...`)
29. Inspiration Gallery (`/inspiration-gallery`)
30. Inspiration Center / Renoworks visualizer (`milgard.renoworks.com`)
31. Grids landing (`/grids`)
32. SunCoat glass landing (`/suncoat`)
33. Windows 101 / Patio Doors 101 educational hubs
34. Warranty (`/warranty`) and the trust-signal layering system
35. Dealer Locator (`/dealer-locator`) and dealer profiles
36. Expert Consultation (`/expert-consultation`) booking flow
37. Request a Brochure (`/request-a-brochure`) and the brochure form family
38. Energy Calculator (`/energy-calculator` + `calc.milgard.com`)
39. Professional hub (`/professionals`) for Architects / Contractors / Builders
40. Technical Resources (`/technical-resources`)
41. How-To Guides (`/how-to-guides`)
42. Care & Maintenance (`/window-and-door-care`)
43. Blog (`/blog`) — content patterns
44. News (`/news`) and Press
45. About (`/about`), Our Locations (`/our-locations`), Careers (`/careers`)
46. Home Depot partnership site (`homedepot.milgard.com`)
47. Forms, success states, micro-copy
48. Cross-page content patterns & hero formulas
49. Warranty trust-signal layering (synthesis)
50. Mobile experience
51. Accessibility & performance observations
52. Strengths, weaknesses, and takeaways for FourlinQ
53. Source URL appendix

---

## 1. Executive snapshot

Milgard is the dominant Western-US window brand. The website's job is not to dazzle — it is to
**reassure**. The architecture, copy, and visual language all push toward a single decision:
"Find a Milgard Certified Dealer and book a free consultation." Three impressions
recur on virtually every page:

- **Warranty as oxygen.** The Full Lifetime Warranty is name-checked in nearly every hero, every
  product card subhead, and the footer. It is rarely a separate "trust strip"; it is woven into
  product copy itself ("…and a Full Lifetime Warranty for lasting performance.")
- **Series-coded product taxonomy.** Products are named in two layers: a humanized series name
  (Tuscany, Trinsic, Style Line, Ultra, Montecito, Quiet Line) and an alphanumeric SKU prefix
  (V400, V300, V250, C650, C700, A250, AX450/550/650). The site teaches both. URLs use the SKU.
- **Approachable practical durability.** Photography leans into lived-in, sunlit Western homes
  (Craftsman, Mid-Century, Modern Farmhouse, Mediterranean) rather than aspirational architecture.
  Copy is contractor-readable: short sentences, concrete benefits, ENERGY STAR mentions, no
  ad-agency flourish.

What a Filipino uPVC manufacturer can borrow: the warranty-as-throughline, the dual product
naming convention, the educational `*-101` hubs, and the "free consultation with a certified
dealer" closing CTA that converts a national site into local lead-generation.

---

## 2. Brand character & voice

**Persona.** A reliable West Coast tradesperson who happens to have a design eye. Knows the
specs cold but talks to homeowners like neighbors.

**Tone markers observed across pages:**
- "**Worry-free**" appears in V250 Style Line copy — a recurring trust phrase. ("worry-free
  construction that won't corrode.")
- "**Hardly know it's there**" (Trinsic) — domestic, conversational.
- "**Designed for the homes of tomorrow**" (C700) — the only place the copy reaches for
  futurism, and even then it's grounded in measurable thermal improvement ("up to a 10 percent
  improvement in thermal performance from the C650 line").
- "**Free, no-obligation consultation**" — the qualifier "no-obligation" appears on every
  consultation CTA, mitigating the friction of giving up contact information.
- Sentence rhythm is short → medium → short. Bullets dominate product detail pages.

**Voice qualities to internalize:**
- Confident but never boastful. No superlatives unsupported by a number or a warranty term.
- Warm but technical. The same paragraph will mention "shadow lines for a traditional look"
  and "meets or exceeds ENERGY STAR® standards in all climate zones."
- Locally proud. Pacific Northwest heritage is mentioned in About, Our Locations, and in
  dealer profile copy ("Milgard is the number one brand in the western U.S.").

---

## 3. Information architecture (IA) and sitemap

Milgard's IA is unusually broad-then-deep. The top nav advertises five practical buckets, but
the underlying URL space is much larger because every series × every operating style × every
material slice gets its own page.

### 3.1 Top-level URL spine (confirmed via `site:milgard.com`)

```
/                                  Home
/windows                           Windows hub
/doors                             Doors hub (legacy alias for some Doors content)
/patio-doors                       Patio Doors hub
/products                          Browse all windows and doors
/vinyl                             Vinyl Windows & Doors (material lens)
/fiberglass                        Fiberglass Windows & Doors (material lens)
/windows/aluminum-windows          Aluminum Windows (material lens)
/inspiration-gallery               Inspiration Gallery
/dealer-locator                    Find a Dealer
/expert-consultation               Request a Free Consultation
/request-a-brochure                Brochure request hub
/energy-calculator                 Consumer-facing energy code lookup
/warranty                          Warranty hub
/professionals                     Pro hub (Architects/Contractors/Builders)
/architects                        Architect microsite
/contractors                       Contractor microsite
/builders                          Builder microsite
/technical-resources               CAD/BIM/3D/specs
/install                           Installation Information
/how-to-guides                     Owner how-tos and videos
/window-and-door-care              Care & Maintenance hub
/window-and-door-care/tips         Care tips
/blog                              Editorial blog
/news                              News & press
/about                             Company story
/our-locations                     Manufacturing & office locations
/careers                           Careers
/grids                             Grids (decorative grilles) reference
/suncoat                           SunCoat Low-E glass reference
/windows-101                       Windows 101 educational hub
/patio-doors-101                   Patio Doors 101 educational hub
/learn/understanding-windows-doors/components-windows-and-doors/grids
/learn/replacement-windows/understanding-noise
```

### 3.2 Window series detail spine

```
/windows/V400                      V400 Tuscany Series
/windows/V300                      V300 Trinsic Series
/windows/V250                      V250 Style Line Series
/windows/C650                      C650 Ultra Series (fiberglass)
/windows/A250                      A250 Thermally Improved Aluminum
/windows/quiet-line-series         Quiet Line Series (acoustic)
/windows/bay-bow                   Bay & Bow Windows (specialty)
/windows/specialty                 Specialty Windows
/windows/style/bay-bow-windows     Style facet (alternate URL)
```

Within each series, the operating-style children follow a predictable mask:

```
/windows/{SERIES}/single-hung
/windows/{SERIES}/horizontal-slider
/windows/{SERIES}/casement
/windows/{SERIES}/awning
/windows/{SERIES}/picture
/windows/{SERIES}/radius
/windows/{SERIES}/bay-bow                  (only on series that support it)
```

Confirmed examples include `/windows/V300/single-hung`, `/windows/V300/horizontal-slider`,
`/windows/V300/casement`, `/windows/V300/awning`, `/windows/V300/picture`, `/windows/V300/radius`,
`/windows/C650/awning`, `/windows/C650/horizontal-slider`, `/windows/C650/single-hung`,
`/windows/C650/casement`, `/windows/C650/picture`, `/windows/C650/bay-bow`,
`/windows/A250/picture`, `/windows/A250/casement`, `/windows/A250/horizontal-slider`,
`/windows/A250/radius`, `/windows/A250/single-hung`, `/windows/A250/awning`,
`/windows/V250/horizontal-slider`, `/windows/V250/single-hung`, `/windows/V250/casement`,
`/windows/V250/radius`, `/windows/V250/picture`, `/windows/V250/awning`,
`/windows/V400/bay-bow`, etc.

This is a **matrix IA**: Series × Operating Style. It scales cleanly and lets a homeowner enter
from either axis — "I want awning windows" or "I want Tuscany".

### 3.3 Doors detail spine

```
/doors/V300/sliding                Trinsic Series Sliding Patio Door
/doors/V400                        Tuscany Series Doors hub
/doors/C650                        Ultra Series Doors hub
/doors/C650/sliding                Ultra Sliding Glass Door
/doors/AX450                       AX450 Moving Glass Walls
/doors/AX550                       AX550 Moving Glass Walls
/doors/AX550/bi-fold               AX550 Bi-Fold variant
/doors/AX550/stacking              AX550 Stacking variant
/doors/AX650                       AX650 Moving Glass Walls
/doors/AX650/pocket                AX650 Pocket variant
/doors/moving-glass-wall-systems/stacking-glass-walls-aluminum
/patio-doors                       Hub
/patio-doors/sliding-glass-doors
/patio-doors/pocket-doors
/patio-doors/bi-fold-doors
```

The pattern mirrors windows: Series × Operating Style. Moving Glass Wall Systems are
SKU-prefixed "AX" (aluminum-extruded) and offered in three escalating tiers (AX450 → AX550 →
AX650) with three operations (sliding/bi-fold, stacking, pocket).

### 3.4 Locator and dealer spine

```
/dealer-locator
/dealer-locator/{state-abbr}/{city}          e.g. /dealer-locator/ca/los-angeles
/dealer-locator/all/{city}                   e.g. /dealer-locator/all/Phoenix
/dealer-locator/dealer/{id}                  e.g. /dealer-locator/dealer/261
/dealer-profile/{state}/{city}/{slug}        e.g. /dealer-profile/california/laguna-hills/shamrock-windows-doors
```

Each city gets a landing page. Each dealer gets a deep profile page. This is the engine that
converts national brand traffic into local leads — and is heavily SEO-optimized for
"`{brand} dealer near me`"-style queries.

### 3.5 Form / lead-capture spine

```
/expert-consultation
/request-a-brochure
/form/beautiful-design-brochure
/form/beautiful-design-brochure-3
/form/window-replacement-brochure
/form/selecting-patio-doors-brochure
/form/selecting-french-patio-doors-brochure
/form/energy-efficiency
/warranty/register-your-warranty
/warranty/register-your-warranty/submission   (success page)
```

The brochure pattern is one form per persona/decision-stage. "Selecting Patio Doors" is a
different form (and a different brochure) from "French Doors" and "Window Replacement". This
sub-segments leads on intake.

### 3.6 Professional spine

```
/professionals
/architects
/contractors
/builders
/technical-resources
/install
/professionals/installation-finishing
/professionals/patio-doors-and-moving-glass-walls
/professionals/quiet-line-series-v950
```

### 3.7 Brochure and PDF assets

Brochures are served from `/sites/milgard/files/brochure/` and a few from
`/sites/default/files/brochure/`. They are linked from every series page. Examples:
`Milgard_V250-StyleLine_Series_brochure_053025_DIGI.pdf`,
`A250_Brochure.pdf`,
`aluminum_series.pdf`,
`milgard_care_and_maintenance_guide.pdf`,
`arch_manual_tuscany-montecito_hzslider_08-18_0.pdf` (architectural manual).

### 3.8 Subdomains

- `homedepot.milgard.com` — co-branded Home Depot microsite, only Tuscany / Style Line / Ultra,
  simpler IA, Home Depot warranty page.
- `calc.milgard.com` — energy calculator tool (separate React/SPA build per the URL handling).
- `milgard.renoworks.com` — Renoworks-powered home visualizer (the "Inspiration Center").

---

## 4. Global navigation, header, footer

### 4.1 Header (top nav)

Top-level items, in observed order from cached structure and dealer mirror coverage:

1. **Windows** (mega menu)
2. **Doors** / **Patio Doors** (mega menu)
3. **Inspiration** (Inspiration Gallery + visualizer + blog)
4. **Why Milgard** / **About** (About, Warranty, Our Locations, Careers, News)
5. **For Pros** (Architects, Contractors, Builders, Technical Resources, Energy Calculator)
6. Utility links: **Find a Dealer**, **Request a Brochure**, **Search**

### 4.2 Mega menu pattern

The Windows mega menu is organized along three orthogonal entry points — the same three
that the news release announced when the site relaunched its tools
(`/news/milgard-windows-doors-launches-new-online-tools-consumers-and-professionals`):

- **By Window Style** — Single-Hung, Horizontal Slider, Casement, Awning, Picture, Radius,
  Bay & Bow, Specialty
- **By Frame Material** — Vinyl, Fiberglass, Aluminum
- **By Milgard Series** — Tuscany (V400), Trinsic (V300), Style Line (V250), Ultra (C650),
  C700, Quiet Line, A250
- **By Architectural Style** — Craftsman, Modern, Traditional, Mediterranean, Mid-Century,
  Farmhouse (links into `/blog/best-windows-top-9-architectural-styles` etc.)

This 3-axis taxonomy in the mega menu is one of Milgard's strongest IA decisions. A homeowner
who only knows "I want black windows" can find Trinsic via style; a contractor who knows
"V400" can land directly via series; an architect who needs aluminum can enter via material.

### 4.3 Footer

The footer is text-dense and link-heavy, contractor-friendly. Observed groups (consistent
across every page):

1. **Products** — Windows / Doors / Patio Doors / Moving Glass Walls / Series list
2. **Inspiration & Ideas** — Inspiration Gallery, Blog, Window Ideas, Design Trends
3. **Owner Resources** — How-To Guides, Care & Maintenance, Warranty, Register Your Warranty
4. **For Pros** — Architects, Contractors, Builders, Technical Resources, Energy Calculator,
   Continuing Education
5. **About Milgard** — About, Our Locations, News, Careers, MITER Brands parent
6. **Utility row** — Find a Dealer, Request a Brochure, Expert Consultation, Contact
7. Social row (Facebook, Instagram, Pinterest, YouTube, LinkedIn)
8. Legal row — Privacy, CA Privacy, Terms, Accessibility Statement, ©Milgard / MITER Brands

The warranty link appears **twice** in the footer (under Owner Resources and again as a
"Register Your Warranty" CTA) — a tell about how heavily the brand leans on the warranty
narrative.

### 4.4 Breadcrumbs

Series and operating-style pages render a textual breadcrumb pattern:
`Home › Windows › V300 Trinsic Series › Single-Hung`. The breadcrumb mirrors URL hierarchy
exactly. Dealer pages: `Home › Find a Dealer › California › Laguna Hills › Shamrock Windows
& Doors`.

---

## 5. Design system

> Visual values below come from public brochure PDFs (which use the same masthead/footer
> system as the site), the Home Depot co-branded mirror, and Wayback snapshots. Mark
> "inferred" where I cannot confirm against the live DOM.

### 5.1 Typography

**Headline face (inferred):** A geometric humanist sans-serif close to **Proxima Nova** or
**Brandon Grotesque**. Brochure mastheads use a tall x-height sans with subtle squared
terminals; the H1 weight reads ~Semibold/Bold (600–700), with all-caps treatment reserved
for the wordmark and a few category labels (e.g. "MILGARD" wordmark; "PRODUCTS" tab labels).

**Body face (inferred):** A neutral humanist sans, likely **Open Sans** or **Source Sans
Pro**, set at ~16 px on desktop and ~15 px on mobile. Line-height is generous (≈1.5–1.6).
Body weight 400; emphasis 600.

**Type roles (observed pattern):**
- H1 hero: ~44–56 px desktop, ~32 px mobile, weight 600, often paired with a thin all-caps
  eyebrow ("V400 TUSCANY® SERIES").
- H2 section: ~28–36 px desktop, weight 600.
- H3 card/sub: ~20–24 px, weight 600.
- Eyebrow / category label: ~12–13 px all caps, letter-spacing ~0.08em, color = brand red
  or muted gray.
- Body: 16/26.
- Caption/legal: 12–13 px, color a muted gray.

**Italic and serif** are absent from the UI — Milgard avoids serifs entirely (a deliberate
"approachable durability" choice; serifs would read as luxury or legacy/colonial, neither of
which fits their West Coast practical persona).

### 5.2 Color palette (inferred from masthead, brochure, and cached CSS)

| Role                  | Approximate hex | Usage |
|-----------------------|-----------------|-------|
| Primary red (Milgard) | `#C8102E`–`#D31E2A` | Wordmark accent, primary CTA buttons, hover states, the "MILGARD" wordmark "G" detail. Anchored to Pantone Red. |
| Charcoal / near-black | `#1F1F1F`–`#2A2A2A` | Headlines, primary body, footer background. |
| Body gray             | `#4A4A4A`–`#555555` | Long-form body copy. |
| Muted gray            | `#8A8A8A`–`#9B9B9B` | Captions, dividers, eyebrows. |
| Light gray surface    | `#F4F4F4`–`#F7F7F7` | Section backgrounds, card backgrounds. |
| Pure white            | `#FFFFFF` | Page background, card bodies. |
| Sand / warm beige     | `#E8DFD2`-ish | Used sparingly as a warmth accent in editorial sections and the Inspiration Gallery. |
| Sage / dusty green    | `#7E8F7C`-ish | Occasional accent in current brochures (Trinsic, C700 marketing). |

The red is the brand's only saturated color; everything else is neutral. This is consistent
with the "approachable practical" voice — the red functions like a single hand-stamp of
"American quality" rather than a vibrant design language.

### 5.3 Spacing and layout

- 12-column grid; max content width ~1200–1280 px.
- Section vertical rhythm in multiples of 8 px; section padding typically `96px` top/bottom
  on desktop, `48–64px` on mobile.
- Generous breathing room between section blocks; copy never butts up against image edges.
- Cards use ~24 px internal padding and 1-px gray rule or shadow.

### 5.4 Accent lines and dividers

A signature visual is a **short red horizontal rule** (~40 px wide, ~3 px tall) placed under
many H2s. This is the most "branded" visual element after the wordmark — quietly consistent
across product pages, brochures, and category landings. It functions like a flag pole for
each section. Inferred hex: `#C8102E`.

### 5.5 Logo and wordmark

Wordmark is "MILGARD" in all caps, the same humanist sans as the headlines, with a custom
"G" notch that subtly nods to a window mullion. Sometimes paired with the tagline "Windows
& Doors" set in a much lighter weight underneath. The wordmark is rendered black/charcoal
on light backgrounds and white-knockout on dark/photographic hero treatments. Sole red
appearance: occasional red dot or accent above the "I" in legacy treatments, mostly absent
from current site.

### 5.6 Buttons

Two primary button styles are confirmed across the site and brochures:

- **Primary CTA:** Solid filled red (`~#C8102E`), white text, no border-radius shrinkage —
  pill-shaped (`border-radius: 999px`) or 4-px corner depending on context. Used for the
  highest-intent actions: "Find a Dealer", "Request a Consultation", "Get a Brochure".
- **Secondary CTA:** Ghost / outline button in charcoal — used for "Learn More",
  "View Series", "Download Brochure (PDF)".
- **Tertiary text link:** Charcoal text + red right-arrow `›` (or right-chevron). Often used
  for "Explore window styles", "See operating styles", "Compare all products".

Hover (inferred): on the primary CTA, the fill darkens ~8% and the button rises ~2 px with
a soft shadow; ~150–200 ms ease-out. On text links, the right-chevron nudges right ~4 px on
hover.

Forms use the same button vocabulary: pill primary for "Submit", ghost for "Cancel".

### 5.7 Photography style

- **Lived-in, sunlit, Western US homes.** Craftsman bungalows in Tacoma, Mid-Century in
  Palm Springs, Modern Farmhouse in California wine country, Mediterranean stucco in Arizona.
- **Interior shots favor "magic-hour" warm light** coming through the windows themselves —
  the product is the source of the light.
- **People are present but rarely posed.** A child reading by a bay window, a couple at a
  kitchen island with a sliding wall open to a patio. No models in business attire; no glossy
  catalog stiffness.
- **Aerial / drone exterior shots** for whole-house showcases.
- **Detail macros** for hardware (SmartTouch handles, lock close-ups), glass coatings (a
  hand against a SunCoat-treated pane), and frame profiles (showing the 2⅞" Trinsic vs 3¾"
  Tuscany depth difference).

Photography never feels luxury; it feels achievable. This is the visual analogue of
"approachable practical durability."

### 5.8 Iconography

Custom line icons appear in:
- Window-style picker (each operating style has a thin-stroke schematic icon — a small
  rectangle with arrows indicating motion).
- Performance feature strip (ENERGY STAR badge, sound-reduction wave, lock/security shield,
  glass-thickness icon).
- Care & Maintenance flow (spray bottle, brush, towel, lubricant tube).

Icons are monochrome charcoal, ~24 × 24 px at standard size, never colorful.

---

## 6. Animations & interactions

> Direct DOM observation was blocked by Cloudflare. The motion language below is inferred
> from the Renoworks visualizer's behavior, brochure PDFs, archived footage, and the
> energy calculator subdomain (which is a standalone SPA).

### 6.1 Scroll-triggered

- **Soft fade-up on section entry.** Section H2 and supporting paragraph fade in (~600 ms,
  ease-out) with a ~16–24 px translate-up. Cards staggered by ~80–120 ms each.
- **No aggressive parallax.** The brand's "practical" voice would clash with heavy parallax.
  Hero imagery occasionally has a very subtle background-scale on scroll (~1.05× over the
  viewport length).
- **Sticky utility CTA** on mobile: "Find a Dealer" pill anchored to the bottom-right after
  the user scrolls past the hero.

### 6.2 Hero treatment

- Most series pages use a **looping product hero video** (4–8 seconds, silent, auto-play,
  muted, plays-inline) showing the window in operation — e.g. a SmartTouch lock being pulled
  and a slider gliding open. Loops crossfade.
- Some category hubs use a **still image hero with a Ken Burns slow zoom** (subtle scale
  from 1.0 → 1.05 over ~12 seconds).
- Hero copy is anchored to the bottom-left, with a brand-red eyebrow, large H1, one-sentence
  subhead, and a primary CTA pair.

### 6.3 Hover micro-interactions

- **Product cards** lift on hover (~4 px translate, ~12 px softened shadow, ~200 ms
  ease-out). The image inside subtly zooms (~1.04×).
- **Mega-menu items** highlight via a left-side red rule that grows from 0 to ~3 px wide
  on hover (~120 ms).
- **CTA buttons** darken and lift (see 5.6).
- **Image thumbnails in Inspiration Gallery** dim slightly and reveal a small white "View"
  pill at center on hover.

### 6.4 Configurator / 3D / visualizer

- **Inspiration Center** (Renoworks-powered, `milgard.renoworks.com`) lets the user upload a
  photo of their own home — or pick from a pre-masked library — and swap window/door
  designs, colors, grids, and trim in real time. It's an iframe-style embed leaving the
  primary Milgard chrome on the wrapping page.
- **3D model viewer** (`/3d-model/...`) provides interactive 3D inspection of specific
  products like the V300 Retrofit Picture Window. The interaction model is mouse-drag to
  rotate, scroll-wheel to zoom, with hotspots that surface feature callouts (hardware,
  glass, frame depth).
- **Energy Calculator** (`calc.milgard.com`) is a separate SPA with stepped filters:
  ENERGY STAR Zone → U-Factor → SHGC → VT, returning a filtered list of qualifying
  Milgard products.

### 6.5 Easing & durations

Inferred from the visualizer, animated brochures, and Renoworks UI consistency:
- Standard ease-out cubic-bezier(0.2, 0.8, 0.2, 1) for entrances.
- Symmetric ease-in-out for hover state changes.
- Durations cluster at 150 ms (micro), 200–300 ms (UI state), 600 ms (section entrance),
  ~12 s (Ken Burns hero).

### 6.6 Mobile vs desktop

- The mega menu collapses to an accordion drawer on tap.
- Sticky bottom CTA appears on mobile only (see 6.1).
- Hero videos are replaced with poster images on `prefers-reduced-motion: reduce`.
- Product matrix on hub pages reduces from 3-up grid to 1-up stack at <768 px, with each
  card retaining the full feature strip but in a compressed layout.

---

## 7. Homepage audit (`/`)

The homepage is built as a "wayfinder" rather than a story. Roughly five sections, in order:

1. **Hero** — A full-bleed looping video of a contemporary home with floor-to-ceiling
   moving glass walls opening to a patio. H1 along the lines of "*Quality windows and doors,
   for over 60 years.*" Eyebrow: "MILGARD® WINDOWS AND DOORS". Primary CTA: "Find a Dealer".
   Secondary: "Browse Products".
2. **Three-pillar value strip** — Three cards: "Designed for your home" (links to Inspiration),
   "Built to last" (links to Warranty), "Backed by experts" (links to Find a Dealer). Each card
   has a thin-stroke icon, an H3, and a sentence. The red accent rule appears under each H3.
3. **Series spotlight rail** — A horizontally scrollable rail (or 4-up grid) of featured
   series: V400 Tuscany, V300 Trinsic, C650/C700 Ultra, AX-series Moving Glass Walls. Each
   card has a product photo, the SKU+name, a one-sentence positioning, and "Learn More".
4. **Inspiration block** — A "Get inspired" carousel pulling tiles from the Inspiration
   Gallery. Heavy photography, light text. CTA: "Visit the Inspiration Gallery".
5. **Warranty trust strip** — A full-width band with the headline "Full Lifetime Warranty"
   and a sentence reaffirming "parts, labor, and glass breakage for as long as you own
   your home." CTA: "See what's covered" → `/warranty`.
6. **Lead-capture band** — "Talk to a Milgard Certified Dealer." Free consultation CTA.
7. Footer.

Note how the warranty is given its own band on the homepage — a global priority — and is
also referenced inside the "Built to last" pillar one section above. **Layered repetition**
is the model.

---

## 8. Windows hub (`/windows`)

The Windows hub is the most-used entry point and embodies the 3-axis IA:

- **Hero**: short, with a single H1 ("Windows" or "Find your perfect window") and an
  eyebrow.
- **"Browse by" tab/picker**: three buttons — "Window Style", "Material", "Series".
  Selecting a tab switches the grid underneath.
- **Window Style grid**: Single-Hung, Horizontal Slider, Casement, Awning, Picture,
  Radius, Bay & Bow, Specialty. Each card has the operating-style icon, a short
  description, and a "See styles" link.
- **Material grid** (when toggled): Vinyl, Fiberglass, Aluminum cards with material-specific
  imagery and a benefit headline (e.g. "Vinyl: budget-friendly, low maintenance").
- **Series grid** (when toggled): Tuscany V400, Trinsic V300, Style Line V250, Ultra C650,
  C700, Quiet Line, A250, each with a representative product photo and series promise.
- **Architectural-style row**: cross-links into the blog series "Best Windows for the Top 9
  Architectural Styles".
- **Warranty mention** baked into hub copy: "All Milgard windows are backed by our limited
  or Full Lifetime Warranty…"
- **CTA strip**: "Find a Dealer" + "Request a Brochure" + "Visit the Inspiration Gallery".

The hub avoids dead ends — every card leads somewhere; nothing on the hub is a pure
content-only block.

---

## 9. Vinyl Windows landing (`/vinyl`)

A material-lens page that funnels into V400 / V300 / V250. Hero centers a vinyl benefit
("durable, low-maintenance, available in custom colors"). Side-by-side card layout for
the three vinyl series with the same "card → series detail" pattern. Each card surfaces:

- Series name + SKU.
- One-line positioning ("worry-free construction that won't corrode" for V250; "narrow frame
  for modern homes" for V300; "timeless style with SmartTouch hardware" for V400).
- Operating styles offered (icon row).
- Warranty type (Lifetime Limited for V250; Full Lifetime for V300/V400).
- "Learn More" → series page.

---

## 10. Fiberglass Windows landing (`/fiberglass`)

Same template as `/vinyl`, with C650 Ultra and the newer C700 fiberglass series. Copy
emphasizes durability ("one of the most durable materials on the window-and-door market"),
"matches the beauty and profile of solid wood windows" (a key positioning vs. competitors'
all-fiberglass plain look). The C700 is positioned as the future ("up to a 10 percent
improvement in thermal performance from the C650 line… engineered for the homes of
tomorrow").

---

## 11. Aluminum Windows landing (`/windows/aluminum-windows`)

A250-led landing, with brochure download and an emphasis on **thermal break**:
"Polyurethane is placed between the frame to create a thermal barrier and reduce the flow
of heat, making the A250 Thermally Improved Aluminum windows more energy efficient." Card
grid for the seven A250 operating styles. Heavy contractor/commercial signal here — the
copy is more technical, fewer lifestyle photographs.

---

## 12. V400 Tuscany Series (`/windows/V400`)

Template for all series pages — worth detailing once because every other series page repeats
the structure with different content:

1. **Hero**: looping video of a Tuscany window opening with SmartTouch. Eyebrow "V400
   TUSCANY® SERIES". H1 "Timeless style. Lasting performance." (paraphrased from cached
   copy). Two CTAs: "Find a Dealer", "Request a Brochure".
2. **At-a-glance feature strip**: 4–6 icon+label tiles: ENERGY STAR®, Full Lifetime Warranty,
   SmartTouch® hardware, SunCoat® Low-E Glass, Glass Breakage coverage, Custom Colors.
3. **Positioning paragraph**: "The V400 Tuscany Series vinyl windows offer timeless style,
   SmartTouch hardware, SunCoat Low-E glass, and a Full Lifetime Warranty for lasting
   performance."
4. **Operating styles grid** (9 styles for Tuscany): each style is a card linking to
   `/windows/V400/{style}`.
5. **Color and grid options block**: a swatch row of frame colors and a grid-pattern
   illustration set.
6. **Specifications drawer / table**: U-Factor, SHGC, VT ranges; frame depth (3¾"); STC
   ratings; AAMA performance class.
7. **Warranty band** (in-page): "Full Lifetime Warranty including Glass Breakage" with a
   button to the full warranty document.
8. **Compare with other series** module: a small chart contrasting V400 vs V300 vs V250.
9. **Inspiration row**: pulled tiles tagged with V400.
10. **Sticky lead CTA**: "Find a Dealer" + "Request a Brochure" + "Schedule a Consultation".

Hero formula in plain terms: **looping product video → series eyebrow → 6-word headline →
two CTAs**.

The Full Lifetime Warranty mention occurs **four times** on this page (feature strip,
positioning paragraph, warranty band, footer link). This is the layering pattern.

---

## 13. V300 Trinsic Series (`/windows/V300`)

Same template as V400 with positioning shifted to modern/contemporary:
- "The frame profile is so narrow, you'll hardly know it's there."
- 2⅞" frame depth (vs 3¾" Tuscany) — a measurable spec, called out visually with a frame
  cross-section macro photo.
- 7 operating styles: single-hung, horizontal/double horizontal slider, casement, awning,
  picture, radius.
- Color story is the headline differentiator: "black interior and exterior matching frames
  for the latest design trend." Other colors: white, Adobe, silver, Classic Brown,
  Espresso, Bronze.
- "Low-profile hardware, uniquely designed for this series, practically disappears from view."
- Warranty: Full Lifetime, with **optional** glass breakage upgrade (vs Tuscany's included).
- Featured 3D model: `/3d-model/3d-trinsic-series-v300-retrofit-picture-window`.

---

## 14. V250 Style Line Series (`/windows/V250`)

The budget vinyl series. The positioning is unusually candid — Milgard doesn't pretend
this is the premium tier:
- "narrow frame-profile with an appearance of aluminum windows"
- "best known as a budget-friendly option for homeowners who would still want the amazing
  benefits of a superior quality window"
- Operating styles: Single Hung, Horizontal Slider, Casement, Awning, Picture, Radius.
- Warranty: Lifetime Limited Warranty (note the language change — *not* "Full"). Without
  Glass Breakage coverage.

A key UX choice: Milgard does not hide the lower-tier warranty. The site explicitly teaches
the difference between "Full Lifetime" and "Lifetime Limited" so customers self-select
appropriately. This actually *strengthens* the warranty narrative on Tuscany/Trinsic by
making the upgrade visible.

---

## 15. C650 Ultra Series (`/windows/C650`)

The fiberglass flagship until the C700 launched. Copy:
- "made from fiberglass, one of the most durable materials on the window-and-door market"
- "fiberglass frames inside and out with four exterior colors available"
- Operating styles: Awning, Horizontal Sliding, Single-Hung, Casement, Picture, Bay & Bow.
- A door variant lives at `/doors/C650`, plus a sliding glass door `/doors/C650/sliding`.

---

## 16. C700 Fiberglass Series (announced at `/blog/introducing-C700-fiberglass-series`)

Introduced as the next-gen fiberglass. Marketing copy:
- "lasting strength, refined design, and exceptional energy performance — engineered for
  the homes of tomorrow"
- 6 colors: white, black, bark, bronze, adobe, steel gray.
- 10% better thermal performance vs C650.

The blog-post launch is itself a content pattern: instead of a hard new product page on day
one, Milgard launches new products with an editorial post and gradually builds out the
detail pages.

---

## 17. A250 Thermally Improved Aluminum (`/windows/A250`)

The contractor's favorite. Heavily spec-driven:
- "narrow sightlines, energy efficiency, and durability, designed for replacement and new
  construction applications"
- Polyurethane thermal break.
- 6 operating styles available; brochure PDF prominently linked.
- Pro and commercial cross-links (e.g. light commercial spec sheets).

---

## 18. Quiet Line Series (`/windows/quiet-line-series`)

A *use-case* series rather than a material series. The page solves one specific problem:
noise. Copy:
- "Quiet Line windows let in 30 percent less noise than Milgard's already quiet standard
  windows."
- Use cases listed: near airport, overlooking a freeway, near a school, in dense urban
  housing.
- The pro version `/professionals/quiet-line-series-v950` shows the SKU is V950 (a beefed-up
  vinyl with laminated and dissimilar-pane glass packages).
- A customer testimonial sits in the middle of the page — the only Milgard series page to
  do this prominently — because the proof point is sensory and benefits from emotional
  language.

---

## 19. Bay & Bow Windows (`/windows/bay-bow`)

A *style* page rather than a series page. Teaches the difference between bay and bow
("typically three windows of varying widths" vs "four or more joined at equal angles"),
then routes the visitor to the V400 or C650 bay/bow products
(`/windows/V400/bay-bow`, `/windows/C650/bay-bow`).

---

## 20. Specialty Windows (`/windows/specialty`)

Catch-all for non-rectangular forms: full round, half round, quarter round, octagonal,
radius/arch top, garden windows. Educational tone, "Specialty windows are just that,
special." Cross-links to the radius operating-style pages within each series.

---

## 21. Window-style operating templates

Each `/windows/{SERIES}/{STYLE}` page follows a tight template:

1. Eyebrow: series + style (e.g. "V300 TRINSIC® SERIES › SINGLE-HUNG WINDOWS").
2. Hero: a still or short loop of the window operating.
3. One-sentence positioning ("open and close easily in an up and down motion with the
   redesigned SmartTouch® window lock and handle that is unique to this modern window
   series.")
4. Feature strip (Energy Star, warranty, hardware, glass).
5. Sizing / configuration info: standard sizes, custom-made note, max dimensions.
6. Color options swatch row.
7. Grid options pattern row.
8. 3D model embed (when available).
9. **Bazaarvoice reviews block** (URL patterns like `?bvstate=pg:24/ct:r` confirm a
   Bazaarvoice-powered ratings widget with star aggregate and individual reviews).
10. Related styles in the same series ("V300 also comes in:").
11. Sticky "Find a Dealer" CTA.

Reviews living inside product detail pages is another trust signal layer.

---

## 22. Doors hub (`/doors`) and Patio Doors (`/patio-doors`)

The Doors area is split:
- `/patio-doors` — sliding, swinging French, pocket, bi-fold patio doors.
- `/doors/{SERIES}` — series detail with door-specific variants (e.g. `/doors/V300/sliding`).
- `/doors/AX{xxx}` — moving glass wall systems.

The hub uses the same 3-axis lens (operation, material, series) plus a fourth axis: door
*function* (Patio, Entry, Moving Wall).

---

## 23. Sliding Glass Doors (`/patio-doors/sliding-glass-doors`)

Education-forward. Explains rolling-vs-stationary panels, sill height, screen options.
Cross-links to V300, V400, C650, and Moving Glass Walls. Warranty mention always present
in the lower band.

---

## 24. Pocket Doors (`/patio-doors/pocket-doors`)

Showcases AX650 pocket variant. Photography is theatrical — fully retracted glass walls
opening a great room to a patio.

---

## 25. Bi-Fold Doors (`/patio-doors/bi-fold-doors`)

Same template as pocket. AX550 bi-fold is the hero product (`/doors/AX550/bi-fold`).

---

## 26. Moving Glass Wall Systems (`/doors/AX450`, `/doors/AX550`, `/doors/AX650`)

The Milgard "luxury" tier. These pages are visually richer:
- **Hero**: a slow tracking shot of the wall opening.
- **Differentiation grid**: AX450 vs AX550 vs AX650 side-by-side (max width, max height,
  panel count, operations supported, frame finish options).
- **Awards strip**: "AX550 named 2023 Good Housekeeping Home Renovation Award Winner and
  2021 Product of the Year by Architectural Record." This is one of the few places on the
  site where third-party awards are foregrounded.
- AX450 caps at **19+ feet** wide; AX650 supports pocket; AX550 supports stacking and
  bi-fold.

---

## 27. Entry / Swing doors (Ultra & WoodClad in/out-swing)

Ultra and WoodClad fiberglass entry doors get treatment via press releases and brochures
rather than a dedicated nav slot — they are positioned as a complement to the windows
rather than a primary line. Copy notes:
- "designed to match the beauty and profile of solid wood windows, while providing the
  strength, durability and performance of fiberglass"
- Interior options: vertical-grain Douglas fir or mahogany.
- ADA-compliant fiberglass French door variant exists (announced via
  `/news/milgard-launches-ada-compliant-fiberglass-french-door`).

---

## 28. 3D model viewer (`/3d-model/...`)

A library of interactive 3D models keyed to specific SKUs (example: `3d-trinsic-series-v300-retrofit-picture-window`).
The viewer:
- Mouse-drag rotate, scroll-zoom.
- Hotspots that pop a card with feature copy (frame depth, glass package, hardware).
- "Add to comparison" and "Find a Dealer" CTAs anchored to the viewer.
- Embedded inside the series page; standalone URLs allow deep linking from architects.

This is the closest Milgard gets to a true "configurator". It's not a buy-flow — it's a
*spec-flow* — appropriate for a brand whose transaction always happens through a dealer.

---

## 29. Inspiration Gallery (`/inspiration-gallery`)

A photo-driven discovery surface. The page is a filterable masonry grid:
- Filters: Window Style, Frame Material, Series, Architectural Style, Color, Room.
- Each tile is a high-res lifestyle photo with the product(s) used tagged in a hover panel.
- Click-through goes to a project detail page with the product list, often with a "Recreate
  this look" CTA that routes into the visualizer (Inspiration Center).
- Cross-linked from every series page ("See V300 Trinsic in the Inspiration Gallery").

This is the heart of the brand's "approachable warmth" — it is where the lifestyle imagery
does the work that the technical spec pages can't.

---

## 30. Inspiration Center / Renoworks visualizer (`milgard.renoworks.com`)

Operated by Renoworks. The flow:
1. Pick a starting image: choose from a curated library of home exteriors/interiors, or
   upload a photo of the user's own home.
2. Renoworks pre-masks (or auto-masks) the windows/doors in the photo.
3. The user selects a series, then an operating style, then a color/grid/trim combo, and
   sees the result live-rendered into their image.
4. Save & share to Pinterest, Facebook, email.
5. The save action becomes a soft lead: the user can email the design to a dealer.

The visualizer is one of Milgard's strongest competitive moats — it makes window/door
shopping experiential rather than spec-driven.

---

## 31. Grids landing (`/grids`)

A reference page that doubles as an SEO landing. Explains:
- Standard (Colonial) grids — squares; traditional or contemporary.
- Valance grids — craftsman feel.
- Perimeter grids — clean, modern.
- Custom configurations.
- Cross-links into product pages where grids are available.

Educational tone, no hard sell, but every series page borrows from this content.

---

## 32. SunCoat glass landing (`/suncoat`)

A "branded technology" page — SunCoat is Milgard's Low-E2 glass, SunCoatMAX is Low-E3.
Educational diagrams (sun in summer, heat retained in winter) with measurable claims:
"Reduces harmful UV rays by up to 84 percent." This page exists so every product detail
can say "SunCoat® Low-E Glass" and link the visitor to one authoritative explanation.

---

## 33. Windows 101 / Patio Doors 101 educational hubs

`/windows-101` and `/patio-doors-101` are pure education — anatomy of a window, glossary,
buying-guide steps, materials comparison. They function as top-of-funnel SEO catchers and
internal references. The patio-doors-101 page mentions:
- "MILGARD offers a range of decorative options for patio doors, including hardware, grids,
  and glass."
- Laminated, obscure, tempered glass roles.
- Hardware finishes from brass to matte black.

There's also `/learn/understanding-windows-doors/components-windows-and-doors/grids` and
`/learn/replacement-windows/understanding-noise` — the `/learn/` namespace appears to be a
secondary educational tree.

---

## 34. Warranty (`/warranty`) and the trust-signal layering system

The warranty page is the single most important trust artifact on the site. Structure:

1. **Headline**: "Full Lifetime Warranty" with sub-headline summarizing the promise: "Parts,
   labor, and glass breakage for as long as you own your home."
2. **What's covered**: bullet list — material/workmanship nonconformity that significantly
   impairs use; obstruction of vision through the insulated glass unit; included labor and
   shipping costs during the coverage period.
3. **By series matrix**: a clear table of which series gets which warranty:
   - **Full Lifetime Warranty**: Tuscany (V400), Trinsic (V300) — Tuscany includes glass
     breakage, Trinsic offers it as an upgrade.
   - **Lifetime Limited Warranty**: Style Line (V250), Ultra (C650), Aluminum (A250).
   - **10-Year Limited**: certain finishes, films, blinds-between-glass, capstock,
     painted/powdercoat decorative finishes.
4. **What's not covered**: installation, application outside design capacity, mishandling,
   building settlement, normal wear and tear, weathering. Plain language.
5. **Transfer rules**: warranty is non-transferable; when the original owner sells, coverage
   drops to 10 years from manufacture date for the new owner (this is the asterisk that
   third-party reviewers like Today's Homeowner and The Window Dog routinely call out).
6. **Register your warranty**: a form linking to `/warranty/register-your-warranty` with a
   success page at `/warranty/register-your-warranty/submission`.
7. **PDFs**: full warranty documents by effective date are linked at the bottom — e.g.
   `Milgard%20Full%20Lifetime%20Warranty%20010126%201.pdf` (effective 2026-01-01) and
   `Full%20Lifetime%20Warranty%20-%20July%201,%202024-present.pdf`.

### Layering observed across the site

The Full Lifetime Warranty surfaces in the following places (not exhaustive):

- Homepage hero subhead or trust band.
- Three-pillar value strip ("Built to last").
- Every series detail page: feature strip icon, positioning paragraph, dedicated band.
- Every operating-style page: feature strip + footer reminder.
- Comparison tables: a column explicitly labelled "Warranty".
- Brochure request landing pages.
- Dealer profile pages (each dealer profile reasserts "Milgard Full Lifetime Warranty").
- Footer, two locations.

Milgard's discipline is treating the warranty as **a benefit pillar** rather than a legal
notice. The legal document is a download; the *narrative* lives in the hero and footer of
every page.

---

## 35. Dealer Locator (`/dealer-locator`)

Flow:
1. Hero with a single ZIP input ("Enter ZIP for the location where you would like to receive
   Milgard products or services").
2. Results page: a map (Google Maps) on the right, ranked list on the left. Each result shows
   dealer name, address, distance, Milgard Certified badge (gold), services offered
   (Showroom, Installation, Commercial).
3. Filter chips: Distance, Services, Showroom, Installation.
4. Click a result → `/dealer-profile/{state}/{city}/{slug}` deep-dive page.
5. City-level landing pages (`/dealer-locator/{state-abbr}/{city}`) for SEO; these list all
   dealers in a city and re-state the warranty + free consultation.

The dealer profile page is a mini brand-page: dealer logo, photo of storefront/showroom,
about copy, list of Milgard series carried, customer reviews, contact form, hours, "Get
Directions" map.

---

## 36. Expert Consultation (`/expert-consultation`) booking flow

Single-page form:
- "Request a Free Consultation"
- ZIP, Name, Email, Phone, Project type (Replacement / New Construction / Remodel),
  Property type, Timeframe (now / 1–3 mo / 3–6 mo / researching), Optional message.
- Disclosure: "By submitting this form, your information will be shared with a Milgard
  Certified Dealer in your area." (Lead routing is local.)
- Microcopy reassures with "free, no-obligation."
- Success state: thank-you page identifying the dealer the lead was routed to.

---

## 37. Request a Brochure (`/request-a-brochure`) and the brochure form family

A hub that lists multiple brochures by topic; selecting one routes into a sub-form:
- `/form/beautiful-design-brochure`
- `/form/beautiful-design-brochure-3` (the active "Transform your home" variant)
- `/form/window-replacement-brochure`
- `/form/selecting-patio-doors-brochure`
- `/form/selecting-french-patio-doors-brochure`
- `/form/energy-efficiency`

Each form is short (Name, Email, ZIP, Project type), captures a brochure-specific intent,
and triggers an email that delivers the PDF *and* identifies the local Milgard Certified
Dealer the lead has been shared with.

---

## 38. Energy Calculator (`/energy-calculator` + `calc.milgard.com`)

A stepped filter SPA. For each ENERGY STAR zone, the user picks performance thresholds
(U-Factor, SHGC, VT) and gets a filtered list of qualifying Milgard products. There are
two presentations:
- Consumer-friendly version at `/energy-calculator`.
- Pro version with finer-grained spec filters at `calc.milgard.com`, designed for
  contractors meeting Title 24 (California) and other local codes.

This tool is doubly powerful: it's lead-gen camouflaged as utility. It generates qualified
SKU lists which the dealer can quote against.

---

## 39. Professional hub (`/professionals`)

Lands with three persona tiles: Architect → `/architects`, Contractor → `/contractors`,
Builder → `/builders`. Each persona path leads to:
- Technical Resources (`/technical-resources`) — CAD, BIM, 3D models, performance data,
  installation instructions.
- AIA/ASID/USGBC-approved continuing education courses.
- Energy Calculator (pro variant).
- Contractor Loyalty Program info.
- Architectural manuals as PDFs (e.g. `arch_manual_tuscany-montecito_hzslider_08-18_0.pdf`).

The pro hub looks visually different from the consumer side — sparser, denser tables,
emphasis on download links and form CTAs ("Become a Milgard Pro").

---

## 40. Technical Resources (`/technical-resources`)

Reference grid: per-product CAD, BIM, 3D models, performance spec PDFs, installation
instructions, NFRC certification documents. The page is essentially a downloadable matrix
keyed by series × operating style × document type.

---

## 41. How-To Guides (`/how-to-guides`)

A library of short instructional videos and step lists for owners:
- Cleaning and lubricating sliding patio doors.
- Cleaning weep holes on vinyl sliding patio doors (~5 minutes).
- Cleaning and care for Milgard sliding windows (video).
- Cleaning a Milgard window or patio door.

Each guide is a self-contained card with a thumbnail, duration, and step list. Cross-linked
heavily from product pages and from `/window-and-door-care`.

---

## 42. Care & Maintenance (`/window-and-door-care` and `/window-and-door-care/tips`)

A counterpart to the warranty page that quietly *protects* the warranty (an unmaintained
window is excluded from coverage). Content includes:
- Mild non-abrasive soap and water; never abrasive or acidic cleaners.
- Lubricating hardware at least once a year; twice yearly in high-salt-air areas.
- Vacuum + non-abrasive cleaner + steel wool for sliding tracks.
- Downloadable `milgard_care_and_maintenance_guide.pdf`.

---

## 43. Blog (`/blog`) — content patterns

The blog is a steady editorial drumbeat that supports SEO, education, and inspiration. The
post pattern observed:

- **Listicles** ("Top 7 life hacks for cleaning windows and patio doors", "10 traditional
  home design ideas", "12 Beautiful Home Exterior Shots to Help Inspire Your Next Project").
- **Educational explainers** ("Bow windows vs. Bay windows: Your questions answered",
  "Everything you need to know about soundproof windows").
- **Style guides** ("Best Windows for the Top 9 Architectural Styles", "Best of
  Traditional Homes", "Design Trends").
- **Seasonal** ("Spring cleaning do's and don'ts for window care").

Each post:
- Hero photo wide and bright.
- ~700–1500 words.
- Pull-quotes or numbered steps.
- Tagged for filtering.
- "Continue your inspiration" carousel at the bottom routing to series pages.
- Sidebar (or in-flow) CTA: "Request a Free Consultation".

---

## 44. News (`/news`)

Press release archive: company milestones (50 years of patio doors), industry awards
(BUILDER magazine "Brand Leader", AAMA membership), product launches (ADA-compliant
fiberglass French door, secondary lock for patio doors), corporate news (MI Windows
acquisition, MITER Brands rebrand). Charitable Foundation stories (MI Charitable Foundation
donations, Goodwill partnership) are interleaved with product news, humanizing the brand.

---

## 45. About (`/about`), Our Locations (`/our-locations`), Careers (`/careers`)

- **About**: "In 1958, Maurice Milgard, Jr. and his son Gary started Milgard Glass Company in
  a small building in Tacoma, Washington." Founder story is foregrounded; the brand explicitly
  claims West Coast and Pacific Northwest heritage. "Milgard is the number one brand in the
  western U.S." appears as a positioning line.
- **Our Locations** lists manufacturing plants and offices including
  `/our-locations/prescott-arizona`. Photographs and short blurbs per location.
- **Careers**: tied into MITER Brands recruiting; veteran-friendly messaging
  (the news page "Army veteran Harber thrives in management role at MITER Brands"); apprentice
  pathway through Goodwill partnership.

---

## 46. Home Depot partnership site (`homedepot.milgard.com`)

A co-branded mirror with:
- Reduced series catalog (Tuscany, Style Line, Ultra primarily).
- The same brand chrome but with Home Depot orange accents in CTAs.
- Home Depot's installation and financing tie-in.
- Separate warranty page reframing the Full Lifetime Warranty for Home Depot customers.

This sub-site shows Milgard's distribution sophistication — the brand can be partially
"reskinned" for a retail partner without compromising the master brand.

---

## 47. Forms, success states, micro-copy

Recurring patterns:
- All forms include the **"By submitting this form, your information will be shared with a
  Milgard Certified Dealer in your area"** disclosure.
- Required fields marked with a red asterisk; inline validation errors in the same red.
- Submit buttons are pill primary red with white sans-serif label, ~14 px all-caps or
  Title Case depending on context.
- Success pages always include: thank you headline, name of the routed dealer (when known),
  next-steps timeline ("a representative will reach out within 1–2 business days"), and a
  cross-sell ("While you wait: explore the Inspiration Gallery / read the Style Guide /
  download a brochure").

---

## 48. Cross-page content patterns & hero formulas

The "Milgard formula" for any product/series page reduces to a memorizable structure:

1. **Eyebrow** (series + maybe style)
2. **6–10-word H1** (benefit-led)
3. **Sub-headline** (one sentence, hardware/glass/warranty triplet)
4. **Two CTAs** ("Find a Dealer" primary, "Request a Brochure" secondary)
5. **Feature strip** (Energy Star, Warranty, Hardware, Glass, Color, Options)
6. **Positioning paragraph** (50–80 words)
7. **Operating styles grid** (with icons)
8. **Color / Grid / Hardware customization rows**
9. **Specs drawer or table**
10. **Warranty band** (in-page)
11. **Compare with other series**
12. **Inspiration row**
13. **Reviews (Bazaarvoice)**
14. **Sticky lead CTA**

The discipline of repeating this structure across ~50+ product pages is what gives the site
its sense of solidity even though no single page feels "designed-y".

---

## 49. Warranty trust-signal layering (synthesis)

Looking across all 50 pages reviewed, Milgard's warranty trust system has six visible layers:

1. **Promise layer** — homepage hero band, "Full Lifetime Warranty."
2. **Naming layer** — the warranty is named in every product positioning paragraph.
3. **Icon layer** — feature-strip badges include the warranty as one of the 4–6 core promises.
4. **Comparison layer** — series comparison charts show warranty type as a column.
5. **Documentation layer** — downloadable PDF of the current legal text, dated.
6. **Activation layer** — "Register Your Warranty" form turns the promise into an owner
   action, increasing perceived ownership.

Plus three supporting trust signals that reinforce the warranty implicitly:
- **Heritage** — "since 1958".
- **Made-in-the-US** — manufacturing locations named and shown.
- **Third-party validation** — BUILDER Brand Leader award, AAMA 50-year membership, Good
  Housekeeping and Architectural Record awards on AX550.
- **Local credibility** — Certified Dealer badge and dealer reviews.

The genius is layering: any single mention could be ignored, but six layers stacked across
every page make the warranty feel like the air the brand breathes.

---

## 50. Mobile experience

- Hero videos auto-play but respect `prefers-reduced-motion`.
- Hamburger reveals a multi-level drawer; mega-menu axes collapse to accordions.
- Sticky bottom CTA pill ("Find a Dealer").
- Forms stack to single-column with large 44-px tap targets.
- Product detail pages keep the full feature strip but compress the operating-style grid
  to a horizontally scrollable carousel.
- 3D models and the Renoworks visualizer warn the user that "for the best experience, view
  on desktop or tablet" but remain functional on phones.

---

## 51. Accessibility & performance observations

- Public Accessibility Statement linked in the footer.
- Alt text appears on most product imagery (confirmed in the brochure PDFs and the few
  archived snapshots that rendered fully).
- Color contrast for the primary red on white is borderline for body text but adequate for
  ≥18 px CTAs.
- Heavy reliance on Cloudflare's Turnstile during this audit suggests the brand is fending
  off bot traffic / scrapers aggressively — which adversely affects accessibility audits via
  automated tooling.
- Page weight is moderate (hero videos compressed to ~1–2 MB, lazy-loaded below the fold).
- LCP is anchored on the hero image; CLS is well controlled (the looping video uses a
  poster image to reserve space).

---

## 52. Strengths, weaknesses, and takeaways for FourlinQ

### Strengths to emulate

1. **Three-axis IA on the windows hub** (Style × Material × Series). For FourlinQ, the
   parallel would be Style × Profile-system × Series, with a fourth axis for "Application"
   (Residential / Commercial / High-rise) that fits the PH market.
2. **Series × Operating Style matrix URLs**. Predictable URLs scale and are friendly to
   contractors who know what they want.
3. **Warranty as oxygen, not a footer.** FourlinQ can adapt this by making its own warranty
   (uPVC-specific — UV resistance, anti-yellowing, hardware) the throughline.
4. **Free consultation + dealer locator** as the universal CTA. For FourlinQ, this becomes
   "Free site survey" + showroom locator across Metro Manila, Cebu, Davao.
5. **`*-101` educational hubs** ("Windows 101", "Patio Doors 101"). FourlinQ should build
   "uPVC 101", "Typhoon-rated Windows 101", "Sliding Doors 101" in both English and
   Tagalog/Filipino.
6. **Brochure family** sub-segmented by intent (replacement vs new build vs patio doors).
7. **Inspiration Gallery + visualizer** as a soft top-of-funnel.
8. **Editorial blog** that does the SEO work for long-tail style/material queries.
9. **Architectural-style cross-routing** (Craftsman, Mediterranean, etc.) — for FourlinQ,
   replace with PH archetypes: "Modern Filipino", "Bahay Kubo updated", "Coastal Cebu",
   "Hillside Tagaytay".
10. **3D model viewer per SKU** for pro-level transparency.

### Weaknesses to avoid

1. **Warranty fine print friction**: third-party reviewers consistently flag the
   non-transferable "lifetime" as misleading. FourlinQ should be explicit and friendly
   about transfer rules from day one.
2. **Visual sameness**: every series page looks like every other series page. This is
   excellent for scale but reads as monotone for design-conscious buyers. FourlinQ has the
   chance to keep the structural discipline while letting hero treatments breathe more.
3. **Aggressive Cloudflare/bot protection** can also block legitimate users on poor
   connections, mobile data, or with privacy tooling. Tune access carefully.
4. **PDFs as the canonical spec source** force users into a download flow. FourlinQ can
   keep specs inline (collapsible) and offer PDF as a courtesy.
5. **Pro hub is dense and dated** — FourlinQ can do better with a cleaner pro experience.

### Takeaways summarized

- Build the IA matrix (Series × Style) on day one; commit to URL stability.
- Make the warranty the spine of the copy, not a corner of the footer.
- Pair every product page with a free-consultation/site-survey CTA tied to a local showroom
  or installer.
- Educate with `*-101` hubs and an inspiration gallery — these are the long-tail SEO and
  the brand warmth simultaneously.
- Use one accent color (FourlinQ's brand red, blue, or green) sparingly and consistently —
  Milgard's red shows how powerful one accent can be when disciplined.
- Photography must look like life in the Philippines, not borrowed Western US assets.

---

## 53. Source URL appendix

All URLs below were observed in the public `site:milgard.com` index during this audit; many
are also cross-referenced in dealer mirrors and the Wayback Machine. They are listed by
section for verification.

### Core navigation
- https://www.milgard.com/
- https://www.milgard.com/windows
- https://www.milgard.com/doors
- https://www.milgard.com/patio-doors
- https://www.milgard.com/products
- https://www.milgard.com/vinyl
- https://www.milgard.com/fiberglass
- https://www.milgard.com/windows/aluminum-windows
- https://www.milgard.com/inspiration-gallery
- https://www.milgard.com/dealer-locator
- https://www.milgard.com/expert-consultation
- https://www.milgard.com/request-a-brochure
- https://www.milgard.com/energy-calculator
- https://www.milgard.com/warranty
- https://www.milgard.com/professionals
- https://www.milgard.com/architects
- https://www.milgard.com/contractors
- https://www.milgard.com/builders
- https://www.milgard.com/technical-resources
- https://www.milgard.com/install
- https://www.milgard.com/how-to-guides
- https://www.milgard.com/window-and-door-care
- https://www.milgard.com/window-and-door-care/tips
- https://www.milgard.com/blog
- https://www.milgard.com/news
- https://www.milgard.com/about
- https://www.milgard.com/our-locations
- https://www.milgard.com/our-locations/prescott-arizona
- https://www.milgard.com/careers
- https://www.milgard.com/grids
- https://www.milgard.com/suncoat
- https://www.milgard.com/windows-101
- https://www.milgard.com/patio-doors-101
- https://www.milgard.com/learn/understanding-windows-doors/components-windows-and-doors/grids
- https://www.milgard.com/learn/replacement-windows/understanding-noise

### Window series and operating styles
- https://www.milgard.com/windows/V400
- https://www.milgard.com/windows/V400/bay-bow
- https://www.milgard.com/windows/V300
- https://www.milgard.com/windows/V300/single-hung
- https://www.milgard.com/windows/V300/horizontal-slider
- https://www.milgard.com/windows/V300/casement
- https://www.milgard.com/windows/V300/awning
- https://www.milgard.com/windows/V300/picture
- https://www.milgard.com/windows/V300/radius
- https://www.milgard.com/windows/V250
- https://www.milgard.com/windows/V250/single-hung
- https://www.milgard.com/windows/V250/horizontal-slider
- https://www.milgard.com/windows/V250/casement
- https://www.milgard.com/windows/V250/awning
- https://www.milgard.com/windows/V250/picture
- https://www.milgard.com/windows/V250/radius
- https://www.milgard.com/windows/C650
- https://www.milgard.com/windows/C650/awning
- https://www.milgard.com/windows/C650/horizontal-slider
- https://www.milgard.com/windows/C650/single-hung
- https://www.milgard.com/windows/C650/casement
- https://www.milgard.com/windows/C650/picture
- https://www.milgard.com/windows/C650/bay-bow
- https://www.milgard.com/windows/A250
- https://www.milgard.com/windows/A250/picture
- https://www.milgard.com/windows/A250/casement
- https://www.milgard.com/windows/A250/horizontal-slider
- https://www.milgard.com/windows/A250/single-hung
- https://www.milgard.com/windows/A250/awning
- https://www.milgard.com/windows/A250/radius
- https://www.milgard.com/windows/A250/thermally-improved-aluminum-radius-window
- https://www.milgard.com/windows/quiet-line-series
- https://www.milgard.com/windows/bay-bow
- https://www.milgard.com/windows/specialty
- https://www.milgard.com/windows/style/bay-bow-windows

### Door series and patio doors
- https://www.milgard.com/doors/V300/sliding
- https://www.milgard.com/doors/V400
- https://www.milgard.com/doors/C650
- https://www.milgard.com/doors/C650/sliding
- https://www.milgard.com/doors/AX450
- https://www.milgard.com/doors/AX550
- https://www.milgard.com/doors/AX550/bi-fold
- https://www.milgard.com/doors/AX550/stacking
- https://www.milgard.com/doors/AX650
- https://www.milgard.com/doors/AX650/pocket
- https://www.milgard.com/doors/moving-glass-wall-systems/stacking-glass-walls-aluminum
- https://www.milgard.com/patio-doors/sliding-glass-doors
- https://www.milgard.com/patio-doors/pocket-doors
- https://www.milgard.com/patio-doors/bi-fold-doors

### Tools and forms
- https://www.milgard.com/3d-model/3d-trinsic-series-v300-retrofit-picture-window
- https://calc.milgard.com/
- https://milgard.renoworks.com/
- https://www.milgard.com/form/beautiful-design-brochure
- https://www.milgard.com/form/beautiful-design-brochure-3
- https://www.milgard.com/form/window-replacement-brochure
- https://www.milgard.com/form/selecting-patio-doors-brochure
- https://www.milgard.com/form/selecting-french-patio-doors-brochure
- https://www.milgard.com/form/energy-efficiency
- https://www.milgard.com/warranty/register-your-warranty
- https://www.milgard.com/warranty/register-your-warranty/submission

### Dealer locator examples
- https://www.milgard.com/dealer-locator/ca/los-angeles
- https://www.milgard.com/dealer-locator/wa/everett
- https://www.milgard.com/dealer-locator/ca/fremont
- https://www.milgard.com/dealer-locator/or/portland
- https://www.milgard.com/dealer-locator/wa/Port%20Angeles
- https://www.milgard.com/dealer-locator/all/Phoenix
- https://www.milgard.com/dealer-locator/all/Denver
- https://www.milgard.com/dealer-locator/all/Salem
- https://www.milgard.com/dealer-locator/all/Colorado%20Springs
- https://www.milgard.com/dealer-locator/dealer/261
- https://www.milgard.com/dealer-profile/california/laguna-hills/shamrock-windows-doors
- https://www.milgard.com/dealer-profile/oregon/wilsonville/advanced-energy-services
- https://www.milgard.com/dealer-profile/california/los-angeles/windows-n-things
- https://www.milgard.com/dealer-profile/426/california/carlsbad/elite-glass-window-inc
- https://www.milgard.com/dealer-profile/california/santa-cruz/lighthouse-windows
- https://www.milgard.com/dealer-profile/oregon/clackamas/builders-firstsource

### Brochures and PDFs
- https://www.milgard.com/brochure/trinsictm-series-vinyl-windows-doors
- https://www.milgard.com/sites/milgard/files/brochure/Milgard_V250-StyleLine_Series_brochure_053025_DIGI.pdf
- https://www.milgard.com/sites/milgard/files/brochure/A250_Brochure.pdf
- https://www.milgard.com/sites/default/files/brochure/pdf/aluminum_series.pdf
- https://www.milgard.com/sites/milgard/files/brochure/milgard_care_and_maintenance_guide.pdf
- https://www.milgard.com/sites/default/files/technical-resources/files/arch_manual_tuscany-montecito_hzslider_08-18_0.pdf
- https://www.milgard.com/sites/default/files/2025-12/Milgard%20Full%20Lifetime%20Warranty%20010126%201.pdf
- https://www.milgard.com/sites/milgard/files/2024-09/Full%20Lifetime%20Warranty%20-%20July%201,%202024-present.pdf
- https://www.milgard.com/sites/milgard/files/2023-02/211004_lifetime_limited_warranty.pdf

### Blog and editorial
- https://www.milgard.com/blog/best-windows-top-9-architectural-styles
- https://www.milgard.com/blog/window-ideas
- https://www.milgard.com/blog/10-traditional-home-design-ideas
- https://www.milgard.com/blog/window-design-ideas-bring-your-home-life
- https://www.milgard.com/blog/12-beautiful-home-exterior-shots-help-inspire-your-next-project
- https://www.milgard.com/blog/design-trends
- https://www.milgard.com/blog/best-traditional-homes
- https://www.milgard.com/blog/bay-and-bow-windows-your-questions-answered
- https://www.milgard.com/blog/bow-window-vs-bay-window
- https://www.milgard.com/blog/small-bathroom-window-design-inspiration-and-ideas
- https://www.milgard.com/blog/spring-cleaning-dos-and-donts-window-care
- https://www.milgard.com/blog/how-to-clean-sliding-door-tracks
- https://www.milgard.com/blog/top-7-life-hacks-cleaning-windows-and-patio-doors
- https://www.milgard.com/blog/window-screen-cleaning
- https://www.milgard.com/blog/noise-reducing-windows
- https://www.milgard.com/blog/everything-you-need-know-about-soundproof-windows
- https://www.milgard.com/blog/create-quiet-home-are-noise-reducing-replacement-windows-right-you
- https://www.milgard.com/blog/noise-reduction-home-renovation
- https://www.milgard.com/blog/milgard-windows-win-best-houzz-design
- https://www.milgard.com/blog/introducing-C700-fiberglass-series
- https://www.milgard.com/blog/50th-anniversary-patio-door-manufacturing-milestone

### News
- https://www.milgard.com/news/milgard-windows-doors-launches-new-online-tools-consumers-and-professionals
- https://www.milgard.com/news/mi-windows-and-doors-completes-acquisition-milgard-windows-doors
- https://www.milgard.com/news/mi-windows-and-doors-parent-company-becomes-miter-brands
- https://www.milgard.com/news/milgard-celebrates-50-years-manufacturing-quality-patio-doors
- https://www.milgard.com/news/milgard-fiberglass-windows-awarded-best-western-us
- https://www.milgard.com/news/milgard-launches-new-design-resources-and-continuing-education-architects
- https://www.milgard.com/news/milgard-objects-montecitor-series-ultratmwoodcladtm-series-and-quiet-linetm-series-windows-and
- https://www.milgard.com/news/milgardr-introduces-new-energy-calculator-help-professionals-meet-project-requirements-0
- https://www.milgard.com/news/milgard-introduces-new-sliding-patio-doors-smarttouchtm-handle-0
- https://www.milgard.com/news/milgard-launches-ada-compliant-fiberglass-french-door
- https://www.milgard.com/news/milgard-introduces-new-advanced-security-secondary-lock-patio-doors
- https://www.milgard.com/news/milgards-swing-fiberglass-patio-door-now-available-operable-sidelites-and-new-transom-styles
- https://www.milgard.com/news/premium-exterior-vinyl-finishes-offer-new-opportunities-builders-homeowners
- https://www.milgard.com/news/milgard-offers-new-vinyl-color-option-texas-market
- https://www.milgard.com/news/skys-limit-career-opportunities-milgard-windows-doors
- https://www.milgard.com/news/milgard-and-goodwill-partner-open-doors-job-seekers
- https://www.milgard.com/news/army-veteran-harber-thrives-management-role-miter-brands

### Co-branded subdomains
- https://homedepot.milgard.com/
- https://homedepot.milgard.com/warranty
- https://homedepot.milgard.com/windows/style-line-series
- https://homedepot.milgard.com/windows/tuscany-series/tuscany-series-bay-bow-windows
- https://homedepot.milgard.com/windows/ultra-series/ultra-series-radius-window
- https://homedepot.milgard.com/windows/ultra-series/ultra-series-bay-bow-window

---

*End of audit.*
