# FourlinQ Design System

**Version 1.0 — February 2026**
This document is the single source of truth for all UI decisions on the FourlinQ website. Any AI agent, developer, or designer working on this codebase must follow these guidelines exactly. Do not deviate without explicit instruction.

---

## Brand Identity

**Company:** FourlinQ Windows & Doors
**Positioning:** Premium uPVC fenestration for the Philippine market. German-engineered, locally installed.
**Tone:** Warm, precise, confident. Not cold or corporate. Not overly casual.
**Key narrative pillars:** German engineering · Philippine climate expertise · Typhoon-grade performance · Thermal efficiency · 50-year lifespan

---

## Logo

- Wordmark: `FOURLIN` in navy `#1B2E4B` + `Q` in red `#CC0000`
- Subline: `WINDOWS & DOORS` in small caps, tracked, muted color `#6B7280`
- The red `Q` is the ONLY place red appears as a primary element
- Never use red for UI elements, buttons, backgrounds, or decorative accents — only the logo Q and active nav state

---

## Color System

```
--color-bg:        #F5F2EA   /* Warm cream — primary page background */
--color-surface:   #FFFFFF   /* White — cards, modals, nav */
--color-border:    #E5E0D8   /* Warm light gray — dividers, card borders */
--color-navy:      #1B2E4B   /* Primary dark — headings, buttons, logo */
--color-text:      #1A1A1A   /* Near-black — body copy */
--color-muted:     #6B7280   /* Medium gray — captions, labels, meta */
--color-red:       #CC0000   /* Logo Q and active nav only — nowhere else */
--color-overlay:   rgba(27, 46, 75, 0.06)  /* Subtle hover tint on cards */
```

**Do not add new colors.** If a new shade is needed, derive it from the above with opacity. Never introduce blue, green, gold, or other accent colors.

---

## Typography

**Font family:** DM Sans (Google Fonts)
**Fallback:** `system-ui, -apple-system, sans-serif`

```
Font weights used:
  300 — Light (large display text only)
  400 — Regular (body copy)
  500 — Medium (UI labels, nav items)
  600 — SemiBold (headings, buttons, CTAs)

Never use 700 (Bold) or 800+ (ExtraBold)
```

### Type Scale

```
Display (Hero H1):   clamp(2.5rem, 5vw, 4rem)    / weight 600 / color #1B2E4B
H1 (Page heading):   clamp(2rem, 3.5vw, 3rem)     / weight 600 / color #1B2E4B
H2 (Section):        clamp(1.5rem, 2.5vw, 2rem)   / weight 600 / color #1B2E4B
H3 (Subsection):     1.25rem                       / weight 600 / color #1B2E4B
H4 (Card title):     1.125rem                      / weight 600 / color #1A1A1A
Body large:          1.125rem / line-height 1.7    / weight 400 / color #1A1A1A
Body:                1rem     / line-height 1.6    / weight 400 / color #1A1A1A
Caption / Meta:      0.875rem / line-height 1.5    / weight 400 / color #6B7280
Label (uppercase):   0.6875rem / tracking 0.1em   / weight 500 / color #6B7280
```

**Rules:**

- Section labels above headings use uppercase, tracked text in `#6B7280` (e.g. `WINDOW TYPES`, `BY TYPE`)
- Headings are never italic
- No decorative serifs anywhere on the site
- Line lengths should not exceed 70 characters for body copy (use max-width on text containers)

---

## Spacing System

Based on an 8px base unit.

```
4px   — xs  (tight internal padding)
8px   — sm
12px  — md
16px  — base
24px  — lg
32px  — xl
48px  — 2xl
64px  — 3xl
80px  — 4xl
120px — section (vertical padding between major sections)
160px — section-lg (hero and featured sections)
```

**Page layout:**

- Max content width: `1280px` centered
- Horizontal padding: `24px` mobile / `48px` tablet / `80px` desktop
- 12-column grid at desktop
- Inner pages: `48px` top padding below nav before PageHeader component

---

## Navigation

### Utility Bar (top)

- Background: `#1B2E4B` (navy)
- Text: white, 0.6875rem, uppercase, tracked
- Links: `FOR PROFESSIONALS` · `VISIT SHOWROOM` · `SUPPORT`
- Right side: phone number + email in same style
- Height: `36px`

