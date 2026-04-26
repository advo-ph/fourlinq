# FourlinQ Roadmap

**Last updated: 2026-04-26**

This document tracks planned and in-progress improvements to the FourlinQ codebase beyond day-to-day client requests. It is a living document — update phase status as work lands, and move completed phases to the bottom under "Shipped."

For a record of what has actually changed and when, see [CHANGELOG.md](./CHANGELOG.md).

---

## Status legend

- **Planned** — agreed scope, not started
- **In progress** — actively being worked on
- **Blocked** — waiting on a decision, dependency, or client signal
- **Deferred** — intentionally postponed; revisit trigger noted
- **Shipped** — complete (move to the "Shipped" section with a date)

---

## Guiding principles

1. **Ship in phases.** Each phase below is independently shippable. Do not bundle phases unless they share a migration step.
2. **ROI over alphabetical order.** Phases are ordered by impact ÷ effort, not by topic.
3. **Don't build for hypothetical needs.** Phases marked "Deferred" stay deferred until a real trigger appears (client ask, scaling pain, etc.).
4. **Preserve the design system.** All work must comply with [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md). No emojis, no off-palette colors, no bouncy animations.
5. **Document as you go.** Every shipped phase gets a CHANGELOG entry on the day it merges.

---

## Phase 1 — Move product catalog to DB

**Status:** Planned
**Effort estimate:** 2–3 days
**Why first:** Unlocks non-developer content updates, sets the pattern for moving other content to the DB later, and the schema is already partially built.

### Scope

- Add tables: `product`, `product_finish`, `product_glass_option`, `product_image` (1:M relationship to `product`).
- Migration script that seeds the new tables from the current static data in [src/data/fourlinq-data.ts](../src/data/fourlinq-data.ts) so nothing breaks on cutover.
- Wire up [server/routes/products.ts](../server/routes/products.ts) (already stubbed): `GET /api/products`, `GET /api/products/:id`.
- Replace the `useProducts` hook in [src/hooks/useProducts.ts](../src/hooks/useProducts.ts) to fetch via React Query instead of returning the static array.
- Build a minimal admin CRUD UI under [src/pages/Admin.tsx](../src/pages/Admin.tsx) — list, edit form, image upload.
- Keep brand, contact, and branch info static in TypeScript for now. Those rarely change and are not blocking.

### Out of scope

- Multi-tenant catalogs.
- Product variants beyond the existing finish/glass dimensions.
- Pricing in the DB (intentional — pricing is custom-quoted).

### Risks

- Image upload requires a storage decision (Vercel Blob, S3, or local-with-CDN). Decide before starting.
- React Query caching needs revalidation strategy on admin edits.

---

## Phase 2 — Email notifications + rate limiting

**Status:** Planned
**Effort estimate:** Half a day
**Why next:** Small effort, immediate operational win. The client almost certainly expects "I get emailed when someone submits a quote."

### Scope

- Integrate Resend (or Sendgrid) for transactional email.
- Trigger emails on `POST /api/contact` and `POST /api/quote-request` to the configured sales address.
- Add `express-rate-limit` middleware on public endpoints (chat, contact, quote, save-configuration). Protects from spam and Gemini cost runaway.
- Plain HTML email template with the lead details (name, email, phone, message, ref ID, timestamp).

### Out of scope

- Customer-facing confirmation emails (Phase 5 candidate).
- Drip campaigns or marketing automation.

---

## Phase 3 — Tighten TypeScript + add CI

**Status:** Planned
**Effort estimate:** 1 day for strict mode, half-day for CI
**Why before bigger changes:** Safety net for everything that follows. Cheap to do, expensive to skip.

### Scope

- Flip `strictNullChecks: true` in [tsconfig.app.json](../tsconfig.app.json) and fix the fallout (expected to be under 50 sites).
- GitHub Action: `lint` + `typecheck` + `test` on every PR.
- Add Vitest tests for the highest-leverage targets first: data hooks, form validators, the configurator state machine.

### Out of scope

- E2E tests (Cypress/Playwright). Defer until a flow breaks in production.
- 100 percent coverage. Aim for confidence on critical paths only.

---

## Phase 4 — Real admin auth (conditional)

**Status:** Deferred
**Trigger to revisit:** Client adds a second admin user, or a security review requires per-user audit trails.
**Effort estimate:** 1–2 days

### Scope (when triggered)

- Replace the shared password with per-user accounts (bcrypt for password hashing, JWT unchanged).
- Wire the existing `auth_user`, `role`, and `permission` tables in [server/migrations/001_schema.sql](../server/migrations/001_schema.sql).
- Login page UI swap (email + password instead of password-only).
- Admin UI for inviting and disabling users.

### Why deferred

The shared password works fine for a one-person ops team. Building this now is YAGNI.

---

## Phase 5 — Move static copy + branches to DB

**Status:** Deferred
**Trigger to revisit:** Phase 1 ships and the client demonstrates appetite for self-service content editing, OR copy edit requests start arriving more than once a month.
**Effort estimate:** 1–2 days

### Scope (when triggered)

- `site_content` key-value table for hero, about, why-uPVC, and legal copy.
- `branch` table.
- Admin UI for editing both.

### Why deferred

Copy changes are infrequent today. Premature migration adds maintenance cost without payoff.

---

## Explicitly out of scope (not on the roadmap)

These have been considered and intentionally rejected. Reopen only if the business context changes.

- **i18n / multi-language.** Adds complexity to every component for no current market need.
- **Online payments / checkout.** The lead-capture model is intentional; quotes are custom and human-mediated.
- **Replacing shadcn/ui or restyling.** The current design system is solid and documented.
- **Inventory tracking.** Products are made-to-order, not stocked.

---

## Shipped

_No phases shipped yet. Move completed phases here with the ship date and a one-line summary._

<!--
Example entry once a phase ships:

### Phase 2 — Email notifications + rate limiting
**Shipped:** 2026-05-12
Quote and contact submissions now email the sales address via Resend. Rate limits applied to all public endpoints. See CHANGELOG entry for 2026-05-12.
-->
