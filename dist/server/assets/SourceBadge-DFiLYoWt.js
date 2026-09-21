import { jsxs, jsx } from "react/jsx-runtime";
import { O as pubmedUrl } from "./router-CxtrX1wR.js";
function SourceBadge({ pmid, verified, link = true }) {
  if (!pmid || !verified) return /* @__PURE__ */ jsx("span", { className: "chip chip-amber", children: "Source relationship unresolved" });
  const inner = /* @__PURE__ */ jsxs("span", { className: "mono", children: [
    "PMID ",
    pmid
  ] });
  if (!link) return /* @__PURE__ */ jsx("span", { className: "chip chip-cyan", children: inner });
  return /* @__PURE__ */ jsxs("a", { href: pubmedUrl(pmid), target: "_blank", rel: "noreferrer noopener", className: "chip chip-cyan hover:bg-cyan/10", children: [
    inner,
    /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "↗" })
  ] });
}
function provenanceText(c) {
  const pdb = c.pdbIds.length ? `Experimentally resolved (PDB ${c.pdbIds.join(", ")}) — deposited, not rendered here` : null;
  if (!c.sequence) return { primary: "Conceptual visualization", secondary: pdb ?? "Sequence pending verification", kind: "conceptual" };
  return { primary: "Sequence-derived visualization (procedural, not measured)", secondary: pdb, kind: c.pdbIds.length ? "pdb" : "sequence" };
}
function ProvenanceLabel({ compound, className = "" }) {
  const p = provenanceText(compound);
  return /* @__PURE__ */ jsxs("span", { className: `mono text-[11px] text-bone/65 ${className}`, children: [
    p.primary,
    p.secondary && /* @__PURE__ */ jsxs("span", { className: "text-bone/45", children: [
      " · ",
      p.secondary
    ] })
  ] });
}
export {
  ProvenanceLabel as P,
  SourceBadge as S,
  provenanceText as p
};
