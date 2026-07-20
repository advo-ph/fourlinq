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
    caption: "Modern window and door installations built for durability, style, and everyday comfort.",
    description:
      "FourlinQ proudly completes this Las Piñas project. Modern window and door installations built for durability, style, and everyday comfort. Every detail counts, from initial measurement to installation.",
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
    caption: "Premium windows and doors turned over for this Taytay home.",
    description:
      "Standard is never enough when it comes to your dream home. We officially turned over the keys to this gorgeous project in Taytay, Rizal, featuring our premium windows and doors. Better security. Better insulation. Better views.",
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
    caption: "Windows and doors turnover in Nuvali, Laguna.",
    description:
      "Another milestone achieved. We successfully completed the turnover for the new windows and doors on this project. These installations were more than just openings; they became the new face of the home, immediately providing better efficiency, more natural light, and a boost to curb appeal.",
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
    caption: "Style meets function. Every breathtaking view framed with perfection.",
    description:
      "Fresh views, new beginnings. We've just completed our windows and doors turnover in the breathtaking Tagaytay City, Cavite. Style meets function, and every view is framed with perfection.",
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
    name: "Cebu: S. Residences",
    location: "Alta Vista Subdivision, Pardo, Cebu City",
    image: `${FB}/SISsEiUz.jpg`,
    gallery: [`${FB}/roGKW8A5.jpg`],
    category: "doors",
    caption: "Sliding door installation at the S. Residences project.",
    description: "S. Residences in Alta Vista Subdivision, Pardo, Cebu City. Sliding doors and modern window installations.",
  },
  {
    id: "cebu-g-residences",
    name: "Cebu: G. Residences",
    location: "Vista Grande Subdivision, Talisay City",
    image: `${FB}/bmZ6fgTu.jpg`,
    gallery: [`${FB}/GNCqPBUr.jpg`],
    category: "doors",
    caption: "Modern window and door installation at the G. Residences project.",
    description: "G. Residences in Vista Grande Subdivision, Talisay City. Premium windows and doors tailored to the home's design.",
  },
  {
    id: "cebu-r-residences",
    name: "Cebu: R. Residences",
    location: "Monterrazas de Cebu, Guadalupe, Cebu City",
    image: `${FB}/1BZGuW8L.jpg`,
    category: "interior",
    caption: "Window and door installation at the R. Residences project.",
    description: "R. Residences in Monterrazas de Cebu, Guadalupe, Cebu City. Window and door installation in a hillside residence.",
  },
  {
    id: "cebu-a-residences",
    name: "Cebu: A. Residences",
    location: "Oslob, Cebu",
    image: `${FB}/hRCCxHm4.jpg`,
    category: "exterior",
    caption: "Modernist hillside residence in Oslob, Cebu.",
    description: "A. Residences in Oslob, Cebu. Modernist hillside home with white-frame elevator tower.",
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
    caption: "Window and door installation at the C. Residences project in Batangas.",
    description: "Batangas Project: C. Residences. Premium windows and doors specified throughout the home.",
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
    caption: "Window and door installation at the G. Residence in Taguig City.",
    description: "G. Residence Project Site: Taguig City. Upgrade your view. Elevate your living.",
  },
  // NOTE: Bataan project was dropped on 2026-05-24. Its only photo
  // (I5J0-ATK.jpg, 14 KB) was a pure black frame with just the FourlinQ
  // watermark. Unusable as a hero. When Tita supplies a real Bataan
  // install photo, restore the entry.
];
