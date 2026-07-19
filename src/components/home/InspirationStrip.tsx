import { Link } from "react-router-dom";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FeatureLink from "@/components/primitives/FeatureLink";
import ScrollReveal from "@/components/primitives/ScrollReveal";
import { projects } from "@/data/projects";

const ProjectCard = ({
  project,
  aspect = "aspect-[4/3]",
  fillHeight = false,
}: {
  project: (typeof projects)[number];
  aspect?: string;
  fillHeight?: boolean;
}) => (
  <Link
    to={`/projects/${project.id}`}
    className={`group block ${fillHeight ? "flex flex-col h-full" : ""}`}
  >
    <ScrollReveal className={fillHeight ? "flex-1 min-h-0" : ""}>
      <div
        className={`relative overflow-hidden bg-neutral-100 ${fillHeight ? "h-full" : aspect}`}
      >
        <img
          src={project.image}
          alt={project.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03] ${fillHeight ? "absolute inset-0" : ""}`}
        />
      </div>
    </ScrollReveal>
    <div className="mt-4">
      <p className="eyebrow text-[color:var(--ink-muted)] mb-2">
        Published project
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
    <section className="relative bg-[color:var(--canvas)] py-section-mobile md:py-section-tablet lg:py-section-desktop">
      <div className="container-editorial">
        <div className="grid lg:grid-cols-[1fr,auto] items-end gap-8 mb-12 lg:mb-16">
          <EyebrowHeading eyebrow="Our Projects" level={2}>
            Projects from FourlinQ's published archive.
          </EyebrowHeading>
          <FeatureLink to="/inspiration">View full gallery</FeatureLink>
        </div>

        {/* Mobile */}
        <div className="lg:hidden -mx-5 overflow-x-auto no-scrollbar">
          <ul className="flex gap-4 px-5">
            {projects.map((p) => (
              <li
                key={p.id}
                className="shrink-0 w-[78vw] sm:w-[58vw] md:w-[42vw]"
              >
                <ProjectCard project={p} aspect="aspect-[4/3]" />
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-x-6 gap-y-12">
          <div className="lg:col-span-8">
            <ProjectCard project={feature} aspect="aspect-[16/10]" />
          </div>
          <div className="lg:col-span-4 flex flex-col">
            <ProjectCard project={second} fillHeight />
          </div>
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
    </section>
  );
};

export default InspirationStrip;
