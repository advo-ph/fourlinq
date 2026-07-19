# Post-meeting product realignment — roadmap benchmarks — 2026-07-10

This contract grounds the 2026-07-10 roadmap refresh in the meeting transcript, deployed production surface, current source/data, the local Purplegradient Marvin corpus, and current official comparator sites.

## Discovery summary

- **31 validated candidate signals** collapsed into **18 active roadmap items**, **6 hold/triage entries**, and **7 explicit rejections**.
- The active benchmarks below are candidate-tier and expected-red until their associated item is implemented.
- Candidate benchmarks are excluded from the normal build/test gate. Promotion into a required green gate happens only when the roadmap item is built.
- `npm run audit:prod-surface` is a read-only Tier 2 evidence harness. It blocks analytics/tracker writes and records the attempted requests.
- Tier 1 means deterministic automated test; Tier 2 means repeatable live/browser observation with a named protocol; Tier 3 means acceptance requiring client/source judgment.

## 2026-07-18 remediation checkpoint

- Project critical lane: green locally. Both San Lorenzo slug spellings share one canonical project, fallback-only projects survive empty/partial CMS responses, redirects wait for request settlement, and 1/2/3/5-photo states are covered.
- Buyer-decision lane: green locally. Configuration submission requires a server-confirmed success/reference; network, HTTP, and malformed-success paths stay visibly unsent. Brand warranty scope is not represented as certification, finish counts match the canonical 12-row set, and FAQ/chooser/configurator state has explicit ARIA/focus behavior and non-authoritative compatibility language.
- Trust-content lane: green locally. Public product matrices are empty until verified, news/project/legal/service language is bounded, quote/404 responses are truthful, and generated knowledge fails closed pending a reviewed safe reseed. Source-derived reel posters and motion controls are in place, while RM13 rights/provenance approval remains open.
- QA/closure lane: green locally. Viewport, a11y, and visual runners cover 20 rendered states, all three product aliases, seven widths, two interaction viewports, nested dialog focus, cookie/chat coordination, fresh-session Design Tool embed isolation, and 280 screenshot artifacts. `qa:parity` independently closes the exact 33-row matrix on mobile and desktop. Infra/incomplete runs exit 2; negative unreachable-server and parity-contract controls proved those boundaries.
- Design Tool lane: green locally. Embedded mode omits FourlinQ's cookie, navigation, footer, and chat layers; family tabs reduce the first-step scan; the preview compacts responsively; the glass step remains confirmation-only; and the final step exposes a review action plus an escape to the full tool.
- Fresh command evidence: `npm run build` exit 0; `npm run typecheck` exit 0; `npm run lint` exit 0; `npm test` exit 0 (89/89); `npm run qa:viewport` exit 0; `npm run qa:a11y` exit 0; `npm run qa:visual` exit 0; `npm run qa:parity` exit 0; `git diff --check` exit 0.
- Deployment/manual acceptance: still open. Migration 013 and the bounded knowledge seeder are authored only; they were not applied or run. These results describe the local working tree only.

## Benchmarks

### RM1 — Client-approved product master and glossary (Tier 3)

**Grounds:** meeting `00:04:40–00:16:05`, `00:36:04–00:38:35`, and `00:57:38–00:59:14`; current catalog/configurator/prompt data contradicts itself.

Pass iff:

- one versioned master covers every publishable product with stable code, FourlinQ name, industry synonym, family, operation, material, profile/series, availability, compatible finish/glass/hardware/screen/muntin/casing/automation, size rule, source asset, and claim source;
- each row has client approval state and approval date;
- unresolved phonetic terms remain unpublished and explicitly blocked;
- a test proves catalog, configurator, navigation, and LinQ seed input reference the master rather than divergent hardcoded lineups;
- Large Panel and 90 Series prompt/catalog contradictions are resolved before new imagery is generated.

### RM2 — Orthogonal catalog taxonomy (Tier 1 + Tier 3)

**Grounds:** meeting `00:05:22–00:10:59`; production currently presents Window, Door, Specialist, and Aluminium as peers.

