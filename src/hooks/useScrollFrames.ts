import { useRef, useState, useEffect, useCallback, type RefObject } from "react";
import type { ScrollPhase } from "@/data/scroll-window-phases";

interface UseScrollFramesOptions {
  containerRef: RefObject<HTMLElement | null>;
  totalFrames: number;
  phases: ScrollPhase[];
  enabled: boolean;
}

interface UseScrollFramesReturn {
  displayedFrame: number;
  scrollPhaseId: string;
  scrollPhaseProgress: number;
  scrollProgress: number;
}

const AUTO_PLAY_INTERVAL = 33.33; // ~30fps at 1×
const SPINNING_MAX_STEP = 3;
const BASE_SPEED = 1.3;  // default auto-play speed
const FAST_SPEED = 2.0;  // speed when phase-switching mid-animation

export function useScrollFrames({
  containerRef,
  totalFrames,
  phases,
  enabled,
}: UseScrollFramesOptions): UseScrollFramesReturn {
  const [displayedFrame, setDisplayedFrame] = useState(0);
  const [scrollPhaseId, setScrollPhaseId] = useState(phases[0]?.id ?? "");
  const [scrollPhaseProgress, setScrollPhaseProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const targetFrameRef = useRef(0);
  const displayedFrameRef = useRef(0);
  const lastAutoStepTimeRef = useRef(0);
  const rafRef = useRef(0);
  const scrollProgressRef = useRef(0);
  const prevPhaseIdxRef = useRef(-1);
  const isAcceleratedRef = useRef(false);
  const prevTargetRef = useRef(0);

  const phaseThresholds = useRef(
    phases.map((_, i) => i / phases.length),
  );

  const getPhaseForScroll = useCallback(
    (progress: number) => {
      if (!isFinite(progress)) return 0;
      const thresholds = phaseThresholds.current;
      for (let i = thresholds.length - 1; i >= 0; i--) {
        if (progress >= thresholds[i]) return i;
      }
      return 0;
    },
    [],
  );

  const getTargetFrame = useCallback(
    (progress: number): number => {
      const thresholds = phaseThresholds.current;
      const phaseIdx = getPhaseForScroll(progress);
      const phase = phases[phaseIdx];
      if (!phase) return 0;

      if (phase.mode === "scroll-mapped") {
        const phaseStart = thresholds[phaseIdx];
        const phaseEnd = thresholds[phaseIdx + 1] ?? 1;
        const phaseLen = phaseEnd - phaseStart;
        if (phaseLen <= 0) return phase.startFrame;
        const progressInPhase = Math.max(0, Math.min(1, (progress - phaseStart) / phaseLen));
        return Math.round(
          phase.startFrame + progressInPhase * (phase.endFrame - phase.startFrame),
        );
      }

      return phase.endFrame;
    },
    [phases, getPhaseForScroll],
  );

  const getScrollProgress = useCallback((): number => {
    const container = containerRef.current;
    if (!container) return 0;
    const rect = container.getBoundingClientRect();
    const earlyStart = window.innerHeight * (2 / 3);
    const scrollableDistance = container.offsetHeight - window.innerHeight + earlyStart;
    if (scrollableDistance <= 0) return 0;
    const scrolled = -rect.top + earlyStart;
    return Math.max(0, Math.min(1, scrolled / scrollableDistance));
  }, [containerRef]);

  useEffect(() => {
    if (!enabled) return;

    const onScroll = () => {
      scrollProgressRef.current = getScrollProgress();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled, getScrollProgress]);

  useEffect(() => {
    if (!enabled) return;

    const animate = (timestamp: number) => {
      const progress = scrollProgressRef.current;
      const target = getTargetFrame(progress);
      targetFrameRef.current = target;

      const phaseIdx = getPhaseForScroll(progress);
      const phase = phases[phaseIdx];
      if (!phase) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      let current = displayedFrameRef.current;

      // Detect phase switches for auto-play phases.
      // Compare current frame against the PREVIOUS phase's target — not the new
      // one — because target already jumps to the new phase's end frame the
      // moment the phase changes, so current !== target is always true at entry
      // regardless of whether the previous animation had settled.
      if (phase.mode !== "scroll-mapped" && phaseIdx !== prevPhaseIdxRef.current) {
        if (prevPhaseIdxRef.current !== -1) {
          const wasMoving = current !== prevTargetRef.current;
          if (wasMoving) {
            isAcceleratedRef.current = true;
          }
        }
        prevPhaseIdxRef.current = phaseIdx;
      }

      // Release acceleration as soon as the frame catches up.
      if (current === target) {
        isAcceleratedRef.current = false;
      }

      if (current !== target) {
        const delta = target - current;
        const direction = Math.sign(delta);
        const absDelta = Math.abs(delta);

        if (phase.mode === "scroll-mapped") {
          const step = Math.min(absDelta, SPINNING_MAX_STEP);
          current += direction * step;
        } else {
          const speed = isAcceleratedRef.current ? FAST_SPEED : BASE_SPEED;
          const effectiveInterval = AUTO_PLAY_INTERVAL / speed;
          if (timestamp - lastAutoStepTimeRef.current >= effectiveInterval) {
            current += direction * 1;
            lastAutoStepTimeRef.current = timestamp;
          }
        }

        current = Math.max(0, Math.min(totalFrames - 1, current));
        displayedFrameRef.current = current;
        setDisplayedFrame(current);
      }

      prevTargetRef.current = target;

      const scrollPhaseIdx = getPhaseForScroll(progress);
      const scrollPhase = phases[scrollPhaseIdx];
      if (scrollPhase) {
        const t = phaseThresholds.current;
        const scrollPhaseStart = t[scrollPhaseIdx];
        const scrollPhaseEnd = t[scrollPhaseIdx + 1] ?? 1;
        const scrollPhaseLen = scrollPhaseEnd - scrollPhaseStart;
        const scrollProg = scrollPhaseLen > 0
          ? Math.max(0, Math.min(1, (progress - scrollPhaseStart) / scrollPhaseLen))
          : 0;

        setScrollPhaseId(scrollPhase.id);
        setScrollPhaseProgress(scrollProg);
      }
      setScrollProgress(progress);

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, totalFrames, phases, getTargetFrame, getPhaseForScroll]);

  useEffect(() => {
    if (!enabled) return;
    const progress = getScrollProgress();
    const target = getTargetFrame(progress);
    const clamped = Math.max(0, Math.min(totalFrames - 1, target));
    displayedFrameRef.current = clamped;
    setDisplayedFrame(clamped);
  }, [enabled, getScrollProgress, getTargetFrame, totalFrames]);

  return { displayedFrame, scrollPhaseId, scrollPhaseProgress, scrollProgress };
}
