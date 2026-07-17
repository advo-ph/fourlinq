# Client photo inventory — 2026-07-17

Client supplied `~/Downloads/fourlinq pictures`: **69 files, 51 unique** (18 exact duplicates). Reviewed
in full via contact sheets. Owner's instruction: *"all of them are real, or what the owners approve
it's okay, just keep houses not banners."*

## Result

| | Count |
|---|---|
| Houses / projects / product shots | **50** |
| Banners / marketing composites (excluded) | **1** — the "BRIGHT SPACES. BETTER LIVING." flyer (also present in the Telegram export as `photo_2026-05-28_05-30-01 (1).jpg`) |

## Imported (curated 10 → `public/images/projects/real/`)

Slugs describe **what the photo visibly shows**. They carry **no location or project-name claim** —
these files have no EXIF and hash filenames, so which project each depicts is unknown. Do not
attribute them to a named project without the client confirming.

| Slug | Shows |
|---|---|
| `slide-and-fold-interior` | Slide & fold door set, panels stacked, interior |
| `arch-french-doors` | French/Georgian doors, muntin bars, **arched fan transom** — the product described at meeting `00:20:09` |
| `french-doors-conservatory` | French doors with muntin bars, conservatory glazing |
| `sliding-doors-lanai` | Wood-grain sliding doors onto a lanai |
| `sliding-doors-interior` | Sliding doors, interior room |
| `special-shapes-glazing` | Angular/custom-geometry glazing, slat ceiling |
| `church-glazed-partition` | **A church interior** behind a glazed partition |
| `resort-multi-unit` | **Multi-unit / resort building** with pool |
| `residence-wood-grain-corner` | Residence, corner wood-grain windows |
| `residence-wood-clad` | Residence, wood-clad facade, dark frames |

Already imported separately: `public/images/products/real/sliding-door.webp` (corner sliding set, on the
Door Systems card — PR #28).

## 🔓 This unblocks D1's occupancy axis

D1 (projects browsable by area) was marked **blocked** because every project in `src/data/projects.ts`
is a residence, making a residential/commercial split 12/0. That is no longer true:

- `church-glazed-partition` — institutional
- `resort-multi-unit` — commercial/hospitality

This matches the meeting: *"maraming dami namin **hospital, churches**"* (`00:30:20`) and her interim
instruction *"O pwede **residential, commercial**"* (`00:23:14`). **Occupancy is a visible property of
the photo, not an invented one** — so this axis can be built without fabricating.

The **room-level axis ("MBR, Living")** remains blocked: room identity is not reliably visible and
would be invented.

## Provenance caveat (read before publishing any of these)

The owner states all are real or owner-approved. Independently, the set clearly ranges from amateur
phone shots (overcast, street-level, visible construction debris) to highly polished imagery whose
provenance cannot be verified from the file alone. FourlinQ's own flyer uses similarly polished
imagery. Per `project_fourlinq_ai_images`, provenance is not the bar — **accuracy is**: each image
must correctly depict a product FourlinQ actually sells. All ten above pass that test on inspection.

## Not imported

The remaining 40 houses are usable but currently have no surface that needs them, and importing
unused assets is repo bloat. The contact sheets used for review are reproducible from
`~/Downloads/fourlinq pictures` — regenerate rather than commit them.
