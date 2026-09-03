import { useRef, useEffect } from "react";
import Section from "@/components/primitives/Section";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";

/**
 * Slim ALU spotlight — the new system, introduced above the project reels.
 *
 * Product facts come from the client's own supplier clips (2026-08-20,
 * "SlimDoor Chi 1–4"), not from the older `slim-door` catalogue entry. Those
 * clips settle the mechanism question that docs/MEETING_2026-08-12.md §8 left
 * open, and they contradict what `src/data/products.ts` currently claims:
 * Slim ALU **slides**, it does not swing. Internal codes she gave alongside
 * the clips — system "Haus-Linkage", model "ALU-HP-linkage door EB-45-16" —
 * are deliberately kept off the page; they are supplier SKUs, not copy.
 *
 * Nothing here asserts a dimension, a span, or a warranty. The clips show a
 * 5.0 mm profile wall, anti-sway rollers and two-way soft close; that is the
 * ceiling of what the copy below claims.
 */

/**
 * The 16:9 film landed on 2026-09-03. The client's master is HEVC, which
 * Chrome and Firefox will not decode, so the served file is transcoded to
 * H.264 High / yuv420p and stripped of its audio track (the element is muted
 * anyway). Poster is frame 0, so the still and the first played frame match.
 *
 * Setting either constant back to `null` returns the section to its
 * placeholder state with no other change.
 */
const SLIM_DOOR_VIDEO: string | null = "/videos/systems/slim-alu-spotlight.mp4";
const SLIM_DOOR_POSTER: string | null = "/videos/systems/slim-alu-spotlight-poster.jpg";

const VARIANTS = [
  { name: "HP-Linkage", note: "Move one panel, the rest follow." },
  { name: "HP-Synchronized", note: "Every panel travels together from one push." },
  // Spelled "and", matching the client's own wording — the serif ampersand
  // in Cormorant is a decorative Et ligature that reads as a symbol at this size.
  { name: "HP-Slide and Fold", note: "Panels slide flush, then fold aside." },
];

function SpotlightFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Same play-on-enter, pause-on-exit contract the project reels use, so the
  // two video modules on this page behave identically.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.readyState >= 2) {
            tryPlay();
          } else {
            video.load();
            video.addEventListener("canplay", tryPlay, { once: true });
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-[#0a0a0a]">
      {SLIM_DOOR_VIDEO ? (
        <video
          ref={videoRef}
          src={SLIM_DOOR_VIDEO}
          poster={SLIM_DOOR_POSTER ?? undefined}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // Placeholder must read as "deliberately empty", not as a broken
        // asset: a soft centre wash keeps it off flat black, and the label
        // sits at the same optical weight as an eyebrow.
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07),transparent_70%)]"
        />
      )}

      {/* Cinema letterbox edges. They frame the film when it lands and give
          the placeholder a defined top and bottom line. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

      {!SLIM_DOOR_VIDEO && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <span className="h-px w-10 bg-brand-500" />
          <p className="eyebrow text-white/45">Film in production</p>
        </div>
      )}
    </div>
  );
}

const SlimDoorSpotlight = () => {
  return (
    <Section tone="dark" size="lg" contained={false} className="!bg-black" noAnimation>
      <div className="px-4 md:px-6 lg:px-8">
        <div className="container-editorial mb-12 lg:mb-16">
          <EyebrowHeading
            level={2}
            eyebrow="New system"
            toneInverse
            lede="Full-height glass on a slim aluminium frame, hung from a concealed top track. Anti-sway rollers keep the panels steady, soft close catches them at both ends, and a 5 mm profile wall carries the height. Works as a door or as a moving glass partition."
          >
            Slim ALU sliding doors.
          </EyebrowHeading>
        </div>
      </div>

      {/* Full-bleed film — deliberately edge-to-edge, unlike the guttered reel
          grid below it, so the two black modules stay visually distinct. */}
      <SpotlightFilm />

      <div className="px-4 md:px-6 lg:px-8">
        <div className="container-editorial mt-12 lg:mt-16">
          <ul className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-10">
            {VARIANTS.map((variant) => (
              <li key={variant.name}>
                <p className="font-serif text-h6 lg:text-h5 tracking-tight text-white">
                  {variant.name}
                </p>
                <p className="mt-v300 text-body text-white/60">{variant.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
};

export default SlimDoorSpotlight;
