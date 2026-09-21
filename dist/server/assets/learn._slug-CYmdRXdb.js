import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { _ as Route, E as LESSONS, C as CLAIM_BY_ID } from "./router-CxtrX1wR.js";
import { M as MutationLadder } from "./MutationLadder-Dabj_vIB.js";
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
import "./timeline-lCL6MsVU.js";
import "./SourceBadge-DFiLYoWt.js";
function Lesson() {
  const {
    slug
  } = Route.useLoaderData();
  const l = LESSONS.find((x) => x.slug === slug);
  return /* @__PURE__ */ jsxs("div", { className: "pt-28 wrap", children: [
    /* @__PURE__ */ jsx(Link, { to: "/learn", className: "label hover:!text-bone", children: "← Learn" }),
    /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.4rem,6vw,5.4rem)] mt-4", children: l.title }),
    /* @__PURE__ */ jsx("p", { className: "lede mt-4 max-w-2xl", children: l.summary }),
    l.status === "interactive" ? /* @__PURE__ */ jsxs("div", { className: "mt-10 grid gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "panel-flat p-5", children: [
          /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "1 · Scrub" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 muted", children: "Drag the slider. The source finding is copied verbatim from a verified abstract. Every later step is illustrative wording — labelled as such." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "panel-flat p-5", children: [
          /* @__PURE__ */ jsx("p", { className: "label label-amber", children: "2 · Watch what drops" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 muted", children: "Struck words are dropped from the previous step. Species, model and uncertainty tend to go first." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "panel-flat p-5", children: [
          /* @__PURE__ */ jsx("p", { className: "label label-violet", children: "3 · Watch what appears" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 muted", children: "Violet words were added. Outcomes, speed and scope tend to arrive last — and were never measured." })
        ] })
      ] }),
      /* @__PURE__ */ jsx(MutationLadder, { claim: CLAIM_BY_ID["CLAIM-BPC157-TENDON-REPAIR"], autoplay: true }),
      /* @__PURE__ */ jsx(MutationLadder, { claim: CLAIM_BY_ID["CLAIM-TB4-CELL-MIGRATION"] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm muted max-w-2xl", children: "This is called claim mutation, not misinformation. Some steps are faithful paraphrases. The point is to see which transformation happened, and to link each one to its source text." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "mt-10 panel-flat p-8", children: /* @__PURE__ */ jsx("p", { className: "display-md text-xl", children: "In production" }) })
  ] });
}
export {
  Lesson as component
};
