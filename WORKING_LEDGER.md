# OnimaChain working ledger

## Recovery checkpoint — 2026-09-22

The interrupted session's local work was recovered in `C:\Users\corey\Projects\cyravon\cyravon-app` and saved to the existing private GitHub repository, now `coreyagraphy/OnimaChain`, on `main`. Use `git log -1` for the checkpoint SHA. The Netlify site remains `cyravon` (site ID `a9d4e072-46d2-447d-b491-58f6882bf167`); its production deploy at this checkpoint is `6ab1e8c80f88f750d0b95551` and still serves the Cyravon-branded build. A source push does not deploy this CLI-managed site.

This checkpoint contains the OnimaChain identity and wordmark, visual and molecule revisions, 12-second explainer production sheet, and disabled Stripe test-mode payment foundation described below. `public/pulse.json` and `src/data/verified.json` were already modified by earlier builds and are included in the checkpoint as found. No live checkout or production payment configuration was enabled.

Verification for this recovery checkpoint: `npm run typecheck`, `npm run test:payments` (14 passing), `npx vite build`, and `git diff --check`. Earlier visual and route verification is recorded in the chronological entries below. Next: review the saved source and local visuals, decide when to deploy the OnimaChain build to the existing Netlify site, and complete payment database/Stripe sandbox testing before considering checkout. The older "local and uncommitted" notes below describe their state when written; this checkpoint supersedes that status.

## Visual refinement — 2026-09-21

## OnimaChain brand lock — 2026-09-22

Implemented the attached `OMINACHAIN-FINAL-HANDOFF-V3.md`, correcting its brand spelling to OnimaChain / ONIMACHAIN because “Onima” is “Amino” read backward. `src/brand.ts` is now the single public identity source for the name, meaning, both approved taglines, SEO description, cart label, and social image. Added the linked ONIMA/CHAIN wordmark and three-node bond mark, a matching favicon/manifest, a dimensional About-page origin story, updated home/footer/404/search language, root Open Graph/Twitter metadata, WebSite JSON-LD, and Dataset publisher/creator identity.

Namespaced browser carts and new Stripe test sessions to OnimaChain. Existing browser carts migrate once from either former storage key; webhook verification accepts the former integration identifiers only for already-created test sessions. The repository, GitHub remote, Netlify site/URL, credential filename, older source briefs, and the `scrollcraft/builds/cyravon-hero/` directory remain as clearly documented legacy technical identifiers. No remote, folder, scientific slug, PMID, route, or deployed site was renamed.

Renamed the video production sheet to `docs/ONIMACHAIN-12-SECOND-VIDEO-EXPLAINERS.md`, updated current Scroll Craft records and `HANDOFF-SEND.md`, and replaced the placeholder-brand language. Verification: `npm run typecheck`, all 14 `npm run test:payments` checks, `npm run build`, `git diff --check`, SSR metadata/manifest checks, Playwright home/about desktop plus about mobile checks, and the full 28-route desktop/mobile sweep passed. No page errors or horizontal overflow. Visual evidence: `shots/evidence/onimachain-home.png`, `onimachain-about.png`, and `onimachain-mobile-about.png`. Existing >500 kB Vite chunk warning remains. Work is local and uncommitted; nothing was deployed.

## Seedance explainer production sheet — 2026-09-22

Added `docs/ONIMACHAIN-12-SECOND-VIDEO-EXPLAINERS.md`: fifteen plain-language 12-second voiceover scripts, product-specific animated-character scene prompts, a shared OnimaChain visual prompt, timing template, 4:5 website export specification, safety/claim guardrails, and primary source notes. Dialogue ranges from 21–27 words and was mechanically count-checked. The file identifies a production mismatch: the existing `tools/encode-videos.mjs` trims raw clips to 10 seconds, so it must be changed to 12 seconds or supplied a separate 10-second web cut before these masters are imported. No video files were generated and the encoder was not changed.

## Molecule-accuracy and collection-depth pass — 2026-09-22

