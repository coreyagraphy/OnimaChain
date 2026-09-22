# ONIMACHAIN — CURRENT PROJECT HANDOFF

Updated: 2026-09-22
Owner: Corey
Status: Live, private repository, commerce-first interface in active development

This document is the send-ready handoff for the current OnimaChain build. Read it before changing the application.

## 1. Current links and locations

| Item | Location |
|---|---|
| Canonical repository | `C:\Users\corey\Projects\cyravon\cyravon-app` |
| Private GitHub remote | https://github.com/coreyagraphy/OnimaChain |
| Branch | `main` |
| Live functional source | `a3c8c6794f496f2b5296425794d32f1c688d24ee` (peptide visual and Portal accuracy checkpoint); see `git log -1` for later notes |
| Production site | https://cyravon.netlify.app |
| Netlify site | `cyravon` |
| Netlify site ID | `a9d4e072-46d2-447d-b491-58f6882bf167` |
| Current production deploy | `6ab2d269c7441a69f5cc14e4` (2026-09-22; verify in Netlify before further deployment) |
| Supplied logo master | `public/brand/onimachain-master.png` (optimized variants beside it) |
| Older handoff export (superseded by this tracked file) | `C:\Users\corey\Downloads\cyravon-HANDOFF-SEND.md` |
| Product brief | `CYRAVON_BRIEF.md` |
| Build specifications | `BUILD_SPEC_CYRAVON.md` and `BUILD_SPEC.md` |
| Earlier checkpoints | `HANDOFF-V2.md`, `HANDOFF-V3.md` |
| Original archive | `C:\Users\corey\Downloads\cyravon-app-v0.1.tar.gz` |
| Original prompt | `C:\Users\corey\Downloads\cyravon-handoff-prompt.md` and the repo copy |

The GitHub repository is private. Anyone receiving this handoff also needs collaborator access.

The GitHub repository was renamed to `coreyagraphy/OnimaChain` on 2026-09-22. The local repository path, Netlify site/URL, and older filenames retain the former working name as technical identifiers. The OnimaChain logo build was published to the existing Netlify site through the CLI. Netlify's CLI deploy metadata does not record a Git commit SHA, so the source revision is recorded above.

## 2. Product direction now in force

OnimaChain is explicitly a **commerce site** for commonly discussed peptides, with a layered research and education experience around the catalog.

The public brand is locked: **OnimaChain** / **ONIMACHAIN**. “Onima” is “Amino” read backward; “Chain” connects molecular chains, biological signals, and evidence trails. The primary tagline is “From amino chains to molecular insight.” The secondary tagline is “See the molecule. Follow the signal. Trace the evidence.” Public-facing copy must use the centralized configuration in `src/brand.ts`.

The owner-supplied chrome logo is the visual source of truth. `src/components/BrandWordmark.tsx` displays lossless crops from `public/brand/`; the former CSS/SVG stand-in was removed. Keep the humanized page copy already present in the source unless the owner asks for a copy change.

The user wants:

- bold, colorful, immersive pages;
- neon, liquid glass, spatial depth, and meaningful 3D motion;
- molecules that glow and move;
- cards that feel illuminated rather than flat or black;
- plain English suitable for a high-school freshman;
- real shopping behavior: catalog, product pages, quick view, cart, and eventually checkout;
- evidence and uncertainty kept visible without turning the interface into a laboratory dashboard.

The original brief prohibited commerce. Corey explicitly superseded that direction on 2026-09-21. Commerce UI, placeholder pricing, cart behavior, and future checkout are authorized. The following restrictions still apply:

- no dosing, reconstitution, syringe, or protocol calculators;
- no fabricated clinical outcomes, customer stories, popularity counts, or testimonials;
- no guaranteed medical, weight-loss, healing, sexual-performance, anti-aging, or bodybuilding claims;
- no unsupported “best for” rankings;
- no invented research citations or regulatory facts.

Final pricing, payments, fulfillment, product eligibility, and product-by-product regulatory review are still pending.

## 3. Run, build, and deploy

Requirements: Node 22+, npm, Google Chrome for screenshot tooling.

```powershell
cd C:\Users\corey\Projects\cyravon\cyravon-app
npm install
npm run dev
npm run build
```

The mandatory build gate is:

