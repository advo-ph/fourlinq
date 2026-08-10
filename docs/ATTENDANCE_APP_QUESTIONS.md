# Attendance + accomplishment-report app — technical answer sheet

**Internal prep for the ADVO/FourlinQ team. Not a client message.** Nothing here is
written to be forwarded; it is the material we need in our heads before Wednesday.

**Scope note.** This is a *second, separate* project from the website. The repo
contains no attendance code and never has — `grep -ril "attendance|biometric|accomplishment"`
across `src/`, `docs/`, `supabase/` returns only two prose hits, and one of them,
`docs/roadmap-rejected.md:32`, explicitly parks "CRM, fabrication tracking, attendance,
payroll…" as a *separate written scope with its own owner, budget, and acceptance plan*.
So everything below is a greenfield design read, not a status report. There is nothing
built to demo.

**The four questions, verbatim (2026-08-07):**

1. "what about the staff who do not have access to app and laptop..can they use someone else phone to show his face as attenance.."
2. "does it work like fingerprint and face biometrics?"
3. "cna the attendance be exported in a certain format?"
4. "can they also submit accomplishment reports through the app"

Q1 and Q2 are the same question wearing two hats, and the honest answer to both
depends on one distinction most people have never had to make. Read Q2 first if
you are prepping to speak; it gives you the vocabulary that makes Q1 answerable
without hand-waving.

---

## Q2 — "does it work like fingerprint and face biometrics?"

Answer it in three parts, because "biometrics" collapses three separate things.

### Face recognition (1:N) vs face verification (1:1)

These are different problems with different failure modes, and the app's whole
trust model turns on which one we build.

| | **Verification (1:1)** | **Recognition / identification (1:N)** |
|---|---|---|
| The question asked | "Is this face the person who *claims* to be employee `E-0142`?" | "Which of our N enrolled staff is this face, if any?" |
| Prerequisite | The person first asserts an identity (login, badge tap, roster tap) | Nothing — the face alone is the input |
| Error behaviour | One threshold, one comparison | Compares against every enrolled template; the chance of *some* wrong template clearing the threshold rises with N |
| Practical accuracy | High, and stable as headcount grows | Degrades as headcount grows unless the threshold is tightened, which then rejects legitimate staff |
| Fits | Own-phone or kiosk-with-roster check-in | Walk-up kiosk with no roster tap |

**Design decision this forces:** default to **verification**, not recognition.
Make the person assert who they are first (tap their name on the site roster, or
be logged in), and use the face only to confirm it. It is the more accurate mode,
it stays accurate as headcount grows, and it produces a cleaner audit line
("claimed `E-0142`, face confirmed at 0.87") than a bare 1:N guess.

**Trade-off:** one extra tap, and on a shared device the roster list is visible
to everyone using it — a mild privacy leak (who is on this crew) that we should
mitigate by scoping the roster to the site and hiding anything beyond the name.

### What a phone camera can and cannot do

- **Can:** capture a face image good enough for a modern matcher in ordinary
  daylight or decent indoor light.
- **Cannot, on most Android hardware:** see depth. Face-ID-class devices project
  IR dots and get a 3D map; a typical mid-range Android front camera returns a
  flat RGB image and cannot tell a face from a good photo of a face on its own.
- **Struggles with:** hard backlight (staff standing in a doorway at 7am is the
  exact bad case), heavy PPE, low-light interiors, cracked or greasy lenses on
  site phones.

**Liveness / anti-spoofing** is therefore a *software* problem for us, and it is
the part that is genuinely hard:

- **Passive liveness** — the model looks for screen moiré, print texture, flat
  specular reflection, missing micro-motion. Zero friction for the user. Beatable
  by a high-quality display or print, and quality varies a lot between vendors.
- **Active challenge** — random prompt: blink, turn left, read a number on screen.
  Much harder to defeat with a still photo or a pre-recorded clip, because the
  challenge is unpredictable. Adds 3–8 seconds per punch, annoys people daily,
  and fails more often in bad light.
