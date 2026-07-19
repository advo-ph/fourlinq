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
  PRODUCT_TYPES, FRAME_FINISHES,
  ALUMINUM_FINISHES, PROFILE_SYSTEMS,
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
  content: `${BRAND.name} (${BRAND.tagline}). The verified brochure prints the promise "${BRAND.promise}", the supporting line "${BRAND.promiseSupport}", and "${BRAND.heroQuote}". It also prints a ${BRAND.warranty} label with four scope names: ${BRAND.warrantyScope.join(", ")}. This is a brochure summary, not the complete warranty or a product-specific performance rating; request the current written terms for the proposed system.`,
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

// --- Published locations (individual + aggregate) ---
for (const b of BRANCHES) {
  chunks.push({
    title: `Published location — ${b.label}`,
    content: `${b.label} is listed as a ${b.type}. Published address: ${b.address}, ${b.city}, ${b.region}. Contact ${CONTACT.mobileAssist} to confirm access, appointment requirements, and the relevant sample before visiting.`,
    type: "location",
    tags: ["location", b.region.toLowerCase(), b.city.toLowerCase().replace(/\s+/g, "-")],
    sourceUrl: `site://branch/${b.id}`,
  });
}
chunks.push({
  title: `All ${BRANCHES.length} published FourlinQ locations`,
  content: `The current published location list contains ${BRANCHES.length} entries:\n${BRANCHES.map((b, i) => `${i + 1}. ${b.label} (${b.type}) — ${b.address}, ${b.city}, ${b.region}`).join("\n")}\nConfirm access and current samples before visiting.`,
  type: "location_overview",
  tags: ["location", "overview", "all"],
  sourceUrl: "site://branches",
});

// --- Advantages (7 individual + 1 aggregate) ---
for (const a of ADVANTAGES) {
  chunks.push({
    title: `Brochure-listed advantage — ${a.label}`,
    content: `${a.label} is a label in FourlinQ's verified brochure source. It is a general material statement, not a product-specific test rating, certification, universal guarantee, or complete warranty term. Ask for evidence for the exact proposed assembly.`,
    type: "advantage",
    tags: ["advantage", a.id],
    sourceUrl: `site://advantage/${a.id}`,
  });
}
// Aggregate chunk so "list all advantages" queries retrieve the full set.
chunks.push({
  title: "All 7 brochure-listed FourlinQ advantage labels",
  content: `The verified brochure lists seven general labels:\n${ADVANTAGES.map((a, i) => `${i + 1}. ${a.label}`).join("\n")}\nThese labels do not supply product-specific ratings, test standards, or universal guarantees.`,
  type: "advantage_overview",
  tags: ["advantage", "overview", "all", "seven"],
  sourceUrl: "site://advantages",
});

// --- uPVC profile cut features (7) ---
for (const f of UPVC_PROFILE_FEATURES) {
  chunks.push({
    title: `uPVC Profile Feature #${f.number} — ${f.label}`,
    content: `Brochure wording: "${f.descriptionVerbatim}" This is a general profile note. Confirm the exact profile, glass, reinforcement, gasket, hardware, dimensions, ratings, and compatibility for the proposed opening.`,
    type: "profile_feature",
    tags: ["upvc", "profile", "engineering"],
    sourceUrl: `site://profile-feature/${f.number}`,
  });
}

// --- Product types (5 individual + 1 aggregate) ---
for (const p of PRODUCT_TYPES) {
  chunks.push({
    title: `Product Type — ${p.label}`,
    content: `${p.label} is a FourlinQ catalog name under ${p.category}. The public page is orientation only; confirm the exact operation, material, profile, glass, hardware, finish, dimensions, ratings, availability, and price for the proposed opening.`,
    type: "product_type",
    tags: ["product", p.id, p.category],
    sourceUrl: `site://product-type/${p.id}`,
  });
}
chunks.push({
  title: "FourlinQ brochure product-type names",
  content: `The brochure-derived product-type list contains:\n${PRODUCT_TYPES.map((p, i) => `${i + 1}. ${p.label} (${p.category})`).join("\n")}\nThis list does not prove every material, profile, finish, glass, size, or hardware combination is available.`,
  type: "product_overview",
  tags: ["product", "overview", "all"],
  sourceUrl: "site://products",
});

// --- Catalog products (cards on /products page) ---
for (const p of PRODUCTS) {
  chunks.push({
    title: `Catalog — ${p.name} (${p.category})`,
    content: `${p.name} is listed in the public ${p.category} catalog. The catalog entry is an orientation aid, not a technical submittal. FourlinQ must confirm the exact material, profile, operation, glass, hardware, finish, dimensions, ratings, availability, and price for the proposed opening.`,
    type: "product_card",
    tags: ["product", p.category, p.id],
    sourceUrl: `site://catalog/${p.id}`,
  });
}

