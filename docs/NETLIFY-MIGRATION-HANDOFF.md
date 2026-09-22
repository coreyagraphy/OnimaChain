# OnimaChain — Netlify account migration handoff

Prepared 2026-09-22 for Grok. **Preparation only:** this work did not deploy, create or link a Netlify site, change DNS, or delete the existing site. Do not copy secret values into this document or Git.

## Source and current site

| Item | Confirmed value |
| --- | --- |
| Local project root | `C:\Users\corey\Projects\cyravon\cyravon-app` (legacy folder name; not public branding) |
| Git repository | `https://github.com/coreyagraphy/OnimaChain.git` |
| Branch to import/deploy | `codex/research-intelligence-foundation` — **not `main`**. At audit start it was six commits ahead of `main`; verify again at cutover. |
| Audit-start HEAD | `0b60f4d61530464dbf85af67582d5c4444874ce9`. The final migration-prep commit will be recorded in the verification report and task response. |
| Existing Netlify project | `cyravon`, site ID `a9d4e072-46d2-447d-b491-58f6882bf167`, URL `https://cyravon.netlify.app` |
| Existing custom domain | None returned by Netlify's site listing on 2026-09-22. Domain hookup is a separate future step. |
| Existing Git integration | Netlify's site listing returned no repository URL/build settings; prior handoff records describe CLI deploys. Do not assume pushing Git updates this old site. |

The repo, branch, site name/ID, and deployed production state are separate facts. A build from this branch was **not** deployed during this preparation. Check the old site's current deploy and the new branch HEAD independently before cutover.

## Exact build recipe and Netlify-specific configuration

1. Import the GitHub repository into the **new** Netlify account, with base directory at the repository root and production branch `codex/research-intelligence-foundation` unless the owner first merges that branch intentionally.
2. Use Node **22** (`NODE_VERSION = "22"` is tracked in `netlify.toml`) and **npm 10** with the committed `package-lock.json` (lockfile v3). Install with `npm ci`; `.npmrc` sets `legacy-peer-deps=true`. The full build was verified locally with Node 22.23.2 and npm 10.9.9.
3. Build command: **`npm run build`**. It runs `verify-pmids`, `pulse:seed`, TypeScript, and Vite. The first two steps contact research sources and regenerate `src/data/verified.json` and `public/pulse.json` inside the build workspace. A failed Pulse refresh keeps the prior committed seed; inspect build logs rather than assuming that a successful deploy means the feed refreshed.
4. Publish directory: **`dist/client`**. Do not change it to `dist`, repository root, or `public`.
5. `vite.config.ts` loads `@netlify/vite-plugin-tanstack-start` and bundles the SSR graph for production. This plugin generates the TanStack Start SSR Netlify Function and framework routing rules. Preserve the plugin and the generated function artifacts; this is **not** a static-only SPA.
6. `netlify/functions/` is the standard Netlify Functions directory. There is no tracked `[[plugins]]` block, `_redirects`, `_headers`, custom domain file, or Edge Function. The old site's API listing returned **zero site plugins**. The installed Vite adapter is a **build dependency**, not a separately configured Netlify build plugin. Verify the new site's dashboard does not add conflicting plugins or build overrides.

Tracked configuration and state inventory:

| File/location | Role |
| --- | --- |
| `netlify.toml` | Build command, `dist/client`, Node 22. No explicit redirect/header/function override. |
| `vite.config.ts` | TanStack Start/Netlify Vite adapter, SSR bundling. |
| `package.json`, `package-lock.json`, `.npmrc` | Scripts, exact resolved dependencies, npm peer dependency setting. |
| `netlify/functions/*.mts` | Five source functions plus the background collector; helper code under `lib/`. |
| `.netlify/state.json` | **Ignored local state** linked to the old site ID; also contains local development metadata. It is not needed for Git-based deployment and must not be copied or committed. |
| `.env`, `.env.*` | Ignored local variables. Do not copy into Git or handoff documents. Enter only needed values in the new account's environment settings. |
| `public/pulse.json` | Tracked build-time public feed fallback, not a secret. |
| `src/data/verified.json` | Tracked/generated PMID verification snapshot, not a secret. |

### Routing, functions, schedule, and headers

TanStack Start must serve direct deep links (`/claim/...`, `/compound/...`, `/learn/...`, `/watchlist/...`, etc.) through its generated SSR function. **Do not add a generic `/* /index.html 200` rewrite**: it would bypass the server-rendered routes. No handwritten redirects/rewrites are tracked; `/compound/wolverine-blend` has an application-level redirect to the combinations page. Verify deep-link refreshes on the new deploy preview before DNS changes.

