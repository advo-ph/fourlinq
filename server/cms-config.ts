/**
 * FourlinQ's wiring of @cms-rag.
 * This is the only file that has to change when fourlinq adds or removes a CMS entity.
 */
import path from "path";
import pool from "./db.js";
import {
  createGeminiEmbedder,
  createKbSync,
  createCmsRouter,
  createUploadRouter,
  createUsersRouter,
  createAuditMiddleware,
  type EntityConfig,
  type EntityKbAdapter,
} from "../packages/cms-rag/server/index.js";

const ORG_ID = 1;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// ─────────────────────────────────────────────
// Entity definitions (drive both routes + admin UI)
// ─────────────────────────────────────────────

const projectEntity: EntityConfig = {
  kind: "projects",
  label: "Project",
  labelPlural: "Projects",
  table: "cms_project",
  pk: "cms_project_id",
  slugColumn: "slug",
  orderBy: "display_order ASC, published_at DESC",
  syncKb: true,
  fields: [
    { column: "slug", label: "Slug", type: "text", required: true },
    { column: "title", label: "Title", type: "text", required: true },
    { column: "location", label: "Location", type: "text" },
    { column: "category", label: "Category", type: "select", options: [
      { value: "casement", label: "Casement" },
      { value: "sliding", label: "Sliding" },
      { value: "specialist", label: "Specialist" },
      { value: "interior", label: "Interior" },
      { value: "exterior", label: "Exterior" },
      { value: "doors", label: "Doors" },
    ]},
    { column: "cover_path", label: "Cover image", type: "image" },
    { column: "caption", label: "Caption", type: "textarea" },
    { column: "description", label: "Description", type: "markdown" },
    { column: "gallery_paths", label: "Gallery paths (one per line)", type: "string_array" },
    { column: "architect", label: "Architect", type: "text" },
    { column: "project_year", label: "Year", type: "number" },
    { column: "systems_used", label: "Systems used", type: "string_array" },
    { column: "quote_text", label: "Quote text", type: "textarea" },
    { column: "quote_attribution", label: "Quote attribution", type: "text" },
    { column: "display_order", label: "Display order", type: "number", default: 999 },
    { column: "is_featured", label: "Featured", type: "boolean" },
    { column: "is_published", label: "Published", type: "boolean", default: true },
  ],
};

const newsEntity: EntityConfig = {
  kind: "news",
  label: "News post",
  labelPlural: "News",
  table: "cms_news_post",
  pk: "cms_news_post_id",
  slugColumn: "slug",
  orderBy: "published_at DESC NULLS LAST",
  syncKb: true,
  fields: [
    { column: "slug", label: "Slug", type: "text", required: true },
    { column: "title", label: "Title", type: "text", required: true },
    { column: "category", label: "Category", type: "select", required: true, options: [
      { value: "project", label: "Project" },
      { value: "product", label: "Product" },
      { value: "event", label: "Event" },
      { value: "press", label: "Press" },
    ]},
    { column: "published_at", label: "Published at", type: "text" }, // ISO date
    { column: "cover_path", label: "Cover image", type: "image" },
    { column: "excerpt", label: "Excerpt", type: "textarea" },
    { column: "body", label: "Body", type: "markdown" },
    { column: "internal_link", label: "Internal link", type: "text" },
    { column: "external_link", label: "External link", type: "text" },
    { column: "is_published", label: "Published", type: "boolean", default: true },
  ],
};

const pageEntity: EntityConfig = {
  kind: "pages",
  label: "Page",
  labelPlural: "Pages",
  table: "cms_page",
  pk: "cms_page_id",
  slugColumn: "route",
  orderBy: "route ASC",
  syncKb: true,
  fields: [
    { column: "route", label: "Route", type: "text", required: true },
    { column: "title", label: "Title (SEO)", type: "text", required: true },
    { column: "meta_description", label: "Meta description", type: "textarea" },
    { column: "meta_keywords", label: "Meta keywords", type: "text" },
    { column: "hero_eyebrow", label: "Hero eyebrow", type: "text" },
    { column: "hero_heading", label: "Hero heading", type: "text" },
    { column: "hero_subheading", label: "Hero subheading", type: "textarea" },
    { column: "hero_cta_label", label: "Hero CTA label", type: "text" },
    { column: "hero_cta_href", label: "Hero CTA href", type: "text" },
    { column: "hero_image_path", label: "Hero image", type: "image" },
    { column: "body", label: "Body", type: "markdown" },
    { column: "is_published", label: "Published", type: "boolean", default: true },
  ],
};

