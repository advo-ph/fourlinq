# Competitor Audit — Kenneth & Mock (kennethandmock.com)

**Date:** 2026-05-23
**Auditor for:** FourlinQ (Tita, decision-maker)
**Comparison target:** https://preview.fourlinq.ph
**Verdict (one line):** K&M wins on **authority, scale, editorial credibility, and lockup-with-architects** — but their actual website is a dated WordPress + Revolution Slider build with thin product detail. We can beat them on **product experience, IA clarity, and modernity**. We will lose on **trust signals** unless we make heritage and project credibility our hero.

---

## 0. Executive read for tonight

Tita is right to be worried, but probably for the wrong reason. K&M's site itself is **not** a slick modern interactive experience. It's a 2018-era WordPress install (`/wp-content/uploads/`, Revolution Slider `revslider/sr6`, tabbed bespoke gallery, no SPA, no 3D viewer, no configurator). Their hero is a Revolution Slider image rotation — no video loop, no parallax, no scroll-pinning.

What they DO have, and we don't, is the part that actually closes premium clients:

1. **A 25-year founding date stamped on every page** (1998) and **8,630 projects** as a hard number.
2. **120 named Filipino architects** as a coffee-table book — partnerships, not just clients.
3. **Celebrity + name-brand testimonials** with full attribution (Regine Velasquez, Joey Concepcion, Tom Stockinger as Swiss Finance Chairman, Johnlu Koa as French Baker CEO, Atty. Rene Bañez, Arch. Murphy Tansipek).
4. **Press attribution in news headlines**: `[BLUPRINT]`, `[WALLPAPER*]`, `[TATLER ASIA]`, `[ARCH DAILY]`, `[KANTO]` — these brand-bracketed prefixes act as authority badges in the news index.
5. **Two physical showrooms** (Manila + Cebu) with phone numbers, after-sales hotline, and dedicated sales/cebu/aftersales emails.
6. **An exclusive-partner brand wall** — FOA Porte (Italy), Kömmerling, Vitrocsa, Alumil, Reynaers, BTS, ARLU, Genius System, Freedom Retractable Screens. They sell themselves as the **gateway** to European brands rather than as a maker.
7. **A multi-brand product architecture** — not "uPVC" alone. They span uPVC (Greenline), aluminum (Alutek, Alumil), Italian wood/glass (FOA Porte), frameless minimalist (Vitrocsa), railings (BTS), screens (Genius/Freedom). This is the move that makes their luxury claim defensible.

**The asymmetric play for FourlinQ:** we can't fake 25 years or 8,630 projects by Sunday. We **can** beat them on the things they do badly: thin product detail pages, no configurator, no spec sheets, no architect-facing technical content, no obvious dealer locator UI, no consultation booking flow, dated visual system. The audit below maps every surface.

---

## 1. Information architecture (full site map)

Top nav (six items, all caps, single-level dropdowns):

```
COMPANY                BESPOKE PROJECTS    SYSTEMS                TESTIMONIALS              ARCHITECT'S CORNER         CONTACT US
├ About                                    ├ Greenline Windows    ├ Customization
├ Partners                                 ├ Greenline Doors      ├ Customer Service
└ News                                     ├ Alutek by K&M        └ Protection
                                           ├ FOA Porte
                                           ├ Vitrocsa
                                           ├ Railing Systems
                                           ├ Screen Systems
                                           ├ Profile Colors
                                           └ Upgrades (Protective Film & Glass)
```

Discovered URLs:

- `/` — home (Revolution Slider hero, project banners: Gonzales, Vingson, Lao, Laxamana, Eduardo)
- `/about/` — company history (1998 founding, 8,630 projects, 25+ years)
- `/partners/` — 12 brand partners
- `/news/` — 13+ articles, press-bracketed
- `/bespoke-projects/` — 3-tab gallery (Residential / Commercial / Hospitality), ~40+ images, NO individual project pages
- `/window-door-systems/` — systems overview hub
- `/window-systems/` — Greenline window products
- `/door-systems/` — Greenline door products
- `/alutek-by-knm/` — aluminum sub-brand
- `/foa/` — Italian door sub-brand
- `/vitrocsa-frameless-minimalist-windows/` — frameless aluminum sub-brand
- `/railing-systems/` — BTS railings
- `/screen-systems/` — Genius / Freedom screens
- `/profile-colors/` — finishes
- `/protective-film-glass/` — glass upgrades (`/maintenance-page/` also referenced)
- `/testimonials-customization/` — 13 testimonials
- `/testimonials-customer-service/` — 12 testimonials
- `/testimonials-protection/` — 9 testimonials
- `/building-legacies-the-architects-behind-25-years-of-kennethandmock/` — Architect's Corner
- `/kennethmock-donates-commemorative-book-to-universities-shaping-philippine-architecture/`
- `/aluminium-frame-can-withstand-the-stormiest-nights/`
- `/contact-us/`
- `/careers-opportunities/` (WordPress page exists)
- Plus 10 individual press-bracketed article pages under `/news/`

