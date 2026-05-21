# Hero Video Runbook

How to generate the looping video used by `VideoHero` on the home page, from existing FourlinQ project photos using AI image-to-video tools.

**Final deliverable:** `/public/videos/hero-loop.mp4` — 30 seconds, no audio, 1920×1080, ~3–5 Mbps H.264.

---

## Why AI animation (and not stock video / commissioned shoot)

The team has already drawn the line on AI-generated *subjects* (see the round-1 [CHANGELOG.md](./CHANGELOG.md) — AI-rendered candidate projects were excluded from Inspiration). This runbook stays inside the safe line:

- **What we're doing:** animating *real* FourlinQ project photos with subtle camera motion (parallax, slow zoom, dolly). The subject doesn't change — only its presentation moves.
- **What we're NOT doing:** generating new "FourlinQ projects" that don't exist, animating fake interiors, or letting the AI invent windows / hardware / architecture.

If you find yourself prompting Runway/Luma with anything that *generates content* rather than *moves existing content*, stop. That's the line.

---

## Source photos (use these 5)

Pick from the brochure-verified library at `public/images/`:

| Filename | What it is | Suggested motion |
|---|---|---|
| `wp-export/FourlinQ-Project-7.jpg` | Modern white residence, casement windows | Slow dolly-in toward the facade |
| `wp-export/FourlinQ-Project-8.jpg` | Curved-glass home, custom shaped panels | Slow tilt-up revealing the curved glass |
| `brand-story.jpg` | Three-storey modern home | Wide drone-like pan left-to-right |
| `wp-export/FQC-Project-18.jpg` | Interior with sliding doors opening to garden | Slow push-through doorway, golden hour light shift |
| `wp-export/FQC-Project-17.jpg` | Living room with full-height casement windows | Subtle parallax / slow zoom revealing depth |

Each will become a 5–6 second clip. Five clips × 6s ≈ 30s loop.

---

## Step-by-step

### 1. Upscale the source photos first

Several of these are ~720p–1080p. Upscale to 4K so the AI has more pixels to work with — also helps the final video crispness.

Tools (any one):
- **Topaz Gigapixel AI** — desktop, ~$100, best for photo upscale
- **Magnific AI** — web, subscription, very good for architectural detail
- **Krea.ai Upscaler** — free tier, decent

Output target: **3840×2160 (4K) JPEG/PNG**.

### 2. Generate motion clips

For each photo, use one of these image-to-video tools:

| Tool | Cost | Quality | Notes |
|---|---|---|---|
| **Runway Gen-3 Alpha** | $15 / month, ~5s per generation | Industry standard, best for architectural motion | Use the "image-to-video" workflow. Prompt: motion description only — keep "no people added, no new windows, preserve subject" in the prompt. |
| **Luma Dream Machine** | Free tier (limited), ~$30/mo | Very good for slow cinematic motion | Often better than Runway for subtle dolly moves. |
| **Kling AI** | Pay-per-credit, ~$0.50/clip | Comparable to Runway, sometimes cheaper | Newer; results vary. |

Prompts to give each tool, **per photo**:

```
Photo 1 (FourlinQ-Project-7):
"Slow cinematic dolly forward toward the modern white residence,
gentle golden-hour light, camera moves perfectly straight, no zoom,
no new architectural elements, no people, preserve all windows exactly as shown."

Photo 2 (FourlinQ-Project-8):
"Slow tilt up from foreground to the curved-glass feature wall,
soft natural light, camera moves smoothly upward, no perspective warp,
preserve all glass panels and frames exactly as shown, no new elements."

Photo 3 (brand-story.jpg):
"Wide slow pan left to right across the three-storey modern home,
drone-like aerial perspective, smooth horizontal motion, no zoom,
preserve all architectural elements exactly as shown, no new objects."

Photo 4 (FQC-Project-18):
"Slow gentle push-in through the open sliding door toward the garden beyond,
warm interior light, soft natural daylight outside, camera moves straight forward,
no new objects, no people, preserve sliding door system exactly as shown."

Photo 5 (FQC-Project-17):
"Slow subtle parallax with a slight zoom-in toward the casement window,
warm interior light, no new architectural elements, no people,
preserve window frame and glass exactly as shown."
```

