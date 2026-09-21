# CYRAVON — FULL HANDOFF (send-ready) · 2026-09-20

Cyravon is a research-first **molecular evidence & signal atlas for peptides**: what research found, what people report, and how internet claims mutate between them — with every relationship carrying provenance. "Cyravon" is a placeholder brand (name is taken); the rename is one line.

This document is the complete state of the project. Read it top to bottom before touching code.

---

## 1. Where everything is

| Thing | Location |
|---|---|
| **The app (git repo, canonical)** | `C:\Users\corey\Projects\cyravon\cyravon-app` — private GitHub remote **https://github.com/coreyagraphy/cyravon** (branch `main`, pushed 2026-09-20) |
| Original archive it was unpacked from | `C:\Users\corey\Downloads\cyravon-app-v0.1.tar.gz` (also unpacked at `C:\Users\corey\Projects\cyravon\cyravon-app` — same thing) |
| Original handoff prompt | `C:\Users\corey\Downloads\cyravon-handoff-prompt.md` (copy also in repo root) |
| Product brief — **the source of truth** | `cyravon-app/CYRAVON_BRIEF.md` (2,388 lines; §1–§67) |
| Technical spec the build follows | `cyravon-app/BUILD_SPEC_CYRAVON.md` (+ `BUILD_SPEC.md`, the older Helixa spec: reuse only its geometry / rigs / LOD / performance sections, never its commerce parts) |
| State after the visual-moats pass | `cyravon-app/HANDOFF-V2.md` |
| State after the cinematic pass (this session) | `cyravon-app/HANDOFF-V3.md` |
| Cinematic UI / realism lock addendum | Was pasted into chat on 2026-09-20; its requirements are summarised in §5 below and implemented per HANDOFF-V3 |
| Screenshots of every flagship view | `cyravon-app/shots/` (gitignored, regenerate with `node tools/shots.mjs`) |
| Desktop dev-server launch entry | `C:\Users\corey\OneDrive\Desktop\.claude\launch.json` → entry `cyravon-dev` (runs `scripts/dev-here.mjs 8082`) |

There is exactly **one** repo, mirrored to the private GitHub remote above. Nothing lives in OneDrive. Node 22+, npm.

## 2. Run it

```bash
cd C:\Users\corey\Projects\cyravon\cyravon-app
npm install
npm run dev          # 0.0.0.0:8080
npm run build        # verify-pmids → tsc --noEmit → vite build — MUST stay green
npm start            # serves .output after a build
node tools/shots.mjs # screenshots → shots/ (needs dev server on 8082 + installed Google Chrome)
node tools/poster.mjs # re-renders public/posters/hero*.jpg from the live hero scene
```

Query flags: `?static=1` forces the no-WebGL path; `?quality=low|mid|high` forces a GPU tier.

Stack: TanStack Start (file routes), React 19, TypeScript, Tailwind v4, three ^0.186, @react-three/fiber 9, drei 10, @react-three/postprocessing 3, GSAP 3.15 + ScrollTrigger, Lenis, d3-force, zustand, Playwright (dev).

## 3. Red lines — non-negotiable (from the brief)

1. No dosing, protocols, reconstitution/syringe calculators, stacks, purchase links, vendor names, affiliate rankings, "best for X".
2. No TRUE/FALSE labels on claims. No "proven / cures / heals / safe / dangerous / debunked / miracle" unless quoting a sourced text.
3. **No invented PMIDs, DOIs, authors, institutions, mention counts, cluster counts, dates, or regulatory events.** Every `Study` must resolve via NCBI eutils at build time (`tools/verify-pmids.ts` enforces it — extend, never bypass). Unverifiable → render "Source relationship unresolved."
4. Human Signal: **no platform access exists.** Every signal panel shows `Corpus: 0 sources · Collection window: none · Platforms: none enabled` and the empty state. Never seed fake reports.
5. Claim-mutation wording without an indexed source carries the badge **"Illustrative wording — not an indexed source."**
6. Every 3D structure carries its provenance label. Structures are **sequence-derived (procedural, not measured)**; PDB IDs show as "deposited, not rendered". Never say "predicted model".
7. Content never depends on WebGL; every visual keeps its SSR table/SVG equivalent; `prefers-reduced-motion` keeps full functionality.
8. Retatrutide displays as **GLP3**; there is no Dihexa.
9. Every material change to a claim goes into `changeHistory` with before/after. History is never rewritten silently.
10. Brand string lives only in `src/brand.ts` (`BRAND`). Never add literal "Cyravon" anywhere else.
11. When this file conflicts with `CYRAVON_BRIEF.md`, the brief wins. When it conflicts with HANDOFF-V2/V3, flag it rather than choosing silently.
12. Corey builds solo. Write everything so he can run it; never hand work to "a developer".

