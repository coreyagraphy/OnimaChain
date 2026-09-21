import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { R as Route, a as COMPOUND_BY_SLUG, d as computedMW, T as TRANSLATION_STAGES, s as studiesForCompound, e as distinctGroups, f as claimsForCompound, l as longestSharedSubsequence, b as COMPOUNDS, g as displayName, h as buildResidues, i as CLASS_COLORS } from "./router-CxtrX1wR.js";
import { D as DOMAIN_BY_ID, e as evidenceGenome, t as translationFor, d as distributionFor, a as themesFor, l as latestChangeFor } from "./evidence-Dz2qVTbe.js";
import { C as CORPUS } from "./signal-C6q76ez9.js";
import { p as provenanceText } from "./SourceBadge-DFiLYoWt.js";
import "@tanstack/react-router";
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
function Compare() {
  const search = Route.useSearch();
  const [slugs, setSlugs] = useState([search.a && COMPOUND_BY_SLUG[search.a] ? search.a : "bpc-157", search.b && COMPOUND_BY_SLUG[search.b] ? search.b : "tb-500"]);
  const cs = slugs.map((s) => COMPOUND_BY_SLUG[s]);
  const rows = useMemo(() => [{
    k: "Identity",
    v: cs.map((c) => `${c.name}${c.displayName ? ` (displayed as ${c.displayName})` : ""} · ${c.sequence ? `${c.sequence.length} aa` : "sequence pending"} · MW ${c.mw ?? computedMW(c) ?? "—"}`)
  }, {
    k: "Mechanism tags",
    v: cs.map((c) => c.tags.join(" · "))
  }, {
    k: "Research domain",
    v: cs.map((c) => DOMAIN_BY_ID[c.domain].name)
  }, {
    k: "Evidence genome",
    v: cs.map((c) => {
      const g = evidenceGenome(c.slug).filter((x) => (x.count ?? 0) > 0 && x.id !== "research-age");
      return g.length ? g.map((x) => `${x.label} ${x.value ?? x.count}`).join(" · ") : "No qualifying record is currently indexed in Cyravon’s corpus";
    })
  }, {
    k: "Translation",
    v: cs.map((c) => {
      const t = translationFor(c.slug);
      return t.length ? t.map((r) => `${r.outcome}: ${r.stages.length ? TRANSLATION_STAGES.filter((s) => r.stages.includes(s.id)).map((s) => s.label).join(" → ") : "no stage"}`).join(" · ") : "No outcome mapped";
    })
  }, {
    k: "Human research",
    v: cs.map((c) => distributionFor(c.slug).human ? `${distributionFor(c.slug).human} verified record(s)` : "No human study indexed")
  }, {
    k: "Human signal",
    v: cs.map(() => CORPUS.header)
  }, {
    k: "Signal integrity",
    v: cs.map(() => "Not assessed — no corpus")
  }, {
    k: "Research independence",
    v: cs.map((c) => {
      const s = studiesForCompound(c.slug);
      return s.length ? `${distinctGroups(s).length} last-author group(s) across ${s.length} record(s)` : "Not assessed";
    })
  }, {
    k: "Research themes",
    v: cs.map((c) => themesFor(c.slug).filter((t) => t.kind === "research").map((t) => t.label).join(" · ") || "No themes indexed")
  }, {
    k: "Claims tracked",
    v: cs.map((c) => claimsForCompound(c.slug).map((x) => x.id).join(" · ") || "none")
  }, {
    k: "Regulatory state",
    v: cs.map(() => "No regulatory record indexed (jurisdiction / date required)")
  }, {
    k: "Structure provenance",
    v: cs.map((c) => provenanceText(c).primary)
  }, {
    k: "Latest evidence change",
    v: cs.map((c) => {
      const ch = latestChangeFor(c.slug);
      return ch ? `${ch.date} — ${ch.change}` : "No change recorded";
    })
  }], [cs]);
  const shared = cs.length >= 2 && cs[0].sequence && cs[1].sequence ? longestSharedSubsequence(cs[0].sequence, cs[1].sequence) : null;
  return /* @__PURE__ */ jsxs("div", { className: "pt-28 wrap", children: [
    /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Compare" }),
    /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.6rem,7vw,6.4rem)] mt-3", children: "Descriptive, side by side." }),
    /* @__PURE__ */ jsx("p", { className: "lede mt-5 max-w-2xl", children: "Up to four compounds. No winner is declared and nothing is “best for” anything." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-2 items-end", children: [
      slugs.map((s, i) => /* @__PURE__ */ jsxs("label", { className: "grid gap-1", children: [
        /* @__PURE__ */ jsxs("span", { className: "label", children: [
          "Compound ",
          i + 1
        ] }),
        /* @__PURE__ */ jsx("select", { value: s, onChange: (e) => setSlugs(slugs.map((x, j) => j === i ? e.target.value : x)), children: COMPOUNDS.map((c) => /* @__PURE__ */ jsx("option", { value: c.slug, children: displayName(c) }, c.slug)) })
      ] }, i)),
      slugs.length < 4 && /* @__PURE__ */ jsx("button", { className: "btn btn-sm", onClick: () => setSlugs([...slugs, COMPOUNDS.find((c) => !slugs.includes(c.slug)).slug]), children: "+ Add" }),
      slugs.length > 2 && /* @__PURE__ */ jsx("button", { className: "btn btn-sm", onClick: () => setSlugs(slugs.slice(0, -1)), children: "− Remove" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 panel-flat overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "data min-w-[720px]", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "w-[180px]", children: "Row" }),
        cs.map((c) => /* @__PURE__ */ jsx("th", { children: displayName(c) }, c.slug))
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: rows.map((r) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "label !normal-case !tracking-normal !text-[12px] text-bone/70", children: r.k }),
        r.v.map((v, i) => /* @__PURE__ */ jsx("td", { className: "text-[13px] text-bone/85", children: v }, i))
      ] }, r.k)) })
    ] }) }),
    cs.length >= 2 && /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
      /* @__PURE__ */ jsxs("p", { className: "label label-cyan", children: [
        "Residue diff — ",
        displayName(cs[0]),
        " vs ",
        displayName(cs[1])
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm muted", children: shared ? shared.text.length >= 2 ? `Longest shared subsequence: ${shared.text} (${shared.text.length} residues, positions ${shared.ai + 1} / ${shared.bi + 1})` : "No shared subsequence" : "Residue diff requires two listed sequences." }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 grid md:grid-cols-2 gap-4", children: cs.slice(0, 2).map((c, ci) => {
        const res = buildResidues(c);
        const start = ci === 0 ? shared?.ai ?? -1 : shared?.bi ?? -1;
        const len = shared?.text.length ?? 0;
        return /* @__PURE__ */ jsxs("div", { className: "panel-flat p-4 overflow-x-auto", children: [
          /* @__PURE__ */ jsx("p", { className: "label mb-3", children: displayName(c) }),
          res.length ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: res.map((r) => {
            const hit = len >= 2 && r.index >= start && r.index < start + len;
            return /* @__PURE__ */ jsx("span", { className: `mono text-[12px] w-7 h-7 grid place-items-center rounded ${hit ? "ring-1 ring-cyan" : ""}`, style: {
              background: `${CLASS_COLORS[r.cls]}22`,
              color: CLASS_COLORS[r.cls]
            }, title: `${r.name} ${r.pos}`, children: r.code }, r.index);
          }) }) : /* @__PURE__ */ jsx("p", { className: "text-sm muted", children: "Sequence pending verification" })
        ] }, c.slug);
      }) })
    ] })
  ] });
}
export {
  Compare as component
};
