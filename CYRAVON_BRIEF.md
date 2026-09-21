# CYRAVON

## The Molecular Evidence & Signal Atlas

**Working brand only until final domain and trademark clearance.**

### Primary tagline

**Trace the signal. Follow the evidence.**

### Secondary positioning

**See what research found, what people report, and how the story changed between them.**

---

# 1. YOUR MISSION

You are designing and building the strongest research-first peptide intelligence website possible.

Do not build another peptide encyclopedia.

Do not build another dosing database.

Do not build another vendor directory.

Do not build another generic AI chatbot wrapped around PubMed.

Do not build another site that says "evidence based" while presenting unattributed summaries.

Build an interactive molecular research system that lets a visitor visually trace:

**Compound → target → mechanism → model/species → experiment → result → claim → community report → online propagation → contradiction → current evidence state.**

The site must make sophisticated molecular research understandable to an intelligent non-specialist while remaining genuinely useful to researchers and technically sophisticated visitors.

The product should feel like a combination of:

* an interactive science museum
* a molecular intelligence platform
* an evidence graph
* a research archive
* a public-signal observatory

It must never become a medical-treatment recommendation engine.

It must never transform anecdotes into clinical proof.

At the same time, it must not dismiss or hide what people publicly report.

Community experience is data about **what people report**.

Published research is data about **what researchers observed**.

Regulatory records are data about **what authorities have stated or decided**.

Those are separate evidence classes and must remain separate everywhere in the architecture.

---

# 2. THE PRODUCT THESIS

The internet currently has three disconnected worlds:

### WORLD A — Published Research

Papers, trials, animal studies, mechanistic work, regulatory actions.

### WORLD B — Real-World Conversation

YouTube videos, Reddit discussions, TikTok clips, podcasts, forums, interviews, personal experiences.

### WORLD C — Internet Claims

Statements that become simplified and amplified:

"Improves tendon repair."

becomes:

"Heals tendons."

becomes:

"Heals injuries."

becomes:

"Rapid full-body healing."

CYRAVON's job is to connect those worlds without pretending they are equivalent.

The site's central question is not:

**"Does this peptide work?"**

It is:

# "Where did this claim come from, what does the evidence actually say, what are people reporting, and how independent are those reports?"

That is the product.

---

# 3. THE MOAT STACK

Individual competitors already possess pieces of this architecture.

Therefore no single feature below should be marketed internally as the moat.

The moat is the **combined provenance graph** and the structured historical dataset that accumulates behind it.

## MOAT 1 — CLAIM LINEAGE

Every important claim receives a canonical Claim ID.

Example:

`CLAIM-BPC157-TENDON-REPAIR`

The system records:

* earliest research source found
* exact experimental result
* species/model
* original wording
* subsequent papers citing or testing it
* review articles
* first major public explanations detected
* YouTube/social references where permitted
* community reports
* marketing-language mutations
* contradictory/null findings
* current evidence state

Create an interactive:

# Claim Lineage Map

Example:

Research paper
↓
review article
↓
podcast explanation
↓
YouTube creator
↓
Reddit discussion
↓
short-form video
↓
vendor/blog wording

Users should be able to visually watch a claim travel.

---

# 4. CLAIM MUTATION

This is a signature experience.

Show how language changes while a claim propagates.

Example:

### Source finding

"Improved tendon fibroblast outgrowth in this experimental model."

↓

### Secondary summary

"May support tendon regeneration."

↓

### Social interpretation

"Helps injured tendons heal."

↓

### Viral version

"Heals tendon injuries fast."

Do not call this misinformation automatically.

Call it:

## Claim Mutation

Classify transformations such as:

* faithful paraphrase
* broader extrapolation
* species omission
* uncertainty removed
* mechanism converted into outcome
* association converted into causation
* magnitude amplified
* context removed
* unsupported addition
* contradictory interpretation

Every classification must link to its source texts.

---

# 5. ECHO DETECTION

This is critical.

Ten thousand posts do not automatically equal ten thousand independent observations.

Create:

# Signal Independence

Every social/community item receives lineage metadata.

Attempt to distinguish:

### Independent origin

First-person experience containing unique contextual details.

### Response

A person responding to another account.

### Repost / quotation

Same underlying account repeated elsewhere.

### Derivative claim

Content that appears derived from another creator/source.

### Near duplicate

Highly similar wording.

### Unknown relationship

Not enough information to determine independence.

Never silently count all mentions as independent.

Show:

**2,184 mentions**

then underneath:

