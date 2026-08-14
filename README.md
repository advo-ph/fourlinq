# FourlinQ — Premium uPVC & Aluminium Windows & Doors

A production website for FourlinQ, a windows-and-doors fabricator in the Philippines. Built with React, TypeScript, Tailwind CSS, and Framer Motion. Runs on an Express API with Neon Postgres, deployed to a VPS via pm2.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **Animations:** Framer Motion (signature `ease-marvin` curve)
- **Backend:** Express 5 (`server/`) — same server in dev and production
- **Database:** Neon Postgres (PostgreSQL 15+)
- **AI Chat:** Google Gemini API (server-side streaming, "LinQ" assistant)
- **Deployment:** host `advo` (`/opt/fourlinq`, PM2 `fourlinq`). GitHub Actions on push to `main` mirrors `./deploy.sh` (build on the runner → rsync → pm2 reload). No Vercel.

## Design System

- **Color palette:** white canvas, `#242424` ink, FourlinQ red accent `#C8102E` (hover `#A00D26`), applied with restraint (hairlines + one CTA per fold, not background blocks).
- **Typography:** Manrope (body/UI) + Fraunces (serif display) + Cormorant Garamond (`promise` accent serif). Logo wordmark is Playfair Display.
- **Motion:** all transitions on the `ease-marvin` curve `cubic-bezier(.68, 0, .33, 1)`.
- Tokens are centralized in [src/theme.config.ts](./src/theme.config.ts), mirrored in `tailwind.config.ts` and `src/index.css`. See [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md).

## Getting Started

```sh
npm install
npm run dev          # Vite frontend on http://localhost:8080
npm run dev:api      # Express API on port 6207
npm run dev:all      # both concurrently
```

### Environment Variables

Create a `.env` in the project root.

**Required:**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `GEMINI_API_KEY` | Google Gemini key for the LinQ chat stream |

**Optional:**

| Variable | Purpose |
|---|---|
| `API_PORT` | Express port. Defaults to `3001` |
| `ADMIN_JWT_SECRET` | Signs admin sessions. Auto-generated per process if unset, so every restart logs admins out — set it in production |
| `VITE_API_URL` | API base for the frontend. Empty (same-origin) by default |
| `SMTP_HOST` · `SMTP_PORT` · `SMTP_USER` · `SMTP_PASS` · `SMTP_SECURE` | Inquiry-notification email. With none set the mailer no-ops and logs a warning — inquiries still save to the DB |
| `MAIL_TO` · `MAIL_FROM` · `MAIL_BCC` | Notification recipients. `MAIL_TO` defaults to `sales@fourlinq.com` |

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are read only by the one-off bootstrap script
(`server/scripts/create-admin.ts`), not at runtime.

## Scripts

| Script | What it does |
|--------|--------------|
| `dev` / `dev:api` / `dev:all` | Vite / Express / both |
| `build` / `preview` | Production build / preview |
| `typecheck` / `lint` / `test` | `tsc --build` / eslint / vitest |
| `qa:visual` | Playwright visual-QA capture (`scripts/visual-qa.mjs`) |
| `qa:a11y` | RM17 accessibility + fixed-layer scan (alt, control names, chat/banner overlap) |
| `qa:viewport` | RM5 viewport-containment scan (no horizontal document overflow) |
| `audit:prod-surface` | Read-only production-surface audit harness |
| `probe:glb` | Measures every window system in the GLBs — bounding box, fit scale, open-pose clip time. The viewer's pinned numbers come from here, never from hand-tuning. `-- --material` prints the material set per system |
| `handoff:export` | Bakes the procedural three.js builders in `scripts/handoff/model/` to `public/models/system/*.glb`, authoring each open/close clip from the builder's own `setOpen(t)` |
| `handoff:verify` | Reads each baked clip's samplers back and fails if a mechanism travels less than 40 mm or 8° — a builder that silently stopped moving still exports a valid file |
| `deploy` / `deploy:status` / `deploy:log` | VPS deploy helpers (`deploy.sh`) |

## Project Structure

```
├── server/                 # Express API (dev AND production)
│   ├── index.ts            # server entry
│   ├── routes/             # chat stream, contact, quote, config save, CMS
│   ├── migrations/         # SQL migrations
│   ├── llm/                # Gemini streaming
│   └── auth.ts, db.ts      # admin auth, Postgres pool
├── docs/                   # Design system, roadmap, runbooks, audits, licenses
├── public/
│   ├── images/             # Product/project photos, hero, icons
│   └── models/             # Window-system GLBs (per-system + one licensed)
├── scripts/                # image generation, visual QA, viewport scan
│   └── handoff/            # 3D builders + specs, and the GLB bake/verify pair
├── src/
│   ├── components/         # 3d, chat, home, icons, layout, shared, ui
│   ├── data/               # product, taxonomy, project, configurator, brand
│   ├── hooks/              # React Query hooks, analytics (consent-gated)
│   ├── lib/                # utilities, consent, cms-api
│   └── pages/              # route pages
└── tailwind.config.ts
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — video hero, systems, project reels, design tool, what's new, utility band |
| `/products` | Catalog — By type / By material, filter drill-down, detail drawer |
| `/aluminium` | Aluminium line, profiles, powder-coat finishes |
| `/design-tool` | Interactive window/door configurator |
| `/why-upvc` | Why uPVC — the 7 profile features, profiles (Veka/Skyframe), finishes, comparison |
| `/inspiration` · `/projects/:slug` | Project gallery + detail |
| `/for-architects` | Technical resources and engineering contact |
| `/finishes` · `/warranty` · `/care` · `/faq` · `/whats-new` · `/help-me-choose` | Supporting pages |
| `/brand` | Promise, warranty, showrooms, contact |
| `/admin` | CMS (admin auth) |
| `/legal` | Privacy, terms, cookie policy |

## Deployment

Host: `advo` (SSH alias). Remote path: `/opt/fourlinq`. PM2 process: `fourlinq`.

`./deploy.sh` defaults to `VPS_SSH=advo`. A push to `main` triggers `.github/workflows/deploy.yml`, which builds on the runner, rsyncs artifacts to `/opt/fourlinq`, and **reloads** pm2 — the same flow as `./deploy.sh`. Check status with `npm run deploy:status`.

**Deploys are zero-downtime.** pm2 runs the app in cluster mode: a reload starts the replacement worker, waits for it to signal `ready` (`process.send("ready")` in `server/index.ts`), and only then stops the old one. Measured on the VPS under a 10/s poll, a fork-mode restart dropped 6 requests; a cluster reload drops 0.

Two consequences worth knowing before changing the deploy:

- **The cluster entry is a built bundle, not the TypeScript.** pm2's cluster container is CommonJS and cannot load an ESM/TS entry — it dies before any app code runs and writes nothing to the logs. `npm run build:server` bundles `server/index.ts` to `server/index.bundle.cjs` (gitignored; built on the runner). It must stay in `server/` so its `../uploads` and `../dist` paths resolve as they did under tsx.
- **`tsx` and `typescript` are runtime `dependencies`, not devDependencies.** `npm ci --omit=dev` previously deleted them and a follow-up install could land half-written, crash-looping the app while every deploy step still reported success. The deploy also verifies the boot entrypoint exists before reloading, and `scripts/verify-deploy.sh` requires consecutive health responses plus a stable pm2 restart count so a boot loop fails the deploy instead of hiding in it.

## License

Proprietary — FourlinQ Windows & Doors.