// --- Materials (uPVC / aluminium) ---
chunks.push({
  title: "Material — uPVC profile system",
  content: `Client-supplied uPVC profile names: ${PROFILE_SYSTEMS.filter((profile) => profile.material === "upvc").map((profile) => profile.name).join(", ")}. The verified physical sample library contains ${FRAME_FINISHES.length} uPVC finish entries. Confirm exact profile, reinforcement, compatibility, physical sample, availability, and technical evidence for the proposed opening.`,
  type: "material",
  tags: ["material", "upvc", "profile", "finish"],
  sourceUrl: "site://material/upvc",
});
chunks.push({
  title: "Material — aluminium profile system",
  content: `Client-supplied aluminium line names: ${PROFILE_SYSTEMS.filter((profile) => profile.material === "aluminium").map((profile) => profile.name).join(", ")}. Client-supplied powder-coat color names: ${ALUMINUM_FINISHES.map((finish) => finish.name).join(", ")}. Confirm exact extrusion, section, finish sample, compatibility, availability, and technical evidence for the proposed opening.`,
  type: "material",
  tags: ["material", "aluminium", "aluminum", "profile", "finish"],
  sourceUrl: "site://material/aluminium",
});

// --- Finishes (individual + aggregate) ---
for (const f of FRAME_FINISHES) {
  chunks.push({
    title: `Finish — ${f.label}`,
    content: `${f.label} is a ${f.category} entry in the verified uPVC physical-sample library. Screen color is approximate. Confirm a current physical sample, profile compatibility, and availability before selection.`,
    type: "finish",
    tags: ["finish", f.category, f.id],
    sourceUrl: `site://finish/${f.id}`,
  });
}
chunks.push({
  title: `All ${FRAME_FINISHES.length} FourlinQ Frame Finishes (overview)`,
  content: `The verified uPVC physical-sample library contains ${FRAME_FINISHES.length} entries.\nWood-grain entries: ${FRAME_FINISHES.filter(f => f.category === "wood-grain").map(f => f.label).join(", ")}.\nSolid entries: ${FRAME_FINISHES.filter(f => f.category === "solid").map(f => f.label).join(", ")}.\nConfirm a current physical sample, exact profile compatibility, and availability before selection.`,
  type: "finish_overview",
  tags: ["finish", "overview", "all", "twelve", "swatches"],
  sourceUrl: "site://finishes",
});

// --- Aluminium finishes (popular powder-coat colours, distinct from uPVC) ---
chunks.push({
  title: "Aluminium Finishes — popular powder-coat colours",
  content: `Client-supplied aluminium powder-coat color names: ${ALUMINUM_FINISHES.map(f => f.name).join(", ")}. These are distinct from the uPVC sample library. Confirm the exact extrusion, physical sample, compatibility, and current availability.`,
  type: "finish_overview",
  tags: ["finish", "aluminium", "aluminum", "powder-coat", "colours", "gray", "black", "brown", "white"],
  sourceUrl: "site://aluminium-finishes",
});

// --- Profile systems (extrusion brands / lines we fabricate from) ---
chunks.push({
  title: "Profile Systems — uPVC and aluminium extrusion lines",
  content: `Client-supplied uPVC profile names: ${PROFILE_SYSTEMS.filter(p => p.material === "upvc").map(p => `${p.name}${p.origin ? ` (${p.origin})` : ""}`).join(", ")}. Client-supplied aluminium line names: ${PROFILE_SYSTEMS.filter(p => p.material === "aluminium").map(p => `${p.name}${p.note ? ` — ${p.note}` : ""}`).join("; ")}. A name is not a technical submittal; confirm the exact proposed profile and evidence.`,
  type: "material",
  tags: ["profile", "veka", "skyframe", "aluminium", "alu-slim", "systems"],
  sourceUrl: "site://profile-systems",
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
    content: `${w.title}. ${w.dateVerified ? `Verified publication date: ${w.date}.` : `Fallback archive date ${w.date} is unverified.`} ${w.excerpt}${w.link ? ` Link: ${w.link}` : " No destination is attached to this archive note."}`,
    type: "news",
    tags: ["news", w.category],
    sourceUrl: `site://news/${w.id}`,
  });
}