- **What neither stops:** a rooted/developer-mode phone feeding a *virtual camera*
  a synthetic or replayed video stream. The image never passes through the lens,
  so no amount of image analysis helps. The defence is device attestation (Play
  Integrity / DeviceCheck) and root detection, which is an arms race we will not
  win permanently — we can only make it inconvenient.

**Be honest in the meeting:** liveness raises the cost of cheating; it does not
make cheating impossible. Any vendor who says their liveness is unbeatable is
selling.

### Fingerprint — the part that actually answers Q1

This is the single most important technical fact on the sheet:

> **A phone's fingerprint sensor cannot be used to identify an arbitrary employee.
> iOS and Android never hand an app the fingerprint. The OS exposes only a
> yes/no — "the person who unlocked this phone matched a finger enrolled *on this
> phone*." It authenticates the DEVICE OWNER, not whoever is standing there.**

So on a borrowed phone, fingerprint is not merely inaccurate — it is
*structurally meaningless*. If Ramon hands his phone to Delia and Delia taps
"fingerprint", the phone will happily confirm **Ramon's** finger, or Delia's if
she happens to be enrolled on Ramon's device, and the app cannot tell the
difference. It would attest the wrong person by design.

Fingerprint for arbitrary staff requires **a reader with its own sensor and its
own enrolled gallery** — a wall-mounted time clock, a USB or Bluetooth scanner
attached to a site tablet. That is hardware, procurement, enrolment sessions, and
maintenance, and it is a different proposal shape from "an app."

**The distinction that answers Q1 and Q2 together:** the camera is a *general
sensor* — it will photograph anyone put in front of it, which is exactly why face
works on a borrowed phone *and* exactly why a borrowed phone is the weakest place
to trust it. The fingerprint sensor is a *bound* sensor — it only ever speaks
about its owner, which is why it is trustworthy and why it cannot be borrowed.
Security and shareability are the same axis pointing opposite directions.

---

## Q1 — "can they use someone else's phone to show his face as attendance?"

**Honest answer: technically yes, easily. That is the problem, not the feature.**

Face capture on a co-worker's phone is not *similar to* buddy-punching — it is
the mechanism of buddy-punching with a camera attached. The moment attendance can
be recorded from an arbitrary device at an arbitrary place, the record stops
being evidence of presence and becomes an assertion that someone's face was in
front of some lens. We can build it. What we cannot do is build it *and* tell
payroll the resulting rows are trustworthy. Those two pull against each other and
no amount of engineering makes them stop.

The right move is not to pick one mechanism. It is to **record how each punch was
captured** and let policy decide what each grade is worth.

### The real options

| Option | What it actually guarantees | What it does not guarantee | Cost / friction |
|---|---|---|---|
| **A. Shared site device (kiosk)** — a tablet in kiosk mode at the site entrance, roster tap + face verification + liveness, device-bound and location-fixed | Identity to the strength of the matcher + liveness. **Time and place are genuinely trustworthy** — the device is fixed, ours, attested, and cannot be carried off-site | Presence for the whole shift (it is a punch, not a monitor). Nor does it stop a strong spoof if liveness is weak, or a crew member holding the tablet up to a photo | Hardware per site, mounting, power, an offline queue for connectivity gaps, someone accountable for the device |
| **B. Borrowed phone + geofence + device binding** | Very little. Device binding is precisely the control being relaxed — if any phone qualifies, the device signal is gone and only the face and GPS remain. GPS is spoofable via mock-location on developer-mode Android; we can read the mock-location flag but not defeat a determined rooted device | That the punch happened at the site, that the phone owner was not coaching, that the stream came from the lens at all | Cheapest to build, weakest record. **If we ship this, the export must mark these rows as low-assurance** |
| **C. Supervisor-attested manual entry** | A **named, accountable human** put their name on this row, with a full audit trail (who, when, from where, what reason code) | Honesty. This does not create trust — it *relocates* it from a sensor to a person. Which is fine, and is what most PH field operations already run on | Low build cost, real admin load. Must be visibly flagged in the export so payroll can see attested vs machine-captured lines |
| **D. Rotating QR at site, or PIN** | QR: that someone with a camera was in front of *that screen* within the ~30s window the code was valid (TOTP-style, so it cannot be photographed and messaged to someone at home). PIN: that someone knew a secret | **Who.** Neither says anything about identity. A PIN is trivially shared and is the weakest control on this list | Very cheap. QR needs a screen at the site; PIN needs nothing |

