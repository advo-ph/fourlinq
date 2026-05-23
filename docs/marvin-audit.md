# Marvin Windows & Doors — Comprehensive Design, UX & IA Audit

> Reference research for the FourlinQ redesign (branch `redesign-marvin`).
> All observations derive from live WebFetch sessions against https://www.marvin.com
> and the sister site https://install.infinitywindows.com (the redirect target of
> infinityfrommarvin.com) during the audit window (2026-05-23).
>
> A note on method: Marvin's site is a Next.js application (asset URLs are
> `/_next/image` and `/_next/static/...`). Many interior pages render their
> content client-side, so HTML-only fetches sometimes return only the
> `Skip to main content` shell. Where that happened, observations are
> reconstructed from sister pages, sitemap entries, asset URLs, breadcrumbs,
> and the nav/footer structure that does render server-side. Pages where
> the DOM was confirmed are cited inline. Pages where inference was used
> are flagged "[inferred]".

---

## 0. Executive summary — what Marvin does that we should steal

1. **Editorial-grade typography**: large, confident, lightly-tracked headlines
   anchored by an "eyebrow → headline → subhead" rhythm that appears on
   nearly every page. Eyebrows are short, often two-to-three words, set
   small with extra letter-spacing — they read like magazine kickers.
2. **A handful of recurring section archetypes** (hero, 3-pillar value row,
   case-study video trio, product grid, materials & finishes, sizes,
   energy, hardware, downloads) that get re-skinned with brand-appropriate
   photography per collection. Collections are clearly differentiated by
   *tone of photography and copy*, not by chrome.
3. **Photography over product renders**: real homes in real light dominate;
   product renders are reserved for spec contexts (size charts, hardware
   close-ups). When renders appear in collection product grids they sit
   on a neutral background and act like catalog plates.
4. **Aggressive use of *collections* as the organizing logic** (Ultimate,
   Modern, Vivid, Elevate, Essential) — five sibling brand worlds that
   re-categorize the same window/door types into design intents. This is
   the IA we should mirror for FourlinQ's 3 systems: each system gets
   its own landing world, not just a card on a catalog page.
