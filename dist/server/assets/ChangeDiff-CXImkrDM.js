import { jsxs, jsx } from "react/jsx-runtime";
function ChangeDiff({ event }) {
  return /* @__PURE__ */ jsxs("div", { className: "panel p-4 md:p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "mono text-[12px] text-amber", children: event.date }),
      /* @__PURE__ */ jsx("span", { className: "chip chip-amber", children: event.lane }),
      event.alteredInterpretation && /* @__PURE__ */ jsx("span", { className: "chip", children: "altered interpretation" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 font-semibold text-bone/90", children: event.change }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 grid sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-bone/10 p-3", children: [
        /* @__PURE__ */ jsx("p", { className: "label mb-1", children: "Before" }),
        /* @__PURE__ */ jsx("p", { className: "mono text-sm text-bone/60", children: event.before ?? "— (no prior state)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-amber/30 p-3", children: [
        /* @__PURE__ */ jsx("p", { className: "label label-amber mb-1", children: "After" }),
        /* @__PURE__ */ jsx("p", { className: "mono text-sm text-bone/90", children: event.after })
      ] })
    ] })
  ] });
}
export {
  ChangeDiff as C
};