### Main Navigation

- Background: `#FFFFFF` with `backdrop-filter: blur(12px)` when scrolled
- Sticky, adds subtle `box-shadow: 0 1px 0 #E5E0D8` on scroll
- Logo left-aligned
- Nav items: DM Sans 500, 1rem, `#1A1A1A`
- Active page: nav item turns `#CC0000` (red)
- Hover: underline, color stays `#1A1A1A`
- Right: `Book Consultation` button (navy filled)
- Separate `Windows` and `Doors` nav items — each with their own mega menu

### Mega Menu (desktop)

Three-column layout:

1. **Left column** — BY TYPE list + BY MATERIAL list (plain text links, muted labels above)
2. **Center column** — Product type icons in 3×2 grid with SVG icons + labels
3. **Right column** — FEATURED card (project photo + headline + Read More link)

Background: `#FFFFFF`
Separator between columns: `1px solid #E5E0D8`
Opens on hover, closes on mouse leave with 150ms delay

### Mobile Navigation

- Full-screen overlay, `#FFFFFF` background
- Logo + close (×) at top
- Main links as large text rows with `1px solid #E5E0D8` dividers
- `Windows` and `Doors` rows show `›` chevron — tap opens sub-panel
- Sub-panel: Back button + section title + icon+label rows + "View all →" red link
- Utility links (For Professionals, Visit Showroom, Support) below divider in muted style
- `Book Consultation` full-width navy button at bottom

---

## Buttons

```
Primary (filled):
  Background: #1B2E4B
  Text: #FFFFFF
  Font: DM Sans 500, 0.9375rem
  Padding: 12px 24px
  Border-radius: 6px
  Hover: background lightens to #243d63

Secondary (outlined):
  Background: transparent
  Border: 1.5px solid #1B2E4B
  Text: #1B2E4B
  Same padding and radius
  Hover: background #F5F2EA

Ghost / Text link:
  No border, no background
  Text: #1B2E4B or #CC0000 for "View all →" actions
  Hover: underline

Pill (filter buttons):
  Border-radius: 999px
  Active state: background #1B2E4B, text white
  Inactive: background white, border #E5E0D8
```

Never use rounded-full (pill) for primary action buttons — only for filter/tab controls.

---

## Cards

**Product Card:**

- Background: `#FFFFFF`
- Border: `1px solid #E5E0D8`
- Border-radius: `12px`
- Image: full-bleed top, aspect ratio 4:3, `object-fit: cover`
- Hover: `transform: translateY(-4px)`, `box-shadow: 0 8px 32px rgba(0,0,0,0.08)`
- Transition: `250ms ease`
- Meta label: uppercase tracked muted text above product name
- Product name: H4 weight 600
- Description: body small, muted
- SVG type icon: top-right corner, 32×32px, navy stroke

**Featured Project Card (mega menu):**

- Image: full-bleed, 16:9 ratio
- Overlay gradient: `linear-gradient(to top, rgba(27,46,75,0.7), transparent)`
- Title: white, H4 weight 600, bottom-left
- `Read More →` link: white, caption size

---

## SVG Window & Door Icons

All icons use the same specification:

- ViewBox: `0 0 80 80`
- Stroke: `#1B2E4B`
- Stroke-width: `1.5px`
- Fill: none
- No solid fills
- Outer frame: `2px` stroke (slightly heavier than inner panel lines)
- Inner panel divisions: `1px` stroke
- Motion indicators: dashed lines (`stroke-dasharray: 3 2`), small arrowheads

**Window types and their distinguishing features:**

- **Casement** — two equal portrait panels, dashed quarter-circle arcs sweeping horizontally outward from outer vertical hinge edge of each panel
- **Awning** — single panel wider than tall, thicker top rail indicating top hinge, bottom arc with upward arrowhead
- **Sliding** — two panels in landscape frame, bidirectional horizontal arrows, bottom track line
- **Fixed** — single square panel, dashed inner sash border, X cross lines inside
- **Tilt & Turn** — single panel, side-swing arc on left + bottom-tilt arc with upward arrow, handle right side

**Door types and their distinguishing features:**

