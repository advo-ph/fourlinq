import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    screens: {
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
      "2xl": "1400px",
    },
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "3rem" },
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Inter Fallback"', "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', '"Instrument Serif Fallback"', "Georgia", "serif"],
        display: ['"Instrument Serif"', '"Instrument Serif Fallback"', "Georgia", "serif"],
      },
      fontSize: {
        // Editorial scale calibrated to Marvin's hjumbo 88px → body 16px (5.5× ratio)
        "eyebrow-s": ["0.75rem",  { lineHeight: "1.4", letterSpacing: "0.15em" }],
        "eyebrow":   ["0.8125rem", { lineHeight: "1.4", letterSpacing: "0.12em" }],
        "eyebrow-l": ["0.875rem",  { lineHeight: "1.4", letterSpacing: "0.10em" }],
        "body-sm":   ["0.875rem", { lineHeight: "1.55" }],
        "body":      ["1rem",     { lineHeight: "1.65" }],
        "body-lg":   ["1.125rem", { lineHeight: "1.6" }],
        "lead":      ["1.25rem",  { lineHeight: "1.55" }],
        "h6":        ["1.25rem",  { lineHeight: "1.4", letterSpacing: "-0.005em" }],
        "h5":        ["1.5rem",   { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        "h4":        ["1.875rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        "h3":        ["2.5rem",   { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "h2":        ["4rem",     { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "h1":        ["5rem",     { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display":   ["7rem",     { lineHeight: "1.0", letterSpacing: "-0.025em" }],
        // Mobile display fallback (use via responsive utilities)
        "display-sm": ["3.5rem",  { lineHeight: "1.05", letterSpacing: "-0.02em" }],
      },
      spacing: {
        // Marvin's v-space-* scale (000-900) + section-pad direct values
        "v0":   "0",
        "v050": "0.125rem", // 2px
        "v100": "0.25rem",  // 4px
        "v200": "0.5rem",   // 8px
        "v250": "0.75rem",  // 12px
        "v300": "1rem",     // 16px
        "v350": "1.25rem",  // 20px
        "v400": "1.5rem",   // 24px
        "v500": "2rem",     // 32px
        "v600": "2.5rem",   // 40px
        "v700": "3rem",     // 48px
        "v800": "3.5rem",   // 56px
        "v900": "4rem",     // 64px
        "section-mobile":  "3rem",   // 48px
        "section-tablet":  "4.5rem", // 72px
        "section-desktop": "7.5rem", // 120px
      },
      colors: {
        // Marvin-mirrored neutrals
        neutral: {
          50:  "#F8F8F8",
          100: "#F5F5F5",
          150: "#DFDFDF",
          200: "#B6B6B6",
          300: "#909090",
          400: "#686868",
          500: "#444444",
          600: "#282B2F",
          700: "#242424",
        },
        // FourlinQ red, used with Marvin's restraint
        brand: {
          50:  "#FFF5F6",
          100: "#FCE8EB",
          200: "#F4B8C2",
          300: "#E88598",
          400: "#D63B57",
          500: "#C8102E",
          600: "#A00D26",
          700: "#7A0A1D",
        },
        // shadcn compatibility — keep so existing components don't break
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        charcoal: {
          DEFAULT: "hsl(var(--charcoal))",
          light: "hsl(var(--charcoal-light))",
        },
        surface: "hsl(var(--surface))",
      },
      borderRadius: {
        none: "0",
        xs: "0.125rem",  // 2px
        sm: "0.25rem",   // 4px
        DEFAULT: "0.25rem",
        md: "0.5rem",    // 8px
        lg: "var(--radius)",
        full: "9999px",
      },
      boxShadow: {
        // Marvin's depth-1..8 — ultra-subtle 2-layer shadows
        "depth-1": "0 0 1px 0 rgba(36,36,36,0.04), 0 0.5px 1.5px 0 rgba(36,36,36,0.19)",
        "depth-2": "0 0.25px 1px 0 rgba(36,36,36,0.04), 0 0.85px 3px 0 rgba(36,36,36,0.19)",
        "depth-4": "0 0.5px 1.75px 0 rgba(36,36,36,0.04), 0 1.85px 6.25px 0 rgba(36,36,36,0.19)",
        "depth-6": "0 0.25px 3px 0 rgba(36,36,36,0.04), 0 2.75px 9px 0 rgba(36,36,36,0.19)",
        "depth-8": "0 0.5px 5px 0 rgba(36,36,36,0.04), 0 3.75px 11px 0 rgba(36,36,36,0.19)",
      },
      transitionTimingFunction: {
        // Marvin's actual easings
        out: "cubic-bezier(0.215, 0.61, 0.355, 1)", // easeOutCubic — their dominant curve
        soft: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        100: "100ms",
        200: "200ms",
        250: "250ms", // Marvin's hover default
        300: "300ms",
        400: "400ms",
        500: "500ms",
        1200: "1200ms", // hero cross-fade
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 500ms cubic-bezier(0.215, 0.61, 0.355, 1)",
        "fade-in": "fade-in 400ms cubic-bezier(0.215, 0.61, 0.355, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
