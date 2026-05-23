// "What's New" feed entries.
// Tita asked for this section — content here is PLACEHOLDER until the client
// supplies real updates. Each entry is structured so the Admin panel can
// later populate this from the database without code changes.
//
// ⚠️ Replace with real entries before next client review.

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

export const whatsNew: WhatsNewEntry[] = [
  {
    id: "casement-door-rename",
    date: "2026-04-26",
    category: "product",
    title: "Casement Door joins the lineup",
    excerpt: "Our reinforced single-leaf entrance — now formally named the Casement Door — adds multi-point locking for premium security.",
    image: "/images/wp-export/Door-5.jpg",
    link: "/products/doors",
  },
  {
    id: "quezon-project-launch",
    date: "2026-03-12",
    category: "project",
    title: "Quezon City residence — full home installation",
    excerpt: "A three-story modern home outfitted with FourlinQ casement, sliding, and large panel doors throughout.",
    image: "/images/brand-story.jpg",
    link: "/projects/three-storey-residence",
  },
  {
    id: "11-finishes",
    date: "2026-02-01",
    category: "product",
    title: "11 finish options now available",
    excerpt: "From classic White to Wood Gray and Walnut — every FourlinQ system available in 11 brochure-verified finishes.",
    image: "/images/wp-export/Walnut-Profile.jpg",
    link: "/finishes",
  },
];
