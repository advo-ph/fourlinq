/**
 * Windows-and-doors glossary — the terminology reference.
 *
 * Imie's most-repeated instruction across the whole thread is that terminology
 * must be right: "operation and terminology must be correct" (meeting 00:04:40),
 * "check internet for the meaning of each design" (2026-05-28). This is the
 * public, plain-English half of roadmap item RM1 (the signed glossary).
 *
 * Editorial discipline, because Imie reads closely and RM1 is Tier 3
 * (client-approved):
 *   - Every definition is a general, verifiable fenestration fact or a term
 *     FourlinQ already publishes (operations, materials, glass in the repo).
 *   - Industry synonyms are named under `also_called` — e.g. a muntin is a
 *     "divided lite", the term Marvin uses — so a client reading either word
 *     lands in the same place.
 *   - DELIBERATELY EXCLUDED, because FourlinQ has not confirmed it offers them:
 *     automation / smart sensors, window-opening control devices, insect
 *     screens, and casings. Also excluded: the contested product-line names
 *     "90 Series" and "Large Panel", which the audit flagged as unresolved.
 *     Nothing here asserts a FourlinQ capability that is not already in the
 *     codebase.
 */

export type GlossaryCategory = "operation" | "anatomy" | "material" | "glass";

export interface GlossaryTerm {
  term: string;
  category: GlossaryCategory;
  definition: string;
  /** Industry synonym a reader might search instead. */
  also_called?: string;
  /** True when FourlinQ already offers this (confirmed in the catalog/data). */
  is_fourlinq_offering?: boolean;
}

export const GLOSSARY_GROUP: { category: GlossaryCategory; label: string; blurb: string }[] = [
  { category: "operation", label: "How it opens", blurb: "The operation is how a window or door moves. Getting this word right matters most — it decides the hardware, the swing space, and how you live with it." },
  { category: "anatomy", label: "Parts of a window", blurb: "The pieces every window and door is built from. Useful when you are reading a quote or pointing at a drawing." },
  { category: "material", label: "Material and profile", blurb: "What the frame is made from. FourlinQ builds in two profile systems — uPVC and aluminium." },
  { category: "glass", label: "Glass and glazing", blurb: "The glass options and what they do. Glazing is chosen for heat, noise, privacy, and safety." },
];