**Estimated independent origin clusters: 418**

Never call that number "418 people experienced this" unless that is actually established.

---

# 6. SIGNAL INTEGRITY FINGERPRINT

Do not produce one simplistic "truth score."

For every major community claim, display a multidimensional fingerprint.

Dimensions:

* source diversity
* independent-origin diversity
* first-person proportion
* documentation present
* co-intervention prevalence
* source concentration
* duplication/echo level
* time dispersion
* platform diversity
* promotional/affiliate contamination
* identifiable outcome description
* follow-up availability

Visualize this as a radial fingerprint or horizontal matrix.

Example:

**Tendon Recovery — Community Signal**

Source diversity: HIGH
Independent origins: MODERATE
Documentation: LOW
Co-interventions: HIGH
Echo contamination: MODERATE
Cross-platform recurrence: HIGH
Follow-up reporting: LOW

Do not collapse this into "8.2/10."

---

# 7. EVIDENCE GENOME

Every compound gets a research fingerprint showing where its evidence actually lives.

Dimensions:

* in vitro
* mouse
* rat
* other animal
* observational human
* case report
* Phase I
* Phase II
* Phase III
* approved indication if applicable
* replication
* independent research groups
* mechanistic evidence
* safety characterization
* research age
* research concentration by laboratory

This is descriptive.

It is not a "works/doesn't work" score.

---

# 8. TRANSLATION GAP

Build an interactive:

**Cell → Mouse → Rat → Larger Animal → Human → Controlled Human → Approved Use**

For each claimed outcome, show exactly how far the research has traveled.

Different claims for the same compound may have completely different translation paths.

Example:

A compound cannot simply be labeled "preclinical."

Instead:

**Tendon repair**
Mouse → Rat

**Gastrointestinal mechanism**
Cell → Rat

**Human safety**
Small human study

This granularity matters.

---

# 9. SCIENCE ↔ SIGNAL CONVERGENCE

For each outcome theme, place two separate lanes next to each other.

### RESEARCH LANE

What controlled research has investigated.

### HUMAN SIGNAL LANE

What people publicly report experiencing.

Then compute relationships, not conclusions:

* strong thematic overlap
* partial overlap
* community-only theme
* research-only theme
* contradictory pattern
* insufficient mapping

Example wording:

> A recurring community theme involving tendon recovery overlaps with a substantial preclinical research theme. The two evidence classes are shown separately because overlap does not establish human efficacy.

This is the appropriate language.

---

# 10. CONTRADICTION ENGINE

Do not hide disagreement.

Make disagreement interesting.

Create:

## What Doesn't Fit?

For every claim:

* supporting research
* null findings
* conflicting research
* methodological criticism
* reported experiences that differ
* contradictory regulatory interpretation
* unresolved questions

The site gains credibility by surfacing contradiction without editorial sensationalism.

---

# 11. EVIDENCE DRIFT

Every major claim must be versioned.

Create a timeline:

**What we could responsibly say in 2023**

vs.

**What changed in 2025**

vs.

**What changed in 2026**

Record:

* new studies
* new trials
* corrections
* retractions
* regulatory decisions
* new safety records
* major new community-signal clusters
* reclassification decisions

Users can click:

# "What changed?"

and see a before/after diff.

Never silently rewrite history.

---

# 12. SOURCE CONCENTRATION

Ten papers from one laboratory are not the same as ten independent replications.

Every evidence view must expose:

* authors
* institutions
* laboratory/research-group clustering
* funding when available
* recurring author networks
* independent replication count
* citations between papers

Create:

## Research Independence Map

This should visually reveal whether a literature base comes from:

1 lab,
3 labs,
or 20 independent groups.

---

# 13. CLAIM INSPECTOR

Global input:

> "What are people saying about BPC-157 and tendon repair?"

or:

> "Does TB-500 improve wound healing?"

The response must not simply be generated by an LLM.

The system should construct its response from graph entities.

Return:

### Claim

Normalized claim.

### Research footprint

Relevant studies/models.

### Human signal

Relevant public reports.

### Independence

How many unique origin clusters vs echoes.

### Convergence

Where research and reports overlap.

### Contradictions

Material conflicting evidence.

### Translation state

Species / study progression.

### What remains unresolved

### Sources

Direct provenance.

Any AI-generated synthesis must be reproducible from the underlying structured records.

---

# 14. EXPERIENCE CONSTELLATIONS

This feature survives from the previous design but becomes more rigorous.

Community reports appear as points in a 3D/2D constellation.

Cluster by:

* body area
* stated research goal
* reported observation
* compound
* combination
* duration category
* concurrent interventions
* source platform
* date

Color/shape differentiates:

* independent-origin candidate
* derivative discussion
* documented report
* unclear provenance

Click a star/node to open the source card.

Never use visual prominence to imply truth.

---

# 15. STRUCTURE PROVENANCE

The 3D molecules cannot become decorative misinformation.

Every structural visualization must say what it represents:

* experimentally resolved structure
* database structure
* predicted model
* sequence-derived visualization
* conceptual visualization

If no defensible molecular structure exists, do not pretend a beautiful predicted model is experimentally measured.

This transparency becomes part of the brand.

---

# 16. CORE NAVIGATION

Desktop primary navigation:

**Explore**
**Claims**
**Signal Map**
**Compare**
**Timeline**
**Learn**

Right side:

Search
Saved
Methodology

Mobile:

Bottom or compact drawer navigation.

Search remains globally accessible.

---

# 17. HOME PAGE

The home page is cinematic but not slow.

## HERO

Dark near-black environment.

One large molecular structure floats in true depth.

Mouse movement produces subtle parallax.

Scroll causes the camera to move through the structure.

Headline:

# Trace the signal.

# Follow the evidence.

Subhead:

**Explore how molecular research, human reports, and internet claims connect—and where they don't.**

Primary CTA:

**Explore the Atlas**

Secondary CTA:

**Inspect a Claim**

Small line:

**Research and educational information. Evidence classes remain explicitly separated.**

---

## HOME SECTION 2 — THE THREE WORLDS

Three giant interactive panels:

### WHAT RESEARCH FOUND

Published experiments, models and trials.

### WHAT PEOPLE REPORT

Structured public experience signals.

### HOW CLAIMS TRAVEL

See how scientific findings become internet narratives.

Hovering creates animated lines between them.

---

## HOME SECTION 3 — FEATURED CLAIM TRACE

Use BPC-157 tendon repair as a demo fixture.

Show:

Paper
→ interpretation
→ social discussion
→ community signal

Animate the transformation.

CTA:

**Trace this claim**

---

## HOME SECTION 4 — EXPLORE COMPOUNDS

Large minimal cards.

Each shows:

compound name
evidence distribution
most-discussed research themes
latest meaningful change
community-signal presence

No vendor pricing.

No dosing.

No "best peptide for X."

---

## HOME SECTION 5 — LIVE RESEARCH PULSE

Show:

New studies indexed
Trials changed
Regulatory records changed
Claims materially changed
New source clusters

Every item has a timestamp.

---

## HOME SECTION 6 — WHY CYRAVON EXISTS

Copy:

> The same molecular claim can appear in a paper, a podcast, a Reddit story and hundreds of short-form posts. Those are not the same kind of evidence. Cyravon connects them without collapsing them together.

---

# 18. EXPLORE PAGE

Route:

`/explore`

Hero:

# Explore the Molecular Atlas

Universal search.

Filters:

* compound class
* research domain
* evidence type
* species
* human research present
* regulatory status
* community signal available
* recently changed
* research decade

Views:

Grid
Dense table
Evidence map

Sorting:

Alphabetical
Most researched
Recently changed
Most discussed
Newest human research

Avoid "best."

---

# 19. COMPOUND DOSSIER

Route:

`/compound/[slug]`

This is the flagship page.

## SECTION A — Immersive molecular header

Left:

compound identity
aliases
sequence where appropriate
molecular weight
classification
current research state

Center/right:

interactive structure.

Buttons:

View structure
Compare
Save
Share

---

## SECTION B — Snapshot

Cards:

**Research footprint**

**Human signal footprint**

**Translation state**

**Latest meaningful change**

**Regulatory snapshot**

Each expands to provenance.

---

## SECTION C — Evidence Genome

Interactive visual.

Click each evidence class to reveal records.

---

## SECTION D — Research Themes

Examples:

Tissue repair
GI research
Inflammation
Vascular pathways

These must derive from indexed research rather than SEO keyword generation.

---

## SECTION E — Human Signal

Headline:

# What People Report

Display:

most recurrent reported themes
number of raw mentions
estimated origin clusters
source/platform distribution
time distribution

Prominent line:

**Public reports describe experiences; they do not establish that the compound caused those outcomes.**

Do not make that disclaimer visually punitive.

---

## SECTION F — Signal ↔ Science

Side-by-side convergence interface.

---

## SECTION G — Claim Lineage

Top 5 associated claims.

Open full claim graph.

