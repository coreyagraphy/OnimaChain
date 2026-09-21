import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { $ as Route, a as COMPOUND_BY_SLUG, g as displayName } from "./router-CxtrX1wR.js";
import { E as EmptyState } from "./EmptyState-DIM_9RBj.js";
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
const JURISDICTIONS = ["United States (FDA)", "European Union (EMA)", "United Kingdom (MHRA)", "Australia (TGA)", "Canada (Health Canada)", "WADA (sport)"];
const CATEGORIES = ["Approved use", "Investigational status", "Compounding actions", "Sports restrictions", "Regulatory warnings", "Advisory proceedings"];
function Status() {
  const {
    slug
  } = Route.useLoaderData();
  const c = COMPOUND_BY_SLUG[slug];
  const [j, setJ] = useState(JURISDICTIONS[0]);
  return /* @__PURE__ */ jsxs("div", { className: "pt-28 wrap", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/compound/$slug", params: {
      slug
    }, className: "label hover:!text-bone", children: [
      "← ",
      displayName(c),
      " dossier"
    ] }),
    /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.4rem,6vw,5.4rem)] mt-4", children: "Regulatory status" }),
    /* @__PURE__ */ jsx("p", { className: "lede mt-4 max-w-2xl", children: "Jurisdiction-specific and date-specific. An advisory vote is never an approval; “not prohibited” is never “approved”." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-3 items-end", children: [
      /* @__PURE__ */ jsxs("label", { className: "grid gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: "Jurisdiction" }),
        /* @__PURE__ */ jsx("select", { value: j, onChange: (e) => setJ(e.target.value), children: JURISDICTIONS.map((x) => /* @__PURE__ */ jsx("option", { children: x }, x)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: "As of date" }),
        /* @__PURE__ */ jsx("span", { className: "mono text-sm text-bone/50 py-2", children: "— no record" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 grid md:grid-cols-2 gap-3", children: CATEGORIES.map((cat) => /* @__PURE__ */ jsxs("div", { className: "panel-flat p-5", children: [
      /* @__PURE__ */ jsx("p", { className: "label", children: cat }),
      /* @__PURE__ */ jsx("p", { className: "mono text-[11px] text-bone/45 mt-1", children: j }),
      /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(EmptyState, { compact: true, title: "No regulatory record indexed", detail: "Regulatory connectors (FDA, EMA, WADA…) are not enabled. Nothing is inferred from secondary sources." }) })
    ] }, cat)) })
  ] });
}
export {
  Status as component
};
