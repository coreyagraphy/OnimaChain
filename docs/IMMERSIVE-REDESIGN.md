# Immersive educational redesign — local review

This follow-up preserves the Part A retirement/API/release policies. It is implemented in the full app on branch `codex/full-site-experience`, after `7c379d89cb8dfc4b14e6fc0ca6e889e0704a00c8`. The commit containing this document identifies the reviewed revision. Preview: http://127.0.0.1:8080/learn. No staging or production publication.

## What changed

| Route/surface | Changes | Preserved |
| --- | --- | --- |
| Shared app shell | Locally hosted Barlow Condensed display type and DM Sans body type; electric orange/yellow lighting, warm focus accents, brighter layered surfaces; navigation promotes Observatory and Source map; persistent Jump in entry | Existing logo, route destinations, search and footer |
| `/` | Immediate hands-on and molecule links during hero; shorter pinned introduction; six activity entrances immediately after hero | Scroll-driven WebGL hero, research sections, source pathways |
| `/learn` | New dimensional activity entrance with six different CSS sculptures; plain-English titles and concrete actions | All six working stations, existing interactive lesson; nine unavailable lessons retained in a collapsed preview list |
| `/observatory?station=evidence` | Plain-English questions, answer feedback, warmer lighting and clearer connection prompt | Four fictional cases, correct/incorrect explanations, progress and replay |
| `/observatory?station=scale` | Selectable/rotatable 3D molecule, cell, tissue and person illustrations | Keyboard-operable ordering, explanatory units, checked answer |
| `/observatory?station=report` | Selectable 3D report layers synchronized with the analytical-field explanation; simplified definitions | Fictional report, report-scope question, no dosing or safety endorsement |
| `/observatory?station=constellation` | 3D article/data model; selected report and traced connections reflect task state | Three reports/one experiment lesson and replay |
| `/observatory?station=molecule` | Bond highlighting and a conceptual shape change tied to labeled controls | Rotate/static controls and explicit illustrative-geometry disclaimer |
| `/observatory?station=history` | Selectable 3D timeline portals synchronized with milestone selection | Four dated milestones and original source links |
| `/claims` | Dimensional editorial opening and prominent direct challenge link; phone citation badges wrap | Tracked-claim status, pending source-to-claim review and citation labels |
| `/explore` and shared compound cards | Larger model area, molecule-specific pose/material variation, thinner chain geometry, amino-acid counts, cleaner type; removed scroll-entry blur | Actual existing coordinates/sequence data, provenance labels, identity-only text, source links and accessible quick view |
| All retired routes/APIs | No policy changes | See the full Part A route record |

Scenes are conceptual teaching graphics, not measurements, molecular predictions, or evidence of efficacy. Card geometry/provenance is unchanged; presentation varies, not scientific identity.

## Checks performed

- TypeScript passes.
- Client/SSR build passes; citation metadata verification returns 9/9. This is metadata verification, not claim approval.
- `tools/part-a-check.mjs`: all direct URL checks pass — 15 retired routes, 20 core routes, 36 profiles plus regulatory variants, 10 lessons, 9 citation routes, retired APIs and static endpoints. Editorial POST remains 503 until configured/delivery-tested.
- `tools/part-a-browser-check.mjs`: all 21 interaction/layout checks pass, including four-case completion/replay, size ordering, report-scope answers, source connections, quick-view Escape/focus restoration, search, and closed contact intake.
- `tools/redesign-check.mjs`: desktop 1440×1000, phone 390×844, and phone reduced-motion runs pass. Checks include all activity entrances, live canvases for four new scene modes, synchronized selection, pause controls, molecule explanation controls, horizontal overflow, and runtime errors.
- Screenshots inspected for desktop/phone learning hub, claims, molecule library, homepage, size explorer, report and history scenes. Captures live in ignored `test-results/redesign/`.
- Found and corrected claims-page overflow, small mobile 3D framing, a card text-fitting override, and stale Vite dependency optimization after adding the lazy scene. Development server restarted and checks rerun.
- Production dependency audit: zero advisories. The full install still reports six high-severity development-tool advisories; no blanket dependency upgrades were applied in this design task.

## Still pending

Owner visual/content review; broad real-device/GPU and screen-reader review; quantitative performance testing; all scientific/editorial/legal and inbox-delivery gates already recorded in Part A. These automated browser checks do not constitute a comprehensive accessibility certification or usability study. Production remains unpublished.
