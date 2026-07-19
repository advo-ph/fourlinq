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
      headline: "Brochure-listed weather features.",
      body: "The verified brochure lists EPDM gaskets for air and water tightness plus drainage holes. This site does not publish a system-specific wind or rain test rating.",
    },
  },
  {
    id: "thermal",
    startFrame: 145,
    endFrame: 224,
    mode: "auto-play",
    text: {
      eyebrow: "Thermal Insulation",
      headline: "A multi-chamber profile.",
      body: "The brochure describes a multi-chamber profile for heat insulation and energy savings. Ask for the exact proposed assembly and verified thermal value before modeling performance.",
    },
  },
  {
    id: "sound",
    startFrame: 225,
    endFrame: 339,
    mode: "auto-play",
    text: {
      eyebrow: "Sound Reduction",
      headline: "Brochure-listed sound insulation.",
      body: "The brochure lists sound insulation and 6–12 mm glazing options. This site does not publish a tested decibel reduction for a specific profile, glass, hardware, and installation.",
    },
  },
];

// ── Thermal system selector ─────────────────────────────────
// The thermal phase locks on its end frame; a toggle below the phase text
// lets the user swap between the uPVC system (the canvas frame as-is) and the
// Aluminium Thermal Break system (an overlay image cross-faded over the frame).
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
      headline: "A multi-chamber profile.",
      body: "The brochure describes a multi-chamber uPVC profile for heat insulation. Ask for the exact proposed assembly and verified thermal value before comparing systems.",
    },
    image: null,
  },
  {
    id: "alu",
    label: "Aluminium Thermal Break System",
    text: {
      eyebrow: "Thermal Break Technology",
      headline: "A client-supplied system name.",
      body: "FourlinQ lists a Thermal Break aluminium system. The public source does not include its exact section, separator material, thermal value, compatibility, or test report; request those for the proposed profile.",
    },
    image: "/images/thermal-alu-break.webp",
  },
];
