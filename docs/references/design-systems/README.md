# Design System References — Windows & Doors brands

A curated reference library of DESIGN.md files for premium fenestration brands, in the format popularized by [voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md) (itself inspired by Google Stitch's DESIGN.md concept).

Each file documents the **distinctive design choices** of one brand — colors, typography, layout philosophy, motion, components — so we can reference real industry examples when iterating on FourlinQ instead of relying on memory or general "premium" intuition.

## The four brands

Each occupies a distinct position on the spectrum from "American luxury residential" to "Swiss/European architectural minimalism":

| Brand | Region | Aesthetic | Best for citing when |
|---|---|---|---|
| **[Marvin](./marvin.md)** | American (Minnesota) | Editorial luxury residential — photography-first, warm-neutral palette, yellow accent | The brief is "premium residential" with substantial photo budget. **Our primary reference** for the FourlinQ redesign. |
| **[Sky-Frame](./sky-frame.md)** | Swiss | Minimalist architectural — asymmetric layouts, single bold orange accent against cool grays | The brief is "European refinement" with confidence to use generous negative space |
| **[Vitrocsa](./vitrocsa.md)** | Swiss / French | Extreme architectural restraint — near-monochrome, system sans, zero ornament | The audience is trained architects; understatement IS the luxury signaling |
| **[Schüco](./schueco.md)** | German | Engineering documentation — multi-color semantic system, Univers throughout, PDF downloads as first-class | The audience is contractors / specifiers; information density beats whitespace |

## How to use these

**When iterating on FourlinQ:**

If Tita says "I want it more like ___":
- "Like Marvin" → already the primary direction; check [docs/REDESIGN_ROADMAP.md §13](../../REDESIGN_ROADMAP.md) for the full token extraction
- "More minimalist" → see Sky-Frame for "Swiss orange accent" or Vitrocsa for "near-zero ornament"
- "More technical" → see Schüco for the multi-semantic color system and download-card patterns
- "Different feel entirely" → all four files have an "When to choose" section that names the trade-offs

**When briefing a designer or developer:**

Drop the relevant file into the conversation. Each file is self-contained — colors, type, layout philosophy, components, do's and don'ts, when-to-use. A designer reading any of these has enough context to produce work in that brand's style.

**When using AI coding agents:**

These follow the same format as [voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md). Any agent that understands DESIGN.md should parse them correctly. You can say "build me a section that looks like Sky-Frame" and the agent has a structured spec to follow.

## What's NOT in here

These four brands cover the **luxury / premium fenestration** spectrum but deliberately exclude:

- **Mass-market windows brands** (Pella, Andersen, Jeld-Wen) — different audience, different design vocabulary
- **Commercial curtain-wall specialists** (Kawneer, EFCO, YKK AP) — B2B-only, sales-rep-driven UX rather than editorial
- **uPVC-specific brands at scale** (REHAU, Veka, Internorm) — these are profile manufacturers selling to fabricators, not consumers

If we ever need to expand the reference set in those directions, add new files following the same format.

## Honest accuracy disclaimer

The Marvin file is **fully grep-extracted from production CSS** — every value is verified against real source.

The Sky-Frame and Schüco files are extracted from their primary CSS bundles — color and font tokens are verified, but layout philosophy is observed rather than coded.

The Vitrocsa file is **observation-based** — their site is heavily JS-rendered, so extracted values are limited to what was in the initial HTML response. The qualitative analysis ("near-monochrome", "system sans only") is grounded in direct site visits, but the precise token values may not match the brand's internal design system if they have one.

If precision matters for a future use case, re-probe the relevant site with browser DevTools open and update the file with the corrected values.
