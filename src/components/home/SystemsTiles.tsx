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
    description: "Casement, sliding, awning, and fixed-glass panels engineered for tropical climate performance.",
    image: "/images/wp-export/FourlinQ-Project-7.jpg",
    to: "/products?filter=windows",
  },
  {
    name: "Door Systems",
    description: "Slide-and-fold, large panel doors up to 6m, 90 series, lift-and-slide, and French doors.",
    image: "/images/wp-export/FQC-Project-18.jpg",
    to: "/products?filter=doors",
  },
  {
    name: "Specialist Systems",
    description: "Arch shapes, curtain walls, and custom-shaped panels for architectural projects.",
    image: "/images/brand-story.jpg",
    to: "/products",
  },
];

const SystemsTiles = () => (
  <div>
    <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-16 mb-16 lg:mb-20">
      <EyebrowHeading eyebrow="Our Systems" level={2}>
        Custom-made windows and doors for the Philippine climate.
      </EyebrowHeading>
      <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[34rem] lg:self-end">
        Three systems engineered for the architecture of life in the tropics —
        from quiet bedroom casements to 6-metre folding doors that open the
        whole house to a garden.
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
                  "transition-transform duration-500 ease-out group-hover:scale-[1.03]"
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
  </div>
);

export default SystemsTiles;
