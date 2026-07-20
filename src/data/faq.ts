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
    a: "Five system types, each custom-made to your specifications: Casement, Sliding, Awning, Special Shapes, and Slide & Fold. All are available in uPVC, with Aluminium as an alternate material for certain frames. Detailed specs live on the Products page (/products).",
  },
  {
    category: "products",
    q: "What's the difference between Casement, Awning, and Sliding?",
    a: "Casement windows hinge on one side and open outward for maximum ventilation and easy cleaning. Awnings hinge at the top and open outward, so they let in light and air even during rain. Sliding windows move horizontally along a track, ideal where outward clearance is tight, like balconies or above kitchen counters.",
  },
  {
    category: "products",
    q: "Can you do custom shapes like arches or trapezoids?",
    a: "Yes. Our Special Shapes system supports fully custom geometry, including arch-tops, circles, trapezoids, and triangles. Often combined with other system types to create a dramatic feature wall of glass. Send us your architectural drawings via 0925-848-8888 or sales@fourlinq.com and we'll quote against them.",
  },
  {
    category: "products",
    q: "How many finishes are available?",
    a: "12 finishes total: 7 wood-grain (Oak Light, Oak Malt, Black Wood, Gray Wood, Dark Oak, Walnut, Golden Oak) and 5 solid colors (White, Jet Black, Charcoal Gray, Matte Quartz, Silica Cream). Browse the full set on /finishes or in the Design Tool (/design-tool).",
  },

  // ── uPVC & Materials ──────────────────────────────
  {
    category: "material",
    q: "What is uPVC and why is it better for the Philippines?",
    a: "uPVC is unplasticized polyvinyl chloride, a rigid polymer profile that won't rust, rot, warp, or corrode. Our profiles are fire retardant, thermally efficient (multi-chamber design), corrosion resistant, and sound insulating, well-suited to the Philippine climate.",
  },
  {
    category: "material",
    q: "Will uPVC fade in the tropical sun?",
    a: "Our uPVC profiles are engineered for tropical use and are corrosion resistant. The 10-Year Limited Warranty covers long lasting performance and weather resistance. For specific color-stability questions about a particular finish, contact our sales team at 0925-848-8888 or sales@fourlinq.com.",
  },
  {
    category: "material",
    q: "How does FourlinQ handle storm conditions?",
    a: "Our profiles use galvanized steel reinforcement where structural strength is needed, EPDM gaskets for air and water tightness, and drainage holes for proper drainage. Weather resistance is one of the four areas covered by our 10-Year Limited Warranty.",
  },
  {
    category: "material",
    q: "uPVC vs Aluminium: which should I choose?",
    a: "We offer both. uPVC is the better thermal insulator (cooler interiors), sound insulator, and is fire retardant. Aluminium has slimmer sightlines for a more minimal look and suits very large spans. Use the Design Tool (/design-tool) to compare configurations, or visit any of our three showrooms for a hands-on look.",
  },

  // ── Ordering ──────────────────────────────────────
  {
    category: "ordering",
    q: "How do I get a quote?",
    a: "Three ways. (1) Use the Design Tool (/design-tool) to configure a system and we reply with a tailored quote. (2) Request a Quote from any system's detail page. (3) Visit a showroom (Pasig, Alabang, or Cebu) and we'll measure and quote on site. You can also reach sales directly at 0925-848-8888 or sales@fourlinq.com.",
  },
  {
    category: "ordering",
    q: "How much do FourlinQ systems cost?",
    a: "Pricing is custom per project. Every order is made to your specifications. We don't publish list prices. Request a free quote and we'll get back to you with a number. Contact sales: 0925-848-8888 or sales@fourlinq.com.",
  },
  {
    category: "ordering",
    q: "Where can I see your products in person?",
    a: "We have three showrooms: Ortigas (CW Home Depot, Pasig), Alabang (CW Home Depot, Westgate Alabang), and Cebu (Centro Fortuna Building, Banilad, Mandaue). Call the assistance line at 0925-896-5978 to schedule a visit.",
  },
  {
    category: "ordering",
    q: "Can you do projects outside Metro Manila and Cebu?",
    a: "Our showrooms are in Metro Manila and Cebu. For projects outside those regions, contact sales to confirm coverage: 0925-848-8888 or sales@fourlinq.com.",
  },

  // ── Installation ───────────────────────────────────
  {
    category: "install",
    q: "Do you handle installation?",
    a: "Yes. Installation is part of the FourlinQ service. Contact sales at 0925-848-8888 or sales@fourlinq.com to scope the work for your project.",
  },
  {
    category: "install",
    q: "What's the install process?",
    a: "Typically: site visit and measurement → detailed quote → fabrication of your custom units → on-site installation → final walk-through. Timelines depend on the system, quantity, and any custom shapes; we confirm specifics as part of your quote.",
  },

  // ── Warranty ───────────────────────────────────────
  {
    category: "warranty",
    q: "What does the warranty cover?",
    a: "FourlinQ provides a 10-Year Limited Warranty covering corrosion resistance, long lasting performance, weather resistance, and sound insulation. The full warranty document goes out with every order. Read it before signing.",
  },
  {
    category: "warranty",
    q: "What's not covered?",
    a: "Cosmetic damage from impact, deliberate misuse, or improper cleaning chemicals are not covered. Acts of nature beyond rated wind-load require a separate claim assessment. For specific exclusions, refer to the warranty document or contact sales: 0925-848-8888.",
  },

  // ── Care & Maintenance ─────────────────────────────
  {
    category: "care",
    q: "How do I clean uPVC frames?",
    a: "Warm soapy water and a soft cloth, every few months. Avoid abrasive scrubbers, solvents, bleach, or paint thinner, which can damage the surface finish. Wood-grain finishes wipe down the same way and don't need oiling or refinishing.",
  },
  {
    category: "care",
    q: "How do I maintain the hardware?",
    a: "A drop of light machine oil on hinge pins and lock cylinders every 6 months keeps them smooth. Rollers on sliding systems benefit from the same treatment plus occasional brushing-out of any dust in the track. See /care for the full routine.",
  },
];
