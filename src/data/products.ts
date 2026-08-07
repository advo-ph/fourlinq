// Product catalog for the Products page
// Descriptions and taglines sourced from verified PRODUCT_TYPES in fourlinq-data.ts
// ⚠️ Specs (mm profile sizes, Uw values) are NOT in brochure, marked as indicative
import { PRODUCT_TYPES, FRAME_FINISHES } from "./fourlinq-data";

export type ProductCategory = "windows" | "doors" | "specialist" | "systems";

export interface ProductFinish {
  name: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  shortDescription: string;
  image: string;
  specs: string[];
  finishes: ProductFinish[];
  glassOptions: string[];
  /** Optional YouTube video ID. Renders an embed in the product detail panel. */
  youtubeId?: string;
}

// Derive finishes from verified FRAME_FINISHES
export const productFinishes: ProductFinish[] = FRAME_FINISHES.map((f) => ({
  name: f.label,
  color: f.swatchHex,
}));

// Map verified brochure product types to catalog cards
// Image paths reference existing wp-export assets
export const products: Product[] = [
  {
    id: "casement",
    name: "Casement",
    category: "windows",
    description: PRODUCT_TYPES.find((p) => p.id === "casement")!.description,
    shortDescription: PRODUCT_TYPES.find((p) => p.id === "casement")!.tagline,
    image: "/images/wp-export/casement.webp",
    specs: [
      "Multi-chamber uPVC profile",
      "6mm to 12mm glass options",
      "Galvanized steel reinforcement",
      "EPDM gaskets, weatherproof seal",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Frosted Privacy", "Tinted Bronze"],
  },
  {
    id: "sliding",
    name: "Sliding",
    category: "windows",
    description: PRODUCT_TYPES.find((p) => p.id === "sliding")!.description,
    shortDescription: PRODUCT_TYPES.find((p) => p.id === "sliding")!.tagline,
    image: "/images/wp-export/slidingwindow.webp",
    specs: [
      "Multi-chamber uPVC profile",
      "Smooth horizontal track operation",
      "6mm to 12mm glass options",
      "Internal glazing beads for security",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Grey", "Laminated Safety"],
  },
  {
    id: "special-shapes",
    name: "Special Shapes",
    category: "windows",
    description: PRODUCT_TYPES.find((p) => p.id === "special-shapes")!.description,
    shortDescription: PRODUCT_TYPES.find((p) => p.id === "special-shapes")!.tagline,
    image: "/images/wp-export/specialshapes.webp",
    specs: [
      "Custom geometry, arches, circles, triangles",
      "Combinable with other window types",
      "6mm to 12mm glass options",
      "Multi-chamber profile",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Bronze", "Laminated Safety"],
  },
  {
    id: "awning",
    name: "Awning",
    category: "windows",
    description: PRODUCT_TYPES.find((p) => p.id === "awning")!.description,
    shortDescription: PRODUCT_TYPES.find((p) => p.id === "awning")!.tagline,
    image: "/images/wp-export/awning.webp",
    specs: [
      "Top-hinged, opens outward",
      "Ventilation even during rain",
      "Multi-chamber uPVC profile",
      "EPDM gaskets, weatherproof seal",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Frosted Privacy", "Laminated Safety", "Tinted Bronze"],
  },
  {
    id: "sliding-door",
    name: "Sliding Door",
    category: "doors",
    description: PRODUCT_TYPES.find((p) => p.id === "sliding")!.description,
    shortDescription: PRODUCT_TYPES.find((p) => p.id === "sliding")!.tagline,
    // NOTE: do not swap this to a real photo in isolation. This card has a
    // 28-frame hover animation (systemAnimations.ts) rendered from the same
    // synthetic white-bg master, and the animation is what actually answers
    // Imie's 2026-05-28 "looks like a two-panel fixed". It plays closed→open,
    // and she approved it at meeting 00:17:07. A real resting photo would jump
    // to a synthetic render on hover. Replace the resting image only together
    // with a re-rendered frame set.
    image: "/images/wp-export/slidingdoor.webp",
    specs: [
      "Multi-chamber uPVC profile",
      "Space-saving horizontal slide",
      "6mm to 12mm glass options",
      "Galvanized steel reinforcement",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Grey", "Laminated Safety"],
  },
  {
    id: "slide-and-fold",
    name: "Slide & Fold",
    category: "doors",
    description:
      "Four-panel accordion folding door. Each panel is hinged to the next and runs on a bottom track. When opened, the panels fold and stack to one side, creating a full clear opening with no frame in the way. The lead panel carries the handle and starts the movement. Suited to living areas, patios, and spaces that should open completely to the outside.",
    shortDescription: "Opens fully, panel by panel, wall to wall.",
    image: "/images/wp-export/slideandfold.webp",
    // Tita reference video (2026-05-28 chat): shows the system in motion.
    youtubeId: "-8XwIKAtAAc",
    specs: [
      "4-panel accordion configuration",
      "Panels fold and stack to one end",
      "Full clear opening when folded",
      "Bottom track with rolling pivot hardware",
      "Lead panel handle activation",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Bronze", "Laminated Safety"],
  },
  {
    id: "casement-door",
    name: "Casement Door",
    category: "doors",
    description:
      "Reinforced uPVC casement door combining aesthetic versatility with the security demands of main entry points. Multi-chamber profile with galvanized steel reinforcement.",
    shortDescription: "Secure and elegant single-leaf hinged doors.",
    image: "/images/wp-export/casement-door.webp",
    specs: [
      "Multi-chamber reinforced profile",
      "Galvanized steel core",
      "Multi-point locking",
      "EPDM gaskets, weatherproof seal",
    ],
    finishes: productFinishes,
    glassOptions: ["Frosted Privacy", "Clear Float", "Laminated Safety"],
  },
  {
    id: "french-door",
    name: "French Sliding Door",
    category: "doors",
    description:
      "Four-panel sliding door with a traditional French door aesthetic. The two centre panels are active, each handle-fitted, and slide to open, with the outer two panels fixed in place. A decorative grid pattern runs across all four panels. Combines the visual character of a classic double door with the space-saving practicality of a sliding system.",
    shortDescription: "Classic French door look, sliding operation.",
    image: "/images/wp-export/frenchdoor.webp",
    specs: [
      "4-panel configuration (2 active centre, 2 fixed outer)",
      "Both active centre panels are handle-fitted",
      "Decorative grid pattern across all panels",
      "Centre-sliding operation",
      "Multi-chamber uPVC profile",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Frosted Privacy", "Laminated Safety"],
  },
  // ─── Tita-requested Door Systems (consultation-only, no fabricated specs) ───
  {
    id: "large-panel-doors",
    name: "Large Panel Doors",
    category: "doors",
    description:
      "Two-panel large-format door system with oversized glass panels and minimal framing. The right panel carries a full-height vertical bar handle. Designed for wide openings, ground-floor living rooms, lanai-facing walls, and anywhere the door should feel like a glass wall rather than a door. Custom-specified per project.",
    shortDescription: "Maximum glass, minimal frame.",
    image: "/images/wp-export/largepanel.webp",
    specs: [
      "2-panel configuration",
      "Oversized glass panels with minimal frame",
      "Full-height vertical bar handle",
      "Wide opening capability",
      "Custom specification per project",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Bronze", "Laminated Safety"],
  },
  {
    id: "lift-and-slide",
    name: "Lift & Slide",
    category: "doors",
    description:
      "Two-panel sliding door with a lift-and-slide mechanism. Rotating the handle lifts the panel off its compression seal, so even a large, heavy panel moves with minimal effort. When closed and locked, the panel settles back into the seal for a weather-tight finish. The result is smooth daily operation without wear on the seal. Suited to wide openings where a regular sliding door would feel heavy or drag.",
    shortDescription: "Effortless sliding on large, heavy panels.",
    image: "/images/wp-export/liftandslide.webp",
    specs: [
      "2-panel sliding configuration",
      "Handle-activated lift mechanism disengages seal before sliding",
      "Compression seal re-engaged on close for weather tightness",
      "Suitable for large, heavy panel sizes",
      "Consultation required for sizing",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Bronze", "Laminated Safety"],
  },
  {
    id: "90-series",
    name: "90 Series",
    category: "doors",
    description:
      "FourlinQ 90 Series, a three-panel door system with large uninterrupted glass panes and minimal framing. The active panel is handle-fitted on the right. Designed for wide residential openings where clean sightlines and a premium finish are the priority. Custom-specified per project.",
    shortDescription: "Three-panel premium door system.",
    image: "/images/wp-export/90series.webp",
    specs: [
      "3-panel configuration",
      "Large uninterrupted glass panels",
      "Minimal frame profile",
      "Handle on active panel",
      "Custom specification per project",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Laminated Safety"],
  },
  // ─── Tita-requested Specialist Systems ───
  {
    id: "arch-shapes",
    name: "Arch Shapes",
    category: "specialist",
    description:
      "Custom-curved profile work for arched windows and doors. Designed and fabricated to architect-specified geometry. Common in heritage homes and statement entries.",
    shortDescription: "Custom-curved geometry for architectural statements.",
    image: "/images/wp-export/archshapes.webp",
    specs: [
      "Architect-specified arc geometry",
      "Multi-chamber uPVC profile",
      "Project-by-project fabrication",
      "Consultation required",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Bronze", "Laminated Safety"],
  },
  {
    id: "curtain-wall",
    name: "Curtain Wall",
    category: "specialist",
    description:
      "Fixed-glazed facade system arranged in a structural grid of vertical mullions and horizontal transoms. The frame carries the glass weight and transfers wind and gravity loads to the building's primary structure. The wall itself bears no load. Suited to commercial buildings and high-end residential projects where a continuous glazed surface is the design intent. Multi-storey configurations available. Project consultation required.",
    shortDescription: "Fixed glazed facade. Not a wall, a window wall.",
    image: "/images/wp-export/curtainwall2.png",
    specs: [
      "Fixed (non-operable) glazed assembly",
      "Structural grid: vertical mullions and horizontal transoms",
      "Non-load-bearing facade, loads transfer to building structure",
      "Multi-storey capable",
      "Project consultation required",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Bronze", "Laminated Safety"],
  },
  {
    id: "custom-shapes",
    name: "Custom Shapes",
    category: "specialist",
    description:
      "Non-standard panel geometries. Triangles, trapezoids, hexagons, and full bespoke shapes. Designed to architect drawings, fabricated in our workshop. The panels that other manufacturers say can't be done.",
    shortDescription: "Bespoke geometry to architect drawings.",
    image: "/images/wp-export/customshapes.webp",
    specs: [
      "Architect-drawn geometry",
      "Workshop-fabricated",
      "Multi-chamber uPVC profile",
      "Project consultation required",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Bronze", "Laminated Safety"],
  },
  // ─── Aug 7 client feedback — four products that had no catalog home ───
  // Glass is a product LINE under specialist (not a fourth type card). See
  // taxonomy.ts header and MEETING_INSTRUCTION_INVENTORY §2 (00:10:14).
  {
    id: "glass-railing",
    name: "Glass Railing",
    category: "specialist",
    description:
      "Frameless or minimal-framed glass railing and balcony systems for residential and commercial openings. Tempered safety glass panels with discrete hardware, suited to balconies, mezzanines, stair edges, and terrace edges where the view should stay open. Project-specified: panel height, mounting detail, and glass type are set per drawing. Consultation required for structural fixings and local code.",
    shortDescription: "Open views. Safety glass at the edge.",
    // Schematic placeholder — no verified client product photo in-repo yet.
    // See docs/AUG07_ASSET_REQUEST.md.
    image: "/images/products/schematic/glass-railing.svg",
    specs: [
      "Tempered safety glass panels",
      "Frameless or minimal-frame hardware options",
      "Balcony, mezzanine, and terrace applications",
      "Project-specified height and mounting",
      "⚠️ Indicative only — structural fixings and code compliance by project consultation",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Grey", "Laminated Safety"],
  },
  {
    id: "sc-door",
    name: "SC-Door System (Sliding Casement Door)",
    category: "doors",
    description:
      "Sliding Casement Door system — a casement door that slides rather than swings. The leaf travels on a track to free floor space while keeping the sealed, multi-point character of a casement door. For main and secondary entries, lanai access, and rooms where a swinging leaf would block furniture or circulation. We call it sliding. Custom-specified per opening.",
    shortDescription: "Casement seal and security, sliding operation.",
    // Schematic placeholder — no verified client product photo in-repo yet.
    // See docs/AUG07_ASSET_REQUEST.md.
    image: "/images/products/schematic/sc-door.svg",
    specs: [
      "Sliding Casement operation (not a swing leaf)",
      "Multi-point locking on the active leaf",
      "Space-saving travel on track",
      "Multi-chamber profile with weather seals",
      "Custom specification per project",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Frosted Privacy", "Low-E Coated", "Laminated Safety"],
  },
  {
    id: "louvre",
    name: "Louvre Windows",
    category: "windows",
    description:
      "Operable louvre windows with adjustable horizontal blades for controlled ventilation. Blades open together so air moves even when you want the opening to stay rain-aware. Common in kitchens, bathrooms, utility rooms, and tropical facades that need airflow without a full sash swing. Available in glass louvre blades; project consultation for blade count, frame finish, and insect-screen options.",
    shortDescription: "Blade-by-blade ventilation for tropical rooms.",
    // Schematic placeholder — no verified client product photo in-repo yet.
    // See docs/AUG07_ASSET_REQUEST.md.
    image: "/images/products/schematic/louvre.svg",
    specs: [
      "Adjustable horizontal louvre blades",
      "Ventilation with partial rain protection when angled",
      "Glass blade options",
      "Suited to kitchens, baths, and utility openings",
      "Project consultation for blade count and screen options",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Frosted Privacy", "Tinted Bronze", "Laminated Safety"],
  },
  {
    id: "automated-window",
    name: "Automated Windows",
    category: "windows",
    description:
      "Motorised window opening devices for operable windows. Open high or hard-to-reach sashes without climbing; pair with wall switches, remotes, or building controls where specified. Answers the window opening devices ask from the 2026-07-10 client meeting (00:21:11) — door automation and digital access is a separate product, Automated Door Access, filed under doors. Hardware and control scope are project-specified — not a single SKU. Consultation required for load, travel, and power.",
    shortDescription: "Open a high window without the ladder.",
    // Schematic placeholder — no verified client product photo in-repo yet.
    // See docs/AUG07_ASSET_REQUEST.md.
    image: "/images/products/schematic/automated-window.svg",
    specs: [
      "Motorised window opening devices",
      "Wall switch, remote, or building-control integration (project-specified)",
      "Suited to high, large, or hard-to-reach operable units",
      "⚠️ Indicative only — actuator load, travel, and power by project consultation",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Grey", "Laminated Safety"],
  },
  // ─── Aug 8 — door automation split out of automated-window ───
  // She asked two separate things: "Automate your door… digital access"
  // (00:20:47, a DOOR) and "Window opening devices" (00:21:11, a WINDOW).
  // Migration 019 answered both with one windows-category product, so the door
  // ask was unreachable from /products?filter=doors — the one place someone
  // following up on that remark would look. Split, per ask, per category.
  {
    id: "automated-door",
    name: "Automated Door Access",
    category: "doors",
    description:
      "Digital access and motorised operation for door leaves — keypad, card, fob, or app entry, with automatic opening where the leaf and frame allow it. For main entries, offices, and shared entrances that should open without a key and close without being pulled. Answers the automate-your-door / digital access ask from the 2026-07-10 client meeting (00:20:47). Lock integration, power, and control scope are project-specified — not a single SKU. Consultation required for leaf weight, fire-egress rules, and power provision.",
    shortDescription: "Enter without a key. Close without a pull.",
    // Schematic placeholder — no verified client product photo in-repo yet.
    // See docs/AUG07_ASSET_REQUEST.md.
    image: "/images/products/schematic/automated-door.svg",
    specs: [
      "Digital access: keypad, card, fob, or app (project-specified)",
      "Motorised opening for compatible door leaves",
      "Integrates with multi-point locking",
      "Suited to main entries and shared entrances",
      "⚠️ Indicative only — leaf weight, egress compliance, and power by project consultation",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Frosted Privacy", "Low-E Coated", "Laminated Safety"],
  },
];
