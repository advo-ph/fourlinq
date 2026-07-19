# FourlinQ production + Marvin comparison audit — 2026-07-10

## Remediation evidence — 2026-07-18

The July 10 production baseline remains historical evidence. A new 33-row Marvin-to-FourlinQ reconciliation was plotted in [Figma](https://www.figma.com/design/rkxrwBdudbFAg7L0OgcV8V) and checked against both current production and the local source. The first local checkpoint fixes the two critical San Lorenzo route rows as one implementation defect: American `aluminum` canonicalizes to the published British `aluminium` slug; partial CMS responses merge over verified fallback projects instead of replacing them; unknown slugs redirect only after the CMS request settles; and 1/2/3/5-photo gallery states have regression coverage. The second checkpoint repairs the buyer-decision lane: a failed Design Tool request cannot invent a reference or claim submission; modal, preview, FAQ disclosure, and chooser transitions have explicit keyboard/screen-reader state; the Brand page no longer labels brochure warranty bullets as certifications; the verified finish count is five solid plus seven wood-grain; and unverified compatibility, process, exclusion, and response-time promises are replaced with bounded confirmation language. The third checkpoint bounds warranty, care, architect, material, finish, legal, news, project, product, quote, and 404 content to available evidence; keeps unsupported product matrices empty through both fallback and DB routes; replaces stale knowledge passages with a fail-closed seeding contract; removes unsupported project taxonomy/location/performance presentation; and gives real reel media source-derived posters plus accessible motion controls. The fourth checkpoint hardens browser QA and the shared focus contract. The fifth runs the exact 33-row closure on mobile and desktop. The sixth isolates the embedded Design Tool from FourlinQ's cookie/navigation/footer/chat layers and gives its five-step flow grouped families, a compact auto-sized responsive preview, an honest glass state, and an explicit final action. Fresh local build, typecheck, lint, and test commands all exit 0 (89/89 tests); viewport, a11y, visual, and parity gates also exit 0. These checkpoints are not deployed, migration 013 has not been applied, and the production baseline below is intentionally unchanged.

### Exact 33-row local closure

“Green” below means the intended FourlinQ outcome is verified locally. It does **not** retroactively turn every historical Marvin depth score into a visual-clone PASS. FourlinQ keeps its own brand, local conversion model, real source inventory, and explicit no-invention boundary; content depth that requires client-approved products, documents, rights, or project facts remains source-blocked.

| # | Matrix row | Local disposition | Closure evidence |
|---:|---|---|---|
| 1 | `shared-chrome` | Green adaptation | Lean Systems/projects/news/material/brand navigation, skip link, footer, chat, and accessible mobile dialog verified. |
| 2 | `home` | Green adaptation | FourlinQ hero, category/benefit ordering, real media, reduced motion, and local CTA grammar retained. |
| 3 | `product-hub` | Green, source-bounded | By type and By material stay orthogonal; unsupported specification depth is not invented. |
| 4 | `product-window` | Green, source-bounded | Active state, cards, accessible product drawer, quote path, and empty-until-verified matrices pass. |
| 5 | `product-door` | Green, source-bounded | Active state, cards, accessible product drawer, quote path, and empty-until-verified matrices pass. |
| 6 | `product-specialist` | Accepted no-equivalent | Local specialist path remains functional and explicitly requires feasibility review. |
| 7 | `product-alias-window` | Green | Canonicalizes to `?filter=windows`. |
| 8 | `product-alias-door` | Green | Canonicalizes to `?filter=doors`. |
| 9 | `product-alias-specialist` | Green | Canonicalizes to `?filter=specialist`. |
| 10 | `news-index` | Green, source-bounded | No false links or fabricated publication dates; CMS/fallback date state is explicit. |
| 11 | `warranty` | Green, source-bounded | Brochure scope is distinguished from full controlling terms; no invented process or exclusions. |
| 12 | `project-index` | Green, source-bounded | Published archive remains browsable without invented category, attribution, or performance metadata. |
| 13 | `project-detail-gallery-4` | Green | Five total photos, one active accessible image, and usable thumbnail/cursor behavior verified. |
| 14 | `project-detail-gallery-2` | Green | Three total photos and the same gallery contract verified. |
| 15 | `project-detail-gallery-1` | Green | Two total photos and the same gallery contract verified. |
| 16 | `project-detail-gallery-0` | Green | Single-photo state renders without an empty thumbnail rail or fabricated media. |
| 17 | `project-san-lorenzo-aluminium` | Green; critical fixed locally | Published British spelling reaches the project. |
| 18 | `project-san-lorenzo-aluminum` | Green; same critical fixed locally | American spelling canonicalizes to the same published project. |
| 19 | `architect-resource` | Green, source-bounded | Technical request intake is truthful; no fake CAD/BIM/specification library. |
| 20 | `design-tool` | Accepted no-equivalent | Five-step visual brief works; only a server-confirmed reference can claim submission; embedded mode is chrome/cookie isolated, responsive, and has a visible final review action. |
| 21 | `material-upvc` | Green adaptation | Brochure statements are separated from project-specific ratings and compatibility. |
| 22 | `material-aluminium` | Green, source-bounded | Published system names remain; exact profiles, limits, options, ratings, and assets require confirmation. |
| 23 | `brand` | Green adaptation | FourlinQ story, brochure summary, consultation, and location outcomes remain distinct from Marvin history/dealer depth. |
| 24 | `brand-contact-anchor` | Green | `#contact` settles below fixed navigation on mobile and desktop. |
| 25 | `brand-showroom-anchor` | Green | `#showrooms` settles below fixed navigation on mobile and desktop. |
| 26 | `faq` | Accepted no-equivalent | Stable deep links, complete disclosure semantics, and bounded answers verified. |
| 27 | `care` | Green, source-bounded | Conservative system-specific checklist replaces an invented manufacturer manual. |
| 28 | `chooser` | Accepted no-equivalent | Focused three-question flow returns a non-authoritative starting direction. |
| 29 | `finish` | Green, source-bounded | Verified five-solid/seven-wood-grain library is explicit; universal compatibility is not claimed. |
| 30 | `legal-privacy` | Green | Current website behavior and data limits are described; active legal notice state verified. |
| 31 | `legal-terms` | Green | Configurator/site limitations and controlling project documents are explicit; active state verified. |
| 32 | `legal-cookies` | Green adaptation | First-party opt-in mechanism and preference reset are described; active state verified. |
| 33 | `not-found` | Green | Recovery UI resolves locally and the Express wildcard contract returns HTTP 404. |

Automated closure: `npm run qa:parity` passes all 33 rows at 390×844 and 1280×900. Supporting gates pass 20 rendered states × seven widths, 20 states × two accessibility viewports, three product aliases, nested focus states, fresh-session embed isolation, and 280 top/bottom screenshots. The original two CRITICAL rows are recorded as one fixed local defect, not two separate fixes.

## Decision

FourlinQ does not primarily have a visual-design problem. The production site is already polished, editorial, image-led, and more animated than the reference in several places. Its urgent problem is that the buying structure is less clear than the spectacle around it.

The repair is therefore **not “clone Marvin.”** It is:

1. establish one client-approved product and terminology source of truth;
2. separate browsing **by type** from browsing **by material**;
3. put that product gateway immediately after the hero;
4. retain motion that demonstrates operation or proof;
5. shorten, move, or remove motion that delays product discovery;
6. publish only product claims, documents, photos, collections, and solutions that FourlinQ can prove.

This directly answers the strongest meeting instruction: “categorize muna” because the site reaches benefits before categories (`00:35:06–00:35:26`), followed later by “mostly about finishing off the categories” and organizing material (`00:57:17–00:58:37`).

## Evidence boundary

### FourlinQ

- Production: `https://fourlinq.ph`, deployed from `07de848` on `main` on 2026-07-05.
- Primary production audit: 19 routes × 3 viewports (`390×844`, `768×1024`, `1440×900`) plus four interaction states. A second read-only pass covered 20 public route states × 3 viewports, including a project detail and wildcard 404.
- Reproducible command: `AUDIT_BASE_URL=https://fourlinq.ph npm run audit:prod-surface`.
- Production capture used a read-only network policy: analytics writes and third-party tracking were blocked and recorded.
- Source inspection covered routing, home composition, product catalog, configurator, project data, motion hooks, claims, consent, and public asset weight.
- Meeting evidence: `/Users/angelonrevelo/Downloads/Fourlinq Meeting-transcript.txt` and the generated meeting summary. The transcript's speaker diarization is unreliable, so the time-coded statements are evidence but speaker labels are not treated as perfect attribution.

### Marvin

- Local corpus: `/Users/angelonrevelo/Codex/purplegradient/websites/marvin`.
- Corpus scope: 286 discovered routes, 51 selected representatives, 37 audited HTML routes, and 14 selected document assets.
- Corpus caveat: it is representative, not exhaustive. It records 2,451 blocking state gaps; popup and animation counts are inflated; route completion does not prove full animation, section, icon, or CSS reconstruction. Screenshots and raw route artifacts are therefore stronger evidence than generated `design.md` prose.
- Current official pages were checked separately: [Products](https://www.marvin.com/products), [Collections](https://www.marvin.com/products/collections), [Compare Collections](https://www.marvin.com/products/collections/compare-collections), [Solutions](https://www.marvin.com/solutions), [Photo Gallery](https://www.marvin.com/inspiration/photo-gallery), and [Architectural Resources](https://www.marvin.com/support/architectural-resources).

Several important Marvin overview routes—including `/products`, window/door category overviews, Compare Collections, Gallery, and Professional Resources—were discovered but do not have full local page screenshots because the corpus deduplicated them against other templates. Their current information architecture is supported by official live pages; pixel-level claims are not inferred from the missing captures.

## Marvin visual and interaction grammar

| Layer | Evidence-backed pattern | FourlinQ implication |
|---|---|---|
| Color | White canvas, `#242424` ink, near-black editorial fields, pale neutral sections, and `#ffc600` reserved mainly for Find a Dealer | Keep the contrast hierarchy, not the yellow. FourlinQ red remains the action/accent identity. |
| Type | Nationale sans for most headings/UI/body; selective Tabac serif for cinematic/editorial statements; captured sizes from 12 to 56px | FourlinQ's current sans + serif editorial split already expresses this principle. Do not copy commercial fonts. |
| Grid/rhythm | 12-column grid, 24px gaps, recurring 16/24/40/80/128px spacing, breakpoints 576/768/992/1200/1400 | FourlinQ already uses a similar editorial system. Preserve it and focus on order/data truth. |
| Controls | Rectangular 40px controls, 12×24px padding, 4px radius, quiet 300ms color/border hover; no card lift/glow | FourlinQ's restrained square controls are aligned. Avoid adding ornamental interaction. |
| Header | Inset/translucent home header over the hero; simpler white inner-page header; deep mega-menu as the real product navigator | Keep FourlinQ's header treatment; reorganize menu content by type and material. |
| Collection identity | Whole editorial color/image fields differentiate five real lineups; each has products, benefits, options, resources, and comparison | Do not imitate the names/colors. Use the completeness standard as the gate for any FourlinQ collection. |
| Mobile transformation | Product grids become compact media rows, dense tables become disclosures, footer/utility columns become accordions | Apply these transformations to product details, specifications, FAQ, and professional content rather than shrinking desktop layouts. |
| Motion | Hero video, mega-menu overlay, horizontal rails, accordion state, selected sticky/reveal/parallax behavior, and restrained hover | Copy the task relationship. Ignore unproven corpus labels such as cursor trail, particle field, universal parallax, or “48 moving elements.” |

## What Tita actually asked for

| Requirement | Meeting evidence | Planning interpretation |
|---|---|---|
| A moving page, not a still photo | `00:02:59` | Keep purposeful motion. This is already substantially present. |
| Simple, organized top-level paths | `00:04:00` — Product, Collection, Solution, Distribution | Adopt the information clarity only where FourlinQ has real content. Do not create empty peer pages. |
| Browse products by material | `00:05:22–00:08:26` | Material is a separate axis: uPVC first, then regular/non-thermal aluminium, thermal break, and slim aluminium. |
| Glass must be discoverable | `00:09:05–00:10:59` | Clarify which entries are glass applications versus glazing technologies before building the hub. |
| Configurator should feel like Apple selection | `00:06:20`, `00:11:11–00:11:28`, `00:36:34` | Type → material/profile → finish → glass → size/options, with a meaningful visual change and valid compatibility only. |
| Operation and terminology must be correct | `00:04:40–00:05:11`, `00:12:32–00:16:05` | A signed glossary and operation reference must drive cards, copy, animation, search, and LinQ. |
| Existing door animation is good | `00:17:07–00:17:36` | Preserve and expand only where the underlying product is verified. |
| Adapt Marvin closely where applicable | `00:19:29–00:19:41` | Copy structure and interaction grammar, not assets, words, brand, collection names, or exact compositions. |
| Expose hardware, glass, screens, muntins, casing, automation, and opening devices | `00:20:09–00:21:17` | Build a compatibility layer first; do not show every option on every product. |
| Quality matters more than rushing | `00:21:03` | Use client sign-off and source gates before product publication. |
| Collections describe a look, but FourlinQ lacks enough photos | `00:22:43–00:23:48` | Hold Collections until its axis and asset set are real. |
| Brochure capability is later; FourlinQ has no full catalog | `00:25:14–00:25:56`, `00:39:04` | Remove or soften claims that a complete brochure already exists. |
| Solutions are wanted but FourlinQ is not ready | `00:26:01–00:26:58` | Hold the public Solutions section. Prepare its data contract only. |
| Inspiration can combine gallery, blog/vlog, exhibits, arrivals, and updates | `00:26:58–00:27:37` | Unify content only as real content types and workflows exist. |
| Categories must precede benefits | `00:35:06–00:35:26` | This is the highest-confidence homepage layout change. |
| New product terms still need identification | `00:36:04–00:38:35` | Do not publish phonetic names or inferred mechanisms until approved. |
| Explain product performance | `00:57:38–00:59:14` | Use supplier/test evidence and plain language; “research it” is not permission to invent a claim. |
| Fix the current site before more proposals | `01:10:42–01:10:55` | Website truth, taxonomy, and agreed flow are the scope gate. |

The social-content retainer, personal/corporate YouTube, CRM, fabrication tracking, attendance, payroll, Moodle, and life-coaching discussions are separate proposal or discovery lanes. They are not website-remediation acceptance criteria.

## Production surface inventory

| Surface | What production currently does well | Material gap or risk |
|---|---|---|
| Global header | Quiet 72px fixed navigation, clear consultation CTA, responsive full-screen mobile menu | “Systems” mixes Window/Door/Specialist with Aluminium; no By type / By material split; no Glass path; desktop mega-menu is text-only. |
| Hero | Full-bleed project video, strong approved headline, two clear CTAs, transparent-to-solid navigation | Normal connections preload a 12 MB MP4, including ordinary mobile; implementation does not honor the comment promising a narrow-viewport fallback; no poster is supplied. |
| Post-hero story | Sophisticated 340-frame product sequence with rain, thermal, and sound phases | It occupies `500vh` and appears before product categories. It loads 5.4 MB of frames, has no reduced-motion branch, and makes Categories begin around 43% down the mobile page. |
| Homepage product gateway | Three animated Window, Door, and Specialist groups | Omits Aluminium and Glass; repeats the old taxonomy; claims “twelve colors”; source descriptions contain unverified spans/specification language. |
| `/products` landing | Four strong, real-photo category cards with useful item lists | The peer set mixes three family/type buckets with one material; it implements the pre-meeting model rather than the meeting's By type + By material instruction. |
| Window catalog | Clean four-product grid and useful operation cutouts | No material/profile filter, comparison, project proof, or option compatibility. Some animation-layer images have empty alt text. |
| Door catalog | Seven products and ten total supported open/close sequences across catalog surfaces | Several names/specifications still need client verification; the Casement drawer describes “smooth-rolling,” which is the wrong operation; product/prompt contradictions exist. |
| Specialist catalog | Clear Arch, Curtain Wall, and Custom Shapes group | “Specialist” combines shape, facade, and custom fabrication rather than a stable buyer axis; imagery is isolated and not project-linked. |
| Aluminium | The three requested system names are present with “best for” guidance | Entire page is text-only, has no product photos, profile cutaways, drawings, compatibility, or source-backed specification. “When uPVC isn't enough” frames aluminium as an exception rather than a parallel material choice. |
| Design Tool | Real four-step interaction, live SVG preview, finish/glass/size changes, quote path | Missing material/profile, hardware, screen, muntin, casing, automation, and compatibility; 14px horizontal overflow at 390px; current selection implies every combination is valid; the homepage's fixed-height iframe creates nested scrolling and clipped choices. |
| Help Me Choose | Simple three-question guided route to recommendations | It depends on the same incomplete product truth and taxonomy; recommendation rules need client-approved compatibility. |
| Why uPVC | Substantial editorial story, profile cutaway, feature grid, and comparison table | A second `500vh` pinned sequence creates extreme length and a large blank interval in full-page capture; “twelve” copy conflicts with other source counts; performance copy and comparisons lack a visible evidence registry. |
| Finishes | Attractive actual texture grid and a clear showroom CTA | Public copy claims seven wood-grain + five solid, twelve brochure-verified finishes, and 25 years of tropical color durability; Brand says six + six, while other repository docs/data disagree between 11 and 12. |
| Inspiration / projects | Twelve real project entries sourced from FourlinQ Facebook posts with verified post-level grouping | Taxonomy is generic and not connected to the product/material master; several older images include baked-in FourlinQ labels/watermarks; rights/approval metadata is not a first-class manifest. |
| What's New | Eight useful project/product/event entries with filters | It is separate from Inspiration and contains active “twelve finish options” copy; no blog/vlog/new-arrival content model. |
| For Architects | Strong editorial hierarchy, direct engineering contacts, request workflow, and project-support steps | Claims a “Complete brochure,” CAD drawings, BIM work, technical files, and a universal 10-year system story that must be reconciled with actual deliverables and the meeting. |
| Warranty | Detailed, readable warranty flow and exclusion information | It presents a universal written 10-year warranty while the earlier client note says some customers opt out. Exact coverage/source must be conditional and traceable. |
| Care / FAQ | Useful ongoing-support content and clear disclosures | FAQ topic rail expands the document to 919px on both phone and tablet; cookie and chat layers obscure first-use content. |
| Brand / showrooms | Strong real-home hero, consultation flow, four showroom cards, and cohesive FourlinQ identity | “Certifications & standards” does not name actual certifications; repeated 10-year and finish-count claims require source review. |
| Footer | Consistent dark recovery/navigation layer | Repeats the old family taxonomy and omits Aluminium and Glass, so it disagrees with `/products` and the meeting. |
| Consent / analytics | Visible accept and decline controls | `/api/analytics` is called before either choice. Decline stores a value but the analytics hook never reads it, so consent is not enforced. |
| Wildcard 404 | Attractive recovery page | The server returns HTTP 200 instead of a true 404, weakening crawling, monitoring, and analytics truth. |
| Admin | Separate protected surface | Included only as a route smoke check; not part of this public-design comparison. |

## Motion and scroll audit

| Mechanism | Current implementation | Weight / behavior | Decision |
|---|---|---|---|
| Hero loop | `VideoHero.tsx`, autoplay/loop/muted, `preload="auto"` | About 12 MB; normal mobile receives it unless connection APIs report Save-Data or 2G; reduced motion swaps to a carousel | **Keep, optimize.** Add a poster, mobile encode/budget, and truthful fallback behavior. |
| Benefit scrollytelling | `ScrollWindow.tsx`, `340` WebP frames across four phases | 5.4 MB; `500vh`; JS scroll mapping + auto-play; no reduced-motion path | **Move after the category gateway and shorten.** A static reduced-motion version is required. |
| Homepage system sequence | Three × `53` frames | 5.3 MB; each tile begins near viewport, then keeps a requestAnimationFrame loop alive | **Retain selectively.** Add Aluminium only after taxonomy approval; pause off-screen; skip under reduced motion/data saver. |
| Product operation | Ten products × `28` WebP frames | 1.4 MB total; hover forward/reverse and click in drawer | **Keep.** It directly answers Tita's operation request; correct the product truth and alt/fallback behavior. |
| Project reel | Three videos, `preload="none"`, IntersectionObserver play/pause | About 4.8 MB total when viewed | **Keep.** It is real-project proof and already visibility-gated. Add captions/posters/provenance. |
| Scroll reveal / image hover | Quiet fade/reveal, 700ms image zoom, 300ms link/control transitions | Widespread but restrained | **Keep.** Honor reduced motion and ensure content is never opacity-hidden indefinitely. |
| Drawer / menu / consent | 300–400ms transitions | Clear state change | **Keep.** Prioritize keyboard/focus and fixed-layer collision tests over more flourish. |

Marvin's useful motion is subordinate to tasks: restrained hover, reveal, sticky product/options areas, parallax in selected product pages, and case-study video. The reference does not justify a long pinned barrier before product discovery. FourlinQ should remain the more expressive site, but only after the visitor can understand what is sold.

The current home contains roughly **27.4 MB of motion media** before ordinary project imagery when the hero, 340-frame benefit sequence, 159 system-tile frames, and three reels are counted together. This is an asset budget, not a claim that every byte transfers on first paint: the reels use `preload="none"`, while the hero is eager and frame sets begin once their observed section is nearby.

## Marvin template coverage

| Captured template family | Reliable structure | What FourlinQ should learn |
|---|---|---|
| Homepage | Hero → immediate collection education → Windows/Doors gateway → dark case-study/video → latest stories → experience/showroom → utility cards | Product or collection understanding is established before deep benefit storytelling. FourlinQ should lead with the product gateway because it has no ready collection system. |
| Products navigation | Mega-menu left rail switches Windows, Doors, and Material; main panel uses isolated product cutouts and labels | Build clear axes and scan-friendly product choices. The standalone overview capture is missing, so do not copy unverified pixel layout. |
| Collection detail | Signature hero → proposition/benefits → case-study proof → Window/Door grid → option/detail tiles → catalog/spec resources → compare | Use this only as a completeness checklist if FourlinQ later defines genuine collections. |
| Product detail | Breadcrumb/H1 → compact facts → lifestyle highlight + benefits → large option band with isolated render/operation/disclosures → resources → related products | This is the best reference for expanding FourlinQ's drawer/detail around buyer decisions. |
| Material/design option | Definition + macro image → benefits → applicable lineups → education/FAQ → related material → support/dealer | Create parallel uPVC/Aluminium/Glass evidence pages with actual FourlinQ macros and compatibility. |
| Solution overview/detail | Real problem proposition → alternating image/text offers → product/control choices → case study → expert/resources | Treat it as a future data/content contract because Tita said FourlinQ is not ready. |
| Blog/inspiration | Result count, filters, story grid/feed, category/title/excerpt, progressive load | Start smaller with approved content and meaningful tags. Do not imitate Marvin's 159-story scale. |
| Support/energy | Contextual hero, grouped disclosures, glossary/table/detail modules, dealer/support CTA; mobile converts dense tables to disclosures | Reuse for care, FAQ, Glass education, and verified performance—never for unsupported technical claims. |
| Dealer | Desktop search card over showroom image; mobile form before image; location/professional branching | FourlinQ's showroom/consultation model is the local equivalent; it does not need a US dealer locator. |

## Granular FourlinQ ↔ Marvin comparison

| Section / capability | FourlinQ production | Marvin pattern | FourlinQ action |
|---|---|---|---|
| Header | Five main labels; Systems flyout; consultation CTA | Products, Collections, Solutions, Inspiration, For Pros; utility conversion | Rebuild Systems as a two-axis product menu. Keep FourlinQ's smaller top level until Collections/Solutions are ready. |
| Hero | Strong full-screen video and approved headline | Full-bleed architectural image/video with restrained overlay copy | Keep FourlinQ. Optimize bytes and poster; do not adopt Marvin copy/type/yellow. |
| First post-hero decision | 500vh benefit animation | Collection or product education appears early | Put Browse Products immediately after hero. Move the story below it. |
| Browse by type | Window, Door, Specialist | Operating-type paths for Window and Door | Use Window, Door, Glass application, and verified Specialist/Custom paths. Do not use Aluminium as a peer type. |
| Browse by material | Aluminium is one category card; uPVC is inferred | Material is a separate navigational and content axis | Add explicit uPVC and Aluminium material paths. Decide whether Glass is material, application, option, or more than one. |
| Collection | Absent; project filters are not collections | Five differentiated lineups, each with material/product/options/resources and comparison | Hold. A FourlinQ “collection” needs an approved customer difference and comparison matrix, not a decorative name. |
| Product landing | Four full-photo cards, already adapted from Marvin | Products gateway plus clear window/door/material discovery | Keep the card grammar but reorganize it into By type and By material groups. |
| Product card | Isolated cutout, name, one-line claim, operation animation | Consistent product rendering, collection/material metadata, related choices | Preserve animation; add material/profile availability and verified use case. |
| Product detail | Drawer with description, specs, finishes, glass, quote | Full page with highlights, material/sizing/color/energy summary, operation/options, files, related products | Do not copy the full page blindly. Expand the drawer or create a detail route around buyer questions and actual FourlinQ evidence. |
| Product options | Finish and glass labels | Materials, finishes, hardware, glass, screens, divided lites, casing, sensors, opening devices | Add only client-approved compatible options. Use an option matrix shared with the configurator. |
| Configurator | Type → Finish → Glass → Size | Deeper design options and product configuration on mature data | Add Material/Profile before Finish; disable invalid combinations; keep quote, not checkout. |
| Material page | uPVC is rich; Aluminium is text-only; Glass missing | Dedicated material education tied to collections/products | Create parallel evidence-backed material templates. Do not imitate Marvin's wood/fiberglass offerings. |
| Benefits | Dramatic product scrollytelling before categories | Benefit/performance appears after a product context exists | Keep after category selection; source claims; allow reduced-motion static reading. |
| Inspiration | Twelve projects + separate update feed | Large filterable gallery, latest stories, case studies | Start with curated, rights-cleared work and reliable tags; unify content routes without inventing volume. |
| Project detail | Real galleries and narrative where data exists | Case-study storytelling, product/collection associations | Add product/material/operation tags and exact photo approval; never fill missing projects with fake proof. |
| Professional resources | Request-based cards and direct contacts | Real specifications, drawings, catalogs, education, project support | Keep the human support strength; list only files that exist and label request-only content honestly. |
| Solutions | Missing | Problem-led pages with applicable products and expert support | Hold because Tita said FourlinQ is not ready. Define the required evidence contract now. |
| Dealer/distribution | Showrooms and consultation | Dealer finder and professional/dealer handoff | FourlinQ does not need a US dealer model. Clarify “Distribution” as showrooms/service coverage only if the client approves that label. |
| AI assistant | LinQ RAG assistant exists | No reference requirement to copy | Treat LinQ as a disclosed FourlinQ sales assistant. Fix source truth before tuning “best uPVC” answers. |
| Footer | Four columns, old taxonomy | Deep recovery directory across products/support/buying | Keep the visual treatment; make its links derive from the canonical taxonomy. |

### External validation beyond Marvin

- [Andersen](https://www.andersenwindows.com/) and [Schüco residential products](https://www.schueco.com/de-en/home-owners/products) both expose product groups before deep benefit education.
- [Milgard Windows](https://www.milgard.com/windows) shows operating style first, then material-led series and comparison.
- [Pella Windows](https://www.pella.com/ideas/windows/) supports parallel entry by type, material, and product line; [Pella features/options](https://www.pella.com/ideas/windows/features-options/) confirms that hardware, grille, screen, trim, glass, and smart features are separate option layers.
- These sites validate separate axes and task-led media. They do not validate cloning US collections, codes, warranty language, pricing, dealer models, or product types.

## Asset and placeholder plan

| Asset family | What exists now | Required source | Safe placeholder rule |
|---|---|---|---|
| Type/category hero | Four generic FourlinQ project images on `/products` | One rights-cleared, correctly tagged hero for Window, Door, Glass application, Specialist/Custom, uPVC, and Aluminium; desktop and mobile crops | Use a labeled neutral “photo pending approval” block or a verified existing project. Do not imply a photo shows a category it has not been mapped to. |
| Product cutout | Fourteen isolated WP-export images; ten have operation sequences | Consistent product elevation/studio image for every approved product, with operation state and handle direction verified | Existing isolated image may remain with “illustrative configuration” language. Do not generate a different mechanism. |
| Operation media | Ten 28-frame sequences and one YouTube reference | Short loop, poster, alt/description, reduced-motion still, source/approval per product | Static closed-state cutout for unsupported products. No generic animation. |
| Aluminium | One thermal-break overlay; no page photography | Regular/non-thermal, thermal break, and slim profile cutaways; installed context; cross-section/dimension source; finish/glass compatibility | Text + “technical image pending” is safer than a borrowed competitor cutaway. |
| Glass | Six generic configurator tints only | Separate imagery for frameless door, fixed panel, railing/balcony, double glazing, vacuum, switchable, and blind-between-glass after offering approval; layer diagrams where useful | Neutral labeled diagram may be commissioned from verified construction data. Never use a competitor's product cross-section. |
| Configurator elevation | SVG preview for existing types | Normalized front elevations/transparent renders for every supported material/profile/type state | Disable unsupported combinations; do not fake a visual change with tint alone. |
| Finish | Twelve displayed textures; source-count conflict | Straight-on physical sample board, label mapping, actual availability by material/profile | Use a neutral swatch with “sample confirmation required.” AI texture needs client approval and cannot be described as exact. |
| Hardware/options | Schema support for hardware, no public image set | Actual handles, locks, rollers, screens, muntins, casing, sensors/access, opening devices; compatibility mapping | Text-only “available by consultation” after approval. No option thumbnail until a real SKU/photo exists. |
| Product specification | Mixed static claims and request cards | Supplier sheet, test report, client-approved flyer, dimension drawing, or explicit approval ID | Omit the number; describe the concept qualitatively and label it as project-dependent. |
| Project/gallery | 37 Facebook-scraped images across 12 mapped projects | Original-resolution file, approval/rights, project-to-product/material mapping, allowed edits, caption, photographer/source | Keep current verified Facebook image or a visible pending block. Never use generated architecture or Google Earth/Street View as FourlinQ installation proof. |
| Collection | None | Approved collection axis, distinct hero, sufficient project set, product lineup, option/spec difference, comparison data | Do not launch an empty collection. |
| Solution | None | Real customer problem, eligibility, applicable product, process, proof project, technical evidence, sales owner | Do not launch an empty solution. |
| Professional resource | Some real guidance, several “available on request” claims | Current PDF/CAD/BIM/drawing/test/installation/care file, version/date/owner | A truthful “request technical support” form is acceptable. A fake catalog/download card is not. |
| Slim-aluminium video | Meeting mentions Chinese characters; source not mapped | Exact licensed/editable master and client-approved export | Do not paint over or recreate frames until the source and operation are verified. |

Every approved asset should have: `asset_code`, source, owner/right, capture date, product/material tag, intended surface, desktop crop, mobile crop, alt text, edit history, AI status, and client approval state.

Minimum visual launch set for the structural repair: one optimized hero reel plus mobile crop/poster; one approved signature image for each visible top-level family/material; one verified cutout and still/operation state for every published product; uPVC/Aluminium/Glass macro imagery; one lifestyle image per priority product; actual finish/glass/hardware samples for configured options; at least six rights-cleared story/project covers; one showroom image; and only real downloadable technical files.

## Copy, adapt, remove, and hold

### Keep

- FourlinQ red/black/white identity, logo, Manrope/Fraunces/Cormorant stack, square editorial controls, and real project voice.
- Approved hero headline.
- Product operation animations that match the actual mechanism.
- Project reels, real project gallery, Help Me Choose, consultation model, showroom path, care content, and direct engineering support.
- Quiet transition grammar and restrained image hover.

### Adapt from Marvin

- Separate By type and By material navigation.
- Product detail questions: operation, use, material/profile, sizing, finish, glass, hardware/options, verified performance, resources, related product, quote.
- Collection comparison requirements—but only as a launch gate, not content to invent.
- Real technical-resource labeling and request paths.
- Gallery metadata and filter logic once enough tagged assets exist.
- Task-supporting sticky media, option previews, and related-product modules.

### Remove or rewrite

- Aluminium as a peer beside Window, Door, and Specialist.
- The 500vh benefit barrier before category discovery.
- “Complete brochure” and download-like language until the artifact exists.
- Universal warranty language where a customer may opt out.
- “Twelve” or “eleven” finish claims until the canonical count is signed off.
- Unsourced numbers and performance language: spans, dB reduction, storm category, UV/color life, energy, certification, and universal compatibility.
- Casement “smooth-rolling” copy and any operation mismatch.
- “Certifications & standards” headings without named evidence.
- An always-visible chat bubble where it covers FAQ topics, product-card corners, configurator choices, or mobile gallery imagery; apply the delayed/scroll reveal already described by the theme contract.
- Homepage Design Tool iframe behavior that creates a second scroll container or clips later steps.
- Wildcard pages that render a recovery view with HTTP 200.
- Docs that still say production is Vercel, old fonts/design, removed routes/files, or the four-card build is blocked.

### Hold

- Collections, until the look/segment axis and photo matrix are approved.
- Solutions, until FourlinQ can prove and service each problem-led offer.
- Full catalog/brochure download.
- Newly mentioned slide-then-open, pocket/sliding-piece, gazebo, and other phonetic product terms until identity and availability are approved.
- LinQ “best product” tuning, AI discovery, upload-a-home visualization, and heavier 3D until product truth is stable.
- Social, YouTube, CRM, fabrication, HR/payroll, training, and life-coaching work as separate scopes.

### Never copy

- Marvin/Pella/Andersen photography, copy, collection names, fonts, icons, yellow accent, exact page artwork, CAD/spec data, or US performance/warranty language.
- Google Earth/Street View screenshots as installation proof without explicit licensing, privacy, location, and project verification.
- Generated lifestyle imagery presented as a completed FourlinQ project.

## Recommended release sequence

1. **Truth gate:** product master, glossary, claim source registry, asset register, and client sign-off.
2. **Structural repair:** By type / By material taxonomy, product gateway immediately after hero, and parity across nav/home/products/footer.
3. **Trust repair:** mobile overflow, consent enforcement, contradictory copy/claims/resources, and documentation sync.
4. **Selection depth:** corrected product details, Aluminium evidence, Glass hub, and compatibility-aware configurator.
5. **Proof depth:** rights-cleared Inspiration tagging, product-linked projects, professional files, and optimized purposeful motion.
6. **Later launch gates:** Collections, Solutions, LinQ buyer tests, and any advanced visualization only after their required evidence exists.

The benchmarked implementation plan is in [ROADMAP.md](./ROADMAP.md) and [the 2026-07-10 benchmark contract](./roadmap-benchmarks/2026-07-10-post-meeting-realignment.md). Rejected and blocked ideas are recorded in [roadmap-rejected.md](./roadmap-rejected.md).
