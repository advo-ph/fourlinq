# FourlinQ Design System

**Version 2.0 — March 2026**
This document is the single source of truth for all UI decisions on the FourlinQ website. Any AI agent, developer, or designer working on this codebase must follow these guidelines exactly. Do not deviate without explicit instruction.

---

## Brand Identity

**Company:** FourlinQ Windows & Doors
**Positioning:** Premium uPVC windows and doors for the Philippine market. Custom-made to suit customers' specifications.
**Tone:** Warm, precise, confident. Not cold or corporate. Not overly casual.
**Aesthetic:** "Tropical Futurism" — Tesla-inspired, minimalist premium with dark accents.
**Brand promise:** "A Lifetime of Satisfaction and Peace of Mind."
**Key narrative pillars:** Custom-made to specification · 10-Year Warranty · Corrosion resistance · Weather resistance · Sound insulation · Fire retardant · Thermal efficiency
**Data source:** All brand claims, contact info, branches, product types, finishes, and advantages are sourced from `src/data/fourlinq-data.ts` — verified from official printed brochures and physical profile samples. Do NOT add claims not present in that file without client verification.

---

## Logo

- **Font:** Playfair Display (serif)
- **Wordmark:** `Fourlin` in white or dark (context-dependent) + `Q` in red `#DC2626`
- **Divider:** Thin horizontal line below the wordmark
- **Subline:** `Windows & Doors` in small text, tracked, below the divider
- **Variants:**
  - `light` — white text on dark/image backgrounds (hero, footer)
  - `dark` — dark text on white backgrounds (scrolled nav, inner pages)
- **Component:** `src/components/shared/Logo.tsx`
- The red `Q` is the brand signature — accent red is also used for CTA buttons and active states
- **Favicon:** The red Playfair Display `Q` glyph, exported as SVG path (`public/favicon.svg`) + PNG sizes (180, 192, 512)
- **Apple Touch Icon:** `public/apple-touch-icon.png` (180×180)
- **OG Image:** `public/images/hero-bg.jpg` — used as the social/messenger preview image

---

## Color System

```
--background:     #FFFFFF   /* White — primary page background */
--foreground:     #0A0A0A   /* Near-black — body text, headings */
--surface:        #FFFFFF   /* White — cards, modals, nav */
--border:         #E5E5E5   /* Light gray — dividers, card borders */
--muted:          #F5F5F5   /* Soft gray — muted backgrounds */
--muted-fg:       #666666   /* Medium gray — captions, labels, meta */
--accent:         #DC2626   /* Red — CTA buttons, logo Q, active states */
--accent-hover:   #B91C1C   /* Darker red — button hover */
--charcoal:       #0A0A0A   /* Near-black — primary dark element */
--charcoal-light: #1A1A1A   /* Charcoal — utility bar, footer */
```

**Key principles:**
- White backgrounds for content areas
- Dark charcoal (`#0d0d0d`) for footer and CTA sections
- Dark utility bar (`#171717`)
- Red accent for interactive elements (buttons, active nav, logo Q)
- No cream, no navy — the palette is strictly black/white/red

---

## Typography

**Body & UI font:** DM Sans (Google Fonts)
**Logo & brand font:** Playfair Display (Google Fonts, serif)
**Fallback:** `system-ui, -apple-system, sans-serif`

```
Font weights used (DM Sans):
  300 — Light (large display text only)
  400 — Regular (body copy)
  500 — Medium (UI labels, nav items)
  600 — SemiBold (headings, buttons, CTAs)

Playfair Display weights:
  400 — Regular (logo wordmark)
  600 — SemiBold (logo Q)
```

### Type Scale

```
Display (Hero H1):   text-5xl to text-7xl  / weight 700 / color white (on hero)
H1 (Page heading):   text-3xl to text-4xl  / weight 600 / color foreground
H2 (Section):        text-2xl to text-3xl  / weight 600 / color foreground
H3 (Subsection):     text-xl               / weight 600 / color foreground
H4 (Card title):     text-base             / weight 500 / color foreground
Body:                text-base / line-height 1.6  / weight 400 / color foreground
Caption / Meta:      text-sm  / weight 400 / color muted-foreground
Label (uppercase):   text-[10px] / tracking-[0.15em] / weight 500 / color muted-foreground
```

### Navigation Text

- Nav links: `text-sm font-medium uppercase tracking-wide`
- Utility bar links: `text-[11px] font-medium uppercase tracking-[0.08em]`

---

## Spacing System

Based on an 8px base unit.

```
4px   — xs
8px   — sm
12px  — md
16px  — base
24px  — lg
32px  — xl
48px  — 2xl
64px  — 3xl
80px  — 4xl
120px — section vertical padding
```

**Page layout:**