## 4. What is built (working today)

**Routes** (`src/routes`): `/` (cinematic hero, three worlds, featured claim trace, compound rail, research pulse, why) · `/explore` (filters + sort, grid + table) · `/compound/$slug` (dossier sections A–L) · `/claim/$id` (all 11 sections; d3-force lineage; mutation ladder) · `/claims` · `/signal` (empty constellation, filters inert) · `/compare` (up to 4, residue diff) · `/timeline` (change ledger + time scrub) · `/learn` + `/learn/how-internet-claims-mutate` · `/methodology` · `/coverage` · `/corrections` · `/status/$compound` · `/saved` · about/contact/privacy/terms (stubs) · 404 · ⌘K search.

**Data** (`src/data`): `compounds.ts` (33 compounds, aliases, domains, GLP3 display) · `domains.ts` (7 research domains) · `studies.ts` + `verified.json` (9 verified PMIDs, written at build) · `claims.ts` (2 fixture claims: `CLAIM-BPC157-TENDON-REPAIR`, `CLAIM-TB4-CELL-MIGRATION`) · `evidence.ts` (15-dim Evidence Genome, themes, translation, pulse — all computed from verified records) · `signal.ts` (empty corpus, 12 fingerprint dims, platform registry) · `lessons.ts`.

**Verified PMIDs** (NCBI esummary, build 2026-09-20): 21030672 · 42542926 · 41754849 · 40789979 · 40756949 (BPC-157) · 34170491 · 32245208 · 36706591 · 41235866 (TB-500 / Tβ4). 42542926 is shared. Abstract quotes were copied verbatim from efetch.

**Visual system** (`src/scenes`, `src/components`, `src/styles/app.css`):
- `chain/geometry.ts` + `hotspots.ts` (sequence-driven backbone: helix params, proline kinks, glycine wobble, lactam bridges, Cu site, mods) · `chain/ChainRenderer.tsx` (PBR clearcoat/sheen materials, N→C assembly, `highlight` residue window, `dim`) · `chain/ViewerScene.tsx` (dossier stage: exposure rise, illumination wave, scroll-away loosening, inertial orbit, contact shadow, backdrop + dust, glass provenance panel that dims the molecule).
- `hero/HeroScene.tsx` (STATE 1 emergence from near-black · STATE 2 damped scroll camera flight with pointer parallax ±2° and a travelling signal light · STATE 3 "TRACE THE SIGNAL" as a plane deep in the scene that residues cross · STATE 4 chain end resolves into research → claim → signal nodes in camera space) · DOF/bloom/grain/vignette/SMAA by tier · rendered JPEG posters for LCP and reduced motion.
- `rigs/*` (7 domain rigs for cards), `signal/Constellation.tsx` (observatory field, 3 depth layers, zero report points), `Canvas.tsx` (shared View canvas + `Lod0Canvas` that pauses when hidden/off-screen).
- `motion/useReducedMotion.ts` = visual store: mode (ssr/static/canvas), GPU quality tier (low/mid/high → dpr, particles, DOF, SMAA, haze, shadows), document visibility. `motion/lenis.ts`, `motion/timeline.ts` (ScrollTrigger scrub helper).
- Components: EvidenceChip, SpeciesBadge, SourceBadge/ProvenanceLabel, nodes.tsx (typed graph nodes: distinct shape AND colour), SignalFingerprint, EvidenceGenome, TranslationTrack (signal travels, stops where evidence stops), SourceCard, StudyCard, ClaimCard, ChangeDiff, StructureViewer, TimelineLane (depth entry), ProvenanceDrawer (pushes page back, evidence forward), CorpusHeader, EmptyState, SearchModal, LineageGraph (plays its trace on view, hover isolation, replay), MutationLadder (physical diff + "Uncertainty removed"), CompoundCard, SequenceSVG, ResidueTable, Hero, Nav, Footer, NotFoundFragment, SceneLoader (fragment loader, not a spinner).

