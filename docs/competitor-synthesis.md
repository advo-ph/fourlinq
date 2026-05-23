# FourlinQ Synthesis — Tita's Brief × 8 Competitor Audits

**Date:** 2026-05-23
**Inputs:**
- Tita's verbatim requests from `docs/REDESIGN_ROADMAP.md` §2
- 8 competitor audits in `docs/`:
  - `marvin-audit.md` (~700 lines) — visual + editorial north-star
  - `competitor-audit-andersen.md` (568) — IA + catalog depth benchmark
  - `competitor-audit-pella.md` (1,042) — icon filtering + indoor-outdoor narrative
  - `competitor-audit-milgard.md` (1,492) — warranty layering + dealer locator
  - `competitor-audit-rehau.md` (1,190) — design tokens, footer, co-brand leverage
  - `competitor-audit-schueco.md` (806) — friction-as-premium, restraint discipline
  - `competitor-audit-sky-frame.md` — chrome ceiling, orange-budget restraint
  - `competitor-audit-vitrocsa.md` (1,714) — authority by subtraction, PH project credibility

This document maps every insight to a **specific FourlinQ surface**, weighted against what Tita has actually asked for. Format: one row per insight, with source + target + priority.

---

## 0. The five things that matter most

If we ship nothing else from this audit batch, ship these. Each one is **both** what Tita asked for **and** what 4+ competitors converge on.

| Rank | Move | Tita wants | Competitors converge | Surface |
|---|---|---|---|---|
| 1 | **Hero with moving photos / video loop, Marvin-style** | §2.1.4 verbatim | Marvin, Pella, Schüco, Sky-Frame all do hero video/loop; Vitrocsa is the exception with stills | `/` homepage hero |
| 2 | **Project photo switcher on every product page** | §2.1.3 verbatim | Marvin Photo Gallery multi-axis filter; Pella PDP hover swap; Andersen Inspiration filter | every Window Systems / Door Systems / Specialist Systems detail page |
| 3 | **3-bucket Systems architecture (Window / Door / Specialist) with all 4 door sub-systems named** | §2.1.1 verbatim | Schüco's Window / Sliding / Façade tri-bucket; Marvin's Collection-led tri-bucket | `/products` IA + nav |
| 4 | **"What's the Latest?" section on home** | §2.1.5 verbatim | Marvin's Inspiration hub; Pella `/ideas/`; Andersen Blog/Project Showcase | home below-the-fold + `/whats-new` |
| 5 | **Editorial pacing — kill the card-grid SaaS look** | §2.2 "rushed and simplistic" | Marvin's 10-12 section archetype; Vitrocsa's 200px+ section spacing; Sky-Frame's 55% whitespace average | every page, but especially `/` and `/products` |

Every other recommendation in this doc is a sharpening of one of those five.

---

## 1. Hero section — "moving photos showing different projects"

**Tita said:** *"Front-page hero must have moving photos showing different projects — Marvin-style."*

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Marvin | Hero is full-bleed video loop, lifestyle context (not product chrome). Headlines max at 88px (hjumbo). Eyebrow → headline → subhead → body rhythm. | `/` hero: 88px serif headline ("A lifetime of satisfaction and peace of mind"), 11-14px eyebrow above, 16-20px subhead below. Video loop already shipped — verify it shows multiple projects, not just one room. |
| Pella | Hero photography is sun-drenched, indoor-outdoor heavy. Verbatim copy library captured ("blur the line between indoors and outdoors", "live beyond your walls"). | Use one of these as the hero subhead, adapted for PH: *"Built to live with the Philippine climate, not against it."* |
| Sky-Frame | Hero is muted-looped product-operating video (one window opening/closing on loop). 200-400ms ease-out only. No parallax. | Our 3D viewer below the fold does the "product operating" job. Keep hero LIFESTYLE, not product. |
| Schüco | Hero headline caps at **40px**. Refuses display-headline spectacle. | We can go larger (88px) because we're closer to Marvin's editorial tier than Schüco's industrial one. But: **never use exclamation marks or marketing-loud verbs** ("Discover!", "Transform!"). |
| Vitrocsa | Hero is a STILL image, not video, to feel archival. | Counter-example. We follow Marvin here, not Vitrocsa. |

