---
title: Schüco — Competitor Design, UX & IA Audit
purpose: Reference research for FourlinQ positioning (Philippine uPVC manufacturer pursuing German-engineered premium adjacency)
audit-scope: Global English site (schueco.com/de-en), UK Homeowners spin-off (schuecohome.co.uk), Investors, Architects, Sustainability, Careers, Products, References, Showrooms
date-of-observation: 2026-05-23
audit-author: FourlinQ design research
extends: docs/references/design-systems/schueco.md
sources-cited:
  - https://www.schueco.com/de-en
  - https://www.schueco.com/de-en/architects
  - https://www.schueco.com/de-en/architects/products/windows
  - https://www.schueco.com/de-en/architects/products/doors
  - https://www.schueco.com/de-en/architects/products/facades
  - https://www.schueco.com/de-en/architects/products/sliding-systems
  - https://www.schueco.com/de-en/architects/products/security-systems
  - https://www.schueco.com/de-en/architects/comprehensive-solutions
  - https://www.schueco.com/de-en/architects/comprehensive-solutions/renovation
  - https://www.schueco.com/de-en/architects/digital-solutions
  - https://www.schueco.com/de-en/architects/references
  - https://www.schueco.com/de-en/home-owners
  - https://www.schueco.com/de-en/investors
  - https://www.schueco.com/de-en/sustainability
  - https://www.schueco.com/de-en/company
  - https://schuecohome.co.uk/
positioning-objective: "Identify exactly how Schüco signals premium without marketing-loud cues — so FourlinQ can position adjacent (Philippine uPVC, German-engineered) without imitation or cheap mimicry."
---

# Schüco — Competitor Design, UX & IA Audit (Global English)

> Extends [`docs/references/design-systems/schueco.md`](references/design-systems/schueco.md). Token table in that file remains the source of truth for hex/typography primitives extracted from the production stylesheet (`/resource/themes/web/css/web-4535950-42.css`, 257KB). This document layers on UX, IA, content patterns, and positioning observations from a live page-by-page walk of the global English site in May 2026.

---

## 0. Executive Summary — How Schüco Signals Premium Without Being Marketing-Loud

Schüco's premium signal does **not** come from any of the moves a young brand reaches for. It comes from a tight, deliberately restrained set of choices that read as inevitability rather than effort:

