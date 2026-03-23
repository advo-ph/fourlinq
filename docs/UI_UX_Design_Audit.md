# FourlinQ UI/UX Design Audit & Strategy

## 1. Research Scope — Competitor & Reference Websites

### 1.1 Marvin (marvin.com)

**Vibe:** Architectural Digest, human-centric, warm, and highly editorial.

- **Hero Section:** Full-bleed, high-quality lifestyle video/imagery. Focuses on the _feeling_ of light and space rather than just the window frame. Minimalist overlay text.
- **Typography:** Elegant serif fonts for primary headings (e.g., _EB Garamond_ or similar) paired with a clean, highly legible geometric sans-serif for body copy and UI elements. This creates a "luxury lifestyle magazine" aesthetic.
- **Color Palette:** Warm neutrals, soft whites, beige, and deep charcoal/black for text. Very organic and earthy, avoiding harsh pure blacks or corporate blues.
- **Imagery:** 80% lifestyle and architectural context, 20% standalone product. Models are often seen interacting with the spaces, or rooms are perfectly styled.
- **Navigation & UX:** Sticky, ultra-clean mega-menu. Uses subtle fade-in animations. Filtering is intuitive, often visual (clicking icons of window shapes rather than just text dropdowns).
- **Key Takeaway for FourlinQ:** Sell the _lifestyle and architectural beauty_, not just the uPVC profile. Use a serif/sans-serif pairing to elevate the brand to "designer" status.

### 1.2 Andersen Windows (andersenwindows.com)

**Vibe:** Engineered reliability, corporate heritage, high-contrast, structured.

- **Hero Section:** Split-screen or heavy dark-overlay hero images showing large-scale modern architectural applications. Very clear, contrasting Call-To-Action (CTA).
- **Typography:** Bold, geometric sans-serif dominance (e.g., _Proxima Nova_ or similar). It projects industrial strength and modern engineering, lacking the delicate serifs of Marvin.
- **Color Palette:** High contrast. Stark whites, deep charcoal/blacks, with sharp brand-color accents (Andersen’s iconic orange/red). Feels highly technical.
- **Imagery:** 50/50 split between lifestyle and macro product shots. They heavily feature cross-sections of the window frames to prove material superiority (Fibrex, etc.).
- **Navigation & UX:** Highly structured, rigid mega-menu categorized by Window Type vs Series. Their "Design Tool" is a wizard-based configurator that walks you step-by-step (Style -> Series -> Color -> Hardware).
- **Key Takeaway for FourlinQ:** If FourlinQ wants to emphasize German-engineered uPVC strength, adopt high-contrast cards and prominent technical cross-sections. A step-by-step wizard configurator pattern works best for complex hardware.

### 1.3 Pella (pella.com)

**Vibe:** Accessible premium, modern transitional, innovation-focused.

- **Hero Section:** Bright, airy, sun-drenched imagery. Often uses video backgrounds showing smooth operation of hardware (e.g., sliding hidden screens or proprietary locks).
- **Typography:** A highly legible, friendly sans-serif. Less stark than Andersen, less editorial than Marvin.
- **Color Palette:** Very bright. Lots of white space, light grays, and a distinct vibrant yellow accent (their brand mark) used sparingly for core actions.
- **Imagery:** Focuses heavily on "indoor-outdoor living" concepts. Lots of wide slider doors and massive pane windows.
- **Navigation & UX:** Excellent visual filtering. When looking at doors, instead of a text list, they present clean vector icons of door operations (sliding, bifold, French).
- **Key Takeaway for FourlinQ:** Visual filtering (icons for window/door shapes rather than just text) makes the UX incredibly intuitive. Sun-drenched, bright photography drives emotional connection.

### 1.4 Milgard (milgard.com)

**Vibe:** Approachable, practical durability, West-Coast style.

