# Injectable experience index

Implemented November 8, 2026 on `codex/injectable-experiences`, based on the educational site at `82cb374c` (`claude/study-notes`). The repository's `main` is an older storefront-oriented version; do not replace the educational production site with it.

## What is included

- `/experiences`, primary navigation and footer links, and a homepage entry.
- The agreed 21 peptide names, plus a separate 5-Amino-1MQ collection.
- 47 manually reviewed accounts, including benefits, adverse experiences, mixed outcomes and no noticeable benefit. Each compound has a benefit or mixed account and an adverse or mixed account. A mixed account can describe both; these are not independent positive/negative observations.
- Condition/topic and compound search, outcome filters, combination labeling, persistent URL filters, source locators and injection-route evidence.
- Local data and route-specific styling; no remote fetch is required to render or filter the collection, and no animation library was added.

## Evidence and limits

`src/data/experiences.ts` is the source register. Each row contains a source URL, an original-post/comment locator, route evidence, a short paraphrase, and limitations. Source pages were opened and reviewed through web retrieval on November 8. This establishes what the public account says, not identity, authenticity, formulation, medical causation or efficacy. There are 46 Reddit accounts and one YouTube-linked creator account. The creator card is based on his accompanying article and video description; no video transcript was verified. There is no live social ingestion service.

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

Cholesterol follow-up (November 8): the initial collection had no cholesterol coverage, so the user's search correctly returned zero but exposed a research/testing gap. Added three route-explicit original accounts: `r/Semaglutide/1e7rrwn`, `r/Zepbound/1x8d8ju`, and `r/Zepbound_Maintenance/1rn91ou`. These include improved lipid results, a concurrent HDL decrease, nausea, and a later triglyceride increase. Statin use and other confounders remain explicit. Route-ambiguous cholesterol threads were not added. Cholesterol/LDL/HDL/triglyceride aliases now map to a clearly labeled blood-lipid topic; this is related-topic search, not a claim that every account measures every lipid. Search feedback and a results jump appear directly beneath the search box. Tests cover every topic label/alias and every topic/compound selector, including the user's exact query and mobile result navigation.

- `node --experimental-strip-types tools/experiences-test.ts`: corpus integrity, all 22 compounds, outcome coverage, route/source fields, alias matching, multiple-term intersection, negation handling, named-disease gaps, non-peptide separation and invalid filters.
- `node tools/experiences-browser-test.mjs`: desktop/mobile cards, filters, refresh persistence, empty states, category switching, keyboard details, mobile navigation and client errors. Defaults to port 8081; set `EXPERIENCES_TEST_URL` for a deploy preview or production.
- `npm run build`: the repository's PMID verification, TypeScript and Vite client/server build.
- Screenshots are written under ignored `test-results/` for desktop hero, report cards and mobile.

## Deployment target

Plain-English follow-up (November 8): added six reviewed accounts covering worsening knee pain (`1q49nf5`), persistent arm tingling (`1key9j8`), neck/pinched-nerve and shoulder improvement with an early blood-pressure rise (`chg2as`, same author confirms personal injection use in `cihbq1`), new leg/foot swelling (`1sopaju`), absent usual travel-related leg swelling (Outsidethebee comment in `y28l65`), and Ian Leahy's injection experience ([creator article](https://inghh.com/my-experience-with-bpc-157-to-heal-injuries/), [YouTube](https://www.youtube.com/watch?v=qfqPzo9pEag)). Same-author follow-ups count once. The swelling record includes the later resolution and possible dietary explanation; this is not proof of safety. The creator's source includes later oral use and other self-experiments, so benefits cannot be isolated to injections. The card does not reproduce instructions, and discloses course promotion and unsafe practices. Kait Malthaner videos/articles were investigated but not added because the accessible material did not establish all required injection/outcome details together.

Six specific topics now cover knees, shoulders, neck, nerve symptoms, pinched nerves and leg/ankle/foot swelling. Source-specific notes distinguish improvement, no change and worsening within mixed accounts. A nerve-symptom report is not automatically diagnosed as a pinched nerve. Conversational parsing handles the user's phrases, plural/left/right grammar, and sleep, fatigue, concentration and cholesterol expressions. Unknown diseases/body parts remain required terms; negation is preserved except explicit symptom expressions such as “can't sleep” and “no energy.” Parsing runs once per search; no remote AI service or new dependency is required.

The UI shows interpreted topics, compound mentions/counts and match explanations. Compound order is not an efficacy ranking. Swelling queries include condition-specific [NHS guidance](https://www.nhs.uk/conditions/oedema/). Unit and desktop/mobile browser tests cover the exact user examples, paraphrases, multi-symptom intersections, negative phrases, unknown body parts, every topic/alias and compound selector, source/video labeling, mobile overflow, URL persistence and compound-chip filtering.

Only Netlify project `onimachain`, site ID `1823cc58-f887-422f-9dda-3adfb25d5293`, custom domain `onimachain.com`, team `create-ovudczw`. Its previous published deploy `6ac8617511544ce528c5180c` was titled “Plain study notes for 16 peptides.” Never deploy this work to the legacy cyravon site or the separate shop. The original local `onimachain-site` checkout has a pre-existing modified route tree and was left untouched; this work is in `C:\Users\corey\Projects\onimachain-experiences`.
