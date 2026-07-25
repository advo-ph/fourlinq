// Frame sequence + content config for the ScrollWindow benefit sequence.
//
// Model (2026-07-21 redesign): scroll decides which PART's side-text is
// highlighted; the highlighted text drives a segmented, auto-playing frame
// animation that rests on a high-res "stop" still. Frames are NOT scrubbed by
// scroll. Frame numbers here are 1-indexed and match the webp file names
// (frame_0001.webp … frame_0186.webp).

export const TOTAL_FRAMES = 186;
export const FRAME_PATH_TEMPLATE = "/images/scroll-window-webp/frame_{index}.webp";
export const FRAME_PAD_LENGTH = 4;

// ── Playback tuning ────────────────────────────────────────
/** Source video is 30fps; playback runs above native for a faster read.
 *  This is real wall-clock fps — identical on every display refresh rate. */
export const PLAYBACK_FPS = 36;
/** Part 2 → Part 1 (backward) reverses to this frame, then jumps to frame 1. */
export const REVERSE_PIVOT_FRAME = 83;

// ── Side-text parts ────────────────────────────────────────
export interface PartText {
  eyebrow: string;
  headline: string;
  lede?: string;
  bullets?: string[];
}

export interface WindowPart {
  id: string;
  /** 1-indexed inclusive frame range played when this part is highlighted. */
  startFrame: number;
  stopFrame: number;
  text: PartText;
  /** Part 2 renders the material callouts instead of bullets. */
  usesMaterials?: boolean;
}

export const THERMAL_PART_ID = "thermal";

// ── Section title (top of the section, above Part 0) ───────
export const SECTION_EYEBROW = "Engineered";
export const SECTION_TITLE = "Systems that Last Forever.";

// ── Part 0 — run-in intro (shown before the first benefit) ──
// Frame rests on 1 (the closed window). Overviews what FourlinQ builds + the
// four material systems, before the weather/thermal/sound sequence begins.
// (No headline — the section title above serves as the heading.)
export const PART_ZERO = {
  body:
    "FourlinQ makes windows and doors to your specifications, in uPVC and aluminium. Every system is custom-built for your space and made to last.",
  materials: [
    { label: "uPVC", desc: "sealed multi-chamber frames" },
    { label: "Aluminium Thermal Break", desc: "polyamide-isolated, for cooled rooms" },
    { label: "Aluminium Non-Thermal Break", desc: "slim, economical profiles" },
    { label: "Aluminium Slim", desc: "minimal sightlines, maximum glass" },
  ],
};

export const WINDOW_PARTS: WindowPart[] = [
  {
    id: "weather",
    startFrame: 1,
    stopFrame: 58,
    text: {
      eyebrow: "Weather Resistance",
      headline: "Zero leaks through the frame.",
      lede: "Every joint is sealed and drained, so tropical rain and wind stay outside.",
      bullets: [
        "EPDM gaskets seal every joint against air and water",
        "Drainage channels route water out before it reaches the interior",
        "Galvanized steel reinforcement holds firm under heavy wind loads",
        "Tested against Signal No. 3 storm conditions",
      ],
    },
  },
  {
    id: THERMAL_PART_ID,
    startFrame: 59,
    stopFrame: 116,
    usesMaterials: true,
    text: {
      eyebrow: "Inside the Frame",
      headline: "Where the performance lives.",
    },
  },
  {
    id: "sound",
    // 117 was removed as an excess frame; Part 3 begins on the next real frame.
    startFrame: 118,
    stopFrame: 186,
    text: {
      eyebrow: "Sound Reduction",
      headline: "You hear less of what's outside.",
      lede: "Sealed frames and thick glass drop the noise floor of a whole room.",
      bullets: [
        "EPDM-sealed frames close the gaps sound leaks through",
        "Glass 6–12 mm thick; laminated options damp noise further",
        "Multi-chamber uPVC frames cut outside noise by 24–40 dB",
      ],
    },
  },
];

// ── Part 2 materials (uPVC ⇄ Aluminium Thermal Break) ───────
// Each material has its own cutaway still + callout set. The callout `label`
// doubles as the connector-line list item; `anchor` is a point on the still
// (percentage of the image box) the thin line points to.
export type MaterialId = "upvc" | "alu";

export interface Callout {
  label: string;
  desc: string;
  /** Anchor point as a percentage of the still image (0–100). */
  anchor: { x: number; y: number };
}

export interface WindowMaterial {
  id: MaterialId;
  label: string;
  image: string;
  callouts: Callout[];
}

export const WINDOW_MATERIALS: WindowMaterial[] = [
  {
    id: "upvc",
    label: "uPVC",
    image: "/images/scroll-window-stills/part2-upvc.webp",
    callouts: [
      { label: "Weather-seal gasket", desc: "EPDM seal that locks out air and water", anchor: { x: 40, y: 47 } },
      { label: "Steel reinforcement", desc: "galvanized core for rigidity and security", anchor: { x: 43, y: 60 } },
      { label: "Multi-chamber profile", desc: "sealed cells across the whole frame", anchor: { x: 36, y: 64 } },
      { label: "Thermal & sound insulation", desc: "trapped air in the chambers does the work", anchor: { x: 44, y: 71 } },
    ],
  },
  {
    id: "alu",
    label: "Aluminium Thermal Break",
    image: "/images/scroll-window-stills/part2-alu.webp",
    callouts: [
      { label: "Weather-seal gasket", desc: "the same EPDM weather seal", anchor: { x: 41, y: 48 } },
      { label: "Polyamide thermal break", desc: "non-conductive bar splits the metal, blocking heat", anchor: { x: 45, y: 61 } },
      { label: "Outer aluminium profile", desc: "powder-coated, weather-facing", anchor: { x: 36, y: 69 } },
      { label: "Inner aluminium profile", desc: "stays cooler even in direct sun", anchor: { x: 55, y: 76 } },
    ],
  },
];
