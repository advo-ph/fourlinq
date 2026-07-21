/**
 * The catalog taxonomy: the single model behind every navigation surface.
 *
 * FourlinQ browses on TWO ORTHOGONAL AXES. They are not one list.
 *
 *   By type      is what the opening IS:   Window / Door / Specialist
 *   By material  is what it is MADE FROM:  uPVC / Aluminium profile system
 *
 * Imie, 2026-07-02: "Aluminium is like uPVC, they are both profile systems.
 * Windows and doors can be fabricated using the following materials:
 * 1. uPVC profile system  2. Aluminium profile system (a. non-thermal or
 * regular aluminium system  b. thermal break aluminium system)."
 *
 * This is why the 2026-07-05 build was rejected ("It's not according to
 * intended layout of the site 😭"). It shipped an "Aluminium Line" card as a
 * fourth peer beside Window/Door/Specialist, which reads as a fourth TYPE.
 * Aluminium is not a type. It is the other axis.
 *
 * Every surface (desktop nav, mobile nav, homepage gateway, /products, and
 * the footer) imports from here. Before this module those four surfaces
 * showed three different models (nav had 4 mixed peers, homepage had 3 types
 * and no material at all, footer had 3 types under different labels).
 * src/test/taxonomy.test.ts fails on drift.
 */

export type SystemTypeCode = "window" | "door" | "specialist";
export type MaterialCode = "upvc" | "aluminium";

/**
 * Query value in `/products?filter=…`, which is also `Product.category`.
 *
 * Plural, against the singular house rule, because it is a published URL
 * contract: `/products?filter=windows` is live, App.tsx redirects
 * `/products/windows` onto it, and the API returns `category: "windows"`.
 * Renaming it means a redirect and a data migration, so it stays plural until
 * something else forces the change.
 */
export type TypeFilter = "windows" | "doors" | "specialist";

export interface SystemType {
  type_code: SystemTypeCode;
  label: string;
  description: string;
  /** The named systems inside this type. */
  item: string[];
  filter: TypeFilter;
  to: string;
  image: string;
}

export interface ProfileMaterial {
  material_code: MaterialCode;
  label: string;
  description: string;
  /** For aluminium, the sub-systems. For uPVC, the profile brands. */
  item: string[];
  to: string;
  image: string;
}

// ─────────────────────────────────────────────
// AXIS 1: BY TYPE
// Source: Imie's 2026-07-02 diagram (attachments/photo_2026-07-02_14-20-32.jpg),
// minus the "Aluminium Line" card, which belongs to axis 2.
// ─────────────────────────────────────────────

export const SYSTEM_TYPE: SystemType[] = [
  {
    type_code: "window",
    label: "Window Systems",
    description:
      "uPVC and aluminium windows engineered for tropical performance: quiet, thermally efficient, corrosion-free.",
    item: ["Casement", "Sliding", "Awning", "Special Shapes"],
    filter: "windows",
    to: "/products?filter=windows",
    image: "/images/wp-export/FQC-Project-17.jpg",
  },
  {
    type_code: "door",
    label: "Door Systems",
    description:
      "From folding walls to large-span panels: doors that open a room to the outside.",
    item: ["Slide & Fold", "Large Panel", "Lift & Slide", "90 Series"],
    filter: "doors",
    to: "/products?filter=doors",
    // Real FourlinQ install, client-supplied 2026-07-17. A corner sliding-door
    // set with the panels visibly offset on their track. It reads as sliding
    // at a glance, which is what Imie said the synthetic render never did
    // ("this is your sliding door but it looks like a two-panel fixed",
    // 2026-05-28). Safe here: category cards carry no frame animation, and the
    // card makes no location claim (these files have no EXIF or place data).
    image: "/images/products/real/sliding-door.webp",
  },
  {
    type_code: "specialist",
    label: "Specialist Systems",
    description:
      "Custom geometry to architect drawings: arches, curtain walls, bespoke shapes.",
    item: ["Arch", "Curtain Wall", "Custom Shapes"],
    filter: "specialist",
    to: "/products?filter=specialist",
    image: "/images/wp-export/FourlinQ-Project-8.jpg",
  },
];

// ─────────────────────────────────────────────
// AXIS 2: BY MATERIAL
// Source: Imie 2026-05-31 (uPVC brands + aluminium wall thickness) and
// 2026-07-02 (the non-thermal / thermal-break split).
//
// TERMINOLOGY NOTE, unresolved, do not paper over:
// Imie named the same aluminium system twice. On 05-31 it was "Standard /
// Regular Systems (wall thickness 1.2mm to 3.0mm)"; on 07-02 and in her diagram
// it was "Non-Thermal Break". We publish "Non-Thermal Break" (her latest and
// the diagram's word) and carry "Regular" as the stated synonym, so a client
// searching either term lands in the right place. Confirming this pairing is
// roadmap item RM1 (product master + glossary).
// ─────────────────────────────────────────────

export const PROFILE_MATERIAL: ProfileMaterial[] = [
  {
    material_code: "upvc",
    label: "uPVC profile system",
    description:
      "The default for most residential openings. Multi-chamber profile, steel-reinforced, corrosion-free.",
    item: ["Veka: German profile", "Skyframe: Chinese profile"],
    to: "/why-upvc",
    image: "/images/wp-export/FourlinQ-Project-7.jpg",
  },
  {
    material_code: "aluminium",
    label: "Aluminium profile system",
    description:
      "For bigger spans, thinner sightlines, and thermal control where uPVC is not enough.",
    item: [
      "Thermal Break",
      "Non-Thermal Break (Regular)",
      "Alu Slim",
    ],
    to: "/aluminium",
    image: "/images/brand-story.jpg",
  },
];

// ─────────────────────────────────────────────
// MATERIAL AXIS, FLATTENED FOR NAVIGATION
// A presentation view of PROFILE_MATERIAL that gives every material system its
// own tile: uPVC plus the three aluminium subsystems (thermal break,
// non-thermal break, slim). The three aluminium tiles all point at /aluminium,
// so nothing here reads as a fourth *type* — this stays on the material axis.
// Used by the header's 2x2 "By material" grid.
// ─────────────────────────────────────────────

export interface MaterialTile {
  label: string;
  to: string;
  /** The "best for" one-liner rendered as the button subtitle in the nav. */
  bestFor: string;
}

export const MATERIAL_TILE: MaterialTile[] = [
  {
    label: "uPVC",
    to: "/why-upvc",
    bestFor: "Everyday windows & doors",
  },
  {
    label: "Aluminium Thermal Break",
    to: "/aluminium",
    bestFor: "Large spans, thermal comfort",
  },
  {
    label: "Non-Thermal Break",
    to: "/aluminium",
    bestFor: "Wide openings, value pick",
  },
  {
    label: "Aluminium Slim",
    to: "/aluminium",
    bestFor: "Slim sightlines, max glass",
  },
];

/** Look up a type by its `?filter=` query value (also its Product.category). */
export function findTypeByFilter(filter: string): SystemType | undefined {
  return SYSTEM_TYPE.find((t) => t.filter === filter);
}
