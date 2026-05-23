import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import AccentStripe from "@/components/primitives/AccentStripe";
import { cn } from "@/lib/utils";

interface SystemTile {
  name: string;
  description: string;
  image: string;
  to: string;
}

const systems: SystemTile[] = [
  {
    name: "Window Systems",
    description: "Casement, sliding, awning, and fixed glass — sized and sealed for the way light moves through a Philippine home.",
    image: "/images/wp-export/FourlinQ-Project-7.jpg",
    to: "/products/windows",
  },
  {
    name: "Door Systems",
    description: "Slide & Fold, Large Panel up to six metres, Lift & Slide, 90 Series — the wall that opens when you want it to.",
    image: "/images/wp-export/FQC-Project-18.jpg",
    to: "/products/doors",
  },
  {
    name: "Specialist Systems",
    description: "Arches, curtain walls, and bespoke geometry — for the projects that refuse the standard catalog.",
    image: "/images/brand-story.jpg",
    to: "/products/specialist",
  },
];

const SystemsTiles = () => (
  <div>
    <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-16 mb-16 lg:mb-20">
      <EyebrowHeading eyebrow="Our Systems" level={2}>
        Three families. Every shape a Philippine home needs.
      </EyebrowHeading>
      <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[34rem] lg:self-end leading-[1.65]">
        From a quiet bedroom casement to a six-metre folding wall that opens
        the whole house to the garden — and the bespoke geometry in between.
      </p>
    </div>

    <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
      {systems.map((sys) => (
        <li key={sys.name}>
          <Link to={sys.to} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
              <img
                src={sys.image}
                alt={sys.name}
                loading="lazy"
                decoding="async"
                className={cn(
                  "w-full h-full object-cover",
                  "transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
                )}
              />
            </div>
            <div className="mt-6">
              <AccentStripe width="sm" color="accent" className="mb-4" />
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-serif text-h4 lg:text-h3 font-normal tracking-tight text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                  {sys.name}
                </h3>
                <ArrowUpRight
                  size={20}
                  className="text-[color:var(--ink-muted)] mt-1 shrink-0 transition-transform duration-300 ease-marvin group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--accent)]"
                />
              </div>
              <p className="mt-3 text-body-sm lg:text-body text-[color:var(--ink-secondary)] max-w-[24rem]">
                {sys.description}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>

    {/* Finishes wow-link */}
    <div className="mt-20 lg:mt-28 border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16 grid lg:grid-cols-[1fr,1fr] gap-10 items-center">
      <div>
        <p className="eyebrow mb-4">Every system, eleven ways</p>
        <h3 className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight leading-[1.1] max-w-[18ch]">
          Pick a finish. Watch it change.
        </h3>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[24rem] leading-relaxed">
          Seven heat-fused wood-grain laminates, four solid colors — engineered to hold their finish through 25 years of tropical sun.
        </p>
        <Link
          to="/finishes"
          className="group inline-flex items-center gap-1.5 text-body-sm font-medium text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
        >
          Explore the 11 finishes
          <ArrowUpRight size={16} strokeWidth={1.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 ease-marvin" />
        </Link>
      </div>
    </div>
  </div>
);

export default SystemsTiles;