**No** dealer locator (showrooms hardcoded on contact page). **No** quote form (only generic contact form: Name / Email / Subject / Message). **No** product configurator. **No** project filter beyond a 3-tab categorical split. **No** breadcrumbs detected. **No** search.

**Footer:** Logo + copyright + social (Facebook, Instagram, Pinterest). No column-grid sitemap footer like Marvin or Rehau. Lightweight.

---

## 2. Design system

### 2.1 Typography
- Heading style is ALL-CAPS sans-serif throughout: `KENNETH & MOCK | ABOUT US`, `INNOVATIONS REVOLUTIONARY`, `EXCLUSIVELY PARTNERING WITH THE BEST`, `OUR HOMES`, `NEWS`. Tracking is wide; weight reads as light/regular, not bold.
- Body copy is a sans-serif (likely the WordPress theme default — looks like Lato or Open Sans family). No serif accent anywhere.
- No editorial display serif. No variable-weight nuance. This is a **major weakness** vs Marvin / Vitrocsa / FourlinQ's current direction.
- The brand wordmark `Kenneth&Mock®` appears in body copy with the registered mark inline — used **constantly** as a reinforcement device.

### 2.2 Color palette (observed)
- Background: white / off-white throughout.
- Accent: a muted **warm gold / champagne** appears in the logo and in section dividers (derivable from `Kenneth-Mock-Logo-Sticky.png` — looks ~`#B8985E` to `#C4A668` range, not exactly verifiable without DOM inspection).
- Body text: near-black, not pure black.
- No vivid accents. No red CTAs. The palette is **deliberately muted** — luxe-by-restraint.

### 2.3 Spacing rhythm
- Long-scrolling pages with image-heavy sections, but the section dividers are visually weak — no consistent vertical-rhythm token. Sections often pile up without enough breathing room compared with editorial competitors (Marvin, Vitrocsa).
- No visible hairline rules between sections. No accent lines.

### 2.4 Logo lockup
- Wordmark + registered mark, served as a single PNG (`Kenneth-Mock-Logo-Sticky.png`). Not SVG. Not responsive. Slightly pixelated on retina.

### 2.5 Button styles
- Buttons read as flat rectangles with caps text. Mostly invisible in the markup — site relies on text links and image clicks. No primary/secondary/tertiary button hierarchy visible in source.
- No sticky CTA. No floating contact button. Header has no CTA button at all.

**Verdict:** K&M's visual design system is below FourlinQ's current build in modernity, typography sophistication, and component polish. Their authority comes from **content density and verified social proof**, not visual design.

---

## 3. Animations + interactions

- **Hero:** Revolution Slider plugin (`/wp-content/plugins/revslider/sr6/assets/`), a horizontal image carousel. Static images, no looping video. Banners are project shots (Gonzales, Vingson, Lao, Laxamana, Eduardo). No copy overlay text was captured — banners appear to be image-only with brand wordmark.
- **No scroll-triggered reveals** detected (no Intersection Observer / AOS / Framer Motion fingerprint).
- **No parallax.**
- **No 3D viewer, no configurator, no interactive product explorer.**
- **No hover micro-interactions** on product cards observable in extracted HTML — image grids are static.
- **No mobile-specific animations.** Mobile likely uses the same Revolution Slider with touch swipe.

**This is FourlinQ's clearest win surface.** Our 3D viewer, configurator, and any scroll-triggered storytelling beats K&M decisively. The Marvin-style hero video loop alone closes the visual-modernity gap.

---

## 4. UX flows

### 4.1 Product browsing
- Entry point `/window-door-systems/` is a long-scroll list of 9 system cards: Greenline Windows, Greenline Doors, Alutek, FOA Porte, Vitrocsa, Railing, Screen, Profile Colors, Upgrades.
- Each card has a thumbnail, a one-sentence tagline, and a click-through.
- **No filters. No sorting. No comparison.** You scroll until you find a name you recognize.

### 4.2 Product detail
- `/window-systems/` lists 8 window types (Louvres, Awning, Bay, Fixed Bow, Casement, Corner Butt-Jointed, Sliding, Curtain Wall) with 2-6 project photos in carousel format per type and a **single short paragraph** of copy.
- `/door-systems/` lists 11 door types (Casement, Bi-Fold, Fold and Slide, Sliding Pivot, Sliding, Top-Hung, Paraslide, Lift-Slide Panoramic, Lift-Slide Tower, Motion Sensor, Electronic Door System).
- **NO individual product detail pages.** No spec sheets. No PDF downloads. No U-values, no STC, no max-panel-size table, no glazing options, no hardware options. Just descriptive prose.
- **One** numeric spec point worth stealing: *"Lift-Slide Panoramic — Up to 3.60 meters wide, and 2.70 meters tall."* and *"Lift-Slide Tower — operable doors up to 3.8 meters high."* These are the only quantitative claims on the entire product side.
- Finish browsing on `/profile-colors/` lists ~26 colors organized into Classic (Ivory, White), Modern (Cacao, Charcoal, Fossil, Graphite, Jet Black, Grey Slate, Brushed Gun Metal, Brushed Champagne, Mountain Grey, Alu Stone, Panther Grey), Woodgrain (Carbon, Driftwood, Golden Oak, Havana, Walnut, Wheat), Natural (Chestnut Oak, Grey Oak, Umber Oak, Washed Oak), and a Foil Finishes header with no listed colors.

