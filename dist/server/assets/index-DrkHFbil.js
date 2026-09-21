import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useRef, useState, useEffect, Suspense, lazy } from "react";
import { u as useCanvasAllowed, L as Lod0Canvas, C as CLAIM_BY_ID, S as STUDY_BY_PMID, I as ILLUSTRATIVE_BADGE, a as COMPOUND_BY_SLUG, b as COMPOUNDS } from "./router-CxtrX1wR.js";
import { c as createScrub } from "./timeline-lCL6MsVU.js";
import { C as CompoundCard } from "./CompoundCard-CQM9j2kR.js";
import { r as researchPulse } from "./evidence-Dz2qVTbe.js";
import { N as NODE_STYLE, s as shapePath } from "./nodes-CgAqZhBP.js";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
import "./ChainRenderer-DYgLieBk.js";
import "react-dom/client";
import "./SequenceSVG-qNlYzj3F.js";
import "./SourceBadge-DFiLYoWt.js";
const HeroScene = lazy(() => import("./HeroScene-DBbMUNlN.js").then((m) => ({ default: m.HeroScene })));
const CAPTIONS = [
  { from: 0.04, to: 0.24, k: "Structure", v: "BPC-157 · 15 residues · GEPPPGKPADDAGLV" },
  { from: 0.26, to: 0.48, k: "N-terminus", v: "Gly1 → Glu2 — the loose end of a short chain" },
  { from: 0.45, to: 0.74, k: "Hinge", v: "Pro3–Pro5 — three consecutive prolines; the helix breaks here" },
  { from: 0.78, to: 1.12, k: "C-terminus", v: "Leu14 → Val15 — where the sequence stops and the claim begins" }
];
function Hero() {
  const allowed = useCanvasAllowed();
  const section = useRef(null);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const [firstFrame, setFirstFrame] = useState(false);
  const copyRef = useRef(null);
  const capRefs = useRef([]);
  const barRef = useRef(null);
  const hintRef = useRef(null);
  useEffect(() => {
    if (!section.current) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const cleanup = createScrub({
      trigger: section.current,
      end: "+=150%",
      pin: true,
      scrub: 0.8,
      onProgress: (p) => {
        progress.current = p;
        if (copyRef.current) {
          const k = 1 - Math.min(1, p / 0.22);
          copyRef.current.style.opacity = String(k);
          copyRef.current.style.transform = `translateY(${-p * 90}px)`;
          copyRef.current.style.pointerEvents = k < 0.3 ? "none" : "auto";
        }
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
        if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - p / 0.12));
        CAPTIONS.forEach((c, i) => {
          const el = capRefs.current[i];
          if (!el) return;
          const inW = (p - c.from) / 0.06;
          const outW = (c.to - p) / 0.06;
          const o = Math.max(0, Math.min(1, inW, outW));
          el.style.opacity = String(o);
          el.style.transform = `translateY(${(1 - o) * 10}px)`;
        });
      }
    });
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cleanup();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return /* @__PURE__ */ jsxs("section", { ref: section, className: "relative h-[100vh] w-full overflow-hidden bg-obsidian grain", "aria-label": "Hero", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: "/posters/hero.svg",
        alt: "A sequence-derived visualization of the BPC-157 chain: fifteen residues with a three-proline hinge, drawn in cyan and violet against near-black",
        width: 1440,
        height: 900,
        fetchPriority: "high",
        decoding: "async",
        className: "absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms]",
        style: { opacity: firstFrame ? 0 : 1 }
      }
    ),
    allowed && /* @__PURE__ */ jsx(Lod0Canvas, { className: "absolute inset-0", style: { position: "absolute", inset: 0, width: "100%", height: "100%" }, onFirstFrame: () => setFirstFrame(true), cameraZ: 16, children: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(HeroScene, { progress, pointer }) }) }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none", style: { background: "linear-gradient(180deg, rgba(10,11,14,0.35) 0%, rgba(10,11,14,0) 35%, rgba(10,11,14,0) 55%, rgba(10,11,14,0.78) 100%)" } }),
    /* @__PURE__ */ jsxs("div", { ref: copyRef, className: "relative z-10 h-full wrap flex flex-col justify-end pb-[10vh] md:pb-[12vh]", children: [
      /* @__PURE__ */ jsx("p", { className: "label label-cyan mb-6", children: "The Molecular Evidence & Signal Atlas" }),
      /* @__PURE__ */ jsxs("h1", { className: "display text-[clamp(3rem,8vw,7.6rem)] text-bone", children: [
        "Trace the signal.",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { className: "text-bone/70", children: "Follow the evidence." })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "lede mt-7 max-w-xl", children: "Explore how molecular research, human reports, and internet claims connect — and where they don’t." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-9 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsx(Link, { to: "/explore", className: "btn btn-primary", children: "Explore the Atlas" }),
        /* @__PURE__ */ jsx(Link, { to: "/claim/$id", params: { id: "CLAIM-BPC157-TENDON-REPAIR" }, className: "btn", children: "Inspect a Claim" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-8 text-[12px] faint max-w-md", children: "Research and educational information. Evidence classes remain explicitly separated." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute left-5 md:left-10 bottom-[9vh] z-10 pointer-events-none", children: CAPTIONS.map((c, i) => /* @__PURE__ */ jsxs("div", { ref: (el) => {
      capRefs.current[i] = el;
    }, className: "absolute bottom-0 left-0 w-[min(80vw,520px)]", style: { opacity: 0 }, children: [
      /* @__PURE__ */ jsx("p", { className: "label label-cyan mb-2", children: c.k }),
      /* @__PURE__ */ jsx("p", { className: "mono text-[13px] md:text-[15px] text-bone/85", children: c.v })
    ] }, c.k)) }),
    /* @__PURE__ */ jsxs("div", { className: "absolute right-5 md:right-10 bottom-[9vh] z-10 text-right pointer-events-none hidden sm:block", children: [
      /* @__PURE__ */ jsx("p", { className: "label", children: "Structure provenance" }),
      /* @__PURE__ */ jsx("p", { className: "mono text-[12px] text-bone/70 mt-1", children: "Sequence-derived visualization (procedural, not measured)" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 inset-x-0 h-[2px] bg-bone/10 z-10", children: /* @__PURE__ */ jsx("div", { ref: barRef, className: "h-full bg-cyan origin-left", style: { transform: "scaleX(0)" } }) }),
    /* @__PURE__ */ jsx("div", { ref: hintRef, className: "absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-10", children: /* @__PURE__ */ jsx("span", { className: "label !text-bone/35", children: "Scroll to move through the structure" }) })
  ] });
}
function Home() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Hero, {}),
    /* @__PURE__ */ jsx(ThreeWorlds, {}),
    /* @__PURE__ */ jsx(FeaturedTrace, {}),
    /* @__PURE__ */ jsx(ExploreCompounds, {}),
    /* @__PURE__ */ jsx(Pulse, {}),
    /* @__PURE__ */ jsx(Why, {})
  ] });
}
const WORLDS = [{
  id: "research",
  k: "World A",
  title: "What research found",
  body: "Published experiments, models and trials.",
  to: "/explore",
  color: "#5FE3FF"
}, {
  id: "reports",
  k: "World B",
  title: "What people report",
  body: "Structured public experience signals.",
  to: "/signal",
  color: "#8A63FF"
}, {
  id: "claims",
  k: "World C",
  title: "How claims travel",
  body: "See how scientific findings become internet narratives.",
  to: "/claims",
  color: "#F2EEE6"
}];
function ThreeWorlds() {
  const [hover, setHover] = useState(null);
  return /* @__PURE__ */ jsxs("section", { className: "section wrap relative", "aria-label": "The three worlds", children: [
    /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Three disconnected worlds" }),
    /* @__PURE__ */ jsx("h2", { className: "display text-[clamp(2rem,4.6vw,4.2rem)] mt-3 max-w-3xl", children: "Connected without pretending they are the same kind of evidence." }),
    /* @__PURE__ */ jsxs("div", { className: "relative mt-12 grid md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx("svg", { className: "absolute inset-0 w-full h-full pointer-events-none hidden md:block", "aria-hidden": true, children: [[0, 1], [1, 2], [0, 2]].map(([a, b]) => {
        const lit = hover !== null && (hover === a || hover === b);
        const x1 = `${(a + 0.5) * 33.33}%`, x2 = `${(b + 0.5) * 33.33}%`;
        const y = a === 0 && b === 2 ? "12%" : "50%";
        return /* @__PURE__ */ jsx("line", { x1, y1: y, x2, y2: y, stroke: lit ? WORLDS[hover].color : "#F2EEE6", strokeOpacity: lit ? 0.9 : 0.08, strokeWidth: lit ? 1.5 : 1, strokeDasharray: lit ? "0" : "4 6", style: {
          transition: "stroke-opacity .5s, stroke .5s, stroke-dashoffset 1.2s",
          strokeDashoffset: lit ? 0 : 40
        } }, `${a}${b}`);
      }) }),
      WORLDS.map((w, i) => /* @__PURE__ */ jsxs(Link, { to: w.to, className: "panel-flat relative p-7 md:p-9 min-h-[300px] flex flex-col justify-between card-tilt overflow-hidden", onPointerEnter: () => setHover(i), onPointerLeave: () => setHover(null), style: {
        borderColor: hover === i ? `${w.color}66` : void 0
      }, children: [
        /* @__PURE__ */ jsx("div", { className: "absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl", style: {
          background: w.color,
          opacity: hover === i ? 0.16 : 0.06,
          transition: "opacity .6s"
        } }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "label", style: {
            color: w.color
          }, children: w.k }),
          /* @__PURE__ */ jsx("h3", { className: "display-md text-2xl md:text-3xl mt-3", children: w.title })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm muted max-w-xs mt-8", children: w.body })
      ] }, w.id))
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-6 text-sm muted max-w-2xl", children: "Those are separate evidence classes and remain separate everywhere in the atlas. The central question is not “does it work?” but: where did this claim come from, what does the evidence actually say, what are people reporting, and how independent are those reports?" })
  ] });
}
function FeaturedTrace() {
  const claim = CLAIM_BY_ID["CLAIM-BPC157-TENDON-REPAIR"];
  const origin = claim.originStudy ? STUDY_BY_PMID[claim.originStudy] : void 0;
  const ref = useRef(null);
  const prog = useRef(null);
  const nodes = useRef([]);
  useEffect(() => {
    if (!ref.current) return;
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: "top 75%",
      end: "bottom 55%",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        if (prog.current) prog.current.style.transform = `scaleX(${p})`;
        nodes.current.forEach((el, i) => {
          if (!el) return;
          const k = Math.max(0, Math.min(1, (p - i * 0.22) / 0.16));
          el.style.opacity = String(0.3 + 0.7 * k);
          el.style.transform = `translateY(${(1 - k) * 14}px)`;
          el.dataset.lit = k > 0.8 ? "1" : "0";
        });
      }
    });
    return () => st.kill();
  }, []);
  const steps = [{
    kind: "research",
    k: "Paper",
    title: origin?.title ?? "Source relationship unresolved",
    sub: origin ? `${origin.journal} · ${origin.year} · PMID ${origin.pmid}` : null,
    badge: origin ? null : "Unverified",
    quote: claim.mutation[0].wording
  }, {
    kind: "claim",
    k: "Interpretation",
    title: claim.mutation[1].wording,
    sub: claim.mutation[1].classes.join(" · "),
    badge: ILLUSTRATIVE_BADGE,
    quote: null
  }, {
    kind: "claim",
    k: "Social discussion",
    title: claim.mutation[2].wording,
    sub: claim.mutation[2].classes.join(" · "),
    badge: ILLUSTRATIVE_BADGE,
    quote: null
  }, {
    kind: "community",
    k: "Community signal",
    title: "No source access for this platform",
    sub: "Corpus: 0 sources · Collection window: none · Platforms: none enabled",
    badge: null,
    quote: null,
    hollow: true
  }];
  return /* @__PURE__ */ jsx("section", { className: "section bg-graphite/40 border-y hairline", "aria-label": "Featured claim trace", children: /* @__PURE__ */ jsxs("div", { className: "wrap", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Featured claim trace" }),
        /* @__PURE__ */ jsxs("h2", { className: "display text-[clamp(2rem,4.6vw,4.2rem)] mt-3", children: [
          "“",
          claim.title,
          "”"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 mono text-[12px] text-bone/55", children: [
          claim.id,
          " · Tracked research claim · not labelled true or false"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/claim/$id", params: {
        id: claim.id
      }, className: "btn btn-primary", children: "Trace this claim" })
    ] }),
    /* @__PURE__ */ jsxs("div", { ref, className: "relative mt-14", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute left-0 right-0 top-[22px] h-px bg-bone/10 hidden lg:block", children: /* @__PURE__ */ jsx("div", { ref: prog, className: "h-full origin-left bg-gradient-to-r from-cyan via-bone to-violet", style: {
        transform: "scaleX(0)"
      } }) }),
      /* @__PURE__ */ jsx("ol", { className: "grid lg:grid-cols-4 gap-5", children: steps.map((s, i) => {
        const st = NODE_STYLE[s.kind];
        return /* @__PURE__ */ jsxs("li", { ref: (el) => {
          nodes.current[i] = el;
        }, className: "relative", style: {
          opacity: 0.3,
          transition: "opacity .3s, transform .3s"
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("svg", { width: "44", height: "44", viewBox: "-22 -22 44 44", className: "shrink-0 bg-obsidian rounded-full", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: shapePath(st.shape, 13), fill: s.hollow ? "transparent" : st.color, stroke: st.color, strokeWidth: 1.2, strokeDasharray: s.hollow ? "3 3" : void 0 }) }),
            /* @__PURE__ */ jsx("p", { className: "label", style: {
              color: st.color
            }, children: s.k })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `panel-flat p-5 mt-4 min-h-[210px] ${s.hollow ? "border-dashed" : ""}`, children: [
            /* @__PURE__ */ jsx("p", { className: `${i === 0 ? "text-sm" : "display-md text-xl"} text-bone/95`, children: i === 0 ? s.title : `“${s.title}”` }),
            s.quote && i === 0 && /* @__PURE__ */ jsxs("p", { className: "mt-3 text-[12px] text-bone/65 italic border-l-2 border-cyan/40 pl-3", children: [
              "“",
              s.quote,
              "”"
            ] }),
            s.sub && /* @__PURE__ */ jsx("p", { className: "mt-3 mono text-[11px] text-bone/50", children: s.sub }),
            s.badge && /* @__PURE__ */ jsx("span", { className: `chip mt-3 ${s.badge === "Unverified" ? "chip-amber" : "chip-hollow"}`, children: s.badge })
          ] })
        ] }, s.k);
      }) })
    ] })
  ] }) });
}
function ExploreCompounds() {
  const featured = ["bpc-157", "tb-500", "ghk-cu", "pt-141", "thymosin-alpha-1", "ll-37", "semaglutide", "mots-c"].map((s) => COMPOUND_BY_SLUG[s]);
  return /* @__PURE__ */ jsxs("section", { className: "section", "aria-label": "Explore compounds", children: [
    /* @__PURE__ */ jsxs("div", { className: "wrap flex flex-wrap items-end justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Explore compounds" }),
        /* @__PURE__ */ jsx("h2", { className: "display text-[clamp(2rem,4.6vw,4.2rem)] mt-3", children: "Each drawn from its own sequence." }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm muted max-w-xl", children: "Name · evidence distribution from verified records · latest change · community-signal presence. No pricing, no dosing, no “best for”." })
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/explore", className: "btn", children: [
        "All ",
        COMPOUNDS.length,
        " compounds"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 overflow-x-auto rail pb-4", children: /* @__PURE__ */ jsx("div", { className: "wrap flex gap-5 items-end w-max", children: featured.map((c, i) => /* @__PURE__ */ jsx(CompoundCard, { compound: c, index: i }, c.slug)) }) })
  ] });
}
function Pulse() {
  const items = researchPulse();
  return /* @__PURE__ */ jsx("section", { className: "section border-y hairline bg-graphite/40", "aria-label": "Live research pulse", children: /* @__PURE__ */ jsxs("div", { className: "wrap", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-cyan pulse-dot", "aria-hidden": true }),
      /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Research pulse" })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "display text-[clamp(2rem,4.6vw,4.2rem)] mt-3", children: "Honest counters, computed from the corpus." }),
    /* @__PURE__ */ jsx("dl", { className: "mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: items.map((it) => /* @__PURE__ */ jsxs("div", { className: "panel-flat p-6", children: [
      /* @__PURE__ */ jsx("dt", { className: "label", children: it.label }),
      /* @__PURE__ */ jsxs("dd", { className: "mt-3 display text-5xl", children: [
        it.value,
        /* @__PURE__ */ jsx("span", { className: "text-xl text-bone/40", children: it.of !== null ? ` / ${it.of}` : "" })
      ] }),
      /* @__PURE__ */ jsx("dd", { className: "mt-3 mono text-[11px] text-bone/50", children: it.at ? `as of ${String(it.at).slice(0, 10)}` : "no timestamp — connector not enabled" }),
      /* @__PURE__ */ jsx("dd", { className: "mt-1 text-[12px] muted", children: it.note })
    ] }, it.label)) })
  ] }) });
}
function Why() {
  return /* @__PURE__ */ jsxs("section", { className: "section wrap", "aria-label": "Why Cyravon exists", children: [
    /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Why Cyravon exists" }),
    /* @__PURE__ */ jsx("blockquote", { className: "display text-[clamp(1.6rem,3.6vw,3.2rem)] mt-6 max-w-5xl text-bone/90", children: "The same molecular claim can appear in a paper, a podcast, a Reddit story and hundreds of short-form posts. Those are not the same kind of evidence. Cyravon connects them without collapsing them together." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsx(Link, { to: "/methodology", className: "btn", children: "Read the methodology" }),
      /* @__PURE__ */ jsx(Link, { to: "/coverage", className: "btn", children: "What we can and cannot see" })
    ] })
  ] });
}
export {
  Home as component
};
