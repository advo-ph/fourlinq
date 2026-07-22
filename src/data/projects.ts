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
// To add more projects: re-scrape the FourlinQ FB page, download the
// referenced images, append a new entry here.

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

export const projects: Project[] = [
  {
    id: "las-pinas-residence",
    name: "Las Piñas residence",
    location: "Las Piñas",
    image: `${FB}/ttZUwHC9.jpg`,
    gallery: [
      `${FB}/DOuJGHUl.jpg`,
      `${FB}/1624zR2K.jpg`,
      `${FB}/wmPQfS3V.jpg`,
      `${FB}/x63pl_14.jpg`,
    ],
    category: "interior",
    tag: ["windows", "doors", "interior"],
    caption: "Modern window and door installations built for durability, style, and everyday comfort.",
    description:
      "FourlinQ proudly completes this Las Piñas project. Modern window and door installations built for durability, style, and everyday comfort. Every detail counts, from initial measurement to installation.",
  },
  {
    id: "taytay-rizal-residence",
    name: "Taytay residence",
    location: "Taytay",
    image: `${FB}/pndqSKzg.jpg`,
    gallery: [
      `${FB}/emyl2Fwr.jpg`,
      `${FB}/SKxVxxW4.jpg`,
      `${FB}/vzSdxxg0.jpg`,
      `${FB}/K6n763QM.jpg`,
    ],
    category: "casement",
    tag: ["windows", "doors"],
    caption: "Premium windows and doors turned over for this Taytay home.",
    description:
      "Standard is never enough when it comes to your dream home. We officially turned over the keys to this gorgeous project in Taytay, featuring our premium windows and doors. Better security. Better insulation. Better views.",
  },
  {
    id: "nuvali-laguna-residence",
    name: "Nuvali residence",
    location: "Nuvali",
    image: `${FB}/mbArIDA5.jpg`,
    gallery: [
      `${FB}/u9QGO5wI.jpg`,
      `${FB}/AOQsrPKg.jpg`,
      `${FB}/5e9SkvSf.jpg`,
      `${FB}/gjR_DEfu.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Windows and doors turnover in Nuvali.",
    description:
      "Another milestone achieved. We successfully completed the turnover for the new windows and doors on this project. These installations were more than just openings; they became the new face of the home, immediately providing better efficiency, more natural light, and a boost to curb appeal.",
  },
  {
    id: "tagaytay-cavite-residence",
    name: "Tagaytay City residence",
    location: "Tagaytay City",
    image: `${FB}/ZzCSzF_o.jpg`,
    gallery: [
      `${FB}/I0S5nOmZ.jpg`,
      `${FB}/WWWCQcpX.jpg`,
      `${FB}/Bf8HH614.jpg`,
      `${FB}/9OqANnRg.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Style meets function. Every breathtaking view framed with perfection.",
    description:
      "Fresh views, new beginnings. We've just completed our windows and doors turnover in the breathtaking Tagaytay City. Style meets function, and every view is framed with perfection.",
  },
  {
    id: "san-lorenzo-makati-aluminium",
    name: "San Lorenzo, Makati",
    location: "Makati",
    // Hero swapped to the finished-interior shot. The original hero
    // (P7DLic-T.jpg) was a construction-deck-with-scaffolding photo that
    // read as raw; the finished room with the awning-window grid is
    // editorial.
    image: `${FB}/P7DLic-T.jpg`,
    gallery: [
      `${FB}/yDrxH9L-.jpg`,
      `${FB}/P8m34kD5.jpg`,
      `${FB}/z8K5dOzz.jpg`,
      `${FB}/2vzBfKBe.jpg`,
    ],
    category: "doors",
    tag: ["windows", "doors", "interior"],
    caption: "FourlinQ's first aluminium windows and doors installation.",
    description:
      "Turn-over completed. Proud to unveil our first aluminium windows and doors installation at San Lorenzo, Makati. A remarkable milestone made possible by the hard work of our team.",
  },
  {
    id: "cebu-s-residences",
    name: "F. Residence",
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
    name: "G. Residence",
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
    name: "R. Residence",
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
    name: "Ag. Residence",
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
    name: "Batangas: C. Residences",
    location: "Batangas",
    image: `${FB}/ohQTuBNz.jpg`,
    gallery: [
      `${FB}/zp4alT38.jpg`,
      `${FB}/aJiYThAZ.jpg`,
      `${FB}/6uH-fLmF.jpg`,
      `${FB}/mw3WVp7m.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Window and door installation at the C. Residences project in Batangas.",
    description: "Batangas Project: C. Residences. Premium windows and doors specified throughout the home.",
  },
  {
    id: "bulacan-n-residence",
    name: "N. Residence",
    location: "Bulacan",
    image: `${FB}/S2T-OFy4.jpg`,
    gallery: [
      `${FB}/ZoZWYiwi.jpg`,
      `${FB}/-pFxhSkE.jpg`,
    ],
    category: "interior",
    tag: ["windows", "doors", "interior"],
    caption: "Modern, high-quality windows and doors at the N. Residence in Bulacan.",
    description: "N. Residence Project Site: Bulacan. Durable, stylish windows and doors tailored to the home's design.",
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
    name: "N. Residence",
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
    name: "N. Residence",
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
    name: "Sch. Residence",
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
    name: "S. Residence",
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
    name: "As. Residence",
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
    name: "P. Residence",
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
    name: "M. Residence",
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
    name: "D. Residence",
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
    name: "E.S. Residence",
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
    name: "Residence",
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
    name: "M. Residence",
    location: "Cebu",
    // Enhanced photo (TASK1 deliverable).
    image: `${FB}/cebu-m-residence-2-2.jpg`,
    gallery: [
      `${FB}/cebu-m-residence-2.jpg`,
      `${FB}/cebu-m-residence-2-3.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu",
    description: "FourlinQ windows and doors installation in Cebu.",
  },
  {
    id: "cebu-ta-residence-monterrazas",
    name: "T.A. Residence",
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
    name: "F.'s Residence",
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
    id: "cebu-b-residence-monterrazas",
    name: "B. Residence",
    location: "Cebu City",
    // Original photo (marked no-enhancement-needed).
    image: `${FB}/cebu-b-residence-monterrazas.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cebu City",
    description: "FourlinQ windows and doors installation in Cebu City.",
  },
  {
    id: "cebu-t-residence-cebu-city",
    name: "T. Residence",
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
    name: "C. Residence",
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
    name: "D.S. Residence",
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
    name: "A.A. Residence",
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
    name: "M. Residence",
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
    id: "cebu-residence-alta-vista",
    name: "Residence",
    location: "Cebu",
    // Original photo (marked no-enhancement-needed).
    image: `${FB}/cebu-residence-alta-vista.jpg`,
    category: "exterior",
    tag: ["windows", "exterior"],
    caption: "Cebu",
    description: "FourlinQ windows and doors installation in Cebu.",
  },
  {
    id: "cebu-residence-vista-grande",
    name: "Residence",
    location: "Cebu",
    // Original photo (marked no-enhancement-needed).
    image: `${FB}/cebu-residence-vista-grande.jpg`,
    category: "exterior",
    tag: ["windows", "exterior"],
    caption: "Cebu",
    description: "FourlinQ windows and doors installation in Cebu.",
  },
  {
    id: "cebu-residence-vista-grande-talisay",
    name: "Residence",
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
    name: "Residence",
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
    name: "Residence",
    location: "Biñan",
    // Sourced from the FourlinQ Facebook page turnover post (scrape 2026-07-21).
    image: `${FB}/binan-residence.jpg`,
    gallery: [
      `${FB}/binan-residence-2.jpg`,
      `${FB}/binan-residence-3.jpg`,
      `${FB}/binan-residence-4.jpg`,
      `${FB}/binan-residence-5.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Biñan",
    description: "FourlinQ windows and doors installation in Biñan.",
  },
  {
    id: "bataan-s-residence",
    name: "S. Residence",
    location: "Bataan",
    // Sourced from the FourlinQ Facebook page turnover post (scrape 2026-07-21).
    image: `${FB}/bataan-s-residence.jpg`,
    gallery: [
      `${FB}/bataan-s-residence-2.jpg`,
      `${FB}/bataan-s-residence-3.jpg`,
      `${FB}/bataan-s-residence-4.jpg`,
      `${FB}/bataan-s-residence-5.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Bataan",
    description: "FourlinQ windows and doors installation in Bataan.",
  },
  {
    id: "sarangani-s-residence",
    name: "S. Residence",
    location: "Sarangani",
    // Sourced from the FourlinQ Facebook page turnover post (scrape 2026-07-21).
    image: `${FB}/sarangani-s-residence.jpg`,
    gallery: [
      `${FB}/sarangani-s-residence-2.jpg`,
      `${FB}/sarangani-s-residence-3.jpg`,
      `${FB}/sarangani-s-residence-4.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Sarangani",
    description: "FourlinQ windows and doors installation in Sarangani.",
  },
  {
    id: "cabanatuan-t-residence",
    name: "T. Residence",
    location: "Cabanatuan",
    // Sourced from the FourlinQ Facebook page turnover post (scrape 2026-07-21).
    image: `${FB}/cabanatuan-t-residence-3.jpg`,
    gallery: [
      `${FB}/cabanatuan-t-residence.jpg`,
      `${FB}/cabanatuan-t-residence-2.jpg`,
      `${FB}/cabanatuan-t-residence-4.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Cabanatuan",
    description: "FourlinQ windows and doors installation in Cabanatuan.",
  },
  {
    id: "fourlinq-turnover-1",
    name: "Residence",
    location: "Philippines",
    // Sourced from the FourlinQ Facebook page turnover post (scrape 2026-07-21).
    image: `${FB}/fourlinq-turnover-1-3.jpg`,
    gallery: [
      `${FB}/fourlinq-turnover-1.jpg`,
      `${FB}/fourlinq-turnover-1-2.jpg`,
      `${FB}/fourlinq-turnover-1-4.jpg`,
      `${FB}/fourlinq-turnover-1-5.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Recent FourlinQ turnover",
    description: "A recent FourlinQ windows and doors turnover.",
  },
  {
    id: "fourlinq-turnover-2",
    name: "Residence",
    location: "Philippines",
    // Sourced from the FourlinQ Facebook page turnover post (scrape 2026-07-21).
    image: `${FB}/fourlinq-turnover-2.jpg`,
    gallery: [
      `${FB}/fourlinq-turnover-2-3.jpg`,
      `${FB}/fourlinq-turnover-2-4.jpg`,
      `${FB}/fourlinq-turnover-2-5.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Recent FourlinQ turnover",
    description: "A recent FourlinQ windows and doors turnover.",
  },
  {
    id: "fourlinq-turnover-3",
    name: "Residence",
    location: "Philippines",
    // Sourced from the FourlinQ Facebook page turnover post (scrape 2026-07-21).
    image: `${FB}/fourlinq-turnover-3.jpg`,
    gallery: [
      `${FB}/fourlinq-turnover-3-2.jpg`,
      `${FB}/fourlinq-turnover-3-3.jpg`,
      `${FB}/fourlinq-turnover-3-4.jpg`,
      `${FB}/fourlinq-turnover-3-5.jpg`,
    ],
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    caption: "Recent FourlinQ turnover",
    description: "A recent FourlinQ windows and doors turnover.",
  },
  {
    id: "curved-facade-residence",
    name: "Residence",
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
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-01.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-02",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-02.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-03",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-03.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-04",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-04.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-05",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-05.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-06",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-06.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-07",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-07.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-08",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-08.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-09",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-09.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-10",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-10.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-11",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-11.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-12",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-12.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-13",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-13.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-14",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-14.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-residence-15",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-residence-15.jpg`,
    category: "exterior",
    tag: ["windows", "doors", "exterior"],
    description: "A FourlinQ windows and doors project.",
  },
  {
    id: "portfolio-interior-01",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-interior-01.jpg`,
    category: "interior",
    tag: ["windows", "doors", "interior"],
    description: "A FourlinQ interior windows and doors installation.",
  },
  {
    id: "portfolio-interior-02",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-interior-02.jpg`,
    category: "interior",
    tag: ["windows", "doors", "interior"],
    description: "A FourlinQ interior windows and doors installation.",
  },
  {
    id: "portfolio-interior-03",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown), added 2026-07-22.
    image: `${FB}/portfolio-interior-03.jpg`,
    category: "interior",
    tag: ["windows", "doors", "interior"],
    description: "A FourlinQ interior windows and doors installation.",
  },
  {
    id: "portfolio-interior-04",
    name: "Residence",
    location: "Philippines",
    // Portfolio image (source/location unknown); split out of portfolio-interior-01
    // on 2026-07-22 — the two photos are different projects.
    image: `${FB}/portfolio-interior-01-2.jpg`,
    category: "interior",
    tag: ["windows", "doors", "interior"],
    description: "A FourlinQ interior windows and doors installation.",
  },
];
