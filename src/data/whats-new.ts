// "What's New" feed, sourced from the official FourlinQ Facebook page.
//
// SOURCE: facebook.com/FourlinQofficial, exported via the Apify facebook-posts
// scraper on 2026-07-21 (dataset_facebook-posts-scraper_2026-07-21). 151 posts
// spanning 2025-02-11 to 2026-04-29 were reviewed; the strongest events,
// turnovers, and product milestones are surfaced here with their REAL post
// dates and captions (cleaned of CTA boilerplate, phone numbers, and hashtags,
// and normalized out of Facebook's unicode "bold" glyphs).
//
// Project heroes reuse each install's enhanced, logo-free render from
// src/data/projects.ts. Event photos come straight from the matching FB post.
//
// The Cebu portfolio block at the bottom comes from FourlinQ's project archive
// (TASK1/TASK2), not the FB post stream, so those dates are approximate and
// flagged for confirmation with Tita.

export type WhatsNewCategory = "project" | "product" | "event" | "press";

export interface WhatsNewEntry {
  id: string;
  date: string;       // ISO date
  category: WhatsNewCategory;
  title: string;
  excerpt: string;
  image: string;
  link?: string;      // optional internal route or external URL
}

const FB = "/images/projects-fb";
const NEWS = "/images/whats-new";

