# Halo gap implementation and evidence — September 24, 2026

## Release boundary

Education changes are in the **full local app**, `C:/Users/corey/OneDrive/Documents/ChatGPT/OnimaChain-integration`, branch `codex/full-site-experience`, based on `284bf641ac8bd4d2ce9bd1a0a426335a72f62b02`. Preview: `http://127.0.0.1:8080`. This is not the earlier port-5173 prototype, staging, or production. PR #1 remains draft. No production deployment, merge, real editorial intake, commerce, invitation or shipment was performed. The final commit is reported in the handoff; this document travels in that commit.

The separate satellite is **partially built**, not implemented for live use. See its status below. Neither site's launch gates are waived by these tests.

## What was preserved

The orange/yellow palette and existing typography, logo, educational profiles, sources, search, identity comparisons, research views, molecular card geometries, six existing activity contents and their useful controls were retained. Quizzes were moved to optional lessons, not deleted or relabeled as Chainforge. Existing quiz progress is preserved. No new catalog or duplicated educational dataset was created.

The old generic molecule lesson remains available through `/learn?activity=molecule`; the primary molecular reference is the enhanced Observatory using the existing sequence geometry/renderer. A pre-existing missing child outlet in `/learn` was corrected so direct `/learn/:slug` URLs actually show their lessons.

## Changed routes and direct checks

The comprehensive unchanged-route inventory remains in `PART-A-ROUTE-RECORD.md`. This table records the changed destinations rather than presenting a menu-only audit.

| Direct URL | Current result / purpose | Verification |
| --- | --- | --- |
| `/observatory` | 200; observation only: plain-English purpose, linked sequence selections, model selection, rotation, isolate, source lens | Desktop, 390px touch-emulated and reduced-motion checks; rendered screenshots; no quiz/timer/score in this route |
| `/observatory?station=molecule` | 200; same molecular workbench | Direct compatibility route retained |
| `/observatory?station=evidence` | 302 → `/learn?activity=evidence` | Browser navigation checked |
| Other old `station` values | 302 → matching `/learn?activity=…` | Existing activity browser regression used old direct links for scale/report/constellation/history |
| `/learn` | 200; Chainforge + Observatory entrances, optional activity and lesson catalog | Desktop/phone, six activity links, no horizontal overflow |
| `/learn?activity=evidence` | 200; four optional fictional cases, feedback/progress/replay | All four answered and replayed |
| `/learn?activity=scale` | 200; preserved size-order lesson | Correct ordering submitted |
| `/learn?activity=report` | 200; preserved fictional report lesson | Field selection and scope answer checked |
| `/learn?activity=constellation` | 200; preserved source-independence lesson | Three reports linked to the same experiment |
| `/learn?activity=history` | 200; preserved discovery lesson | Existing content retained; old route resolves into lesson |
| `/learn/chainforge` | 200; new lazy Babylon/Havok game | All three missions completed through real spatial controls; recording and details below |
| `/learn/:slug` | Existing ten lesson URLs remain; child outlet fixed | All ten direct HTTP URLs 200; no new lesson duplicate |
| `/bond-theory` | 302 → `/learn/chainforge` | Direct HTTP request |
| `/combinations` | 302 → `/learn?activity=evidence&case=3` | Direct HTTP request; fictional study-design lesson, not a stack recommendation |
| `/research-tools`, `/research-tools/preclinical-calculator` | 302 → `/learn?activity=scale` | Direct HTTP requests; no vial/syringe calculation |
| `/coa` | 302 → `/learn?activity=report` | Direct HTTP request; not an actual product COA |
| `/targets` | 302 → `/observatory?station=molecule` | Direct HTTP request |
| `/pulse`, `/pulse/review`, `/timeline`, `/watchlist` | 302 → `/learn?activity=history` | Direct HTTP requests |
| `/compound/wolverine-blend` | 302 → `/learn?activity=evidence` | Direct HTTP request |
| `/shop`, `/waitlist`, `/saved` | Still 302 → `/learn` | Direct HTTP requests; no satellite referral |
| `/account` | Still 302 → `/privacy` | Direct HTTP request |
| `/privacy` | Added exact Chainforge local-progress disclosure and reset behavior | 200; still release-gated draft |
| `/api/checkout`, `/api/payments/stripe/webhook`, `/api/pulse`, `/api/pulse-review` | Still 410 | Direct API GETs and POSTs, not navigation checks |
| `/api/editorial` | GET 200 status; POST 503 until configured and delivery-tested | Actual POST with synthetic correction |
| `/sitemap.xml`, `/robots.txt`, `/pulse.json` | New game in sitemap; retired URLs absent; indexing held; old feed 404 | Direct requests |