---

## SECTION H — Translation Gap

Interactive species map.

---

## SECTION I — Research Independence

Labs/authors/institutions.

---

## SECTION J — Contradictions

Show unresolved disagreements.

---

## SECTION K — Timeline

Chronological research and public-signal history.

Separate lanes.

---

## SECTION L — Sources

Fully traceable bibliography.

---

# 20. CLAIM PAGE

Route:

`/claim/[claim-id]`

This is potentially the strongest page on the site.

Header:

# "BPC-157 supports tendon repair"

Status underneath:

**Tracked research claim**

Do not label TRUE/FALSE.

Sections:

### Origin

Earliest attributable support currently indexed.

### Original scope

Species, model, endpoint, wording.

### Claim Lineage

Interactive graph.

### Claim Mutation

Before/after wording.

### Research Support

Study records.

### Research Contradictions

Null/conflicting studies.

### Human Signal

What people report.

### Echo Analysis

Independent origins vs derivative mentions.

### Translation State

Where the claim has actually been tested.

### Current interpretation

Constrained synthesis.

### Change History

Every material modification.

---

# 21. SIGNAL MAP

Route:

`/signal`

Global real-world discussion explorer.

Allow filters:

Compound
Outcome theme
Body system
Platform
Date
Positive/mixed/no-effect/adverse/unclear report type
Independent origin/echo/unknown
Documentation present
Single compound/combination

Visual options:

Constellation
Network
Timeline
Heat map

Do not present raw positive percentage without corpus definition.

Every visualization must show:

corpus size
collection dates
platform coverage
known missing coverage

---

# 22. CLAIM INSPECTOR PAGE

Route:

`/inspect`

Large central input.

Examples beneath.

Results are generated from structured evidence.

Allow user to expand:

Research
Human reports
Lineage
Contradictions
Sources

Never answer a clinical question with individualized treatment recommendations.

---

# 23. COMPARE

Route:

`/compare`

Allow up to four compounds.

Rows:

Identity
Mechanisms
Research domains
Evidence Genome
Translation
Human research
Human Signal
Signal integrity
Research independence
Regulatory state
Latest evidence change

Do not declare a winner.

Do not say "best for."

Make comparison descriptive.

---

# 24. OUTCOME / RESEARCH THEME PAGE

Route:

`/research/[theme]`

Examples:

`tissue-repair`
`metabolic`
`inflammation`

Show:

relevant compounds
pathways
research models
claims
community themes
major unanswered questions

This is not:

"Best peptides for tissue repair."

It is:

"Compounds investigated in tissue-repair research."

---

# 25. STUDY DETAIL PAGE

Route:

`/study/[id]`

Display:

title
authors
institution
journal
year
identifier/DOI/PMID
study type
species
sample size if available
intervention
comparison
endpoint
reported result
limitations
funding/conflicts when available
related claims
related compounds
replications
contradictory records

Button:

**Open original source**

Any summary generated by AI must be labeled as a CYRAVON structured summary and traceable to extracted fields.

---

# 26. SOURCE DETAIL PAGE

Route:

`/source/[id]`

Used for social/video/forum/public sources.

Display:

platform
creator/account where permitted
publication date
retrieval date
source type
first-person vs commentary classification
claimed outcome
co-interventions
documentation
potential affiliate/promotion indicators
related origin cluster
related claims
link to original

Never republish entire copyrighted posts/transcripts.

Store/display only what licensing and platform terms permit.

---

# 27. TIMELINE / CHANGE LEDGER

Route:

`/timeline`

Four selectable lanes:

Research
Trials
Regulatory
Public Signal

Every event has:

date
source
what changed
previous state
new state
why it matters
what it does NOT establish

Allow:

"Only show changes that altered a claim interpretation."

---

# 28. LEARN PAGE

Route:

`/learn`

Do not make this generic blog spam.

Interactive lessons:

How animal research works
What "in vitro" means
Why replication matters
Correlation vs causation
How peptides interact with receptors
Why source independence matters
How internet claims mutate
Reading a research paper
Understanding clinical-trial phases
Research vs anecdote

Use interactive graphics.

---

# 29. METHODOLOGY PAGE

Route:

`/methodology`

This page must be unusually good.

Explain exactly:

how sources are collected
how claims are normalized
how reports are clustered
how duplicates are detected
how independence is estimated
how LLMs are used
where humans review data
how corrections work
how regulatory status is dated
how evidence relationships are assigned
known limitations

Publish schema definitions where practical.

Trust is part of the product.