### 4.3 Project gallery
- `/bespoke-projects/` uses a 3-tab interface (Residential / Commercial / Hospitality).
- ~40 projects shown — **nowhere near the claimed 8,630.** The 8,630 is a stat, not a navigable database.
- No filter by architect, style, location, system, year, or finish.
- No clickable individual project pages from the gallery view.
- Hospitality references real named projects: Grand Hyatt Pool House, Mithi Resort, Grand Manor (Tacloban), Sunset Beach Resort (Puerto Galera), Manila Hotel, Marco Polo Davao, Boracay Mandarin Island Hotel.
- **This is a weakness we can exploit.** The 8,630 claim is editorial — the actual on-site catalog is ~40 images. We can match scale honestly.

### 4.4 Showroom / dealer locator
- No locator. Two showroom addresses are hardcoded on `/contact-us/`:
  - **Manila:** 8 Mercury Avenue, Brgy. Bagumbayan, Quezon City, 1110
  - **Cebu:** 1G Design Center of Cebu, 356A A.S. Fortuna corner P. Remedio Streets, Banilad, Mandaue City, 6014
- 5 phone numbers, 3 emails (`sales@`, `cebu@`, `aftersales@`).
- No "book a consultation" calendar. No appointment slot picker. Just a 4-field contact form.

### 4.5 Contact / quote / consultation
- Generic form: Full Name / Email / Subject / Message. No project-type qualifier. No budget qualifier. No timeline qualifier. No file upload (architect plans).
- CTA copy is bland: *"For inquiries, comments or suggestions, please call or e-mail us"* and *"We will be glad to be of service"*.
- No instant chat, no WhatsApp/Viber button (notable miss for PH market).

### 4.6 Brand / heritage storytelling
- **This is K&M's strongest surface.** `/about/` and `/building-legacies-...` deliver:
  - Founding date: 1998 (`"established in 1998 at the thick of the Asian crisis – a surprising move by the partners in such a time"`)
  - Numeric anchor: 25+ years, 8,630 projects, 120 architects
  - The Architect's Corner page categorizes architects into **The Vanguards** (early pioneers), **The Visionaries** (trailblazers), **The Virtus** (current creative force) — naming taxonomy as honor.
  - Verbatim hero line: *"In the blink of an eye, twenty-five years have passed. Over these two and a half decades, partnerships have flourished..."*
  - Verbatim mission line: *"Kenneth&Mock® remains dedicated to its mission of being the brand of choice for the country's most luxurious homes and bespoke projects."*

---

## 5. Content patterns

### 5.1 Hero formula
Hero pages use a pattern that's worth copying:
- Section eyebrow in caps: `KENNETH & MOCK | ABOUT US`
- Headline in caps: `INNOVATIONS REVOLUTIONARY` or `EXCLUSIVELY PARTNERING WITH THE BEST`
- Body subhead in sentence case prose
- The Kenneth&Mock® mark used **inline as a brand-reinforcement tic** every 2-3 sentences

### 5.2 Section archetypes observed
1. **Product card grid** — thumbnail + tagline + "learn more" (used on /window-door-systems/)
2. **Carousel-of-photos per product** — used on /window-systems/ and /door-systems/
3. **Numbered advantages list** — the **8 Greenline Advantages** appear identically on both /window-systems/ and /door-systems/. The list:
   1. Maximum Wind Resistance
   2. Long Life and Maintenance
   3. Designed for Tropical Climate
   4. Protection Against Burglary
   5. Efficient Thermal Insulation
   6. Fire Retardant
   7. Maximum Water Tightness
   8. High Acoustic Insulation
   9. Environmentally Friendly *(yes, the list is "8" but contains 9 items — minor inconsistency)*
4. **Partner brand wall** — logos + one-line descriptors
5. **Testimonial card** — quote in italics + named person + city + sometimes title
6. **Press-bracketed news card** — `[PUBLICATION]` prefix + architect name + project descriptor

### 5.3 Photography style
- Predominantly **editorial residential interiors** — natural light, daytime shots, real homes.
- Heavy use of **architect-named projects** (Mañosa, Calma, Pineda, Sim, Benedicto, LiDU, 8X8 Design Studio).
- Hospitality shots include resort pools and hotel facades.
- **Color grading is warm, slightly desaturated, late-afternoon golden hour.** Closer to BLUPRINT/Wallpaper magazine grading than to catalog. NOT a uniform house style — looks like the images come from the publishing partners, not a controlled in-house shoot.
- **No drone shots, no exteriors at night, no 3D renders.**