const productEntity: EntityConfig = {
  kind: "products",
  label: "Product",
  labelPlural: "Products",
  table: "product",
  pk: "product_id",
  slugColumn: "slug",
  orderBy: "is_featured DESC, name ASC",
  publishedColumn: "is_active",
  deletedAtColumn: null, // product has no soft-delete; treat is_active as the flag
  syncKb: true,
  fields: [
    { column: "slug", label: "Slug", type: "text", required: true },
    { column: "name", label: "Name", type: "text", required: true },
    { column: "tagline", label: "Tagline", type: "text" },
    { column: "thumbnail_url", label: "Thumbnail", type: "image" },
    { column: "short_description", label: "Short description", type: "textarea" },
    { column: "description", label: "Description", type: "markdown" },
    { column: "technical_summary", label: "Technical summary", type: "markdown" },
    { column: "min_width_mm", label: "Min width (mm)", type: "number" },
    { column: "max_width_mm", label: "Max width (mm)", type: "number" },
    { column: "min_height_mm", label: "Min height (mm)", type: "number" },
    { column: "max_height_mm", label: "Max height (mm)", type: "number" },
    { column: "lead_time_day", label: "Lead time (days)", type: "number" },
    { column: "warranty_year", label: "Warranty (years)", type: "number", default: 10 },
    { column: "youtube_id", label: "YouTube video ID (e.g. abc123XYZ_-)", type: "text" },
    { column: "finish_labels", label: "Available finishes (one per line, exact label)", type: "string_array" },
    { column: "glass_labels", label: "Glass options (one per line)", type: "string_array" },
    { column: "spec_labels", label: "Specs (one per line, in display order)", type: "string_array" },
    { column: "is_featured", label: "Featured", type: "boolean" },
    { column: "is_active", label: "Active", type: "boolean", default: true },
  ],
};

// ─────────────────────────────────────────────
// KB adapters (entity row → chunk shape for the chatbot)
// ─────────────────────────────────────────────

const projectAdapter: EntityKbAdapter = {
  kind: "projects",
  loadById: async (pool, id) => {
    const { rows } = await pool.query(
      `SELECT slug, title, location, category, caption, description,
              gallery_paths, architect, project_year, systems_used,
              is_published, deleted_at
       FROM cms_project WHERE cms_project_id = $1`, [id]);
    return rows[0] ?? null;
  },
  isInactive: (r: any) => !!r.deleted_at || !r.is_published,
  toChunk: (r: any) => {
    const parts: string[] = [];
    parts.push(`${r.title}${r.location ? ` (${r.location})` : ""}.`);
    if (r.caption) parts.push(r.caption);
    if (r.description) parts.push(r.description);
    if (r.systems_used?.length) parts.push(`Systems used: ${r.systems_used.join(", ")}.`);
    if (r.architect) parts.push(`Architect: ${r.architect}.`);
    if (r.project_year) parts.push(`Year: ${r.project_year}.`);
    parts.push(`Visit /projects/${r.slug} on the site.`);
    return {
      title: `Project — ${r.title}${r.location ? ` (${r.location})` : ""}`,
      content: parts.join(" "),
      contentType: "project",
      tags: ["project", r.category ?? "uncategorized", r.slug].filter(Boolean),
      sourceUrl: "", // filled by kb-sync
    };
  },
};

const newsAdapter: EntityKbAdapter = {
  kind: "news",
  loadById: async (pool, id) => {
    const { rows } = await pool.query(
      `SELECT slug, title, excerpt, body, category, internal_link, external_link,
              is_published, published_at, deleted_at
       FROM cms_news_post WHERE cms_news_post_id = $1`, [id]);
    return rows[0] ?? null;
  },
  isInactive: (r: any) => !!r.deleted_at || !r.is_published,
  toChunk: (r: any) => ({
    title: `News [${r.category}] — ${r.title}`,
    content: [
      `${r.title} (${r.category}, ${r.published_at ? new Date(r.published_at).toISOString().slice(0, 10) : "undated"}).`,
      r.excerpt, r.body,
      r.internal_link ? `Read more: ${r.internal_link}.` : null,
      r.external_link ? `Source: ${r.external_link}.` : null,
    ].filter(Boolean).join(" "),
    contentType: "news",
    tags: ["news", r.category, r.slug].filter(Boolean),
    sourceUrl: "",
  }),
};

