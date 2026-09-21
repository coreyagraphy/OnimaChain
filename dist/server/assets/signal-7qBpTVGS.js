import { jsxs, jsx } from "react/jsx-runtime";
import { useState, Suspense, lazy } from "react";
import { H as HUMAN_SIGNAL_LINE, E as EMPTY_PLATFORM, a as SIGNAL_FILTERS, b as CONSTELLATION_LEGEND, C as CORPUS, P as PLATFORMS } from "./signal-C6q76ez9.js";
import { C as CorpusHeader } from "./CorpusHeader-CoLdDxIf.js";
import { S as SignalFingerprint } from "./SignalFingerprint-DdS5mnOv.js";
import { u as useCanvasAllowed, K as useMounted, L as Lod0Canvas } from "./router-CxtrX1wR.js";
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
const Constellation = lazy(() => import("./Constellation-DBHQq5aZ.js").then((m) => ({
  default: m.Constellation
})));
function SignalMap() {
  const allowed = useCanvasAllowed();
  const mounted = useMounted();
  const [view, setView] = useState("constellation");
  return /* @__PURE__ */ jsxs("div", { className: "pt-28", children: [
    /* @__PURE__ */ jsxs("div", { className: "wrap", children: [
      /* @__PURE__ */ jsx("p", { className: "label label-violet", children: "Signal map" }),
      /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.6rem,7vw,6.4rem)] mt-3", children: "What people report, as a field." }),
      /* @__PURE__ */ jsx("p", { className: "lede mt-5 max-w-2xl", children: HUMAN_SIGNAL_LINE }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 panel p-4", children: [
        /* @__PURE__ */ jsx(CorpusHeader, {}),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-[12px] muted", children: [
          "Known missing coverage: every platform. ",
          EMPTY_PLATFORM,
          "."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "wrap mt-8 grid lg:grid-cols-[280px_1fr] gap-6", children: [
      /* @__PURE__ */ jsxs("aside", { className: "panel-flat p-4 grid gap-3 content-start", "aria-label": "Filters", children: [
        SIGNAL_FILTERS.map((f) => /* @__PURE__ */ jsxs("label", { className: "grid gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "label", children: f.label }),
          /* @__PURE__ */ jsx("select", { disabled: true, "aria-disabled": true, className: "w-full", children: /* @__PURE__ */ jsx("option", { children: "options" in f ? f.options.join(" / ") : "No corpus to filter" }) })
        ] }, f.id)),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] faint", children: "Filters are inert until a source adapter is enabled." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 mb-3", role: "group", "aria-label": "Visual", children: ["constellation", "network", "timeline", "heatmap"].map((v) => /* @__PURE__ */ jsx("button", { className: "btn btn-sm capitalize", "aria-pressed": view === v, onClick: () => setView(v), children: v }, v)) }),
        /* @__PURE__ */ jsxs("div", { className: "relative panel-flat overflow-hidden h-[520px]", children: [
          view === "constellation" && mounted && allowed ? /* @__PURE__ */ jsx(Lod0Canvas, { className: "absolute inset-0", style: {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%"
          }, cameraZ: 18, children: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Constellation, {}) }) }) : /* @__PURE__ */ jsxs("svg", { className: "absolute inset-0 w-full h-full", "aria-hidden": true, children: [
            /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("radialGradient", { id: "sg", cx: "50%", cy: "50%", r: "55%", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#8A63FF", stopOpacity: "0.12" }),
              /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#8A63FF", stopOpacity: "0" })
            ] }) }),
            /* @__PURE__ */ jsx("rect", { width: "100%", height: "100%", fill: "url(#sg)" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 grid place-items-center pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "text-center px-6", children: [
            /* @__PURE__ */ jsx("p", { className: "display-md text-xl md:text-2xl text-bone/85", children: view === "constellation" ? "An empty field." : `${view[0].toUpperCase() + view.slice(1)} view: nothing to draw.` }),
            /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm muted max-w-md", children: [
              EMPTY_PLATFORM,
              ". Reports will appear here as points, clustered by body area, stated research goal, reported observation, compound, duration, co-interventions, platform and date — never with prominence implying truth."
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "absolute left-3 bottom-3 flex flex-wrap gap-3 mono text-[10px] text-bone/60 bg-obsidian/70 rounded-lg px-3 py-2", "aria-label": "Legend", children: CONSTELLATION_LEGEND.map((l) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: `w-2.5 h-2.5 rounded-full ${l.id === "independent" ? "bg-violet" : l.id === "derivative" ? "border border-violet" : l.id === "documented" ? "bg-violet ring-2 ring-violet/40" : "bg-violet/30"}` }),
            l.label
          ] }, l.id)) }),
          /* @__PURE__ */ jsx("p", { className: "absolute right-3 top-3 mono text-[10px] text-bone/50", children: CORPUS.header })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 grid sm:grid-cols-3 gap-3", children: PLATFORMS.map((p) => /* @__PURE__ */ jsxs("div", { className: "panel-flat p-4 border-dashed", children: [
          /* @__PURE__ */ jsx("p", { className: "label label-violet", children: p.name }),
          /* @__PURE__ */ jsx("p", { className: "text-sm mt-1 text-bone/80", children: EMPTY_PLATFORM }),
          /* @__PURE__ */ jsxs("p", { className: "mono text-[10px] text-bone/40 mt-2", children: [
            "adapter: ",
            p.adapter
          ] })
        ] }, p.id)) }),
        /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(SignalFingerprint, { title: "Signal integrity — all themes" }) })
      ] })
    ] })
  ] });
}
export {
  SignalMap as component
};
