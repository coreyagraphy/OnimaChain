# CYRAVON — HANDOFF V2 (visual moats pass)

Project root: `/home/claude/cyravon-app` · `npm run dev` (0.0.0.0:8080) · `npm run build` = `verify-pmids → tsc --noEmit → vite build` (passes clean, 2026-09-21).

## Built

**Data (`src/data`)** — `compounds.ts` (Helixa schema minus `purchasable`, plus `aliases[]`, 33 compounds, GLP3 display for retatrutide, no dihexa) · `domains.ts` (seven research domains, rig + restrained cyan/cobalt/violet palettes; amber is never a domain colour) · `studies.ts` (9 candidate PMIDs; resolved metadata comes ONLY from `verified.json`) · `verified.json` (written by `tools/verify-pmids.ts` at build) · `claims.ts` (two fixtures, mutation ladders with the illustrative badge, SUPPORTS / PARTIALLY_SUPPORTS / DOES_NOT_TEST links with verbatim abstract bases, change history dated 2026-09-20) · `evidence.ts` (Evidence Genome 15 dims, themes, translation, distributions, research pulse — all computed from verified records) · `signal.ts` (corpus header, 12 fingerprint dimensions, platform registry, all empty) · `lessons.ts`.

**Verification** — `tools/verify-pmids.ts`: esummary per PMID; title must contain `expectKeyword`; mismatch/no-resolve → exit 1 (build fails); eutils unreachable → `reachable:false` and every study renders "Source relationship unresolved".

**Visual system** — `src/styles/app.css`: obsidian/graphite/bone tokens, Manrope 800 display, Inter UI, JetBrains Mono for sequences/IDs; chips, panels, tables, grain.

**Scenes** — `chain/geometry.ts` + `hotspots.ts` (verbatim from Helixa: helix params, proline kink, glycine wobble, lactam ring, Cu site, mods) · `chain/ChainRenderer.tsx` (Helixa renderer + MeshPhysical materials, `labels`, `reducedEffects`, `markers`, `tilt`) · `chain/ViewerScene.tsx` (dossier: assemble on mount, loosen as header scrolls away, orbit on drag, Lightformer env, post) · `hero/HeroScene.tsx` (BPC-157 chain, Catmull-Rom camera + look paths flying through the PPP hinge across a 250vh pinned section, pointer parallax ±2°, three dust/haze depth layers, DOF tracking the look target, bloom/grain/vignette, portrait re-framing) · `rigs/*` (seven Helixa rigs, retinted) · `signal/Constellation.tsx` (empty field, zero-length report buffer) · `Canvas.tsx` (shared View canvas for cards + dedicated Lod0Canvas for hero/viewer/constellation).

**Components** — EvidenceChip, SpeciesBadge, SourceBadge (+ `provenanceText`/ProvenanceLabel), nodes.tsx (ResearchNode/ClaimNode/CommunityNode/RegulatoryNode/ContradictionNode/LineageEdge/NodeCard — distinct shapes AND colours), SignalFingerprint, EvidenceGenome, TranslationTrack, SourceCard, StudyCard, ClaimCard, ChangeDiff, StructureViewer (rotate/reset/labels/reduced effects/provenance), TimelineLane, ProvenanceDrawer, CorpusHeader, EmptyState, SearchModal (⌘/Ctrl-K over compounds, aliases, claims, studies), LineageGraph (d3-force, desktop graph + inspector, mobile node cards), MutationLadder (scrubbable, GSAP stagger, word-level diff), CompoundCard, SequenceSVG, ResidueTable, Hero, Nav, Footer, NotFoundFragment.

**Routes** — `/` (hero, three worlds with hover lines, featured trace lit on scroll, compound rail, research pulse, why) · `/explore` (filters: domain / evidence type present / structure provenance; sort alpha / verified count / recently changed; grid + table) · `/compound/$slug` (A–L) · `/claim/$id` (all 11 sections) · `/claims` · `/signal` · `/compare` (up to 4, residue diff, default bpc-157 vs tb-500) · `/timeline` · `/learn` + `/learn/how-internet-claims-mutate` (interactive) · `/methodology` · `/coverage` · `/corrections` · `/status/$compound` · `/saved` · about/contact/privacy/terms stubs · 404 with floating fragment.

## Verified PMIDs (build 2026-09-21, NCBI eutils esummary)
21030672 · 42542926 · 41754849 · 40789979 · 40756949 (BPC-157) · 34170491 · 32245208 · 36706591 · 41235866 (TB-500 / thymosin β4). 42542926 is shared. Abstract quotes in `studies.ts` were copied verbatim from PubMed efetch output during the build session.

## Stubbed / in production
Claim Inspector (`/inspect`), `/research/[theme]`, `/study/[id]`, `/source/[id]`, share cards, research-packet export, collections, editorial console, admin, JSON-LD beyond the dossier Dataset block, sitemap. Signal filters are inert (no corpus). Institutions/funding/citations = "Not assessed".

## How the Helixa pieces map
geometry.ts/hotspots.ts → copied (colours retuned) · ChainRenderer → extended · ScatterCoil hero → replaced by HeroScene (assembled chain, camera flight) · TruthCamera/TRUTH tab → ViewerScene + StructureViewer (dossier §A) · CompoundCard/rigs → reused (LOD 2, same variation rules) · SequenceSVG/ResidueTable → reused (SSR equivalents) · /lab residue diff → /compare · Canvas.tsx, lenis, timeline, useReducedMotion → reused. Removed: lots, cart, reconstitution, founding, PurityBar, Chromatogram.

## Decisions recorded
- Species for a study is read from the TITLE only (`speciesFromTitle`); the claim's originalScope species 'rat' is flagged as abstract-derived in the UI.
- Study `tags` and relationships are editorial assignments from abstracts; the methodology page says so.
- Structure provenance: the renderer never loads PDB coordinates, so compounds with PDB IDs read "Sequence-derived visualization … · Experimentally resolved (PDB …) — deposited, not rendered here". Compounds without a sequence read "Conceptual visualization".
- 42542926 ("numerically lower … without reaching statistical significance") is PARTIALLY_SUPPORTS, surfaced under Research support and in §J, not as a contradiction.
- Residue class "positive" uses pale gold #E8C89A (not the semantic amber). Cu ion stays copper-coloured because it is copper.

## Known issues
- Hydration mismatch warnings fixed by rounding SVG coordinates; re-verify after any new SVG math.
- Vite warns rigs/index is both static- and dynamic-imported by CompoundCard (harmless; router chunk ~2 MB SSR).
- Hero DOF/bloom runs only when `usePostAllowed` (desktop, no reduced motion); mobile gets the same scene without post.
- Playwright shots use SwiftShader; real GPUs will look slightly crisper.
