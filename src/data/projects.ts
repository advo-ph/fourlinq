// Project catalog — for /inspiration and individual /projects/:slug pages.
//
// SOURCE: facebook.com/FourlinQofficial, scraped via advo-api
// (/opt/advo-api/src/routes/fb-scrape.routes.ts on the advo VPS) and stored
// at /var/www/advo/uploads/fb-scrapes/FourlinQofficial/[hash].jpg. We pulled
// 37 unique images from 8 project-attributed posts on 2026-05-24.
//
// Captions below are deliberately bounded archive summaries. Project metadata
// remains under verification and must not be treated as a technical record.
// Gallery photos for each project are the exact set of images attached to
// the matching Facebook post — verified pairings, not guesses.
//
// To add more projects: re-scrape the FourlinQ FB page, download the
// referenced images, append a new entry here.

export type ProjectCategory =
  | "casement"
  | "sliding"
  | "specialist"
  | "interior"
  | "exterior"
  | "doors";

export interface Project {
  id: string;
  /** Real location from the FourlinQ Facebook caption. */
  name: string;
  /** Specific area (city/municipality) when posted by the FourlinQ team. */
  location: string;
  /** Primary hero image, pulled from the FB scrape. */
  image: string;
  /** Additional photos from the same Facebook post — VERIFIED pairings
   *  (these images were posted together by FourlinQ themselves). */
  gallery?: string[];
  category?: ProjectCategory;
  caption?: string;
  description?: string;
  year?: number;
  architect?: string;
  quote?: { text: string; attribution: string };
  systemsUsed?: string[];
}

const FB = "/images/projects-fb";

