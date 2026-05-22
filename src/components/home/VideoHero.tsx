import { useEffect, useState } from "react";
import HeroCarousel, { type HeroSlide } from "./HeroCarousel";
import EditorialButton from "@/components/primitives/Button";

interface VideoHeroProps {
  /** Path to the looping hero video (mp4/webm). Served from /public. */
  videoSrc: string;
  /** Static poster shown before video loads + on mobile/slow connections. */
  posterSrc: string;
  /** Carousel slides used as the fallback when video can't / shouldn't play
   *  (reduced motion, save-data, narrow viewport). */
  fallbackSlides: HeroSlide[];

  headline: string;
  lede: string;
  ctaLabel: string;
  ctaTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;

  /** Eyebrow shown above headline (e.g. "Featured residence"). */
  caption?: string;
}

/**
 * Hero with a looping video on desktop and a graceful fallback to the
 * existing photo carousel under any of:
 *  - prefers-reduced-motion: reduce
 *  - Save-Data header (low-bandwidth or data-saver mode)
 *  - Slow connection (2g / slow-2g via navigator.connection)
 *  - Narrow viewport (under 768px — we don't want PH mobile users paying
 *    for 5MB+ of video just to see the hero)
 *
 * Video file recommendations:
 *  - 30s seamless loop, no audio (muted regardless)
 *  - 1920×1080 H.264 mp4 at ~3-5 Mbps for the desktop tier
 *  - Optional 720p webm/av1 variant for bandwidth savings
 *  - First frame should match the poster image exactly
 */
const VideoHero = (props: VideoHeroProps) => {
  const [useVideo, setUseVideo] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 767px)").matches;

    // Data-saver / slow connection — Chrome / Edge only, fail-open
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const dataSaver = conn?.saveData === true;
    const slowNetwork = conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g";

    setUseVideo(!reduceMotion && !narrow && !dataSaver && !slowNetwork);
  }, []);

  // Fallback to the existing photo carousel when video isn't appropriate
  if (!useVideo) {
    return (
      <HeroCarousel
        slides={props.fallbackSlides}
        headline={props.headline}
        lede={props.lede}
        ctaLabel={props.ctaLabel}
        ctaTo={props.ctaTo}
        secondaryLabel={props.secondaryLabel}
        secondaryTo={props.secondaryTo}
      />
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-[color:var(--canvas-dark)] -mt-[72px]"
      style={{ height: "min(100dvh, 920px)" }}
      aria-label="FourlinQ projects"
    >
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={props.videoSrc}
        poster={props.posterSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
      />

      {/* Same single bottom-up scrim as photo hero — keeps text legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5 pointer-events-none" />

      <div className="absolute inset-0 flex items-end pb-16 md:pb-20 lg:pb-24">
        <div className="container-editorial w-full">
          <div className="max-w-[42rem]" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}>
            {props.caption && (
              <p className="eyebrow !text-white mb-5 inline-flex items-center gap-3 before:content-[''] before:w-12 before:h-px before:bg-white/80">
                {props.caption}
              </p>
            )}
            <h1 className="font-serif font-normal tracking-tight text-white text-display-sm sm:text-[4rem] lg:text-h1 xl:text-display leading-[1.02]">
              {props.headline}
            </h1>
            <p className="mt-6 md:mt-8 text-body lg:text-body-lg text-white/90 max-w-[34rem]">
              {props.lede}
            </p>
            <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-4">
              <EditorialButton to={props.ctaTo} variant="primary" size="md">
                {props.ctaLabel}
              </EditorialButton>
              {props.secondaryLabel && props.secondaryTo && (
                <EditorialButton to={props.secondaryTo} variant="ghost" size="md" className="text-white hover:text-white">
                  {props.secondaryLabel}
                </EditorialButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoHero;
