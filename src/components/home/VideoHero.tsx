import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import HeroCarousel, { type HeroSlide } from "./HeroCarousel";
import EditorialButton from "@/components/primitives/Button";

/**
 * Decide once, synchronously on mount — no useEffect flicker.
 * Falls back to carousel only on EXPLICIT user opt-outs (reduced motion,
 * data saver) or actively bad network (slow-2g / 2g). Mobile width alone
 * is not a fallback trigger — we want the video on phones too.
 */
function shouldUseVideo(): boolean {
  if (typeof window === "undefined") return true; // SSR: optimistic
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const conn = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  const dataSaver = conn?.saveData === true;
  const slowNetwork = conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g";
  return !reduceMotion && !dataSaver && !slowNetwork;
}

interface VideoHeroProps {
  /** Path to the looping hero video (mp4/webm). Served from /public. */
  videoSrc: string;
  /** Optional static poster. Omit to let the dark canvas show through
   *  before first frame (no flash of an unrelated photo). */
  posterSrc?: string;
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
  // Decide on FIRST RENDER — no useEffect-driven swap, no flash of carousel.
  const [isVideoEligible] = useState(shouldUseVideo);
  const prefersReducedMotion = useReducedMotion();
  const useVideo = isVideoEligible && !prefersReducedMotion;

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
      style={{ height: "100dvh" }}
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

      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      {/* Top scrim — keeps the transparent white nav legible over bright hero content (e.g. sky-heavy fallback slides) */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/55 via-black/18 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-[5.75rem] sm:bottom-[6.5rem] md:bottom-[7rem] lg:bottom-[7.5rem]">
        <div className="container-editorial">
          <div className="w-full max-w-[43rem] text-left">
          {props.caption && (
            <p className="mb-3 text-body-sm font-medium text-white">
              {props.caption}
            </p>
          )}
          <h1 className="font-serif text-[2.35rem] font-normal leading-[1.04] tracking-tight text-white sm:text-[2.75rem] md:text-[3.15rem] lg:text-[3.75rem] xl:text-h1">
            {props.headline}
          </h1>
          <p className="mt-4 max-w-[34rem] text-body text-white/90 md:text-body-lg">
            {props.lede}
          </p>
          <div className="mt-7 flex w-full max-w-[26rem] flex-col items-start gap-3 md:max-w-none md:flex-row">
            <EditorialButton to={props.ctaTo} variant="primary" size="md">
              {props.ctaLabel}
            </EditorialButton>
            {props.secondaryLabel && props.secondaryTo && (
              <EditorialButton to={props.secondaryTo} variant="secondary" size="md">
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