Pass iff:

- every product has explicit `family`, `operation`, `material`, and `profile` values;
- Glass entries distinguish application/product family from glazing technology/option;
- `/products` visibly contains separate **By type** and **By material** groups;
- Aluminium is not a lone material in a peer family/type list;
- an automated invariant rejects missing axis values and impossible combinations;
- Tita approves the placement of Glass and Specialist/Custom work.

### RM3 — Category-first homepage order (Tier 1 + Tier 2)

**Grounds:** meeting `00:35:06–00:35:26`; current product gateway begins near `y=5400` desktop and `y=5064` mobile after a `500vh` sequence.

Pass iff:

- DOM and bounding-box tests at 390, 768, and 1440 prove `hero bottom < browse-products top < benefit-story top`;
- Browse Products starts within one ordinary viewport after the hero;
- the 500vh sequence is moved below the gateway and shortened or replaced;
- screenshots show both By type and By material without horizontal overflow.

### RM4 — One taxonomy across nav, home, product, and footer (Tier 1)

**Grounds:** production home shows three groups, `/products` shows four mixed peers, and footer shows the older three-family model.

Pass iff:

- one exported navigation/catalog model drives desktop menu, mobile menu, homepage gateway, `/products`, and footer;
- the same labels and destinations appear on all five surfaces;
- every internal destination returns its intended route, not a silent fallback;
- tests fail on label, count, or URL drift.

### RM5 — Public viewport containment (Tier 1 + Tier 2)

**Grounds:** production FAQ is 919px wide at 390 and 768; Design Tool is 404px wide at 390.

Pass iff:

- `document.documentElement.scrollWidth <= innerWidth + 1` for every public route at 375, 390, 560, 768, 992, 1199, and 1440;
- the FAQ topic rail scrolls inside its own bounded region without widening the document;
- FAQ accordion, Design Tool controls, footer, and fixed layers stay fully operable;
- `npm run audit:prod-surface` reports no horizontal-overflow row.

**Status (2026-07-18):** Green locally. `npm run qa:viewport` checks 20 rendered public states at 375, 560, 768, 992, 1100, 1199, and 1440px plus all three product aliases. It rejects server errors, missing app shells, blank 200 responses, route-heading drift, filter-state drift, and horizontal overflow. The former swallowed-navigation fallback is removed; an unreachable-server negative control exits 2. Production proof remains pending deployment.

### RM6 — Consent-enforced analytics (Tier 1 + Tier 2)

**Grounds:** 128 analytics attempts were observed before a cookie choice during the expanded read-only capture; Legal says analytics preferences are manageable.

Pass iff:

- fresh storage + no choice produces zero `/api/analytics` request;
- Decline produces zero analytics request for page view, scroll, click, configurator, product drawer, and LinQ open;
- Accept enables only the disclosed first-party events;
- changing or clearing the preference takes effect without stale tracking;
- Legal and banner copy describe the actual mechanism;
- automated browser tests cover all three preference states.

### RM7 — Claim, warranty, finish, and resource source registry (Tier 1 + Tier 3)

**Grounds:** active copy conflicts on 11/12 and six+six/seven+five finishes; production asserts storm, acoustic, UV/color-life, span, warranty, catalog, certification, and technical-resource facts without a consistent visible source.

Pass iff:

- every active numeric/technical/warranty/certification/catalog claim carries a source identifier pointing to a supplier sheet, test, flyer, contract, or client approval;
- `rg` finds no active conflicting finish count or universal warranty promise;
- warranty copy explicitly handles opt-out/project-specific terms;
- “Complete brochure,” CAD, BIM, catalog, and download language maps to a real current artifact or becomes a truthful request-support CTA;
- unsourced claims are removed or rewritten qualitatively;
- Tita approves the final customer-facing wording.

### RM8 — Documentation reality sync (Tier 1)

**Grounds:** README still describes Vercel/serverless deployment, old files/fonts/design, and limited routes; ROADMAP still says the shipped four-card build is blocked; DESIGN_SYSTEM says the merged branch is unmerged.

