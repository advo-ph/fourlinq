# Competitor Audit — Vitrocsa

> Extends `docs/references/design-systems/vitrocsa.md` with a comprehensive design, UX, and IA audit of https://www.vitrocsa.com. Vitrocsa is the inventor of the minimalist window category (1992) and the benchmark for ultra-premium architect-specifier branding. This document is a reference research file for the FourlinQ uPVC redesign — it is **not** a brief to copy Vitrocsa, but to understand the most extreme expression of architectural restraint in the windows industry and decide what is appropriate to translate into the FourlinQ context (a Philippine uPVC manufacturer serving a different price tier and audience).
>
> All observations are from direct site inspection (May 2026). URLs cited inline.

---

## 0. Executive Summary

Vitrocsa is the **anti-marketing** website. Where Marvin and Schüco use category language, Vitrocsa removes it. Where Sky-Frame uses an orange accent, Vitrocsa refuses all warmth. The site's strategic posture is: *we do not need to sell you; if you are the right buyer, you already know who we are.*

**The five defining moves:**

1. **Photography is the product.** 80–90% of every viewport is architectural photography. Text floats at edges and corners — sometimes a single project name, never marketing copy in a hero.
2. **System-as-noun, not benefit-as-noun.** Headlines are "Sliding," "Curved," "Pivoting," "Guillotine," "Invisible Frame," "Turnable Corner." No "transform your home" rhetoric.
3. **Specification-first when text appears.** When copy does exist, it leads with the engineering: 21 mm sight-lines, 20 m² panels, 250 kg per leaf, 22 mm connection thickness, 26 patents, 22 certifications.
4. **Archive voice.** Project pages are documented in past tense by photographer/architect — not promoted. The Journal posts events and reflections, not announcements.
5. **Gatekeeping as exclusivity signal.** All sales route through an audited partner network. Every prospective partner must visit Switzerland in person. Every installer attends a 3–5 day training at the Vitrocsa Learning Center. There is no "buy now," no "request a quote" — only "find a partner" and "request showroom visit."

**What FourlinQ can take from Vitrocsa:** the discipline of photography-led storytelling, the system-as-noun product naming, the past-tense archival project page, the partner-as-gatekeeper trust signal.

**What FourlinQ cannot take from Vitrocsa:** the price-tier signaling (Vitrocsa speaks to Lenny Kravitz and Olson Kundig; FourlinQ speaks to homeowners and developers); the system-sans-only typography (FourlinQ needs more warmth to feel Filipino-domestic, not Swiss-aloof); the refusal of motion (the FourlinQ site needs energy in hero video to demo product performance — typhoon resistance, sealing — which Vitrocsa never has to prove because nobody asks).

---

## 1. Brand & Strategic Posture

### 1.1 The Vitrocsa thesis

