import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { E as LESSONS } from "./router-CxtrX1wR.js";
import "react";
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
const SplitComponent = () => /* @__PURE__ */ jsxs("div", { className: "pt-28 wrap", children: [
  /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Learn" }),
  /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.6rem,7vw,6.4rem)] mt-3", children: "Ten interactive lessons." }),
  /* @__PURE__ */ jsx("p", { className: "lede mt-5 max-w-2xl", children: "Not a blog. Each lesson is a scene you can scrub." }),
  /* @__PURE__ */ jsx("ol", { className: "mt-10 grid md:grid-cols-2 gap-3", children: LESSONS.map((l, i) => /* @__PURE__ */ jsx("li", { children: l.status === "interactive" ? /* @__PURE__ */ jsxs(Link, { to: "/learn/$slug", params: {
    slug: l.slug
  }, className: "panel-flat p-6 block card-tilt hover:border-cyan/40 h-full", children: [
    /* @__PURE__ */ jsxs("p", { className: "mono text-[11px] text-bone/45", children: [
      String(i + 1).padStart(2, "0"),
      " · ",
      /* @__PURE__ */ jsx("span", { className: "text-cyan", children: "interactive" })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "display-md text-2xl mt-2", children: l.title }),
    /* @__PURE__ */ jsx("p", { className: "text-sm muted mt-2", children: l.summary })
  ] }) : /* @__PURE__ */ jsxs("div", { className: "panel-flat p-6 h-full opacity-70", children: [
    /* @__PURE__ */ jsxs("p", { className: "mono text-[11px] text-bone/45", children: [
      String(i + 1).padStart(2, "0"),
      " · in production"
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "display-md text-2xl mt-2", children: l.title }),
    /* @__PURE__ */ jsx("p", { className: "text-sm muted mt-2", children: l.summary })
  ] }) }, l.slug)) })
] });
export {
  SplitComponent as component
};