export const GLOSSARY_TERM: GlossaryTerm[] = [
  // ── Operation ──
  { term: "Casement", category: "operation", is_fourlinq_offering: true,
    definition: "Hinged at the side and swung outward with a handle or crank, like a small door. Opens fully for airflow and seals tight against its frame when shut." },
  { term: "Awning", category: "operation", is_fourlinq_offering: true,
    definition: "Hinged at the top and pushed open from the bottom. It sheds rain as it opens, so it can stay open in a light shower." },
  { term: "Sliding", category: "operation", is_fourlinq_offering: true,
    definition: "One or more panels glide horizontally on a track. Nothing swings into the room, so it suits tight spaces and walkways." },
  { term: "Tilt & Turn", category: "operation", is_fourlinq_offering: true,
    definition: "A dual-action window. Turn the handle one way and it tilts inward from the top for secure ventilation; turn it the other and the whole sash swings inward like a door for full opening and easy cleaning." },
  { term: "Fixed", category: "operation", is_fourlinq_offering: true,
    definition: "Does not open. A sealed pane for view and daylight, often paired beside an opening unit. Also called a picture window.",
    also_called: "Picture window" },
  { term: "Slide & Fold", category: "operation", is_fourlinq_offering: true,
    definition: "Panels hinged to each other fold back concertina-style and stack to one side, opening a whole wall between inside and out. Common on lanais and garden walls.",
    also_called: "Bi-fold" },
  { term: "Lift & Slide", category: "operation", is_fourlinq_offering: true,
    definition: "A large sliding panel. Turning the handle lifts the panel slightly off its seals so a heavy leaf glides with one finger, then drops it back down to seal tight when closed." },
  { term: "Casement Door", category: "operation", is_fourlinq_offering: true,
    definition: "A door that swings on side hinges like a scaled-up casement window, as a single or double leaf." },

  // ── Anatomy ──
  { term: "Frame", category: "anatomy",
    definition: "The fixed outer structure anchored to the wall opening. It holds the sash and glass and carries them into the building." },
  { term: "Sash", category: "anatomy",
    definition: "The part that holds a pane of glass and moves within the frame. On a fixed unit the sash does not move; on an opening unit it is what you push, slide, or swing." },
  { term: "Mullion", category: "anatomy",
    definition: "A structural bar, usually vertical, joining two window or door units side by side and dividing the opening into sections. It carries load between the units." },
  { term: "Transom", category: "anatomy",
    definition: "A horizontal bar across an opening, or the smaller window set above a door or another window." },
  { term: "Muntin", category: "anatomy",
    definition: "The slim bars that divide a single pane into a grid of smaller panes, or 'lites'. Today usually a design choice rather than structural. Often called divided lites or grilles.",
    also_called: "Divided lite / Grille" },
  { term: "Sightline", category: "anatomy",
    definition: "The visible width of frame and sash around the glass. A 'slim sightline' means more glass and less frame — the reason aluminium is chosen for big, minimal openings." },
  { term: "Weatherseal", category: "anatomy", is_fourlinq_offering: true,
    definition: "The rubber gasket seated inside the frame that presses against the sash to keep out air, water, and dust. FourlinQ uses EPDM gaskets.",
    also_called: "Gasket" },
  { term: "Track", category: "anatomy",
    definition: "The bottom channel a sliding or folding panel rolls along, carrying the rollers that let a heavy panel move smoothly." },

  // ── Material ──
  { term: "uPVC", category: "material", is_fourlinq_offering: true,
    definition: "Unplasticised PVC — a rigid, weatherproof polymer. FourlinQ's uPVC frames are multi-chamber and steel-reinforced. They never rust, need no repainting, and hold up in tropical heat and salt air.",
    also_called: "PVC-U" },
  { term: "Aluminium", category: "material", is_fourlinq_offering: true,
    definition: "A metal profile that is stronger than uPVC for large spans and gives slimmer sightlines. FourlinQ reaches for it when an opening is too big for uPVC or the design calls for minimal frame." },
  { term: "Thermal Break", category: "material", is_fourlinq_offering: true,
    definition: "A non-conductive strip set between the inner and outer halves of an aluminium profile. It slows heat passing through the metal, which matters for air-conditioned rooms and west-facing walls." },
  { term: "Profile System", category: "material", is_fourlinq_offering: true,
    definition: "The extruded shape — in uPVC or aluminium — that forms the frame and sash. It is the starting choice: windows and doors of the same type can be built in either system." },

  // ── Glass ──
  { term: "Glazing", category: "glass",
    definition: "The glass itself and the act of fitting it. 'Double glazing' means two panes with a sealed gap between them, which cuts heat and noise better than a single pane." },
  { term: "Low-E", category: "glass", is_fourlinq_offering: true,
    definition: "A microscopically thin coating that reflects heat while letting light through, lowering the solar heat that comes in the window without darkening the room.",
    also_called: "Low-emissivity" },
  { term: "Laminated Safety Glass", category: "glass", is_fourlinq_offering: true,
    definition: "Two glass layers bonded to a clear plastic interlayer. If it breaks, the pieces hold to the interlayer instead of falling, and it also dampens noise." },
  { term: "Tinted Glass", category: "glass", is_fourlinq_offering: true,
    definition: "Glass coloured through its body — bronze or grey — to cut glare and solar heat while keeping the view." },
  { term: "Frosted Glass", category: "glass", is_fourlinq_offering: true,
    definition: "Translucent glass that passes daylight but blocks the view, for bathrooms and any room that wants privacy.",
    also_called: "Obscure glass" },
];

/** Terms in a category, in listed order. */
export function termByCategory(category: GlossaryCategory): GlossaryTerm[] {
  return GLOSSARY_TERM.filter((t) => t.category === category);
}
