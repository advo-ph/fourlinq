# cms-rag

A drop-in kit that gives any web app two things:

1. **A RAG knowledge base** (pgvector + Gemini embeddings) the AI chatbot
   pulls from.
2. **An admin Content Manager** — projects, news, pages, products, media —
   that auto-syncs every edit back into the knowledge base.

Other projects (fourlinq, advo, kent, etc.) consume this kit by writing one
config file. Adding a new entity (`case_studies`, `blog_posts`, `team`) is a
single object literal — no per-entity backend route, no per-entity React form.

## What you get out of the box

| Layer | What |
|---|---|
| **DB** | `knowledge_base`, `knowledge_chunk` (pgvector), `cms_media_asset`, `cms_page`, `cms_post` |
| **Backend** | Provider-agnostic embedder (Gemini included), KB sync helper, generic CRUD route factory, image-upload route factory |
| **Frontend** | `<ContentManager />` admin tab, generic `<EntityPanel />` list+editor, `<MarkdownEditor />` with live preview, `<MediaPicker />` drag-drop uploader |

## Integration in 5 minutes

### 1. Apply the migrations

```bash
psql -d your_db -f packages/cms-rag/migrations/001_knowledge.sql
psql -d your_db -f packages/cms-rag/migrations/002_cms.sql
```

Both files are idempotent (`CREATE TABLE IF NOT EXISTS`). They expect:
- `CREATE EXTENSION IF NOT EXISTS vector;` (pgvector)
- An `organization` table (or any table with `organization_id`) used for
  multi-tenancy. Replace the column if your tenant root is named differently.

### 2. Write one config file: `server/cms-config.ts`

```ts
import path from "path";
import pool from "./db.js";
import {
  createGeminiEmbedder, createKbSync, createCmsRouter, createUploadRouter,
  type EntityConfig, type EntityKbAdapter,
} from "../packages/cms-rag/server/index.js";

const ORG_ID = 1;

// (1) Describe each entity once. Drives both routes AND admin UI.
const projectEntity: EntityConfig = {
  kind: "projects",
  label: "Project",
  labelPlural: "Projects",
  table: "cms_project",         // your DB table
  pk: "cms_project_id",
  slugColumn: "slug",
  syncKb: true,
  fields: [
    { column: "slug",          type: "text",         required: true },
    { column: "title",         type: "text",         required: true },
    { column: "cover_path",    type: "image" },
    { column: "description",   type: "markdown" },
    { column: "gallery_paths", type: "string_array" },
    { column: "is_published",  type: "boolean", default: true },
  ],
};

// (2) Tell the KB how to render this row as a chunk.
const projectAdapter: EntityKbAdapter = {
  kind: "projects",
  loadById: async (pool, id) => {
    const { rows } = await pool.query(
      `SELECT slug, title, description, is_published, deleted_at
       FROM cms_project WHERE cms_project_id = $1`, [id]);
    return rows[0] ?? null;
  },
  isInactive: (r: any) => !!r.deleted_at || !r.is_published,
  toChunk: (r: any) => ({
    title: `Project — ${r.title}`,
    content: `${r.title}. ${r.description ?? ""} Visit /projects/${r.slug}.`,
    contentType: "project",
    tags: ["project", r.slug],
    sourceUrl: "",  // filled in by kb-sync
  }),
};

const kb = createKbSync({
  pool,
  embedder: createGeminiEmbedder({ apiKey: process.env.GEMINI_API_KEY! }),
  kbName: "Site Knowledge",
  organizationId: ORG_ID,
  adapters: { projects: projectAdapter },
});

const { publicRouter, adminRouter } = createCmsRouter({
  pool, organizationId: ORG_ID, entities: [projectEntity], kb,
});

const uploadRouter = createUploadRouter({
  pool,
  organizationId: ORG_ID,
  uploadDir: path.resolve(import.meta.dirname, "../uploads/cms"),
  publicPrefix: "/uploads/cms",
});

export { publicRouter, adminRouter, uploadRouter };
```

### 3. Mount the routers in `server/index.ts`

```ts
import express from "express";
import { publicRouter, adminRouter, uploadRouter } from "./cms-config.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Public reader (no auth)
app.use("/api/cms", publicRouter);

// Static file serving for uploads
app.use("/uploads", express.static("uploads", { maxAge: "30d" }));

// Admin (your auth middleware)
app.use("/api/admin/cms",       requireAdmin, adminRouter);
app.use("/api/admin/cms/media", requireAdmin, uploadRouter);
```

