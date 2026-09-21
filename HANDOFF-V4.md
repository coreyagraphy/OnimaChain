# CYRAVON — IMMERSIVE UNIVERSES PASS · 2026-09-20

This pass keeps the verified camera-flight hero and extends its dimensional visual language across the product. It does not change data, claims, provenance rules, or route behavior.

## Built

- Added route-aware visual universes in `src/routes/__root.tsx`: home, atlas, molecule, lineage, signal, compare, chronology, archive, and quiet routes now carry distinct but related palettes.
- Reworked shared panel surfaces in `src/styles/app.css` so cards inherit each universe's light, gain controlled neon edge glow, and retain readable graphite cores.
- Added data-colored neon treatments to compound cards, claim cards, the three evidence worlds, and the featured trace.
- Added slow chromatic atmosphere, orbital depth lines, and a spectral second line to the hero while preserving poster-first rendering.
- Added one traveling excitation pulse to every procedural chain in `ChainRenderer.tsx`. It follows the actual generated curve and provides selective glow rather than making every residue emissive.
- Increased compound-card material response on hover and strengthened the physical tilt without changing card content.
- Motion additions respect `prefers-reduced-motion`.

## Verification

- `npm run build` passed: 9/9 PMIDs verified, TypeScript passed, client and SSR bundles built.
- `npm run typecheck` passed after the final minimal diff was restored.
- `node tools/shots.mjs` completed for all flagship desktop and mobile views; frames were visually inspected for home, explore, dossier, claim, signal, timeline, and compare.
- `node tools/probe.mjs` passed with `failed: []`, including static and reduced-motion views.
- Brand-literal check passed: no literal brand string was added outside `src/brand.ts`.

## Changed source files

- `src/routes/__root.tsx`
- `src/routes/index.tsx`
- `src/components/Hero.tsx`
- `src/components/CompoundCard.tsx`
- `src/components/ClaimCard.tsx`
- `src/scenes/chain/ChainRenderer.tsx`
- `src/styles/app.css`

## Known unchanged warnings

- Vite still reports the existing mixed static/dynamic import warning for `src/scenes/rigs/index.tsx` and the existing large router chunk warning.
- The screenshot suite reported one unspecified desktop 404 during the multi-route run; the dedicated failed-request probe subsequently reported none. This matches the previously recorded intermittent non-home 404 and was not introduced by this pass.

## Netlify production

- Production URL: `https://cyravon.netlify.app`
- Netlify project: `https://app.netlify.com/projects/cyravon`
- TanStack Start SSR is deployed through `@netlify/vite-plugin-tanstack-start` with Node 22.
- Netlify's ESM runtime requires the GSAP distribution imports and a fully bundled SSR dependency graph; those compatibility settings live in `src/motion/*`, `src/types/gsap-dist.d.ts`, and `vite.config.ts`.
