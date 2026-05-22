---
version: alpha
name: Schueco-design-analysis
description: German engineering-led aluminum + uPVC fenestration giant. Technical-confident voice, multi-semantic color system (green/red/blue/cyan), Univers custom typeface throughout (no serif), rem-based modular scale, structured layouts with clear section delimiters. Where Sky-Frame is poetic restraint, Schüco is precise documentation — every surface is labeled, categorized, color-coded.
source: schueco.com — extracted from /resource/themes/web/css/web-4535950-42.css (257KB stylesheet)

colors:
  ink-display: "#262626"
  ink-body: "#262626"
  ink-muted: "#4E4E4E"
  hairline: "#BFBFBF"
  canvas-white: "#FFFFFF"
  canvas-soft: "#F2F2F2"
  canvas-divider: "#E6E6E6"
  accent-green: "#4C840D"
  accent-green-bright: "#78B928"
  accent-green-deep: "#005F1E"
  accent-red: "#BC0000"
  accent-cyan: "#00A2D1"
  semantic-system: "Multi-color: green = primary brand, red = warnings/CTAs, cyan = info, deep-green = corporate"

typography:
  primary-sans: "Univers (Linotype commercial, customized as 'Univers Regular' + 'Univers Bold')"
  no-serif: "Schüco uses NO serif — entire site is Univers sans"
  scale-rem-based:
    body: "1rem (16px)"
    h6: "1.125rem (18px)"
    h5: "1.25rem (20px)"
    h4: "1.5rem (24px)"
    h3: "1.75rem (28px)"
    h2: "1.875rem (30px)"
    h1: "2rem (32px)"
    display: "2.5rem (40px)"
  weights: "Regular (430) and Bold (630). No light, no medium, no extrabold."
  body-modal:
    fontFamily: "Univers, Univers Regular Fallback, sans-serif"
    fontSize: 16px
    fontWeight: 430
    lineHeight: 1.5

rounded:
  approach: "Minimal radius. Buttons use small radius (~4px) for the primary CTA shape, none for utility surfaces."
  cta-button: "4-6px radius"
  cards: "0"

spacing:
  scale: "Tailwind-like (16, 24, 32, 48, 64, 96px)"
  section-padding: "Moderate — 64-96px between sections (less generous than Marvin/Sky-Frame)"
  container-max: "Approximately 1280-1440px"

motion:
  approach: "Functional. Schüco prioritizes information density over motion; hovers are color-shift only, no large transitions."
  hover-default: "150-200ms ease-out"

elevation:
  approach: "Light card chrome — small drop shadows on info cards and product tiles. More visible elevation than Sky-Frame, less than v2 SaaS defaults."

layout:
  approach: "Highly structured. Multiple sub-navigations, breadcrumb-heavy, dense information hierarchy. Each page has clear front-matter + body + related-content footer pattern."
  information-density: "High. Schüco indexes thousands of product SKUs; the IA assumes the visitor knows what they're looking for and wants to drill down fast."
  text-columns: "Moderate width — 640-800px max for body prose"
---

## Overview

Schüco is the German systems giant for windows, doors, and facades — a 70+ year company serving architects, contractors, and large-scale construction. The site is **technical documentation as design language** — every page is labeled with breadcrumbs, every product has a sidebar with downloadable specs, every section has a clear handle.

**Voice:** confident, declarative, engineering-grade. "Solutions" rather than "products". Heavy use of nouns. The brand sells **systems**, not individual windows — the entire site treats fenestration as infrastructure.

**The signature move:** the green accent (`#4C840D`). A specific industrial dark-green (not olive, not lime) that reads German-engineering. Paired with red for CTAs/alerts and cyan for info, the multi-color system mirrors how Schüco categorizes everything in their product literature.

## Colors

Multi-semantic, not single-accent. Each color has a defined role:

- **`accent-green` (`#4C840D`)** — primary brand color. Industrial dark-green. Used for the master logo, primary navigation accents, and the "Schüco confirmed" check badges throughout the site.
- **`accent-green-bright` (`#78B928`)** — lighter green for hovers and secondary highlights.
- **`accent-green-deep` (`#005F1E`)** — for the most corporate / sustainability-focused contexts.
- **`accent-red` (`#BC0000`)** — used for CTAs ("Request Quote", "Find Dealer") and high-importance alerts. Visibly different shade from anything in Marvin's or Sky-Frame's palettes.
- **`accent-cyan` (`#00A2D1`)** — info badges, technical specifications callouts.
- **Ink:** `#262626` for display + body (no distinction — Schüco uses font weight, not color, for hierarchy). `#4E4E4E` for muted secondary text.
- **Canvas:** `#FFFFFF` primary, `#F2F2F2` for sections, `#E6E6E6` for dividers and tab backgrounds.

