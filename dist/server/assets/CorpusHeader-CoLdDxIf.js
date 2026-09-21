import { jsxs, jsx } from "react/jsx-runtime";
import { C as CORPUS } from "./signal-C6q76ez9.js";
function CorpusHeader({ className = "" }) {
  return /* @__PURE__ */ jsxs("div", { className: `flex flex-wrap items-center gap-x-5 gap-y-1 mono text-[11px] text-bone/60 ${className}`, "aria-label": "Corpus definition", children: [
    /* @__PURE__ */ jsxs("span", { children: [
      "Corpus: ",
      /* @__PURE__ */ jsxs("b", { className: "text-bone/85 font-medium", children: [
        CORPUS.sources,
        " sources"
      ] })
    ] }),
    /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "·" }),
    /* @__PURE__ */ jsxs("span", { children: [
      "Collection window: ",
      /* @__PURE__ */ jsx("b", { className: "text-bone/85 font-medium", children: CORPUS.collectionWindow })
    ] }),
    /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "·" }),
    /* @__PURE__ */ jsxs("span", { children: [
      "Platforms: ",
      /* @__PURE__ */ jsx("b", { className: "text-bone/85 font-medium", children: CORPUS.platformsEnabled.length ? CORPUS.platformsEnabled.join(", ") : "none enabled" })
    ] })
  ] });
}
export {
  CorpusHeader as C
};
