# Roadmap rejected and triage log

Last updated: 2026-07-18.

This file keeps rejected, stale, or blocked ideas from re-entering the roadmap as vague "maybe we should" work. Reopen an item only if the trigger changes.

## Rejected for now

| Item | Why it is not on the active roadmap | Reopen trigger |
|---|---|---|
| Strict Tesla clone | The latest user feedback says the site lost FourlinQ's black/red identity and logo feel. Tesla-ish restraint is useful; a Tesla clone is wrong for this brand. | Client explicitly asks to abandon the FourlinQ identity. |
| Full component/design-system rewrite | The site has working flows, CMS, products, and brand assets. The validated problem is drift/proof debt, not a need to replace every primitive. | A future audit shows current primitives block multiple planned items. |
| Online checkout/payments | FourlinQ quotes custom projects; checkout would misrepresent the sales model. | Client introduces standardized priced SKUs. |
| Inventory tracking | Products are made-to-order, not stock retail. | Client starts selling stocked accessories or standard kits. |
| i18n/multilingual rebuild | No current market/client request justifies the complexity. | Client requests a specific language launch with translated copy. |
| Newsletter popup/capture | Competitor research and FourlinQ's consultation flow both point away from marketing popups. | Client provides an actual newsletter/content program. |
| Deploying directly from the Codex branch | Deploy guard intentionally restricts production branches. Codex branch should become production through merge/review, not bypass. | Emergency hotfix with `FORCE_DEPLOY=1` and explicit owner approval. |
| Generic GitHub product-configurator import | Public examples are not specific enough to FourlinQ geometry/assets and would risk generic UI. | A specific library/repo proves it can model the selected FourlinQ system accurately. |
| Telegram MCP as a repo feature | No Telegram connector/tool is available in this Codex environment, and the repo should not grow a Telegram integration just to read comments. | A real Telegram connector becomes available and the user asks to connect it. |
| Clone Marvin's visual skin (amber `#ffc600`, Nationale type) | Imie references Marvin for *layout/quality*, not identity — and this log already rejects losing FourlinQ's black/red. The 2026-07-05 purplegradient scrape is a source for Marvin's card *structure + grammar only*; the skin stays FourlinQ (red `#C8102E`, Manrope/Fraunces). | Client explicitly asks to adopt Marvin's exact palette/type. |

### Revalidated or added after the 2026-07-10 meeting

| Item | Why it is not on the active roadmap | Reopen trigger |
|---|---|---|
| Exact Marvin/Pella/Andersen clone, including assets, copy, collection names, fonts, icons, or artwork | Tita asked for organized, applicable reference patterns and allowed a different/better layout. Copying protected brand expression would erase FourlinQ identity and create legal/credibility risk. | Never for third-party protected assets; a licensed specific asset must still be independently approved. |
| Google Earth/Street View as FourlinQ project proof | A streetscape capture does not prove FourlinQ supplied the installation and has licensing, privacy, attribution, and location risks. | Written license/permission plus verified project identity and disclosure plan. |
| AI-generated lifestyle architecture as a completed FourlinQ project | It would create false portfolio evidence. Generated concept imagery may explain a product only when clearly labeled. | Never as project proof; concept use reopens after product truth, client approval, and visible disclosure. |
| Imported US product types, codes, ratings, warranty language, dealer/pricing model, or ecommerce flow | Marvin/Pella/Andersen serve different products, standards, geography, and sales models. FourlinQ is custom-quoted and consultation-led. | A FourlinQ source and Philippine applicability are verified for the specific item. |
| Upload-a-home visualization, enterprise planner, or heavier 3D program now | These depend on accurate geometry, compatibility, assets, and mature product data that FourlinQ does not yet have. | RM1, RM2, RM7, RM12, and RM13 pass; a buyer need and asset budget are approved. |
| Empty Collections, Solutions, downloads, or content volume created only to match Marvin | Navigation labels without real differentiated content make the site less trustworthy, not more premium. | The corresponding hold entry's evidence gate passes. |
| Merge CRM, fabrication tracking, attendance, payroll, Moodle, social, YouTube, or life-coaching work into website remediation | These were exploratory or separate-proposal discussions and have different owners, privacy/security needs, budgets, and acceptance criteria. | A separate written scope, owner, budget, and discovery/acceptance plan is approved. |

## Triage or blocked

These are real signals but not ready for implementation without data or a decision.

