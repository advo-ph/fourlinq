/**
 * FAQ content for the public FAQ page.
 *
 * Brochure-verified only. Anything that was previously cross-referenced from
 * the old migration 004 KB seed (lead times, "5-year hardware + 2-year glass"
 * warranty, "marine-grade stainless hardware", "25-year UV stabilizers",
 * "signal-5 typhoon thresholds", "national shipping") has been removed or
 * replaced with a contact-sales call to action, per the brochure-only memory.
 *
 * To add a new claim: confirm it's in the brochure or get Tita's explicit
 * sign-off. Update src/data/faq.ts, then run on the VPS:
 *   cd /opt/fourlinq && npx tsx server/scripts/seed-site-knowledge.ts
 *   npx tsx server/scripts/seed-embeddings.ts
 */

export type FAQCategory = "products" | "material" | "ordering" | "install" | "warranty" | "care";

export interface FAQEntry {
  q: string;
  a: string;
  category: FAQCategory;
}

export const faqAnchor = (question: string) =>
  `faq-${question.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

export const FAQ_CATEGORIES: { id: FAQCategory; label: string }[] = [
  { id: "products", label: "Products & Systems" },
  { id: "material", label: "uPVC & Materials" },
  { id: "ordering", label: "Ordering" },
  { id: "install", label: "Installation" },
  { id: "warranty", label: "Warranty" },
  { id: "care", label: "Care & Maintenance" },
];

export const FAQ: FAQEntry[] = [
  // ── Products & Systems ─────────────────────────────
  {
    category: "products",
    q: "What systems do you offer?",
    a: "The current catalog groups window, door, and specialist systems, with uPVC and aluminium shown as profile-material options. Not every product, material, glass, finish, or size combination is automatically compatible. Browse /products, then ask FourlinQ to confirm the exact combination for your opening.",
  },
  {
    category: "products",
    q: "What's the difference between Casement, Awning, and Sliding?",
    a: "Casement windows hinge on one side and open outward. Awning windows hinge at the top and open outward. Sliding windows move horizontally on a track. Those operation names do not establish a specific profile, opening limit, water rating, glass, hardware, or project suitability; ask FourlinQ to confirm the proposed assembly.",
  },
  {
    category: "products",
    q: "Can you do custom shapes — arches, trapezoids?",
    a: "The catalog includes special-shape geometries such as arches, circles, trapezoids, and triangles. Send architectural drawings to 0925-848-8888 or sales@fourlinq.com so FourlinQ can confirm whether the requested geometry can be fabricated.",
  },
  {
    category: "products",
    q: "How many finishes are available?",
    a: "The verified uPVC sample library contains 12 entries: 7 wood-grain (Oak Light, Oak Malt, Black Wood, Gray Wood, Dark Oak, Walnut, Golden Oak) and 5 solid colors (White, Jet Black, Charcoal Gray, Matte Quartz, Silica Cream). Browse /finishes, then confirm physical sample, profile compatibility, and current availability.",
  },

  // ── uPVC & Materials ──────────────────────────────
  {
    category: "material",
    q: "What is uPVC and why is it better for the Philippines?",
    a: "uPVC means unplasticized polyvinyl chloride. FourlinQ's brochure lists multi-chamber construction, galvanized-steel reinforcement, internal glazing beads, EPDM gaskets, drainage holes, and 6–12 mm glass among its profile notes. Those general brochure statements are not a system-specific fire, thermal, acoustic, wind, or water rating.",
  },
  {
    category: "material",
    q: "Will uPVC fade in the tropical sun?",
    a: "The brochure describes the uPVC profile as corrosion resistant and lists long-lasting performance and weather resistance in its 10-Year Limited Warranty summary. It does not state a finish-specific fade threshold here. Ask sales about the exact finish and request the current warranty terms before ordering.",
  },
  {
    category: "material",
    q: "How does FourlinQ handle storm conditions?",
    a: "The brochure lists galvanized-steel reinforcement, EPDM gaskets for air and water tightness, drainage holes, and weather resistance in its limited-warranty summary. It does not publish a system-specific storm, wind, or water rating here. Ask for evidence tied to the exact proposed profile, glass, hardware, size, and installation.",
  },
  {
    category: "material",
    q: "uPVC vs Aluminium — which should I choose?",
    a: "FourlinQ lists Veka and Skyframe uPVC profile names, plus Regular, Thermal Break, Non-Thermal Break, and Alu Slim aluminium names across its client-supplied material records. The Design Tool is a visual starting point, not a compatibility or performance check. FourlinQ must identify the exact profile and evidence for your opening.",
  },

  // ── Ordering ──────────────────────────────────────
  {
    category: "ordering",
    q: "How do I get a quote?",
    a: "Use /design-tool to send a visual brief, request a quote from a system page, or contact sales at 0925-848-8888 or sales@fourlinq.com. A submitted configuration is not itself a quotation; FourlinQ reviews the project before confirming price and feasibility.",
  },
  {
    category: "ordering",
    q: "How much do FourlinQ systems cost?",
    a: "Pricing is custom per project, and the site does not publish a list price. Send the opening details through a quote request or contact sales at 0925-848-8888 or sales@fourlinq.com for a project-specific response.",
  },
  {
    category: "ordering",
    q: "Where can I see your products in person?",
    a: "The verified location list includes Ortigas at CW Home Depot in Pasig, Alabang at CW Home Depot in Westgate Alabang, and the Cebu branch at Centro Fortuna Building in Mandaue. Call 0925-896-5978 to confirm visiting arrangements before you travel.",
  },
  {
    category: "ordering",
    q: "Can you do projects outside Metro Manila and Cebu?",
    a: "The published location list contains Ortigas, Alabang, and Cebu. It does not establish a national delivery or installation network. For any project location, contact sales to confirm current coverage: 0925-848-8888 or sales@fourlinq.com.",
  },

  // ── Installation ───────────────────────────────────
  {
    category: "install",
    q: "Do you handle installation?",
    a: "Installation scope is project-specific. Ask sales at 0925-848-8888 or sales@fourlinq.com to confirm what is included in your written quotation.",
  },
  {
    category: "install",
    q: "What's the install process?",
    a: "The site does not publish one guaranteed project sequence or lead time. FourlinQ should document measurement, approval, fabrication, delivery, installation, and handover responsibilities in the quotation for your specific project.",
  },

  // ── Warranty ───────────────────────────────────────
  {
    category: "warranty",
    q: "What does the warranty cover?",
    a: "The verified brochure states a 10-Year Limited Warranty and lists corrosion resistance, long-lasting performance, weather resistance, and sound insulation. That summary is not the complete legal warranty. Ask for the current written terms and read them before ordering.",
  },
  {
    category: "warranty",
    q: "What's not covered?",
    a: "The brochure summary available to this site does not list the full exclusions. Only the current written warranty can answer this accurately. Request it from FourlinQ and confirm any project-specific conditions before ordering.",
  },

  // ── Care & Maintenance ─────────────────────────────
  {
    category: "care",
    q: "How do I clean uPVC frames?",
    a: "Use a soft cloth and mild soapy water for routine surface cleaning, then ask FourlinQ for the current finish-specific care instructions before using stronger cleaners. Do not assume a solvent or abrasive is safe for a particular finish.",
  },
  {
    category: "care",
    q: "How do I maintain the hardware?",
    a: "Keep tracks clear of loose debris, but ask FourlinQ for the hardware maker's current service guidance before applying lubricant or adjusting a mechanism. The required interval and product can vary by installed hardware.",
  },
];
