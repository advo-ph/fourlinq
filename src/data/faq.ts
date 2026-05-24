/**
 * FAQ content for the public FAQ page.
 *
 * Source: cross-referenced from src/data/fourlinq-data.ts (brochure-verified),
 * the LinQ knowledge base in server/migrations/004_knowledge_seed.sql, and
 * docs/CHANGELOG.md client-comment-driven decisions. Pricing-specific
 * questions are intentionally omitted until Tita confirms a price-context
 * stance — see REDESIGN_ROADMAP.md §14 "Open items".
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
    a: "Five system types, each custom-made to your specifications: Casement, Sliding, Awning, Special Shapes, and Slide & Fold. All are available in uPVC, with Aluminum as an alternate material for certain frames. Detailed specs live on the Systems page.",
  },
  {
    category: "products",
    q: "What's the difference between Casement, Awning, and Sliding?",
    a: "Casement windows hinge on one side and open outward — maximum ventilation, easy cleaning. Awnings hinge at the top and open outward, so they let in light and air even during rain. Sliding windows move horizontally along a track — ideal where outward clearance is tight, like balconies or above kitchen counters.",
  },
  {
    category: "products",
    q: "Can you do custom shapes — arches, trapezoids?",
    a: "Yes. Our Special Shapes system supports fully custom geometry, including arch-tops, circles, trapezoids, and triangles. Often combined with other system types to create a dramatic feature wall of glass. Send us your architectural drawings and we'll quote against them.",
  },
  {
    category: "products",
    q: "How many finishes are available?",
    a: "12 finishes total. Solid colors include classic White, Anthracite, and metallic options. Wood-grain laminates include Walnut, Oak, and other realistic timber finishes — applied via heat-fused foil that won't peel or fade. You can browse the full swatch set on the Brand page or in the Design Tool.",
  },

  // ── uPVC & Materials ──────────────────────────────
  {
    category: "material",
    q: "What is uPVC and why is it better for the Philippines?",
    a: "uPVC is unplasticized polyvinyl chloride — a rigid polymer profile that won't rust, rot, warp, or corrode. For the Philippines, that means it handles the heat, humidity, salt air along the coast, and storm conditions far better than steel, aluminum, or timber. It's also a thermal insulator (multi-chamber profile design traps air), so interiors stay cooler with less aircon.",
  },
  {
    category: "material",
    q: "Will uPVC yellow or fade in the tropical sun?",
    a: "No — our profiles include UV stabilizers engineered for 25+ years of tropical-sun exposure. The warranty covers color stability for 10 years. Independent accelerated-weathering tests show color difference below the human-perceptible threshold even at the 25-year-equivalent mark.",
  },
  {
    category: "material",
    q: "Can uPVC handle typhoons?",
    a: "Yes. Our profiles are internally reinforced with galvanized steel where structural strength is needed, and we use multi-point locking with marine-grade stainless hardware and double or triple weatherseals. The multi-chamber design also flexes-and-recovers under wind load rather than deforming permanently like aluminum.",
  },
  {
    category: "material",
    q: "uPVC vs Aluminum — which should I choose?",
    a: "Both are corrosion-free, but they trade off differently. uPVC is the better thermal insulator (cooler interiors, lower energy bills) and quieter against rain. Aluminum has thinner sight-lines if you want a more minimal architectural look, and handles very large spans like wide sliders better. We offer both; the choice is usually driven by sight-line preference and panel size.",
  },

  // ── Ordering ──────────────────────────────────────
  {
    category: "ordering",
    q: "How do I get a quote?",
    a: "Three ways. (1) Use the Design Tool to configure a system and submit your spec — we reply with a tailored quote. (2) Request a Quote from any system's detail page and tell us about your project. (3) Visit a showroom and we'll measure and quote on site. For larger projects (new builds, full-home renovations), the showroom route is usually fastest.",
  },
  {
    category: "ordering",
    q: "How much do FourlinQ systems cost?",
    a: "Pricing depends on the system, dimensions, finish, glass type, and install complexity. We don't publish list prices because every order is custom-made — but a free quote is fast, and the Design Tool gives you a saved configuration we can reference. Visit a showroom or request a quote and we'll have a number to you within a few days.",
  },
  {
    category: "ordering",
    q: "What's the lead time?",
    a: "Standard configurations are 4–6 weeks from confirmed order. Custom sizes or special shapes take 6–8 weeks. We'll confirm the exact timeline as part of your quote.",
  },
  {
    category: "ordering",
    q: "Do you accept international orders / projects outside Metro Manila?",
    a: "We're based in the Philippines and serve the local market. Our showrooms cover Metro Manila and Cebu, and we ship-and-install nationally. For projects outside our standard install regions we coordinate with local certified contractors.",
  },

  // ── Installation ───────────────────────────────────
  {
    category: "install",
    q: "Do you handle installation?",
    a: "Yes. Our certified installers handle the full job — measurement, removal of any existing windows, fitting, sealing, and post-install QA. We don't subcontract out without our supervision; the warranty depends on it.",
  },
  {
    category: "install",
    q: "What's the install process?",
    a: "Five steps: (1) Site visit and measurement, free. (2) Detailed quote within a few business days. (3) Fabrication of your custom units, 4–8 weeks. (4) Install on site, typically 1–2 days for a residential project. (5) Final walk-through with you to confirm finish and operation.",
  },
  {
    category: "install",
    q: "Will install be messy or disruptive?",
    a: "Some dust and noise is unavoidable during removal of the old units, but our crews clean up daily and protect floors and furniture. A typical residential install is 1–2 days for a few rooms, less for single replacements. We coordinate around your schedule.",
  },

  // ── Warranty ───────────────────────────────────────
  {
    category: "warranty",
    q: "What does the warranty cover?",
    a: "10-year warranty on the uPVC profile itself: structural integrity, corrosion resistance, weather resistance, and color stability. Hardware (hinges, locks, rollers) is covered for 5 years. Glass sealed units are covered against seal failure. The warranty assumes professional install — DIY or third-party installs void coverage.",
  },
  {
    category: "warranty",
    q: "What's not covered?",
    a: "Cosmetic damage from impact, deliberate misuse, or improper cleaning chemicals. Acts of nature beyond the rated wind-load (above signal-5 typhoon thresholds) require a separate claim assessment. The full warranty document goes out with every order — read it before signing.",
  },

  // ── Care & Maintenance ─────────────────────────────
  {
    category: "care",
    q: "How do I clean uPVC frames?",
    a: "Warm soapy water and a soft cloth, every few months. Avoid abrasive scrubbers, solvents, bleach, or anything labeled 'paint thinner' — those can damage the surface finish. The wood-grain finishes wipe down the same way and don't need oiling or refinishing.",
  },
  {
    category: "care",
    q: "How do I maintain the hardware?",
    a: "A drop of light machine oil on hinge pins and lock cylinders every 6 months keeps them smooth. Rollers on sliding systems benefit from the same treatment plus occasional brushing-out of any dust in the track. The Care Guide page has the full routine.",
  },
];