Local and uncommitted; not deployed. Replaced card-level domain rigs (the repeated metabolic hoop and somatotropic particle burst) with `src/scenes/card/CardMoleculeScene.tsx`, a quiet structure-first scene using textured LOD-1 geometry, restrained rotation, and directional/rim lighting. Static sequence art now renders only when WebGL is unavailable, so it no longer doubles the live molecule. Card particles/aurora were slowed and dimmed, the molecule was enlarged, multi-hue magenta/orange/yellow/teal edge light was added, and all card titles remain single-line.

Corrected and expanded molecular records in `src/data/compounds.ts`: GHRP-2 sequence/stereochemistry/amide; full Follistatin 344 canonical sequence; AOD-9604 Cys7–Cys14 disulfide; semaglutide, tirzepatide, and retatrutide full sequences and key modifications. Added deposited coordinate data in `src/data/conformers.ts`: semaglutide PDB 7KI0 chain P, tirzepatide PDB 7FIM chain P, retatrutide PDB 8YW5 chain P, and AlphaFold P19883 v6 for Follistatin 344. PDB-unresolved C-terminal tails are modeled from verified sequences and labeled as such. Mixtures/blends/pending entries no longer receive fake placeholder molecules; they show “No single molecule.” Provenance labels and the structure-source panel now match the actual renderer. Audit trail: `docs/MOLECULE-SOURCES.md`.

Rebuilt `PortalTitle.tsx` as SVG lettering clipped from repeated A/C/G/T sequence rows; it retains a restrained moving current but no longer uses the generic aquarium font treatment. Reworked Constellation into a defined related-products map: only same-topic products orbit the selected center, connection strength reflects shared catalog labels, a legend explains the encoding, planet controls have texture/depth, and plain language states that the map does not recommend combinations.

Verification: `npm run build` passed (PMID verification, pulse seed, TypeScript, production Vite bundle; only the existing >500 kB chunk warning). `tools/portal-visual-check.mjs` passed at 390 and 1440 px with no page errors or horizontal overflow, all 36 products reachable, selected-product sync, Cerebrolysin/title fit, Quick View canvas, and disabled checkout. Targeted screenshots confirm Semaglutide, GHRP-2, AOD-9604, Follistatin 344, GLP3, Portal title, and Constellation. Evidence is in `shots/portal-refresh/`.

## Atmosphere heading restraint — 2026-09-22

User found “its own atmosphere” too bright and shiny. In `src/styles/app.css`, replaced the mirror-like foil texture and strong double bloom with a matte smoked-aqua gradient, restrained outline, softer/slower glow, and a quiet bone treatment for “Every molecule has.” Desktop/mobile screenshots: `shots/portal-refresh/atmo-muted-*.png`. Text fits at both sizes; TypeScript and production Vite build passed. Local preview restarted on port 8083. Uncommitted and not deployed.

## Payment foundation follow-up

User chose Stripe and requested a backend prepared for multiple processors, not live checkout. Added a provider-neutral contract/registry, Stripe test adapter, authenticated test checkout endpoint, signed Stripe webhook endpoint, server-only empty catalog, PostgreSQL order/event/outbox migration and repository. Orders are persisted before processor calls; row locking and stable keys protect retries; paid status cannot be downgraded. Webhook and outbox writes share a transaction. Additional processors plug into the same contracts but are not implemented.

Configuration defaults disabled and rejects live keys/events. UI checkout remains disabled. No credentials, cloud database, processor account, external webhook, deployment, or commit created. Setup/limitations: `docs/PAYMENTS-SETUP.md`. Dependencies: `stripe`, `pg`, `@types/pg`; package lock updated.

Verification: 14 offline payment tests, TypeScript, production Vite build, and `git diff --check` passed. Payment-secret configuration identifiers are absent from the client bundle. `tools/payments-db-test.ts` provides explicit opt-in tests for PostgreSQL concurrency/transactions; not executed because no dedicated test database was supplied. Real Stripe sandbox round trips are also pending. npm audit reports six high findings in the existing Netlify/image-tooling chain; no automatic fixes offered. Do not describe this foundation as production-ready.

