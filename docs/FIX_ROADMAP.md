# Fix Roadmap — Post-Roast Triage

Consolidated from the two roast passes (UI/UX triage + premium-feel deep read).
Items prioritized by **visible damage** → **premium-feel** → **polish** → **page-level** → **mobile** → **data-blocked**.

Each item is independently shippable. Work through them 1 by 1. Update the status column as we go.

**Legend:** ⬜ pending · 🚧 in progress · ✅ done · 🚫 blocked (waiting on Tita / external)

---

## P0 — Visible bugs Tita will catch first (target: same-day)

| # | Item | Where | Fix | Effort | Status |
|---|---|---|---|---|---|
| 1 | **"Visit a Showroom" CTA appears 7× on home** | App.tsx (sticky), Index hero, BrandCTA, Brand etc. | Delete StickyShowroomCTA component entirely. Drop hero secondary CTA. Keep header tertiary + BrandCTA only (net 2 instead of 7). | 15min | ⬜ |
| 2 | **64-word instruction paragraph above 3D viewer** | Index.tsx 3D section | Cut to single line: "Drag to rotate. Click to open." Delete the disclaimer "The actual profile geometry…" | 10min | ⬜ |
| 3 | **"makinwhat" attribution too prominent in 3D viewer** | Window3D.tsx | Move from top-right of canvas to under-the-canvas microline alongside makinwhat credit + license note. Same legal coverage, less authorship erosion. | 15min | ⬜ |
| 4 | **"Built to last.\<br/\>Backed by…" awkward line break** | BrandCTA.tsx | Drop the `<br/>` — let period+space do the work. | 5min | ⬜ |
| 5 | **"Why uPVC for the tropics →" — too long for a tertiary link** | AuthorityStrip.tsx | Shorten to "Why uPVC →" | 5min | ⬜ |
| 6 | **Duplicate product images on /products/doors** (Sliding Door + Lift & Slide, French Door + 90 Series, Large Panel is project shot) | products.ts | Wire new AI-generated photos once user supplies (see AI_PHOTO_RUNBOOK.md §8 priority) | swap once generated | 🚫 user-generating |

---

## P1 — Premium-feel killers (target: this session)

