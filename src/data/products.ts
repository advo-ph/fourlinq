// Product catalog for the Products page
// Descriptions and taglines sourced from verified PRODUCT_TYPES in fourlinq-data.ts
// ⚠️ Specs (mm profile sizes, Uw values) are NOT in brochure — marked as indicative
import { PRODUCT_TYPES, FRAME_FINISHES } from "./fourlinq-data";

export type ProductCategory = "windows" | "doors" | "systems";

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
    image: "/images/wp-export/Casement-Window.jpg",
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
    image: "/images/wp-export/Sliding-Window.jpg",
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
    image: "/images/wp-export/Windows.jpg",
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
    image: "/images/wp-export/Casement-Window.jpg",
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
    image: "/images/wp-export/Sliding-Door.jpg",
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
    image: "/images/wp-export/Slide-and-Fold.jpg",
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
    id: "entrance-door",
    name: "Entrance Door",
    category: "doors",
    description:
      "Reinforced uPVC entrance door combining aesthetic versatility with the security demands of main entry points. Multi-chamber profile with galvanized steel reinforcement.",
    shortDescription: "Secure and elegant main entry doors.",
    image: "/images/wp-export/Door-5.jpg",
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
    image: "/images/wp-export/Door-1.jpg",
    specs: [
      "Double-leaf configuration",
      "Multi-point locking system",
      "Multi-chamber uPVC profile",
      "EPDM gaskets — weatherproof seal",
    ],
    finishes: productFinishes,
    glassOptions: ["Clear Float", "Frosted Privacy", "Laminated Safety"],
  },
];