```text
verify-pmids -> pulse:seed -> tsc --noEmit -> vite client build -> vite SSR build
```

Production deploy:

```powershell
npx netlify deploy --prod --dir=dist/client
```

Other useful commands:

```powershell
node tools/shots.mjs
node tools/probe.mjs
node tools/poster.mjs
```

Query flags:

- `?static=1` forces the no-WebGL path.
- `?quality=low|mid|high` forces a visual quality tier.

## 4. Non-negotiable data and UX rules

1. Do not invent PMIDs, DOIs, authors, institutions, trial results, mention counts, cluster counts, dates, or regulatory events.
2. Every indexed `Study` must resolve through the NCBI build verifier. Extend `tools/verify-pmids.ts`; never bypass it.
3. Claims are not labeled simply TRUE or FALSE. Show the source, scope, limitations, contradictions, and unknowns.
4. No social-platform corpus is connected. Never fabricate human-signal data or customer reports.
5. Any unsourced mutation example must remain labeled as illustrative wording, not an indexed source.
6. Every molecular structure must identify its provenance. Procedural structures are sequence-derived visualizations, not measured structures or lab scans.
7. Content and controls must work without WebGL. Reduced motion must retain all information and actions.
8. Retatrutide displays as **GLP3**. Do not add Dihexa.
9. Material claim edits belong in `changeHistory`; the intended future architecture also requires `GraphVersion` snapshots.
10. The source-code brand string belongs in `src/brand.ts` through `BRAND`.
11. When a fact cannot be verified, leave it empty and show an honest pending or unresolved state.
12. Corey is building this solo. Instructions must be directly runnable by him.

## 5. Current stack and architecture

- TanStack Start with file-based routes
- React 19 and TypeScript
- Tailwind CSS v4 plus `src/styles/app.css`
- Three.js, React Three Fiber, Drei, and postprocessing
- GSAP ScrollTrigger and Lenis
- d3-force
- Zustand
- Playwright for visual and functional checks
- Netlify deployment with the TanStack Start server function

Primary areas:

| Area | Files |
|---|---|
| Routes | `src/routes/*` |
| Catalog data | `src/data/compounds.ts`, `src/data/commerce.ts`, `src/data/domains.ts` |
| Research fixtures | `src/data/studies.ts`, `src/data/claims.ts`, `src/data/evidence.ts` |
| Visual system | `src/styles/app.css`, `src/scenes/*`, `src/components/*` |
| Commerce state | `src/stores/commerce.ts` |
| Build verification | `tools/verify-pmids.ts` |
| Brand | `src/brand.ts` |

## 5b. Plain-language + disclaimer pass (2026-09-21, commit below)

- **Age gate**: `src/components/AgeGate.tsx`, mounted in `__root.tsx`. First visit asks "Are you 21 or older?"; answer stored in localStorage (`age-gate-21`). Renders nothing during SSR so hydration always matches. "No" shows a polite 21+ message with a way back.
- **Disclaimers** (plain English): footer line ("You must be 21 or older to use this site…"), Terms (7 rules incl. "Must be 21 and over to enter"), Privacy (what we collect, 21+), About, Contact. Terms/Privacy are marked as drafts pending a lawyer.
- **Jargon removed from every rendered string** except scientific names, numbers, PubMed IDs, sequences and molecular weight. Mapping (old → new): corpus → "sources we checked / real-world reports checked"; provenance → "where it comes from"; lineage → "how the story spread"; mutation → "how the wording changed"; contradiction → "pushes back"; interpretation → "the short version / our reading"; translation state → "how far it has been tested"; echo analysis → "copies vs. originals"; human signal → "what people say"; "Not assessed — no corpus" → "Not measured yet — no reports collected"; SUPPORTS / PARTIALLY_SUPPORTS / CONTRADICTS / DOES_NOT_TEST → "Backs it up / Partly backs it up / Pushes back / Talks about it, didn’t test it"; study types → "Cells in a dish (in vitro) / Animal study / Review paper / People, observed / Human trial"; translation stages → "Cells in a dish → Mice → Rats → Bigger animal → People → Proper human trial → Approved by regulators"; mutation steps → "What the study said → The summary → The social post → The viral version".
- **Titles rewritten** (no lame titles): claim sections, dossier sections G–L, claims/compare/coverage/corrections/status/learn/saved/about/contact/privacy/terms headlines, home closing CTA ("See it up close. Then decide.").
- The whole pass is scripted in `tools/plain-copy.mjs` (exact-string replacements, fails on a miss). It has been run once; do not rerun it.
- Dev-server fix: `vite.config.ts` now applies `ssr.noExternal: true` only on `build` (the Netlify need); with it on in dev, SSR crashed with "module is not defined". `scripts/dev-here.mjs` no longer leaves an orphaned Vite process on port 8082.
- Repo hygiene: `node_modules` and `dist` had been committed despite `.gitignore`; they are untracked again in this commit.
- Verified: `npm run build` green (9/9 PMIDs), tsc clean, no console errors; screenshots in `shots/age-gate.png` and `shots/copy-*.png` looked at.