1. **The hero never sells.** It states a *condition of the world* — "Future-proof building envelopes for complex challenges" ([source](https://www.schueco.com/de-en)). The CTA is "Learn more". There is no "Get a Quote", no "Book Now", no scarcity. The hero treats the visitor as already qualified.
2. **No oversized type.** Schüco's hero caps at ~40px (2.5rem in the stylesheet). The brand explicitly refuses the giant-display-headline reflex of modern marketing sites. Hierarchy comes from weight and rhythm, not scale.
3. **One typeface, two weights.** Univers Regular (430) and Univers Bold (630). No serif accents, no second display family, no script flourish. The whole site reads as one continuous voice.
4. **Industrial green, not seasonal green.** `#4C840D` is a working green — closer to a road-sign or trade-uniform green than to "sustainability lifestyle" sage. It refuses the WWF-panda visual cliché while still carrying the environmental story.
5. **Information density is the luxury.** Where consumer-luxury brands strip information to feel exclusive, Schüco multiplies it. A product page surfaces specs table + finishes grid + glass matrix + certifications + dealer info + PDFs + system-features bullets *above the fold*. The implicit message: "We have nothing to hide, and you are competent enough to read it."
6. **Audience routing is honest.** The homepage's "Individual content – select your area" section is literally a 7-card grid: Investors / Home Owners / Architects / Fabricators / Electrical partners / Building operators / Suppliers. No fake personalization. No marketing funnel. The IA assumes the visitor knows what they are.
7. **You cannot buy directly.** The Home Owners landing explicitly states: *"You cannot buy Schüco products directly from us."* ([source](https://www.schueco.com/de-en/home-owners)). The site routes you to a qualified partner. This single sentence is the most premium move on the site — it converts the brand from a vendor into a *specification*.

**FourlinQ implication:** premium positioning at Philippine uPVC scale will come from refusing the marketing-loud reflexes (scarcity countdowns, "From ₱X" price banners, lifestyle-influencer testimonials, giant rotating heroes), not from adding more. The Schüco lesson is *what to leave off*.

---

## 1. Design System

### 1.1 Typography

Source: stylesheet extracted in `references/design-systems/schueco.md`, confirmed visually across the global English site in May 2026.

| Token | Value | Notes |
|---|---|---|
| Primary family | Univers (Linotype, Frutiger 1957), licensed and customized | Used for 100% of on-site type. No secondary family. |
| Fallback stack | `Univers, "Univers Regular Fallback", sans-serif` | Custom fallback metric-matched to avoid layout shift. |
| Weights deployed | Regular (430), Bold (630) | No 300/500/800. Hierarchy is rhythmic, not weight-explosive. |
| Body | 16px (1rem), line-height 1.5 | Form-control modal text is the same — no UI shrink. |
| H6 → Display | 18 / 20 / 24 / 28 / 30 / 32 / 40px | Display cap at 40px. **The hero never goes bigger.** |
| Italic | Almost absent | Schüco does not use italic for emphasis. Bold carries it. |
| Optical kerning | Tight, not loose | Univers's geometric grid carries spacing — no manual tracking on headlines. |
| All-caps | Used only in eyebrow labels (breadcrumbs, certification tags) | Headlines and CTAs use sentence case. |

**German-typography signal:** the precision is not in the typeface choice alone — Univers is widely available. It is in the **discipline of using only two weights**, the **refusal to scale headlines past 40px**, and the **uniformity across audiences**. The architect page, the homeowner page, the investor page, and the careers page all share the same modular scale. This is the singular voice that signals German engineering posture more than any hero copy could.

**FourlinQ note:** the FourlinQ stack can stay with whatever the existing token table specifies (see `DESIGN_SYSTEM.md`), but the discipline lesson translates: pick two weights, ship two weights. A "premium German-engineered" voice cannot live in a six-weight type stack.

### 1.2 Color Palette

| Role | Hex | Function on Schüco | What it teaches FourlinQ |
|---|---|---|---|
| Ink (display + body) | `#262626` | Used for both — Schüco does not lighten body to grey-on-white. Same ink for H1 and paragraph. | Resist the urge to soften body text to #555 or #666. Premium reads as "one ink colour, used confidently." |
| Ink muted | `#4E4E4E` | Captions, metadata, breadcrumb intermediate segments | Reserve for breadcrumb crumbs and reference-card metadata only. |
| Hairline | `#BFBFBF` | Borders on filter chips, table dividers, tab underline | Use a single hairline value site-wide. Multiple greys = amateur. |
| Canvas white | `#FFFFFF` | Primary surface | — |
| Canvas soft | `#F2F2F2` | Section alternation, sidebar fills, breadcrumb bar background | The *only* section break colour. No gradient hero washes. |
| Canvas divider | `#E6E6E6` | Tab inactive backgrounds, table row alternation | One tone, one purpose. |
| Accent green (primary brand) | `#4C840D` | Logo accent, primary nav highlights, "Schüco confirmed" check badges, sustainability tags | Industrial dark green. **Not olive, not sage, not lime.** |
| Accent green bright | `#78B928` | Hover state on green, secondary highlights | Hover lifts ~20% in chroma. Never used as a primary surface. |
| Accent green deep | `#005F1E` | Most corporate / sustainability-report contexts | Carbon Control branding, German Sustainability Award badge area. |
| Accent red | `#BC0000` | Primary CTA fill ("Request Quote", "Find Dealer"), error/warning, high-importance alerts | A muted, corporate red — not Coca-Cola red, not RAL "signal" red. Confidence, not alarm. |
| Accent cyan | `#00A2D1` | Info badges, technical-spec callouts, CE-mark certifications | Functions like an "engineering blueprint" cue. |

**Critical observation: the multi-color semantic system.** Schüco does not use accent green for everything sustainability-coded. It uses **green for environmental certifications (Cradle-to-Cradle), cyan for technical certifications (CE marks), red for quality certifications (ISO)**. The colour itself carries metadata — a visitor scanning a product card knows what *kind* of certification each badge represents before reading the label.

This is the singular hardest move to copy because most brands have a single accent and would have to invent reasons to deploy three. For FourlinQ, the cleaner lesson is the opposite: **commit to one semantic accent and use it with the same internal discipline** (only ever for X, never for Y), rather than ape the three-colour system.

**Hex hygiene observation:** I checked the rendered homepage in May 2026 and saw very few greens visible *above the fold*. The signature `#4C840D` is reserved for: the logo wordmark accent (a small block beside "Schüco"), the WWF partnership badge in the footer, certification-row badges on product pages, and the "75th anniversary" eyebrow. **The brand colour is rationed.** The homepage hero itself is dominantly grayscale + architectural photography. This is the opposite of brands that flood their hero with brand colour.

### 1.3 Spacing, Container, Grid

| Token | Value | Observation |
|---|---|---|
| Container max | ~1280–1440px depending on section | Wider than Sky-Frame's editorial 1200px; narrower than Marvin's 1400px hero. |
| Section vertical rhythm | 64–96px | Tighter than the 120–160px used by lifestyle-luxury brands. Density is intentional. |
| Card gutter | 16–24px | Tight. Many cards visible per row. |
| Body prose max-width | ~640–800px | Schüco does not allow body text to run edge-to-edge. Reading line stays comfortable. |
| Grid columns | 12-col with 24px gutter (inferable from product grid) | Standard. |

**Section padding observation:** the homepage's "Products for all building projects" section displays **14 product cards in a single grid** without infinite scroll, without "Show more". You see the entire catalog scope at once. Compare to brands that paginate product categories to feel curated — Schüco's signal is "we make all of this." Density = competence.

### 1.4 Buttons, CTAs, Forms

| Element | Treatment |
|---|---|
| Primary CTA | Red `#BC0000` fill, white text, ~4–6px radius, ~14–16px label, sentence case (not all-caps), no icon by default. |
| Secondary CTA | Text link with chevron `>` or underline. No outlined-button style. |
| Tertiary | Plain text link, optional underline-on-hover. |
| Form field | Hairline `#BFBFBF` border, white fill, ~4px radius. No floating labels — labels sit above. |
| Filter chip | `#F2F2F2` fill, hairline border, ink `#262626` text. Active = green `#4C840D` border or fill. |

**Notable absence:** no glowing buttons, no gradient CTAs, no "→" animated hover slide. Hover is a 150–200ms ease-out colour shift (red → darker red, or green → bright-green). That's the entire interaction grammar.

### 1.5 Logo & Wordmark

The Schüco logo is a sans-serif wordmark "Schüco" with a small green accent (often a green underline block or green "75" anniversary badge in 2026). The wordmark uses the same Univers family as body text — there is no display-only logotype, no custom letterforms. **The logo is just the brand name, written in the brand's typeface, with a tiny industrial-green accent.** This is the deepest move in the system: the company does not lean on a logo mark, because the body of work is the mark.

For FourlinQ this is a useful contrast — most Philippine fenestration brands invest in monogram marks (FQ, F4, etc). Schüco's lesson is that confidence in the wordmark beats clever monogramming when premium positioning is the goal.

### 1.6 Iconography

| Type | Treatment |
|---|---|
| UI icons (search, account, hamburger) | Thin-line (~1.5px stroke), monochrome ink, square viewbox | 
| Product/category icons | Replaced by photography. Schüco does not use illustrative product icons. | 
| File-type icons in downloads | Generic PDF / DWG / IFC labels — text-first, icon-secondary | 
| Decorative icons | Almost none | 

**Observation:** Schüco's restraint with icons is one of its quietest premium signals. There are no "feature" sections with three lifestyle icons + headline + body — a pattern endemic to mid-market construction brands. Schüco replaces those icon-rows with **certification rows** (CE, Cradle-to-Cradle, Passivhaus). The "trust badges" *are* the icons.

### 1.7 Accent Lines, Dividers, Rules

- Section dividers are 1px hairlines (`#E6E6E6`), full container width, never decorative.
- No diagonal accent lines, no animated underlines on the hero, no SVG patterns.
- Tables use horizontal rules between rows; columns are unruled.
- Breadcrumb bar sits on a `#F2F2F2` block and ends with a 1px bottom hairline before the page body begins.

---

## 2. Animations + Interactions

### 2.1 Motion Philosophy

The fastest way to characterize Schüco's motion: **functional, not theatrical**. There is no scroll-jacking, no parallax video hero, no Lottie animation introducing the brand. The brand specifically refuses spectacle.

| Motion type | Observed behaviour |
|---|---|
| Hero | Static responsive image. No autoplay video on the global English home (May 2026 — the previous "75th anniversary" badge is a still image, not a loop). |
| Scroll | Native browser scroll. No locking, no horizontal sections, no pinned panels. |
| Carousel | The "Be inspired" reference projects use a manually-advanced slider with arrow controls; no autoplay loop. Slide transition is a ~300ms ease-out fade-slide. |
| Hover | 150–200ms ease-out colour shift on links, buttons, and card image scale (~1.02 micro-zoom on reference cards). |
| Mega-menu open | ~200ms ease-out drop with subtle opacity fade. No bouncy easing. |
| Filter panel | Faceted-search expand/collapse, ~250ms slide-down. |
| Product video tiles | The Windows page has six product videos arranged in a manual carousel. Click-to-play. No autoplay above the fold. |
| Loading | Skeletons on the references grid, otherwise default. |

**Easing:** the dominant curve appears to be a simple `ease-out` (CSS default). No spring physics. No custom cubic-bezier with overshoot. This is consistent with the "engineering documentation" voice — motion communicates state change, nothing more.

**Duration ladder:** 150ms (link hover) → 200–250ms (button hover, menu open) → 300ms (carousel slide). Anything longer than 300ms is absent.

### 2.2 Configurator / 3D Interactions

Schüco's interactive heavy-lift lives behind the My Workplace login wall for architects. The publicly-visible interactive surfaces are:

- **"My Sliding Door" selector** (Home Owners) — a guided wizard that filters to a recommended sliding-door system. Closer to a question tree than a 3D configurator.
- **Building Physics Solver, Drive Planner, PolyPlan, PlanToBuild** (Architects → Digital Solutions) — all gated tools behind professional login. The public page describes them, but the interaction is private.
- **No public 3D window configurator** akin to Vitrocsa or Sky-Frame's hero canvas. Schüco's audience is professional; the brand assumes the configurator output is a CAD/BIM file, not a marketing toy.

**Lesson for FourlinQ:** Schüco does not put a 3D configurator on the consumer site because the buy is not consumer-direct. The "My Sliding Door" wizard is the consumer surface; the technical configurators sit behind partner/architect auth. This is the right pattern for a brand that wants premium-adjacent positioning *without* the cost burden of building Vitrocsa-grade WebGL.

### 2.3 Mobile vs Desktop

| Surface | Desktop | Mobile |
|---|---|---|
| Top nav | Persistent horizontal bar with mega-menu hover | Hamburger menu (`Navigation öffnen` aria-label observable in DE) with full-screen overlay |
| Breadcrumb | 3–5 levels visible | Truncates to last 2 segments |
| Product grid | 4-up | 2-up, then 1-up at narrow widths |
| Sidebar (filters, downloads) | Persistent left rail | Collapses to a top-of-page accordion |
| Carousel | Arrow-controlled | Touch-swipe |
| Reference card metadata | All tags visible | Tags truncate with "+3 more" |

**Mobile observation:** the carousel of 14 audience cards on the homepage compresses smartly to a 2-column grid, not a horizontal swipe. Schüco prioritizes seeing the whole audience map over a "Tinder swipe" interaction.

---

## 3. UX Flow

### 3.1 Audience Routing (the central UX move)

The defining UX decision on the global English site is the **explicit audience picker** that appears in three places:

1. The **top navigation** has a row of audience links (Investors / Home Owners / Architects / Fabricators / Electrical partners / Operator / Suppliers).
2. The **homepage** has a section titled *"Individual content – select your area"* with seven audience cards.
3. The **footer** repeats the same seven links as the first column.

**Why this works for premium positioning:** Schüco refuses to "personalize" the experience by behavioural inference. It asks the visitor to declare. This is a respectful UX move that signals "we have different conversations for different stakeholders, and we are not going to flatten them into a single funnel." It is the opposite of consumer-DTC funnel design.

The seven audiences map to seven *content systems*, not seven landing pages. Each audience gets:

- Its own hero copy
- Its own product organization (architect = by material; homeowner = by typology like "Windows" / "Sliding doors")
- Its own resource tier (architect = CAD/BIM/specs; homeowner = inspiration + dealer locator; investor = ESG/TCO; fabricator = manufacturing partnership)
- Its own CTA grammar (architect = "Login to My Workplace"; homeowner = "Find Schüco partners in your area"; investor = "Arrange an individual consultation")

### 3.2 Homeowner Journey

Source: [global Home Owners landing](https://www.schueco.com/de-en/home-owners), [UK Homeowners spin-off](https://schuecohome.co.uk/).

1. **Inspiration first.** The UK Homeowners site opens with *"For a comfortable, secure, contemporary home."* The first CTA is "Explore our products" — but the second section, "Be inspired", is the experiential entry point.
2. **Three-step process named explicitly:**
   - *Be inspired* — articles, case studies
   - *Touch and feel* — visit partner showrooms (two listed: Milton Keynes, London)
   - *Finalise your vision* — work with Schüco partners
   This is the entire customer journey on a single line. No fake "request a quote" shortcut.
3. **The no-direct-sale firewall.** Quoted: *"You cannot buy Schüco products directly from us."* The site is comfortable saying it. Friction is rebranded as quality control. The partner is the gate — and the gate is positioned as a benefit, not an obstacle.
4. **Product cards on Home Owners use typology language** (Windows, Bi-Fold Doors, Sliding Doors, Front Doors, Interior Doors, Façades) — not the AWS/ASE/FWS engineering codes used on the architect site. The same products, two vocabularies.
5. **Copy voice softens** — "Effortless elegance from German engineering" is the kind of line that would never appear on the Architects landing. The homeowner site uses warmer, more aspirational language while never abandoning the engineering proof.

### 3.3 Architect Journey

Source: [Architects landing](https://www.schueco.com/de-en/architects), [Windows category](https://www.schueco.com/de-en/architects/products/windows).

1. **Hero is workflow-framed, not product-framed:** *"Individual design with maximum planning reliability"* with sub *"With our solutions, we support you through all work phases."* The promise is *process*, not *parts*.
2. **My Workplace is the first call-to-action.** Before any product, before any reference. The architect's job-to-be-done is "get the planning files into my workflow" — and Schüco answers that first.
3. **Four comprehensive-solutions tiles** (Renovation, Carbon Control, Circularity, Fire Protection) precede the product grid. This is critical: Schüco frames itself as **solving problems**, not selling products, on the architect surface.
4. **Products are organized by material on the Architects site** (Aluminium / PVC-U / Steel / Aluminium-Timber hybrid), not by typology. Architects shop by material constraint; homeowners shop by typology.
5. **Every product page exposes the same 5-tier resource sidebar**: Tender Texts / CAD-Files / BIM-Objects / Attachments to Building Structure / Brochures. Predictable, dependable, scannable.
6. **References are the closing argument.** Five recent highlight references appear at the bottom of the Architects landing with project name, location, building type, and a tag-row of competencies used (e.g., "Belle Harbour" with "Circularity").

### 3.4 Investor Journey

Source: [Investors landing](https://www.schueco.com/de-en/investors).

1. **Hero copy:** *"High-yield façade solutions"* and *"Investments need security. Whether in newbuilds or existing buildings, with our windows, doors and façades you can reduce the carbon footprint."* The first noun an investor sees is **yield**, the second is **security**. This is the only audience whose hero leads with a financial frame.
2. **Three pillars, financially-coded:**
   - Value Rendering (ESG, Cradle-to-Cradle, OPEX reduction)
   - Building Lifecycle Coverage (newbuild, renovation, decarbonisation)
   - Due Diligence Enablers (risk minimization, one-source solutions)
3. **Primary CTA is "Arrange an individual consultation"**, repeated 3x on the page. No "Request brochure". The investor surface assumes the next step is a meeting, not a download.
4. **Photography is portfolio-aspirational:** offices, hotels, healthcare. Familiar asset classes. No residential interiors.
5. **Tone:** consultant-language, not sales-language. "Expert and consultant for the building envelope." Schüco *advises* investors, it does not *pitch* them.

### 3.5 Sustainability Narrative

Source: [Sustainability landing](https://www.schueco.com/de-en/sustainability).

The Sustainability page is structured as a **public-facing sustainability report**, not a marketing page. Key moves:

1. **CEO statement above the fold** — Andreas Engelhardt opens with *"The construction industry is facing major challenges throughout the world. Global crises and economic instability are threatening to overshadow the targets of the Paris Agreement."* This is a CEO speaking to peers, not a brand selling to consumers.
2. **Numerical commitment table** — actual CO₂e tonnage for 2019 / 2023 / 2024 / 2030 / 2040, with reduction percentages. **The numbers are the design.** No infographic flourish, no animated counter.
3. **Five pillars** (Environment / Products / Business Development / Supply Chain / Employees) — each pillar links to a deep sub-page with its own sub-pillars.
4. **The German Sustainability Award 2026 badge** sits as a third-party credential, not as a self-congratulatory hero.
5. **Net-zero 2040 target validated by SBTi.** The third-party validator is the proof.

**FourlinQ note:** the sustainability narrative is the most copyable, most over-copied space in fenestration. Schüco's advantage is that it shows numbers, dates, and third-party validators *before* it shows imagery. A FourlinQ sustainability story should follow this structure exactly: stated commitment → measurable target → third-party validator → product implication — in that order.

### 3.6 Product Browsing — Windows / Sliding Doors / Façades

| Pattern | Windows | Sliding Doors | Façades |
|---|---|---|---|
| Grouping | Material (Alu / PVC-U / hybrid) | Design type (Panorama / Classic / Folding) | Construction type (Standard / Design / All-Glass / Unitised / Add-On / Commercial) |
| Featured tiles | 4 (AWS WoodDesign, FocusIng, Barrier-free, Symbiotic) | 3 design-type tiles | 6 construction-type tiles |
| Capability sub-sections | Energy Efficiency / Sustainability / Security / Accessibility | Design / Flexibility / Comfort / Performance | Design freedom / Performance |
| Video tiles | 6-tile manual carousel | Embedded per system | Reference-led |
| Resource sidebar | Same 5 (Tender / CAD / BIM / Attachments / Brochures) | Same | Same |
| Reference count | Multiple per system | Nine case studies | Four case studies |
| Certifications surfaced | Passivhaus, Cradle-to-Cradle, VinylPlus, RC1–RC3 | — | Passivhaus thermal performance, scalable tested assemblies |

**The pattern that repeats across all product categories:** *Lead with grouping → 4–6 featured tiles → 4 capability subsections → videos → references → 5-item resource sidebar.* This template is so consistent across categories that it functions as a content design system in itself.

### 3.7 Reference Projects (Case Studies)

Source: [References landing](https://www.schueco.com/de-en/architects/references) — **207 international projects** indexed.

**Filtering:**
- 17 feature filters (project type, sustainability certifications, safety, performance, design language)
- 13 building-type filters (office, residential, retail, hospitality, education, sports/culture, healthcare, industrial, transport)
- 11 product filters
- 3 material filters
- ~30+ country filters

**Card metadata per project:** location, building type, applicable feature tags, products used, sustainability/performance attributes.

**Thematic groupings on the landing:** "Newly added reference highlights" / "Building in existing buildings" / "Decarbonisation" / "Fire and smoke protection" / "Residential construction" — each section shows 4–6 featured projects with a "see all in this category" link.

**The signature pattern:** carousel-of-carousels. The page is a stack of horizontally-scrollable rows by theme, not a single grid. This lets Schüco surface ~30 references on a single landing without overwhelming.

**FourlinQ note:** the reference project is *the most credentialing content type* a fenestration brand can publish. It is also the hardest to fake. FourlinQ's PH project list should be filterable by: building type (residential / commercial / mixed-use), location (region in PH), and product line used. Three filters, not 17 — but the filter pattern is the right one.

### 3.8 Dealer / Partner Locator

The "Showrooms" link on the global English site routes (where it loads) to a list of regional showrooms — Berlin, Bielefeld, Düsseldorf, Frankfurt, Hamburg, Weißenfels, Wertingen for Germany; Milton Keynes and London for the UK consumer site. The locator is not a Google-Maps-pin-storm; it is a curated list of physical Schüco-branded spaces.

The **partner network** (40,000 fabricators globally) lives behind the partner-search wizard on the Home Owners site, scoped by postcode/region. The architect site does not surface a partner locator — architects are expected to specify, not source.

---

## 4. Information Architecture

### 4.1 Top-Level Sitemap (Global English)

```
schueco.com/de-en
├── Investors
├── Home Owners
│   └── (typology product cards: Windows / Entrance doors / Sliding doors / Smart Home / Conservatories / Balconies)
│   └── "My Sliding Door" selector tool
│   └── Find Schüco partners (postcode search)
├── Architects
│   ├── Comprehensive Solutions
│   │   ├── Renovation (Value Up)
│   │   ├── Carbon Control
│   │   ├── Circularity
│   │   └── Fire & Smoke Protection
│   ├── Products
│   │   ├── Windows
│   │   ├── Doors
│   │   ├── Sliding systems
│   │   ├── Façades
│   │   ├── Security systems
│   │   ├── Fire and smoke protection
│   │   ├── Sun shading
│   │   ├── Ventilation
│   │   ├── Textile façades (Facid)
│   │   ├── Building-integrated photovoltaics (BIPV)
│   │   ├── Building automation
│   │   ├── Balconies
│   │   ├── Conservatories and terrace roofs
│   │   └── Surface finishes
│   ├── Digital Solutions
│   │   ├── My Workplace (login-gated planning portal)
│   │   ├── Docu Center
│   │   ├── Internet of Façades
│   │   ├── PlanToBuild
│   │   ├── Building Physics Solver
│   │   ├── Drive Planner
│   │   └── PolyPlan
│   └── References (207 projects, faceted filtering)
├── Fabricators
├── Electrical partners
├── Operator (building operators)
├── Suppliers
├── Company
│   ├── History (75 years)
│   ├── Campus (Bielefeld HQ)
│   ├── Leadership
│   └── Showrooms
├── Sustainability
│   ├── General Information (business model, governance, materiality, stakeholders, reporting)
│   ├── Environment (climate, biodiversity, circular economy)
│   ├── Social (human rights, OHS, diversity, development)
│   ├── Governance (policies, anti-corruption)
│   └── Transparency (principles, indices, certifications, archive)
├── Compliance
├── Careers (redirects to karriere.schueco.com)
├── Press
├── Showrooms
└── GrowthFactory (innovation/startup arm)
```

### 4.2 Nav Structure

| Layer | Contents |
|---|---|
| Utility row (top) | Country/language switcher ("EN \| Germany"), search field ("What are you looking for?"), social icons, login |
| Primary horizontal bar | Company / Sustainability / Careers + audience picker row |
| Audience strip | Investors / Home Owners / Architects / Fabricators / Electrical partners / Operator / Suppliers |
| Section-local nav | Within Architects: Comprehensive Solutions / Products / Digital Solutions / References |

**Mega-menu behaviour:** the Products menu on the Architects section opens a tall mega-panel with the 14 product categories, organized in a 3-column grid with a small thumbnail per category. No deep nesting in the menu — visitors are expected to land on the category page and continue drilling there.

### 4.3 Regional / Language Switching

The switcher shows as `EN | Germany` with a dropdown of:
- Language toggle (EN / DE on the German entry; per-country language options elsewhere)
- Country list with regional URLs (e.g., `/uk` for UK, `/in` for India, `/de-en` for Germany English)

**Observation:** Schüco does not auto-redirect by IP. The visitor chooses, and the choice persists via cookie. This is consistent with the "respectful audience routing" thesis.

**Subdomain split:** the UK Homeowners site lives at `schuecohome.co.uk` (separate domain), not as a path on `schueco.com`. This is a sign that the consumer brand is operationally distinct from the corporate brand — different agency, different CMS, different design freedoms. The UK site is warmer, more lifestyle-oriented, with "Birch Green" product photography and a softer hero. The corporate site remains technical.

### 4.4 Breadcrumbs

Visible on every interior page below the top nav, sitting on `#F2F2F2` band. Format:
```
Home > Architects > Products > Windows
```
Up to 5 levels deep on deep product pages. On mobile, truncates to the last 2 segments with an ellipsis on the leading ones.

**FourlinQ note:** breadcrumbs are non-negotiable for a brand positioning as technical / specification-grade. Their presence is itself a premium signal — they say "this site is large enough to need wayfinding."

### 4.5 Footer

Two stacked rows:

**Row 1 — link columns:**
| Column 1 — Audiences | Column 2 — Company |
|---|---|
| Investors | Company |
| Home Owners | Sustainability |
| Architects | Compliance |
| Fabricators | Careers |
| Electrical partners | Press |
| Operator | Showrooms |
| Suppliers | GrowthFactory |
| | www.schueco.com |

**Row 2 — meta:**
- Social: LinkedIn / Instagram / Pinterest / Facebook / YouTube
- WWF partnership badge (with link)
- Legal: Contact / Imprint / Data protection / GBC / Cookie settings

**Notable absence:** no newsletter signup. Schüco does not collect email at the footer. The company does not run a consumer email funnel. This is one of the loudest premium-by-omission moves on the site.

---

## 5. Content Patterns

### 5.1 Hero Formula

```
[optional eyebrow / context label]
[Headline — 30–40px, declarative, ≤ 12 words, sentence case]
[Sub-copy — 1–3 sentences, ≤ 60 words, frames the *condition* before the *solution*]
[CTA — text link or red button, single, ≤ 4 words]
[Background — architectural still photography OR 75th anniversary badge motif. No video on global English homepage as of May 2026.]
```

Examples observed:

- Global home: *"Future-proof building envelopes for complex challenges."* + paragraph on climate, urbanisation, lifecycle solutions. CTA: "Learn more" on the 75th anniversary card.
- Architects: *"Individual design with maximum planning reliability."*
- Doors: *"Make a statement – for the highest requirements in terms of aesthetics and function."*
- Sliding: *"Pushing boundaries."*
- Investors: *"High-yield façade solutions."*
- Sustainability: *"2023 / 2024 Sustainability Report."* (literally the report title — no marketing headline)
- UK Homeowners: *"For a comfortable, secure, contemporary home."*

**The pattern:** the headline is always a **declarative phrase or noun cluster**, never a question, never a promise, never a verb-led command. Schüco does not write "Transform your home" or "Build with us". It writes the state of the world the brand inhabits.

### 5.2 Section Layouts

The four section templates that recur site-wide:

1. **Eyebrow + Headline + Lede + Grid** — used for product category pages, audience picker, sustainability pillars. The grid below holds 4–14 items.
2. **Image-left, Text-right with CTA** — used for "comprehensive solutions" tiles. Image takes 60% width on desktop. CTA is a small chevron link.
3. **Full-bleed quote / statement card** — used for award announcements, CEO statements. Single column, centered, ~40% viewport height.
4. **Horizontal carousel-of-cards** — used for references, news items, product video tiles. Manual arrow control.

### 5.3 The Architectural-Project Showcase Pattern (the signature move)

The reference card pattern, deployed on the homepage's "Be inspired" carousel and on the references landing:

```
[Project hero photograph — 16:9 architectural, often dawn/dusk light, no people]
[Project name in Bold (e.g., "Battersea Power Station")]
[Location in Regular grey (e.g., "London, UK")]
[Building type tag chip (e.g., "Living" / "Office / Business")]
[2–9 competency tag chips (e.g., "Circularity" / "Refurbishment" / "Carbon Control")]
[Audience-routed CTA strip: "For Investors" / "For Architects" / "For Fabricators"]
```

The **audience-routed CTA strip** on each reference card is unusual and worth flagging. It means a single reference project tells **three different stories** depending on which audience clicks. An architect sees the BIM details and material specs; an investor sees the ESG and lifecycle data; a fabricator sees the system used and the fabrication challenges. **One photograph, three documents.** This is content-design efficiency at corporate scale.

### 5.4 Photography Style

- **Subject:** Modernist architecture-heavy. Battersea Power Station, Port House Antwerp, EUREF-Gasometer Berlin. Recognizable, often award-winning buildings.
- **Light:** Dawn / dusk / blue-hour dominant. Sun rarely overhead. Long shadows.
- **People:** Almost never visible in exterior shots. Interiors occasionally show a single figure for scale, never group lifestyle scenes.
- **Material focus:** Glass reflectivity, aluminium profile detail, concrete, timber. The material *is* the subject.
- **Colour grading:** Slightly desaturated. Sky tends to be a cool grey-blue rather than a vivid blue. The natural-warm tones of timber pop against the cool greys.
- **Format:** 16:9 landscape dominant; 4:5 portrait for some product cards.
- **No stock photography.** Every reference image appears to be a commissioned architectural photograph credited to the building's project. This is itself a premium signal.

**Contrast with consumer-luxury fenestration brands:** Marvin uses warmer interior lifestyle photography with people. Sky-Frame uses cinematic landscape shots emphasizing emptiness and view. Schüco occupies a third position — **architectural credentialing**, where the photograph's job is to prove the project exists and the building is significant.

### 5.5 Copy Voice — "German Precision in English"

Concrete observations on the German-precision-in-English voice:

| Quality | Evidence |
|---|---|
| Declarative, not imperative | "Innovative technologies for sustainable living and working environment." Not "Live sustainably with us." |
| Noun-heavy | "Solutions", "systems", "envelopes", "planning reliability". The verbs are quiet. |
| Compound nouns translated literally | "Building envelopes", "value retention", "planning reliability". The German calque survives. |
| Numbered framing | "6,850 employees", "80 countries", "40,000 fabricators", "€2.05 billion", "207 references". Numbers are everywhere. |
| Sentence case in headlines | Always. Title Case is reserved for product names (AWS 75 PD.SI). |
| No exclamation marks | Observed: zero on every page audited. |
| Em-dash usage | German Gedankenstrich style: " – " with spaces. Used for asides. |
| British vs American spelling | British (organisation, optimise, colour) on the global English site. American on the US site. |
| Hyphenated qualifiers | "Future-proof", "barrier-free", "high-yield", "sound-reducing". Compact qualifier discipline. |
| No marketing superlatives | No "Most beautiful", "World's best", "Award-winning" (awards are stated as facts: "German Sustainability Award 2026" — not "Award-winning sustainability"). |
| Engineering verbs | "Configure", "specify", "validate", "test", "certify". The verbs that *do* appear are engineering verbs. |

**A useful side-by-side:**

| Marketing-loud (avoid) | Schüco-precise (model) |
|---|---|
| "Discover the future of windows" | "Future-proof building envelopes for complex challenges" |
| "Get a free quote today!" | "Arrange an individual consultation" |
| "Award-winning German engineering" | "German Sustainability Award 2026 for Schüco" |
| "Transform your home" | "Windows, doors and sliding doors for your home" |
| "Our customers love us" | "40,000 fabricators in 80 countries" |
| "Sustainable, beautiful, smart" | "Energy-efficient. Secure. Smart. Barrier-free." (4 capability subheads, each defined) |

### 5.6 Microcopy

| Element | Schüco's words |
|---|---|
| Search placeholder | "What are you looking for?" |
| Cookie banner | (Standard EU cookie banner, no marketing copy injected) |
| 404 | (Plain text, no humor, no illustration) — many of my probes returned plain 404s without redirect attempts |
| Login button | "Login" / "Registration" (German calque: "Registration" rather than "Sign up") |
| Newsletter | (none) |
| Form labels | Sentence case, above field, no asterisks-for-required, instead a small "required" hint inline |
| Confirmation toasts | (not observed publicly) |

---

## 6. Sub-Page Audits — Detailed

### 6.1 Homepage (`/de-en`)

**Section sequence (in order):**

1. Hero with 75th-anniversary lockup and "Future-proof building envelopes" headline
2. 75th Anniversary feature module ("18 January 2026")
3. Value Renovation tile — *"To help all those who maintain value to increase value"*
4. Decarbonization tile — *"Minimising CO₂ in the building envelope"* / Schüco Carbon Control
5. Fire Protection tile — *"Meeting fire protection requirements with ease"* / Schüco FireStop, with role-specific Architect/Fabricator links
6. Service tile — *"Ensuring value retention for the long term"* / Schüco Service
7. German Sustainability Award 2026 announcement
8. Audience picker — *"Individual content – select your area"* (7 cards)
9. Products grid — *"Products for all building projects"* (14 categories)
10. References carousel — *"Be inspired"* (9 featured global projects)
11. Footer

**Notable:** the homepage is a stack of **content blocks of equal weight**. No single block dominates. There is no "primary CTA" the way a SaaS or DTC homepage would have one. The visitor is offered ~30 doorways and asked to choose.

**Why this is premium:** the page assumes you have a reason to be here. It does not perform "first impression". A first-time visitor without a known job-to-be-done will bounce — and Schüco is fine with that, because that visitor is not the audience.

### 6.2 Architects (`/de-en/architects`)

Section sequence:

1. Hero — "Individual design with maximum planning reliability"
2. My Workplace teaser (Login / Registration CTAs)
3. Comprehensive Solutions (4-tile grid: Renovation / Carbon Control / Circularity / Fire Protection)
4. Service overview — "Our service for your project's success"
5. Products showcase — "Select products that meet your construction requirements" with featured Schüco Perfect callout, then 12-item product grid
6. Showroom + Contact strip — "Visit a Schüco showroom" + "Contact us"
7. References — "Newly added reference highlights" (4–5 cards)
8. Footer

**Voice shift:** every CTA on this page is a *workflow* verb — Login, Register, Configure, Download, Specify. Versus the homeowner site's *aspirational* verbs (Explore, Be inspired, Find).

### 6.3 Home Owners (global, `/de-en/home-owners`)

Section sequence:

1. Hero — "Windows, doors and sliding doors for your home" / "Homes with a sense of well-being"
2. 6 product typology cards
3. "Are you looking for inspiration?" — references gallery
4. "Which sliding door is right for me?" — interactive selector tool
5. Partner locator — "Find Schüco partners in your area"
6. Explicit firewall: "You cannot buy Schüco products directly from us."
7. Footer

The global Home Owners landing is less developed than the UK consumer spin-off (`schuecohome.co.uk`), which has fuller editorial content, the explicit three-step process, and Birch Green product photography.

### 6.4 UK Homeowners (`schuecohome.co.uk`)

Section sequence:

1. Hero — *"For a comfortable, secure, contemporary home"* / sub: *"Whether embarking on a new build or renovation you want to create a safe home infused with comfort and lasting quality."* / CTA: "Explore our products"
2. Six product category cards (Windows / Bi-Fold Doors / Sliding Doors / Front Doors / Interior Doors / Façades)
3. "Effortless elegance from German engineering" messaging block — durability, energy efficiency, aesthetic appeal, security, sustainability
4. Three-step process (Be inspired / Touch and feel / Finalise your vision)
5. Reference projects carousel
6. Inspiration article carousel (4 cards)
7. Featured project highlights
8. Footer (Products / Features / Inspiration / Why Schüco columns + Milton Keynes & London showroom listing)

**Photography note:** the UK consumer site introduces softer color usage — "Birch Green" product imagery, warmer interior shots, occasional figures present in living spaces. The corporate-site grayscale-restraint is loosened for consumers without breaking brand.

### 6.5 Investors (`/de-en/investors`)

Section sequence:

1. Hero — "High-yield façade solutions"
2. Value Rendering (ESG / Cradle-to-Cradle / OPEX / long-term value)
3. Building Lifecycle Coverage (newbuild / renovation / decarbonisation)
4. Due Diligence Enablers (risk / one-source / automation guides)
5. Three repeated "Arrange an individual consultation" CTAs
6. Photography spread: 9 building usage classes
7. Footer

### 6.6 Sustainability (`/de-en/sustainability`)

Section sequence:

1. CEO statement (Engelhardt)
2. German Sustainability Award 2026 callout
3. CO₂e reduction table (2019 / 2023 / 2024 / 2030 / 2040)
4. Three stat callouts (90% by 2040 / 50% by 2030 / 17% achieved 2024)
5. Five pillars
6. Strategic initiatives (Carbon Control, Value Up, Circular Solutions, SBTi validation)
7. Highlights (PVC from renewable raw materials / Circular window product / Diversity week / Health programs)
8. Sub-navigation to deep report sections
9. Footer

### 6.7 Company (`/de-en/company`)

Section sequence:

1. Heritage narrative — Founded 1951, 75th anniversary 18 January 2026
2. Mission — "Innovative technologies for sustainable living and working environment"
3. Scale numbers — 6,850 employees, 80 countries, 40,000 partners, €2.05 billion turnover
4. "Outstanding buildings are our passion" values statement
5. 7 German showroom locations (Berlin, Bielefeld, Düsseldorf, Frankfurt, Hamburg, Weißenfels, Wertingen)
6. Footer

### 6.8 Products → Windows (`/de-en/architects/products/windows`)

Section sequence:

1. Hero — "Windows allow you to look outside from within a building..." (opening descriptive copy, not a marketing headline)
2. 4 featured product tiles (AWS WoodDesign / FocusIng / Barrier-free / Symbiotic)
3. 4 capability subsections (Energy Efficiency / Sustainability / Security / Accessibility) with cert callouts
4. 6-tile manual video carousel (AWS WoodDesign / SimplySmart OpenSecure / AWS 90 AC.SI / Barrier-free / Panorama Design AWS 75 PD.SI / +1)
5. Planning resources sidebar (Tender Texts / CAD-Files / BIM-Objects / Attachments / Brochures)
6. Footer

### 6.9 Products → Doors

Same structural template as Windows, with subcategory groupings (entrance / sliding / interior) and AD UP / AD UP Design Edition as featured systems. Six case studies cited (Chimney House Sydney, Norra Tornen Stockholm, Jonsvollkvartalet Bergen, Würzburg winery, etc).

### 6.10 Products → Façades

Six subcategories (Standard / Design / All-Glass / Unitised / Add-On / Commercial Project Business). Featured systems: Schüco AOC, FWS 60 CV, AF UDC 80, FWS 35 PD. References: Port House Antwerp, Sandtorkai Hamburg, Telecom IT Belgium, Schüco Corporate Services Bielefeld.

### 6.11 Products → Sliding Systems

Three design types (Panorama / Classic / Folding). Product codes ASE 67 PD, ASE 80.HI, ASS 70 FD. Capability subheads: Design / Flexibility / Comfort / Performance. Tagline: "Pushing boundaries." Photography: Grand Hotel Victoria, Casa Puntara, Villa Tusenfalken.

### 6.12 References (`/de-en/architects/references`)

The flagship discovery surface. **207 indexed projects**, 5 thematic carousels on the landing, ~75 filter dimensions across feature/building-type/product/material/geography. Card metadata: project name, location, building type, applicable feature tags, products used.

### 6.13 Digital Solutions (`/de-en/architects/digital-solutions`)

Lists 6 tools (Docu Center / Internet of Façades / PlanToBuild / Building Physics Solver / Drive Planner / PolyPlan / + PolyPlan for PVC-U). All access via My Workplace login. Quote from Nico Pohrisch, Head of Digital Planning: *"Our portfolio breadth allows the right solution for any challenge - our digital solutions make it easy to get started finding the right solution and collaborating with us"*. Data stored on German servers with SSL + GDPR compliance — the data-sovereignty claim is itself a premium signal.

---

## 7. The "Premium-Without-Marketing-Loud" Codex

A consolidated list of moves Schüco uses to signal premium quietly. Each is **specifically copyable** for FourlinQ, with a note on the adjacent — not identical — move that fits FourlinQ's situation.

| Schüco move | Why it reads premium | FourlinQ adjacent move |
|---|---|---|
| Hero caps at ~40px | Refuses display-hero spectacle. Reads as confidence. | Cap FourlinQ hero at the existing token max (whatever DESIGN_SYSTEM.md specifies). Do not introduce a 64px+ display tier "for impact". |
| Two type weights only | Visual restraint. The brand has nothing to prove. | Pick two weights for FourlinQ and stop. If the current stack uses 3+, audit and consolidate. |
| One typeface | Single voice. | FourlinQ may already use a single sans — verify and keep it. |
| Industrial green, not lifestyle green | Refuses the sage/eco-pastel cliché. | FourlinQ's primary accent should be **specific** and **named** ("FourlinQ Coastline Blue", e.g.) — not "our brand green". A named, defended color is premium. |
| Accent colour rationed | Brand colour appears only in functional roles (logo, badges, CTAs). | Use the FourlinQ accent only on: logo, primary CTA, certification badges. Not in section backgrounds. Not in gradients. |
| "Learn more" as primary CTA | Refuses urgency. | FourlinQ primary CTAs should be informational ("View specifications", "Find a showroom"), not urgent ("Get a quote today"). |
| Explicit audience picker | Respects the visitor as already-qualified. | FourlinQ should declare its audiences (Homeowners / Architects / Developers / Fabricators) up front and route, not personalize behind the scenes. |
| "You cannot buy directly" firewall | Converts friction into a quality signal. | If FourlinQ sells through dealers/distributors in PH, *say so explicitly*. The firewall is the premium move. |
| Numbers as content | Specificity beats adjectives. | Publish: PH projects completed, years in market, dealer count, fabrication capacity. Numbers > "Leading". |
| Third-party validators above marketing claims | Award is a fact, not a brag. | Lead with PCAB, ISO, BIS, any third-party certifications relevant to PH uPVC standards. The validator is the story. |
| No newsletter signup in footer | Refuses the email-list reflex. | FourlinQ should not have a "Subscribe to our newsletter" in the global footer. If newsletter exists, it lives inside the Inspiration / Editorial section, opt-in contextually. |
| Breadcrumb on every interior page | Wayfinding = scale signal. | Implement breadcrumbs on every product / project page. |
| References carousel-of-carousels | Surfaces ~30 projects without overwhelming. | When FourlinQ has 20+ PH project references, stack them by thematic carousels (by region / by building type / by certification). |
| Sustainability page = report, not marketing | The substance is the message. | FourlinQ's sustainability page should be structured as a report (commitments → numbers → validators → product implications). |
| Architectural photography, no people in exteriors | The building is the subject. | Commission PH architectural photography of completed projects. No stock. No staged "happy family" shots in exterior frames. |
| Sentence case, no exclamation marks | Tone discipline. | Audit FourlinQ copy: remove every "!" and convert Title Case headlines to Sentence case. |
| Mega-menu shows the whole catalog at once | Density = competence. | FourlinQ products menu should show all product lines on hover, not nest behind sub-categories. |
| Resource sidebar predictability | The architect can rely on finding CAD/BIM in the same place every time. | Every FourlinQ product page should expose the same resource block: Specifications PDF / CAD file / Brochure / Installation guide / Warranty. |
| Subdomain split for consumer site | Frees the consumer voice without breaking corporate brand | FourlinQ may consider a dedicated `homeowners.fourlinq.com.ph` or similar if the consumer voice ever needs to soften beyond corporate restraint. |

---

## 8. What Schüco Does That FourlinQ Should *Not* Copy

Equally important. These are moves that fit Schüco's scale and audience but would be harmful at FourlinQ's stage:

| Schüco move | Why it does not translate |
|---|---|
| 207 indexed references with 75-dimension faceted search | FourlinQ does not yet have 207 PH references. A 5-filter / 20-project gallery is the right scale. Faking density is anti-premium. |
| Seven distinct audience surfaces (Investors / Fabricators / Operators / Suppliers / Electrical Partners / Architects / Homeowners) | At FourlinQ's stage, three are real: **Homeowners, Architects, Dealers**. Pretending to address Fabricators or Operators when the brand has no offer for them is hollow. |
| Login-gated digital solutions (My Workplace, PolyPlan, Building Physics Solver) | These are 50-person engineering products. FourlinQ should not build login-gated planning portals until the underlying tools exist. |
| 14-card product mega-grid on the homepage | FourlinQ's catalog (per `src/data/fourlinq-data.ts`) is narrower and brochure-verified. Showing 6–8 product lines accurately beats inventing 14 to look big. |
| Sustainability report-grade page with numerical CO₂ targets to 2040 | Without the data infrastructure and validators, this becomes greenwashing. Better to publish a single "Our materials" page with the actual VinylPlus / RAL / DIN certifications FourlinQ already holds (per brochures). |
| Multi-color semantic system (green / red / cyan) | Requires a designer-engineer team to maintain across hundreds of pages. FourlinQ should commit to one semantic accent and ship it consistently. |
| Univers (commercial license) | Schüco has paid Linotype for decades. FourlinQ should use a free, neutral, geometric sans that *behaves* like Univers (Inter, Söhne if budget allows, or Schibsted Grotesk). Do not chase the exact typeface; chase the discipline. |

---

## 9. Positioning Adjacent — How FourlinQ Sits Next to Schüco Without Being Compared on Schüco's Terms

The Philippine market context: FourlinQ is the local uPVC manufacturer most often compared to Schüco. To "position adjacent without copying" means choosing a deliberate axis where FourlinQ is **the better answer** even when measured against Schüco.

Three positioning axes that survive the comparison:

### 9.1 "Climate-Specific, Not Climate-Neutral"

Schüco's product line is engineered for Central European climate envelopes (cold winters, moderate humidity). FourlinQ operates in **tropical maritime climate** (high humidity, salt air, typhoon wind loads, intense UV).

**The positioning sentence:** *"German-engineered fenestration is climate-specific. FourlinQ is engineered specifically for the Philippine climate."*

This is **defensibly true** and **does not denigrate Schüco**. It reframes German engineering as a method, not a destination — and positions FourlinQ as the method applied locally.

### 9.2 "The PH Project Reference Library"

Schüco has 207 global references, ~zero in the Philippines. FourlinQ can build the most credentialed PH reference library in the category. **Local project references beat global ones for local buyers** — the architect specifying for a Cebu condo development needs proof in Cebu, not in Bielefeld.

**The positioning move:** invest disproportionately in the references page. Commission architectural photography of every completed FourlinQ project. Let the project page (location / architect / building type / products used / climate-specific challenges solved) become the brand's deepest content surface.

### 9.3 "Specifiable, Not Just Buyable"

Schüco's premium signal is that you cannot buy it directly — you specify it. FourlinQ can adopt the same posture: position the brand as something an architect *specifies* into a project, not something a homeowner *orders* from a website.

**Operational implication:** the FourlinQ site should have an architect surface that is materially distinct from the homeowner surface — different IA, different vocabulary, different CTAs. The architect surface should expose specifications, CAD/IFC where available, certifications, and the dealer/installer network. The homeowner surface should route to dealers, never to a direct-purchase cart.

---

## 10. Concrete IA & Component Recommendations for FourlinQ (drawn from this audit)

The following are pattern-level recommendations, scoped to be actionable without imitating Schüco:

1. **Audience picker on the homepage.** Three cards: *For Homeowners / For Architects / For Dealers & Fabricators*. Below the hero, above any product grid.
2. **Persistent breadcrumb component** on every page below `/products/` and `/projects/`. Background `var(--surface-soft)`, hairline border below.
3. **Product page template, fixed structure:**
   - Eyebrow (material badge: uPVC / Aluminum / Hybrid)
   - Headline (product name, sentence case)
   - Lede (≤ 40 words, climate-specific framing)
   - Hero photograph (architectural, 16:9)
   - 4 capability sub-sections (Climate Performance / Security / Energy Efficiency / Accessibility — matching Schüco's grammar, named for PH context)
   - Reference projects featuring this product (3–5)
   - Resource block (Specifications PDF / Brochure / Installation Guide / Warranty)
   - Where to buy (dealer locator embed)
4. **Reference (project) page template:**
   - Project name, location, building type, completion year
   - Architect / developer credit
   - Hero photograph
   - Products used (links back to product pages)
   - "Climate challenge solved" callout — the FourlinQ-specific story
   - Photo gallery (5–10 images)
   - Related projects (3 cards)
5. **References landing carousel-of-carousels:** stack by *Region* (NCR / Cebu / Davao / Other), *Building type* (Residential / Mixed-use / Commercial / Hospitality), *Use case* (Typhoon-resilient / Coastal salt-spray / High-rise wind loads).
6. **Sustainability page as report:** stated commitments → measured data (recycled content %, energy used / m² produced) → third-party validators (VinylPlus, RAL, BIS) → product implications.
7. **Dealer locator** as a first-class IA node. Postcode / city / region search. Result cards with showroom photograph, address, phone, hours.
8. **No newsletter signup in footer.** If FourlinQ runs email, it lives inside the Inspiration section, contextually opt-in after reading an article.
9. **Footer columns:** *Products / Projects / For Architects / For Homeowners / About / Locations*. Social + legal in the meta row.
10. **CTA grammar audit.** Remove all imperative-urgent CTAs ("Get yours now", "Limited time"). Replace with informational ("View specifications", "Find a showroom", "Speak with a specifier").

---

## 11. Open Questions & Items to Verify

A few items I could not fully verify in this audit pass — worth following up on in dedicated sessions:

1. **Hero motion on the global English homepage** — observed as static in May 2026; an autoplay video may load conditionally on faster connections. Worth re-testing.
2. **Mega-menu animation curves** — inferred as `ease-out` ~200ms from observation but not confirmed against the stylesheet.
3. **Exact Univers weights deployed** — the stylesheet lists 430 and 630; verify there are no Light or Bold-Condensed cuts loaded in any context.
4. **My Workplace UI** — gated behind architect registration; the public surface only describes it. A deeper audit would require credentialed access.
5. **Loading states across deep filtered reference queries** — observed skeleton on landing; behaviour with combined filters (e.g., "Germany + Refurbishment + Aluminium + Passivhaus") not stressed.
6. **AMP / structured data** — Schüco appears to ship rich JSON-LD for reference projects (BuildingProject schema) but this was not confirmed in this pass.
7. **Component-library inheritance** — repeated patterns (resource sidebar, reference card, audience picker) strongly suggest a unified design-system; the team and tooling behind it (Figma library? Storybook?) is not publicly visible.

---

## 12. References (URLs Cited in this Audit)

- Global English homepage — <https://www.schueco.com/de-en>
- Architects landing — <https://www.schueco.com/de-en/architects>
- Architects → Windows — <https://www.schueco.com/de-en/architects/products/windows>
- Architects → Doors — <https://www.schueco.com/de-en/architects/products/doors>
- Architects → Façades — <https://www.schueco.com/de-en/architects/products/facades>
- Architects → Sliding Systems — <https://www.schueco.com/de-en/architects/products/sliding-systems>
- Architects → Security Systems — <https://www.schueco.com/de-en/architects/products/security-systems>
- Architects → Comprehensive Solutions — <https://www.schueco.com/de-en/architects/comprehensive-solutions>
- Architects → Comprehensive Solutions → Renovation (Value Up) — <https://www.schueco.com/de-en/architects/comprehensive-solutions/renovation>
- Architects → Digital Solutions — <https://www.schueco.com/de-en/architects/digital-solutions>
- Architects → References — <https://www.schueco.com/de-en/architects/references>
- Home Owners (global) — <https://www.schueco.com/de-en/home-owners>
- Home Owners (UK spin-off) — <https://schuecohome.co.uk/>
- Investors — <https://www.schueco.com/de-en/investors>
- Sustainability — <https://www.schueco.com/de-en/sustainability>
- Company — <https://www.schueco.com/de-en/company>

Stylesheet token table source extracted in [`docs/references/design-systems/schueco.md`](references/design-systems/schueco.md) (the source-of-truth file this audit extends).

---

## 13. Closing Note

Schüco's site is not a marketing site. It is the **public face of a specification system**. Every interaction is engineered around a professional-buyer journey, with the consumer surface peeled off as a softer adjacency (UK Homeowners on its own subdomain). The reason it reads premium is not a single design choice — it is the **accumulated discipline** of refusing every consumer-marketing reflex over hundreds of pages and seventy-five years of brand operation.

For FourlinQ, the practical north star is not "build a Schüco clone in Manila." It is: **at every choice point, ask what the Schüco-discipline answer would be, then decide whether FourlinQ's PH context calls for that answer or for a deliberately adjacent one.** This audit aims to make those choice points visible.

— end of audit —
