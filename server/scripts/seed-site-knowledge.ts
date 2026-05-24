/**
 * Seeds the chatbot KB with everything visible on fourlinq.ph:
 * brand, contact, branches, advantages, products, finishes, FAQ, what's-new, page map.
 *
 * Idempotent: upserts into a "Site Knowledge — Generated" knowledge_base,
 * keyed on source_url. Re-run anytime hardcoded data changes.
 *
 * Run: npx tsx server/scripts/seed-site-knowledge.ts
 */
import dotenv from "dotenv";
dotenv.config();

import pool from "../db.js";
import {
  BRAND, CONTACT, BRANCHES, ADVANTAGES, UPVC_PROFILE_FEATURES,
  PRODUCT_TYPES, MATERIALS, FRAME_FINISHES, DIMENSION_CONSTRAINTS,
} from "../../src/data/fourlinq-data.js";
import { products as PRODUCTS } from "../../src/data/products.js";
import { FAQ, FAQ_CATEGORIES } from "../../src/data/faq.js";
import { whatsNew as WHATS_NEW } from "../../src/data/whats-new.js";

type Chunk = {
  title: string;
  content: string;
  type: string;
  tags: string[];
  sourceUrl: string;
};

const chunks: Chunk[] = [];

// --- Brand ---
chunks.push({
  title: "About FourlinQ — Brand, Promise, Warranty",
  content: `${BRAND.name} (${BRAND.tagline}). Promise: "${BRAND.promise}" — ${BRAND.promiseSupport}\nHero quote: "${BRAND.heroQuote}"\nWarranty: ${BRAND.warranty}, covering: ${BRAND.warrantyScope.join(", ")}.`,
  type: "brand",
  tags: ["brand", "warranty", "promise"],
  sourceUrl: "site://brand",
});

// --- Contact ---
chunks.push({
  title: "FourlinQ Contact Information",
  content: `For assistance: ${CONTACT.mobileAssist}. Sales: ${CONTACT.mobileSales}. Landline: ${CONTACT.landline}. Email: ${CONTACT.email}. Website: https://fourlinq.ph`,
  type: "contact",
  tags: ["contact", "phone", "email"],
  sourceUrl: "site://contact",
});

// --- Branches (individual + aggregate) ---
for (const b of BRANCHES) {
  chunks.push({
    title: `Branch — ${b.label}`,
    content: `${b.label} (${b.type}). Address: ${b.address}, ${b.city}, ${b.region}. For visits, use the assistance line ${CONTACT.mobileAssist}.`,
    type: "branch",
    tags: ["branch", b.region.toLowerCase(), b.city.toLowerCase().replace(/\s+/g, "-")],
    sourceUrl: `site://branch/${b.id}`,
  });
}
chunks.push({
  title: `All ${BRANCHES.length} FourlinQ Branches (overview)`,
  content: `FourlinQ has ${BRANCHES.length} branches in the Philippines:\n${BRANCHES.map((b, i) => `${i + 1}. ${b.label} — ${b.address}, ${b.city}, ${b.region}`).join("\n")}`,
  type: "branch_overview",
  tags: ["branch", "overview", "all", "showroom", "location"],
  sourceUrl: "site://branches",
});

// --- Advantages (7 individual + 1 aggregate) ---
for (const a of ADVANTAGES) {
  chunks.push({
    title: `FourlinQ Advantage — ${a.label}`,
    content: `${a.label}: ${a.description}`,
    type: "advantage",
    tags: ["advantage", a.id],
    sourceUrl: `site://advantage/${a.id}`,
  });
}
// Aggregate chunk so "list all advantages" queries retrieve the full set.
chunks.push({
  title: "All 7 FourlinQ Advantages (overview)",
  content: `The 7 FourlinQ advantages are:\n${ADVANTAGES.map((a, i) => `${i + 1}. ${a.label} — ${a.description}`).join("\n")}`,
  type: "advantage_overview",
  tags: ["advantage", "overview", "all", "seven"],
  sourceUrl: "site://advantages",
});

// --- uPVC profile cut features (7) ---
for (const f of UPVC_PROFILE_FEATURES) {
  chunks.push({
    title: `uPVC Profile Feature #${f.number} — ${f.label}`,
    content: `${f.descriptionVerbatim} Benefit: ${f.benefitPlain}`,
    type: "profile_feature",
    tags: ["upvc", "profile", "engineering"],
    sourceUrl: `site://profile-feature/${f.number}`,
  });
}