### 5.4 Copy voice
- Formal, slightly florid, registered-mark heavy, prone to **superlatives**: "the world standard", "the ultimate", "the country's most luxurious", "the country's most discerning clientele", "world-class".
- Technical depth is **shallow**. Materials science gets one paragraph ("calcium/zinc-based stabilizers which are far more superior and more environmentally friendly than lead stabilizers" is the most technical sentence on the entire site).
- Architect-facing technical content is **absent**. There is no spec library, no CAD download, no BIM file, no test report PDF, no thermal performance table.
- Tagline / mission verbatim: *"the brand of choice for the country's most luxurious homes and bespoke projects."*
- Door tagline verbatim: *"the world standard in portal design and technology is not only at your doorstep, they are your doorstep."*
- Vitrocsa tagline (worth stealing the structure): *"Hailed as the ultimate Minimalist Aluminum Door System, Vitrocsa's frontal profiles are as thin as a mere finger."*

### 5.5 Trust signals — where they appear
| Signal | Location | Format |
|---|---|---|
| 1998 founding | `/about/` body | Prose ("established in 1998 at the thick of the Asian crisis") |
| 25+ years | About, Architect's Corner, news anchor | Repeated in headlines and prose |
| 8,630 projects | About (per Tita's note) | Headline stat |
| 120 architects | Architect's Corner | Book tribute count |
| Press logos | News headlines | `[BLUPRINT]`, `[WALLPAPER*]`, `[TATLER ASIA]`, `[ARCH DAILY]`, `[KANTO]` |
| Celebrity attribution | Testimonials pages | Regine Velasquez, Joey Concepcion (Go Negosyo), Johnlu Koa (French Baker CEO), Tom Stockinger (Swiss Finance Chairman), Atty. Rene Bañez |
| Storm-resistance proof | `/aluminium-frame-can-withstand-the-stormiest-nights/` + testimonials | Customer named "Milenyo" survival stories — Estrelita Pabst: *"Two days after installation, came the mighty typhoon 'Milenyo', we suffered zero damage."* |
| University donation | News | 9 PH universities including UP, UST, La Salle Benilde, Mapua, Adamson, FEU, PUP, USC Cebu, PSID |
| 12 European partner brands | /partners/ | Logo grid |
| 2 showrooms | /contact-us/ | Manila + Cebu |
| 5 phone numbers | /contact-us/ | Including dedicated after-sales hotline |

### 5.6 Notable verbatim copy to study
Selected high-leverage lines:

- About / hero — *"For over two and a half decades, Kenneth&Mock® continues to break new ground in product innovation, with uncompromising standards in both quality and service."*
- About founding — *"Kenneth and Mock Designs, Inc. was established in 1998 at the thick of the Asian crisis – a surprising move by the partners in such a time."*
- Mission — *"the brand of choice for the country's most luxurious homes and bespoke projects."*
- Position — *"Kenneth&Mock® became the preferred choice of the country's most discerning clientele."*
- Systems intro — *"For the past two decades, Kenneth&Mock® has continuously broadened its portfolio of prestigious international brands, partnering with Europe's finest manufacturers..."*
- Alutek — *"Kenneth&Mock redefines a classic material with ALUTEK, its new line of aluminum profiles for windows and doors."*
- Alutek differentiator — *"Offering one of the thinnest frontal profiles in the market today, ALUTEK has been engineered with sturdy ribbing and support."*
- FOA Porte — *"FOA Porte of Italy has created the perfect marriage of art, engineering, and function."*
- FOA logistics — *"FOA Porte doors are handcrafted in Italy, imported fully assembled, ready for installation by Italian-trained K&M installers."*
- Vitrocsa — *"Hailed as the ultimate Minimalist Aluminum Door System, Vitrocsa's frontal profiles are as thin as a mere finger."*
- Screens — *"Kenneth&Mock® has pioneered the engineering and delivering of innovative systems that have made insect screens premium features on their own."*
- Climate angle — *"As an archipelago located around the Pacific Ring of Fire, Philippines is prone to natural calamities such as typhoons. Approximately twenty tropical cyclones enter the Philippine area of responsibility each year."*
- Testimonial — Regine Velasquez: *"When it comes to doors and windows, Kenneth&Mock® is the only brand I trust."*
- Testimonial — Tom Stockinger (Swiss Finance Chairman): *"The quality and durability of their frames, glass and screens are superb and they look brand new."*
- Testimonial — Estrelita Pabst: *"Two days after installation, came the mighty typhoon 'Milenyo', we suffered zero damage."*
- Architect's Corner — *"In the blink of an eye, twenty-five years have passed. Over these two and a half decades, partnerships have flourished..."*

---

## 6. Product catalog — itemized inventory

This is the single most valuable extraction for FourlinQ. Match or exceed each line.

### Windows (Greenline) — 8 types
1. Louvres — polypropylene slats
2. Awning System
3. Bay Window
4. Fixed Bow Window (3 to 6+ segments)
5. Casement Window
6. Corner Butt-Jointed Window (frameless corner)
7. Sliding Window (lift rails)
8. Curtain Wall

### Doors (Greenline) — 11 types
1. Casement Door — *"most air-tight and water-fast"*
2. Bi-Fold Door — double-hinged, twice-folding
3. Fold and Slide Door — accordion
4. Sliding Pivot Door — *"individually moved, swung, and slid"*
5. Sliding Door
6. Top-Hung Door
7. Paraslide Door (Slidelock) — *"locks firmly into place flushed to the walls"*
8. Lift-Slide Panoramic — up to 3.60 m W × 2.70 m H (single panel)
9. Lift-Slide Tower — up to 3.80 m H
10. Motion Sensor Automated Door
11. Electronic Door System — fingerprint, password, IC card

### Alutek (aluminum sub-brand)
- K&M Levitating Door (Supreme S500 PHOS, magnetic levitation, concealed frames)
- Alutek Slider (interlock 22-33 mm, 1-4+ tracks)
- Alutek Casement Window (EPDM seals)
- Alutek Sliding Window
- Alutek Fold and Slide

### FOA Porte (Italian artisanal doors)
- Factory Collection — laminated glass + thin solid wood borders
- Vetro Liquido — 3D glass, transparent or opaque black
- Typical Door Model — vertical/horizontal profiled glass
- Door types: Swing Flush-to-Wall / Double Wing Folding / Pivoting / Sliding
- Finishings: Total Series, Metallic (Bronzo, Rame, Alluminio, Titanio), Special (Corten Effect)

### Vitrocsa (frameless minimalist)
- Invisible Sliding Track System
- Turnable Corner System (patented roller)
- Guillotine System (panel submerges into floor)
- Pivoting System (no visible hinges)

### Railing Systems (BTS Aluminum) — 3 series
- AL50 (external glass support, round button caps)
- C50 (top-mounted, balcony drainage)
- FX50 (side-mounted, sleek seamless)

### Screen Systems — 10+ products
Doors: Built In Screen, Roll-out Maxxy Screen, Plissé Advance Screen, Magnum Plisse Screen, Bifold Plisse Screen, Train Screen, Fold-and-Slide Motorized Screen, 3.8 Motorized Zip Screen
Windows: Casement w/ Roll-Up + Plisse Screen, Sliding Window with Built-in Screen, Automated Awning with Fixed Screen

### Glass / Protective Film (Upgrades)
- Tinted Glass
- Laminated Glass
- Evolumen Clear 120 Glass
- Evolumen Silver 150 Glass
- Insulated Glass Units (IGU)

### Profile Colors (~26)
- Classic: Ivory, White
- Modern: Cacao, Charcoal, Fossil, Graphite, Jet Black, Grey Slate, Brushed Gun Metal, Brushed Champagne, Mountain Grey, Alu Stone, Panther Grey
- Woodgrain: Carbon, Driftwood, Golden Oak, Havana, Walnut, Wheat
- Natural: Chestnut Oak, Grey Oak, Umber Oak, Washed Oak
- Foil Finishes header (colors not listed publicly)

### Partner brand wall (12)
FOA Porte • Kömmerling • Genius System • Vitrocsa • BTS • Alumil • Alumed • Alutek by KM • ARLU • Greenline • Reynaers • Freedom Retractable Screens

---

## 7. Direct comparison — K&M vs current FourlinQ build

### 7.1 Hero
| Surface | K&M | FourlinQ (preview) | Winner |
|---|---|---|---|
| Format | Revolution Slider, static image crossfade, ~5 project banners | Video loop (per `HERO_VIDEO_RUNBOOK.md`) + Marvin-style editorial intent | **FourlinQ** (technically more modern) |
| Copy hierarchy | Eyebrow caps + caps headline + prose subhead | Eyebrow + 88px serif headline + subhead (per `competitor-synthesis.md` §0) | **Tie** (both follow editorial pattern) |
| CTA | None visible | Two CTAs (Explore Systems / Visit Showroom) per roadmap | **FourlinQ** |
| Trust line | Brand wordmark + project name only | Needs explicit "Since X — Y projects" stat — we don't have one | **K&M** (anchor stat) |

**Gap to close:** add a tasteful authority line under the FourlinQ hero subhead — even *"Custom-made in the Philippines for Philippine homes"* is an honest line we can carry that K&M can't (they're a distributor of European brands). **Lean into "made for and by Philippine conditions"** — they can't credibly claim that.