- Max content width: `1280px` centered (`max-w-7xl`)
- Horizontal padding: `24px` (px-6)
- Border radius: `0.25rem` (sharp, premium feel)

---

## Navigation

### Utility Bar (top)

- Background: `#171717` (dark charcoal)
- Text: white/70 opacity, 11px, uppercase, tracked
- Links: `FIND A DEALER` · `SUPPORT` · `TECHNICAL SPECS`
- Right-aligned
- Height: `32px`
- Fixed position, always visible

### Main Navigation

- Fixed below utility bar (`top: 32px`)
- Transparent on homepage hero, transitions to `bg-white/98 backdrop-blur-xl shadow-sm` on scroll
- No border-bottom (shadow only for separation)
- Logo left-aligned (Logo component, light/dark variant based on scroll state)
- Nav items: uppercase, tracked, text-sm font-medium
- Active page: `text-accent` (red)
- Hover: `text-accent` (red)
- Right: "GET A QUOTE" red button (inline, not shadcn Button)
- Desktop breakpoint: `lg` (1024px) — below this, show hamburger menu
- Separate `Windows` and `Doors` nav items with mega menus

### Mega Menu (desktop)

Two-column layout:

1. **Left sidebar** — "By Type" / "By Material" links + "All Windows/Doors" link, neutral-50 background
2. **Right area** — Product type icons in 2-column grid with SVG icons + labels

Background: white
Opens on hover, closes on mouse leave with 200ms delay

### Mobile Navigation

- Full-screen overlay, white background
- Logo + close (×) at top
- Main links as large text rows with border dividers
- `Windows` and `Doors` rows show `›` chevron — tap opens sub-panel
- Sub-panel: Back button + section title + icon+label rows + "View all →" red link
- "GET A QUOTE" red button at bottom

---

## Buttons

### Primary CTA (used in hero, CTA banners, nav)

```
Background: #DC2626 (accent red)
Text: white
Font: text-sm font-medium uppercase tracking-[0.08em]
Padding: px-8 py-4 (hero), px-5 py-2 (nav)
Border-radius: none (sharp edges)
Hover: bg-red-700 (#B91C1C), -translate-y-0.5
```

### Secondary / Outline

```
Background: transparent
Border: 1px solid white/40 (on dark) or border-border (on light)
Text: white (on dark) or foreground (on light)
Same font treatment as primary
Hover: bg-white text-black (on dark) or bg-muted (on light)
```

### Filter Pills

```
Border-radius: rounded-full
Active: bg-primary text-primary-foreground (black bg, white text)
Inactive: bg-card border border-border text-muted-foreground
```

---

## Cards

**Product Card:**

- Background: white (`bg-card`)
- Border: `1px solid border`
- Border-radius: `rounded-lg`
- Image: full-width top, aspect ratio 4:3, `object-contain` with white background + padding
- Hover: `shadow-lg` transition
- Meta label: uppercase tracked muted text above product name
- Product name: font-medium text-primary
- Description: text-sm text-muted-foreground
- SVG type icon badge: top-right corner, 24px, on white/80 backdrop-blur pill

---

## Window & Door Icons

### SVG Icons (in code)

Custom SVG icon components in `src/components/icons/WindowIcons.tsx`:

- ViewBox: `0 0 80 80`
- Stroke: `currentColor`
- Stroke-width: `1.5px` default
- Fill: none
- Motion indicators: dashed lines, small arrowheads

Types: Casement, Awning, Sliding, Fixed, Tilt & Turn, Sliding Door, Bifold, Lift & Slide, French Door, Entrance

### PNG Icons (from client)

Minimalistic white icons in `public/images/icons/`:

Awning, Bay and Bow, Bi-Fold, Casement, Commercial, Corner, Double Hung, Entry, Interior, Lift and Slide, Multi-Slide, Picture/Direct Glaze, Single Hung, Sliding, Sliding/Glider, Specialty Shapes/Round Top, Swinging

These are white on transparent — change fill color as needed for context.

---

## Hero Section

- Full-screen height (`h-screen min-h-[600px]`)
- Background: `hero-bg.jpg` with light gradient overlay (`from-black/30 via-black/10 to-transparent`) — keep the image bright and visible
- Nav scrim: `from-black/40 via-black/15 to-transparent` (h-28) — just enough for nav readability
- Headline: "Precision. Performance. Perfection." — bold, white, large serif-like scale
- Subtext: white/80, max-w-md
- Two CTAs: red primary + white-bordered secondary
- Framer Motion fade-up animation

---

## CTA Banner Section

- Background: `bg-primary` (near-black)
- Text: white
- Headline + subtext centered
- Two buttons: red primary + white-bordered outline
- Used between content sections for conversion points

---

## Footer

