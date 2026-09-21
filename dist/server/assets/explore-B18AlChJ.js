import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { b as COMPOUNDS, g as displayName, s as studiesForCompound } from "./router-CxtrX1wR.js";
import { d as distributionFor, l as latestChangeFor, b as DOMAINS, D as DOMAIN_BY_ID } from "./evidence-Dz2qVTbe.js";
import { C as CompoundCard } from "./CompoundCard-CQM9j2kR.js";
import { p as provenanceText } from "./SourceBadge-DFiLYoWt.js";
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
import "./ChainRenderer-DYgLieBk.js";
import "react-dom/client";
import "./SequenceSVG-qNlYzj3F.js";
function Explore() {
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("all");
  const [evidence, setEvidence] = useState("any");
  const [prov, setProv] = useState("any");
  const [sort, setSort] = useState("alpha");
  const [view, setView] = useState("grid");
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    let list = COMPOUNDS.filter((c) => {
      if (domain !== "all" && c.domain !== domain) return false;
      if (prov !== "any" && provenanceText(c).kind !== prov) return false;
      if (evidence !== "any") {
        const d = distributionFor(c.slug);
        const n = evidence === "in-vitro" ? d.inVitro : evidence === "animal" ? d.animal : evidence === "human" ? d.human : d.review;
        if (!n) return false;
      }
      if (t && !(displayName(c).toLowerCase().includes(t) || c.slug.includes(t) || c.aliases.some((a) => a.toLowerCase().includes(t)) || c.tags.some((x) => x.includes(t)))) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "alpha") return displayName(a).localeCompare(displayName(b));
      if (sort === "researched") return studiesForCompound(b.slug).length - studiesForCompound(a.slug).length || displayName(a).localeCompare(displayName(b));
      const ca = latestChangeFor(a.slug)?.date ?? "", cb = latestChangeFor(b.slug)?.date ?? "";
      return cb.localeCompare(ca) || displayName(a).localeCompare(displayName(b));
    });
    return list;
  }, [q, domain, evidence, prov, sort]);
  return /* @__PURE__ */ jsxs("div", { className: "pt-28 wrap", children: [
    /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Explore" }),
    /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.6rem,7vw,6.4rem)] mt-3", children: "Explore the Molecular Atlas" }),
    /* @__PURE__ */ jsxs("p", { className: "lede mt-5 max-w-2xl", children: [
      COMPOUNDS.length,
      " compounds across seven research domains. Sorted by what is indexed — never by “best”."
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto_auto] items-end panel p-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "grid gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: "Search" }),
        /* @__PURE__ */ jsx("input", { type: "search", value: q, onChange: (e) => setQ(e.target.value), placeholder: "Name, alias, tag…" })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "grid gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: "Domain" }),
        /* @__PURE__ */ jsxs("select", { value: domain, onChange: (e) => setDomain(e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "all", children: "All domains" }),
          DOMAINS.map((d) => /* @__PURE__ */ jsx("option", { value: d.id, children: d.name }, d.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "grid gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: "Evidence type present" }),
        /* @__PURE__ */ jsxs("select", { value: evidence, onChange: (e) => setEvidence(e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "any", children: "Any" }),
          /* @__PURE__ */ jsx("option", { value: "in-vitro", children: "In vitro" }),
          /* @__PURE__ */ jsx("option", { value: "animal", children: "Animal" }),
          /* @__PURE__ */ jsx("option", { value: "human", children: "Human" }),
          /* @__PURE__ */ jsx("option", { value: "review", children: "Review" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "grid gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: "Structure provenance" }),
        /* @__PURE__ */ jsxs("select", { value: prov, onChange: (e) => setProv(e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "any", children: "Any" }),
          /* @__PURE__ */ jsx("option", { value: "pdb", children: "Resolved structures exist" }),
          /* @__PURE__ */ jsx("option", { value: "sequence", children: "Sequence-derived only" }),
          /* @__PURE__ */ jsx("option", { value: "conceptual", children: "Conceptual (sequence pending)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "grid gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: "Sort" }),
        /* @__PURE__ */ jsxs("select", { value: sort, onChange: (e) => setSort(e.target.value), children: [
          /* @__PURE__ */ jsx("option", { value: "alpha", children: "Alphabetical" }),
          /* @__PURE__ */ jsx("option", { value: "researched", children: "Most researched (verified count)" }),
          /* @__PURE__ */ jsx("option", { value: "changed", children: "Recently changed" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1", role: "group", "aria-label": "View", children: [
        /* @__PURE__ */ jsx("button", { className: "btn btn-sm", "aria-pressed": view === "grid", onClick: () => setView("grid"), children: "Grid" }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-sm", "aria-pressed": view === "table", onClick: () => setView("table"), children: "Table" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-4 mono text-[11px] text-bone/50", children: [
      rows.length,
      " of ",
      COMPOUNDS.length,
      " compounds"
    ] }),
    view === "grid" ? /* @__PURE__ */ jsx("div", { className: "mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: rows.map((c, i) => /* @__PURE__ */ jsx(CompoundCard, { compound: c, index: i, fluid: true }, c.slug)) }) : /* @__PURE__ */ jsx("div", { className: "mt-6 panel-flat overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "data", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Compound" }),
        /* @__PURE__ */ jsx("th", { children: "Domain" }),
        /* @__PURE__ */ jsx("th", { children: "Residues" }),
        /* @__PURE__ */ jsx("th", { children: "Verified records" }),
        /* @__PURE__ */ jsx("th", { children: "In vitro / animal / human / review" }),
        /* @__PURE__ */ jsx("th", { children: "Structure provenance" }),
        /* @__PURE__ */ jsx("th", { children: "Latest change" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: rows.map((c) => {
        const d = distributionFor(c.slug);
        const ch = latestChangeFor(c.slug);
        return /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsxs("td", { children: [
            /* @__PURE__ */ jsx(Link, { to: "/compound/$slug", params: {
              slug: c.slug
            }, className: "font-semibold hover:text-cyan", children: displayName(c) }),
            /* @__PURE__ */ jsx("span", { className: "block text-[11px] muted", children: c.aliases.slice(0, 2).join(" · ") })
          ] }),
          /* @__PURE__ */ jsx("td", { children: DOMAIN_BY_ID[c.domain].name }),
          /* @__PURE__ */ jsx("td", { className: "mono", children: c.sequence ? c.sequence.length : "pending" }),
          /* @__PURE__ */ jsx("td", { className: "mono", children: d.total || /* @__PURE__ */ jsx("span", { className: "text-bone/40", children: "0" }) }),
          /* @__PURE__ */ jsx("td", { className: "mono", children: d.total ? `${d.inVitro} / ${d.animal} / ${d.human} / ${d.review}` : /* @__PURE__ */ jsx("span", { className: "text-bone/40", children: "no qualifying record" }) }),
          /* @__PURE__ */ jsx("td", { className: "text-[12px]", children: provenanceText(c).primary }),
          /* @__PURE__ */ jsx("td", { className: "mono text-[11px]", children: ch ? /* @__PURE__ */ jsx("span", { className: "text-amber", children: ch.date }) : "—" })
        ] }, c.slug);
      }) })
    ] }) }),
    rows.length === 0 && /* @__PURE__ */ jsx("p", { className: "mt-10 text-sm muted", children: "No compound matches these filters. Absence from the atlas is not evidence of absence." })
  ] });
}
export {
  Explore as component
};