### 7.2 Systems / Products IA
| K&M | FourlinQ |
|---|---|
| 9-card flat list (Greenline Windows, Greenline Doors, Alutek, FOA Porte, Vitrocsa, Railing, Screen, Profile Colors, Upgrades) | 3-bucket clean hierarchy (Window / Door / Specialist) per `WindowSystems.tsx`, `DoorSystems.tsx`, `SpecialistSystems.tsx`, `SystemBucket.tsx` |
| No filters | Currently no filters either, but the 3-bucket model is the better scaffolding |
| No individual product detail pages | Currently has Products.tsx with named sub-systems (Casement, Sliding, Slide & Fold, Lift & Slide, 90 Series, Arch Shapes, Curtain Wall, Custom Shapes) |
| No spec sheets | Configurator + 3D viewer per `src/components/3d/` and `src/components/configurator/` |

**Verdict:** FourlinQ has the better product architecture **on paper**. The real risk is whether each FourlinQ sub-system page has the depth (photos + spec + finish + project examples). K&M's depth is shallow — match-and-exceed is genuinely achievable.

**One thing to steal:** K&M's **numbered "Greenline 8 Advantages"** appears on every product page as a consistent advantage strip. We should ship a parallel **"FourlinQ Why uPVC"** advantage strip (we already have `WhyUpvc.tsx`) and surface it as a horizontal card row on every product detail page, not just on a standalone page.

