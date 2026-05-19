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

Pulled from the screenshots Tita sent, my own observation of marvin.com, and general knowledge of the brand's aesthetic system. Values noted as "approx" where measured by eye, not extracted from their CSS.

### 4.1 Typography

| Element | Treatment |
|---|---|
| **Headline serif** | A clean transitional serif used for marketing headlines and collection names. Looks like a custom or licensed serif (not Playfair, more refined). Possible candidates: Söhne Schmal, Untitled Serif, GT Sectra, or their own commission. |
| **Body sans** | Clean humanist sans, mid-weight (400-500). Looks like Söhne, Untitled Sans, or similar grotesque-humanist hybrid. NOT Helvetica, NOT Inter. |
| **Display sizes** | Hero headline ~80-100px desktop, line-height ~1.05, slight negative letter-spacing (~-0.02em). Drops to ~48-56px tablet, ~36-40px mobile. |
| **Section headlines** | ~40-56px desktop, ~32-40px tablet, ~24-28px mobile. |
| **Body** | ~18-20px desktop, ~16-18px mobile. Line-height ~1.55-1.6. Generous. |
| **Captions / eyebrows** | ~12-14px, often uppercase with letter-spacing ~0.1-0.15em. |
| **Hierarchy contrast** | Aggressive — hero is 4-5x body size. Builds editorial pacing. |

### 4.2 Color

| Token | Approx value | Used for |
|---|---|---|
| Page background | Warm off-white `#FAF8F4` (cream tint) | Main canvas |
| Surface (cards) | Same as bg or pure white `#FFFFFF` | Content blocks |
| Primary text | Near-black, slightly warm `#1A1A1A` | Headlines + body |
| Secondary text | `#5A5A5A` neutral mid-grey | Captions, body de-emphasized |
| Border / divider | `#E5E2DC` ultra-light warm grey | Thin section rules |
| Marvin yellow | `#FFD23F`-ish, used **only** for: primary CTA pill, logo icon dot, occasional underline accent | Hard-earned highlight color |
| Accent stripe | Varies (red, brown, charcoal) on Vivid/Modern/Essential collections — a 2-3px colored line under collection titles | Subtle category coding |

**Key principle:** Restraint. Most of the page is neutral. Color earns its place by being rare.

### 4.3 Spacing & layout

| Token | Approx value |
|---|---|
| Content max-width | ~1400px |
| Section vertical padding (desktop) | 120-160px top/bottom |
| Section vertical padding (mobile) | 60-80px |
| Section horizontal gutter (desktop) | 48-64px |
| Section horizontal gutter (mobile) | 20-24px |
| Grid gap (Collections 5-up) | 24-32px |
| Paragraph max-width | 60-70 characters (~640px) |
| Image asymmetry | Many sections use 5/7 or 4/8 split between text and image |

**Key principle:** Whitespace is the layout. Sections breathe; text columns are narrow; images get full or near-full width.

### 4.4 Buttons & CTAs

| Type | Treatment |
|---|---|
| **Primary** | Yellow pill (`background: marvin-yellow`, `color: dark`, `border-radius: 9999px`, `padding: 12-16px 24-32px`, `font-weight: 500`, no shadow). Hover: slight darken. |
| **Secondary** | Plain text + arrow `Learn More →`. No background, no border. Underline appears on hover. |
| **Tertiary nav** | Plain text dropdowns. Animated underline indicator (1-2px bar that slides between items). |

**Key principle:** One CTA per section, max. Secondary actions are inline text + arrow, not buttons. We've been making everything a button.

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

### 4.9 Accent lines & dividers

