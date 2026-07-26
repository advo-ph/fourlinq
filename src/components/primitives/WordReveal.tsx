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
  /** ScrollTrigger end position for the container rotation tween. Default "top center". */
  rotationEnd?: string;
  /** ScrollTrigger end position for the per-word opacity/blur tweens. Default "top center". */
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
 */
const WordReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  rotationEnd = "top center",
  wordAnimationEnd = "top center",
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
        stagger: 0.05,
        ...(enableBlur ? { filter: "blur(0px)" } : {}),
        scrollTrigger: {
          trigger: el,
          scroller,
          start: "top bottom-=20%",
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
