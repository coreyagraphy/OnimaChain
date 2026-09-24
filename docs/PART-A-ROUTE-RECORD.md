# Part A educational-site route and release record

Visual/interaction follow-up: see [IMMERSIVE-REDESIGN.md](IMMERSIVE-REDESIGN.md) for the new activity entrances, plain-English station names, responsive 3D scenes, card presentation changes and additional checks. The retirement and release policies below remain unchanged.

Review branch: `codex/full-site-experience` in the full OnimaChain repository. Base commit before this pass: `b8c84c20dfc39abb56900c4b1c6dcf8b7595cad0`. Review PR: [#1](https://github.com/coreyagraphy/OnimaChain/pull/1), kept draft. Work and checks below are **local** at `http://127.0.0.1:8080`, not the unrelated `:5173` prototype. No staging deploy, production publish, merge, cache purge, or post-deployment verification has occurred. The repository's public/private setting was not changed.

This is an implementation and test record, **not a release approval**. The public operator name, controlled editorial inbox and sender are not supplied. Contact and privacy remain release-gated; actual inbox delivery, provider/hosting/analytics inventory, conflicts disclosure, source-level scientific review, qualified legal review, and owner sign-off remain open. `robots.txt` disallows indexing in this review build. Do not remove that block as a substitute for these gates.

## Canonical educational routes

`200` means an unauthenticated direct local HTTP GET returned a page; it does not mean its scientific statements have been approved. All rows below were checked through `tools/part-a-check.mjs`, except where a narrower check is called out.

| Route | Decision and what remains | Change / functional destination | Direct check |
| --- | --- | --- | --- |
| `/` | Keep; editorial review pending | Removed sales/waitlist/promotional entry points; Observatory gateway, research library and static sourced-history entry remain | 200; browser gateway visual checked |
| `/explore` | Keep; identity records, not products | Search/sort/grid/list and model preview preserved; prices, variants, cart and benefit summaries removed | 200; browser quick view and search checked |
| `/learn` | Expand | Six direct Observatory station cards plus existing lesson catalog; no registration or health input | 200; desktop/phone visual and station links checked |
| `/observatory` | Keep and expand | Evidence Worlds (4 fictional missions, local progress/replay), Scale Lab, Report Detective, Evidence Constellation, Molecule Explorer and Research Time Machine | 200; interaction checks below |
| `/signal` | Keep topic/identity map; real edge review pending | Benefit/stack framing removed; unreviewed receptor-pair edges withheld; users can still select identities and sources | 200; no claim that an empty relationship map is a completed source atlas |
| `/compare` | Rewrite | Side-by-side identity, sequence and source inventory rather than suitability/effectiveness ranking | 200 |
| `/claims` | Keep as critical-appraisal index | Tracked wording is not presented as reviewed clinical advice | 200 |
| `/claim/$id` | Rewrite template for 2 indexed statements | Exact recorded model/endpoint, candidate citation and illustrative mutation ladder; prior confident interpretation withheld | Both indexed IDs returned 200 |
| `/study/$pmid` | Keep 9 citation records; interpretation review pending | PubMed bibliographic metadata and proposed identity links labeled separately from claim review | All 9 direct variants returned 200 |
| `/compound/$slug` | Rewrite shared template; all outcome summaries held | Identity-only shared copy across cards, quick views, search and previews; labeled model provenance; official/source records and honest empty states | 36 current variants returned 200; legacy blend redirects below |
| `/status/$compound` | Rewrite shared template | Attached product-specific official records only; absent record says **not reviewed**, not **not approved** | All 36 variants returned 200; SS-31 checked directly |
| `/methodology` | Keep/rewrite | Metadata, claim and official-product states separated; review limits and correction process stated | 200 |
| `/coverage` | Keep/rewrite | Counts identity/citation records; no blanket claim-validation count | 200 |
| `/about` | Keep/rewrite; owner disclosure pending | No invented operator, qualification or independence claim; release gate visible | 200 |
| `/contact` | Hold from release pending identity/delivery test | Configurable editorial intake renders closed until real operator, controlled inbox/sender, provider key and verified delivery flag are supplied | 200; form absent in browser; `/api/editorial` checks below |
| `/corrections` | Hold intake from release pending identity/delivery test | Honest empty ledger and same fail-closed editorial form; no invented historical corrections | 200 |
| `/privacy` | Hold from release pending operator/provider/legal review | Describes observed local storage and retired-key cleanup; names unresolved hosting/log/email facts rather than inventing a completed notice | 200 |
| `/terms` | Keep as draft; legal review pending | Removed sales/ordering terms; education-only scope | 200 |

### Profile-by-profile disposition

Each original profile's prior outcome/benefit summary is **HOLD** and no longer rendered by the shared identity template or shared metadata. A 200 response confirms routing, not study-level substantiation. `src/data/commerce.ts` now centralizes identity-only copy, despite its historical filename. The extra 36th route is the new distinct full-length thymosin β4 record.

| Direct profile route | Specific disposition in this branch | HTTP |
| --- | --- | --- |
| `/compound/aod-9604` | Weight-trial outcome summary held; identity only | 200 |
| `/compound/bpc-157` | Recovery pitch held; indexed tendon citation shown as metadata, not clinical proof | 200 |
| `/compound/cerebrolysin` | Mixture/product distinction; efficacy summary held | 200 |
| `/compound/cjc-1295` | No-DAC/formulation uncertainty stated; long-acting trial inference held | 200 |
| `/compound/epitalon` | Sleep/longevity summary held | 200 |
| `/compound/follistatin-344` | Precursor/model distinction retained; muscle outcome held | 200 |
| `/compound/ghk-cu` | Copper complex identity retained; skin/hair outcome held | 200 |
| `/compound/ghrp-2` | Outcome summary held | 200 |
| `/compound/ghrp-6` | Hunger/size/recovery pitch held | 200 |
| `/compound/glutathione` | Outcome summary held | 200 |
| `/compound/hexarelin` | Strongest-in-class claim held | 200 |
| `/compound/humanin` | Anti-aging inference held | 200 |
| `/compound/igf-1-lr3` | Analog identity retained; muscle effect held | 200 |
| `/compound/ipamorelin` | Sleep/recovery/body-composition pitch held | 200 |
| `/compound/kisspeptin-10` | Fertility-treatment implication held | 200 |
| `/compound/kpv` | Calming/inflammation outcome held | 200 |
| `/compound/ll-37` | Broad antimicrobial/wound outcome held | 200 |
| `/compound/melanotan-ii` | Tanning/sexual-effect promotion held | 200 |
| `/compound/mots-c` | Exercise/insulin outcome held | 200 |
| `/compound/nad-plus` | Explicitly not a peptide; precursor/booster outcomes not transferred | 200 |
| `/compound/p21` | Mouse/memory outcome held | 200 |
| `/compound/pinealon` | Memory/healthy-aging pitch held | 200 |
| `/compound/pt-141` | Corrected subject category; Vyleesi record is product/indication-specific | 200 |
| `/compound/retatrutide` | Exact identity, not GLP3 shorthand; trial percentage/pitch held | 200 |
| `/compound/selank` | Calming/country-use claims held | 200 |
| `/compound/semaglutide` | Product-specific FDA records kept; research-material approval not inferred | 200 |
| `/compound/semax` | BDNF/cognition and country-use claims held | 200 |
| `/compound/sermorelin` | Healthy-aging and historical approval claims held | 200 |
| `/compound/ss-31` | Forzinity accelerated-approval record added for Barth syndrome; generic muscle/aging claims held | 200 |
| `/compound/tb-500` | Seven-residue fragment (`LKKTETQ`) distinguished from full-length protein; study links held pending exact form review | 200 |
| `/compound/tesamorelin` | EGRIFTA product-specific record retained; general body-composition pitch held | 200 |
| `/compound/thymalin` | Mixture identity retained; outcome/country claims held | 200 |
| `/compound/thymogen` | Foreign-use/immune-support claims held | 200 |
| `/compound/thymosin-alpha-1` | Broad approval/signaling claims held | 200 |
| `/compound/tirzepatide` | Product-specific FDA records retained; unsupported current-label extras and consumer pitch removed | 200 |
| `/compound/thymosin-beta-4` | New separate full-length 43-residue identity; ovarian-cancer-cell citation scoped to that context | 200 |

### Learning and citation variants

`/learn/how-internet-claims-mutate` remains interactive (200); the BPC-157 and thymosin β4 wording ladders are labeled as abstract text plus illustrative later wording, not as reviewed efficacy claims. These nine direct routes each returned 200 but remain **previews, not working lessons**: `/learn/how-animal-research-works`, `/learn/what-in-vitro-means`, `/learn/why-replication-matters`, `/learn/correlation-vs-causation`, `/learn/how-peptides-interact-with-receptors`, `/learn/why-source-independence-matters`, `/learn/reading-a-research-paper`, `/learn/understanding-clinical-trial-phases`, `/learn/research-vs-anecdote`. The Learning Lab does not link them as open experiences.

All nine indexed `/study/$pmid` routes returned 200 for PMIDs `21030672`, `42542926`, `41754849`, `40789979`, `40756949`, `34170491`, `32245208`, `36706591`, `41235866`. The build rechecked **citation metadata only** against NCBI on 2026-09-24 UTC. No full-text interpretation or independent-replication review is implied. Claim routes checked: `CLAIM-BPC157-TENDON-REPAIR` and `CLAIM-TB4-CELL-MIGRATION`.

## Retired routes and deliberate replacements

Every row was a logged-out direct local GET, with redirects disabled in the test client. The literal HTTP location was asserted, not inferred from menus.

| Retired direct URL | Replacement destination | HTTP |
| --- | --- | --- |
| `/shop` | `/learn` | 302 |
| `/waitlist` | `/learn` | 302 |
| `/bond-theory` | `/observatory?station=evidence` | 302 |
| `/combinations` | `/observatory?station=evidence&case=3` (fictional “What changed?” mission) | 302 |
| `/research-tools` | `/observatory?station=scale` | 302 |
| `/research-tools/preclinical-calculator` | `/observatory?station=scale` | 302 |
| `/coa` | `/observatory?station=report` | 302 |
| `/targets` | `/observatory?station=molecule` | 302 |
| `/pulse` | `/observatory?station=history` | 302 |
| `/pulse/review` | `/observatory?station=history` | 302 |
| `/timeline` | `/observatory?station=history` | 302 |
| `/watchlist` | `/observatory?station=history` | 302 |
| `/account` | `/privacy` | 302 |
| `/saved` | `/learn` | 302 |
| `/compound/wolverine-blend` | `/observatory?station=evidence` | 302 |

The old Target Atlas and watchlist have **not** been recreated as fully sourced tools. The Molecule Explorer and four sourced historical milestones are working educational replacements, while exact receptor-pair edges and live-feed claims remain held. No personal-goal matching, stack construction, administration calculator, catalog pricing, cart, or ordering UI remains mounted.

## APIs, static output, and actual checks

| Endpoint / asset | Current behavior | Check |
| --- | --- | --- |
| `POST /api/checkout` | unconditional JSON 410 | Direct HTTP 410, handler unit test |
| `POST /api/payments/stripe/webhook` | unconditional JSON 410 | Direct HTTP 410, handler unit test |
| `GET /api/pulse` | JSON 410 | Direct HTTP 410 |
| `GET /api/pulse-review` | JSON 410; historical storage not erased | Direct HTTP 410 |
| `GET /api/editorial` | `{ready:false}` until all real configuration and delivery-test flag exist | Direct HTTP 200 and browser closed state |
| `POST /api/editorial` | JSON 503 while closed; no email sent | Direct HTTP 503 |
| scheduled `pulse-collect` and background runner | Scheduling removed; handlers return 410; not public content | Both handlers invoked directly and returned 410; not asserted through a deployed Netlify scheduler |
| `/pulse.json` | removed stale snapshot | Direct HTTP 404 |
| `/robots.txt` | `Disallow: /` for review build | Direct HTTP 200 and content assertion |
| `/sitemap.xml` | canonical educational URLs, no retired routes | Direct HTTP 200 and content assertion |

Checks actually performed: `npm run build` (NCBI metadata fetch 9/9, TypeScript, client and SSR builds), `npm run typecheck`, `npm run test:payments` (14/14), `npm run test:pulse` (17/17 historical engine tests), `node tools/part-a-check.mjs` (all direct routes/variants/APIs above), and `node tools/part-a-browser-check.mjs` with Chromium (desktop 1440×900 and phone 390×844, reduced-motion setting). Browser interactions covered four Evidence Worlds answers, completion/replay, Scale Lab ordering, Report Detective fields and feedback, Constellation tracing, research quick-view Escape/focus return, search to corrected TB-500 profile, closed contact form, and horizontal overflow on three phone routes. Screenshots were generated locally under `test-results/part-a/` and are not release approval. A comprehensive screen-reader, touch-device, landscape, color-contrast, performance, and full scientific/visual-implied-claim audit is **not yet done**.

## Release gates still open

1. Owner supplies actual public operator name, controlled editorial recipient and verified sender. Configure the function privately, send a real test submission, verify inbox receipt and error handling, then enable `EDITORIAL_DELIVERY_VERIFIED=true`. Never publish placeholders or imply an untested inbox is monitored.
2. Review hosting logs, analytics, cookies, email-provider retention, prior account/order records and any lawful migration/retention duties; finalize privacy, contact, About and terms with qualified legal review. Existing server records were not deleted.
3. Build the full per-claim register required by Part A (exact wording, form, source, model/population, endpoint, limitations, abstract/full text, contrary evidence, reviewer/date, state). The 35 original outcome summaries are held, not approved. Review the remaining official-label excerpts and diagram identities before publishing.
4. Source-review real `/signal` receptor edges and any proposed Target Atlas/watchlist expansion. Current functional teaching stations use fictional examples or documented milestones and do not substitute for that review.
5. Inspect actual staging and production behavior separately, including redirects, APIs, cached share previews, canonical metadata, accessibility and performance; remove the review-build indexing block only on owner-approved publication. No production cache purge or publishing has been authorized.