| # | Item | Where | Fix | Effort | Status |
|---|---|---|---|---|---|
| 7 | **Hero headline reads dated** ("A lifetime of satisfaction and peace of mind.") | Index.tsx | Rewrite to one breath, one image — propose 3 options for Tita to pick: editorial / sensory / authority register | 15min copy | ⬜ |
| 8 | **Hero lede is 22 words of specs** | Index.tsx | Compress to 8-12 words. Save warranty for body. | 10min | ⬜ |
| 9 | **No eyebrow above hero H1** | VideoHero.tsx + Index.tsx | Add 11px caps line above H1 — "FOR THE PHILIPPINE CLIMATE" or "SINCE [YEAR]" once verified | 15min | ⬜ |
| 10 | **Hero has 2 CTAs same emphasis** | Index.tsx | Remove "Visit a Showroom →" secondary. Keep "Explore Systems" primary. Header tertiary carries that line. | 5min | ⬜ |
| 11 | **No video poster image** | VideoHero.tsx | Add `posterSrc` so first frame isn't black | 15min once still exported | ⬜ |
| 12 | **4 of 7 home H2s mention "Philippine/climate/home"** | EditorialIntro, AuthorityStrip, SystemsTiles, BrandCTA | Vary register: emotional / categorical / authority / sensory / editorial / social proof / invitation. Pick which 2 keep PH framing; rewrite the rest. | 45min copy | ⬜ |
| 13 | **EditorialIntro 2nd paragraph weaker than 1st** | EditorialIntro.tsx | Cut entirely. Let the strong first paragraph breathe. | 5min | ⬜ |
| 14 | **3-numeral parallelism broken** ("11 / 4 / 10-Year" — third is hyphenated text) | AuthorityStrip.tsx | Change third to "10" / "Year warranty" caption | 5min | ⬜ |
| 15 | **AuthorityStrip body redundantly says "Philippine climate"** | AuthorityStrip.tsx | Drop the redundant clause; tighten to 1-2 sentences | 10min | ⬜ |
| 16 | **SystemsTiles caption registers don't match** (Windows is sentence; Doors is list) | SystemsTiles.tsx | Match all 3 to sentences | 10min | ⬜ |
| 17 | **Finishes teaser section is content-less transition** | Index.tsx + Finishes teaser | Either inline a swatch row preview (4-6 swatches + "+5 more") or merge into 3D viewer's finish picker | 20min | ⬜ |
| 18 | **BrandCTA closing copy is 4 utility-grade sentences** | BrandCTA.tsx | Rewrite for rhythm — 2 evocative sentences instead | 15min copy | ⬜ |
| 19 | **InspirationStrip card categories use 6 different registers** | InspirationStrip.tsx | Pick one register; align all 6 captions | 10min | ⬜ |
| 20 | **InspirationStrip is 3×2 equal grid** (no editorial pacing) | InspirationStrip.tsx | Break rhythm: 1 full-bleed feature + 2-up + masonry below | 60min | ⬜ |
| 21 | **/why-upvc only 349 words** | WhyUpvc.tsx | Expand to 1200+ words: 2-3 paragraphs per existing H3 section, add a uPVC-vs-aluminum-vs-wood comparison table, add PH-climate diagram (numbered list ok) | 90min copy | ⬜ |
| 22 | **/finishes only 261 words** | Finishes.tsx + finish-scenes.ts | Add 50-word color story per finish (11 × 50 = 550 added words). Color name origin, suited architectural style, real PH project where it'd shine. | 90min copy | ⬜ |

---

## P2 — Polish

