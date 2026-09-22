# Netlify migration preparation — verification report

2026-09-22. This report covers **local preparation and read-only inspection of the existing Netlify site**. No site was deployed, linked, created, deleted, or given a domain. The operational instructions are in [NETLIFY-MIGRATION-HANDOFF.md](NETLIFY-MIGRATION-HANDOFF.md).

## Source and configuration verified

- Root: `C:\Users\corey\Projects\cyravon\cyravon-app`.
- Remote: `https://github.com/coreyagraphy/OnimaChain.git`; branch: `codex/research-intelligence-foundation`. Audit-start HEAD: `0b60f4d61530464dbf85af67582d5c4444874ce9`; six commits ahead of `main` at inspection. The final handoff commit SHA is reported in the task response (a commit cannot contain its own hash).
- Old Netlify site: `cyravon`, ID `a9d4e072-46d2-447d-b491-58f6882bf167`; site listing shows no custom domain or linked repository details. `.netlify/state.json` is ignored local old-site state, not deployment input.
- Tracked settings: `netlify.toml` specifies `npm run build`, `dist/client`, and Node 22. `vite.config.ts` includes `@netlify/vite-plugin-tanstack-start`; the build emitted `.netlify/v1/functions/server.mjs`. No tracked `_redirects`, `_headers`, `[[plugins]]`, Edge Function, or domain configuration. The old site's API listing returned zero installed site plugins.

## Executed checks and results

| Check | Result |
| --- | --- |
| Production build, Node 22.23.2 + npm 10.9.9 | **Pass**: PMID verification 9/9, Pulse seed completed, TypeScript passed, client and SSR bundles built, SSR entry emitted. Existing >500 kB Vite chunk warning remains; it did not fail the build. |
| Calculator math | **31/31 pass** (`npm run test:calculator`). |
| Calculator browser UI | **9/9 pass** (`npm run test:calculator:ui` against local dev server). Includes 320/390 px layout, keyboard/screen-reader names, unit conversion, and safety boundaries. |
| Pulse engine | **17/17 pass** (`npm run test:pulse`). |
| Disabled/test-only payment foundation | **14/14 pass** (`npm run test:payments`). No database/Stripe round trip was attempted. |
| Route and desktop/mobile smoke | **Pass**: 34 routes at 1440 px and 390 px; successful responses, main headings, no page errors, no horizontal overflow, no failed loaded images. A pre-existing `/coverage` table overflow was fixed, then the full sweep passed. |
| Internal broken-link and required-asset check | **Pass**: 99 unique internal link targets and 8 critical static assets returned successfully. External research/citation sites were **not** exhaustively crawled; they are not old-site dependencies. |
| Stale-brand and old-host search | **Pass for active public code**: no hard-coded `cyravon.netlify.app`, old site ID, or `SITE_ID` authorization fallback in `src/`, `netlify/`, `public/`, `vite.config.ts`, or `netlify.toml`. Two old-brand tokens remain intentionally as browser-cart and test-webhook compatibility identifiers. Historical handoff/brief documents still reference the old name and URL. |
| Secret tracking audit | `.env` and `.netlify/` are Git-ignored; no `.env` file is tracked. A tracked-file scan found no common Google/Stripe/PostgreSQL credential patterns. This pattern scan is not a guarantee against every possible secret format. |
| Git whitespace check | `git diff --check` passed. |

Build-generated changes to `public/pulse.json` and `src/data/verified.json` were restored after verification; they were not hand-edited or included in the preparation commit. The local build saw 196 Pulse events with 0 held; that number is a timestamped build snapshot, **not** a claim about the future new account's live feed.

## Secrets/environment names — values deliberately omitted

The old Netlify production environment listed `NODE_VERSION`, `PULSE_ADMIN_TOKEN`, and `YOUTUBE_API_KEY`. The local ignored `.env` listed the latter two names. For the new site, `PULSE_SECRET` is an additional **new secret** needed for the background collector after removal of a site-ID-based authorization fallback. Optional names are `NCBI_API_KEY`, `PULSE_NEWS_FEEDS`, and `PULSE_YT_PER_RUN`. Netlify supplies `URL` automatically. Commerce keys and database settings are **not** required while `PAYMENTS_MODE` remains unset. The handoff document gives scope and consequence for each variable; no values are in Git or this report.

## Remaining checks for Grok on the new account

1. Confirm that the account has GitHub repository access and imports the intended branch; `main` is behind the inspected feature branch.
2. Enter/rotate secrets in the new account with correct build/function scopes and preview-context policy. Verify Node 22/npm 10 and a clean `npm ci` build in that account.
3. Check the new deploy's generated SSR function, six source functions, schedule, deep-link refreshes, and `/api/pulse`. Local Vite tests cannot prove new-account function deployment.
4. Recheck and explicitly decide what to do with old-site Netlify Blobs `pulse` data (`latest`, `runs/*`, and any `decisions` created before cutover). Git does not migrate it.
5. Check the new preview's assets/social metadata, waitlist-paused state, disabled commerce, and old/new URL assumptions before the owner authorizes a domain switch. Do not remove the old site during the handoff.
