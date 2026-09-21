import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { S as STUDY_BY_PMID, g as displayName, a as COMPOUND_BY_SLUG } from "./router-CxtrX1wR.js";
import { S as SourceBadge } from "./SourceBadge-DFiLYoWt.js";
function ClaimCard({ claim }) {
  const origin = claim.originStudy ? STUDY_BY_PMID[claim.originStudy] : void 0;
  const supports = claim.support.filter((s) => STUDY_BY_PMID[s.pmid]?.status === "verified");
  return /* @__PURE__ */ jsxs(Link, { to: "/claim/$id", params: { id: claim.id }, className: "panel p-5 block card-tilt hover:border-cyan/40", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "mono text-[11px] text-bone/55", children: claim.id }),
      /* @__PURE__ */ jsx("span", { className: "chip", children: "Tracked research claim" })
    ] }),
    /* @__PURE__ */ jsxs("h3", { className: "display-md text-xl md:text-2xl mt-3", children: [
      "“",
      claim.title,
      "”"
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm muted mt-2", children: [
      displayName(COMPOUND_BY_SLUG[claim.compound]),
      " · outcome theme: ",
      claim.outcomeTheme
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-2 items-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] label", children: "Origin" }),
      /* @__PURE__ */ jsx(SourceBadge, { pmid: claim.originStudy, verified: origin?.status === "verified", link: false }),
      /* @__PURE__ */ jsxs("span", { className: "mono text-[11px] text-bone/55", children: [
        supports.length,
        " verified record",
        supports.length === 1 ? "" : "s",
        " linked"
      ] })
    ] })
  ] });
}
export {
  ClaimCard as C
};