## 5c. Cinematic brief pass (2026-09-21)

Implements CYRAVON_CLAUDE_CINEMATIC_BUILD_BRIEF.md (Downloads). Evidence lives in `shots/evidence/` (gitignored; regenerate with `node tools/cinematic-evidence.mjs`) and `shots/before/` (baseline captured before the changes).

- **Hero sequence**: one pinned scene, one normalised scroll progress (GSAP ScrollTrigger scrub, Lenis as the single smooth-scroll owner). Camera path + separate look-target track through the proline hinge gap. Headline is hidden until ~74% and holds a stable reading frame from ~87%; captions are the only text before that. Reverse/pause/refresh restore state because everything is a pure function of progress. Recording: `hero-scroll-forward-pause-reverse.webm` (forward → traverse → reveal → hold → reverse → fast forward).
- **Scroll investigation (actual finding)**: there was no double-owner defect; Lenis drives ScrollTrigger via one ticker and the R3F loop only reads the progress ref. The one real defect found was off-screen scenes never pausing (upstream had removed the IntersectionObserver); restored with a 400px margin in `Lod0Canvas`.
- **A distinct environment per peptide**: `src/data/environments.ts` — 12 art-direction swatches (the brief’s violet / teal / cobalt / ember / crimson / chartreuse plus ice / rose / amber / jade / indigo / copper), assigned **by slug** for all 36 entries, neighbours in a topic deliberately different. `themeFor()` now reads from it (no more array-index colours). Applied to the dossier header gradient (deep background), the stage backdrop/fog/rim/fill lights, cards, quick view and the Portal. Atom colours (residue classes, copper ion) never change.
- **Texture and depth on every molecular piece**: `src/scenes/chain/textures.ts` generates seeded tangent-space normal + roughness maps — fine mineral grain for atoms, brushed striations for bonds — sized by quality tier (128/256/512). Each atom gets a seeded per-instance rotation so grain orientation differs without unique textures. Materials moved from glossy plastic (clearcoat 1.0) to ceramic/satin (roughness .44–.46, clearcoat .3–.5). Sphere segments raised (40×28 at LOD 0) so silhouettes stay round at fly-through distance. Close-ups: `closeup-still.png`, `closeup-moving.png`.
- **Interaction**: dossier stage is keyboard reachable (tab to canvas, arrow keys rotate); touch devices get an explicit “Drag rotates / Drag scrolls” toggle (defaults to scrolling so the page is never trapped).
- **Fallbacks**: no-WebGL browsers now route to the static path (SVG structure + poster) — verified by stubbing getContext (`webgl-off-dossier.png`: 1 svg, 0 canvases). Reduced motion shows the final reading composition immediately (`reduced-motion-home.png`).
- **Measured**: Google Chrome via Playwright/ANGLE, 1440×900 on Corey’s desktop: 61 fps at the reading frame and 61 fps mid-traversal (2 s rAF samples). Mobile 390×844: no horizontal overflow; rotate-mode button present. One machine only — not a universal claim.
- **Skills consulted (revision recorded, not vendored)**: anthropics/skills 34040c9c5685 (2026-09-10), iart-ai/web-animation-skills b6dba3eb7597 (2026-06-22; read 60fps-animation — transform/opacity rule applied to new motion), CloudAI-X/threejs-skills b1c623076c66 (2026-01-19; file list only, APIs checked against three 0.186 in node_modules), nextlevelbuilder/ui-ux-pro-max-skill dcc40ff5133e (2026-09-21; not used).
- **Known limitations**: the product wordmark on long names (e.g. PT-141 (BREMELANOTIDE)) still overlaps the stage column — pre-existing typography, not touched. Terminal cap cones render very bright under bloom. The dossier canvas backdrop plane still reads as a slightly different tone from the header gradient on the left column. No lower-cost *geometry* LOD for mobile beyond fewer sphere segments and 128px maps.

