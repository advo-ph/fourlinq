import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "./Reveal";

/**
 * A big-type moment: a few short phrases set at display size, revealed one line
 * at a time. This is the "oomph" device — a section that is mostly whitespace
 * and one confident statement, the way Marvin lets a single serif line own a
 * full scroll. Use sparingly; its power is scarcity.
 *
 * Pass phrases as separate lines so each rises in sequence.
 */
interface StatementProps {
  lines: string[];
  /** Muted trailing lines (e.g. the last phrase) for a two-tone statement. */
  dimFrom?: number;
  align?: "left" | "center";
  inverse?: boolean;
  className?: string;
}

const Statement = ({ lines, dimFrom, align = "left", inverse = false, className }: StatementProps) => (
  <Stagger
    gap={0.12}
    className={cn(align === "center" && "text-center mx-auto", className)}
  >
    <p
      className={cn(
        "font-serif font-normal tracking-tight leading-[1.04] text-h1 lg:text-display",
        align === "center" ? "max-w-[20ch] mx-auto" : "max-w-[18ch]",
      )}
    >
      {lines.map((line, i) => (
        <StaggerItem key={line} className="block">
          <span
            className={cn(
              dimFrom !== undefined && i >= dimFrom
                ? inverse ? "text-white/45" : "text-[color:var(--ink-muted)]"
                : inverse ? "text-white" : "text-[color:var(--ink-primary)]",
            )}
          >
            {line}
          </span>
        </StaggerItem>
      ))}
    </p>
  </Stagger>
);

export default Statement;
