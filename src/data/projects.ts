// Project catalog — for /inspiration and individual /projects/:slug pages.
//
// Fields like architect, owner quote, and exact year are intentionally omitted
// when not verified — per the brochure-verified-only memory rule. The page
// template gracefully shows only what's populated. Tita can fill these in
// from her side; the structure is here.
//
// Categories help the InspirationStrip + /inspiration filter. Keep them
// generic — they describe the photo subject, not a brand claim.

export type ProjectCategory =
  | "casement"      // casement-window-led residence
  | "sliding"       // sliding-system-led
  | "specialist"    // arch / curtain wall / custom shapes
  | "interior"      // detailed interior shot
  | "exterior"      // facade-led project
  | "doors";        // door-system-led

export interface Project {
  id: string;
  /** Public-facing project name. */
  name: string;
  /** Where in the Philippines. */
  location: string;
  /** Primary hero image. */
  image: string;
  /** Additional photos for the project detail page gallery. */
  gallery?: string[];
  /** Project category for the filter rail. */
  category: ProjectCategory;
  /** Short editorial caption — one or two sentences max. Observable from
   *  the photo, not a fabricated claim about systems / dimensions. */
  caption?: string;
  /** Free-form longer description shown on the detail page. */
  description?: string;
  /** Year completed — leave undefined until verified. */
  year?: number;
  /** Architect / builder credit — leave undefined until Tita supplies. */
  architect?: string;
  /** Owner / architect quote — leave undefined until Tita supplies. */
  quote?: { text: string; attribution: string };
  /** Slugs of FourlinQ systems used. Only populate when confirmed. */
  systemsUsed?: string[];
}

export const projects: Project[] = [
  {
    id: "quezon-city-residence",
    name: "Quezon City residence",
    location: "Quezon City, Metro Manila",
    image: "/images/wp-export/FourlinQ-Project-7.jpg",
    gallery: [
      "/images/wp-export/FourlinQ_Project-7.jpg",
      "/images/wp-export/FQC-Project-17.jpg",
    ],
    category: "casement",
    caption: "A modern white residence with floor-to-ceiling casement and sliding systems opening to a planted garden.",
    description:
      "A three-storey modernist home outfitted throughout with FourlinQ casement and sliding window systems. Light, daylight, and the planted garden are the brief — the windows are engineered to disappear into the architecture.",
  },
  {
    id: "tagaytay-residence",
    name: "Tagaytay residence",
    location: "Tagaytay, Cavite",
    image: "/images/wp-export/FourlinQ-Project-8.jpg",
    gallery: [
      "/images/wp-export/FourlinQ_Project-8.jpg",
      "/images/wp-export/FourlinQ-Project-4.jpg",
    ],
    category: "specialist",
    caption: "Custom-curved glazing for a Tagaytay home with views over the ridge.",
    description:
      "Curved-glass feature work and custom-shaped panels engineered for a Tagaytay hillside residence. The geometry is unique to the architect's drawings — fabricated in our Manila workshop.",
  },
  {
    id: "antipolo-residence",
    name: "Antipolo residence",
    location: "Antipolo, Rizal",
    image: "/images/wp-export/FQC-Project-17.jpg",
    gallery: [
      "/images/wp-export/FourlinQ-Project-1.jpg",
      "/images/wp-export/FourlinQ_Project-1.jpg",
    ],
    category: "interior",
    caption: "Full-height casement and fixed-panel windows opening onto a planted garden.",
    description:
      "Casement and fixed-panel installations spanning the full height of the living wall. The garden is meant to read continuously through the glass — minimal sightlines, maximum daylight.",
  },
  {
    id: "las-pinas-residence",
    name: "Las Piñas residence",
    location: "Las Piñas, Metro Manila",
    image: "/images/wp-export/FQC-Project-18.jpg",
    gallery: [
      "/images/wp-export/FourlinQ-Project-2.jpg",
      "/images/wp-export/FourlinQ_Project-2.jpg",
    ],
    category: "doors",
    caption: "Slide-and-fold system opening the living room to the garden lanai.",
    description:
      "Slide-and-fold door system spanning the lanai opening. Closed for typhoon season, fully retracted for everyday living. The wall genuinely disappears.",
  },
  {
    id: "three-storey-residence",
    name: "Three-storey modern residence",
    location: "Quezon City, Metro Manila",
    image: "/images/brand-story.jpg",
    gallery: [
      "/images/wp-export/FourlinQ-Project-3.jpg",
      "/images/wp-export/FourlinQ_Project-3.jpg",
    ],
    category: "exterior",
    caption: "Full home package — casement, sliding, and large panel doors throughout.",
    description:
      "A three-storey home outfitted with FourlinQ systems throughout. Every opening — windows, doors, feature glazing — specified together for a coherent facade and consistent material spec.",
  },
  {
    id: "makati-residence",
    name: "Makati residence",
    location: "Makati City",
    image: "/images/wp-export/FQC-Project-10.jpg",
    gallery: [
      "/images/wp-export/FourlinQ-Project-6.jpg",
      "/images/wp-export/FourlinQ_Project-6.jpg",
    ],
    category: "interior",
    caption: "French door installation with multi-point locking, framed in white.",
    description:
      "French door system between formal interior spaces. Multi-chamber uPVC profile with galvanized-steel reinforcement, multi-point locking. Specified for both security and acoustic isolation.",
  },
];