Native Netlify aliases were also requested directly with GET and POST: checkout/payment-stripe-webhook/pulse/pulse-review aliases returned 404; `pulse-collect` returned 410. `pulse-run-background` returned the platform’s asynchronous 202 acknowledgement, **not 410**. Its inspected handler contains only the disabled response and no collector import/work; no claim is made that 202 itself proves backend completion. This is local Netlify emulation, not post-deployment verification.

The final direct regression passed 15 retired URLs, 22 core routes, 36 profiles plus their 36 status variants, ten lessons, nine citation routes, the API checks and static endpoints. HTTP success alone is not scientific-content approval.

## Observatory accuracy

The examples use existing sequence-derived geometry, not newly invented measured structures. A bead represents one amino-acid residue, not an atom. Sequence buttons select the matching rendered residue; picking also selects a residue. Isolated beads are enlarged equally and labeled as inspection views. Comparison distinguishes common **drawing** scale from independently fitted illustrations; it explicitly does not claim physical-size measurement, structural alignment or health effects. All selected examples disclose that no deposited coordinates were used. Existing detailed identity/source comparisons remain available.

Static/reduced-motion mode keeps readable sequence selections and provenance. Inactive 3D-only controls are disabled; its independently fitted illustrations are not mislabeled as common-scale models.

## Chainforge implementation

- Real captured-body movement, spring-like steering, momentum/braking, native collisions, validated proximity/speed/identity docking, recoverable mistakes, undo, pause, restart, completion and replay.
- First Connection: four pieces. Crosscurrent: six pieces and a moving shutter. Sequence Shift: eight pieces and two shutters. Guided practice routes go around shutters and avoid previously docked pieces; precision requires manual steering.
- A versioned UTC daily selection chooses among authored missions; it is labeled as such, not advertised as procedural level generation. Local bests distinguish mission version, mode, daily seed and 3D/sequence alternative. No account, upload, leaderboard, health inputs or outcomes.
- Readable HTML inventory, target order, buttons and live status accompany the canvas. Keyboard arrows/WASD, Space, Enter and Escape work; explicit step buttons avoid mandatory dragging. Touch drag is supported. The no-drag sequence alternative is honestly separate from physics gameplay.
- Graphics detection, constructor and initialization failures fall back from WebGPU to WebGL2, then to sequence mode. A local error boundary also handles failed renderer-module loading. Native WGSL is used on the WebGPU path; compiler CDN defaults are disabled. Havok WASM is bundled locally.
- One owned game canvas; existing global Three.js background and smooth scrolling are disabled on the game route. Scene/engine, event handlers and observers are disposed on navigation. The game is silent; no autoplay sound or external media.
- This is fictional sequence-learning, not molecular dynamics, synthesis, folding, binding, clinical benefit or dosing. The learning drawer links to RCSB's primary-sequence explanation.

Optional ghost replay, audio, adaptive difficulty, human retention testing and a native-WebGPU performance signoff are **not implemented/validated**. They are not needed to disguise a quiz as a game; the core spatial loop works without them.

## Dependency decision and size

Audited manifests, lockfile and scene imports before adding tools. Three/R3F/Drei/postprocessing/GSAP/Lenis/d3 were already available. Rapier was already transitive and was not counted as new.

Added Babylon.js core 9.27.1 (Apache-2.0) and Havok 1.3.14 (MIT), after checking the official Havok package/API and license. They enable the missing owned game renderer and rigid-body collision engine. No new image/video generation service was needed. Existing scientific viewers were not rewritten in Babylon.

Modular imports reduced the lazy Chamber bundle from about 7.04 MB to about 1.62 MB minified before compression. Local Havok WASM is approximately 2.09 MB (664 KB gzip in the build report). Both remain a real first-game-load cost; the rest of the site does not eagerly import the game engine. Existing shared bundle size warnings remain, and this is not a blanket Core Web Vitals claim. Production-dependency audit reported zero vulnerabilities; the full development tree previously reported six high findings, not silently remediated by unrelated upgrades.

## Checks actually performed