**Verification tooling**: `tools/verify-pmids.ts` (build gate), `tools/shots.mjs` (desktop 1440×900 + mobile 390×844 for home ×5 scroll positions, dossier ×2, claim ×3, signal, timeline, compare, explore), `tools/probe.mjs` (static/reduced-motion shots + failed-request check), `tools/poster.mjs`, `tools/gen-poster.ts` (old SVG poster), `tools/record.mjs`.

## 5. Visual bar that applies to all future screens (cinematic addendum, condensed)

Physically dimensional, photoreal where appropriate, spatial, illuminated, scroll-reactive, pointer-reactive, alive but not distracting. Never: flat molecules, wireframes on black, generic three.js demos, cheap neon, excessive bloom, arcade particles, cards floating over a video, a flat `#000` background. Glow has hierarchy (active residues, binding regions, selected nodes, state changes) — never every atom. Lighting = key + rim + environment + a **signal light that changes with data**. Depth = foreground fragments, mid structures, distant field, haze, parallax, occlusion. Scroll drives camera/assembly/highlighting/graph expansion, with smoothing and bounded interpolation; users can always exit. Motion has inertia. Every animation must answer "what changed / where did I move / what relationship is shown"; if the answer is "nothing", remove it. Mobile stays rich with lighter geometry; reduced motion keeps depth, lighting and information. Fidelity degrades before information ever does. Screenshot test: with no context, does it look like a premium scientific intelligence product? The eight flagship views: homepage hero, compound dossier, claim graph, Human Signal, timeline, compare, study detail, Claim Inspector.

## 6. WHAT IS LEFT TO BUILD — everything, in order

Work top-down. Each item ends with `npm run build` green and screenshots you have looked at.

