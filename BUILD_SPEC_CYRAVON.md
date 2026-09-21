# CYRAVON BUILD SPEC — VISUAL MOATS PASS

Read, in order: /mnt/user-data/uploads/… is not available to you — the product brief is at /home/claude/CYRAVON_BRIEF.md (read it fully). Then read /home/claude/BUILD_SPEC.md §Geometry, §Hero, §Seven rigs, §Performance — reuse those technical specs verbatim (same chain geometry, same rigs, same LOD ladder). Ignore BUILD_SPEC.md's commerce parts (no cart, no lots, no reconstitution tool, no founding waitlist — the Cyravon brief forbids them).

Project root: /home/claude/cyravon-app. Stack: TanStack Start (file routes), React 19, TS, Tailwind v4, three ^0.186, @react-three/fiber ^9, @react-three/drei ^10, @react-three/postprocessing ^3, gsap ^3.15 + ScrollTrigger, lenis, d3-force. `npm run dev` on 0.0.0.0:8080; `npm run build` must pass clean.

## Absolute rules
1. No dosing, protocols, purchase links, vendor names, "best for", TRUE/FALSE labels, "proven/cures/heals/safe/dangerous/debunked".
2. No invented PMIDs, authors, mention counts, cluster counts, or dates. Every Study record must have a PMID that you verify at build time via `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=<PMID>&retmode=json` (write `tools/verify-pmids.ts`; the build fails if any PMID does not resolve or the title doesn't contain the expected keyword). If eutils is unreachable from this environment, set every study to `status: 'unverified'` and render "Source relationship unresolved" — never render an unverified study as a citation.
   Candidate studies to try (verify each; drop any that fail): PMID 21030672 (BPC 157 tendon healing, tendon outgrowth/cell survival/migration, J Appl Physiol 2011). Search eutils esearch `db=pubmed&term=BPC+157+tendon` and `term=thymosin+beta+4+actin+migration` for up to 5 more each and use only what resolves with real titles.
3. Community signal: we have NO platform access. Every Human Signal panel renders the corpus header — "Corpus: 0 sources · Collection window: none · Platforms: none enabled" — with the empty state "No source access for this platform" and NO fabricated numbers. The Signal Integrity fingerprint renders every dimension as "Not assessed — no corpus". The constellation renders an empty field with a legend and the copy from the brief.
4. Claim mutation: the four-step wording ladder in the brief may be shown, but every step without an indexed source carries the badge "Illustrative wording — not an indexed source". The source step links to the verified PMID only if verified.
5. Every 3D structure carries a provenance label: "Experimentally resolved (PDB xxxx)" / "Sequence-derived visualization (procedural, not measured)" / "Conceptual visualization". Never say "predicted model" — we have none.
6. Content never depends on WebGL: every visual has an SSR text/table equivalent.

## Data (src/data)
compounds.ts — same schema as BUILD_SPEC.md but drop `purchasable`; keep all sequences/mods/pdbIds exactly as listed there (GLP3 display name for retatrutide; no dihexa). Add `domain` per the seven research domains and `aliases[]`.
claims.ts — fixture: `CLAIM-BPC157-TENDON-REPAIR` {title: "BPC-157 supports tendon repair", status: 'tracked', compound: 'bpc-157', originStudy: <verified PMID or null>, originalScope: {species: 'rat' | null, model, endpoint, wording: exact abstract phrase copied from the verified record's title/abstract or null}, mutation: [4 steps, badges per rule 4], translation: {tendon: ['cell','rat'] ONLY if the verified study supports it, else []}, contradictions: [] with empty state "No contradictory study currently indexed", changeHistory: [{date: today, change: 'Claim record created', before: null, after: 'tracked'}]}.
Second fixture for TB-500: `CLAIM-TB4-CELL-MIGRATION` same shape.
studies.ts — only verified records: {pmid, title, year, journal, species: null unless in title, studyType: null unless obvious, verifiedAt}.
domains.ts — the seven domains with motion grammar and palette.

## Routes (src/routes)
- `/` Home per brief §17: HERO (dark obsidian, one molecule — BPC-157 chain — floating in true depth, pointer parallax, scroll moves camera THROUGH the structure across a 250vh pinned section; headline "Trace the signal." / "Follow the evidence."; CTAs "Explore the Atlas" → /explore, "Inspect a Claim" → /claim/CLAIM-BPC157-TENDON-REPAIR; small line from brief). SECTION 2 three-worlds panels with animated hover lines between them (SVG). SECTION 3 featured claim trace: Paper → interpretation → social discussion → community signal, animated as a horizontal lineage with nodes lighting in sequence on scroll (badges per rule 4). SECTION 4 compound cards (DomainRig lod 2, real sequence, no two alike — same variation rules as BUILD_SPEC) showing name, evidence distribution (from verified studies only; "No qualifying record is currently indexed in Cyravon's corpus" when none), latest change. SECTION 5 Live Research Pulse: honest counters computed from the data files with timestamps. SECTION 6 the "Why Cyravon exists" quote.
- `/explore` grid of all compounds with filters (domain, evidence type present, structure provenance), sort (alphabetical, most researched by verified-study count, recently changed). Grid + dense table views.
- `/compound/$slug` Dossier: A immersive header (identity, aliases, sequence mono, MW if present, classification/domain, structure provenance label) + interactive ChainRenderer (scroll-tied assemble/hold, orbit on drag, 3D controls: rotate/reset/labels/reduced effects/provenance). B snapshot cards. C EvidenceGenome (radial/matrix of the 15 evidence dimensions — counts from verified studies, zero states rendered as hollow). D research themes (fixture themes from brief §46 for bpc-157/tb-500; for others "No themes indexed"). E Human Signal (rule 3). F Signal↔Science lanes (research lane lists verified themes; signal lane empty; relationship: "insufficient mapping"). G claim lineage (links to claim pages). H TranslationTrack (Cell → Mouse → Rat → Larger Animal → Human → Controlled Human → Approved Use, per outcome; lit stages only where supported). I Research Independence (authors/institutions from esummary if available; else "Not assessed"). J contradictions empty state. K timeline lanes. L sources.
- `/claim/$id` per brief §20, all sections; Claim Lineage as a force-directed graph (d3-force, nodes typed ResearchNode/CommunityNode/ClaimNode/ContradictionNode, LineageEdge) and Claim Mutation as an animated before/after wording ladder (GSAP text morph or crossfade) with badges.
- `/signal` constellation: R3F point field, empty per rule 3, filters UI present, corpus header mandatory.
- `/compare` up to 4 compounds, descriptive rows, no winner. Default bpc-157 vs tb-500 (residue diff too, reuse from BUILD_SPEC /lab).
- `/timeline` four lanes with the change-history events from claims.ts.
- `/learn` lesson index with the 10 lesson titles; first lesson "How internet claims mutate" interactive (the mutation ladder as a scrubbable scene). Others "In production".
- `/methodology`, `/coverage` (every platform: "No source access enabled"), `/corrections` (empty ledger), `/status/$compound` (jurisdiction/date fields; empty state "No regulatory record indexed").
- 404 per brief §57 with a floating disconnected fragment.
- Global search modal (Cmd/Ctrl+K) over compounds, aliases, claims, studies.
- Footer with the persistent line from §58.

## Visual system
Obsidian #0A0B0E base, graphite #16181D, warm off-white #F2EEE6 text; accents spectral cyan #5FE3FF, electric violet #8A63FF, cobalt #2247D6, signal amber #E5A03A (semantic only: amber = change/attention). Display type: large editorial (use @fontsource-variable/instrument-serif or similar for headlines? NO — brief says editorial display; use a high-contrast grotesk like @fontsource-variable/manrope at 800 for display, Inter for UI, JetBrains Mono for sequences/IDs). Extreme hierarchy, big negative space. Motion: slow, weighted, purposeful; no bouncing, no particle storms. Film grain subtle. Domain rigs and palettes from BUILD_SPEC.md still apply to cards/dossier headers (they are the "seven worlds" of the atlas).

## Components (src/components)
EvidenceChip, SpeciesBadge, SourceBadge, ClaimNode, ResearchNode, CommunityNode, RegulatoryNode, ContradictionNode, LineageEdge, SignalFingerprint, EvidenceGenome, TranslationTrack, SourceCard, StudyCard, ClaimCard, ChangeDiff, StructureViewer (wraps ChainRenderer + controls + provenance), TimelineLane, ProvenanceDrawer, CorpusHeader, EmptyState, SearchModal.

## Process
1. Scaffold, install, build data + geometry + ChainRenderer + hero first (this is the visual moat — get it beautiful before pages).
2. Pages in this order: home, compound/bpc-157, claim, explore, compare, signal, the rest.
3. `npm run build` clean. Run dev, Playwright-screenshot `/`, `/` scrolled to 50% and 100% of hero, `/compound/bpc-157`, `/compound/ghk-cu`, `/compound/pt-141`, `/claim/CLAIM-BPC157-TENDON-REPAIR`, `/explore`, `/signal`, `/compare` at 1440x900 and 390x844 → /home/claude/shots/. LOOK at every screenshot with Read; fix blank canvases, overlapping text, unreadable contrast; iterate until each screenshot is something you'd put in a portfolio.
4. Write /home/claude/cyravon-app/HANDOFF-V2.md: built / stubbed / verified PMIDs (list) / how the Helixa pieces map / known issues.
5. Final report ≤ 400 words: routes, verified PMIDs, screenshot paths, build summary, unresolved issues.
