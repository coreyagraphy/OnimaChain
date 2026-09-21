# HANDOFF PROMPT — CYRAVON BUILD-OUT (placeholder brand)

You are taking over **Cyravon** — a research-first molecular evidence & signal atlas for peptides. It is a working TanStack Start app with the visual moats already built. **Do not scaffold a new app. Do not redesign what exists.** Unpack `cyravon-app-v0.1.tar.gz`, then read in this order: `HANDOFF-V2.md` (what's built/stubbed), `CYRAVON_BRIEF.md` (the product brief — the source of truth), `BUILD_SPEC_CYRAVON.md` (technical spec the current build follows). Then iterate in place.

Start: `npm install && npm run dev` → `0.0.0.0:8080`. `npm run build` runs `verify-pmids → tsc --noEmit → vite build` and must stay green.

**Brand:** "Cyravon" is a placeholder (the name is taken). Do not spread it further — before adding any new brand-name occurrences, centralize the existing 24 into `src/brand.ts` (`export const BRAND = 'Cyravon'`) and import it. Final rename is then one line.

---

## 1. RED LINES — NON-NEGOTIABLE

- No dosing, protocols, reconstitution/syringe calculators, stacks, purchase links, vendor names, affiliate rankings, "best for X".
- No TRUE/FALSE labels on claims. No "proven / cures / heals / safe / dangerous / debunked / miracle" unless quoting a sourced text.
- **No invented PMIDs, DOIs, authors, institutions, mention counts, cluster counts, dates, or regulatory events.** Every `Study` must resolve via NCBI eutils at build time (`tools/verify-pmids.ts` already enforces this — extend it, never bypass it). If a record can't be verified, render "Source relationship unresolved."
- Community/Human Signal: we have **no platform access**. Every signal panel shows the corpus header (`Corpus: 0 sources · Collection window: none · Platforms: none enabled`) and the empty state. Do not seed fake reports. When a source adapter is built, only real, permitted records enter.
- Claim-mutation wording without an indexed source carries the badge **"Illustrative wording — not an indexed source."**
- Every 3D structure carries its provenance label. We render **sequence-derived (procedural, not measured)** structures; PDB IDs are shown as "deposited, not rendered" until a real PDB-backed renderer exists. Never call anything a "predicted model."
- Content never depends on WebGL. Every visual keeps its SSR table/SVG equivalent. `prefers-reduced-motion` keeps full functionality.
- Retatrutide displays as **GLP3**; dossier states the actual compound. There is no Dihexa.
- Never silently rewrite history: every material change to a claim goes into `changeHistory` with before/after.

---

## 2. WHAT EXISTS (do not rebuild)

Routes: `/`, `/explore`, `/compound/$slug` (sections A–L), `/claim/$id` (all 11 sections; d3-force lineage graph; GSAP mutation ladder), `/claims`, `/signal`, `/compare`, `/timeline`, `/learn` (+ "How internet claims mutate"), `/methodology`, `/coverage`, `/corrections`, `/status/$compound`, `/saved`, about/contact/privacy/terms, 404, ⌘K search.

Visual system: `src/scenes/chain/{geometry,ChainRenderer,hotspots}` (sequence-driven backbone with proline kinks, Cu site, lactam bridges, D-residue rings, acyl tethers, N→C assembly on scroll), `src/scenes/hero/ScatterCoil.tsx`, seven domain rigs in `src/scenes/rigs/`, postprocessing, Lenis + GSAP ScrollTrigger, LOD ladder with SVG fallback.

Data: `src/data/{compounds,claims,studies,domains}.ts`. 9 verified PMIDs (5 BPC-157, 4 TB-500/Tβ4). Two fixture claims: `CLAIM-BPC157-TENDON-REPAIR`, `CLAIM-TB4-CELL-MIGRATION`.

Stubbed "in production": Claim Inspector, `/study/[id]`, `/source/[id]`, `/research/[theme]`, share cards, export packet, collections, admin console, notifications.

---

## 3. PRIORITY ORDER FOR THIS PASS

Work top-down. Each item ends with `npm run build` green and Playwright screenshots you have looked at (chromium at `/opt/pw-browsers`, do not `playwright install`).

1. **Hero upgrade.** Replace the 15-residue BPC-157 hero with the scatter→coil spectacle: ~400 instanced residues assembling into a ~60-residue alpha helix across the 250vh pinned section; camera dollies along the axis; three parallax planes (far dust / chain / near haze); pointer parallax ±2°. Poster-first LCP stays. Reduced-motion: static SVG of the same helix.
2. **`/study/$pmid`** — full study detail per brief §25 from eutils esummary + efetch abstract (species/sample size only if explicitly in the record; otherwise "Not stated in indexed record"). "Open original source" → PubMed.
3. **Data model → real schema.** Move `src/data/*.ts` into a typed store per brief §39 (Compound, Structure, Alias, Claim, ClaimVersion, Study, Species, Endpoint, Source, CommunityReport, OriginCluster, Mention, ClaimRelationship, EvidenceRelationship, Contradiction, Correction, GraphVersion). Every relationship carries `provenance`. Start with SQLite/PGLite; keep the static-fixture export path so the build stays hermetic.
4. **GraphVersion + Evidence Drift.** Snapshot the graph on every material change; `/claim/$id` gets "What changed?" with a before/after `ChangeDiff`; `/timeline` reads from versions, not hard-coded events.
5. **Claim Inspector (`/inspect`).** Input → normalized claim matched against indexed claims by compound + outcome theme. Response is assembled from graph entities only (sections per brief §13). If no indexed claim matches: "No qualifying record is currently indexed in Cyravon's corpus." An LLM may draft the "Current interpretation" paragraph ONLY from the returned records and must list them under "Generated from these records."
6. **Source adapters (interface first).** `src/adapters/{pubmed,crossref,clinicaltrials,fda}.ts` for scientific sources (real, allowed); `src/adapters/social/*` as an interface with `youtube` implemented against the official API behind an env key, everything else `status: 'no_access'`. Every adapter exposes the fields in brief §41.
7. **Echo detection scaffold.** `OriginCluster` + `Mention.derivedFrom` model, near-duplicate suggester (MinHash/shingles), and the Signal Integrity fingerprint reading real dimension values only when a corpus exists. Until then it stays "Not assessed — no corpus."
8. **`/research/$theme`**, `/source/$id`, share cards (OG image per claim with QR), export research packet (citations only), collections (Better Auth), admin console per brief §59 with full edit audit trail.
9. **Performance pass.** LCP < 2.0 s mid-tier mobile on `/`, `/compound/bpc-157`, `/claim/…`; Lighthouse CI gate ≥ 85 mobile; canvas mounts on idle; per-route GSAP master timeline only.
10. **Accessibility pass** to WCAG 2.2 AA: keyboard nav through graphs, screen-reader descriptions of every visualization, no colour-only encoding, focus states.

Expand compounds only after BPC-157 and TB-500 are exceptional (brief §65).

---

## 4. ACCEPTANCE TESTS (brief §66 — all must pass before you call a phase done)

1. Every scientific claim resolves to provenance. 2. Mentions and origin clusters are never the same number. 3. Every percentage shows denominator + corpus. 4. Every community stat has a collection window. 5. Every regulatory status shows jurisdiction + date. 6. Every 3D structure names its provenance type. 7. Every AI synthesis lists its records. 8. Unresolved relationships fail closed. 9–10. Contradictions and null results are not suppressed. 11–12. Community reports are neither minimized nor converted to proof. 13. Social ingestion is permission-compliant. 14. Site works without WebGL. 15. Mobile is purpose-built. 16. Reduced-motion works. 17. No protocol/dosing/sourcing anywhere. 18. No page claims to have searched "the whole internet." 19. Interpretations are versioned. 20. A first-time visitor gets research vs reports vs claims in 30 s.

Design bar (brief §67): if a screen could have been built by a generic peptide seller, redesign it. If a 3D element only decorates, make it inform.

---

## 5. STANDING INSTRUCTIONS

- When this prompt conflicts with `CYRAVON_BRIEF.md`, the brief wins; when it conflicts with `HANDOFF-V2.md`, flag it rather than choosing silently.
- When a sequence, MW, PMID, or regulatory fact cannot be verified, leave the field empty and render the honest empty state. A single fabricated data point invalidates the product.
- Commit in small steps with descriptive messages. Update `HANDOFF-V2.md` at the end of every session: built / stubbed / verified records / known issues.
- Do not hand any of this to "a developer." Corey builds solo; write everything so he can run it.
