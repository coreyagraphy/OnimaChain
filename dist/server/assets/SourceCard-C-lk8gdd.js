import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { O as pubmedUrl, T as TRANSLATION_STAGES } from "./router-CxtrX1wR.js";
import { S as SourceBadge } from "./SourceBadge-DFiLYoWt.js";
import { E as EMPTY_PLATFORM } from "./signal-C6q76ez9.js";
const LABEL$1 = {
  "in-vitro": "In vitro",
  animal: "Animal",
  review: "Review",
  "systematic-review": "Systematic review",
  "observational-human": "Observational human",
  "controlled-human": "Controlled human"
};
function EvidenceChip({ type, count }) {
  if (!type) return /* @__PURE__ */ jsx("span", { className: "chip chip-hollow", children: "Type not assessed" });
  const cls = type === "in-vitro" ? "chip-violet" : type === "animal" ? "chip-cyan" : type.includes("human") ? "chip" : "chip";
  return /* @__PURE__ */ jsxs("span", { className: `chip ${cls}`, children: [
    LABEL$1[type],
    typeof count === "number" && /* @__PURE__ */ jsx("span", { className: "mono opacity-70", children: count })
  ] });
}
const LABEL = { rat: "Rat", mouse: "Mouse", human: "Human", "other-animal": "Other animal" };
function SpeciesBadge({ species, source = "title" }) {
  if (!species) return /* @__PURE__ */ jsx("span", { className: "chip chip-hollow", title: "Species not stated in the record title", children: "Species not in title" });
  return /* @__PURE__ */ jsxs("span", { className: "chip", title: `Species stated in the record ${source}`, children: [
    /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "inline-block w-1.5 h-1.5 rounded-full bg-cyan" }),
    LABEL[species]
  ] });
}
function StudyCard({ study, compact = false, relationship, basis }) {
  if (study.status !== "verified" || !study.meta) {
    return /* @__PURE__ */ jsxs("div", { className: "panel p-4 border-dashed", children: [
      /* @__PURE__ */ jsx(SourceBadge, { pmid: study.pmid, verified: false }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm muted mt-2", children: [
        "Record ",
        study.pmid,
        " could not be verified at build time; it is not rendered as a citation."
      ] })
    ] });
  }
  const m = study.meta;
  return /* @__PURE__ */ jsxs("article", { className: `panel ${compact ? "p-4" : "p-5"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
      /* @__PURE__ */ jsx(SourceBadge, { pmid: study.pmid, verified: true }),
      /* @__PURE__ */ jsx(EvidenceChip, { type: study.studyType }),
      /* @__PURE__ */ jsx(SpeciesBadge, { species: study.speciesFromTitle }),
      relationship && /* @__PURE__ */ jsx("span", { className: `chip ${relationship === "SUPPORTS" ? "chip-cyan" : relationship === "CONTRADICTS" ? "chip-amber" : ""}`, children: relationship })
    ] }),
    /* @__PURE__ */ jsx("h4", { className: `mt-3 font-semibold text-bone/95 leading-snug ${compact ? "text-sm" : "text-base"}`, children: /* @__PURE__ */ jsx("a", { href: pubmedUrl(study.pmid), target: "_blank", rel: "noreferrer noopener", className: "hover:text-cyan", children: m.title }) }),
    /* @__PURE__ */ jsxs("p", { className: "mono text-[11px] text-bone/55 mt-2", children: [
      m.journal,
      " · ",
      m.year ?? "year n/a",
      " · ",
      m.authors.length,
      " authors · last author ",
      m.lastAuthor || "n/a",
      m.doi && /* @__PURE__ */ jsxs(Fragment, { children: [
        " · doi ",
        m.doi
      ] })
    ] }),
    !compact && basis && /* @__PURE__ */ jsxs("blockquote", { className: "mt-3 text-sm text-bone/75 border-l-2 border-cyan/40 pl-3 italic", children: [
      "“",
      basis,
      "” ",
      /* @__PURE__ */ jsxs("span", { className: "not-italic mono text-[10px] text-bone/45", children: [
        "— abstract, PMID ",
        study.pmid
      ] })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mono text-[10px] text-bone/40 mt-2", children: [
      "Verified ",
      new Date(m.verifiedAt).toISOString().slice(0, 10),
      " via NCBI eutils esummary"
    ] })
  ] });
}
function TranslationTrack({ rows }) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
    rows.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm muted", children: "No outcome has an indexed translation path." }),
    rows.map((r) => {
      const lit = new Set(r.stages);
      const furthest = TRANSLATION_STAGES.reduce((acc, s, i) => lit.has(s.id) ? i : acc, -1);
      return /* @__PURE__ */ jsxs("div", { className: "panel p-4 md:p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-2", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold capitalize text-bone/90", children: r.outcome.replace(/-/g, " ") }),
          /* @__PURE__ */ jsx("p", { className: "mono text-[11px] text-bone/55", children: furthest < 0 ? "No stage supported by an indexed record" : `Indexed support reaches: ${TRANSLATION_STAGES[furthest].label}` })
        ] }),
        /* @__PURE__ */ jsx("ol", { className: "mt-4 grid grid-cols-7 gap-1", "aria-label": `Translation stages for ${r.outcome}`, children: TRANSLATION_STAGES.map((s, i) => {
          const on = lit.has(s.id);
          return /* @__PURE__ */ jsxs("li", { className: "flex flex-col items-center gap-2 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-full h-[3px] rounded", style: { background: on ? "#5FE3FF" : "rgba(242,238,230,0.1)", boxShadow: on ? "0 0 12px rgba(95,227,255,0.6)" : void 0 } }),
            /* @__PURE__ */ jsx("span", { className: `w-2.5 h-2.5 rounded-full ${on ? "bg-cyan" : "border border-bone/25"}`, "aria-hidden": true }),
            /* @__PURE__ */ jsx("span", { className: `text-[10px] leading-tight ${on ? "text-bone/90" : "text-bone/40"}`, children: s.label }),
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: on ? "supported by an indexed record" : "not supported by an indexed record" }),
            i === furthest && /* @__PURE__ */ jsx("span", { className: "chip chip-cyan !text-[9px]", children: "reached" })
          ] }, s.id);
        }) })
      ] }, r.outcome);
    })
  ] });
}
function SourceCard({ platform }) {
  return /* @__PURE__ */ jsxs("div", { className: "panel p-4 border-dashed", children: [
    /* @__PURE__ */ jsx("p", { className: "label label-violet", children: platform }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-bone/80 mt-1", children: EMPTY_PLATFORM }),
    /* @__PURE__ */ jsxs("dl", { className: "mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mono text-bone/45", children: [
      /* @__PURE__ */ jsx("dt", { children: "Publication date" }),
      /* @__PURE__ */ jsx("dd", { children: "—" }),
      /* @__PURE__ */ jsx("dt", { children: "Retrieval date" }),
      /* @__PURE__ */ jsx("dd", { children: "—" }),
      /* @__PURE__ */ jsx("dt", { children: "First-person / commentary" }),
      /* @__PURE__ */ jsx("dd", { children: "—" }),
      /* @__PURE__ */ jsx("dt", { children: "Origin cluster" }),
      /* @__PURE__ */ jsx("dd", { children: "—" })
    ] })
  ] });
}
export {
  StudyCard as S,
  TranslationTrack as T,
  SpeciesBadge as a,
  SourceCard as b
};
