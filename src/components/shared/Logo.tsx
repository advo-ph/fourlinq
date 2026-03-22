interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

const Logo = ({ variant = "dark", className = "" }: LogoProps) => {
  const textColor = variant === "light" ? "text-white" : "text-foreground";
  const lineColor = variant === "light" ? "bg-white/60" : "bg-foreground/30";
  const subColor = variant === "light" ? "text-white/80" : "text-muted-foreground";

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <span
        className={`text-2xl font-medium leading-none ${textColor}`}
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Fourlin<span className="text-accent font-semibold">Q</span>
      </span>
      <div className={`w-full h-px ${lineColor} my-1`} />
      <span
        className={`text-[10px] tracking-[0.15em] ${subColor}`}
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Windows &amp; Doors
      </span>
    </div>
  );
};

export default Logo;