### 7.3 Project gallery
| K&M | FourlinQ |
|---|---|
| 8,630 projects (claim) | ~5-6 projects (`src/data/projects.ts` has 6 entries) |
| 3-tab gallery (Residential / Commercial / Hospitality) | TBD — Tita asked for masonry with cursor-switch |
| No individual project pages | TBD |
| Named projects: Grand Hyatt Pool House, Mithi Resort, Manila Hotel, Marco Polo Davao, Boracay Mandarin | We need named PH projects — even 8-12 is fine if each has a real architect + location |

**Verdict:** **This is FourlinQ's biggest credibility gap**, and K&M's biggest unfair advantage. Even if their 8,630 is editorial, the hospitality name-dropping list alone is intimidating. **Strategy: do NOT try to compete on quantity. Compete on detail per project.** Each FourlinQ project gets a real page (architect named, location named, systems used, photo set of 6-10, completed year). K&M has zero individual project pages — we can leapfrog by going deep on the few we have.

### 7.4 Brand / About / heritage
| K&M | FourlinQ |
|---|---|
| Founded 1998, 25+ years | Founded ??? — surface this on the site, even if shorter (e.g., 2008 = 17 years, still a defensible legacy) |
| 8,630 projects | Even if true count is 200, **publish the real number** — a credible smaller number beats a vague claim |
| 120 named architects in coffee-table book | We have 0 named architect partners on `/brand` |
| Press logos in news headlines `[BLUPRINT] [WALLPAPER*] [TATLER ASIA]` | We need PH press hits — start with archived BluPrint/Tatler features if any FourlinQ projects were published. If not, **plant** features via outreach. |
| Architect's Corner taxonomy (Vanguards / Visionaries / Virtus) | We have no analogue |
| University book donation (UP, UST, La Salle, Mapua, etc.) | We have no education-sector affiliation |

**Verdict:** **K&M wins this surface decisively for now.** The fastest closing move: publish a real PH-context "Since [year] — [N] homes in [provinces]" stat on the home and About page, and **name the architects we have actually worked with**. Even 5 named architects beats a blank.

### 7.5 CTA strategy
| K&M | FourlinQ |
|---|---|
| Primary CTA: implicit "Contact Us" link in nav | Should be: "Visit a Showroom" + "Request a Quote" |
| No appointment booking | We should ship a Calendly-style "Book a Showroom Visit" — K&M doesn't have one |
| No live chat / Viber | We should ship a Viber + WhatsApp deep-link button — K&M doesn't have one |
| No file upload for architect plans | We should let architects upload plans / specs via form |
| Generic 4-field contact form | We should qualify: project type / timeline / budget band / location |

**Verdict:** **FourlinQ wins this surface easily** by shipping a real qualification flow. K&M's contact form is `Name / Email / Subject / Message` from 2010.

### 7.6 Visual modernity / animations
| K&M | FourlinQ |
|---|---|
| WordPress + Revolution Slider, no SPA | Vite/React SPA per `src/pages/` |
| No 3D / configurator | `src/components/3d/` + `src/components/configurator/` exist |
| Static image grids | Can implement scroll-reveal, hover-swap, cursor-switching gallery |
| No editorial typography | Can ship a serif + sans pairing |
| No accent line / hairline system | Can ship from `DESIGN_SYSTEM.md` |

**Verdict:** **FourlinQ wins this surface easily and by a wide margin.** This is where Tita's instinct of "we look weaker" might actually be inverted — K&M looks dated when placed side by side. The trap is that they look **trustworthy-dated** rather than **shoddy-dated**.

---

## 8. What FourlinQ MUST do this week to beat K&M — ranked punch list

Each item is scoped to ship by Sunday May 24, 2026. Cost / payoff in parentheses.

### Tier 1 — Same-day moves (must land Saturday)

1. **Plant the authority line on hero.** Add a single subhead row under the hero headline: *"Custom-made uPVC, engineered for Philippine homes since [YEAR]."* Even if YEAR is recent, it's a real number. K&M's authority is 1998 — we counter with **"made for the climate, not imported into it."** (Surface: `src/pages/Index.tsx`. 1 hour.)

