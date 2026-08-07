# Aug 7 asset request — product hero shots still needed from the client

The four products shipped in migration `019` and `src/data/products.ts` currently use **schematic SVG placeholders** under `public/images/products/schematic/`. The repo has no verified client photograph that we can attach as a product hero without inventing what FourlinQ sells.

| Product id | Display name | Placeholder path | Shot needed from client |
|---|---|---|---|
| `glass-railing` | Glass Railing | `/images/products/schematic/glass-railing.svg` | Straight-on balcony or terrace glass railing (frameless or minimal post), daylight, no scaffolding. Prefer a finished install FourlinQ fabricated. |
| `sc-door` | SC-Door System (Sliding Casement Door) | `/images/products/schematic/sc-door.svg` | Sliding Casement door leaf mid-travel on its track (not a swing casement, not a standard two-panel slider). Interior or exterior, full leaf visible. |
| `louvre` | Louvre Windows | `/images/products/schematic/louvre.svg` | Glass louvre window with blades partially open, frame finish readable, tropical facade or utility room context. |
| `automated-window` | Automated Windows | `/images/products/schematic/automated-window.svg` | Close detail of a motorised opener / chain actuator on a FourlinQ sash **or** a full operable unit with the actuator visible; optionally a digital-access hardware close-up if that is the preferred hero. |

## Rules (do not bypass)

- Do **not** attach an unverified project photo from `public/images/projects/**` or Facebook exports unless the client confirms it shows that product.
- Replace each SVG in place (same path) or update the `image` field in static catalog + re-run seed / migration content update together.
- Keep the product-illustration style consistent with existing `/products` cards (light ground, product-first, no heavy lifestyle crop).