---

# 30. COVERAGE PAGE

Route:

`/coverage`

Show what Cyravon can and cannot currently see.

Example:

YouTube: official API coverage enabled
Reddit: licensed/manual/approved coverage state
TikTok: creator-authorized/manual/approved coverage state
PubMed: indexed
ClinicalTrials.gov: indexed
FDA: indexed
Crossref: indexed

Never imply "the internet says" if the system only sampled three sources.

---

# 31. CORRECTIONS PAGE

Route:

`/corrections`

Public correction ledger.

Every material correction contains:

date
affected record
before
after
reason
source

Never delete embarrassing old interpretations silently.

---

# 32. REGULATORY PAGE

Route:

`/status/[compound]`

Regulatory status must be:

**jurisdiction-specific**
and
**date-specific.**

Separate:

approved use
investigational status
compounding actions
sports restrictions
regulatory warnings
advisory proceedings

Never turn an advisory vote into an approval.

Never turn "not prohibited" into "approved."

---

# 33. GLOBAL SEARCH

Search:

compounds
aliases
claims
targets
pathways
research themes
studies
authors
institutions
public-signal themes

Results grouped by entity type.

Keyboard shortcut:

`CMD/CTRL + K`

---

# 34. MODAL SYSTEM

Design all of these.

## 1. Global Search Modal

Command-palette experience.

## 2. Compound Quick View

Identity + evidence footprint + latest change.

## 3. Study Quick View

Key study metadata and result.

## 4. Claim Quick View

Canonical claim and current evidence footprint.

## 5. Citation Modal

Source information and exact relationship to displayed claim.

## 6. Provenance Modal

Shows how a derived data point was created.

## 7. Why This Classification?

Explains species/evidence/signal classification.

## 8. Echo Analysis Modal

Shows why mentions were grouped as likely related.

## 9. Signal Integrity Modal

Defines every dimension.

## 10. Translation Gap Modal

Explains why animal/human stages remain separate.

## 11. Conflict Modal

Displays contradictory evidence side-by-side.

## 12. Data Freshness Modal

Last checked, last changed, source state.

## 13. Regulatory Jurisdiction Modal

Switch country/region.

## 14. Compare Picker

Add/remove compounds.

## 15. Filter Drawer

Mobile and advanced desktop filtering.

## 16. Share Modal

Copy link, claim snapshot, research card.

## 17. Export Research Packet

Export citations/data without treatment recommendations.

## 18. Save Modal

Save to personal research collection.

## 19. Suggest a Source

URL + category + notes.

## 20. Report an Error

Structured correction submission.

## 21. AI Synthesis Provenance

Shows which structured records generated a summary.

## 22. 3D Controls

Rotate, reset, labels, reduced effects, structure provenance.

## 23. First-Visit Orientation

Three-screen maximum.

Explain:
Research
Human reports
Claim lineage

Never force users through ten legal screens.

---

# 35. VISUAL SYSTEM

The aesthetic should be:

**future laboratory + scientific instrument + luxury editorial**

Not:

cyberpunk gaming dashboard.

Not:

generic SaaS cards.

Not:

hospital-blue medical website.

Not:

supplement store.

## Palette

Base:
near-black obsidian
charcoal graphite
warm off-white

Accent system:
spectral cyan
controlled electric violet
deep cobalt
small amount of signal amber

Reserve colors semantically.

Do not turn the site into rainbow neon.

---

# 36. TYPOGRAPHY

Large editorial display type.

Precise modern grotesk/sans for UI.

Monospace used only for:

sequences
identifiers
data values
citations

Use extreme hierarchy.

Large negative space.

Scientific but cinematic.

---

# 37. 3D MOTION

Three.js/WebGL or appropriate equivalent.

Motion principles:

slow
weighted
physical
purposeful

Molecule should respond subtly to cursor movement.

Scrolling changes camera position.

Do not make molecules bounce.

Do not create distracting particle storms.

Reduced-motion mode must preserve all functionality.

On underpowered mobile devices:

use simplified geometry or prerendered fallback.

Content must never depend on WebGL.

---

# 38. COMPONENT LANGUAGE

Build reusable primitives:

`EvidenceChip`
`SpeciesBadge`
`SourceBadge`
`ClaimNode`
`ResearchNode`
`CommunityNode`
`RegulatoryNode`
`ContradictionNode`
`LineageEdge`
`SignalFingerprint`
`EvidenceGenome`
`TranslationTrack`
`SourceCard`
`StudyCard`
`ClaimCard`
`ChangeDiff`
`StructureViewer`
`TimelineLane`
`ProvenanceDrawer`

