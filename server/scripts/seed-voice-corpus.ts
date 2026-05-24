/**
 * FB voice corpus → structured JSON + RAG knowledge_chunk rows.
 *
 * Reads docs/fb-posts-raw.json (130 FourlinQofficial posts pulled from advo).
 * Writes docs/voice-corpus.json (cleaned, tagged, deduped).
 * Upserts a "Brand Voice — FB Captions" knowledge_base + one chunk per post.
 * Embeddings are left NULL; run seed-embeddings.ts after to backfill.
 *
 * Run: npx tsx server/scripts/seed-voice-corpus.ts
 */
import dotenv from "dotenv";
dotenv.config();

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import pool from "../db.js";

type RawPost = {
  postId: string | null;
  text: string | null;
  date: string | null;
  images: string[] | null;
  videoUrl: string | null;
};

type Cleaned = {
  postId: string;
  text: string;
  hashtags: string[];
  emojis: string[];
  location: string | null;
  postType:
    | "turnover"
    | "installation"
    | "event"
    | "promo"
    | "educational"
    | "showcase"
    | "other";
  imageCount: number;
  hasVideo: boolean;
  ctaPresent: boolean;
};

// --- Unicode bold/italic/sans-bold → ASCII ---
const RANGES: Array<[number, number, string]> = [
  [0x1d400, 0x1d419, "A"], // math bold A-Z
  [0x1d41a, 0x1d433, "a"], // math bold a-z
  [0x1d434, 0x1d44d, "A"], // math italic A-Z
  [0x1d44e, 0x1d467, "a"], // math italic a-z (skip ℎ)
  [0x1d468, 0x1d481, "A"], // bold italic A-Z
  [0x1d482, 0x1d49b, "a"], // bold italic a-z
  [0x1d5d4, 0x1d5ed, "A"], // sans-serif bold A-Z
  [0x1d5ee, 0x1d607, "a"], // sans-serif bold a-z
  [0x1d608, 0x1d621, "A"], // sans-serif italic A-Z
  [0x1d622, 0x1d63b, "a"], // sans-serif italic a-z
  [0x1d63c, 0x1d655, "A"], // sans-serif bold italic A-Z
  [0x1d656, 0x1d66f, "a"], // sans-serif bold italic a-z
  [0x1d7ce, 0x1d7d7, "0"], // math bold 0-9
  [0x1d7e2, 0x1d7eb, "0"], // math sans-serif 0-9
  [0x1d7ec, 0x1d7f5, "0"], // math sans-serif bold 0-9
];

function unbold(s: string): string {
  let out = "";
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    let mapped: string | null = null;
    for (const [lo, hi, base] of RANGES) {
      if (cp >= lo && cp <= hi) {
        mapped = String.fromCodePoint(base.codePointAt(0)! + (cp - lo));
        break;
      }
    }
    out += mapped ?? ch;
  }
  return out;
}

// --- Emoji extraction (broad pictographic range) ---
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;

const PH_LOCATIONS = [
  "Cebu", "Manila", "Quezon City", "Makati", "Taguig", "Pasig", "Mandaluyong",
  "Las Piñas", "Las Pinas", "Parañaque", "Paranaque", "Alabang", "Muntinlupa",
  "Taytay", "Rizal", "Antipolo", "Cainta", "Marikina", "Pasay", "BGC",
  "Bonifacio Global City", "Bulacan", "Cavite", "Laguna", "Batangas",
  "Pampanga", "Tagaytay", "Baguio", "Davao", "Iloilo", "Bacolod",
  "Caloocan", "Valenzuela", "San Juan",
];