- **Hero Section:** Focuses on standard, beautiful homes (not just mega-mansions). Relatable lifestyle imagery.
- **Typography:** Very straightforward sans-serif. No-nonsense, readable, functional.
- **Color Palette:** Whites, varied greys, and a trustworthy muted blue. Feels like a dependable building materials company.
- **Imagery:** Strong mix of exterior/interior shots, plus heavy emphasis on their lifetime warranty badges.
- **Navigation & UX:** Very text-heavy, but well-structured for contractors and DIY owners.
- **Key Takeaway for FourlinQ:** While FourlinQ aims premium, don't forget the practical buyer. Prominently display warranties and certifications.

### 1.5 Rehau (rehau.com)

**Vibe:** Global B2B/B2C hybrid, technical authority, sustainability-focused.

- **Hero Section:** Clean, architectural, explicitly highlighting energy efficiency and uPVC material science alongside modern homes.
- **Typography:** Clinical, precise, engineered sans-serif.
- **Color Palette:** Stark white, technical greys, and their signature vivid green (highlighting eco-friendliness and their uPVC heritage).
- **Imagery:** Exceptional use of crisp 3D renderings showcasing window cross-sections, internal reinforcements, and thermal heatmaps.
- **Key Takeaway for FourlinQ:** Borrow this technical authority. Create a dedicated "Why uPVC?" scrolling section using 3D cross-sections to explain thermal efficiency and soundproofing.

### 1.6 Schüco (schuco.com)

**Vibe:** Ultra-luxury, the architect's ultimate choice, minimalist, brutalist-chic.

- **Hero Section:** Auto-playing, cinematic video of massive, floor-to-ceiling sliding systems opening effortlessly. "More glass, less frame."
- **Typography:** Geometric, almost brutalist sans-serif. Extreme typographic scale: massive, thin headings paired with small, tracked-out label text. Very European.
- **Color Palette:** Strictly monochromatic. Black, white, silver, slate grey. It lets the architecture speak.
- **Imagery:** Hyper-focus on modern mansions and extreme macro shots of luxury hardware (flush handles, zero-threshold tracks).
- **UX:** Highly interactive video and high-end car configurator feel.
- **Key Takeaway for FourlinQ:** This is the North Star. Adopt the monochromatic/liquid-glass palette, massive typographic scale, and focus heavily on macro-shots of the hardware to prove the luxury feel.

### 1.7 Current Implementation: FourlinQ (Redesigned March 2026)

**Vibe:** Tropical Futurism — Tesla-inspired minimalist premium.