Design them as a unified system.

---

# 39. DATA MODEL

Core entities:

Compound
Structure
Alias
Target
Pathway
OutcomeTheme
Claim
ClaimVersion
Study
Experiment
Species
Population
Endpoint
Institution
Author
FundingRecord
Trial
RegulatoryEvent
Source
CommunityReport
OriginCluster
Mention
ClaimRelationship
EvidenceRelationship
Contradiction
Correction
GraphVersion

Critical relationships:

`study SUPPORTS claim`

`study PARTIALLY_SUPPORTS claim`

`study CONTRADICTS claim`

`study DOES_NOT_TEST claim`

`report REPORTS outcome`

`mention DERIVED_FROM origin_cluster`

`claim MUTATED_INTO claim_version`

`claim RELATES_TO compound`

`experiment USES species`

`report HAS_COINTERVENTION`

`regulatory_event CHANGES status`

Every relationship requires provenance.

---

# 40. AI ARCHITECTURE

LLMs may perform:

entity extraction
claim extraction
topic classification
body-system classification
co-intervention extraction
near-duplicate suggestions
semantic clustering
summary drafting
contradiction candidate detection

LLMs may NOT independently decide:

whether a drug works
whether an anecdote is true
whether something is clinically safe
whether a regulatory action equals approval
whether two accounts are definitely the same person
whether correlation establishes causation

Deterministic data and explicit source relationships override prose generation.

The system must fail closed.

If provenance is missing:

display:

**Source relationship unresolved**

rather than inventing an answer.

---

# 41. SOCIAL DATA INGESTION

Do not build unauthorized scrapers.

Create a source-adapter interface.

Possible adapters:

YouTube official API
licensed Reddit access
Reddit embeds/manual submissions where appropriate
creator-authorized TikTok APIs
approved TikTok access if eligibility changes
podcast RSS
public publisher feeds
manual editorial entry

Every adapter exposes:

platform ID
canonical URL
publication date
retrieval date
author metadata where permitted
content metadata permitted by platform
status
deletion state
derived claim records

Design the architecture so source availability can change without rewriting the core product.

---

# 42. SCIENTIFIC DATA SOURCES

Build modular connectors for:

PubMed
Crossref
ClinicalTrials.gov
FDA
other national regulators later
WADA where relevant
DOI metadata
institutional repositories where lawful

Do not use SEO blogs as the final authority for scientific or regulatory facts when a primary source exists.

---

# 43. SOCIAL SOURCE RIGHTS

Do not store an entire social platform locally.

Store the minimum required data.

Respect:

deletions
API storage rules
refresh requirements
creator rights
platform terms

If source content disappears:

mark:

**Original source unavailable**

Do not pretend it remains live.

---

# 44. HUMAN SIGNAL LANGUAGE RULES

Allowed:

"People report..."

"Public discussion frequently mentions..."

"This theme appears repeatedly in the current indexed corpus."

"Some reports attribute improvement to..."

"The author's account states..."

Not allowed:

"Users proved..."

"This cures..."

"This heals..."

"Human evidence confirms..."

when referring only to anecdotes.

Also avoid unnecessarily dismissive wording.

Do not write:

"Just anecdotes."

Write:

**Community reports are a distinct evidence class that can reveal recurring experiences but cannot independently establish causation.**

---

# 45. NO PROTOCOL CONTENT

CYRAVON is not differentiated by teaching someone how to inject a compound.

Do not build:

dosage calculators
reconstitution calculators
syringe-unit converters
personal dosing schedules
stack protocols
"best dose" pages
purchase links
vendor affiliate rankings

Research papers may record experimental dose information as study metadata when scientifically relevant, but the interface must not transform it into personal-use instructions.

---

# 46. BPC-157 / TB-500 LAUNCH FIXTURE

Use these as the initial design test.

Do not hardcode unsupported claims.

Create sample structured themes such as:

BPC-157:
tendon research
ligament research
gastrointestinal research
vascular signaling
public recovery discussion

TB-500 / thymosin-beta related research:
cell migration
actin-related mechanisms
wound-healing research
tissue-repair discussion

Include community signal fixtures only when linked to real sources.

No dosage recommendations.

No protocol recommendations.

---

# 47. COPY STYLE

Tone:

curious
confident
precise
never preachy
never sensationalistic

Preferred:

**Here's what researchers measured.**

**Here's what people report.**

**Here's where those stories overlap.**

