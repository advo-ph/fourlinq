

# FourlinQ — Premium uPVC Windows & Doors Website

A complete 5-page, production-ready website for FourlinQ, a premium uPVC windows and doors company in the Philippines. Frontend-only, with Framer Motion animations, fully responsive, and zero placeholders.

---

## Design System Setup

- Custom warm cream background (#F5F2EA), navy brand color (#1B2E4B), accent red (#CC0000)
- DM Sans font (Google Fonts) — weights 300/400/500/600 only
- Light mode only, warm professional aesthetic
- All design tokens defined in CSS variables and Tailwind config

---

## Shared Components

- **Navbar** — Logo (text-based, red Q), center nav links, "Book Consultation" CTA. Transparent → white-on-scroll. Mobile hamburger with slide-in drawer
- **Footer** — Navy background, logo, 4 link columns, social icons, copyright
- **CTA Banner** — Reusable full-width navy section with headline + two buttons
- **Section wrapper** — Framer Motion fade-up on scroll with staggered children

---

## Page 1 — Homepage

1. **Hero** — Full-bleed Unsplash interior photo, overlaid headline + two CTAs, scroll indicator
2. **Trust Bar** — Stats band: German-Engineered / 500+ Installations / 15 Years
3. **Products Preview** — "Our Systems" 3-card grid with hover lift, links to Products page
4. **Design Tool Teaser** — Two-column: copy + CTA left, stylized configurator mockup component right
5. **Why uPVC Cards** — 4 benefit cards with outline icons, Philippine climate-specific copy
6. **Inspiration Gallery** — 6-photo grid with hover overlay (project name + location)
7. **CTA Banner** — "Ready to Transform Your Space?" with two buttons

---

## Page 2 — Products / All Systems

- Page header with breadcrumb
- Filter tabs (All / Windows / Doors / Systems) — pill style, fully wired
- 6+ product cards from a data file, with images, names, descriptions, category tags
- **Product Drawer** — Slides in from right on card click. Shows large image, specs, 5+ finish swatches, glass options, "Request a Quote" button. Closes on X or overlay click

---

## Page 3 — Design Tool / Configurator

- **Step 1**: Product type icon grid (Casement, Sliding, Fixed, Bifold)
- **Step 2**: Finish color swatches (6 colors with navy ring on select)
- **Step 3**: Glass type cards (Clear, Frosted, Tinted)
- **Step 4**: Width/height sliders with live mm display
- **Live Preview Panel**: SVG illustration updating in real-time (frame color, glass tint, dimensions)
- Step progress bar, back/continue navigation, configuration summary
- "Save Configuration" + "Book Consultation" CTAs

---

## Page 4 — Why uPVC

- Hero banner with headline
- 4 detailed benefit sections with paragraphs, stats, and lifestyle photos
- **Comparison Table**: uPVC vs Aluminium vs Timber (cost, maintenance, thermal, weather, lifespan, aesthetics)
- Philippine Climate callout section (tropical heat, coastal humidity, typhoons)
- Bottom CTA linking to Products and Design Tool

---

## Page 5 — Brand

- Company story and mission section
- "German Engineering, Philippine Expertise" two-column layout
- Certifications grid (icon + label)
- Showroom/team photo section
- Contact info with showroom address and embedded map placeholder

---

## Data Architecture

- All product data, configurator options, benefit copy, and page content in dedicated TypeScript data files — not hardcoded inline
- Each visual section is its own named component file (HeroSection, TrustBar, ProductGrid, ProductDrawer, etc.)

---

## Animations & Responsiveness

- Framer Motion scroll-triggered fade-up on every section with staggered children
- Fully responsive: mobile (375px), tablet (768px), desktop (1280px+)
- All nav links, CTAs, and filters fully wired with React Router

