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
    description:
      "Slides horizontally along a track rather than swinging, so the floor space a swinging leaf would take stays usable. A soft-close damper catches the leaf at the end of its travel, so it decelerates and seats itself instead of slamming. Suited to balconies, lanai access, and wide openings where outward clearance is limited.",
    shortDescription: PRODUCT_TYPES.find((p) => p.id === "sliding")!.tagline,
    // NOTE: do not swap this to a real photo in isolation. This card has a
    // 28-frame hover animation (systemAnimations.ts) rendered from the same
    // synthetic white-bg master, and the animation is what actually answers
    // Imie's 2026-05-28 "looks like a two-panel fixed". It plays closed→open,
    // and she approved it at meeting 00:17:07. A real resting photo would jump
    // to a synthetic render on hover. Replace the resting image only together
    // with a re-rendered frame set.
    // 2026-08-16: description went inline (it previously borrowed the sliding
    // *window* type's text from PRODUCT_TYPES, which was a mismatch in scope).
    // The soft-close spec and description absorbed from the removed sc-door
    // product on this date.
    image: "/images/wp-export/slidingdoor.webp",
    specs: [
      "Multi-chamber uPVC profile with weather seals",
      "Space-saving horizontal slide",
      "Soft-close damper on the active leaf",
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
    // Client-approved RENDER (2026-08-12), not a photograph — hence render/,
    // not real/. ROADMAP item 20 / R4 record the client rejecting white-bg
    // renders in general; she approved this one specifically. The real-photo
    // ask in docs/AUG07_ASSET_REQUEST.md still stands.
    image: "/images/products/render/glass-railing.webp",
    specs: [
      "Tempered safety glass panels",
      "Frameless or minimal-frame hardware options",
      "Balcony, mezzanine, and terrace applications",
      "Project-specified height and mounting",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Grey", "Laminated Safety"],
  },
  // Replaces the removed `sc-door` product per client instruction 2026-08-16.
  // The sc-door ("Soft Closing Sliding Door") was a wrong product entry and has
  // been removed from the catalog; its useful soft-close copy folded into the
  // sliding-door entry below. This product, Sliding Casement Door, takes its
  // catalog slot and inherits its assets: the render, the 28-frame hover
  // animation, and the GLB were originally authored for "SC-Door System
  // (Sliding Casement Door)" (migration 019), i.e. this exact product.
  // Asset caveat (outstanding, not solved): the 28-frame animation shows only
  // the horizontal slide, NOT the casement pull-open swing. A real photograph
  // and a slide→swing frame set are still wanted from the client.
  {
    id: "sliding-casement-door",
    name: "Sliding Casement Door",
    category: "doors",
    description:
      "A door that works two ways from one leaf. It slides horizontally along its track to position, then opens as a casement — pull the handle and the leaf swings toward you the way a normal casement door does. Close it, and it slides back along the track. The sliding travel frees the floor space a swinging leaf would otherwise need, while the casement action gives a full, sealed opening when you want one. Suited to lanai access, main and secondary entries, and wide openings that should work both ways. Custom-specified per opening.",
    shortDescription: "Slides to position, then opens like a casement.",
    image: "/images/products/render/sliding-casement-door.webp",
    specs: [
      "Slide-then-swing operation from a single leaf",
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
    // Client-approved RENDER (2026-08-12), not a photograph — hence render/,
    // not real/. Supersedes the CG render 2e9f874 built off our own louvre GLB
    // (public/images/products/render/louvre.png, still produced by
    // `npm run tile:render -- --system louvre --open --finish charcoal-gray`),
    // swapped by client instruction. 2e9f874's caveat still holds and is worth
    // repeating: docs/ROADMAP.md:109 (item 20, "Use REAL project photography on
    // the cards, not synthetic 3D renders") and :452 ("Imie rejects the
    // white-bg renders") record the general rejection. She approved this
    // specific image, so it is the documented exception, not a reversal. The
    // photo ask in docs/AUG07_ASSET_REQUEST.md is still open.
    image: "/images/products/render/louvre.webp",
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
      "Motorised openers for windows that are hard to reach. Open and close a high or oversized sash from a wall switch, a remote, or your home automation system, so nobody needs a ladder or a pole. A good fit for stairwell windows, clerestory glazing, and tall living room openings. We match the opener and the power supply to your window during consultation.",
    shortDescription: "Open a high window without the ladder.",
    // Client-approved RENDER (2026-08-12), not a photograph — hence render/,
    // not real/. Same approved-exception status as glass-railing and louvre:
    // ROADMAP item 20 / R4 record the client rejecting white-bg renders in
    // general, and she approved this one specifically. The real-photo ask in
    // docs/AUG07_ASSET_REQUEST.md still stands.
    image: "/images/products/render/automated-window.webp",
    specs: [
      "Motorised opener for operable windows",
      "Wall switch, remote, or smart home control",
      "Suited to high, large, or hard to reach windows",
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
      "Keyless entry and powered opening for your doors. Get in with a keypad code, a card, a fob, or your phone, and add automatic opening where the door and frame allow it. A good fit for main entrances, offices, and shared lobbies where people arrive with their hands full. We match the lock, the power, and the controls to your door during consultation.",
    shortDescription: "Enter without a key. Close without a pull.",
    // Client-approved RENDER (2026-08-12), not a photograph — hence render/,
    // not real/. Same approved-exception status as automated-window above.
    image: "/images/products/render/automated-door.webp",
    specs: [
      "Keypad, card, fob, or phone access",
      "Powered opening for compatible doors",
      "Works with multi-point locking",
      "Suited to main entries and shared entrances",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Frosted Privacy", "Low-E Coated", "Laminated Safety"],
  },
  // ─── Aug 12 — two doors the catalog had no card for ───
  // F-S-S-S-S-F existed only as a DESIGN TOOL layout (configurator.ts id
  // `fixed-slide-slide-slide-slide-fixed`) and as handoff geometry. A shopper
  // browsing /products?filter=doors could not find it. Slim doors had neither
  // a card nor an image until the client supplied one.
  {
    id: "fixed-slide-door",
    name: "Fixed & Slide Door",
    category: "doors",
    description:
      "A wide glazed run in six panels: a fixed panel at each end, and four sliding panels in the middle that part from the centre. Opens most of the wall without a swinging leaf eating into the room, and closes to an even, continuous line of glass. A good fit for lanais, living rooms, and any wall you want to open onto a garden or a view. Panel widths and the overall opening are set for your space during consultation.",
    shortDescription: "Four panels slide. Two stay put.",
    // Client-approved RENDER (2026-08-12), not a photograph — hence render/,
    // not real/. Same approved-exception status as the automation pair above.
    image: "/images/products/render/fixed-slide-door.webp",
    // No opening width here on purpose. The 9 m default in the handoff geometry
    // is OUR engineering choice, not a confirmed product spec — printing it on
    // the card would be the site promising a size nobody with product authority
    // has signed off. See docs/MEETING_2026-08-12.md §6.
    specs: [
      "Six panels: fixed, four sliders, fixed",
      "Sliding panels part from the centre",
      "Fixed panels at both ends",
      "Full-height glazing across the run",
      "Panel widths set per opening",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Grey", "Laminated Safety"],
  },
  {
    id: "slim-door",
    name: "Slim Door",
    category: "doors",
    description:
      "Three glazed panels on a narrow frame. They slide to one side and stack together, so most of the run opens as a single clear span and the border almost disappears. Suited to living rooms, lanais, and any wall you want to open onto a garden or a view. Glass is chosen per opening: clear where light should pass through, privacy glass where it should not. Stacking side, glass, and finish are set during consultation.",
    shortDescription: "Three panels slide. The frame disappears.",
    // Frame 01 of the client's "3P SLIDING" clip (2026-09-03) — the same clip
    // the hover animation is imported from, so the card still and the resting
    // animation frame are the same picture.
    //
    // It replaced the Aug-12 render, and with it the swing claim that render
    // carried. MEETING_2026-08-12 §8 left the mechanism open; the Aug-12 render
    // answered "swing", and the client's own supplier clips answered "slide" —
    // first the "SlimDoor Chi" set behind SlimDoorSpotlight.tsx, which already
    // noted this entry contradicted them, and now this one. Two client sources
    // against one render, and the newer, so the catalogue moved to slide and
    // the page and the card finally agree.
    image: "/images/products/render/slim-door.webp",
    specs: [
      "Slim sightline frame",
      "Three sliding panels",
      "Panels stack to one side",
      "Full-height glazing",
      "Stacking side and finish set per opening",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Frosted Privacy", "Low-E Coated", "Laminated Safety"],
  },
];
