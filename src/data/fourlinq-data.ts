// fourlinq-data.ts
// Source: 100% verified from official FourlinQ printed brochures and physical profile samples
// Last updated: March 2026
// ⚠️  Do NOT add claims not present here without client verification

// ─────────────────────────────────────────────
// BRAND
// ─────────────────────────────────────────────

export const BRAND = {
  name: "FourlinQ",
  tagline: "Windows & Doors",
  promise: "A Lifetime of Satisfaction and Peace of Mind.",
  promiseSupport: "Windows and Doors are built to last.",
  heroQuote: "Custom-made Windows & Doors to suit customers' specifications.",
  warranty: "10-Year Limited Warranty",
  warrantyScope: [
    "Corrosion resistance",
    "Long lasting performance",
    "Weather resistance",
    "Sound insulation",
  ],
};

// ─────────────────────────────────────────────
// CONTACT INFO
// Source: FourlinQ brochure: assistance card and footer
// ─────────────────────────────────────────────

export const CONTACT = {
  mobileAssist: "0925-896-5978",  // "For Assistance" number
  mobileSales:  "0925-848-8888",  // Primary sales number
  landline:     "(02)8563-5363",
  email:        "sales@fourlinq.com",
};

/**
 * A local PH mobile number in E.164: "0925-848-8888" becomes "+639258488888".
 * Returns null for anything that is not an 09xx mobile (a landline has no Viber).
 */
export function toE164(phone: string): string | null {
  const digit = phone.replace(/\D/g, "");
  if (/^09\d{9}$/.test(digit)) return `+63${digit.slice(1)}`;
  if (/^639\d{9}$/.test(digit)) return `+${digit}`;
  return null;
}

/**
 * Viber deep link for a mobile number.
 *
 * Imie, 2026-05-31, with a screenshot of the browser's "Open Skype?" prompt:
 * "when i click the contact no. is it possible that it is directed to a viber
 * app instead of skype?" A bare `tel:` link hands the number to whatever the OS
 * has registered for the protocol, which on her desktop is Skype.
 *
 * Falls back to `tel:` for landlines, which Viber cannot dial.
 */
export function phoneHref(phone: string): string {
  const e164 = toE164(phone);
  return e164
    ? `viber://chat?number=${encodeURIComponent(e164)}`
    : `tel:${phone.replace(/[^\d+]/g, "")}`;
}

// ─────────────────────────────────────────────
// BRANCHES
// Source: Brochure footer. Three locations, all verified.
//
// `type` is not rendered anywhere — its only consumer is the chatbot knowledge
// seed, which writes it into the passage as "{label} ({type})". Ortigas and
// Alabang were typed "depot" while every customer-facing surface, LinQ
// included, calls all three showrooms; that mismatch put "(depot)" into the
// bot's grounding for two of the three. Client wording wins, so they are
// typed to match what we actually say.
// ─────────────────────────────────────────────

export interface Branch {
  id: string;
  label: string;
  type: "main-office" | "showroom" | "depot";
  address: string;
  city: string;
  region: "NCR" | "Cebu";
  lat: number;
  lng: number;
  mapQuery: string; // pre-encoded query for Google Maps
}

export const BRANCHES: Branch[] = [
  {
    id: "ortigas",
    label: "Ortigas: CW Home Depot",
    type: "showroom",
    address: "Unit 41 Doña Julia Vargas Ave., cor. Meralco Avenue, Brgy. Ugong, Pasig City",
    city: "Pasig City",
    region: "NCR",
    lat: 14.5856,
    lng: 121.0615,
    mapQuery: "CW+Home+Depot+Ortigas+Pasig+City",
  },
  {
    id: "alabang",
    label: "Alabang: CW Home Depot",
    type: "showroom",
    address: "Alabang Showroom G/F Unit B-22 / Alabang Showroom 2/F Unit A-44, Alabang Zapote Road cor. Filinvest Ave., Westgate Alabang, Muntinlupa",
    city: "Muntinlupa",
    region: "NCR",
    lat: 14.4233,
    lng: 121.0253,
    mapQuery: "CW+Home+Depot+Westgate+Alabang+Muntinlupa",
  },
  {
    id: "cebu",
    label: "Cebu Branch",
    type: "showroom",
    address: "Door 9 Centro Fortuna Building, A.S. Fortuna Street, Banilad, Mandaue City, Cebu",
    city: "Mandaue City",
    region: "Cebu",
    lat: 10.3321,
    lng: 123.9055,
    mapQuery: "Centro+Fortuna+Building+AS+Fortuna+Street+Banilad+Mandaue+City+Cebu",
  },
];

