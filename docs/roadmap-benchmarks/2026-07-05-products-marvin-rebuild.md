# /products Marvin-style rebuild — roadmap benchmarks — 2026-07-05

Scoped run (design/UI). Discovered from: this session's code context, Imie chat round 3 (Jul 2/5), and the purplegradient Marvin audit at `/Users/angelonrevelo/Codex/purplegradient/websites/marvin` (`design.md` recipe).

## Discovery Summary

Discovered 8 → **6 genuine** · 1 rejected · 1 triage. All benchmarks below are **candidate-tier: expected-red until built**, and **gate-excluded** (they describe a not-yet-built layout — do not add to the live `npm run test` / `qa:visual` gate until the item ships; promote-on-build is the `/verify` moment).

**Design source (locked):** the Marvin scrape. Reuse *structure + grammar* only — `collection-card` family (photo + title + short desc + feature list + rectangular 4px CTA), 12-col/24px grid, breakpoints 576/768/992/1200/1400, mobile 2-col card grid, restrained hover. Replace Marvin's skin (amber `#ffc600`, Nationale) with FourlinQ brand (red `#C8102E`, Manrope/Fraunces). Anti-slop: real project photography, no gradient wash, no random pills, no oversized eyebrows.

## Benchmarks

### B18 — /products renders exactly 4 category cards (Tier 1, runnable, gate-excluded)
- **Grounds:** `src/pages/Products.tsx` currently a thin tab bar (`All Systems · Windows · Doors · Specialist`) + material toggle. Imie's Jul 2 diagram = 4 peer cards.
- **Fixture/scorer:** a `*.roadmap.test.tsx` (skipped by default runner) renders `<Products/>` and asserts exactly 4 category cards with accessible names `Window Systems`, `Door Systems`, `Specialist Systems`, `Aluminium Line`.
- **Pass:** 4 cards, those 4 names, no `role="tab"` material toggle remaining.
- **Red until built.** Promote into the suite when item R1 ships.

### B19 — one reusable `SystemCategoryCard` primitive (Tier 3, acceptance)
- **Grounds:** no shared card exists — `SystemsTiles.tsx` has `SystemFrameTile` (frame animation), `Products.tsx` has inline card markup, `Aluminium.tsx` has its own `<article>`. Three divergent card treatments.
- **Pass:** a single `SystemCategoryCard` (photo + eyebrow + name + item list + CTA, tokens from `theme.config.ts`) is consumed by both `/products` and `SystemsTiles`; grep shows no duplicate card markup across the two.

### B20 — SystemsTiles homepage: 3 → 4 cards (Tier 1, runnable, gate-excluded)
- **Grounds:** `src/components/home/SystemsTiles.tsx` `systems[]` has exactly **3** entries (verified: 3 `name:` keys, lines ~18-38). Missing "Aluminium Line".
- **Pass:** a skipped roadmap test asserts `SystemsTiles` renders 4 cards including "Aluminium Line" → `/products?category=aluminium` (or the confirmed route).

### B21 — real project photography on category cards, not synthetic renders (Tier 3, acceptance; blocked on Imie assets)
- **Grounds:** current cards use `SystemCardMedia` white-bg 3D renders; Imie rejected these ("sliding door looks like a 2-panel fixed", curtain wall not "tall and wide"). Marvin recipe + kennethandmock benchmark = real photography.
- **Pass:** each of the 4 category cards uses a real project photo (from `public/images/**`, provenance-tracked), zero white-background synthetic renders. **Blocked until Imie supplies/approves photos.**

### B22 — Why uPVC page is not a single-photo stub (Tier 3, acceptance)
- **Grounds:** `src/pages/WhyUpvc.tsx` — Imie Jul 2: *"Why uPVC just showed one photo — a cut section."*
- **Pass:** page has ≥3 distinct content blocks; the interactive "zero leaks"-style benefit treatment is present and also covers alu thermal break (her 2026-05-31 ask). Measured by section count + a visual-QA screenshot review.

### B23 — DESIGN_SYSTEM.md matches shipped brand (Tier 3, acceptance; overlaps B3/B4)
- **Grounds:** `docs/DESIGN_SYSTEM.md` banner says v3.0 is *"on `redesign-marvin` branch — NOT yet merged to main"* (it IS merged; branch deleted 06-21) and describes *"Instrument Serif + Inter"* — but shipped code uses **Manrope + Fraunces + Cormorant** (`tailwind.config.ts`).
- **Pass:** `grep -iE "not yet merged|Instrument Serif|Inter pairing" docs/DESIGN_SYSTEM.md` → 0 matches; the doc names the fonts/buttons/accent actually in `theme.config.ts`.

### B24 — responsive card grammar holds (Tier 2, live-model/visual manual-verify)
- **Grounds:** Marvin recipe: desktop row, mobile 2-col grid. FourlinQ `qa:visual` harness exists (`scripts/visual-qa.mjs`).
- **Procedure:** after R1 ships, run `npm run qa:visual` capturing `/products` at 375/768/1440. **Observation:** desktop = 4 cards in one row; mobile ≤ 768px = 2-col grid, no horizontal scroll, CTAs fit labels. PASS iff all three hold. (Manual/visual, non-idempotent — stated.)

## Honest gaps
- No GitHub sibling-repo mining this run (scoped to the Marvin scrape, which is the authoritative design source).
- B18/B20 are **spec-only, unproven** (not red-green cycled — the components don't exist yet).
- B21 and the whole layout are **blocked on the Imie meeting** (data-model question — see Triage in `roadmap-rejected.md`).
