# HELIXA BUILD SPEC (for the build agent)

Read /home/claude/helixa-experience-architecture.md fully first. It is the architecture. This file is the concrete scope for this pass.

## Hard rules (compliance — never violate)
- Research-use-only framing. No human-use language, no dosing, no benefits, no results, no testimonials. Calculators are concentration/volume only.
- No invented PubMed IDs, COA data, lot numbers, purity values or lab names. Lot pages render honest empty states. PMID arrays may be EMPTY; never fabricate.
- No vial photography. The molecule is the identity.
- Retatrutide is displayed as **GLP3**; its Evidence tab states "Compound: retatrutide" and it has `purchasable: false`. Dihexa does not exist.
- Sequences: use only the ones listed below. If a compound's sequence isn't listed, set `sequence: null` and render the "sequence pending verification" state.

## Stack
TanStack Start (latest stable, file routes in `src/routes`), React 19, TypeScript, Tailwind v4, three ^0.186, @react-three/fiber ^9, @react-three/drei ^10, @react-three/postprocessing ^3, gsap ^3.15 (ScrollTrigger), lenis ^1.3, zustand. Vite. `npm run dev` on 0.0.0.0:8080. `npm run build` must pass. No Better Auth / DB in this pass — data is static JSON in `src/data`.
Project root: /home/claude/helixa-app

## Folder layout (match the architecture doc §4)
```
src/routes/                 __root.tsx, index.tsx, atlas.tsx, atlas.$domain.tsx, c.$slug.tsx, lots.tsx, lot.$id.tsx, lab.tsx, tools.reconstitution.tsx, founding.tsx, learn.tsx
src/scenes/Canvas.tsx       one persistent R3F canvas using drei <View> per section (fall back to per-section canvas if View misbehaves — document which)
src/scenes/rigs/{dock,pulse,branch,bloom,propagate,reknit,sweep}.tsx + index.ts (DomainRig dispatcher, contract: {domain, sequence, lod, intensity})
src/scenes/chain/ChainRenderer.tsx, geometry.ts, hotspots.ts
src/scenes/hero/ScatterCoil.tsx
src/scenes/post/Effects.tsx
src/motion/timeline.ts, lenis.ts, useReducedMotion.ts
src/data/domains.ts, compounds.ts, lots.ts (empty array), lessons.ts
src/components/ CompoundCard, PurityBar, Chromatogram (SVG, accepts x/y arrays, renders empty state), Tabs, Nav, Footer, ResidueTable, SequenceSVG (static fallback)
public/posters/hero.svg     generated static poster (SVG helix) used as LCP element
```