export const whatsNew: WhatsNewEntry[] = [
  // ── Events (real FB posts) ───────────────────────────────────────────────
  {
    id: "worldbex-2026",
    date: "2026-03-10",
    category: "event",
    title: "FourlinQ at WORLDBEX 2026",
    excerpt: "Elevate your space with FourlinQ Windows and Doors at WORLDBEX 2026, the Philippine World Building and Construction Exposition. March 12 to 15, 2026 at the World Trade Center, Metro Manila.",
    image: `${FB}/6ezPWg1k.jpg`,
    link: "https://www.facebook.com/FourlinQofficial/posts/pfbid02RiCq1CGukJ7RM4HPfCe2Ncbs9razr6RZxwfaS4YE2Uj1EU9cCGtbsV4MgrkzSjhCl",
  },
  {
    id: "worldbex-2025",
    date: "2025-03-17",
    category: "event",
    title: "WORLDBEX 2025 recap",
    excerpt: "Innovation, design, and connections at WORLDBEX 2025. Thank you for visiting our booth and for shaping the future of the industry with us. See you next year.",
    image: `${NEWS}/worldbex-2025.jpg`,
    link: "https://www.facebook.com/FourlinQofficial/posts/pfbid02KGpFCGqTehJMz8DEiJhzXR77juGxNiNnZKdyX8DSArjjRJSBeg8zJ7Wp8j1CJQxRl",
  },
  {
    id: "showroom-invite",
    date: "2025-06-11",
    category: "event",
    title: "Visit our showrooms in Alabang, Ortigas, and Cebu",
    excerpt: "See and feel the quality of uPVC frames in multiple color options and finishes. We warmly invite you to visit our showrooms in Alabang, Ortigas, and Cebu.",
    image: `${FB}/c3JgQoz6.jpg`,
    link: "/brand#showrooms",
  },

  // ── Project turnovers (real FB posts, newest first) ──────────────────────
  {
    id: "las-pinas-turnover",
    date: "2026-03-27",
    category: "project",
    title: "Las Piñas residence completed",
    excerpt: "Another home, ready to be enjoyed. FourlinQ proudly completes this Las Piñas project with modern window and door installations built for durability, style, and everyday comfort.",
    image: `${FB}/DOuJGHUl.jpg`,
    link: "/projects/las-pinas-residence",
  },
  {
    id: "taytay-rizal-turnover",
    date: "2026-03-26",
    category: "project",
    title: "Taytay, Rizal residence turnover",
    excerpt: "Another milestone reached. Standard is never enough for your dream home. We officially turned over the keys to this project in Taytay, Rizal, featuring our premium windows and doors.",
    image: `${FB}/pndqSKzg.jpg`,
    link: "/projects/taytay-rizal-residence",
  },
  {
    id: "nuvali-laguna-turnover",
    date: "2025-11-05",
    category: "project",
    title: "Nuvali, Laguna residence turnover",
    excerpt: "Project turnover complete. We are thrilled to hand over another stunning FourlinQ Windows and Doors project in Nuvali, Laguna, balancing modern design with secure craftsmanship.",
    image: `${FB}/mbArIDA5.jpg`,
    link: "/projects/nuvali-laguna-residence",
  },
  {
    id: "first-aluminium-install",
    date: "2025-08-26",
    category: "product",
    title: "First aluminium installation, San Lorenzo, Makati",
    excerpt: "Turnover completed. Proud to unveil our first aluminium windows and doors installation at San Lorenzo, Makati, a remarkable milestone made possible by the FourlinQ team.",
    image: `${FB}/san-lorenzo-first-aluminium.jpg`,
    link: "/projects/san-lorenzo-makati-aluminium",
  },
  {
    id: "tagaytay-turnover",
    date: "2025-08-19",
    category: "project",
    title: "Tagaytay City residence turnover",
    excerpt: "New views, elegant beginnings. Our windows and doors turnover in Tagaytay City, Cavite is officially complete, framing every breathtaking view with perfection.",
    image: `${FB}/ZzCSzF_o.jpg`,
    link: "/projects/tagaytay-cavite-residence",
  },
  {
    id: "taguig-g-turnover",
    date: "2025-06-17",
    category: "project",
    title: "G. Residence completed in Taguig",
    excerpt: "The G. Residence in Taguig City. Upgrade your view, elevate your living, with durable, stylish FourlinQ windows and doors.",
    image: `${FB}/BOyTwrQH.jpg`,
    link: "/projects/taguig-g-residence",
  },
  {
    id: "bulacan-n-turnover",
    date: "2025-06-17",
    category: "project",
    title: "N. Residence completed in Bulacan",
    excerpt: "The N. Residence in Bulacan, fitted with modern, high quality FourlinQ windows and doors, tailored to the home's design.",
    image: `${FB}/ZoZWYiwi.jpg`,
    link: "/projects/bulacan-n-residence",
  },
  {
    id: "batangas-c-turnover",
    date: "2025-06-19",
    category: "project",
    title: "C. Residence completed in Batangas",
    excerpt: "The C. Residence in Batangas. Precise measurement and installation of FourlinQ sliding doors and windows, durable, stylish, and made to last.",
    image: `${FB}/ohQTuBNz.jpg`,
    link: "/projects/batangas-c-residences",
  },

  // ── Product (FB product-showcase posts + finish/profile milestones) ───────
  // Pergola and auto sliding doors are product lines FourlinQ markets on
  // Facebook but does not yet carry as systems in the /products catalog, so the
  // pergola tile links to its source FB post rather than an internal page.
  {
    id: "h-pergola",
    date: "2025-03-17",
    category: "product",
    title: "H-Pergola for outdoor living",
    excerpt: "Enhance your outdoors with an H-Pergola, where vertical posts meet open beams or aluminium slats, blending style, shade, and comfort.",
    image: `${NEWS}/product-h-pergola.jpg`,
    link: "https://www.facebook.com/61573025792037/posts/122115912836767526",
  },
  {
    id: "auto-sliding-doors",
    date: "2025-03-25",
    category: "product",
    title: "Auto sliding doors",
    excerpt: "Seamless motion, effortless style. FourlinQ auto sliding doors glide open on their own, bringing sensor-smooth convenience to a modern entrance.",
    image: `${NEWS}/product-auto-sliding-door.jpg`,
    link: "/products?filter=doors",
  },
  {
    id: "upvc-profiles",
    date: "2025-04-02",
    category: "product",
    title: "uPVC profiles, where innovation meets durability",
    excerpt: "FourlinQ uPVC profiles pair timeless design with lasting strength, multi-chamber sections that insulate against heat and noise while holding their finish for years.",
    image: `${NEWS}/product-upvc-profile.jpg`,
    link: "/products",
  },
  {
    id: "12-finishes",
    date: "2026-01-08",
    category: "product",
    title: "Twelve finish options across every system",
    excerpt: "From classic White to Wood Gray, Walnut, and Golden Oak, every FourlinQ system is available in twelve brochure-verified finishes.",
    image: `${NEWS}/product-finishes.jpg`,
    link: "/finishes",
  },

  // ── Cebu portfolio (project archive / TASK1-TASK2, dates approximate) ─────
  // Not in the FB post stream; these are FourlinQ's earlier Cebu installs.
  // Dates inferred from the portfolio sequence, to be confirmed with Tita.
  {
    id: "cebu-monterrazas-r",
    date: "2025-09-10",
    category: "project",
    title: "Monterrazas de Cebu hillside residence",
    excerpt: "A hillside home in Monterrazas de Cebu, Guadalupe, framed with FourlinQ windows and doors for uninterrupted valley views.",
    image: `${FB}/cebu-r-residences.jpg`,
    link: "/projects/cebu-r-residences",
  },
  {
    id: "cebu-monterrazas-sch",
    date: "2025-08-22",
    category: "project",
    title: "Sunset turnover in Monterrazas de Cebu",
    excerpt: "Warm interiors and wide glass openings at another Monterrazas de Cebu turnover, finished throughout with FourlinQ systems.",
    image: `${FB}/cebu-sch-residence-monterrazas.jpg`,
    link: "/projects/cebu-sch-residence-monterrazas",
  },
  {
    id: "cebu-monterrazas-ta",
    date: "2025-07-30",
    category: "project",
    title: "Stone and glass estate in Monterrazas de Cebu",
    excerpt: "A grand stone and glass residence in Monterrazas de Cebu, Guadalupe, fitted throughout with FourlinQ windows and doors.",
    image: `${FB}/cebu-ta-residence-monterrazas.jpg`,
    link: "/projects/cebu-ta-residence-monterrazas",
  },
  {
    id: "cebu-alta-vista-f",
    date: "2025-09-28",
    category: "project",
    title: "Modern residence in Alta Vista, Pardo",
    excerpt: "Modern living in Alta Vista Subdivision, Pardo, with floor to ceiling glass and slim FourlinQ frames.",
    image: `${FB}/cebu-s-residences.jpg`,
    link: "/projects/cebu-s-residences",
  },
  {
    id: "cebu-maria-luisa-s",
    date: "2025-08-05",
    category: "project",
    title: "Maria Luisa Estate Park residence",
    excerpt: "A refined residence in Maria Luisa Estate Park, Cebu City, finished with FourlinQ windows and doors.",
    image: `${FB}/cebu-s-residence-maria-luisa.jpg`,
    link: "/projects/cebu-s-residence-maria-luisa",
  },
  {
    id: "cebu-greenhills-d",
    date: "2025-07-12",
    category: "project",
    title: "Minimalist home in Greenhills, Mandaue",
    excerpt: "Clean, minimalist lines in Greenhills Subdivision, Mandaue City, with FourlinQ glazing throughout.",
    image: `${FB}/cebu-d-residence-mandaue.jpg`,
    link: "/projects/cebu-d-residence-mandaue",
  },
  {
    id: "cebu-vista-grande-g",
    date: "2025-06-30",
    category: "project",
    title: "Evening glow in Vista Grande, Talisay",
    excerpt: "Three storeys of warm evening light in Vista Grande Subdivision, Talisay City, framed by FourlinQ.",
    image: `${FB}/cebu-g-residences.jpg`,
    link: "/projects/cebu-g-residences",
  },
  {
    id: "cebu-oslob-ag",
    date: "2025-06-15",
    category: "project",
    title: "Cliffside home in Oslob, Cebu",
    excerpt: "A modernist hillside home in Oslob, Cebu, with a striking white elevator tower and full height glazing.",
    image: `${FB}/cebu-a-residences.jpg`,
    link: "/projects/cebu-a-residences",
  },
];
