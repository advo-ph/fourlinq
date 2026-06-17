export interface ScrollPhase {
  id: string;
  startFrame: number;
  endFrame: number;
  mode: "scroll-mapped" | "auto-play";
  text: {
    eyebrow: string;
    headline: string;
    body: string;
  } | null;
}

export const TOTAL_FRAMES = 340;
export const FRAME_PATH_TEMPLATE = "/images/scroll-window-webp/frame_{index}.webp";
export const FRAME_PAD_LENGTH = 4;

export const SCROLL_PHASES: ScrollPhase[] = [
  {
    id: "spinning",
    startFrame: 0,
    endFrame: 57,
    mode: "scroll-mapped",
    text: null,
  },
  {
    id: "rain",
    startFrame: 58,
    endFrame: 144,
    mode: "auto-play",
    text: {
      eyebrow: "Weather Resistance",
      headline: "Zero leaks through the frame.",
      body: "Each joint uses EPDM rubber gaskets and built-in drainage channels that route water out before it reaches the interior. Tested against Signal No. 3 conditions.",
    },
  },
  {
    id: "thermal",
    startFrame: 145,
    endFrame: 224,
    mode: "auto-play",
    text: {
      eyebrow: "Thermal Insulation",
      headline: "Keeps heat on the outside.",
      body: "The frame has multiple air chambers inside that slow down heat transfer. In a concrete building under direct sun, that means your AC runs less to hold the same temperature.",
    },
  },
  {
    id: "sound",
    startFrame: 225,
    endFrame: 339,
    mode: "auto-play",
    text: {
      eyebrow: "Sound Reduction",
      headline: "You hear less of what's outside.",
      body: "Sealed uPVC frames paired with thick glass reduce noise by up to 40 dB. Street traffic, construction, neighbors. Enough difference that you notice it the first time you close the window.",
    },
  },
];

// ── Thermal system selector ─────────────────────────────────
// The thermal phase locks on its end frame; a toggle below the phase text
// lets the user swap between the uPVC system (the canvas frame as-is) and the
// Aluminum Thermal Break system (an overlay image cross-faded over the frame).
// Only interactive once the thermal phase has settled on this frame.

export const THERMAL_PHASE_ID = "thermal";

export type ThermalSystemId = "upvc" | "alu";

export interface ThermalSystem {
  id: ThermalSystemId;
  label: string;
  text: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  /** Overlay image cross-faded over the canvas frame. null = keep the frame. */
  image: string | null;
}

export const THERMAL_SYSTEMS: ThermalSystem[] = [
  {
    id: "upvc",
    label: "uPVC System",
    text: {
      eyebrow: "Thermal Insulation",
      headline: "Keeps heat on the outside.",
      body: "The frame has multiple air chambers inside that slow down heat transfer. In a concrete building under direct sun, that means your AC runs less to hold the same temperature.",
    },
    image: null,
  },
  {
    id: "alu",
    label: "Aluminum Thermal Break System",
    text: {
      eyebrow: "Thermal Break Technology",
      headline: "Separates outside heat from the inside frame.",
      body: "The system uses internal and external aluminum profiles divided by a polyamide thermal break. This barrier reduces direct heat transfer, so the inner side of the frame stays cooler even when the outside surface is exposed to sun.",
    },
    image: "/images/thermal-alu-break.webp",
  },
];
