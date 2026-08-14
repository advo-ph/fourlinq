/**
 * Builds the copy-paste prompt page from docs/prompt/video/*.md.
 *
 * The markdown files stay the source of truth; this only reformats them. The
 * prompt payload is unwrapped from markdown to plain text because that is what
 * gets pasted into a video model — bold markers and hard wraps are noise there.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "docs/prompt/video");
const OUT = path.join(SRC, "prompts.html");
const TEMPLATE = path.join(ROOT, "scripts/video-prompt-page.template.html");

/* Route + one-line mechanism, in menu order. `flag` marks a product question the
   bake had to guess at; `gen` marks the four with no mechanism to render. */
/**
 * Blocks appended to every prompt, in this order, after the per-asset body.
 *
 * These exist because of what actually came back from testing: three-quarter
 * and slanted views instead of a flat elevation, panels duplicating or opening
 * both ways, a second panel sliding when only one should, and a sparkle/ripple
 * shimmer crawling over the glass. A model that ignores "locked-off static
 * camera" in a style sentence will often still obey an explicit geometric
 * statement about frame edges staying parallel, so these are phrased as
 * positive assertions first and prohibitions second.
 */
const CAMERA_BLOCK = `CAMERA — THIS IS CRITICAL. The camera is locked off and completely motionless for the entire clip. It never pans, tilts, zooms, dollies, tracks, orbits, rolls or drifts, not even slightly. The lens sits exactly perpendicular to the face of the product: a dead-on, straight-on front elevation, like an architectural drawing. The product's head, sill and both jambs stay parallel to the edges of the video frame in every single frame. This is never a three-quarter view, never an angled or slanted or skewed view, never a corner or perspective view, never a tilted horizon, never a hero or dramatic angle. If the product looks rotated away from the camera at any point, the shot is wrong.

FRAMING IS LOCKED — THIS IS CRITICAL. The framing in the last frame is identical to the framing in the first frame. The product sits at exactly the same position and exactly the same size throughout, and the empty white margin between the product and each of the four edges of the video frame is the same in every frame. Absolutely no Ken Burns effect, no slow push-in or pull-out, no punch-in, no creeping or breathing zoom, no scale animation, no reframing, no recentring, no parallax. Imagine the camera bolted to a tripod that nobody touches: only the product's own moving part changes between frames, and everything else in the picture is pinned.`;

const CONTINUITY_BLOCK = `MOTION IS ONE CONTINUOUS GLIDE — THIS IS CRITICAL. The movement is a single smooth unbroken glide from the closed position to the open position, at one even, steady, gentle speed.

Here is the test it must pass: the moving part is travelling in EVERY frame of the clip. Apart from the very first frame and the very last frame, there is no frame in which it is stationary. Between any two consecutive frames it advances by the same small amount as between any other two — a constant, gliding rate, like a real panel pushed by a hand at walking pace.

It must NOT advance in steps, increments, stages, chunks, hops or jumps. No stop-motion, no stuttering, no juddering, no strobing, no ratcheting, no frame-holding, no freezing partway, no pausing between moves, no snapping from one position to the next, no repeated or looping segments, no rewinding or backtracking, and no sudden bursts of speed. The motion starts once, runs once, and ends once — it is not a series of separate little slides.`;

/**
 * The product is a standalone object, not an installed one.
 *
 * "White background" plus "window" reads to a video model as "window in a white
 * wall", and it obliges: a plaster reveal, a recessed opening, screw heads at
 * the corners, and a floor visible through the glass. Saying "pure white
 * seamless background" does not prevent this, because the model considers a
 * white wall to satisfy it. So the surround has to be refused by name, and the
 * glazing has to be told what colour it is rather than only what it is not.
 */