// --- Page map (where to find what on the site) ---
const PAGES: Array<{ path: string; title: string; what: string }> = [
  { path: "/", title: "Home", what: "Brochure-source boundaries, type/material discovery, project archive previews, and contact pathways." },
  { path: "/products", title: "Products", what: "Browse catalog names by opening type and profile material. Every exact assembly and option requires FourlinQ confirmation." },
  { path: "/products?filter=windows", title: "Window Systems", what: "Window catalog names and operation summaries. This is not a technical drawing or performance library." },
  { path: "/products?filter=doors", title: "Door Systems", what: "Door catalog names and operation summaries. This is not a technical drawing or performance library." },
  { path: "/products?filter=specialist", title: "Specialist Systems", what: "Specialist catalog names whose fabrication feasibility and technical evidence require project review." },
  { path: "/why-upvc", title: "Why uPVC", what: "Brochure-listed uPVC labels and profile notes, with explicit limits on unpublished ratings and comparisons." },
  { path: "/finishes", title: "Finishes", what: "The 12-entry uPVC sample library and separate client-supplied aluminium color names, with compatibility and screen-color caveats." },
  { path: "/help-me-choose", title: "Help Me Choose", what: "A non-authoritative preference guide that points to catalog groups; FourlinQ must confirm the proposed system." },
  { path: "/faq", title: "FAQ", what: "Common questions on products, materials, ordering, installation, warranty, and care." },
  { path: "/for-architects", title: "For Architects", what: "A technical-request checklist and two public browsing pages. CAD, BIM, drawings, tests, specifications, and warranty files require confirmation." },
  { path: "/whats-new", title: "What's New", what: "Published and fallback archive notes; unverified fallback dates are labeled as such." },
  { path: "/brand", title: "Brand", what: "Brochure promise, limited-warranty summary, published locations, and consultation pathway. The page does not invent company history." },
  { path: "/inspiration", title: "Inspiration", what: "Project records compiled from FourlinQ's published archive. Metadata is under verification and missing technical detail is not inferred." },
  { path: "/care", title: "Care & Maintenance", what: "A conservative public checklist that defers to finish- and hardware-specific instructions." },
  { path: "/warranty", title: "Warranty", what: "A bounded brochure summary: the 10-year label and four scope names. Request the current written terms." },
  { path: "/design-tool", title: "Design Tool", what: "An illustrative configuration brief. It does not prove compatibility, ratings, price, or approval; only a server reference proves submission." },
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
  const client = await pool.connect();
  try {
    // Deactivate every old source in its own committed statement first. If any
    // later reconciliation step fails, retrieval stays off instead of exposing
    // a mixed old/new corpus.
    await client.query(
      `UPDATE knowledge_base
       SET is_active = false, updated_at = now()
       WHERE name = ANY($1::text[])`,
      [["Product Facts", "Why uPVC", "FAQ", "Objection Handling", "Company Info", kbName]],
    );

    await client.query("BEGIN");
    const existing = await client.query(
      `SELECT knowledge_base_id FROM knowledge_base WHERE name = $1 LIMIT 1`,
      [kbName]
    );
    let kbId: number;
    if (existing.rowCount && existing.rowCount > 0) {
      kbId = Number(existing.rows[0].knowledge_base_id);
      console.log(`♻️  Reusing knowledge_base #${kbId}`);
    } else {
      const created = await client.query(
        `INSERT INTO knowledge_base (organization_id, name, description, kb_type, is_active)
         VALUES (1, $1, $2, 'educational', false) RETURNING knowledge_base_id`,
        [kbName, "Auto-generated source-bounded chunks covering the current public FourlinQ site."]
      );
      kbId = Number(created.rows[0].knowledge_base_id);
      console.log(`✨ Created knowledge_base #${kbId}`);
    }

    const { rows: existingRow } = await client.query(
      `SELECT source_url, knowledge_chunk_id FROM knowledge_chunk WHERE knowledge_base_id = $1`,
      [kbId]
    );
    const chunkIdByUrl = new Map(existingRow.map((row) => [row.source_url, Number(row.knowledge_chunk_id)]));

    let inserted = 0, updated = 0;
    for (const chunk of chunks) {
      const chunkId = chunkIdByUrl.get(chunk.sourceUrl);
      if (chunkId) {
        await client.query(
          `UPDATE knowledge_chunk
           SET title=$1, content=$2, content_type=$3, tags=$4, embedding=NULL, is_active=true, updated_at=now()
           WHERE knowledge_chunk_id=$5`,
          [chunk.title, chunk.content, chunk.type, chunk.tags, chunkId]
        );
        updated++;
      } else {
        await client.query(
          `INSERT INTO knowledge_chunk (knowledge_base_id, title, content, content_type, tags, source_url)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [kbId, chunk.title, chunk.content, chunk.type, chunk.tags, chunk.sourceUrl]
        );
        inserted++;
      }
    }
    const sourceUrl = chunks.map((chunk) => chunk.sourceUrl);
    const stale = await client.query(
      `UPDATE knowledge_chunk
       SET is_active = false, embedding = NULL, updated_at = now()
       WHERE knowledge_base_id = $1
         AND NOT (source_url = ANY($2::text[]))`,
      [kbId, sourceUrl],
    );
    await client.query(
      `UPDATE knowledge_base SET is_active = true, updated_at = now() WHERE knowledge_base_id = $1`,
      [kbId],
    );
    await client.query("COMMIT");

    console.log(`📚 ${inserted} inserted, ${updated} updated (total prepared: ${chunks.length})`);
    console.log(`   ${stale.rowCount ?? 0} stale generated chunks deactivated`);
    console.log(`   Run: npx tsx server/scripts/seed-embeddings.ts`);
  } catch (cause) {
    await client.query("ROLLBACK").catch(() => {});
    throw cause;
  } finally {
    client.release();
  }
}

main()
  .catch((cause) => {
    console.error(cause);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
