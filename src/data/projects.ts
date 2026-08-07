// Project catalog for /inspiration and individual /projects/:slug pages.
//
// SOURCE: facebook.com/FourlinQofficial, scraped via advo-api
// (/opt/advo-api/src/routes/fb-scrape.routes.ts on the advo VPS) and stored
// at /var/www/advo/uploads/fb-scrapes/FourlinQofficial/[hash].jpg. We pulled
// 37 unique images from 8 project-attributed posts on 2026-05-24.
//
// Captions below quote FourlinQ's own Facebook posts (cleaned of CTA
// boilerplate + hashtags). Locations are Tita's own, not invented.
// Gallery photos for each project are the exact set of images attached to
// the matching Facebook post: verified pairings, not guesses.
//
// Structured `area` is populated only from those verified location/caption
// strings (plus showroom-verified Mandaue→Cebu). Never invent a village,
// city, province, or region_code. Unknown → omit the field.
//
// To add more projects: re-scrape the FourlinQ FB page, download the
// referenced images, append a new entry here.

import type { ProjectArea } from "@/data/project-area";

export type { ProjectArea };
export type ProjectCategory =
  | "casement"
  | "sliding"
  | "specialist"
  | "interior"
  | "exterior"
  | "doors";

/**
 * Gallery filter axis for /inspiration. Broader than ProjectCategory and
 * multi-valued: one install is usually windows AND doors, and often has both
 * an interior and an exterior story. Values derive from what the FourlinQ
 * Facebook captions actually say about each project, not from guesses.
 */
export type InspirationTag = "windows" | "doors" | "interior" | "exterior";

/** Fallback for CMS rows that only carry the legacy single category. */
export function tagFromCategory(category: string): InspirationTag[] {
  switch (category) {
    case "casement":
    case "sliding":
    case "specialist":
      return ["windows"];
    case "doors":
      return ["doors"];
    case "interior":
      return ["interior"];
    case "exterior":
      return ["exterior"];
    default:
      return [];
  }
}

export interface Project {
  id: string;
  /** Real location from the FourlinQ Facebook caption. */
  name: string;
  /** Specific area (city/municipality) when posted by the FourlinQ team. */
  location: string;
  /**
   * Structured install area for /inspiration grouping + label derivation.
   * Optional parts only — omit anything the client has not confirmed.
   */
  area?: ProjectArea;
  /** Primary hero image, pulled from the FB scrape. */
  image: string;
  /** Additional photos from the same Facebook post, VERIFIED pairings
   *  (these images were posted together by FourlinQ themselves). */
  gallery?: string[];
  category: ProjectCategory;
  /** Multi-valued gallery filter tags; see InspirationTag. */
  tag?: InspirationTag[];
  caption?: string;
  description?: string;
  year?: number;
  architect?: string;
  quote?: { text: string; attribution: string };
  systemsUsed?: string[];
}

const FB = "/images/projects-fb";

