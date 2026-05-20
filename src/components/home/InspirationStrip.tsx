import { Link } from "react-router-dom";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FeatureLink from "@/components/primitives/FeatureLink";

interface Project {
  src: string;
  alt: string;
  location: string;
  systemType: string;
}

// Sourced from existing wp-export project assets — real FourlinQ projects only,
// AI-rendered candidates (Projects 1/3/5) excluded.
const projects: Project[] = [
  { src: "/images/wp-export/FourlinQ-Project-7.jpg", alt: "Modern white residence", location: "Quezon City residence", systemType: "Casement + Sliding" },
  { src: "/images/wp-export/FourlinQ-Project-8.jpg", alt: "Curved-glass home", location: "Tagaytay residence", systemType: "Special shapes" },
  { src: "/images/wp-export/FQC-Project-17.jpg", alt: "Interior windows to garden", location: "Antipolo residence", systemType: "Fixed panorama" },
  { src: "/images/wp-export/FQC-Project-18.jpg", alt: "Interior with sliding doors", location: "Las Piñas residence", systemType: "Sliding doors" },
  { src: "/images/brand-story.jpg", alt: "Three-story modern home", location: "Quezon City residence", systemType: "Full home package" },
  { src: "/images/wp-export/FQC-Project-10.jpg", alt: "Interior detail", location: "Makati residence", systemType: "French doors" },
];

const InspirationStrip = () => (
  <div>
    <div className="grid lg:grid-cols-[1fr,auto] items-end gap-8 mb-12 lg:mb-16">
      <EyebrowHeading eyebrow="Inspiration" level={2}>
        Real projects, real homes.
      </EyebrowHeading>
      <FeatureLink to="/inspiration">View full gallery</FeatureLink>
    </div>

    {/* Horizontal scroll on mobile/tablet; grid on desktop */}
    <div className="-mx-5 lg:mx-0 overflow-x-auto lg:overflow-visible no-scrollbar">
      <ul className="flex lg:grid lg:grid-cols-3 gap-4 lg:gap-6 px-5 lg:px-0">
        {projects.map((p) => (
          <li key={p.src} className="shrink-0 w-[78vw] sm:w-[58vw] md:w-[42vw] lg:w-auto">
            <Link to="/inspiration" className="group block">
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4">
                <p className="eyebrow text-[color:var(--ink-muted)] mb-2">{p.systemType}</p>
                <p className="font-serif text-h6 lg:text-h5 text-[color:var(--ink-primary)] tracking-tight">{p.location}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default InspirationStrip;
