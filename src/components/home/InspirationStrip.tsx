import { Link } from "react-router-dom";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FeatureLink from "@/components/primitives/FeatureLink";
import { projects } from "@/data/projects";

const categoryLabel: Record<string, string> = {
  casement: "Casement + Sliding",
  sliding: "Sliding",
  specialist: "Special shapes",
  interior: "Casement + Fixed",
  exterior: "Casement + Sliding",
  doors: "Slide & Fold",
};

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
          <li key={p.id} className="shrink-0 w-[78vw] sm:w-[58vw] md:w-[42vw] lg:w-auto">
            <Link to={`/projects/${p.id}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4">
                <p className="eyebrow text-[color:var(--ink-muted)] mb-2">
                  {categoryLabel[p.category] ?? "Project"}
                </p>
                <p className="font-serif text-h6 lg:text-h5 text-[color:var(--ink-primary)] tracking-tight group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                  {p.location}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default InspirationStrip;