- Background: `#0d0d0d` (very dark charcoal)
- Text: white
- Logo component (light variant)
- Brand tagline + verified contact info (email, sales phone) below logo
- 4 link columns: Brand, Products, Support, Legal
- Column headers: uppercase tracked white/40
- Links: white/70, hover to white
- Bottom bar: copyright + social links, separated by white/10 border-top
- Contact data sourced from `CONTACT` in `fourlinq-data.ts`

---

## Animations

Use Framer Motion. All animations should feel calm and premium — never bouncy or playful.

```
Fade up on scroll:
  initial: { opacity: 0, y: 24 }
  animate: { opacity: 1, y: 0 }
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }

Staggered children:
  Each child delayed by 100ms from previous

Product grid (filter change):
  initial: { opacity: 0, y: 12 }
  animate: { opacity: 1, y: 0 }
  exit: { opacity: 0 }
  AnimatePresence mode="wait"

Page transitions:
  Fade only, 200ms
```

Do not use spring physics, rotation, scale bounces, or color-shift animations.

---

## What NOT to Do

- Do not use cream, beige, or warm gray backgrounds — the palette is clean white
- Do not use navy/dark blue — replaced by near-black charcoal
- Do not use shadows heavier than `shadow-lg`
- Do not use gradients except on hero image overlays and CTA sections
- Do not use any color outside the defined palette
- Do not add emojis in production UI
- Do not use `AnimatePresence mode="popLayout"` with `layout` — causes z-index overflow issues
- Do not use shadcn Button component on dark backgrounds (use inline Link/button with explicit colors)
- Do not allow nav links to wrap — enforce `whitespace-nowrap` and use `lg` breakpoint for desktop nav

---

## Adaptive Navbar

The navbar detects dark background sections and adapts automatically:

- **On hero (not scrolled):** Transparent background, white text with subtle text-shadow
- **Over light sections (scrolled):** White background, dark text, shadow-sm
- **Over dark sections (scrolled):** Semi-transparent dark backdrop (`bg-black/40 backdrop-blur`), white text

Implementation: `elementFromPoint` samples the element behind the nav on scroll, computes luminance, and sets `overDark` state when luminance < 60.

---

## Admin Dashboard (`/admin`)

- **Nav:** Dark bar (`#0a0a0a`) with Logo (light variant) + "Admin" label. Matches main site header style.
- **Stat Cards:** 4 cards (New Leads, Quotes, Contacts, Configs) with `text-3xl` numbers. New leads uses accent color.
- **Filter Pills:** Same rounded-full pills as Products page (`bg-primary text-primary-foreground` active, `bg-card border` inactive)
- **Lead List:** Cards with status badge, ref ID, type label, name, email, date. Selected state: `border-primary`
- **Detail Panel:** Sticky sidebar with contact links, config viewer, message display, status update buttons
- **LinQ Admin Bot:** Floating chat panel (red FAB bottom-right). Dark header, streaming responses. Quick-ask suggestion buttons.
- **Status colors:**
  - new: `bg-accent/10 text-accent`
  - contacted: `bg-yellow-500/10 text-yellow-700`
  - quoted: `bg-purple-500/10 text-purple-700`
  - won: `bg-green-500/10 text-green-700`
  - lost: `bg-foreground/5 text-muted-foreground`

---

## Shared Components

### `FinishSwatch` (`src/components/shared/FinishSwatch.tsx`)

Renders finish color swatches with proper visual differentiation:
- **Solid finishes:** `rounded-full` circle with flat color
- **Wood grain finishes:** `rounded-lg` square with organic curved SVG grain lines overlaid at 18% opacity
- Auto-detects finish type from `FRAME_FINISHES` if `finishId` provided
- Props: `finishId`, `color`, `finishType`, `size` (sm/md/lg), `selected`
- Used in: Design Tool (step 2) and Products page drawer

### `SaveModal` (in `src/pages/DesignTool.tsx`)

Collects contact info (name, email, phone) before saving a design configuration:
- Shows config summary (type, finish, glass, size)
- Saves to PostgreSQL via `/api/save-configuration`
- Returns reference ID on success

---

## Font Loading & Performance

- Google Fonts (DM Sans + Playfair Display) preloaded via `<link rel="preload">` for critical woff2 files
- Fallback `@font-face` declarations with `size-adjust`, `ascent-override`, `descent-override` prevent layout shift:
  - `DM Sans Fallback` → Arial (96% size-adjust)
  - `Playfair Display Fallback` → Georgia (112% size-adjust)
- Hero image preloaded: `<link rel="preload" href="/images/hero-bg.jpg" as="image">`
- Hero section has `bg-[#1a1a1a]` placeholder and `fetchPriority="high"` on img
- `html { background: #1a1a1a }` prevents white flash before React mounts

---

_This document should be updated whenever a new component or pattern is approved and added to the site._
