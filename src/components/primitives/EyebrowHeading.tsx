import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EyebrowHeadingProps {
  eyebrow?: string;
  /** Main heading. Renders as `<h{level}>`. */
  children: ReactNode;
  /** Optional subhead / lede paragraph. */
  lede?: ReactNode;
  level?: 1 | 2 | 3 | 4;
  /** Display = larger than h1, used for hero headlines (88px). */
  display?: boolean;
  align?: "left" | "center";
  className?: string;
  toneInverse?: boolean;
}

const headingSizeClass = (level: number, display: boolean) => {
  if (display) return "text-display-sm lg:text-display";
  if (level === 1) return "text-h2 lg:text-h1";
  if (level === 2) return "text-h3 lg:text-h2";
  if (level === 3) return "text-h4 lg:text-h3";
  return "text-h5 lg:text-h4";
};

const EyebrowHeading = ({
  eyebrow,
  children,
  lede,
  level = 2,
  display = false,
  align = "left",
  className,
  toneInverse = false,
}: EyebrowHeadingProps) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  const alignClass = align === "center" ? "text-center mx-auto" : "";
  const inkClass = toneInverse ? "text-[color:var(--ink-inverse)]" : "text-[color:var(--ink-primary)]";
  const ledeInkClass = toneInverse ? "text-white/70" : "text-[color:var(--ink-secondary)]";
  const eyebrowInkClass = toneInverse ? "text-white/60" : "text-[color:var(--ink-muted)]";

  return (
    <div className={cn(alignClass, "max-w-[60rem]", className)}>
      {eyebrow && (
        <p className={cn(
          "eyebrow mb-v400",
          eyebrowInkClass,
          align === "left" && "inline-flex items-center gap-3 before:content-[''] before:w-12 before:h-px before:bg-[color:var(--rule-strong)]"
        )}>
          {eyebrow}
        </p>
      )}
      <HeadingTag className={cn("font-serif font-medium tracking-tight", headingSizeClass(level, display), inkClass)}>
        {children}
      </HeadingTag>
      {lede && (
        <p className={cn("mt-v500 lg:mt-v600 text-body-lg lg:text-lead max-w-[42rem]", ledeInkClass, align === "center" && "mx-auto")}>
          {lede}
        </p>
      )}
    </div>
  );
};

export default EyebrowHeading;
