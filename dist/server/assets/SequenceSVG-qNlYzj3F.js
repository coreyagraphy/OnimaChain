import { jsxs, jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { X as sizeRadius, i as CLASS_COLORS } from "./router-CxtrX1wR.js";
const HOTSPOT_RULES = {
  proline: {
    kind: "proline",
    title: "Proline kink",
    color: "#B9A2FF",
    marker: "hinge",
    explain: "Proline's ring closes onto its own backbone nitrogen, removing an H-bond donor. The helix bends 30–40° here."
  },
  glycine: {
    kind: "glycine",
    title: "Glycine",
    color: "#B9A2FF",
    marker: "dot",
    explain: "No side chain. The backbone is unusually flexible at this residue."
  },
  copper: {
    kind: "copper",
    title: "Copper site",
    color: "#E0863A",
    marker: "ion",
    explain: "Cu(II) coordinated by the backbone and side chains of the listed residues."
  },
  lactam: {
    kind: "lactam",
    title: "Lactam bridge",
    color: "#8A63FF",
    marker: "bridge",
    explain: "A side-chain-to-side-chain amide (Asp–Lys) closes the chain into a ring."
  },
  acyl: {
    kind: "acyl",
    title: "Acyl tether",
    color: "#B9B4AA",
    marker: "tether",
    explain: "A fatty-acid chain attached through a linker trails off the residue."
  },
  acetyl: {
    kind: "acetyl",
    title: "N-acetyl cap",
    color: "#DCE8EE",
    marker: "cap",
    explain: "The N-terminal amine is acetylated, removing its positive charge."
  },
  amide: {
    kind: "amide",
    title: "C-terminal amide",
    color: "#DCE8EE",
    marker: "cap",
    explain: "The C-terminal carboxyl is converted to an amide, removing its negative charge."
  },
  aib: {
    kind: "aib",
    title: "Aib",
    color: "#9C9691",
    marker: "twin",
    explain: "α-Aminoisobutyric acid carries two methyls on the α-carbon and strongly favours helical backbone angles."
  },
  "d-residue": {
    kind: "d-residue",
    title: "D-residue",
    color: "#5FE3FF",
    marker: "ring",
    explain: "Mirror-image stereocentre. Drawn with a ring badge."
  },
  nonstandard: {
    kind: "nonstandard",
    title: "Non-standard residue",
    color: "#9C9691",
    marker: "dot",
    explain: "A residue outside the twenty canonical amino acids."
  },
  gamma: {
    kind: "gamma",
    title: "γ-linkage",
    color: "#5FE3FF",
    marker: "dot",
    explain: "The peptide bond is formed through the side-chain carboxyl of glutamate rather than its α-carboxyl."
  }
};
function projectChain(geometry) {
  const ax = 22 * Math.PI / 180;
  const ay = 18 * Math.PI / 180;
  const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
  const [ccx, ccy, ccz] = geometry.bounds.center;
  const pts = [];
  for (let i = 0; i < geometry.length; i++) {
    let x = geometry.ca[i * 3 + 2] - ccz;
    let y = geometry.ca[i * 3 + 1] - ccy;
    let z = -(geometry.ca[i * 3] - ccx);
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    y = y1;
    z = z1;
    const x2 = x * cy + z * sy;
    const z2 = -x * sy + z * cy;
    x = x2;
    z = z2;
    pts.push([x, -y, z]);
  }
  const r = geometry.bounds.radius;
  return { pts, minX: -r, minY: -r, w: r * 2, h: r * 2 };
}
function projectPoint(geometry, p) {
  const q = projectChain({ ...geometry, ca: new Float32Array(p), length: 1 });
  return [q.pts[0][0], q.pts[0][1]];
}
function SequenceSVG({ geometry, tint = "#5FE3FF", className, progress = 1, label }) {
  const { pts, minX, minY, w, h } = useMemo(() => projectChain(geometry), [geometry]);
  const shown = Math.max(0, Math.min(geometry.length, Math.round(progress * geometry.length)));
  const order = pts.map((p, i) => i).sort((a, b) => pts[a][2] - pts[b][2]);
  const path = pts.slice(0, shown).map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
  const ph = geometry.placeholder;
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: `${minX} ${minY} ${w} ${h}`,
      className,
      role: "img",
      "aria-label": ph ? "Sequence pending verification" : `Static backbone diagram of ${geometry.slug}, ${geometry.length} residues`,
      preserveAspectRatio: "xMidYMid meet",
      children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("radialGradient", { id: `g-${geometry.slug}`, cx: "50%", cy: "50%", r: "60%", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: tint, stopOpacity: "0.18" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: tint, stopOpacity: "0" })
        ] }) }),
        /* @__PURE__ */ jsx("rect", { x: minX, y: minY, width: w, height: h, fill: `url(#g-${geometry.slug})` }),
        path && /* @__PURE__ */ jsx(
          "path",
          {
            d: path,
            fill: "none",
            stroke: tint,
            strokeWidth: ph ? 0.5 : 0.9,
            strokeOpacity: ph ? 0.35 : 0.85,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeDasharray: ph ? "1.2 1.6" : void 0
          }
        ),
        geometry.bridges.map((b) => /* @__PURE__ */ jsx(
          "path",
          {
            d: `M${pts[b.from][0]} ${pts[b.from][1]} Q${projectPoint(geometry, b.points[1]).join(" ")} ${pts[b.to][0]} ${pts[b.to][1]}`,
            fill: "none",
            stroke: "#8A63FF",
            strokeWidth: 0.6,
            strokeOpacity: 0.9
          },
          `b${b.from}`
        )),
        !ph && order.map((i) => {
          if (i >= shown) return null;
          const r = geometry.residues[i];
          const p = pts[i];
          const depth = (p[2] + geometry.bounds.radius) / (geometry.bounds.radius * 2);
          const rad = sizeRadius(r.size) * (0.7 + depth * 0.5);
          return /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("circle", { cx: p[0], cy: p[1], r: rad, fill: CLASS_COLORS[r.cls], fillOpacity: 0.55 + depth * 0.45 }),
            r.chirality === "D" && /* @__PURE__ */ jsx("circle", { cx: p[0], cy: p[1], r: rad + 0.7, fill: "none", stroke: "#5FE3FF", strokeWidth: 0.35 }),
            label && /* @__PURE__ */ jsx("text", { x: p[0], y: p[1] + 0.4, fontSize: 1.4, textAnchor: "middle", fill: "#0A0B0E", fontFamily: "Inter, sans-serif", children: r.code })
          ] }, i);
        }),
        geometry.metal && /* @__PURE__ */ jsxs("g", { children: [
          geometry.metal.residues.map((ri) => /* @__PURE__ */ jsx("line", { x1: pts[ri][0], y1: pts[ri][1], x2: projectPoint(geometry, geometry.metal.position)[0], y2: projectPoint(geometry, geometry.metal.position)[1], stroke: "#8A63FF", strokeWidth: 0.3, strokeOpacity: 0.8 }, ri)),
          /* @__PURE__ */ jsx("circle", { cx: projectPoint(geometry, geometry.metal.position)[0], cy: projectPoint(geometry, geometry.metal.position)[1], r: 1.4, fill: "#8A63FF" })
        ] }),
        ph && /* @__PURE__ */ jsx("text", { x: 0, y: geometry.bounds.radius * 0.9, fontSize: geometry.bounds.radius * 0.11, textAnchor: "middle", fill: "#5FE3FF", fillOpacity: 0.8, fontFamily: "Inter, sans-serif", letterSpacing: "0.15em", children: "SEQUENCE PENDING VERIFICATION" })
      ]
    }
  );
}
export {
  HOTSPOT_RULES as H,
  SequenceSVG as S
};