| Check | Result / limitation |
| --- | --- |
| `npm run build` | Client and SSR production build + TypeScript passed; nine of nine PubMed bibliographic records verified. Metadata checks are not scientific claim review. |
| `chainforge-rules.test.ts` | Four tests: authored inventories/daily determinism, independent docking requirements, recovery/completion/undo/replay, paused-state protection |
| `chainforge-check.mjs` | All 4 + 6 + 8 pieces physically guided/docked; three completion screens; replay and pause; **client-side** navigation disposal checked with a sentinel proving there was no full-page reload |
| `chainforge-controls.mjs` | Keyboard-only precision capture/movement/dock; undo; frozen paused clock; recovery and completion in sequence alternative; local result reset; actual dispatched touch events in a touch-emulated viewport; graphics initialization failure fallback |
| `chainforge-resilience.mjs` | Simulated rejected WebGPU device → real WebGL2; wrong piece physically moved into a slot then rejected/released; actual moving-shutter collision events; exactly one game canvas; no external runtime requests/page errors in that run |
| `observatory-check.mjs` | Selection/readout, comparison counts, isolate/rotation, old quiz redirect, 1440px/390px/reduced-motion layouts |
| `part-a-browser-check.mjs` | Preserved quiz/size/report/source-tracing interactions, quick-view Escape/focus, identity search, closed editorial form, 390px layouts |
| `part-a-check.mjs` | Direct route/API inventory described above |

### Recorded run and measured performance

Actual Playwright browser recording, not a generated demonstration: `test-results/chainforge/chainforge-three-missions.webm` (local, intentionally not a production asset). Screenshots, `performance.json` and `control-results.json` are in the same ignored evidence directory. Observatory screenshots are in `test-results/observatory/`.

Measured 1,200 recent render-frame intervals during the recorded mission run: median **16.6 ms (~60 fps)**, p95 **18.0 ms**. Environment: Windows, Headless Chrome 153.0.8010.12, 1440×1100, local Vite preview, **WebGL2 via ANGLE SwiftShader software rendering**. Although this machine has an RTX 3090 and Ryzen 9 9900X, this measurement must not be described as an RTX hardware-WebGPU result. Other local verification tasks were running; this is a reproducible development check, not a controlled cross-device benchmark.

The touch check uses Chromium touch-event emulation at 390×844. **No physical phone, Safari/iOS, native WebGPU device, screen-reader session, external-user playtest, or production-network performance check was performed.** Do not claim those passed. Broader accessibility and human ease-of-learning/replay appeal remain release-review work.

## Satellite status: partially built

Independent local repository: `C:/Users/corey/OneDrive/Documents/ChatGPT/Halo-satellite`, branch `codex/satellite-foundation`, commit `4c1d0b5cf0dfeb45b2e7edb2539bdc865c493cfb`. Preview: `http://127.0.0.1:8192`. No GitHub remote, hosted staging project, public domain, identity tenant, database, storage, mail or payment provider has been provisioned. This is a new local repository/release history, not a directory inside the education app.

Implemented a local synthetic review workspace with evidence-aware applicants, lifetime 200 approval cap, quarantined test lot, manual review/reservation, idempotent simulated payment, pre-delivery recheck, recall trace and event list. All operational routes/APIs return 503, zero real products are enabled, and production mode refuses startup. No fictitious seller/inbox/COA or real peptide catalog is published. The demo is not production authentication, durable storage or a tamper-resistant audit system.

Six satellite tests passed, including direct closed-route/API requests, missing evidence, territory/use rejection, 200 approvals/rejected 201st, suspension not freeing a historical place, one-process stock checks, duplicate simulated payment, and changed-address/suspension/recall shipment blocking. A browser walkthrough exercised missing-evidence rejection → synthetic review → reservation → simulated payment/delivery → recall, and recorded no external requests. No education-to-satellite links or shared runtime assets were added.

An older private `coreyagraphy/helixa` repo was inspected read-only at `7fd5c1ab917c5b3680f26e652a6575d81622dc51` on `main`; its README describes a 16-compound storefront, discounts and checkout. Its repository homepage is unset. That is not proof of the required gated Halo satellite or of working independent services. It was not changed or republished.

### Roadmap and unresolved prerequisites

1. **Education:** owner review; actual public operator and controlled editorial inbox/sender; real submission delivery test; source-level scientific review; provider/privacy/legal review; physical-device/accessibility and human playtesting. Production held.
2. **Satellite foundation:** owner-supplied brand/domain/legal seller, chosen allowed-use/evidence policy, materials/suppliers, responsible storage/delivery operator, and required legal/quality/operating/commercial reviews. Default 200 lifetime enrollment and Indiana nonclinical in-vitro policy remain proposals, not legal clearance.
3. **Satellite service implementation:** independently provisioned staging/identity with MFA/database/private storage/email, authenticated applications and record authorization, durable transactional stock/enrollment, approved payment adapter, incidents/returns/retention/audit, restore/rollback and separation tests with actual credentials. Current in-memory tests do not prove these.
4. **Separate releases:** review each site's concrete preview, resolve its gates, obtain explicit production authorization. No customer/list import, cross-site sign-in, catalog synchronization, sales links or outreach.

Satellite details and route map: its own `README.md`. Its prerequisites limit live activation, but its remaining implementation stays visible on the roadmap rather than being dropped.
