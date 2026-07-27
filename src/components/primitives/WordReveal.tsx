import { useEffect, useRef, useMemo, type RefObject, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface WordRevealProps {
  children: ReactNode;
  /** Optional scrolling container. Defaults to window. */
  scrollContainerRef?: RefObject<HTMLElement>;
  /** Animate word-level blur in addition to opacity. Default true. */
  enableBlur?: boolean;
  /** Starting opacity for each word. Default 0.1. */
  baseOpacity?: number;
  /** Initial container rotation in degrees. Default 3. */
  baseRotation?: number;
  /** Blur amount in px at animation start. Default 4. */
  blurStrength?: number;
  /** ScrollTrigger end position for the container rotation tween. Default "bottom bottom-=15%". */
  rotationEnd?: string;
  /** ScrollTrigger end position for the per-word opacity/blur tweens. Default "bottom bottom-=15%". */
  wordAnimationEnd?: string;
  /** HTML element to render. Default "p". */
  as?: ElementType;
  className?: string;
}

/**
 * WordReveal — GSAP ScrollTrigger word-by-word reveal animation.
 *
 * Deliberately restrained defaults (opacity 0.1, rotation 3°, blur 4px) to
 * match the editorial tone of the Why uPVC page. Respects
 * prefers-reduced-motion by skipping all tweens and rendering text fully
 * visible at rest.
 *
 * Uses gsap.context() for scoped cleanup so multiple instances on the same
 * page do not clobber each other's ScrollTriggers on unmount.
 *
 * TIMING (changed 2026-07-27). The reveal used to end at "top center" — the
 * element's TOP reaching the viewport middle. Combined with scrub and a 0.05
 * stagger, which spreads the tween across the whole scrub range, that left the
 * tail of a paragraph at baseOpacity while the paragraph was fully on screen
 * and being read. A scan of /why-upvc found 57 paragraphs sitting entirely
 * inside the viewport with words still at opacity 0.1 and blur(4px) — worst on
 * the seven profile-feature claims, which are the page's technical argument.
 *
 * It now ends at "bottom bottom-=15%": the element's BOTTOM reaching 15% above
 * the viewport bottom, i.e. the moment the whole paragraph is comfortably in
 * view. The range is therefore "entering" to "fully readable" rather than
 * "entering" to "halfway up the screen", and it scales with the element — a
 * long paragraph gets a longer reveal, a short one a shorter one.
 */
const WordReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  rotationEnd = "bottom bottom-=15%",
  wordAnimationEnd = "bottom bottom-=15%",
  as: Tag = "p",
  className,
}: WordRevealProps) => {
  const containerRef = useRef<HTMLElement>(null);

  const splitContent = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((segment, index) => {
      // Preserve whitespace segments as-is (they collapse naturally in HTML)
      if (/^\s+$/.test(segment)) return segment;
      return (
        <span
          key={index}
          className="word"
          style={{ display: "inline-block" }}
        >
          {segment}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Skip all tweens when the user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scroller = scrollContainerRef?.current ?? window;

    // gsap.context() scopes all tweens/triggers to this element.
    // ctx.revert() only kills triggers created inside this context,
    // not those belonging to sibling or parent instances.
    const ctx = gsap.context(() => {
      // Container rotation — subtle tilt that unwinds as you scroll into view
      gsap.fromTo(
        el,
        { transformOrigin: "0% 50%", rotate: baseRotation },
        {
          ease: "none",
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top bottom",
            end: rotationEnd,
            scrub: 1,
          },
        }
      );

      const wordElements = el.querySelectorAll(".word");

      // Per-word opacity + blur reveal — single tween, single ScrollTrigger
      const fromVars: gsap.TweenVars = {
        opacity: baseOpacity,
        willChange: "opacity, filter",
        ...(enableBlur ? { filter: `blur(${blurStrength}px)` } : {}),
      };
      const toVars: gsap.TweenVars = {
        ease: "none",
        opacity: 1,
        // Under scrub, stagger is what strands the tail of a long paragraph:
        // the last word only lands at the very end of the range. 0.03 keeps the
        // left-to-right sweep visible while pulling the tail in.
        stagger: 0.03,
        ...(enableBlur ? { filter: "blur(0px)" } : {}),
        scrollTrigger: {
          trigger: el,
          scroller,
          // Start as the element enters rather than 20% in: with the end now
          // pinned to "fully readable", starting later would compress the whole
          // stagger into a very short scroll range and read as a flicker.
          start: "top bottom",
          end: wordAnimationEnd,
          scrub: 1,
        },
      };
      gsap.fromTo(wordElements, fromVars, toVars);
    }, el);

    return () => ctx.revert();
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
  ]);

  return (
    <Tag ref={containerRef} className={className}>
      {splitContent}
    </Tag>
  );
};

export default WordReveal;