const ISOLATION_BLOCK = `THE PRODUCT IS ALONE IN EMPTY SPACE — THIS IS CRITICAL. This is a single standalone product photographed on its own against an empty white studio background. It is NOT installed in anything and NOT fitted into anything. There is no wall, no wall opening, no rough opening, no window buck, no reveal, no returns, no plaster, no plasterboard, no drywall, no render, no brickwork, no architrave, no casing, no trim, no moulding, no beading, no skirting, no sill board, no lintel, no head board, no cove, no recess, no niche, no alcove, no box, no secondary outer frame, no border, no panel or backing board behind it, no mounting plate, and no screws, screw heads, fixings, plugs, brackets or fasteners of any kind anywhere in shot.

Nothing surrounds the product and nothing sits behind it. The background is ONE flat, even, continuous pure white field filling the whole video frame, corner to corner — exactly the same white in the corners as in the centre. There is no second rectangle, no inner rectangle, no grey or off-white band, no darker or lighter edge, no framing box, no drop shadow box, no vignette, and no visible join, seam or horizon anywhere in the background.

THE GLASS IS THE SAME WHITE AS THE BACKGROUND. Looking through the glazing you see nothing at all — no room, no interior, no floor, no ground line, no ceiling, no horizon, no furniture, no sky, no outdoor scene, no landscape, no shadow cast on a surface behind, and no reflection of anything. Each pane reads as a plain, bright, very slightly cool white panel, indistinguishable in colour from the background around the product.`;

const COMPLETION_BLOCK = `THE MOVEMENT MUST FINISH — THIS IS CRITICAL. The very first frame is the fully closed position. The very last frame is the FULLY open position exactly as described above — the mechanism travels its complete range and arrives at the end of its travel. It must not stop short, stall partway, slow to a halt before the end, ease out early, or leave the product half-open in the final frame. The clip must not fade, cut or end before the movement is finished.

Budget the whole duration for this one movement so it has room to complete. Do not spend the opening of the clip holding still on the closed position, and do not spend the end holding still on a partly-open one: the movement begins almost immediately, is still visibly travelling at around ninety percent of the way through the clip, and settles into the fully open position right at the final frame.`;

const COMPLETION_BLOCK_MOVING = `THE MOVEMENT MUST FINISH — THIS IS CRITICAL. The camera travels the full length of the balustrade run within the clip and is still moving at around ninety percent of the way through. It must not stall partway, slow to a halt early, or hold still at either end. Do not spend the opening of the clip on a static shot before the move begins.`;

const REALISM_BLOCK = `REALISM — THIS IS CRITICAL. This is a factual product demonstration for a window manufacturer's catalogue, shot like real studio product photography on a plain white cyclorama. Everything is sharp, in focus, neutral, literal and unembellished. It is NOT cinematic, NOT dreamy, NOT ethereal, NOT atmospheric, NOT moody, NOT artistic, NOT stylised, NOT a mood film or a commercial. No soft focus, no diffusion, no glow, no haze, no mist, no fog, no smoke, no dust motes, no floating particles, no volumetric light, no god rays, no colour grading, no teal-and-orange, no film emulation, no grain, no bloom, no slow-motion feel, no time-lapse feel, no dramatic reveal. The uPVC reads as solid matte plastic, the glass as ordinary flat glazing, and the metal furniture as plain brushed steel. A technician should be able to look at this clip and see exactly how the mechanism works.`;

/* The railing clip lives in a real building, so the studio-cyclorama sentence
   would fight its own brief. Same anti-dreamy stance, different setting. */
const REALISM_BLOCK_LOCATION = `REALISM — THIS IS CRITICAL. This is factual architectural photography for a manufacturer's catalogue. Everything is sharp, in focus, neutral and literal. It is NOT cinematic, NOT dreamy, NOT ethereal, NOT moody, NOT artistic, NOT stylised, NOT a mood film or a commercial. No soft focus, no diffusion, no glow, no haze, no mist, no fog, no dust motes, no floating particles, no volumetric light, no god rays, no heavy colour grading, no teal-and-orange, no film emulation, no grain, no bloom, no slow-motion feel, no dramatic reveal. The glass reads as ordinary clear tempered glazing and the fixings as plain brushed stainless steel.`;

/* Glass railing is the one clip whose camera is supposed to move — its whole
   argument is about sightlines, which a locked-off shot cannot make. It still
   gets the anti-slant and anti-shake language, just not the anti-motion. */