**Specific actions:**
1. Audit current `/` hero video — confirm it cuts through 3+ distinct project contexts (Tagaytay, coastal Batangas, urban Manila condo). If it's one room, replace.
2. Headline rhythm: eyebrow (11px caps, 0.12em tracking) → 88px serif headline → 18-20px subhead → primary CTA + secondary link.
3. Two CTAs max. Primary = "Explore Systems". Secondary = "Visit a Showroom →" (tertiary text link, not button).
4. Remove the red square CTA from header (Tita's "all over the places" complaint).

---

## 2. Three-bucket Systems architecture

**Tita said:** *Window Systems / Door Systems / Specialist Systems, with explicit sub-systems named for Door (Slide & Fold, Large Panel Doors up to 6m, 90 Series, Lift & Slide) and Specialist (Arch shapes, Curtain Wall, Different-shaped panels).*

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Schüco | Tri-bucket: Window Systems / Sliding Doors / Façade Systems. Each bucket has its own landing page with 200+ words of editorial intro before any product chips appear. | Our 3 buckets get parallel landing pages. Intro = 200 editorial words. THEN product chips. |
| Andersen | Five-series ladder (100/200/400/A/E) within Windows. Each tier has its own positioning. Plus the **named architectural style library** (13 styles). | We don't have 5 tiers. We have ONE tier (premium). But: adopt the architectural style cross-axis — "For Modern Tropical Homes" / "For Coastal Properties" / "For Heritage Restorations." |
| Milgard | 3-axis matrix: Window Style × Frame Material × Series + a 4th cross-axis of Architectural Style. Series naming is **dual-layered** (humanized + SKU). | FourlinQ has one frame material (uPVC). So our matrix collapses to: System Type × Architectural Style. Plus: name our 4 door sub-systems with both a humanized name AND a code (e.g., "Slide & Fold — SF60", "Large Panel — LP60", "Lift & Slide — LS70", "90 Series — 90S"). |
| Marvin | Collection-led architecture (Ultimate / Modern / Vivid / Elevate / Essential) with 2-word eyebrow slogans per collection. | Mint 3 system slogans, NOT 5. Examples to draft: Window Systems → "Quiet daylight." Door Systems → "Wide-open architecture." Specialist Systems → "When the shape isn't standard." |
| Vitrocsa | Six systems with verbatim taglines (e.g., Sliding "Invisible by design"). Past-tense archival voice. | Pull this voice for the system landing pages. NOT for the hero. |

**Specific actions:**
1. Restructure `/products` into 3 buckets with parallel landing pages: `/products/windows`, `/products/doors`, `/products/specialist`.
2. Each landing has: eyebrow → 88px headline → 200-word editorial intro → photo gallery (Tita §2.1.3 cursor-switching) → sub-system chips.
3. Sub-system pages explicitly named per Tita: `/products/doors/slide-and-fold`, `/products/doors/large-panel`, `/products/doors/lift-and-slide`, `/products/doors/90-series`. Specialist: `/products/specialist/arch-shapes`, `/products/specialist/curtain-wall`, `/products/specialist/custom-shapes`.
4. Drop the "Three systems" wording on the home — Tita's buckets are 3 systems-of-systems. We have ~10 named sub-products total.

---

## 3. Photo galleries — cursor-switching project photos

**Tita said:** *"Photo area must allow switching between project photos using the cursor."*

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Marvin | Photo Gallery is multi-axis filter (Collection × Window Type × Door Type × Interior/Exterior) over ~483 images, masonry layout + lightbox. | Build `/inspiration` as masonry grid with the same filter dimensions, scaled to our catalog. |
| Pella | PDP uses **hover image swap** (default lifestyle → on-hover product close-up). | Apply to every system card on `/products`. |
| Andersen | Photo gallery is hub-and-spoke with curated story pages. Less filter-heavy than Marvin. | Pick Marvin's filter model over Andersen's hub model — Tita asked for cursor switching, not curated stories. |
| Vitrocsa | Project pages are photo-led (80-90% of viewport). Text is engineering spec + architect proper-noun credits ONLY. | On each project page, photo first / spec table / architect credit / FourlinQ system used. Mirror this exact order. |
| Schüco | 207 indexed reference projects with ~75 filter dimensions. References landing = carousel-of-carousels by theme. | Our scale is closer to 20-50 projects. Use Marvin's masonry, not Schüco's themed carousels. |

**Specific actions:**
1. Implement masonry inspiration grid with filter: System Type × Project Type (Residential / Coastal / Commercial / Heritage) × Room (Bedroom / Living / Kitchen / Bath / Exterior).
2. Each system product page gets a project carousel above the fold — cursor-switch between 3-6 project photos that feature that exact system.
3. Each project page: photo-first hero, spec table mid-page, architect/builder credit + FourlinQ systems used at the bottom. Vitrocsa pattern.

---

## 4. "What's the Latest?" / "What's New"

**Tita said:** *"What's New / What's the Latest?" section — for new project announcements, news, updates.*

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Marvin | Inspiration hub at `/inspiration` is editorial + project-driven. No "news" framing — they treat every new project as inspiration content. | Tita's "What's New" → publish as `/whats-new` BUT show it on home as the recurring section between Inspiration and warranty. |
| Pella | `/ideas/` is a parallel editorial namespace with three sub-categories (trends / how-to / project profiles). | Adopt this **three-strip** structure: PRODUCT (new system announcements) / PROJECT (recently completed installations) / INSIGHT (PH-climate education content). |
| Andersen | Blog + Project Showcase + Why Windows Matter are three separate editorial properties. | We don't need three. One `/whats-new` with sub-tabs is enough. |
| Schüco | No newsletter signup anywhere on the site. | Mirror this — no newsletter modal. If we want capture, it's via the showroom-visit booking, not a popup. |
| Sky-Frame | News / Stories / Publications are three separate IA branches. Each one is restrained: max 5-8 entries visible. | We mirror this restraint on home — show only the **3 latest** entries from `/whats-new`, with "All updates →" tertiary link. |

**Specific actions:**
1. Home page section between Inspiration and Warranty: 3-up grid of latest `/whats-new` entries with PRODUCT / PROJECT / INSIGHT category badges.
2. Build `/whats-new` as a chronological list with the three category filters.
3. **No newsletter capture anywhere.** Aligns with Schüco premium signal + Tita's "don't make it feel marketing-y."

---

## 5. Editorial pacing — kill the SaaS card-grid

**Tita said:** *"Rushed and simplistic"* / *"All over the places."*

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Marvin | Section archetype is rigorously templated — 10-12 sections in the same order across every collection page, re-photographed per collection. | Apply same archetype across `/products/windows`, `/products/doors`, `/products/specialist`. Same section order, different photography per. |
| Sky-Frame | ~55% average page whitespace. Chrome ceiling of ~17 UI elements above-the-fold (vs 30-80 for SaaS). | Audit current home — count UI elements above-the-fold. Target ≤20. |
| Vitrocsa | 200px+ spacing between sections. 0 border-radius, 0 shadows. | Set base section padding to 120-160px on desktop, never less than 96px. |
| Marvin | Chrome is monochrome with hairlines doing all separation work. | Remove every shadow, every rounded corner on chrome elements. Reserve rounded corners for photographic content with 4-8px max. |
| Schüco | Two type weights only. 80% B&W + 10% accent + 10% secondary accent rationing rule. | Already shipped this. Audit any new components to confirm. |
| Rehau | 80% black/white + 10% Active Red + 10% Smart Green (mandatory co-occurrence). | We use ONE accent (FourlinQ Red). Don't add a second. |

**Specific actions:**
1. Page audit — for each existing page, count: borders, rounded corners, shadows, icon badges, secondary accent colors. **Delete anything that isn't load-bearing.**
2. Base section padding: 120px desktop / 64px mobile minimum.
3. Hairlines (1px, 60% opacity) do all chrome separation. No box-shadow allowed on chrome.
4. Card style guide: NO border, NO shadow, NO icon badge top-right, NO border-radius. Photo + caption + headline + body + tertiary link.

---

## 6. Color frame variations — show every product in every finish

**Tita said:** *"Every product/system must show visuals for different colored frames AND actual project photos."*

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Andersen | EnduraClad has 20+ exterior colors. Each color rendered against the same window for visual swatch comparison. | We have 11 finishes. Each system page = 11-swatch picker + live render swap. **Already shipped this on the 3D viewer.** Extend to every product page (not just home). |
| Pella | Reserve Traditional Double-Hung PDP shows 20+ EnduraClad colors with editorial finish names ("Wineberry", "Bahama Brown", "Pebble Gray", "Cashmere"). | Our 11 finishes already have editorial names ("Oak Light", "Walnut", "Charcoal Gray", "Matte Quartz"). Audit each name against Pella's voice — verify they read editorial not catalog. |
| Marvin | Finish names are editorial, NOT generic ("Wineberry" not "Dark Red"). | We pass this test. |

**Specific actions:**
1. Every system detail page gets the 11-swatch picker, mirroring the home 3D viewer.
2. For sub-systems without a 3D model yet (Slide & Fold, Large Panel, Lift & Slide), use static rendered tiles with the finish overlay.
3. Add a `/finishes` deep page where each swatch gets its own essay (Marvin treats each Vivid color as worthy of editorial). 1 paragraph per finish describing visual character + which PH home style suits it.

---

## 7. Header / chrome — light, quiet, premium

**Tita's complaint:** *"Dark gradient, white all-caps menu, red square CTA, heavy chrome reads aggressive / startup-y."*

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Marvin | Header is white, transparent, sticky. Sentence-case nav labels. No primary CTA in header — just a "Find a Dealer" tertiary text link. | Replace current red CTA in header with a tertiary "Visit a Showroom" text link. |
| Schüco | Header refuses CTA prominence. The architecture itself is the offer. | Same as Marvin. Aligned. |
| Sky-Frame | Header has 1 logo + 5 nav items + 1 locale picker. That's it. | Trim our header to ≤6 elements total. |
| Andersen | Three-tier button hierarchy (primary solid / secondary outline / tertiary text). One primary per page max. | Audit each page — count primary CTAs. Should be ≤1. |
| Vitrocsa | Gold arrow accent (`arrow-right-gold.svg`) on hover/CTA only. | We use red. Keep accent rationing the same — pixels not areas. |

**Specific actions:**
1. Header redesign: white background, 1px hairline bottom border, sentence-case nav, no primary CTA (replace with "Visit a Showroom →" tertiary link).
2. Mobile header: hamburger left, logo center, locale or showroom right.
3. Audit every page for ">1 primary CTA above-the-fold" violation.

---

## 8. Warranty + trust signals — Milgard-style oxygen

**Tita's brief doesn't explicitly mention warranty**, but FourlinQ has a 10-year warranty + 22 years operating + Rehau profile co-brand. These deserve more presence.

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Milgard | Warranty appears in hero / feature strip / positioning paragraph / comparison table / PDFs / registration form / footer (×2). 6 layers. | Layer FourlinQ's 10-year warranty: home hero subhead (already there) + every system PDP feature strip + footer column + dedicated `/warranty` page. |
| Rehau | Co-brand leverage: "Our profiles contain REHAU recyclate" rather than inventing a parallel sustainability program. | Build a co-brand page — "Engineered with REHAU profiles" or similar. Cross-link to rehau.com brand portal where appropriate. Don't invent EcoPuls; reference it. |
| Andersen | "Innovation" and "Why Windows Matter" are separate pages building category authority. | We have "Why uPVC". Audit content depth — should be 1500+ words with diagrams. |
| Vitrocsa | Authority stats: 21,462 projects / 61 countries / 26 patents / 22 certifications. Specificity over superlative. | Mint our own stats: "22 years engineering uPVC for the Philippine climate" / "4 showrooms across Metro Manila and Cebu" / "10-year warranty registered and tracked." Use specific numbers, never round. |

**Specific actions:**
1. Build `/warranty` deep page — what's covered, term, transfer policy, registration link.
2. Build `/profiles` or `/engineering` page about REHAU co-brand. Link to REHAU brand portal as proof.
3. Audit `/why-upvc` — extend to 1500+ words with PH-specific section (typhoon performance, salt-air resistance, thermal vs Manila heat).
4. Mint a "FourlinQ by the numbers" component for footer and About page — 4-6 specific stats.

---

## 9. Dealer / Showroom locator

**Tita said:** *4 showrooms — Manila Main, Ortigas CW Home Depot, Alabang CW Home Depot, Cebu.*

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Marvin | Find a Dealer role-segments first (homeowner vs design/build pro) BEFORE rendering the map. | Add a role gate to `/showrooms` — "I'm building / I'm specifying / I'm browsing." Route each to a different form. |
| Milgard | Find a Dealer → Free Consultation is the entire conversion engine. Brochure form family sub-segments leads at intake. | Lean into showroom booking as primary CTA across the site. Replace "Get a Quote" wording with "Book a Consultation" or "Visit a Showroom." |
| Schüco | "You cannot buy Schüco products directly from us" — friction rebranded as premium signal. | Mirror this voice. We don't have e-commerce. The showroom visit IS the funnel. Lean into it. |
| Andersen | Dealer profiles have unique pages with photos, hours, services. | Each of our 4 showrooms gets a dedicated page: photos of the showroom interior, what's on display, hours, map, booking link. |
| Vitrocsa | Mandatory Switzerland visit for partner programme = exclusivity-as-supply-chain. | We can't gate that hard. But: position the showroom visit as the "real way" to experience FourlinQ. |

**Specific actions:**
1. `/showrooms` → role-gate → map + 4 cards (currently exists per CHANGELOG, audit polish).
2. Each showroom gets its own page: `/showrooms/manila-main`, `/showrooms/ortigas`, `/showrooms/alabang`, `/showrooms/cebu`.
3. Replace any "Get a Quote" CTAs with "Book a Consultation" or "Visit a Showroom →".
4. Frame the consultation: "Bring your floor plan or just your questions. 90 minutes with a FourlinQ engineer." (Pella's anchor offer.)

---

## 10. Typography — match Marvin without licensing fees

**Already shipped:** Fraunces (display) + Inter (body). Free fonts from Google.

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Marvin | Real type scale from CSS: hjumbo 48-88px, h1 32-56, body 16, eyebrow 11-14. | Verify our type scale is matching Marvin's. Hero ≤88px, body 16px (NOT 18-20 — that's the common mistake). |
| Marvin | Two parallel typeface stacks (Apercu+Grifo OR Nationale+TabacG1) — all commercial. | Fraunces (display) + Inter (body) is a strong free pairing. **Don't switch.** |
| Schüco | Two type weights only — Univers Regular 430, Bold 630. | Pick TWO weights from each family. Fraunces 400 (display) + 600 (emphasis). Inter 400 (body) + 600 (CTA + nav). No 300, no 800. |
| Rehau | Brix Sans Black/Bold/Regular/Light. H1 140rem, body 1.8rem. Numbered lists use "01., 02." in accent color. | Skip the 140rem aggression. Pick numbered-list pattern: lead "01., 02." in FourlinQ Red. |
| Sky-Frame | Hoefler-licensed Gotham + Mercury. Headlines cap at 36px. | We can go bigger because we're editorial-tier, not industrial. |

**Specific actions:**
1. Lock weights: Fraunces 400, 600. Inter 400, 600.
2. Verify body is 16px (not 18). Test on mobile.
3. Adopt the numbered-list pattern with red accent numerals.

---

## 11. Animation discipline

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Sky-Frame | NO parallax, NO scroll-reveal, 200/300/400ms ease-out, cross-fade carousels only. | Mirror exactly. Strip any spring/bounce/skew animations. Cross-fade only. |
| Vitrocsa | No GSAP/Lenis/AOS detected. 120-300ms native CSS transitions. | We're using Framer Motion — fine, but **keep durations 200-400ms and easing to ease-out**. |
| Schüco | Conservative motion. Hero is still or slow cross-fade. Configurator interactions are 3D-light, focused on outcomes not transitions. | Our 3D viewer is appropriately spec'd. Don't add scroll-triggered parallax around it. |
| Marvin | Subtle fade-ins on scroll. No parallax. | Confirmed via audit. |
| Pella | Hover image swaps on PDP cards. Configurator is photo-upload visualizer (3 steps, not real-time 3D). | Our 3D beats Pella. Don't add a photo-upload step in addition. |

**Specific actions:**
1. Audit `framer-motion` usage — any spring config = replace with `transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }` (ease-out-quint).
2. Strip parallax from anywhere it exists.
3. Lock 3 motion durations: fast (200ms), default (300ms), slow (400ms). Nothing in between.
4. Hover scales max 1.02. No 1.05 lifts.

---

## 12. Footer

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Rehau | Four-band color stack (gray separator → green SmartTag band → black corporate → white legal). | Our footer is currently single-band black. Consider 2-band: dark FourlinQ navy/black corporate band → 1px hairline → light off-white legal band. Don't go four like Rehau. |
| Marvin | Footer is light gray, hairline above, columns for Systems / Resources / Visit / Legal, social icons bottom-right. | Already aligned. |
| Pella | 5-column footer with role-segmented columns (Homeowners / Pros / Find Us / About / Connect). | We can do 4. |
| Vitrocsa | Three-column footer, no breadcrumbs anywhere on site. | Minimum viable footer. |
| Schüco | No newsletter signup in footer. | Mirror. |

**Specific actions:**
1. Audit current footer — confirm no newsletter signup. If present, remove.
2. Two-band split (corporate dark + legal light) per Rehau-inspired pattern.
3. Social icons reduced to Instagram + Facebook only (matches current `/whats-new` audit).

---

## 13. Voice / copywriting

| Source | Specific finding | FourlinQ application |
|---|---|---|
| Marvin | Eyebrow → headline → subhead → body universal rhythm. Each collection has a 2-word slogan. | Mint 3 slogans (one per system bucket). |
| Vitrocsa | Past-tense archival voice. "System as noun." Specificity over superlative. Banned-vocab list captured. | Adopt for system landing pages and project pages. |
| Pella | Verbatim phrases captured: "blur the line between indoors and outdoors", "live beyond your walls". | Adapt for PH: "Live with the climate, not against it" / "Built for typhoon, designed for daylight." |
| Schüco | German-precision tone in English. No exclamation marks. No "Discover!". | Mirror. Banned words: Discover, Transform, Unlock, Revolutionary, Game-changing. |
| Sky-Frame | Restraint-superlatives. "A view, not a window." "Tends to awe." | Single most-quotable copy in the audit set. Mint a FourlinQ equivalent: *"A wall, not a window."* (counter — we hide the wall) or *"Climate, captured."* |
| Andersen | Heritage-anchored claims (National Park Service certification, "Most Innovative Window"). | We don't have those credentials. Anchor on what we DO have: 22 years, 4 showrooms, REHAU profile co-brand, 10-year warranty. |

**Specific actions:**
1. Write 3 system slogans (drafts above).
2. Banned-word audit across the site for: Discover, Transform, Unlock, Revolutionary, Game-changing, Innovative (when used as adjective not specific feature).
3. Past-tense archival voice for system landing pages and project pages. Present-tense for blog/whats-new.
4. Mint 1 hero subhead that's quotable. Currently "Custom-made uPVC windows and doors engineered for the Philippine climate" — too long, too literal. Compress to ≤12 words.

---

## 14. What NOT to copy

For balance — items that look attractive but would hurt FourlinQ.

| Source | Anti-pattern | Why we skip |
|---|---|---|
| Schüco | "You cannot buy directly from us" stated as premium friction | We DO want PH homeowners to feel they CAN engage. We're consumer-accessible, not architect-only. Soften the friction language. |
| Vitrocsa | System sans only, no display serif | We need warmth. Fraunces stays. |
| Vitrocsa | No pricing transparency anywhere | We don't show prices either, but Tita's audience expects "from ₱X per linear meter" estimates eventually. Plan for it. |
| Vitrocsa | Showroom visit is hard-gated (Switzerland mandatory) | We're consumer-facing. Showroom visit is open invitation. |
| Sky-Frame | No FAQ / no education content | PH market needs more education. Keep `/why-upvc`, `/care`, `/faq`. |
| Sky-Frame | No dealer locator | We have 4 showrooms — surface them. |
| Andersen | Renewal by Andersen sister-brand split (promo voice) | We have one brand. Don't fragment. |
| Pella | Photo-upload visualizer | We have 3D — better. Don't add the upload step as well. |
| Rehau | Brix Sans license + four-band footer literal copy | Inspired-by, not copy. |

---

## 15. What's ALREADY shipped vs what's queued

**Shipped (per CHANGELOG):**
- Fraunces + Inter typography ✓
- 11-finish system with editorial naming ✓
- Hero video loop ✓
- 3D window viewer (4 systems on home) ⚠️ in-progress, sliding/awning centering bugs
- Hairline-rule chrome ✓
- Marvin-derived design tokens in CSS ✓

**Queued by this synthesis:**
- 3-bucket Systems IA restructure with parallel landing pages
- Cursor-switching project photo galleries on every product page
- `/whats-new` page with 3-strip (PRODUCT / PROJECT / INSIGHT)
- Showroom role-gating + per-showroom pages
- `/warranty` deep page + warranty layering across PDPs
- `/profiles` or `/engineering` REHAU co-brand page
- Banned-word audit
- 3 system slogans
- Header cleanup (remove red CTA, replace with showroom tertiary link)
- Strip all spring/bounce animations
- Lock 3 motion durations

---

## 16. Suggested rollout sequence

Two-week sprint plan informed by Tita's priorities + competitor consensus:

**Week 1 (Tita's structural asks):**
- Day 1-2: Three-bucket IA + sub-system pages stubbed
- Day 3-4: Hero video audit + replace if single-context
- Day 5: Cursor-switching photo galleries on each system page
- Day 6-7: `/whats-new` page + home strip

**Week 2 (chrome + voice polish):**
- Day 8: Header redesign (drop red CTA)
- Day 9: Strip non-essential motion + lock durations
- Day 10: Banned-word audit + 3 system slogans
- Day 11: Warranty page + warranty layering
- Day 12: REHAU co-brand page
- Day 13: Showroom per-page builds
- Day 14: Cross-page polish pass

Each item has a corresponding §X reference back to this doc for the rationale.

---

## 17. Open questions

1. **Tita's "moving photos" — does that mean video loop (Marvin pattern) or photo cross-fade carousel (Sky-Frame pattern)?** Worth confirming. Current hero is video.
2. **Pricing transparency** — does Tita want "from ₱X / m" indicators anywhere, or strictly consultation-only? Vitrocsa skips entirely; Pella shows "From $X" alongside "Talk to a rep."
3. **PK House Philippines** — Ed Simon / 8×8 Design Studio used Vitrocsa on a PH project. Worth referencing? Or does that hurt us by name-dropping a competitor?
4. **Sub-brand vs single brand** — Andersen split Renewal as a sub-brand for promo voice. We have replacement-business potential. Worth considering long-term.
5. **REHAU co-brand depth** — how heavily does Tita want to lean on this? Some premium brands (Vitrocsa) never name their profile suppliers. Some (Schüco) ARE their profile.

---

## 18. Citation index

All 8 source audits are in `docs/`:
- `marvin-audit.md`
- `competitor-audit-andersen.md`
- `competitor-audit-pella.md`
- `competitor-audit-milgard.md`
- `competitor-audit-rehau.md`
- `competitor-audit-schueco.md`
- `competitor-audit-sky-frame.md`
- `competitor-audit-vitrocsa.md`

Tita's brief lives in `docs/REDESIGN_ROADMAP.md` §2.

When implementing any recommendation here, cross-reference the source audit's URL citations for the specific page that informed the pattern.
