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
  dateVerified?: boolean;
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
    dateVerified: true,
    title: "Archive: FourlinQ at WORLDBEX 2026",
    excerpt: "Archived event post for the March 12–15, 2026 Philippine World Building and Construction Exposition.",
    image: `${FB}/6ezPWg1k.jpg`,
  },
  {
    id: "las-pinas-turnover",
    date: "2026-02-20",
    category: "project",
    title: "Las Piñas residence completed",
    excerpt: "Archived FourlinQ project-completion post for a Las Piñas residence. The fallback archive does not contain a verified publication date.",
    image: `${FB}/DOuJGHUl.jpg`,
    link: "/projects/las-pinas-residence",
  },
  {
    id: "tagaytay-turnover",
    date: "2026-02-05",
    category: "project",
    title: "Tagaytay City residence turnover",
    excerpt: "Archived FourlinQ turnover post for a Tagaytay City residence. The fallback archive does not contain a verified publication date.",
    image: `${FB}/ZzCSzF_o.jpg`,
    link: "/projects/tagaytay-cavite-residence",
  },
  {
    id: "first-aluminium-install",
    date: "2026-01-20",
    category: "product",
    title: "First aluminium installation at San Lorenzo, Makati",
    excerpt: "Archived FourlinQ post identifying this as the team's first aluminium windows-and-doors installation. The fallback archive date is unverified.",
    image: `${FB}/P7DLic-T.jpg`,
    link: "/projects/san-lorenzo-makati-aluminium",
  },
  {
    id: "nuvali-laguna-turnover",
    date: "2026-01-08",
    category: "project",
    title: "Nuvali residence turnover",
    excerpt: "Archived FourlinQ project post for a Nuvali residence. The fallback archive does not contain a verified publication date or performance measurement.",
    image: `${FB}/mbArIDA5.jpg`,
    link: "/projects/nuvali-laguna-residence",
  },
  {
    id: "showroom-invite",
    date: "2025-12-15",
    category: "event",
    title: "Visit our published locations in Alabang, Ortigas, and Cebu",
    excerpt: "Archived invitation to the published Ortigas, Alabang, and Cebu locations. Contact FourlinQ to confirm access and current samples before visiting.",
    image: `${FB}/c3JgQoz6.jpg`,
    link: "/brand#showrooms",
  },
  {
    id: "taytay-rizal-turnover",
    date: "2025-11-22",
    category: "project",
    title: "Taytay, Rizal residence completed",
    excerpt: "Archived FourlinQ completion post for a Taytay residence. The fallback archive does not contain a verified publication date or security/insulation test result.",
    image: `${FB}/pndqSKzg.jpg`,
    link: "/projects/taytay-rizal-residence",
  },
  {
    id: "12-finishes",
    date: "2025-10-15",
    category: "product",
    title: "Twelve finishes in the uPVC library",
    excerpt: "The verified uPVC sample set contains five solid and seven wood-grain entries. Confirm profile compatibility, physical sample, and current availability.",
    image: "/images/wp-export/Walnut-Profile.jpg",
    link: "/finishes",
  },
];
