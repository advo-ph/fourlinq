// Re-exports verified brand data from the canonical source
// Source: Official FourlinQ brochures — see fourlinq-data.ts
import { BRAND, CONTACT, BRANCHES, phoneHref } from "./fourlinq-data";
import type { Branch } from "./fourlinq-data";

export { BRAND, CONTACT, BRANCHES, phoneHref };
export type { Branch };

// Brochure-stated warranty scope shown on the Brand page. These are not
// third-party certifications or engineering standards.
export interface BrandEvidence {
  name: string;
}

export const brandEvidence: BrandEvidence[] = [
  { name: BRAND.warranty },
  ...BRAND.warrantyScope.map((scope) => ({ name: scope })),
];

export const brandStory = {
  headline: BRAND.promise,
  tagline: BRAND.tagline,
  heroQuote: BRAND.heroQuote,
  promiseSupport: BRAND.promiseSupport,
};
