# Competitor Audit — REHAU

A design + UX + IA audit of REHAU's global digital presence, with a focus on the Windows division. Reference research for FourlinQ — Philippine uPVC manufacturer that uses REHAU profiles. The way REHAU markets the uPVC material to the world is the upstream "ground truth" for how the material is positioned globally, and FourlinQ inherits a slice of that authority.

**Audit window:** May 2026
**Primary URLs walked:**
- https://www.rehau.com/group-en (global hub)
- https://www.rehau.com/group-en/windows (Window Solutions Subgroup)
- https://www.rehau.com/us-en/windows (US regional)
- https://window.rehau.com/uk-en (UK Window Solutions site)
- https://brand.rehau.com/en-en (public brand portal — the single most useful primary source)

**Access note.** REHAU's customer-facing domains (www.rehau.com, window.rehau.com) sit behind Akamai bot protection and refuse direct HTML fetches (HTTP 403 on every tested user-agent). All direct-page observations in this document are reconstructed from (a) REHAU's own public Brand Portal at brand.rehau.com, which exposes the canonical design system intent, and (b) cached search snippets of the live pages. Where a claim is sourced from a search snippet rather than a first-party brand-portal page, I mark it `[search-snippet]`. Brand-portal claims are direct quotes from the official guideline and are marked `[brand portal]`.

This is unusually useful for an audit: the Brand Portal tells us what REHAU is *trying* to express on every page (ratios, tokens, components, modules), and the search snippets tell us what they actually shipped. The two layers reinforce each other.

---

## Table of contents

1. The big read — REHAU as a brand and as an interface
2. Information architecture & sitemap
3. Design system — colors, type, grid, spacing
4. Brand assets — logo, SmartTag, signets, icons, illustration
5. Photography system
6. Component library (buttons, links, tags, tables, accordions, breadcrumbs, sliders, slideshows, flyouts)
7. Module library (hero, teasers, tiles, navigation, footer, forms, search, service areas, lists, tab nav)
8. Windows division — page-by-page walk
9. Audience segmentation pattern (B2B / B2C / B2B2C)
10. Sustainability storytelling — EcoPuls and the circular-economy framework
11. Technical material-science visual language (cross-sections, exploded views, energy diagrams)
12. Regional & language behavior
13. Copy voice and tone
14. Animation and interaction inventory
15. Mobile vs desktop differences
16. What FourlinQ should steal, adapt, and avoid

---

## 1. The big read — REHAU as a brand and as an interface

REHAU's positioning is captured in one bilingual couplet that is *everywhere* in the system:

> **"Engineering progress · Enhancing lives"**
> [brand portal — homepage, footer, brand-story, ad system]

This is the lock-up. It is structured as two verbs (engineering / enhancing) bound by a centered middle-dot separator. Internally REHAU treats them as two halves of a single brand promise: one half is competence (engineering), the other half is benefit (lives). Every brand artifact REHAU produces — corporate, automotive, interior, windows — is required to carry this couplet, which is why it shows up on architect specifier guides and homeowner brochures alike.

The brand is built as a **family of Subgroups** ([search-snippet] rehau.com/group-en — "a unique and diverse family of six Subgroups"): Building Solutions, Industrial Solutions, Interior Solutions, Meraxis, RAUMEDIC, Window Solutions, plus the New Ventures and Global Business Services service units. The Group navigates as one identity but each Subgroup gets its own product-detail depth. Windows lives inside the Window Solutions Subgroup.

The character of the digital presence:

- **Technical authority first, lifestyle second.** Photography is allowed to be lifestyle, but it must be earned by a product story. The brand explicitly forbids "Exchangeable and stereotypical images" and "Images that do not show the product benefits" [brand portal — photography].
- **Restraint as a discipline.** The 80/10/10 color ratio (see §3) is enforced as a hard rule, not a guideline. Black-and-white owns 80% of any page; Active Red and Smart Green together never exceed 20%. This is unusual on the spec-loud web, and it is the single defining visual property of REHAU pages.
- **Engineering progress is literal.** Cross-sections, exploded isometrics, and energy diagrams aren't decorative — they're the brand's primary persuasion mechanic. Line is "our fundamental design element" [brand portal — illustration].
- **B2B/B2B2C/B2C three-way fluency.** REHAU sells profiles to fabricators (B2B), supports specifications by architects (B2B influencer), and seduces homeowners (B2C). The site routes each persona into its own funnel without ever pretending it isn't doing so.

---

## 2. Information architecture & sitemap

### 2.1 Top-level (rehau.com/group-en)

The global hub is a portal, not a homepage in the classical sense — it is the entry to the Group's Subgroups and corporate narrative.

Reconstructed top-level IA:

```
rehau.com/group-en (Group)
├── About Us
│   ├── New structure in force (Subgroups explainer)
│   ├── 75 years (anniversary)
│   └── Locations / Careers / Press / Newsroom
├── The REHAU Way
│   ├── Vision / Purpose / Competences / Values
│   ├── Sustainability  ← key
│   └── Innovations
├── Subgroups (Industries family)
│   ├── Window Solutions  ← /windows
│   ├── Building Solutions
│   ├── Interior Solutions
│   ├── Industrial Solutions
│   └── Meraxis / RAUMEDIC
├── News & Stories (e.g. World of Windows, SKYFORCE, ARTEVO launch)
├── Service (downloads, contact)
└── Region/language switcher
```

[search-snippet] confirms Subgroup list: "REHAU Building Solutions, REHAU Industrial Solutions, REHAU Interior Solutions, the Meraxis Group, RAUMEDIC, REHAU Window Solutions, and the two service units REHAU New Ventures and REHAU Global Business Services."

### 2.2 Regional pivots

REHAU runs three layered domains:

| Domain | Audience | Purpose |
| --- | --- | --- |
| `rehau.com/group-en` | Corporate / global | Brand, Subgroups, sustainability narrative, press |
| `rehau.com/{region}-{lang}` (e.g. us-en, uk-en, ca-en, za-en, de-de) | Mixed B2B/B2C in-market | Product systems, manufacturer locator, regional content |
| `window.rehau.com/{region}` | Window Solutions deep | Product specifier depth, brochures, EcoPuls, dealer locator |
| `bs.rehau.com/{region}` | Building Solutions deep | Same model, different Subgroup |
| `interior.rehau.com/{region}` | Interior Solutions deep | Same model |
| `brand.rehau.com/en-en` | Internal marketing partners | Public-facing brand portal |

This multi-domain pattern is meaningful for FourlinQ: it shows that a serious manufacturer separates "corporate story" from "product specifier depth" — they don't try to do both on one tree.

### 2.3 Windows-division IA (reconstructed)

Combining /group-en/windows, /us-en/windows, and window.rehau.com/uk-en:

```
Windows (Subgroup landing)
├── Why uPVC / Why REHAU
│   ├── Material science (RAU-FIPRO, RAU-FIPRO X)
│   ├── Energy efficiency
│   ├── Sound & security
│   └── Design freedom (1,500+ design options) [search-snippet, us-en]
├── Window Systems (the explorer)
│   ├── ARTEVO  (next-gen GENEO platform, 80mm, angular)
│   ├── GENEO   (86mm, fiber-composite, Passive House)
│   ├── SYNEGO  (80mm, 40%+ recyclate)
│   ├── EURO-DESIGN (4500 family)
│   ├── TOTAL70 (UK volume)
│   ├── RIO / HERITAGE (UK heritage vertical slider)
│   ├── ASPEKT+ (US casement, RAU-FIPRO sash)
│   └── TRITEC / other regional
├── Doors (entry, sliding, lift-and-slide)
├── Sustainability
│   ├── EcoPuls  ← brand-level sustainability mark
│   ├── Circular economy (the diagram)
│   └── Recycled-content claims (40–80% per profile)
├── Audiences (the cross-routing layer)
│   ├── Homeowners (single-family-homes)
│   ├── Architects / Specifiers
│   ├── Fabricators / Manufacturers
│   ├── Installers / Trade
│   └── Commercial / Multifamily
├── Projects / Case Studies (e.g. Finch Cambridge passive house)
├── Tools
│   ├── Dealer locator / Where to buy
│   ├── REHAU Connect (B2B order portal) [search-snippet]
│   ├── World of Windows (virtual showroom)
│   └── Window.ID (digital window passport)
├── Resources
│   ├── Specifier Guide (PDF, 41MB) [search-snippet]
│   ├── Brochures (Homeowner / Sales / Image)
│   ├── BIM / CAD files
│   ├── Specifications (DOC)
│   └── CPD / training (UK)
└── News (product launches, World of Windows events)
```

