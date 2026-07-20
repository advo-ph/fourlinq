import EditorialImage from "./EditorialImage";
import { Reveal } from "./Reveal";

/**
 * An edge-to-edge image band with an optional caption line — the cinematic
 * breather between content sections. Renders full section width (no inner
 * container), so it reads as a full-bleed moment without a 100vw hack that
 * would trip the horizontal-overflow gate.
 *
 * Drop it OUTSIDE a <Section> (or in a <Section contained={false}>).
 */
interface FullBleedProps {
  src: string;
  alt: string;
  ratio?: string;
  caption?: string;
  eager?: boolean;
}

const FullBleed = ({ src, alt, ratio = "aspect-[21/9]", caption, eager = false }: FullBleedProps) => (
  <div className="relative w-full">
    <EditorialImage src={src} alt={alt} ratio={ratio} eager={eager} scrim={!!caption} />
    {caption && (
      <div className="absolute inset-0 flex items-end">
        <div className="container-editorial pb-6 lg:pb-10">
          <Reveal from="up">
            <p className="text-white/90 text-body-lg lg:text-lead max-w-[40ch] leading-snug">{caption}</p>
          </Reveal>
        </div>
      </div>
    )}
  </div>
);

export default FullBleed;
