import { jsxs, jsx } from "react/jsx-runtime";
function EmptyState({ title, detail, children, tone = "default", compact = false }) {
  return /* @__PURE__ */ jsxs("div", { className: `rounded-xl border border-dashed ${tone === "amber" ? "border-amber/40" : "border-bone/15"} ${compact ? "p-4" : "p-6 md:p-8"}`, role: "status", children: [
    /* @__PURE__ */ jsx("p", { className: `display-md ${compact ? "text-base" : "text-lg md:text-xl"} ${tone === "amber" ? "text-amber" : "text-bone/85"}`, children: title }),
    detail && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm muted max-w-prose", children: detail }),
    children && /* @__PURE__ */ jsx("div", { className: "mt-3", children })
  ] });
}
const CORPUS_ABSENCE = "No qualifying record is currently indexed in Cyravon’s corpus.";
export {
  CORPUS_ABSENCE as C,
  EmptyState as E
};
