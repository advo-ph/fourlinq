import { useEffect, useRef, useState, useCallback } from "react";
import { REVERSE_PIVOT_FRAME, PLAYBACK_FPS, type WindowPart } from "@/data/scroll-window-phases";

const FRAME_MS = 1000 / PLAYBACK_FPS;
// Catch-up sweeps run at this rate regardless of display refresh frequency.
const FAST_FPS = 200;
const FAST_FRAME_MS = 1000 / FAST_FPS;
// If more than this many milliseconds have elapsed since the last step (e.g.
// the tab was backgrounded), snap the clock forward rather than dumping a
// burst of frames all at once.
const MAX_CATCHUP_MS = FRAME_MS * 8;

interface Options {
  /** Index of the part whose text is currently centered (-1 = none yet). */
  activeIndex: number;
  parts: WindowPart[];
  enabled: boolean;
}

interface Return {
  /** 1-indexed frame currently shown. */
  displayedFrame: number;
  /** True when playback is resting on the active part's stop frame. */
  settled: boolean;
}

type Move = { type: "jump" | "sweep"; to: number; fast?: boolean };

/**
 * The text (in normal document flow) decides which PART is active as it scrolls
 * through the pinned image. When a part becomes active, its frame segment
 * auto-plays (start→stop) and rests on the stop frame. Frames are never scrubbed.
 *
 * Transitions:
 *  - To any part: jump to its start, play to its stop.
 *  - Special case Part 2 → Part 1 (backward): reverse-play from the current
 *    frame to REVERSE_PIVOT_FRAME, jump to frame 1, then play to Part 1's stop.
 */
export function useSegmentedFrames({ activeIndex, parts, enabled }: Options): Return {
  const [displayedFrame, setDisplayedFrame] = useState(parts[0]?.startFrame ?? 1);
  const [settled, setSettled] = useState(false);

  const displayedRef = useRef(parts[0]?.startFrame ?? 1);
  const queueRef = useRef<Move[]>([]);
  const prevActiveRef = useRef(-1);
  const activeIndexRef = useRef(activeIndex);
  const lastStepRef = useRef(0);

  const buildQueue = useCallback(
    (fromIdx: number, toIdx: number, current: number): Move[] => {
      const P1 = parts[0], P2 = parts[1], P3 = parts[2];
      const PIVOT = REVERSE_PIVOT_FRAME; // 83 — Part 2's clean (non-morph) entry
      const p1done = current === P1.stopFrame;

      // ── → Part 0 (run-in / scrolled back above Part 1) ──────
      if (toIdx < 0) {
        // From Part 1: just reverse to frame 1.
        if (fromIdx <= 0) return [{ type: "sweep", to: P1.startFrame }];
        // From Part 2: speed to the pivot, then skip to frame 1.
        if (fromIdx === 1) {
          return [{ type: "sweep", to: PIVOT, fast: true }, { type: "jump", to: P1.startFrame }];
        }
        // From Part 3: finish Part 3 fast, then skip to frame 1.
        return [{ type: "sweep", to: P3.stopFrame, fast: true }, { type: "jump", to: P1.startFrame }];
      }

      // ── → Part 1 ───────────────────────────────────────────
      if (toIdx === 0) {
        // From the run-in: play Part 1 normally from the start.
        if (fromIdx < 0) {
          return [{ type: "jump", to: P1.startFrame }, { type: "sweep", to: P1.stopFrame }];
        }
        // Backward from Part 2: speed to the pivot (never reverse through the
        // 59–82 morph), skip to frame 1, then play Part 1.
        if (fromIdx === 1) {
          return [
            { type: "sweep", to: PIVOT, fast: true },
            { type: "jump", to: P1.startFrame },
            { type: "sweep", to: P1.stopFrame },
          ];
        }
        // Backward skip from Part 3: fast-reverse to Part 1's stop frame.
        return [{ type: "sweep", to: P1.stopFrame, fast: true }];
      }

      // ── → Part 2 ───────────────────────────────────────────
      if (toIdx === 1) {
        // Backward from Part 3: finish Part 3 fast, then play Part 2 from the pivot.
        if (fromIdx >= 2) {
          return [
            { type: "sweep", to: P3.stopFrame, fast: true },
            { type: "jump", to: PIVOT },
            { type: "sweep", to: P2.stopFrame },
          ];
        }
        // Forward from a FINISHED Part 1: smooth morph 59→116.
        if (fromIdx === 0 && p1done) {
          return [{ type: "sweep", to: P2.stopFrame }];
        }
        // Forward from an UNFINISHED Part 1 (or the run-in): fast-reverse to
        // frame 1, then clean-enter Part 2 at the pivot.
        return [
          { type: "sweep", to: P1.startFrame, fast: true },
          { type: "jump", to: PIVOT },
          { type: "sweep", to: P2.stopFrame },
        ];
      }

      // ── → Part 3 ───────────────────────────────────────────
      // Forward from Part 2: finish Part 2 fast, skip the removed frame, play Part 3.
      if (fromIdx === 1) {
        return [
          { type: "sweep", to: P2.stopFrame, fast: true },
          { type: "jump", to: P3.startFrame },
          { type: "sweep", to: P3.stopFrame },
        ];
      }
      // Skip from Part 1 (finished or not) or the run-in: fast-reverse to frame 1,
      // then clean-enter Part 3 at its start.
      return [
        { type: "sweep", to: P1.startFrame, fast: true },
        { type: "jump", to: P3.startFrame },
        { type: "sweep", to: P3.stopFrame },
      ];
    },
    [parts],
  );

  // Enqueue a new segment whenever the active part changes.
  useEffect(() => {
    activeIndexRef.current = activeIndex;
    if (!enabled) return;
    queueRef.current = buildQueue(prevActiveRef.current, activeIndex, displayedRef.current);
    prevActiveRef.current = activeIndex;
  }, [activeIndex, enabled, buildQueue]);

  // Playback loop.
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;

    const tick = (ts: number) => {
      const q = queueRef.current;
      let current = displayedRef.current;

      if (q.length > 0) {
        const head = q[0];
        if (head.type === "jump") {
          current = head.to;
          q.shift();
          lastStepRef.current = ts;
        } else {
          const dir = Math.sign(head.to - current);
          if (dir === 0) {
            q.shift();
          } else {
            // Time-based advance: carries the remainder so effective rate is
            // independent of display refresh frequency (60 Hz, 120 Hz, etc.).
            const frameMs = head.fast ? FAST_FRAME_MS : FRAME_MS;
            let elapsed = ts - lastStepRef.current;
            // Resync guard: if the tab was backgrounded and elapsed is huge,
            // snap the clock instead of releasing a burst of frames.
            if (!head.fast && elapsed > MAX_CATCHUP_MS) {
              lastStepRef.current = ts;
              elapsed = 0;
            }
            if (elapsed >= frameMs) {
              const remaining = Math.abs(head.to - current);
              const steps = Math.min(Math.floor(elapsed / frameMs), remaining);
              current += dir * steps;
              lastStepRef.current += steps * frameMs;
              if (current === head.to) q.shift();
            }
          }
        }
        if (current !== displayedRef.current) {
          displayedRef.current = current;
          setDisplayedFrame(current);
        }
      }

      const idx = activeIndexRef.current;
      const isSettled = idx >= 0 && q.length === 0 && current === parts[idx].stopFrame;
      setSettled((prev) => (prev !== isSettled ? isSettled : prev));

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, parts]);

  return { displayedFrame, settled };
}