// --- Product types (5 individual + 1 aggregate) ---
for (const p of PRODUCT_TYPES) {
  const dim = DIMENSION_CONSTRAINTS[p.id];
  chunks.push({
    title: `Product Type — ${p.label}`,
    content: `${p.label} (${p.category}). Tagline: "${p.tagline}". ${p.description} Primary benefit: ${p.primaryBenefit}. Custom shapes: ${p.supportsCustomShapes ? "yes" : "no"}. Dimension range: ${dim.minW}–${dim.maxW}mm wide × ${dim.minH}–${dim.maxH}mm tall.`,
    type: "product_type",
    tags: ["product", p.id, p.category],
    sourceUrl: `site://product-type/${p.id}`,
  });
}
chunks.push({
  title: "All 5 FourlinQ Product Types (overview)",
  content: `FourlinQ offers 5 product types:\n${PRODUCT_TYPES.map((p, i) => `${i + 1}. ${p.label} (${p.category}) — ${p.tagline} ${p.primaryBenefit}.`).join("\n")}`,
  type: "product_overview",
  tags: ["product", "overview", "all", "five"],
  sourceUrl: "site://products",
});

// --- Catalog products (cards on /products page) ---
for (const p of PRODUCTS) {
  chunks.push({
    title: `Catalog — ${p.name} (${p.category})`,
    content: `${p.name}. ${p.description}\nKey specs: ${p.specs.join("; ")}.\nGlass options: ${p.glassOptions.join(", ")}.\nAvailable in ${p.finishes.length} frame finishes.`,
    type: "product_card",
    tags: ["product", p.category, p.id],
    sourceUrl: `site://catalog/${p.id}`,
  });
}

// --- Materials (uPVC / Aluminum) ---
for (const m of MATERIALS) {
  chunks.push({
    title: `Material — ${m.label}${m.badge ? ` (${m.badge})` : ""}`,
    content: `${m.label} highlights: ${m.highlights.join("; ")}. Compatible finishes: ${m.compatibleFinishIds.length}.`,
    type: "material",
    tags: ["material", m.id],
    sourceUrl: `site://material/${m.id}`,
  });
}

// --- Finishes (individual + aggregate) ---
for (const f of FRAME_FINISHES) {
  chunks.push({
    title: `Finish — ${f.label}`,
    content: `${f.label} (${f.category}). ${f.description}`,
    type: "finish",
    tags: ["finish", f.category, f.id],
    sourceUrl: `site://finish/${f.id}`,
  });
}
chunks.push({
  title: `All ${FRAME_FINISHES.length} FourlinQ Frame Finishes (overview)`,
  content: `FourlinQ offers ${FRAME_FINISHES.length} brochure-verified frame finishes.\nWood-grain finishes: ${FRAME_FINISHES.filter(f => f.category === "wood-grain").map(f => f.label).join(", ")}.\nSolid finishes: ${FRAME_FINISHES.filter(f => f.category === "solid").map(f => f.label).join(", ")}.`,
  type: "finish_overview",
  tags: ["finish", "overview", "all", "twelve", "swatches"],
  sourceUrl: "site://finishes",
});

// --- FAQ ---
const faqCat = Object.fromEntries(FAQ_CATEGORIES.map((c) => [c.id, c.label]));
for (let i = 0; i < FAQ.length; i++) {
  const e = FAQ[i];
  chunks.push({
    title: `FAQ [${faqCat[e.category]}] — ${e.q.slice(0, 80)}`,
    content: `Q: ${e.q}\nA: ${e.a}`,
    type: "faq",
    tags: ["faq", e.category],
    sourceUrl: `site://faq/${i}`,
  });
}

// --- What's New / news ---
for (const w of WHATS_NEW) {
  chunks.push({
    title: `What's New [${w.category}] — ${w.title}`,
    content: `${w.title} (${w.date}). ${w.excerpt}${w.link ? ` Link: ${w.link}` : ""}`,
    type: "news",
    tags: ["news", w.category],
    sourceUrl: `site://news/${w.id}`,
  });
}