| Source | Public path / behavior |
| --- | --- |
| Netlify Vite adapter | Generated TanStack SSR server function and routing rules. |
| `netlify/functions/pulse.mts` | `GET /api/pulse`; reads Netlify Blobs store `pulse`. |
| `netlify/functions/pulse-review.mts` | `GET/POST /api/pulse-review`; requires `PULSE_ADMIN_TOKEN`. |
| `netlify/functions/pulse-collect.mts` | Scheduled every two hours (`0 */2 * * *`); starts the background collector using `PULSE_SECRET`, otherwise runs inline. Configure the secret so it uses the background path. |
| `netlify/functions/pulse-run-background.mts` | Background function invoked at `/.netlify/functions/pulse-run-background`; requires `PULSE_SECRET`. A former `SITE_ID` authorization fallback was removed in this preparation. |
| `netlify/functions/checkout.mts` | `POST /api/checkout`, **test-only and disabled by default**. |
| `netlify/functions/payment-stripe-webhook.mts` | `POST /api/payments/stripe/webhook`, disabled unless sandbox commerce is configured. |

There are no repo-level custom Netlify headers. Individual functions set their own JSON/cache/security headers. Confirm the generated SSR function, scheduled function, background function, and path-bound API functions appear in the new deploy's Functions view. Official reference: [Netlify's TanStack Start setup](https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/) and [Functions directory configuration](https://docs.netlify.com/build/functions/configuration/).

## Secrets and environment audit

Read-only production `netlify env:list --json --context production` on the **old** site returned exactly these configured names: `NODE_VERSION`, `PULSE_ADMIN_TOKEN`, `YOUTUBE_API_KEY`. It did not establish that every function works or expose any values. Local ignored `.env` contains names `PULSE_ADMIN_TOKEN` and `YOUTUBE_API_KEY`. No `.env` is tracked; a tracked-file scan found no common Google/Stripe/PostgreSQL credential patterns. **Never copy old secret values into Git or chat.** Re-enter or rotate them through the new account's protected environment controls.

| Name | New-site action | Secret? | Scope / consequence |
| --- | --- | --- | --- |
| `NODE_VERSION` | Already pinned to `22` in `netlify.toml`; verify in build log. | No | Build setting. |
| `PULSE_SECRET` | **Create a new high-entropy value** before enabling scheduled/background Pulse. Not currently configured on the old site. | **Yes** | Functions only; authenticates collector trigger. Do not substitute the public site ID. |
| `PULSE_ADMIN_TOKEN` | Re-enter or rotate for `/pulse/review` parity. | **Yes** | Functions only; without it admin review is inaccessible. |
| `YOUTUBE_API_KEY` | Re-enter if YouTube collection is wanted, matching old-site behavior. | **Yes** | Build **and** Functions; build-time Pulse seed and scheduled collector both use it. |
| `NCBI_API_KEY` | Optional for NCBI API capacity; absent from the old site's configured production names. | **Yes if used** | Build and Functions. |
| `PULSE_NEWS_FEEDS` | Optional comma-separated feed URLs; absent on old site. | No unless private feeds | Build and Functions. |
| `PULSE_YT_PER_RUN` | Optional build-time YouTube sweep count; absent on old site. | No | Build only. |
| `URL` | Netlify-provided site URL, used by internal function-to-function calls. | No | Do **not** manually hard-code the old URL. Verify it resolves to the new site. |
| `PAYMENTS_MODE` | Leave **unset**. Commerce remains disabled; no inventory/prices have been approved. | No | Do not enable `test` as part of migration. |

The dormant **test-only** commerce foundation additionally reads `PAYMENT_PROVIDERS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `COMMERCE_DATABASE_URL`, `COMMERCE_SITE_ORIGIN`, and `COMMERCE_TEST_TOKEN`. None was returned in the old production environment audit and none is required while `PAYMENTS_MODE` stays unset. If a separate, approved sandbox is later created, these must be entered manually as server-only variables; `COMMERCE_SITE_ORIGIN` and any Stripe webhook URL must use that site's current origin. `COMMERCE_TEST_DATABASE_URL` is for an opt-in local integration test, not production. Do not migrate an old local development database setting from `.netlify/state.json`.

The waitlist is deliberately presentation-only; there is **no form submission, email database, Netlify Form, or email integration** to copy. Keep signup paused until the owner approves storage, privacy copy, and the new account/domain setup.

For scope details, use [Netlify's environment-variable documentation](https://docs.netlify.com/build/environment-variables/overview/). On a fresh site, check both build and function scope and each deploy context; copying only a production value will not necessarily supply deploy previews.

## State, domain, and asset caveats

- Netlify Blobs are **site-scoped**. The old site's `pulse` store currently lists `latest` and hourly `runs/*` keys; no `decisions` key appeared in the 2026-09-22 listing. The new site starts with its own empty store. Before cutover, re-list the old store; if `decisions` exists, export/import it securely outside Git or explicitly accept a review-state reset. The public feed falls back to committed `/pulse.json` until the new scheduled collector writes `latest`. Review empty/missing live-feed state before changing domains. [Netlify Blobs reference](https://docs.netlify.com/build/data-and-storage/netlify-blobs/).
- The old Netlify project has no custom domain in its current site listing. No domain or DNS configuration is tracked in this repository. Coordinate the eventual domain mapping, TLS, and DNS change separately; retain the old project until the owner approves retirement.
- Runtime source contains **no hard-coded `cyravon.netlify.app` URL or old site ID** after this preparation. Historical `HANDOFF-*`, `WORKING_LEDGER.md`, and old `CYRAVON_*` design briefs still mention the former site/brand as records. Do not treat those historical instructions as current deployment configuration.
- Two legacy strings remain intentionally in deployed compatibility code: `src/stores/commerce.ts` migrates old browser cart keys, and `netlify/functions/lib/commerce/stripe.ts` recognizes already-created **test** session metadata. They are stable identifiers, not visible branding. Do not rename them during a hosting move.
- Current public identity is centralized in `src/brand.ts`; the manifest uses OnimaChain. Critical root-relative assets are `/brand/onimachain-wordmark.webp`, `/brand/onimachain-full.webp`, `/favicon.png`, `/apple-touch-icon.png`, `/site.webmanifest`, `/posters/hero.jpg`, `/posters/hero-portrait.jpg`, and `/pulse.json`. Keep the `public/` tree intact and verify 200 responses on the new preview. The Open Graph image uses a root-relative path; check its social preview on the final domain.
- There is no old-site callback URL in the active runtime. If commerce is ever enabled later, `COMMERCE_SITE_ORIGIN` and Stripe's webhook endpoint must be configured for the **new** origin. The currently disabled waitlist must not be interpreted as collecting emails.

## Grok's migration checklist — do this later, not in this preparation task

1. Confirm the final Git SHA and the owner-approved production branch. If deploying `main`, merge the feature branch deliberately first; otherwise select `codex/research-intelligence-foundation` in the new Netlify project.
2. In the new Netlify account, import `coreyagraphy/OnimaChain` from GitHub. Use repository root, `npm ci`, `npm run build`, `dist/client`, Node 22/npm 10. Do not reuse the old site ID or `.netlify/state.json`. Confirm build settings are not overridden in the dashboard.
3. Enter new-site environment variables by **name and correct scope**, not by committing a local `.env`: create `PULSE_SECRET`, re-enter/rotate `PULSE_ADMIN_TOKEN`, and re-enter `YOUTUBE_API_KEY` if keeping that source. Leave payment variables and waitlist collection unconfigured. Confirm protected-secret handling and preview context policy.
4. Build a deploy preview on the **new** site. Confirm the SSR-generated server function and the five source functions, the two-hour schedule, and background collector. Directly refresh `/`, `/claims`, `/learn`, `/compound/bpc-157`, `/research-tools/preclinical-calculator`, and `/api/pulse`; check the other routes with `node tools/netlify-migration-smoke.mjs` using `MIGRATION_SMOKE_URL` set to the preview origin.
5. Check asset/manifest/OG paths, internal links, desktop/phone layout, calculator output, and no browser errors. Confirm the waitlist still says signup is paused and commerce controls remain gated by verified inventory. Check the public Pulse fallback, then run the collector through the authorized review workflow and confirm the new `pulse` Blob store receives `latest`.
6. Re-list the old `pulse` store at cutover. Securely transfer `decisions` if any exist and preservation is required; choose explicitly whether historical `runs/*`/`latest` should be copied or regenerated. Do not place snapshots with private review content in `public/` or Git.
7. Only after owner approval, configure the custom domain and DNS/TLS in the new account. Recheck canonical/social URLs, deep links, API paths, and any future external callback URLs. Keep the old `cyravon` site available for rollback until the new site is accepted. **Do not delete it as part of the migration.**

## Outstanding migration blockers / owner decisions

1. The new account, its GitHub access, domain/DNS ownership, and protected secrets are outside Git and cannot be completed by this preparation task.
2. `PULSE_SECRET` must be generated and set to retain the background collection path; it was not configured on the old site. Without it, the scheduled function falls back to inline collection, which has a shorter runtime and may be incomplete.
3. Netlify Blobs state is not moved with Git. Decide whether to transfer `pulse` review decisions and history or accept a fresh start. Re-audit the key list at cutover.
4. The new deploy preview must prove Node 22 build and generated SSR/function routing in the **new account** before any domain move. A local successful build is not that proof.
5. Payment launch and waitlist activation are separate projects. Keep both disabled during migration.
