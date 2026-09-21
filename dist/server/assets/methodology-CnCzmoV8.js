import { jsxs, jsx } from "react/jsx-runtime";
import { G as CORPUS_CHECKED_AT, J as STUDIES } from "./router-CxtrX1wR.js";
import "@tanstack/react-router";
import "react";
import "zustand/traditional";
import "suspend-react";
import "scheduler";
import "its-fine";
import "react-use-measure";
import "@babel/runtime/helpers/esm/extends";
import "tunnel-rat";
import "zustand";
import "lenis";
import "gsap";
import "gsap/ScrollTrigger";
const ITEMS = [{
  q: "How sources are collected",
  a: "Scientific records enter as PubMed identifiers listed in a versioned data file. At build time every PMID is resolved against NCBI eutils esummary; the resolved title must contain an expected keyword or the build fails. Titles, years, journals and author lists come only from the resolver, never from editorial text.",
  state: `Last corpus check: ${CORPUS_CHECKED_AT}`
}, {
  q: "How claims are normalized",
  a: "A claim receives a canonical ID (e.g. CLAIM-BPC157-TENDON-REPAIR), an origin record (or an explicit unresolved state), an original scope with wording copied verbatim from the origin abstract, and a mutation ladder whose non-source steps carry the badge “Illustrative wording — not an indexed source”."
}, {
  q: "How reports are clustered",
  a: "Not yet performed. No platform adapter is enabled, so no report exists to cluster. When enabled, clustering keys are body area, stated research goal, reported observation, compound, combination, duration, co-interventions, platform and date.",
  state: "Not enabled"
}, {
  q: "How duplicates are detected",
  a: "Not yet performed. The planned model assigns every mention one relationship: independent origin, response, repost/quotation, derivative claim, near duplicate, or unknown. Mentions are never silently counted as independent.",
  state: "Not enabled"
}, {
  q: "How independence is estimated",
  a: "For research: distinct last-author surnames among verified records, shown explicitly as a proxy. Institutions, funding and citation networks are “Not assessed” until a Crossref/efetch connector exists. For community signal: not assessed — no corpus."
}, {
  q: "How LLMs are used",
  a: "In this build: not at runtime. Study tags (mechanistic, tendon, cell-migration…) were assigned editorially from abstract text and are labelled as such. Any future LLM use is limited to extraction, classification and drafting; it never decides efficacy, truth of an anecdote, safety, regulatory meaning, account identity, or causation. Deterministic records override prose."
}, {
  q: "Where humans review data",
  a: "Every study relationship (SUPPORTS / PARTIALLY_SUPPORTS / CONTRADICTS / DOES_NOT_TEST) is an editorial assignment with a verbatim basis quote where one exists. An editorial console is planned; until then, the data files are the review surface and every change is versioned in git."
}, {
  q: "How corrections work",
  a: "A public ledger (/corrections) records date, affected record, before, after, reason and source. Old interpretations are never deleted; they are superseded with a diff."
}, {
  q: "How regulatory status is dated",
  a: "Every regulatory record must carry a jurisdiction and a date. None is indexed. An advisory vote is never displayed as an approval; “not prohibited” is never displayed as “approved”."
}, {
  q: "How evidence relationships are assigned",
  a: "study SUPPORTS | PARTIALLY_SUPPORTS | CONTRADICTS | DOES_NOT_TEST claim. Each requires provenance (a PMID verified at build time and, where possible, an abstract quote). Missing provenance fails closed: “Source relationship unresolved”."
}, {
  q: "Known limitations",
  a: `The corpus is ${STUDIES.length} records across two compounds. Species is read only from titles (abstract-derived species is flagged separately). Study type is set only when obvious. No trial, regulatory or community connector exists. The 3D structures are procedural, sequence-derived visualizations, never measured.`
}];
function Methodology() {
  return /* @__PURE__ */ jsxs("div", { className: "pt-28 wrap", children: [
    /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Methodology" }),
    /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.6rem,7vw,6.4rem)] mt-3", children: "Trust is part of the product." }),
    /* @__PURE__ */ jsx("p", { className: "lede mt-5 max-w-2xl", children: "Exactly how Cyravon collects, verifies, relates and versions what it shows — and what it cannot currently do." }),
    /* @__PURE__ */ jsx("div", { className: "mt-12 grid gap-px bg-bone/10 border hairline rounded-2xl overflow-hidden", children: ITEMS.map((it) => /* @__PURE__ */ jsxs("section", { className: "bg-obsidian p-6 md:p-8 grid md:grid-cols-[280px_1fr] gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "display-md text-xl", children: it.q }),
        it.state && /* @__PURE__ */ jsx("p", { className: "mono text-[11px] text-bone/45 mt-2", children: it.state })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-bone/80 leading-relaxed", children: it.a })
    ] }, it.q)) }),
    /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsx("p", { className: "label label-cyan mb-3", children: "Schema (excerpt)" }),
      /* @__PURE__ */ jsx("pre", { className: "panel-flat p-5 mono text-[12px] leading-relaxed overflow-x-auto text-bone/80", children: `Study      { pmid, expectKeyword, compounds[], speciesFromTitle, studyType, tags[], abstractQuote?, status: verified|unverified, meta: eutils esummary }
Claim      { id, title, status: tracked, compound, originStudy|null, originalScope{species, model, endpoint, wording, wordingSource}, mutation[4], support[{pmid, relationship, basis}], translation{outcome: stages[]}, contradictions[], changeHistory[], interpretation[] }
Relations  study SUPPORTS|PARTIALLY_SUPPORTS|CONTRADICTS|DOES_NOT_TEST claim · mention DERIVED_FROM origin_cluster (not enabled) · regulatory_event CHANGES status (not enabled)
Structure  provenance ∈ { Experimentally resolved (PDB …) — deposited, not rendered · Sequence-derived visualization (procedural, not measured) · Conceptual visualization }` })
    ] })
  ] });
}
export {
  Methodology as component
};