// ─────────────────────────────────────────────
// FOURLINQ ADVANTAGES
// Source: "FourlinQ Advantages" panel: official brochure
// Exactly 7 verified claims. Do not expand without client sign-off.
// ─────────────────────────────────────────────

export interface Advantage {
  id: string;
  label: string;
  description: string;
  icon: string; // map to your icon library (lucide-react recommended)
}

export const ADVANTAGES: Advantage[] = [
  {
    id: "attractive-appearance",
    label: "Attractive Appearance",
    description:
      "Clean, modern profiles available in 12 finishes, from classic white to rich wood grains, designed to complement any architectural style.",
    icon: "sparkles",
  },
  {
    id: "fire-retardant",
    label: "Fire Retardant",
    description:
      "uPVC material is inherently fire retardant, slowing the spread of flames and adding a critical layer of protection to your home.",
    icon: "flame",
  },
  {
    id: "thermal-efficiency",
    label: "Thermal Efficiency",
    description:
      "Multi-chamber profile design traps air to reduce heat transfer, keeping interiors cooler and lowering energy consumption.",
    icon: "sun",
  },
  {
    id: "corrosion-resistant",
    label: "Corrosion Resistant",
    description:
      "Unlike steel, uPVC never rusts, ideal for the Philippine climate with its humidity, salt air, and heavy rainfall.",
    icon: "shield",
  },
  {
    id: "long-lasting-performance",
    label: "Long Lasting Performance",
    description:
      "Engineered for durability with a 10-year limited warranty. uPVC does not warp, rot, or require repainting over its lifetime.",
    icon: "clock",
  },
  {
    id: "weather-resistance",
    label: "Weather Resistance",
    description:
      "EPDM gaskets and drainage holes ensure a tight seal against rain, wind, and storm conditions, built for tropical weather.",
    icon: "cloud-rain",
  },
  {
    id: "sound-insulation",
    label: "Sound Insulation",
    description:
      "Multi-chamber profiles and thick glass (6mm to 12mm) significantly reduce outside noise for a quieter, more comfortable home.",
    icon: "volume-x",
  },
];

// ─────────────────────────────────────────────
// uPVC PROFILE CUT SECTION: 7 Engineering Features
// Source: Brochure diagram: "uPVC Profile Cut Section"
// Numbers match the diagram callouts exactly.
// Ideal use: interactive SVG cross-section on the website
// ─────────────────────────────────────────────

export interface ProfileFeature {
  number: number;
  label: string;
  descriptionVerbatim: string; // exact words from brochure
  benefitPlain: string;        // plain-language consumer benefit
}

export const UPVC_PROFILE_FEATURES: ProfileFeature[] = [
  {
    number: 1,
    label: "Thick Glass",
    descriptionVerbatim: "6mm to 12mm thick glass.",
    benefitPlain: "Better insulation, soundproofing, and impact resistance.",
  },
  {
    number: 2,
    label: "Smooth Homogenous Profile",
    descriptionVerbatim: "Smooth homogenous profile enables easy cleaning.",
    benefitPlain: "No grooves or gaps where dirt accumulates. Wipe clean in seconds.",
  },
  {
    number: 3,
    label: "Galvanized Steel Reinforcement",
    descriptionVerbatim: "Galvanized steel reinforcement for strength, stability, and security.",
    benefitPlain: "Structural rigidity that resists forced entry and heavy wind loads.",
  },
  {
    number: 4,
    label: "Multi-Chamber Profile",
    descriptionVerbatim: "Multi-chamber designed profile for excellent heat insulation and energy savings.",
    benefitPlain: "Trapped air chambers act as thermal barriers: cooler rooms, lower electricity bills.",
  },
  {
    number: 5,
    label: "Internal Glazing Beads",
    descriptionVerbatim: "Internal glazing beads for added security.",
    benefitPlain: "Glass is secured from the inside, so it cannot be removed from outside the home.",
  },
  {
    number: 6,
    label: "EPDM Gaskets",
    descriptionVerbatim: "EPDM gaskets for air and water tightness.",
    benefitPlain: "Creates a weatherproof seal that keeps out rain, wind, dust, and insects.",
  },
  {
    number: 7,
    label: "Drainage Holes",
    descriptionVerbatim: "Drainage holes for proper drainage.",
    benefitPlain: "Prevents water pooling inside the frame: no leaks, no water damage.",
  },
];

