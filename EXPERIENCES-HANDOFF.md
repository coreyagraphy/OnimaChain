# Injectable experience index

Implemented November 8, 2026 on `codex/injectable-experiences`, based on the educational site at `82cb374c` (`claude/study-notes`). The repository's `main` is an older storefront-oriented version; do not replace the educational production site with it.

## What is included

- `/experiences`, primary navigation and footer links, and a homepage entry.
- The agreed 21 peptide names, plus a separate 5-Amino-1MQ collection.
- 38 manually reviewed accounts, including benefits, adverse experiences, mixed outcomes and no noticeable benefit. Each compound has a benefit or mixed account and an adverse or mixed account. A mixed account can describe both; these are not independent positive/negative observations.
- Condition/topic and compound search, outcome filters, combination labeling, persistent URL filters, source locators and injection-route evidence.
- Local data and route-specific styling; no remote fetch is required to render or filter the collection, and no animation library was added.

## Evidence and limits

`src/data/experiences.ts` is the source register. Each row contains a source URL, an original-post/comment locator, route evidence, a short paraphrase, and limitations. Source pages were opened and reviewed through web retrieval on November 8. This establishes what the public account says, not identity, authenticity, formulation, medical causation or efficacy. All included accounts are from Reddit. No video transcript was verified, and there is no live social ingestion service.

The source retrieval views sometimes show inconsistent relative ages. Accordingly the page shows the absolute **review date**, not a fabricated publication date or “Today.” Historical reports are retained. Updates require revisiting the specific account and reviewing changes; do not automatically refresh the review date.

Injection must be explicit in the reporter's own account or their linked follow-up. A vial, a dose, or somebody else's guess is not sufficient route evidence. Intranasal-only, oral and cream reports were excluded. A source comparing routes may be included only where its injected experience is explicitly identified. Do not carry nasal effects across to injection.

Examples excluded or narrowed during review:

- `r/Biohacking/1uef3fv`: adverse 5-amino symptoms, but the author's own text did not explicitly identify injection; excluded. The independently route-explicit bruising comment in `1rhzqmr/comment/o9kmije` is included instead.
- `r/Peptides_for_Women/1tpm6bh`: the original KPV nausea post was route-ambiguous; only motovilova's explicit injection account involving both KPV and GHK-Cu was included.
- `r/PeptideForum/1qjtdfv`: nasal reports and route-ambiguous replies excluded; the explicit subcutaneous blend comment is included.
- `r/cfs/1kzfyk6`: search results mixed original-post text with comments. Records were reconciled to the actual authors: humandooodle for energy/itching; Spiritual_Victory_12 for flushing, palpitations and insomnia. No merged fictional narrator.
- Promotional vendor comparison material and unsupported AI-generated explanations in threads were not adopted.

The shortlist is curated, not a measured “top 21” popularity ranking. Counts are coverage, not efficacy or adverse-event rates. Combination accounts are counted once in search results; coverage per compound overlaps. Product names follow the reporter, and unknown CJC formulations remain unknown. Specific conditions with no reviewed report (including fatty liver and cancer) must return a genuine empty state, not a generic peptide recommendation. Disease names are not broadened to body-system benefits. Doses and protocols were not copied into these cards.

## Verification

- `node --experimental-strip-types tools/experiences-test.ts`: corpus integrity, all 22 compounds, outcome coverage, route/source fields, alias matching, multiple-term intersection, negation handling, named-disease gaps, non-peptide separation and invalid filters.
- `node tools/experiences-browser-test.mjs`: desktop/mobile cards, filters, refresh persistence, empty states, category switching, keyboard details, mobile navigation and client errors. Defaults to port 8081; set `EXPERIENCES_TEST_URL` for a deploy preview or production.
- `npm run build`: the repository's PMID verification, TypeScript and Vite client/server build.
- Screenshots are written under ignored `test-results/` for desktop hero, report cards and mobile.

## Deployment target

Only Netlify project `onimachain`, site ID `1823cc58-f887-422f-9dda-3adfb25d5293`, custom domain `onimachain.com`, team `create-ovudczw`. Its previous published deploy `6ac8617511544ce528c5180c` was titled “Plain study notes for 16 peptides.” Never deploy this work to the legacy cyravon site or the separate shop. The original local `onimachain-site` checkout has a pre-existing modified route tree and was left untouched; this work is in `C:\Users\corey\Projects\onimachain-experiences`.