const CAMERA_BLOCK_MOVING = `CAMERA — THIS IS CRITICAL. One single smooth lateral dolly, travelling left to right at a slow steady walking pace, parallel to the balustrade run. The camera stays perfectly level throughout: no tilt, no roll, no tilted or slanted horizon, no canted angle, no shake, no handheld wobble, no zoom, no orbit, no crane, no drone move, no speed ramp. The move starts smoothly, holds one constant speed, and ends smoothly.`;

const SURFACE_BLOCK = `SURFACE AND BACKGROUND — THIS IS CRITICAL. Every surface is matte, clean and completely stable. There is no sparkle, glitter, shimmer, twinkle, starburst, lens flare, caustics, ripple, water or liquid effect, heat haze, morphing or crawling texture, pulsing, breathing, flickering, or any generative shimmer anywhere in the clip. Nothing glows or emits light. The frame does not change colour, tone or finish as it moves. The background is flat pure white for the whole clip and never gains texture, gradient, vignette, shadow detail, reflection or movement of its own.`;

/* The failure modes seen in testing, phrased for a negative field. Prepended to
   every per-asset negative so the split version carries them too. */
const UNIVERSAL_NEG =
  "three-quarter view, angled view, slanted view, skewed view, corner perspective, tilted horizon, canted angle, rotated product, camera pan, tilt, zoom, dolly, orbit, roll, drift, shake; " +
  "Ken Burns effect, push-in, pull-out, punch-in, creeping zoom, breathing zoom, scale animation, reframing, recentring, parallax, the product changing size in frame, the white margin changing; " +
  "stepped motion, incremental motion, stop-motion, stuttering, juddering, strobing, frame-holding, pausing partway, snapping between positions, looping or repeated segments, rewinding, sudden acceleration; " +
  "stopping short, stalling partway, unfinished motion, half-open final frame, the mechanism not completing its travel, holding still on the closed position at the start, holding still on a partly-open position at the end, fading or cutting before the movement finishes; " +
  "dreamy, ethereal, cinematic, atmospheric, moody, artistic, stylised, mood film, commercial; soft focus, diffusion, glow, haze, mist, fog, smoke, dust motes, floating particles, volumetric light, god rays, colour grading, teal and orange, film emulation, grain, bloom, slow motion, time lapse, dramatic reveal; " +
  "duplicated panels, mirrored copies, a second window or door appearing, extra leaves, panels splitting in two, panel count changing mid-clip; " +
  "opening from both sides at once, a fixed panel moving, two panels sliding when only one should, leaves opening the wrong way; " +
  "sparkle, glitter, shimmer, twinkle, starburst, lens flare, caustics, ripple, water effect, liquid effect, heat haze, morphing texture, crawling edges, pulsing, breathing, flicker, glow, bloom; " +
  "walls, wall openings, rough openings, window bucks, reveals, returns, plaster, plasterboard, drywall, render, brickwork, architrave, casing, trim, moulding, skirting, sill boards, lintels, coves, recesses, niches, alcoves; " +
  "a second or outer frame around the product, an inner rectangle, a grey or off-white band, a border, a framing box, a drop shadow box, a backing panel, a mounting plate, screws, screw heads, fixings, brackets, fasteners; " +
  "rooms, floors, ground lines, ceilings, horizons, furniture, sky or outdoor scenery visible through the glass; glass that is a different colour or tone from the background; " +
  "background texture, gradient, vignette, reflections, moving background, visible seams or joins in the background; ";