const pageAdapter: EntityKbAdapter = {
  kind: "pages",
  loadById: async (pool, id) => {
    const { rows } = await pool.query(
      `SELECT route, title, meta_description, hero_eyebrow, hero_heading,
              hero_subheading, body, is_published, deleted_at
       FROM cms_page WHERE cms_page_id = $1`, [id]);
    return rows[0] ?? null;
  },
  isInactive: (r: any) => !!r.deleted_at || !r.is_published,
  toChunk: (r: any) => ({
    title: `Page — ${r.title} (${r.route})`,
    content: [
      r.hero_heading ?? r.title,
      r.hero_eyebrow, r.hero_subheading, r.meta_description, r.body,
      `Visit ${r.route} on the site.`,
    ].filter(Boolean).join(" "),
    contentType: "page",
    tags: ["page", r.route.replace(/^\//, "") || "home"],
    sourceUrl: "",
  }),
};

const productAdapter: EntityKbAdapter = {
  kind: "products",
  loadById: async (pool, id) => {
    const { rows } = await pool.query(
      `SELECT slug, name, tagline, short_description, description, technical_summary,
              min_width_mm, max_width_mm, min_height_mm, max_height_mm,
              lead_time_day, warranty_year, is_active
       FROM product WHERE product_id = $1`, [id]);
    return rows[0] ?? null;
  },
  isInactive: (r: any) => !r.is_active,
  toChunk: (r: any) => ({
    title: `Product — ${r.name}`,
    content: [
      r.tagline ? `${r.name}: ${r.tagline}.` : `${r.name}.`,
      r.short_description, r.description, r.technical_summary,
      r.min_width_mm
        ? `Dimensions: ${r.min_width_mm}–${r.max_width_mm}mm wide × ${r.min_height_mm}–${r.max_height_mm}mm tall.`
        : null,
      r.lead_time_day ? `Lead time: ${r.lead_time_day} days.` : null,
      r.warranty_year ? `Warranty: ${r.warranty_year} years.` : null,
    ].filter(Boolean).join(" "),
    contentType: "product",
    tags: ["product", r.slug].filter(Boolean),
    sourceUrl: "",
  }),
};

const aluminiumAdapter: EntityKbAdapter = {
  kind: "aluminium",
  loadById: async (pool, id) => {
    const { rows } = await pool.query(
      `SELECT slug, name, summary, best_for, spec_sheet_url, is_published, deleted_at
       FROM cms_aluminium_system WHERE cms_aluminium_system_id = $1`, [id]);
    return rows[0] ?? null;
  },
  isInactive: (r: any) => !!r.deleted_at || !r.is_published,
  toChunk: (r: any) => ({
    title: `Aluminium system — ${r.name}`,
    content: [
      `${r.name} aluminium system.`,
      r.summary,
      r.best_for ? `Best for: ${r.best_for}` : null,
      r.spec_sheet_url ? `Spec sheet: ${r.spec_sheet_url}.` : null,
      "See /aluminium on the site.",
    ].filter(Boolean).join(" "),
    contentType: "product",
    tags: ["aluminium", r.slug].filter(Boolean),
    sourceUrl: "",
  }),
};

const documentAdapter: EntityKbAdapter = {
  kind: "document",
  loadById: async (pool, id) => {
    const { rows } = await pool.query(
      `SELECT slug, title, doc_type, description, file_path, link_url, note,
              is_published, deleted_at
       FROM cms_document WHERE cms_document_id = $1`, [id]);
    return rows[0] ?? null;
  },
  isInactive: (r: any) => !!r.deleted_at || !r.is_published,
  toChunk: (r: any) => {
    // Mirror the page's derived status so the chatbot gives the same answer
    // the technical library shows.
    const availability = r.file_path
      ? `Downloadable now from the technical library on /for-architects (${r.file_path}).`
      : r.link_url
        ? `Available now at ${r.link_url} on the site.`
        : `${r.note ?? "Available on request"} — email sales@fourlinq.com with the document title.`;
    return {
      title: `Technical document — ${r.title}`,
      content: [
        `${r.title} (${r.doc_type}).`,
        r.description,
        availability,
      ].filter(Boolean).join(" "),
      contentType: "page",
      tags: ["document", "architects", r.slug].filter(Boolean),
      sourceUrl: "",
    };
  },
};

// ─────────────────────────────────────────────
// Build the wiring
// ─────────────────────────────────────────────

const mediaEntity: EntityConfig = {
  kind: "media",
  label: "Image",
  labelPlural: "Media",
  table: "cms_media_asset",
  pk: "cms_media_asset_id",
  orderBy: "created_at DESC",
  fields: [
    { column: "file_path", label: "File path", type: "text" },
    { column: "alt_text", label: "Alt text", type: "text" },
    { column: "tags", label: "Tags", type: "string_array" },
    { column: "source", label: "Source", type: "text" },
    { column: "is_published", label: "Published", type: "boolean", default: true },
  ],
};

const aluminiumEntity: EntityConfig = {
  kind: "aluminium",
  label: "Aluminium system",
  labelPlural: "Aluminium",
  table: "cms_aluminium_system",
  pk: "cms_aluminium_system_id",
  slugColumn: "slug",
  orderBy: "display_order ASC, name ASC",
  fields: [
    { column: "slug", label: "Slug", type: "text", required: true },
    { column: "name", label: "System name", type: "text", required: true },
    { column: "summary", label: "Summary", type: "textarea" },
    { column: "best_for", label: "Best for", type: "textarea" },
    { column: "hero_image_url", label: "Hero image", type: "image" },
    { column: "spec_sheet_url", label: "Spec sheet (PDF or external link)", type: "text" },
    { column: "display_order", label: "Display order", type: "number", default: 0 },
    { column: "is_published", label: "Published", type: "boolean", default: true },
  ],
  syncKb: true,
};

const documentEntity: EntityConfig = {
  kind: "document",
  label: "Document",
  labelPlural: "Documents",
  table: "cms_document",
  pk: "cms_document_id",
  slugColumn: "slug",
  orderBy: "display_order ASC, title ASC",
  fields: [
    { column: "slug", label: "Slug", type: "text", required: true },
    { column: "title", label: "Title", type: "text", required: true },
    { column: "doc_type", label: "File type badge", type: "select", default: "PDF", options: [
      { value: "PDF", label: "PDF" },
      { value: "DWG", label: "DWG (AutoCAD)" },
      { value: "RFA", label: "RFA (Revit)" },
      { value: "ZIP", label: "ZIP" },
      { value: "DOC", label: "DOC" },
    ]},
    { column: "description", label: "Description", type: "textarea" },
    { column: "file_path", label: "File (PDF, DWG, RFA, ZIP, or DOC)", type: "file" },
    { column: "link_url", label: "Link (site route like /finishes, or external URL — used when there is no PDF)", type: "text" },
    { column: "note", label: "Status note when there is no PDF and no link (blank = \"On request\")", type: "text" },
    { column: "display_order", label: "Display order", type: "number", default: 999 },
    { column: "is_published", label: "Published", type: "boolean", default: true },
  ],
  syncKb: true,
};

const entities = [projectEntity, newsEntity, pageEntity, productEntity, aluminiumEntity, documentEntity, mediaEntity];

const kb = createKbSync({
  pool,
  embedder: GEMINI_KEY ? createGeminiEmbedder({ apiKey: GEMINI_KEY }) : undefined,
  kbName: "Site Knowledge — Generated",
  kbDescription: "Auto-generated chunks for fourlinq.ph CMS content.",
  organizationId: ORG_ID,
  adapters: {
    projects: projectAdapter,
    news: newsAdapter,
    pages: pageAdapter,
    products: productAdapter,
    aluminium: aluminiumAdapter,
    document: documentAdapter,
  },
});

const { publicRouter: cmsPublic, adminRouter: cmsAdmin } = createCmsRouter({
  pool,
  organizationId: ORG_ID,
  entities,
  kb,
});

const uploadRouter = createUploadRouter({
  pool,
  organizationId: ORG_ID,
  uploadDir: path.resolve(import.meta.dirname, "../uploads/cms"),
  publicPrefix: "/uploads/cms",
  // 8 MB cap (was 15 MB default) — covers any reasonable web-sized image and
  // keeps a phone-shot 20 MB JPEG from getting uploaded by accident.
  maxSizeBytes: 8 * 1024 * 1024,
  // Allow only the formats the rest of the site actually renders. SVG
  // intentionally excluded — it can carry script payloads.
  allowedMime: /^image\/(jpe?g|png|webp|avif|gif)$/,
  // Auto-resize anything wider than 1600px to 1600px + generate a 480px
  // thumbnail. Tita can upload a 3000px phone photo and the site still
  // serves a sane-sized image. (Phase 7 follow-up.)
  resize: { maxWidth: 1600, thumbWidth: 480, quality: 82 },
  // Reject obviously-wrong aspects. Product cards expect roughly square →
  // landscape (0.5 = tall portrait, 3.0 = wide banner). Anything outside
  // that is almost certainly the wrong image for the slot.
  aspectRatioRange: [0.5, 3.0],
});

// Second upload mount for technical-library files. No sharp post-processing —
// resize/aspect checks are image concerns. The row still lands in
// cms_media_asset for byte-size auditing; the admin media grid filters
// document extensions out of its thumbnail view.
const docsUploadRouter = createUploadRouter({
  pool,
  organizationId: ORG_ID,
  uploadDir: path.resolve(import.meta.dirname, "../uploads/docs"),
  publicPrefix: "/uploads/docs",
  // 50 MB — a Revit family or zipped CAD block set is heavier than a web image.
  maxSizeBytes: 50 * 1024 * 1024,
  // Extension check, not mime: browsers report DWG/RFA as octet-stream.
  // Matches the doc_type badges the library offers (PDF, DWG, RFA, ZIP, DOC).
  allowedExtension: /\.(pdf|dwg|rfa|zip|doc|docx)$/i,
});

const usersRouter = createUsersRouter({ pool, organizationId: ORG_ID });
const auditMiddleware = createAuditMiddleware({ pool, defaultOrgId: ORG_ID });

export { cmsPublic, cmsAdmin, uploadRouter, docsUploadRouter, usersRouter, auditMiddleware, entities, kb };
