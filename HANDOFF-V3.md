# CYRAVON — HANDOFF V3 (cinematic UI / realism lock pass, 2026-09-20)

Project root: `C:\Users\corey\Projects\cyravon\cyravon-app` (git initialised this session; no remote). Dev: `npm run dev` (0.0.0.0:8080) or `node scripts/dev-here.mjs 8082` (used by the desktop launch entry `cyravon-dev`). `npm run build` = `verify-pmids → tsc --noEmit → vite build` — **passes clean 2026-09-20** (9/9 PMIDs resolved via NCBI eutils).

HANDOFF-V2.md stays valid for data, routes, verification and the Helixa mapping. This file records only what changed.

## Brand
`src/brand.ts` exports `BRAND = 'Cyravon'`. All 24 rendered occurrences now import it (routes, Nav, Footer, EmptyState, claims fixture line). Final rename = one line. Do not add new literal brand strings.

## Built this pass (cinematic addendum)

**Quality tiers** — `src/motion/useReducedMotion.ts` now picks `low | mid | high` from GPU renderer string (WEBGL_debug_renderer_info), cores, memory, mobile. `useQuality()` gives dpr clamp, particle multiplier, DOF/SMAA/haze/contact-shadow allowances. `?quality=low|mid|high` forces a tier; `?static=1` forces the static path. Background tabs pause every canvas (`visibilitychange`); `Lod0Canvas` also pauses when scrolled off-screen (IntersectionObserver). Fidelity degrades before information ever does.

**Chain materials** (`scenes/chain/ChainRenderer.tsx`) — MeshPhysical with clearcoat 1, sheen, specular, envMapIntensity; new `highlight` ref (a Gaussian window of residues, or explicit indices, lifted toward the tint — glow with hierarchy, never every atom) and `dim` ref (provenance open dims the molecule).

**Hero** (`scenes/hero/HeroScene.tsx`, `components/Hero.tsx`) — the camera-flight direction from V2 is kept and refined:
- STATE 1: `toneMappingExposure` rises 0.05→1 over ~2.8 s + a DOM veil; the molecule emerges from near-black over a radial-gradient backdrop plane (never flat #000) with far/mid dust and near haze.
- STATE 2: damped scroll progress (never velocity), pointer parallax ±2° + key light slides with the pointer; a signal light and residue highlight window travel N→C with the camera.
- STATE 3: "TRACE THE SIGNAL" is a canvas-texture plane deep in the scene (z −6.2); residues pass in front of and behind it. Portrait scales it 0.62.
- STATE 4: on exit the chain's C-terminus (tracked through the renderer's transforms) links to research → claim → signal nodes laid out in camera space (sphere / octahedron / hollow ring, same shape grammar as the lineage graph) with labels. This is the product formula, not decoration.
- Post: DOF (target = look point) + restrained bloom (threshold 0.62) + grain + vignette + SMAA on high tier. Mobile: same scene, no post, fewer particles.
- Poster: `public/posters/hero.jpg` + `hero-portrait.jpg` are **rendered from the real scene** by `tools/poster.mjs` (LCP image and the reduced-motion fallback). `hero.svg` kept but unused.

**Dossier stage** (`scenes/chain/ViewerScene.tsx`, `components/StructureViewer.tsx`) — exposure rise + N→C illumination wave during assembly; scroll-away loosens, tilts and pushes the chain deeper; drag orbit has inertia; ContactShadows (mid/high tiers); backdrop gradient + dust; Labels toggle lights the hotspot residues; Provenance panel is glass and dims the molecule (damped), closing restores it. 3D controls hide on the static SVG path.

**Provenance drawer** — `body[data-depth-open]` pushes `main` back (scale .985, brightness .62) while the glass drawer comes forward: interpretation on top, evidence underneath.

**Translation Track** — a signal physically travels stage to stage when the row enters view and stops at the last indexed stage ("signal stops" chip). Reduced motion: lit states set instantly.

**Claim lineage** — on entering view: research nodes activate → resolved edges draw (pathLength) → claim resolves → unresolved/no-access edges and community nodes fade in. Hover isolates a node's relationships; SVG glow filter on active; "Replay trace" button.

**Mutation ladder** — physical diff: broadened/amplified additions grow (amber when magnitude amplified), dropped species/context tokens detach and fall, removed hedges fade with an explicit "Uncertainty removed" chip and "Larger wording = mutation, not evidence".

**Timeline** — time scrub over ledger dates (floor = earliest entry; nothing invented before it); events enter from chronological depth (translateZ) per lane.

**Signal constellation** — three dust depth layers, reticle rings + radial grid, weighted pointer parallax, textured focus glow. Report buffer still length 0.

**Environment / micro** (`styles/app.css`) — layered body gradient, panel depth shadows, `.glass`, `.veil`, chip/button depress, weighted range inputs, fragment loader (`components/SceneLoader.tsx`) instead of spinners.

## Verification evidence
- `npm run build` green (2026-09-20 23:1x).
- `tools/shots.mjs` → `shots/` (gitignored): home at 0/35/62/92/100% of the hero, dossier, claim (lineage + mutation), signal, timeline, compare, explore at 1440×900 and 390×844; plus `home-static-desk.png` / `dossier-static-desk.png` via `tools/probe.mjs` (`?static=1` + reduced motion). Every one was looked at; the lineage `translate( )` bug, mutation word-wrap, cropped spatial headline, off-frame resolve graph, square glow sprite and backdrop seam were found this way and fixed.
- Console: no page errors on desktop or mobile runs. One 404 on a non-home route was reported by Chrome but no failing request appears on `/`; not chased.

## Conflicts flagged (per standing instruction: flag, don't choose silently)
1. `cyravon-handoff-prompt.md` §3.1 asks for a **scatter→coil hero (~400 residues into a ~60-residue helix)**. HANDOFF-V2 records that ScatterCoil was already replaced by the assembled-chain camera flight, and the cinematic addendum says "the existing hero camera-flight direction remains correct". I followed the addendum. A 60-residue helix would also be a structure that belongs to no indexed compound, which collides with "never falsely show scientific structures unrelated to the content". `src/scenes/hero/ScatterCoil.tsx` does not exist in the archive.
2. The addendum names Higgsfield as optional. Not used: every visual here is procedural from the compound sequence, so nothing generated could carry a provenance label.

## Not started from the handoff priority list
2 `/study/$pmid` · 3 typed store · 4 GraphVersion/Evidence Drift · 5 Claim Inspector · 6 adapters · 7 echo scaffold · 8 research/source/share/export/collections/admin · 9 Lighthouse gate (LCP not measured this pass) · 10 WCAG pass (graph keyboard nav still missing). The hero and dossier are heavier than V2; measure before shipping.

## Known issues
- `radialTexture` lives in `HeroScene.tsx` and is imported by ViewerScene/Constellation; move to `scenes/util.ts` when convenient.
- Dossier canvas backdrop is positioned for the two-column desktop header; on very wide screens its bright centre may drift right.
- Lineage community nodes fade in ~3.5 s after entering view; a fast screenshot can miss them (they are there).
- Contact shadow needs a "floor" mentally; it reads as a soft pool under the chain, which is intended.
