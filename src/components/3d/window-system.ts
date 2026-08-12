/**
 * System identity for the 3D window viewer, kept separate from Window3D.tsx on
 * purpose.
 *
 * Window3D pulls in three, @react-three/fiber and @react-three/drei — several
 * hundred KB that only matters on the pages that actually render a canvas. Any
 * page that needs to ASK "is there a 3D model for this product type?" imports
 * from here instead, so the question costs nothing and the viewer itself stays
 * behind React.lazy.
 */

/** Every system the licensed GLB can render. */
export type SystemType =
  | "casement"
  | "casement-2lite"
  | "awning"
  | "sliding"
  | "sliding-4panel"
  | "fixed"
  | "slide-and-fold"
  | "louvre"
  | "louvre-wide"
  | "hung"
  | "pivot"
  | "revolving"
  | "fixed-lattice"
  | "sliding-lattice"
  | "hung-lattice"
  | "awning-lattice"
  | "pivot-lattice"
  // Baked from the Claude Design handoff builders — see MODEL_SYSTEM below.
  | "sliding-door"
  | "lift-slide"
  | "multislide"
  | "multislide-6panel"
  | "casement-door"
  | "french-door"
  | "ninety-series"
  | "curtain-wall"
  | "automated-door"
  | "automated-window"
  | "sc-door"
  | "glass-railing"
  | "special-arch"
  | "special-triangle"
  | "combination-bay"
  | "combination-bow"
  | "combination-corner";

/** The licensed makinwhat model: seventeen assemblies in one file. */
export const MODEL_LICENSED = "/models/animated-window-systems.glb";

/**
 * Per-system models baked from `scripts/handoff/model/*.js` by
 * `node scripts/handoff/export-glb.mjs`.
 *
 * Unlike the licensed file these are one system each, so a page downloads only
 * what it shows — 2.7 MB across twelve files, none of it fetched unless that
 * tab is opened. FourlinQ owns this geometry outright: no attribution, no
 * domain restriction, unlike the licensed model.
 */
export const MODEL_SYSTEM = (id: SystemType) => `/models/system/${id}.glb`;

/**
 * Systems offered in the viewer's tab rail, in display order.
 *
 * Still narrower than SystemType, but for a different reason than it used to
 * be. The grille variants are excluded because they are not separate systems —
 * a grille is an option on a sliding window, not a tenth kind of window, so it
 * belongs on the Grille toggle (see GRILLE_VARIANT) rather than beside its own
 * plain twin in the rail.
 *
 * `pivot` and `revolving` are configured and renderable but NOT listed. They
 * exist only in the licensed model, FourlinQ has never confirmed it sells
 * either, and a revolving door is not a uPVC window at all — so they are the
 * cheapest two systems to give up while shrinking what the licence covers.
 * `hung` stays because it answers the Marvin double-hung gap and now comes
 * from geometry we own.
 *
 * Adding a tab is a product claim, not a rendering decision. Promote one only
 * once the client confirms they fabricate it.
 */
export const CATALOGUE_SYSTEM: SystemType[] = [
  "casement",
  "casement-2lite",
  "awning",
  "sliding",
  "sliding-4panel",
  "slide-and-fold",
  "louvre",
  "louvre-wide",
  "hung",
  "fixed",
  "sliding-door",
  "lift-slide",
  "multislide",
  "multislide-6panel",
  "casement-door",
  "french-door",
  "ninety-series",
  "curtain-wall",
  "automated-door",
  "automated-window",
  "sc-door",
  "glass-railing",
  "special-arch",
  "special-triangle",
  "combination-bay",
  "combination-bow",
  "combination-corner",
];

/**
 * Configurator product-type id -> viewer system, for the types where the
 * licensed model genuinely depicts that product.
 *
 * Absent keys have no 3D and keep the SVG preview. Do NOT map a type to an
 * approximate system to fill the gap: `tilt-turn` is not `pivot`, and
 * `sliding-door` is not a scaled-up window sash. A wrong model is a worse
 * answer than a schematic, because it looks authoritative.
 */