- **Hero Section:** Full-bleed architectural photography with gradient overlay (`from-black/60 via-black/30 to-black/10`) + drop-shadow on text for readability. Bold serif-scale "Precision. Performance. Perfection." headline with red + white-bordered CTAs. Framer Motion fade-up animation.
- **Typography:** DM Sans for body/UI (clean, geometric) + Playfair Display for the logo (editorial serif accent). Strong hierarchy with uppercase tracked labels, bold headlines, and restrained body copy.
- **Color Palette:** Black/white/red. Near-black charcoal (#0A0A0A), clean white surfaces, red accent (#DC2626). No navy, no cream — strictly monochromatic with red signature.
- **Imagery:** White-background product photos for catalog clarity, architectural lifestyle photos for hero/projects. Client-provided minimalistic PNG window/door icons.
- **Navigation & UX:** Dark utility bar + glassmorphism nav with mega menus featuring SVG icon grids. Interactive Design Tool configurator. AI chat assistant powered by Gemini.
- **Data Integrity:** All brand claims, product types, contact info, branches, finishes, and advantages sourced from `src/data/fourlinq-data.ts` — verified from official FourlinQ printed brochures and physical profile samples. No unverified stats or claims.
- **Favicon & OG:** Red Playfair Display "Q" glyph as favicon (SVG + PNG). Hero image (`hero-bg.jpg`) as og:image for Messenger/social previews.
- **Brand Page:** Verified contact info (3 phone numbers + email) and 4 branch locations (Manila Main Office, Ortigas CW Home Depot, Alabang CW Home Depot, Cebu Branch). Davao removed — no longer operating in Mindanao. 10-Year Warranty scope displayed as badge cards. OSM map embeds on each branch card with "Get Directions" link.
- **Adaptive Navbar:** Detects dark background sections on scroll via luminance sampling. Switches to white text + dark backdrop when over dark sections, white bg + dark text over light sections. Text-shadow on hero for readability.
- **CRM / Lead Management:** All form submissions (contact, quotes, design tool configs) stored in PostgreSQL. Admin dashboard at `/admin` with lead list, detail panel, status pipeline (new → contacted → quoted → won/lost).
- **Chat Message Tracking:** Every customer chatbot message + bot response logged to `chat_messages` table with session grouping. Admin "Chat Logs" tab shows all conversations, message counts, timestamps, and "Most Asked Questions" ranked by frequency.
- **LinQ Admin Bot:** AI chatbot on admin page with live database context injection. Can answer "How many leads today?", "Show stale leads", client lookups, product popularity, company info. Uses Gemini 2.5 Flash with real-time stats in system prompt.
- **Analytics:** Fire-and-forget event tracking (page views, clicks, scroll depth, config changes, product views, chat opens). Admin summary endpoint with daily visitors, top pages, top clicks, top finishes tried, referrers.
- **Admin Auth:** Password-gated login screen. httpOnly cookie auth — JWT invisible to JavaScript/DevTools. sameSite strict (no CSRF), secure (HTTPS only), 8h expiry. All `/api/admin/*` endpoints return 401 without valid session. Sessions invalidate on server restart.
- **Deployment:** Self-hosted on Contabo VPS (Singapore). Node.js + Express + PM2, Nginx reverse proxy, Let's Encrypt SSL. PostgreSQL 16 on same VPS. Live at https://fourlinq.ph.
- **Performance:** Font fallback metrics prevent FOUC (preconnect + fallback @font-face with size-adjust). Hero image preloaded with `fetchpriority="high"`. Dark initial background prevents white flash. Product/configurator data loaded from static TS files — no phantom API fetches.
- **Achieved:** Successfully transitioned from "Generic WordPress" to a premium architectural brand aesthetic aligned with competitors like Schüco and Marvin. All data verified against official brochures. Full-stack self-hosted deployment operational.

---

## 2. Design Direction — FourlinQ Brand Identity

### 2.1 Design Brief Summary

The new FourlinQ website should act as the digital equivalent of a high-end luxury car showroom mixed with an architecture magazine. It must bridge the gap between "European Technical Engineering" (Schüco/Rehau) and "Aspirational Lifestyle" (Marvin). The aesthetic is **"Liquid Glass & Monolithic Architecture."** It should not feel like a general contractor's site; it should feel like you are purchasing high-end real estate features.

### 2.2 Typography System (Implemented)

**Chosen Approach:** DM Sans + Playfair Display pairing.

- **Logo & Brand:** _Playfair Display_ — serif wordmark for editorial luxury feel (like Marvin).
- **Body & UI:** _DM Sans_ — geometric, clean, highly legible sans-serif for all content.
- Weights: 300 (light display), 400 (body), 500 (UI labels), 600 (headings/CTAs).

### 2.3 Color Palette (Implemented)

Avoided "Home Depot Orange" and "Contractor Blue."

- **Primary Backgrounds:** Clean White (`#FFFFFF`).
- **Text & High Contrast:** Near-Black (`#0A0A0A`).
- **Accent:** Brand Red (`#DC2626`) — CTAs, logo Q, active states.
- **Dark Sections:** Charcoal (`#0d0d0d`) for footer, CTA banners, utility bar.

### 2.4 Iconography & Imagery Style

- **Icons:** Thin, precise **outline icons** (1.5px stroke). Never filled clunky SVGs. The icons should look like architectural blueprints or CAD drawings.
- **Imagery:** Large, uncropped, borderline full-bleed photography. Use a 70/30 mix of wide breathtaking architectural shots vs. hyper-macro shots of window handles and smooth sliding tracks.

### 2.5 Layout & Spacing Philosophy

- **Asymmetric & Editorial:** Instead of generic 3-column feature grids, use overlapping images, large typographic pull quotes, and generous white space (macro-padding).
- **Modularity:** Everything must be built in reusable React components (HeroBanner, ProductCrossSection, WindowConfigurator).

---

## 3. UI Pattern Cheat Sheet

### 3.1 Hero Section

- **Layout:** Full bleed video background (showing a massive sliding door opening to a beautiful view).
- **Interaction:** Scroll-prompting mouse-down animation, "Liquid Glass" frosted navbar overlay spanning the top width.

### 3.2 Navigation

- **Style:** Sticky frosted glass (backdrop-blur). Mega-menu on hover.
- **Pattern:** Don't just list "Casement, Awning, Sliding." Show thin vector outline icons of those window shapes in the dropdown so users visually understand the types before clicking.

### 3.3 Product Catalog & Filtering (Modular Cards)

- **Cards:** Borderless, image-heavy cards with a subtle transform `scale(1.02)` on hover.
- **Filtering:** Horizontal, pill-shaped filter tags (e.g., "[ ] Doors", "[ ] Windows", "[x] Sliding") rather than a hidden sidebar accordion.

### 3.4 Live Product Configurator

- **UX Flow:** Wizard style (Step 1: Type -> Step 2: Finish -> Step 3: Glass -> Step 4: Hardware).
- **Visuals:** Huge center canvas showing a 2D/3D render of the window. When clicking a color (e.g., "Anthracite Grey"), the frame color animates smoothly.
- **Tech Note:** Store configurator selections in a global state (e.g., Zustand) and build the data structure cleanly for future Supabase RLS saving (e.g., `saved_configurations` table).

### 3.5 Brand Storytelling & Certifications

- **"Why uPVC?":** A horizontal scrolling section or a sticky-scroll element where a 3D window cross-section stays pinned in the center while text (Thermal, Acoustic, Security) scrolls past.
- **Certifications:** Monochromatic logos (ISO, CE, Rehau profile badges) clustered at the footer or in an "Engineering" section to build quiet authority.

### 3.6 Expo/Showroom Mode (Kiosk)

- **Pattern:** A specific `/expo` route that hides the standard navigation, maximizes touch targets (min 48x48px buttons), and acts as an endless loop of high-res video and the interactive configurator.

---

## 4. Inspiration & Reference URLs

- **Aesthetic Benchmark:** [schuco.com](https://www.schueco.com/) (For typography scale and minimalist luxury).
- **Lifestyle Benchmark:** [marvin.com](https://www.marvin.com/) (For how to mix serif/sans-serif and style human-centric photos).
- **Configurator Reference:** [andersenwindows.com/design-tool](https://www.andersenwindows.com/design-tool/) (For wizard step-by-step UI).
- **Liquid Glass Reference:** [Rdev Liquid Glass UI](https://github.com/rdev/liquid-glass-react) (For the specific frosted glass CSS properties you want to integrate).

---

## 5. Red Flags 🚩 (What to Avoid)

1. **Generic Bootstrap/Tailwind Defaults:** Avoid standard blue primary buttons (`bg-blue-600`) and tight, boxed layouts.
2. **"Buy Now" E-commerce Feel:** Premium windows are a considered purchase, not an impulse buy. Buttons should say "Explore Range", "Design Your Vision", or "Request Consultation".
3. **Cluttered Data Tables:** Don't dump technical specs on the first view. Hide them behind a clean "Technical Specifications" accordion or tab.
4. **Poor Contrast Configurator:** A configurator where the window changes color but is too small to see. The product must take up at least 60% of the screen horizontally.
5. **No Visual Hierarchy:** If everything is bold, nothing is. Ensure massive headers for emphasis and small, tracked-out caps for subheadings.
