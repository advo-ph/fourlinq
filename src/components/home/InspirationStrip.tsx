import { Link } from "react-router-dom";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FeatureLink from "@/components/primitives/FeatureLink";
import { projects } from "@/data/projects";

/**
 * Inspiration strip — break-rhythm layout (1 feature + 2-up + 3-up below).
 * Marvin pattern: one project gets the big surface, two share the secondary
 * row, three fill the tail. Beats the prior 3x2 equal-grid which read as
 * Pinterest dump rather than editorial gallery.
 */

const categoryLabel: Record<string, string> = {
  casement: "Casement + Sliding",
  sliding: "Sliding",
  specialist: "Special shapes",
  interior: "Casement + Fixed",
  exterior: "Casement + Sliding",
  doors: "Slide & Fold",
};

const ProjectCard = ({
  project,
  aspect = "aspect-[4/3]",
}: {
  project: typeof projects[number];
  aspect?: string;
}) => (
  <Link to={`/projects/${project.id}`} className="group block">
    <div className={`relative ${aspect} overflow-hidden bg-neutral-100`}>
      <img
        src={project.image}
        alt={project.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
      />
    </div>
    <div className="mt-4">
      <p className="eyebrow text-[color:var(--ink-muted)] mb-2">
        {categoryLabel[project.category] ?? "Project"}
      </p>
      <p className="font-serif text-h6 lg:text-h5 text-[color:var(--ink-primary)] tracking-tight group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
        {project.location}
      </p>
    </div>
  </Link>
);

const InspirationStrip = () => {
  const [feature, second, third, ...rest] = projects;

  return (
    <div>
      <div className="grid lg:grid-cols-[1fr,auto] items-end gap-8 mb-12 lg:mb-16">
        <EyebrowHeading eyebrow="Inspiration" level={2}>
          Real projects, real homes.
        </EyebrowHeading>
        <FeatureLink to="/inspiration">View full gallery</FeatureLink>
      </div>

      {/* Mobile: simple stack (4-col scrolling row). Desktop: break-rhythm */}
      <div className="lg:hidden -mx-5 overflow-x-auto no-scrollbar">
        <ul className="flex gap-4 px-5">
          {projects.map((p) => (
            <li key={p.id} className="shrink-0 w-[78vw] sm:w-[58vw] md:w-[42vw]">
              <ProjectCard project={p} aspect="aspect-[4/3]" />
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop break-rhythm layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-x-6 gap-y-12">
        {/* Row 1: large feature (8 cols) + tall companion (4 cols) */}
        <div className="lg:col-span-8">
          <ProjectCard project={feature} aspect="aspect-[16/9]" />
        </div>
        <div className="lg:col-span-4">
          <ProjectCard project={second} aspect="aspect-[3/4]" />
        </div>

        {/* Row 2: 3 equal cards */}
        <div className="lg:col-span-4">
          <ProjectCard project={third} aspect="aspect-[4/3]" />
        </div>
        {rest.slice(0, 2).map((p) => (
          <div key={p.id} className="lg:col-span-4">
            <ProjectCard project={p} aspect="aspect-[4/3]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InspirationStrip;
