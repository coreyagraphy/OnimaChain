import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect, Suspense, lazy } from "react";
import { u as useCanvasAllowed, x as buildChain, L as Lod0Canvas, i as CLASS_COLORS, S as STUDY_BY_PMID, U as Route, a as COMPOUND_BY_SLUG, s as studiesForCompound, f as claimsForCompound, e as distinctGroups, d as computedMW, g as displayName, T as TRANSLATION_STAGES, N as RELATIONSHIP_LABEL } from "./router-CxtrX1wR.js";
import { e as evidenceGenome, D as DOMAIN_BY_ID, a as themesFor, t as translationFor, d as distributionFor, l as latestChangeFor } from "./evidence-Dz2qVTbe.js";
import { C as CORPUS, E as EMPTY_PLATFORM, H as HUMAN_SIGNAL_LINE, c as COMMUNITY_CLASS_LINE, P as PLATFORMS } from "./signal-C6q76ez9.js";
import { S as SequenceSVG, H as HOTSPOT_RULES } from "./SequenceSVG-qNlYzj3F.js";
import { p as provenanceText, P as ProvenanceLabel } from "./SourceBadge-DFiLYoWt.js";
import { S as StudyCard, b as SourceCard, T as TranslationTrack } from "./SourceCard-C-lk8gdd.js";
import { C as CORPUS_ABSENCE, E as EmptyState } from "./EmptyState-DIM_9RBj.js";
import { S as SignalFingerprint } from "./SignalFingerprint-DdS5mnOv.js";
import { C as CorpusHeader } from "./CorpusHeader-CoLdDxIf.js";
import { C as ClaimCard } from "./ClaimCard-DmW4lb9h.js";
import { T as TimelineLane } from "./TimelineLane-i2incZ5r.js";
import "./timeline-lCL6MsVU.js";
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
import "./ChangeDiff-CXImkrDM.js";
const Viewer = lazy(() => import("./ViewerScene-0AiQUiSq.js").then((m) => ({ default: m.ViewerScene })));
function StructureViewer({ compound, tint, accent, scrollRef }) {
  const allowed = useCanvasAllowed();
  const geometry = useMemo(() => buildChain(compound), [compound]);
  const [labels, setLabels] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showProv, setShowProv] = useState(false);
  const resetKey = useRef(0);
  const [rk, setRk] = useState(0);
  const prov = provenanceText(compound);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full min-h-[420px]", children: [
    ready && allowed ? /* @__PURE__ */ jsx(Lod0Canvas, { className: "absolute inset-0", style: { position: "absolute", inset: 0, width: "100%", height: "100%" }, cameraZ: 13, dpr: [1, 1.5], children: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Viewer, { geometry, tint, accent, labels, reducedEffects: reduced, autoRotate, scrollRef }, rk) }) }) : /* @__PURE__ */ jsx(SequenceSVG, { geometry, tint, className: "absolute inset-0 w-full h-full p-8", label: true }),
    /* @__PURE__ */ jsxs("div", { className: "absolute left-3 bottom-3 flex flex-wrap gap-1.5 z-10", role: "group", "aria-label": "3D controls", children: [
      /* @__PURE__ */ jsx("button", { className: "btn btn-sm", "aria-pressed": autoRotate, onClick: () => setAutoRotate((v) => !v), children: "Rotate" }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-sm", onClick: () => {
        resetKey.current++;
        setRk(resetKey.current);
      }, children: "Reset" }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-sm", "aria-pressed": labels, onClick: () => setLabels((v) => !v), children: "Labels" }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-sm", "aria-pressed": reduced, onClick: () => setReduced((v) => !v), children: "Reduced effects" }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-sm", "aria-pressed": showProv, onClick: () => setShowProv((v) => !v), children: "Provenance" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute right-3 top-3 z-10 text-right max-w-[60%]", children: /* @__PURE__ */ jsx(ProvenanceLabel, { compound }) }),
    showProv && /* @__PURE__ */ jsxs("div", { className: "absolute left-3 right-3 top-12 md:left-auto md:w-[360px] z-10 panel p-4 text-sm fade-up", "data-lenis-prevent": true, children: [
      /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Structure provenance" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-bone/85", children: [
        prov.primary,
        "."
      ] }),
      prov.secondary && /* @__PURE__ */ jsxs("p", { className: "mt-1 muted", children: [
        prov.secondary,
        "."
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-[12px] muted", children: "Backbone Cα positions are generated from the residue list with alpha-helix parameters (rise 1.5 Å, 100°/residue, radius 2.3 Å); proline kinks the axis 30–40°, glycine adds a seeded wobble, lactam bridges close the ring. Nothing here was measured." }),
      geometry.hotspots.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-3 grid gap-1 text-[12px]", children: geometry.hotspots.map((h, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2 items-start", children: [
        /* @__PURE__ */ jsx("span", { className: "mt-1 w-2 h-2 rounded-full shrink-0", style: { background: HOTSPOT_RULES[h.kind].color } }),
        /* @__PURE__ */ jsx("span", { className: "text-bone/80", children: h.label })
      ] }, i)) })
    ] })
  ] });
}
function ResidueTable({ geometry }) {
  if (geometry.placeholder) {
    return /* @__PURE__ */ jsxs("div", { className: "panel p-6 text-sm text-bone/70", children: [
      /* @__PURE__ */ jsx("p", { className: "label mb-2", children: "Residues" }),
      /* @__PURE__ */ jsx("p", { children: "Sequence pending verification. The residue table is generated only from a verified one-letter sequence." })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "panel overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "data", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "label", children: [
      /* @__PURE__ */ jsx("th", { children: "#" }),
      /* @__PURE__ */ jsx("th", { children: "Code" }),
      /* @__PURE__ */ jsx("th", { children: "Residue" }),
      /* @__PURE__ */ jsx("th", { children: "Class" }),
      /* @__PURE__ */ jsx("th", { children: "Chirality" }),
      /* @__PURE__ */ jsx("th", { children: "Features" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: geometry.residues.map((r) => /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("td", { className: "mono text-bone/60", children: r.pos }),
      /* @__PURE__ */ jsxs("td", { className: "mono", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle", style: { background: CLASS_COLORS[r.cls] } }),
        r.nonStandard ?? r.code
      ] }),
      /* @__PURE__ */ jsx("td", { children: r.name }),
      /* @__PURE__ */ jsx("td", { className: "capitalize text-bone/70", children: r.cls }),
      /* @__PURE__ */ jsx("td", { className: "mono text-bone/70", children: r.chirality }),
      /* @__PURE__ */ jsxs("td", { className: "text-bone/70", children: [
        r.hotspots.filter((h) => h !== "glycine").map((h) => /* @__PURE__ */ jsx("span", { className: "inline-block mr-2 px-2 py-0.5 rounded-full text-[11px]", style: { border: `1px solid ${HOTSPOT_RULES[h].color}66`, color: HOTSPOT_RULES[h].color }, children: HOTSPOT_RULES[h].title }, h)),
        r.code === "G" && /* @__PURE__ */ jsx("span", { className: "text-bone/40 text-[11px]", children: "flexible" })
      ] })
    ] }, r.index)) })
  ] }) }) });
}
function EvidenceGenome({ slug }) {
  const cells = evidenceGenome(slug);
  const [sel, setSel] = useState(null);
  const n = cells.length;
  const cx = 170, cy = 170, r0 = 46, r1 = 150;
  const max = Math.max(1, ...cells.map((c) => c.count ?? 0));
  return /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-[360px_1fr] gap-8 items-start", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 340 340", className: "w-full max-w-[340px]", role: "img", "aria-label": "Evidence genome radial; see table for values", children: [
        cells.map((c, i) => {
          const a0 = i / n * Math.PI * 2 - Math.PI / 2 + 0.03;
          const a1 = (i + 1) / n * Math.PI * 2 - Math.PI / 2 - 0.03;
          const k = c.count === null ? 0 : Math.min(1, c.count / max);
          const rr = r0 + (r1 - r0) * (0.12 + 0.88 * k);
          const f = (v) => (Math.round(v * 100) / 100).toFixed(2);
          const arc = (r, s, e) => `${f(cx + r * Math.cos(s))} ${f(cy + r * Math.sin(s))} A ${r} ${r} 0 0 1 ${f(cx + r * Math.cos(e))} ${f(cy + r * Math.sin(e))}`;
          const d = `M ${arc(r0, a0, a1)} L ${f(cx + rr * Math.cos(a1))} ${f(cy + rr * Math.sin(a1))} A ${f(rr)} ${f(rr)} 0 0 0 ${f(cx + rr * Math.cos(a0))} ${f(cy + rr * Math.sin(a0))} Z`;
          const outline = `M ${arc(r0, a0, a1)} L ${f(cx + r1 * Math.cos(a1))} ${f(cy + r1 * Math.sin(a1))} A ${r1} ${r1} 0 0 0 ${f(cx + r1 * Math.cos(a0))} ${f(cy + r1 * Math.sin(a0))} Z`;
          const filled = (c.count ?? 0) > 0;
          const active = sel?.id === c.id;
          const mid = (a0 + a1) / 2;
          return /* @__PURE__ */ jsxs("g", { onClick: () => setSel(active ? null : c), style: { cursor: "pointer" }, role: "button", tabIndex: 0, "aria-label": `${c.label}: ${c.count === null ? "not assessed" : c.value ?? c.count}`, children: [
            /* @__PURE__ */ jsx("path", { d: outline, fill: active ? "#5FE3FF" : "#F2EEE6", fillOpacity: active ? 0.06 : 0.02, stroke: "#F2EEE6", strokeOpacity: 0.12, strokeDasharray: c.count === null ? "3 3" : void 0 }),
            filled && /* @__PURE__ */ jsx("path", { d, fill: "#5FE3FF", fillOpacity: active ? 0.75 : 0.5, stroke: "#5FE3FF", strokeOpacity: 0.9 }),
            /* @__PURE__ */ jsx("text", { x: f(cx + (r1 + 14) * Math.cos(mid)), y: f(cy + (r1 + 14) * Math.sin(mid)), fontSize: 8, fill: "#F2EEE6", fillOpacity: 0.55, textAnchor: "middle", dominantBaseline: "middle", fontFamily: "JetBrains Mono Variable, monospace", children: i + 1 })
          ] }, c.id);
        }),
        /* @__PURE__ */ jsx("circle", { cx, cy, r: r0 - 6, fill: "#0A0B0E", stroke: "#F2EEE6", strokeOpacity: 0.15 }),
        /* @__PURE__ */ jsx("text", { x: cx, y: cy - 4, textAnchor: "middle", fontSize: 20, fill: "#F2EEE6", fontFamily: "Manrope Variable, sans-serif", fontWeight: 800, children: cells.reduce((s, c) => s + (c.id === "research-age" || c.id === "independent-groups" ? 0 : c.count ?? 0), 0) }),
        /* @__PURE__ */ jsx("text", { x: cx, y: cy + 12, textAnchor: "middle", fontSize: 8, fill: "#F2EEE6", fillOpacity: 0.5, fontFamily: "JetBrains Mono Variable, monospace", children: "record-dims" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] faint mt-2", children: "Filled = verified records in that class · hollow = zero indexed · dashed = not assessed. Descriptive only; not a score." })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("table", { className: "data", "aria-label": "Evidence genome values", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { children: "#" }),
          /* @__PURE__ */ jsx("th", { children: "Dimension" }),
          /* @__PURE__ */ jsx("th", { children: "Verified" }),
          /* @__PURE__ */ jsx("th", { children: "How" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: cells.map((c, i) => /* @__PURE__ */ jsxs("tr", { onClick: () => setSel(sel?.id === c.id ? null : c), style: { cursor: "pointer" }, className: sel?.id === c.id ? "bg-cyan/5" : "", children: [
          /* @__PURE__ */ jsx("td", { className: "mono text-bone/45", children: i + 1 }),
          /* @__PURE__ */ jsx("td", { className: "text-bone/90", children: c.label }),
          /* @__PURE__ */ jsx("td", { className: "mono", children: c.count === null ? /* @__PURE__ */ jsx("span", { className: "chip chip-hollow", children: "Not assessed" }) : c.value ?? (c.count === 0 ? /* @__PURE__ */ jsx("span", { className: "text-bone/40", children: "0 · hollow" }) : c.count) }),
          /* @__PURE__ */ jsx("td", { className: "text-[12px] muted", children: c.how })
        ] }, c.id)) })
      ] }),
      sel && /* @__PURE__ */ jsxs("div", { className: "mt-4 fade-up", children: [
        /* @__PURE__ */ jsxs("p", { className: "label label-cyan mb-2", children: [
          sel.label,
          " — backing records"
        ] }),
        sel.pmids.length ? /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: sel.pmids.map((p) => STUDY_BY_PMID[p] && /* @__PURE__ */ jsx(StudyCard, { study: STUDY_BY_PMID[p], compact: true }, p)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm muted", children: sel.count === null ? sel.how : CORPUS_ABSENCE })
      ] })
    ] })
  ] });
}
function ProvenanceDrawer({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[80]", role: "dialog", "aria-modal": "true", "aria-label": title, children: [
    /* @__PURE__ */ jsx("button", { className: "absolute inset-0 bg-obsidian/70", onClick: onClose, "aria-label": "Close" }),
    /* @__PURE__ */ jsxs("aside", { className: "absolute right-0 top-0 h-full w-[min(92vw,480px)] bg-graphite border-l hairline p-6 overflow-y-auto fade-up", "data-lenis-prevent": true, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Provenance" }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-sm", onClick: onClose, children: "Close" })
      ] }),
      /* @__PURE__ */ jsx("h3", { className: "display-md text-xl mt-3", children: title }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-sm prose-block", children })
    ] })
  ] });
}
function Dossier() {
  const {
    slug
  } = Route.useLoaderData();
  const c = COMPOUND_BY_SLUG[slug];
  const domain = DOMAIN_BY_ID[c.domain];
  const geometry = useMemo(() => buildChain(c), [c]);
  const studies = studiesForCompound(slug);
  const claims = claimsForCompound(slug);
  const themes = themesFor(slug);
  const translation = translationFor(slug);
  const dist = distributionFor(slug);
  const change = latestChangeFor(slug);
  const groups = distinctGroups(studies);
  const mw = c.mw ?? computedMW(c);
  const [drawer, setDrawer] = useState(null);
  const header = useRef(null);
  const scroll = useRef(0);
  useEffect(() => {
    if (!header.current) return;
    const st = ScrollTrigger.create({
      trigger: header.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (s) => {
        scroll.current = s.progress;
      }
    });
    return () => st.kill();
  }, []);
  const events = claims.flatMap((cl) => cl.changeHistory.map((e) => ({
    ...e,
    claim: cl.id
  })));
  return /* @__PURE__ */ jsxs("article", { className: "pt-16", children: [
    /* @__PURE__ */ jsxs("header", { ref: header, className: "relative min-h-[92vh] grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-stretch overflow-hidden", style: {
      background: `radial-gradient(70% 60% at 75% 40%, ${domain.palette.base}14, transparent 60%)`
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "wrap !mr-0 py-12 lg:py-16 flex flex-col justify-center relative z-10", children: [
        /* @__PURE__ */ jsxs("p", { className: "label", style: {
          color: domain.palette.base
        }, children: [
          domain.name,
          " · ",
          domain.researchLabel
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "display text-[clamp(2.8rem,6.5vw,6rem)] mt-4", children: displayName(c) }),
        c.displayName && /* @__PURE__ */ jsxs("p", { className: "mono text-[12px] text-bone/55 mt-2", children: [
          "Compound: ",
          c.name.toLowerCase()
        ] }),
        c.aliases.length > 0 && /* @__PURE__ */ jsxs("p", { className: "mt-4 text-sm muted", children: [
          "Also indexed as ",
          c.aliases.join(" · ")
        ] }),
        /* @__PURE__ */ jsxs("dl", { className: "mt-8 grid grid-cols-2 gap-x-6 gap-y-4 max-w-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx("dt", { className: "label", children: "Sequence" }),
            /* @__PURE__ */ jsx("dd", { className: "mono text-[13px] md:text-sm mt-1 break-all text-bone/90", children: c.sequence ?? /* @__PURE__ */ jsx("span", { className: "text-bone/50", children: "Sequence pending verification" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "label", children: "Length" }),
            /* @__PURE__ */ jsx("dd", { className: "mono mt-1", children: c.sequence ? `${c.sequence.length} residues` : "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "label", children: "MW" }),
            /* @__PURE__ */ jsxs("dd", { className: "mono mt-1", children: [
              mw ? `${mw} Da` : "—",
              mw && !c.mw && /* @__PURE__ */ jsx("span", { className: "text-bone/45 text-[11px]", children: " computed" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "label", children: "Classification" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm", children: c.tags.join(" · ") })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "label", children: "Research state" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm", children: studies.length ? `${studies.length} verified record${studies.length === 1 ? "" : "s"}` : "No verified record indexed" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx("dt", { className: "label", children: "Structure provenance" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1", children: /* @__PURE__ */ jsx(ProvenanceLabel, { compound: c }) })
          ] })
        ] }),
        c.note && /* @__PURE__ */ jsx("p", { className: "mt-4 text-[12px] muted max-w-lg", children: c.note }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx("a", { href: "#structure", className: "btn btn-primary", children: "View structure" }),
          /* @__PURE__ */ jsx(Link, { to: "/compare", search: {
            a: slug,
            b: slug === "tb-500" ? "bpc-157" : "tb-500"
          }, className: "btn", children: "Compare" }),
          /* @__PURE__ */ jsx(Link, { to: "/saved", className: "btn", children: "Save" }),
          /* @__PURE__ */ jsx("button", { className: "btn", onClick: () => setDrawer("share"), children: "Share" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { id: "structure", className: "relative min-h-[440px] lg:min-h-0", children: /* @__PURE__ */ jsx(StructureViewer, { compound: c, tint: domain.palette.base, accent: domain.palette.accent, scrollRef: scroll }) })
    ] }),
    /* @__PURE__ */ jsx(Section, { id: "snapshot", k: "B", title: "Snapshot", children: /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-5 gap-3", children: [
      /* @__PURE__ */ jsx(Snap, { title: "Research footprint", onOpen: () => setDrawer("research"), children: studies.length ? `${dist.inVitro} in vitro · ${dist.animal} animal · ${dist.human} human · ${dist.review} review` : CORPUS_ABSENCE }),
      /* @__PURE__ */ jsx(Snap, { title: "Human signal footprint", onOpen: () => setDrawer("signal"), children: CORPUS.header }),
      /* @__PURE__ */ jsx(Snap, { title: "Translation state", onOpen: () => setDrawer("translation"), children: translation.length ? translation.map((t) => `${t.outcome}: ${t.stages.length ? TRANSLATION_STAGES.filter((s) => t.stages.includes(s.id)).map((s) => s.label).join(" → ") : "no supported stage"}`).join(" · ") : "No outcome mapped" }),
      /* @__PURE__ */ jsx(Snap, { title: "Latest meaningful change", onOpen: () => setDrawer("change"), amber: true, children: change ? `${change.date} — ${change.change}` : "No change recorded" }),
      /* @__PURE__ */ jsxs(Snap, { title: "Regulatory snapshot", onOpen: () => setDrawer("regulatory"), children: [
        "No regulatory record indexed · ",
        /* @__PURE__ */ jsx(Link, { to: "/status/$compound", params: {
          compound: slug
        }, className: "underline", children: "jurisdiction view" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Section, { id: "genome", k: "C", title: "Evidence genome", lede: "Where the evidence actually lives, across fifteen descriptive dimensions. Counts are of verified records only. Not a works/doesn't-work score.", children: studies.length ? /* @__PURE__ */ jsx(EvidenceGenome, { slug }) : /* @__PURE__ */ jsx(EmptyState, { title: CORPUS_ABSENCE, detail: "The genome renders hollow until a verified record is indexed for this compound." }) }),
    /* @__PURE__ */ jsx(Section, { id: "themes", k: "D", title: "Research themes", lede: "Themes must derive from indexed research, not keyword generation. Each theme lists the verified PMIDs that carry it.", children: themes.length ? /* @__PURE__ */ jsx("ul", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: themes.map((t) => /* @__PURE__ */ jsxs("li", { className: "panel-flat p-5", children: [
      /* @__PURE__ */ jsx("p", { className: "label", style: {
        color: t.kind === "discussion" ? "#8A63FF" : "#5FE3FF"
      }, children: t.kind === "discussion" ? "Discussion theme" : "Research theme" }),
      /* @__PURE__ */ jsx("p", { className: "display-md text-lg mt-2", children: t.label }),
      /* @__PURE__ */ jsx("p", { className: "mono text-[11px] text-bone/50 mt-3", children: t.kind === "discussion" ? EMPTY_PLATFORM : t.pmids.length ? `Indexed records: ${t.pmids.map((p) => `PMID ${p}`).join(", ")}` : "Fixture theme — no verified record indexed yet" })
    ] }, t.id)) }) : /* @__PURE__ */ jsx(EmptyState, { title: "No themes indexed", detail: "Research themes appear only after verified records are indexed and classified for this compound." }) }),
    /* @__PURE__ */ jsxs(Section, { id: "signal", k: "E", title: "What people report", lede: HUMAN_SIGNAL_LINE, children: [
      /* @__PURE__ */ jsx(CorpusHeader, {}),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 grid lg:grid-cols-[1fr_1fr] gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "panel-flat p-5", children: [
            /* @__PURE__ */ jsx("p", { className: "label", children: "Most recurrent reported themes" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-bone/80", children: EMPTY_PLATFORM })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: [["Raw mentions", "0"], ["Estimated origin clusters", "0"], ["Platform distribution", "none enabled"], ["Time distribution", "no window"]].map(([k, v]) => /* @__PURE__ */ jsxs("div", { className: "panel-flat p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "label", children: k }),
            /* @__PURE__ */ jsx("p", { className: "mono text-lg mt-1 text-bone/70", children: v })
          ] }, k)) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm muted", children: COMMUNITY_CLASS_LINE })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: PLATFORMS.slice(0, 4).map((p) => /* @__PURE__ */ jsx(SourceCard, { platform: p.name }, p.id)) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(SignalFingerprint, { title: "Signal integrity fingerprint" }) })
    ] }),
    /* @__PURE__ */ jsxs(Section, { id: "convergence", k: "F", title: "Signal ↔ Science", lede: "Two lanes, never merged. Relationships are computed, not concluded.", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "panel-flat p-5 border-t-2 border-t-cyan", children: [
          /* @__PURE__ */ jsx("p", { className: "label label-cyan", children: "Research lane" }),
          themes.filter((t) => t.kind === "research").length ? /* @__PURE__ */ jsx("ul", { className: "mt-3 grid gap-2", children: themes.filter((t) => t.kind === "research").map((t) => /* @__PURE__ */ jsxs("li", { className: "text-sm flex justify-between gap-3", children: [
            /* @__PURE__ */ jsx("span", { children: t.label }),
            /* @__PURE__ */ jsxs("span", { className: "mono text-[11px] text-bone/45", children: [
              t.pmids.length,
              " verified"
            ] })
          ] }, t.id)) }) : /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm muted", children: "No research theme indexed." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "panel-flat p-5 border-t-2 border-t-violet", children: [
          /* @__PURE__ */ jsx("p", { className: "label label-violet", children: "Human signal lane" }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm muted", children: EMPTY_PLATFORM }),
          /* @__PURE__ */ jsx(CorpusHeader, { className: "mt-3" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 panel p-5 flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: "Relationship" }),
        /* @__PURE__ */ jsx("span", { className: "chip chip-hollow", children: "insufficient mapping" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm muted", children: "One lane is empty; overlap cannot be assessed. Overlap, where it exists, does not establish human efficacy." })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Section, { id: "claims", k: "G", title: "Claim lineage", lede: "Top associated claims. Each opens the full lineage graph.", children: claims.length ? /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-4", children: claims.map((cl) => /* @__PURE__ */ jsx(ClaimCard, { claim: cl }, cl.id)) }) : /* @__PURE__ */ jsx(EmptyState, { title: "No claim record indexed for this compound", detail: "Claims are created only with an origin record or an explicit unresolved-origin state." }) }),
    /* @__PURE__ */ jsx(Section, { id: "translation", k: "H", title: "Translation gap", lede: "Cell → Mouse → Rat → Larger animal → Human → Controlled human → Approved use — per outcome. Stages light only where a verified record supports them.", children: /* @__PURE__ */ jsx(TranslationTrack, { rows: translation }) }),
    /* @__PURE__ */ jsx(Section, { id: "independence", k: "I", title: "Research independence", lede: "Ten papers from one laboratory are not ten independent replications.", children: studies.length ? /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-[1fr_1fr] gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "panel-flat p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "label", children: "Distinct last-author groups (proxy)" }),
        /* @__PURE__ */ jsxs("p", { className: "display text-5xl mt-2", children: [
          groups.length,
          /* @__PURE__ */ jsxs("span", { className: "text-lg text-bone/40", children: [
            " / ",
            studies.length,
            " records"
          ] })
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "mt-4 grid gap-1 text-sm", children: groups.map((g) => /* @__PURE__ */ jsxs("li", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: g }),
          /* @__PURE__ */ jsxs("span", { className: "mono text-[11px] text-bone/45", children: [
            studies.filter((s) => s.meta?.lastAuthor === g).length,
            " record(s)"
          ] })
        ] }, g)) }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-[12px] muted", children: "Institutions, funding and citation links: Not assessed — esummary does not carry affiliations; a Crossref/efetch connector is required." })
      ] }),
      /* @__PURE__ */ jsx(IndependenceMap, { groups, counts: groups.map((g) => studies.filter((s) => s.meta?.lastAuthor === g).length) })
    ] }) : /* @__PURE__ */ jsx(EmptyState, { title: "Not assessed", detail: "Independence is estimated only from verified records." }) }),
    /* @__PURE__ */ jsxs(Section, { id: "contradictions", k: "J", title: "What doesn't fit?", lede: "Disagreement is surfaced, not hidden.", children: [
      claims.some((cl) => cl.support.some((s) => s.relationship === "partially_supports")) && /* @__PURE__ */ jsx("div", { className: "grid gap-3 mb-4", children: claims.flatMap((cl) => cl.support.filter((s) => s.relationship === "partially_supports").map((s) => STUDY_BY_PMID[s.pmid] && /* @__PURE__ */ jsx(StudyCard, { study: STUDY_BY_PMID[s.pmid], relationship: RELATIONSHIP_LABEL[s.relationship], basis: s.basis }, s.pmid))) }),
      /* @__PURE__ */ jsx(EmptyState, { title: "No contradictory study currently indexed", detail: "Null findings, conflicting research and methodological criticism appear here when indexed. A partial relationship above is not a contradiction." })
    ] }),
    /* @__PURE__ */ jsx(Section, { id: "timeline", k: "K", title: "Timeline", lede: "Research and public-signal history, in separate lanes.", children: ["research", "trials", "regulatory", "signal"].map((lane) => /* @__PURE__ */ jsx(TimelineLane, { lane, events: events.filter((e) => e.lane === lane) }, lane)) }),
    /* @__PURE__ */ jsxs(Section, { id: "sources", k: "L", title: "Sources", lede: "Fully traceable bibliography. Only build-time-verified PMIDs are rendered as citations.", children: [
      studies.length ? /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-3", children: studies.map((s) => /* @__PURE__ */ jsx(StudyCard, { study: s }, s.pmid)) }) : /* @__PURE__ */ jsx(EmptyState, { title: CORPUS_ABSENCE }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsx("p", { className: "label mb-3", children: "Residue table (SSR equivalent of the structure)" }),
        /* @__PURE__ */ jsx(ResidueTable, { geometry })
      ] })
    ] }),
    /* @__PURE__ */ jsx(ProvenanceDrawer, { open: drawer !== null, onClose: () => setDrawer(null), title: drawerTitle(drawer), children: drawerBody(drawer, c, studies.length, groups.length) })
  ] });
}
function Section({
  id,
  k,
  title,
  lede,
  children
}) {
  return /* @__PURE__ */ jsx("section", { id, className: "wrap py-16 md:py-20 border-t hairline", "aria-label": title, children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-[220px_1fr] gap-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("p", { className: "label label-cyan", children: [
        "Section ",
        k
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "display-md text-2xl md:text-3xl mt-2", children: title }),
      lede && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm muted", children: lede })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "min-w-0", children })
  ] }) });
}
function Snap({
  title,
  children,
  onOpen,
  amber
}) {
  return /* @__PURE__ */ jsxs("button", { onClick: onOpen, className: `panel-flat p-4 text-left hover:border-cyan/40 transition ${amber ? "border-t-2 border-t-amber" : ""}`, children: [
    /* @__PURE__ */ jsx("p", { className: "label", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-[13px] text-bone/85 leading-snug", children }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 mono text-[10px] text-bone/40", children: "expand provenance →" })
  ] });
}
function IndependenceMap({
  groups,
  counts
}) {
  const n = groups.length;
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 360 240", className: "w-full panel-flat", role: "img", "aria-label": `Research independence map: ${n} distinct last-author groups`, children: [
    groups.map((g, i) => {
      const a = i / Math.max(1, n) * Math.PI * 2;
      const x = Math.round((180 + Math.cos(a) * 80) * 100) / 100, y = Math.round((120 + Math.sin(a) * 65) * 100) / 100;
      const r = 8 + counts[i] * 5;
      return /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx("line", { x1: 180, y1: 120, x2: x, y2: y, stroke: "#5FE3FF", strokeOpacity: 0.2 }),
        /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r, fill: "#5FE3FF", fillOpacity: 0.25, stroke: "#5FE3FF" }),
        /* @__PURE__ */ jsx("text", { x, y: y + r + 12, fontSize: 9, textAnchor: "middle", fill: "#F2EEE6", fillOpacity: 0.7, fontFamily: "JetBrains Mono Variable, monospace", children: g })
      ] }, g);
    }),
    /* @__PURE__ */ jsx("circle", { cx: 180, cy: 120, r: 5, fill: "#F2EEE6" }),
    /* @__PURE__ */ jsx("text", { x: 180, y: 232, fontSize: 9, textAnchor: "middle", fill: "#F2EEE6", fillOpacity: 0.45, fontFamily: "JetBrains Mono Variable, monospace", children: "node size = records per last-author group · edges to cross-citations: not assessed" })
  ] });
}
function drawerTitle(k) {
  return {
    research: "Research footprint",
    signal: "Human signal footprint",
    translation: "Translation state",
    change: "Latest meaningful change",
    regulatory: "Regulatory snapshot",
    share: "Share"
  }[k ?? ""] ?? "";
}
function drawerBody(k, c, n, groups) {
  switch (k) {
    case "research":
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("p", { children: [
          n,
          " PMIDs listed in studies.ts for ",
          displayName(c),
          " resolved against NCBI eutils at build time. Study type and species come from the record title / publication type; tags from the abstract."
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          groups,
          " distinct last-author surname(s) — a proxy, not an institution map."
        ] })
      ] });
    case "signal":
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("p", { children: [
          CORPUS.header,
          "."
        ] }),
        /* @__PURE__ */ jsx("p", { children: "No adapter is enabled. Nothing is counted, sampled or estimated. When an adapter is enabled, every statistic will carry its collection window and denominator." })
      ] });
    case "translation":
      return /* @__PURE__ */ jsx("p", { children: "Stages are lit from claims.ts → translation, which is populated only when a verified record with the matching species / model exists. Nothing is inferred from reviews." });
    case "change":
      return /* @__PURE__ */ jsx("p", { children: "Derived from claims.ts change history. The only event so far is claim creation, dated 2026-09-20. Nothing has been rewritten." });
    case "regulatory":
      return /* @__PURE__ */ jsx("p", { children: "No regulatory connector is enabled. The status page shows jurisdiction and date fields with an explicit empty state. An advisory vote is never shown as an approval." });
    case "share":
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Copy the canonical URL: ",
          /* @__PURE__ */ jsxs("span", { className: "mono", children: [
            "/compound/",
            c.slug
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { children: "Share cards and research-packet export are in production; they will carry no treatment recommendation." })
      ] });
    default:
      return null;
  }
}
export {
  Dossier as component
};
