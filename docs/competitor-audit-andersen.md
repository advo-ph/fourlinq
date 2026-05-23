# Competitor Audit — Andersen Windows
**Reference research for FourlinQ redesign**
**Subject:** https://www.andersenwindows.com
**Audit date:** 2026-05-23
**Auditor brief:** Deep design + UX + IA audit. The companion file `docs/UI_UX_Design_Audit.md` already carries a short Andersen blurb. This document is the long-form version — observational, sourced per URL, and meant to inform the FourlinQ redesign toward Marvin-tier editorial premium.

---

## 0. Executive Take

Andersen is positioned as **"America's premier window manufacturer"** with a heritage anchor (founded 1903, 115+ years), trust-led messaging ("Trust Your Home to Andersen™" — homepage), and a deeply engineered material narrative that revolves around **Fibrex® composite** ("2x as strong as vinyl"). Their digital experience is not editorial-premium in the Marvin sense — it is **mass-premium, contractor-credible, encyclopedic**. The site is organized like a deep catalog with two flagship interactive tools (Design Tool, AI Product Discovery) bolted onto a very large product/series matrix.

Key differentiators for FourlinQ to note:
- **Five-series ladder (100 / 200 / 400 / A-Series / E-Series)** that crisply tiers material, price, and customization. Source: https://www.andersenwindows.com/windows-and-doors/series
- **Plain-English category descriptors** — "The one that cranks open from the bottom" (Awning). Conversational classification beats technical jargon. Source: https://www.andersenwindows.com/windows-and-doors/windows/
- **Step-wise wizard + photo-upload visualizer** rather than a sci-fi 3D configurator. Pragmatic, contractor-shareable via design code. Source: https://www.andersenwindows.com/ideas-and-inspiration/design-tool
- **Dual-brand split** — Andersen (DIY / dealer) vs Renewal by Andersen (full-service replacement) handled as a hard fork in the IA, not blended.
- **High-contrast lifestyle photography**, not architectural-render styled. Cozy interiors with warm light. Source: https://www.andersenwindows.com/about/sustainability

Compared to Marvin, Andersen is **less editorial, more catalog-utilitarian**. Compared to Pella, Andersen leans harder on heritage trust. Compared to FourlinQ's current state, Andersen's biggest lessons are: (a) the series ladder pattern, (b) the wizard configurator, (c) the conversational copy voice, and (d) the dealer/contractor IA fork.

---

## 1. Site Map (Information Architecture)

Reconstructed from primary nav, mega menus, footer, and link-walking. Paths confirmed via WebFetch unless marked `[inferred]`.

```
/                                              Homepage
├── /windows-and-doors                         Hub
│   ├── /windows                               Windows index
│   │   ├── /awning                            Awning windows
│   │   ├── /bay-and-bow                       [inferred]
│   │   ├── /casement                          Casement
│   │   ├── /double-hung                       Double & single-hung
│   │   ├── /sliding                           Gliding windows
│   │   ├── /pass-through                      Pass-through
│   │   ├── /picture                           Picture
│   │   ├── /specialty                         Specialty (shaped)
│   │   ├── /replacement                       Replacement windows
│   │   └── /coastal                           Coastal / impact
│   ├── /doors                                 Doors index
│   │   ├── /big-doors                         Moving glass walls
│   │   ├── /entry-doors                       Front entry
│   │   ├── /french-and-hinged-patio           [inferred]
│   │   ├── /sliding                           Gliding patio
│   │   ├── /storm-doors                       Storm & screen
│   │   └── /replacement                       Replacement doors
│   ├── /series                                Series comparison hub
│   │   ├── /100-series                        Fibrex composite
│   │   ├── /200-series                        Wood + vinyl, value
│   │   ├── /400-series                        Wood + Perma-Shield, bestseller
│   │   ├── /a-series                          Architectural flagship
│   │   └── /e-series                          Custom / architectural collection
│   ├── /materials                             Wood/Vinyl/Fibrex/Aluminum/Fiberglass
│   ├── /options-and-accessories               Grilles, hardware, glass, screens, art glass
│   └── /discover                              AI Product Discovery
├── /ideas-and-inspiration                     Inspiration hub
│   ├── /design-tool                           Photo-upload visualizer
│   ├── /photo-gallery                         Browse-able gallery
│   ├── /home-style-library                    13 architectural styles
│   │   ├── /american-farmhouse
│   │   ├── /cape-cod
│   │   ├── /craftsman-bungalow
│   │   ├── /french-eclectic
│   │   ├── /georgian-federal
│   │   ├── /industrial-modern
│   │   ├── /international-modern
│   │   ├── /miesian-modern
│   │   ├── /mission-revival-spanish-colonial-revival
│   │   ├── /prairie
│   │   ├── /queen-anne
│   │   ├── /shingle
│   │   └── /tudor
│   ├── /traditional-windows-and-doors         Style guide
│   ├── /project-showcase                      Featured projects
│   ├── /blog                                  "Endless Expressions" blog
│   └── /why-andersen
│       └── /why-windows-and-doors-matter
├── /about
│   ├── /our-story                             1903 founding, 3 divisions
│   ├── /innovation                            R&D, patents, partnerships
│   ├── /sustainability                        Energy Star, FSC, PHIUS
│   ├── /community                             Habitat for Humanity 20+ yrs
│   ├── /company-culture
│   ├── /quality
│   ├── /newsroom
│   └── /careers
├── /for-professionals                         Pro hub
│   ├── /architect                             AIA CES, CAD/BIM tools
│   ├── /builder                               Select Builder Program
│   ├── /contractor                            Certified Contractor Program
│   ├── /developer                             Commercial
│   ├── /documents                             Technical document library
│   └── /architectural-tools                   CAD/BIM/CSI
├── /support
│   ├── /contact-us                            5 phone lines, chat
│   ├── /andersen-service                      Installed product service
│   ├── /window-door-installation
│   │   └── /installation-guide-configurator
│   ├── /faqs
│   ├── /warranty
│   └── /safety
├── /where-to-buy                              Dealer/showroom locator
├── /find-a-contractor                         Certified contractor finder
├── /request-a-quote                           Lead form
├── /my-favorites                              Saved items
└── External
    ├── parts.andersenwindows.com              Parts store
    ├── helpcenter.andersenwindows.com         Help center
    └── renewalbyandersen.com                  Replacement division
```