Pass iff:

- README names VPS/pm2 production, current scripts, route set, Express API, and current identity;
- ROADMAP marks the July 5 build as shipped then superseded by the July 10 taxonomy direction;
- DESIGN_SYSTEM names the actual tokens/fonts/components and no deleted branch as active;
- `rg "deployed on Vercel|Vercel Serverless|NOT yet merged|Instrument Serif \+ Inter|Blocked on meeting" README.md docs/DESIGN_SYSTEM.md docs/ROADMAP.md` returns only clearly labeled historical records.

### RM9 — Product detail truth and selection questions (Tier 1 + Tier 3)

**Grounds:** current drawers are visually strong but shallow; Casement uses “smooth-rolling”; several mechanisms and prompts conflict.

Pass iff:

- every approved product detail answers operation, suitable use, material/profile, size rule, finish, glass, compatible option, verified performance, resource, project proof, and quote path;
- operation wording and media match the approved glossary;
- Casement contains no sliding/rolling language;
- unavailable fields display an honest consultation/pending state rather than fabricated data;
- at least one automated fixture per operation family proves the correct media/copy binding.

### RM10 — Aluminium evidence completion (Tier 2 + Tier 3)

**Grounds:** production has three requested names but an imageless page with no source-backed specifications.

Pass iff:

- Regular/Non-Thermal, Thermal Break, and Slim Aluminium each have approved name, purpose, product compatibility, real profile/cutaway, installed-context image, finish/glass options, and source-backed specification or a clearly bounded request path;
- no borrowed competitor cross-section or invented dimension ships;
- desktop/mobile screenshots show useful visual comparison;
- page language treats Aluminium as a parallel choice, not merely “when uPVC isn't enough,” unless Tita approves that positioning.

### RM11 — Approved Glass hub (Tier 1 + Tier 3)

**Grounds:** meeting `00:09:05–00:10:59`; production has only six generic configurator tints.

Pass iff:

- Tita approves the offering list and whether each entry is application, product, or glazing technology;
- the hub covers only verified FourlinQ offers among frameless door, fixed panel, railing/balcony, double glazing, vacuum, switchable, and blind-between-glass;
- each entry has compatible frame/product, intended use, visual/diagram, safety/performance source, and consultation CTA;
- configurator uses the same glazing option codes;
- unsupported entries remain absent, not “coming soon” filler.

### RM12 — Compatibility-aware configurator (Tier 1 + Tier 2)

**Grounds:** meeting asks for Apple-like selection; current flow is Type → Finish → Glass → Size and implies broad compatibility.

Pass iff:

- approved sequence is Family/Operation → Material/Profile → Finish → Glass → Size → compatible option → Quote;
- invalid combinations cannot be selected and explain why;
- visible preview changes meaningfully for material, finish, glass, and operation where assets exist;
- state persists intentionally between steps and step change scrolls to the correct position;
- 390px and embedded-home flows have no document overflow, nested-scroll trap, or clipped choice;
- save failure never claims the sales team received the configuration.

### RM13 — Asset provenance and capture contract (Tier 1 + Tier 3)

**Grounds:** project images have useful Facebook provenance comments, but category cards, WP exports, generated-image plans, and client-supplied media do not share one enforceable manifest.

Pass iff:

- every public asset has stable code, source, right/owner, capture date, product/material/project tag, intended surface, desktop/mobile crop, alt text, edit history, AI status, and approval state;
- CI or a script rejects a missing public reference and rejects `project proof` when `is_generated=true`;
- category imagery is mapped to the category it claims to show;
- originals and approved edits are distinguishable;
- Google Earth/Street View is never treated as FourlinQ installation proof without documented licensing and project verification.

### RM14 — Rights-cleared Inspiration information model (Tier 1 + Tier 3)

**Grounds:** current project gallery is a strong base; Tita wants gallery, blog/vlog, exhibits, arrivals, and updates, but asset/content volume is uneven.

Pass iff:

