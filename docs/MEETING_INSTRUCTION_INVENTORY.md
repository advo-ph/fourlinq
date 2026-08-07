# Meeting instruction inventory — 2026-07-10 client meeting

Every website instruction Imie gave in the meeting, extracted verbatim from the primary source and mapped to build status. Written 2026-07-17.

**Source:** `~/Downloads/Fourlinq Meeting-transcript.txt` (865 lines, 13,202 words). Website discussion runs **00:00–00:40** and **00:57–00:58**; the middle drifts to unrelated business talk. Speaker diarization is unreliable — timecodes are evidence, speaker labels are not.

**Why this file exists:** the transcript sat outside the repo and was never read directly. The 2026-07-05 `/products` build (Aluminium as a 4th type card) was shipped from Telegram + inference and **rejected** — the instruction against it was in this transcript the whole time (`00:58:06`). Read this before building.

---

## 0. The meta-instruction (this governs everything)

> **`00:19:29`** — *"**Copy it as close as possible. Yung applicable lang. Pero yung layout nyo can be different. But then when I click, It's organized.**"*

> **`00:35:26`** — *"populate-in mo lang siya, **ibahin mo lang yung layout, pero populate-in mo lang siya**."*

> **`00:57:17`** — *"So, it's **mostly about finishing off the categories**… **Our website kasi dapat organize, Yung material.** Dapat when I do this, This is what I know."*

**Reading:** copy Marvin **only where applicable**; layout may differ; the bar is **populated + organized**. This is *not* "clone Marvin" — it is finish the categories and fill the pages.

---

## 1. Taxonomy — the core ask