The most important IA observation: **the Windows division offers parallel funnels keyed to persona**, not one funnel that branches. A homeowner who lands on /us-en/windows sees lifestyle imagery and a "where to buy" path; an architect on the same regional hub gets routed into Specifier Guide, BIM, CAD, and CPD. The systems themselves (GENEO, SYNEGO, ARTEVO) are shared assets but the wrapper differs.

### 2.4 Footer (canonical)

The brand-portal footer specification is the cleanest description of the global footer pattern [brand portal — footer module]:

> "A gray area separates it from the content area, which has a button in the middle that returns the user to the top of the page. Below sits a Smart Green section containing the Smart Tag, followed by a black area, and concludes with a white area containing global links."

So the footer has **four stacked color bands**, top to bottom:
1. Light gray separator strip with a back-to-top button (centered)
2. **Smart Green** band — carries the Smart Tag and the tagline "Engineering progress · Enhancing lives"
3. **Black** band — corporate contact / address / phone / email / social (Facebook, Twitter, XING, YouTube; the brand-portal copy still lists Google+ which dates the spec to ~2018)
4. **White** band — global links / legal (Disclaimer, Data Privacy Protection, Legal Notice, Imprint, Downloads)

Smart Tag left-aligned at "grid column ten" on desktop. Mobile collapses all four bands vertically.

This is the most distinctive footer on the uPVC competitive set. Most competitors run a single black or gray footer. REHAU's four-band stack is *itself* a brand asset — the green-on-black-on-white sequence is recognizable from a thumbnail.

### 2.5 Header

[brand portal — header]
- Logo: left-justified to first grid column
- Main nav + meta nav (search) on the remaining 11 columns
- Search bar opens to the left and pushes meta nav to the side ([brand portal — search])
- Language switcher present in the meta nav
- Mobile: logo, search icon, and burger menu only; mega menu becomes a multi-level drawer
- Mega-menu reveal on hover: the active main item turns Active Red and "a line in Active Red will appear below the menu item from the left" — i.e. an animated underline that wipes from left to right — and the flyout drops down from the top
- Flyout edge defined by a 1px hairline at `#F7F7F7`

### 2.6 Breadcrumbs

[brand portal — breadcrumbs]
- Desktop only ("It is used exclusively in desktop applications.")
- Default text: gray
- Hover: Active Red
- Current/active: Active Red
- Separator character not specified (typically `>` or `/`)

---

## 3. Design system — colors, type, grid, spacing

### 3.1 Color palette

The official REHAU palette (with hex from the brand portal) [brand portal — colours, digital basics]:

| Token | Name | Hex | Role |
| --- | --- | --- | --- |
| Primary brand neutral | **Black** | `#000000` | Text, areas, icons, illustration |
| Brand stage | **White** | `#FFFFFF` | Neutral background, body type on dark |
| Accent A | **REHAU Active Red** | `#DD0060` | CTA, links, logo, highlight, "red line" |
| Accent B | **REHAU Smart Green** | `#37A58C` | SmartTag background, sustainability emphasis, numbered-list numbers |
| Neutral | **REHAU Gray** | `#B1B2B3` | Secondary elements (footer, dividers) |
| Service area BG | Light gray (Tint 4) | `#E5E5E5` | Service-area band, table alt rows, accordion hover |
| Hairline | Light gray edge | `#F7F7F7` | Mega-menu separator, divider rules |

Tint scale on Black: **20 / 40 / 60 / 80 percent** only — REHAU forbids arbitrary opacities.

**Hard rules** [brand portal — colours]:
- Color ratio: **"80% black & white + 10% Active Red + 10% Smart Green"** — must be maintained across designs
- "Never use REHAU corporate colours as gradients" or "lower than 100%"
- "When using Active Red, do not forget to use also Smart Green. Within one page, must always be both colours" — i.e. Red and Green must appear together on every page; never solo
- Active Red ≠ pure red. It is `#DD0060` — a magenta-leaning crimson that reads as "fuchsia" on screen and "deep red" in print. This is intentional differentiation from competitors (Schüco red, Veka red, Profine red are all warmer).

Practical implication for the windows audit: **on a typical REHAU windows page, you will see ~80% black/white/gray content, one or two red CTAs/links, and one green SmartTag or sustainability accent**. Never more. The discipline is what makes the brand feel premium.

### 3.2 Typography

[brand portal — digital basics]

**Font family: Brix Sans** (a humanist geometric sans by HVD Fonts, four weights):
- Brix Sans **Black** — H1, H2, H3 (all headings are Black-weight; this is the loudest signature of the brand on screen)
- Brix Sans **Bold** — labels, table headers, emphasized inline
- Brix Sans **Regular** — body
- Brix Sans **Light** — quotes and large display occasionally