### 6.1 Hero — decision needed (see §7 conflict 1)
Camera-flight hero is done and polished. The original handoff asked for a scatter→coil spectacle (~400 instanced residues assembling into a ~60-residue helix, camera dolly along the axis). It was **not** built. If Corey wants it, build it as an alternative `src/scenes/hero/ScatterCoil.tsx` behind a flag, keep poster-first LCP, and label its provenance honestly (it is not a real compound's structure).

### 6.2 `/study/$pmid` — study detail (brief §25) — NOT STARTED
Route + page from eutils **esummary + efetch** abstract at build time (extend `tools/verify-pmids.ts` to fetch and cache abstracts into `verified.json`). Fields: title, journal, year, authors, DOI, abstract (verbatim), species and sample size **only if explicitly in the record**, otherwise "Not stated in indexed record". Relationship chips to every claim that cites it. "Open original source" → PubMed. SSR-only page (no WebGL). Wire StudyCard/SourceBadge links to it. Add it to ⌘K search.

### 6.3 Data model → real schema (brief §39) — NOT STARTED
Move `src/data/*.ts` into a typed store with entities: Compound, Structure, Alias, Claim, ClaimVersion, Study, Species, Endpoint, Source, CommunityReport, OriginCluster, Mention, ClaimRelationship, EvidenceRelationship, Contradiction, Correction, GraphVersion. **Every relationship carries `provenance`.** Start with SQLite or PGLite; keep a static-fixture export path so the build stays hermetic (no DB needed at build). All current pages must keep rendering identically from the exported fixtures.

### 6.4 GraphVersion + Evidence Drift (brief §11/§49) — NOT STARTED
Snapshot the graph on every material change. `/claim/$id` gets a "What changed?" section with a before/after `ChangeDiff` between versions. `/timeline` reads from versions instead of hard-coded `changeHistory` events (the time scrub UI already exists — feed it versions). Dossier §K timeline lanes read the same store.

### 6.5 Claim Inspector `/inspect` (brief §13) — NOT STARTED
Input → normalised claim matched against indexed claims by compound + outcome theme. Response assembled **only from graph entities** (sections per §13). No match → "No qualifying record is currently indexed in {BRAND}'s corpus." An LLM may draft the "Current interpretation" paragraph ONLY from the returned records and must list them under "Generated from these records." Stub link exists in nav copy; no route yet.

### 6.6 Source adapters (brief §41) — NOT STARTED
`src/adapters/{pubmed,crossref,clinicaltrials,fda}.ts` for scientific sources (real, allowed). `src/adapters/social/*` as an interface; `youtube` implemented against the official Data API behind an env key; every other platform returns `status: 'no_access'`. Each adapter exposes the §41 fields (source id, permission basis, collection window, fetchedAt, raw record hash). Only real, permitted records ever enter the corpus. Coverage page reads adapter status live.

### 6.7 Echo detection scaffold (brief §7/§40) — NOT STARTED
`OriginCluster` + `Mention.derivedFrom` model; near-duplicate suggester (MinHash / shingles); Signal Integrity fingerprint reads real dimension values only when a corpus exists. Until then it stays "Not assessed — no corpus" (current behaviour). Mentions and origin clusters must never be the same number.

### 6.8 Remaining routes and features — NOT STARTED
- `/research/$theme` (theme page listing verified PMIDs that carry it; "No themes indexed" otherwise).
- `/source/$id` (platform/source detail with permission basis and collection window).
- Share cards: OG image per claim (with QR) — generate at build; wire the dossier "Share" button (currently opens the drawer stub).
- Export research packet (citations only, no interpretation text beyond what is on the page).
- Collections / `/saved` persistence with Better Auth (currently a stub page).
- Admin / editorial console per brief §59 with full edit audit trail (every edit → changeHistory + GraphVersion).
- The 17 modals in brief §1340–1404: only Search (1), Provenance (6, as drawer) and Share (16, stub) exist; Compound/Study/Claim quick views, Citation, Why-this-classification, Echo, Signal-integrity, Translation-gap, Conflict, Data-freshness, Regulatory-jurisdiction, Compare picker, Filter drawer, Export packet are missing. All must use the layered-glass depth treatment (`.glass`, `.veil`, `data-depth-open`).
- Sitemap, JSON-LD beyond the dossier Dataset block, notifications.
- Learn: 9 of 10 lessons are "In production" (only "How internet claims mutate" is built).
- `/signal` view tabs Network / Timeline / Heatmap are inert; filters are inert (no corpus — keep them honest, but build the views so a corpus can light them).

### 6.9 Performance pass — NOT STARTED (and now more important: the hero and dossier are heavier than V2)
LCP < 2.0 s mid-tier mobile on `/`, `/compound/bpc-157`, `/claim/…`; Lighthouse CI gate ≥ 85 mobile; canvas mounts on idle (partly done via `requestIdleCallback`); per-route GSAP master timeline only; compressed geometry, instancing (residues already instanced), LOD, texture optimisation, render-resolution scaling; background-tab pause and intersection pause exist; GPU-tier detection exists. Measure first: nothing has been measured yet.

### 6.10 Accessibility pass to WCAG 2.2 AA — NOT STARTED
Keyboard navigation through the lineage graph and constellation; screen-reader descriptions of every visualization (some `aria-label`s exist; no full descriptions); no colour-only encoding (node shapes already differ; audit chips and lanes); focus states on every custom control; the mutation ladder's animated tokens need an `aria-live` plain-text equivalent.

### 6.11 Compound expansion — BLOCKED BY DESIGN
Expand beyond BPC-157 and TB-500 only after those two dossiers are exceptional (brief §65). 31 other compounds render with "No qualifying record" states — that is correct until real PMIDs are verified for them.

### 6.12 Housekeeping
- Remote exists (coreyagraphy/cyravon, private). Add collaborators there.
- Move `radialTexture` out of `HeroScene.tsx` into `src/scenes/util.ts` (ViewerScene and Constellation import it from the hero today).
- Remove the unused `public/posters/hero.svg` and `tools/gen-poster.ts` once the JPEG posters are accepted.
- Vite warns `rigs/index` is both static- and dynamic-imported (harmless; router SSR chunk ~2 MB).
- One Chrome-reported 404 on a non-home route was not chased.

## 7. Conflicts on record (flag, don't choose)

1. **Hero direction.** `cyravon-handoff-prompt.md` §3.1 = scatter→coil 60-residue helix. HANDOFF-V2 + the cinematic addendum = keep and refine the camera flight. The camera flight was kept; a 60-residue helix belongs to no indexed compound and would collide with red line 6. Corey decides.
2. **Higgsfield** was offered as optional in the addendum and not used: generated imagery cannot carry a structure-provenance label. Use it only for non-scientific brand/marketing assets, never for molecules.
3. **Handoff prompt vs brief**: the prompt says start on `0.0.0.0:8080`; the desktop launch entry uses `127.0.0.1:8082` via `scripts/dev-here.mjs` to avoid clashing with another local project on 8080. Both work.

## 8. Acceptance tests (brief §66) — current status

| # | Test | Status |
|---|---|---|
| 1 | Every scientific claim resolves to provenance | Pass for the 2 fixtures |
| 2 | Mentions and origin clusters never the same number | Both 0 — passes trivially; real logic in 6.7 |
| 3 | Every percentage shows denominator + corpus | Pass (no percentages without corpus header) |
| 4 | Every community stat has a collection window | Pass (all "none") |
| 5 | Every regulatory status shows jurisdiction + date | Pass (empty state only) |
| 6 | Every 3D structure names its provenance type | Pass |
| 7 | Every AI synthesis lists its records | Pass (structured summary lists PMIDs); Inspector in 6.5 must keep it |
| 8 | Unresolved relationships fail closed | Pass ("Source relationship unresolved") |
| 9–10 | Contradictions and null results not suppressed | Pass (42542926 partial result surfaced) |
| 11–12 | Community reports neither minimized nor converted to proof | Pass (none exist) |
| 13 | Social ingestion permission-compliant | Not testable until 6.6 |
| 14 | Site works without WebGL | Pass (`?static=1` verified: SVG structures, JPEG poster) |
| 15 | Mobile purpose-built | Partial — renders and scrolls; not performance-measured |
| 16 | Reduced motion works | Pass (verified with emulated `prefers-reduced-motion`) |
| 17 | No protocol/dosing/sourcing anywhere | Pass |
| 18 | No page claims to have searched "the whole internet" | Pass |
| 19 | Interpretations are versioned | **Fail** until 6.4 |
| 20 | First-time visitor gets research vs reports vs claims in 30 s | Believed pass (hero resolve + three worlds); not user-tested |

## 9. Commit history

```
345332c Rendered JPEG hero posters (LCP + reduced-motion), static-path polish, HANDOFF-V3, gitignore
d445b31 Hero: camera-space resolve graph, spatial headline centred, softer glow; dossier backdrop; mutation wrap; constellation glow; tooling
a181f02 Cinematic pass: quality tiers, canvas pausing, PBR chain, hero states 1-4, dossier stage, provenance depth, translation signal, lineage trace, mutation physics, timeline scrub, constellation, environment CSS
e7827b8 Centralize brand name into src/brand.ts
065e2e8 Import cyravon-app v0.1 archive (visual moats pass baseline)
```

## 10. Standing instructions for whoever takes this

- Commit in small steps with descriptive messages. Update `HANDOFF-V3.md` (or add V4) at the end of every session: built / stubbed / verified records / known issues.
- When a sequence, MW, PMID or regulatory fact cannot be verified, leave the field empty and render the honest empty state. A single fabricated data point invalidates the product.
- Look at every screenshot you generate. Blank canvases, overlapping text and unreadable contrast are defects, not "known issues".
- If a screen could have been built by a generic peptide seller, redesign it. If a 3D element only decorates, make it inform.