export const SYSTEM_FOR_PRODUCT_TYPE: Record<string, SystemType> = {
  casement: "casement",
  awning: "awning",
  sliding: "sliding",
  fixed: "fixed",
  bifold: "slide-and-fold",
  // From the baked handoff models. Each of these types previously fell back to
  // a flat SVG because the licensed model has no door or curtain-wall art.
  "sliding-door": "sliding-door",
  "lift-slide": "lift-slide",
  "large-panel-doors": "multislide",
  "90-series": "ninety-series",
  "curtain-wall": "curtain-wall",
  "arch-shapes": "special-arch",
  // `entrance` is labelled "Casement Door" in the configurator, so it is the
  // hinged casement door, not a separate entry product.
  entrance: "casement-door",

  /* Deliberately unmapped, and each for a reason:
     - `french-door` is "French SLIDING Door" here. The baked `french-door`
       model is a hinged pair from buildSwingDoor — right name, wrong
       mechanism. It stays available in the viewer's rail but must not stand
       in for this product type.
     - `special-shapes` and `custom-shapes` are catch-alls. Any single model
       claims a specific geometry the customer did not choose.
     - `tilt-turn` still has no honest match anywhere. */
};

export interface SystemConfig {
  label: string;
  /**
   * EXACT names of the top-level nodes (children of RootNode) that make up this
   * system. A mesh is visible when any ancestor's name is in this list.
   *
   * Exact, not prefix, because prefixes are unsafe in this model: "fixed" also
   * matches "fixed_lattice", and "Jalousie_narrow_fin1" also matches "fin10".
   */
  visibleRoot: string[];
  /**
   * Which GLB this system lives in. Defaults to the licensed multi-system file.
   *
   * Baked systems each have their own file whose single top-level node is named
   * for the system id, so their `visibleRoot` is just `[id]` — the visibility
   * pass still runs, it simply has nothing to hide.
   */
  model?: string;
  /**
   * Prefix escape hatch, for systems whose parts are one top-level node each
   * (the louvre fins: 18 narrow, 9 wide). ONLY safe when no other top-level
   * node shares the prefix -- true for "Jalousie_narrow_" / "Jalousie_wide_",
   * and asserted by `npm run probe:glb`, which fails on any overlap.
   */
  visibleRootPrefix?: string[];
  /**
   * Union bbox center of the visible subtree, in LOADED-SCENE space -- i.e.
   * after the Sketchfab_model root matrix (scale 0.0035960085) is applied.
   *
   * This is the space `innerRef` operates in. Do not paste the source FBX's
   * centimetre node translations here; that was the original bug (see the
   * header of scripts/probe-window-glb.mjs). Regenerate with:
   *   node scripts/probe-window-glb.mjs
   */
  center: [number, number, number];
  /** Scale that fits the system's larger of width/height to ~80% of frame. */
  scale: number;
  /**
   * Clip time of the fully-open pose, in seconds. NOT uniform across systems:
   * louvre peaks near 1.0s and a revolving door at 4.0s, while sashes peak near
   * 1.9s. Measured as the keyframe furthest from each channel's start value.
   *
   * 0 means the system has no animated channels at all -- fixed glazing. The
   * open/close control is suppressed rather than rendered dead.
   */
  openTime: number;
  /** Action labels; unused when openTime is 0. */
  openLabel: string;
  closeLabel: string;
  /**
   * Shown in place of the open/close control when `openTime` is 0.
   *
   * Not one shared string, because "Fixed — does not open" is a product claim.
   * It is true of direct glazing and of a gable lite; it is false of a bay
   * window, whose flanking casements do open in reality — our model just does
   * not animate them. Saying otherwise over a bay would misdescribe the
   * product to someone about to request a quote for it.
   */
  staticNote?: string;
  /**
   * Set on a grille variant only: the plain system it is a grille version of.
   *
   * The model ships each grille as a COMPLETE alternate assembly parked
   * elsewhere in the scene, not as bars overlaid on the plain one — hence its
   * own center/scale/openTime and its own entry here. The viewer swaps the
   * whole visible set when the Grille toggle flips.
   */
  grilleOf?: SystemType;
}

/**
 * Every system the licensed GLB can render. Values from
 * `node scripts/probe-window-glb.mjs` -- regenerate, never hand-tune.
 */
