import { cn } from "@/lib/utils";
import type { ThermalSystem, ThermalSystemId } from "@/data/scroll-window-phases";

interface ThermalSystemToggleProps {
  systems: ThermalSystem[];
  value: ThermalSystemId;
  onChange: (id: ThermalSystemId) => void;
  /** Disabled while the scroll animation is still settling on the frame. */
  disabled?: boolean;
}

/**
 * Premium segmented control: a red thumb glides under the active option with
 * the brand's signature easing. Selected label sits in white on the red thumb;
 * the unselected label is quiet ink. Disabled until the thermal frame settles.
 *
 * Implemented as a group of aria-pressed toggle buttons (not a tablist) so the
 * focus model matches a single-select control and the brand focus ring adapts
 * to each state (white on the red thumb, dark ink on the light track).
 */
const ThermalSystemToggle = ({
  systems,
  value,
  onChange,
  disabled = false,
}: ThermalSystemToggleProps) => {
  const activeIndex = Math.max(0, systems.findIndex((s) => s.id === value));

  return (
    <div
      role="group"
      aria-label="Window system"
      aria-disabled={disabled}
      className={cn(
        "relative grid grid-cols-2 w-full max-w-[26rem] mx-auto lg:mx-0 p-1",
        "rounded-full border border-[color:var(--rule-soft)]",
        "bg-[rgba(36,36,36,0.06)] backdrop-blur-sm shadow-depth-2",
        // Hidden entirely while disabled (scroll still animating / not settled);
        // fades in only once the thermal frame settles and the toggle is enabled.
        "transition-opacity duration-300 ease-out",
        disabled ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      {/* Sliding red thumb — width matches one column, shifts by its own width */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full",
          "bg-[color:var(--accent)] shadow-[0_4px_16px_-3px_rgba(200,16,46,0.55)]",
          "transition-transform duration-[450ms] ease-marvin",
        )}
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />

      {systems.map((system) => {
        const selected = system.id === value;
        return (
          <button
            key={system.id}
            type="button"
            aria-pressed={selected}
            tabIndex={disabled ? -1 : 0}
            disabled={disabled}
            title={disabled ? "Available once the section settles" : undefined}
            onClick={() => !disabled && onChange(system.id)}
            className={cn(
              "relative z-10 rounded-full px-3 py-2.5 text-center leading-tight",
              "text-[0.6875rem] sm:text-xs md:text-[0.8125rem] font-medium tracking-[0.01em]",
              "transition-[color,transform] duration-300 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
              disabled ? "cursor-not-allowed" : "cursor-pointer active:scale-[0.97]",
              selected
                ? "text-[color:var(--ink-inverse)] focus-visible:ring-[color:var(--ink-inverse)]"
                : "text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)] focus-visible:ring-[color:var(--ink-primary)]",
            )}
          >
            {system.label}
          </button>
        );
      })}
    </div>
  );
};

export default ThermalSystemToggle;
