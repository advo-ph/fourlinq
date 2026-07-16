import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface EditorialButtonBaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  /** Render as Link when provided. */
  to?: string;
  /** Render as anchor with href (external). */
  href?: string;
  className?: string;
  fullWidth?: boolean;
}

type EditorialButtonProps = EditorialButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof EditorialButtonBaseProps>;

/**
 * Showroom CTA system:
 *  - Primary: FourlinQ red, 4px radius, fixed-feeling width
 *  - Secondary: white fill, graphite text
 *  - Ghost: quiet tertiary text link
 */
const EditorialButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, EditorialButtonProps>(
  ({ children, variant = "primary", size = "md", to, href, className, fullWidth, ...rest }, ref) => {
    const sizeClass =
      size === "sm" ? "px-4 py-2 text-body-sm min-h-9" :
      size === "lg" ? "px-5 py-3 text-body min-h-10" :
                      "px-5 py-2.5 text-body min-h-10";

    const variantClass =
      variant === "primary"
        ? "rounded-sm bg-[color:var(--accent)] text-white border border-transparent hover:bg-[color:var(--accent-hover)] focus-visible:border-white"
        : variant === "secondary"
        ? "rounded-sm bg-white text-[color:var(--ink-secondary)] border border-[color:var(--rule-strong)] hover:border-[color:var(--ink-primary)] hover:bg-[color:var(--canvas-soft)] focus-visible:border-[color:var(--ink-primary)]"
        : "bg-transparent text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)] underline underline-offset-[6px] decoration-1 decoration-[color:var(--rule-strong)] hover:decoration-[color:var(--ink-primary)]";

    const classes = cn(
      "inline-flex items-center justify-center font-sans font-medium tracking-normal",
      "transition-[background-color,border-color,color] duration-300 ease-marvin",
      !fullWidth && variant !== "ghost" && "w-full sm:w-[200px]",
      sizeClass,
      variantClass,
      fullWidth && "w-full",
      className
    );

    if (to) {
      return (
        <Link ref={ref as React.Ref<HTMLAnchorElement>} to={to} className={classes}>
          {children}
        </Link>
      );
    }
    if (href) {
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...rest}>
        {children}
      </button>
    );
  }
);

EditorialButton.displayName = "EditorialButton";
export default EditorialButton;
