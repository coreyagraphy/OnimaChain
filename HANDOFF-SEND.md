# CYRAVON — CURRENT PROJECT HANDOFF

Updated: 2026-09-21
Owner: Corey
Status: Live, private repository, commerce-first interface in active development

This document is the send-ready handoff for the current Cyravon build. Read it before changing the application.

## 1. Current links and locations

| Item | Location |
|---|---|
| Canonical repository | `C:\Users\corey\Projects\cyravon\cyravon-app` |
| Private GitHub remote | https://github.com/coreyagraphy/cyravon |
| Branch | `main` |
| Current feature baseline | `ff31717` — `Transform finder into Portal of Tides` |
| Production site | https://cyravon.netlify.app |
| Netlify site | `cyravon` |
| Netlify site ID | `a9d4e072-46d2-447d-b491-58f6882bf167` |
| Current production deploy | `6ab119f219af0331cf865e09` |
| Sendable handoff copy | `C:\Users\corey\Downloads\cyravon-HANDOFF-SEND.md` |
| Product brief | `CYRAVON_BRIEF.md` |
| Build specifications | `BUILD_SPEC_CYRAVON.md` and `BUILD_SPEC.md` |
| Earlier checkpoints | `HANDOFF-V2.md`, `HANDOFF-V3.md` |
| Original archive | `C:\Users\corey\Downloads\cyravon-app-v0.1.tar.gz` |
| Original prompt | `C:\Users\corey\Downloads\cyravon-handoff-prompt.md` and the repo copy |

The GitHub repository is private. Anyone receiving this handoff also needs collaborator access.

## 2. Product direction now in force

Cyravon is now explicitly a **commerce site** for commonly discussed peptides, with a layered research and education experience around the catalog.

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
verify-pmids -> tsc --noEmit -> vite client build -> vite SSR build
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
5. **Brand:** Cyravon remains a working name pending final domain and trademark clearance.

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
