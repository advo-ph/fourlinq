// Project catalog — for /inspiration and individual /projects/:slug pages.
//
// CRITICAL: Names, locations, architects, years, AND gallery pairings are all
// intentionally minimal until Tita supplies real attribution.
//
// Earlier versions invented city names ("Quezon City residence",
// "Tagaytay residence", etc.) propagating placeholder copy as if it were truth.
// They also paired photos with the same filename stem (e.g.
// FourlinQ-Project-7.jpg + FourlinQ_Project-7.jpg) on the assumption they
// were the same project at different angles. Neither assumption was verified.
//
// As of 2026-05-24:
//   - Names describe ONLY what is visibly in the hero photo
//   - Location is always "Private residence"
//   - Galleries are removed (one hero photo per project, no invented pairings)
//   - architect / year / quote / systemsUsed all remain undefined
//
// When Tita supplies per-project attribution AND confirms which photos belong
// together, restore the gallery field and populate the other optionals.

export type ProjectCategory =
  | "casement"      // casement-window-led residence
  | "sliding"       // sliding-system-led
  | "specialist"    // arch / curtain wall / custom shapes
  | "interior"      // detailed interior shot
  | "exterior"      // facade-led project
  | "doors";        // door-system-led

export interface Project {
  id: string;
  /** Public-facing project name — until Tita confirms, this describes the
   *  VISUAL CONTENT of the photo, not a claimed location. */
  name: string;
  /** Verifiable from photo content only. "Private residence" is the safe
   *  default until a real location is supplied. */
  location: string;
  /** Primary hero image — these are real FourlinQ photo assets from
   *  /public/images/wp-export/. The PHOTOS are brochure-verified;
   *  the names + locations + descriptions are honest interpretations
   *  of what the photo shows. */
  image: string;
  /** Additional photos for the project detail page gallery. */
  gallery?: string[];
  /** Project category for the filter rail. Derived from visible content. */
  category: ProjectCategory;
  /** Editorial caption describing what the photo shows — visible-content
   *  only, no invented backstory. */
  caption?: string;
  /** Free-form description shown on the detail page. */
  description?: string;
  /** Year completed — UNDEFINED until Tita confirms. */
  year?: number;
  /** Architect / builder credit — UNDEFINED until Tita supplies. */
  architect?: string;
  /** Owner / architect quote — UNDEFINED until Tita supplies. */
  quote?: { text: string; attribution: string };
  /** Slugs of FourlinQ systems used. Only populated when verifiable from photo. */
  systemsUsed?: string[];
}

export const projects: Project[] = [
  {
    id: "modern-white-residence",
    name: "Modern white residence",
    location: "Private residence",
    image: "/images/wp-export/FourlinQ-Project-7.jpg",
    category: "casement",
    caption: "A modern white residence with floor-to-ceiling casement and sliding window systems opening to a planted garden.",
    description:
      "Casement and sliding window systems specified throughout this modern white residence. Daylight is the brief. The windows are sized to disappear into the wall and let the garden show through.",
  },
  {
    id: "curved-glass-residence",
    name: "Curved-glass residence",
    location: "Private residence",
    image: "/images/wp-export/FourlinQ-Project-8.jpg",
    category: "specialist",
    caption: "Custom-curved glazing forms the feature wall of this hillside residence.",
    description:
      "Curved-glass feature work and custom-shaped panels engineered to architect-specified geometry. The curve is unique to this project. Fabricated in our Manila workshop.",
  },
  {
    id: "garden-view-residence",
    name: "Garden-view residence",
    location: "Private residence",
    image: "/images/wp-export/FQC-Project-17.jpg",
    category: "interior",
    caption: "Full-height casement and fixed-panel windows opening onto a planted garden.",
    description:
      "Casement and fixed-panel installations spanning the full height of the living wall. The garden reads continuously through the glass. Minimal sightlines, maximum daylight.",
  },
  {
    id: "lanai-facing-residence",
    name: "Lanai-facing residence",
    location: "Private residence",
    image: "/images/wp-export/FQC-Project-18.jpg",
    category: "doors",
    caption: "Slide-and-fold door system opening the living room to the lanai.",
    description:
      "Slide-and-fold door system spanning the lanai opening. Closed for typhoon season, fully retracted for everyday living. The wall genuinely disappears.",
  },
  {
    id: "three-storey-residence",
    name: "Three-storey modern residence",
    location: "Private residence",
    image: "/images/brand-story.jpg",
    category: "exterior",
    caption: "A three-storey home outfitted with FourlinQ systems throughout: casement, sliding, and large panel doors.",
    description:
      "Whole-home FourlinQ specification across all three floors. Windows, doors, and feature glazing specified together for a coherent facade and consistent material spec.",
  },
  {
    id: "french-door-residence",
    name: "French door residence",
    location: "Private residence",
    image: "/images/wp-export/FQC-Project-10.jpg",
    category: "interior",
    caption: "French door installation with multi-point locking, framed in white.",
    description:
      "French door system between interior spaces. Multi-chamber uPVC profile with galvanized-steel reinforcement, multi-point locking. Specified for both security and acoustic isolation.",
  },
];