## Typography

**Single typeface: Univers** (Adrian Frutiger's 1957 classic, customized by Schüco). No serif anywhere on the site. The Univers family carries the visual weight by using Regular (430) and Bold (630) only.

**Scale is rem-based and modular:** body 1rem (16px), with steps at 1.125, 1.25, 1.5, 1.75, 1.875, 2, 2.5rem. The cap at 2.5rem (40px) means Schüco **never** uses oversized hero headlines — even the homepage hero stays at 40px. Information density is preserved.

**Two weights only:** Regular (430) and Bold (630). No light variant, no medium, no extrabold. Hierarchy is established by size + weight, not by typeface family.

## Layout

**Structured documentation aesthetic.** Most pages have:
- Front-matter region (eyebrow + breadcrumb + title + lede)
- Body region (multi-column for some, single-column for prose-heavy)
- Sidebar with downloads (PDFs, CAD drawings, datasheets)
- Related-content footer

**Breadcrumb-heavy:** every interior page has 3-5-level breadcrumb trail. Schüco assumes the visitor came from search and wants to know where in the IA they landed.

**Container width:** ~1280-1440px depending on context. Less wide than Marvin (1400px), more constrained than Sky-Frame.

**Information density is high.** A typical Schüco product page surfaces: specs table, finishes grid, glass options matrix, certifications, dealer info, PDF downloads, AND a system-features bullet list — all above the fold on desktop.

## Elevation & Depth

**Light card chrome.** Schüco uses small drop shadows on cards and product tiles — more visible than Marvin or Sky-Frame, less than SaaS-style cards. The shadows say "this is a clickable info unit", not "this is a floating UI element".

## Shapes

**Mostly 0 radius.** Primary CTAs (the red "Request Quote" buttons) use ~4-6px radius — slightly softer than zero but still mostly rectangular. Cards and section dividers are zero radius.

## Components

### Breadcrumb trail
Visible on every interior page. Background sits on `#F2F2F2`. Up to 5 levels deep.

### Multi-tab product page
Every product page has a tab bar near the top — "Overview / Technical / Finishes / Downloads / Dealers" pattern. Each tab is a hash-anchored section, not a separate page.

### Filter sidebar
Catalog pages use a left sidebar with checkbox filters: material, profile depth, glass type, certifications. Heavy faceted-search pattern.

### PDF/CAD download cards
Sidebar lists of downloads with icon-by-format (PDF, DWG, IFC). Each download links to a real engineering-grade specification document.

### Multi-color badges
Certification badges throughout the site use the semantic color system: green = environmental certs (Cradle-to-Cradle), cyan = technical (CE marks), red = quality (ISO).

## Do's and Don'ts

**Do:**
- Multi-color semantic system (green/red/cyan) where each color has a defined role
- Single typeface (Univers) across the entire site
- Breadcrumb trails on every interior page
- Downloadable spec PDFs as a primary content type
- Information density — many things visible at once, no excessive whitespace

**Don't:**
- Don't use serifs (Schüco never does)
- Don't cap visual hierarchy at typography only — use color semantically too
- Don't use giant hero headlines (max 40px)
- Don't strip information to feel minimal — Schüco's audience wants every spec available

## Responsive Behavior

Tablet preserves the multi-column layouts but compresses sidebars. Mobile collapses sidebars to a top-of-page accordion. Breadcrumb trail truncates on mobile to last 2 segments.

## Iteration Guide

If you cite Schüco in a redesign brief, the most-quoted moves:
1. **Single sans typeface** (no serif anywhere)
2. **Multi-color semantic system** for certifications and content types
3. **PDF/CAD downloads** as a first-class content type
4. **Information density** over generous whitespace
5. **Breadcrumb-heavy IA** — visitors land deep and need to know where they are

## When to choose Schüco over Marvin / Sky-Frame

- Your audience is **architects, contractors, or specifiers** rather than homeowners
- Your catalog has **deep technical specs** that need to be downloadable
- Your brand value is **engineering precision** rather than residential warmth
- You ship **systems / infrastructure**, not consumer products
