interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

const Logo = ({ variant = "dark", className = "" }: LogoProps) => {
  const textColor = variant === "light" ? "#ffffff" : "currentColor";
  const lineColor = variant === "light" ? "#ffffff" : "currentColor";
  const subColor = variant === "light" ? "#ffffff" : "currentColor";
  const qColor = "#DC2626";

  return (
    <svg
      viewBox="0 0 200 58"
      className={`h-14 w-auto ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FourlinQ Windows & Doors"
    >
      {/* Baseline divider — rendered first so Q tail appears on top */}
      <line x1="3" y1="36" x2="197" y2="36" stroke={lineColor} strokeWidth="1" />
      {/* Main wordmark */}
      <text
        x="100"
        y="32"
        textAnchor="middle"
        style={{ fontFamily: "'Times New Roman', 'Times', serif", fontSize: "42px", fontWeight: 400 }}
      >
        <tspan fill={textColor}>Fourlin</tspan>
        <tspan fill={qColor} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>Q</tspan>
      </text>
      {/* Subtitle */}
      <text
        x="100"
        y="56"
        fill={subColor}
        textAnchor="middle"
        style={{ fontFamily: "'Times New Roman', 'Times', serif", fontSize: "23px", fontWeight: 400, letterSpacing: "0.03em" }}
      >
        Windows &amp; Doors
      </text>
    </svg>
  );
};

export default Logo;
