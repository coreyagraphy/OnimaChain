import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useMemo, useEffect } from "react";
import "./timeline-lCL6MsVU.js";
import { S as STUDY_BY_PMID, I as ILLUSTRATIVE_BADGE } from "./router-CxtrX1wR.js";
import { S as SourceBadge } from "./SourceBadge-DFiLYoWt.js";
import gsap from "gsap";
function diffWords(a, b) {
  const A = a.split(/\s+/), B = b.split(/\s+/);
  const dp = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0));
  for (let i2 = A.length - 1; i2 >= 0; i2--) for (let j2 = B.length - 1; j2 >= 0; j2--) dp[i2][j2] = A[i2].toLowerCase() === B[j2].toLowerCase() ? dp[i2 + 1][j2 + 1] + 1 : Math.max(dp[i2 + 1][j2], dp[i2][j2 + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < A.length && j < B.length) {
    if (A[i].toLowerCase() === B[j].toLowerCase()) {
      out.push({ w: B[j], state: "same" });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ w: A[i], state: "removed" });
      i++;
    } else {
      out.push({ w: B[j], state: "added" });
      j++;
    }
  }
  while (i < A.length) out.push({ w: A[i++], state: "removed" });
  while (j < B.length) out.push({ w: B[j++], state: "added" });
  return out;
}
function MutationLadder({ claim, autoplay = false }) {
  const steps = claim.mutation;
  const [k, setK] = useState(0);
  const stage = useRef(null);
  const diffs = useMemo(() => steps.map((s2, i) => i === 0 ? s2.wording.split(/\s+/).map((w) => ({ w, state: "same" })) : diffWords(steps[i - 1].wording, s2.wording)), [steps]);
  useEffect(() => {
    if (!stage.current) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    gsap.fromTo(stage.current.querySelectorAll("[data-tok]"), { opacity: 0, y: 8, filter: "blur(4px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, stagger: 0.02, ease: "power2.out" });
  }, [k]);
  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setK((v) => (v + 1) % steps.length), 3200);
    return () => clearInterval(id);
  }, [autoplay, steps.length]);
  const s = steps[k];
  const origin = s.sourcePmid ? STUDY_BY_PMID[s.sourcePmid] : void 0;
  return /* @__PURE__ */ jsxs("div", { className: "panel-flat p-5 md:p-7", children: [
    /* @__PURE__ */ jsx("ol", { className: "flex flex-wrap gap-2", "aria-label": "Mutation steps", children: steps.map((st, i) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { className: "btn btn-sm", "aria-pressed": i === k, onClick: () => setK(i), children: [
      i + 1,
      ". ",
      st.stage
    ] }) }, st.stage)) }),
    /* @__PURE__ */ jsx("input", { type: "range", min: 0, max: steps.length - 1, step: 1, value: k, onChange: (e) => setK(Number(e.target.value)), className: "w-full mt-4 accent-cyan", "aria-label": "Scrub mutation steps" }),
    /* @__PURE__ */ jsxs("div", { ref: stage, className: "mt-6 min-h-[150px]", children: [
      /* @__PURE__ */ jsxs("p", { className: "label", style: { color: k === 0 ? "#5FE3FF" : "#B9A2FF" }, children: [
        s.stage,
        k > 0 && /* @__PURE__ */ jsxs("span", { className: "text-bone/45", children: [
          " ← ",
          steps[k - 1].stage
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: `mt-3 ${k === 0 ? "text-lg md:text-xl leading-relaxed text-bone/90" : "display text-[clamp(1.6rem,3.4vw,3rem)]"}`, children: diffs[k].map((t, i) => /* @__PURE__ */ jsx("span", { "data-tok": true, className: t.state === "removed" ? "line-through text-amber/70 mr-[0.3em]" : t.state === "added" ? "text-violet mr-[0.3em]" : "mr-[0.3em]", children: t.w }, i)) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap gap-2 items-center", children: [
        s.sourcePmid ? /* @__PURE__ */ jsx(SourceBadge, { pmid: s.sourcePmid, verified: origin?.status === "verified" }) : /* @__PURE__ */ jsx("span", { className: "chip chip-hollow", children: ILLUSTRATIVE_BADGE }),
        s.classes.map((c) => /* @__PURE__ */ jsx("span", { className: "chip chip-amber", children: c }, c))
      ] }),
      k > 0 && /* @__PURE__ */ jsx("p", { className: "mt-3 mono text-[11px] text-bone/45", children: "struck = dropped from the previous wording · violet = added. Classification links to the previous step's text above." })
    ] })
  ] });
}
export {
  MutationLadder as M
};