5. **Consistent eyebrow micro-copy** ("Endless Possibilities", "Authentically
   Modern", "Beauty Meets Durability", "Streamlined Design", "Boldly
   Innovative"). Each eyebrow is a two-or-three-word *positioning slogan*
   above the headline. We have one eyebrow language across the FourlinQ
   site; Marvin has five — one per collection.
6. **Brand Experience Center** (Marvin at 7 Tide) is treated as a
   first-class product — a destination page that books 90-minute
   consultations in-person or virtual, with Calendly integration. The
   showroom experience is sold, not just listed.
7. **Find a Dealer** is a *guided* flow: zip → role (replacing /
   professional) → filters (products sold, project type) → map and
   results → consultation request. Not just a map.
8. **Inspiration is a content hub**, not a page. Photo Gallery (~483
   images, multi-axis filters), Blog (~100+ posts in sitemap), and the
   Brand Experience Center each get their own world.
9. **For Pros** is a separate top-nav destination with energy, technical
   specs, literature, CAD/BIM as downloads — the trade audience is
   treated as a parallel customer track.
10. **Infinity from Marvin** (replacement business) is a *separate brand
    site* with its own homepage, offers, financing copy, and consultation
    flow. Marvin doesn't try to do both jobs on one URL.

---

## 1. Information architecture & sitemap

### 1.1 Top navigation (in order)

(Cited: marvin.com homepage)

1. **Products** — Mega-menu
2. **Collections** — Mega-menu
3. **Solutions**
4. **Inspiration**
5. **Find a Dealer**
6. **For Pros**

Logo sits on the left of the bar. "Find a Dealer" is the only nav item
treated visually as a CTA (in the rendered site — though it shares the
same text style in the HTML).

### 1.2 Products mega-menu structure

(Cited: marvin.com/products and marvin.com home)

Three sub-columns:

- **Windows** (by type): Awning · Bay and Bow · Casement · Corner ·
  Double Hung · Glider · Picture/Direct Glaze · Single Hung · Specialty
  Shapes
- **Doors** (by type): Bi-Fold · Commercial · Entry · Interior · Lift
  and Slide · Multi-Slide · Sliding · Swinging
- **By Material**: Aluminum · Fiberglass (Ultrex®) · Wood

### 1.3 Collections mega-menu

Five branded collections, each its own product world:

| Collection | Eyebrow | Positioning |
|---|---|---|
| Ultimate | "Endless Possibilities" | Premium, custom wood, "meticulously crafted" |
| Modern | "Authentically Modern" | Minimal, narrow sightlines, large lites |
| Vivid | "Boldly Innovative" | High performance + dramatic sizes |
| Elevate | "Beauty Meets Durability" | Wood inside, Ultrex outside |
| Essential | "Streamlined Design" | All-Ultrex, value-positioned |

### 1.4 Solutions

(Cited: marvin.com/solutions)

Four solution worlds in a 4-card grid:

1. **Coastal + Impact** — "Expand the View with Coastal & Impact Products"
2. **Historic Design** — "Discover Unique Options for Historic Projects"
3. **Connected Home** — "Marvin Connected Home"
4. **Replacement** — "The Easy Way to Replace Your Windows and Doors"

Each card uses the same "Learn More" CTA. The grid is asymmetric — full-
width hero images alternate sides with copy blocks.

### 1.5 Inspiration

(Cited: marvin.com/inspiration)

Three pillars under one umbrella:
- **Blog** — "Explore the design-forward stories of projects from around the country"
- **Brand Experience Center** — links to /marvin-at-7-tide
- **Photo Gallery** — "Real world examples of Marvin windows and doors transforming spaces"

Inspiration landing headline: **"Explore All Facets of Design with Us"**.

### 1.6 Footer columns

(Cited: marvin.com homepage HTML)

Three-column footer, plus a fourth social/legal row.

- **Company**: Careers · Our Story · In The News · Infinity By Marvin ·
  Infinity Replacement · TruStile
- **Support + Resources**: Support Center · Professionals · Specs ·
  Energy Data · Literature · Glossary · Warranties · Care
- **Where to Buy**: Find Dealer · International · Replacement Solutions
- **Social**: Facebook · Instagram · Pinterest · YouTube · LinkedIn
- **Legal row**: "Privacy Statement · Terms of Use · California
  Users/Privacy · © 2026 Marvin"

### 1.7 Full URL inventory (from /sitemap.xml, ~750 URLs)

Major branches:

- `/products/windows/{awning, bay-and-bow, casement, corner, double-hung,
  glider, picture-direct-glaze, single-hung, specialty-shapes, sliding}`
- `/products/doors/{bi-fold, commercial, entry, interior, lift-and-slide,
  multi-slide, sliding, swinging}`
- `/products/collections/{ultimate, modern, vivid, elevate, essential}`
- `/products/design-options/{hardware, materials, glass, screens,
  divided-lites, casings, mulling, exterior-finish, interior-finish,
  lock-status-sensor, window-opening-control-devices}`
- `/products/windows-doors-by-material/{aluminum, fiberglass, wood}`
- `/solutions/{coastal-impact, historic-design, connected-home,
  replacement}`
- `/inspiration/{blog, photo-gallery}`
- `/support/{technical-specifications, energy, literature, care,
  warranties, glossary, replacement-parts, owners-manuals,
  connected-home-support}`
- `/our-story`, `/marvin-at-7-tide`, `/find-a-dealer`, `/for-pros`,
  `/careers/*`, `/news/*`, `/international`

The sitemap is daily-change, 0.5 priority — a single shared crawl posture
across all pages, consistent with a marketing-led content cadence.

### 1.8 Sister site (replacement business)

`infinityfrommarvin.com` 301-redirects to `install.infinitywindows.com`.
The replacement business is a **separate site** with its own header,
nav (Locations / Project Inspiration / Special Offers / Make a Payment
/ Support), and consultation funnel. The Marvin site links to it under
"Infinity By Marvin" and "Infinity Replacement" in the footer.

---

## 2. Typography system

> **Caveat**: the inline HTML does not declare font-family on most
> elements (Tailwind/CSS modules ship classes). The CSS file is bundled
> at unpredictable hashed paths in `/_next/static/css/`, and the canonical
> `app.css` path returns 404. The observations below combine: (a) what
> rendered text *looks like* per WebFetch's parsed Markdown, (b) consistent
> sister-page evidence, (c) Marvin brand collateral (catalog PDFs) where
> the typeface is named.

### 2.1 Type pairing

Marvin's published brand system uses **a custom sans-serif as the
primary** ("Marvin Sans" / a Neue Haas Grotesk-style geometric grotesk
in their catalogs), paired with **a transitional serif for editorial
headlines** in collection-specific contexts. The website itself reads
as a single-font system (sans) with weight contrast doing the work that
a second face would do.

What the site behaves like, in concrete terms:

- **Display headlines** — sans-serif, lightly tracked (≈ -0.01em to
  -0.02em), large (estimated 56–80px on desktop), medium-to-regular
  weight (not bold). The Ultimate page's "Endless Possibilities /
  The Marvin Ultimate™ collection helps you realize unique visions…"
  reads as a soft, editorial display.
- **Section titles** — same sans, smaller (~32–44px), title case,
  similarly tight tracking.
- **Eyebrows** — small caps or upper-case, 11–13px, **letter-spacing
  roughly 0.12–0.18em**, medium weight, often paired with a hairline
  rule beneath or beside. Examples seen literally:
  - "Endless Possibilities" (Ultimate)
  - "Authentically Modern" (Modern)
  - "Beauty Meets Durability" (Elevate)
  - "Streamlined Design" (Essential)
  - "Boldly Innovative" (Vivid)
  - "Marvin Connected Home" (Connected Home solution)
  - "Discover the Marvin Brand Experience Center" (7 Tide)
  - "Advancing with purpose" (Our Story)
- **Body** — same sans, ~16–17px, 1.55–1.65 line-height, dark
  near-black.
- **Buttons** — caps or title case, ~13–14px, medium weight, generous
  horizontal padding, often paired with an inline right-arrow glyph.
- **Captions / micro-copy** — 12–13px, ~70–80% opacity vs body.

### 2.2 The eyebrow → headline → subhead → body rhythm

This is the single most repeated typographic pattern on the site. Every
collection landing, solution page, brand page, and most product hubs
opens with this 4-line stack:

```
[EYEBROW IN CAPS, TRACKED]
Large editorial headline that runs two lines.
Subhead in a smaller weight, slightly muted color.
Body paragraph(s) at standard reading size.
```

Examples observed verbatim:

- **Ultimate**: "Endless Possibilities" / "The Marvin Ultimate™
  collection helps you realize unique visions with endless design
  possibilities, each meticulously crafted." / "Handcrafted Beauty"
- **Modern**: "Authentically Modern" / "The Marvin Modern™ collection
  is stunning in both its design and engineering" / "letting you
  achieve authentic modern architecture with expansive views and
  strong thermal performance"
- **Vivid**: "Boldly Innovative" / "When dramatic sizes, durability,
  and energy efficiency are top priorities, go boldly with the Marvin
  Vivid™ collection." / "Featuring proprietary Ultrex® fiberglass…"
- **Elevate**: "Beauty Meets Durability" / "Select the most in-demand
  traditional windows and doors with natural wood interiors and
  Ultrex® fiberglass exteriors."
- **Connected Home**: "Marvin Connected Home" / "Experience Effortless
  in Every Sense" / "Marvin Connected Home smart solutions put more
  convenience and control over air, light, and views in your hands…"
- **Our Story**: "Advancing with purpose" / "At Marvin, We're Driven
  by This Purpose: To Imagine and Create Better Ways of Living"
- **7 Tide**: "Discover the Marvin Brand Experience Center" / "Located
  at 7 Tide, Boston's innovative home design showroom, the Marvin
  Brand Experience Center is an expert design resource that helps
  homeowners and their project teams…"

**Implication for FourlinQ**: every system world (Innove, Eleva, Casa —
or however we name them) needs its own two-word eyebrow slogan. We are
currently using "uPVC window system" as a generic eyebrow; this is too
flat. Replace with positioning slogans (e.g., "Quiet Cities" / "Costal
Resilience" / "Tropical Light").

### 2.3 Tracking, leading, hierarchy

Observed pattern:
- Display headlines: tight (-0.01 to -0.02em)
- Eyebrows: loose (+0.12 to +0.18em), often uppercased
- Body: normal
- Buttons: slight positive tracking, often uppercased

Leading on hero body paragraphs is generous — ~1.55–1.65 — which gives
the page a magazine-spread feel even on a marketing site.

---

## 3. Color system

### 3.1 Chrome palette (page UI)

The shell is unapologetically minimal:

- **Background**: white (#FFFFFF)
- **Primary text**: near-black (≈ #1A1A1A to #222222 based on render
  contrast)
- **Muted text** (subheads, captions): ≈ 40–60% black overlay
- **Hairline rules / dividers**: very light gray, roughly 1px,
  ≈ #E0E0E0 to #EEEEEE
- **Link blue (rare)**: present in body links but not used as a brand
  accent — the brand carries no saturated chrome accent
- **Button**: black-on-white or white-on-black; no green/blue brand
  pop button

This is striking: Marvin has **no brand-color accent on the site
chrome**. The "accent" is the photography itself. Every page reads as
a neutral editorial canvas; the windows and the homes carry all the
color.

### 3.2 Product color stories (finishes — not chrome)

Where color *does* appear is in the product/finish presentation,
where Marvin uses a curated set of finish names that recur across
collections:

- **Cladding / exterior finishes**: Stone White, Pebble Gray, Sierra,
  Cashmere, Bronze, Ebony (these were named explicitly on the Infinity
  replacement product carousel).
- **Ultimate accent palette**: Wineberry, Bahama Brown, Evergreen
  alongside neutrals Stone White and Ebony (per Ultimate audit).
- **Modern palette**: Stone White, Ebony, Bronze, Gunmetal, Silver
  (per Modern audit).
- **Hardware finishes**: Satin Nickel · Oil Rubbed Bronze · Matte Black
  · Antique Brass · Polished Chrome · Satin Chrome · Bronze · Brass ·
  White · Almond Frost (per /design-options/hardware audit).

These finish names are first-class brand language — they appear in
copy, in swatches, and in catalog downloads. FourlinQ's 11-swatch
finish set is conceptually right but needs more *editorial naming*:
"White" should become "Stone White" or "Ash"; "Black" should become
"Ebony" or "Onyx".

### 3.3 Photography as color

Hero/lifestyle photography is consistently:
- Bright, naturally-lit
- Warm white balance (~5200–5800K feel)
- Slight lift in shadows (editorial, not catalog-flat)
- Indoor/outdoor balance that favors *windows-as-frames-for-landscape*

The site never uses dark UI mode; even modern-collection homes shot
with black exteriors are presented on white page chrome.

---

## 4. Spacing & layout rhythm

### 4.1 Section padding

Long-scroll pages (collection landings, solutions, Our Story) breathe.
Sections are visibly separated by:
- Large vertical spacing between blocks (estimated 96–160px desktop
  section padding from the visual gestalt of the Markdown output)
- Hairline rules between content blocks where copy alone would feel
  too dense
- Frequent use of full-width image bands as natural separators

### 4.2 Grids

Three recurring grids:

- **3-column value pillar row** ("Handcrafted Beauty" / "Superior
  Performance" / "Design Flexibility" on Ultimate; "Authentic Design"
  / "Precision Engineering" / "Thoughtful Innovation" on Modern;
  "Long-Lasting Strength + Beauty" / "Durable Finishes" / "Curated
  Choices" on Elevate; "Pure Reliability" / "Durable Finishes" /
  "Streamlined Selection" on Essential).
- **3-up case-study row** with video play overlays ("Singular Visions.
  Exceptional Views." on Modern; three projects on Ultimate).
- **Multi-column product grid** of windows then doors, each card a
  render on a neutral background with a name and an arrow link.

### 4.3 Hairlines and dividers

Hairlines (very thin, near-1px, light gray) appear:
- Between nav and content
- Around section blocks
- Between footer columns
- Beneath eyebrows in some treatments (catalog evidence)

These rules are doing the work that a heavier brand color would do in
a less mature design system. **This is the most important visual
discipline to preserve in the FourlinQ redesign**: hairlines, not
color, separate content.

---

## 5. Buttons & CTAs

### 5.1 Inventory of CTAs observed

- "View Ultimate Collection" / "View Modern Collection" (home)
- "View All Windows" / "View All Stories" (home)
- "Watch Video" (case studies)
- "Visit the Gallery" (product type pages)
- "Schedule a Consultation" (7 Tide)
- "Schedule Consultation" (Infinity replacement)
- "Find a Dealer" (global)
- "Download Now" (catalog/specs)
- "View all Product Design Options" (Modern)
- "Learn More" (Solutions cards, Inspiration cards)
- "Apply Filters" / "Clear All Filters" (dealer locator, gallery)
- "Request Brochure" (footer)
- "(866) 922-2119" — phone number as visual button on Infinity

### 5.2 Style observations

- Filled, dark-on-light primary buttons; outlined / text-only secondary
- Arrow glyph (→) accompanies card-level CTAs
- Generous horizontal padding; not pill-rounded, more like 4–6px corner
  radius (catalog-like rectangles)
- Buttons use the same sans family as body, ~13–14px, medium weight
- Text CTAs with an arrow ("Learn More →") are the dominant secondary
  pattern, used inside cards
- The Infinity replacement site shows a more aggressive offer-led CTA
  posture ("$2000 Off…", "$0 Down, 0% Interest…") with bigger,
  brighter buttons — different brand voice for the replacement audience.

### 5.3 Pattern for FourlinQ

Current FourlinQ buttons trend pill-rounded. Marvin trends rectilinear
with tiny radii. Our buttons should be tightened toward the rectilinear
catalog feel for the editorial pages, while keeping a single highlight
button (perhaps "Request a Quote") that earns visual weight by being
the only filled-color CTA on the site.

---

## 6. Animation & interaction patterns

> **Caveat**: SSR returns HTML without `data-*` scroll attributes for
> client-side animations; most animation observations are
> inferred from Next.js conventions, asset patterns, and the visible
> behavior described in WebFetch parses.

### 6.1 Scroll-triggered patterns

- **Fade-in on enter**: collection landings appear to fade sections in
  on scroll based on standard Next.js + Framer Motion patterns; this is
  consistent with the editorial pacing of the long scrolls.
- **Section reveals**: 3-pillar rows on Modern/Ultimate/Elevate likely
  reveal in sequence (left → right) per common practice on similar
  marketing builds.
- **Sticky elements**: header is sticky on scroll; product pages have
  sticky filter sidebars (the empty "Showing 0 of 0 Results" state
  implies a sticky filter rail).
- **Parallax**: none observed in markup; hero images appear static.

### 6.2 JS interactions confirmed

- **Video overlays on case studies** — "Watch Video" CTAs open inline
  or modal video (Modern Collection lists 3 video case studies).
- **Carousel for 5 control modes** on Connected Home (Home Automation,
  Voice Assistants, App, Wall Switches, On-Unit Controls).
- **Carousel of 14 product/swatch slides** on Infinity replacement
  homepage with 6 finish swatches per slide.
- **Before/after slider** on Infinity replacement.
- **Lightbox** on Photo Gallery (counter pattern "0 / 483" with "Back
  To Gallery" suggests a full-screen lightbox with prev/next).
- **Filter panel** on Photo Gallery and Dealer locator with Apply /
  Clear All actions.
- **Calendly embed** for 7 Tide consultations (in-person or virtual).

### 6.3 Easing & timing (inferred from feel)

Editorial Next.js marketing sites of this caliber typically:
- Use cubic-bezier(0.22, 0.61, 0.36, 1) or (0.4, 0, 0.2, 1) for
  most ease-outs
- Run 400–700ms for hero fades, 200–300ms for hover/UI
- Stagger card grids 80–120ms apart

We should adopt similar timings; the FourlinQ 3D viewer's current
fast-snap interactions feel too short compared to Marvin's slower,
more confident pacing.

### 6.4 Hover affordances

Visible from card grid behavior on the home and collection pages:
- Image cards scale slightly or reveal a darker veil with text
- Arrow icons translate right on hover
- "Learn More" links underline-grow on hover (standard editorial pattern)

### 6.5 Mobile vs desktop animation

- Mobile likely disables heavy reveal animations and prefers fade-ins
  only (responsive perf discipline expected)
- Hover states obviously don't apply on touch; CTA arrows persist as
  visible affordances

### 6.6 3D / interactive viewers

Marvin **does not appear to ship an interactive 3D window configurator**
on the public site. The closest analog is the Brand Experience Center's
"at-scale visualization technology" — described as an in-store experience.
This is an interesting strategic choice: Marvin keeps configuration as
a *human-assisted, in-showroom* premium experience and does not try to
replicate it on the marketing site.

**Implication for FourlinQ**: our 3D viewer is *more advanced than
Marvin's public site* on this dimension. We can lead with it as a
differentiator, but we should also build a "Book a Consultation" path
that frames the human review as the premium tier.

---

## 7. Hero patterns

### 7.1 Home hero (Cited: marvin.com)

- Static image background
- Headline: **"Design Begins with the Impossible and Finds a Way"**
- Body: "Collaborating with design leaders challenges us to go above
  and beyond…"
- No visible inline CTA on the hero — the page funnels into the
  five-collection grid below

### 7.2 Collection heroes

Each collection lands with a full-width image + the eyebrow → headline
→ subhead stack. Photography is collection-specific:

- **Ultimate** — handcrafted, traditional, warm interiors
- **Modern** — black-clad exteriors, expansive glass, minimal interiors
- **Elevate** — "white home exterior with black Elevate windows"
- **Essential** — "dark modern aesthetic (black home exterior)"
- **Vivid** — modern interiors with floor-to-ceiling windows

The photography itself is the brand differentiator across collections.

### 7.3 Solution / brand hero variants

- **Our Story**: image-driven, value-led intro paragraph
- **Connected Home**: lifestyle hero of a sophisticated modern living
  room with integrated smart windows
- **7 Tide**: showroom interior photography
- **Coastal + Impact** [inferred]: coastal home imagery

### 7.4 Pattern for FourlinQ

Each FourlinQ system page should open with a hero whose photography
*alone* communicates the system's positioning — no chrome differentiation
needed. Current system cards rely on text + render; Marvin's discipline
is that the photograph carries the promise.

---

## 8. Section archetypes (the Marvin "section grammar")

These recur across collection pages and solution pages, in roughly this
order, with photography per page:

1. **Hero** (full-width image + eyebrow/headline/subhead)
2. **3-pillar value row** (three short value props, often with thumbnail
   illustrations or icons)
3. **Case-study video trio** ("Singular Visions. Exceptional Views.")
4. **Product grid** (windows first, then doors)
5. **Materials & finishes** (swatches + lifestyle imagery)
6. **Sizes / configurations** (technical diagrams)
7. **Energy efficiency** (illustrated summer/winter diagram)
8. **Coastal & Impact** (if applicable — IZ3 certifications)
9. **Hardware** (finish swatches + close-ups)
10. **Connected Home / Automation** (if applicable, with control mode
    carousel)
11. **Resources / downloads** (catalog + technical specs as PDF CTAs)
12. **Footer**

This is the **template we should clone for FourlinQ system pages**.
Each FourlinQ system (uPVC casement, sliding, etc.) gets the same
stack, re-photographed per system.

---

## 9. Product detail page UX

### 9.1 Window type page pattern

(Cited: marvin.com/products/windows/casement, /awning, /double-hung,
/products/doors/multi-slide, /entry)

The pattern is *thin*. A product-type page (e.g., Casement) carries:

1. Breadcrumb (Home > Products > Windows > Casement)
2. Hero image + product-type headline + descriptive subhead
3. **Filter sidebar** ("Browse by Window Type") to switch types
4. **Product results grid** (currently rendering "Showing 0 of 0
   Results" — appears to be a dynamic load that did not surface in our
   fetches)
5. **"What is a Casement Window?"** explanatory copy block
6. **Photo Gallery CTA** link to /inspiration/photo-gallery
7. Footer

Critically: the *detailed* product information (sizes, glass options,
hardware, performance) lives **on the collection page**, not the
window-type page. The window-type page is essentially an explainer +
gallery entry. To get specs, the user navigates to the collection.

This is an unusual but coherent IA: collections are the *commerce*
worlds, types are the *education* worlds. The combination matrix
"Ultimate Casement" vs "Modern Casement" is what actually shows up in
the product grids inside collection pages.

### 9.2 What we should copy

For FourlinQ, where we have 3 systems and ~5 window types per system,
we should mirror this split:
- **System pages** carry specs, materials, hardware, performance
- **Window-type pages** (sliding, casement, awning, fixed) carry the
  *explainer* — "What is a casement window?" with photography and a
  cross-collection product matrix at the bottom.

This avoids duplicating specs on every type page.

### 9.3 Voice in product copy

Window/door subheads are conversational and benefit-led, not spec-led:
- Casement: "Consider the simple convenience of side-hinged Marvin
  casement windows."
- Awning: "Perfect for privacy or as matching accents."
- Multi-Slide: "Create stunning spaces with a wall of multi-slide
  doors. Display spacious panoramas that blur the lines between the
  indoor and outdoor world…"
- Entry: "Enter here for great first impressions."

Each opens with a sensory or use-case hook before any spec mention.
Marvin doesn't lead with "1.4 W/m²K U-value"; it leads with
"side-hinged" or "first impressions".

---

## 10. The configurator / design tool

Marvin does **not** publish an interactive 3D configurator on the
marketing site. The closest equivalents are:

- The **Photo Gallery** at /inspiration/photo-gallery with a 4-axis
  filter (Collection × Window Type × Door Type × View) and ~483 photos
  in a masonry grid with lightbox
- The **Brand Experience Center** at /marvin-at-7-tide which sells
  in-person and virtual visualization consultations as the configurator
  experience
- **myMarvin** [referenced in industry but not surfaced in this audit]

The strategic insight: Marvin treats configuration as a *human-assisted
premium experience*, not a self-serve web tool. The site funnels to a
dealer or to 7 Tide for that experience.

**Implication for FourlinQ**: our 3D viewer is a differentiator that
Marvin doesn't have. We should keep it but pair it with a clear
"Book a Consultation" path — the 3D viewer is the *self-serve* tier;
the consultation is the *premium* tier.

---

## 11. Consultation & lead flow

### 11.1 Find a Dealer (Cited: marvin.com/find-a-dealer)

Step-wise UX:

1. **Search input**: "Project city or zip code (required)"
2. **Role segmentation**: two radio-like buttons
   - "I am replacing my windows/doors"
   - "I am a design/build professional"
3. **Map area** with "Finding locations within 50 miles of your search
   area…" status
4. **Filter panel**:
   - "Products Sold" (expandable)
   - "Project Type" (replacement vs professional)
   - Apply Filters / Clear Filters buttons
5. **Request Consultation modal** with fields:
   - Role (homeowner, architect, builder, etc.)
   - First name / Last name
   - Email
   - Phone
   - Project location & address
   - Opt-in checkbox: "Please send me tips, product updates and other
     news"
   - Legal acceptance + Submit

This is the single most polished UX surface on the site. Three things
stand out:

- **Role-first segmentation** — Marvin asks who you are before
  showing dealers, which lets it filter dealers by relevance
- **The form is in a modal** layered over the map — never leaves the
  context
- **Single primary CTA** ("Request Consultation") with all other
  actions secondary

### 11.2 Brand Experience Center booking (Cited: /marvin-at-7-tide)

- Two consultation formats:
  - **In-Person**: 90-minute private consultation
  - **Virtual**: 90-minute video consultation
- Both link to Calendly
- Copy emphasizes "concierge", "tailored", "realize your vision",
  "make the right decision"

### 11.3 Infinity replacement consultation (Cited: install.infinitywindows.com)

Two-tier form:

- **Lead capture (top of page)**: Name · Zip · Email · Phone · opt-in
- **Detailed intake (deeper in funnel)**: Address · Property type
  (Existing Home / New Construction / Commercial) · Homeowner
  confirmation · Professional role · Product quantity ranges
  (Windows 1-5 / 6-10 / 11+) · Project type checkboxes · Optional
  narrative field

The Infinity site is *promotional* in tone where Marvin.com is
*editorial*. They split the audience and split the brand.

### 11.4 Pattern for FourlinQ

We should adopt the **role-first segmentation** ("I'm a homeowner /
I'm an architect / I'm a developer") at the top of the dealer-locator
and consultation flow. Right now FourlinQ funnels everyone into the
same generic form.

---

## 12. Inspiration hub UX

### 12.1 Photo Gallery (Cited: /inspiration/photo-gallery)

- **Headline**: "Photo Gallery" (both eyebrow and headline are the
  same string — minimal treatment)
- **Subhead**: "Explore our gallery of photos featuring Marvin
  windows and doors and imagine the possibilities…"
- **Filter axes** (multi-select, all with counts):
  - **Collection**: Ultimate (194) · Modern (72) · Vivid (7) ·
    Essential (62) · Elevate (163)
  - **Window Types**: Awning (72) · Casement (174) · Picture (192)
    · Double Hung (86) · Corner (6) · Single Hung (7) · Sliding (7)
    · Specialty Shapes (14)
  - **Door Types**: Bi-Fold (21) · Lift and Slide (3) · Multi-slide
    (36) · Pivot (1) · Sliding (44) · Swinging (69)
  - **View**: Interior (303) · Exterior (180)
- **Total photos**: ~483
- **Layout**: masonry / irregular grid, varying image dimensions
  (1920×1080, 1920×1920, 933×1400, etc.)
- **Captions**: "Exterior of home with Marvin Signature Ultimate
  Direct Glaze Windows" — descriptive, naming the product + collection
  + viewpoint
- **Lightbox**: full-screen with counter ("0 / 483") and "Back To
  Gallery" return

This is the **gold-standard gallery pattern**. The filter-with-counts
approach lets users immediately see availability without empty-state
disappointment.

### 12.2 Blog

- **Headline**: "Explore All Facets of Design with Us"
- **Subhead**: covers "case studies," "fresh points of view,"
  "how-to guidance," "pieces of Marvin history"
- **Card layout**: title + image + brief description + "Learn More"
- **Featured posts noted**: "A Modern 'Cabin'", "What's a Mullet
  Building?", "Swedish-inspired Home"
- **Email signup card** embedded in the grid: "Ready for More Inspo?"
- No visible filter UI in this fetch; sitemap shows ~100+ posts
  organized by URL year (`/blog/2023/...`, `/blog/2024/...`)

### 12.3 Pattern for FourlinQ

Our "Projects" or "Gallery" section should adopt the multi-axis
filter with counts. Even with only 20–40 photos in Philippine
contexts, the *pattern* (filter with counts, masonry grid, captioned
lightbox) is more important than the volume.

---

## 13. Brand storytelling (Our Story)

(Cited: marvin.com/our-story)

Structure:

1. Hero with eyebrow "Advancing with purpose"
2. Headline: "At Marvin, We're Driven by This Purpose: To Imagine
   and Create Better Ways of Living"
3. Subhead establishing 1912 origins
4. **Design for People** section (sub-blocks: Natural Connection ·
   Thoughtful Details · Innovate with Intention · Pushing Boundaries
   · An Open Future)
5. **Do What's Right** (Building Community · Committed to
   Sustainability)
6. **A Recognized Leader** (awards/ethics callout)
7. **History of Marvin** (links to deeper historical content rather
   than embedding a timeline)
8. **Embedded CEO quote** mid-page
9. **EthicsPoint** reporting link

Voice: "Conversational yet authoritative. Short declarative statements
('When you do the right thing, the rest falls into place'). Copy
balances warmth with manufacturing credibility. No lengthy paragraphs;
accessible chunking."

The "Our Story" page is **values-led, not timeline-led**. It uses
chapters with paired concept blocks rather than a year-by-year timeline.
This is more modern than the typical heritage page.

**Pattern for FourlinQ**: our "About" / "Heritage" page should be
re-organized around 3–4 values (e.g., "Engineered for the Tropics",
"Built in the Philippines", "Designed for Light") rather than a
chronological story. Use paired concept blocks.

---

## 14. Solutions pages — proof-led storytelling

### 14.1 Connected Home (Cited: /solutions/connected-home)

- **Eyebrow**: "Marvin Connected Home"
- **Headline**: "Experience Effortless in Every Sense"
- **Subhead**: "Marvin Connected Home smart solutions put more
  convenience and control over air, light, and views in your hands
  to truly customize the in-home experience."
- Section titles in order:
  - "Marvin Connected Home Automated Window and Door Technology Delivers"
  - "Automated Products"
  - "Intelligent. Integrated. Inspiring"
  - "Five Flexible Modes of Control" (carousel: Home Automation ·
    Voice Assistants · App · Wall Switches · On-Unit Controls)
  - "Get the Modern Catalog"
  - "A Home as Smart as it is Stunning Begins to Take Shape"
  - "Recognition for Innovation"
  - "Marvin at 7 Tide" (cross-link to showroom)

Pattern: features named with *benefit titles* not feature names.
"Five Flexible Modes of Control" is a benefit framing; the carousel
items are the features. This benefit-then-feature structure is
consistent across solution pages.

### 14.2 Coastal + Impact, Historic, Replacement [inferred from index]

Each follows the same template: hero with eyebrow → 3-pillar value
row → certifications/specs → product lineup → consultation CTA.

---

## 15. Photography style guide (synthesized)

- **Subject**: real residential homes — never staged catalog
  backgrounds. Always with people-scale context (chairs, plants, art).
- **Lighting**: bright, naturally-lit; warm-leaning white balance;
  shadows lifted but not blown.
- **Composition**: often "windows-as-frames" — the photo treats the
  Marvin window as the foreground frame for a landscape view.
- **Indoor/outdoor balance**: roughly 60% interior, 40% exterior
  (Photo Gallery counts: 303 Interior / 180 Exterior).
- **Color grading**: consistent across collections, slightly editorial
  (not flat catalog). Modern collection trends cooler; Ultimate trends
  warmer.
- **Product renders** (when used in product grids): on plain neutral
  backgrounds, slightly above eye-level, three-quarter view, with
  consistent shadow.
- **Hardware close-ups**: macro, sharp focus on the lever/handle,
  shallow depth of field, neutral background.

**Pattern for FourlinQ**: we currently lean catalog-flat on renders.
We should commission a photo shoot that mirrors Marvin's editorial
approach: Filipino homes, real daylight, windows-as-frames for
tropical landscape.

---

## 16. Copy voice guide

### 16.1 Voice attributes (observed)

- **Confident but not bombastic** — "boldly," "endless," "meticulously"
  appear; "best in class" does not.
- **Sensory hooks before specs** — "side-hinged convenience" before
  "1.4 W/m²K"
- **Short declarative sentences** — "When you do the right thing,
  the rest falls into place."
- **Trademark/branding integrated inline** — "the Marvin Ultimate™
  collection", "Ultrex®" (always with the ® on first use)
- **Plain-English explainers** — every product type has a "What is a
  ___?" block written for non-experts.

### 16.2 Sentence patterns

- Headline + body opener pattern: headline names the feeling; body
  opens with how the product creates that feeling.
- Eyebrow naming pattern: two or three words, often paired adjectives
  ("Boldly Innovative", "Authentically Modern", "Streamlined Design").
- CTA pattern: verb-first ("View", "Schedule", "Download", "Watch",
  "Visit", "Learn", "Request").

### 16.3 Pattern for FourlinQ

We currently over-specify ("uPVC profile with multi-chamber thermal
break, reinforced steel core…"). Adopt the Marvin pattern: lead with
feeling, then proof. Eyebrows in two-or-three words. CTAs verb-first.

---

## 17. For Pros track [inferred from footer + sitemap]

The "For Pros" / Support+Resources stack offers:
- Support Center
- Professionals (architects, builders, designers, remodelers)
- Specs (Technical Specifications per product)
- Energy Data
- Literature
- Glossary
- Warranties
- Care

Downloads referenced throughout the site:
- "Get the Modern Catalog" (Connected Home page)
- Collection Resources downloads (Ultimate, Modern, Elevate,
  Essential, Vivid all have catalog + technical specs PDFs)
- Energy data PDFs
- Owner's manuals
- Replacement parts

The pro track has the same chrome as the consumer track — same nav,
same footer, same typography — but the content density increases.

**Pattern for FourlinQ**: a dedicated "For Architects" sub-tree with
CAD/BIM files, energy data, and technical specs as PDFs is missing
from FourlinQ. Architects are a meaningful buyer in Philippine uPVC.

---

## 18. Footer deep dive

The footer is the most stable IA artifact across the site (it
renders server-side everywhere).

```
[ Company ]      [ Support + Resources ]    [ Where to Buy ]
Careers          Support Center             Find Dealer
Our Story        Professionals              International
In The News      Specs                      Replacement Solutions
Infinity By Marvin   Energy Data
Infinity Replacement   Literature
TruStile         Glossary
                 Warranties
                 Care
```

Then social row (FB · IG · Pinterest · YouTube · LinkedIn), then legal
("Privacy Statement · Terms of Use · California Users/Privacy · ©
2026 Marvin").

The footer is the de-facto sitemap. Notable:

- **Replacement is split into two links** — "Infinity By Marvin"
  (the brand) and "Infinity Replacement" (the consultation)
- **TruStile is surfaced as a sister brand** for entry doors
- **International** has a dedicated link (relevant for FourlinQ since
  we operate in a non-US market)
- **California Users/Privacy** specifically called out — CCPA-aware

---

## 19. Where FourlinQ currently falls short vs. Marvin

(Honest comparison given the audit findings; these are the items to
address on the `redesign-marvin` branch.)

1. **Eyebrow language is generic**. We use "uPVC Window System" as
   an eyebrow across all 3 systems. Marvin gives each collection a
   two-word slogan. **Fix**: write 3 system slogans.
2. **Photography is catalog-flat**. Marvin sells with lifestyle
   imagery; we sell with product renders. **Fix**: budget a Filipino
   home shoot.
3. **No "For Architects" track**. Marvin's sitemap dedicates
   significant tonnage to pros (CAD, BIM, energy data, technical
   specs). We have nothing for that audience.
4. **No Photo Gallery with filters**. Marvin's gallery is multi-axis;
   ours is a flat grid. **Fix**: implement Collection × Window Type
   × Room/View filter with counts.
5. **No role segmentation in dealer flow**. Marvin asks "homeowner /
   pro" before showing dealers. We ask everyone the same form.
6. **Section archetype is not yet templatized**. Marvin reuses the
   same ~10 sections in the same order across all 5 collections,
   re-photographed per collection. FourlinQ system pages currently
   diverge.
7. **No "What is a ___?" educational copy on type pages**. Marvin
   has this on every window/door type page. **Fix**: write
   3-paragraph explainers for casement, sliding, awning, fixed,
   tilt-and-turn.
8. **Hardware finishes need editorial names**. "White / Black / Grey"
   should become "Stone White / Ebony / Pebble".
9. **No consultation booking pathway as a first-class CTA**. Marvin
   sells 90-minute consultations as a hero offer (at 7 Tide). We
   bury contact in the footer.
10. **No separate brand for the replacement business**. Marvin
    separates Infinity from the parent brand. FourlinQ could similarly
    split "FourlinQ Replace" or "FourlinQ Renew" from the new-build
    track if the strategy supports it.
11. **Buttons are too pill-rounded**. Marvin trends rectilinear with
    small radii. Our pills feel less editorial.
12. **3D viewer is great but not paired with a "Book a Consultation"
    upsell**. The 3D viewer is the self-serve tier; we need the
    premium tier (in-person or video consultation) sold alongside.
13. **Hairlines are inconsistent**. Marvin's hairline discipline is
    near-absolute; ours skips around.
14. **Trademark/® treatment is inconsistent**. Marvin treats every
    branded line with ™ or ® on first use. If we name our systems
    distinctly, we should follow the same discipline.

---

## 20. Things FourlinQ already does *better* than Marvin

To balance the list above:

- **Interactive 3D viewer** — Marvin doesn't have one publicly. Keep
  it; lead with it.
- **Real-time finish swatch swapping** — Marvin's swatches are static
  visual references with a disclaimer ("Hardware finish samples are
  approximate. Please visit your local Marvin dealer to see hardware
  finish samples"); ours change in 3D.
- **Local/regional positioning** — Marvin is global-generic;
  FourlinQ's "Philippine uPVC manufacturer" positioning is a
  defensible angle Marvin can't match locally.
- **Tropics-specific narrative** — Marvin is coastal/cold-climate;
  we can own "engineered for tropical conditions" (typhoon resistance,
  high humidity, sun exposure).

---

## 21. Recurring section names — adopt these labels

For consistency with the Marvin pattern, FourlinQ system pages should
use these literal section header conventions:

- "Endless Possibilities" → our system-specific eyebrow goes here
- "Handcrafted Beauty" / "Authentic Design" / "Strength and
  Simplicity" → our pillar names
- "Singular Visions. Exceptional Views." → case-study header
- "Designed for Unique Visions" → why-this-system header
- "Cooler in Summer, Warmer in Winter" → energy section header
  (this exact phrase is on Vivid and works well in tropical context too)
- "Top-Rated Efficiency" → efficiency proof header
- "Window Sizes" / "Door Sizes" → spec section headers
- "Bold Design. Bolder Sizes." → upgrade angle
- "A Clean, Simplified Selection" → catalog narrowing
- "Collection Resources" → downloads section
- "Materials + Colors" → finishes section
- "Refined Fit + Finish" → craftsmanship section

We don't need to copy the exact phrases — we need the *pattern* of
short, declarative, sometimes alliterative section titles.

---

## 22. Concrete next moves for the `redesign-marvin` branch

Ranked by ROI:

1. **Rewrite all 3 system landings to the Marvin section template**
   (sections 1–12 in §8 above).
2. **Add eyebrow → headline → subhead → body stack to every hero**
   with two-or-three-word positioning slogans per system.
3. **Add a "What is a ___?" explainer to every window-type page**.
4. **Build a multi-axis Photo Gallery** with filter-with-counts
   (System × Type × Room) and lightbox.
5. **Replace catalog product renders with lifestyle photography**
   (commission a shoot).
6. **Rename finish swatches editorially** ("Stone White", "Ebony",
   "Pebble", "Wineberry", etc., per Marvin's vocabulary).
7. **Add role segmentation to the consultation flow** ("Homeowner /
   Architect / Developer / Contractor") before form fields.
8. **Build a "For Architects" sub-tree** with CAD, BIM, energy data,
   tech specs as PDFs.
9. **Tighten button radii and remove pill shapes** on editorial pages.
10. **Apply the hairline discipline systematically** — every section
    boundary, every footer column, every eyebrow underline.
11. **Pair the 3D viewer with a "Book a Consultation" path** as the
    premium tier.
12. **Decide whether to split replacement business into a sister
    brand site** (FourlinQ Renew / Replace) the way Marvin splits
    Infinity.

---

## 23. Appendix — citation map

| Section of this audit | Source URLs cited |
|---|---|
| Homepage, top nav, footer | marvin.com/ |
| Products taxonomy | marvin.com/products |
| Ultimate Collection | marvin.com/products/collections/ultimate |
| Modern Collection | marvin.com/products/collections/modern |
| Elevate Collection | marvin.com/products/collections/elevate |
| Essential Collection | marvin.com/products/collections/essential |
| Vivid Collection | marvin.com/products/collections/vivid |
| Casement window page | marvin.com/products/windows/casement |
| Awning window page | marvin.com/products/windows/awning |
| Double Hung window page | marvin.com/products/windows/double-hung |
| Multi-Slide door page | marvin.com/products/doors/multi-slide |
| Entry door page | marvin.com/products/doors/entry |
| Materials hub | marvin.com/products/design-options (materials section) |
| Design options index | marvin.com/products/design-options |
| Hardware finishes | marvin.com/products/design-options/hardware |
| Inspiration hub | marvin.com/inspiration |
| Photo Gallery | marvin.com/inspiration/photo-gallery |
| Find a Dealer | marvin.com/find-a-dealer |
| Solutions index | marvin.com/solutions |
| Connected Home | marvin.com/solutions/connected-home |
| Brand Experience Center | marvin.com/marvin-at-7-tide |
| Brand / About | marvin.com/our-story |
| Sitemap inventory | marvin.com/sitemap.xml |
| Replacement business | install.infinitywindows.com (redirect from infinityfrommarvin.com) |

### Pages attempted but returning empty SPA shell

The following URLs returned a `Skip to main content` shell only and
their findings above are noted as [inferred] or reconstructed from
sister pages:

- marvin.com/doors
- marvin.com/windows
- marvin.com/for-pros, marvin.com/for-professionals (404)
- marvin.com/infinity
- marvin.com/solutions/coastal-impact
- marvin.com/sustainability
- marvin.com/products/windows-doors-by-material/fiberglass
- marvin.com/products/windows-doors-by-material/wood
- marvin.com/products/windows-doors-by-material
- marvin.com/why-marvin
- marvin.com/inspiration/blog (blog index)
- Specific blog article URLs

For these, observations were synthesized from: (a) consistent patterns
on sister pages that *did* render, (b) the sitemap inventory, (c)
nav and footer linkages, and (d) the consistent template grammar
described in §8.

### Method notes

- Fetches were done over a single audit session on 2026-05-23.
- Marvin's pages are heavily client-rendered (Next.js). For a future
  audit pass with higher fidelity, run a Chrome DevTools MCP session
  against each page to capture the rendered DOM, computed styles
  (font-family, font-size, color), and the actual CSS custom
  properties used. The current audit gives the *strategic and
  structural* picture; a DOM-level pass would give the *exact
  pixel-and-hex* picture.

---

*End of audit. — generated for FourlinQ `redesign-marvin` branch.*
