import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { S as STUDY_BY_PMID, N as RELATIONSHIP_LABEL, O as pubmedUrl, P as Route, C as CLAIM_BY_ID, a as COMPOUND_BY_SLUG, g as displayName, T as TRANSLATION_STAGES } from "./router-CxtrX1wR.js";
import { P as PLATFORMS, H as HUMAN_SIGNAL_LINE, C as CORPUS, E as EMPTY_PLATFORM } from "./signal-C6q76ez9.js";
import { useMemo, useState, useEffect } from "react";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from "d3-force";
import { L as LineageEdge, N as NODE_STYLE, S as SvgNode, a as NodeCard } from "./nodes-CgAqZhBP.js";
import { M as MutationLadder } from "./MutationLadder-Dabj_vIB.js";
import { S as StudyCard, a as SpeciesBadge, b as SourceCard, T as TranslationTrack } from "./SourceCard-C-lk8gdd.js";
import { S as SourceBadge } from "./SourceBadge-DFiLYoWt.js";
import { E as EmptyState } from "./EmptyState-DIM_9RBj.js";
import { C as CorpusHeader } from "./CorpusHeader-CoLdDxIf.js";
import { C as ChangeDiff } from "./ChangeDiff-CXImkrDM.js";
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
import "./timeline-lCL6MsVU.js";
function build(claim) {
  const nodes = [{ id: claim.id, kind: "claim", label: claim.title, sub: claim.id, hollow: false, detail: "Canonical claim. Status: tracked research claim. Not labelled true or false." }];
  const links = [];
  for (const s of claim.support) {
    const st = STUDY_BY_PMID[s.pmid];
    const ok = st?.status === "verified";
    nodes.push({ id: s.pmid, kind: "research", label: ok ? (st.title ?? "").slice(0, 58) + ((st.title ?? "").length > 58 ? "…" : "") : "Unverified record", sub: ok ? `PMID ${s.pmid} · ${st.journal} ${st.year ?? ""}` : `PMID ${s.pmid}`, hollow: !ok, href: ok ? pubmedUrl(s.pmid) : void 0, detail: ok ? `${RELATIONSHIP_LABEL[s.relationship]}${s.basis ? ` — “${s.basis}”` : " — the record discusses the theme but does not test the claim."}` : "Source relationship unresolved." });
    links.push({ source: s.pmid, target: claim.id, rel: ok ? RELATIONSHIP_LABEL[s.relationship] : "UNRESOLVED", unresolved: !ok || s.relationship === "does_not_test" });
  }
  for (const p of PLATFORMS.slice(0, 4)) {
    nodes.push({ id: `platform-${p.id}`, kind: "community", label: p.name, sub: "No source access for this platform", hollow: true, detail: `Adapter: ${p.adapter}. ${p.state}. No mention is counted.` });
    links.push({ source: `platform-${p.id}`, target: claim.id, rel: "NO ACCESS", unresolved: true });
  }
  for (const s of claim.contradictions) {
    nodes.push({ id: `c-${s.pmid}`, kind: "contradiction", label: `PMID ${s.pmid}`, sub: "contradicts", hollow: false, detail: s.basis ?? "" });
    links.push({ source: `c-${s.pmid}`, target: claim.id, rel: "CONTRADICTS", unresolved: false });
  }
  return { nodes, links };
}
function LineageGraph({ claim }) {
  const data = useMemo(() => build(claim), [claim]);
  const W = 900, H = 540;
  const [pos, setPos] = useState(null);
  const [sel, setSel] = useState(null);
  useEffect(() => {
    const nodes = data.nodes.map((n) => ({ ...n }));
    const links = data.links.map((l) => ({ ...l }));
    const sim = forceSimulation(nodes).force("link", forceLink(links).id((d) => d.id).distance((l) => l.unresolved ? 230 : 190).strength(0.8)).force("charge", forceManyBody().strength(-760)).force("center", forceCenter(W / 2, H / 2)).force("collide", forceCollide(58)).stop();
    nodes[0].fx = W / 2;
    nodes[0].fy = H / 2;
    for (let i = 0; i < 260; i++) sim.tick();
    setPos(nodes.map((n) => ({ x: Math.max(40, Math.min(W - 40, n.x ?? 0)), y: Math.max(30, Math.min(H - 30, n.y ?? 0)) })));
  }, [data]);
  const idx = Object.fromEntries(data.nodes.map((n, i) => [n.id, i]));
  return /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-[1fr_320px] gap-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "panel-flat overflow-hidden hidden md:block", children: [
      pos ? /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full", role: "img", "aria-label": `Claim lineage graph with ${data.nodes.length} nodes; see node cards for a text equivalent`, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("radialGradient", { id: "lg-bg", cx: "50%", cy: "50%", r: "60%", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#5FE3FF", stopOpacity: "0.05" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#5FE3FF", stopOpacity: "0" })
        ] }) }),
        /* @__PURE__ */ jsx("rect", { width: W, height: H, fill: "url(#lg-bg)" }),
        data.links.map((l, i) => {
          const s = pos[idx[typeof l.source === "string" ? l.source : l.source.id]];
          const t = pos[idx[typeof l.target === "string" ? l.target : l.target.id]];
          const kind = data.nodes[idx[typeof l.source === "string" ? l.source : l.source.id]].kind;
          return /* @__PURE__ */ jsx(LineageEdge, { x1: s.x, y1: s.y, x2: t.x, y2: t.y, relationship: l.rel, unresolved: l.unresolved, color: NODE_STYLE[kind].color }, i);
        }),
        data.nodes.map((n, i) => /* @__PURE__ */ jsx(SvgNode, { kind: n.kind, x: pos[i].x, y: pos[i].y, r: n.kind === "claim" ? 20 : 12, hollow: n.hollow, label: n.kind === "claim" ? void 0 : n.label.length > 26 ? n.label.slice(0, 26) + "…" : n.label, sublabel: n.kind === "claim" ? void 0 : n.sub.length > 30 ? n.sub.slice(0, 30) + "…" : n.sub, active: sel?.id === n.id, onClick: () => setSel(n) }, n.id)),
        /* @__PURE__ */ jsx("text", { x: pos[0].x, y: pos[0].y + 40, textAnchor: "middle", fontSize: 12, fontWeight: 700, fill: "#F2EEE6", fontFamily: "Manrope Variable, sans-serif", children: claim.title })
      ] }) : /* @__PURE__ */ jsx("div", { className: "h-[420px] flex items-center justify-center text-sm muted", children: "Laying out lineage…" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 px-4 py-3 border-t hairline mono text-[10px] text-bone/55", children: [
        Object.keys(NODE_STYLE).map((k) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2", style: { background: NODE_STYLE[k].color, borderRadius: NODE_STYLE[k].shape === "circle" ? 99 : 0 } }),
          NODE_STYLE[k].label
        ] }, k)),
        /* @__PURE__ */ jsx("span", { children: "dashed = unresolved / no access" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("aside", { className: "grid gap-2 content-start", "aria-label": "Node inspector", children: [
      sel ? /* @__PURE__ */ jsxs("div", { className: "panel p-4 fade-up", children: [
        /* @__PURE__ */ jsx("p", { className: "label", style: { color: NODE_STYLE[sel.kind].color }, children: NODE_STYLE[sel.kind].label }),
        /* @__PURE__ */ jsx("p", { className: "font-semibold mt-1 text-sm", children: sel.label }),
        /* @__PURE__ */ jsx("p", { className: "mono text-[11px] text-bone/50 mt-1", children: sel.sub }),
        /* @__PURE__ */ jsx("p", { className: "text-sm mt-3 text-bone/80", children: sel.detail }),
        sel.href && /* @__PURE__ */ jsx("a", { href: sel.href, target: "_blank", rel: "noreferrer noopener", className: "btn btn-sm mt-3", children: "Open source ↗" })
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm muted hidden md:block", children: "Select a node to inspect its provenance." }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-2 md:hidden", children: data.nodes.map((n) => /* @__PURE__ */ jsx(NodeCard, { kind: n.kind, title: n.label, meta: n.sub, hollow: n.hollow, href: n.href }, n.id)) })
    ] })
  ] });
}
const SECTIONS = ["Origin", "Original scope", "Claim lineage", "Claim mutation", "Research support", "Research contradictions", "Human signal", "Echo analysis", "Translation state", "Current interpretation", "Change history"];
function ClaimPage() {
  const {
    id
  } = Route.useLoaderData();
  const claim = CLAIM_BY_ID[id];
  const compound = COMPOUND_BY_SLUG[claim.compound];
  const origin = claim.originStudy ? STUDY_BY_PMID[claim.originStudy] : void 0;
  const verifiedOrigin = origin?.status === "verified";
  return /* @__PURE__ */ jsxs("article", { className: "pt-24", children: [
    /* @__PURE__ */ jsxs("header", { className: "wrap", children: [
      /* @__PURE__ */ jsx("p", { className: "mono text-[12px] text-bone/55", children: claim.id }),
      /* @__PURE__ */ jsxs("h1", { className: "display text-[clamp(2.4rem,6vw,5.6rem)] mt-3 max-w-5xl", children: [
        "“",
        claim.title,
        "”"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "chip chip-cyan", children: "Tracked research claim" }),
        /* @__PURE__ */ jsxs(Link, { to: "/compound/$slug", params: {
          slug: compound.slug
        }, className: "chip hover:border-cyan", children: [
          displayName(compound),
          " ↗"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[12px] muted", children: "Not labelled true or false. Status describes tracking, not verdict." })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "mt-8 flex flex-wrap gap-x-4 gap-y-2 border-y hairline py-3", "aria-label": "Sections", children: SECTIONS.map((s, i) => /* @__PURE__ */ jsx("a", { href: `#s${i}`, className: "label hover:!text-bone", children: s }, s)) })
    ] }),
    /* @__PURE__ */ jsx(Sec, { i: 0, title: "Origin", lede: "Earliest attributable support currently indexed.", children: verifiedOrigin && origin ? /* @__PURE__ */ jsx(StudyCard, { study: origin, relationship: "SUPPORTS", basis: origin.abstractQuote ?? null }) : /* @__PURE__ */ jsx(EmptyState, { tone: "amber", title: "Source relationship unresolved", detail: "The origin record could not be verified at build time and is not rendered as a citation." }) }),
    /* @__PURE__ */ jsx(Sec, { i: 1, title: "Original scope", lede: "Species, model, endpoint, wording — copied, not paraphrased.", children: /* @__PURE__ */ jsxs("dl", { className: "grid sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "panel-flat p-4", children: [
        /* @__PURE__ */ jsx("dt", { className: "label", children: "Species" }),
        /* @__PURE__ */ jsxs("dd", { className: "mt-2", children: [
          /* @__PURE__ */ jsx(SpeciesBadge, { species: claim.originalScope.species, source: "abstract" }),
          claim.originalScope.species && /* @__PURE__ */ jsx("span", { className: "block mt-1 text-[11px] muted", children: "stated in the abstract (cells derived from rat tissue); not stated in the title" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "panel-flat p-4", children: [
        /* @__PURE__ */ jsx("dt", { className: "label", children: "Model" }),
        /* @__PURE__ */ jsx("dd", { className: "mt-2 text-sm", children: claim.originalScope.model ?? "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "panel-flat p-4", children: [
        /* @__PURE__ */ jsx("dt", { className: "label", children: "Endpoint" }),
        /* @__PURE__ */ jsx("dd", { className: "mt-2 text-sm", children: claim.originalScope.endpoint ?? "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "panel-flat p-4", children: [
        /* @__PURE__ */ jsx("dt", { className: "label", children: "Wording" }),
        /* @__PURE__ */ jsx("dd", { className: "mt-2 text-sm italic text-bone/85", children: claim.originalScope.wording ? /* @__PURE__ */ jsxs(Fragment, { children: [
          "“",
          claim.originalScope.wording,
          "”"
        ] }) : "Source relationship unresolved" }),
        claim.originalScope.wordingSource && /* @__PURE__ */ jsx("dd", { className: "mono text-[11px] text-bone/45 mt-1", children: claim.originalScope.wordingSource })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Sec, { i: 2, title: "Claim lineage", lede: "Research → interpretation → community. Every edge names its relationship; dashed edges are unresolved or have no source access.", children: /* @__PURE__ */ jsx(LineageGraph, { claim }) }),
    /* @__PURE__ */ jsx(Sec, { i: 3, title: "Claim mutation", lede: "How language changes while a claim propagates. This is not automatically misinformation; each step is classified and linked to its source text.", children: /* @__PURE__ */ jsx(MutationLadder, { claim }) }),
    /* @__PURE__ */ jsx(Sec, { i: 4, title: "Research support", lede: "Study records and their explicit relationship to this claim.", children: /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-3", children: claim.support.map((s) => STUDY_BY_PMID[s.pmid] && /* @__PURE__ */ jsx(StudyCard, { study: STUDY_BY_PMID[s.pmid], relationship: RELATIONSHIP_LABEL[s.relationship], basis: s.basis }, s.pmid)) }) }),
    /* @__PURE__ */ jsx(Sec, { i: 5, title: "Research contradictions", lede: "Null and conflicting findings, methodological criticism.", children: claim.contradictions.length ? claim.contradictions.map((s) => STUDY_BY_PMID[s.pmid] && /* @__PURE__ */ jsx(StudyCard, { study: STUDY_BY_PMID[s.pmid], relationship: "CONTRADICTS", basis: s.basis }, s.pmid)) : /* @__PURE__ */ jsx(EmptyState, { title: "No contradictory study currently indexed", detail: "A partially-supporting record (numerically lower scores without statistical significance) is listed under Research support with its exact wording. Absence from the corpus is not evidence of absence." }) }),
    /* @__PURE__ */ jsxs(Sec, { i: 6, title: "Human signal", lede: HUMAN_SIGNAL_LINE, children: [
      /* @__PURE__ */ jsx(CorpusHeader, {}),
      /* @__PURE__ */ jsx("div", { className: "mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3", children: PLATFORMS.slice(0, 4).map((p) => /* @__PURE__ */ jsx(SourceCard, { platform: p.name }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxs(Sec, { i: 7, title: "Echo analysis", lede: "Independent origins vs derivative mentions. Ten thousand posts are not ten thousand observations.", children: [
      /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-3 gap-3", children: [["Raw mentions", "0"], ["Estimated independent origin clusters", "0"], ["Derivative / echo mentions", "0"]].map(([k, v]) => /* @__PURE__ */ jsxs("div", { className: "panel-flat p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "label", children: k }),
        /* @__PURE__ */ jsx("p", { className: "display text-4xl mt-2 text-bone/60", children: v }),
        /* @__PURE__ */ jsx("p", { className: "mono text-[11px] text-bone/45 mt-2", children: CORPUS.header })
      ] }, k)) }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm muted", children: [
        EMPTY_PLATFORM,
        ". No relationship (independent origin / response / repost / derivative / near duplicate / unknown) has been assigned because no mention exists in the corpus."
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Sec, { i: 8, title: "Translation state", lede: "Where the claim has actually been tested.", children: [
      /* @__PURE__ */ jsx(TranslationTrack, { rows: Object.entries(claim.translation).map(([outcome, stages]) => ({
        outcome,
        stages
      })) }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 mono text-[11px] text-bone/45", children: [
        "Stages: ",
        TRANSLATION_STAGES.map((s) => s.label).join(" → ")
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Sec, { i: 9, title: "Current interpretation", lede: "Constrained synthesis. Every sentence maps to a record above or an explicit empty state.", children: [
      /* @__PURE__ */ jsx("ol", { className: "grid gap-3", children: claim.interpretation.map((line, i) => /* @__PURE__ */ jsxs("li", { className: "panel-flat p-4 text-sm text-bone/85 flex gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "mono text-bone/40", children: i + 1 }),
        /* @__PURE__ */ jsx("span", { children: line })
      ] }, i)) }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-[12px] muted", children: [
        "Cyravon structured summary — generated from the structured records on this page, not free-form. Supporting records: ",
        claim.support.filter((s) => STUDY_BY_PMID[s.pmid]?.status === "verified").map((s) => /* @__PURE__ */ jsx(SourceBadge, { pmid: s.pmid, verified: true, link: false }, s.pmid))
      ] })
    ] }),
    /* @__PURE__ */ jsx(Sec, { i: 10, title: "Change history", lede: "Every material modification. Nothing is silently rewritten.", children: /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: claim.changeHistory.map((e, i) => /* @__PURE__ */ jsx(ChangeDiff, { event: e }, i)) }) })
  ] });
}
function Sec({
  i,
  title,
  lede,
  children
}) {
  return /* @__PURE__ */ jsx("section", { id: `s${i}`, className: "wrap py-14 md:py-16 border-b hairline", "aria-label": title, children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-[220px_1fr] gap-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: String(i + 1).padStart(2, "0") }),
      /* @__PURE__ */ jsx("h2", { className: "display-md text-2xl md:text-3xl mt-2", children: title }),
      lede && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm muted", children: lede })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "min-w-0", children })
  ] }) });
}
export {
  ClaimPage as component
};
