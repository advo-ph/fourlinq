# Claude Design prompts

One file per asset. Paste the whole file — each restates the full contract, so
none of them depends on the others or on repo access.

- [Glass Railing](./glass-railing.md) → `railing-model.js`
- [SC-Door — Sliding Casement Door](./sc-door.md) → `sc-door-model.js`
- [Automated Windows](./automated-window.md) → `automated-window-model.js`
- [Automated Door Access](./automated-door.md) → `automated-door-model.js`
- [Slim doors](./slim-door.md) → `slim-door-model.js`

**Louvre is not here — it is already built** (`scripts/handoff/model/louvre-model.js`,
live in the viewer). **Tilt & turn is not here either**, and deliberately: it is an
unconfirmed product whose glossary entry says it opens inward, which contradicts
the client's "everything opens out, never inward". Settle that before commissioning it.

When a builder comes back, drop it in `scripts/handoff/model/`, add a registry
entry in `scripts/handoff/export-glb.mjs`, then run `npm run handoff:export`,
`npm run handoff:verify` and `npm run probe:glb` — the last one prints the
`center` / `scale` / `openTime` numbers to paste into `window-system.ts`. Never
hand-type those.
