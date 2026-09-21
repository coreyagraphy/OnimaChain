import { s as studiesForCompound, c as CLAIMS, e as distinctGroups, Y as verifiedStudies, J as STUDIES, Z as TODAY, b as COMPOUNDS } from "./router-CxtrX1wR.js";
const DOMAINS = [
  {
    id: "repair",
    name: "Tissue repair",
    researchLabel: "Compounds investigated in tissue-repair research",
    rig: "branch",
    grammar: "Branch — a line network grows from the edges toward the centre and closes over a mask.",
    palette: { base: "#5FE3FF", accent: "#9FF0FF", glow: "#5FE3FF" },
    order: 1
  },
  {
    id: "metabolic",
    name: "Metabolic",
    researchLabel: "Compounds investigated in metabolic research",
    rig: "dock",
    grammar: "Dock — a ligand approaches a receptor ring; on contact, a signal wave propagates inward.",
    palette: { base: "#4F7BFF", accent: "#8FB0FF", glow: "#2247D6" },
    order: 2
  },
  {
    id: "somatotropic",
    name: "Somatotropic",
    researchLabel: "Compounds investigated in growth-hormone-axis research",
    rig: "pulse",
    grammar: "Pulse — emissive intensity rides a night-weighted 24h waveform; bursts on the peaks.",
    palette: { base: "#8A63FF", accent: "#B9A2FF", glow: "#8A63FF" },
    order: 3
  },
  {
    id: "dermal",
    name: "Dermal & matrix",
    researchLabel: "Compounds investigated in skin and extracellular-matrix research",
    rig: "bloom",
    grammar: "Bloom — a point emits a radial diffusion field that spreads outward and settles.",
    palette: { base: "#9FD8E8", accent: "#D7EEF5", glow: "#7FC8DD" },
    order: 4
  },
  {
    id: "cognitive",
    name: "Cognitive & neural",
    researchLabel: "Compounds investigated in neural research",
    rig: "propagate",
    grammar: "Propagate — a single packet hops a sparse graph; edges flash in sequence as it crosses.",
    palette: { base: "#A98BFF", accent: "#CBB8FF", glow: "#8A63FF" },
    order: 5
  },
  {
    id: "longevity",
    name: "Mitochondrial & ageing",
    researchLabel: "Compounds investigated in mitochondrial and ageing research",
    rig: "reknit",
    grammar: "Reknit — an assembly curve played in reverse with slow rotation.",
    palette: { base: "#7FD1C9", accent: "#B2EBE5", glow: "#5FE3FF" },
    order: 6
  },
  {
    id: "immune",
    name: "Immune & antimicrobial",
    researchLabel: "Compounds investigated in immune and antimicrobial research",
    rig: "sweep",
    grammar: "Sweep — a cone of light sweeps a field of points, locks on one, flags it, and resumes.",
    palette: { base: "#B7C6D6", accent: "#E3ECF3", glow: "#9FD8E8" },
    order: 7
  }
];
const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map((d) => [d.id, d]));
const GENOME_DIMENSIONS = [
  { id: "in-vitro", label: "In vitro", how: "Verified records whose study type is in-vitro." },
  { id: "mouse", label: "Mouse", how: "Verified records whose title states a mouse model." },
  { id: "rat", label: "Rat", how: "Verified records whose title states a rat model." },
  { id: "other-animal", label: "Other animal", how: "Verified records whose title states another animal model." },
  { id: "observational-human", label: "Observational human", how: "Verified records typed observational-human." },
  { id: "case-report", label: "Case report", how: "Verified records whose publication type is Case Reports." },
  { id: "phase-1", label: "Phase I", how: "Verified records whose publication type is Clinical Trial, Phase I." },
  { id: "phase-2", label: "Phase II", how: "Verified records whose publication type is Clinical Trial, Phase II." },
  { id: "phase-3", label: "Phase III", how: "Verified records whose publication type is Clinical Trial, Phase III." },
  { id: "approved-indication", label: "Approved indication", how: "Not assessed — no regulatory record indexed." },
  { id: "replication", label: "Replication", how: "Not assessed — replication relationships are not yet indexed." },
  { id: "independent-groups", label: "Independent groups", how: "Distinct last-author surnames among verified records (proxy)." },
  { id: "mechanistic", label: "Mechanistic", how: "Verified records tagged mechanistic from their abstract." },
  { id: "safety", label: "Safety characterization", how: "Not assessed — no safety-typed record indexed." },
  { id: "research-age", label: "Research age", how: "Earliest to latest publication year among verified records." }
];
function evidenceGenome(slug) {
  const studies = studiesForCompound(slug);
  const pick = (f) => studies.filter(f);
  const cell = (id, list, value = null, notAssessed = false) => {
    const d = GENOME_DIMENSIONS.find((x) => x.id === id);
    return { id, label: d.label, count: notAssessed ? null : list.length, value, pmids: list.map((s) => s.pmid), how: d.how };
  };
  const years = studies.map((s) => s.year).filter((y) => y !== null);
  const groups = distinctGroups(studies);
  const pt = (t) => pick((s) => (s.meta?.pubTypes ?? []).some((p) => p.toLowerCase().includes(t)));
  return [
    cell("in-vitro", pick((s) => s.studyType === "in-vitro")),
    cell("mouse", pick((s) => s.speciesFromTitle === "mouse")),
    cell("rat", pick((s) => s.speciesFromTitle === "rat")),
    cell("other-animal", pick((s) => s.speciesFromTitle === "other-animal")),
    cell("observational-human", pick((s) => s.studyType === "observational-human")),
    cell("case-report", pt("case report")),
    cell("phase-1", pt("phase i")),
    cell("phase-2", pt("phase ii")),
    cell("phase-3", pt("phase iii")),
    cell("approved-indication", [], null, true),
    cell("replication", [], null, true),
    { ...cell("independent-groups", studies), count: groups.length, value: groups.length ? groups.join(" · ") : null },
    cell("mechanistic", pick((s) => s.tags.includes("mechanistic"))),
    cell("safety", [], null, true),
    { ...cell("research-age", studies), count: years.length ? Math.max(...years) - Math.min(...years) : null, value: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : null }
  ];
}
const THEME_FIXTURES = {
  "bpc-157": [
    { id: "tendon", label: "Tendon research", tag: "tendon", kind: "research" },
    { id: "ligament", label: "Ligament research", kind: "research" },
    { id: "gi", label: "Gastrointestinal research", kind: "research" },
    { id: "vascular", label: "Vascular signaling", kind: "research" },
    { id: "recovery-discussion", label: "Public recovery discussion", kind: "discussion" }
  ],
  "tb-500": [
    { id: "cell-migration", label: "Cell migration", tag: "cell-migration", kind: "research" },
    { id: "actin", label: "Actin-related mechanisms", tag: "actin", kind: "research" },
    { id: "wound-healing", label: "Wound-healing research", tag: "wound-healing", kind: "research" },
    { id: "tissue-repair-discussion", label: "Tissue-repair discussion", kind: "discussion" }
  ]
};
function themesFor(slug) {
  const fx = THEME_FIXTURES[slug];
  if (!fx) return [];
  const studies = studiesForCompound(slug);
  return fx.map((t) => ({
    id: t.id,
    label: t.label,
    kind: t.kind,
    pmids: t.tag ? studies.filter((s) => s.tags.includes(t.tag)).map((s) => s.pmid) : []
  }));
}
function translationFor(slug) {
  return CLAIMS.filter((c) => c.compound === slug).flatMap(
    (c) => Object.entries(c.translation).map(([outcome, stages]) => ({ outcome, stages }))
  );
}
function distributionFor(slug) {
  const s = studiesForCompound(slug);
  return {
    total: s.length,
    inVitro: s.filter((x) => x.studyType === "in-vitro").length,
    animal: s.filter((x) => x.studyType === "animal").length,
    human: s.filter((x) => x.studyType === "observational-human" || x.studyType === "controlled-human").length,
    review: s.filter((x) => x.studyType === "review" || x.studyType === "systematic-review").length
  };
}
function latestChangeFor(slug) {
  const events = CLAIMS.filter((c) => c.compound === slug).flatMap((c) => c.changeHistory.map((e) => ({ ...e, claim: c.id })));
  if (!events.length) return null;
  const last = events.sort((a, b) => a.date < b.date ? 1 : -1)[0];
  return { date: last.date, change: `${last.change} — ${last.claim}` };
}
function researchPulse() {
  const v = verifiedStudies();
  const verifiedAt = v.map((s) => s.verifiedAt).filter(Boolean).sort().at(-1) ?? null;
  return [
    { label: "Studies indexed & verified", value: v.length, of: STUDIES.length, at: verifiedAt, note: "PMIDs resolved against NCBI eutils at build time" },
    { label: "Trials changed", value: 0, of: null, at: null, note: "ClinicalTrials.gov connector not enabled" },
    { label: "Regulatory records changed", value: 0, of: null, at: null, note: "No regulatory connector enabled" },
    { label: "Claims materially changed", value: CLAIMS.reduce((n, c) => n + c.changeHistory.filter((e) => e.alteredInterpretation).length, 0), of: null, at: TODAY, note: "From claims.ts change history" },
    { label: "New source clusters", value: 0, of: null, at: null, note: "No platform source access enabled" },
    { label: "Compounds in atlas", value: COMPOUNDS.length, of: null, at: TODAY, note: `${COMPOUNDS.filter((c) => c.sequence).length} with a listed sequence` }
  ];
}
export {
  DOMAIN_BY_ID as D,
  themesFor as a,
  DOMAINS as b,
  distributionFor as d,
  evidenceGenome as e,
  latestChangeFor as l,
  researchPulse as r,
  translationFor as t
};
