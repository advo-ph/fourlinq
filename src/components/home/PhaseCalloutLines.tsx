import { useEffect, useRef, type RefObject } from "react";
import type { Callout } from "@/data/scroll-window-phases";

interface Props {
  /** Origin element the coordinate system is measured against (the pinned box). */
  originRef: RefObject<HTMLElement | null>;
  /** The image box whose rect the anchor percentages map onto. */
  imageBoxRef: RefObject<HTMLElement | null>;
  /** Live refs to each list-item element (line start = item's right-center). */
  itemRefs: RefObject<(HTMLElement | null)[]>;
  callouts: Callout[];
  /** Extend lines toward the image when true; retract to the list item when false. */
  active: boolean;
}

const SHOW_MS_BASE = 340;
const SHOW_MS_VAR = 150; // small per-line variance → different finish times
const HIDE_MS = 200; // fast retract-out

/**
 * Thin gray connector lines from Part-2 list items to points on the cutaway
 * still, each tipped with a hollow white endpoint dot. Endpoints are recomputed
 * every frame from live element rects, so the lines stay anchored even if the
 * text shifts while the image stays put. Each line grows from its list item to
 * the anchor with a slight random speed variance, and retracts quickly when the
 * part is unhighlighted.
 */
const PhaseCalloutLines = ({ originRef, imageBoxRef, itemRefs, callouts, active }: Props) => {
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const tRef = useRef<number[]>([]);
  const showMsRef = useRef<number[]>([]);

  useEffect(() => {
    tRef.current = callouts.map((_, i) => tRef.current[i] ?? 0);
    showMsRef.current = callouts.map(() => SHOW_MS_BASE + Math.random() * SHOW_MS_VAR);
  }, [callouts]);

  useEffect(() => {
    let running = true;
    let lastTs = 0;
    let raf = 0;

    const draw = (ts: number) => {
      if (!running) return;
      const dt = lastTs ? Math.min(50, ts - lastTs) : 16;
      lastTs = ts;

      const origin = originRef.current?.getBoundingClientRect();
      const imgBox = imageBoxRef.current?.getBoundingClientRect();
      const items = itemRefs.current ?? [];

      let anyVisible = false;
      callouts.forEach((c, i) => {
        const line = lineRefs.current[i];
        if (!line) return;

        const target = active ? 1 : 0;
        const dur = active ? showMsRef.current[i] ?? SHOW_MS_BASE : HIDE_MS;
        let t = tRef.current[i] ?? 0;
        t += (target >= t ? 1 : -1) * (dt / dur);
        t = Math.max(0, Math.min(1, t));
        if (target === 1 && t > 0.999) t = 1;
        if (target === 0 && t < 0.001) t = 0;
        tRef.current[i] = t;
        if (t > 0.001) anyVisible = true;

        const itemEl = items[i];
        const circle = circleRefs.current[i];
        if (!itemEl || !origin || !imgBox) { line.style.opacity = "0"; if (circle) circle.style.opacity = "0"; return; }

        const ir = itemEl.getBoundingClientRect();
        const x0 = ir.right - origin.left;
        const y0 = ir.top + ir.height / 2 - origin.top;
        const x1 = imgBox.left + (imgBox.width * c.anchor.x) / 100 - origin.left;
        const y1 = imgBox.top + (imgBox.height * c.anchor.y) / 100 - origin.top;
        const ex = x0 + (x1 - x0) * t;
        const ey = y0 + (y1 - y0) * t;

        // Pull line end back by circle radius so the line doesn't pierce the dot.
        const r = 3;
        const dx = ex - x0;
        const dy = ey - y0;
        const len = Math.hypot(dx, dy);
        const lx2 = len > r ? ex - (dx / len) * r : ex;
        const ly2 = len > r ? ey - (dy / len) * r : ey;

        line.setAttribute("x1", String(x0));
        line.setAttribute("y1", String(y0));
        line.setAttribute("x2", String(lx2));
        line.setAttribute("y2", String(ly2));
        const vis = t > 0.02 ? "1" : "0";
        line.style.opacity = vis;

        // Hollow tip circle rides the true tip position.
        if (circle) {
          circle.setAttribute("cx", String(ex));
          circle.setAttribute("cy", String(ey));
          circle.style.opacity = vis;
        }
      });

      if (active || anyVisible) raf = requestAnimationFrame(draw);
      else running = false;
    };

    raf = requestAnimationFrame(draw);
    return () => { running = false; cancelAnimationFrame(raf); };
  }, [active, callouts, originRef, imageBoxRef, itemRefs]);

  return (
    <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
      {callouts.map((c, i) => (
        <g key={c.label + i}>
          <line
            ref={(el) => { lineRefs.current[i] = el; }}
            strokeWidth={0.75}
            strokeLinecap="round"
            style={{ stroke: "var(--ink-muted)", opacity: 0 }}
          />
          {/* Hollow white endpoint dot anchored to the image-side tip. */}
          <circle
            ref={(el) => { circleRefs.current[i] = el; }}
            r={3}
            fill="none"
            stroke="white"
            strokeWidth={1}
            style={{ opacity: 0 }}
          />
        </g>
      ))}
    </svg>
  );
};

export default PhaseCalloutLines;
