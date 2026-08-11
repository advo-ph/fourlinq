# Aug 7 asset request — product hero shots still needed from the client

Products shipped in migration `019` and `src/data/products.ts` started on **schematic SVG placeholders** under `public/images/products/schematic/`, because the repo had no verified client photograph to attach as a product hero without inventing what FourlinQ sells.

**Supplied 2026-08-12 — client-approved white-background renders**, not photographs. They live under `render/`, not `real/`, so the path never claims otherwise. Migration `022` moves the DB `thumbnail_url` to match.

| Product id | Display name | Live path |
|---|---|---|
| `glass-railing` | Glass Railing | `/images/products/render/glass-railing.webp` |
| `louvre` | Louvre Windows | `/images/products/render/louvre.webp` |

> Note on the render policy: `docs/ROADMAP.md:109` (item 20) and `:452` (R4, "Imie rejects the white-bg renders") record the client rejecting synthetic white-bg renders on product cards. These two were approved by the client on 2026-08-12 and are the documented exception. The louvre entry supersedes the CG render added in `2e9f874`. Item 20 stays **Partial** — the standing ask for real project photography is unchanged.

**Still needed:**

| Product id | Display name | Placeholder path | Shot needed from client |
|---|---|---|---|
| `sc-door` | SC-Door System (Sliding Casement Door) | `/images/products/schematic/sc-door.svg` | Sliding Casement door leaf mid-travel on its track (not a swing casement, not a standard two-panel slider). Interior or exterior, full leaf visible. |
| `automated-window` | Automated Windows | `/images/products/schematic/automated-window.svg` | Close detail of a motorised opener / chain actuator on a FourlinQ sash **or** a full operable unit with the actuator visible. |
| `automated-door` | Automated Door Access | `/images/products/schematic/automated-door.svg` | Digital-access hardware close-up (keypad, reader, or fob plate) on a FourlinQ leaf, **or** the full door with the operator visible. |

## Rules (do not bypass)

- Do **not** attach an unverified project photo from `public/images/projects/**` or Facebook exports unless the client confirms it shows that product.
- Replace each SVG in place (same path) or update the `image` field in static catalog + re-run seed / migration content update together.
- Keep the product-illustration style consistent with existing `/products` cards (light ground, product-first, no heavy lifestyle crop).
