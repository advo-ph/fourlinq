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

export const comparisonData: ComparisonRow[] = [
  { feature: "Maintenance", upvc: "None required", aluminium: "Periodic re-coating", timber: "Regular painting/sealing" },
  { feature: "Corrosion Resistance", upvc: "Excellent — never rusts", aluminium: "Good (risk in salt air)", timber: "Poor (rot/warp risk)" },
  { feature: "Thermal Performance", upvc: "Excellent — multi-chamber", aluminium: "Poor (conducts heat)", timber: "Good" },
  { feature: "Weather Resistance", upvc: "Excellent — EPDM sealed", aluminium: "Good", timber: "Poor" },
  { feature: "Sound Insulation", upvc: "Excellent — 6–12mm glass", aluminium: "Moderate", timber: "Good" },
  { feature: "Fire Retardance", upvc: "Inherently fire retardant", aluminium: "Non-combustible", timber: "Combustible" },
  { feature: "Aesthetics", upvc: "11 finishes (solid + wood-grain)", aluminium: "Powder-coat options", timber: "Natural/painted" },
  { feature: "Warranty", upvc: "10-Year Warranty", aluminium: "Varies", timber: "Varies" },
];

// Re-export all 7 verified advantages for use elsewhere
export { ADVANTAGES } from "./fourlinq-data";