// ─────────────────────────────────────────────
// PRODUCT TYPES
// Source: FourlinQ brochure: 5 confirmed types
// ─────────────────────────────────────────────

export type WindowType =
  | "casement"
  | "sliding"
  | "special-shapes"
  | "awning"
  | "slide-and-fold"
  | "lift-and-slide";

export type ProductCategory = "window" | "door" | "both";

export interface ProductType {
  id: WindowType;
  label: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  primaryBenefit: string;
  supportsCustomShapes: boolean;
}

export const PRODUCT_TYPES: ProductType[] = [
  {
    id: "casement",
    label: "Casement",
    category: "window",
    tagline: "Smooth operation. Reliable performance.",
    description:
      "A smooth-rolling window that offers reliability, performance, and great looks. Hinged on one side, it opens outward for maximum ventilation and a clean facade.",
    primaryBenefit: "Maximum ventilation and easy cleaning",
    supportsCustomShapes: false,
  },
  {
    id: "sliding",
    label: "Sliding",
    category: "both",
    tagline: "Elegant. Versatile. Thoroughly reliable.",
    description:
      "Elegant, attractive, and versatile while being thoroughly reliable. Slides horizontally along a track, ideal where outward clearance is limited.",
    primaryBenefit: "Space-saving, ideal for balconies and wide openings",
    supportsCustomShapes: false,
  },
  {
    id: "special-shapes",
    label: "Special Shapes",
    category: "window",
    tagline: "Make a statement with glass.",
    description:
      "Designed to provide ventilation even when it is raining. Can be combined with other window types to create a very dramatic feature wall of glass.",
    primaryBenefit: "Dramatic architectural impact, fully custom geometry",
    supportsCustomShapes: true,
  },
  {
    id: "awning",
    label: "Awning",
    category: "window",
    tagline: "Light and security, beautifully combined.",
    description:
      "Designed to provide light and architectural interest where ventilation is not necessarily needed but security is. Hinged at the top and opens outward.",
    primaryBenefit: "Weather protection while allowing airflow and light",
    supportsCustomShapes: false,
  },
  {
    id: "slide-and-fold",
    label: "Slide & Fold",
    category: "both",
    tagline: "Open up your space completely.",
    description:
      "Panels that slide and fold to one side, creating a fully open wall between indoor and outdoor spaces. Ideal for living areas, patios, and entertainment spaces.",
    primaryBenefit: "Full wall opening, seamless indoor-outdoor living",
    supportsCustomShapes: false,
  },
  {
    id: "lift-and-slide",
    label: "Lift & Slide",
    category: "door",
    tagline: "Large panels. Effortless glide.",
    description:
      "A heavy-duty sliding door system. Turning the handle lifts the panel off its seals so it glides almost weightlessly, then drops it back to lock into a weather-tight seal. Built for large, heavy glass panels and wide openings.",
    primaryBenefit: "Large, heavy panels that still glide effortlessly and seal tight",
    supportsCustomShapes: false,
  },
];

// ─────────────────────────────────────────────
// MATERIAL OPTIONS
// ─────────────────────────────────────────────

export type Material = "upvc" | "aluminium";

export interface MaterialOption {
  id: Material;
  label: string;
  badge?: string;
  highlights: string[];
  compatibleFinishIds: string[];
}

export const MATERIALS: MaterialOption[] = [
  {
    id: "upvc",
    label: "uPVC",
    highlights: [
      "Fire retardant",
      "Thermally efficient, multi-chamber design",
      "Never rusts or corrodes",
      "No painting or maintenance required",
      "Galvanized steel reinforced for security",
      "EPDM gaskets, fully weatherproof",
      "6mm to 12mm glass options",
      "Sound insulating",
      "10-Year Limited Warranty",
    ],
    compatibleFinishIds: [
      "oak-light", "oak-malt", "jet-black", "charcoal-gray",
      "matte-quartz", "silica-cream", "black-wood", "gray-wood",
      "dark-oak", "walnut", "golden-oak", "white",
    ],
  },
  {
    id: "aluminium",
    label: "Aluminium",
    badge: "New",
    highlights: [
      "Slim sightlines for a modern minimal look",
      "High strength-to-weight ratio",
      "Suitable for large-span openings",
      "Corrosion-resistant",
    ],
    // Aluminium has its own powder-coat finish set. See ALUMINIUM_FINISHES below.
    // These uPVC finish ids are the swatches the configurator can preview today.
    compatibleFinishIds: ["oak-light", "silica-cream", "white", "jet-black", "charcoal-gray", "matte-quartz"],
  },
];