Next: review locally; when requested, configure a dedicated test database and Stripe test secrets securely, migrate schema, add approved test SKUs, run DB and Stripe sandbox integration checks. Live launch additionally needs approved catalog/prices, taxes/shipping/inventory, browser checkout, abuse controls, fulfillment worker, refunds/reconciliation/operations. Earlier payment-blocker section below records the pre-foundation state and is superseded by this update.

## State

Work is local and uncommitted. Nothing deployed this turn. Existing dirty `public/pulse.json` and `src/data/verified.json` were preserved byte-for-byte around the full build. Starting HEAD: `a2160b8`.

## Implemented

- `src/components/CompoundCard.tsx`, `src/motion/useFitText.ts`: fit long product names on one line; bound the fitting loop and measure text rather than a transformed full-width box. Remove technical card abbreviations.
- `src/styles/app.css`: brighter topic image chambers, neon rims, slow image drift and light movement; glass-water lettering, raised map groups, connected glass spheres, dimensional connection and study cards. New effects respect reduced motion.
- `src/components/PortalTitle.tsx`: separate optical-glass face from extruded lettering and suspended molecule overlay.
- `src/routes/signal.tsx`: replace eleven-row table with all 36 selectable names grouped by topic; keep constellation nodes within selected filter; simplify interface and empty-state language; fit selected product title.
- `src/scenes/quick/QuickScene.tsx`: 24-second cycle: hold 12s, separate 4s, drift 2s, reassemble 5s, settle 1s. Slower rotation, directional/rim lighting, reduced-motion handling.
- `src/scenes/chain/ChainRenderer.tsx`: stronger existing procedural surface normals, without changing molecular geometry/data.
- `src/components/CommerceChrome.tsx`: plain-language details with wrapping; native disabled checkout and honest ordering status.
- `src/data/domains.ts`, `src/routes/index.tsx`: simplify weight-topic tagline and homepage search title/description.
- `tools/portal-visual-check.mjs`: repeatable desktop/mobile interaction checks and screenshots.

## Verification

- `npm run build`: passed including source verification, seed step, TypeScript, and production bundles. Pre-existing generated data restored afterward.
- `npm run typecheck` and `npx vite build`: passed after subsequent component/copy refinements.
- `node tools/portal-visual-check.mjs`: passed at 390 and 1440px: four views, topic filter, selected-name sync, all 36 names reachable, Cerebrolysin fit, Quick View canvas, cart disabled checkout, no page errors/overflow.
- All 36 shop headings fit at 320, 768, 1440px.
- `node tools/route-sweep.mjs http://localhost:8083`: 28 routes at two viewport sizes, no horizontal overflow. Initial desktop home console errors during concurrent dev/build were not reproducible on clean rerun; no page errors on rerun.
- Local `/api/pulse` returns 404; client falls back to saved snapshot. Deployed `/api/pulse` returns 200 JSON; `/signal` and `/learn` return 200 HTML. This is not a production news outage.
- Reduced-motion: topic image and Portal connection animations resolve to `none`.
- Screenshots: `shots/portal-refresh/`; broad route screenshots: `shots/sweep/` (local evidence, not committed).
- Preview: `http://localhost:8083/signal` (Vite session started for this task).

## Payment blocker / next steps

There is no payment backend: cart is browser-local, prices are `$XX.XX`, no payment-session/order/webhook endpoints or processor integration were found. Never present this as checkout-ready. Asked user which merchant processor is approved for this catalog; awaiting answer. Do not request secret keys in chat.

Before accepting money: merchant/provider confirmation for actual products; final SKU/price/shipping/tax decisions; server-owned pricing and order records; hosted payment session; verified/idempotent webhook fulfillment; sandbox success/cancel/decline/retry tests. Credentials must be configured securely on hosting. Current catalog claims and product eligibility still need substantive review; this visual pass does not validate health claims or legal compliance.

Review local visuals with user, then obtain direction to publish. No commit or deployment was made. Technical study titles are preserved; the plain-language pass addressed browsing/cart/Portal interfaces, not every scientific document.
