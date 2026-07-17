# FourlinQ — Premium uPVC & Aluminium Windows & Doors

A production website for FourlinQ, a windows-and-doors fabricator in the Philippines. Built with React, TypeScript, Tailwind CSS, and Framer Motion. Runs on an Express API with Neon Postgres, deployed to a VPS via pm2.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **Animations:** Framer Motion (signature `ease-marvin` curve)
- **Backend:** Express 5 (`server/`) — same server in dev and production
- **Database:** Neon Postgres (PostgreSQL 15+)
- **AI Chat:** Google Gemini API (server-side streaming, "LinQ" assistant)
- **Deployment:** VPS + pm2, via GitHub Actions on push to `main` (mirrors `./deploy.sh`: build on the runner → rsync to the VPS → pm2 restart). No Vercel.

## Design System

- **Color palette:** white canvas, `#242424` ink, FourlinQ red accent `#C8102E` (hover `#A00D26`), applied with restraint (hairlines + one CTA per fold, not background blocks).
- **Typography:** Manrope (body/UI) + Fraunces (serif display) + Cormorant Garamond (`promise` accent serif). Logo wordmark is Playfair Display.
- **Motion:** all transitions on the `ease-marvin` curve `cubic-bezier(.68, 0, .33, 1)`.
- Tokens are centralized in [src/theme.config.ts](./src/theme.config.ts), mirrored in `tailwind.config.ts` and `src/index.css`. See [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md).

## Getting Started

```sh
npm install
npm run dev          # Vite frontend on http://localhost:8080
npm run dev:api      # Express API on port 3001
npm run dev:all      # both concurrently
```

### Environment Variables

Create a `.env` in the project root:

```
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_neon_postgres_connection_string
```

## Scripts

| Script | What it does |
|--------|--------------|
| `dev` / `dev:api` / `dev:all` | Vite / Express / both |
| `build` / `preview` | Production build / preview |
| `typecheck` / `lint` / `test` | `tsc --build` / eslint / vitest |
| `qa:visual` | Playwright visual-QA capture (`scripts/visual-qa.mjs`) |
| `audit:prod-surface` | Read-only production-surface audit harness |
| `deploy` / `deploy:status` / `deploy:log` | VPS deploy helpers (`deploy.sh`) |

## Project Structure

```
├── server/                 # Express API (dev AND production)
│   ├── index.ts            # server entry
│   ├── routes/             # chat stream, contact, quote, config save, CMS
│   ├── migrations/         # SQL migrations
│   ├── llm/                # Gemini streaming
│   └── auth.ts, db.ts      # admin auth, Postgres pool
├── docs/                   # Design system, roadmap, runbooks, audits
├── public/images/          # Product/project photos, hero, icons
├── scripts/                # image generation, visual QA, viewport scan
├── src/
│   ├── components/         # chat, home, icons, layout, shared, ui
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

Production runs on the advo VPS under pm2. A push to `main` triggers `.github/workflows/deploy.yml`, which builds on the runner, rsyncs artifacts to the VPS, and restarts pm2 — the same flow as `./deploy.sh`. Check status with `npm run deploy:status`.

## License

Proprietary — FourlinQ Windows & Doors.
