# Revision 5 overlap and gap audit

**Implementation follow-up (September 24):** This document preserves the pre-build audit. Its “not built/deferred” observations are historical. See [HALO-IMPLEMENTATION-RECORD.md](HALO-IMPLEMENTATION-RECORD.md) for the implemented education changes, tested evidence and separate partially built satellite. Part B is not dropped from the roadmap.

Compared the newly supplied Halo Architecture Revision 5 and Graphics Prompt Revision 3 with the full local app at commit `284bf641ac8bd4d2ce9bd1a0a426335a72f62b02`, branch `codex/full-site-experience`. This is an implementation-planning audit, not evidence of new gameplay, deployment, scientific clearance, or a fresh full regression run.

## Decision

Do not rebuild the six existing activities, create another lesson catalog, or replace the site/framework. The new documents contain substantial repeated work **and a meaningful change of direction**: A12 separates observational reference from actual gameplay. Treat that as a new experience contract, not as a request for another decorative layer on the existing quiz.

Preserve the owner's direct requests: dark layered design with electric orange/yellow alongside the existing cyan/violet, existing useful content, configurable closed editorial intake, and no production publication. Attachment instructions about a private/inaccessible repository are stale context, not authorization to change repository visibility. Part B remains deferred. No repository-access request is needed.

## Reuse, enhance, or build

| Requirement | Evidence in current implementation | Judgment |
| --- | --- | --- |
| Education-only retirement | Existing retired routes, Netlify checkout/webhook/Pulse 410 handlers, route regression script | Preserve and rerun when redirect destinations change; do not rebuild commerce or its removal |
| Identity-only profile copy, TB-500 separation, source labels | Shared compound data/copy, source badge, profile/status/compare routes; prior Part A record | Reuse; source-level scientific review is still separate and incomplete |
| Contact/corrections/privacy | Configurable fail-closed intake and release-gated policies | Preserve; actual operator/inbox/delivery remains an owner-supplied release gate |
| Visual palette, typography and activity entry points | `electric.css`, `ExperienceLaunchpad`, Hero and Nav | Reuse; retain explicit owner orange/yellow direction despite the attachment's cyan/violet emphasis |
| Molecular inspection | `StructureViewer`, `ViewerScene`, shared geometry, source panel, close-up/light/feature controls | Reuse these real tools; do not create a third generic molecule viewer |
| Molecular comparison | `/compare` already compares identity/source inventory and shared sequence substrings | Extend this capability into a visual comparison lens; a table and independently fitted models do not yet satisfy common-scale structural comparison |
| Scale Lab | Interactive category scene, size-order task and explanations | Preserve as an educational activity; current selection is not a continuous physical-scale zoom. Improve understanding rather than adding another sphere scene |
| Report Detective | Selectable fictional report, linked 3D report layers and scope question | Preserve; no second report game or recreated report dataset |
| Source tracing | Existing `/signal` topic/identity map plus fictional three-reports/one-study exercise | Keep purposes distinct. Real reviewed paper-to-claim edges remain a content-review gap; do not fabricate them to fill a scene |
| Research timeline | Four source-linked milestones and selectable 3D portals | Reuse; no new feed or duplicate timeline |
| Research-literacy quiz | Four functioning fictional cases with progress/replay | Retain as optional reading/practice, not the new flagship action game |
| Observatory's new purpose | Current `/observatory` defaults to the evidence quiz and mixes six activity types | Requires refactoring, not another route: inspect/rotate/isolate/compare/source as the primary experience; no score/timer/quiz progression |
| Chainforge | No authored capture/guide/dock game, instrument physics, gates or docking state machine found | The largest genuinely new capability; build one playable game inside Play & Learn |
| Replay systems | Existing quiz completion only | New: three authored missions, practice/precision records, versioned daily layout, local reset, optional recorded-transform ghost; never claim these exist yet |
| Gameplay acceptance | Current browser scripts verify scenes, selections, questions and layout | New: spatial control, recoverable errors, collisions, completion/replay, pause/undo, failure fallback, teardown, recorded actual gameplay and measured performance |

## Tool inventory

`package.json`, `package-lock.json`, scene imports and source searches establish current use of Three.js, React Three Fiber, Drei, postprocessing, GSAP, Lenis and d3-force. Rapier compatibility code is **already present transitively in the lockfile through Drei**; it must not be advertised as a newly introduced dependency. No Babylon/Havok dependency or Chainforge implementation was found in the inspected manifests, source and runtime-asset inventory.

Babylon/Havok is the attachment's conditional candidate, not an installed or validated implementation. Before adoption: verify official APIs, license/WASM distribution, integration and backend fallback; isolate its route and ensure the existing global R3F canvas is not concurrently rendering behind the game. No engine has been installed in this audit. Supporting generated media is unnecessary until a specific visual asset gap is demonstrated; it cannot substitute for gameplay.

## Nonduplicating implementation order

1. **Separate purposes, preserve content.** Keep `/observatory`; reuse `StructureViewer` and the identity/sequence comparison logic. Start with a correctly labeled available example and a clear whole-chain/residue/atom explanation. Keep existing exercise content in the Learning Lab, with compatibility navigation for old `station` query links. Do not delete useful lessons or their progress.
2. **Build Chainforge, not a renamed quiz.** One lazy game route under Play & Learn. Fixed-step game rules; drifting pieces with readable identities, tether capture, guided momentum, brake, actual gate collisions, validated docking, recoverable mistakes, finish and immediate replay. Fictional sequences and instrument forces must be clear. Begin with the four-piece teaching mission, then complete the distinct six-piece gate mission and longer sequence mission before claiming the specified game is finished.
3. **Fill the understanding gap in the Observatory.** A sequence-to-structure selection link, part isolation and a provenance lens. Enable common-scale comparison only when compatible coordinate units and coverage are established; label alignment separately. Sequence-derived illustrations cannot become measured structures by sharing a camera. No outcome or binding score.
4. **Add replay and prove behavior.** Versioned authored daily templates, separate local practice/precision records, reset and accessible sequence-assembly alternative. Measure supported graphics paths and test initialization failure, navigation disposal and actual control input. Keep human ease-of-learning and replay appeal unvalidated until observed playtests occur.
5. **Update only affected destinations and disclosures.** Redirect `/bond-theory` to the new game only after it is playable. Retain `/combinations` as the study-design lesson, and keep calculator/report/history retirement destinations functional when activities move. Update actual local-storage disclosure, search, navigation, sitemap and tests together. No speculative redirects to unavailable content.

## Acceptance boundary

The prior Part A corrections and visual work are useful foundations, not completion of A12. Neither the current animated quiz nor screenshots of 3D objects satisfy the new gameplay contract. Existing development/browser-emulation evidence is not physical-phone performance evidence. Source review, legal review, operator/inbox delivery, owner approval and production publishing remain separate pending decisions.

This audit intentionally changes no application routes, scientific content, dependencies or production state. It prevents duplicate work and identifies the next build's missing capabilities before implementation.
