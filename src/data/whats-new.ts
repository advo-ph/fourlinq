// "What's New" feed entries — sourced from the FourlinQ Facebook page via
// the advo-api FB scrape on 2026-04-12.
//
// Dates: the FB scrape captured post bodies + images but not timestamps.
// We use approximate dates inferred from post sequence and known events
// (WORLDBEX 2026 was March 12-15, 2026; first aluminium install milestone
// was Q4 2025). Once Tita confirms exact dates, update here.

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

export const whatsNew: WhatsNewEntry[] = [
  {
    id: "worldbex-2026",
    date: "2026-03-12",
    category: "event",
    title: "FourlinQ at WORLDBEX 2026",
    excerpt: "Join us at the Philippine World Building and Construction Exposition. March 12-15, 2026 at World Trade Center Metro Manila.",
    image: `${FB}/6ezPWg1k.jpg`,
  },
  {
    id: "las-pinas-turnover",
    date: "2026-02-20",
    category: "project",
    title: "Las Piñas residence completed",
    excerpt: "Another home ready to be enjoyed. Modern window and door installations built for durability, style, and everyday comfort.",
    image: `${FB}/DOuJGHUl.jpg`,
    link: "/projects/las-pinas-residence",
  },
  {
    id: "tagaytay-turnover",
    date: "2026-02-05",
    category: "project",
    title: "Tagaytay City residence turnover",
    excerpt: "Windows and doors turnover in Tagaytay City, Cavite. Style meets function, every breathtaking view framed with perfection.",
    image: `${FB}/ZzCSzF_o.jpg`,
    link: "/projects/tagaytay-cavite-residence",
  },
  {
    id: "first-aluminium-install",
    date: "2026-01-20",
    category: "product",
    title: "First aluminium installation at San Lorenzo, Makati",
    excerpt: "Proud to unveil our first aluminium windows and doors installation. A remarkable milestone for the FourlinQ team.",
    image: `${FB}/P7DLic-T.jpg`,
    link: "/projects/san-lorenzo-makati-aluminium",
  },
  {
    id: "nuvali-laguna-turnover",
    date: "2026-01-08",
    category: "project",
    title: "Nuvali residence turnover",
    excerpt: "Another milestone achieved. The new windows and doors became the new face of the home — better efficiency, more natural light, a boost to curb appeal.",
    image: `${FB}/mbArIDA5.jpg`,
    link: "/projects/nuvali-laguna-residence",
  },
  {
    id: "showroom-invite",
    date: "2025-12-15",
    category: "event",
    title: "Visit our showrooms in Alabang, Ortigas, and Cebu",
    excerpt: "See and feel the quality of uPVC frames in multiple color options and finishes at our three FourlinQ showrooms.",
    image: `${FB}/c3JgQoz6.jpg`,
    link: "/brand#showrooms",
  },
  {
    id: "taytay-rizal-turnover",
    date: "2025-11-22",
    category: "project",
    title: "Taytay, Rizal residence completed",
    excerpt: "Standard is never enough. We officially turned over the keys to this gorgeous Taytay project — better security, better insulation, better views.",
    image: `${FB}/pndqSKzg.jpg`,
    link: "/projects/taytay-rizal-residence",
  },
  {
    id: "12-finishes",
    date: "2025-10-15",
    category: "product",
    title: "Twelve finish options across every system",
    excerpt: "From classic White to Wood Gray, Walnut, and Golden Oak — every FourlinQ system available in twelve brochure-verified finishes.",
    image: "/images/wp-export/Walnut-Profile.jpg",
    link: "/finishes",
  },
];
