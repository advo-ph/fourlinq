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
  | "pivot-lattice";

/**
 * Systems offered in the viewer's tab rail, in display order.
 *
 * Still narrower than SystemType, but for a different reason than it used to
 * be. The grille variants are excluded because they are not separate systems —
 * a grille is an option on a sliding window, not a tenth kind of window, so it
 * belongs on the Grille toggle (see GRILLE_VARIANT) rather than beside its own
 * plain twin in the rail.
 *
 * `hung`, `pivot` and `revolving` WERE withheld pending client confirmation
 * that FourlinQ sells them; they are exposed now on explicit instruction. That
 * is a product claim, not a rendering decision: a tab is a shop window. If the
 * client says they do not fabricate one, delete its line here — nothing else
 * needs to change, and the system stays measured and renderable.
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
  "pivot",
  "fixed",
  "revolving",
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
    visibleRoot: ["casement_frame", "casement_panelL", "casement_panelR"],
    center: [-0.8085, 1.9846, -0.0186],
    scale: 1.4428,
    openTime: 1.93,
    openLabel: "Open window",
    closeLabel: "Close window",
  },
  "casement-2lite": {
    label: "Casement · 2-lite",
    visibleRoot: [
      "casement_bridged_frame",
      "casement_bridged_panelL",
      "casement_bridged_panelR",
    ],
    center: [-1.6964, 1.9846, -0.0186],
    scale: 1.4428,
    openTime: 1.97,
    openLabel: "Open window",
    closeLabel: "Close window",
  },
  awning: {
    label: "Awning",
    visibleRoot: ["awning_frame", "awning_armature"],
    center: [0.2185, 1.7424, -0.0111],
    scale: 1.4428,
    openTime: 2,
    openLabel: "Open awning",
    closeLabel: "Close awning",
  },
  sliding: {
    label: "Sliding",
    visibleRoot: [
      "sliding_horizontal_frame",
      "sliding_horizontal_windowL",
      "sliding_horizontal_windowR",
    ],
    center: [-1.42, 3.0908, -0.037],
    scale: 1.4754,
    openTime: 1.87,
    openLabel: "Slide open",
    closeLabel: "Slide closed",
  },
  "sliding-4panel": {
    label: "Sliding · 4-panel",
    visibleRoot: [
      "sliding_horizontal_4panels_frame",
      "sliding_horizontal_4panels_windowL2",
      "sliding_horizontal_4panels_windowL1",
      "sliding_horizontal_4panels_windowR1",
      "sliding_horizontal_4panels_windowR2",
    ],
    center: [0.5052, 3.0953, -0.0369],
    scale: 1.1002,
    openTime: 1.97,
    openLabel: "Slide open",
    closeLabel: "Slide closed",
  },
  fixed: {
    label: "Fixed",
    visibleRoot: ["fixed"],
    center: [-1.7443, 0.7829, -0.0289],
    scale: 1.4754,
    // Fixed glazing does not open. The model has no animated channels here.
    openTime: 0,
    openLabel: "",
    closeLabel: "",
  },
  "slide-and-fold": {
    label: "Slide & Fold",
    visibleRoot: ["holding_frame", "holding_panels"],
    center: [1.3259, 2.0633, -0.0656],
    scale: 1.278,
    openTime: 1.97,
    openLabel: "Fold open",
    closeLabel: "Fold closed",
  },
  louvre: {
    label: "Louvre",
    visibleRoot: [],
    visibleRootPrefix: ["Jalousie_narrow_"],
    center: [0.8122, 0.791, 0.0111],
    scale: 1.4232,
    openTime: 0.93,
    openLabel: "Open louvres",
    closeLabel: "Close louvres",
  },
  "louvre-wide": {
    label: "Louvre · wide blade",
    visibleRoot: [],
    visibleRootPrefix: ["Jalousie_wide_"],
    center: [-0.0727, 0.8056, 0.0111],
    scale: 1.381,
    openTime: 1,
    openLabel: "Open louvres",
    closeLabel: "Close louvres",
  },

  hung: {
    label: "Hung",
    visibleRoot: [
      "sliding_vertical_frame",
      "sliding_vertical_windowT",
      "sliding_vertical_windowB",
    ],
    center: [-1.4099, 4.2054, -0.0452],
    scale: 1.4754,
    openTime: 1.83,
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
    visibleRoot: ["fixed_lattice"],
    center: [-0.9737, 0.787, -0.0289],
    scale: 1.4754,
    openTime: 0,
    openLabel: "",
    closeLabel: "",
    grilleOf: "fixed",
  },
  "sliding-lattice": {
    label: "Sliding · grille",
    visibleRoot: [
      "sliding_horizontal_lattice_frame",
      "sliding_horizontal_lattice_windowL",
      "sliding_horizontal_lattice_windowR",
    ],
    center: [-0.6041, 3.0908, -0.037],
    scale: 1.4754,
    openTime: 1.93,
    openLabel: "Slide open",
    closeLabel: "Slide closed",
    grilleOf: "sliding",
  },
  "hung-lattice": {
    label: "Hung · grille",
    visibleRoot: [
      "sliding_vertical_lattice_frame",
      "sliding_vertical_lattice_windowT",
      "sliding_vertical_lattice_windowB",
    ],
    center: [-0.6037, 4.2017, -0.0452],
    scale: 1.4754,
    openTime: 1.83,
    openLabel: "Raise sash",
    closeLabel: "Lower sash",
    grilleOf: "hung",
  },
  "awning-lattice": {
    label: "Awning · grille",
    visibleRoot: ["awning_lattice_frame", "awning_lattice_armature"],
    center: [0.2185, 2.2352, -0.0111],
    scale: 1.4428,
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