- **Founder narrative:** Eric Joray, watchmaking engineer, invented the minimalist window in 1992 in Saint-Aubin-Sauges, Switzerland (https://vitrocsa.com/history/).
- **Brand etymology:** "**Vi**tres **O**rchidées **C**onstructions **SA**" — French for windows + orchids + construction. The orchid reference is preserved in the parent legal entity *Orchidées Constructions SA*.
- **Heritage anchor:** "Swissmade" is repeated across the site. The headquarters in Yverdon-les-Bains is presented as a watchmaking-precision factory (https://vitrocsa.com/company/).
- **Authority statistics** (https://vitrocsa.com/company/):
  - 21,462 projects completed
  - 61 countries served
  - 22 certifications held
  - 26 patents filed (24 active — https://vitrocsa.com/certificates-and-patents/)
- **Quote anchor:** Leonardo da Vinci — *"Simplicity is the ultimate sophistication."* This is the company's stated philosophy. Founder Joray's own quote: *"Let people do their thing. Develop a passion for the product, a sense of collaboration and complete confidence."*

### 1.2 Voice & tone

- **Past tense, archival.** "*The Barcelona House by Ström Architects Features 6 High Invisible Frame Sliding Windows.*" The project is documented, not advertised.
- **Engineer-first.** When a system is described, the lede is mechanical: *"a feet of engineering which combines flexibility, simplicity and quality"* (Invisible Frame page — note also that the typo "feet" → "feat" remains uncorrected, suggesting the company tolerates the imperfection of a non-native-English writer over polishing into marketing tone).
- **No superlatives in headlines.** The hero "Vitrocsa: Inventors Of The Minimalist Window" is a statement of historical fact, not a claim of superiority.
- **No emoji, no exclamation, no second person.** The site never says "you" in product descriptions. It says "the system" or "the architect" or "the project."

### 1.3 What Vitrocsa never says

- No "luxury"
- No "premium"
- No "best in class"
- No "leading manufacturer" (they do say "World Leader In Minimalist Windows" — once, on Company)
- No "transform"
- No "your home"
- No pricing language
- No "starting from"
- No "free quote"
- No urgency language (no "limited," "exclusive offer," "now")

---

## 2. Information Architecture & Sitemap

### 2.1 Top-level navigation

Sourced from rendered DOM (https://vitrocsa.com):

```
Systems        → /systems-landing/
Projects       → /projects/
Company        → /company/
Resources      → (dropdown — no landing page)
Contact        → /contact/
Find a Partner → /partners/
```

Six items. No "Blog," no "Products," no "Shop." "Find a Partner" is given equal weight to the primary categories — a deliberate signal that this is a route-to-purchase company, not a direct-sale company.

### 2.2 Full sitemap

```
/                                          Home
├─ /systems-landing/                       Systems index
│   ├─ /systems/sliding/                   Sliding (the original)
│   ├─ /systems/curved/                    Curved (min 3m radius)
│   ├─ /systems/invisible-frame/           Invisible Frame (concealed under floor)
│   ├─ /systems/pivoting/                  Pivoting (up to 12 m² per panel)
│   ├─ /systems/guillotine/                Guillotine (up to 1000 kg per panel)
│   └─ /systems/turnable-corner/           Turnable Corner (no corner post)
├─ /projects/                              Projects index (filterable)
│   └─ /projects/<slug>/                   Individual project page
│       e.g. /projects/barcelona-house/
├─ /company/                               Company overview
│   ├─ /history/                           Timeline 1989–2025
│   ├─ /news/                              Journal (chronological feed)
│   ├─ /company/vitrocsa-in-the-press/     Press
│   ├─ /company/partner-programme/         Partner application
│   └─ /company/visit-our-showroom/        Showroom booking
├─ Resources (no landing — dropdown only)
│   ├─ /document-library/                  Gated technical PDFs
│   ├─ /certificates-and-patents/          Compliance + IP
│   └─ /faq/                               FAQ accordion
├─ /contact/                               Headquarters contact
└─ /partners/                              Find a Partner (map + filter)
```

### 2.3 Hierarchy commentary

- **Systems is the spine.** The Systems mega-menu surfaces all six product lines from anywhere on the site. There is no "Products" parent — only "Systems." This vocabulary is consistent with how architects spec: in systems, not products.
- **No "Solutions" abstraction.** Many B2B sites add a /solutions/ layer (Residential / Commercial / Hospitality). Vitrocsa rejects this — the only place this taxonomy appears is as a filter on /projects/.
- **Resources is dropdown-only.** No `/resources/` landing page exists. The category exists structurally but has no editorial face. This is the right answer for a "library, not a marketing channel" stance.
- **Company is deep.** Five sub-pages (History, Journal, Press, Partner Programme, Showroom). The brand spends real estate on heritage and gatekeeping more than on product marketing.
- **No /careers/, no /sustainability/, no /investor-relations/.** These familiar enterprise sub-trees are absent. The site is editorially focused on architects + partners.

### 2.4 Language switcher

Top-right of header: **EN | FR | DE | ES** (https://vitrocsa.com)

- Four languages only — not the 15–20 a Schüco-tier B2B serves.
- The four chosen reflect the brand's core architect markets: French (Switzerland + France), German (Switzerland + Germany + Austria), Spanish (Spain + Latin America), English (everywhere else).
- No locale-specific URL prefixes observed at root (URLs are flat `/projects/...`). Language is set via a query parameter or session cookie rather than a folder structure. This is more like Sky-Frame's behavior than Marvin's.
- No country switcher distinct from language switcher. Partner discovery happens via the map on `/partners/`, not via a US/UK/AU front door.

### 2.5 Footer

The footer maintains the same three-column logic across the site (https://vitrocsa.com):

| Left column | Center column | Right column |
| --- | --- | --- |
| Systems (with full system submenu) | Journal | Resources (Document Library, Certificates, FAQ) |
| Projects | Press | Find a Partner |
|  | Contact |  |

Below the columns: address (Rue Mileva-Einstein-Marić 1, 1400 Yverdon-les-Bains), phone (+41 24 436 22 02), Cloudflare-obfuscated email, and a row of social icons (LinkedIn, Instagram, Facebook, YouTube, Pinterest).

Observations:

- **No "Newsletter" CTA in the footer.** Newsletter signup is a single section inside the page body, not a permanent footer block.
- **No legal mega-stack.** No long row of Privacy/Terms/Imprint/Cookies/Accessibility links. Just the essentials.
- **No "site by" credit.** The cookie banner reveals the tool is **Darwin Digital v1.3.0** (https://vitrocsa.com) — but the site itself does not credit an agency.
- **Footer feels like the brand:** dense, restrained, single-line. No oversized brand promise.

### 2.6 Breadcrumbs

Breadcrumbs are absent from the rendered DOM on top-level pages and on system pages. The implicit navigation is the header mega-menu plus the page-internal section anchors. For a six-product company this is defensible — the user can hold the entire IA in their head.

---

## 3. Design System

### 3.1 Color palette

Extending the YAML in `references/design-systems/vitrocsa.md`:

| Token | Hex | Use |
| --- | --- | --- |
| `ink-display` | `#10182F` | Display headlines; reads as near-black at glance, holds slight navy tint |
| `ink-body` | `#32373C` | Body text (deep gunmetal) |
| `ink-secondary` | `#484848` | Captions, secondary labels |
| `navy-accent` | `#10182F` | Identical to display ink — accent and headline share a token, by design |
| `blue-accent` | `#3971DD` | Hyperlinks, interactive emphasis (used sparingly) |
| `blue-deep` | `#2D5EBD` | Hover state for blue accent |
| `canvas-white` | `#FFFFFF` | Background (full white, never off-white or cream) |
| `gold-cta` | inferred | Referenced via `arrow-right-gold.svg` asset on https://vitrocsa.com — the only warm color in the system, used **only** in arrow icons for CTAs in dark-background sections |

**The gold arrow is the most under-the-radar accent on the site.** It only appears on dark-background hero overlays where the white text needs a directional indicator. On white-background sections, CTAs use a navy or blue arrow. The gold is small, mostly off the viewport, and never colors text — only the arrow glyph.

**The palette has zero greys outside of black-tinted variants.** No `#F5F5F5`, no `#E0E0E0`. Cards do not exist as elevated objects; they are photographs.

### 3.2 Typography

Vitrocsa uses what reads as a system sans stack — likely Helvetica Neue (Apple stack) on macOS, Inter / Arial fallbacks elsewhere. The rendered DOM does not declare a webfont via `<link rel="stylesheet" href="fonts.googleapis.com/...">` in the inspected source.

| Role | Size | Weight | Notes |
| --- | --- | --- | --- |
| H1 display | ~40–48 px | 400 (Regular) | Title case; sometimes Sentence case |
| H2 section | ~28–32 px | 400 | Tight letter-spacing |
| H3 sub | ~20–22 px | 500 | Used on system feature callouts |
| Lede | 18 px | 400 | One paragraph maximum |
| Body | 16 px | 400 | Line-height ~1.5 |
| Caption | 13–14 px | 400 | Used on photo credits, dates, certifications |
| Nav | 14 px | 400 | UPPERCASE not used; standard case |

Defining typographic moves:

- **No weight contrast.** The site uses Regular for almost everything. There is no Bold display. Emphasis comes from size, not weight.
- **No serif.** Anywhere. Even in Journal posts.
- **Sentence case in headlines.** "Inventors Of The Minimalist Window" is the rare title-case headline (homepage hero); most page heads are sentence case ("Custom Minimalist Sliding Windows and Glass Doors").
- **No display oversize.** The largest text on the site is ~48 px. The site never goes to 80 px or 120 px display sizes that Sky-Frame and Marvin reach.
- **Tracking and leading are conservative.** No "spread" letter-spacing that says luxury via wide tracking; no tight tracking that says editorial.

### 3.3 Spacing rhythm

- **Section padding:** vertical padding on top-level sections often exceeds 120 px and can reach 200 px between sections on the homepage.
- **Container max-width:** content blocks cap at ~1280 px. Photography goes full-bleed (100vw).
- **Vertical rhythm:** 8 px base grid; common increments at 16 / 24 / 32 / 48 / 64 / 96 / 128 / 192 px.
- **Whitespace as a luxury signal:** A homepage section like "Why Vitrocsa" has three short feature blocks separated by ~80 px of vertical white space between each, vs. the typical 24–32 px on a mass-market B2B site.

### 3.4 Grids & layout primitives

- **12-column desktop grid** with consistent 24 px gutters (inferred from card alignment).
- **Two-up, three-up, four-up sections.** Most index pages collapse to a 3-column grid at desktop, 2 at tablet, 1 at mobile.
- **No asymmetry tricks.** No editorial off-grid composition; no overlapping cards; no diagonal lines.

### 3.5 Logo & marque

- **Logotype only.** No mark or symbol — just "vitrocsa" set in a custom sans, lowercase.
- The wordmark inverts: dark navy on white backgrounds, white on dark photography backgrounds (assets observed: `logo-white.svg`, `logo-short-white.svg`).
- A "short" logo variant (`logo-short-white.svg`) is referenced — likely a stacked or compact mark used in tight header contexts.

### 3.6 Buttons & links

- **Primary CTA pattern:** "[Label] [→ arrow]". The arrow is an SVG glyph, often gold on dark, navy on white.
- **No filled rectangular buttons.** Vitrocsa avoids the conventional "Primary Button" pattern. The CTA is a text-with-arrow rather than a button.
- **Rounded radius: 0.** Every corner that does appear (form inputs, partner cards) is sharp.
- **Hover state: color-shift only.** Hover does not move the element, does not add shadow, does not scale.
- **Link underline:** appears on hover for body links, never persistent.

### 3.7 Iconography

- **No decorative icon system.** No 24-px outlined glyph set for features.
- **Where icons appear** (system feature callouts on `/systems/sliding/` and `/systems/pivoting/`), they are **technical diagrams** — line drawings of the cross-section, the pivot mechanism, the floor channel. Engineering iconography, not lifestyle iconography.
- **Arrows are the one universal icon** (`big-arrow-white.svg`, `arrow-right-gold.svg`).

### 3.8 Imagery & photography

- **All architectural, all commissioned.** No stock photography. Every project image is by a named photographer (Helena Lee for Barcelona House, https://vitrocsa.com/projects/barcelona-house/).
- **Aspect ratios skew landscape.** 16:9 and 3:2 dominate. Portrait orientations appear only in mosaic sections.
- **Color grading:** muted, low-saturation, with cool shadows. No warm-orange sunset processing.
- **Human presence:** rare. Most images are of empty architecture. When humans appear, they are scale figures — never the subject.
- **No before/after sliders.** No "see the difference" comparative imagery.

### 3.9 Elevation & depth

Reaffirming the reference doc: **none.** No `box-shadow` in the system. Cards are not raised. Hover does not raise. Modals do not have a backdrop blur in the conventional way. This is exceptional for a 2026 luxury B2B site — Sky-Frame, Marvin, Schüco all use elevation tokens.

### 3.10 Shape & corners

- **Zero border-radius.** Everywhere. Form fields are square. Photo crops are rectangular. Buttons are sharp.
- **Single hairline rules.** Section dividers, when they appear, are 1 px solid (likely `#E5E5E5` or a similar near-white grey). Used sparingly.

---

## 4. Animation & Interaction

### 4.1 Top-line philosophy

Vitrocsa's motion design is the most restrained of any window brand surveyed. The thesis: *if the product is the absence of motion (a frame disappears, a corner has no post), the website should not boast through motion either.*

### 4.2 What IS animated

- **Hero photography:** the homepage hero is a still photograph, not a video. (https://vitrocsa.com) — contrast Sky-Frame and Schüco, which auto-play hero video.
- **Embedded project video:** some system pages and project pages include a video play button overlay on a hero image (e.g., Green Golf project on `/systems/sliding/`; Bourg St-Maurice hero on `/systems/invisible-frame/`). Video is opt-in, not auto-play.
- **Mega menu reveal:** the Systems mega menu fades down on hover (~150 ms). No bounce, no slide.
- **Nav scroll behavior:** the top nav is sticky and slightly compresses (logo shrinks, padding reduces) after ~200 px of scroll.
- **Image lazy-load fade:** project grid thumbnails fade in as they enter the viewport (likely a 200–300 ms opacity transition).

### 4.3 What is NOT animated

- No parallax on hero photography.
- No scroll-triggered text reveals (fade-up, slide-from-left).
- No counter animations on the statistics (the "21,462 projects" doesn't tick up from 0).
- No marquee, no infinite scroll, no auto-rotating testimonial.
- No "scroll to explore" indicator below the fold.
- No 3D background, no canvas effects, no WebGL.
- No cursor follower, no custom cursor.
- No page transitions between routes — it's a standard server-rendered page navigation, not a SPA with morph.

### 4.4 Hover micro-interactions

- **Nav links:** color shift from `#10182F` to `#3971DD` over ~120 ms ease-out.
- **Project cards:** the thumbnail title may underline, or the entire card opacity may dip to 0.85 — there is no zoom on the image (contrast Sky-Frame, which scales the image 1.05 on hover).
- **Footer links:** identical color-shift, no underline animation, no slide.
- **Buttons / CTA arrows:** the arrow may shift right by 4–8 px on hover. This is the most "kinetic" animation on the entire site.

### 4.5 Easing curves

Inferred from the observed transitions:

- **Default easing:** likely `ease-out` (a CSS keyword) or `cubic-bezier(0.25, 0.1, 0.25, 1)`. Standard browser default; nothing custom.
- **Duration spectrum:** 120 ms for color hover, 150–200 ms for menu, 250–300 ms for image fade-in.
- **No motion library** detected. No GSAP, no Lenis, no Locomotive Scroll, no AOS. The motion is implemented in plain CSS transitions.

### 4.6 Mobile interaction

- **Hamburger menu.** The mega menu collapses into a hamburger drawer at ≤768 px.
- **Drawer animation:** slides in from the right.
- **No bottom nav, no FAB.** No fixed action button.
- **Tap states:** the site relies on default :active rather than custom ripple.

### 4.7 Forms & inputs

- **Contact form** (https://vitrocsa.com/contact/) is long-form: First Name, Last Name, Email, Phone, Company Name, Request Type (Document Request / Marketing Request / Showroom Visit / Partner Request / Other), Subject, Message (max 512 words), Company Country HQ, Countries operated in, Company Established (2015–2026 dropdown), Years of Window Experience, two file uploads (JPG/PDF/PNG/DOC, max 20 MB each), Newsletter opt-in, Terms acceptance.
- **Validation:** inferred client-side required-field markers. No live validation animations.
- **Submit feedback:** no loading spinner observed; the site likely refreshes to a thank-you state.

### 4.8 The cookie banner

- "We use cookies to ensure the proper functioning of the site"
- Options: Configure / Accept All
- Branded as **Darwin Digital v1.3.0** in the page source

No friction-creating wall, no "we use 187 trackers" granular UI as on many EU enterprise sites. Two clicks.

---

## 5. UX Flow — How Vitrocsa Routes Visitors

### 5.1 The architect-specifier flow

The architect arrives knowing the brand. They want: (a) which system fits this project, (b) is there a local partner, (c) what is the spec sheet, (d) can I see a precedent.

Vitrocsa accommodates each:

1. **System mega-menu → /systems/<name>/** with technical specs in a comparison table.
2. **Find a Partner → /partners/** with a country filter.
3. **Document Library → /document-library/** — gated form for the spec PDF and datasheet.
4. **Projects → /projects/** filterable by system, country, and project type (Residential / Commercial / Hospitality / Public).

The total click-depth from homepage to "I have the V56 datasheet downloaded and a Manila partner's phone number" is ~3 clicks.

### 5.2 The ultra-premium homeowner flow

The homeowner is an end client, often referred by an architect. They want: (a) is this real, (b) what does it cost, (c) what do my friends think of it.

Vitrocsa **refuses to answer (b)**. There is no pricing language anywhere, not even "starting from." The site routes the homeowner toward:

1. **Projects gallery** — to validate "is this real" via the architects (Olson Kundig, BIG, Studio MK27, Isay Weinfeld).
2. **Company / History page** — to validate the founder narrative.
3. **Find a Partner** — to start a local conversation, which is where pricing is finally addressed.

The implicit message: *if you have to ask the price, you should ask the partner, not the website.*

### 5.3 The partner / dealer flow

A would-be Vitrocsa partner reaches `/company/partner-programme/`. The page presents:

- **Eligibility:** "companies specializing in façades, window installation, joinery, or metal construction" with "demonstrated expertise in high-precision architectural work."
- **Mandatory headquarters visit:** before any collaboration, the prospective partner must travel to Switzerland to meet management.
- **3–5 day training** at the Vitrocsa Learning Center; certificate awarded.
- **Marketing kit** provided post-certification: brochures, professional photography, official logos.
- **Application form:** company details, country footprint, industry experience, completed-project PDF/JPEG samples (max 20 MB), written rationale.

This is one of the strongest single moves on the site for FourlinQ to study. It does three things at once:

1. **Filters non-serious applicants** by requiring real travel and time investment.
2. **Signals to homeowners and architects** that every Vitrocsa installation is by a trained, certified installer — reducing the buyer's risk of botched installation.
3. **Creates a flywheel of credentialed partners** who, by virtue of investing 3–5 days plus a Swiss flight, are committed enough to evangelize the brand locally.

### 5.4 The press / media flow

`/company/vitrocsa-in-the-press/` is a grid of press thumbnails with publication name, headline, language. It includes:

- **Architecture press:** Architectural Record, Detail, Wallpaper, Dwell, Metropolis, RIBA Journal.
- **Luxury / lifestyle:** Vogue UK, Elle, Elle Decoration, AD Magazine, Veranda, Luxe Interiors + Design.
- **International:** Habitus Living (AU), Espaces Contemporains, Werk Bauen + Wohnen, Artravel.

The press page has a **language filter**. No press releases authored by Vitrocsa appear — every item is earned media.

### 5.5 The showroom visit flow

`/company/visit-our-showroom/` is a small page with:

- The Yverdon-les-Bains address.
- A short paragraph: *"a meeting point for architecture, innovation and Swiss expertise."*
- A booking form: first name, last name, email, reason for visit.
- A note: *"those seeking partner showroom visits should use the separate partner locator instead"* — re-routing the casual visitor.

There are no posted hours. No "book a 30-min slot" calendar. The implied protocol is: *we will reply to confirm a time*.

### 5.6 Document Library — the gated path

`/document-library/` is gated. To download any datasheet, the visitor fills a form (name, email, company, message) and submits a request. The library serves PDFs in EN / FR / DE / ES.

This gating is significant: **Vitrocsa knows every architect who downloads a V56 datasheet.** That list is the leadsource for sales follow-up via the local partner network.

### 5.7 The newsletter

Homepage and most pages end with a newsletter signup. Field: email only. Copy is minimal — typically a single line. No "join 50,000 architects" social proof, no incentive ("get the new project gallery PDF"), just a quiet invitation.

---

## 6. Content Patterns

### 6.1 Hero formula

**Homepage hero** (https://vitrocsa.com):

- Single full-bleed architectural photograph.
- Headline overlay: "Vitrocsa: Inventors Of The Minimalist Window" (or, in current rotation, a project title).
- Sub-tagline: "The Vitrocsa Sliding window system enables architecture to embrace its..." (truncated; full version on `/systems/sliding/`).
- Two CTAs: "Latest Projects" and "Contact Us."
- The CTAs are text-with-arrow, not filled buttons.

**System page hero** (https://vitrocsa.com/systems/sliding/, etc.):

- Full-bleed project photograph.
- Headline: "Custom Minimalist Sliding Windows and Glass Doors" — pure category language plus "custom" + "minimalist."
- No CTA in the hero — the user scrolls.

**Project page hero** (https://vitrocsa.com/projects/barcelona-house/):

- Single hero image of the villa.
- Project title.
- Architect attribution.
- Vitrocsa systems used.
- Location.
- Photographer credit (this is unusual and brand-defining — most B2B sites do not credit project photographers).

### 6.2 Section formula on a system page

Sourced from `/systems/sliding/`, `/systems/invisible-frame/`, `/systems/pivoting/`, `/systems/curved/`, `/systems/guillotine/`, `/systems/turnable-corner/`:

1. **Hero** — full-bleed photograph, project location captioned subtly.
2. **Key Features** — four illustrated callouts. Each has a small line-drawing icon, a one-line title, and a 1–2 sentence description.
   - Example (Sliding): Invisible Frame / Window Panels Pocket / Open Angle / Mosquito Net.
   - Example (Pivoting): Spectacular Scale / Minimalist Aesthetics / Indoor-Outdoor Unity / Precision Pivot Hardware.
3. **Range** — three to four product variants per system (V56, TH+, V32, 3001).
4. **Comparison table** — interactive table with the variant as columns and specs as rows (Connection Thickness, Max Panel Size, Glass Thickness, Weight, Lock Mechanism, Finishes).
5. **Featured projects** — 2–4 thumbnails linking to project pages.
6. **Resources for professionals** — link cluster: Technical Brochure (PDF), 3D Model, Document Library, Datasheets.
7. **Newsletter signup**.
8. **Footer**.

### 6.3 The comparison table

The spec table is the most data-dense element on the site, and the site treats it with intent. Variants are tabbed; selecting a tab swaps the spec values. The headers are short (e.g., "Connection," not "Connection Thickness in mm"). The unit (mm, m², kg) is on the value, not the header.

For each system, the table communicates: *here is exactly how it differs by range, and here is the spec you will need to spec it.*

### 6.4 The project page formula

Sourced from `/projects/barcelona-house/`:

| Element | Treatment |
| --- | --- |
| Hero image | Single landscape photograph of the building |
| Title | Project name (e.g., "Barcelona House") |
| Architect | "Ström Architects" |
| Installation partner | "E. Plantalech" |
| Location | "Barcelona, Spain (Coastal region)" |
| Photographer | "Helena Lee" |
| Vitrocsa systems | "Sliding; Invisible Frame" |
| Body copy | 2–3 sentences in past tense, factual |
| Gallery | 5 high-res images, each captioned with the same project-systems summary |
| Similar projects | 6 thumbnail cards of related installations |
| System showcase | Grid of all six systems with nav links |

There is no client testimonial. There is no "challenge / solution / result" framing. The architect is the named author; Vitrocsa is the engineering supplier.

### 6.5 The history page formula

`/history/` is a vertical timeline from 1989 to 2025 with alternating left-right composition:

| Year | Milestone (verbatim) |
| --- | --- |
| 1989 | Orchidées Constructions SA established; 800+ traditional conservatories built |
| 1992 | Vitrocsa minimalist window invented |
| 1993 | Launch of Vitrocsa 1001 & 2001; first villa installation near Geneva |
| 1994 | Trademark registered; first patent filed for sliding system |
| 1996 | Vitrocsa 3001 designed with architect Andrea Bassi |
| 2002 | Guillotine system developed; European market entry via Braga Stadium |
| 2007 | TH+ range launched for insulation |
| 2010 | Swimms range developed for hot climates |
| 2011 | Invisible frame system developed |
| 2012 | Turnable Corner & Curved systems patented |
| 2014 | Architizer A+Awards won; V32 launched |
| 2015 | Leadership transition; management buyout |
| 2016 | Building ownership acquired; ~500 global partners |
| 2017 | V56 launched |
| 2018 | Swiss Label certification |
| 2021 | Insulated invisible frame wins three Architizer prizes |
| 2022 | 30th anniversary; motorized Turnable Corner developed |
| 2024 | New headquarters construction begins |
| 2025 | Relocation to new headquarters completed |

Each entry includes an archival photograph (a building, a sketch, a magazine clipping, a portrait of Joray). The timeline is purely chronological with no "chapters" or "eras."

### 6.6 The Journal

`/news/` (https://vitrocsa.com/news/) is a card grid in reverse chronological order. Categories observed: **Uncategorized**, **Events**, **Focus**.

Recent headlines (verbatim):

- "Light, lighter, lightest – ArchDaily Monthly Topics" — 25.04.2026
- "Why choose the Vitrocsa Curved system?" — 27.03.2026
- "Swiss Label: a mark of excellence at Vitrocsa" — 27.03.2026
- "SwissBau 2026" — 16.12.2025
- "Andrea Pelati x Vitrocsa" — 16.12.2025
- "A New Chapter for Vitrocsa" — 26.11.2025

Posts mix product-focus articles, event announcements, partnership notes, and brand milestones. Categories are loose (one is literally "Uncategorized") — the brand prefers chronology to taxonomy.

### 6.7 FAQ

`/faq/` is an accordion with two categories:

**Most Asked:**
- Where can I buy Vitrocsa windows?
- Where are Vitrocsa systems manufactured?
- Is Vitrocsa a new system?
- What Vitrocsa glazing systems cost?
- Who can install Vitrocsa?
- What is the manufacturing lead time?
- Which products are available?

**Product FAQs:**
- What about thermal efficiency?
- Are Vitrocsa systems tested?
- Do you have different product range for each system?
- What are the size limitation for your systems?
- What type of glazing is available?
- When is the 3001 profile used and when should the TH+ profile be used?
- Which finishes are available?
- Can Vitrocsa frames be completely hidden within a wall?
- Are Vitrocsa systems waterproof?

Notable: **the cost question is addressed.** Vitrocsa includes "What Vitrocsa glazing systems cost?" as a Most-Asked. The answer (not extracted here) almost certainly routes to "consult your local partner for a quotation" — a classic move to address the question without answering it.

### 6.8 Certificates and Patents

`/certificates-and-patents/` is split into two sections.

**Certificates** — downloadable PDFs per product line:
- 3001 (4 documents: break-in resistance, vertical load, air/water permeability, opening/closing durability)
- SWIMMS Mono
- TH+ (standard, fixed, guillotine, invisible frame, minergie, pivoting variants)
- TH+ Invisible Frame (two documents)
- V32 and V56

Test categories: air/water permeability, wind resistance, thermal insulation, acoustic performance (36 dB), burglar resistance (RC2), repeated use durability. Dates updated through December 2025.

**Patents** — 24 active patents, PCT and national registrations from 1994 onward.

This page is one of the most powerful trust pages on the site. It says: *we are not asking you to trust our claims; here are the tested documents and the patent numbers.*

---

## 7. Photography Strategy

### 7.1 The 90% rule

Across the site, photography occupies 80–90% of every viewport. This is the brand's principal storytelling device.

### 7.2 Photographer credit

Project pages credit photographers by name (e.g., Helena Lee on Barcelona House). This is unusual: most B2B sites strip photographer credits to keep the visual focus on the brand. Vitrocsa keeps them — partly out of editorial respect, partly because it signals that the photography is editorial-quality, commissioned, and reciprocates the architect's likely use of the imagery in their own portfolio.

### 7.3 Architectural recognition

The site treats the architect as the named author. Architects featured include:

- Andrea Bassi (the original 1996 collaborator)
- Olson Kundig
- BIG / Bjarke Ingels Group
- Studio MK27 (Marcio Kogan)
- Isay Weinfeld
- Pitsou Kedem Architects
- Studio Johnston
- Killa Design
- X Architects
- Walker Warner Architects
- Ralph Germann Architectes
- Andrea Pelati Architecte
- Nicolas Dahan
- Ström Architects

These are not all star-architects but they cover the spectrum from globally famous (BIG, MK27) to regionally distinguished (Pelati, Germann). The mix communicates that Vitrocsa is specifiable at multiple tiers of architect, not just Pritzker laureates.

### 7.4 What the photography never shows

- No installation in progress.
- No factory floor (except in the Company page and History timeline, where one image of the Swiss HQ appears).
- No close-up product macros (the brand is *frames disappearing*, so a close-up of a frame would be off-brand).
- No people-as-subject (no homeowner family photos, no architect-in-hard-hat).
- No diagrammatic illustrations *in the project pages* — diagrams stay on the system pages.

---

## 8. Cross-page Comparison Table

How Vitrocsa diverges from typical luxury B2B window patterns:

| Pattern | Typical luxury B2B | Vitrocsa |
| --- | --- | --- |
| Hero | Auto-play video | Still photograph |
| Primary CTA | "Get a Quote" / "Configure" | "Find a Partner" |
| Pricing | "Starting from" or "Request pricing" | Not addressed on-site |
| Product page name | "Series 7000" or "Heritage Casement" | "Sliding," "Pivoting" — pure category |
| Comparison tables | Hidden in datasheets | Visible on system pages |
| Project pages | Marketing case studies | Archival, photographer-credited |
| About page | "Our mission" + brand promise | History timeline + founder narrative |
| Press | None or self-authored releases | Earned-media grid with international press |
| Partner network | "Authorized dealer" | "Approved partner" requiring Swiss visit + 3–5 day training |
| Animation | Scroll-jacking, parallax, AOS | Color-shift hover only |
| Typography | Custom serif + sans pairing | System sans only |
| Color | Brand color in CTAs | Near-monochrome navy + gold arrow |
| Border radius | 4–8 px | 0 |
| Shadows | Multi-level elevation | None |

---

## 9. How Vitrocsa signals exclusivity *without* being inaccessible

This is one of the brief's central questions. Vitrocsa's answer:

1. **Information is freely available, but transactional friction is high.** Specs, certificates, project galleries, partner map — all visible without a login. But to buy or commission, you must go through a local partner.
2. **No paywalls on the public site.** The only gating is the Document Library form for PDFs — and even that asks for email, not a credit card.
3. **The exclusivity is in the supply chain, not the website.** A partner cannot sell Vitrocsa without flying to Switzerland and completing training. Architects know this; that's the signal.
4. **Project credits route attention upward, not inward.** By crediting BIG, MK27, Olson Kundig, the site borrows credibility instead of asserting it.
5. **Heritage statistics rather than superlatives.** "21,462 projects, 61 countries, 22 certifications, 26 patents" is exclusionary specificity. A copywriter would have written "thousands of projects worldwide." Vitrocsa counted them.
6. **No "luxury" word.** The site never describes itself as luxury. The omission is the signal.

---

## 10. The Six Systems — Detailed Spec Notes

### 10.1 Sliding (https://vitrocsa.com/systems/sliding/)

- **Tagline:** "Custom Minimalist Sliding Windows and Glass Doors"
- **Description:** "By virtually erasing the boundary between inside and outside, the Vitrocsa Sliding window system enables architecture to embrace its surroundings."
- **Ranges & specs:**

| Range | Connection | Max Panel | Glass |
| --- | --- | --- | --- |
| V56 | 24.8 mm | < 20 m² | 56 mm |
| TH+ | 22 mm | < 20 m² | 32–44 mm |
| V32 | 24 mm | up to 12 m² | 32 mm |
| 3001 | 18 mm | up to 6 m² | 12–26 mm |

- **Key features:** Invisible Frame, Window Panels Pocket, Open Angle, Mosquito Net (integrated or folding canvas to 80 cm).
- **Hero project:** AZ House, Lebanon.

### 10.2 Invisible Frame (https://vitrocsa.com/systems/invisible-frame/)

- **Tagline:** "Custom Frameless Windows and Glass Doors"
- **Description:** "removes the barrier between indoors and outdoors" through "a feet [sic, *feat*] of engineering which combines flexibility, simplicity and quality."
- **Configurations:** single-track or multi-track; compatible with V56, TH+, V32.
- **Key features:** Unobstructed Sightlines, Flush Floor Integration, Weather-Sealed, Single- or Multi-track.
- **Hero project:** Bourg St-Maurice (video opt-in overlay).
- **Featured:** Château Troplong Mondot, Barcelona House.

### 10.3 Turnable Corner (https://vitrocsa.com/systems/turnable-corner/)

- **Tagline:** "Custom Turnable Corner Windows"
- **The hero feature:** elimination of the structural corner post via a roller mechanism that lets panels slide to the corner and rotate 90° out of the opening.
- **Specs:** Connection 22 mm; Up to 6 m² per panel; Glass 32–44 mm; **250 kg per panel** weight capacity.
- **Finishes:** standard anodized aluminum or powder-coated.
- **Featured:** PK House (Calatagan, Philippines — 8×8 Design Studio Co.); Maison CL (Cévennes); Crescent House (Sydney).

### 10.4 Guillotine (https://vitrocsa.com/systems/guillotine/)

- **Tagline:** "Custom Large Vertically Sliding Windows"
- **Mechanism:** vertical slide via counterweight or motorization; panels glide upward or downward.
- **Ranges:**

| Range | Notes |
| --- | --- |
| V56 | Highest thermal; up to **1000 kg per panel** |
| TH+ | Thermal insulation; up to 500 kg per panel |
| 3001 | Hot climate; up to 180 kg per panel |

- **Featured:** Grand Park Hotel Rovinj (nine vertical sliders); Blossom Hill Chalet Courchevel.

### 10.5 Pivoting (https://vitrocsa.com/systems/pivoting/)

- **Tagline:** "Custom Large Pivoting Windows and Glass Doors"
- **Description:** "redefines the possibilities for vertical openings, offering a dramatic alternative to traditional hinged doors or windows."
- **Ranges:** V56 (up to 12 m² panels), TH+ (up to 12 m²), 3001 (up to 3 m²).
- **Featured:** Shindagha Welcome Pavilion (Dubai, X Architects); Aubrey Road (London); Framed House (Sydney); Daddy Cool (Sydney).

### 10.6 Curved (https://vitrocsa.com/systems/curved/)

- **Tagline:** "Custom Minimalist Curved Windows"
- **Mechanism:** custom-curved glass panels; sliding radius down to 3 m; fixed panels down to 1.5 m radius.
- **Profile:** narrow despite the curve.
- **Options:** motorized integrated drive; TH+ thermal break.
- **Featured:** Flagship Dior Seoul; Piaget VIP Rooms.

### 10.7 Spec-naming pattern

Across systems, the range names (V32, V56, TH+, 3001, Swimms) are engineering codes, not marketing nouns. There is no "Heritage" range, no "Architect Series," no "Professional Edition." V56 is V56 because it accepts 56 mm glass; 3001 is the third-generation 2001 system; TH+ is "thermally broken plus."

This naming protects the brand from the dilution that comes with marketing-driven product naming.

---

## 11. The Partner Network as Product

This is worth its own section because it is the strongest UX-level brand asset Vitrocsa owns, and the one most directly transferable to FourlinQ.

### 11.1 Geographic footprint (https://vitrocsa.com/partners/)

40+ countries, including: New Zealand, United Kingdom, Denmark, Belgium, Switzerland, Peru, Chile, Sweden, Canada, Mexico, United States, Norway, UAE, China, Hong Kong, Taiwan, Netherlands, Brazil, South Africa, Austria, Croatia, Germany, Israel, Italy, Korea, Spain, Singapore, Russia, Bulgaria, Luxembourg, Thailand, India, **Philippines**, Hungary, Greece, France, Monaco, Australia, Bali / Indonesia, Saudi Arabia, Oman, Jordan, Turkmenistan, Turkey, Cyprus, Bahrain, Qatar, Kuwait, Lebanon.

The Philippines listing is relevant — Vitrocsa has a Manila-area partner, and the PK House project (Calatagan) is a featured Vitrocsa-installed villa. This means Vitrocsa is FourlinQ's *aspirational ceiling* in the Philippine market, not an unobserved foreign brand.

### 11.2 Map interaction

The partner discovery uses an interactive map with country pins, plus a dropdown country filter and a "showroom: yes/no" toggle. Two-finger zoom. Reset button.

Each partner card shows contact details, website, service area. No partner photography on the index — these are partner *records*, not partner *features*.

### 11.3 The "approved" framing

The intro copy: *"Only approved Vitrocsa partners are permitted to sell and install a Vitrocsa minimalist window. With their skills and technical expertise, each partner guarantees the authenticity of each window and ensure that you make the right choice that will last a lifetime."*

Four words doing the work: **approved, permitted, authenticity, lifetime.** The first two are exclusion. The last two are warranty. Together they say: *if you bought it from us, it was through a person we audited, and we will stand behind it.*

---

## 12. Mobile Behavior

Per the reference doc and DOM inspection:

- **Mobile is more restrained, not denser.** Sections collapse to a single full-bleed image plus a single caption rather than reflowing a desktop grid into dense rows.
- **The hamburger drawer** holds the full mega menu in expanded vertical form.
- **Photography is preserved at full bleed**; the site does not crop architectural images to fit narrow viewports — they remain landscape and the user scrolls through them.
- **Forms reflow to single column** with native form controls.
- **Type ramp is gentler.** H1 drops from ~48 px to ~32 px; body stays at 16 px.
- **The footer collapses** into stacked sections in the order: Systems → Projects → Journal → Press → Contact → Resources → Find a Partner → Address block → Social row.

---

## 13. Performance & Tech Stack Observations

From `/tmp/vitrocsa_home.html` inspection and rendered behavior:

- **DOM is ~2,300 lines** of mostly server-rendered markup. The site is not a heavy SPA.
- **Vendor**: Cloudflare (the email obfuscation pattern `__cf_email__` is Cloudflare's email-protection).
- **CMS / build**: unclear, but cookie consent is by **Darwin Digital v1.3.0**.
- **Asset naming**: `logo-white.svg`, `logo-short-white.svg`, `big-arrow-white.svg`, `arrow-right-gold.svg` — descriptive, suggests a hand-managed asset library not a generated atlas.
- **No GSAP / Locomotive / Lenis / AOS** detected in the rendered HTML.
- **Google Analytics** dns-prefetched (`//www.google-analytics.com`).
- **Image lazy-loading** likely native (`loading="lazy"`) plus simple CSS opacity transition.
- **Page navigation is multi-page**, not SPA route-morph.

---

## 14. What FourlinQ Should Take from Vitrocsa

Concrete, actionable translations for the FourlinQ uPVC redesign — explicitly NOT copies, but principles informed by the audit.

### 14.1 Take (yes, adopt)

1. **Photography-led product pages.** Each FourlinQ product page should lead with a real Philippine installation photograph, not a stock render. The brochure-verified product set in `src/data/fourlinq-data.ts` should be paired with on-site project photography.
2. **System / product naming should be clear, not marketing.** Use the product code (FL Series, etc.) plus the architectural type (Casement, Sliding, Tilt-Turn). Avoid marketing nicknames.
3. **Past-tense, archival project pages.** Each FourlinQ-installed home should be documented with architect, location, date, and product used — not as a sales testimonial.
4. **Partner / dealer page with a real map and approved-partner framing.** Even at FourlinQ's price tier, the gatekeeping language of "approved dealer / certified installer" creates trust.
5. **Comparison table on each product page.** The Vitrocsa pattern of "variant as column, spec as row" is the right model for FourlinQ's profile-system comparisons (e.g., 60 mm vs 70 mm uPVC frames; different reinforcement options).
6. **A Certificates page** with downloadable test PDFs (water tightness, wind load, sound rating, etc.). For a uPVC manufacturer in a typhoon-prone country, this is critical.
7. **Heritage statistics, counted, not estimated.** "X buildings, Y provinces, Z homes installed" — exact integers, not "thousands."
8. **Earned-media press page** if/when local Philippine architecture press features FourlinQ projects.
9. **Document Library with email-gated downloads** of spec sheets — this builds the architect lead list.
10. **Restrained animation.** Lean on photography and typography rather than parallax tricks. Especially: avoid scroll-jacking.

### 14.2 Don't (where Vitrocsa is wrong for FourlinQ)

1. **Don't strip pricing language entirely.** FourlinQ's audience includes homeowners and contractors who *do* need a starting-from price; the Vitrocsa "ask the partner" stance assumes a tier of architect-mediated buying that the Philippine uPVC market does not yet have.
2. **Don't refuse hero video.** FourlinQ has a real product-performance story to tell (typhoon testing, water-tight sealing, sound reduction). Video shows these tests in a way Vitrocsa never needs to — because architectural restraint speaks for itself only when the audience already trusts the category.
3. **Don't refuse warmth.** Vitrocsa's near-monochrome navy + gold-arrow palette works for Swiss watchmaking. FourlinQ should adopt a warmer accent (perhaps a deep terracotta, copper, or warm-amber) that signals Filipino domesticity, not Swiss aloofness.
4. **Don't go system-sans-only.** Pair a quality sans with a calmer humanist serif for editorial moments. A serif gives FourlinQ permission to feel both engineered and homey.
5. **Don't refuse the second person.** Vitrocsa never says "you." FourlinQ should — its audience expects to be addressed.
6. **Don't gatekeep the showroom.** Vitrocsa can require a request form because Yverdon-les-Bains is not a casual visit. FourlinQ showrooms in Manila and provincial cities should welcome walk-ins with posted hours and a Google Maps pin.
7. **Don't omit BIM/CAD.** Vitrocsa's library is PDF-only. FourlinQ should host downloadable BIM (Revit families) and 2D CAD blocks — Philippine architects increasingly request these for project files.

### 14.3 Principles to internalize

- **Photography is 80–90% of the visual storytelling.** Plan your image budget accordingly. Hire one good architectural photographer per quarter rather than thirty stock images.
- **Whitespace = perceived quality.** Between sections, more is more.
- **Spec tables = trust at scale.** The architect / contractor will trust a table they can read in five seconds far more than a paragraph that took five minutes to write.
- **Heritage and patents are credibility primitives.** Even at the uPVC tier, the audience responds to "since [year]" and "[N] certifications."

---

## 15. URL Citations Index

For verification, the URLs visited during this audit:

- https://www.vitrocsa.com — homepage
- https://vitrocsa.com/systems-landing/ — systems index (inferred via menu)
- https://vitrocsa.com/systems/sliding/ — Sliding
- https://vitrocsa.com/systems/curved/ — Curved
- https://vitrocsa.com/systems/invisible-frame/ — Invisible Frame
- https://vitrocsa.com/systems/pivoting/ — Pivoting
- https://vitrocsa.com/systems/guillotine/ — Guillotine
- https://vitrocsa.com/systems/turnable-corner/ — Turnable Corner
- https://vitrocsa.com/projects/ — Projects index
- https://vitrocsa.com/projects/barcelona-house/ — example project page
- https://vitrocsa.com/company/ — Company overview
- https://vitrocsa.com/history/ — History timeline
- https://vitrocsa.com/news/ — Journal
- https://vitrocsa.com/company/vitrocsa-in-the-press/ — Press
- https://vitrocsa.com/company/partner-programme/ — Partner Programme
- https://vitrocsa.com/company/visit-our-showroom/ — Showroom
- https://vitrocsa.com/document-library/ — Document Library
- https://vitrocsa.com/certificates-and-patents/ — Certificates + Patents
- https://vitrocsa.com/faq/ — FAQ
- https://vitrocsa.com/contact/ — Contact
- https://vitrocsa.com/partners/ — Find a Partner

---

## 16. Closing Notes for the FourlinQ Team

Vitrocsa is the **pole star**, not the **map**. It tells FourlinQ what extreme architectural-luxury restraint looks like, but FourlinQ's site needs to sit at a different latitude:

- More warmth, more accessibility, more "you" language.
- More performance video (typhoon test, water seal, hurricane wind rating).
- More direct purchase-routing for homeowners and contractors who are not architect-mediated.
- More climate-specific content (the Philippines is a tropical, typhoon-prone, humid market — Vitrocsa's Saint-Aubin-Sauges Swiss content vocabulary doesn't translate).
- More transparent pricing tiers, even if just "starting from" ranges.

But everything Vitrocsa does about *photography supremacy, system-as-noun naming, archival project documentation, the certified-partner network as exclusivity signal, heritage statistics counted to the integer, and refusing the language of marketing in headlines* — those are the disciplines FourlinQ should adopt without dilution.

The single most important takeaway: **Vitrocsa wins by subtraction.** Every site element they have removed is a deliberate edit. FourlinQ's redesign should ask, at every section, what can be removed before asking what should be added.

---

## 17. Deep-Dive: The Systems Landing Page

The `/systems-landing/` page is the gateway to all six product lines and deserves its own walk-through, because the page is the architectural-spec equivalent of a homepage for the architect-specifier.

### 17.1 Hero copy (verbatim)

*"Discover our range of systems and let yourself be captivated by their timeless aesthetics combined with uncompromising functionality."*

Two observations:

- **"Timeless aesthetics combined with uncompromising functionality"** is the closest Vitrocsa gets to a brand-promise sentence. Note it is *aesthetics + functionality*, not *beauty + performance* and not *form + function* — the brand prefers Latinate, architectural words to lifestyle words.
- **"Let yourself be captivated"** is one of the few imperative-to-the-second-person phrases on the entire site. It surfaces at the entry point to the catalog where the user is committing to product exploration. The phrasing is gentle ("let yourself"), not sales ("discover the difference").

### 17.2 Card layout

Each of the six systems renders as a card with:

- A photograph of the system in real architectural application (not a render, not a CAD diagram).
- The system name as the headline.
- A short descriptive paragraph (2–3 sentences) anchored on the system's signature innovation.
- A click-through arrow.

The cards are arranged in a 2×3 or 3×2 grid depending on viewport. There is **no priority ordering** — the brand does not present "Sliding" as the flagship even though it is the original and the bestseller. Each system gets equal visual weight.

### 17.3 The deliberate parity of the six systems

This is a significant editorial decision. A typical B2B brand would lead with the best-seller and demote the niche products. Vitrocsa refuses to do this — Curved (an unusual system), Guillotine (visually dramatic but rarer in residential), and Turnable Corner (the most architectural showpiece) are all given the same visual treatment as Sliding.

The strategic reason: **architects who land on this page are likely spec'ing one specific system, not browsing.** Equal treatment makes the page useful as a six-way switching station rather than a sales funnel.

---

## 18. Deep-Dive: A Single Project Page

The Vitrocsa project page is a specific editorial form — closer to an architecture magazine spread than a B2B case study. Examined in detail via three projects:

### 18.1 PK House, Calatagan, Philippines (https://vitrocsa.com/projects/pk-house/)

- **Architect:** 8×8 Design Studio Co.
- **Installation partner:** Kenneth and Mock Designs
- **Photographer:** Ed Simon
- **Systems used:** Sliding, Pivoting (4 units), Turnable Corner (2 units), Fixed
- **Body copy:** describes the hillside site overlooking Balayan Bay, the three-level pyramid-inspired structure, and that "nearly all Vitrocsa glazing systems were incorporated."
- **Image count:** 5 photographs.
- **Related projects shown:** Wooden Villa, Rose Bay House, Villa BEC, Hale Lana House, Green Golf, Daddy Cool.
- **Cross-system index:** a grid of all six Vitrocsa systems at the bottom with links to each system page.

Why this matters for FourlinQ: **PK House is in Calatagan, Philippines.** It is the local proof point that Vitrocsa serves the same geographic market FourlinQ operates in. The architect (8×8 Design Studio Co.) is a Philippine-based studio. FourlinQ's audience may well include architects who have spec'd Vitrocsa for a flagship project and are now evaluating uPVC alternatives for budget-constrained projects.

### 18.2 Hale Lana House, Big Island, Hawaii (https://vitrocsa.com/projects/hale-lana-house/)

- **Architect:** Olson Kundig (a globally-recognized Seattle studio).
- **Photographer:** Nic Lehoux (one of the most-published architectural photographers internationally).
- **Installation partner:** Goldbrecht.
- **System:** Sliding with Invisible Frame.
- **Image count:** 5 photographs.
- **Caption template (verbatim, repeated on each image):** "Hale Land House, Hawaii, USA by Architects Olson Kundig with Vitrocsa Frameless/Invisible Frame Sliding Window System."

The repeated caption is notable: it is descriptive metadata, not editorial commentary. The same caption on every image reads as image-library metadata more than as magazine writing — which is consistent with the archival posture.

### 18.3 Barcelona House (https://vitrocsa.com/projects/barcelona-house/)

- **Architect:** Ström Architects.
- **Installation partner:** E. Plantalech.
- **Photographer:** Helena Lee.
- **Location:** Barcelona, Spain (Coastal region).
- **Systems:** Sliding; Invisible Frame.
- **Body copy:** *"This modern and luxurious project features six Vitrocsa Sliding windows with invisible frame, each standing 3.30 meters tall."*
- **Image count:** 5.

### 18.4 The project-page formula, distilled

| Element | Count / Treatment |
| --- | --- |
| Hero image | 1 landscape photograph |
| Title | Plain project name |
| Architect | Named, no "designed by" framing |
| Installation partner | Named — credits the local fabricator/installer |
| Photographer | Named — uncommon for B2B sites |
| Location | City, country, often with a regional descriptor |
| Vitrocsa systems used | Listed factually |
| Body copy | 2–4 sentences, past tense |
| Gallery | 5 photographs (the count is consistent across the three sampled projects) |
| Captions | Descriptive metadata, often repeated across images |
| Related projects | 6 thumbnails of comparable installations |
| Six-system cross-grid | At the bottom, links to all six systems pages |

The five-image-per-project pattern is interesting: it suggests a CMS template with a hard cap, ensuring every project page has the same visual rhythm. Architects browsing the gallery encounter consistent depth — never one image, never twenty.

---

## 19. Deep-Dive: The Homepage

The Vitrocsa homepage warrants section-by-section treatment because it is the cleanest demonstration of the brand's editorial discipline.

### 19.1 Scroll-triggered section order

Sourced from https://www.vitrocsa.com (top-to-bottom):

1. **Sticky nav** — logo + 6 nav items + language switcher.
2. **Hero** — single architectural photograph + "Vitrocsa: Inventors Of The Minimalist Window" + sub-line + two text-arrow CTAs (Latest Projects, Contact Us).
3. **Systems showcase** — six-up grid of system cards with 3D model references and photography.
4. **Highlighted Projects** — Flag House, Barcelona House, Shindagha Welcome Pavilion, Aubrey Road. Four-up or two-up grid.
5. **Why Vitrocsa** — three feature columns: Innovation/R&D, Swiss Precision, Architect Recognition.
6. **Resources for Architects & Professionals** — link cluster to Document Library, Certificates, FAQ, Partner Programme.
7. **Partner locator with map** — embedded preview of the `/partners/` map.
8. **Latest News** — six most recent Journal entries.
9. **Newsletter signup** — single-field email.
10. **Footer**.

### 19.2 Section observations

- **Hero is text-light.** A two-line title and a sub-line. No bullet list of benefits, no logo wall.
- **Systems immediately after hero.** The brand puts the catalog on the homepage before the brand story. This signals: *if you're here, you came for the product.*
- **Projects before "Why Vitrocsa."** Projects (proof) precede the brand pitch (claim). This is inverted from a typical B2B homepage which leads with the claim.
- **"Why Vitrocsa" is only three columns.** No exhaustive "10 reasons to choose us." Just three.
- **Resources cluster.** A homepage section dedicated to architect-facing PDFs is rare; Vitrocsa includes it as a peer of the projects section.
- **Partner locator on the homepage.** This is one of the strongest moves. The homepage actively redirects the visitor to a local partner before the visitor finishes scrolling.
- **News before footer.** Latest articles are surfaced as a connective thread to ongoing brand activity, not buried in `/news/`.

### 19.3 What the homepage doesn't include

- No "trusted by" client logo strip.
- No video testimonials.
- No statistics counter ("X projects, Y countries" appears on `/company/`, not on homepage).
- No featured-in-press strip.
- No newsletter pop-up.
- No live chat widget.
- No CTA banner saying "Schedule a consultation."
- No "Get the brochure" PDF download in exchange for email above the fold.

---

## 20. Voice, Tone, & Copy Patterns (extended)

### 20.1 Recurring sentence patterns

From the system pages and project pages:

- **"By [verb-ing] X, the Vitrocsa Y system enables Z to W."** — e.g., *"By virtually erasing the boundary between inside and outside, the Vitrocsa Sliding window system enables architecture to embrace its surroundings."*
- **"Custom [Adjective] [Product Type]."** — every system page uses this construction in its primary headline ("Custom Minimalist Sliding Windows and Glass Doors", "Custom Frameless Windows and Glass Doors", "Custom Large Pivoting Windows and Glass Doors"). The word "custom" appears in every system H1.
- **Comma-separated technical adjacencies.** — "the same minimalist ethos found across Vitrocsa's range." The brand uses *ethos*, *philosophy*, *principle* as architectural vocabulary.

### 20.2 Recurring words

Counted across the system pages:

- "minimalist" — 50+ occurrences.
- "custom" — every system H1.
- "patented" — invisible frame, pivoting, turnable corner.
- "Swiss" — company, history, every page footer (HQ address).
- "architect" / "architects" — surfaces on every product page.
- "engineering" — used as a noun, not as a brag.
- "frameless" — invisible frame and sliding pages.

### 20.3 Banned vocabulary (never appears)

- "Beautiful" — the brand never tells you a window is beautiful.
- "Stunning" — never.
- "Luxurious" — once, on the Barcelona House body copy ("modern and luxurious project"), and only because it is describing the project, not the product.
- "World-class" — never.
- "Game-changing" — never.
- "Solution" as a noun for the product — never; Vitrocsa says "system," not "solution."

### 20.4 The proper-noun bias

Vitrocsa replaces adjectives with proper nouns wherever possible:

- Not "an award-winning architect" — "Olson Kundig."
- Not "a renowned design firm" — "BIG / Bjarke Ingels Group."
- Not "a top-tier publication" — "Architectural Record."
- Not "a major resort" — "Shebara Resort, Red Sea."

This is a copy strategy with two functions: (a) it borrows the reader's existing recognition of the named entity, and (b) it removes the need for self-praise — the names do the work.

---

## 21. The Cookie & Compliance Surface

For an EU-rooted company, the GDPR/compliance footprint is unusually light.

- **Cookie banner:** "We use cookies to ensure the proper functioning of the site" — Configure / Accept All. Tool: Darwin Digital v1.3.0.
- **Privacy / Terms:** assumed to be linked in the cookie consent flow or in a small footer cluster (not extracted in detail).
- **No accessibility statement** observed.
- **No GDPR data export portal** visible.

A more enterprise-tier B2B site (Schüco, Marvin) typically has a thicker compliance stack. Vitrocsa's omission is consistent with its overall editorial restraint.

---

## 22. The Document Library as a Lead Engine

This deserves more emphasis. `/document-library/` is the single page on the site that operates as a true marketing-tech tool, and it does so quietly.

### 22.1 Mechanic

A visitor wants the V56 datasheet. They fill: name, email, company, message. They submit. Vitrocsa serves the PDF (likely by emailing it or by serving a one-time link).

### 22.2 Implications

- **The list is qualified.** Anyone who downloads a V56 datasheet is at minimum an architect, specifier, or contractor evaluating Vitrocsa for a real project.
- **Vitrocsa can route the lead to a local partner.** With the email + company + country, the brand can introduce the lead to the right partner.
- **No "thank you, here's your download" friction layer.** The form is single-page, no double-opt-in spam.

### 22.3 What FourlinQ should adapt

Implement an identical pattern for FourlinQ's product datasheets and BIM/CAD downloads. Every architect download is a sales lead.

---

## 23. Photography as Authority — How Vitrocsa Builds Credibility With Images

### 23.1 The photographers Vitrocsa works with

From the projects audited:

- **Nic Lehoux** (Hale Lana House) — one of the most-published architectural photographers in North America; works with Olson Kundig, Steven Holl, Diller Scofidio + Renfro.
- **Helena Lee** (Barcelona House) — established editorial photographer.
- **Ed Simon** (PK House) — Philippine-based architectural and interior photographer.

By giving project credits to working editorial photographers, Vitrocsa signals it operates inside the same editorial economy that publishes the projects in *Architectural Record* and *Wallpaper*. The product is essentially "review-grade" in the same way a wine that arrives in Decanter is review-grade.

### 23.2 The aesthetic contract

The photography across the site holds a consistent visual contract:

- **No interior staging.** Rooms are minimally furnished. No styled vases, no thrown-throws, no curated coffee-table books.
- **Natural light.** No artificial lighting setups visible. Most shots are golden-hour or overcast diffused.
- **Low saturation.** Color grading mutes warm tones. Even tropical / coastal projects (Hale Lana, PK House, Shebara) have a cooler color cast than the location suggests.
- **No people.** Or, when people appear, they are scale figures at distance.
- **Architectural orthogonality.** Cameras are level. No tilt, no Dutch angle, no off-axis composition. The geometry of the windows reads cleanly.

This consistency is unusual. Most B2B brands have a mixed photography library — some commissioned, some submitted by partners, some stock. Vitrocsa appears to centralize aesthetic control.

---

## 24. Comparing Vitrocsa to the Other Reference Brands

Cross-referencing the existing `docs/references/design-systems/` files (marvin, schueco, sky-frame, vitrocsa):

| Dimension | Marvin | Schüco | Sky-Frame | Vitrocsa |
| --- | --- | --- | --- | --- |
| Primary audience | Homeowners + builders | Specifiers + architects + enterprise | Architects + ultra-premium homeowners | Architects + ultra-premium homeowners |
| Accent color | Warm cream + amber | Schüco red + blue | Orange highlight | Navy + gold arrow |
| Typography | Serif + sans pairing | Sans + display | Sans-led | System sans only |
| Animation | Moderate scroll reveals | Moderate, structured | Restrained | Minimal (color hover only) |
| Hero | Video + image | Video | Image | Image |
| Pricing language | Indirect ("starting from") | Not on consumer pages | None | None |
| Project pages | Marketing case studies | Reference projects | Editorial features | Archival documentation |
| Partner-as-gatekeeper | No | Yes (specifier portal) | Light | Heavy (Swiss visit + 3–5 day training) |
| Brand color tokens | 6–8 | 12+ | 5–6 | 4 |
| Border radius | 4–8 px | 4 px | 0–2 px | 0 |
| Shadows | Multi-level | Multi-level | Subtle | None |

Vitrocsa sits at the far edge of restraint on every dimension. The competitive map shows that FourlinQ has room to position itself between Marvin (homeowner-warm) and Sky-Frame (architect-restrained), with Vitrocsa as the unattainable pole star.

---

## 25. Translation Sheet — Vitrocsa Pattern → FourlinQ Application

A concrete decision sheet for the FourlinQ redesign:

| Vitrocsa pattern | FourlinQ application | Adopt? | Notes |
| --- | --- | --- | --- |
| Single still photo hero | FourlinQ should use video — typhoon testing, sealing demo | Modified | Adopt the *single subject* discipline; reject the *no motion* discipline |
| Sentence-case system H1s ("Custom Minimalist Sliding Windows") | FourlinQ uses "uPVC Casement Windows" / "uPVC Sliding Doors" — same plain construction | Yes | Pair product type + system, no marketing nicknames |
| System name as headline (not "Series 7000") | FourlinQ should use "Casement," "Tilt-Turn," "Sliding," "Awning" as category headlines, with product codes as variant labels | Yes | Maps directly |
| Four-feature callout per system page | Use this pattern for each FourlinQ product line, with icons that are diagrams of the profile cross-section + reinforcement | Yes | Diagrams not lifestyle icons |
| Comparison table with variant tabs | Implement comparison across uPVC series (e.g., 60 mm vs 70 mm vs 80 mm frame) | Yes | One of the most directly usable patterns |
| Spec values with units inline | "70 mm frame," "5 chambers," "60 Pa watertightness" — unit on the value, not the column header | Yes | Engineer's vocabulary |
| Photographer credits on project pages | Credit Philippine architectural photographers FourlinQ commissions | Yes | Editorial respect builds trust |
| Architect named as author | Credit the architect on every project; the brand is the engineering supplier | Yes | Borrows architect's reputation |
| Approved-partner framing | "Authorized FourlinQ dealer / certified installer" with map and filter | Yes | Trust signal |
| Mandatory training for partners | Require certification for FourlinQ installers; publish the cert program | Yes | Differentiator vs. local uPVC competitors |
| History timeline | Founder + milestones since the company started — Filipino industrial heritage | Yes | But with photographs of typhoon-tested buildings |
| Certificates as downloadable PDFs | Publish water-tightness, wind-load, thermal, acoustic test reports | Yes | Critical for typhoon market |
| Patent count | List patents if any; if not, list certifications and standards | Yes | Substitute certifications for patents |
| Heritage statistics (counted) | "X buildings, Y provinces, Z homes" as exact integers | Yes | Specificity = credibility |
| No pricing on site | FourlinQ should have at least "starting from" pricing per series | No | Vitrocsa's omission doesn't translate |
| No CTA buttons (text-arrow only) | FourlinQ needs traditional filled buttons | No | Conversion expectations differ |
| System sans only | FourlinQ should pair sans + warm humanist serif | No | Need warmth |
| Near-monochrome palette | FourlinQ should add one warm accent (terracotta / amber) | No | Need warmth |
| Zero shadows | FourlinQ may use subtle elevation tokens | No | Conventional B2B UX expects depth |
| Zero border radius | FourlinQ should use 4–8 px radius | No | Softer feel for homeowner audience |
| Newsletter as quiet single-field | Adopt | Yes | Restrained, no incentive |
| Document Library gated by form | Adopt | Yes | Critical lead engine |
| Past-tense archival project copy | Adopt | Yes | Editorial discipline |
| Five-image-per-project consistency | Adopt | Yes | CMS-enforced template |
| No "Solutions" abstraction layer | FourlinQ may need /residential/ vs /commercial/ split | No | Audience needs guidance |
| Resources as dropdown-only (no landing) | FourlinQ should have a /resources/ landing page | No | Library users will expect a hub |

---

## 26. Notes on the Vitrocsa Tone, for FourlinQ Copywriters

If the FourlinQ writing team studies a single Vitrocsa quality, study **specificity over superlative.**

Where a competitor would write *"our windows offer industry-leading thermal performance,"* Vitrocsa writes:

> "TH+ — Thermal insulation focus; up to 500 kg per panel"

That sentence has more authority because:

- It names the product variant (TH+).
- It names the property (thermal insulation).
- It includes a quantified spec (500 kg per panel).
- It refuses the comparative claim ("industry-leading").

The FourlinQ team should adopt this discipline at the line level. Whenever a draft contains a comparative or evaluative word ("best," "premier," "leading," "advanced"), replace it with a specific number, a specific certification, or a specific test.

Sample rewrites:

| Before (typical) | After (Vitrocsa-style) |
| --- | --- |
| "FourlinQ offers the best uPVC windows in the Philippines" | "FourlinQ uPVC profiles are reinforced with galvanized steel cores from 1.2 mm to 1.8 mm thickness depending on the series." |
| "Excellent typhoon resistance" | "Tested to wind loads of [X] Pa per ASTM E330 / Philippine Building Code." |
| "Premium German technology" | "Profiles extruded from [supplier] uPVC compound, sourced from [country]." |
| "Wide range of stylish colors" | "Available in 6 standard powder-coat finishes and 12 foil-laminate woodgrains." |

The discipline is the same: **replace the marketing word with the spec value.**

---

## 27. The Showroom & The Visit Protocol

The way Vitrocsa treats the showroom is a study in scarcity-as-quality.

### 27.1 The Yverdon-les-Bains showroom

- Address: Rue Mileva-Einstein-Marić 1, 1400 Yverdon-les-Bains, Switzerland.
- Phone: +41 24 436 22 02.
- Hours: not posted.
- Booking: form-only — first name, last name, email, reason for visit.
- Note: *"those seeking partner showroom visits should use the separate partner locator instead"*.

### 27.2 Why no posted hours

A walk-in retail showroom would be inconsistent with the brand's editorial posture. By requiring a request-to-visit, Vitrocsa:

1. Pre-qualifies the visitor (only architects/specifiers/serious buyers send the form).
2. Allocates the right staff member to the visit.
3. Communicates that this is a working showroom, not a retail floor.

### 27.3 What FourlinQ should do differently

FourlinQ's showrooms (likely in Metro Manila and key provincial cities) serve homeowners and contractors who *do* want to walk in. The hours should be posted. The Google Maps pin should be prominent. A "schedule a visit" form should be available but optional.

This is one of the clearest divergences from Vitrocsa: **scarcity is a luxury signal that doesn't translate to a market where the buyer expects accessibility.**

---

## 28. Closing — The Single-Sentence Lesson

If the FourlinQ team retains only one lesson from this audit:

> **Vitrocsa builds authority by what it removes, not by what it adds.**

Every page is a series of editorial subtractions: no extra colors, no extra shadows, no extra adjectives, no extra animations, no extra CTAs. The site reads as confident because it is uncluttered, and it reads as authoritative because it consistently substitutes specifics (mm, kg, years, patents, named architects, named photographers) for vague claims.

For a FourlinQ redesign that wants to graduate from "another uPVC manufacturer" to "the trusted Philippine uPVC manufacturer," the discipline of subtraction — paired with the warmth needed for a Philippine homeowner audience — is the path.

The pole star is Vitrocsa. The map is FourlinQ's own.

---

## 29. Appendix A — Full Project Inventory Observed

Compiled from `/projects/`, system pages, and project-card sightings:

| Project | Country | Architect | Vitrocsa Systems |
| --- | --- | --- | --- |
| Wooden Villa | France | Nicolas Dahan | Sliding |
| Rose Bay House | Australia | Studio Johnston | Turnable Corner |
| Villa BEC | Switzerland | Andrea Pelati Architecte | Sliding |
| Hale Lana House | United States (Hawaii) | Olson Kundig | Sliding + Invisible Frame |
| Green Golf | Brazil | Bernardes Arquitetura | Sliding |
| Daddy Cool | Australia | Sandlik | Pivoting |
| Shebara Resort | Saudi Arabia | Killa Design | Curved |
| PK House | Philippines (Calatagan) | 8×8 Design Studio Co. | Sliding, Pivoting, Turnable Corner, Fixed |
| Shindagha Welcome Pavilion | United Arab Emirates | X Architects | Pivoting |
| Fondation Maeght | France | Silvio d'Ascia Architecture | Sliding |
| Flag House | Brazil | Studio MK27 | Pivoting + Sliding |
| Framed House | Australia (Sydney) | Luis Gomez-Siu Design Studio | Pivoting |
| Aubrey Road | United Kingdom (London) | Audrey Carden — Carden Cunietti London | Pivoting |
| Barcelona House | Spain (Barcelona coast) | Ström Architects | Sliding + Invisible Frame |
| The Spiral | Denmark | BIG / Bjarke Ingels Group | Sliding |
| Maison CL | France (Cévennes) | Benoît Lloze & Alexandre Hordé | Turnable Corner |
| Jardim | United States | Isay Weinfeld | Sliding |
| Maui Residence | United States (Hawaii) | Walker Warner Architects | Sliding + Invisible Frame |
| House EMGD | Switzerland | Ralph Germann Architectes | Sliding |
| Black Concrete House | Israel | Pitsou Kedem Architects | Sliding |
| Château Troplong Mondot | France | (not specified) | TH+ Turnable Corner |
| Crescent House | Australia (Sydney) | (not specified) | Turnable Corner |
| Grand Park Hotel Rovinj | Croatia | (not specified) | Guillotine (nine vertical sliders) |
| Blossom Hill Chalet | France (Courchevel) | (not specified) | Guillotine |
| Flagship Dior Seoul | South Korea | (not specified) | Curved |
| Piaget VIP Rooms | (not specified) | (not specified) | Curved |
| Maison Dior Seoul (top floor) | South Korea | (not specified) | (multiple) |
| Municipal Stadium of Braga | Portugal | Eduardo Souto de Moura (historical) | Guillotine (boxes) |
| AZ House | Lebanon | (not specified) | Sliding (Invisible Frame) — Hero of /systems/sliding/ |
| Bourg St-Maurice | France | (not specified) | Invisible Frame — Hero of /systems/invisible-frame/ |
| Casa Bastida | (not specified) | (not specified) | Invisible Frame |
| Villa N | (not specified) | (not specified) | Invisible Frame |
| Longueville | (not specified) | (not specified) | Invisible Frame |

**Observations from this inventory:**

- **Country diversity:** 13+ countries represented in the first 20 projects alone. The geographic spread itself is the trust signal.
- **Architect mix:** A blend of globally recognized firms (BIG, Studio MK27, Olson Kundig, Isay Weinfeld, Pitsou Kedem) and regional specialists (Pelati, Germann, 8×8, Bernardes).
- **System type distribution:** Sliding dominates as expected (the original system, the bestseller), but every system has multiple flagship projects — no system feels orphaned.
- **Project type spread:** Mostly residential, with some commercial / public landmarks (Fondation Maeght, Shindagha Pavilion, Braga Stadium, Grand Park Hotel Rovinj). The Public / Commercial projects function as scale-credibility signals.

---

## 30. Appendix B — Press Publications Observed

From `/company/vitrocsa-in-the-press/`:

**Architecture & design press:**
- Architectural Record (US)
- Detail Magazine (DE)
- Wallpaper* (UK)
- Dwell Magazine (US)
- Metropolis Magazine (US)
- RIBA Journal (UK)
- Veranda Magazine (US, multiple features)

**Luxury & lifestyle:**
- Vogue UK
- Elle Magazine
- Elle Decoration France
- AD Magazine (Architectural Digest)
- Luxe Interiors + Design (US)
- Ocean Home
- LA Home Magazine

**Construction & industry:**
- Construction and Renovation
- TEC21 (CH)
- Werk Bauen + Wohnen (CH)
- PME Magazine
- Industrie Moderne

**International:**
- Habitus Living (AU)
- Houses Magazine (AU)
- Artravel (FR)
- Espaces Contemporains (CH)

**Observations:**

- **Architecture press is the spine.** Architectural Record, Detail, Wallpaper, Dwell, Metropolis, RIBA — the canonical architect-facing publications.
- **Luxury lifestyle is the wide net.** AD, Elle, Vogue — these reach the ultra-premium homeowner audience.
- **Industry publications validate engineering credibility.** TEC21, Werk Bauen — Swiss engineering press credentials.
- **Regional editions matter.** Elle Decoration *France* (not just Elle). Habitus *Living* (Australian regional). The brand thinks in geography.

This press strategy translates for FourlinQ as: target architecture-press (BluPrint Philippines, Manila Architectural Review), homeowner-press (Real Living Philippines, Tatler Homes), and industry/trade press (PCA, UAP publications). The same three-channel model.

---

## 31. Appendix C — Vitrocsa-style Headlines, Translated for FourlinQ

A library of headline templates rewritten from Vitrocsa structures, for FourlinQ's product and project pages:

**System / product headlines (Vitrocsa → FourlinQ):**

| Vitrocsa | FourlinQ adaptation |
| --- | --- |
| "Custom Minimalist Sliding Windows and Glass Doors" | "uPVC Sliding Windows and Doors" |
| "Custom Frameless Windows and Glass Doors" | "uPVC Casement Windows for Philippine Homes" |
| "Custom Large Pivoting Windows and Glass Doors" | "uPVC Tilt-Turn Windows" |
| "Custom Large Vertically Sliding Windows" | "uPVC Awning Windows" |
| "Custom Turnable Corner Windows" | "uPVC Corner Sliding Configurations" |
| "Custom Minimalist Curved Windows" | "uPVC Bay & Bow Windows" |

The construction stays: **Material + Type + Use-case clarifier**. Plain. Specific. No marketing nicknames.

**Project page headlines (Vitrocsa-style):**

| Project | Headline format |
| --- | --- |
| [Project Name] | Plain project name only |
| Architect | Named with no honorific |
| Location | City + Province (Philippines) + Region descriptor |
| Photographer | Named |
| FourlinQ systems | Listed, no marketing language |
| Body copy | 2–4 sentences past tense |

**Hero-line patterns:**

| Vitrocsa | FourlinQ adaptation |
| --- | --- |
| "Vitrocsa: Inventors Of The Minimalist Window" | "FourlinQ: Philippine uPVC Since [year]" |
| "The World Leader In Minimalist Windows" | "Philippine-Manufactured uPVC for [climate / typhoon / coastal] Conditions" |
| "Pioneering The Modern Minimalist Window" | "Engineered for Philippine Homes" |

The discipline: declarative factual headline that establishes the brand's category position without superlative language.

---

## 32. Appendix D — Easing & Motion Tokens (proposed for FourlinQ, inspired by Vitrocsa restraint)

If FourlinQ wants to honor Vitrocsa's motion discipline while still allowing more energy than Vitrocsa permits itself:

```
--ease-default:  cubic-bezier(0.25, 0.1, 0.25, 1)   /* CSS ease-out, standard */
--ease-emphasis: cubic-bezier(0.4, 0, 0.2, 1)        /* Material standard */
--ease-decel:    cubic-bezier(0.0, 0.0, 0.2, 1)      /* Decel for entrances */

--duration-instant: 80ms     /* state changes, toggle pressed */
--duration-fast:    150ms    /* hover color, link underline */
--duration-base:    250ms    /* card lift, menu reveal */
--duration-slow:    400ms    /* page transitions, drawer slide */
--duration-video:   600ms+   /* hero video crossfade */
```

**Vitrocsa likely uses only the top two rows** (instant + fast, color-shift only). FourlinQ can use the full ramp but should default to `--duration-fast` for hover and `--duration-base` for any structural motion.

Recommended motion budget:

- **Hero:** auto-play video with crossfade (Vitrocsa would never; FourlinQ should).
- **Scroll reveals:** subtle fade-up on section entry, ≤300 ms (Vitrocsa never; FourlinQ may).
- **Hover micro-interactions:** color-shift + 4-px arrow translate (Vitrocsa-aligned).
- **Page transitions:** standard navigation, no morph (Vitrocsa-aligned).
- **Modal/drawer:** 250 ms slide-in (Vitrocsa-aligned).
- **Counter-up on statistics:** allowed for FourlinQ; Vitrocsa refuses.

---

## 33. Appendix E — Spacing Tokens (proposed, Vitrocsa-anchored)

```
--space-0:   0px
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   24px
--space-6:   32px
--space-7:   48px
--space-8:   64px
--space-9:   96px
--space-10:  128px
--space-11:  192px   /* Vitrocsa-tier section padding */
--space-12:  256px   /* Vitrocsa-tier maximum between sections on homepage */
```

Vitrocsa's section-to-section vertical padding routinely uses `--space-10` to `--space-11`. FourlinQ should default to `--space-9` (96 px) for routine sections and reserve `--space-10`+ for marquee moments.

The discipline: **whitespace as a percentage of viewport.** A Vitrocsa hero section is ~70-90% photograph and 10-30% breathing whitespace. Text is the rest. There is no section on the Vitrocsa site that is more than 60% text by volume.

---

## 34. Appendix F — Color Tokens (proposed for FourlinQ, with Vitrocsa for comparison)

```
/* Vitrocsa-equivalent (for reference, not for use directly) */
--vitrocsa-ink-display:   #10182F
--vitrocsa-ink-body:      #32373C
--vitrocsa-blue-accent:   #3971DD
--vitrocsa-gold-arrow:    inferred warm gold

/* FourlinQ-proposed (warmer, more Filipino-domestic) */
--fourlinq-ink-display:   #1A1A1A   /* True near-black, not navy-tinted */
--fourlinq-ink-body:      #2E2E2E
--fourlinq-ink-secondary: #5C5C5C
--fourlinq-canvas:        #FFFFFF
--fourlinq-canvas-warm:   #FAF7F2   /* Optional warm off-white for section backgrounds */
--fourlinq-accent-warm:   #B45A24   /* Terracotta / copper — the "Filipino warmth" accent */
--fourlinq-accent-deep:   #8C3F12   /* Hover state */
--fourlinq-rule:          #E5E1DA   /* Hairline dividers, warm-tinted */
--fourlinq-success:       #2E7D32   /* Form validation only */
--fourlinq-warning:       #C77800
```

The key contrast vs Vitrocsa: FourlinQ permits **one warm off-white background** (`canvas-warm`) and **one warm accent** (`accent-warm`). Vitrocsa permits neither — its canvas is pure white and its accent is navy/gold (cool/metallic, not warm).

The terracotta accent is a hypothesis to be validated with the FourlinQ brand team — alternates include a deep copper, an amber, or a warm rust. The brief is: **a warm color that signals Philippine domesticity without being saturated enough to feel commercial.**

---

## 35. Appendix G — Component Inventory

A taxonomy of the components Vitrocsa uses and their FourlinQ analogs:

| Component | Vitrocsa pattern | FourlinQ application |
| --- | --- | --- |
| Header / nav | Logo left, 6-item nav, language switcher right | Adopt; reduce to 5 items if FourlinQ has no equivalent of "Find a Partner" → "Find a Dealer" |
| Mega menu | Hover-reveal, single-column dropdown per parent | Adopt |
| Hero (homepage) | Single still photo + 1-line title + 1-line sub + 2 text-arrow CTAs | Replace still with video; keep title discipline; replace text-arrow with filled-button + text-arrow pair |
| Hero (system page) | Full-bleed photo + sentence-case H1 below or overlaid | Adopt |
| System / product card | Photo + name + 2-sentence description + arrow | Adopt |
| Feature callout (4-up) | Line-drawing icon + 1-line title + 2-sentence description | Adopt |
| Spec comparison table | Variant-as-column, spec-as-row, tabs to swap variants | Adopt |
| Project card | Landscape photo + name + architect + system + 1-sentence + "View more" | Adopt |
| Project page | 1 hero + 5 gallery photos + metadata block + 2-3 sentence body + similar projects + system grid | Adopt with FourlinQ photography |
| Statistics block | Number + label, no animation | Adopt; allow counter-up animation for FourlinQ |
| Press grid | Publication thumbnail + headline + language filter | Adopt |
| Partner map | Interactive map + country filter + showroom toggle | Adopt |
| Document library | Gated form for PDFs | Adopt; add BIM/CAD files |
| FAQ accordion | Two categories, expandable items | Adopt |
| Newsletter | Single email field, one-line copy | Adopt |
| Cookie banner | "Configure / Accept All", no granular UI | Adopt |
| Footer | 3-column, address block, social row, no legal mega-stack | Adopt; add 2 legal links |

---

## 36. Appendix H — Section Order Templates

Templates extracted from Vitrocsa pages for FourlinQ adaptation:

### 36.1 Homepage

```
1. Sticky nav
2. Hero (video for FourlinQ; still for Vitrocsa) — single title + sub + 2 CTAs
3. Product / Systems showcase — 6-up grid
4. Featured projects — 4-up grid
5. Why FourlinQ — 3-up feature columns (engineering, climate, service)
6. Resources cluster (datasheets, BIM, certifications)
7. Dealer locator preview (map snippet)
8. Latest journal entries (3-up or 6-up)
9. Newsletter signup
10. Footer
```

### 36.2 Product (system) page

```
1. Hero (full-bleed photo of installed project)
2. Lede paragraph (2-3 sentences, plain)
3. Key features (4-up callouts with diagram icons)
4. Product range (variant cards)
5. Spec comparison table (tabbed)
6. Featured installations (2-4 thumbnails)
7. Resources (datasheet PDF, BIM file, 3D model, document library)
8. CTA — Find a Dealer + Contact
9. Newsletter signup
10. Footer
```

### 36.3 Project page

```
1. Hero image
2. Project metadata block (architect, location, photographer, systems used)
3. Body copy (2-4 sentences, past tense)
4. Gallery (5 photographs, consistent template)
5. Similar projects (6 thumbnails)
6. System cross-grid (link to all FourlinQ product lines)
7. Newsletter signup
8. Footer
```

### 36.4 History / About page

```
1. Hero (HQ photo or founder portrait)
2. Founding narrative (200-400 words)
3. Vertical timeline with year + milestone + photograph
4. Statistics block (counted integers)
5. Philosophy quote (founder or industry icon)
6. Team / culture brief
7. Manufacturing / facility section
8. CTA — Visit Showroom / Find a Dealer
9. Footer
```

### 36.5 Find a Dealer page

```
1. Hero (one-line intro: "Only certified FourlinQ dealers...")
2. Interactive map
3. Filter dropdowns (province, services, showroom yes/no)
4. Partner card grid
5. CTA — Become a Dealer
6. Footer
```

---

## 37. Appendix I — Banned & Allowed Vocabulary (FourlinQ Copy Style Guide draft)

A short style guide for FourlinQ writers, modeled on Vitrocsa restraint:

**Banned (do not use in headlines, taglines, or body copy):**

- "Best"
- "Premier"
- "Leading"
- "World-class"
- "Industry-leading"
- "Stunning"
- "Beautiful" (in product descriptions; allowed in project body if quoting the architect)
- "Game-changing"
- "Revolutionary"
- "Innovative" (overused; replace with the specific innovation)
- "Solution" (use "system" or "product")
- "Cutting-edge"
- "State-of-the-art"
- "Premium" (cliché; let pricing tier speak for itself)
- "Luxury" (only allowed when describing a project, never the product)
- "Bespoke" (allowed in true custom contexts only)
- Exclamation marks (never)

**Allowed and encouraged:**

- "Engineered" (verb form preferred over "built")
- "Tested to [standard]"
- "Certified to [standard]"
- "[Specific number] [unit]"
- "[Year] founded"
- "[Architect name]"
- "[Photographer name]"
- "[City], Philippines"
- "uPVC" (the material, fully spelled where context needs it)
- "Series [number]" (for product variants)
- "Profile" (for the cross-section)
- "Reinforcement" (for the steel core)

**Voice rules:**

1. Sentence-case headlines, never ALL CAPS, never Title Case beyond H1.
2. Past tense for project documentation.
3. Present tense for product description.
4. Imperative used sparingly, only for CTAs ("Visit our showroom").
5. Second-person ("you") allowed but rationed — Vitrocsa never uses it; FourlinQ may, especially in CTA and homeowner-facing copy.
6. Avoid contractions in editorial copy; allow in conversational FAQ answers.

---

## 38. Appendix J — Photography Brief (FourlinQ adaptation)

If FourlinQ commissions a season of architectural photography to back the redesign, the Vitrocsa-aligned brief:

**Brief for FourlinQ project photography:**

1. **Format:** Landscape primary (16:9 or 3:2). Portrait for mosaic sections only.
2. **Lighting:** Natural. Golden hour or diffused overcast. Avoid harsh midday.
3. **Color:** Maintain Philippine light authenticity (do not cool-cast it to look European). Slight warmth is on-brand for FourlinQ.
4. **Composition:** Camera level. Orthogonal architecture. No Dutch angles. Two-point perspective preferred.
5. **People:** Optional. If present, scale figures only — no portraits, no posing.
6. **Staging:** Minimal. Avoid heavy interior styling. Let the architecture and the windows speak.
7. **Window framing:** Each shot should clearly show the FourlinQ profile and the glass plane.
8. **Sequence:** Commission 5–7 frames per project (Vitrocsa uses 5; FourlinQ can stretch to 7 for tropical / coastal landscape variety).
9. **Photographer credit:** Always.
10. **Architect credit:** Always.

Suggested Philippine photographers to scout: those who have shipped work to BluPrint, Tatler Homes Philippines, and the Real Living awards portfolio.

---

## 39. Appendix K — Trust-Signal Hierarchy

How Vitrocsa structures trust signals across the site, with FourlinQ adaptation:

| Trust signal | Vitrocsa version | FourlinQ adaptation |
| --- | --- | --- |
| Heritage year | "Founded 1992" | "Founded [year]" |
| Founder narrative | Eric Joray, watchmaker | FourlinQ founder, industrial heritage |
| Project count | 21,462 | Exact FourlinQ count |
| Country reach | 61 countries | Provinces / regions in Philippines |
| Patents | 26 filed, 24 active | Certifications and standards complied with |
| Certifications | 22 | List exact certifications (ISO, Philippine standards) |
| Test reports | PDF downloadable per system | Same |
| Architect endorsements | Olson Kundig, BIG, MK27 | Philippine architects + named projects |
| Press features | Architectural Record, Wallpaper | BluPrint, Tatler Homes, Real Living |
| Partner network | 500+ across 61 countries | Network across Philippine provinces |
| Showroom | Yverdon-les-Bains | Metro Manila + provincial cities |
| Manufacturing location | Saint-Aubin-Sauges, Switzerland | FourlinQ factory location |
| Quote source | Leonardo da Vinci | Filipino architectural icon (optional) |
| Statistical specificity | Counted to the integer | Counted to the integer |

The principle: **every claim is backed by a specific, falsifiable artifact.** Vitrocsa does not say "many projects"; it says 21,462. It does not say "many countries"; it says 61. FourlinQ should adopt this discipline — count, then publish the count.

---

## 40. Appendix L — Anti-Patterns to Avoid (FourlinQ specifically)

Patterns common in Philippine uPVC competitor sites that FourlinQ should avoid, informed by the Vitrocsa restraint discipline:

1. **Logo wall of "trusted partners"** — Avoid. Vitrocsa never does this. Better: name the architects.
2. **Testimonial carousel with star ratings** — Avoid. Vitrocsa never does this. Better: an editorial project page.
3. **Pop-up newsletter overlay** — Avoid. Vitrocsa never does this. Use an inline footer signup.
4. **Live chat widget** — Use only if staffed; do not deploy a bot.
5. **"Get a free quote" sticky banner** — Avoid. Better: a single "Contact Us" with a structured form.
6. **Stock photography of "happy families"** — Avoid. Only commissioned architectural photography.
7. **Animated product 360° rotators** — Avoid for product hero. Use only on a dedicated 3D-model section.
8. **Auto-rotating hero carousel** — Avoid. One hero image / video per section.
9. **Mega-list of "10 reasons to choose us"** — Reduce to 3. Vitrocsa uses 3.
10. **Award badge clutter** — If FourlinQ has awards, list them in a dedicated Press / Awards page, not on every product card.
11. **Comparison-to-competitor charts** — Avoid public competitor naming; let FourlinQ specs speak.
12. **Christmas / promo banners on the homepage** — Avoid; if needed, a dedicated /promo/ route, never the homepage hero.
13. **Marketing language in product names** — "EcoMax Pro Plus" is a banned construction. Use "Series 70 Casement" or similar plain naming.
14. **"Limited time offer" urgency** — Avoid entirely.

---

## 41. Appendix M — Vitrocsa's Most Quotable Sentences (verbatim)

Reference quotes from the site, useful for FourlinQ writers when calibrating tone:

> "By virtually erasing the boundary between inside and outside, the Vitrocsa Sliding window system enables architecture to embrace its surroundings."

> "Only approved Vitrocsa partners are permitted to sell and install a Vitrocsa minimalist window. With their skills and technical expertise, each partner guarantees the authenticity of each window and ensure that you make the right choice that will last a lifetime."

> "Discover our range of systems and let yourself be captivated by their timeless aesthetics combined with uncompromising functionality."

> "Vitrocsa pioneered the modern minimalist window and remains a leader in bespoke..."

> "Our projects showcase innovative architectural solutions where design, technology, and craftsmanship come together seamlessly. Each project is a testament to creative vision and precision engineering, delivering inspiring spaces that blur the boundaries between indoors and outdoors."

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci, quoted on /company/

> "Let people do their thing. Develop a passion for the product, a sense of collaboration and complete confidence." — Eric Joray, founder

> "a meeting point for architecture, innovation and Swiss expertise." — /company/visit-our-showroom/

> "A patent is an exclusive right granted to an invention. Patent protection means the invention cannot be made, used, distributed or sold for commercial purposes by third parties without Vitrocsa's consent."

> "The evaluation of compliance requires the Vitrocsa product to undergo a process to demonstrate that it meets international standards."

Note the patterns: passive voice for the legal claims, active voice for the design philosophy, and a near-total absence of first-person ("we") — even when describing the company's own operations. The brand-as-third-person is one of the editorial signatures.

---

## 42. Appendix N — How to Use This Document

For the FourlinQ team:

1. **Designers** — focus on §3 (Design System), §4 (Animation), §32–§34 (Tokens), §35 (Components).
2. **Copywriters** — focus on §6 (Content Patterns), §20 (Voice), §26 (Specificity), §31 (Headlines), §37 (Vocabulary), §41 (Reference quotes).
3. **Product / IA leads** — focus on §2 (Sitemap), §5 (UX Flows), §11 (Partner Network), §22 (Document Library), §36 (Section Order Templates).
4. **Marketing / brand** — focus on §1 (Strategic Posture), §9 (Exclusivity Without Inaccessibility), §14 (Take vs Don't), §25 (Translation Sheet), §39 (Trust Signals), §40 (Anti-Patterns).
5. **Photographers / art direction** — focus on §7 (Photography Strategy), §23 (Photography as Authority), §38 (Photography Brief).
6. **Engineering / spec content** — focus on §10 (Six Systems), §22 (Document Library), §30 (Press Publications, for placement targets).

The document is intentionally cross-referenced; sections will appear redundant in places because the brief asked for both design + IA + UX + content + animation views of the same surfaces. Use the appendices as a working reference rather than a linear read.

---

## 43. Appendix O — Open Questions for the FourlinQ Brand Team

The audit surfaces several decisions that the brand team needs to make before the redesign can lock in:

1. **Warm accent color.** Terracotta? Copper? Amber? Or no warm accent (Vitrocsa-style cool-only)?
2. **Pricing visibility.** "Starting from" ranges on the product pages, or routed to a dealer?
3. **Hero video vs hero still.** FourlinQ has a real performance story (typhoon, sealing). How much screen time does it earn?
4. **Showroom hours.** Posted hours (walk-in friendly) or appointment-only (Vitrocsa-aligned)?
5. **Partner certification depth.** A formal training program with certificate, like Vitrocsa's 3–5 day Learning Center? Or a lighter "authorized dealer" model?
6. **Document Library gating.** Email gate (Vitrocsa) or open access (more homeowner-friendly)?
7. **Photographer commission model.** Annual retainer with a primary photographer, or per-project freelance?
8. **Architectural project portfolio.** Solicit project submissions from Philippine architects, or commission FourlinQ-led shoots?
9. **Counter-up animation on statistics.** Allow (more modern) or disallow (Vitrocsa-aligned)?
10. **Border radius default.** 0 (Vitrocsa-aligned, more "engineering"), 4 px (modern minimal), or 8 px (warmer / more domestic)?

Each of these is a positioning decision more than a design decision. Resolving them locks in the FourlinQ position on the spectrum from "Marvin warmth" to "Vitrocsa restraint."

---

## 44. Closing Reflection

A final pass at the central question: *how does Vitrocsa let photography do 90%+ of the storytelling, where does text appear at all, and how does it signal exclusivity without being inaccessible?*

**Photography does 90% of the storytelling because:**
- Hero sections are single full-bleed images.
- Project pages are gallery-led with 5 photographs and 2–4 sentences of text.
- Each system page leads with a project hero.
- Marketing language is removed, leaving only what photography cannot communicate (specs, certifications, partner info).

**Text appears at:**
- H1 headlines (sentence-case, plain category names).
- Spec comparison tables (the densest text on the site).
- Project metadata blocks (architect, location, photographer).
- 2-4 sentence body copy per page.
- The Journal / press (the prose-heaviest part of the site).
- Footer (address, phone, contact).
- Certificates / patents (legal-style, dense).

**Exclusivity is signaled without inaccessibility through:**
- A public, ungated marketing site (anyone can browse).
- Heavy gating only on the transactional step (no "buy now"; must go through a certified partner).
- Heritage statistics counted to the integer (specificity = trust).
- Named architects and photographers (borrowed authority).
- The Swiss-visit-and-training partner program (the supply chain is the gatekeeper).
- A 21 mm sight-line specification published openly (technical openness = confidence).

The accessibility is informational. The exclusivity is transactional. **You can learn everything about a Vitrocsa product on the site; you can buy nothing.**

For FourlinQ, this is the most translatable single move: **make the marketing site educational rather than transactional, route the transaction through the partner network, and let the partner network be the exclusivity mechanism.**

— end of audit —


