import { jsxs, jsx } from "react/jsx-runtime";
import { E as EmptyState } from "./EmptyState-DIM_9RBj.js";
const SplitComponent = () => /* @__PURE__ */ jsxs("div", { className: "pt-28 wrap", children: [
  /* @__PURE__ */ jsx("p", { className: "label label-amber", children: "Corrections" }),
  /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.6rem,7vw,6.4rem)] mt-3", children: "Public correction ledger." }),
  /* @__PURE__ */ jsx("p", { className: "lede mt-5 max-w-2xl", children: "Every material correction records date, affected record, before, after, reason and source. Old interpretations are never deleted silently." }),
  /* @__PURE__ */ jsx("div", { className: "mt-10 panel-flat overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "data", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { children: "Date" }),
      /* @__PURE__ */ jsx("th", { children: "Affected record" }),
      /* @__PURE__ */ jsx("th", { children: "Before" }),
      /* @__PURE__ */ jsx("th", { children: "After" }),
      /* @__PURE__ */ jsx("th", { children: "Reason" }),
      /* @__PURE__ */ jsx("th", { children: "Source" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "!p-0", children: /* @__PURE__ */ jsx(EmptyState, { compact: true, title: "No corrections have been issued.", detail: "The ledger opened 2026-09-20 with the first claim records. Submit an error via Report an error (in production)." }) }) }) })
  ] }) })
] });
export {
  SplitComponent as component
};