2. **Add a numeric trust strip below hero.** Three numbers: `[N] homes` / `[N] systems` / `[N] provinces`. Even modest numbers beat blanks. K&M's 8,630 is a single floating stat — we counter with a **trio of verifiable numbers**. (1 hour.)

3. **Name the architects/builders we've worked with.** A "Trusted by" or "Partner Architects" row on the home page with 6-12 names (no logos needed — names in caps text is fine, even more editorial). K&M lists 120; we name our 6 honestly. (Surface: new component in `src/components/home/`. 2 hours including content gathering.)

4. **Press-attribution badges if any exist.** If any FourlinQ project has ever appeared in BluPrint / Tatler / Wallpaper / Kanto / Real Living, surface those bracketed prefixes on a "Featured In" row. If none yet, skip and replace with: a **"Made in the Philippines"** badge row. (1 hour if assets exist.)

5. **Add `[YEAR FOUNDED]` to the footer wordmark.** Like K&M's `Kenneth&Mock® · Since 1998` echo. Make it small but ubiquitous. (15 min.)

### Tier 2 — Saturday afternoon / Sunday morning

6. **Match K&M's "8 Advantages" with a FourlinQ uPVC Advantage Strip.** Ship a horizontal 6-card row that appears on every product detail page. Adapt from `src/pages/WhyUpvc.tsx`:
   1. Built for Philippine Typhoons
   2. Salt-Air Resistant (no rust, no rot)
   3. Thermal-Quiet (24-32 dB sound reduction — cite real numbers)
   4. Lead-Free uPVC formulation
   5. 10-Year System Warranty (cite if true)
   6. Made-to-Measure, locally
   K&M's identical advantage list reads as borrowed European boilerplate. **Our PH-context-specific framing wins.** (Surface: shared component reused across `WindowSystems.tsx`, `DoorSystems.tsx`, `SpecialistSystems.tsx`. 3 hours.)

7. **Add per-product max-dimension specs.** K&M's only quantitative product claim is *"3.60m wide, 2.70m tall"*. Match-and-exceed: on every door page (Slide & Fold, Lift & Slide, 90 Series, Large Panel), publish max W × H. **This is the single highest-leverage move on the product side.** Architects buy on dimensions. (Surface: `src/data/products.ts` already has the named sub-systems — add dimensional fields. 2-3 hours.)

8. **Project pages — go deep on the 5-6 we have.** Each project: hero image, architect name + firm, location, year, systems used (linked back to product pages), 6-10 photos, optional quote from owner/architect. K&M has **zero** of these — they only have an image-only tabbed gallery. (Surface: new dynamic route `/projects/:slug` reading from `src/data/projects.ts`. 4 hours.)

9. **Add a Vitrocsa-style minimalist project meta on each project page.** Pattern verbatim from K&M's Vitrocsa: *"Hailed as the ultimate [TYPE], [PRODUCT]'s [DIMENSION] are as [THIN/WIDE/BIG] as a [REFERENCE]."* Adapt to our voice. (1 hour copy.)

10. **Ship a real consultation booking flow.** Replace generic contact form with a 4-step qualifier:
    - Step 1: Project type (New build / Renovation / Replacement / Architect specifying)
    - Step 2: Timeline (Now / 3-6 mo / 6-12 mo / Researching)
    - Step 3: Location (province dropdown)
    - Step 4: Contact + optional plan upload
    K&M's form is `Name / Email / Subject / Message`. We **destroy** them here for under 6 hours of work. (Surface: replace the contact page form. 4-6 hours.)

11. **Sticky CTA / floating consult button.** K&M has none. Ship a bottom-right floating button: "Visit a Showroom →" + Viber/WhatsApp icons. (1 hour.)

### Tier 3 — Stretch goals (Sunday only if Tier 1+2 land)

12. **News / "What's the Latest" hub.** K&M has 10+ articles with press brackets. Even 3 entries beats blank. Repurpose existing project page launches as news entries. (3 hours.)

13. **Profile Colors / Finishes page parity.** K&M's color page has 26 finishes grouped into Classic / Modern / Woodgrain / Natural / Foil. We have `src/pages/Finishes.tsx` and `src/data/finish-scenes.ts`. Make sure our finish page has **at least 20 named colors** with PH-context names (e.g., "Manila White", "Tagaytay Mist", "Coastal Driftwood") — naming is the differentiator since K&M uses generic names. (2 hours rename + audit.)

14. **Architect's Corner equivalent.** Even a single page titled "For Architects" with downloadable spec sheets (PDF), CAD blocks, and a contact-the-spec-team form would beat K&M (they offer none of these). (3-4 hours.)

15. **Two showroom addresses surfaced as a Locator UI.** Even if we only have one showroom, present it on a map (Mapbox / Google embed) with hours, parking, "Book a visit". K&M lists addresses as static text only. (2 hours.)