- **Sliding Door** — wide landscape frame, two panels, horizontal arrow, handle bar
- **Bifold** — four narrow vertical panels with fold crease lines, inward-pointing arrows
- **Lift & Slide** — two wide panels, lift arrow + slide arrow combination, bottom track
- **French Door** — two tall panels, large quarter-circle outward swing arcs from center, small handles
- **Entrance** — single tall panel, narrow transom rectangle above, swing arc, handle right side

Icons appear at these sizes:

- Mega menu grid: `64×64px`
- Mobile nav list: `20×20px`
- Product card badge: `32×32px`
- Design Tool selector: `48×48px`

---

## Page Structure

### Every inner page must use the PageHeader component:

```
- 48px top padding below nav
- Breadcrumb: FourlinQ › [Page Name] — muted, 0.875rem
- H1 heading: page title
- Optional subtitle: body large, muted, max-width 600px
- Bottom padding: 48px before first content section
```

### Section vertical rhythm:

- Between sections: `120px` padding top + bottom
- Section label (uppercase tracked) → H2 → body/content
- Never skip the label — it provides visual hierarchy and scannability

### Homepage sections in order:

1. Hero (full-bleed photo, gradient overlay, H1 + CTA)
2. Trust bar (certifications, key stats)
3. Products preview grid
4. Design Tool teaser (full-width CTA section)
5. Why uPVC summary (3–4 benefit cards)
6. Inspiration gallery
7. CTA banner (navy background)
8. Footer

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

Hover card lift:
  transition: transform 250ms ease, box-shadow 250ms ease

Mega menu open:
  Fade in + translateY(-8px → 0), 150ms ease

Page transitions:
  Fade only, 200ms
```

Do not use spring physics, rotation, scale bounces, or color-shift animations.

---

## Material Comparison Table

Used on Why uPVC page. Style:

- No outer border on table
- Row dividers: `1px solid #E5E0D8`
- Header row: no background, column headers in muted uppercase tracked style
- uPVC column: values in `#1B2E4B` weight 600 (highlighted as the winner)
- Aluminium / Timber columns: values in `#6B7280` weight 400
- Alternating row background: none (white only)

---

## Why uPVC — Key Data Points

These are the validated performance claims. Use exact numbers:

- Thermal: U-value 0.75–0.8 W/m²K (vs 5.0+ for standard aluminium)
- Solar heat gain reduction: up to 45% vs aluminium
- Acoustic: 40–47 dB reduction (vs 25 dB aluminium, 30 dB timber)
- Wind resistance: 250 kph typhoon-grade (NSCP 2015 compliant)
- Lifespan: 50+ years (vs 30–40 aluminium, 20–30 timber)
- UV stabilization: 8–9% TiO2 content for tropical UV resistance
- Standards: EN 12608 (European profile standard)
- Maintenance: zero — no painting, sealing, or re-coating required

---

## Tone & Copy Guidelines

**Headlines:** Short, declarative, benefit-led. "Built for Philippine Summers." not "Our products have excellent thermal properties."

**Body copy:** Confident but not arrogant. Specific not vague. Always localize — mention Philippines, typhoons, tropical UV, Metro Manila, Cebu, Baguio where relevant.

**Avoid:**

- "World-class" (overused)
- "State-of-the-art"
- "Solutions" as a standalone noun
- Passive voice
- Vague claims without numbers

**Preferred framing:**

- Lead with the problem Philippine homes face, then the solution
- Use TCO (total cost of ownership) framing when addressing the "expensive" objection
- Architect and developer copy should be more technical and spec-driven
- Homeowner copy should be more lifestyle and comfort-driven

---

## What NOT to Do

- Do not use dark/charcoal backgrounds on any section (navy CTA banner is the only exception)
- Do not use shadows heavier than `0 8px 32px rgba(0,0,0,0.08)`
- Do not add gradients except on hero image overlays
- Do not use any color outside the defined palette
- Do not use serif fonts
- Do not use red for anything except the logo Q and active nav states
- Do not add emojis, icons from generic icon libraries (Lucide etc.) in hero or marketing sections — SVG product icons only
- Do not center-align body copy (headings can be centered in CTA sections only)
- Do not use pill/rounded-full buttons for primary actions

---

_This document should be updated whenever a new component or pattern is approved and added to the site._