function detectLocation(t: string): string | null {
  for (const loc of PH_LOCATIONS) {
    const re = new RegExp(`\\b${loc.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "i");
    if (re.test(t)) return loc;
  }
  return null;
}

function detectType(t: string, tags: string[]): Cleaned["postType"] {
  const low = t.toLowerCase();
  const tagJoin = tags.join(" ").toLowerCase();
  if (/turn[\s-]?over|turnover/.test(low) || /turnover/.test(tagJoin))
    return "turnover";
  if (/worldbex|expo|exposition|booth|event/.test(low + tagJoin))
    return "event";
  if (/installation day|on the ground|installing|installation/.test(low))
    return "installation";
  if (/free quot|inquire now|promo|discount|sale|message us/.test(low))
    return "promo";
  if (/why upvc|did you know|tip|guide|benefit/.test(low))
    return "educational";
  if (/project site|project:|residences/i.test(t)) return "showcase";
  return "other";
}

function clean(post: RawPost): Cleaned | null {
  if (!post.text || post.text.length < 20) return null;
  const id = post.postId ?? "";
  let text = unbold(post.text);

  // Extract hashtags + remove from body
  const hashtags = Array.from(text.matchAll(/#[\w]+/g)).map((m) => m[0]);
  text = text.replace(/#[\w]+/g, "").replace(/[ \t]+/g, " ").trim();

  // Extract emojis (keep dedup list, leave them in body for tone signal)
  const emojis = Array.from(new Set(text.match(EMOJI_RE) ?? []));

  // Tidy: collapse blank lines, trim each line
  text = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i, arr) => l.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join("\n")
    .trim();

  const postType = detectType(text, hashtags);

  return {
    postId: id,
    text,
    hashtags,
    emojis,
    location: detectLocation(text),
    postType,
    imageCount: post.images?.length ?? 0,
    hasVideo: !!post.videoUrl,
    ctaPresent: /inquire|message us|contact|quot|fourlinq\.com|0925/i.test(text),
  };
}

function titleFor(c: Cleaned): string {
  const firstLine = c.text.split("\n")[0].slice(0, 80).trim();
  const loc = c.location ? ` — ${c.location}` : "";
  return `[${c.postType}] ${firstLine}${loc}`.slice(0, 140);
}

async function main() {
  const repoRoot = resolve(import.meta.dirname, "../..");
  const rawPath = resolve(repoRoot, "docs/fb-posts-raw.json");
  const corpusPath = resolve(repoRoot, "docs/voice-corpus.json");

  const raw: RawPost[] = JSON.parse(readFileSync(rawPath, "utf8"));
  console.log(`📥 Loaded ${raw.length} raw posts`);

  // Clean + dedupe by normalized text
  const seen = new Set<string>();
  const cleaned: Cleaned[] = [];
  for (const p of raw) {
    const c = clean(p);
    if (!c) continue;
    const key = c.text.slice(0, 200).toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(c);
  }
  console.log(`🧹 Cleaned ${cleaned.length} unique posts`);

  // Stats
  const byType: Record<string, number> = {};
  for (const c of cleaned) byType[c.postType] = (byType[c.postType] ?? 0) + 1;
  const hashtagFreq: Record<string, number> = {};
  for (const c of cleaned)
    for (const h of c.hashtags) hashtagFreq[h] = (hashtagFreq[h] ?? 0) + 1;
  const topHashtags = Object.entries(hashtagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);

  const corpus = {
    sourceUrl: "https://www.facebook.com/FourlinQofficial",
    scrapedAt: new Date().toISOString(),
    postCount: cleaned.length,
    byType,
    topHashtags,
    posts: cleaned,
  };

  writeFileSync(corpusPath, JSON.stringify(corpus, null, 2));
  console.log(`💾 Wrote ${corpusPath}`);
  console.log(`   types:`, byType);
  console.log(`   top tags:`, topHashtags.slice(0, 8));

  // --- Seed knowledge_base + knowledge_chunk ---
  const kbName = "Brand Voice — FB Captions";
  const existing = await pool.query(
    `SELECT knowledge_base_id FROM knowledge_base WHERE name = $1 LIMIT 1`,
    [kbName]
  );
  let kbId: number;
  if (existing.rowCount && existing.rowCount > 0) {
    kbId = Number(existing.rows[0].knowledge_base_id);
    console.log(`♻️  Reusing knowledge_base #${kbId}`);
  } else {
    const ins = await pool.query(
      `INSERT INTO knowledge_base (organization_id, name, description, kb_type)
       VALUES (1, $1, $2, 'educational') RETURNING knowledge_base_id`,
      [
        kbName,
        "Cleaned FourlinQ FB captions for brand-voice grounding (turnovers, installations, events, promos).",
      ]
    );
    kbId = Number(ins.rows[0].knowledge_base_id);
    console.log(`✨ Created knowledge_base #${kbId}`);
  }

  const { rows: already } = await pool.query(
    `SELECT source_url FROM knowledge_chunk WHERE knowledge_base_id = $1`,
    [kbId]
  );
  const alreadySet = new Set(already.map((r) => r.source_url));

  let inserted = 0;
  for (const c of cleaned) {
    const sourceUrl = `fb://FourlinQofficial/${c.postId}`;
    if (alreadySet.has(sourceUrl)) continue;
    const tags = [
      c.postType,
      ...(c.location ? [c.location.toLowerCase().replace(/\s+/g, "-")] : []),
      ...(c.ctaPresent ? ["cta"] : []),
      ...c.hashtags.slice(0, 5).map((h) => h.replace(/^#/, "").toLowerCase()),
    ];
    await pool.query(
      `INSERT INTO knowledge_chunk
        (knowledge_base_id, title, content, content_type, tags, source_url)
       VALUES ($1, $2, $3, 'voice_sample', $4, $5)`,
      [kbId, titleFor(c), c.text, tags, sourceUrl]
    );
    inserted++;
  }
  console.log(`📚 Inserted ${inserted} new chunks (${alreadySet.size} already present)`);
  console.log(`   Run: npx tsx server/scripts/seed-embeddings.ts  # to embed`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