export const projects: Project[] = [
  {
    id: "las-pinas-residence",
    name: "Las Piñas residence",
    location: "Las Piñas, Metro Manila",
    image: `${FB}/DOuJGHUl.jpg`,
    gallery: [
      `${FB}/ttZUwHC9.jpg`,
      `${FB}/1624zR2K.jpg`,
      `${FB}/wmPQfS3V.jpg`,
      `${FB}/x63pl_14.jpg`,
    ],
    category: "interior",
    caption: "FourlinQ published this as a completed Las Piñas windows-and-doors project.",
    description: "Published FourlinQ project record for a completed residence in Las Piñas.",
  },
  {
    id: "taytay-rizal-residence",
    name: "Taytay residence",
    location: "Taytay, Rizal",
    image: `${FB}/pndqSKzg.jpg`,
    gallery: [
      `${FB}/emyl2Fwr.jpg`,
      `${FB}/SKxVxxW4.jpg`,
      `${FB}/vzSdxxg0.jpg`,
      `${FB}/K6n763QM.jpg`,
    ],
    category: "casement",
    caption: "FourlinQ published this as a completed Taytay windows-and-doors project.",
    description: "Published FourlinQ project record for a completed residence in Taytay, Rizal.",
  },
  {
    id: "nuvali-laguna-residence",
    name: "Nuvali residence",
    location: "Nuvali, Laguna",
    image: `${FB}/mbArIDA5.jpg`,
    gallery: [
      `${FB}/u9QGO5wI.jpg`,
      `${FB}/AOQsrPKg.jpg`,
      `${FB}/5e9SkvSf.jpg`,
      `${FB}/gjR_DEfu.jpg`,
    ],
    category: "exterior",
    caption: "FourlinQ published this as a windows-and-doors turnover in Nuvali, Laguna.",
    description: "Published FourlinQ project record for a residence in Nuvali, Laguna.",
  },
  {
    id: "tagaytay-cavite-residence",
    name: "Tagaytay City residence",
    location: "Tagaytay City, Cavite",
    image: `${FB}/ZzCSzF_o.jpg`,
    gallery: [
      `${FB}/I0S5nOmZ.jpg`,
      `${FB}/WWWCQcpX.jpg`,
      `${FB}/Bf8HH614.jpg`,
      `${FB}/9OqANnRg.jpg`,
    ],
    category: "exterior",
    caption: "FourlinQ published this as a windows-and-doors turnover in Tagaytay City, Cavite.",
    description: "Published FourlinQ project record for a completed residence in Tagaytay City, Cavite.",
  },
  {
    id: "san-lorenzo-makati-aluminium",
    name: "San Lorenzo, Makati",
    location: "San Lorenzo, Makati",
    // Hero swapped to the finished-interior shot. The original hero
    // (P7DLic-T.jpg) was a construction-deck-with-scaffolding photo that
    // read as raw; the finished room with the awning-window grid is
    // editorial.
    image: `${FB}/yDrxH9L-.jpg`,
    gallery: [
      `${FB}/P7DLic-T.jpg`,
      `${FB}/P8m34kD5.jpg`,
      `${FB}/z8K5dOzz.jpg`,
      `${FB}/2vzBfKBe.jpg`,
    ],
    category: "doors",
    caption: "FourlinQ's first aluminium windows and doors installation.",
    description:
      "Turn-over completed. Proud to unveil our first aluminium windows and doors installation at San Lorenzo, Makati. A remarkable milestone made possible by the hard work of our team.",
  },
  {
    id: "cebu-s-residences",
    name: "Cebu — S. Residences",
    location: "Cebu",
    image: `${FB}/SISsEiUz.jpg`,
    gallery: [`${FB}/roGKW8A5.jpg`],
    category: "doors",
    caption: "FourlinQ published this as ‘Cebu Project: S. Residences.’",
    description: "Published FourlinQ archive record for S. Residences in Cebu.",
  },
  {
    id: "cebu-g-residences",
    name: "Cebu — G. Residences",
    location: "Cebu",
    image: `${FB}/bmZ6fgTu.jpg`,
    gallery: [`${FB}/GNCqPBUr.jpg`],
    category: "doors",
    caption: "FourlinQ published this as ‘Cebu Project: G. Residences.’",
    description: "Published FourlinQ archive record for G. Residences in Cebu.",
  },
  {
    id: "cebu-r-residences",
    name: "Cebu — R. Residences",
    location: "Cebu",
    image: `${FB}/1BZGuW8L.jpg`,
    category: "interior",
    caption: "FourlinQ published this as ‘Cebu Project: R. Residences.’",
    description: "Published FourlinQ archive record for R. Residences in Cebu.",
  },
  {
    id: "cebu-a-residences",
    name: "Cebu — A. Residences",
    location: "Cebu",
    image: `${FB}/hRCCxHm4.jpg`,
    category: "exterior",
    caption: "FourlinQ published this as ‘Cebu Project: A. Residences.’",
    description: "Published FourlinQ archive record for A. Residences in Cebu.",
  },
  {
    id: "batangas-c-residences",
    name: "Batangas — C. Residences",
    location: "Batangas",
    image: `${FB}/ohQTuBNz.jpg`,
    gallery: [
      `${FB}/zp4alT38.jpg`,
      `${FB}/aJiYThAZ.jpg`,
      `${FB}/6uH-fLmF.jpg`,
      `${FB}/mw3WVp7m.jpg`,
    ],
    category: "exterior",
    caption: "FourlinQ published this as ‘Batangas Project: C. Residences.’",
    description: "Published FourlinQ archive record for C. Residences in Batangas.",
  },
  {
    id: "bulacan-n-residence",
    name: "N. Residence",
    location: "Bulacan",
    image: `${FB}/ZoZWYiwi.jpg`,
    gallery: [
      `${FB}/S2T-OFy4.jpg`,
      `${FB}/-pFxhSkE.jpg`,
    ],
    category: "interior",
    caption: "FourlinQ published this as ‘N. Residence Project Site: Bulacan.’",
    description: "Published FourlinQ archive record for N. Residence in Bulacan.",
  },
  {
    id: "taguig-g-residence",
    name: "G. Residence",
    location: "Taguig City",
    image: `${FB}/BOyTwrQH.jpg`,
    gallery: [
      `${FB}/vhoJDNZw.jpg`,
      `${FB}/UdQMQaA-.jpg`,
    ],
    category: "interior",
    caption: "FourlinQ published this as ‘G. Residence Project Site: Taguig City.’",
    description: "Published FourlinQ archive record for G. Residence in Taguig City.",
  },
  // NOTE: Bataan project was dropped on 2026-05-24 — its only photo
  // (I5J0-ATK.jpg, 14 KB) was a pure black frame with just the FourlinQ
  // watermark. Unusable as a hero. When Tita supplies a real Bataan
  // install photo, restore the entry.
];