// --- Page map (where to find what on the site) ---
const PAGES: Array<{ path: string; title: string; what: string }> = [
  { path: "/", title: "Home", what: "Hero, brand promise, advantages summary, featured projects, contact form entry." },
  { path: "/products", title: "Products", what: "Browse all 5 product types (Casement, Sliding, Awning, Special Shapes, Slide & Fold) with images, specs, glass options, finish options." },
  { path: "/window-systems", title: "Window Systems", what: "Detailed window system specs, profile diagrams, technical drawings." },
  { path: "/door-systems", title: "Door Systems", what: "Detailed door system specs including swing, sliding, and slide & fold doors." },
  { path: "/specialist-systems", title: "Specialist Systems", what: "Curtain walls, large-span installations, custom commercial systems." },
  { path: "/why-upvc", title: "Why uPVC", what: "Comparison of uPVC vs aluminum vs timber: thermal, maintenance, security, cost." },
  { path: "/finishes", title: "Finishes", what: "All 12 frame finishes with swatches, descriptions, and real profile photos." },
  { path: "/how-to-choose", title: "How To Choose", what: "Decision guide: which window/door type fits your project, room, and budget." },
  { path: "/faq", title: "FAQ", what: "Common questions on products, materials, ordering, installation, warranty, and care." },
  { path: "/for-architects", title: "For Architects", what: "Technical resources, CAD-ready specs, and project consultation pathway for architects and designers." },
  { path: "/whats-new", title: "What's New", what: "News feed: project turnovers, product launches, events (WORLDBEX), press coverage." },
  { path: "/brand", title: "Brand", what: "Brand story, design philosophy, brand identity, company background." },
  { path: "/inspiration", title: "Inspiration", what: "Project gallery — completed FourlinQ installations across the Philippines (Cebu, Las Piñas, Taytay, Alabang, more)." },
  { path: "/care", title: "Care & Maintenance", what: "How to clean and maintain uPVC windows and doors for lifetime performance." },
  { path: "/warranty", title: "Warranty", what: "Full 10-year warranty terms, coverage scope, and claim process." },
  { path: "/design-tool", title: "Design Tool", what: "Interactive configurator: pick product type, material, finish, dimensions; generate a custom request." },
];
for (const p of PAGES) {
  chunks.push({
    title: `Page Map — ${p.title} (${p.path})`,
    content: `Visit ${p.path} for: ${p.what}`,
    type: "page_map",
    tags: ["page", p.path.replace(/^\//, "") || "home"],
    sourceUrl: `site://page${p.path}`,
  });
}

async function main() {
  const kbName = "Site Knowledge — Generated";
  const existing = await pool.query(
    `SELECT knowledge_base_id FROM knowledge_base WHERE name = $1 LIMIT 1`,
    [kbName]
  );
  let kbId: number;
  if (existing.rowCount && existing.rowCount > 0) {
    kbId = Number(existing.rows[0].knowledge_base_id);
    console.log(`♻️  Reusing knowledge_base #${kbId}`);
  } else {
    const r = await pool.query(
      `INSERT INTO knowledge_base (organization_id, name, description, kb_type)
       VALUES (1, $1, $2, 'educational') RETURNING knowledge_base_id`,
      [kbName, "Auto-generated chunks covering every page, product, finish, FAQ, news item, and contact detail on fourlinq.ph."]
    );
    kbId = Number(r.rows[0].knowledge_base_id);
    console.log(`✨ Created knowledge_base #${kbId}`);
  }

  const { rows: existingRows } = await pool.query(
    `SELECT source_url, knowledge_chunk_id FROM knowledge_chunk WHERE knowledge_base_id = $1`,
    [kbId]
  );
  const byUrl = new Map(existingRows.map((r) => [r.source_url, Number(r.knowledge_chunk_id)]));

  let inserted = 0, updated = 0;
  for (const c of chunks) {
    const id = byUrl.get(c.sourceUrl);
    if (id) {
      // Update + clear embedding so re-embed picks it up
      await pool.query(
        `UPDATE knowledge_chunk
         SET title=$1, content=$2, content_type=$3, tags=$4, embedding=NULL, updated_at=now()
         WHERE knowledge_chunk_id=$5`,
        [c.title, c.content, c.type, c.tags, id]
      );
      updated++;
    } else {
      await pool.query(
        `INSERT INTO knowledge_chunk (knowledge_base_id, title, content, content_type, tags, source_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [kbId, c.title, c.content, c.type, c.tags, c.sourceUrl]
      );
      inserted++;
    }
  }
  console.log(`📚 ${inserted} inserted, ${updated} updated (total prepared: ${chunks.length})`);
  console.log(`   Run: npx tsx server/scripts/seed-embeddings.ts`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