| # | Item | Where | Fix | Effort | Status |
|---|---|---|---|---|---|
| 23 | **Eyebrow letter-spacing 0.12em → 0.14em** | index.css `.eyebrow` | Tweak the utility class | 5min | ⬜ |
| 24 | **Body line-height 1.6 → 1.65** | index.css / tailwind config `--leading-body` | Tweak token | 5min | ⬜ |
| 25 | **Eyebrow+headline gap mb-5 → mb-7** | Across components (sweep) | Find/replace pattern carefully | 20min | ⬜ |
| 26 | **Red accent overused (8+ instances on home)** | Across components | Audit each red use. Demote 4-5 to neutral. Keep red for primary CTA + active states only. | 60min | ⬜ |
| 27 | **ConsultationForm step eyebrow repeats** | ConsultationForm.tsx | Vary per step: "Tell us / When is install / Where is project / How to reach you" | 10min | ⬜ |
| 28 | **ConsultationForm chip descriptions too short for card style** | ConsultationForm.tsx | Either expand to 25 words per chip OR collapse to single-line button | 15min | ⬜ |
| 29 | **ChatBubble: bot-only or human?** | ChatBubble.tsx | Verify with user. If bot-only, delete. If human, soften visual weight. | depends | ⬜ |
| 30 | **Cookie banner too loud on first paint** | CookieBanner.tsx | Reduce to single-line top strip OR quiet bottom strip with Accept only (X dismisses to Decline) | 30min | ⬜ |
| 31 | **Footer right column repeats "Philippine climate" tagline** | EditorialFooter.tsx | Drop the tagline; the wordmark microline already covers it | 5min | ⬜ |
| 32 | **Footer "Request a Quote" mislabels the consultation form** | EditorialFooter.tsx | Rename column link to "Book a Consultation" | 5min | ⬜ |
| 33 | **Footer missing SEC registration / head office address** | EditorialFooter.tsx | Add small registration line under copyright (need ID from Tita) | 10min once Tita confirms | 🚫 user-data |
| 34 | **3D viewer canvas gray (#ECECEC) feels industrial** | Window3D.tsx | Brighten to #F4F4F4 → #E8E8E8 linear gradient | 5min | ⬜ |

---

## P3 — Page-level / structural

| # | Item | Where | Fix | Effort | Status |
|---|---|---|---|---|---|
| 35 | **Home is 9436px (too long)** | Index.tsx | Merge AuthorityStrip + BrandCTA into one closing dark band. Drop standalone Finishes teaser section. Target ~6500-7000px. | 60min | ⬜ |
| 36 | **/design-tool shows "Live Preview" H3 with no preview** | DesignTool.tsx | Either ship the preview canvas OR delete the section heading | depends — verify first | ⬜ |
| 37 | **/help-me-choose only shows 1 question** | HowToChoose.tsx | Either fix the wizard so all 3 questions are reachable OR rename to "One question. One recommendation." | depends — verify wizard | ⬜ |
| 38 | **/whats-new empty filter tabs (Event, Press)** | WhatsNew.tsx | Hide categories with zero entries OR populate with structural placeholders | 15min | ⬜ |
| 39 | **/whats-new only 3 entries reads as launch state** | whats-new.ts | Add 3 more structural placeholder entries (no fake content — different types of update we'd legitimately publish) | 30min | ⬜ |

---

## P4 — Signature surface (pick one)

| # | Item | Where | Fix | Effort | Status |
|---|---|---|---|---|---|
| 40 | **Pick one differentiator surface** | new page | One of: <br/>(a) `/storm-tested` — typhoon timeline + survival stories <br/>(b) `/process` — workshop-to-wall scroll sequence <br/>(c) `/for-architects` — spec sheets + CAD + BIM downloads | 4-6 hrs | ⬜ pick |

---

## P5 — Mobile (verify after P0-P2)

| # | Item | Where | Fix | Effort | Status |
|---|---|---|---|---|---|
| 41 | **Verify 3D viewer touch drag isn't fighting page scroll** | Window3D.tsx | Test on mobile DevTools touch emulation; add `touchAction: 'none'` if needed | 20min test+fix | ⬜ |
| 42 | **AuthorityStrip 88px numerals on 360px viewport** | AuthorityStrip.tsx | Verify responsive — should drop to 48-56px on mobile, possibly stack vertically | 20min | ⬜ |
| 43 | **SystemsTiles tablet layout (2×1 + 1)** | SystemsTiles.tsx | Test md breakpoint behavior | 15min | ⬜ |
| 44 | **ProjectPhotoSwitcher thumbnail strip finger-sized** | ProjectPhotoSwitcher.tsx | Verify thumbnails ≥44×44 hit zone on mobile | 10min | ⬜ |

---

## P6 — Blocked on Tita data

| # | Item | What we need | Status |
|---|---|---|---|
| 45 | Architect attribution per project (Quezon City, Tagaytay, Antipolo, Las Piñas, Three-storey, Makati) | Real architect names + firm names | 🚫 user-data |
| 46 | Press brackets ([BLUPRINT], [WALLPAPER*], [TATLER], etc.) | Real press placements with year + URL | 🚫 user-data |
| 47 | Owner/architect quotes per project | Real quotes or written approval to mint house copy | 🚫 user-data |
| 48 | Founding year (22-year claim currently dropped) | Confirm exact year | 🚫 user-data |
| 49 | Real Manila workshop photography | 6-8 photos: measurement, profile cutting, hardware install, finished system | 🚫 user-data |
| 50 | Real install / process video | 30s loop showing actual project install | 🚫 user-data |

---

## Execution order — start at #1 and walk down

We work P0 first (#1-5, then #6 unblocks when photos land), then P1 (#7-22), then P2 (#23-34), then P3 (#35-39), then pick a P4, then sweep P5.

P0/P1/P2 combined ≈ 9-11 hours of work. Fully achievable across the remaining time before Tita's Sunday May 24 review.

**Status:** Item #1 next.