## 5d. Revision-2 pass: depth, hands-on stage, Bond Theory, topic cards, video slots (2026-09-21)

**Topic cards (home, "What are you here for?")** — the seven topics were renamed in plain language in `src/data/domains.ts` (the single source for home, shop and Portal): Recovery & Repair · Weight & Metabolism · Growth & Muscle · Skin, Hair & Glow · Focus & Mood · Aging & Cell Energy · Immune Defense. Each has a one-line tagline and a generated background image (`public/topics/*.webp`, 14–34 KB, made with Gemini image generation, no drug/needle imagery). Cards drift slowly, sweep light on hover, reveal in a stagger, lean with phone tilt, and open the shop filtered to that topic (`/explore?topic=`). "Age reversal" / "Fountain of youth" were not used as the topic name because they read as an anti-aging promise; "fountain-of-youth research: what's real, what's hype" is used as the tagline instead.

**Video intros** — every product page has a 4:5 slot (`src/components/PeptideVideo.tsx`) with a designed "coming soon" frame in that peptide's colours. Drop raw clips into `media/raw/<slug>.mp4|mov` and run `node tools/encode-videos.mjs`: it centre-crops to 4:5, trims to 10 s, drops audio, writes `public/videos/<slug>-1080.mp4` (1080×1350), `<slug>-720.mp4` (720×900) and `<slug>.jpg`, and switches that product's slot on. Autoplay is muted, loops only on screen, and reduced-motion visitors get a poster + play button. Pipeline verified with a synthetic clip (then deleted).

**Hero words (refuter + adversarial review, both run on real frames)** — the in-scene "LOOK CLOSER" failed: at 60% a molecule arm covered it so it read "LOSER"; on phones it never fit ("LOOK CLOS"); at 76% it collided with the headline. Replaced by the site's theme as three flat, screen-sized lines — *What was studied. / What people say. / What's still unknown.* — each lighting one scene marker (52–74%), fully in frame at 390 px (script-verified), nothing else on screen, gone before the headline (76%+).

**Depth** — `src/scenes/DepthField.tsx`: one draw call per layer, per-particle drift, twinkle, star glints, depth fade, additive glow bright enough to bloom. Hero has far / mid / near layers with separate parallax (near bokeh rushes past the lens). Product stages and Bond Theory use the same system in each peptide's colours. `src/components/DepthBackdrop.tsx`: a fixed 2D glowing particle field behind every page, three depth bands, scroll + tilt parallax. `src/motion/tilt.ts`: pointer on desktop, gyro on phones (iOS asks once, on the age-gate "Yes" tap).