## Geometry (src/scenes/chain/geometry.ts) — procedural, sequence-driven
Build backbone Cα positions procedurally from the residue list, NOT random:
- Default: alpha-helix parameters (rise 1.5 Å, 100° per residue, radius 2.3 Å), scaled to scene units.
- Proline (P): add a 30–40° kink to the helix axis at that residue and break the H-bond visual (no ribbon between i and i-4).
- Glycine (G): increase flexibility — small random-seeded wobble (seeded by slug so it's deterministic).
- `cyclic: {from, to, type:'lactam'}` → draw a bridge tube between the two residues and bend the chain so ends meet (PT-141, Melanotan II).
- `metal: {residues:[1,2,3], element:'Cu'}` → warm metallic sphere at centroid of listed residues with 3 glowing coordination bonds (GHK-Cu).
- `mods`: `{pos, kind:'acyl'|'acetyl'|'amide'|'Aib'|'D'|'Nle'|'Dmt'|'Nal'|'PEG'}` → acyl: long thin tether curve trailing off the residue; Aib: dual small spheres; D-residues: mirrored badge (a small ring); acetyl/amide: terminal caps.
- Side chains: one instanced sphere per residue, radius by residue class (small/medium/large), colour by class: hydrophobic (warm grey), polar (cool white), positive (amber), negative (cyan), special G/P (violet). Domain palette tints the backbone tube.
- Output: `{ ca: Float32Array, residues: ResidueMeta[], bridges: [], hotspots: Hotspot[] }`.
ChainRenderer: tube backbone (TubeGeometry along CatmullRom of Cα), instanced side-chain spheres, hotspot markers, `progress` uniform 0→1 that reveals residues N→C (residues beyond progress are scattered to their seeded scatter position and lerp in). This is the scatter→assemble mechanic used by the hero AND the TRUTH tab.

## Hero (index.tsx)
- Static poster `<img>` first (public/posters/hero.svg), then the canvas fades in beneath; poster fades out after first frame.
- ScatterCoil: ~400 instanced residues that assemble into a ~60-residue alpha helix across a 200vh pinned section (GSAP ScrollTrigger scrub, Lenis). Camera dollies along the helix axis. Three parallax planes: far particle dust, the chain, near haze sprites; pointer parallax ±2°.
- Postprocessing: Bloom (low), DepthOfField, Noise (film grain), Vignette. Disable post on mobile / low-power / reduced-motion.
- Palette: graphite black #0B0D10 base, cool ambient #7FB7C9, one warm practical #E0863A (copper). Type: display serif-free — use a geometric sans (Inter/Geist via @fontsource) with wide tracking caps for labels.
- Below hero: seven domain rails. Each rail: domain name, one line of motion-grammar description, horizontal row of CompoundCards.

## CompoundCard
- Uses `<DomainRig lod={2}>` at the card's real sequence. Three data-driven variations: geometry (real residue count/kinks), accent colour from dominant residue class, tempo scaled by chain length. Layout alternates portrait/wide/square by index. Hover: tilt + intensity up. No two cards identical.
- Reduced motion: renders `<SequenceSVG>` (static 2D helix from the same geometry) instead of the canvas.

## Seven rigs (src/scenes/rigs)
Implement each as a small R3F component with a shader or instanced effect, shared contract. Keep each < 200 lines. Minimum viable versions are fine but they must be visually distinct:
- dock: ligand sphere approaches a receptor ring, on contact emits an expanding ring (shader uPulse)
- pulse: emissive intensity on night-weighted 24h sine using real clock; particle bursts on peaks
- branch: growing line network (Line2 or LineSegments with a growth uniform)
- bloom: radial diffusion field from a warm point (simple shader on a plane)
- propagate: signal packet hopping nodes of a sparse graph, edges flash
- reknit: assembly progress played in reverse loop with slow rotation
- sweep: cone/spotlight sweep across points, locks on one, flags it

## Compound page (c.$slug.tsx)
Three tabs: TRUTH (ChainRenderer, scroll-tied assemble/hold/disassemble over a 300vh section + ResidueTable), CHARACTER (video slot: poster + `<video muted playsinline loop>` with `film` src if present, else an "In production" state with the archetype line), EVIDENCE (sequence, MW if given, CAS if given, structure source label "Experimental structure (PDB xxxx)" / "Computed conformer (procedural, not measured)" / "Sequence pending verification", storage/reconstitution guidance generic to lyophilized peptides, PMIDs list rendered only if non-empty else "No published literature on file", PurityBar for current lot (empty state), lot selector (empty), quantity/vial size selector, "Add to cart" disabled with "Lot #001 opens December" if not purchasable or no lots).
Static HTML fallback of TRUTH/EVIDENCE content must be in the SSR output.

## Atlas (atlas.tsx)
Force-directed graph (d3-force in a worker or simple custom sim) of compounds; edges = shared mechanism tags; nodes coloured by domain; click → navigates to /c/slug with a camera-travel animation (R3F). 2D-in-3D is fine (nodes on a plane with depth jitter).

## Lots
/lots: table with filters (compound, lab, date), empty state "No lots have shipped yet. Lot #001 opens December 2026." Includes schema.org/Dataset JSON-LD. /lot/$id: layout with Chromatogram element (empty), PurityBar (empty), "Verify at lab →" (hidden if no labVerifyUrl). /lots.json route returns [].

## Lab
/lab: two selects, residue-by-residue side-by-side with diff highlighting; default comparison thymosin-alpha-1 vs tb-500; text: "No shared subsequence" computed, not hard-coded.

## Reconstitution tool
Inputs: mg lyophilized, mL diluent → mg/mL, µg per 0.01 mL (U-100 syringe unit), molar concentration if MW present. No other fields. Label: "Concentration and volume only."

## Founding
Waitlist form (email only; posts to a stub server function that logs). Copy: Lot #001 access — founding cohort receives the first lot at cost with the complete COA package, numbered.

## Data — src/data/compounds.ts
Fields: slug, name, displayName?, domain, tags[], sequence (one-letter string or null), mods[], cyclic?, metal?, mw?, cas?, structureSource: 'pdb'|'computed'|'pending', pdbIds[], pmids: [] (EMPTY — leave empty), archetype, purchasable.
Use exactly these sequences (verified in research); anything not listed → null:
- bpc-157 GEPPPGKPADDAGLV (computed)
- tb-500 SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES (computed; name "TB-500 (Thymosin β4)")
- ghk-cu GHK, metal Cu on residues 1-3 (computed)
- pt-141 sequence "XDHFRWK" with mods: pos1 Nle, pos1 acetyl, pos4 D, pos7 amide; cyclic {from:2,to:7,type:'lactam'} (computed)
- melanotan-ii same backbone as pt-141 (computed)
- ipamorelin "AHFFK" mods: pos1 Aib, pos3 Nal+D, pos4 D, pos5 amide (computed)
- cjc-1295 YADAIFTNSYRKVLGQLSARKLLQDILSR mods: pos2 D, pos29 amide (computed)
- sermorelin YADAIFTNSYRKVLGQLSARKLLQDIMSR mods pos29 amide (computed)
- tesamorelin: sequence null (pending) — 44-mer with hexenoyl N-term; render pending state
- semax MEHFPGP (computed)
- selank TKPRPGP (computed)
- epitalon AEDG (computed)
- mots-c MRWQEMGYIFYPRKLR (computed)
- ss-31 "RXKF" mods pos1 D, pos2 Dmt, pos4 amide; name "SS-31 (Elamipretide)" (computed)
- thymosin-alpha-1 SDAAVDTSSEITTKDLKEKKEVVEEAEN mods pos1 acetyl; pdb ['2L9I','2MNQ']
- thymalin: null (pending)
- thymogen: null (pending)
- ll-37 LLGDFFRKSKEKIGKEFKRIVQRIKDFLRNLVPRTES pdb ['2K6O','5NNM','7PDC']
- kpv KPV (computed)
- humanin MAPRGFSCLLLLTSEIDLPVKRRA pdb ['1Y32','2GD3']
- aod-9604 YLRIVQCRSVEGSCGF (computed; note C-terminal Cys-Cys per literature — do not add a disulfide unless flagged pending)
- semaglutide: sequence null (pending — 31-mer with Aib8 and C18 diacid on Lys26; do not guess letters) pdb ['4ZGM','7KI0']; structureSource 'pdb'
- tirzepatide: null (pending) pdb ['7FIM','7RGP','7FIY']
- retatrutide: displayName 'GLP3', null (pending) pdb ['8YW5'], purchasable false
- igf-1-lr3, cerebrolysin, p21, pinealon, nad-plus, hexarelin, ghrp-2, ghrp-6, glutathione: sequence null (pending). NAD+ and glutathione: note "non-peptide / tripeptide" honestly (glutathione is γ-Glu-Cys-Gly — you may set sequence "ECG" with mod pos1 'gamma').
For 'pending' compounds ChainRenderer renders a placeholder: a faint dashed helix of unknown length with "Sequence pending verification".
Domains + archetypes: copy from the architecture doc / handoff.

## Performance
- Poster LCP; canvas mounted in useEffect after idle (requestIdleCallback with 1.5s timeout).
- `prefers-reduced-motion`, `navigator.connection.saveData`, or `deviceMemory < 4` → no canvas, static SVG everywhere.
- Lazy-load ChainRenderer/rigs with React.lazy below the fold.

## Process
1. Scaffold with `npm create @tanstack/start@latest` or the official template (non-interactive) — if the scaffolder requires interaction, hand-write the minimal TanStack Start config from the docs.
2. Install deps. Build the data + geometry first, then ChainRenderer, then hero, then cards/rigs, then pages.
3. `npm run build` must pass with zero TypeScript errors. Then run `npm run dev` in background and use Playwright (chromium at /opt/pw-browsers, executablePath '/opt/pw-browsers/chromium' if needed) to screenshot `/`, `/c/bpc-157` (each tab), `/c/ghk-cu`, `/c/pt-141`, `/atlas`, `/lots`, `/lab` at 1440x900 and 390x844 into /home/claude/shots/. Look at the screenshots (Read tool) and fix anything blank or broken. Iterate until every screenshot shows the intended visual.
4. Write /home/claude/helixa-app/HANDOFF-V2.md: what's built, what's stubbed, how to merge into the existing repo (file-by-file), known issues.
5. Final report: list of routes built, screenshot paths, build output summary, unresolved issues. Keep it under 500 words.