**Here's where they don't.**

Avoid:

"debunked"

"miracle"

"dangerous"

"safe"

"proven"

unless an exact sourced context justifies the word.

---

# 48. SEARCH ENGINE + AEO ARCHITECTURE

Each compound and claim should have:

clean canonical URL
structured headings
direct-answer synopsis
primary citations
last-reviewed date
JSON-LD appropriate to the content type
machine-readable source metadata
XML sitemap
open graph cards

Create AEO-friendly answer sections such as:

**What is BPC-157?**

**What has BPC-157 been studied for?**

**What do people report about BPC-157?**

**Has BPC-157 been studied in humans?**

But every answer must preserve evidence class.

Do not generate hundreds of shallow programmatic pages.

---

# 49. INTERACTIVE SHARE CARDS

Allow users to create a beautiful share card.

Example:

**BPC-157 — Tendon Repair**

Research:
Rodent/preclinical theme

Human reports:
Strong discussion theme

Controlled human evidence:
See current record

Origin clusters:

### indexed

Last updated:
DATE

QR code to claim page.

This creates organic distribution without making promotional health claims.

---

# 50. PERSONAL RESEARCH COLLECTIONS

Optional account feature.

Users can save:

compounds
claims
studies
sources
comparisons

Create private collections.

Examples:

"Tissue repair research"

"Mitochondrial compounds"

"Claims to revisit"

No personalized medical recommendations.

---

# 51. NOTIFICATIONS

Later version:

Notify when:

new study changes a watched claim
trial status changes
regulatory status changes
correction/retraction occurs
evidence classification materially changes

Do not send:

"Your peptide has new benefits!"

Use:

**New evidence was added to a claim you follow.**

---

# 52. PERFORMANCE

3D is presentation, not permission to ship a slow website.

Targets:

excellent Core Web Vitals
lazy-load WebGL
server-render important content
defer visualization code
progressive enhancement
responsive images
aggressive asset optimization

On low-power devices:

reduce polygon count
disable expensive effects
retain the same informational experience

---

# 53. ACCESSIBILITY

WCAG 2.2 AA target.

Keyboard navigation.

Visible focus states.

Screen-reader descriptions of visual graphs.

Do not rely on color alone.

Reduced-motion support.

Accessible tabular equivalents for every complex visualization.

---

# 54. RESPONSIVE DESIGN

Desktop can be cinematic.

Tablet must remain fully functional.

Mobile should feel deliberately designed, not collapsed.

For graph-heavy sections:

desktop = graph + side inspector

mobile = scrollable node cards + optional fullscreen graph

---

# 55. EMPTY STATES

Design every empty state.

Examples:

No human studies indexed.

No independent community origins identified.

No contradictory study currently indexed.

No source access for this platform.

Say exactly what is missing.

Never convert absence in CYRAVON's database into:

"No evidence exists."

Correct wording:

**No qualifying record is currently indexed in Cyravon's corpus.**

---

# 56. ERROR STATES

Source unavailable.

API unavailable.

Graph incomplete.

Structure failed to load.

Citation unresolved.

Outdated regulatory data.

Every failure should degrade honestly.

---

# 57. 404 PAGE

Floating disconnected molecular fragment.

Copy:

# This pathway ends here.

**The page may have moved, changed state, or never entered the atlas.**

Search the atlas.

---

# 58. FOOTER

Explore
Claims
Signal Map
Learn
Methodology
Coverage
Corrections
About
Contact
Privacy
Terms

Persistent line:

**Research and educational information. Cyravon does not provide individualized medical advice or facilitate the purchase of research compounds.**

---

# 59. ADMIN / EDITORIAL INTERFACE

Build an internal console.

Editors must be able to:

review extracted claims
merge/split origin clusters
approve contradiction relationships
flag suspicious duplicate sources
correct species/model classifications
add regulatory events
review AI summaries
publish corrections
see provenance

Every editorial change gets:

user
timestamp
before
after
reason

---

# 60. VERSIONING

Never destructively overwrite high-value evidence interpretations.

Create GraphVersions.

A user should eventually be able to answer:

**What did Cyravon show about this claim on March 1, 2026?**

This historical graph becomes increasingly valuable over time.

---

# 61. PROPRIETARY VALUE

The long-term proprietary asset is not page copy.

It is:

canonical claims
claim versions
evidence relationships
origin clusters
claim-lineage relationships
echo graphs
cross-platform mappings
contradiction graphs
research-group independence relationships
historical graph versions

Do not architect these as disposable CMS articles.

