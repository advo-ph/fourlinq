import { useRef, useEffect } from "react";
import Section from "@/components/primitives/Section";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import { cn } from "@/lib/utils";

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
 * Layout contract: the whole module — eyebrow, heading, lede, film and all
 * three variants — must read in a single screen. The section is therefore
 * sized to `--fq-svh` (the stable small-viewport height, px-pinned on touch
 * by stable-viewport.ts) rather than `dvh`: svh is the *smallest* the viewport
 * ever gets, so the fit survives mobile browser chrome expanding, and unlike
 * dvh it does not reflow mid-scroll. `min-h` not `h`, so an unusually short
 * window pushes the section taller instead of clipping copy.
 *
 * The film is no longer full-bleed. It sits in the right half of a split on
 * lg+, and its height is capped by `--film-h` so it can never eat the budget
 * the text needs: the box takes `min(column width, --film-h × 16/9)`, which
 * keeps 16:9 exact whichever constraint binds. The reel grid below is still
 * guttered but multi-card, so the two black modules stay visually distinct on
 * composition rather than on bleed.
 *
 * Below lg — where the layout is stacked, not split — the `--film-h` cap is
 * dropped and the film runs the full column instead (2026-09-04). On a short
 * or wide phone the cap used to bind before the column did, leaving the film
 * inset and centred with visible slack on both sides while the copy above it
 * ran edge to edge; it read as a mistake. The cap still governs lg+, where the
 * film shares vertical budget with the text column beside it.
 *
 * The sub-lg gutter is nudged to the ProjectReels gutter (16px, then 24px at
 * md) rather than container-editorial's flat 20px, so the two black video
 * modules on the homepage line up on mobile. Hence `-mx-1 md:mx-1 lg:mx-0` on
 * the film's wrapper: 4px out on mobile, 4px in on tablet, untouched on lg+.
 */

/**
 * The 16:9 film landed on 2026-09-03; the client's final cut replaced it the
 * same day. Her masters are HEVC, which Chrome and Firefox will not decode, so
 * the served file is transcoded to H.264 High / yuv420p and stripped of its
 * audio track (the element is muted anyway). Poster is frame 0, so the still
 * and the first played frame match.
 *
 * The `-v2` in the filename is load-bearing. Unlike `/images/` and
 * `/systems/anim/`, `/videos/` gets no cache exception in server/index.ts, so
 * it falls to the default `max-age=365d, immutable`. A film replaced at its own
 * path would never reach anyone who had already watched it. Every future
 * replacement therefore needs a NEW filename too — bump the suffix, delete the
 * old pair, and let the JS bundle hash carry the reference.
 *
 * Setting either constant back to `null` returns the section to its
 * placeholder state with no other change.
 */
