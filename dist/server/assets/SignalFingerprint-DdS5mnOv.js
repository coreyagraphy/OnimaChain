import { jsxs, jsx } from "react/jsx-runtime";
import { F as FINGERPRINT_DIMENSIONS, N as NOT_ASSESSED } from "./signal-C6q76ez9.js";
import { C as CorpusHeader } from "./CorpusHeader-CoLdDxIf.js";
function SignalFingerprint({ title = "Signal integrity" }) {
  const n = FINGERPRINT_DIMENSIONS.length;
  const R = 92;
  const cx = 130, cy = 130;
  return /* @__PURE__ */ jsxs("div", { className: "panel p-5 md:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "display-md text-xl", children: title }),
      /* @__PURE__ */ jsx("span", { className: "chip chip-hollow", children: "No single score" })
    ] }),
    /* @__PURE__ */ jsx(CorpusHeader, { className: "mt-2" }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 grid md:grid-cols-[260px_1fr] gap-6 items-start", children: [
      /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 260 260", className: "w-[240px] mx-auto", role: "img", "aria-label": `Signal integrity radial: ${n} dimensions, all ${NOT_ASSESSED}`, children: [
        [0.33, 0.66, 1].map((k) => /* @__PURE__ */ jsx("circle", { cx, cy, r: R * k, fill: "none", stroke: "#F2EEE6", strokeOpacity: 0.1, strokeDasharray: "2 4" }, k)),
        FINGERPRINT_DIMENSIONS.map((d, i) => {
          const a = i / n * Math.PI * 2 - Math.PI / 2;
          const r2 = (v) => Math.round(v * 100) / 100;
          const x = r2(cx + Math.cos(a) * R);
          const y = r2(cy + Math.sin(a) * R);
          const lx = r2(cx + Math.cos(a) * (R + 14));
          const ly = r2(cy + Math.sin(a) * (R + 14));
          return /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("line", { x1: cx, y1: cy, x2: x, y2: y, stroke: "#F2EEE6", strokeOpacity: 0.08 }),
            /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r: 3.5, fill: "none", stroke: "#8A63FF", strokeOpacity: 0.7, strokeDasharray: "2 2" }),
            /* @__PURE__ */ jsx("text", { x: lx, y: ly, fontSize: 7.5, fill: "#F2EEE6", fillOpacity: 0.45, textAnchor: "middle", dominantBaseline: "middle", fontFamily: "Inter Variable, sans-serif", children: i + 1 })
          ] }, d.id);
        }),
        /* @__PURE__ */ jsx("text", { x: cx, y: cy - 6, textAnchor: "middle", fontSize: 10, fill: "#F2EEE6", fillOpacity: 0.5, fontFamily: "JetBrains Mono Variable, monospace", children: "no corpus" }),
        /* @__PURE__ */ jsx("text", { x: cx, y: cy + 9, textAnchor: "middle", fontSize: 9, fill: "#F2EEE6", fillOpacity: 0.35, fontFamily: "JetBrains Mono Variable, monospace", children: "0 sources" })
      ] }),
      /* @__PURE__ */ jsxs("table", { className: "data", "aria-label": "Signal integrity matrix", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { children: "#" }),
          /* @__PURE__ */ jsx("th", { children: "Dimension" }),
          /* @__PURE__ */ jsx("th", { children: "Assessment" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: FINGERPRINT_DIMENSIONS.map((d, i) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { className: "mono text-bone/45", children: i + 1 }),
          /* @__PURE__ */ jsxs("td", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-bone/90", children: d.label }),
            /* @__PURE__ */ jsx("span", { className: "block text-[11px] faint mt-0.5", children: d.def })
          ] }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: "chip chip-hollow", children: NOT_ASSESSED }) })
        ] }, d.id)) })
      ] })
    ] })
  ] });
}
export {
  SignalFingerprint as S
};
