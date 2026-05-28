// Product catalog for the Products page
// Descriptions and taglines sourced from verified PRODUCT_TYPES in fourlinq-data.ts
// ⚠️ Specs (mm profile sizes, Uw values) are NOT in brochure — marked as indicative
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
    image: "/images/wp-export/casement.jpeg",
    specs: [
      "Multi-chamber uPVC profile",
      "6mm–12mm glass options",
      "Galvanized steel reinforcement",
      "EPDM gaskets — weatherproof seal",
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
    image: "/images/wp-export/slidingwindow.png",
    specs: [
      "Multi-chamber uPVC profile",
      "Smooth horizontal track operation",
      "6mm–12mm glass options",
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
    image: "/images/wp-export/specialshapes.jpeg",
    specs: [
      "Custom geometry — arches, circles, triangles",
      "Combinable with other window types",
      "6mm–12mm glass options",
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
    image: "/images/wp-export/awning.jpeg",
    specs: [
      "Top-hinged, opens outward",
      "Ventilation even during rain",
      "Multi-chamber uPVC profile",
      "EPDM gaskets — weatherproof seal",
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
    image: "/images/wp-export/slidingdoor.jpeg",
    specs: [
      "Multi-chamber uPVC profile",
      "Space-saving horizontal slide",
      "6mm–12mm glass options",
      "Galvanized steel reinforcement",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Grey", "Laminated Safety"],
  },
  {
    id: "slide-and-fold",
    name: "Slide & Fold",
    category: "doors",
    description: PRODUCT_TYPES.find((p) => p.id === "slide-and-fold")!.description,
    shortDescription: PRODUCT_TYPES.find((p) => p.id === "slide-and-fold")!.tagline,
    image: "/images/wp-export/slideandfold.jpeg",
    specs: [
      "Multi-panel folding system",
      "Full wall opening capability",
      "Multi-chamber uPVC profile",
      "Galvanized steel reinforcement",
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
    image: "/images/wp-export/casement-door.jpeg",
    specs: [
      "Multi-chamber reinforced profile",
      "Galvanized steel core",
      "Multi-point locking",
      "EPDM gaskets — weatherproof seal",
    ],
    finishes: productFinishes,
    glassOptions: ["Frosted Privacy", "Clear Float", "Laminated Safety"],
  },
  {
    id: "french-door",
    name: "French Door",
    category: "doors",
    description:
      "Double-leaf door system with multi-point locking. Multi-chamber uPVC profile with galvanized steel reinforcement for security and weather resistance.",
    shortDescription: "Classic double-leaf doors with multi-point locking.",
    image: "/images/wp-export/frenchdoor.jpeg",
    specs: [
      "Double-leaf configuration",
      "Multi-point locking system",
      "Multi-chamber uPVC profile",
      "EPDM gaskets — weatherproof seal",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Frosted Privacy", "Laminated Safety"],
  },
  // ─── Tita-requested Door Systems (consultation-only — no fabricated specs) ───
  {
    id: "large-panel-doors",
    name: "Large Panel Doors",
    category: "doors",
    description:
      "Large-format panel doors engineered for openings up to 6 metres wide. Built for ground-floor living rooms and lanai-facing walls where the door itself becomes part of the architecture. Custom-specified per project.",
    shortDescription: "Door openings up to 6 metres wide.",
    image: "/images/wp-export/largepanel.png",
    specs: [
      "Spans up to 6 metres wide",
      "Multi-chamber reinforced profile",
      "Custom specification per project",
      "Consultation required for sizing and hardware",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Bronze", "Laminated Safety"],
  },
  {
    id: "lift-and-slide",
    name: "Lift & Slide",
    category: "doors",
    description:
      "Lift-and-slide door system. The panel lifts off its seal to slide effortlessly along the track, then settles back onto the seal when closed for a fully weather-tight finish. Ideal for large openings where smooth daily operation matters.",
    shortDescription: "Effortless operation on large openings.",
    image: "/images/wp-export/liftandslide.jpeg",
    specs: [
      "Lift mechanism for low-effort operation",
      "Weather-tight closed-position seal",
      "Multi-chamber uPVC profile",
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
      "FourlinQ 90 Series door system — engineered for premium residential applications where performance and finish matter. Custom-specified profile family.",
    shortDescription: "Premium residential door system.",
    image: "/images/wp-export/90series.jpeg",
    specs: [
      "90 Series profile family",
      "Multi-chamber reinforced profile",
      "Galvanized steel reinforcement",
      "Consultation required for specifications",
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
    image: "/images/wp-export/archshapes.png",
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
      "Curtain wall systems — large-format glazed wall assemblies for commercial and high-end residential projects. Engineered for the Philippine climate, with multi-storey applications supported. Consultation required.",
    shortDescription: "Large-format glazed wall assemblies.",
    image: "/images/wp-export/curtainwall.png",
    specs: [
      "Multi-storey applications",
      "Engineered for tropical climate",
      "Custom panel sizing",
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
      "Non-standard panel geometries — triangles, trapezoids, hexagons, and full bespoke shapes. Designed to architect drawings, fabricated in our workshop. The panels that other manufacturers say can't be done.",
    shortDescription: "Bespoke geometry to architect drawings.",
    image: "/images/wp-export/customshapes.png",
    specs: [
      "Architect-drawn geometry",
      "Workshop-fabricated",
      "Multi-chamber uPVC profile",
      "Project consultation required",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Low-E Coated", "Tinted Bronze", "Laminated Safety"],
  },
];
