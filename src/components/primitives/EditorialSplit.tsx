import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import EditorialImage from "./EditorialImage";
import { Reveal } from "./Reveal";

/**
 * The signature Marvin block: a large image on one side, a small amount of copy
 * on the other, alternating sides down the page. This is the layout that turns
 * a wall of text into a paced, photography-led story — the single highest-impact
 * pattern for the "not enough pictures / not enough creativity" problem.
 *
 * Copy stays deliberately short; the image carries the weight. Text reveals
 * from the side it sits on, so the eye is led across the split.
 */
interface EditorialSplitProps {
  image: string;
  alt: string;
  /** Image on the right (default) or left. Alternate down a page. */
  flip?: boolean;
  ratio?: string;
  eager?: boolean;
  /** Oversized editorial index numeral above the copy, e.g. "01". */
  index?: string;
  children: ReactNode;
  className?: string;
}

const EditorialSplit = ({
  image,
  alt,
  flip = false,
  ratio = "aspect-[5/6]",
  eager = false,
  index,
  children,
  className,
}: EditorialSplitProps) => (
  <div
    className={cn(
      "grid items-center gap-8 lg:gap-16 lg:grid-cols-2",
      flip && "lg:[&>*:first-child]:order-2",
      className,
    )}
  >
    <Reveal from={flip ? "left" : "right"}>
      <EditorialImage src={image} alt={alt} ratio={ratio} eager={eager} />
    </Reveal>
    <Reveal from={flip ? "right" : "left"} delay={0.1}>
      <div className="max-w-[34rem]">
        {index && (
          // Brand red per client feedback (2026-07 comments): "Numerical order
          // would work best if they were RED rather than GREY."
          <span className="block font-serif text-display leading-none text-[color:var(--accent)] mb-4 select-none">
            {index}
          </span>
        )}
        {children}
      </div>
    </Reveal>
  </div>
);

export default EditorialSplit;
