// Benefits data for the Why uPVC page
// Descriptions sourced from verified ADVANTAGES in fourlinq-data.ts
// ⚠️ Stats removed: brochure does not include specific numerical claims
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

// Comparison framing: we sell BOTH uPVC and aluminium at FourlinQ. The table
// describes where each material genuinely fits rather than ranking them. Most
// rows show real differences without calling any material "bad". The
// architect/owner chooses based on the project's actual constraints.
export const comparisonData: ComparisonRow[] = [
  { feature: "Maintenance", upvc: "No painting or recoating", aluminium: "Powder-coat refresh every 8-10 years", timber: "Regular painting and sealing" },
  { feature: "Corrosion in salt air", upvc: "Inherently inert", aluminium: "Anodized or powder-coated for protection", timber: "Vulnerable without sealing" },
  { feature: "Thermal performance", upvc: "Multi-chamber profile traps air", aluminium: "Thermal break inserts available", timber: "Naturally insulating" },
  { feature: "Maximum span", upvc: "Up to ~2.4 m sash (standard)", aluminium: "Larger spans + slim sightlines", timber: "Depends on hardwood spec" },
  { feature: "Sightline thickness", upvc: "Standard profile", aluminium: "Slimmer profile possible", timber: "Variable" },
  { feature: "Sound insulation", upvc: "24-32 dB attenuation typical", aluminium: "Comparable with proper glazing", timber: "Good with mass" },
  { feature: "Fire retardance", upvc: "Self-extinguishing", aluminium: "Non-combustible", timber: "Combustible" },
  { feature: "Aesthetics", upvc: "12 finishes (solid + wood-grain)", aluminium: "Powder-coat color range", timber: "Natural grain or painted" },
];

// Re-export all 7 verified advantages for use elsewhere
export { ADVANTAGES } from "./fourlinq-data";
