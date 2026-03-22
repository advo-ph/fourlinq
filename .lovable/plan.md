# FourlinQ — Premium uPVC Windows & Doors Website

A complete production-ready website for FourlinQ, a premium uPVC windows and doors company in the Philippines. React + TypeScript frontend with Vercel serverless backend and Neon Postgres database.

---

## Design System

- Black/white/red color scheme: white backgrounds, near-black (#0A0A0A) text, red accent (#DC2626)
- DM Sans (body/UI) + Playfair Display (logo serif)
- "Tropical Futurism" aesthetic — Tesla-inspired minimalist premium
- Sharp border radius (0.25rem), clean edges
- All design tokens defined in CSS variables and Tailwind config

---

## Shared Components

- **Logo** — Playfair Display serif wordmark: "FourlinQ" with red Q, divider line, "Windows & Doors". Light/dark variants
- **Navbar** — Dark utility bar (#171717) + transparent-to-white glassmorphism nav. Mega menus for Windows/Doors with icon grids. Red "Get a Quote" CTA. Mobile drawer at lg breakpoint
- **Footer** — Dark charcoal (#0d0d0d) background, Logo (light), 4 link columns, social links
- **CTA Banner** — Full-width dark section with red primary + white outline buttons
- **AnimatedSection** — Framer Motion fade-up on scroll with staggered children
- **QuoteModal** — Modal form for quote requests, persisted to Neon Postgres
- **ContactForm** — Contact form component on Brand page
- **CookieBanner** — GDPR cookie consent with localStorage persistence

---

## Pages

### Page 1 — Homepage (`/`)

1. **Hero** — Full-bleed hero-bg.jpg, dark gradient overlay, "Precision. Performance. Perfection." headline, two CTAs
2. **Trust Bar** — Stats band: German-Engineered / 500+ Installations / 15 Years
3. **Products Preview** — "Our Systems" 3-card grid (Windows, Doors, Specialist)
4. **Design Tool Teaser** — Two-column: copy + CTA left, configurator mockup right
5. **Why uPVC Cards** — 4 benefit cards with icons
6. **Inspiration Gallery** — 6-photo project grid with hover overlay
7. **CTA Banner** — "Ready to Transform Your Space?"

### Page 2 — Products (`/products`)

- Page header with breadcrumb
- Filter tabs (All / Windows / Doors / Systems) — pill style
- Product cards from API/data with images, names, categories
- **Product Drawer** — Slides in from right. Large image, specs, finish swatches, glass options, "Request a Quote" button

### Page 3 — Design Tool (`/design-tool`)

- Step 1: Product type icon grid
- Step 2: Finish color swatches
- Step 3: Glass type cards
- Step 4: Width/height sliders with live mm display
- Live Preview Panel: SVG updating in real-time
- Save Configuration + Book Consultation CTAs

### Page 4 — Why uPVC (`/why-upvc`)

- Hero banner
- 4 benefit sections with stats and photos
- Comparison Table: uPVC vs Aluminium vs Timber
- Philippine Climate callout section
- Bottom CTA

### Page 5 — Brand (`/brand`)

- Company story and mission
- "German Engineering, Philippine Expertise" section
- Certifications grid
- Contact form with showroom info

### Page 6 — Legal (`/legal`)

- Privacy Policy, Terms of Service, Cookie Policy (tab-based)

---

## Backend

- **Vercel Functions:** chat/stream, contact, quote-request, save-configuration, setup-db
- **Database:** Neon Postgres — inquiries table for contact/quote submissions
- **AI Chat:** Gemini API streaming via server-side endpoint (API key not exposed to client)
- **Local Dev:** Express.js server with lightweight routes (no DB dependency)

---

## Data Architecture

- Product data, configurator options, benefit copy in TypeScript data files
- React Query hooks for API data fetching
- Each visual section is its own named component file

---

## Animations & Responsiveness

- Framer Motion scroll-triggered fade-up, staggered children
- Fully responsive: mobile (375px), tablet (768px), desktop (1024px+)
- Nav breakpoint at `lg` (1024px) to prevent link wrapping
- All nav links, CTAs, and filters fully wired with React Router
