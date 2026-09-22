# Research intelligence expansion — checkpoint

Date: 2026-09-22. Working branch: `codex/research-intelligence-foundation`.

## Implemented in this checkpoint

- Canonical `COMPOUND`, `COMMUNITY_STACK`, and `CLINICAL_COMBINATION` types; 35 single-compound core records plus Wolverine as a separate two-component stack. The historical `/compound/wolverine-blend` link redirects to the combinations page.
- Independent research and commerce statuses, product listings, inventory lots, lot COAs, and dated regulatory-record schemas. No product listing, inventory lot, COA, or regulatory record has been fabricated.
- Verified-inventory gate: cards, dossiers, quick view, Explore, Portal of Tides, Shop, cart state, and navigation show no price or purchase action without a matching stocked lot. Existing local cart entries for unverified compounds are not hydrated into the active cart.
- `/shop`, `/watchlist`, `/watchlist/$slug`, `/targets`, `/combinations`, `/coa`, `/research-tools`, and `/research-tools/preclinical-calculator`.
- Ten informational watchlist molecule profiles, each with target mapping, a distinct visual theme, a dated development label, and a primary-source link. New visuals are explicitly conceptual, not measured structures.
- Community component constellations and three sourced clinical-combination records. No unified molecular structure is implied for a mixture.
- Home, primary/footer navigation, and global search links to the new research surfaces.
- Lab-only mouse-study arithmetic with no human, syringe-unit, or dose-preset workflow.

## Verification

- `npm run build` passed, including the PMID verification stage.
- `node --experimental-strip-types --test tools/preclinical-calculator.test.mjs` passed.
- `node tools/research-expansion-test.mjs http://127.0.0.1:8084` passed on 1440 px desktop and 390 px mobile across key routes; checked no overflow, no unverified prices/cart actions, target intersection, calculator example, and Wolverine redirect.
- `git diff --check` passed.

## Important limitations before deployment

1. This is a foundation, not the full sitewide expansion. The older comparison, claims, timeline, saved, and signal data views still need deeper canonical-entity integration and accuracy review.
2. Watchlist profiles have target-concept visuals, not newly verified sequences or experimentally resolved coordinates. Structure provenance says so. Do not describe them as measured molecular structures.
3. Watchlist development labels are dated snapshots. Recheck source, indication, and jurisdiction before release; no blanket regulatory approval badge is published.
4. No product inventory, price, lot certificate, or legal/compliance sign-off has been supplied. All profiles remain informational, and checkout/waitlist signup remain disabled.
5. `Mito Stack` was not populated because its component list was not provided or verified. Do not invent it.
6. The legacy 35-compound copy and its evidence/relationship data need a line-by-line research-vs-commerce and claim-provenance audit before this branch replaces the live deployment.
7. Netlify deployment was intentionally not run for this checkpoint. The live site is unchanged by this branch.

## Resume point

Audit old pages against the canonical registry, complete per-compound target sources and status dates, build the missing sitewide entity views and quality workflow, then review with the owner before merging/deploying. Preserve the existing parallax peptide and logo treatment.
