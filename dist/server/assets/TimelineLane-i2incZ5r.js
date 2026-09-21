import { jsxs, jsx } from "react/jsx-runtime";
import { C as ChangeDiff } from "./ChangeDiff-CXImkrDM.js";
import { E as EmptyState } from "./EmptyState-DIM_9RBj.js";
const LANE_LABEL = { research: "Research", trials: "Trials", regulatory: "Regulatory", signal: "Public signal" };
const LANE_EMPTY = {
  research: "No research event indexed beyond claim creation.",
  trials: "No trial record indexed — ClinicalTrials.gov connector not enabled.",
  regulatory: "No regulatory record indexed.",
  signal: "No public-signal event indexed — no platform source access enabled."
};
function TimelineLane({ lane, events }) {
  return /* @__PURE__ */ jsxs("section", { "aria-label": `${LANE_LABEL[lane]} lane`, className: "grid md:grid-cols-[180px_1fr] gap-4 py-6 border-t hairline", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "label", children: LANE_LABEL[lane] }),
      /* @__PURE__ */ jsxs("p", { className: "mono text-[11px] text-bone/45 mt-1", children: [
        events.length,
        " event",
        events.length === 1 ? "" : "s"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: events.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { compact: true, title: LANE_EMPTY[lane] }) : events.map((e, i) => /* @__PURE__ */ jsxs("div", { children: [
      e.claim && /* @__PURE__ */ jsx("p", { className: "mono text-[11px] text-bone/50 mb-1", children: e.claim }),
      /* @__PURE__ */ jsx(ChangeDiff, { event: e })
    ] }, i)) })
  ] });
}
export {
  TimelineLane as T
};