**Scroll** — one rendered progress: the camera's extra smoothing layer was removed so camera and text can't disagree. Skip intro moves scroll + scene state and focuses the first action; tabbing into the hidden headline also completes the intro. Adversarial check: jump 20% → 90% → back to 45%: headline opacity 0; during theme lines: 0. Frame time through the passage: p50/p95 16.7 ms desktop and phone emulation (Chrome/ANGLE on Corey's PC — not a real phone).

**Hands-on product stage** — Look closer · Turn it around (Done / Escape) · Move the light (key light orbits on a key/fill/rim rig; the chain no longer adds flat ambient light there) · What is this? (only real structural features, e.g. proline kink) · Where it's from · Reset view. 44 px targets, focus returns to the opener. The old Labels and Reduced-effects toggles were folded into these.

**Bond Theory: The Stack Effect** (`/bond-theory`, in nav + footer) — empty stage → Choose peptides (search by name or other name; a synonym of a pick says "You already picked this one."), up to 4 lit stations in one canvas at honest relative sizes (more are paged, never dropped), tray with Remove + Undo, five one-at-a-time questions (What might they do? · Do they do similar things? · Have they been studied together? · What don't we know? · See the studies), Save your picks (this device), Download your summary (text with source links). A dashed link appears only when a checked study names both peptides (today: BPC-157 + TB-500, PMID 42542926, in rats) and says it is not a chemical bond or proof. No scores, no green checks, no dosing, no cart link. Phones show one station with arrows.

**Fixes found by the sweep** — leaving the home page crashed React (pinned hero re-parented by ScrollTrigger; now wrapped in a React-owned element). Shop page scrolled sideways on desktop (header glow 288 px past the edge; product-card names didn't wrap). Saved page retitled "Your shortlist."

### Route-to-skill map (every route checked at 1440×900 and 390×844: 0 console/page errors, 0 horizontal overflow, depth backdrop present — `node tools/route-sweep.mjs`)

| Route | Status | What changed / why not |
|---|---|---|
| `/` | implemented | Hero rebuilt (GSAP ScrollTrigger direct scrub, one progress; Three.js DepthField layers; tilt), topic cards |
| `/explore` | implemented | Topic filter via link; overflow fixed; tilt/backdrop depth |
| `/compound/$slug` | implemented | Hands-on stage, video slot, stage depth layers, environment colours |
| `/bond-theory` | implemented | New page per brief §3/§8 |
| `/signal`, `/learn`, `/learn/*` | implemented (shared) | Backdrop depth + topic names; no page-specific motion added |
| `/claim/$id`, `/claims`, `/compare`, `/timeline`, `/study/$pmid` | implemented (shared) | Backdrop depth; existing lineage/mutation/timeline motion kept |
| `/methodology`, `/coverage`, `/corrections`, `/status/$compound` | implemented (shared) | Backdrop depth only — reading pages, motion kept calm on purpose |
| `/about`, `/contact`, `/privacy`, `/terms`, `/saved`, 404 | implemented (shared) | Backdrop depth; copy from the plain-language pass |
| Cart / quick view drawers | not changed | Commerce boundary: totals and forms stay still |

Skills used: official GSAP skills `greensock/gsap-skills` @ aed9cfd32777 (scrolltrigger: direct scrub, kill on unmount, refresh after layout); `CloudAI-X/threejs-skills` @ b1c623076c66 (shaders, lighting: key/fill/rim, no flat ambient); `iart-ai/web-animation-skills` @ b6dba3eb7597 (60fps: transform/opacity only for all new DOM motion).

**Still open** — Look closer targets the first real feature (or the middle residue) — not hand-authored per peptide. The hero passage path has not been checked in wireframe for atom intersections. No real-phone measurement (only desktop Chrome with phone emulation). Bond Theory has no Mol* inspect view and no catalog hand-off (disabled by design). Lighthouse/LCP not measured.

## 6. What is built and live

### Commerce shell

- Fixed responsive navigation.
- Catalog at `/explore` with filters, sorting, grid/table views, and 3D-feeling neon product cards.
- Product routes at `/compound/$slug` with commerce header, research sections, structure view, quick view, and cart actions.
- Global quick-view drawer and cart.
- Placeholder prices remain intentionally marked pending.
- Search modal and responsive mobile navigation.

### Homepage molecular journey

Commit: `903f771`

- The opening frame is molecule-first with no large competing headline.
- The BPC-157 molecule slowly turns at rest.
- Scroll moves the camera into and through the molecule.
- Plain-language bridge text appears after entry.
- The final commerce message resolves after the molecule: “See the molecule. Understand the story.”
- Removed the jargon phrases “Human Signal,” “no corpus,” “no source access,” and “labelled true/false” from the hero sequence.
- Desktop, mobile, and reduced-motion states were visually checked.
- Design brief and fingerprint are in `scrollcraft/builds/cyravon-hero/BRIEF.md` and `scrollcraft/FINGERPRINTS.md`.

### Portal of Tides

Commit: `ff31717`

The old **Peptide Finder** public name is now **Portal of Tides**.

- `/signal` is the functional finder inside the Portal of Tides identity.
- `/learn` is the learning area and is labeled **Learn** in navigation.
- Navigation, footer, page metadata, product-page links, and drawer copy use the updated naming.
- The finder supports:
  - peptide dropdown;
  - topic dropdown;
  - constellation view;
  - connections view;
  - checked-source timeline;
  - topic map;
  - selected-product details;
  - quick view and cart actions.
- The Portal title uses the locally bundled **Lilita One** face.
- The title has layered 3D extrusion, glass-water gradients, caustic movement, and a repeating molecular-chain pattern inside the letterforms.
- Mobile and reduced-motion treatments are included.

### Catalog and descriptions

The catalog now contains **36 entries**.

The following missing entries were added:

- Follistatin 344
- Kisspeptin-10
- The Wolverine Blend

Important modeling decisions:

- Follistatin 344 is structure/source pending.
- The Wolverine Blend is explicitly a two-product blend, not one peptide; it receives no invented sequence or single molecular structure.
- Kisspeptin-10 has a sequence-derived visualization and amidated terminal residue.

The 21 descriptions requested by Corey were rewritten in bold, plain English:

- Retatrutide / GLP3
- Tirzepatide
- Semaglutide
- Tesamorelin
- MOTS-c
- Follistatin 344
- IGF-1 LR3
- CJC-1295
- Ipamorelin
- BPC-157
- TB-500
- The Wolverine Blend
- KPV
- Thymosin Alpha-1
- Kisspeptin-10
- PT-141 / Bremelanotide
- Epitalon
- GHK-Cu
- Pinealon
- Semax
- Selank

The copy keeps the direct, appealing tone but does not publish guarantees such as “melts fat,” “instant,” “exercise in a bottle,” or “superhuman healing.” Approved uses are kept narrow; experimental products are identified as experimental.

### Research and education

- Nine PMIDs are verified at build time:
  - 21030672
  - 42542926
  - 41754849
  - 40789979
  - 40756949
  - 34170491
  - 32245208
  - 36706591
  - 41235866
- BPC-157 and TB-500 have the deepest research fixtures.
- Claim routes, claim lineage, mutation ladder, evidence views, compare, timeline, methodology, coverage, corrections, status, saved, and legal/about stubs render.
- Only one of ten learning lessons is currently interactive.

## 7. Route status

| Route | Status |
|---|---|
| `/` | Live molecular scroll journey and commerce homepage |
| `/explore` | Functional catalog |
| `/compound/$slug` | Functional product dossier |
| `/signal` | Functional Portal of Tides finder with four views |
| `/learn` | Portal learning index; 1 lesson complete, 9 pending |
| `/learn/how-internet-claims-mutate` | Interactive lesson |
| `/claims`, `/claim/$id` | Functional fixture-based research views |
| `/compare` | Functional compound comparison |
| `/timeline` | Functional UI using fixture history |
| `/methodology` | Functional explanatory page |
| `/coverage`, `/corrections`, `/status/$compound` | Functional states, limited data |
| `/saved` | Stub; persistence/auth not built |
| `/about`, `/contact`, `/privacy`, `/terms` | Basic stubs |
| `/study/$pmid` | Live — verified records only; unknown PMIDs fail closed |
| `/inspect` | Not built |

## 8. Verification completed

Latest verified production state:

- `npm run build` passed.
- PMID gate passed: **9/9**.
- TypeScript passed.
- Vite client and SSR builds passed.
- Production returned HTTP 200.
- `/signal` and `/learn` checked at 1440×1000 and 390×844.
- No horizontal overflow on those checks.
- No browser console errors.
- All four Portal explorer tabs responded.
- Dropdown exposed all 36 entries, including Follistatin 344, Kisspeptin-10, and The Wolverine Blend.
- Reduced-motion mode disabled Portal title animation while preserving the interface.

Known build warning: the primary client bundle remains larger than 500 kB after minification. This is a performance task, not a current build failure.

## 9. Current evidence and product-copy caveat

The catalog is broader than the verified research corpus.

- BPC-157 and TB-500 have checked PubMed fixtures.
- Most other entries have product and structure metadata but do **not** yet have attached verified study records.
- The new plain-English descriptions are editorial summaries informed by official labels and primary literature checks; they are not substitutes for a complete per-product evidence record.
- Do not imply that all 36 products have equal research support.
- The next data pass should attach official FDA labeling, ClinicalTrials.gov records, and verified PubMed sources to the corresponding products.

## 10. Decisions and conflicts that remain open

1. **Commerce versus the original brief:** Corey's explicit commerce direction currently wins in the UI. Retain the original evidence safeguards until a revised formal brief replaces the conflict.
2. **Hero direction:** the current camera-flight hero is live. The older scatter-to-coil concept was not built because its generic long helix would not correspond to an indexed compound.
3. **Portal structure:** `/signal` is Portal of Tides; `/learn` is its learning area but remains a separate route.
4. **Checkout:** cart UI exists, but real checkout, payment processing, inventory, shipping, and eligibility logic do not.
5. **Brand:** OnimaChain is the locked public brand and the GitHub repository is `coreyagraphy/OnimaChain`. The former name remains in the local path, Netlify site/URL, credential filenames, and historical source records until those are migrated deliberately.

## 11. Exact next work, in recommended order

1. **Attach sources to remaining commerce descriptions.** Official FDA/DailyMed records now exist for semaglutide, tirzepatide, tesamorelin, and PT-141/bremelanotide. Next: experimental catalog, ClinicalTrials.gov, and verified PubMed for those four.
2. **Deepen `/study/$pmid`.** Route is live for indexed PMIDs and fail-closed for unknowns. Next: cache abstracts in the verifier and link SourceBadge through the route as well.
3. **Replace placeholder pricing.** Only after product, legal, fulfillment, and payment decisions are final. Then wire a real checkout provider and inventory state.
4. **Build typed persistence.** Move fixtures into a typed store containing compounds, claims, studies, sources, versions, relationships, and provenance.
5. **Implement GraphVersion.** Feed `/timeline` and claim change views from immutable snapshots. This is the one clear failure in the original 20-test acceptance scorecard.
6. **Build Claim Inspector at `/inspect`.** Assemble answers only from indexed records and fail closed when no qualifying record exists.
7. **Build source adapters.** PubMed, Crossref, ClinicalTrials.gov, and FDA first. Social adapters must report `no_access` unless an approved API is connected.
8. **Finish the nine learning lessons.** Remove or rewrite the low-priority in-vitro emphasis if it does not serve common peptide shoppers.
9. **Complete account and saved-item persistence.** `/saved` is currently a stub.
10. **Performance pass.** Split large bundles, measure LCP/INP/CLS, and establish a mobile Lighthouse CI gate.
11. **Accessibility pass.** Keyboard navigation for all visualizations, screen-reader descriptions, focus audit, and WCAG 2.2 AA checks.
12. **Housekeeping.** Consolidate shared scene utilities, remove accepted obsolete poster tooling, and refresh the screenshot suite.

## 12. Acceptance snapshot

The original 20-test brief score remains broadly valid with these updates:

- Build, verified-source enforcement, no-WebGL fallback, reduced motion, mobile rendering, provenance labels, and honest empty states pass.
- Portal controls now function; the old “finder is inert” note is obsolete.
- Interpretation versioning still fails until `GraphVersion` is implemented.
- Mobile performance and first-time-user comprehension have not been formally measured with Lighthouse or user testing.
- Full provenance coverage does not yet exist for the expanded 36-entry commerce catalog.

## 13. Recent commit sequence

```text
ff31717 Transform finder into Portal of Tides
903f771 Turn homepage hero into molecular scroll journey
2b953e2 Make peptide shopping immersive and approachable
ce60f88 Create Portal of Tides learning identity
ee5732d Build commerce-first Cyravon storefront
d1d1900 Configure Netlify production deployment
7367f67 Record private GitHub remote in handoff
```

The newest repository commit after this file is saved is the handoff update itself. Use `git log -1 --oneline` for its hash.

## 14. Handoff discipline

- Preserve unrelated user changes.
- Keep commits descriptive and focused.
- Run `npm run build` before deployment.
- Inspect real screenshots after visual work; do not accept blank canvases, clipped text, or unreadable contrast.
- Treat every molecule as information, not decoration.
- Use plain language first; allow deeper evidence behind it.
- Never turn an evidence gap into sales copy.
- Update this file after material changes and copy it to Downloads before sending it onward.

## 5e. PulseChain + Bond Theory v2 (2026-09-21)

**PulseChain** is the site's live research and news feed. It's built around events, not articles.
- **Pages:** `/pulse`, a home section after Featured, "What's new with X" on every product page, and a Pulse link in the nav.
- **Engine:** `src/pulse/` (types, adapters, pipeline). Every step runs from stored source records, with fixed-wording summaries and no AI rewrite:
  - dedupe by identity
  - link to compounds (with collision guards for p21, glutathione and NAD+)
  - cluster copies and videos into the primary event
  - labels, not scores
  - significance ranking
  - trial status changes between runs
  - trend levels, which need 14 days of history before anything is called "rising"
- **Sources:**

  | Source | State |
  |---|---|
  | PubMed, ClinicalTrials.gov, FDA RSS | On, no keys needed |
  | YouTube | On when `YOUTUBE_API_KEY` is set (6 compounds per run, stays inside the free quota) |
  | News RSS | On when `PULSE_NEWS_FEEDS` (a comma list) is set |
  | Reddit, TikTok | Built as switches, off until licensed |

  `NCBI_API_KEY` is optional and speeds up PubMed.
- **Runtime:**
  - `netlify/functions/pulse-collect.mts` runs on a schedule every 4 hours. It hands off to `pulse-run-background.mts` (15-minute limit, needs a plan with background functions) or runs inline.
  - Results are stored in Netlify Blobs, store `pulse`, keys `latest` and `runs/<hour>`.
  - `GET /api/pulse` (`pulse.mts`) serves the public feed; the review queue never leaves the server.
  - `npm run build` also writes `public/pulse.json`, so the feed has real content on day one and when the API is down. The client tries `/api/pulse` first, then `/pulse.json`.
- **Publishing tiers:**
  - Primary sources publish automatically.
  - Commentary publishes with its label.
  - A conflict ("FDA approved X" when X isn't) combined with 3 or more voices goes to review.
  - Items not linked to anything are held.
- **Tests:** `npm run test:pulse` runs 11 offline attack cases (echo collapse, PMID citing, creator spam, FDA clickbait, review queue, promo flag, trial delta, cross-run dedupe, trend guard, summaries only from the record). `tools/pulse-check.mjs` covers the browser.
- **Open:**
  - Add a YouTube key and news feeds in Netlify env.
  - An admin view of the review queue (for now, read Blobs `latest.review`).
  - Email for the weekly "Chain Reaction" digest.
  - pgvector clustering if volume grows past Blobs.

**Bond Theory v2** is goal-first:
- The flow is: goal text or chips, then research matches (`src/data/goals.ts` PROFILES), then the stack, then the "What they do together" card (Overlap / How they get there / Adds / Studied together / Gap, plus a matrix and ladder), with "Save as picture".
- Community reports go in `src/data/reports.ts`, which is empty and requires a link for every entry.
- Corey's order: no safety or "research chemical" caveats in the page; the disclaimers live up front.

**Copy:** all 36 product descriptions were rewritten to benefit-aware, factual wording with no "not proven" endings. The Safety row was removed from the research grid.

### 5e-2. Review queue, YouTube on, extras (2026-09-21)

**YouTube is on.**
- The key is set on Netlify as `YOUTUBE_API_KEY`. Locally it lives in the git-ignored `.env`.
- Only English videos are kept: the declared language, or a title check when none is declared.
- A video links to a peptide only when the title or the opening of the description names it.
- Videos with under 200 views rank down.
- Thumbnails and view counts show on video cards.

**Review queue** at `/pulse/review` (noindex, not linked anywhere):
- The key is `PULSE_ADMIN_TOKEN`, set on Netlify. The copy is in `_HQ/_Private_Credentials/CYRAVON_PULSE_ADMIN.txt`.
- Actions: approve, reject, pull from feed, undo, editor's note, and "Check sources now" (starts the background run).
- Decisions live in Blobs `pulse/decisions` and are applied every time the feed is read (`src/pulse/review.ts`), so they take effect immediately and survive later runs.
- Approved items show "Checked by our team". Notes show on the card as "Editor's note".

**Extras:**
- Follow a peptide, kept on the device with no account. It gets a Following tab, followed peptides come first in the home rail, and the "Since your last visit" box counts them.
- Native share sheet, falling back to copying the link. `/pulse?e=<id>` deep links open with that update pinned and highlighted.
- "New" markers on anything since the last visit.
- The Now feed and rails never show more than 2 of one type in a row.
- Trial and video cards say "See the trial" and "Watch on YouTube".

**Tests:** `npm run test:pulse` now has 16 cases; `tools/pulse2-check.mjs` is the browser check.
