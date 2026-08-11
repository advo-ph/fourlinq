# Asset prompts, one file per asset

Each file below is **self-contained** — the shared contract, palette, acceptance
test and image constraints are copied into every one, so you can hand over a
single file without stitching sections together.

Regenerate with `node scripts/_split-brief.mjs` after editing
[3D_ASSET_BRIEF.md](../3D_ASSET_BRIEF.md), which stays the source of truth.

| Asset | File | Built? |
|---|---|---|
| Glass Railing | [glass-railing.md](./glass-railing.md) | No |
| SC-Door (Sliding Casement Door) | [sc-door.md](./sc-door.md) | No |
| Automated Door Access | [automated-door.md](./automated-door.md) | No |
| Automated Windows | [automated-window.md](./automated-window.md) | No |
| Louvre / jalousie | [louvre.md](./louvre.md) | **Yes** — `louvre-model.js`, live in the viewer |
| Slim doors | [slim-door.md](./slim-door.md) | No |

**Tilt & turn is deliberately absent.** It is the last configurator type with no
3D, and it stays that way while it is an unconfirmed product: the glossary
describes it opening inward, which contradicts the client's "everything opens
out, never inward". Nothing should be commissioned for it until that is settled.
