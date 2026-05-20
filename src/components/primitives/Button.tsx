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
 * Marvin uses two button systems:
 *  - Primary: filled pill (50px radius), brand color
 *  - Secondary: zero-radius outlined, 2px border
 *  - Ghost: plain text, underline on hover
 */
const EditorialButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, EditorialButtonProps>(
  ({ children, variant = "primary", size = "md", to, href, className, fullWidth, ...rest }, ref) => {
    const sizeClass =
      size === "sm" ? "px-5 py-2.5 text-body-sm" :
      size === "lg" ? "px-8 py-4 text-body-lg" :
                      "px-6 py-3 text-body";

    const variantClass =
      variant === "primary"
        ? "rounded-full bg-[color:var(--accent)] text-white border-2 border-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] hover:border-[color:var(--accent-hover)]"
        : variant === "secondary"
        ? "rounded-none bg-transparent text-[color:var(--ink-primary)] border-2 border-[color:var(--ink-primary)] hover:bg-[color:var(--ink-primary)] hover:text-white"
        : "bg-transparent text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] underline-offset-4 hover:underline";

    const classes = cn(
      "inline-flex items-center justify-center font-sans font-medium tracking-wide",
      "transition-all duration-300 ease-marvin",
      "focus-visible:outline-none",
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