16. **Storm-resistance testimonial wall.** K&M leans on **Typhoon Milenyo survival stories** as their single strongest emotional proof point. Mirror this directly: a "Tested by Philippine Weather" section with 3-5 customer storm-survival quotes (Odette, Karding, Yolanda — pick real recent typhoons). Even if we need to commission the testimonials this week, the surface is the differentiator. (1 hour layout, content TBD.)

### Tier 4 — Do NOT attempt this week
- Don't try to match 8,630 projects with a fake number. Tita's gut on this is correct — fakery is the only thing worse than parity. Publish the real count.
- Don't add European partner-brand logos we don't actually carry. K&M's Reynaers/Kömmerling/Vitrocsa lockup is real. Don't fake an analogue.
- Don't try to ship a coffee-table-book equivalent. It's a 12-month project.
- Don't try to out-celebrity them on testimonials. Their Regine Velasquez quote is unbeatable in 48 hours.

---

## 9. The honest gaps we will not close by Sunday

Be honest with Tita about these:

1. **Heritage** — they have 25 years; we don't, and no amount of design beats a 1998 founding date.
2. **Celebrity testimonials** — Regine Velasquez + Joey Concepcion + the Mañosa family are 10-year relationships we can't manufacture.
3. **European partner brands** — they distribute FOA Porte, Vitrocsa, Kömmerling, Alumil, Reynaers. We are a single-brand uPVC maker.
4. **Press archive** — 10+ BluPrint / Tatler / Wallpaper / Arch Daily hits is a multi-year PR program.
5. **120-architect commemorative book** — pure status object we can't replicate.
6. **Two physical showrooms (Manila + Cebu)** — if we have one, we have one; can't lie about it.

**The framing for Tita:** *"We will not look bigger than K&M by Sunday — but we will look more modern, more architect-friendly, more PH-climate-specific, and we will out-product-experience them on every single page. K&M wins authority; we win product clarity. That's a survivable position for a younger brand."*

---

## 10. Side-by-side scorecard (closing)

| Surface | K&M score | FourlinQ achievable by Sunday | Notes |
|---|---|---|---|
| Hero modernity | 4/10 | 9/10 | Video loop > Revolution Slider |
| Hero authority | 9/10 | 6/10 | We add "since [year]" + N-projects strip |
| Product IA | 5/10 | 9/10 | 3-bucket > 9-flat |
| Product detail depth | 3/10 | 8/10 | We ship max-dim specs + advantage strip + finish swatches |
| 3D / configurator | 0/10 | 9/10 | Total greenfield win |
| Project gallery scale | 9/10 | 4/10 | Honest 6 projects, deep pages — narrative win, scale loss |
| Project gallery depth | 2/10 | 9/10 | Real per-project pages |
| Brand heritage | 9/10 | 5/10 | Closeable only if we publish real founding year + named architects |
| Press / awards | 8/10 | 3/10 | Gap admitted |
| Testimonials | 9/10 | 5/10 | Add 6-8 real customer quotes by Sunday |
| Showroom UX | 5/10 | 8/10 | Add booking flow |
| Contact / qualification | 3/10 | 9/10 | Replace 4-field form with qualifier |
| Mobile experience | 5/10 | 9/10 | Modern SPA > WP |
| Visual system | 5/10 | 9/10 | Editorial type + accents > caps + champagne |
| Architect-facing content | 2/10 | 7/10 | Even a single "For Architects" page wins |

**Weighted close:** the surfaces where we can win cheaply (product detail, configurator, IA, contact flow, modernity) are the ones where K&M is **weakest**. The surfaces where they win cheaply (founding year, press, celebrity testimonials) are the ones we can't move in 48 hours. Tita should know both facts.

---

## 11. One-paragraph response Tita will hear well

*"Tita — looked at K&M closely. The website itself is older than you'd think: it's WordPress with a 2018-era image slider, no 3D, no configurator, no real product detail pages, no quote form past four fields. Where they crush us is authority — 1998 founding, 8,630-project headline, 120 named architects, Regine Velasquez and Joey Concepcion on the wall, press hits in BluPrint and Tatler. We can't fake any of that by Sunday. But we can out-build them on every product page, every configurator interaction, every contact flow, and the visual system. The honest move this week is to lean into the things they do badly (product depth, modernity, architect tools, PH-climate framing) and stop trying to match what we can't (decades of press and celebrity). Sunday's update should ship: (1) hero authority line + numeric trust strip, (2) 8-Advantage uPVC strip on every product page with real PH-context framing, (3) max-dimension specs on every door product, (4) real individual project pages (even just 6), (5) qualifying consultation form. That's the survivable position."*

---

*End of audit. Cross-reference with `docs/competitor-synthesis.md` §0 — the K&M findings reinforce Tita's existing five priorities (Marvin-style hero, project switcher, 3-bucket IA, What's-the-Latest, editorial pacing) and adds the **authority-strip + per-product max-dimension + qualified contact flow** as Sunday-specific moves.*