### 4. Drop the admin UI into your admin page

```tsx
import { ContentManager, CmsRagApi } from "../../packages/cms-rag/client";

const api = new CmsRagApi("/api/admin/cms");

export default function AdminPage() {
  return <ContentManager api={api} />;
}
```

The UI auto-discovers entities via `/_entities`. Adding a new entity (e.g.
`team_member`) means: write the `EntityConfig` + `EntityKbAdapter`, re-deploy.
Zero frontend code.

### 5. Read from the public API in your site pages

```tsx
const res = await fetch("/api/cms/projects");
const { items } = await res.json();
```

Or by slug:

```tsx
const res = await fetch(`/api/cms/projects/${slug}`);
const { item } = await res.json();
```

## Field types

| `type` | Renders as | DB column type suggestion |
|---|---|---|
| `text` | single-line input | `text` |
| `textarea` | multi-line input | `text` |
| `markdown` | split-pane editor with live preview | `text` |
| `number` | number input | `integer` / `numeric` |
| `boolean` | checkbox | `boolean` |
| `select` | dropdown (needs `options`) | `text` |
| `image` | drag-drop uploader + URL fallback | `text` (stores file_path) |
| `string_array` | textarea, parsed by line / comma | `text[]` |
| `json` | textarea, parsed as JSON | `jsonb` |

## How the KB sync works

Every successful POST/PUT/DELETE through the admin router fires
`kb.syncEntity(kind, id)` (or `deactivateEntity`):

1. Loads the row from your table via the adapter's `loadById`.
2. If the row is deleted/unpublished (per `isInactive`), marks any matching
   chunk as `is_active = false` and exits.
3. Otherwise runs `toChunk(row)` to produce a `{title, content, tags, contentType}`.
4. Upserts a `knowledge_chunk` keyed on `source_url = cms://{kind}/{id}`.
5. Best-effort embeds inline. If the embed call fails, the chunk row exists
   with `embedding = NULL` and your nightly seed-embeddings sweep picks it
   up later.

The chatbot's retrieval code is **unchanged** — it just queries
`knowledge_chunk` by cosine similarity over `embedding` and filters
`is_active = true`. No coupling to the CMS shape.

## Files

```
packages/cms-rag/
├── README.md                    ← this file
├── migrations/
│   ├── 001_knowledge.sql        ← knowledge_base + knowledge_chunk
│   └── 002_cms.sql              ← cms_media_asset + cms_page + cms_post
├── server/
│   ├── index.ts                 ← re-export
│   ├── embed.ts                 ← Embedder type + Gemini impl
│   ├── kb-sync.ts               ← createKbSync({pool, adapters, ...})
│   ├── routes-cms.ts            ← createCmsRouter({entities})
│   └── routes-upload.ts         ← createUploadRouter({uploadDir})
└── client/
    ├── index.ts                 ← re-export
    ├── api.ts                   ← CmsRagApi fetch client
    ├── ContentManager.tsx       ← admin tab
    ├── EntityPanel.tsx          ← generic list + edit modal
    ├── MarkdownEditor.tsx       ← write/preview pane
    └── MediaPicker.tsx          ← drag-drop upload + URL input
```

## Conventions this kit assumes

It follows the universal database conventions in
`~/.claude/skills/database-conventions/SKILL.md`:

- PK column is `{table}_id` (BIGINT IDENTITY or UUID)
- Required `created_at TIMESTAMPTZ` on every table
- Soft-delete via nullable `deleted_at TIMESTAMPTZ`, never `is_deleted`
- Predicate booleans prefixed `is_*`
- `snake_case` columns
- `_count` suffix for counts; singular nouns for measurements
- `TIMESTAMPTZ` for all event timestamps

If your existing schema deviates, override via `EntityConfig` knobs
(`orgColumn`, `deletedAtColumn: null`, `publishedColumn`, `pk`, etc.).

## Fourlinq is the first consumer

See `server/cms-config.ts` in this repo for a working example covering four
entities (projects, news, pages, products) and a fourlinq-specific product
table that lives outside the kit's `cms_post` shape but still plugs into the
same admin UI and KB sync. That config file is the only thing fourlinq
maintains — everything else lives in `packages/cms-rag/` and is reusable.
