import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { c as CLAIMS } from "./router-CxtrX1wR.js";
import { T as TimelineLane } from "./TimelineLane-i2incZ5r.js";
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
import "./ChangeDiff-CXImkrDM.js";
import "./EmptyState-DIM_9RBj.js";
const LANES = ["research", "trials", "regulatory", "signal"];
function Timeline() {
  const [only, setOnly] = useState(false);
  const [lanes, setLanes] = useState(new Set(LANES));
  const events = CLAIMS.flatMap((c) => c.changeHistory.map((e) => ({
    ...e,
    claim: c.id
  }))).filter((e) => !only || e.alteredInterpretation);
  return /* @__PURE__ */ jsxs("div", { className: "pt-28 wrap", children: [
    /* @__PURE__ */ jsx("p", { className: "label label-amber", children: "Timeline · change ledger" }),
    /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.6rem,7vw,6.4rem)] mt-3", children: "What changed, and when." }),
    /* @__PURE__ */ jsx("p", { className: "lede mt-5 max-w-2xl", children: "Every event carries date, source, what changed, previous state, new state. History is never rewritten silently." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-2 items-center", children: [
      LANES.map((l) => /* @__PURE__ */ jsx("button", { className: "btn btn-sm capitalize", "aria-pressed": lanes.has(l), onClick: () => {
        const n = new Set(lanes);
        n.has(l) ? n.delete(l) : n.add(l);
        setLanes(n);
      }, children: l === "signal" ? "Public signal" : l }, l)),
      /* @__PURE__ */ jsxs("label", { className: "ml-auto flex items-center gap-2 text-sm muted", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: only, onChange: (e) => setOnly(e.target.checked) }),
        " Only show changes that altered a claim interpretation"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: LANES.filter((l) => lanes.has(l)).map((lane) => /* @__PURE__ */ jsx(TimelineLane, { lane, events: events.filter((e) => e.lane === lane) }, lane)) }),
    /* @__PURE__ */ jsxs("p", { className: "mt-8 mono text-[11px] text-bone/45", children: [
      "Ledger: ",
      events.length,
      " event(s) · What we could responsibly say before 2026-09-20: no record existed."
    ] })
  ] });
}
export {
  Timeline as component
};
