import { jsxs, jsx } from "react/jsx-runtime";
import { P as PLATFORMS, S as SCIENTIFIC_SOURCES } from "./signal-C6q76ez9.js";
const SplitComponent = () => /* @__PURE__ */ jsxs("div", { className: "pt-28 wrap", children: [
  /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Coverage" }),
  /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.6rem,7vw,6.4rem)] mt-3", children: "What Cyravon can and cannot see." }),
  /* @__PURE__ */ jsx("p", { className: "lede mt-5 max-w-2xl", children: "Cyravon never implies “the internet says”. This page is the denominator for every statement on the site." }),
  /* @__PURE__ */ jsxs("div", { className: "mt-12 grid md:grid-cols-2 gap-8", children: [
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "display-md text-2xl mb-4", children: "Public platforms" }),
      /* @__PURE__ */ jsxs("table", { className: "data panel-flat", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { children: "Platform" }),
          /* @__PURE__ */ jsx("th", { children: "Adapter" }),
          /* @__PURE__ */ jsx("th", { children: "State" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: PLATFORMS.map((p) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { children: p.name }),
          /* @__PURE__ */ jsx("td", { className: "text-[12px] muted", children: p.adapter }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: "chip chip-hollow", children: p.state }) })
        ] }, p.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "display-md text-2xl mb-4", children: "Scientific & regulatory sources" }),
      /* @__PURE__ */ jsxs("table", { className: "data panel-flat", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { children: "Source" }),
          /* @__PURE__ */ jsx("th", { children: "State" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: SCIENTIFIC_SOURCES.map((s) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { children: s.name }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: `chip ${s.enabled ? "chip-cyan" : "chip-hollow"}`, children: s.state }) })
        ] }, s.id)) })
      ] })
    ] })
  ] })
] });
export {
  SplitComponent as component
};
