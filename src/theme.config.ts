/**
 * FourlinQ Theme Config — Single Source of Truth
 * ────────────────────────────────────────────────
 *
 * This file is the only place where design intent lives. If the client wants
 * to change brand colors, button shapes, motion timings, or section padding,
 * change them here.
 *
 * Three mirrors consume from this config:
 *  1. tailwind.config.ts  — uses these values as Tailwind theme tokens
 *  2. src/index.css :root — exposes them as CSS variables for runtime
 *  3. This module         — imported by non-styling code (Framer Motion
 *                            ease curves, JS-driven motion, etc.)
 *
 * IMPORTANT: Updating a value here is NOT enough. You must also update the
 * corresponding entry in tailwind.config.ts and src/index.css. Treat this
 * file as the documented design contract and the others as caches.
 */

/* ─── BRAND ───────────────────────────────────────────────────────── */
export const BRAND = {
  /** Primary accent — used for CTAs, focus rings, single-state markers. */
  accent: "#C8102E",
  accentHover: "#A00D26",
  /** Quiet variant for subtle backgrounds (8% accent). */
  accentQuiet: "rgba(200, 16, 46, 0.08)",
} as const;

/* ─── INK (text colors on light backgrounds) ──────────────────────── */
export const INK = {
  primary:   "#242424", // body + display headings — AAA on white
  secondary: "#444444", // sub-body, lede — AA on white
  muted:     "#686868", // captions, eyebrows — AA on white
  faint:     "#909090", // disabled, placeholder — decorative only
  inverse:   "#FFFFFF",
} as const;

/* ─── INK ON DARK (for canvas-dark sections) ──────────────────────── */
export const INK_ON_DARK = {
  primary:   "#FFFFFF",
  secondary: "rgba(255, 255, 255, 0.78)", // 78% white — passes AA on #242424
  muted:     "rgba(255, 255, 255, 0.62)", // 62% — minimum for AA body
  faint:     "rgba(255, 255, 255, 0.42)", // decorative only
} as const;

/* ─── CANVAS / SURFACES ───────────────────────────────────────────── */
export const CANVAS = {
  white: "#FFFFFF",
  soft:  "#F8F8F8",
  cream: "#F9F7F1", // warm editorial backdrop
  dark:  "#242424",
} as const;

/* ─── RULES / DIVIDERS ────────────────────────────────────────────── */
export const RULE = {
  strong: "#D4D4D4",
  soft:   "#DFDFDF",
  faint:  "rgba(36, 36, 36, 0.06)",
} as const;

/* ─── BUTTON SHAPE (centralized for easy global swap) ─────────────── */
export const BUTTON = {
  /** "pill" = fully rounded, "square" = zero-radius, "rounded" = small radius. */
  primaryShape: "rounded" as "pill" | "square" | "rounded",
  /** Tailwind class to apply to primary buttons. */
  primaryRadiusClass: "rounded-sm",
  /** Outline thickness for buttons + tabs. */
  borderWidth: "3px",
} as const;

/* ─── MOTION ──────────────────────────────────────────────────────── */
export const MOTION = {
  /** Marvin signature curve, grep'd from production CSS. */
  ease:    [0.68, 0, 0.33, 1] as const,
  easeIn:  [0.33, 0, 0.68, 0] as const,
  easeOut: [0.33, 1, 0.68, 1] as const,
  duration: {
    instant: 100,
    quick:   200,
    base:    300,
    slow:    500,
    cinematic: 1200,
  },
} as const;

/* ─── LAYOUT ──────────────────────────────────────────────────────── */
export const LAYOUT = {
  containerMaxWidth: "87.5rem", // 1400px
  readingMaxWidth:   "52.5rem", // 840px
  headerHeight:      72,         // px
  /** Breakpoints (mirrors tailwind.config.ts screens). */
  breakpoints: {
    sm: 576,
    md: 768,
    lg: 992,   // dominant desktop pivot (matches Marvin)
    xl: 1200,
    "2xl": 1400,
  },
} as const;

/* ─── CHAT (LinQ assistant) ───────────────────────────────────────── */
export const CHAT = {
  bubbleDelayAfterScroll: 4000, // ms — how long after first scroll the chat icon fades in
  scrollThresholdToReveal: 120, // px — scroll distance before bubble qualifies for reveal
  suggestions: [
    "What systems do you offer?",
    "Is uPVC good for typhoons?",
    "How do I request a quote?",
    "Tell me about your finishes",
  ],
} as const;

/* ─── CONTACT (operational, not design — but stable per client) ───── */
export const CONTACT_FALLBACK = {
  salesPhone: "0925-848-8888",
  email: "sales@fourlinq.com",
} as const;