### The design decision this forces

Every attendance row carries a `capture_method` (`kiosk_face`, `own_device_face`,
`borrowed_device_face`, `supervisor_attest`, `site_qr`, `pin`) and an assurance
grade derived from it. Exceptions are visible rather than hidden. The system's job
is to record *how it knows*, honestly, not to pretend every row is equally solid.

**Trade-off:** the client may want a single green tick and will experience grades
as complication. The counter-argument is the one that matters to her: the day
there is a payroll dispute or a labour complaint, "the app said present" is worth
nothing, and "kiosk face match at 0.91, on-site device, 07:02" or "attested by
Foreman J. Cruz, reason: phone battery dead" is worth a great deal.

**Recommended shape to propose:** kiosk (A) as the primary for staff without
their own phone, supervisor attestation (C) as the *named* exception path with a
monthly exception rate we actually report on, and QR (D) only as a
break-glass. Treat borrowed-phone face (B) as available but explicitly
low-assurance — and say plainly that if she wants it as the *primary* path for
phoneless staff, the honest framing is a convenience log, not a verified record.

**One more thing to say out loud:** a non-biometric alternative is not only a
usability nicety. Under the Data Privacy Act, consent to process biometric data
must be freely given, which is hard to argue when the only way to get paid is to
submit your face. See the privacy section.

---

## Q3 — "can the attendance be exported in a certain format?"

**Honest answer: yes, and this is the easy one.** Exports are a solved problem.

- **CSV** — the payroll workhorse. One row per punch, or one row per employee per
  day, or one row per employee per cutoff. Which of those three we emit is a real
  decision and it depends entirely on the consuming system.
- **XLSX** — same data with formatting, multiple sheet, and a header block; what
  HR usually wants when a human reads it.
- **PDF** — for a signed daily time record, one page per employee per cutoff,
  with a signature block. This is the artefact that ends up in a folder.

**The catch, and the question we ask back.** "A certain format" almost never
means "a file type." It means *an existing template that an existing system
already eats* — a payroll package (Sprout, PayrollHero, Salarium, an accounting
package), or far more likely a specific Excel sheet someone in HR has maintained
for years. The honest answer is: **yes, we can match a format, but tell us which
system consumes the file and give us one real sample export from it.** One
genuine sample file removes more ambiguity than an hour of discussion.

Sub-questions to have ready:

- Punch-level rows or daily-summary rows?
- **Which employee identifier does payroll key on?** Their existing employee
  code, almost certainly — not any id we generate. We need that code in our
  records from day one.
- Do we compute late / undertime / overtime / night differential / holiday
  premium, or export raw in-out and let payroll compute? *Computing them means
  encoding their policy, and that is a materially bigger scope than exporting.*
- Cutoff periods — semi-monthly (15th / EOM) is the PH default, but confirm.
- Rounding / grace-period rules, if any.

**Design decision:** build a **configurable column mapping** (a per-client export
profile: which columns, what order, what date format, what the header row says)
rather than one hardcoded exporter. Slightly more work up front, and it means the
next format request is a config change instead of a release.

**Trade-off:** mapping configuration is a small piece of internal tooling somebody
has to own, and if we let it get too clever it becomes its own product. Keep it
to columns, order, formats, and a static header.

---

## Q4 — "can they also submit accomplishment reports through the app?"

**Honest answer: yes, straightforwardly. This is the least risky item on the list.**

It is a form plus attachments plus a review state. No biometrics, no adversarial
model, no hardware.