They are structured data.

---

# 62. DEFENSIBILITY LOOP

Every new source improves:

claim lineage
duplicate detection
source relationships
historical propagation models
translation mapping
convergence analysis

Every correction improves the graph rather than simply editing an article.

The database should become harder to reproduce every month.

---

# 63. COMPETITOR DEFENSE

Assume competitors can copy:

3D molecules
dark UI
evidence cards
AI summaries
Reddit aggregation
timelines
comparison tables

Therefore those are not sufficient.

The difficult system to reproduce is:

**a versioned provenance graph showing exactly how scientific findings, independent human reports, copied claims, contradictions and regulatory changes relate over time.**

Optimize the architecture around that.

---

# 64. PRODUCT NORTH STAR

A user encounters:

> "BPC-157 heals tendons."

They paste it into Cyravon.

Within seconds they can see:

where the claim originated
what the experiment actually measured
which species were studied
how many research groups reproduced it
how the wording changed online
how many community mentions exist
how many appear independently originated
what co-interventions were present
where research and reports overlap
what contradicts the claim
what remains unknown
what changed recently
every source behind the answer

If Cyravon can do that better than searching Google, Reddit, YouTube, PubMed and an AI chatbot separately, the product has succeeded.

---

# 65. INITIAL BUILD ORDER

## Phase 0 — Foundation

Design system
data schema
provenance architecture
source adapters
version model

## Phase 1 — Flagship experience

Home
Explore
Compound Dossier
Claim page
Study page
global search

Use BPC-157 and TB-500 as test datasets.

## Phase 2 — Moat

Claim Lineage
Claim Mutation
Echo Detection
Signal Independence
Evidence Genome
Translation Gap
Convergence

## Phase 3 — Intelligence

Claim Inspector
Contradiction Engine
Research Independence
Evidence Drift

## Phase 4 — Expansion

Signal Map
Compare
Research themes
Timeline
Learn
collections

## Phase 5 — Scale

More compounds
more official sources
approved platform connectors
notifications
public structured API if appropriate

Do not expand to hundreds of compounds until the two-compound experience is exceptional.

---

# 66. BUILD ACCEPTANCE TESTS

The implementation is not complete unless:

1. Every material scientific claim can resolve to provenance.

2. Community mentions and independent-origin clusters are never silently treated as the same metric.

3. Every percentage has a visible denominator and defined corpus.

4. Every community statistic has a collection window.

5. Every regulatory status displays jurisdiction and date.

6. Every 3D structure identifies its provenance/model type.

7. Every AI synthesis exposes its supporting records.

8. Unsupported source relationships fail closed.

9. Contradictory evidence is not suppressed.

10. Null outcomes are not suppressed.

11. Community enthusiasm is not editorially minimized.

12. Community enthusiasm is not converted into clinical proof.

13. Social ingestion complies with platform permissions.

14. The site works without WebGL.

15. Mobile receives a purpose-built experience.

16. Reduced-motion mode works.

17. No protocol/dosing/sourcing engine appears.

18. No page claims CYRAVON has searched "the whole internet."

19. Historical interpretations remain versioned.

20. A first-time visitor can understand the difference between research evidence, public reports and internet claims within 30 seconds.

---

# 67. DESIGN QUALITY BAR

Before accepting any screen, ask:

**Does this look like something a generic peptide seller could have built?**

If yes, redesign it.

**Does the 3D visualization communicate information or merely decorate the screen?**

If merely decorative, improve it.

**Can a user trace every important conclusion backward?**

If no, fix provenance.

**Could 1,000 copied posts fool the interface into displaying 1,000 independent experiences?**

If yes, fix the signal model.

**Could a visitor mistake an animal result for a human finding?**

If yes, fix the interface.

**Could an enthusiastic anecdote be seen and explored without being dismissed?**

If no, fix the tone.

**Could an AI hallucination enter the permanent evidence graph without a source?**

If yes, stop the build and fix the architecture.

---

# 68. FINAL CREATIVE DIRECTION

This should not look like a peptide website.

It should look like someone built a **Bloomberg Terminal, interactive science museum and molecular observatory for emerging compounds**, then stripped away the complexity until an ordinary intelligent person could understand it.

Opening the site should create:

**"I have never seen research shown like this."**

Using it should create:

**"Now I understand where this claim actually came from."**

Returning later should create:

**"I want to see what changed."**

That is CYRAVON.

Build toward that standard.

Do not optimize for the number of pages.

Optimize for the quality of the evidence graph and the experience of exploring it.
