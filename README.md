# FourlinQ — Premium uPVC Windows & Doors

A production-ready website for FourlinQ, a premium uPVC windows and doors company in the Philippines. Built with React, TypeScript, Tailwind CSS, and Framer Motion. Deployed on Vercel with Neon Postgres backend.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **Animations:** Framer Motion
- **Backend:** Express.js (local dev) / Vercel Serverless Functions (production)
- **Database:** Neon Postgres (PostgreSQL 15+)
- **AI Chat:** Google Gemini API (server-side streaming)
- **Deployment:** Vercel

## Design System

- **Color palette:** Black/white/red — dark charcoal backgrounds, white surfaces, red accent (#DC2626)
- **Typography:** DM Sans (body/UI) + Playfair Display (logo/brand serif)
- **Logo:** Serif wordmark "FourlinQ" with red Q, divider line, "Windows & Doors" subtitle
- **Aesthetic:** "Tropical Futurism" — Tesla-inspired minimalist premium

## Getting Started

```sh
# Install dependencies
npm install

# Start dev server (frontend + backend)
npm run dev
```

The dev server runs on `http://localhost:5173` with the Express backend on port 3001.

### Environment Variables

Create a `.env` file in the project root:

```
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_neon_postgres_connection_string
```

## Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── chat/stream.ts      # Gemini streaming chat endpoint
│   ├── contact.ts          # Contact form submissions
│   ├── quote-request.ts    # Quote request submissions
│   ├── save-configuration.ts # Design tool config saves
│   └── setup-db.ts         # Database migration endpoint
├── docs/                   # Design system & architecture docs
├── public/images/          # Product images, hero bg, icons
│   ├── hero-bg.jpg         # Hero background image
│   ├── icons/              # Minimalistic window/door PNG icons
│   └── wp-export/          # Product & project photos
├── server/                 # Local Express dev server
├── src/
│   ├── components/
│   │   ├── chat/           # AI chat panel components
│   │   ├── home/           # Homepage sections
│   │   ├── icons/          # SVG window/door icon components
│   │   ├── layout/         # Navbar, Footer, Layout wrapper
│   │   ├── shared/         # Logo, CTABanner, QuoteModal, etc.
│   │   └── ui/             # shadcn/ui primitives
│   ├── data/               # Product, project, configurator data
│   ├── hooks/              # React Query hooks for API data
│   ├── lib/                # Utilities
│   └── pages/              # Route pages (Home, Products, Brand, etc.)
├── vercel.json             # Vercel deployment config
└── tailwind.config.ts      # Tailwind configuration
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, trust bar, products preview, benefits, gallery |
| `/products` | Product catalog with filter tabs and detail drawer |
| `/design-tool` | Interactive window/door configurator |
| `/why-upvc` | Material comparison and benefits |
| `/brand` | Company story, certifications, contact form |
| `/legal` | Privacy policy, terms, cookie policy |

## Deployment

The project is configured for Vercel deployment:

```sh
# Deploy to Vercel
vercel --prod
```

Serverless functions in `api/` are automatically deployed as Vercel Functions. The `vercel.json` handles SPA routing rewrites.

## License

Proprietary — FourlinQ Windows & Doors.