A workable record shape (singular naming, per house convention):

| Field | Note |
|---|---|
| `report_code` | Human-readable, sortable |
| `employee_code` | The payroll-side code, not an internal id |
| `report_date` | The day the work was done — distinct from `submitted_at` |
| `attendance_code` | Optional link to that day's punch, so a report can be read next to whether the person was clocked in |
| `site_code` / `project_code` | Where the work happened |
| `task_description` | Free text. Optionally a picked `task_type` for reportability |
| `output_quantity` + `output_unit` | Optional; only useful if the work is countable (panel installed, unit delivered) |
| `hour_spent` | Optional; only if it is not already derivable from the punch |
| `status` | `draft` / `submitted` / `approved` / `returned` |
| `submitted_at`, `reviewed_by`, `reviewed_at`, `review_note` | The approval trail |
| `attachment[]` | Photo of the work. **Decide: camera-only, or gallery pick allowed?** Gallery pick lets an old photo be re-submitted; camera-only is more trustworthy and more annoying |
| `created_at`, `updated_at`, `is_deleted` | Standard audit + soft delete |

**Design decisions this forces:**

1. **Offline-first, or not.** Field staff lose signal. If reports must be writable
   with no connection, we need a local draft store and a sync queue with conflict
   handling. That, not the form, is where the effort goes.
2. **Approval workflow, or capture only?** "Submit a report" and "a supervisor
   approves reports and can send them back" are different builds. Ask.
3. **Photo storage volume.** Daily photo from every field worker adds up fast;
   needs a retention rule and compression on-device before upload.

**Trade-off:** the temptation is to grow this into task management (assignment,
scheduling, progress). Hold the line at *capture and review* for v1 unless the
client explicitly scopes and funds more.

---

## Philippine Data Privacy Act — raise this, do not skip it

**Not legal advice.** This is a flag for the team so we raise it before we design
ourselves into a corner, and so the client's counsel or DPO can rule on it.

Under RA 10173 (Data Privacy Act of 2012), **biometric data is explicitly
"sensitive personal information."** That is a materially stricter category than
ordinary personal data, and it changes what the build has to include:

- **Consent.** Processing sensitive personal information is generally prohibited
  unless a specific lawful ground applies; consent must be **specific, informed,
  freely given, and evidenced** — recorded in writing or electronically, obtained
  *before* enrolment, not buried in an employment contract signed years ago. The
  "freely given" test is the one that bites in an employment setting: if the only
  way to be marked present is to submit your face, consent is arguable. **A
  working non-biometric alternative is therefore both a Q1 answer and a
  compliance posture.**
- **Store a template, not an image, where we can.** A non-reversible mathematical
  template (embedding) instead of retained face photos shrinks the blast radius
  of a breach considerably. Be precise, though — an embedding is **still**
  biometric personal data, still sensitive, and reconstruction attacks against
  embeddings exist. The benefit is reduced harm, not exemption. If we do keep
  capture images (useful for dispute review), keep them for a short defined
  window and store them separately from the templates.
- **Retention.** Needs a stated period tied to purpose, and automatic deletion —
  including deletion of an employee's template on separation, plus whatever tail
  the attendance record itself needs for payroll and money-claim purposes.
  *Confirm the correct retention window with the client's counsel; do not assert
  a number in the proposal.*
- **Transparency and data-subject right.** A privacy notice at enrolment; the
  right to access, correct, and object; a defined process for someone who
  disputes a record.
- **Breach notification.** The 72-hour notification duty to the NPC and affected
  individuals means we need logging and an incident path from day one, not bolted
  on later.
- **Roles and contract.** If ADVO builds and hosts, the client is very likely the
  Personal Information Controller and we are the Personal Information Processor.
  That relationship needs a written outsourcing agreement with security
  obligations spelled out. **This is a contract line item, not a technical one.**
