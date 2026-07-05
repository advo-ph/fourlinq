# Roadmap rejected and triage log

Last updated: 2026-06-16.

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
| 22-year/founding-year claim | Prior docs mention it but exact year is unverified. | Client confirms founding year and allowed wording. |
| **`/products` material data model** (Aluminium = per-product material option **vs** separate 4th catalog) | Her Jul 2 diagram shows "Aluminium Line" as a peer category; her words say "both are profile materials." This decides the entire Phase 8 rebuild (B18). | Imie confirms at the meeting she requested 2026-07-05. |