const projectRow: Project[] = [
  {
    id: "las-pinas-residence",
    name: "Las Piñas Residence",
    location: "Las Piñas",
    // Full 21-photo album from the FB post (2026-03-27), re-scraped
    // 2026-07-22 at original 2048px resolution (no enhancement).
    image: `${FB}/las-pinas-residence-13.jpg`,
    gallery: [
      `${FB}/las-pinas-residence.jpg`,
      `${FB}/las-pinas-residence-2.jpg`,
      `${FB}/las-pinas-residence-3.jpg`,
      `${FB}/las-pinas-residence-4.jpg`,
      `${FB}/las-pinas-residence-5.jpg`,
      `${FB}/las-pinas-residence-6.jpg`,
      `${FB}/las-pinas-residence-7.jpg`,
      `${FB}/las-pinas-residence-8.jpg`,
      `${FB}/las-pinas-residence-9.jpg`,
      `${FB}/las-pinas-residence-10.jpg`,
      `${FB}/las-pinas-residence-11.jpg`,
      `${FB}/las-pinas-residence-12.jpg`,
      `${FB}/las-pinas-residence-14.jpg`,
      `${FB}/las-pinas-residence-15.jpg`,
      `${FB}/las-pinas-residence-16.jpg`,
      `${FB}/las-pinas-residence-17.jpg`,
      `${FB}/las-pinas-residence-18.jpg`,
      `${FB}/las-pinas-residence-19.jpg`,
      `${FB}/las-pinas-residence-20.jpg`,
      `${FB}/las-pinas-residence-21.jpg`,
    ],
    category: "interior",
    tag: ["windows", "doors", "interior"],
    caption: "Modern window and door installations built for durability, style, and everyday comfort.",
    description:
      "FourlinQ proudly completes this Las Piñas project. Modern window and door installations built for durability, style, and everyday comfort. Every detail counts, from initial measurement to installation.",
  },
  {
    id: "taytay-rizal-residence",
    name: "Taytay Residence",
    location: "Taytay",
    // Full 10-photo album from the FB post (2026-03-26), re-scraped
    // 2026-07-22 at original 2048px resolution (no enhancement).
    image: `${FB}/taytay-rizal-residence-7.jpg`,
    gallery: [
      `${FB}/taytay-rizal-residence.jpg`,
      `${FB}/taytay-rizal-residence-2.jpg`,
      `${FB}/taytay-rizal-residence-3.jpg`,
      `${FB}/taytay-rizal-residence-4.jpg`,
      `${FB}/taytay-rizal-residence-5.jpg`,
      `${FB}/taytay-rizal-residence-6.jpg`,
      `${FB}/taytay-rizal-residence-8.jpg`,
      `${FB}/taytay-rizal-residence-9.jpg`,
      `${FB}/taytay-rizal-residence-10.jpg`,
    ],
    category: "casement",
    tag: ["windows", "doors"],
    caption: "Premium windows and doors turned over for this Taytay home.",
    description:
      "Standard is never enough when it comes to your dream home. We officially turned over the keys to this gorgeous project in Taytay, featuring our premium windows and doors. Better security. Better insulation. Better views.",
  },
  {
    id: "nuvali-laguna-residence",
    name: "Nuvali Residence",
    location: "Nuvali",
    // Full 18-photo album from the FB turnover post (2025-11-18), re-scraped
    // 2026-07-22 at the post's original resolution (no enhancement).
    image: `${FB}/nuvali-laguna-residence-9.jpg`,
    gallery: [
      `${FB}/nuvali-laguna-residence.jpg`,
      `${FB}/nuvali-laguna-residence-2.jpg`,
      `${FB}/nuvali-laguna-residence-3.jpg`,
      `${FB}/nuvali-laguna-residence-4.jpg`,
      `${FB}/nuvali-laguna-residence-5.jpg`,
      `${FB}/nuvali-laguna-residence-6.jpg`,
      `${FB}/nuvali-laguna-residence-7.jpg`,
      `${FB}/nuvali-laguna-residence-8.jpg`,
      `${FB}/nuvali-laguna-residence-10.jpg`,
      `${FB}/nuvali-laguna-residence-11.jpg`,
      `${FB}/nuvali-laguna-residence-12.jpg`,
      `${FB}/nuvali-laguna-residence-13.jpg`,
      `${FB}/nuvali-laguna-residence-14.jpg`,
      `${FB}/nuvali-laguna-residence-15.jpg`,
      `${FB}/nuvali-laguna-residence-16.jpg`,
      `${FB}/nuvali-laguna-residence-17.jpg`,
      `${FB}/nuvali-laguna-residence-18.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Windows and doors turnover in Nuvali.",
    description:
      "Another milestone achieved. We successfully completed the turnover for the new windows and doors on this project. These installations were more than just openings; they became the new face of the home, immediately providing better efficiency, more natural light, and a boost to curb appeal.",
  },
  {
    id: "nuvali-laguna-residence-b",
    name: "Nuvali Residence",
    location: "Nuvali",
    // Full 13-photo album from the FB turn-over post (2025-09-16), scraped
    // 2026-07-22 at original 2048px resolution (no enhancement). Different
    // house from nuvali-laguna-residence (wood-grain frames, mountain views).
    image: `${FB}/nuvali-laguna-residence-b-6.jpg`,
    gallery: [
      `${FB}/nuvali-laguna-residence-b.jpg`,
      `${FB}/nuvali-laguna-residence-b-2.jpg`,
      `${FB}/nuvali-laguna-residence-b-3.jpg`,
      `${FB}/nuvali-laguna-residence-b-4.jpg`,
      `${FB}/nuvali-laguna-residence-b-5.jpg`,
      `${FB}/nuvali-laguna-residence-b-7.jpg`,
      `${FB}/nuvali-laguna-residence-b-8.jpg`,
      `${FB}/nuvali-laguna-residence-b-9.jpg`,
      `${FB}/nuvali-laguna-residence-b-10.jpg`,
      `${FB}/nuvali-laguna-residence-b-11.jpg`,
      `${FB}/nuvali-laguna-residence-b-12.jpg`,
      `${FB}/nuvali-laguna-residence-b-13.jpg`,
    ],
    category: "casement",
    tag: ["windows", "doors"],
    caption: "Turn-over achieved for this Nuvali, Laguna project.",
    description:
      "Turn-over achieved. Proudly turning over our latest FourlinQ windows and doors project in Nuvali, Laguna. With outstanding design and secure craftsmanship, we've created a space that doesn't just look elegant, it feels like a true safe haven. Style, security, comfort, all in one.",
  },
  {
    id: "nuvali-laguna-residence-c",
    name: "Nuvali Residence",
    location: "Nuvali",
    // Full 9-photo album from the FB on-going-project post (2025-09-30),
    // scraped 2026-07-22 at original 2048px resolution (no enhancement).
    // Different house from nuvali-laguna-residence and -b (black aluminum
    // frames, flat subdivision views).
    image: `${FB}/nuvali-laguna-residence-c-3.jpg`,
    gallery: [
      `${FB}/nuvali-laguna-residence-c.jpg`,
      `${FB}/nuvali-laguna-residence-c-2.jpg`,
      `${FB}/nuvali-laguna-residence-c-4.jpg`,
      `${FB}/nuvali-laguna-residence-c-5.jpg`,
      `${FB}/nuvali-laguna-residence-c-6.jpg`,
      `${FB}/nuvali-laguna-residence-c-7.jpg`,
      `${FB}/nuvali-laguna-residence-c-8.jpg`,
      `${FB}/nuvali-laguna-residence-c-9.jpg`,
    ],
    category: "casement",
    tag: ["windows"],
    caption: "Wide, elegant windows for an on-going Nuvali, Laguna project.",
    description:
      "On-going project at Nuvali, Laguna. Make your home extra special and turn it into a true safe haven with wide, elegant windows, where beauty meets protection.",
  },
  {
    id: "tagaytay-cavite-residence",
    name: "Tagaytay Residence",
    location: "Tagaytay City",
    // Full 6-photo album from the FB turn-over post (2025-08-13), re-scraped
    // 2026-07-22 at the post's original resolution (no enhancement).
    image: `${FB}/tagaytay-cavite-residence.jpg`,
    gallery: [
      `${FB}/tagaytay-cavite-residence-2.jpg`,
      `${FB}/tagaytay-cavite-residence-3.jpg`,
      `${FB}/tagaytay-cavite-residence-4.jpg`,
      `${FB}/tagaytay-cavite-residence-5.jpg`,
      `${FB}/tagaytay-cavite-residence-6.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Style meets function. Every breathtaking view framed with perfection.",
    description:
      "Fresh views, new beginnings. We've just completed our windows and doors turnover in the breathtaking Tagaytay City. Style meets function, and every view is framed with perfection.",
  },
  {
    id: "san-lorenzo-makati-aluminium",
    name: "Makati San Lorenzo Residence",
    location: "Makati",
    // Full 15-photo album from the FB turn-over post (2025-08-26), re-scraped
    // 2026-07-22 at the post's original resolution (no enhancement).
    image: `${FB}/san-lorenzo-makati-aluminium-11.jpg`,
    gallery: [
      `${FB}/san-lorenzo-makati-aluminium.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-2.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-3.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-4.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-5.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-6.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-7.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-8.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-9.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-10.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-12.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-13.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-14.jpg`,
      `${FB}/san-lorenzo-makati-aluminium-15.jpg`,
    ],
    category: "doors",
    tag: ["windows", "doors", "interior"],
    caption: "FourlinQ's first aluminium windows and doors installation.",
    description:
      "Turn-over completed. Proud to unveil our first aluminium windows and doors installation at San Lorenzo, Makati. A remarkable milestone made possible by the hard work of our team.",
  },
  {
    id: "cebu-s-residences",
    name: "Cebu F. Residence",
    location: "Cebu City",
    // Hero swapped to the enhanced render (TASK1.pdf, 2026-07-22).
    image: `${FB}/cebu-s-residences.jpg`,
    gallery: [`${FB}/cebu-s-residences-2.jpg`],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu City",
    description: "FourlinQ windows and doors installation in Cebu City.",
  },
  {
    id: "cebu-g-residences",
    name: "Talisay G. Residence",
    location: "Talisay City",
    // Hero swapped to the enhanced render (TASK1.pdf, 2026-07-22): the
    // logo-burned Facebook upload was replaced with the clean, color-graded
    // photo of the same residence.
    image: `${FB}/cebu-g-residences.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Talisay City",
    description: "FourlinQ windows and doors installation in Talisay City.",
  },
  {
    id: "cebu-r-residences",
    name: "Cebu R. Residence",
    location: "Cebu City",
    // Hero swapped to the enhanced render (TASK1.pdf, 2026-07-22).
    image: `${FB}/cebu-r-residences.jpg`,
    gallery: [`${FB}/cebu-r-residences-2.jpg`],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu City",
    description: "FourlinQ windows and doors installation in Cebu City.",
  },
  {
    id: "cebu-a-residences",
    name: "Oslob Ag. Residence",
    location: "Oslob",
    // Hero swapped to the enhanced render (TASK1.pdf, 2026-07-22): the
    // logo-burned Facebook upload was replaced with the clean, blue-sky photo
    // of the same modernist hillside residence.
    image: `${FB}/cebu-a-residences.jpg`,
    category: "exterior",
    tag: ["windows", "exterior"],
    caption: "Oslob",
    description: "FourlinQ windows and doors installation in Oslob. Modernist hillside home with white-frame elevator tower.",
  },
  {
    id: "batangas-c-residences",
    name: "Batangas C. Residence",
    location: "Batangas",
    // Full 6-photo album from the FB post (2025-05-26), re-scraped 2026-07-22
    // at original 2048px resolution (no enhancement).
    image: `${FB}/batangas-c-residences-2.jpg`,
    gallery: [
      `${FB}/batangas-c-residences.jpg`,
      `${FB}/batangas-c-residences-3.jpg`,
      `${FB}/batangas-c-residences-4.jpg`,
      `${FB}/batangas-c-residences-5.jpg`,
      `${FB}/batangas-c-residences-6.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Window and door installation at the C. Residences project in Batangas.",
    description: "Batangas Project: C. Residences. Premium windows and doors specified throughout the home.",
  },
  {
    id: "bulacan-n-residence",
    name: "Bulacan N. Residence",
    location: "Bulacan",
    // Full 3-photo album from the FB post (2025-06-17), re-scraped 2026-07-22
    // at the post's original resolution (no enhancement).
    image: `${FB}/bulacan-n-residence-3.jpg`,
    gallery: [
      `${FB}/bulacan-n-residence.jpg`,
      `${FB}/bulacan-n-residence-2.jpg`,
    ],
    category: "interior",
    tag: ["windows", "doors", "interior"],
    caption: "Modern, high-quality windows and doors at the N. Residence in Bulacan.",
    description: "N. Residence Project Site: Bulacan. Durable, stylish windows and doors tailored to the home's design.",
  },
  {
    id: "taguig-g-residence",
    name: "Taguig G. Residence",
    location: "Taguig City",
    // Full 3-photo album from the FB post (2025-06-17), re-scraped 2026-07-22
    // at the post's original resolution (no enhancement).
    image: `${FB}/taguig-g-residence.jpg`,
    gallery: [
      `${FB}/taguig-g-residence-2.jpg`,
      `${FB}/taguig-g-residence-3.jpg`,
    ],
    category: "interior",
    tag: ["windows", "doors", "interior"],
    caption: "Window and door installation at the G. Residence in Taguig City.",
    description: "G. Residence Project Site: Taguig City. Upgrade your view. Elevate your living.",
  },
  // NOTE: the Bataan project was dropped on 2026-05-24 (its only photo was a
  // black frame). Restored 2026-07-22 as `bataan-s-residence` below, using the
  // real turnover photos from the FourlinQ Facebook page.

  // ── Cebu projects from David's collection (added 2026-07-22) ────────────
  // Sourced from the FourlinQ social-media project archive (Telegram / FB /
  // IG), audited in TASK2.pdf and photo-enhanced in TASK1.pdf. Heroes use the
  // enhanced render where the team produced one; entries the team marked
  // "no enhancement needed" keep the original. Client names are anonymized to
  // the initial (or plain "Residence" where the source gave no name); the
  // location carries the identity on the gallery card.
  {
    id: "cebu-n-residence-pardo",
    name: "Cebu N. Residence",
    location: "Cebu City",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-n-residence-pardo-2.jpg`,
    gallery: [
      `${FB}/cebu-n-residence-pardo.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu City",
    description: "FourlinQ windows and doors installation in Cebu City.",
  },
  {
    id: "cebu-n-residence-pardo-b",
    name: "Cebu N. Residence",
    location: "Cebu City",
    // Enhanced photo (TASK1 deliverable). Second Nardo install at Alta Vista.
    image: `${FB}/cebu-n-residence-pardo-b.jpg`,
    gallery: [
      `${FB}/cebu-n-residence-pardo-b-2.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu City",
    description: "FourlinQ windows and doors installation in Cebu City.",
  },
  {
    id: "cebu-sch-residence-monterrazas",
    name: "Cebu Sch. Residence",
    location: "Cebu City",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-sch-residence-monterrazas.jpg`,
    gallery: [
      `${FB}/cebu-sch-residence-monterrazas-2.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu City",
    description: "FourlinQ windows and doors installation in Cebu City.",
  },
  {
    id: "cebu-s-residence-maria-luisa",
    name: "Cebu S. Residence",
    location: "Cebu City",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-s-residence-maria-luisa.jpg`,
    gallery: [
      `${FB}/cebu-s-residence-maria-luisa-2.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu City",
    description: "FourlinQ windows and doors installation in Cebu City.",
  },
  {
    id: "cebu-as-residence-consolacion",
    name: "Consolacion As. Residence",
    location: "Consolacion",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-as-residence-consolacion.jpg`,
    gallery: [
      `${FB}/cebu-as-residence-consolacion-2.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Consolacion",
    description: "FourlinQ windows and doors installation in Consolacion.",
  },
  {
    id: "cebu-p-residence-kishanta",
    name: "Talisay P. Residence",
    location: "Talisay City",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-p-residence-kishanta.jpg`,
    gallery: [
      `${FB}/cebu-p-residence-kishanta-2.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Talisay City",
    description: "FourlinQ windows and doors installation in Talisay City.",
  },
  {
    id: "cebu-m-residence-molave",
    name: "Consolacion M. Residence",
    location: "Consolacion",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-m-residence-molave.jpg`,
    gallery: [
      `${FB}/cebu-m-residence-molave-2.jpg`,
      `${FB}/cebu-m-residence-molave-3.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Consolacion",
    description: "FourlinQ windows and doors installation in Consolacion.",
  },
  {
    id: "cebu-d-residence-mandaue",
    name: "Mandaue D. Residence",
    location: "Mandaue City",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-d-residence-mandaue.jpg`,
    gallery: [
      `${FB}/cebu-d-residence-mandaue-2.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Mandaue City",
    description: "FourlinQ windows and doors installation in Mandaue City.",
  },
  {
    id: "cebu-es-residence-maria-luisa",
    name: "Cebu E.S. Residence",
    location: "Cebu City",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-es-residence-maria-luisa-2.jpg`,
    gallery: [
      `${FB}/cebu-es-residence-maria-luisa.jpg`,
      `${FB}/cebu-es-residence-maria-luisa-3.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu City",
    description: "FourlinQ windows and doors installation in Cebu City.",
  },
  {
    id: "cebu-cmsprs",
    name: "Cebu Residence",
    location: "Cebu",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-cmsprs-3.jpg`,
    gallery: [
      `${FB}/cebu-cmsprs.jpg`,
      `${FB}/cebu-cmsprs-2.jpg`,
      `${FB}/cebu-cmsprs-4.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu",
    description: "FourlinQ windows and doors installation in Cebu.",
  },
  {
    id: "cebu-m-residence-2",
    name: "Cebu M. Residence",
    location: "Cebu",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-m-residence-2-2.jpg`,
    gallery: [
      `${FB}/cebu-m-residence-2.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu",
    description: "FourlinQ windows and doors installation in Cebu.",
  },
  {
    id: "cebu-ta-residence-monterrazas",
    name: "Cebu T.A. Residence",
    location: "Cebu City",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-ta-residence-monterrazas.jpg`,
    gallery: [
      `${FB}/cebu-ta-residence-monterrazas-2.jpg`,
      `${FB}/cebu-ta-residence-monterrazas-3.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu City",
    description: "FourlinQ windows and doors installation in Cebu City.",
  },
  {
    id: "cebu-f-residence-fortunado",
    name: "Cebu F. Residence",
    location: "Cebu",
    // Enhanced photo (TASK1 deliverable). Skyframe CM, charcoal gray with
    // reflective grey glass.
    image: `${FB}/cebu-f-residence-fortunado-3.jpg`,
    gallery: [
      `${FB}/cebu-f-residence-fortunado.jpg`,
      `${FB}/cebu-f-residence-fortunado-2.jpg`,
      `${FB}/cebu-f-residence-fortunado-4.jpg`,
      `${FB}/cebu-f-residence-fortunado-5.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu",
    description: "FourlinQ Skyframe installation, charcoal gray with reflective grey glass, in Cebu.",
  },
  {
    id: "cebu-t-residence-cebu-city",
    name: "Cebu T. Residence",
    location: "Cebu City",
    // Original photo (marked no-enhancement-needed).
    image: `${FB}/cebu-t-residence-cebu-city.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu City",
    description: "FourlinQ windows and doors installation in Cebu City.",
  },
  {
    id: "cebu-c-residence-amara",
    name: "Liloan C. Residence",
    location: "Liloan",
    // Original photo (marked no-enhancement-needed).
    image: `${FB}/cebu-c-residence-amara.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Liloan",
    description: "FourlinQ windows and doors installation in Liloan.",
  },
  {
    id: "cebu-ds-residence-talisay",
    name: "Talisay D.S. Residence",
    location: "Talisay City",
    // Original photo (marked no-enhancement-needed).
    image: `${FB}/cebu-ds-residence-talisay.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Talisay City",
    description: "FourlinQ windows and doors installation in Talisay City.",
  },
  {
    id: "cebu-aa-residence-vista-grande",
    name: "Talisay A.A. Residence",
    location: "Talisay City",
    // Original photo (marked no-enhancement-needed).
    image: `${FB}/cebu-aa-residence-vista-grande.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Talisay City",
    description: "FourlinQ windows and doors installation in Talisay City.",
  },
  {
    id: "cebu-maratas-residence",
    name: "Cebu M. Residence",
    location: "Cebu",
    // Original photo (marked no-enhancement-needed). Walnut laminate profile.
    image: `${FB}/cebu-maratas-residence.jpg`,
    gallery: [
      `${FB}/cebu-maratas-residence-2.jpg`,
    ],
    category: "interior",
    tag: ["windows", "doors", "interior"],
    caption: "Cebu",
    description: "FourlinQ windows and doors, walnut laminate profile, in Cebu.",
  },
  {
    id: "cebu-residence-vista-grande-talisay",
    name: "Talisay Vista Grande Residence",
    location: "Talisay",
    // Original photo (marked no-enhancement-needed).
    image: `${FB}/cebu-residence-vista-grande-talisay.jpg`,
    category: "exterior",
    tag: ["windows", "exterior"],
    caption: "Talisay",
    description: "FourlinQ windows and doors installation in Talisay.",
  },
  {
    id: "cebu-residence-monterrazas",
    name: "Cebu Monterrazas Residence",
    location: "Cebu",
    // Original photo (marked no-enhancement-needed).
    image: `${FB}/cebu-residence-monterrazas.jpg`,
    category: "exterior",
    tag: ["windows", "exterior"],
    caption: "Cebu",
    description: "FourlinQ windows and doors installation in Cebu.",
  },

  // ── Luzon/Mindanao projects recovered from the FourlinQ Facebook page ───
  // Turnover posts found in the FB scrape (dataset 2026-07-21) that were not
  // yet on the site. Photos are the post's own images (~590px). Named by the
  // client initial where the caption gave one, else "Residence"; the three
  // undated 2026 turnover posts carry no stated location.
  {
    id: "binan-residence",
    name: "Biñan Residence",
    location: "Biñan",
    // Full 19-photo album from the FB turnover post (2026-03-24), re-scraped
    // 2026-07-22 at original 2048px resolution (no enhancement).
    image: `${FB}/binan-residence-13.jpg`,
    gallery: [
      `${FB}/binan-residence.jpg`,
      `${FB}/binan-residence-2.jpg`,
      `${FB}/binan-residence-3.jpg`,
      `${FB}/binan-residence-4.jpg`,
      `${FB}/binan-residence-5.jpg`,
      `${FB}/binan-residence-6.jpg`,
      `${FB}/binan-residence-7.jpg`,
      `${FB}/binan-residence-8.jpg`,
      `${FB}/binan-residence-9.jpg`,
      `${FB}/binan-residence-10.jpg`,
      `${FB}/binan-residence-11.jpg`,
      `${FB}/binan-residence-12.jpg`,
      `${FB}/binan-residence-14.jpg`,
      `${FB}/binan-residence-15.jpg`,
      `${FB}/binan-residence-16.jpg`,
      `${FB}/binan-residence-17.jpg`,
      `${FB}/binan-residence-18.jpg`,
      `${FB}/binan-residence-19.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Biñan",
    description: "FourlinQ windows and doors installation in Biñan.",
  },
  {
    id: "bataan-s-residence",
    name: "Bataan S. Residence",
    location: "Bataan",
    // Full 21-photo album from the FB milestone post (2025-11-12), re-scraped
    // 2026-07-22 at original 2048px resolution (no enhancement).
    image: `${FB}/bataan-s-residence-20.jpg`,
    gallery: [
      `${FB}/bataan-s-residence.jpg`,
      `${FB}/bataan-s-residence-2.jpg`,
      `${FB}/bataan-s-residence-3.jpg`,
      `${FB}/bataan-s-residence-4.jpg`,
      `${FB}/bataan-s-residence-5.jpg`,
      `${FB}/bataan-s-residence-6.jpg`,
      `${FB}/bataan-s-residence-7.jpg`,
      `${FB}/bataan-s-residence-8.jpg`,
      `${FB}/bataan-s-residence-9.jpg`,
      `${FB}/bataan-s-residence-10.jpg`,
      `${FB}/bataan-s-residence-11.jpg`,
      `${FB}/bataan-s-residence-12.jpg`,
      `${FB}/bataan-s-residence-13.jpg`,
      `${FB}/bataan-s-residence-14.jpg`,
      `${FB}/bataan-s-residence-15.jpg`,
      `${FB}/bataan-s-residence-16.jpg`,
      `${FB}/bataan-s-residence-17.jpg`,
      `${FB}/bataan-s-residence-18.jpg`,
      `${FB}/bataan-s-residence-19.jpg`,
      `${FB}/bataan-s-residence-21.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Bataan",
    description: "FourlinQ windows and doors installation in Bataan.",
  },
  {
    id: "sarangani-s-residence",
    name: "Sarangani S. Residence",
    location: "Sarangani",
    // Full 4-photo album from the FB post (2025-06-18), re-scraped 2026-07-22
    // at the post's original resolution (no enhancement).
    image: `${FB}/sarangani-s-residence-3.jpg`,
    gallery: [
      `${FB}/sarangani-s-residence.jpg`,
      `${FB}/sarangani-s-residence-2.jpg`,
      `${FB}/sarangani-s-residence-4.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Sarangani",
    description: "FourlinQ windows and doors installation in Sarangani.",
  },
  {
    id: "cabanatuan-t-residence",
    name: "Cabanatuan T. Residence",
    location: "Cabanatuan",
    // Full 4-photo album from the FB post (2025-06-16), re-scraped 2026-07-22
    // at original 2048px resolution (no enhancement).
    image: `${FB}/cabanatuan-t-residence-4.jpg`,
    gallery: [
      `${FB}/cabanatuan-t-residence.jpg`,
      `${FB}/cabanatuan-t-residence-2.jpg`,
      `${FB}/cabanatuan-t-residence-3.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cabanatuan",
    description: "FourlinQ windows and doors installation in Cabanatuan.",
  },
  {
    id: "fourlinq-turnover-1",
    name: "Private Residence",
    location: "Philippines",
    // Full 21-photo album from the FB turnover post (2026-04-29), re-scraped
    // 2026-07-22 at original 2048px resolution (no enhancement).
    image: `${FB}/fourlinq-turnover-1-5.jpg`,
    gallery: [
      `${FB}/fourlinq-turnover-1.jpg`,
      `${FB}/fourlinq-turnover-1-2.jpg`,
      `${FB}/fourlinq-turnover-1-3.jpg`,
      `${FB}/fourlinq-turnover-1-4.jpg`,
      `${FB}/fourlinq-turnover-1-6.jpg`,
      `${FB}/fourlinq-turnover-1-7.jpg`,
      `${FB}/fourlinq-turnover-1-8.jpg`,
      `${FB}/fourlinq-turnover-1-9.jpg`,
      `${FB}/fourlinq-turnover-1-10.jpg`,
      `${FB}/fourlinq-turnover-1-11.jpg`,
      `${FB}/fourlinq-turnover-1-12.jpg`,
      `${FB}/fourlinq-turnover-1-13.jpg`,
      `${FB}/fourlinq-turnover-1-14.jpg`,
      `${FB}/fourlinq-turnover-1-15.jpg`,
      `${FB}/fourlinq-turnover-1-16.jpg`,
      `${FB}/fourlinq-turnover-1-17.jpg`,
      `${FB}/fourlinq-turnover-1-18.jpg`,
      `${FB}/fourlinq-turnover-1-19.jpg`,
      `${FB}/fourlinq-turnover-1-20.jpg`,
      `${FB}/fourlinq-turnover-1-21.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Recent FourlinQ turnover",
    description: "A recent FourlinQ windows and doors turnover.",
  },
  {
    id: "fourlinq-turnover-2",
    name: "Private Residence",
    location: "Philippines",
    // Full 15-photo album from the FB turnover post (2026-04-23), re-scraped
    // 2026-07-22 at original 2048px resolution (no enhancement).
    image: `${FB}/fourlinq-turnover-2-4.jpg`,
    gallery: [
      `${FB}/fourlinq-turnover-2.jpg`,
      `${FB}/fourlinq-turnover-2-2.jpg`,
      `${FB}/fourlinq-turnover-2-3.jpg`,
      `${FB}/fourlinq-turnover-2-5.jpg`,
      `${FB}/fourlinq-turnover-2-6.jpg`,
      `${FB}/fourlinq-turnover-2-7.jpg`,
      `${FB}/fourlinq-turnover-2-8.jpg`,
      `${FB}/fourlinq-turnover-2-9.jpg`,
      `${FB}/fourlinq-turnover-2-10.jpg`,
      `${FB}/fourlinq-turnover-2-11.jpg`,
      `${FB}/fourlinq-turnover-2-12.jpg`,
      `${FB}/fourlinq-turnover-2-13.jpg`,
      `${FB}/fourlinq-turnover-2-14.jpg`,
      `${FB}/fourlinq-turnover-2-15.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Recent FourlinQ turnover",
    description: "A recent FourlinQ windows and doors turnover.",
  },
  {
    id: "fourlinq-turnover-3",
    name: "Private Residence",
    location: "Philippines",
    // Full 23-photo album from the FB on-going-install post (2026-03-31),
    // re-scraped 2026-07-22 at original 2048px resolution (no enhancement).
    image: `${FB}/fourlinq-turnover-3-16.jpg`,
    gallery: [
      `${FB}/fourlinq-turnover-3.jpg`,
      `${FB}/fourlinq-turnover-3-2.jpg`,
      `${FB}/fourlinq-turnover-3-3.jpg`,
      `${FB}/fourlinq-turnover-3-4.jpg`,
      `${FB}/fourlinq-turnover-3-5.jpg`,
      `${FB}/fourlinq-turnover-3-6.jpg`,
      `${FB}/fourlinq-turnover-3-7.jpg`,
      `${FB}/fourlinq-turnover-3-8.jpg`,
      `${FB}/fourlinq-turnover-3-9.jpg`,
      `${FB}/fourlinq-turnover-3-10.jpg`,
      `${FB}/fourlinq-turnover-3-11.jpg`,
      `${FB}/fourlinq-turnover-3-12.jpg`,
      `${FB}/fourlinq-turnover-3-13.jpg`,
      `${FB}/fourlinq-turnover-3-14.jpg`,
      `${FB}/fourlinq-turnover-3-15.jpg`,
      `${FB}/fourlinq-turnover-3-17.jpg`,
      `${FB}/fourlinq-turnover-3-18.jpg`,
      `${FB}/fourlinq-turnover-3-19.jpg`,
      `${FB}/fourlinq-turnover-3-20.jpg`,
      `${FB}/fourlinq-turnover-3-21.jpg`,
      `${FB}/fourlinq-turnover-3-22.jpg`,
      `${FB}/fourlinq-turnover-3-23.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Recent FourlinQ turnover",
    description: "A recent FourlinQ windows and doors turnover.",
  },
  {
    id: "curved-facade-residence",
    name: "Private Residence",
    location: "Philippines",
    // Enhanced portfolio photo supplied 2026-07-22 (source/location unknown).
    // Hero is the color-graded render; the original photo is kept in gallery.
    image: `${FB}/curved-facade-residence.jpg`,
    gallery: [
      `${FB}/curved-facade-residence-2.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Curved-glass facade",
    description: "A FourlinQ curved-glass facade with wraparound window and door glazing.",
  },

  // ── FourlinQ portfolio set (added 2026-07-22) ──────────────────────────
  // Numbered portfolio images (ogimages/) with no captions or locations in
  // the source. One card per home; names default to "Residence".
  {
    id: "portfolio-residence-01",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-01.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-02",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-02.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-03",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-03.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-04",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-04.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-05",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-05.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-06",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-06.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-07",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-07.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-08",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-08.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-09",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-09.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-10",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-10.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-11",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-11.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-12",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-12.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-13",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-13.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-14",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-14.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-15",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-15.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-interior-01",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-interior-01.jpg`,
    category: "interior",
    tag: ["windows", "doors", "interior"],
    description: "A FourlinQ interior windows and doors installation.",
  },
  {
    id: "portfolio-interior-02",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-interior-02.jpg`,
    category: "interior",
    tag: ["windows", "doors", "interior"],
    description: "A FourlinQ interior windows and doors installation.",
  },
  {
    id: "portfolio-interior-03",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-interior-03.jpg`,
    category: "interior",
    tag: ["windows", "doors", "interior"],
    description: "A FourlinQ interior windows and doors installation.",
  },
  {
    id: "portfolio-interior-04",
    name: "Private Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown); split out of portfolio-interior-01
    // on 2026-07-22 — the two photos are different projects.
    image: `${FB}/portfolio-interior-01-2.jpg`,
    category: "interior",
    tag: ["windows", "doors", "interior"],
    description: "A FourlinQ interior windows and doors installation.",
  },
];

/**
 * Defendable structured area keyed by project id.
 *
 * Sources only:
 * - Verified `location` string on the project
 * - Caption/description text that already names the place (e.g. San Lorenzo,
 *   Nuvali Laguna)
 * - Showroom-verified Mandaue City → Cebu (fourlinq-data BRANCHES, read-only)
 *
 * No village/city/province/region is inferred from filenames, slugs, or
 * plausibility. Philippines-only rows are intentionally absent.
 */
const DEFENDABLE_AREA: Readonly<Record<string, ProjectArea>> = {
  // Metro Manila (NCR cities named in verified location)
  "las-pinas-residence": { city: "Las Piñas", region_code: "metro_manila" },
  "san-lorenzo-makati-aluminium": {
    village: "San Lorenzo",
    city: "Makati",
    region_code: "metro_manila",
  },
  "taguig-g-residence": { city: "Taguig City", region_code: "metro_manila" },

  // Cebu — location string contains Cebu, or Mandaue (showroom address)
  "cebu-s-residences": { city: "Cebu City", region_code: "cebu" },
  "cebu-r-residences": { city: "Cebu City", region_code: "cebu" },
  "cebu-n-residence-pardo": { city: "Cebu City", region_code: "cebu" },
  "cebu-n-residence-pardo-b": { city: "Cebu City", region_code: "cebu" },
  "cebu-sch-residence-monterrazas": { city: "Cebu City", region_code: "cebu" },
  "cebu-s-residence-maria-luisa": { city: "Cebu City", region_code: "cebu" },
  "cebu-es-residence-maria-luisa": { city: "Cebu City", region_code: "cebu" },
  "cebu-ta-residence-monterrazas": { city: "Cebu City", region_code: "cebu" },
  "cebu-t-residence-cebu-city": { city: "Cebu City", region_code: "cebu" },
  "cebu-cmsprs": { city: "Cebu", region_code: "cebu" },
  "cebu-m-residence-2": { city: "Cebu", region_code: "cebu" },
  "cebu-f-residence-fortunado": { city: "Cebu", region_code: "cebu" },
  "cebu-maratas-residence": { city: "Cebu", region_code: "cebu" },
  "cebu-residence-monterrazas": { city: "Cebu", region_code: "cebu" },
  "cebu-d-residence-mandaue": { city: "Mandaue City", region_code: "cebu" },

  // City/municipality known from location; region not stated on caption
  "taytay-rizal-residence": { city: "Taytay" },
  "nuvali-laguna-residence": { city: "Nuvali" },
  "nuvali-laguna-residence-b": { city: "Nuvali", province: "Laguna" },
  "nuvali-laguna-residence-c": { city: "Nuvali", province: "Laguna" },
  "tagaytay-cavite-residence": { city: "Tagaytay City" },
  "cebu-g-residences": { city: "Talisay City" },
  "cebu-p-residence-kishanta": { city: "Talisay City" },
  "cebu-ds-residence-talisay": { city: "Talisay City" },
  "cebu-aa-residence-vista-grande": { city: "Talisay City" },
  "cebu-a-residences": { city: "Oslob" },
  "batangas-c-residences": { city: "Batangas" },
  "bulacan-n-residence": { province: "Bulacan" },
  "cebu-as-residence-consolacion": { city: "Consolacion" },
  "cebu-m-residence-molave": { city: "Consolacion" },
  "cebu-c-residence-amara": { city: "Liloan" },
  "cebu-residence-vista-grande-talisay": { city: "Talisay" },
  "binan-residence": { city: "Biñan" },
  "bataan-s-residence": { province: "Bataan" },
  "sarangani-s-residence": { province: "Sarangani" },
  "cabanatuan-t-residence": { city: "Cabanatuan" },
};

/** Catalog with defendable `area` attached. Philippines-only rows stay bare. */
export const projects: Project[] = projectRow.map((p) => {
  const area = DEFENDABLE_AREA[p.id];
  return area ? { ...p, area } : p;
});