**Critical:** every prompt MUST include language like *"preserve [the windows] exactly as shown"* and *"no new architectural elements"*. AI tools have a strong tendency to invent additional mullions, change the window pattern, or add furniture. The whole point of this approach is that the windows shown are real FourlinQ installs. If they change, we're back in the no-go zone.

For each generation, iterate 2–3 times until you get a take that:
- Preserves the subject 100%
- Moves smoothly (no jitter / flicker)
- Doesn't introduce strange artifacts at the edges
- Loops cleanly OR has a clear start-end

### 3. Color-grade for consistency

Open all 5 clips in DaVinci Resolve (free) or Premiere. Apply a unified color grade:

- Lift shadows slightly
- Pull highlights down 5–10%
- Warm-neutral white balance (matches the brand-cream backdrop)
- Slight saturation reduction (–5 to –10) for that editorial feel

Marvin's grade reference: warm-neutral, slightly desaturated, lifted shadows. Don't push contrast.

### 4. Chain into a 30-second loop

In DaVinci/Premiere:

1. Place the 5 clips in sequence: Photo 1 → 2 → 3 → 4 → 5 → (back to 1 frame)
2. Add 0.5s cross-dissolves between clips
3. Final clip should cross-dissolve back to the first frame of Photo 1 so the loop is seamless
4. Total target: 30 seconds (give or take 2s)

### 5. Export

**Master export** (`hero-loop.mp4`):
- Codec: H.264
- Resolution: 1920×1080 (1080p — 4K is overkill on the web)
- Bitrate: 3–5 Mbps (2-pass VBR for best quality/size ratio)
- Audio: none (or muted silent track)
- Color space: Rec.709

Target file size: 12–18 MB. If yours is > 25 MB, drop bitrate or shorten loop.

**Optional WebM/AV1 variant** for browsers that support it (smaller file, but takes 5–10× longer to encode). Skip for now; the mp4 alone is fine.

### 6. Drop into the project

1. Copy the final `.mp4` to `public/videos/hero-loop.mp4` in this repo
2. `git add public/videos/hero-loop.mp4`
3. Commit with message: `feat(hero): add AI-animated hero loop video`
4. Push — Vercel will pick it up

Verify the home page hero plays on desktop and falls back to the photo carousel on mobile (which it does automatically — see `src/components/home/VideoHero.tsx` for the fallback conditions).

---

## Performance budget

The video tier needs to stay under **~20 MB total** for the hero. Reasons:

- Vercel's edge will cache it but the cold-load hits real users
- PH mobile users on capped data plans will hate a 50 MB hero (which is why mobile gets the static carousel fallback instead)

If the encoded master ends up > 25 MB:

- Drop to 28-second loop
- Drop bitrate to 2.5 Mbps
- Drop resolution to 1600×900 (still looks fine at hero size)

---

## Honest limits of this approach

You should know what AI-animation can and can't do well:

**Will look great:** subtle camera motion on architectural exteriors with strong lines, slow tilts on facades, parallax on interiors with foreground/background depth, golden-hour exterior shots.

**Will look bad:** reflective glass with complex caustics (AI gets glass refraction wrong), motion that requires anything moving INSIDE the frame (people, curtains, water), close-up hardware shots, anything requiring perfect window mullion geometry.

If a clip looks subtly off — discard it. The hero is the first impression. One AI-tell clip on hero costs more credibility than the cost saved by skipping a real shoot.

---

## When to commission a real shoot instead

Once Tita confirms a project + photographer + budget for Scenario C in [REDESIGN_ROADMAP.md §9](./REDESIGN_ROADMAP.md). Real cinematography always wins for hero work. This AI-animation is the *interim* — visibly upgrading the hero this week while waiting for the real shoot to land.

When the real shoot ships, drop the new file at the same path (`public/videos/hero-loop.mp4`) and no code changes are needed.
