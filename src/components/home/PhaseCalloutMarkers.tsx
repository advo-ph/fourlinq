import type { Callout } from "@/data/scroll-window-phases";
import { cn } from "@/lib/utils";

interface Props {
  callouts: Callout[];
  /** Fade the pins in once the thermal still has settled. */
  active: boolean;
}

/**
 * Mobile counterpart to PhaseCalloutLines. A phone has no room for leader lines,
 * so each Part-2 callout instead drops a small numbered pin on its anchor point
 * on the cutaway still. The matching number is shown on the list item, so the
 * legend reads number-to-number. Positioned as a full-size layer inside the
 * media box, so the anchor percentages map straight onto the image.
 */
const PhaseCalloutMarkers = ({ callouts, active }: Props) => (
  <div
    className={cn(
      "pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out lg:hidden",
      active ? "opacity-100" : "opacity-0",
    )}
    aria-hidden="true"
  >
    {callouts.map((c, i) => (
      <span
        key={c.label + i}
        className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[color:var(--accent)] text-[0.65rem] font-semibold leading-none text-white shadow-[0_1px_5px_rgba(0,0,0,0.35)] ring-2 ring-white"
        style={{ left: `${c.anchor.x}%`, top: `${c.anchor.y}%` }}
      >
        {i + 1}
      </span>
    ))}
  </div>
);

export default PhaseCalloutMarkers;