const META = [
  { id: "casement", mech: "hinge outswing 70°, handles throw first",
    counts: "Exactly TWO leaves, in every single frame. Both are hinged and both swing outward. Nothing slides horizontally at any point. There is no third leaf, no extra sash, no duplicated or mirrored copy of the window, and no second window anywhere in shot. One window unit only." },
  { id: "sliding", mech: "translate X, cam lock quarter turn",
    counts: "Exactly TWO panels, in every single frame — the left one FIXED, the right one operable. ONLY the right-hand operable panel moves, and it moves horizontally only. The left panel is completely motionless for the whole clip. Nothing hinges, nothing swings open, and no second panel starts sliding." },
  { id: "awning", mech: "top-hung 32°, scissor stays extend",
    counts: "Exactly ONE sash. Only the sash, its handle and its two stay arms move. Nothing slides horizontally. There is no second sash and the window is not divided into two openings." },
  { id: "louvre", mech: "blades pivot in unison to 75°",
    counts: "Exactly EIGHT blades, and the count is identical in every single frame — none is added, removed, merged or duplicated at any point. All eight rotate together at the same angle at the same time. Nothing slides, nothing hinges, no blade moves independently or out of sequence." },
  { id: "automated-window", mech: "top-hung 30°, chain extends link by link",
    counts: "Exactly ONE sash and ONE chain actuator. Only the sash and the chain move. Nothing slides horizontally, and there is no second sash or second actuator." },
  { id: "special-shapes", mech: "no mechanism — shape morph", gen: true,
    counts: "Exactly ONE window unit, alone in shot. Nothing opens, nothing hinges, nothing slides. The only thing that changes is the outline of that single unit." },
  { id: "sliding-door", mech: "translate X, hook-bolt lever",
    counts: "Exactly TWO panels, in every single frame — the right one FIXED, the left one operable. ONLY the left operable panel moves, horizontally. The right panel is completely motionless. Nothing hinges, nothing swings, and no second panel starts sliding." },
  { id: "slide-and-fold", mech: "4-leaf accordion to 87°",
    counts: "Exactly FOUR leaves, and the count is identical in every single frame — none appears, disappears, splits or duplicates mid-fold. All four fold to the same side, to the LEFT only. Nothing folds to the right, and no leaf opens on its own hinge away from the stack." },
  { id: "casement-door", mech: "single leaf 90°, lever throws first",
    counts: "Exactly ONE door leaf. It hinges on the LEFT jamb only, and swings one way only. There is no second leaf, no double door, no pair opening from the centre, and no duplicated or mirrored copy of the door. Nothing slides." },
  { id: "french-door", mech: "hinged pair 90°/70°", flag: "nav says SLIDING; the GLB swings",
    counts: "Exactly FOUR panels, in every single frame — TWO fixed outer panels and TWO operable centre panels. ONLY the two centre panels move, sliding apart horizontally. The two outer panels are completely motionless. Nothing hinges and nothing swings open." },
  { id: "large-panel-doors", mech: "4-panel sliding stack", flag: "old tile was a swinging pair",
    counts: "Exactly TWO leaves. Both are hinged and both swing. Nothing slides horizontally at any point, and no extra leaf or duplicated copy appears." },
  { id: "lift-and-slide", mech: "10 mm lift, then translate X",
    counts: "Exactly TWO panels, in every single frame — the right one FIXED, the left one operable. ONLY the left operable panel moves. It lifts vertically first, then slides horizontally. The right panel is completely motionless. Nothing hinges and no second panel slides." },
  { id: "90-series", mech: "single hinged door, half lite", flag: "old tile was a 3-panel bifold",
    counts: "Exactly THREE leaves, and the count is identical in every single frame. All three fold to the LEFT. Nothing folds to the right and no leaf is added or lost mid-motion." },
  { id: "sc-door", mech: "translate X 805 mm, thumbturn",
    counts: "Exactly TWO panels, in every single frame — the left one a FIXED lite, the right one the operable leaf. ONLY the operable leaf moves, horizontally. The fixed lite is completely motionless. Nothing hinges, nothing swings, nothing lifts, and no second panel slides." },
  { id: "automated-door", mech: "bi-part, trapezoidal motor ramp",
    counts: "Exactly FOUR panels, in every single frame — TWO fixed outer side screens and TWO operable centre leaves. ONLY the two centre leaves move, sliding apart from the centre at exactly the same moment and the same speed. The side screens are completely motionless. Nothing hinges, swings or revolves." },
  { id: "arch-shapes", mech: "no mechanism — head rises to an arch", gen: true,
    counts: "Exactly ONE window unit, alone in shot. Nothing opens, nothing hinges, nothing slides. Only the curve of the head changes; the sill and both jambs are locked in place for the whole clip." },
  { id: "custom-shapes", mech: "no mechanism — drawing resolves", gen: true,
    counts: "Exactly ONE window unit, alone in shot. Nothing opens, hinges or slides. The outline is the same five-sided shape from the first frame to the last." },
  { id: "glass-railing", mech: "no mechanism — lateral dolly", gen: true, page: true,
    counts: "Nothing in the scene moves at all — no gate, no panel, no person. The camera is the only thing that moves." },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Inline a reference as a data URI so the page can put the actual bytes on the
 * clipboard.
 *
 * A path cannot be pasted into a video model, and a page opened over file://
 * cannot fetch its own siblings — so the image has to live in the document.
 * Capped at 900 px and JPEG q78 because these are attached as references, not
 * shipped as assets; the full-resolution original stays on disk and its
 * absolute path is printed beside every thumbnail.
 *
 * Video is deliberately not embedded: no browser supports putting a video on
 * the clipboard, and hero-loop.mp4 alone is 12 MB.
 */
const MAX_PX = 900;
async function embed(rel) {
  const abs = path.join(ROOT, rel);
  const ext = path.extname(rel).toLowerCase();
  if (ext === ".mp4" || ext === ".webm" || ext === ".mov") {
    return { kind: "video", abs, uri: null };
  }
  const meta = await sharp(abs).metadata();
  const wide = Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_PX;
  const buf = await sharp(abs, { density: 200 })
    .resize(wide ? { width: MAX_PX, height: MAX_PX, fit: "inside" } : undefined)
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  return { kind: "image", abs, uri: `data:image/jpeg;base64,${buf.toString("base64")}` };
}

/** markdown → the plain text a video model should actually receive */
function toPlain(md) {
  const block = md.trim().split(/\n\s*\n/);
  return block
    .map((b) => {
      const line = b.split("\n");
      const isList = line.every((l) => /^\s*(\d+\.|-|\*)\s/.test(l) || /^\s{2,}\S/.test(l));
      let text;
      if (isList) {
        // Fold each item's wrapped continuation lines back onto the item, so a
        // pasted list is one line per step rather than one per source column.
        const item = [];
        for (const l of line) {
          if (/^\s*(\d+\.|-|\*)\s/.test(l)) item.push(l.trim());
          else if (item.length) item[item.length - 1] += " " + l.trim();
        }
        text = item.join("\n");
      } else {
        text = line.join(" ");
      }
      // a leading bold label becomes an uppercase section marker
      text = text.replace(/^\*\*([^*]+?)\*\*/, (_, w) => w.toUpperCase());
      text = text.replace(/^(\d+\.\s)\*\*([^*]+?)\*\*/gm, (_, n, w) => n + w.toUpperCase());
      return text.replace(/\*\*/g, "").replace(/`/g, "");
    })
    .join("\n\n");
}

function parse(id) {
  const raw = readFileSync(path.join(SRC, id + ".md"), "utf8");
  const line = raw.split("\n");

  const title = line[0].replace(/^#\s*Video prompt\s*—\s*/, "").trim();

  // references: rows of the "References to attach" table
  const refs = [];
  let inRefs = false;
  for (const l of line) {
    if (/^##\s+References to attach/.test(l)) { inRefs = true; continue; }
    if (inRefs && /^##\s/.test(l)) break;
    if (inRefs && /^\|/.test(l) && !/^\|\s*-+/.test(l) && !/^\|\s*File\s*\|/.test(l)) {
      const cell = l.split("|").slice(1, -1).map((c) => c.trim());
      if (cell.length >= 2) refs.push({ file: cell[0].replace(/`/g, ""), use: cell[1] });
    }
    if (inRefs && /^---\s*$/.test(l)) break;
  }

  // prompt: from the standalone --- separator to the negative-prompt marker
  const start = line.findIndex((l, i) => /^---\s*$/.test(l) && i > 4);
  const negIdx = line.findIndex((l) => /^\*\*Negative prompt\.\*\*/.test(l));
  const prompt = toPlain(line.slice(start + 1, negIdx).join("\n"));

  // negative: the fenced block after that marker
  const fenceStart = line.indexOf("```", negIdx);
  const fenceEnd = line.indexOf("```", fenceStart + 1);
  const negative = line.slice(fenceStart + 1, fenceEnd).join(" ").replace(/\s+/g, " ").trim();

  // acceptance bullets
  const accIdx = line.findIndex((l) => /^##\s+Acceptance/.test(l));
  const acc = [];
  if (accIdx >= 0) {
    let buf = null;
    for (let i = accIdx + 1; i < line.length; i++) {
      const l = line[i];
      if (/^##\s/.test(l)) break;
      if (/^-\s/.test(l)) { if (buf) acc.push(buf); buf = l.replace(/^-\s/, ""); }
      else if (buf && l.trim()) buf += " " + l.trim();
    }
    if (buf) acc.push(buf);
  }
  const accHtml = acc.map((a) =>
    esc(a).replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+?)`/g, "<code>$1</code>"),
  );

  return { title, refs, prompt, negative, acc: accHtml };
}

const card = async (m, i) => {
  const p = parse(m.id);
  const route = m.gen ? "GENERATE" : "BAKED";
  const asset = await Promise.all(p.refs.map((r) => embed(r.file)));

  /* One mega prompt. Grok Imagine has no separate negative field, so the
     negatives are folded in as a closing prohibition rather than left in a box
     the tool will never read. Order matters: the model sees what to build, then
     how to shoot it, then what must not drift, then the counts that stop
     duplicate leaves, and only then the list of things to avoid. */
  /* Glass railing is the one clip that IS installed in a building, so the
     isolation block would contradict its own brief. Everything else gets it. */
  const railing = m.id === "glass-railing";
  const mega = [
    p.prompt,
    railing ? null : ISOLATION_BLOCK,
    railing ? CAMERA_BLOCK_MOVING : CAMERA_BLOCK,
    CONTINUITY_BLOCK,
    railing ? COMPLETION_BLOCK_MOVING : COMPLETION_BLOCK,
    railing ? REALISM_BLOCK_LOCATION : REALISM_BLOCK,
    SURFACE_BLOCK,
    `STRICT COUNTS — THIS IS CRITICAL. ${m.counts}`,
    `DO NOT SHOW, at any point in the clip: ${p.negative}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  /* Compact fallback. The full prompt runs ~9k characters and some tools cap
     well below that — and a silently truncated prompt loses its tail, which is
     where the prohibitions live. This keeps the subject, the motion and one
     condensed line per constraint. */
  const compact = [
    p.prompt.split(/\n\n(?:STYLE\.|CAMERA AND)/)[0],
    railing
      ? `One smooth continuous lateral dolly left to right at walking pace, level throughout — no tilt, roll, shake, zoom or slant. Moving in every frame, completing the full run. Realistic architectural photography: sharp, neutral, literal, NOT cinematic or dreamy. No soft focus, glow, haze, particles, god rays, colour grading, grain or bloom. ${m.counts}`
      : `Locked-off static camera, dead-on straight-on front elevation. The framing is identical in every frame and the white margin around the product never changes — no zoom, no Ken Burns, no push-in, no pan, no tilt, no drift, no slanted or three-quarter or angled view.

The product is a single standalone object on a flat pure white background. It is NOT installed in anything: no wall, no wall opening, no reveal, no plaster, no architrave, no trim, no sill board, no cove, no recess, no surround, no second or outer frame, no border, no grey band, no backing panel, no screws or fixings. The glass is the SAME flat white as the background — no room, floor, ground line, horizon or reflection visible through it.

One single smooth continuous glide from closed to fully open. The moving part is travelling in every frame at a constant rate — no steps, increments, stutter, judder, stop-motion, freezing or snapping. It completes the FULL travel and the last frame is the fully open position; do not hold still on the closed pose at the start.

Realistic studio product photography on a white cyclorama: sharp, in focus, neutral, literal. NOT cinematic, dreamy, ethereal, moody or stylised. No soft focus, glow, haze, mist, dust motes, god rays, colour grading, film grain, bloom or slow-motion feel. No sparkle, glitter, shimmer, ripple or crawling texture. Matte black uPVC frame, brushed steel furniture.

${m.counts}`,
  ].join("\n\n");
  return `
  <article class="card${m.gen ? " is-gen" : ""}" id="${m.id}">
    <div class="card-head">
      <div class="meta">
        <span class="chip route ${m.gen ? "gen" : "baked"}">${route}</span>
        <span class="chip">${esc(m.id)}</span>
        <span class="chip dim">${esc(m.mech)}</span>
        ${m.flag ? `<span class="chip flag">⚠ ${esc(m.flag)}</span>` : ""}
        ${m.page ? `<span class="chip flag">product page, not a tile</span>` : ""}
      </div>
      <h2 class="display">${esc(p.title)}</h2>
      ${m.gen
        ? `<p class="why">No GLB clip exists for this — there is no mechanism to render, so a generative model is the only route.</p>`
        : `<p class="why">Already shipping, baked from geometry we own. The live tile is your benchmark — <code>${esc(path.join(ROOT, "public/systems/anim", m.id))}\\01.webp</code> through <code>28.webp</code>. Beat it or keep the bake.</p>`}
    </div>
    <div class="card-body">
      <div class="refs">
        <div class="refs-bar">
          <p class="eyebrow">Attach these — click an image to copy it</p>
          <button class="copy ghost" data-copy="r${i}">Copy all paths</button>
        </div>
        ${p.refs
          .map((r, j) => {
            const a = asset[j];
            const use = esc(r.use).replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
            const thumb =
              a.kind === "video"
                ? `<div class="thumb is-video" title="Video cannot be placed on the clipboard">VIDEO</div>`
                : `<button class="thumb" data-img="i${i}_${j}" title="Copy this image to the clipboard"><img id="i${i}_${j}" src="${a.uri}" alt=""><span class="thumb-badge">Copy</span></button>`;
            return `<div class="ref">
          ${thumb}
          <div class="ref-text"><code>${esc(a.abs)}</code><span>${use}</span>${
            a.kind === "video"
              ? `<span class="note">No browser can put a video on the clipboard — open the path above and attach the file directly.</span>`
              : ""
          }</div>
        </div>`;
          })
          .join("\n        ")}
        <pre class="hidden" id="r${i}">${esc(asset.map((a) => a.abs).join("\n"))}</pre>
      </div>

      <div class="payload">
        <div class="payload-bar"><p class="eyebrow">Full prompt — paste this whole thing</p><button class="copy" data-copy="p${i}">Copy prompt</button></div>
<pre id="p${i}">${esc(mega)}</pre>
      </div>

      <details class="split">
        <summary>Prompt too long, or your tool has a negative field? Alternatives here</summary>
        <div class="split-body">
          <div class="payload">
            <div class="payload-bar"><p class="eyebrow">Compact — same constraints, ~2k chars</p><button class="copy" data-copy="c${i}">Copy</button></div>
<pre id="c${i}">${esc(compact)}</pre>
          </div>
          <div class="payload">
            <div class="payload-bar"><p class="eyebrow">Positive only</p><button class="copy" data-copy="pp${i}">Copy</button></div>
<pre id="pp${i}">${esc(mega.split("\n\nDO NOT SHOW, at any point in the clip:")[0])}</pre>
          </div>
          <div class="payload">
            <div class="payload-bar"><p class="eyebrow">Negative only</p><button class="copy" data-copy="n${i}">Copy</button></div>
<pre class="neg" id="n${i}">${esc(UNIVERSAL_NEG + " " + p.negative)}</pre>
          </div>
        </div>
      </details>

      <div>
        <p class="eyebrow" style="margin-bottom:0.6rem">Reject the output if it fails any of these</p>
        <ul class="accept">${p.acc.map((a) => `<li>${a}</li>`).join("")}</ul>
      </div>
    </div>
  </article>`;
};

const nav = META.map((m) =>
  `<a href="#${m.id}" class="nav-item${m.gen ? " gen" : ""}">${esc(parse(m.id).title)}${m.flag ? " ⚠" : ""}</a>`,
).join("\n      ");

const cards = (await Promise.all(META.map(card))).join("\n");
const tpl = readFileSync(TEMPLATE, "utf8");
const html = tpl.replace("<!--NAV-->", nav).replace("<!--CARDS-->", cards);
writeFileSync(OUT, html);
console.log(`built ${META.length} cards → ${OUT}  (${(html.length / 1024 / 1024).toFixed(1)} MB)`);
