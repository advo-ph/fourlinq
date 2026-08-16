# Aug 7 asset request — product hero shots still needed from the client

Products shipped in migration `019` and `src/data/products.ts` started on **schematic SVG placeholders** under `public/images/products/schematic/`, because the repo had no verified client photograph to attach as a product hero without inventing what FourlinQ sells.

**Supplied 2026-08-12 — client-approved white-background renders**, not photographs. They live under `render/`, not `real/`, so the path never claims otherwise. Migration `022` moves the DB `thumbnail_url` for the first two; migration `023` for the rest.

| Product id | Display name | Live path | Migration |
|---|---|---|---|
| `glass-railing` | Glass Railing | `/images/products/render/glass-railing.webp` | `022` |
| `louvre` | Louvre Windows | `/images/products/render/louvre.webp` | `022` |
| `automated-window` | Automated Windows | `/images/products/render/automated-window.webp` | `023` |
| `automated-door` | Automated Door Access | `/images/products/render/automated-door.webp` | `023` |
| `fixed-slide-door` | Fixed & Slide Door | `/images/products/render/fixed-slide-door.webp` | `023` (new product) |
| `slim-door` | Slim Door | `/images/products/render/slim-door.webp` | `023` (new product) |

> Note on the render policy: `docs/ROADMAP.md:109` (item 20) and `:452` (R4, "Imie rejects the white-bg renders") record the client rejecting synthetic white-bg renders on product cards. Every image in the table above was approved by the client on 2026-08-12 and is the documented exception, not a reversal. The louvre entry supersedes the CG render added in `2e9f874`. Item 20 stays **Partial** — the standing ask for real project photography is unchanged, and the two automation entries in particular are still worth a real hardware shot (see below).

**Still needed:**

| Product id | Display name | Current path | Shot still wanted from client |
|---|---|---|---|
| `sliding-casement-door` | Sliding Casement Door | `/images/products/render/sliding-casement-door.webp` (inherited from sc-door: 2x upscale of anim frame 1, 1280×720, 2026-08-16) | **Two asks open.** (a) A real photograph — the card still shows a synthetic animation frame. (b) A slide→swing frame set — the inherited 28-frame animation shows only the horizontal slide, NOT the casement pull-open swing. The casement swing is the distinguishing feature of the product. Both asks are outstanding from the client. |
| `automated-window` | Automated Windows | render (above) | Close detail of a motorised opener / chain actuator on a FourlinQ sash. The approved render shows a chain actuator generically; a real one on a real sash is still better. |
| `automated-door` | Automated Door Access | render (above) | Digital-access hardware close-up (keypad, reader, or fob plate) on a FourlinQ leaf. Same reasoning as above. |
| `fixed-slide-door` | Fixed & Slide Door | render (above) | An installed six-panel run, ideally part-open so the stacking reads. |
| `slim-door` | Slim Door | render (above) | The five-shot list in [AUG07_PROJECT_AREA_REQUEST.md](./AUG07_PROJECT_AREA_REQUEST.md) still stands. |

> **`sc-door` removed from catalog** (client instruction, 2026-08-16, migration `027`). The product was a wrong catalog entry. Its slug, assets (render, 28 animation frames, GLB), and useful soft-close copy have been redistributed: the slug is retired, the assets are inherited by `sliding-casement-door` via `git mv`, and the soft-close description and spec folded into `sliding-door`. The `sc-door` product_type and product rows are deactivated (not deleted) in migration `027`.
>
> History of this slot: migration `019` seeded it as "SC-Door System (Sliding Casement Door)"; `024` gave it the sliding-door image; `025` renamed it "Soft Closing Sliding Door"; `026` gave it a dedicated render. All four are superseded for this slug by `027`.

## Rules (do not bypass)

- Do **not** attach an unverified project photo from `public/images/projects/**` or Facebook exports unless the client confirms it shows that product.
- Replace each SVG in place (same path) or update the `image` field in static catalog + re-run seed / migration content update together.
- Keep the product-illustration style consistent with existing `/products` cards (light ground, product-first, no heavy lifestyle crop).
