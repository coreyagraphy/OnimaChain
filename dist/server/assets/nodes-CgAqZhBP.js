import { jsxs, jsx } from "react/jsx-runtime";
const NODE_STYLE = {
  research: { color: "#5FE3FF", label: "Research", shape: "circle" },
  claim: { color: "#F2EEE6", label: "Claim", shape: "diamond" },
  community: { color: "#8A63FF", label: "Community", shape: "hexagon" },
  regulatory: { color: "#8FB0FF", label: "Regulatory", shape: "square" },
  contradiction: { color: "#E5A03A", label: "Contradiction", shape: "triangle" }
};
function shapePath(shape, r) {
  switch (shape) {
    case "circle":
      return `M ${-r} 0 a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
    case "diamond":
      return `M 0 ${-r} L ${r} 0 L 0 ${r} L ${-r} 0 Z`;
    case "hexagon": {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = Math.PI / 3 * i;
        return `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
      });
      return `M ${pts.join(" L ")} Z`;
    }
    case "square":
      return `M ${-r * 0.85} ${-r * 0.85} h ${r * 1.7} v ${r * 1.7} h ${-r * 1.7} Z`;
    case "triangle":
      return `M 0 ${-r} L ${r} ${r * 0.8} L ${-r} ${r * 0.8} Z`;
  }
}
function SvgNode({ kind, x, y, r = 14, hollow = false, label, sublabel, active = false, onClick }) {
  const s = NODE_STYLE[kind];
  return /* @__PURE__ */ jsxs("g", { transform: `translate(${x} ${y})`, style: { cursor: onClick ? "pointer" : "default" }, onClick, role: onClick ? "button" : void 0, tabIndex: onClick ? 0 : void 0, children: [
    active && /* @__PURE__ */ jsx("path", { d: shapePath(s.shape, r + 7), fill: "none", stroke: s.color, strokeOpacity: 0.35, strokeWidth: 1 }),
    /* @__PURE__ */ jsx("path", { d: shapePath(s.shape, r), fill: hollow ? "transparent" : s.color, fillOpacity: hollow ? 0 : kind === "claim" ? 0.95 : 0.85, stroke: s.color, strokeWidth: hollow ? 1.2 : 1, strokeDasharray: hollow ? "3 3" : void 0 }),
    label && /* @__PURE__ */ jsx("text", { x: r + 10, y: 4, fill: "#F2EEE6", fontSize: 12, fontFamily: "Inter Variable, sans-serif", fontWeight: 600, children: label }),
    sublabel && /* @__PURE__ */ jsx("text", { x: r + 10, y: 19, fill: "#F2EEE6", fillOpacity: 0.55, fontSize: 10.5, fontFamily: "JetBrains Mono Variable, monospace", children: sublabel })
  ] });
}
function NodeCard({ kind, title, meta, hollow, children, href }) {
  const s = NODE_STYLE[kind];
  const body = /* @__PURE__ */ jsxs("div", { className: `panel p-4 flex gap-3 items-start ${hollow ? "border-dashed" : ""}`, style: { borderColor: `${s.color}33` }, children: [
    /* @__PURE__ */ jsx("svg", { width: "28", height: "28", viewBox: "-16 -16 32 32", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: shapePath(s.shape, 12), fill: hollow ? "transparent" : s.color, stroke: s.color, strokeWidth: 1.2, strokeDasharray: hollow ? "3 3" : void 0 }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "label", style: { color: s.color }, children: s.label }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold mt-0.5 text-bone/90", children: title }),
      meta && /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs muted", children: meta }),
      children
    ] })
  ] });
  return href ? /* @__PURE__ */ jsx("a", { href, target: "_blank", rel: "noreferrer noopener", children: body }) : body;
}
function LineageEdge({ x1, y1, x2, y2, relationship, unresolved = false, color = "#5FE3FF", lit = true }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("line", { x1, y1, x2, y2, stroke: color, strokeOpacity: lit ? unresolved ? 0.35 : 0.6 : 0.15, strokeWidth: unresolved ? 1 : 1.4, strokeDasharray: unresolved ? "4 4" : void 0 }),
    relationship && /* @__PURE__ */ jsx("text", { x: mx, y: my - 6, textAnchor: "middle", fill: color, fillOpacity: 0.8, fontSize: 9.5, fontFamily: "JetBrains Mono Variable, monospace", letterSpacing: "0.08em", children: relationship })
  ] });
}
export {
  LineageEdge as L,
  NODE_STYLE as N,
  SvgNode as S,
  NodeCard as a,
  shapePath as s
};