// ─────────────────────────────────────────────
// ALUMINIUM FINISHES: popular powder-coat colours
// Source: client (2026-05-31). Distinct from the 12 uPVC FRAME_FINISHES.
// ─────────────────────────────────────────────

export interface AluminiumFinish {
  id: string;
  name: string;
  hex: string;
}

export const ALUMINIUM_FINISHES: AluminiumFinish[] = [
  { id: "alu-gray",  name: "Gray",  hex: "#8a8d8f" },
  { id: "alu-black", name: "Black", hex: "#1b1b1d" },
  { id: "alu-brown", name: "Brown", hex: "#5a4632" },
  { id: "alu-white", name: "White", hex: "#f4f4f2" },
];

// ─────────────────────────────────────────────
// PROFILE SYSTEMS: the extrusion brands / lines we fabricate from
// Source: client (2026-05-31).
// ─────────────────────────────────────────────

export interface ProfileSystem {
  material: Material;
  name: string;
  origin?: string; // brand origin, for uPVC
  note?: string;   // spec note, e.g. wall thickness
}

export const PROFILE_SYSTEMS: ProfileSystem[] = [
  { material: "upvc",     name: "Veka",                      origin: "German brand" },
  { material: "upvc",     name: "Skyframe",                  origin: "Chinese brand" },
  { material: "aluminium", name: "Standard / Regular Systems", note: "Wall thickness 1.2mm to 3.0mm." },
  { material: "aluminium", name: "Alu Slim Systems",           note: "Minimum-sightline aluminium profile." },
];

// ─────────────────────────────────────────────
// FRAME FINISHES: 12 Confirmed Options
// Source: Physical uPVC profile sample bars
// ─────────────────────────────────────────────

export type FinishCategory = "wood-grain" | "solid";

export interface FrameFinish {
  id: string;
  label: string;
  category: FinishCategory;
  swatchHex: string;
  description: string;
  hasTexture: boolean;
  textureImagePath?: string; // e.g. "/textures/walnut.jpg", for 3D viewer material maps
  /** Real brochure photo of the finish applied to a uPVC profile. Used on
   *  the /finishes swatch grid in place of the synthetic hex + stripe
   *  overlay. Falls back to swatchHex when undefined. */
  profilePhotoPath?: string;
}

