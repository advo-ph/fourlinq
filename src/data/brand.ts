// Re-exports verified brand data from the canonical source
// Source: Official FourlinQ brochures — see fourlinq-data.ts
import { BRAND, CONTACT, BRANCHES } from "./fourlinq-data";
import type { Branch } from "./fourlinq-data";

export { BRAND, CONTACT, BRANCHES };
export type { Branch };

// Warranty scope items used as "certification-style" badges on the Brand page
export interface Certification {
  name: string;
  icon: string;
}

export const certifications: Certification[] = [
  { name: BRAND.warranty, icon: "shield-check" },
  ...BRAND.warrantyScope.map((scope) => {
    const iconMap: Record<string, string> = {
      "Corrosion resistance": "shield",
      "Long lasting performance": "clock",
      "Weather resistance": "cloud-rain",
      "Sound insulation": "volume-x",
    };
    return { name: scope, icon: iconMap[scope] || "badge-check" };
  }),
];

export const brandStory = {
  headline: BRAND.promise,
  tagline: BRAND.tagline,
  heroQuote: BRAND.heroQuote,
  promiseSupport: BRAND.promiseSupport,
};