| # | Instruction (verbatim) | Time | Status |
|---|---|---|---|
| 1.1 | *"**UPVC is separate from aluminum.** This one is UPVC. So, this cannot be aluminum."* | `00:58:06` | ✅ fixed (orthogonal type × material axes, PR #12) |
| 1.2 | *"from UPVC, aluminum, **down to aluminum, regular, thermal, and sleeve**"* — hierarchy: material → aluminium sub-type | `00:08:26` | ⚠️ partial |
| 1.3 | *"**ang main naman namin, UPVC, not aluminum**"* — uPVC is the primary line | `00:08:26` | ⚠️ unverified |
| 1.4 | *"Dapat may parang **apple**. 1TB o 256… **Thermal break or regular Or slim**"* — Apple-Store-style option selector for aluminium | `00:06:20`, `00:36:52` | ❌ not built |
| 1.5 | *"benefit of uPVC, natalo si Aluminum… **Itong categorize muna. Nandun ka na sa benefit, wala ka pa sa categories.**"* — categories before benefits | `00:35:06` | ❌ not built |

---

## 2. GLASS — an entire product line with no home ❌

> **`00:09:32`** — *"remember glass. You can order glass too. Like, **glass lang, walang frame. Anong category siya?**"*
> **`00:09:05`** — *"I don't know where you want to put the glass. **Is it under material? Or you want to show it as glass?**"*

Sub-products she named:

| Item | Verbatim | Time |
|---|---|---|
| Glass facade | *"Glass facade. But it's still served as a door."* | `00:09:44` |
| Frameless door | *"**Frameless door**, pero glass"* | `00:09:44` |
| Fixed panel | *"under glass ha, frameless door, **fixed panel**"* | `00:09:44` |
| Glass railing / balcony | *"Sa mga Jollibee, **railing**, pwede siyang **glass balcony**"* | `00:10:14` |
| Double glazed | *"**Double glazed**, gusto kasi nila ang double panel"* | `00:10:28` |
| Vacuum glass | *"we also have **vacuum glass**"* · *"First time yung makakarinig ng… Vacuum glass… **Research na lang kayo**"* | `00:10:28`, `00:57:38` |
| Switchable / smart glass | *"**switchable glass**, yung parang nagpo-frost siya, tapos nagiging clear… ang tawag namin doon ay **smart intelligent**"* | `00:10:37` |
| Venetian blind in glass | *"**Venetian blind sandwiched in two glass**"* | `00:10:53` |

**This is the single largest unbuilt ask.** She explicitly asked where it goes and got no answer. The 07-10 audit also flags the footer "omits Aluminium and **Glass**."

---

## 3. Products named that don't exist on the site

| Product | Verbatim | Time | Status |
|---|---|---|---|
| **Gazebos** | *"Meron din kami **gazebos**. **Idadagdag nyo rin as a product** yun."* | `00:38:35` | ❌ |
| **Replacement windows** | *"**Replacement window, I also want this.**"* + the real process (corrosion, chipping, board-it-up) | `00:21:52` | ❌ |
| **Screens** | *"**Hardware, glass, screens, we want that eh.**"* | `00:20:09` | ❌ |
| **Hardware** | same | `00:20:09` | ❌ |
| **Casing** | *"We also have that **casing**, if they like."* | `00:20:39` | ❌ |
| **Automation / digital access** | *"**Automate your door**, meron din kami. Gusto mo magkaroon ng **digital access**, meron din kami."* | `00:20:47` | ❌ |
| **Window opening devices** | *"**Window opening devices.** Meron din tayo yan."* | `00:21:11` | ❌ |
| **Largest windows** | *"**largest windows**… we have the widest panel na kaya niya isara ng mag-isa"* | `00:21:23` | ❌ |
| **Divided lights / muntin bars** | *"Divided lights with muntin bars. **We term it French. Some term it Georgian bars.**"* | `00:20:09` | ❌ |
| **Special doors** (slide→swing) | *"pwede siya magiging swing. Meron tayong ganun sa alabang."* | `00:16:05` | ❌ |
| **Pocket door** (needs our own term) | *"Ang tawag ng iba, **pocket door**. But ako, **I have to change the term**. Na exclusive lang yung term sa atin."* | `00:38:15` | ❌ |

**Explicitly NOT carried:** wood doors, wood frames, fiberglass (*"Wala akong wood"*, `00:05:22`; fiberglass is a naming confusion — *"sa atin, ang tawag natin doon, UPV frames"*, `00:08:01`).

---

## 4. Design tool — must include glass

> **`00:11:11`** — *"Ano ba, pag gumawa ka ng window, ano bang gusto mo? Ito yung frame mo. **Ano 'yung glass na ilalagay dito? Anong color ng glass?**"*
> **`00:11:28`** — *"what kind of window you're gonna put and **what kind of glass** you're gonna put… **you want to choose the glass. If your glass is blue, you want to show the client how does it appear**"*

Status: a **Material** step shipped (PR #14). A **Glass type + colour** step is ❌ **not built**.

---

## 5. Inspiration / content

> **`00:26:58`** — *"**inspiration**, I think, okay. **Under inspiration niya yung mga nagba-blog.** Baka every week pagbi-blog kami."*
> **`00:27:16`** — *"Yung **vlog**. Tapos, **Photo gallery**, Given na yun. Ito siguro, Yung mga **meetings namin Sa exhibit**, Dito muna ilagay."*
> **`00:27:29`** — *"**Under inspiration, New arrival.** What's new? …**What's your discovery?**"*

Inspiration should hold: **blog · vlog · photo gallery · exhibit coverage · new arrivals**. Status: ⚠️ partial (Inspiration + What's New exist; blog/vlog/exhibit ❌).

---

## 6. Solutions — ship it even if not ready

> **`00:26:16`** — *"**Lagay nyo, pero hindi pa tayo ready.** Bakit ilagay nyo? Because it tells you… I have a problem. Example, yung UPVC, may **digital access** kami. **Can be a solution. Automated can be a solution.**"*

Marvin has a **Solutions** nav item; FourlinQ does not. ❌ not built.

---

## 7. Projects / collections

> **`00:22:53`** — *"collection will be how do we categorize The look. **I don't have That because we don't picture, Our photos. Yun ang problem.**"*
> **`00:23:14`** — *"**In the meantime, just plot it by area. Kaya, MBR, Living**"* · *"O pwede **residential, commercial**"*

**Collections is correctly skipped** (no photos). The **plot projects by area** instruction is ⚠️ **partial — and on a different axis than she asked for.** Her words name a *room / occupancy* axis (*"Kaya, **MBR, Living**"* / *"pwede **residential, commercial**"*); what shipped 2026-08-07 (lane `project-photo`) is a **geographic** one: structured `ProjectArea` + region filter (Metro Manila, Cebu, … + "Area to be confirmed"), card labels via the client convention (`Amara — Cebu`). Useful, and honest about what it knows — but it is a **substitution, not the ask**. Both axes she actually named remain ❌ not built: room-level (MBR / Living) needs per-room records, residential/commercial needs occupancy records. Client fill-in table: `docs/AUG07_PROJECT_AREA_REQUEST.md`. **Raise this with her** — do not present the region filter as the area feature she requested.

---

## 8. AI / LLM visibility — a real, repeated ask

> **`00:27:51`** — *"wala pang AI. **I want to see pa anong bias ba yung AI natin when they ask.**"*
> **`00:28:02`** — *"Pagka, **what's the best uPVC? Nandun pa kami sa taas.**"*
> **`00:28:35`** — *"**Why should I choose for you?**"* (repeated `00:35:26`)

She wants FourlinQ to surface when an AI is asked *"what's the best uPVC"*. ❌ not addressed.

---

## 9. Corrections / fixes

| Fix | Verbatim | Time | Status |
|---|---|---|---|
| Remove Chinese characters from the slim-aluminium video | *"**Kaya niyo bang tanggalin yung video, yung Chinese, na character?**"* | `00:37:00` | ❌ |
| Zero-leak page is thin | *"**Zero leak and then what's next? Ang daming qualities ng uPVC eh.**"* | `00:35:26` | ✅ fixed (PR #20 — 7 profile features) |
| Awning opens outward | *"ang awning, you're **pushing it outside**… Everything is going out. **Never inward.**"* | `00:12:32` | ⚠️ verify |
| "Sliding", not "glider" | *"**We don't call it glider. It's called sliding.**"* | `00:13:32` | ⚠️ verify |
| Single hang only (no double hung) | *"we only have the **slide down**"* | `00:13:45` | ⚠️ verify |

---

## 10. ⚠️ Claims on the site she has not backed

- **`/for-architects` advertises a "Complete brochure" + CAD/BIM.** She said: *"**Wala kami catalog. I only have a line of flyers.**"* (`00:39:04`) and the brochure request flow *"we haven't done it, but next na yun"* (`00:25:44`). **The site is promising a catalog that does not exist.**
- **"20 years"** — *"20 years na kami"* (`00:30:20`) is the first support for the founding-year claim currently sitting in `roadmap-rejected.md` triage.

---

## 11. Materials she says she already sent (WE HAVE NOT READ THESE) 🚩

> **`00:58:06`** — *"**Nasa kanya kasi yung catalog** oh. Hindi nag-pass ng recording. **Hindi, nasa GC.** … **Hindi kayo nagbabasa, eh.**"*
> **`00:39:04`** — *"I only have a line of flyers. **Pero sinend ko na sa'yo, diba? Sinend ko na rin.**"*
> **`00:28:46`** — *"within the week, **I'll send you more** [photos]"* · *"**If I add you to our group na may photos**"*
> **`00:31:39`** — *"type mo **Excalibur sa Instagram**… Builders. **Lahat yan, project ko.**"* — a real client whose projects are all FourlinQ

**Action:** find the GC/flyers/photo group. She has explicitly said we aren't reading what she sends.

---

## Coverage / honesty

- Transcript: website-relevant sections read in full (`00:00–00:40`, `00:57–00:58`). Middle section verified as off-topic business talk.
- Telegram: 165 messages read; **~16 of 49 images viewed** — image pass incomplete.
- Prince's dev-channel comments: relayed second-hand only; no export read.
- Speaker attribution is unreliable; instructions are attributed to the client by context, not by diarization label.