export const SYSTEMS: Record<SystemType, SystemConfig> = {
  casement: {
    label: "Casement",
    visibleRoot: ["casement"],
    model: MODEL_SYSTEM("casement"),
    center: [0, 0.7122, -0.0145],
    scale: 0.9583,
    openTime: 2,
    openLabel: "Open window",
    closeLabel: "Close window",
  },
  "casement-2lite": {
    label: "Casement · 2-lite",
    visibleRoot: ["casement-2lite"],
    model: MODEL_SYSTEM("casement-2lite"),
    center: [0, 0.7122, -0.0145],
    scale: 0.8344,
    openTime: 2,
    openLabel: "Open window",
    closeLabel: "Close window",
  },
  awning: {
    label: "Awning",
    visibleRoot: ["awning"],
    model: MODEL_SYSTEM("awning"),
    center: [0, 0.3622, -0.008],
    scale: 1.3204,
    openTime: 2,
    openLabel: "Open awning",
    closeLabel: "Close awning",
  },
  sliding: {
    label: "Sliding",
    visibleRoot: ["sliding"],
    model: MODEL_SYSTEM("sliding"),
    center: [0, 0.62, 0.0037],
    scale: 0.9045,
    openTime: 2,
    openLabel: "Slide open",
    closeLabel: "Slide closed",
  },
  "sliding-4panel": {
    label: "Sliding · 4-panel",
    visibleRoot: ["sliding-4panel"],
    model: MODEL_SYSTEM("sliding-4panel"),
    center: [0, 0.62, 0.0037],
    scale: 0.5224,
    openTime: 2,
    openLabel: "Slide open",
    closeLabel: "Slide closed",
  },
  fixed: {
    label: "Fixed",
    visibleRoot: ["fixed"],
    model: MODEL_SYSTEM("fixed"),
    center: [0, 0.9145, -0.0102],
    scale: 0.7485,
    // Fixed glazing does not open. The model has no animated channels here.
    openTime: 0,
    openLabel: "",
    closeLabel: "",
    staticNote: "Fixed — does not open",
  },
  "slide-and-fold": {
    label: "Slide & Fold",
    visibleRoot: ["slide-and-fold"],
    model: MODEL_SYSTEM("slide-and-fold"),
    center: [0, 1.21, 0],
    scale: 0.3759,
    openTime: 2,
    openLabel: "Fold open",
    closeLabel: "Fold closed",
  },
  louvre: {
    label: "Louvre",
    visibleRoot: ["louvre"],
    model: MODEL_SYSTEM("louvre"),
    center: [0, 0.8762, 0.0068],
    scale: 0.7784,
    openTime: 2,
    openLabel: "Open louvres",
    closeLabel: "Close louvres",
  },
  "louvre-wide": {
    label: "Louvre · wide blade",
    visibleRoot: ["louvre-wide"],
    model: MODEL_SYSTEM("louvre-wide"),
    center: [0, 0.8762, 0.0068],
    scale: 0.7784,
    openTime: 2,
    openLabel: "Open louvres",
    closeLabel: "Close louvres",
  },

  hung: {
    label: "Hung",
    visibleRoot: ["hung"],
    model: MODEL_SYSTEM("hung"),
    center: [0, 0.77, 0.0015],
    scale: 0.9045,
    openTime: 2,
    openLabel: "Raise sash",
    closeLabel: "Lower sash",
  },
  pivot: {
    label: "Pivot",
    visibleRoot: ["pivoting_frame", "pivoting_panel", "pivoting_handle"],
    center: [0.2522, 4.0513, -0.0289],
    scale: 1.7292,
    openTime: 1.93,
    openLabel: "Pivot open",
    closeLabel: "Pivot closed",
  },
  revolving: {
    label: "Revolving",
    visibleRoot: ["revolving_frame", "revolving_door"],
    center: [1.7926, 0.9371, -0.0138],
    scale: 1.1312,
    openTime: 4,
    openLabel: "Rotate",
    closeLabel: "Stop",
  },

  /* ── Grille variants ──
     Reached through the Grille toggle, never through the tab rail. Labels are
     never shown as tabs, but they are what the viewer badge reads, so they
     name the base system plus the option. */
  "fixed-lattice": {
    label: "Fixed · grille",
    visibleRoot: ["fixed-lattice"],
    model: MODEL_SYSTEM("fixed-lattice"),
    center: [0, 0.9145, -0.0102],
    scale: 0.7485,
    openTime: 0,
    openLabel: "",
    closeLabel: "",
    staticNote: "Fixed — does not open",
    grilleOf: "fixed",
  },
  "sliding-lattice": {
    label: "Sliding · grille",
    visibleRoot: ["sliding-lattice"],
    model: MODEL_SYSTEM("sliding-lattice"),
    center: [0, 0.62, 0.0037],
    scale: 0.9045,
    openTime: 2,
    openLabel: "Slide open",
    closeLabel: "Slide closed",
    grilleOf: "sliding",
  },
  "hung-lattice": {
    label: "Hung · grille",
    visibleRoot: ["hung-lattice"],
    model: MODEL_SYSTEM("hung-lattice"),
    center: [0, 0.77, 0.0015],
    scale: 0.9045,
    openTime: 2,
    openLabel: "Raise sash",
    closeLabel: "Lower sash",
    grilleOf: "hung",
  },
  "awning-lattice": {
    label: "Awning · grille",
    visibleRoot: ["awning-lattice"],
    model: MODEL_SYSTEM("awning-lattice"),
    center: [0, 0.3622, -0.008],
    scale: 1.3204,
    openTime: 2,
    openLabel: "Open awning",
    closeLabel: "Close awning",
    grilleOf: "awning",
  },
  "pivot-lattice": {
    label: "Pivot · grille",
    visibleRoot: [
      "pivoting_lattice_frame",
      "pivoting_lattice_panel",
      "pivoting_lattice_window",
    ],
    center: [1.1249, 4.0513, -0.0289],
    scale: 1.7292,
    openTime: 1.97,
    openLabel: "Pivot open",
    closeLabel: "Pivot closed",
    grilleOf: "pivot",
  },

  /* ── Baked from the handoff builders ──
     One file each, top-level node named for the system id. Every openTime is
     2 s because the bake authors the clip: 0 → open at 2 s → closed at 4 s.
     Numbers from `npm run probe:glb`, same as everything above. */
  "sliding-door": {
    label: "Sliding Door",
    visibleRoot: ["sliding-door"],
    model: MODEL_SYSTEM("sliding-door"),
    center: [0, 1.212, 0.028],
    scale: 0.5179,
    openTime: 2,
    openLabel: "Slide open",
    closeLabel: "Slide closed",
  },
  "lift-slide": {
    label: "Lift & Slide",
    visibleRoot: ["lift-slide"],
    model: MODEL_SYSTEM("lift-slide"),
    center: [0, 1.3759, 0],
    scale: 0.4172,
    openTime: 2,
    openLabel: "Lift & slide open",
    closeLabel: "Lower & close",
  },
  multislide: {
    label: "Large Panel · multislide",
    visibleRoot: ["multislide"],
    model: MODEL_SYSTEM("multislide"),
    center: [0, 1.314, 0],
    scale: 0.2255,
    openTime: 2,
    openLabel: "Stack open",
    closeLabel: "Close panels",
  },
  "multislide-6panel": {
    label: "Large Panel · 6-panel",
    visibleRoot: ["multislide-6panel"],
    model: MODEL_SYSTEM("multislide-6panel"),
    center: [0, 1.314, 0],
    scale: 0.1506,
    openTime: 2,
    openLabel: "Stack open",
    closeLabel: "Close panels",
  },
  "casement-door": {
    label: "Casement Door",
    visibleRoot: ["casement-door"],
    model: MODEL_SYSTEM("casement-door"),
    center: [0, 1.168, 0],
    scale: 0.5904,
    openTime: 2,
    openLabel: "Open door",
    closeLabel: "Close door",
  },
  "french-door": {
    label: "French Door",
    visibleRoot: ["french-door"],
    model: MODEL_SYSTEM("french-door"),
    center: [0, 1.068, 0],
    scale: 0.6465,
    openTime: 2,
    openLabel: "Open doors",
    closeLabel: "Close doors",
  },
  "ninety-series": {
    label: "90 Series",
    visibleRoot: ["ninety-series"],
    model: MODEL_SYSTEM("ninety-series"),
    center: [0, 1.093, 0],
    scale: 0.6315,
    openTime: 2,
    openLabel: "Open door",
    closeLabel: "Close door",
  },
  "curtain-wall": {
    label: "Curtain Wall",
    visibleRoot: ["curtain-wall"],
    model: MODEL_SYSTEM("curtain-wall"),
    center: [0, 4.8037, 0.079],
    scale: 0.1402,
    openTime: 2,
    openLabel: "Open vent",
    closeLabel: "Close vent",
  },
  /* Second Claude Design handoff, 2026-08-11. Four products the client named on
     2026-08-07 that previously had no 3D at all and shipped as line drawings.
     Numbers from `npm run probe:glb`, never hand-typed. */
  "automated-door": {
    label: "Automated Door Access",
    visibleRoot: ["automated-door"],
    model: MODEL_SYSTEM("automated-door"),
    center: [0, 0.0865, -0.001],
    scale: 0.5201,
    openTime: 2,
    openLabel: "Open door",
    closeLabel: "Close door",
  },
  "automated-window": {
    label: "Automated Window",
    visibleRoot: ["automated-window"],
    model: MODEL_SYSTEM("automated-window"),
    center: [0, 0, 0.016],
    scale: 1.1333,
    openTime: 2,
    openLabel: "Open window",
    closeLabel: "Close window",
  },
  "sc-door": {
    label: "Soft Closing Sliding Door",
    visibleRoot: ["sc-door"],
    model: MODEL_SYSTEM("sc-door"),
    center: [0, 0, 0.024],
    scale: 0.5388,
    openTime: 2,
    openLabel: "Slide open",
    closeLabel: "Slide closed",
  },
  "glass-railing": {
    label: "Glass Railing",
    visibleRoot: ["glass-railing"],
    model: MODEL_SYSTEM("glass-railing"),
    // -0 on Y is not a typo: probe:glb measures the balustrade as symmetric about
    // the origin and reports negative zero, and the parity test compares with
    // Object.is, which distinguishes it from +0. Paste what the prober prints.
    center: [0, -0, 0.003],
    scale: 0.4533,
    openTime: 0,
    openLabel: "",
    closeLabel: "",
    // The builder can swing a gate leaf 90 degrees, but the product sold is a
    // balustrade run and the page says nothing about a gate. A fixed run is the
    // truth about this product, so it says that rather than claiming it opens.
    staticNote: "Balustrade — fixed run",
  },
  "special-arch": {
    label: "Arch / Round-top",
    visibleRoot: ["special-arch"],
    model: MODEL_SYSTEM("special-arch"),
    center: [0, 0.942, -0.008],
    scale: 0.7087,
    openTime: 0,
    openLabel: "",
    closeLabel: "",
    staticNote: "Fixed — does not open",
  },
  "special-triangle": {
    label: "Triangle Gable",
    visibleRoot: ["special-triangle"],
    model: MODEL_SYSTEM("special-triangle"),
    center: [0, 0.2723, -0.008],
    scale: 0.8344,
    openTime: 0,
    openLabel: "",
    closeLabel: "",
    staticNote: "Fixed — does not open",
  },
  "combination-bay": {
    label: "Bay — 3 panel",
    visibleRoot: ["combination-bay"],
    model: MODEL_SYSTEM("combination-bay"),
    center: [0, 0.694, -0.1587],
    scale: 0.5446,
    openTime: 2,
    // The flanking lites are casements and they now swing, so the note that said
    // this was an assembly view had to go with them: it would be understating the
    // product rather than overstating it, but it would still be wrong.
    openLabel: "Open window",
    closeLabel: "Close window",
  },
  "combination-bow": {
    label: "Bow — arc",
    visibleRoot: ["combination-bow"],
    model: MODEL_SYSTEM("combination-bow"),
    center: [0, 0.694, -0.2191],
    scale: 0.4569,
    openTime: 2,
    openLabel: "Open window",
    closeLabel: "Close window",
  },
  "combination-corner": {
    label: "Corner — 90°",
    visibleRoot: ["combination-corner"],
    model: MODEL_SYSTEM("combination-corner"),
    center: [-0.5278, 0.694, 0.5278],
    scale: 0.959,
    openTime: 0,
    openLabel: "",
    closeLabel: "",
    staticNote: "Assembly view — casements not animated",
  },
};

/**
 * Plain system -> its grille variant, derived from `grilleOf` so there is one
 * source of truth. A system absent here has no grille art and the viewer hides
 * the toggle rather than offering a control that does nothing.
 */
export const GRILLE_VARIANT: Partial<Record<SystemType, SystemType>> =
  Object.fromEntries(
    (Object.entries(SYSTEMS) as [SystemType, SystemConfig][])
      .filter(([, cfg]) => cfg.grilleOf)
      .map(([id, cfg]) => [cfg.grilleOf as SystemType, id]),
  );
