import { jsxs, jsx } from "react/jsx-runtime";
import { c as CLAIMS } from "./router-CxtrX1wR.js";
import { C as ClaimCard } from "./ClaimCard-DmW4lb9h.js";
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
import "./SourceBadge-DFiLYoWt.js";
const SplitComponent = () => /* @__PURE__ */ jsxs("div", { className: "pt-28 wrap", children: [
  /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Claims" }),
  /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.6rem,7vw,6.4rem)] mt-3", children: "Every claim has a canonical ID." }),
  /* @__PURE__ */ jsx("p", { className: "lede mt-5 max-w-2xl", children: "Each record traces: earliest indexed source, exact experimental result, species, original wording, mutations, contradictions, current evidence state." }),
  /* @__PURE__ */ jsx("div", { className: "mt-10 grid md:grid-cols-2 gap-4", children: CLAIMS.map((c) => /* @__PURE__ */ jsx(ClaimCard, { claim: c }, c.id)) }),
  /* @__PURE__ */ jsxs("p", { className: "mt-6 mono text-[11px] text-bone/45", children: [
    CLAIMS.length,
    " tracked claims · Claim Inspector (free-text) is in production; results will be constructed from graph entities, never free-form."
  ] })
] });
export {
  SplitComponent as component
};