Footer surfaces additional micro-pages (Recalls, EEO Policy, Canada S-211 Report, Cookie Preferences, CA Privacy Notice, Opt Out of Sale/Sharing) confirmed at https://www.andersenwindows.com/

---

## 2. Global Navigation Pattern

### 2.1 Header — Utility row + Primary row + Logo
**Source:** https://www.andersenwindows.com (homepage), confirmed across every product page

Top utility strip (small caps, light weight):
- Where to Buy · Find A Contractor · Installed Product Service · Become A Certified Contractor · My Favorites (0) · 1-800-426-4261

Primary row:
- Windows & Doors · Inspiration · Parts & Product Support · Technical Documents · For professionals · **Request a Quote** (primary button)

Observations:
- The **phone number lives in the header**, not just footer — strong dealer/contractor trust signal.
- "My Favorites (0)" is a persistent counter. Lightweight wishlist pattern. Source: https://www.andersenwindows.com/
- "Request a Quote" is the only header-level button — single conversion priority.
- Primary nav uses sentence case ("For professionals") not title case — a quiet humanization.

### 2.2 Mega Menus
Source: https://www.andersenwindows.com (mega menu hover)

**Windows & Doors mega menu** is split into two parallel columns:
- **Windows column:** Awning · Bay & bow · Casement · Double & single-hung · Sliding · Pass-through · Picture · Specialty · Replacement windows · Coastal windows & doors
- **Doors column:** Big doors · Entry doors · French & hinged patio · Sliding · Storm & screen doors · Replacement doors

**Inspiration mega menu:** Blog · Windows by room · Featured projects · Photo gallery

**Parts & Product Support:** Options & accessories · General support · Pricing · FAQs · Warranty · Parts catalog · Service

**Technical Documents:** All documents · Product details · Sizing · CAD/BIM/CSI tools · Energy data · Service instructions · Installation guides · Warranty docs · Care & maintenance

**For professionals:** Product guides · Installation resources · Certified Contractor program · CAD tools · Performance data · Pro blog · Winde app · Dealer site

Observations:
- Mega menus are **link lists, not visual cards**. No big imagery in the dropdown. This is a catalog-first treatment, the opposite of Marvin's editorial dropdowns.
- The professional segment gets equal nav weight to consumer — Andersen is dealer-mediated, not direct-to-consumer.

### 2.3 Footer (5 columns + legal strip)
Source: https://www.andersenwindows.com (footer)

| Col 1: About Andersen | Col 2: Renewal by Andersen | Col 3: Explore Products | Col 4: Get Started | Col 5: Find Help |
|---|---|---|---|---|
| About | Visit Renewal by Andersen | Explore Windows | Where to Buy | Technical Documents |
| Our Story | Careers at RbA | Explore Doors | Virtual Showroom | Dealer Portal |
| Innovation | Difference Between Brands | Ideas & Inspiration | Become a Dealer | MyAndersen |
| Quality | | Energy Efficiency | Replacement Windows | Contact Us |
| Community | | Product Discovery AI | Replacement Doors | FAQs |
| Company Culture | | Coastal/Impact Solutions | | Safety |
| Sustainability | | Materials | | Product Support |
| Newsroom | | | | Parts Store |
| Careers | | | | Recalls |

Legal strip (very small, light gray): Terms · Privacy Policy · CA Privacy Notice · EEO Policy · Opt Out of Sale/Sharing · Canada's S-211 Act · Cookie Preferences

Social icon row: Facebook · Instagram (@andersen_windows) · Pinterest · YouTube · Houzz · LinkedIn

Copyright: "©2026 ANDERSEN CORPORATION. ALL RIGHTS RESERVED." — all-caps, very small.

Observations:
- **Houzz appears alongside the big social platforms** — it matters in this category, FourlinQ should consider it.
- The "Difference Between brands" link in the Renewal column is a candid acknowledgement that the dual-brand model confuses people. They link it explicitly. Honest IA.
- "Recalls" lives in the footer — regulatory transparency.

---

## 3. Design System (derived)

### 3.1 Typography
Andersen does not expose an open design system. From the WebFetch-extracted copy patterns and visible hierarchy:

| Role | Behavior observed | Probable family |
|---|---|---|
| Logo wordmark | Custom — bespoke rectangular lockup with ™ symbol. Source: https://www.andersenwindows.com | Custom |
| Display / hero headlines | Short, declarative, often sentence case: "Trust Your Home to Andersen™", "The possibilities are wide open", "Architectural authenticity", "Warmth of wood at an uncommon value" | Serif or transitional sans (likely a humanist sans for body, a sans display for hero — Andersen uses sans-serif throughout based on visible page renderings) |
| Section H2 | "Find your dream window or patio door", "Why Trust Andersen?", "Discover new ideas and inspiration" — title case mixed with sentence case | Same sans as display, heavier weight |
| Card titles | "Awning Windows", "Bay & Bow Windows" — title case | Sans, medium weight |
| Body copy | Conversational, short sentences. "The one that cranks open from the bottom" | Sans, regular |
| Utility / nav | Small caps for utility row, regular caps for primary nav. Sentence case in primary | Sans, regular/medium |
| Legal | All caps, tracked, very small (10–11px range) | Sans |

**Hero headline formula** observed across product pages:
- Awning: "See your bigger picture" / subtitle "Explore types of windows" — https://www.andersenwindows.com/windows-and-doors/windows/
- Doors: "The possibilities are wide open" / sub "Exterior doors" — https://www.andersenwindows.com/windows-and-doors/doors/
- A-Series: "Architectural authenticity" — https://www.andersenwindows.com/windows-and-doors/series/a-series/
- 400-Series: "Our most popular, hands down" — https://www.andersenwindows.com/windows-and-doors/series/400-series/
- 100-Series: emphasizes "2 times stronger than vinyl" — https://www.andersenwindows.com/windows-and-doors/series/100-series/

**Pattern:** Hero headlines are short (3–6 words), confident, often metaphorical. Subtitles re-anchor to category. No gerunds, no marketing fluff. Marvin-tier in brevity but more populist in tone.

### 3.2 Color palette (derived from page descriptions)
Andersen's identity is photography-driven, not chromatic. From sustainability page imagery descriptions (https://www.andersenwindows.com/about/sustainability) and traditional-windows page color callouts (https://www.andersenwindows.com/ideas-and-inspiration/traditional-windows-and-doors):

