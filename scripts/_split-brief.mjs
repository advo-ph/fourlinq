/**
 * Split docs/3D_ASSET_BRIEF.md into one self-contained prompt file per asset.
 *
 * The brief is correct but not usable one-asset-at-a-time: the four sections
 * every sheet depends on (the contract, the palette, the acceptance test, the
 * shared image constraints) sit once at the top, so handing someone "the glass
 * railing prompt" means handing them four scattered fragments and hoping they
 * stitch them in the right order.
 *
 * This copies the shared preamble verbatim into each file, so each is a single
 * paste. Mechanical on purpose — retyping the sheets by hand would let wording
 * drift away from the brief, and the brief is the reviewed version.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "..", "docs", "3D_ASSET_BRIEF.md");
const OUT_DIR = resolve(here, "..", "docs", "prompt");

const line = (await readFile(SRC, "utf8")).split(/\r?\n/);

/** Grab a section by its exact heading, up to the next heading of the same level. */
const section = (heading) => {
  const start = line.findIndex((l) => l.trim() === heading);
  if (start < 0) throw new Error(`missing section: ${heading}`);
  const level = heading.match(/^#+/)[0].length;
  let end = line.length;
  for (let i = start + 1; i < line.length; i++) {
    const m = line[i].match(/^(#+)\s/);
    if (m && m[1].length <= level) {
      end = i;
      break;
    }
  }
  /* Drop a trailing horizontal rule. The brief separates its own sections with
     `---`, and this script adds one between every block it assembles, so without
     this the output shows two rules with a blank line stranded between them. */
  return line
    .slice(start, end)
    .join("\n")
    .trimEnd()
    .replace(/\n-{3,}\s*$/, "")
    .trimEnd();
};

const CONTRACT = section("## The contract");
const PALETTE = section("### The palette to draw from");
const ACCEPTANCE = section("### The acceptance test, stated once");
const IMAGE_RULE = section("### Shared image-prompt constraints");

/* Every "### N. Title — `id`" block under Per-system briefs. */
const sheet = [];
for (let i = 0; i < line.length; i++) {
  const m = line[i].match(/^###\s+(\d+)\.\s+(.+)$/);
  if (!m) continue;
  let end = line.length;
  for (let j = i + 1; j < line.length; j++) {
    const n = line[j].match(/^(#{1,3})\s/);
    if (n) {
      end = j;
      break;
    }
  }
  sheet.push({ num: m[1], title: m[2], body: line.slice(i, end).join("\n").trimEnd() });
}

const slugOf = (title) => {
  const tick = title.match(/`([^`]+)`/);
  if (tick) return tick[1].split(",")[0].trim();
  return title
    .toLowerCase()
    .replace(/—.*$/, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

await mkdir(OUT_DIR, { recursive: true });
const written = [];

for (const s of sheet) {
  /* §5 is a retirement note, not a commission — it has no asset to build. */
  if (/retired/i.test(s.title)) continue;
  const slug = slugOf(s.title);
  /* Strip the trailing id list: "Louvre / jalousie — `louvre`, `louvre-wide`". */
  const clean = s.title.replace(/\s*—\s*(`[^`]*`)(\s*,\s*`[^`]*`)*\s*$/, "").trim();

  const doc = `# ${clean} — asset prompt

> **Self-contained.** Everything needed to build this one asset is in this file:
> the brief, the contract it must satisfy, the material palette, and the test it
> is accepted on. Nothing to cross-reference. Hand this file to Claude Design, to
> a 3D contractor, or to whoever writes the builder.
>
> Generated from [3D_ASSET_BRIEF.md](../3D_ASSET_BRIEF.md) by
> \`node scripts/_split-brief.mjs\` — edit the brief, not this file, and re-run.

---

${s.body}

---

${CONTRACT}

---

${PALETTE}

---

${ACCEPTANCE}

---

${IMAGE_RULE}
`;

  await writeFile(resolve(OUT_DIR, `${slug}.md`), doc, "utf8");
  written.push({ slug, title: clean, bytes: doc.length });
}

/* An index so the folder explains itself. */
const index = `# Asset prompts, one file per asset

Each file below is **self-contained** — the shared contract, palette, acceptance
test and image constraints are copied into every one, so you can hand over a
single file without stitching sections together.

Regenerate with \`node scripts/_split-brief.mjs\` after editing
[3D_ASSET_BRIEF.md](../3D_ASSET_BRIEF.md), which stays the source of truth.

| Asset | File | Built? |
|---|---|---|
${written
  .map(
    (w) =>
      `| ${w.title} | [${w.slug}.md](./${w.slug}.md) | ${
        w.slug.startsWith("louvre") ? "**Yes** — `louvre-model.js`, live in the viewer" : "No"
      } |`,
  )
  .join("\n")}

**Tilt & turn is deliberately absent.** It is the last configurator type with no
3D, and it stays that way while it is an unconfirmed product: the glossary
describes it opening inward, which contradicts the client's "everything opens
out, never inward". Nothing should be commissioned for it until that is settled.
`;

await writeFile(resolve(OUT_DIR, "README.md"), index, "utf8");

console.log(`wrote ${written.length} asset files + README to docs/prompt/`);
for (const w of written) console.log(`  ${w.slug.padEnd(18)} ${(w.bytes / 1024).toFixed(1)} kB  ${w.title}`);