**Type scale (web, rem-based — REHAU's spec uses rem as a pseudo-px since their baseline is 10px = 1rem):**

| Element | Size | Weight | Line-height |
| --- | --- | --- | --- |
| H1 | 14.0rem | Black | 15.4rem |
| H2 | 10.0rem | Black | 11.2rem |
| H3 | 3.6–4.8rem | Black | — |
| "Standard headings" range | 1.8rem–10.0rem | Black | — |
| Body | 1.8rem | Regular | 2.4rem |
| App labels | 1.2rem Bold uppercase, gray "Tint 2" | Bold | — |

> "Standard font size for body text is 18 [px]" [brand portal — digital basics]

The H1 at 140px is gigantic. REHAU's hero headlines are screaming-loud editorial typography — closer to a magazine cover than a SaaS site. Combined with the all-Black weight, it gives the brand a Helvetica-Now/Inter-on-steroids feel.

Body color: standard is Black. On dark backgrounds it switches to White. On Smart Green backgrounds, links flip to Black-default (see §6.2).

### 3.3 Grid

[brand portal — digital basics]

**Desktop:** 12-column grid, 24px gutters
**Reference viewport widths:** 1080px / 1200px / 1440px
**Mobile:** 2-column grid, 24px gutters, 12px outer margins

The hero "white content box" sits inside this grid, "aligned to the right or left of the two outer grid columns" [brand portal — hero section]. So the hero content card is approximately 4–5 grid columns wide overlapped on a full-bleed background image.

### 3.4 Spacing & proportion

[brand portal — layout principle]

REHAU runs a proportional system, not a fixed spacing scale:

> "From the area diagonal D, the value **x** is calculated via the **multiplier 0.09**, which is the basis for the grid."

i.e. the relationship between logo, SmartTag, and surrounding whitespace is scale-driven from the canvas diagonal. Small ads have small logos; full-bleed banners have proportionally large logos. The 0.09 multiplier is the magic number.

Whitespace policy:
> "The white space is a good friend: it ensures balance and lets the elements breathe."

### 3.5 The red line (accent line)

This is the most distinctive piece of REHAU's visual system after Active Red itself.

[brand portal — layout principle, ad layout]:

> "The red line at the end of the text block is to be understood as a 'call-to-action'. The red line element serves as a 'call to action' marker and should only be used for this specific purpose. No additional highlighting is permitted within the copy text."

So: a short horizontal Active-Red line is the visual end-cap of any text block that is meant to call the user forward. It is also the animated underline in the mega menu. This single device — a 2–4px Active-Red horizontal line — does triple duty as:
1. CTA marker at end of paragraph
2. Active-state indicator in nav
3. Hover underline on links

FourlinQ note: this is a stealable mechanic. A short colored accent line as "this paragraph wants action" is a low-cost, high-recognition pattern.

---

## 4. Brand assets — logo, SmartTag, signets, icons, illustration

### 4.1 Logo

[brand portal — logo]
- Three approved variants: **color logo (primary)**, **mono black**, **mono white**
- "The color logo is always the primary logo, but depending on the application type the mono version may replace it."
- Mono white on dark backgrounds, primary colors, or images
- Mono black on light images
- Black/white versions allowed only when color reproduction is technically impossible
- Forbidden:
  > "(1) Nothing may be added to the logo with the exception of the SubGroup Logos. (2) No primary (coloured) logo on pictures or coloured backgrounds. (3) No new creations from the existing 3 variants. (4) No recolouring."

The logo is a wordmark "REHAU" set in a custom geometric sans, with the brand using Active Red as the corporate logo color. There is no separate icon mark — the wordmark is the mark.

### 4.2 SmartTag (Smart Tag)

The SmartTag is the third pillar of the visual identity after logo and color. The brand portal references it as the device sitting in the Smart Green band of the footer carrying the "Engineering progress · Enhancing lives" couplet, and as the primary "sender" mark in ad layouts.

From [brand portal — layout principle]:
> "The primary SmartTag variant works best when placed on an image or a solid background color and should be used wherever possible. Secondary variants adapt: use black typography on light backgrounds and white typography on dark backgrounds."

From [brand portal — ad layout]:
> "For extreme portrait orientations where space is constrained, the Smartline (used in standard Mother Brand applications) is replaced with the SmartTag, which functions as an alternative brand identifier."

Two related devices, then:
- **Smartline** — a thin horizontal red rule used as default "sender" mark on standard layouts
- **SmartTag** — a more substantial parallelogram/cut-corner shape (Smart Green) used in vertical formats and as the footer signature, carrying the tagline

Together these define the *signature* of any REHAU layout: red horizontal accents + green angled SmartTag, both proportionally scaled by the 0.09 multiplier.

### 4.3 Signets (brand sub-marks)

[brand portal — signets]

REHAU runs a family of seven signets used on collateral, packaging, and product:

| Signet | Variant rules | Use |
| --- | --- | --- |
| **Powered/Supported by REHAU** | Monochrome only (black/white) | Partner co-branding |
| **REHAU Return** (sustainability) | Color + monochrome | Sustainable products, materials, initiatives, campaigns |
| **REHAU Quality Mark** | Monochrome only | Partners, carpenters, dealers, installers |
| **REHAU Technology Signet** | Green = sustainability (e.g. EcoPuls); otherwise Black | Tech/process callouts |
| **Made in Germany / German Engineering** | — | Only for products *physically* manufactured in Germany |
| **Online Platform Signet** | Single approved color variant | Digital platforms |
| **Authorized Partner** | "Authorised" (UK) vs "Authorized" (US) | Network certification |

The pattern: a small family of trust-marks, strictly color-locked, used to badge specific product or partner attributes. The Quality Mark and Authorized Partner signets are how REHAU labels its fabricator/dealer network — *highly relevant for FourlinQ's Authorized Dealer story*.

### 4.4 Icons

[brand portal — icons]

> "REHAU Icons have the task to communicate facts clearly and visually. A reduced level of detail, flat design and the design concept of the line are the distinguishing features."

Two variants:
- **Variant A — 32×32px** — line-only, monochrome black or white, used in technical infoboxes, UX, brochures
- **Variant B — 64×64px** — black base + one accent (red or green from the palette), used in editorial brochure sections and social media. "Balance between red and green when using several icons" — i.e. don't let one color dominate.

The icon style is **strictly line-based**: "Only lines are used, no areas." This matches the illustration system (see §4.5) and creates a coherent technical-blueprint feel across all REHAU UI.

### 4.5 Illustration

[brand portal — illustration]

> "The line is our fundamental design element."

Stroke weight: 1pt at A4. No gradients, no tints. Filled areas only for highlights. Gray shadows for spatial orientation. Secondary colors used to indicate product variations.

Four illustration categories — and this is where the windows-relevance hits hardest:

1. **General illustration** — content with brand colors and style elements; high recognition via reduction
2. **3D illustration** (special case) — photorealistic product renders. Frontal perspective, full-image sharpness, white or light-gray (20% black) backgrounds, natural understated shadows, telephoto perspective, area lighting, no floor reflections. **Allowed views: frontal, isometric, cutaway.** No blur, no wide-angle distortion.
3. **Technical illustration in Cinema 4D** — installation instruction graphics in isometric or frontal views
4. **Technical illustration in Adobe Illustrator** — vector installation graphics, light-gray (20% black) title backgrounds with FloatingBox annotations

Key insight: **cutaway and isometric are the brand-sanctioned ways to show a window profile**. That's why every REHAU profile system (GENEO, SYNEGO, ARTEVO) is presented on the web as a 3D cutaway render with line-art callouts pointing to the chambers, gaskets, and reinforcement core. The visual language is borrowed from automotive and aerospace cutaways — which is appropriate, since RAU-FIPRO is "a fiber composite material similar to those employed in aeronautic construction and racing vehicles" [search-snippet].

---

## 5. Photography system

[brand portal — photography]

Six explicit photo styles. This is the most useful piece of REHAU's brand portal for FourlinQ because it tells us *exactly* how a serious uPVC brand allocates lifestyle vs technical photography.

**Style 1 — Product hero shots**
- Studio, isolated products
- Background: white or light gray (20% black)
- Sharp focus across entire frame
- Authentic soft shadows
- This is the standard product-page hero

**Style 2 — Product in use**
- Authentic settings, shallow DoF (details in focus)
- > "The image should show that a person is living here."
- Used for in-context window shots

**Style 3 — Lifestyle**
- Diverse demographics, genuine moments
- Avoid direct eye contact
- Use "creative photographic angles" for authenticity
- Used on homeowner-targeted pages and brochures

**Style 4 — Case studies (architecture)**
- Natural light where possible
- "Clean and presented in an impressive perspective"
- No fisheye, no wide-angle distortion
- Used on project pages (e.g. Finch Cambridge Passive House)

**Style 5 — Product assembly**
- Candid, on-site, unstaged
- Products over people
- Used for fabricator/installer training content

**Style 6 — Corporate**
- Diverse employees, dynamic workplace
- Candid, no direct eye contact
- Used on About Us / careers

**Color treatment** across all six styles:
- High proportion of black
- Rich contrast
- Slightly reduced saturation
- Skin tones "lively"
- Product colors unaltered
- Warm light wash (consistent post)

**Portraiture rules**:
- Golden-section composition (not centered)
- "A point of light in the eye (eye light)" is mandatory
- Tele lenses 100–200mm
- f/2.8 or wider

**Prohibited**:
- "Exchangeable and stereotypical images"
- "Oversaturated, colour cast images. Wrong product colour"
- "Image effects that distract from the product"
- "Picture collages from different elements"
- "Images that do not show the product benefits"
- "Distorted images taken with wide-angle and fisheye lenses"
- Generic Photoshop drop shadows
- Over-styled props

**Stock photography:** only Adobe Stock, only if it "correspond[s] to the REHAU visual language and be provided with the appropriate colour look."

Practical balance: on a typical REHAU windows page, expect roughly 40% lifestyle/architectural photography (Styles 2, 3, 4) and 60% technical (Style 1 product hero, plus the line-art illustration system from §4.5). The lifestyle photography is there to seduce; the technical illustration is there to convince. REHAU never lets the lifestyle photography drift into stock-photo territory — every image is required to "show the product benefits."

---

## 6. Component library

### 6.1 Buttons

[brand portal — buttons]

**Six variants documented:**
1. Icon button (icon-only)
2. Contained icon button (icon inside a filled container)
3. **CTA button** — primary action
4. **Secondary button** — lower-priority action
5. **Standard button** — primary text button
6. **Standard button with icon** — text + icon combo

**States:** Standard, Hover, Press (some variants also have an Inactive state).

**Color rules:**
- "The color of the button depends on the background color."
- Default backgrounds: white or light gray (Tint 4)
- Exception backgrounds permitted: Gray, Black, Smart Green
- **Secondary buttons forbidden on:** Medium Gray, Black, Smart Green

CTA buttons are the primary place Active Red lives. Secondary buttons are usually black outline on white. Border-radius and exact padding aren't published in the portal but observed in their PDFs: rounded-rectangle, modest radius (≈4px equivalent), pill-like at small sizes.

### 6.2 Links

[brand portal — links]

> "Links are usually displayed in Active Red. They are underlined on hover and black and underlined when clicked."

So link states:
- Default: Active Red, no underline
- Hover: Active Red, underline
- Active/clicked: Black, underline

Exception on Smart Green background:
> "Text links on the background color Smart Green are the exception in this case. They are black by default, black and underlined on hover, and white and underlined when clicked."

Three link types: text links, inline text links, link lists.

### 6.3 Tags

[brand portal — tags]

> "Tags are used to filter content or search results."

States: Default / Hover (desktop only) / Selected. No exact dimensions published. Used in product-explorer filters (system type, depth, performance class).

### 6.4 Tables

[brand portal — tables]

The spec for technical tables (Uf-values, depths, chamber counts):
- Headers: Brix Sans **Bold** with a 2px separator rule below
- All other row separators: 1px horizontal rules
- **No vertical lines** — the brand explicitly forbids them
- Alternating row backgrounds: white and light gray Tint 4 (table BG inherits page band)
- Mobile: one column "always truncated to show that this is possible"; tables "can be swipeable"

This matters for FourlinQ because spec tables are the workhorse of any uPVC product page. REHAU's choice — no vertical rules, 2px header rule, alt-row backgrounds — is a quiet, editorial table style, not a database-grid style.

### 6.5 Accordions

[brand portal — accordions]

- Width: **9 grid columns** on desktop (not full 12)
- States: Standard / Hover / Expanded
- Background-aware: on white pages, hover uses light gray (Tint 4); on gray pages, hover uses white
- Can contain images, diagrams, slideshows, and tables — not just text

Used for FAQs and deep technical spec disclosure. The 9-column constraint keeps the accordion visually narrower than a full content band, which gives it a "module within a module" feel.

### 6.6 Breadcrumbs — see §2.5.

### 6.7 Sliders

[brand portal — sliders]

Two slider component types:
- **Liquid (continuous) sliders** — for ranges
- **Step (incremental) sliders** — for discrete values

Inputs: mouse, touch, keyboard.

States: default, selected/active, finished, keyboard.

(Note: these are *form* sliders — range inputs — not image carousels. Carousels are handled under "Slideshow.")

### 6.8 Slideshow

[brand portal — slideshow]

- Desktop: up to 12 grid columns wide
- Mobile: full-screen or two-column grid layouts
- Page indicator bar at the bottom
- Navigation arrows optional ("with or without")
- Supports lightbox integration

### 6.9 Flyouts

[brand portal — flyouts]

Three documented examples:
- Language selection flyout
- Tooltip
- 2nd-level flyout (nested)

The mega-menu (header) is technically a flyout. See §2.5.

### 6.10 Checkboxes, dropdowns, inputs, steppers, paging

Documented as components but not detailed in the portions of the portal I could read. Standard form primitives, all expected to obey the color and typography system above.

### 6.11 Lists

[brand portal — lists]

Three list types:
- **Link lists** — Active Red
- **Unnumbered lists** — black dashes (not bullets — *dashes*)
- **Numbered lists** — numbers in **Smart Green**, one-digit numbers prefixed with `0` (so `01.`, `02.`)

The "dash bullet" and "01./02." conventions are visual signatures that read instantly as REHAU.

---

## 7. Module library

### 7.1 Hero section

[brand portal — hero section]

**Desktop:**
- Full-width background image
- A **white content box** that overlaps the image, aligned to the right or left of the two outer grid columns (i.e. content box is ~4–5 grid columns wide, placed at column 1–5 or 7–12)
- Vertical position of the box is flexible

**Mobile:**
- The box "overlapping image layer and gray area" is placed at the bottom of the image
- Ensures the image is unobstructed above the fold

The white box typically contains: small label/eyebrow (sometimes a SmartTag), H1 in Brix Sans Black, a short subhead, and one CTA button. The red "Smartline" accent often appears under the headline.

The hero pattern is unusually restrained for a major industrial brand. Most competitors use full-bleed text-over-image with overlays; REHAU explicitly carves out a white "card" so the typography never fights the photograph. This is a B2B-leaning choice — it reads as confidence, not as marketing-shout.

### 7.2 Teasers

[brand portal — teasers]

Three layout configurations:
1. **Large/Small** — 8-col image + 4-col text
2. **Medium/Medium** — 6-col image + 6-col text (image left or right)
3. **News teasers** — four equal columns side by side

> "Only hero shots (cut-out images on a neutral background) may be used"
> "Only one full-bleed teaser can be used per page"

Hover behavior: "a box with a brief message and a link to further information."

Info-box variant: backgrounds can be Smart Green, Black, or tints of Black.

Mobile: stacked vertically, or as a teaser slider.

### 7.3 Tiles

[brand portal — tiles]

Eight published layout permutations:
1. 1 large + 2 medium
2. 1 large + 4 small
3. 1 large + 6 extra-small
4. 2 large + 2 small
5. 2 extra-large
6. 2 extra-large (campaigns)
7. 3 large
8. 6 small

Tiles can be browser-width or content-width. Used heavily on Subgroup landing pages to route persona-by-persona (Homeowners / Architects / Fabricators / Sustainability) — a mosaic-style entry into the Windows division.

### 7.4 Navigation — see §2.5.

### 7.5 Footer — see §2.4.

### 7.6 Tab navigation

[brand portal — tab navigation]

> "Tabs organize and navigate between groups of content located within the same hierarchical level."

Active state: **white text on black background**. Mobile: tabs collapse into a dropdown, but the active black/white pill persists.

Used on product detail pages to tab between "Overview / Technical / Sustainability / Downloads" type structures.

### 7.7 Tables — see §6.4.

### 7.8 Forms

[brand portal — forms]

> "designed modularly from various input elements such as radio buttons, text fields, and drop-down menus."

Used for contact, dealer-locator request, brochure download, specifier sign-up.

### 7.9 Search

[brand portal — search]

- Desktop default: search box static in the header meta-nav
- On activation: "Input field expands left" and pushes other meta-nav links sideways
- X icon to clear
- Mobile: either as an icon in the header that opens a separate panel, or at the bottom of the menu drawer

### 7.10 Service areas

[brand portal — service areas]

A pre-footer module with `#E5E5E5` background. Carries login/registration, contact details, or long link-lists. Sits above the footer's gray separator strip — so the page bottom reads `content → #E5E5E5 service area → gray separator → green band → black band → white legal band`. The bottom of every REHAU page is a five-layer color sequence.

### 7.11 Lists — see §6.11.

### 7.12 Lightbox

Used for product galleries, project case-study photo expansion, technical illustration zoom.

### 7.13 Contact module

A specific block style for showing a person (sales engineer, regional contact) with photo, name, role, phone, email. Used heavily in the architect/specifier funnel.

---

## 8. Windows division — page-by-page walk

### 8.1 /group-en/windows — Window Solutions Subgroup landing

Reconstructed from search snippets and brand-portal patterns:

- **Hero:** Likely a Style-4 architectural shot (large glazed building) with the white content box on the left or right. Eyebrow likely identifies the Subgroup ("REHAU Window Solutions"). Headline in Brix Sans Black, probably ~80–100px. CTA button in Active Red. Red Smartline below the headline.
- **Tile mosaic** below the hero — routes to: Window Systems / Doors / Sustainability (EcoPuls) / Audiences (Homeowner, Architect, Fabricator) / Tools (Connect, Window.ID, World of Windows) / News.
- **Sustainability teaser** — full-bleed black band with the green SmartTag and a Style-3 lifestyle photo of a window in a sustainably-built home. Copy on EcoPuls — "the sign of sustainability in practice."
- **Innovation story** — ARTEVO or RAU-FIPRO X feature, with a 3D cutaway illustration (Style 2 illustration from §4.5).
- **Projects** — Finch Cambridge or similar Passive-House case study using Style-4 architecture photography.
- **News teasers** — four-up (e.g. "ARTEVO launch", "World of Windows 2022", "EcoPuls expansion", new Sustainability Report).
- **Service area** — login for fabricators (REHAU Connect), brochure downloads, contact a sales engineer.
- **Footer** — full four-band stack.

### 8.2 /us-en/windows — US regional Windows hub

[search-snippet, /us-en/windows]
Confirmed content elements:
- "1,500+ design options" for architects, builders, homeowners
- Routes to: Systems (search-by-system), Manufacturers, Where to buy, Single-family homes (Residential), Commercial & Multifamily, Aspekt+, REHAU Advantage
- The page is the *spine* of the US windows funnel — it must absorb homeowner, architect, fabricator, and commercial-builder traffic simultaneously, and routes them apart within 1–2 clicks.

The IA branch /us-en/windows/search-by-system [search-snippet] is the **profile system explorer** (see §8.5).

### 8.3 /us-en/system-geneo — GENEO product page

[search-snippet, /us-en/system-geneo]

Hero positioning: "GENEO Tilt-Turn Windows — The ultimate Passive House ingredient" (from the brochure heading reused on web).

Content blocks (typical REHAU product-page structure, inferred from brochure + search snippet):
1. **Hero** — Style-1 product hero or Style-4 architecture (Passive House project) with white content box: tagline, H1 ("System GENEO"), short subhead, CTA "Find a fabricator" or "Download spec."
2. **Material story** — RAU-FIPRO fiber composite. Side-by-side: line illustration of the fiber matrix vs cross-section of the profile showing the absence of steel reinforcement. Copy emphasizes "first fully-reinforced polymer window profile system that doesn't rely on steel for its strength" and "similar to those employed in aeronautic construction and racing vehicles."
3. **Technical specs band** — table with Uf 0.79 W/m²K (varies by config: 0.73, 0.85), Uw down to 0.66 W/m²K, depth 86mm, 6-chamber, Passive House certified component.
4. **Cross-section illustration** — the canonical line-art cutaway showing all six chambers, center seal, optional thermo-modules, glazing pocket (up to 51mm). This is *the* image that defines the page.
5. **Performance tabs** (Tab Navigation module, §7.6) — Thermal / Acoustic / Security / Structural. Active tab: white on black.
6. **Design options** — slideshow (§6.8) of color foils, surfaces, shapes. References "1,500+ design options."
7. **Project showcase** — Style-4 case study (e.g. Finch Cambridge), full-bleed teaser.
8. **Downloads** — Specifier Guide, BIM, CAD, technical info PDFs. Active Red link list.
9. **CTA band** — "Find a REHAU manufacturer" → dealer locator.
10. **Service area** — sales engineer contact.
11. **Footer.**

The page is a **technical-authority document with marketing wrapping**: the cross-section illustration and spec table are the rhetorical core; the lifestyle photos are framing.

### 8.4 /us-en/system-aspekt-plus — ASPEKT+ casement (US)

[search-snippet]
- "Streamlined out-swing casement"
- "Strength-enhancing sash in RAU-FIPRO glass-fiber reinforced PVC material"
- "Designed to meet stringent Passive House requirements"
- Three frame depths: 3 1/4", 3 3/8", 3 1/2"
- Same page structure as GENEO with imperial-unit specs (US market localization)

This is the localized expression of the same product-page template — the geometry of the page is identical, the spec values translate to inches and US codes.

### 8.5 /us-en/windows/search-by-system — Profile system explorer

This is the **product browser**. The pattern (inferred from REHAU's component library):
- Filter tags (§6.3) at the top: by application (Residential / Commercial / Passive House), by depth (60 / 70 / 80 / 86mm), by performance class.
- Tiles (§7.3) below, one per system: GENEO, SYNEGO, ARTEVO, EURO-DESIGN, ASPEKT+, etc.
- Each tile: Style-1 product hero (cut-out profile cross-section on neutral background), headline, one-line positioning, key spec callouts (depth, Uf, chambers), CTA → product page.
- No comparison-table tool surfaced in search results, but the Specifier Guide PDF functions as the canonical comparison document.

For FourlinQ, this confirms: **REHAU does not over-engineer the explorer**. They lean on tiles + filters, not on a heavy compare-up-to-three SaaS-style tool. The comparison is left to the downloadable PDF for serious specifiers.

### 8.6 /us-en/dealersearch-windows — Dealer locator

[search-snippet]
> "Search for a local REHAU window and door fabricator to help you choose the right solution for your project."

Filterable by REHAU product group. Implementation likely: map + list with form filters (postcode, system type). Conforms to REHAU's general forms pattern (§7.8). This page is one of the two homeowner-conversion endpoints (the other being brochure download).

### 8.7 /us-en/windows/manufacturers — Fabricator page

Network of certified manufacturers. Pivot from "where to buy" (homeowner-facing) to "who fabricates" (B2B and architect-facing). Same data, different framing.

### 8.8 /us-en/commercial-products and /us-en/commercial-ccmp — Commercial

[search-snippet] The Commercial Certified Manufacturers Program (CCMP). Architecture-led copy, Style-4 photography. Lists the systems suitable for commercial multifamily (typically GENEO, ARTEVO, ASPEKT+).

### 8.9 /us-en/equipping-fabricators-for-success — Fabricator value-prop page

[search-snippet]
> "Whether seasoned or new to the business, REHAU helps fabricators get the most out of their factory space, equipping businesses for success by reinforcing the needs of the factory, providing knowledge for fabrication, and elevating project vision to new levels of innovation. REHAU trains team members through the windows and doors production process, with in-person fabrication training demonstrating the start-to-finish process of manufacturing a REHAU window or door."

Pure B2B value-prop. Style-5 photography (product assembly). Likely heavy on training, partnership, business-support copy. This page is the entry point for someone considering becoming a REHAU fabricator — the exact tier above FourlinQ in the value chain.

### 8.10 /us-en/finch-cambridge-passive-house-project-with-rehau-windows — Case study

[search-snippet] A Cambridge, MA Passive House multifamily project. Pattern: long-form case study, Style-4 architectural photography, embedded spec callouts, project credits (architect, fabricator, glazing partner), downloadable PDF. Likely uses the full-bleed teaser module (§7.2) once per page.

### 8.11 /us-en/rehau-advantage-windows — "Why REHAU" page

The "Why REHAU" anchor for the windows category. Likely uses Style-2/Style-3 photography with technical illustration interludes — a hybrid argument: "Beautiful homes. Real engineering."

### 8.12 /group-en/rehau-skyforce — SKYFORCE

[search-snippet] A REHAU balustrade/glass-rail system. Sits adjacent to windows in the Subgroup. Listed here because it shows that the Window Solutions Subgroup is not *only* windows — it includes adjacent architectural-glazing systems.

### 8.13 /group-en/revolutionary-premium-window-system

[search-snippet] ARTEVO launch landing page:
> "ARTEVO is the next generation of the successful GENEO profile system that decisively develops the performance of the glass fibre-reinforced solution. ARTEVO is a development of GENEO with clear and angular contours that has been completely redesigned."

This is the *product narrative* page — positions ARTEVO as evolution of GENEO with a more angular silhouette. The visual language likely contrasts:
- GENEO: rounded chamfered profile
- ARTEVO: angular squared profile
…with side-by-side line illustrations.

> "ARTEVO max provides energy efficiency in perfection, with the product variant containing LowE foil offering a uniquely sustainable solution for passive house certified elements."

ARTEVO recyclate content: "up to 75%" — explicitly called out. ARTEVO and SYNEGO share an 80mm platform; GENEO at 86mm sits a tier above.

### 8.14 /group-en/sustainability and /group-en/the-rehau-way/sustainability

[search-snippet] The corporate sustainability hub.
- "Sustainability is a driving force within the REHAU Group strategy"
- UN Global Compact (since 2020)
- Pillars: circular economy, energy supply, diversity
- Downloads: REHAU Sustainability Report 2021 / 2022 / 2024
- Within Window Solutions specifically: EcoPuls, 60%+ of profiles use recycled PVC, 40–80% recycled content per profile, up to 97,000 t CO₂ saved annually, profiles can pass through the recycling cycle 7 times, VinylPlus certification for all European window plants

### 8.15 window.rehau.com/uk-en — UK Window Solutions site

The single deepest windows site in the network. Inferred IA from search snippets:
- Why uPVC (with sub-page: Sustainability & Recycling)
- Window systems (TOTAL70, RIO, ARTEVO, SYNEGO, GENEO, Heritage Vertical Slider)
- Doors
- For specifiers (CPD, Specifier Guide download, Future Homes Standard guide)
- For installers/trade (REHAU Connect B2B portal)
- EcoPuls (sustainability)
- About us / News / Service

### 8.16 window.rehau.com/uk-en/pvcu-windows-doors-composite-curtain-walling-specifiers/rehau-connect

[search-snippet] REHAU Connect — a B2B order-management/configurator portal for fabricators.
> "REHAU Connect is the answer to the megatrends of digitalisation and customisation."
3D configurator visualizes planned windows in real time. Sits behind authentication for fabricators.

### 8.17 Window.ID — Digital window passport

[search-snippet]
> "REHAU Window.ID increases efficiency for the lifetime of the window, with the digital window ID serving as a guarantee of optimised processes from production to recycling."

A QR/serial-number-bound digital identity for each window, supporting recycling traceability. Visualized in the EcoPuls circular-economy narrative.

### 8.18 World of Windows (the showroom)

[search-snippet] Annual physical event ("over 600 m²") + virtual AR companion ("REHAU VIRTUAL WORLD" iOS app). 40 experience points, 110 interaction points. Augmented-reality showroom developed with Blackspace. This is where REHAU's brand spectacle lives — the "wow" layer above the spec-grind product pages.

---

## 9. Audience segmentation pattern

REHAU runs **four primary personas** through the Windows division, each with its own funnel entry, content depth, and conversion endpoint:

| Persona | Entry pages | Content style | Conversion endpoint |
| --- | --- | --- | --- |
| **Homeowner / end customer** | /windows/single-family-homes, /us-en/windows, homeowner-brochure.pdf | Style-2 lifestyle + Style-4 architecture photography; benefit-led copy ("Windows. Reinvented for modern life."); minimal jargon; emphasis on design options and warranty | Find a fabricator (dealer locator) |
| **Architect / specifier** | /specifiers-architects, /window-door-specifier-guide, Specifier Guide PDF, CPD pages | Style-4 architecture photography + Style-1 technical product shots; spec-led copy with full U-values, depths, certifications; BIM/CAD downloads; Passive House framing | Download Specifier Guide; book a CPD session; contact specification engineer |
| **Fabricator / processor** | /windows/manufacturers, /equipping-fabricators-for-success, REHAU Connect (B2B portal) | Style-5 product-assembly photography; ROI/training/business-support copy; commercial framing | Become a REHAU partner; log into REHAU Connect |
| **Installer / trade / distributor** | /uk-en/trade-distributors | Style-5 + product detail; logistics, training, support | Become an authorized partner |

Plus secondary personas:
- **Commercial builder / multifamily developer** — /us-en/commercial-products, /us-en/commercial-ccmp
- **Press / investor** — /group-en/about-us, /service/news
- **Sustainability auditor / certifier** — Sustainability Reports, EcoPuls

The pattern that matters most: **REHAU never makes the audiences fight each other on a single page**. The /us-en/windows hub teases all four, but every link sends each persona into its own depth. The homeowner who lands on the GENEO product page is *also* served the architect/fabricator framing on the same page (because the page is meant to do double duty), but the CTAs at the bottom of each section route by persona.

This is the **single most important UX pattern for FourlinQ to copy**. Today FourlinQ likely has one shared page for "uPVC windows" that tries to seduce homeowners and inform architects simultaneously. REHAU's discipline is: shared product, different wrapper.

---

## 10. Sustainability storytelling — EcoPuls and the circular economy

EcoPuls is the most polished part of REHAU's marketing system, and the most relevant for FourlinQ because (a) every uPVC manufacturer needs a sustainability story and (b) REHAU has done the work that lets FourlinQ honestly claim adjacency.

### 10.1 What EcoPuls is

[search-snippet, /uk-en/ecopuls and /group-en/sustainability]
- A **label** ("the sign of sustainability in practice") applied to qualifying REHAU window profiles
- A **circular-economy program** with ~1,200 collection partners across Europe
- Backed by hard numbers: 40–80% recycled content per profile, 60%+ of Window Solutions output is made from recycled PVC, up to 97,000 t CO₂ saved annually, profiles can recycle 7 times, ~90% lower emissions in producing recyclate vs virgin PVC

### 10.2 How it's visualized

The sustainability narrative leans on a **circular diagram** — the EcoPuls loop. Old window → collection → granulation → re-extrusion → new profile → installation → service life → back to collection. Drawn in line-art with green accents (numbered list = Smart Green numbers). This kind of cyclical infographic is one of the brand's signature illustrative devices.

### 10.3 Where it lives in the IA

- **Brand-level signet** — REHAU Return / REHAU Technology Signet (green) — applied as a small mark on products and packaging
- **Page level** — /uk-en/ecopuls, /uk-en/why-choose-pvcu/sustainability-recycling
- **Brochure level** — EcoPuls section appears in homeowner brochure, image brochure, ARTEVO brochure
- **Footer-band level** — Smart Green band carries the SmartTag and the tagline; the very *color* of the footer band is the sustainability commitment

### 10.4 Voice

> "EcoPuls is REHAU's sign of sustainability in practice and represents a mindset and commitment to a pioneering circular economy."

Tone is *factual* — REHAU lets the numbers do the work. No greenwashing-adjacent language ("eco-friendly," "natural," "earth-loving"). Instead: cycles, percentages, tonnage, certifications (VinylPlus, UN Global Compact, Passive House).

### 10.5 FourlinQ implication

FourlinQ can't claim EcoPuls itself, but it *can* claim adjacency through the REHAU profile. The audit-relevant point: **frame sustainability as material science, not as lifestyle**. REHAU's posture is the gold standard for this in uPVC.

---

## 11. Technical material-science visual language

This is the section that justifies the entire audit for FourlinQ. REHAU's visual language for showing a uPVC profile is the most refined in the industry — and FourlinQ uses REHAU profiles, so this visual language is upstream "ground truth."

### 11.1 The cross-section

Every REHAU profile system is shown in a **canonical 3D cutaway** that:
- Sits on a white or 20%-black-tinted gray background (per illustration rule §4.5)
- Frontal or slight isometric perspective
- Slices the profile to reveal:
  - The outer face (visible window frame)
  - The chambers (5, 6, or 7 depending on system; ARTEVO = 6, GENEO = 6, SYNEGO = 6, EURO-DESIGN 86 = 6, TOTAL70 = 6)
  - The center seal (key differentiator: SYNEGO and GENEO have it; others may have face seals only)
  - The reinforcement core (steel in most; **absent/replaced by fiber composite in GENEO and ARTEVO** — RAU-FIPRO / RAU-FIPRO X)
  - The gasket(s)
  - The glazing pocket
- Annotated with **line-art callouts** in black, with one or two color-coded accents in Active Red or Smart Green
- No floor reflection, no blur, telephoto perspective

This is *the* image. On a GENEO product page, the cross-section is the second viewport (after the hero) and the dominant element on the page below the fold.

### 11.2 The exploded view

For more complex pages (RAU-FIPRO X material story, Window.ID), REHAU uses an **exploded isometric** that pulls the layers apart on the depth axis — outer profile / reinforcement core / gaskets / seals / glass — with thin guide lines connecting the parts. Borrowed from automotive assembly diagrams.

### 11.3 The energy diagram

Two common variants:
- **U-value heatmap** — a profile cross-section colored from blue (cold outside) to red (warm inside) showing where heat is lost. The "absence" of a thermal bridge in GENEO (because there's no steel core) is the rhetorical climax of this diagram.
- **Comparison bar chart** — Uf values shown as horizontal bars for each REHAU system + competitors (anonymized) + Passive House threshold line.

### 11.4 The acoustic diagram

A side-view of the closed window with sound waves illustrated as concentric arcs, attenuated as they cross the profile. Often paired with a dB-rating callout.

### 11.5 The security diagram

A side-view showing the locking points along the sash perimeter. Numbered "01., 02., 03." in Smart Green per the list spec (§6.11). Bullet pull-quotes for class RC1/RC2 ratings.

### 11.6 The recycling cycle

The EcoPuls loop (see §10.2) — a circular arrow diagram with stages annotated in Smart Green numbers.

### 11.7 Stylistic coherence

All six diagram types share:
- **1pt line weight**
- **No gradients or color tints**
- **Line as primary, color as accent (Red or Green only)**
- **No drop shadows beyond a soft authentic-light shadow**
- **No 3D bevels, no glassmorphism, no neumorphism**
- **Annotations in Brix Sans Bold or Regular, never script or display fonts**

The cumulative effect: every REHAU page reads as a *technical document*, not as marketing. The brand's premium feel comes from this restraint.

### 11.8 Material science vocabulary

The brand's preferred terminology — useful for FourlinQ copy:
- "Profile system" (not "window frame")
- "Installation depth" (not "thickness")
- "Center seal" / "centre gasket" (the European third gasket)
- "Chamber" (each hollow internal void)
- "Sightline" (visible face width of the closed window from the inside)
- "Reinforcement core" (the embedded structural member, traditionally steel)
- "Fiber composite" (RAU-FIPRO / RAU-FIPRO X — the steel replacement)
- "Recyclate" (recycled PVC content)
- "Uf-value" (frame thermal transmittance, W/m²K)
- "Ug-value" (glass)
- "Uw-value" (whole window)
- "PVC-U" / "uPVC" / "PVCu" (REHAU UK uses "PVCu"; US uses "PVC")
- "Tilt-turn" (the European hardware standard)
- "Casement" (US/UK casement-opening hardware)

---

## 12. Regional & language behavior

REHAU runs region/language as the **first dimension** of the IA. The pattern:

- **Region-locale pair** in the URL: `/group-en`, `/us-en`, `/uk-en`, `/de-de`, `/ca-en`, `/ca-fr`, `/za-en`, `/cn-zh`, etc.
- **Language switcher** lives in the meta nav (header right). On desktop it's a flyout (§6.9, "Language selection"). On mobile it's typically at the bottom of the menu drawer.
- **Group-en is the global default** — neutral content, corporate framing, links out to Subgroup-specific regional sites
- **Window-specific deep content** lives on `window.rehau.com/{region}` (UK is the most-developed locale)
- **Currency, units, certifications**: localized per region. US gets imperial (inches, °F), Europe gets metric (mm, °C, W/m²K). Passive House framing is global; Future Homes Standard is UK-specific; PHIUS+ is US-specific.

For FourlinQ, the relevant lesson is *not* the multi-region machinery (FourlinQ is single-market) but the **localized certification framing**: REHAU shows the certifications that matter to each market. FourlinQ in the Philippines should foreground locally-meaningful claims (typhoon resistance, salt-air durability, electrical-code certifications) the way REHAU foregrounds Passive House.

---

## 13. Copy voice and tone

Across the brand portal and visible pages, REHAU's copy has a consistent character:

**Voice attributes:**
- **Aspirational but grounded** — "Engineering progress / Enhancing lives" is the tagline; every page tries to bridge competence (engineering) to benefit (lives)
- **Action-oriented** — verbs lead ("Engineering," "Enhancing," "Reinvented," "Revolutionary," "Equipping")
- **Materially specific** — copy frequently names the material ("RAU-FIPRO fiber composite"), the value ("Uf 0.79 W/m²K"), or the certification ("Passive House certified component"). Vagueness is avoided.
- **Confident without bombast** — they don't say "the best" or "the only." They say "first" or "pioneering" with substantiation.

**Headline formulas (observed from brochure titles and search snippets):**
- "Windows. Reinvented for modern life." (homeowner brochure)
- "Differentiation made easy" (image brochure)
- "The ultimate Passive House ingredient" (GENEO brochure)
- "Engineering progress / Enhancing lives" (Specifier Guide, all corporate)
- "Total Choice for Every Type of Home" (TOTAL70 brochure)
- "How REHAU Equips Fabricators for Success" (fabricator page)
- "Where to buy" (dealer locator)
- "75 years of engineering progress and enhancing lives" (anniversary)
- "Pioneering Sustainability: Yesterday. Today. Tomorrow" (sustainability page)

**Subhead patterns:**
- Short factual claims (one Uf-value, one chamber count, one recyclate percentage)
- Often a colon-separated structure: "EcoPuls: Sustainable windows by REHAU"
- Or an em-dashed compound: "ARTEVO — The next generation of GENEO"

**Body copy:**
- Sentences are short to medium
- Active voice strongly preferred
- Material names italicized or capitalized (RAU-FIPRO, EcoPuls, SmartTag) — they're treated as proper nouns of the brand
- Numbers always include units; numbers always written numerically not spelled

**What REHAU avoids:**
- Sentimental homeowner language ("the home of your dreams")
- Vague performance claims ("amazing energy efficiency")
- Pure marketing adjectives without a noun
- Stock B2B jargon ("synergies," "solutions-driven")
- Greenwashing vocabulary

**Persona-shift in voice (same brand, different page):**
- Homeowner pages: short sentences, photo-led, lifestyle benefit (warmth, quiet, beauty, value)
- Architect pages: longer sentences, citation-laden, certification-led
- Fabricator pages: ROI-led, training-led, partnership-framed
- Corporate pages: vision-led, family-led ("a unique and diverse family of six Subgroups")

---

## 14. Animation and interaction inventory

Direct CSS inspection wasn't possible (Akamai 403), but from the brand-portal interaction specs and observed component behavior:

| Surface | Interaction | Behavior |
| --- | --- | --- |
| Main nav (desktop) | Hover on top-level item | Item text → Active Red; underline animates left-to-right in Active Red; flyout drops down from top |
| Main nav (mobile) | Tap | Drawer slides; multi-level disclosure (1st → 2nd → 3rd); back-arrow returns up the tree |
| Search (desktop) | Click | Input field expands leftward; other meta-nav items shift to the right; X icon clears |
| Buttons | Hover / Press | Background or text color shift per state spec |
| Links | Hover | Underline appears |
| Tags | Hover (desktop only) | State change to "selected" preview |
| Breadcrumbs | Hover | Item turns Active Red |
| Teaser cards | Hover | "A box with a brief message and a link to further information" appears |
| Accordions | Click | Expand state; light-gray (Tint 4) hover band on white BG, white hover band on gray BG |
| Tab navigation | Click | Active tab pill → white text on black background |
| Slideshow | Drag / Arrow click | Slide transition; page indicator updates |
| Hero | (Static) | No documented hero loop or video animation; the brand portal hero spec doesn't mention motion, suggesting hero is photo-led not video-led by default |
| Back-to-top | Click | Located in gray separator strip above the green footer band |
| Mega menu separator | Static | 1px `#F7F7F7` line defining flyout edge |
| Mobile tables | Drag | Swipeable; one column "always truncated to show that this is possible" |

**Easing / duration:** Not specified in the brand portal. The animated underline in nav and the search-bar expansion both feel like ~200ms ease-out from the visual cue language. No documented use of springs, parallax, or scroll-jacking. The brand reads as "honest UI" — animations exist to clarify state, not to entertain.

**No documented:**
- Scroll-triggered animations
- Hero video loops
- Parallax
- Cursor effects
- 3D scroll
- Lottie animations
- Page transitions

The absence is itself a posture: REHAU's premium-ness is communicated through restraint and material substance, not motion design.

---

## 15. Mobile vs desktop differences

| Property | Desktop | Mobile |
| --- | --- | --- |
| Grid | 12-col, 24px gutters, 1080/1200/1440 reference widths | 2-col, 24px gutters, 12px outer margins |
| Hero | White content box overlaps the image, aligned to one of the outer two grid columns | Box placed at the bottom of the image (image stays unobstructed) |
| Header | Logo + main nav + meta nav (search expandable) | Logo + search icon + menu icon only |
| Main nav | Hover-revealed mega menu (flyout) | Multi-level drawer with back-arrow disclosure |
| Search | Inline expansion in header | Icon-led panel or bottom-of-menu placement |
| Tabs | Horizontal tab bar | Dropdown collapse, active state preserved (white-on-black) |
| Tables | Full width, swipeable optional | Swipeable mandatory; one column truncated as affordance |
| Teasers | 8+4 or 6+6 or 4+4+4+4 grid arrangements | Stacked vertically or teaser slider |
| Slideshow | Up to 12-col content width | Full screen or 2-col grid layouts |
| Footer | 4 horizontal bands with horizontal element distribution | 4 vertical bands with stacked elements |
| Breadcrumbs | Visible | **Not used** ("It is used exclusively in desktop applications") |
| Tag hover state | Available | Not available (selected state only) |

REHAU's mobile is *not* a compressed desktop — it's a documented variant of each module with its own rules. Notable: breadcrumbs are deliberately omitted on mobile, which is unusual and suggests REHAU treats mobile users as more navigational-by-search and less by-position.

---

## 16. What FourlinQ should steal, adapt, and avoid

### 16.1 Steal (direct copy from REHAU's playbook)

- **The four-band footer** (light-gray separator → accent-green band → black band → white legal band). Adapt FourlinQ's color tokens to it. This is a visual signature that costs nothing to implement and pays compound recognition.
- **The 80/10/10 color discipline**. FourlinQ's palette is likely richer than REHAU's, but the 80/20 mono-to-accent ratio is the single biggest reason REHAU pages read as premium. Audit every FourlinQ page against this ratio.
- **The red accent line as universal CTA marker**. A short colored line under a paragraph saying "this paragraph wants action" — the cheapest "premium" gesture available.
- **The cross-section as hero image #2**. Every system page on FourlinQ should have a canonical 3D cutaway of the profile as the dominant image below the fold, line-art annotated, with chambers/center seal/reinforcement/gasket called out. FourlinQ uses REHAU profiles — the cross-section is *real* and can be cited.
- **Four-persona routing**. Homeowner, Architect, Fabricator/Builder, Installer/Dealer. One landing page that tiles all four, then per-persona depth pages with the appropriate copy voice and photography style.
- **The "01./02./03." numbered-list convention** in a brand accent color. Tiny detail, big recognition.
- **Material vocabulary discipline**. Use "installation depth," "chambers," "sightline," "Uf-value," "center seal" — REHAU's vocabulary is the technical standard for the global uPVC industry. FourlinQ owes its credibility to using it correctly.
- **Photo style allocation**. ~40% lifestyle/architectural, ~60% technical/illustration, never stock-photo drift.
- **The "signet" sub-mark family**. FourlinQ likely needs: a "Powered by REHAU profiles" co-brand signet, an "Authorized Dealer" partner signet, a "Made in the Philippines" provenance signet, a sustainability signet. Strict color rules per signet.

### 16.2 Adapt

- **Brix Sans is licensed and expensive.** A free open-source humanist geometric — Inter, Outfit, DM Sans, or Manrope — at all-Black-weight for headlines and Regular for body delivers the same visual loudness. Inter Display at 900 weight is the closest free analog to Brix Sans Black at the heading sizes REHAU uses.
- **Active Red `#DD0060` is REHAU's IP.** Don't copy the exact hex. Pick a magenta-leaning crimson that is FourlinQ's own (and check it for AA contrast on white).
- **Smart Green `#37A58C` is REHAU's IP.** Pick a desaturated emerald or teal that is FourlinQ's own. Reserve it for sustainability, partner/dealer marks, and accent moments. Never use it as primary.
- **The 0.09 area-diagonal multiplier** for proportional logo/SmartTag scaling is overkill for a single-market manufacturer. Replace with a discrete sizing scale (sm/md/lg/xl) tied to viewport breakpoints.
- **EcoPuls is REHAU's program.** FourlinQ should *adjacent-claim* via REHAU's recyclate content ("our profiles contain 40–80% recycled PVC, sourced from REHAU's EcoPuls program") rather than invent a parallel mark.
- **Four-region IA is unnecessary** — FourlinQ is single-market. But the lesson — separating "corporate story" from "specifier depth" — still applies. Consider a single domain with a clear `/specifiers` vs `/homeowners` vs `/dealers` split.
- **CPD for architects** is a UK-centric construct. The Philippines equivalent is PIA (Philippine Institute of Architects) accredited seminars. Same mechanic, localized.

### 16.3 Avoid

- **Do not over-animate.** REHAU's premium feel is partly the *absence* of animation. A heavy scroll-jacked, parallax, video-looped FourlinQ site will look like a small player trying to imitate a tech startup, not a serious uPVC manufacturer.
- **Do not use stock photography that reads as stock.** REHAU's photography rules are strict for a reason. A single bad lifestyle image undoes the technical authority of an entire page.
- **Do not use vertical gridlines in spec tables.** REHAU explicitly forbids them. The editorial-table look (2px header rule, alt-row backgrounds, no verticals) is more premium than the database-grid look.
- **Do not put breadcrumbs on mobile.** Trust REHAU's research here.
- **Do not introduce a heavy compare-up-to-three configurator** as a substitute for an honest spec PDF. REHAU lets the Specifier Guide do that work. FourlinQ should have a downloadable comparison PDF.
- **Do not greenwash.** Numbers, certifications (VinylPlus equivalent, ISO 14001, Passive House sample projects), tonnage. Never adjectives.
- **Do not use gradients on brand colors.** REHAU's "never use REHAU corporate colours as gradients" rule is the single biggest visual-premium tax-saver.
- **Do not break the 80/10/10 ratio.** If FourlinQ's pages currently use 60% color and 40% mono, they will read as less serious than REHAU — regardless of how good the rest of the design is.

---

## Appendix A — Sources

Primary (REHAU's own brand portal):
- https://brand.rehau.com/en-en (portal home)
- https://brand.rehau.com/en-en/brand-story
- https://brand.rehau.com/en-en/basics/colours
- https://brand.rehau.com/en-en/basics/logo
- https://brand.rehau.com/en-en/basics/signets
- https://brand.rehau.com/en-en/basics/icons
- https://brand.rehau.com/en-en/basics/illustration
- https://brand.rehau.com/en-en/basics/photography
- https://brand.rehau.com/en-en/basics/layout-principle
- https://brand.rehau.com/en-en/digital-guideline
- https://brand.rehau.com/en-en/digital-guideline/digital-basics
- https://brand.rehau.com/en-en/digital-guideline/components/buttons
- https://brand.rehau.com/en-en/digital-guideline/components/links
- https://brand.rehau.com/en-en/digital-guideline/components/tags
- https://brand.rehau.com/en-en/digital-guideline/components/accordions
- https://brand.rehau.com/en-en/digital-guideline/components/breadcrumbs
- https://brand.rehau.com/en-en/digital-guideline/components/sliders
- https://brand.rehau.com/en-en/digital-guideline/components/slideshow
- https://brand.rehau.com/en-en/digital-guideline/components/flyouts
- https://brand.rehau.com/en-en/digital-guideline/modules/header
- https://brand.rehau.com/en-en/digital-guideline/modules/footer
- https://brand.rehau.com/en-en/digital-guideline/modules/hero-section
- https://brand.rehau.com/en-en/digital-guideline/modules/navigation
- https://brand.rehau.com/en-en/digital-guideline/modules/teasers
- https://brand.rehau.com/en-en/digital-guideline/modules/tiles
- https://brand.rehau.com/en-en/digital-guideline/modules/tab-navigation
- https://brand.rehau.com/en-en/digital-guideline/modules/tables
- https://brand.rehau.com/en-en/digital-guideline/modules/forms
- https://brand.rehau.com/en-en/digital-guideline/modules/search
- https://brand.rehau.com/en-en/digital-guideline/modules/service-areas
- https://brand.rehau.com/en-en/digital-guideline/modules/lists
- https://brand.rehau.com/en-en/communication-media/ads

Secondary (search-snippet citations of live pages, since direct fetch is Akamai-blocked):
- https://www.rehau.com/group-en
- https://www.rehau.com/group-en/windows
- https://www.rehau.com/group-en/sustainability
- https://www.rehau.com/group-en/the-rehau-way/sustainability
- https://www.rehau.com/group-en/revolutionary-premium-window-system (ARTEVO launch)
- https://www.rehau.com/group-en/successful-product-launch-artevo-now-available
- https://www.rehau.com/group-en/the-circular-economy-window-solutions
- https://www.rehau.com/group-en/rehau-impressively-combines-polymers-and-sustainability
- https://www.rehau.com/us-en
- https://www.rehau.com/us-en/windows
- https://www.rehau.com/us-en/windows/search-by-system
- https://www.rehau.com/us-en/system-geneo
- https://www.rehau.com/us-en/system-aspekt-plus
- https://www.rehau.com/us-en/windows/manufacturers
- https://www.rehau.com/us-en/dealersearch-windows
- https://www.rehau.com/us-en/equipping-fabricators-for-success
- https://www.rehau.com/us-en/windows/rehau-advantage-windows
- https://www.rehau.com/us-en/windows/single-family-homes
- https://www.rehau.com/us-en/windows/rehau-commercial-windows
- https://www.rehau.com/us-en/commercial-ccmp
- https://www.rehau.com/us-en/finch-cambridge-passive-house-project-with-rehau-windows
- https://www.rehau.com/us-en/geneo-passive-house-certified
- https://window.rehau.com/uk-en
- https://window.rehau.com/uk-en/ecopuls
- https://window.rehau.com/uk-en/why-choose-pvcu/sustainability-recycling
- https://window.rehau.com/uk-en/rehau-upvc-windows-doors/sustainability
- https://window.rehau.com/uk-en/window-door-specifier-guide
- https://window.rehau.com/uk-en/pvcu-windows-doors-composite-curtain-walling-specifiers/rehau-connect
- https://window.rehau.com/uk-en/geneo-alu-top-windows
- https://www.rehau.com/za-en/specifiers-architects
- https://www.rehau.com/uk-en/trade-distributors

Brochure PDFs (Akamai-blocked from direct fetch but content reconstructed via search):
- windows-image-brochure.pdf — "Differentiation made easy — Windows. Reinvented for modern life."
- homeowner-brochure.pdf — "Windows. Reinvented for modern life."
- rehau-specifier-guide-brochure.pdf — "Engineering progress / Enhancing lives — Specifier Guide" (41 MB, updated 01.11.2024)
- system4700geneobrochure-4700700-rehau.pdf — "GENEO Tilt-Turn Windows — The ultimate Passive House ingredient"
- sales-brochure-geneo-rau-fipro-x.pdf
- artevo-brochure.pdf
- total70-brochure.pdf
- rehau-heritage-vertical-slider-brochure.pdf
- rehau-windows-and-doors-system-brochure-sea.pdf
- 4700systemdescription-4700600en-rehau.pdf
- rehau-sustainability-report-2021.pdf / -2022.pdf

---

*End of audit.*