export const FRAME_FINISHES: FrameFinish[] = [
  {
    id: "oak-light",
    label: "Oak Light",
    category: "wood-grain",
    swatchHex: "#C9A96E",
    description:
      "Pale golden blonde with soft, fine grain. The lightest wood option, airy and natural. Works well in Scandinavian-inspired and minimalist interiors.",
    hasTexture: true,
    textureImagePath: "/images/finishes/textures/oak-light.png",
  },
  {
    id: "oak-malt",
    label: "Oak Malt",
    category: "wood-grain",
    swatchHex: "#B89A6A",
    description:
      "Warm medium-blonde with golden-amber tones and slightly pronounced grain. Natural and unpretentious, like raw, unfinished timber. Pairs well with earth-tone interiors.",
    hasTexture: true,
    textureImagePath: "/images/finishes/textures/oak-malt.jpeg",
  },
  {
    id: "jet-black",
    label: "Jet Black",
    category: "solid",
    swatchHex: "#1A1A1A",
    description:
      "Deep, near-total black with a smooth matte-to-satin surface. Completely uniform, no grain. High contrast and architectural. The darkest and most dramatic option.",
    hasTexture: false,
  },
  {
    id: "charcoal-gray",
    label: "Charcoal Gray",
    category: "solid",
    swatchHex: "#4A4A4A",
    description:
      "Mid-dark gray, softer than Jet Black with a slightly cooler tone. Sits between anthracite and concrete in character, industrial but not aggressive. Very popular on contemporary facades.",
    hasTexture: false,
  },
  {
    id: "matte-quartz",
    label: "Matte Quartz",
    category: "solid",
    swatchHex: "#9E9E9E",
    description:
      "Flat medium gray with almost no sheen, stone-like and understated. Lighter and warmer than Charcoal. Closest visually to polished concrete or a quartz countertop.",
    hasTexture: false,
  },
  {
    id: "silica-cream",
    label: "Silica Cream",
    category: "solid",
    swatchHex: "#d4ccc1",
    description:
      "Warm off-white with sandy undertones. Softer than pure white, blends naturally with concrete, stone, and tropical-palette walls.",
    hasTexture: false,
  },
  {
    id: "black-wood",
    label: "Black Wood",
    category: "wood-grain",
    swatchHex: "#2E2A27",
    description:
      "Deep espresso brown-black where wood grain is still perceptible in raking light. Moody and rich, like ebonized oak or dark wenge.",
    hasTexture: true,
    textureImagePath: "/images/finishes/textures/black-wood.jpeg",
  },
  {
    id: "gray-wood",
    label: "Gray Wood",
    category: "wood-grain",
    swatchHex: "#8C8680",
    description:
      "Cool gray base with subtle brown-taupe grain lines, like driftwood or weathered timber. A crossover finish that is neither fully wood nor fully solid.",
    hasTexture: true,
    textureImagePath: "/images/finishes/textures/gray-wood.jpeg",
  },
  {
    id: "dark-oak",
    label: "Dark Oak",
    category: "wood-grain",
    swatchHex: "#5C3A1E",
    description:
      "Medium-dark reddish-brown with clearly defined, flowing grain lines in deep amber and brown. Classic and warm, reminiscent of mahogany-adjacent hardwoods.",
    hasTexture: true,
    textureImagePath: "/images/finishes/textures/dark-oak.jpeg",
  },
  {
    id: "walnut",
    label: "Walnut",
    category: "wood-grain",
    swatchHex: "#6B4226",
    description:
      "Rich chocolatey brown with prominent, swirling grain. Bold contrast between dark base and lighter streaks. The most premium timber look in the lineup.",
    hasTexture: true,
    textureImagePath: "/images/finishes/textures/walnut.jpeg",
  },
  {
    id: "golden-oak",
    label: "Golden Oak",
    category: "wood-grain",
    swatchHex: "#C8820A",
    description:
      "Bright honey-amber with a strong open-grain pattern, almost orange-gold in direct light. The most vivid wood finish. Suits traditional Filipino and Spanish colonial interiors.",
    hasTexture: true,
    textureImagePath: "/images/finishes/textures/golden-oak.jpg",
  },
  {
    id: "white",
    label: "White",
    category: "solid",
    swatchHex: "#F5F5F5",
    description:
      "Clean, bright white with a smooth uniform surface. The most versatile option: it matches any wall color and reads as modern or classic depending on context.",
    hasTexture: false,
  },
];

// ─────────────────────────────────────────────
// DIMENSION CONSTRAINTS (in mm)
// ⚠️ Industry defaults: confirm actual limits with client
// ─────────────────────────────────────────────

export const DIMENSION_CONSTRAINTS: Record<
  WindowType,
  { minW: number; maxW: number; minH: number; maxH: number }
> = {
  "casement":         { minW: 400,  maxW: 1800, minH: 400,  maxH: 2100 },
  "sliding":          { minW: 600,  maxW: 3600, minH: 600,  maxH: 2400 },
  "special-shapes":   { minW: 300,  maxW: 3000, minH: 300,  maxH: 3000 },
  "awning":           { minW: 400,  maxW: 1500, minH: 300,  maxH: 900  },
  "slide-and-fold":   { minW: 1800, maxW: 6000, minH: 2000, maxH: 2800 },
  "lift-and-slide":   { minW: 1500, maxW: 6000, minH: 2000, maxH: 2700 },
};

// ─────────────────────────────────────────────
// QUOTE FORM PAYLOAD
// ─────────────────────────────────────────────

export interface QuotePayload {
  name: string;
  email: string;
  phone: string;
  branchId: string;
  productType: WindowType;
  material: Material;
  finishId: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  notes?: string;
}
