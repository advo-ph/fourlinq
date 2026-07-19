// Public catalog orientation data.
//
// Product names and images are approved repository inputs. The public source
// does not establish a universal profile, glass, hardware, finish, size,
// rating, or availability matrix for these names. Keep every entry bounded and
// require written FourlinQ confirmation for the proposed opening.

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
  /** Optional client-supplied YouTube reference for the operating concept. */
  youtubeId?: string;
}

const confirmationSpec = [
  "Confirm the exact material, profile, operation, glass, hardware, finish, dimensions, ratings, availability, and price for the proposed opening.",
];

const noFinish: ProductFinish[] = [];
const noGlassOption: string[] = [];

export const products: Product[] = [
  {
    id: "casement",
    name: "Casement",
    category: "windows",
    description: "A side-hinged, outward-opening window catalog entry. The exact assembly and opening direction are project-specific.",
    shortDescription: "Side-hinged outward-opening window.",
    image: "/images/wp-export/casement.webp",
    specs: ["Operation name: casement", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "sliding",
    name: "Sliding",
    category: "windows",
    description: "A horizontally sliding window catalog entry. Track, panel, locking, and drainage details require confirmation for the proposed system.",
    shortDescription: "Horizontal sliding-window operation.",
    image: "/images/wp-export/slidingwindow.webp",
    specs: ["Operation name: sliding window", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "special-shapes",
    name: "Special Shapes",
    category: "windows",
    description: "A catalog path for non-rectangular window concepts. Geometry, material, glass, reinforcement, and fabrication feasibility require project review.",
    shortDescription: "Non-rectangular window concepts.",
    image: "/images/wp-export/specialshapes.webp",
    specs: ["Catalog path: special-shape window", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "awning",
    name: "Awning",
    category: "windows",
    description: "A top-hinged, outward-opening window catalog entry. Opening limit, hardware, drainage, and weather performance require confirmation.",
    shortDescription: "Top-hinged outward-opening window.",
    image: "/images/wp-export/awning.webp",
    specs: ["Operation name: awning", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "sliding-door",
    name: "Sliding Door",
    category: "doors",
    description: "A horizontally sliding door catalog entry. Panel count, track, threshold, locking, seal, and opening limits are not universal.",
    shortDescription: "Horizontal sliding-door operation.",
    image: "/images/wp-export/slidingdoor.webp",
    specs: ["Operation name: sliding door", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "slide-and-fold",
    name: "Slide & Fold",
    category: "doors",
    description: "A folding-door catalog entry in which connected panels can stack toward one side. Exact panel count, track, threshold, hardware, and fabrication limit require confirmation.",
    shortDescription: "Folding and stacking door concept.",
    image: "/images/wp-export/slideandfold.webp",
    youtubeId: "-8XwIKAtAAc",
    specs: ["Operation name: slide and fold", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "casement-door",
    name: "Casement Door",
    category: "doors",
    description: "A side-hinged door catalog entry. Leaf count, swing, threshold, locking, reinforcement, and hardware require confirmation.",
    shortDescription: "Side-hinged door operation.",
    image: "/images/wp-export/casement-door.webp",
    specs: ["Operation name: casement door", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "french-door",
    name: "French Sliding Door",
    category: "doors",
    description: "A client-supplied catalog name for a sliding-door concept with a French-style grid shown in the product image. Exact panel configuration and hardware require confirmation.",
    shortDescription: "French-style grid with sliding operation.",
    image: "/images/wp-export/frenchdoor.webp",
    specs: ["Catalog name: French Sliding Door", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "large-panel-doors",
    name: "Large Panel Doors",
    category: "doors",
    description: "A client-supplied catalog name for a large-panel door concept. The public source does not publish a universal panel count, span, weight, section, or performance rating.",
    shortDescription: "Large-panel door concept; limits unconfirmed.",
    image: "/images/wp-export/largepanel.webp",
    specs: ["Catalog name: Large Panel Doors", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "lift-and-slide",
    name: "Lift & Slide",
    category: "doors",
    description: "A client-supplied lift-and-slide door catalog name. Exact mechanism, panel configuration, seals, hardware, weight, and opening limit require confirmation.",
    shortDescription: "Lift-and-slide door concept.",
    image: "/images/wp-export/liftandslide.webp",
    specs: ["Catalog name: Lift & Slide", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "90-series",
    name: "90 Series",
    category: "doors",
    description: "A client-supplied door-series name. The name alone does not establish a section dimension, panel count, material, hardware, rating, or compatible option.",
    shortDescription: "Client-supplied door-series name.",
    image: "/images/wp-export/90series.webp",
    specs: ["Catalog name: 90 Series", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "arch-shapes",
    name: "Arch Shapes",
    category: "specialist",
    description: "A catalog path for curved window or door concepts. Exact arc, material, reinforcement, glass, and fabrication feasibility require drawings and project review.",
    shortDescription: "Curved opening concepts; feasibility unconfirmed.",
    image: "/images/wp-export/archshapes.webp",
    specs: ["Catalog path: arch shape", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "curtain-wall",
    name: "Curtain Wall",
    category: "specialist",
    description: "A specialist catalog path for a glazed-facade concept. Structural role, section, anchors, drainage, glass, loads, ratings, and responsibility require project-specific engineering evidence.",
    shortDescription: "Glazed-facade concept; engineering required.",
    image: "/images/wp-export/curtainwall2.png",
    specs: ["Catalog path: curtain wall", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
  {
    id: "custom-shapes",
    name: "Custom Shapes",
    category: "specialist",
    description: "A catalog path for non-standard opening geometry. FourlinQ must review the drawing and confirm material, profile, glass, reinforcement, fabrication, and installation feasibility.",
    shortDescription: "Non-standard geometry; project review required.",
    image: "/images/wp-export/customshapes.webp",
    specs: ["Catalog path: custom shape", ...confirmationSpec],
    finishes: noFinish,
    glassOptions: noGlassOption,
  },
];