| Item | Current blocker | Required decision/data |
|---|---|---|
| French Sliding Door category | Client did not clarify whether this is a new product, a rename, or a combined operating style. | Imie/Tita confirms product meaning and supplies visual/spec. |
| Sliding door photo replacement | Existing photos do not clearly show sliding behavior. | Correct photo/render with track or offset cue. |
| "Special designs" correction | Comment did not specify what is wrong with the visual. | Marked-up screenshot or replacement asset. |
| AI photo cleanup | Needs specific photo/object pairs. | Client sends exact photos and objects to remove. |
| Design-name correction | Comment says names are wrong but does not enumerate which. | List of names to change and source of correct meanings. |
| SEC registration/head-office footer line | Requires legal/business details. | Tita supplies exact SEC line and address. |
| Aluminium system spec sheets/photos | Page exists but lacks verified per-system details. | Brochure specs, max spans, finish/glass limits, photos, PDFs. |
| Architect resource downloads | Would be valuable, but fake CAD/BIM/spec cards would harm credibility. | Real technical files or a deliberate request-form-only strategy. |
| SMTP auto-email go-live | Code is scaffolded but no credentials are present. | Production SMTP/Gmail/Resend credentials. |
| 22-year/founding-year claim | Prior docs mention it but exact year is unverified. Meeting `00:30:20` is the first support: *"20 years na kami."* Still needs an exact year. | Client confirms founding year and allowed wording. |
| 🚩 **Client assets already sent, sitting unused in the Telegram export** | **Corrected 2026-07-17 — an earlier entry here claimed a "catalog" was missing in an unread GC. That was wrong.** There is no catalog: *"**Wala kami catalog. I only have a line of flyers.** Pero **sinend ko na sa'yo**, diba? Sinend ko na rin."* (`00:39:04`), and a dev confirms at the end of the transcript: *"**Wala nga silang catalog.** … **Yung catalog yung pinapagawa niya.** … Wala sila eh, video po lang."* The catalog is a **deliverable she wants built**, not an artefact to find. What *does* exist is the **flyers and real project photos she already sent** — and they are **already in `polkadoc/Telegram/FourlinQ Web Updates/attachments` (44 images)**, e.g. `photo_2026-05-28_05-30-01 (1).jpg` is a finished FourlinQ flyer (branding, taglines, hotline) and `(2).jpg` is a real install with French/Georgian muntin bars + arched transom — the exact product she described at `00:20:09`. **Zero of these 44 are referenced anywhere in `src/`.** That is what *"hindi kayo nagbabasa, eh"* (`00:58:06`) means. | Inventory all 44 attachments; register each usable asset (subject, date, product shown, rights) into the RM1/RM7 source registry and copy the usable ones into `public/images/`. This unblocks RM11/RM14 imagery and D1 **without** any new client input. |
| Excalibur Builders — project photo lead | Meeting `00:31:39`: *"type mo **Excalibur sa Instagram**… Builders. **Lahat yan, project ko.**"* A named client whose projects are reportedly all FourlinQ — a concrete lead for the rights-cleared imagery that blocks Collections (hold) and RM14. Unverified; no rights position established. | Confirm the relationship, which installs are FourlinQ, and written permission before any image is published. |

### Hold after the 2026-07-10 meeting

| Item | Current blocker | Required decision/data |
|---|---|---|
| Collections | Tita wants a way to categorize “the look” but says FourlinQ lacks enough photos. A material is not automatically a collection. | Approved collection axis, meaningful comparison matrix, distinct product/customer value, and enough rights-cleared images. |
| Solutions | Tita explicitly said FourlinQ is not ready. | Each solution needs a real problem, eligibility, applicable products, process, proof project, technical evidence, and sales owner. |
| Full catalog/brochure download | Tita said FourlinQ has flyers, not a full catalog; production currently implies a complete brochure is available. | Approved current document, owner, version/date, download/request policy, and source-backed content. |
| Newly mentioned products | Slide-then-open, “sliding piece”/pocket, gazebo, and other transcript terms are not reliably identified or mapped to real offerings. | Client-approved name, industry synonym, operation, material/profile, availability, assets, options, and specifications in RM1. |
| Chinese-text removal from slim-aluminium video | The exact licensed/editable source is not mapped in the repository. | Source master, right to edit, verified product operation, and client-approved export. |
| Social-content retainer and personal/corporate YouTube | Requested as a proposal, but cadence, channel, approval flow, deliverable count, usage rights, fee, and owner are undefined. | Separate written content scope and commercial approval; never bundled into RM1–RM18. |

## Resolved triage

| Item | Resolution | Active follow-through |
|---|---|---|
| `/products` material data model | The meeting clarified that durable browsing needs separate **By type** and **By material** paths; Aluminium should not remain the lone material beside type/family cards. Glass placement still requires client approval. | RM1–RM4 in `ROADMAP.md`. |
| San Lorenzo project slug spelling | Resolved locally on 2026-07-18 by canonicalizing `aluminum` to the published `aluminium` route and preserving fallback project data during CMS merges. No migration or invented content was required. | Keep the alias and merge regression tests green; production proof follows deployment. |
| Brand “certifications” framing | Resolved locally on 2026-07-18 by labeling the list as brochure-stated limited-warranty scope and explicitly stating that it is not third-party certification. | Publish named certifications only after the exact certificate and scope are verified. |
| Design Tool offline false success | Resolved locally on 2026-07-18 by accepting only a server-confirmed success/reference. Failure remains unsent and visible; no browser-generated lead reference is created. | Keep failure-path regression tests green and prove the live endpoint after deployment. |
| Unsupported legacy product/knowledge claim matrix | Resolved locally on 2026-07-18 by keeping unverified product arrays empty, making the API respect intentional empties, deactivating stale generated passages, and authoring a source-bounded reseed. | Review and apply migration 013, then run the bounded seeder and prove the live API/assistant. No production action occurred in this session. |
| Project archive categories and unverified metadata | Category filtering/labels and unsupported location/performance claims were removed locally; the archive remains browsable without inventing a taxonomy. | Complete RM13 provenance registration and RM14 rights-cleared information modeling before restoring structured categories or client attribution. |
| Browser-QA false passes on unreachable or blank pages | Resolved locally on 2026-07-18 by sharing one route/app-shell contract across viewport, a11y, visual, and parity scans. App findings exit 1; infra/incomplete evidence exits 2; browser cleanup runs in `finally`. | Keep the 20-state, three-alias, seven-width, interaction-state, and exact 33-row gates green; repeat against the served production bundle after deployment. |