- **1px or hairline rules** in `#E5E2DC` or similar warm grey, used:
  - Between sections occasionally (most sections don't need them — whitespace separates).
  - Under collection names (sometimes a 2-3px colored accent specific to that collection).
- **Never used as card borders.** Dividers separate sections, they don't enclose content.

### 4.10 Motion

- **Fade-up on scroll:** opacity 0 → 1, translateY 16-24px → 0, duration 600-800ms, ease-out (NOT spring).
- **Hover scale on photos:** 1.02-1.04x, 400-600ms ease-out.
- **Cross-fade carousel:** 1200-1500ms.
- **Page transitions:** Soft fade, not slide.
- **Nothing bounces.** Nothing springs. Nothing wobbles. Premium sites use motion to *settle*, not to attract attention.

### 4.11 Responsive behavior

| Breakpoint | Behavior |
|---|---|
| `>1280px` (desktop large) | 5-column collection grid, full editorial layouts, asymmetric splits |
| `1024-1280px` (desktop) | 4-column grid, same layout structures |
| `768-1024px` (tablet) | 2-3 column grids, section padding scales down ~40%, mega-menu collapses to drawer |
| `<768px` (mobile) | Single-column stack, photos full-width with 20-24px horizontal padding, buttons full-width inside their text block, mega-menu becomes a slide-in drawer with accordion sections, hero crops tighter |
| **Touch behavior** | Carousels become swipeable; hover effects suppressed or replaced with tap-active states |

**Key principle:** Mobile isn't a smaller desktop — it's a different reading rhythm. Photos go full-bleed (no horizontal padding on images), text gets generous padding (24-32px), buttons stretch to fill, vertical pacing tightens.

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

### 6.1 Color

```css
/* Surfaces */
--bg-canvas:     #FAF8F4;  /* warm off-white — primary page bg */
--bg-surface:    #FFFFFF;  /* cards / panels when separation needed */
--bg-dark:       #1A1A1A;  /* footer, dark sections */

/* Text */
--text-primary:   #1A1A1A;
--text-secondary: #5A5A5A;
--text-muted:     #8C8780;
--text-inverse:   #FAF8F4;

/* Borders */
--border-hairline: #E5E2DC;  /* dividers, never card borders */

/* Accent — FourlinQ red, used sparingly */
--accent:         #C8102E;  /* CTAs, single accent stripes, link hovers */
--accent-hover:   #A00D26;
--accent-quiet:   rgba(200,16,46,0.08);  /* faint accent washes */
```

**Color rule:** Red is the *only* color outside the neutral scale. It must earn each appearance — primary CTAs, the "Q" in the logo, one optional accent stripe per page section. NOT on nav links, NOT on hover states everywhere, NOT on chat bubble, NOT on icon badges.

### 6.2 Typography

Candidate stack — pick one before component work starts:

**Option A — "Editorial Refined" (recommended)**
- Headlines: **Fraunces** (variable serif, free, very flexible) or **GT Sectra** (paid)
- Body: **Söhne** (paid) or **Inter** (free, neutral grotesque)

**Option B — "German Engineering"**
- Headlines: **Roboto Serif** or **Lora**
- Body: **Inter** or **IBM Plex Sans**

**Option C — "Stay close to current"**
- Headlines: Keep **Playfair Display** but use it bigger and quieter
- Body: Replace **DM Sans** with **Inter** (more neutral, less startup-y)

Recommendation: **Option A with Fraunces + Inter**. Both free, both excellent on screen, Fraunces has the editorial weight we need without feeling generic.

### 6.3 Scale

```
Hero display:     96px / 1.05 / -0.02em   (desktop)
                  56px / 1.1  / -0.01em   (mobile)
H1:               64px / 1.1
H2:               48px / 1.15
H3:               32px / 1.2
H4:               24px / 1.3
Body lead:        20px / 1.55
Body:             17px / 1.6
Caption:          14px / 1.5
Eyebrow (caps):   12px / 1.4 / 0.12em
```

### 6.4 Spacing

```
Section padding (desktop):  120px top/bottom
Section padding (tablet):    80px
Section padding (mobile):    56px

Content max-width:          1400px
Reading max-width:          640px (paragraph columns)

Grid gaps:                  32px desktop, 16px mobile

Section horizontal padding: 48px desktop, 20px mobile
```

### 6.5 Motion

```css
--ease:           cubic-bezier(0.16, 1, 0.3, 1);    /* ease-out cubic */
--ease-soft:      cubic-bezier(0.4, 0, 0.2, 1);     /* gentle ease-in-out */

--dur-fast:       200ms;   /* hover state changes */
--dur-base:       400ms;   /* most transitions */
--dur-slow:       800ms;   /* fade-ups, page transitions */
--dur-carousel:   1400ms;  /* hero cross-fades */
```

**Motion rule:** No spring. No bounce. No overshoot. Always ease-out. Only animate `opacity` and `transform` (never `width`, `height`, `top`).

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

Block this list. Don't start Phase 1 until each is checked.

- [ ] Typography choice — Option A / B / C from §6.2
- [ ] Accent color confirmation — keep FourlinQ red or shift to a calmer tone (charcoal? a warmer wood-tone?)
- [ ] Hero copy direction — editorial sentence vs. existing "Precision. Performance. Perfection." style (Tita preference; we should propose 3 options)
- [ ] Whether to keep `/design-tool` as a top-level nav item or move it under Systems
- [ ] How aggressive to be on removing chat bubble — Tita didn't mention it but it's visually loud
- [ ] Confirm with Tita: does FourlinQ actually offer Large Panel up to 6m, 90 Series, Lift & Slide, Curtain Wall? If she answers no, those products come out of the spec.

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

*This document is the contract for the redesign. If we drift from it, we update it first.*