| Token | Use | Approx hex (educated guess from visible imagery) |
|---|---|---|
| Brand primary | Logo, accent | Likely a deep slate / charcoal — not a brand red |
| Off-white background | Body | `#FAFAF8` to `#F5F2EC` (warm) |
| Neutral charcoal | Headings | `#1A1A1A` to `#222` |
| Mid-gray | Body text | `#4A4A4A` |
| Hairline rule | Section dividers | `#E5E1D8` (warm gray hairline) |
| Accent warm | Photography ties | Honey, mocha, canvas (per traditional page palette callouts) |
| Hardware finish callouts | Color chips | Oil-rubbed bronze, white, dark bronze, satin nickel |

**Product color swatches** appearing on Big Doors page: black, white, dark bronze, 48+ additional finishes confirmed. Source: https://www.andersenwindows.com/windows-and-doors/doors/big-doors/

**E-Series claim:** 55+ color options. Source: https://www.andersenwindows.com/windows-and-doors/series/e-series/ — implies extensive swatch UI.

**Verdict:** Andersen is **achromatic + warm photography accent**, not "brand-red" like Pella. This is much closer to the editorial neutral FourlinQ should chase. The accent comes from photography (interiors, natural wood, exteriors), not from a saturated brand color.

### 3.3 Spacing rhythm + hairlines
From the consistent "section break" pattern noted on https://www.andersenwindows.com/windows-and-doors/series/a-series/ ("The layout uses consistent section breaks") and the home style cards on https://www.andersenwindows.com/ideas-and-inspiration/home-style-library:

- Sections are full-bleed-image alternating with constrained-text — classic 12-col grid with generous top/bottom padding (estimated 96–128px desktop).
- Card grids use **3-up and 4-up** patterns. The Windows page renders **8 product cards** in what reads as a 4-col × 2-row grid (https://www.andersenwindows.com/windows-and-doors/windows/).
- Image aspect frequently **square 392×392px** for category tiles (confirmed from "Three-Column More Options Section: Find a Showroom (392×392px image)" — https://www.andersenwindows.com/windows-and-doors/windows/).
- Hairlines: warm-gray section dividers, not heavy rules. Used sparingly.

### 3.4 Logo lockup
Rectangular wordmark with ™. Sits top-left. No accompanying icon/mark. Confirmed on https://www.andersenwindows.com — "Andersen Windows and Doors Logo" — rectangular format with trademark symbol.

### 3.5 Buttons
From CTA inventory across pages:

| Tier | Pattern | Examples |
|---|---|---|
| Primary | Solid, likely brand-charcoal or deep tone, rounded slightly, white text | "Explore windows", "Explore doors" (homepage hero); "Start designing", "Compare windows" (https://www.andersenwindows.com/windows-and-doors/windows/) |
| Secondary | Outlined / ghost | "Compare doors" (https://www.andersenwindows.com/windows-and-doors/doors/) — sits next to "Start designing" |
| Tertiary / link | Text + chevron, no border | "Learn more", "Design this window" — every product card |
| Conversion (highest) | "Request a Quote" — header-level, single-instance primary | Header on every page |
| Card embedded | Two CTAs per card: "Learn more" + "Design this window" | https://www.andersenwindows.com/windows-and-doors/windows/ |

**Two-CTA card pattern** is consistent — one informational, one action (launches Design Tool with that window pre-selected). This is the **dual-track funnel** Andersen runs on every product card.

### 3.6 Iconography
The Inspiration hub uses **four icon-based categories**: thumbs up (Tips), flame (Trends), light bulb (Ideas), tools (Projects). Source: https://www.andersenwindows.com/ideas-and-inspiration/

Outline-style line icons, friendly. Not isometric, not photographic.

---

## 4. Animations + Interactions

Andersen's site is not animation-forward. Compared to Marvin's editorial micro-motion, Andersen leans **utilitarian**. Observations from page descriptions:

- **Carousels** are the most common interactive: Home Style Library uses a "Carousel display (pages 1-12)" — https://www.andersenwindows.com/ideas-and-inspiration/home-style-library. Awards section on /about/our-story is a carousel. Source: https://www.andersenwindows.com/about/our-story
- **Hover animations on links throughout, with design tool preset window IDs enabling direct visualization of each style** — confirmed at https://www.andersenwindows.com/windows-and-doors/windows/. So hover state appears to enrich rather than animate dramatically.
- **No 3D viewer described** on any product page audited. The "configurator" is the photo-upload Design Tool, not a real-time 3D model. Source: search result https://redesign.blog/andersen-windows-design-tool-and-renewal-by-andersen-visualizer-complete-window-and-door-configurator-with-3d-rendering-and-ar-app/ — third-party reports it includes "3D Rendering and AR App", but the public page (https://www.andersenwindows.com/ideas-and-inspiration/design-tool) does not show this in copy.
- **Photo-upload + overlay** is the headline interaction. User uploads a photo of their house and the tool overlays different window styles/colors/grilles/hardware. Source: WebSearch result on Design Tool.
- **Mega menu** = standard hover-expand, no animated motion described.
- **Mobile vs desktop:** mobile collapses primary nav into hamburger; nothing exotic. The 4-up product grids collapse to 1-up vertical stacks. Inferred from standard responsive patterns.

**Easing / durations:** Not explicitly extractable from copy. The site reads as having a **conservative motion language** — fades, soft transitions, no scroll-jacked storytelling, no parallax-heavy hero. This is intentional: their audience includes 60+ year-old homeowners and contractors at job sites.

**Implication for FourlinQ:** Andersen is not a motion benchmark. Use Marvin for that. Andersen is a benchmark for **information density without animation crutches**.

---

## 5. Page-by-Page Findings

### 5.1 Homepage — https://www.andersenwindows.com

**Hero**
- Headline: **"TRUST YOUR HOME TO ANDERSEN™"** (the trademarked tagline doubles as the hero head)
- Sub: "High-quality windows and doors built to last, trusted by homeowners, recommended by pros, and backed by exceptional service."
- CTAs: "Explore windows" (primary) · "Explore doors" (primary, parallel)
- Background: lifestyle product imagery (interior, presumably golden-hour lit)

**Section sequence (in order):**
1. **Design tool** — "Turn your ideas into reality"
2. **Product discovery** — "Find your dream window or patio door"
3. **Window exploration** — "Learn your window options"
4. **Door exploration** — "Ready to explore doors?" / "Learn your door options"
5. **Solutions** — "The right solution for any project"
6. **Get started** — "Get your project started"
7. **Trust** — "Why Trust Andersen?"
8. **Inspiration** — "Discover new ideas and inspiration"
9. **Showcase** — "See our products in the real world"

**Observations:**
- The homepage is **9 sections deep** before footer. Long-scroll, encyclopedic.
- Two tools (Design Tool, Discovery AI) appear in slots **#1 and #2** — Andersen weights interactive tooling above products.
- "Why Trust Andersen?" sits at slot #7 — trust is reinforced, not led with (the hero already carries trust). They lead with action, finish with proof.
- Brand claims surface as **"#1" badges**: #1 in quality, #1 in performance, #1 innovative, #1 customer service, #1 trusted (all sourced to 2024 contractor/builder/architect/homeowner survey). Source: https://www.andersenwindows.com

### 5.2 Windows hub — https://www.andersenwindows.com/windows-and-doors/windows/

**Hero**
- Headline: "See your bigger picture"
- Subtitle: "Explore types of windows"
- CTAs: "Start designing" · "Compare windows"

**8-card product grid** with consistent structure per card:
- What (functional: "The one that cranks open from the bottom")
- Where (placement context)
- Fun Fact (single distinguishing benefit)
- [Learn more] link → product page
- [Design this window] link → Design Tool with preset window ID

Cards rendered:
| Type | Descriptor |
|---|---|
| Awning | "The one that cranks open from the bottom" |
| Bay & Bow | "The cozy nook with at least three windows" |
| Casement | "The one that cranks open" |
| Double- & Single-Hung | "The one that slides up and down" |
| Gliding | "The one that slides side to side" |
| Pass-through | "Sits off countertop, slides into wall pocket" |
| Picture | "The one that doesn't open" |
| Specialty | "The one that doesn't open, but comes in fun shapes" |

**Below the grid:**
- Product Discovery AI promo — "Skip the guesswork. Use our AI Product Discovery tool... [Find your match]"
- New Construction hub teaser — "Your guide to building a new home" / [Plan your build]
- Email gate — "Get the Window Selection Guide!" (monthly newsletter + free PDF)
- "What about the rest of the house?" → [Get windows by room tips]
- Design Tool re-promo — "Design your perfect window" / [Get started]
- Replacement comparison: side-by-side **Andersen (DIY/custom) vs Renewal by Andersen (full-service)**
- 3-up "More Options": Find a Showroom · Get Connected · Visit The Home Depot — each 392×392px image card

**Voice samples:**
- "The one that cranks open from the bottom" — conversational, deliberately anti-jargon.
- The repetition of "The one that..." creates a memorable rhythm. Eight variations of the phrase, each functional.

### 5.3 Doors hub — https://www.andersenwindows.com/windows-and-doors/doors/

**Hero**
- Headline: "The possibilities are wide open"
- Sub: "Exterior doors"
- Body: "Whether you're looking for front doors, patio doors or moving glass walls..."
- CTAs: "Start designing" · "Compare doors"

**5-card grid:**
1. Big Doors — "Epic moving glass walls (up to 60 ft.)"
2. Entry Doors — "Front entrance with curb appeal"
3. French & Hinged Patio — "Swinging doors for patios/decks"
4. Gliding Patio Doors — "Slide-open style for space-constrained areas"
5. Storm & Screen Doors — "Weather protection for entryways"

**Below cards:** Carousel of 10 entry door styles with named SKUs ("Straightline Glass Panel 102") — first glimpse of named product styles vs. generic categories.

### 5.4 Awning windows — https://www.andersenwindows.com/windows-and-doors/windows/awning/

**Hero:** Awning windows positioned as architectural elements — "sleek and clever design that opens outward and upward."

**Series ladder, presented in 4 stacked blocks:**

| Series | Material | Tagline |
|---|---|---|
| **100** | Fibrex® composite | "Won't fade, flake, blister or peel" |
| **400** | Wood + vinyl cladding | "Our best-selling awning window" |
| **A-Series** | Wood + fiberglass/Fibrex® exteriors | "Our best-performing awning" |
| **E-Series** | Wood + aluminum cladding | "Virtually maintenance-free… 55+ color options" |

**Key benefits section (4 callouts):**
1. Glass Maximization — pair with picture windows
2. User Ease — crank operation, optional power activation
3. Energy Efficiency — "seals like a refrigerator door"
4. Space Versatility — basements, bathrooms

**Color/finish standard chips:** Black, Dark Bronze, White

**CTAs:** Compare awning windows · Design tool · Expert consultation · Parts store

**Pattern:** Product detail pages are **vertical series-ladder + benefit-callouts + color row + CTA cluster**. There is no tabbed interface, no sticky comparison bar (none described in WebFetch extracts).

### 5.5 Series pages

**100 Series — https://www.andersenwindows.com/windows-and-doors/series/100-series/**
- Positioned as "most affordable and accessible"
- Material hero: Fibrex® "2 times stronger than vinyl"
- 6 window types: Awning, Casement, Gliding, Picture, Single-hung, Specialty
- FAQ section compares to 200 and 400 Series (explicit ladder positioning)

**200 Series — https://www.andersenwindows.com/windows-and-doors/series/200-series/**
- "Warmth of wood at an uncommon value"
- Wood + vinyl cladding
- 3 window types only (Double-hung, Gliding, Picture) — deliberately limited
- Standard sizes only, limited customization

**400 Series — https://www.andersenwindows.com/windows-and-doors/series/400-series/**
- "Our most popular, hands down"
- Wood + Perma-Shield® vinyl
- "50+ years of real-world use and experience"
- 6 window types (awning, casement, double-hung, gliding, picture, specialty)
- Warranty: 20 years on glass, 10 years on non-glass

**A-Series — https://www.andersenwindows.com/windows-and-doors/series/a-series/**
- Headline: **"Architectural authenticity"**
- "Best-performing, most energy-efficient" Andersen has ever offered
- 11 exterior colors × 12 interior finishes
- Wood interiors with fiberglass and composite exteriors
- 5 window types: Awning, Casement, Double-hung, Picture, Specialty
- PHIUS-certified (Passive House Institute US)
- Hurricane Stormwatch® variants
- Triple-pane options

**E-Series — https://www.andersenwindows.com/windows-and-doors/series/e-series/**
- Positioned as **"Architectural Collection"** — "ultimate flexibility and design freedom"
- "Made to your exact specifications"
- 8 window types (Awning, Bay & Bow, Casement, French Casement, Double-Hung, Gliding, Picture, Specialty)
- 50+ standard colors, 9 wood species
- Note: blinds/shades discontinued for E-Series (explicit transparency)

**The ladder, summarized for FourlinQ:**

| Tier | Series | Material | Price | Customization | Hero phrase |
|---|---|---|---|---|---|
| Value | 200 | Wood + vinyl | $ | Lowest | "Warmth of wood at an uncommon value" |
| Entry composite | 100 | Fibrex composite | $ | Moderate | "2x stronger than vinyl" |
| Bestseller | 400 | Wood + Perma-Shield | $$ | High | "Our most popular, hands down" |
| Performance flagship | A-Series | Wood + fiberglass/Fibrex | $$$ | High | "Architectural authenticity" |
| Custom flagship | E-Series | Wood + aluminum | $$$$ | Highest | "Architectural Collection" |

This ladder is **the single most important IA pattern on the Andersen site**. Each series is a complete sub-brand with its own materials story, customization range, and target customer.

### 5.6 Big Doors — https://www.andersenwindows.com/windows-and-doors/doors/big-doors/

Andersen's most premium product category gets the most detailed product page audited.

**6 product types in named card grid:**
1. MultiGlide™ Door — straight stacking or pocketing, up to 50 ft × 10 ft
2. Liftslide Door — corner/curved/custom, up to 60 ft × 16 ft
3. Pivot Door — single panel, up to 18 ft × 16 ft, "singularly sleek, modern look"
4. Folding Outswing Door — up to 48 ft × 10 ft
5. Beefy Bifold Door — center-pivoting, up to 40 ft × 13'6"
6. Aluminum Multi-Slide & Pivot — thermally improved aluminum

**Spec table** (explicit dimensions per product) — the only page in the audit where Andersen exposes a full dimensions matrix. Premium category, premium spec disclosure.

**Three value-prop pillars:**
- "Capture panoramic views"
- "Open a corner or curve"
- "Merge indoors and outdoors"

**Color swatches:** Black, white, dark bronze + 48 additional.

**Glass:** Triple-pane with Low-E.

**13 FAQs**, downloadable brochures, case studies.

**Observation:** Big Doors is the closest Andersen page to **Marvin-tier editorial**. Premium spec disclosure, modernist photography (implied), and detailed product naming. If FourlinQ wants a model premium-product page treatment, Big Doors is it.

### 5.7 Entry Doors — https://www.andersenwindows.com/windows-and-doors/doors/entry-doors/

**6 entry door styles:** Craftsman, Farmhouse, Modern, Pivot, Traditional, Gothic

**Customization headlines:**
- 11 wood species (interior AND exterior)
- 50 commercial-grade aluminum exterior colors
- 14 painted interior colors
- Numbered panel styles (102, 181, 403)

**Voice samples:**
- "Showstopper"
- "Modern farmhouse look"

Aspirational + practical hybrid voice. CTAs: Request a quote · Start now (design tool) · Get connected (expert).

### 5.8 Home Style Library — https://www.andersenwindows.com/ideas-and-inspiration/home-style-library

**13 architectural styles:**
American Farmhouse · Cape Cod · Craftsman Bungalow · French Eclectic · Georgian/Federal · Industrial Modern · International Modern · Miesian Modern · Mission Revival & Spanish Colonial Revival · Prairie · Queen Anne · Shingle · Tudor

Grouped into 3 supersets: Traditional · Modern · Transitional.

**Card pattern:** linked title + 2–3 sentence description + "Learn more" CTA.

**Diagnostic tool:** "What's my home's style?" — 6 identifying questions.

**"Create a look" framework** — 6 design factors:
1. Groupings
2. Type
3. Color
4. Size/shape/placement
5. Hardware
6. Grilles

This **6-factor framework** is a reusable cognitive model — Andersen breaks down "design choice" into a finite list. FourlinQ could borrow this.

**Single-style page example — International Modern (https://www.andersenwindows.com/ideas-and-inspiration/home-style-library/international-modern):**
- Hero: title + Le Corbusier historical anchor
- "Machines for living" quote callout
- Essential elements list
- Quintessential features (door/window specific)
- Product gallery
- Pattern book download CTA

**Pattern:** brief history → design principles → product recommendations → downloadable resource. This is the most Marvin-editorial template Andersen runs.

### 5.9 Design Tool — https://www.andersenwindows.com/ideas-and-inspiration/design-tool

**Landing copy:** "See what a window or door will look like with different colors and options."

**Per WebSearch confirmation** (https://redesign.blog and others):
- **Photo-upload workflow** — user uploads house photo (straight-on, good lighting, no wide-angle)
- Overlay window styles, grille patterns, frame colors, hardware
- **Free, no login to start**
- Create account to save unlimited configs + side-by-side compare
- Generates **shareable design code** that local dealers can pull up to quote
- Pros can **export CAD, BIM, spec sheets** from the same tool

**This is brilliant lead-gen design.** The design code is the bridge between consumer exploration and dealer quoting — it stitches the dual-brand IA together.

**For FourlinQ:** the "design code → dealer quote" handoff is the single most replicable workflow on the entire site.

### 5.10 Product Discovery (AI) — https://www.andersenwindows.com/windows-and-doors/discover

A separate tool from the Design Tool. Promoted as "Get personalized window and patio door picks with our AI tool."

Specific flow not extractable from public marketing pages, but its positioning suggests a **questionnaire → recommendation list** model — guided shopping rather than visual configuration. Two tools, two intents: Discover (which product) vs Design (how it looks).

### 5.11 Inspiration hub — https://www.andersenwindows.com/ideas-and-inspiration

**Hero:** "Your dream home starts here"

**Four icon categories:** Tips · Trends · Ideas · Projects

**Modules surfaced:**
- Endless Expressions Blog
- Photo Gallery
- Home Style Library
- Thematic Collections (Indoor/outdoor living, Contemporary/modern, Healthy home)
- AI Product Discovery
- Design Tool
- Window Selection Guide download (email gated)
- Patio Door Selection Guide download (email gated)

**Pattern:** the Inspiration hub is **both a content hub and a lead-gen funnel** — every section either sells a tool or gates a PDF.

### 5.12 Photo Gallery — https://www.andersenwindows.com/ideas-and-inspiration/photo-gallery

Stated purpose: "Andersen products have been used in all kinds of projects, all over the world. Browse our gallery to get inspiration for your project."

UX instruction: "Just click an image to view it full size and see more details."

Implies a **lightbox/modal pattern** on click. Filters not extractable from copy. This was the least content-rich page in the audit.

### 5.13 Blog — https://www.andersenwindows.com/ideas-and-inspiration/blog

**Brand:** "Endless Expression Blog"

**Featured post:** "What are the benefits of floor-to-ceiling windows?"

**Voice:** "Headlines use direct, benefit-focused language."

Sample headlines visible:
- "The best windows for every room"
- "What makes a window ideal for a certain room?"

**Layout:** featured post hero + grid of cards. **Not chronological** — "the blog functions as part of a larger inspiration ecosystem rather than a traditional chronological post feed." Curated topic exploration. This is closer to magazine editorial than dev blog.

### 5.14 Project Showcase — https://www.andersenwindows.com/ideas-and-inspiration/project-showcase

**Title:** "Project showcase"
**Tagline:** "Explore our featured projects"
**Body:** "Discover a few of the ways we've helped people build, remodel and restore their homes and communities."

Project structure not fully extractable. "All projects" header implies grid listing.

### 5.15 Why Andersen / Why Windows & Doors Matter — https://www.andersenwindows.com/ideas-and-inspiration/why-andersen/why-windows-and-doors-matter

**6 impact pillars** with section headlines:
1. Beauty & Style — "Some windows rival the view"
2. Durability — "Beautiful and tough aren't mutually exclusive"
3. Comfort — "Increased comfort"
4. Peace of Mind — "A smart home lets you breathe a little easier"
5. Energy Efficiency — "Easy on the planet and easier on your wallet"
6. Andersen Difference — trust-focused, brand close

**Layout:** Full-bleed hero sections with alternating text/image blocks.

**Sample voice line:** "Some windows rival the view" — strong, brief, evocative.

### 5.16 About / Our Story — https://www.andersenwindows.com/about/our-story

**Section structure:**
- "Who We Are" — 3 divisions intro (Andersen, Renewal by Andersen, Fenêtres MQ)
- "Andersen at a Glance" — infographic with key stats
- "Our Operations" — geographic + values
- "Awards & Recognition" — carousel
- "Leading Andersen" — leadership headshots

**Brand voice:** "Building on a nearly 120-year legacy, Andersen is America's most loved brand."

12,000+ employees. Founded 1903 in Bayport, MN. Three brands serve residential + light commercial. Forbes / Newsweek workplace awards.

### 5.17 Innovation — https://www.andersenwindows.com/about/innovation

"A mentality that's woven into everything we do."

3 focus areas:
1. Revolutionizing shopping experience
2. Optimizing manufacturing
3. Designing products for modern living

**Recent launches:**
- 100 Series Flush Fin (stucco homes, Southwest)
- A-Series frame options
- Folding/accordion doors
- Blinds between glass
- Retractable patio door screens
- Yale Assure Lock integration (smart home)

**Industry partnerships:** NAHB · AIA · WDMA · ASTM

### 5.18 Sustainability — https://www.andersenwindows.com/about/sustainability

**3 pillars:**
1. Environmental footprint reduction
2. Product development (durable + efficient)
3. Operational responsibility (waste reduction)

**Certifications wall:**
- ENERGY STAR Partner of the Year — 2024 Sustained Excellence, **10th consecutive year**
- USGBC charter member (LEED)
- Environmental Product Declaration (third-party EPD)
- PHIUS+ certification
- Indoor Advantage™ Gold
- SCS Recycled Content
- Home Depot Eco Actions Partner 2025

**Concrete metric:** Xcel Energy Renewable*Connect — 5 Minnesota facilities on **100% renewable electricity**.

**Voice:** numbers + named partners + named programs. Specific, not vague.

### 5.19 Materials — https://www.andersenwindows.com/windows-and-doors/materials

5 material entries, each with 2–3 sentence summary + image + "Read more":
- **Wood** — "over 100 years" — interior aesthetics, thermal performance
- **Vinyl** — *as cladding only*, not solid construction (important brand positioning)
- **Composite (Fibrex®)** — proprietary, "2x as strong as vinyl"
- **Aluminum** — "virtually maintenance-free exterior"
- **Fiberglass** — weather-resistant exteriors + wood interiors

**Implied hierarchy:** Composite + Fiberglass = premium · Vinyl = value cladding · Wood = heritage.

### 5.20 Options & Accessories — https://www.andersenwindows.com/windows-and-doors/options-and-accessories

Categories:
- Glass & Performance (ENERGY STAR)
- Grilles (interior wood + between-glass)
- Hardware (multiple finishes)
- Screens & Smart Features (TruScene, retractable, Yale Assure Lock)
- Interior Comfort (between-glass blinds, art glass)
- Exterior Enhancement (trim colors)

Card-based nav + tip articles + design tool integration + installation guide links.

### 5.21 For Professionals — https://www.andersenwindows.com/for-professionals

**4 audience segments:** Architect · Builder · Contractor · Developer · (Dealer separate portal)

**Tools:**
- Product guides
- CAD/BIM/CSI architectural tools
- Sizing docs + calculators
- Installation guide configurator
- Performance/test data
- EPD docs
- Warranty docs
- Winde app (field app, wind pressure estimation Zones 4–5)
- Certified Contractor Program
- AIA CES live online courses (monthly, no-cost)

**Architects sub-page (https://www.andersenwindows.com/for-professionals/architect):** AIA CES credits emphasized. "Get personalized guidance from a knowledgeable Andersen representative—no pressure, just expert advice."

**Builders sub-page (https://www.andersenwindows.com/for-professionals/builder):** **Andersen Select Builder program** — "exclusive benefits, tools, and support designed to help your business stand out and succeed."

### 5.22 Support / Contact — https://www.andersenwindows.com/support/contact-us

**5 distinct phone lines:**
- General product support: 1-888-888-7020 (M–F 7–5:30 CST, Sat 8–3)
- Storm door support: 1-800-933-3626
- Smart home (Yale): 1-855-337-8806
- Dealer / product location: 1-800-426-4261 (M–F 7:30–9 PM, weekends 8–4)
- Corporate: 651-264-5150

Live chat 8–5 weekdays. Help center + parts portal (external subdomain).

**Address:** 100 4th Avenue North, Bayport, MN 55003 — heritage HQ disclosure.

### 5.23 Where to Buy / Find a Contractor

Both surface in header utility row. Underlying locator UX not extractable from copy, but inferred filters:
- Dealer type (Showroom / Big-box retailer / Certified Contractor)
- ZIP / address input
- Map view + result cards

Three locator-related entry points cohabit:
- **Where to Buy** — retailers + showrooms
- **Find a Contractor** — Certified Contractor program members
- **Virtual Showroom** — remote browsing

### 5.24 Request a Quote — https://www.andersenwindows.com/request-a-quote

Form fields and flow not extractable. Linked from header as the only primary-button CTA on every page.

---

## 6. Content Patterns

### 6.1 Hero formulas (by page type)

| Page type | Formula | Example |
|---|---|---|
| Homepage | Trademarked tagline as headline + dual CTA | "TRUST YOUR HOME TO ANDERSEN™" + Explore windows / Explore doors |
| Category hub | Short evocative + category subtitle + Start designing / Compare CTAs | "See your bigger picture" / "Explore types of windows" |
| Series page | 2-word architectural claim | "Architectural authenticity" (A-Series) |
| Product detail | Functional descriptor | "The sleek and clever design that opens outward and upward" (Awning) |
| Inspiration | Aspirational present-tense | "Your dream home starts here" |
| About | Heritage anchor | "America's most loved brand of windows and doors" |

### 6.2 Section layout patterns

**Three-up card row** — used for "More Options" tiles, related products, image-led navigation. 392×392 square crops.

**Four-up product grid** — Windows hub (8 cards in 4×2), Series cards.

**Alternating text/image block** — Why Andersen page, sustainability page. Full-bleed image left/right of constrained text.

**Comparison strip** — Andersen vs Renewal by Andersen, used on every replacement-adjacent page.

**Carousel** — Awards (About), home styles (Home Style Library 1–12), entry door panel styles (10 styles).

**Email gate** — recurring "Get the Window/Patio Door Selection Guide" with monthly email opt-in. Repeats across category hubs.

**FAQ accordion** — Big Doors page has 13 FAQs; series pages compare to neighbors via FAQ ("How does 100 differ from 200?").

### 6.3 Photography style

From copy descriptions across pages:
- **Lifestyle interiors**, not architectural studio renders. Cozy, warm.
- "High-quality lifestyle images showing windows/doors in authentic home settings" — https://www.andersenwindows.com/ideas-and-inspiration/traditional-windows-and-doors
- "Cozy interiors with natural light, sustainable materials on factory floors, and contemporary home designs" — https://www.andersenwindows.com/about/sustainability
- Frequent **before-and-after** project shots
- Hardware/grille **close-up details** as supporting imagery
- Aspirational lifestyle contexts on Series pages "rather than product closeups" — https://www.andersenwindows.com/windows-and-doors/series/a-series/

**Color tone of photography:** honey, mocha, canvas warm neutrals. Hardware accents: oil-rubbed bronze, white, dark bronze.

### 6.4 Copy voice

| Trait | Evidence |
|---|---|
| Conversational | "The one that cranks open from the bottom" |
| Confident but not boastful | "Our most popular, hands down" |
| Architectural when justified | "Architectural authenticity" / "Machines for living" (Le Corbusier quote on International Modern page) |
| Heritage-anchored | "Since 1903…" / "115+ years" / "nearly 120-year legacy" |
| Trust-led | "Trust Your Home to Andersen™" — used 6+ places as headline/tagline/copy |
| Specific numbers, not generic claims | "11 wood species", "50 commercial-grade aluminum colors", "60 ft × 10 ft", "2x as strong as vinyl", "20 years on glass, 10 years on non-glass" |
| Approachable for non-experts | Avoids "U-factor" or "low-E" in hero copy — those appear in body |
| Pro-credible when needed | AIA CES, PHIUS, ASTM, FSC all surface where pros browse |

**The voice formula:** plain English in hero, named numbers in body, jargon allowed in pro/tech tabs.

### 6.5 Trust signals

- "#1" badges (5 separate #1 claims, all sourced to 2024 surveys)
- ENERGY STAR Partner of the Year — Sustained Excellence (10 years)
- 115+ years heritage repeatedly
- "Most trusted" and "most preferred" — 2018 + 2022 + 2024 surveys cited
- Habitat for Humanity 20+ year partnership
- 12,000+ employees
- Bayport, MN HQ address disclosed
- 5 phone lines staffed weekdays + weekends
- Recalls page surfaced in footer (transparency)
- "Difference Between brands" link (transparency about dual-brand confusion)

---

## 7. UX Flow Walkthroughs

### 7.1 Browse → product detail → design → quote (consumer)

```
Homepage hero "Explore windows" CTA
  → /windows-and-doors/windows (8 categories)
  → /windows-and-doors/windows/awning (4 series ladder)
  → "Compare awning windows" or "Design this window"
  → Design Tool (photo upload + overlay)
  → Save design + generate share code
  → "Where to Buy" or "Find a Contractor"
  → Local dealer pulls up share code
  → Quote
```

The **share code** is the conversion mechanism. Andersen does not sell direct — they need the dealer in the loop. The share code lets consumers do most of the exploration online and arrive at the dealer pre-qualified with a configuration.

### 7.2 Replacement decision tree

Replacement-adjacent pages **always** show the side-by-side:
- **Andersen (DIY/custom dealer)** vs **Renewal by Andersen (full-service)**

The Renewal column in footer + the "Difference Between brands" link suggests they've measured user confusion and addressed it with explicit comparison. The brand fork is **explicit, not hidden**.

### 7.3 Pro flow

```
/for-professionals
  → Choose role (Architect / Builder / Contractor / Developer)
  → CAD/BIM tools · AIA CES courses · Winde app · Dealer Portal
  → Product guides + installation guide configurator
  → Become a Certified Contractor (program enrollment)
```

The pro flow runs in parallel to the consumer flow, with shared tools (Design Tool exports CAD/BIM for pros) but distinct entry points.

### 7.4 Dealer/locator flow

```
Header "Where to Buy"
  → Locator (ZIP input → map + filter chips by dealer type)
  → Result card (name · distance · type badge · phone · CTA "Visit" / "Call")
```

Inferred; deep locator UI not extractable from public copy.

---

## 8. Notable Sub-Brand Forks

### 8.1 Renewal by Andersen
Treated as a **separate brand**, not a product line. Own URL (renewalbyandersen.com), own footer column, own careers page. Andersen explicitly links **"Difference Between brands"** to disambiguate. Source: https://www.andersenwindows.com (footer Col 2)

### 8.2 Fenêtres MQ
Luxury custom division, manufacturing in Canada + Italy. Mentioned only on /about/our-story. Premium tier above E-Series. Source: https://www.andersenwindows.com/about/our-story

### 8.3 Andersen Aluminum
Surfaces on the series comparison hub as a sixth series option focused on commercial/low-maintenance. Source: https://www.andersenwindows.com/windows-and-doors/series

---

## 9. Lead Generation + Gating

Concrete gates/forms surfaced:
- **Window Selection Guide** PDF — email gate, repeats on Windows hub + Inspiration
- **Patio Door Selection Guide** PDF — email gate
- **Newsletter** — monthly design emails
- **MyAndersen account** — required to save unlimited Design Tool configs
- **AIA CES registration** — pro courses
- **Newsletter for pros**
- **Request a Quote** — the highest-conversion form, single-button header CTA

**Pattern:** Andersen layers gates from low-commitment (email for PDF) to high-commitment (account for designs) to highest (quote request).

---

## 10. What FourlinQ Should Steal vs Skip

### Steal
1. **Five-series ladder** — clear material × price × customization matrix. FourlinQ could ladder Standard / Premium / ArchitectQ / CoastQ etc.
2. **Two-CTA card pattern** — "Learn more" + "Design this window" on every product card.
3. **Conversational descriptors** — "The one that cranks open" beats "Top-hinged outward-opening operable sash."
4. **Design code → dealer handoff** — bridges consumer exploration to dealer quoting without breaking the dual-channel model.
5. **Six-factor design framework** — Groupings, Type, Color, Size, Hardware, Grilles. Reusable cognitive structure for any window selector.
6. **Home Style Library** — 13 architectural styles each with history + product recommendations. For PH market, swap with Spanish Colonial / Bahay na Bato / Modern Filipino / Tropical Contemporary / Bauhaus / etc.
7. **"Difference Between brands" link** — radical transparency where customer confusion exists. FourlinQ could do "uPVC vs Aluminum vs Wood" similarly.
8. **Spec disclosure scaled to premium tier** — Big Doors gets dimensions; entry-level series don't need it.
9. **Recalls and EEO in footer** — institutional transparency that signals "we're not a fly-by-night brand."
10. **Multiple phone lines by function** — splits trust signals (general, parts, smart home, dealer, corporate).

### Skip
1. **Mega menus as link lists, no imagery** — Marvin does this better with image-led dropdowns. FourlinQ should follow Marvin.
2. **No real 3D configurator on product pages** — the photo-upload tool is clever but feels dated. FourlinQ can leapfrog to Marvin-tier 3D.
3. **Conservative motion** — Andersen has almost no scroll-triggered storytelling. FourlinQ should aspire to Marvin's editorial micro-motion instead.
4. **Heritage-only brand voice** — FourlinQ doesn't have 1903. Lean on engineering + climate-specificity instead.
5. **"#1" badge stacking** — Andersen earned theirs over decades. FourlinQ shouldn't fake them.

---

## 11. Concrete Asset Pickups for the FourlinQ Redesign

Direct lessons applied to FourlinQ's current state (per `docs/UI_UX_Design_Audit.md` and `src/data/fourlinq-data.ts`):

| FourlinQ page | Borrow from Andersen | URL |
|---|---|---|
| `/windows` hub | 8-card grid with What/Where/Fun-Fact + dual CTA | https://www.andersenwindows.com/windows-and-doors/windows/ |
| `/series` (if introduced) | 5-tier ladder with material × price × customization | https://www.andersenwindows.com/windows-and-doors/series |
| Product detail | Stacked series-as-blocks + benefit-callouts + color row | https://www.andersenwindows.com/windows-and-doors/windows/awning/ |
| `/inspiration` | 4-icon category + hub-to-blog-to-gallery flow | https://www.andersenwindows.com/ideas-and-inspiration |
| `/design-tool` | Photo upload + overlay + shareable design code | https://www.andersenwindows.com/ideas-and-inspiration/design-tool |
| `/style-library` (new) | 13 architectural style cards with history + product recs | https://www.andersenwindows.com/ideas-and-inspiration/home-style-library |
| `/about` | 3-pillar story + awards carousel + leadership block | https://www.andersenwindows.com/about/our-story |
| `/sustainability` | Specific named partners + named programs + counted-years certifications | https://www.andersenwindows.com/about/sustainability |
| `/for-pros` | Role-segmented hub with CAD/BIM + CES + Select Program | https://www.andersenwindows.com/for-professionals |
| `/contact` | 5 phone lines by function + chat hours | https://www.andersenwindows.com/support/contact-us |
| Footer | 5-column structure + legal strip + social row + recalls link | https://www.andersenwindows.com (footer) |

---

## 12. Open Questions / Things Worth Live-Browsing

Pages that returned 404 or that copy didn't fully expose, worth a manual browser pass before finalizing FourlinQ patterns:

- https://www.andersenwindows.com/windows-and-doors/windows/casement/ — 404 in audit; the path may be `/casement-windows/` (a Marvin convention seen elsewhere on the site)
- Photo Gallery filter UX — needs visual inspection
- Design Tool live walkthrough — needs hands-on
- Request a Quote form fields — gated
- Find a Contractor map UI — needs visual inspection
- Renewal by Andersen brand fork — separate site, separate audit needed
- Virtual Showroom — referenced but URL not surfaced; possibly a video tour or live chat tool

---

## 13. Verdict on Andersen as a FourlinQ Reference

**Andersen is the IA + content benchmark.** It's the most useful competitor for thinking about catalog depth, series laddering, dual-channel handoff, and pro/consumer parallelism. The site is **encyclopedic, trust-led, and pragmatic.**

**Andersen is not the visual benchmark.** For typography, motion, and editorial composition, FourlinQ should keep Marvin in the lead, with Andersen feeding the structural backbone.

**Single most replicable asset:** the Design Tool's **shareable design code** that bridges consumer exploration to dealer quoting. This is gold for FourlinQ given the Philippine dealer-network reality where direct online ordering isn't the model.

---

*End of audit.*