- **NPC registration and a Privacy Impact Assessment** may be triggered depending
  on headcount and the sensitivity involved. Ask whether the client already has a
  registered Data Protection Officer and a data processing system registration —
  if they run any existing biometric time clock, they may already be covered, and
  if they are not, that is their exposure to close, not ours to quietly inherit.

**How to handle it Wednesday:** raise it as a design input we have already thought
about — it makes us look competent, not obstructive — and recommend their counsel
or DPO signs off on the consent text and retention period before enrolment starts.

---

## Open questions to ask BEFORE proposing

**Population and hardware**
1. Headcount, and how many staff have **no** smartphone? (Q1's whole weight rests
   on this number, and nobody has said it yet.)
2. What phones do the ones with phones actually have — Android version floor?
3. Are staff at fixed sites, roving between sites, or both?
4. Is there existing biometric hardware (a wall clock), and can we read its data
   or import its enrolment?

**Trust policy**
5. Who is the authority on a disputed punch, and what does the current dispute
   process look like on paper?
6. Is she willing to accept graded records (verified vs attested), or does she
   want one uniform tick? *This is the single question that most changes the build.*
7. What is the tolerance for a daily false reject — a real worker standing in the
   sun who cannot clock in?

**Payroll integration**
8. **What system consumes the export, and can we see one real sample file?**
9. Do we compute late/OT/night-diff/holiday premium, or export raw punch?
10. Cutoff periods, and the employee identifier payroll keys on.

**Accomplishment report**
11. Capture only, or approval workflow with return-for-revision?
12. Must it work offline?
13. Camera-only photo, or is gallery selection acceptable?

**Governance and platform**
14. Do they have a DPO, a privacy notice, and NPC registration today?
15. Android only, or iOS too? Is there a web admin console, and who uses it?
16. Where is the data hosted, and who owns it if the engagement ends?

---

## Rough complexity read

No pricing. Relative effort only, and each line names its actual driver.

| Feature | Complexity | What drives it |
|---|---|---|
| Attendance capture, own device, face verification (1:1) | **Medium** | The matcher and enrolment flow are the bulk; a vendor SDK moves most of it |
| Liveness / anti-spoofing | **Medium–High, open-ended** | Vendor-dependent, needs field tuning against real lighting, and is never *finished* |
| 1:N face recognition instead of verification | **High** | Threshold tuning that degrades with headcount; avoid unless there is a hard reason |
| Kiosk mode shared device | **Medium** | Software is modest; hardware, mounting, and device custody are the real work |
| Fingerprint for arbitrary staff | **High + hardware** | External reader, procurement, enrolment sessions, maintenance. Not an app feature |
| Geofence / location capture | **Low to add, High to trust** | Trivial to read GPS; mock-location and rooted-device detection is the arms race |
| Supervisor-attested manual entry | **Low** | A form, a reason code, and an audit trail. Highest trust-per-unit-effort on the list |
| Rotating site QR | **Low** | TOTP-style code plus a scanner screen |
| Offline queue and sync | **Medium–High** | Conflict handling and clock trust. Underestimated by everyone, always |
| CSV / XLSX export | **Low** | Genuinely easy |
| Match a specific payroll template | **Low–Medium** | Entirely gated on getting a real sample file, not on code |
| Computing OT / night diff / holiday premium | **High** | This is encoding their payroll policy, not exporting data. Scope separately |
| PDF signed DTR | **Low–Medium** | Layout and pagination work |
| Accomplishment report capture | **Low–Medium** | A form with attachments |
| Accomplishment report approval workflow | **Medium** | State machine, notification, and a reviewer console |
| Admin console (roster, enrolment, exception review, export) | **Medium–High** | Quietly one of the largest pieces, and routinely left out of estimates |
| DPA compliance work (consent flow, retention job, privacy notice, deletion) | **Medium** | Cuts across everything. Cheap if designed in, expensive if retrofitted |

**The honest headline for Wednesday:** three of the four questions are
comfortable yeses. The first one is not a feature request — it is a request to
weaken the very thing the system exists to establish, and we should walk in with
the graded-record answer rather than a flat yes or a flat no.