- each project has approved product, material, operation, room/view, location disclosure, source/right, and caption tags;
- filters appear only when their tagged population meets a documented minimum;
- project, update, event, blog/vlog, and arrival are distinct content types with real CMS workflow;
- no empty channel or invented project launches;
- product detail can query related approved projects from the same tags.

### RM15 — Purposeful-motion and transfer budget (Tier 1 + Tier 2)

**Grounds:** home has roughly 27.4 MB of motion assets; useful product operation coexists with two 500vh stories, eager 12 MB hero media, and persistent requestAnimationFrame work.

Pass iff:

- a documented mobile and desktop byte budget is enforced in browser tests;
- hero has a first-paint poster and appropriate mobile encoding/source;
- `prefers-reduced-motion: reduce` and Save-Data render complete static alternatives and do not fetch frame sequences;
- large frame sets start only near the now-below-category section and stop requestAnimationFrame work while off-screen;
- project reels remain visibility-gated;
- operation sequences remain available on product cards/details with a still fallback;
- the category gateway is never delayed by animation completion.

### RM16 — Product navigation and guided browse (Tier 1 + Tier 2)

**Grounds:** desktop Systems is a text-only four-column flyout; Marvin and current comparators use structured product/material paths.

Pass iff:

- desktop and mobile navigation visibly separate By type and By material;
- menu labels derive from RM4's canonical model;
- keyboard can open, traverse, activate, and close the menu with correct `aria-expanded` and focus return;
- visual thumbnails/icons are used only when accurate and provenance-approved;
- Collections and Solutions do not appear as empty top-level links.

### RM17 — Accessibility and fixed-layer QA (Tier 1 + Tier 2)

**Grounds:** catalog animation layers produce empty-alt counts; fixed chat/banner obscured product, FAQ, configurator, and gallery controls in production observation.

Pass iff:

- every informative image has meaningful alt and every decorative image is explicitly `alt=""`/hidden;
- no empty link/button, keyboard trap, or unlabeled disclosure exists;
- chat, cookie banner, navigation, filters, drawers, quote controls, and footer links have non-intersecting clickable boxes at target viewports;
- chat follows the documented delay/scroll reveal and never covers the active control;
- reduced-motion and focus-visible behavior is verified on all interaction states.

**Status (2026-07-18):** Green locally. `npm run qa:a11y` covers 20 routes × mobile/desktop for missing alt, unnamed controls/dialogs, duplicate IDs, fixed-layer hit tests, and fresh cookie/chat coordination. It also opens chat, mobile navigation, product detail, and nested quote dialogs to prove initial focus, Tab containment, topmost-only Escape, parent preservation, and focus return. The focus-visible ring and reduced-motion reset remain in place. Production and manual assistive-technology proof remain pending deployment.

### RM18 — Disclosed, source-grounded LinQ buyer assistance (Tier 1 + Tier 3)

**Grounds:** meeting `00:27:51–00:28:46` asks what bias the AI has and how it answers “best uPVC”; current RAG inherits risky catalog claims.

Pass iff:

- written policy states whether LinQ is a disclosed FourlinQ sales assistant or neutral comparison guide;
- its sources derive only from approved RM1/RM7 data;
- a fixed test set covers best-product, competitor, warranty, sizing, material choice, glass, unsupported claim, uncertainty, and human handoff;
- answers cite/identify their FourlinQ source, state uncertainty, and never imply independent objectivity if it is a sales assistant;
- no tuning/prompt work is marked complete before RM1 and RM7 pass.

## Current diagnostic baseline

The July 10 read-only production capture established these expected-red facts for later comparison:

- home categories follow the 500vh benefits sequence;
- FAQ overflows at 390 and 768 to 919px;
- Design Tool overflows at 390 to 404px;
- analytics attempts occur before consent;
- homepage taxonomy, `/products`, and footer disagree;
- normal hero media is eager and the combined motion asset set is heavy;
- Aluminium is imageless and Glass has no hub;
- claim/resource/finish/warranty copy is contradictory;
- wildcard recovery renders with HTTP 200.

These are evidence baselines, not a normal test-suite failure. Each becomes a required gate only when its associated roadmap item is implemented.
