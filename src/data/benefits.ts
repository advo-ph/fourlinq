// Benefits data for the Why uPVC page
// Descriptions sourced from verified ADVANTAGES in fourlinq-data.ts
// ⚠️ Stats removed — brochure does not include specific numerical claims
import { ADVANTAGES } from "./fourlinq-data";

export interface Benefit {
  id: string;
  title: string;
  shortDescription: string;
  icon: string;
}

// All 7 verified advantages mapped to benefit cards
export const benefits: Benefit[] = ADVANTAGES.map((a) => ({
  id: a.id,
  title: a.label,
  shortDescription: a.description,
  icon: a.icon,
}));

export interface ComparisonRow {
  feature: string;
  upvc: string;
  aluminium: string;
  timber: string;
}

// Source-bounded comparison. It intentionally avoids unpublished performance,
// maintenance, span, acoustic, color-life, and fire-rating numbers.
export const comparisonData: ComparisonRow[] = [
  { feature: "Published profile families", upvc: "Veka and Skyframe", aluminium: "Standard / Regular and Alu Slim", timber: "Not sold by FourlinQ" },
  { feature: "Published finish library", upvc: "12 entries: 5 solid + 7 wood-grain", aluminium: "4 client-supplied powder-coat colors", timber: "Not published" },
  { feature: "Public material description", upvc: "Multi-chamber profile with brochure-listed reinforcement, gasket, drainage, and glazing features", aluminium: "Client lists regular, thermal-break, non-thermal-break, and slim system names", timber: "Not evaluated on this site" },
  { feature: "Compatibility and size", upvc: "Confirm for the selected product and opening", aluminium: "Confirm for the selected product and opening", timber: "Outside the FourlinQ catalog" },
  { feature: "Technical evidence", upvc: "Request the exact profile, glass, hardware, ratings, and warranty terms", aluminium: "Request the exact profile, glass, hardware, ratings, and warranty terms", timber: "Request from the selected timber supplier" },
];

// Re-export all 7 verified advantages for use elsewhere
export { ADVANTAGES } from "./fourlinq-data";