const SLIM_DOOR_VIDEO: string | null = "/videos/systems/slim-alu-spotlight-v2.mp4";
const SLIM_DOOR_POSTER: string | null = "/videos/systems/slim-alu-spotlight-v2-poster.jpg";

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
    // Sub-lg the film simply takes the column. From lg it is the smaller of
    // the column and the width a `--film-h`-tall 16:9 box would need.
    // `aspect-video` owns the ratio either way, so the box is never letterboxed
    // or re-cropped — only scaled. When the height cap wins, the slack falls in
    // the gutter rather than the outer margin: the film's right edge stays
    // locked to the container margin on lg+.
    <div className="relative aspect-video w-full overflow-hidden bg-[#0a0a0a] lg:ml-auto lg:mr-0 lg:w-[min(100%,calc(var(--film-h)*16/9))]">
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

      {/* Hairline frame. Black film on a black section has no edge of its own
          now that it is contained, and it is what gives the placeholder state
          its defined top and bottom line. Replaces the two letterbox gradients
          the full-bleed version carried — nothing sits over the film any more,
          so they were scrim for no text. */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

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
    <Section
      tone="dark"
      size="sm"
      contained={false}
      noAnimation
      className={cn(
        // 2xl takes the extra outer margin, not xl: a 1280×720 laptop is xl and
        // has only ~80px of slack to spend, where a 1440×900 screen has ~250.
        "!bg-black flex min-h-[var(--fq-svh)] flex-col py-6 md:py-12 lg:py-14 2xl:py-20",
        // Height ceiling for the film, as a fraction of the screen. Mobile has
        // to carry the whole stack vertically, so the film gets the least.
        "[--film-h:calc(var(--fq-svh)*0.235)] md:[--film-h:calc(var(--fq-svh)*0.38)] lg:[--film-h:calc(var(--fq-svh)*0.46)]",
      )}
    >
      <div className="container-editorial flex w-full flex-1 flex-col">
        {/* Text left, film right on lg+; stacked below. Centred in whatever
            height is left after the variant strip, so a tall window reads as
            deliberate air rather than a gap. */}
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-7 md:gap-9 lg:flex-row lg:items-center lg:gap-12 xl:gap-16">
          <div className="lg:w-[40%] lg:shrink-0">
            {/* Heading stays level 2 to match the reels module below it; the
                arbitrary variants only walk the mobile/tablet steps down so the
                48px default cannot spend the screen budget on two loose lines.
                `leading` is set explicitly because EyebrowHeading's sub-xl sizes
                are bare `text-[Nrem]` arbitraries, which carry no line-height —
                they were inheriting ~1.5 and costing 28px of wrap. 1.1 matches
                the `text-h2` token the xl step uses. */}
            <EyebrowHeading
              level={2}
              toneInverse
              className="[&>h2]:text-balance [&>h2]:text-[2.25rem] [&>h2]:leading-[1.1] md:[&>h2]:text-[2.75rem] xl:[&>h2]:text-h2"
            >
              Slim ALU sliding doors.
            </EyebrowHeading>

            {/* Lede is rendered here rather than through EyebrowHeading's
                `lede` prop: that prop is locked to text-body-lg on mobile, and
                at 18px this paragraph alone costs ~80px more than the screen
                has to give. Same ink token, one step down the ramp.
                Both it and the heading step up at xl rather than lg: the split
                starts at lg (992px), where the text column is only ~360px wide
                — 56px display and a 20px lede wrap to 3 and 9 lines there and
                push the section past one screen. lg keeps the tablet step. */}
            <p className="mt-v400 max-w-[38rem] text-body leading-[1.5] text-white/70 md:mt-v500 md:text-body-lg md:leading-[1.6] xl:mt-v600 xl:text-lead xl:leading-[1.55]">
              Full-height glass on a slim aluminium frame, hung from a concealed top track.
              Anti-sway rollers keep the panels steady, soft close catches them at both ends,
              and a 5 mm profile wall carries the height. Works as a door or as a moving glass
              partition.
            </p>
          </div>

          {/* Negative/positive inline margin pulls the film off
              container-editorial's 20px gutter and onto the reels' 16px (md:
              24px) below lg. Neutral from lg, where the split owns the edges. */}
          <div className="-mx-1 min-w-0 md:mx-1 lg:mx-0 lg:flex-1">
            <SpotlightFilm />
          </div>
        </div>

        {/* Variant strip anchors the bottom edge. Hairline-divided rows on
            mobile (name over note), three columns from md. */}
        <ul className="mt-7 grid shrink-0 divide-y divide-white/10 border-t border-white/15 pt-5 md:mt-9 md:grid-cols-3 md:gap-8 md:divide-y-0 md:pt-6 lg:mt-10 lg:gap-12 lg:pt-8">
          {VARIANTS.map((variant) => (
            <li key={variant.name} className="py-2.5 first:pt-0 last:pb-0 md:py-0">
              {/* leading-tight only below md — the bare `text-[1.0625rem]`
                  arbitrary carries no line-height, unlike the h6/h5 tokens. */}
              <p className="font-serif text-[1.0625rem] leading-tight tracking-tight text-white md:text-h6 md:leading-[1.35] xl:text-h5">
                {variant.name}
              </p>
              <p className="mt-v100 text-body-sm text-white/60 md:mt-v200 md:text-body xl:mt-v300">
                {variant.note}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
};

export default SlimDoorSpotlight;
